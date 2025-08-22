import React, { useState, useEffect } from 'react';
import {
  useGetSubjectAssignmentsQuery,
  useCreateSubjectAssignmentMutation,
  useUpdateSubjectAssignmentMutation,
  useDeleteSubjectAssignmentMutation,
} from '../../redux/features/api/subject-assign/subjectAssignApi';
import { useGetSubjectsQuery } from '../../redux/features/api/class-subjects/subjectsApi';
import { useGetClassGroupConfigsQuery } from '../../redux/features/api/student/classGroupConfigsApi';

const SubjectAssign = () => {
  // RTK Query hooks for data fetching
  const { data: classes, isLoading: classesLoading, error: classesError } = useGetClassGroupConfigsQuery();
  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useGetSubjectsQuery();
  const { data: assignments, isLoading: assignmentsLoading, refetch: refetchAssignments, error: assignmentsError } = useGetSubjectAssignmentsQuery();

  // Debug logs
  console.log('API Data:', { classes, subjects, assignments });
  console.log('Assignments structure:', assignments);

  // RTK Query mutation hooks
  const [createAssignment, { isLoading: isCreating }] = useCreateSubjectAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateSubjectAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteSubjectAssignmentMutation();

  // Component state
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [existingAssignmentId, setExistingAssignmentId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
console.log("selectedSubjects", selectedSubjects)
  // Effect to load existing assignments when class is selected
  useEffect(() => {
    console.log('useEffect triggered:', { selectedClass, assignments });
    
    if (selectedClass && assignments) {
      const assignment = assignments.find(a => a.class_id === selectedClass);
      console.log('Found assignment for class:', assignment);
      
      if (assignment) {
        // Load existing subject assignments
        const assignedSubjectIds = assignment.subject_details?.map(sub => sub.id) || [];
        console.log('Assigned subject IDs:', assignedSubjectIds);
        setSelectedSubjects(assignedSubjectIds);
        setExistingAssignmentId(assignment.id);
      } else {
        // No existing assignment for this class
        console.log('No assignment found for this class');
        setSelectedSubjects([]);
        setExistingAssignmentId(null);
      }
    } else {
      // Clear selections when no class is selected
      setSelectedSubjects([]);
      setExistingAssignmentId(null);
    }
  }, [selectedClass, assignments]);

  // Handle class selection
  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    setMessage('');
  };

  // Handle subject toggle (select/deselect)
  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.includes(subjectId);
      if (isSelected) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // Show message to user
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
  };

  // Handle save/update assignment
  const handleSave = async () => {
    if (!selectedClass) {
      showMessage('Please select a class first.', 'error');
      return;
    }

    if (selectedSubjects.length === 0) {
      showMessage('Please select at least one subject.', 'error');
      return;
    }

    const payload = {
      class_id: selectedClass,
      subjects: selectedSubjects,
    };

    console.log('Sending payload:', payload);
    console.log('Existing assignment ID:', existingAssignmentId);

    try {
      let result;
      if (existingAssignmentId) {
        // Update existing assignment
        console.log('Updating assignment with ID:', existingAssignmentId);
        result = await updateAssignment({ id: existingAssignmentId, ...payload }).unwrap();
        showMessage('Assignment updated successfully!', 'success');
      } else {
        // Create new assignment
        console.log('Creating new assignment');
        result = await createAssignment(payload).unwrap();
        showMessage('Assignment created successfully!', 'success');
      }
      console.log('API Result:', result);
      refetchAssignments();
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error status:', error?.status);
      console.error('Error data:', error?.data);
      
      // Better error message extraction
      let errorMsg = 'Unknown error occurred';
      
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMsg = error.data;
        } else if (error.data.message) {
          errorMsg = error.data.message;
        } else if (error.data.detail) {
          errorMsg = error.data.detail;
        } else if (error.data.error) {
          errorMsg = error.data.error;
        } else if (error.data.non_field_errors) {
          errorMsg = error.data.non_field_errors.join(', ');
        } else if (Array.isArray(error.data)) {
          errorMsg = error.data.join(', ');
        } else {
          errorMsg = JSON.stringify(error.data);
        }
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.error) {
        errorMsg = error.error;
      }
      
      showMessage(`Failed to save assignment: ${errorMsg}`, 'error');
    }
  };

  // Handle delete assignment
  const handleDelete = async () => {
    if (!existingAssignmentId) {
      showMessage('No assignment found to delete for this class.', 'error');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) return;

    try {
      await deleteAssignment(existingAssignmentId).unwrap();
      setSelectedSubjects([]);
      setExistingAssignmentId(null);
      refetchAssignments();
      showMessage('Assignment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      const errorMsg = error?.data?.message || error?.error || 'Unknown error occurred';
      showMessage(`Failed to delete assignment: ${errorMsg}`, 'error');
    }
  };

  // Loading state
  if (classesLoading || subjectsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600 font-medium">
          Loading {classesLoading && subjectsLoading ? 'classes and subjects' : classesLoading ? 'classes' : 'subjects'}...
        </div>
      </div>
    );
  }

  // Error state
  if (classesError || subjectsError) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
        <div className="text-red-700">
          {classesError && <p>Classes: {classesError.message || 'Failed to load classes'}</p>}
          {subjectsError && <p>Subjects: {subjectsError.message || 'Failed to load subjects'}</p>}
        </div>
      </div>
    );
  }

  const getSelectedClassName = () => {
    if (!selectedClass) return '';
    const selectedClassData = classes?.find(c => c.id === selectedClass);
    return selectedClassData 
      ? `${selectedClassData.class_name} ${selectedClassData.group_name ? `(${selectedClassData.group_name})` : ''}`
      : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subject Assignment</h1>
          <p className="text-gray-600 mt-2">Assign subjects to classes</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Class Selection Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Class</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes?.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleClassSelect(cls.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  selectedClass === cls.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{cls.class_name}</div>
                {cls.group_name && <div className="text-sm text-gray-500 mt-1">Group: {cls.group_name}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Assignment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedClass ? `Assign Subjects to ${getSelectedClassName()}` : 'Select a Class First'}
            </h2>
            {existingAssignmentId && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Existing Assignment
              </span>
            )}
          </div>

          {/* Subject List */}
          <div className="space-y-3 mb-6">
            {subjects?.map(subject => (
              <label
                key={subject.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                  !selectedClass 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : selectedSubjects.includes(subject.id)
                      ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => handleSubjectToggle(subject.id)}
                  disabled={!selectedClass}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-4"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{subject.class_subject}</div>
                  {/* <div className="text-sm text-gray-500">Subject ID: {subject.id}</div> */}
                </div>
                {selectedSubjects.includes(subject.id) && (
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Selected
                    </span>
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={!selectedClass || (isCreating || isUpdating)}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                selectedClass && selectedSubjects.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${(isCreating || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {existingAssignmentId ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                existingAssignmentId ? 'Update Assignment' : 'Create Assignment'
              )}
            </button>

            {existingAssignmentId && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
                  isDeleting 
                    ? 'bg-red-400 cursor-not-allowed opacity-50' 
                    : 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200'
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete Assignment'
                )}
              </button>
            )}
          </div>

          {/* Selected Subjects Summary */}
          {selectedClass && selectedSubjects.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Selected Subjects ({selectedSubjects.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map(subjectId => {
                  const subject = subjects?.find(s => s.id === subjectId);
                  return (
                    <span key={subjectId} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {subject?.class_subject || `ID: ${subjectId}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectAssign;