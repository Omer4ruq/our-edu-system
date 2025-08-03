import React, { useState, useMemo } from 'react';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetHostelPackagesQuery } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetHostelRoomsQuery } from '../../redux/features/api/hostel/hostelRoomsApi';
import { useGetHostelNamesQuery } from '../../redux/features/api/hostel/hostelNames';
import { useCreateHostelMutation, useGetHostelsQuery } from '../../redux/features/api/hostel/hostelsApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import AllocatedStudentsTable from './AllocatedStudentsTable';

const HostelAllocation = () => {
  const [formData, setFormData] = useState({
    status: 'Active',
    student_id: '',
    academic_year: '',
    hostel_package_id: '',
    room_id: ''
  });
  
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showRoomSidebar, setShowRoomSidebar] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // API hooks
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: hostelPackages = [] } = useGetHostelPackagesQuery();
  const { data: hostelRooms = [] } = useGetHostelRoomsQuery();
  const { data: hostelNames = [] } = useGetHostelNamesQuery();
  const { data: allocations = [], refetch } = useGetHostelsQuery();
  
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
  const [createAllocation, { isLoading: isCreating }] = useCreateHostelMutation();

  // Get allocated room IDs to filter them out
  const allocatedRoomIds = useMemo(() => {
    return new Set(allocations.map(allocation => allocation.room_id).filter(Boolean));
  }, [allocations]);

  // Get available rooms for selected hostel
  const availableRooms = useMemo(() => {
    if (!selectedHostel) return [];
    
    const selectedHostelRooms = hostelRooms.filter(room => 
      room.hostel_name_id === selectedHostel.id && !allocatedRoomIds.has(room.id)
    );
    
    return selectedHostelRooms;
  }, [selectedHostel, hostelRooms, allocatedRoomIds]);

  // Remove the availableSeats memo since we're not using seat selection anymore

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle hostel selection
  const handleHostelSelect = (hostelId) => {
    const hostel = hostelNames.find(h => h.id === parseInt(hostelId));
    setSelectedHostel(hostel);
    setSelectedRoom(null);
    setFormData(prev => ({
      ...prev,
      hostel_name_id: hostelId,
      room_id: ''
    }));
    
    if (hostel) {
      setShowRoomSidebar(true);
    }
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setFormData(prev => ({
      ...prev,
      room_id: room.id
    }));
    setShowRoomSidebar(false);
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
    if (!formData.student_id || !formData.academic_year || !formData.hostel_package_id || !formData.room_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const allocationData = {
        student_id: parseInt(formData.student_id),
        academic_year: parseInt(formData.academic_year),
        status: formData.status,
        hostel_package_id: parseInt(formData.hostel_package_id),
        room_id: parseInt(formData.room_id)
      };

      await createAllocation(allocationData).unwrap();
      
      // Reset form
      setFormData({
        status: 'Active',
        student_id: '',
        academic_year: '',
        hostel_package_id: '',
        room_id: ''
      });
      setSelectedStudent(null);
      setStudentSearchTerm('');
      setSearchParams(null);
      setSearchResults([]);
      setSelectedHostel(null);
      setSelectedRoom(null);
      setShowRoomSidebar(false);
      
      // Refresh allocations list
      refetch();
      
      alert('Hostel allocation created successfully!');
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
      hostel_package_id: '',
      room_id: ''
    });
    setSelectedStudent(null);
    setStudentSearchTerm('');
    setSearchParams(null);
    setSearchResults([]);
    setShowStudentSearch(false);
    setSelectedHostel(null);
    setSelectedRoom(null);
    setShowRoomSidebar(false);
  };

  // Get display names for selected options
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === parseInt(yearId));
    return year?.year || year?.name || year?.academic_year || yearId;
  };

  const getPackageName = (packageId) => {
    const pkg = hostelPackages.find(p => p.id === parseInt(packageId));
    return pkg?.package_name || packageId;
  };

  const getRoomDetails = (roomId) => {
    const room = hostelRooms.find(r => r.id === parseInt(roomId));
    return room || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hostel Allocation</h1>
          <p className="text-gray-600 mt-2">Allocate students to hostel rooms and packages</p>
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

            {/* Hostel Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostel Package *
              </label>
              <select
                name="hostel_package_id"
                value={formData.hostel_package_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Hostel Package</option>
                {hostelPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.package_name} - ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                  </option>
                ))}
              </select>
            </div>

            {/* Hostel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostel Name *
              </label>
              <select
                name="hostel_name_id"
                value={formData.hostel_name_id}
                onChange={(e) => handleHostelSelect(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Hostel</option>
                {hostelNames.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selection Display */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Selection *
              </label>
              
              {formData.room_id && selectedRoom ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900">
                        Selected: {selectedRoom.room_name} - Seat {selectedRoom.seat_no}
                      </div>
                      <div className="text-sm text-green-700">
                        Hostel: {selectedHostel?.name}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, room_id: '' }));
                        setSelectedRoom(null);
                        if (selectedHostel) setShowRoomSidebar(true);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : selectedHostel ? (
                <button
                  onClick={() => setShowRoomSidebar(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Click to select room for {selectedHostel.name}
                </button>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-500">
                  Please select a hostel first
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
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
        {formData.student_id && formData.academic_year && formData.hostel_package_id && formData.room_id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Allocation Summary</h3>
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
                <div className="text-blue-900">{getPackageName(formData.hostel_package_id)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Hostel:</span>
                <div className="text-blue-900">{selectedHostel?.name}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Room & Seat:</span>
                <div className="text-blue-900">
                  {selectedRoom ? `${selectedRoom.room_name} - Seat ${selectedRoom.seat_no}` : 'Not selected'}
                </div>
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
      </div>

      {/* Room Selection Sidebar */}
      {showRoomSidebar && selectedHostel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-hidden z-50">
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="px-4 py-6 bg-blue-600 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">
                      Select Room
                    </h2>
                    <button
                      onClick={() => setShowRoomSidebar(false)}
                      className="text-blue-200 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-blue-200">
                    {selectedHostel.name}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Rooms</h3>
                  
                  {availableRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-xl mb-2">🏠</div>
                      <p className="text-gray-500">No rooms available in this hostel</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableRooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomSelect(room)}
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                {room.room_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Seat: {room.seat_no}
                              </div>
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <AllocatedStudentsTable />
      </div>
    </div>
  );
};

export default HostelAllocation;
                        