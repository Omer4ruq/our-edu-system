import React, { useState, useMemo, useEffect } from 'react';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetHostelPackagesQuery } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetHostelRoomsQuery } from '../../redux/features/api/hostel/hostelRoomsApi';
import { useGetHostelNamesQuery } from '../../redux/features/api/hostel/hostelNames';
import { useCreateHostelMutation, useGetHostelsQuery } from '../../redux/features/api/hostel/hostelsApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import AllocatedStudentsTable from './AllocatedStudentsTable';
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList, FaUser, FaSearch, FaBed, FaHome } from "react-icons/fa";
import { IoAddCircle, IoClose } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";
import Select from 'react-select';
import selectStyles from '../../utilitis/selectStyles';

const HostelAllocation = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    status: 'Active',
    student_id: '',
    academic_year: '',
    hostel_package_id: '',
    hostel_name_id: '',
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_hostelallocation') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_hostelallocation') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_hostelallocation') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_hostelallocation') || false;

  // API hooks
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: hostelPackages = [] } = useGetHostelPackagesQuery();
  const { data: hostelRooms = [] } = useGetHostelRoomsQuery();
  const { data: hostelNames = [] } = useGetHostelNamesQuery();
  const { data: allocations = [], refetch } = useGetHostelsQuery();
  
  // Student search hook
  const { 
    data: studentData, 
    isLoading: studentLoading, 
    error: studentError 
  } = useGetStudentActiveApiQuery(
    searchParams || undefined,
    { skip: !searchParams }
  );

  // Create allocation mutation
  const [createAllocation, { isLoading: isCreating, error: createError }] = useCreateHostelMutation();

  // Convert number to Bangla if needed
  const formatNumber = (num) => {
    if (!num) return num;
    if (languageCode === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().split('').map(digit => bnDigits[parseInt(digit)] || digit).join('');
    }
    return num;
  };

  // React Select options
  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.academic_year || year.id
  }));

  const hostelPackageOptions = hostelPackages.map(pkg => ({
    value: pkg.id,
    label: `${pkg.package_name} - $${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}`
  }));

  const hostelNameOptions = hostelNames.map(hostel => ({
    value: hostel.id,
    label: hostel.name
  }));



  // Get allocated room IDs
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle hostel selection
  const handleHostelSelect = (selectedOption) => {
    const hostel = hostelNames.find(h => h.id === selectedOption?.value);
    setSelectedHostel(hostel);
    setSelectedRoom(null);
    setFormData(prev => ({
      ...prev,
      hostel_name_id: selectedOption?.value || '',
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
  useEffect(() => {
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    if (!formData.student_id || !formData.academic_year || !formData.hostel_package_id || !formData.room_id) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন" : "Please fill in all required fields");
      return;
    }

    setModalAction("create");
    setModalData({
      student_id: parseInt(formData.student_id),
      academic_year: parseInt(formData.academic_year),
      status: formData.status,
      hostel_package_id: parseInt(formData.hostel_package_id),
      room_id: parseInt(formData.room_id)
    });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        if (!hasAddPermission) { 
          toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.'); 
          return; 
        }
        await createAllocation(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "হোস্টেল বরাদ্দ সফলভাবে তৈরি করা হয়েছে!" : "Hostel allocation created successfully!");
        
        // Reset form
        setFormData({
          status: 'Active',
          student_id: '',
          academic_year: '',
          hostel_package_id: '',
          hostel_name_id: '',
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
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'হোস্টেল বরাদ্দ' : 'Hostel allocation'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Get modal content
  const getModalContent = () => {
    return {
      title: languageCode === 'bn' ? "নতুন হোস্টেল বরাদ্দ নিশ্চিত করুন" : "Confirm New Hostel Allocation",
      message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন হোস্টেল বরাদ্দ তৈরি করতে চান?" : "Are you sure you want to create a new hostel allocation?"
    };
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      status: 'Active',
      student_id: '',
      academic_year: '',
      hostel_package_id: '',
      hostel_name_id: '',
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

  // Handle click outside to close search dropdown
  const handleClickOutside = (e) => {
    if (!e.target.closest('.student-search-container')) {
      setShowStudentSearch(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Permission-based Rendering
  // if (permissionsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
  //         <div className="text-white">
  //           {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!hasViewPermission) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <div className="text-red-400 text-xl font-semibold">
  //           {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="py-8 w-full mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="mx-auto">
        {/* Page Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaHome className="text-pmColor text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {languageCode === 'bn' ? 'হোস্টেল বরাদ্দ ব্যবস্থাপনা' : 'Hostel Allocation Management'}
              </h1>
              <p className="text-white/70 mt-1">
                {languageCode === 'bn' ? 'শিক্ষার্থীদের হোস্টেল রুম এবং প্যাকেজ বরাদ্দ করুন' : 'Allocate students to hostel rooms and packages'}
              </p>
            </div>
          </div>
        </div>

        {/* Allocation Form */}
        {/* {hasAddPermission && ( */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-pmColor/20 rounded-xl">
                <IoAddCircle className="text-pmColor text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {languageCode === 'bn' ? "নতুন বরাদ্দ যোগ করুন" : "New Allocation"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Search */}
              <div className="student-search-container">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <FaUser className="inline mr-2" />
                  {languageCode === 'bn' ? "শিক্ষার্থী *" : "Student *"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    onFocus={() => setShowStudentSearch(true)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                    placeholder={languageCode === 'bn' ? "ইউজার আইডি বা ইউজারনেম দিয়ে খুঁজুন..." : "Search by User ID or Username..."}
                  />
                  <FaSearch className="absolute left-4 top-[24px] transform -translate-y-1/2 text-white/60" />
                  
                  {/* Loading state */}
                  {studentLoading && (
                    <div className="absolute right-3 top-3">
                      <FaSpinner className="animate-spin text-pmColor" />
                    </div>
                  )}

                  {/* Student Search Results */}
                  {showStudentSearch && searchResults.length > 0 && !selectedStudent && (
                    <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center border border-pmColor/30">
                                <span className="text-pmColor font-medium text-sm">
                                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-white">{student.name}</div>
                              <div className="text-sm text-white/70">
                                {languageCode === 'bn' ? 'ইউজারনেম:' : 'Username:'} {student.username} | {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {formatNumber(student.user_id)}
                              </div>
                              <div className="text-sm text-white/70">
                                {languageCode === 'bn' ? 'ক্লাস:' : 'Class:'} {student.class_name} | {languageCode === 'bn' ? 'রোল:' : 'Roll:'} {formatNumber(student.roll_no)} | {languageCode === 'bn' ? 'ফোন:' : 'Phone:'} {student.phone_number}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showStudentSearch && searchParams && !studentLoading && searchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
                      <div className="px-4 py-3 text-white/70 text-center">
                        {languageCode === 'bn' ? 'এই অনুসন্ধান টার্ম দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No student found with this search term'}
                      </div>
                    </div>
                  )}

                  {/* Selected student display */}
                  {selectedStudent && (
                    <div className="mt-2 p-4 bg-pmColor/10 border border-pmColor/30 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-pmColor/20 flex items-center justify-center border border-pmColor/30">
                            <span className="text-pmColor font-medium">
                              {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {selectedStudent.name}
                            </div>
                            <div className="text-sm text-white/70">
                              {languageCode === 'bn' ? 'ইউজারনেম:' : 'Username:'} {selectedStudent.username} | {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {formatNumber(selectedStudent.user_id)}
                            </div>
                            <div className="text-sm text-white/70">
                              {languageCode === 'bn' ? 'ক্লাস:' : 'Class:'} {selectedStudent.class_name} | {languageCode === 'bn' ? 'সেকশন:' : 'Section:'} {selectedStudent.section_name} | {languageCode === 'bn' ? 'রোল:' : 'Roll:'} {formatNumber(selectedStudent.roll_no)}
                            </div>
                            <div className="text-sm text-white/70">
                              {languageCode === 'bn' ? 'ফোন:' : 'Phone:'} {selectedStudent.phone_number} | {languageCode === 'bn' ? 'লিঙ্গ:' : 'Gender:'} {selectedStudent.gender}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
                            setFormData(prev => ({ ...prev, student_id: '' }));
                            setStudentSearchTerm('');
                            setSearchResults([]);
                          }}
                          className="text-pmColor hover:text-white ml-2 p-1 rounded transition-colors duration-200"
                        >
                          <IoClose className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {languageCode === 'bn' ? "অবস্থা *" : "Status *"}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                  >
                    <option value="Active" className="bg-gray-800">
                      {languageCode === 'bn' ? 'সক্রিয়' : 'Active'}
                    </option>
                    <option value="Inactive" className="bg-gray-800">
                      {languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}
                    </option>
                    <option value="Pending" className="bg-gray-800">
                      {languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
                    </option>
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {languageCode === 'bn' ? "শিক্ষাবর্ষ *" : "Academic Year *"}
                  </label>
                  <Select
                    options={academicYearOptions}
                    value={academicYearOptions.find(option => option.value.toString() === formData.academic_year)}
                    onChange={(selectedOption) => setFormData(prev => ({ ...prev, academic_year: selectedOption?.value || '' }))}
                      styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                    placeholder={languageCode === 'bn' ? "শিক্ষাবর্ষ নির্বাচন করুন" : "Select Academic Year"}
                    isClearable
                  />
                </div>

                {/* Hostel Package */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {languageCode === 'bn' ? "হোস্টেল প্যাকেজ *" : "Hostel Package *"}
                  </label>
                  <Select
                    options={hostelPackageOptions}
                    value={hostelPackageOptions.find(option => option.value.toString() === formData.hostel_package_id)}
                    onChange={(selectedOption) => setFormData(prev => ({ ...prev, hostel_package_id: selectedOption?.value || '' }))}
                      styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                    placeholder={languageCode === 'bn' ? "হোস্টেল প্যাকেজ নির্বাচন করুন" : "Select Hostel Package"}
                    isClearable
                  />
                </div>

                {/* Hostel Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {languageCode === 'bn' ? "হোস্টেলের নাম *" : "Hostel Name *"}
                  </label>
                  <Select
                    options={hostelNameOptions}
                    value={hostelNameOptions.find(option => option.value.toString() === formData.hostel_name_id)}
                    onChange={handleHostelSelect}
                      styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                    placeholder={languageCode === 'bn' ? "হোস্টেল নির্বাচন করুন" : "Select Hostel"}
                    isClearable
                  />
                </div>
              </div>

              {/* Room Selection Display */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <FaBed className="inline mr-2" />
                  {languageCode === 'bn' ? "রুম নির্বাচন *" : "Room Selection *"}
                </label>
                
                {formData.room_id && selectedRoom ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-400">
                          {languageCode === 'bn' ? 'নির্বাচিত:' : 'Selected:'} {selectedRoom.room_name} - {languageCode === 'bn' ? 'সিট' : 'Seat'} {selectedRoom.seat_no}
                        </div>
                        <div className="text-sm text-green-300">
                          {languageCode === 'bn' ? 'হোস্টেল:' : 'Hostel:'} {selectedHostel?.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, room_id: '' }));
                          setSelectedRoom(null);
                          if (selectedHostel) setShowRoomSidebar(true);
                        }}
                        className="text-green-400 hover:text-white px-3 py-1 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-all duration-300"
                      >
                        {languageCode === 'bn' ? 'পরিবর্তন' : 'Change'}
                      </button>
                    </div>
                  </div>
                ) : selectedHostel ? (
                  <button
                    type="button"
                    onClick={() => setShowRoomSidebar(true)}
                    className="w-full p-4 border-2 border-dashed border-white/30 rounded-xl text-white/60 hover:border-pmColor hover:text-pmColor transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaBed />
                    <span>{languageCode === 'bn' ? `${selectedHostel.name} এর জন্য রুম নির্বাচন করতে ক্লিক করুন` : `Click to select room for ${selectedHostel.name}`}</span>
                  </button>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/20 rounded-xl text-white/60 flex items-center justify-center space-x-2">
                    <FaBed />
                    <span>{languageCode === 'bn' ? 'প্রথমে একটি হোস্টেল নির্বাচন করুন' : 'Please select a hostel first'}</span>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isCreating ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>{languageCode === 'bn' ? "বরাদ্দ তৈরি করুন" : "Create Allocation"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  {languageCode === 'bn' ? 'রিসেট' : 'Reset'}
                </button>
              </div>
            </form>
            
            {createError && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
                <div className="text-red-400">
                  {languageCode === 'bn' ? 'ত্রুটি:' : 'Error:'} {createError.status || "unknown"} - {JSON.stringify(createError.data || {})}
                </div>
              </div>
            )}
          </div>
        {/* )} */}

        {/* Allocation Summary */}
        {formData.student_id && formData.academic_year && formData.hostel_package_id && formData.room_id && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8 animate-fadeIn">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center space-x-2">
              <FaList />
              <span>{languageCode === 'bn' ? 'বরাদ্দের সারসংক্ষেপ' : 'Allocation Summary'}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'শিক্ষার্থী:' : 'Student:'}
                </span>
                <div className="text-blue-100">
                  {selectedStudent?.name} ({selectedStudent?.username})
                </div>
                <div className="text-sm text-blue-200">
                  {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {formatNumber(selectedStudent?.user_id)} | {languageCode === 'bn' ? 'ক্লাস:' : 'Class:'} {selectedStudent?.class_name}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'অবস্থা:' : 'Status:'}
                </span>
                <div className="text-blue-100">
                  {formData.status === 'Active' && languageCode === 'bn' ? 'সক্রিয়' : 
                   formData.status === 'Inactive' && languageCode === 'bn' ? 'নিষ্ক্রিয়' :
                   formData.status === 'Pending' && languageCode === 'bn' ? 'অপেক্ষমাণ' : formData.status}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'শিক্ষাবর্ষ:' : 'Academic Year:'}
                </span>
                <div className="text-blue-100">{getAcademicYearName(formData.academic_year)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'প্যাকেজ:' : 'Package:'}
                </span>
                <div className="text-blue-100">{getPackageName(formData.hostel_package_id)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'হোস্টেল:' : 'Hostel:'}
                </span>
                <div className="text-blue-100">{selectedHostel?.name}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-300">
                  {languageCode === 'bn' ? 'রুম ও সিট:' : 'Room & Seat:'}
                </span>
                <div className="text-blue-100">
                  {selectedRoom ? `${selectedRoom.room_name} - ${languageCode === 'bn' ? 'সিট' : 'Seat'} ${selectedRoom.seat_no}` : (languageCode === 'bn' ? 'নির্বাচিত নয়' : 'Not selected')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {studentError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 animate-fadeIn">
            <h4 className="text-red-400 font-semibold">
              {languageCode === 'bn' ? 'শিক্ষার্থী অনুসন্ধান ত্রুটি' : 'Student Search Error'}
            </h4>
            <p className="text-red-300">{studentError?.data?.message || 'Failed to search student'}</p>
          </div>
        )}

        {/* Room Selection Sidebar */}
        {showRoomSidebar && selectedHostel && (
          <div className="fixed top-14 inset-0 bg-black/50 backdrop-blur-sm overflow-hidden z-[9999]">
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex z-50">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white/10 backdrop-blur-md border-l border-white/20 shadow-xl">
                  <div className="px-4 py-6 bg-pmColor/20 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-white flex items-center space-x-2">
                        <FaBed />
                        <span>{languageCode === 'bn' ? 'রুম নির্বাচন করুন' : 'Select Room'}</span>
                      </h2>
                      <button
                        onClick={() => setShowRoomSidebar(false)}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <IoClose className="w-6 h-6" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      {selectedHostel.name}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-lg font-medium text-white mb-4">
                      {languageCode === 'bn' ? 'উপলব্ধ রুম' : 'Available Rooms'} ({formatNumber(availableRooms.length)})
                    </h3>
                    
                    {availableRooms.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-white/40 text-6xl mb-4">🏠</div>
                        <p className="text-white/70">
                          {languageCode === 'bn' ? 'এই হোস্টেলে কোনো রুম উপলব্ধ নেই' : 'No rooms available in this hostel'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableRooms.map((room, index) => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className="p-4 bg-white/5 border border-white/20 rounded-xl cursor-pointer hover:border-pmColor hover:bg-pmColor/10 transition-all duration-300 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-white">
                                  {room.room_name}
                                </div>
                                <div className="text-sm text-white/70">
                                  {languageCode === 'bn' ? 'সিট:' : 'Seat:'} {room.seat_no}
                                </div>
                              </div>
                              <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                {languageCode === 'bn' ? 'উপলব্ধ' : 'Available'}
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

        {/* Allocated Students Table Component */}
        <div className="animate-fadeIn">
          <AllocatedStudentsTable />
        </div>

        {/* Reusable Draggable Modal */}
        <DraggableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmAction}
          title={getModalContent().title}
          message={getModalContent().message}
          confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
          cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
          confirmButtonClass="bg-pmColor hover:bg-pmColor/80"
        />
      </div>
    </div>
  );
};

export default HostelAllocation;