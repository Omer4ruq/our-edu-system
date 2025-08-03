import React, { useState, useMemo } from 'react';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';


import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetCoachingPackagesQuery } from '../../redux/features/api/coaching/coachingPackagesApi';
import { useGetCoachingBatchesQuery } from '../../redux/features/api/coaching/coachingBatchesApi';
import { useCreateCoachingMutation, useGetCoachingsQuery } from '../../redux/features/api/coaching/coachingsApi';

const CoachingAllocation = () => {
  const [formData, setFormData] = useState({
    status: 'Active',
    student_id: '',
    academic_year: '',
    coaching_package: '',
    batch: ''
  });
  
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // API hooks
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: coachingPackages = [] } = useGetCoachingPackagesQuery();
  const { data: coachingBatches = [] } = useGetCoachingBatchesQuery();
  const { data: allocations = [], refetch } = useGetCoachingsQuery();
  
  // Student search hook - search by user_id or username
  const { 
    data: studentData, 
    isLoading: studentLoading, 
    error: studentError 
  } = useGetStudentActiveApiQuery(
    searchParams || undefined,
    { skip: !searchParams }
  );

  // Create allocation mutation
  const [createAllocation, { isLoading: isCreating }] = useCreateCoachingMutation();

  // Get allocated students to show statistics
  const allocationStats = useMemo(() => {
    const totalAllocations = allocations.length;
    const activeAllocations = allocations.filter(allocation => allocation.status === 'Active').length;
    const packageCounts = allocations.reduce((acc, allocation) => {
      const packageId = allocation.coaching_package;
      acc[packageId] = (acc[packageId] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: totalAllocations,
      active: activeAllocations,
      packageCounts
    };
  }, [allocations]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle student search
  const handleStudentSearch = (searchTerm) => {
    setStudentSearchTerm(searchTerm);
    
    if (searchTerm.trim()) {
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      
      if (isNumeric) {
        setSearchParams({ user_id: parseInt(searchTerm) });
      } else {
        setSearchParams({ username: searchTerm.trim() });
      }
    } else {
      setSearchParams(null);
      setSelectedStudent(null);
      setSearchResults([]);
    }
  };

  // Update search results when student data changes
  React.useEffect(() => {
    if (studentData) {
      const results = Array.isArray(studentData) ? studentData : [studentData];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [studentData]);

  // Select student
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      student_id: student.id
    }));
    setShowStudentSearch(false);
    setStudentSearchTerm(`${student.name} (${student.username})`);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.student_id || !formData.academic_year || !formData.coaching_package || !formData.batch) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const allocationData = {
        status: formData.status,
        student_id: parseInt(formData.student_id),
        academic_year: parseInt(formData.academic_year),
        coaching_package: parseInt(formData.coaching_package),
        batch: parseInt(formData.batch)
      };

      await createAllocation(allocationData).unwrap();
      
      // Reset form
      setFormData({
        status: 'Active',
        student_id: '',
        academic_year: '',
        coaching_package: '',
        batch: ''
      });
      setSelectedStudent(null);
      setStudentSearchTerm('');
      setSearchParams(null);
      setSearchResults([]);
      
      // Refresh allocations list
      refetch();
      
      alert('Coaching allocation created successfully!');
    } catch (error) {
      console.error('Error creating allocation:', error);
      alert('Error creating allocation. Please try again.');
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      status: 'Active',
      student_id: '',
      academic_year: '',
      coaching_package: '',
      batch: ''
    });
    setSelectedStudent(null);
    setStudentSearchTerm('');
    setSearchParams(null);
    setSearchResults([]);
    setShowStudentSearch(false);
  };

  // Get display names for selected options
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === parseInt(yearId));
    return year?.year || year?.name || year?.academic_year || yearId;
  };

  const getPackageName = (packageId) => {
    const pkg = coachingPackages.find(p => p.id === parseInt(packageId));
    return pkg?.package_name || packageId;
  };

  const getBatchName = (batchId) => {
    const batch = coachingBatches.find(b => b.id === parseInt(batchId));
    return batch?.name || batchId;
  };

  const getPackageAmount = (packageId) => {
    const pkg = coachingPackages.find(p => p.id === parseInt(packageId));
    return pkg?.amount || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coaching Allocation</h1>
          <p className="text-gray-600 mt-2">Allocate students to coaching packages and batches</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                📚
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Allocations</p>
                <p className="text-2xl font-bold text-gray-900">{allocationStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Allocations</p>
                <p className="text-2xl font-bold text-gray-900">{allocationStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                🎯
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Packages</p>
                <p className="text-2xl font-bold text-gray-900">{coachingPackages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">New Allocation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onFocus={() => setShowStudentSearch(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by User ID or Username..."
                />
                
                {/* Student Search Results */}
                {showStudentSearch && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              Username: {student.username} | User ID: {student.user_id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Class: {student.class_name} | Roll: {student.roll_no} | Phone: {student.phone_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showStudentSearch && searchParams && !studentLoading && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No student found with this search term
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {studentLoading && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {/* Selected student display */}
                {selectedStudent && (
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">
                            {selectedStudent.name}
                          </div>
                          <div className="text-sm text-blue-700">
                            Username: {selectedStudent.username} | User ID: {selectedStudent.user_id}
                          </div>
                          <div className="text-sm text-blue-700">
                            Class: {selectedStudent.class_name} | Section: {selectedStudent.section_name} | Roll: {selectedStudent.roll_no}
                          </div>
                          <div className="text-sm text-blue-700">
                            Phone: {selectedStudent.phone_number} | Gender: {selectedStudent.gender}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          setFormData(prev => ({ ...prev, student_id: '' }));
                          setStudentSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year || year.name || year.academic_year || year.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Coaching Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coaching Package *
              </label>
              <select
                name="coaching_package"
                value={formData.coaching_package}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Coaching Package</option>
                {coachingPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.package_name} - ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coaching Batch *
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Coaching Batch</option>
                {coachingBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  ➕ Create Allocation
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Allocation Summary */}
        {formData.student_id && formData.academic_year && formData.coaching_package && formData.batch && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Allocation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-blue-700">Student:</span>
                <div className="text-blue-900">
                  {selectedStudent?.name} ({selectedStudent?.username})
                </div>
                <div className="text-sm text-blue-700">
                  User ID: {selectedStudent?.user_id} | Class: {selectedStudent?.class_name}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Status:</span>
                <div className="text-blue-900">{formData.status}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Academic Year:</span>
                <div className="text-blue-900">{getAcademicYearName(formData.academic_year)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Package:</span>
                <div className="text-blue-900">
                  {getPackageName(formData.coaching_package)}
                  <span className="text-sm text-blue-600 ml-2">
                    (${Number(getPackageAmount(formData.coaching_package)).toLocaleString()})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Batch:</span>
                <div className="text-blue-900">{getBatchName(formData.batch)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Allocations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Allocations</h3>
          
          {allocations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-xl mb-2">📚</div>
              <p className="text-gray-500">No allocations found. Create your first allocation above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocations.slice(0, 10).map((allocation) => (
                    <tr key={allocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-xs">
                              {allocation.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.student?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {allocation.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          allocation.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : allocation.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {allocation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPackageName(allocation.coaching_package)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getBatchName(allocation.batch)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getAcademicYearName(allocation.academic_year)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Display */}
        {studentError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-semibold">❌ Student Search Error</h4>
            <p className="text-red-600">{studentError?.data?.message || 'Failed to search student'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingAllocation;