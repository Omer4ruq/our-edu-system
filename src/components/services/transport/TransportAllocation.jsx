import React, { useState } from 'react';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetTransportPackagesQuery } from '../../../redux/features/api/transport/transportPackagesApi';
import { useGetTransportRoutesQuery } from '../../../redux/features/api/transport/transportRoutesApi';
import { useCreateTransportMutation, useGetTransportsQuery } from '../../../redux/features/api/transport/transportsApi';
import { useGetStudentActiveApiQuery } from '../../../redux/features/api/student/studentActiveApi';

const TransportAllocation = () => {
  const [formData, setFormData] = useState({
    status: 'Active',
    student_id: '',
    academic_year: '',
    transport_package: '',
    route: ''
  });
  
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // API hooks
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: transportPackages = [] } = useGetTransportPackagesQuery();
  const { data: transportRoutes = [] } = useGetTransportRoutesQuery();
  const { data: allocations = [], refetch } = useGetTransportsQuery();
  
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
  const [createAllocation, { isLoading: isCreating }] = useCreateTransportMutation();

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
    if (!formData.student_id || !formData.academic_year || !formData.transport_package || !formData.route) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const allocationData = {
        status: formData.status,
        student_id: parseInt(formData.student_id),
        academic_year: parseInt(formData.academic_year),
        transport_package: parseInt(formData.transport_package),
        route: parseInt(formData.route)
      };

      await createAllocation(allocationData).unwrap();
      
      // Reset form
      setFormData({
        status: 'Active',
        student_id: '',
        academic_year: '',
        transport_package: '',
        route: ''
      });
      setSelectedStudent(null);
      setStudentSearchTerm('');
      setSearchParams(null);
      setSearchResults([]);
      
      // Refresh allocations list
      refetch();
      
      alert('Transport allocation created successfully!');
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
      transport_package: '',
      route: ''
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
    const pkg = transportPackages.find(p => p.id === parseInt(packageId));
    return pkg?.package_name || packageId;
  };

  const getRouteName = (routeId) => {
    const route = transportRoutes.find(r => r.id === parseInt(routeId));
    return route ? `${route.name} (${route.start_point} → ${route.end_point})` : routeId;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transport Allocation</h1>
          <p className="text-gray-600 mt-2">Allocate students to transport routes and packages</p>
        </div>

        {/* Allocation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">New Transport Allocation</h2>
          
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  </div>
                )}

                {/* Selected student display */}
                {selectedStudent && (
                  <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-green-900">
                            {selectedStudent.name}
                          </div>
                          <div className="text-sm text-green-700">
                            Username: {selectedStudent.username} | User ID: {selectedStudent.user_id}
                          </div>
                          <div className="text-sm text-green-700">
                            Class: {selectedStudent.class_name} | Section: {selectedStudent.section_name} | Roll: {selectedStudent.roll_no}
                          </div>
                          <div className="text-sm text-green-700">
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
                        className="text-green-600 hover:text-green-800 ml-2"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year || year.name || year.academic_year || year.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Transport Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Package *
              </label>
              <select
                name="transport_package"
                value={formData.transport_package}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Transport Package</option>
                {transportPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.package_name} - ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                  </option>
                ))}
              </select>
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Route *
              </label>
              <select
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Route</option>
                {transportRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} - {route.start_point} → {route.end_point}
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
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Allocation'}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Allocation Summary */}
        {formData.student_id && formData.academic_year && formData.transport_package && formData.route && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Allocation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-green-700">Student:</span>
                <div className="text-green-900">
                  {selectedStudent?.name} ({selectedStudent?.username})
                </div>
                <div className="text-sm text-green-700">
                  User ID: {selectedStudent?.user_id} | Class: {selectedStudent?.class_name}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">Status:</span>
                <div className="text-green-900">{formData.status}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">Academic Year:</span>
                <div className="text-green-900">{getAcademicYearName(formData.academic_year)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-700">Transport Package:</span>
                <div className="text-green-900">{getPackageName(formData.transport_package)}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-green-700">Route:</span>
                <div className="text-green-900">{getRouteName(formData.route)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {studentError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-semibold">Student Search Error</h4>
            <p className="text-red-600">{studentError?.data?.message || 'Failed to search student'}</p>
          </div>
        )}

        {/* Recent Allocations Summary */}
        {allocations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Allocation Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-800 font-semibold">Total Allocations</div>
                <div className="text-2xl font-bold text-green-900">{allocations.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-800 font-semibold">Active</div>
                <div className="text-2xl font-bold text-blue-900">
                  {allocations.filter(a => a.status === 'Active').length}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-800 font-semibold">Pending</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {allocations.filter(a => a.status === 'Pending').length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-800 font-semibold">Inactive</div>
                <div className="text-2xl font-bold text-red-900">
                  {allocations.filter(a => a.status === 'Inactive').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportAllocation;