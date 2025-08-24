import React, { useState } from 'react';

import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetExamApiQuery } from '../../../redux/features/api/exam/examApi';

import { useGetSetExamSchedulesQuery,
    useGetSetExamScheduleByIdQuery,
  useCreateSetExamScheduleMutation,
  useUpdateSetExamScheduleMutation,
  usePatchSetExamScheduleMutation,
  useDeleteSetExamScheduleMutation,
 } from '../../../redux/features/api/exam/setExamSchedulesApi';


const SetExamSchedules = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editExam, setEditExam] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');

  // API hooks for data fetching
  const { data: examTypes, isLoading: examTypesLoading } = useGetExamApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: examSchedules, isLoading: schedulesLoading, error: schedulesError } = useGetSetExamSchedulesQuery();
  console.log(academicYears)
  console.log(useGetSetExamSchedulesQuery)
  
  // API hooks for mutations
  const [createExamSchedule, { isLoading: isCreating }] = useCreateSetExamScheduleMutation();
  const [updateExamSchedule, { isLoading: isUpdating }] = useUpdateSetExamScheduleMutation();
  const [deleteExamSchedule, { isLoading: isDeleting }] = useDeleteSetExamScheduleMutation();

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedExam || !selectedAcademicYear) {
      alert('Please select both exam type and academic year');
      return;
    }

    try {
      await createExamSchedule({
        exam_name: selectedExam,
        academic_year: selectedAcademicYear,
      }).unwrap();
      
      // Clear selections after successful creation
      setSelectedExam('');
      setSelectedAcademicYear('');
    } catch (err) {
      console.error('Failed to create exam schedule:', err);
      alert('Failed to create exam schedule. Please try again.');
    }
  };

  // Handle edit - Fixed to use correct property names
  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditExam(schedule.exam_name); // Use exam_name (the ID)
    setEditAcademicYear(schedule.academic_year); // Use academic_year (the ID)
  };

  // Handle update
  const handleUpdate = async (id) => {
    if (!editExam || !editAcademicYear) {
      alert('Please select both exam type and academic year');
      return;
    }

    try {
      await updateExamSchedule({
        id,
        exam_name: editExam,
        academic_year: editAcademicYear,
      }).unwrap();
      
      setEditingId(null);
      setEditExam('');
      setEditAcademicYear('');
    } catch (err) {
      console.error('Failed to update exam schedule:', err);
      alert('Failed to update exam schedule. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam schedule?')) {
      try {
        await deleteExamSchedule(id).unwrap();
      } catch (err) {
        console.error('Failed to delete exam schedule. Please try again.');
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditExam('');
    setEditAcademicYear('');
  };

  // Get exam name by id - for the edit dropdown
  const getExamNameById = (examId) => {
    const exam = examTypes?.find(exam => exam.id === examId);
    return exam ? exam.exam_name : 'Unknown';
  };

  // Get academic year name by id - for the edit dropdown  
  const getAcademicYearById = (yearId) => {
    const year = academicYears?.find(year => year.id === yearId);
    return year ? year.name : 'Unknown';
  };

  if (examTypesLoading || academicYearsLoading || schedulesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const hasExamSchedules = examSchedules && Array.isArray(examSchedules) && examSchedules.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Set Exam Schedules</h2>
      
      {/* Add New Exam Schedule Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Exam Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exam Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam Type
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            >
              <option value="">Choose exam type...</option>
              {examTypes?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            >
              <option value="">Choose academic year...</option>
              {academicYears?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={isCreating || !selectedExam || !selectedAcademicYear}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Adding...' : 'Add Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Exam Schedules Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Exam Schedules List</h3>
        </div>
        
        {!hasExamSchedules ? (
          <div className="p-6 text-center text-gray-500">
            No exam schedules found. Add one above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === schedule.id ? (
                        <select
                          value={editExam}
                          onChange={(e) => setEditExam(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose exam type...</option>
                          {examTypes?.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.exam_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {schedule.exam_name_display}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === schedule.id ? (
                        <select
                          value={editAcademicYear}
                          onChange={(e) => setEditAcademicYear(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose academic year...</option>
                          {academicYears?.map((year) => (
                            <option key={year.id} value={year.id}>
                              {year.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {schedule.academic_year_display}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === schedule.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(schedule.id)}
                            disabled={isUpdating || !editExam || !editAcademicYear}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isDeleting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetExamSchedules;