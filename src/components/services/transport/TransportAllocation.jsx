import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaBus, FaPlus, FaSearch } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { languageCode } from '../../../utilitis/getTheme';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetTransportPackagesQuery } from '../../../redux/features/api/transport/transportPackagesApi';
import { useGetTransportRoutesQuery } from '../../../redux/features/api/transport/transportRoutesApi';
import { useCreateTransportMutation, useGetTransportsQuery } from '../../../redux/features/api/transport/transportsApi';
import { useGetStudentActiveApiQuery } from '../../../redux/features/api/student/studentActiveApi';
import selectStyles from '../../../utilitis/selectStyles';
import DraggableModal from '../../common/DraggableModal';

const TransportAllocation = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    student_id: null,
    academic_year: null,
    transport_package: null,
    route: null,
  });
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_transport_allocation') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_transport_allocation') || false;

  // API Hooks
  const { data: academicYears = [], isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: transportPackages = [], isLoading: isPackagesLoading } = useGetTransportPackagesQuery();
  const { data: transportRoutes = [], isLoading: isRoutesLoading } = useGetTransportRoutesQuery();
  const { data: allocations = [], isLoading: isAllocationsLoading, error: allocationsError, refetch } = useGetTransportsQuery();
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(searchParams || undefined, { skip: !searchParams });
  const [createAllocation, { isLoading: isCreating, error: createError }] = useCreateTransportMutation();

  // React-Select options
  const statusOptions = [
    { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    { value: 'Inactive', label: languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive' },
    { value: 'Pending', label: languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending' },
  ];
  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.academic_year || year.id,
  }));
  const transportPackageOptions = transportPackages.map(pkg => ({
    value: pkg.id,
    label: `${pkg.package_name} - $${Number(pkg.amount || 0).toLocaleString()}`,
  }));
  const routeOptions = transportRoutes.map(route => ({
    value: route.id,
    label: `${route.name} (${route.start_point} → ${route.end_point})`,
  }));

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle student search
  const handleStudentSearch = (searchTerm) => {
    setStudentSearchTerm(searchTerm);
    if (searchTerm.trim()) {
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      setSearchParams(isNumeric ? { user_id: parseInt(searchTerm) } : { username: searchTerm.trim() });
      setShowStudentSearch(true);
    } else {
      setSearchParams(null);
      setSelectedStudent(null);
      setSearchResults([]);
      setShowStudentSearch(false);
      setFormData(prev => ({ ...prev, student_id: null }));
    }
  };

  // Update search results
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
      student_id: { value: student.id, label: `${student.name} (${student.username})` },
    }));
    setShowStudentSearch(false);
    setStudentSearchTerm(`${student.name} (${student.username})`);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'বরাদ্দ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create allocations.');
      return;
    }
    if (!formData.student_id?.value || !formData.academic_year?.value || !formData.transport_package?.value || !formData.route?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (allocations.some(a => a.student_id === formData.student_id.value && a.academic_year === formData.academic_year.value)) {
      toast.error(languageCode === 'bn' ? 'এই ছাত্রের জন্য এই শিক্ষাবর্ষে ইতিমধ্যে একটি বরাদ্দ বিদ্যমান!' : 'An allocation already exists for this student in this academic year!');
      return;
    }

    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      const allocationData = {
        status: formData.status.value,
        student_id: parseInt(formData.student_id.value),
        academic_year: parseInt(formData.academic_year.value),
        transport_package: parseInt(formData.transport_package.value),
        route: parseInt(formData.route.value),
      };
      await createAllocation(allocationData).unwrap();
      toast.success(languageCode === 'bn' ? 'বরাদ্দ সফলভাবে তৈরি করা হয়েছে!' : 'Allocation created successfully!');
      setFormData({
        status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
        student_id: null,
        academic_year: null,
        transport_package: null,
        route: null,
      });
      setSelectedStudent(null);
      setStudentSearchTerm('');
      setSearchParams(null);
      setSearchResults([]);
      refetch();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error creating allocation:', err);
      toast.error(`${languageCode === 'bn' ? 'বরাদ্দ তৈরিতে ত্রুটি:' : 'Error creating allocation:'} ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
      student_id: null,
      academic_year: null,
      transport_package: null,
      route: null,
    });
    setSelectedStudent(null);
    setStudentSearchTerm('');
    setSearchParams(null);
    setSearchResults([]);
    setShowStudentSearch(false);
  };

  // Get display names
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === parseInt(yearId));
    return year?.year || year?.name || year?.academic_year || yearId || 'N/A';
  };

  const getPackageName = (packageId) => {
    const pkg = transportPackages.find(p => p.id === parseInt(packageId));
    return pkg?.package_name || packageId || 'N/A';
  };

  const getRouteName = (routeId) => {
    const route = transportRoutes.find(r => r.id === parseInt(routeId));
    return route ? `${route.name} (${route.start_point} → ${route.end_point})` : routeId || 'N/A';
  };

  // Permission-based Rendering
  // if (permissionsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center">
  //         <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
  //         <div className="text-[#441a05]">
  //           {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!hasViewPermission) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center">
  //         <div className="text-secColor text-xl font-semibold">
  //           {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="py-8 w-full mx-auto">

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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .react-select__control {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #441a05fff;
            border-radius: 0.75rem;
            padding: 0.25rem;
          }
          .react-select__control--is-focused {
            border-color: #4a90e2 !important;
            box-shadow: none !important;
            background: rgba(255, 255, 255, 0.15);
          }
          .react-select__menu {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: #441a05fff;
          }
          .react-select__option {
            background: transparent;
            color: #441a05fff;
          }
          .react-select__option--is-focused {
            background: rgba(255, 255, 255, 0.05);
          }
          .react-select__option--is-selected {
            background: #4a90e2;
          }
          .react-select__single-value {
            color: #441a05fff;
          }
          .react-select__placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
        `}
      </style>

      {/* Page Header */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaBus className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'পরিবহন বরাদ্দ' : 'Transport Allocation'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'ছাত্রদের পরিবহন রুট এবং প্যাকেজে বরাদ্দ করুন' : 'Allocate students to transport routes and packages'}
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Form */}
      {/* {hasAddPermission && ( */}
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              <IoAddCircle className="text-pmColor text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'নতুন পরিবহন বরাদ্দ' : 'New Transport Allocation'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'ছাত্র *' : 'Student *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onFocus={() => setShowStudentSearch(true)}
                  className="w-full bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                  placeholder={languageCode === 'bn' ? 'ব্যবহারকারী আইডি বা ব্যবহারকারীর নাম দিয়ে অনুসন্ধান করুন...' : 'Search by User ID or Username...'}
                />
                {showStudentSearch && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((student, index) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="px-4 py-3 hover:bg-[#441a05]/5 cursor-pointer border-b border-[#441a05]/10 last:border-b-0 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                            <span className="text-pmColor font-medium text-sm">
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-[#441a05]">{student.name}</div>
                            <div className="text-sm text-[#441a05]/70">
                              {languageCode === 'bn' ? 'ব্যবহারকারীর নাম' : 'Username'}: {student.username} | {languageCode === 'bn' ? 'ব্যবহারকারী আইডি' : 'User ID'}: {student.user_id}
                            </div>
                            <div className="text-sm text-[#441a05]/70">
                              {languageCode === 'bn' ? 'শ্রেণি' : 'Class'}: {student.class_name} | {languageCode === 'bn' ? 'রোল' : 'Roll'}: {student.roll_no} | {languageCode === 'bn' ? 'ফোন' : 'Phone'}: {student.phone_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showStudentSearch && searchParams && !studentLoading && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-xl shadow-lg">
                    <div className="px-4 py-3 text-[#441a05]/70 text-center">
                      {languageCode === 'bn' ? 'এই অনুসন্ধান শব্দের সাথে কোনো ছাত্র পাওয়া যায়নি' : 'No student found with this search term'}
                    </div>
                  </div>
                )}
                {studentLoading && (
                  <div className="absolute right-3 top-3">
                    <FaSpinner className="animate-spin text-pmColor" />
                  </div>
                )}
                {selectedStudent && (
                  <div className="mt-2 p-4 bg-[#441a05]/5 border border-[#441a05]/20 rounded-xl animate-scaleIn">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-pmColor/20 flex items-center justify-center">
                          <span className="text-pmColor font-medium">
                            {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-[#441a05]">{selectedStudent.name}</div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'ব্যবহারকারীর নাম' : 'Username'}: {selectedStudent.username} | {languageCode === 'bn' ? 'ব্যবহারকারী আইডি' : 'User ID'}: {selectedStudent.user_id}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'শ্রেণি' : 'Class'}: {selectedStudent.class_name} | {languageCode === 'bn' ? 'শাখা' : 'Section'}: {selectedStudent.section_name} | {languageCode === 'bn' ? 'রোল' : 'Roll'}: {selectedStudent.roll_no}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'ফোন' : 'Phone'}: {selectedStudent.phone_number} | {languageCode === 'bn' ? 'লিঙ্গ' : 'Gender'}: {selectedStudent.gender}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          setFormData(prev => ({ ...prev, student_id: null }));
                          setStudentSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="text-[#441a05]/70 hover:text-[#441a05]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'স্থিতি *' : 'Status *'}
              </label>
              <Select
                value={formData.status}
                onChange={(option) => handleInputChange('status', option)}
                options={statusOptions}
                classNamePrefix="react-select"
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                placeholder={languageCode === 'bn' ? 'স্থিতি নির্বাচন করুন' : 'Select Status'}
                isDisabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'শিক্ষাবর্ষ *' : 'Academic Year *'}
              </label>
              <Select
                value={formData.academic_year}
                onChange={(option) => handleInputChange('academic_year', option)}
                options={academicYearOptions}
                classNamePrefix="react-select"
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                placeholder={languageCode === 'bn' ? 'শিক্ষাবর্ষ নির্বাচন করুন' : 'Select Academic Year'}
                isDisabled={isCreating || isAcademicYearsLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'পরিবহন প্যাকেজ *' : 'Transport Package *'}
              </label>
              <Select
                value={formData.transport_package}
                onChange={(option) => handleInputChange('transport_package', option)}
                options={transportPackageOptions}
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'পরিবহন প্যাকেজ নির্বাচন করুন' : 'Select Transport Package'}
                isDisabled={isCreating || isPackagesLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'পরিবহন রুট *' : 'Transport Route *'}
              </label>
              <Select
                value={formData.route}
                onChange={(option) => handleInputChange('route', option)}
                options={routeOptions}
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'রুট নির্বাচন করুন' : 'Select Route'}
                isDisabled={isCreating || isRoutesLoading}
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={isCreating || !formData.student_id?.value || !formData.academic_year?.value || !formData.transport_package?.value || !formData.route?.value}
                className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  isCreating || !formData.student_id?.value || !formData.academic_year?.value || !formData.transport_package?.value || !formData.route?.value
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                {isCreating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{languageCode === 'bn' ? 'তৈরি করা হচ্ছে...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>{languageCode === 'bn' ? 'বরাদ্দ তৈরি করুন' : 'Create Allocation'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-[#441a05]px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                {languageCode === 'bn' ? 'রিসেট' : 'Reset'}
              </button>
            </div>
          </form>

          {(createError || studentError) && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {createError
                  ? `${languageCode === 'bn' ? 'বরাদ্দ তৈরিতে ত্রুটি:' : 'Error creating allocation:'} ${createError.status || 'unknown'} - ${JSON.stringify(createError.data || {})}`
                  : `${languageCode === 'bn' ? 'ছাত্র অনুসন্ধানে ত্রুটি:' : 'Student Search Error:'} ${studentError?.status || 'unknown'}`}
              </div>
            </div>
          )}
        </div>
      {/* )} */}

      {/* Allocation Summary */}
      {formData.student_id?.value && formData.academic_year?.value && formData.transport_package?.value && formData.route?.value && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaBus className="text-pmColor text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'বরাদ্দ সারাংশ' : 'Allocation Summary'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'ছাত্র:' : 'Student:'}</span>
              <div className="text-[#441a05]">{selectedStudent?.name} ({selectedStudent?.username})</div>
              <div className="text-sm text-[#441a05]/70">
                {languageCode === 'bn' ? 'ব্যবহারকারী আইডি' : 'User ID'}: {selectedStudent?.user_id} | {languageCode === 'bn' ? 'শ্রেণি' : 'Class'}: {selectedStudent?.class_name}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'স্থিতি:' : 'Status:'}</span>
              <div className="text-[#441a05]">{formData.status.label}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'শিক্ষাবর্ষ:' : 'Academic Year:'}</span>
              <div className="text-[#441a05]">{formData.academic_year.label}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'পরিবহন প্যাকেজ:' : 'Transport Package:'}</span>
              <div className="text-[#441a05]">{formData.transport_package.label}</div>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'রুট:' : 'Route:'}</span>
              <div className="text-[#441a05]">{formData.route.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Allocations Summary */}
      {allocations.length > 0 && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaBus className="text-pmColor text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'পরিবহন বরাদ্দ পরিসংখ্যান' : 'Transport Allocation Statistics'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#441a05]/5 p-4 rounded-xl border border-[#441a05]/20 animate-scaleIn">
              <div className="text-[#441a05]font-semibold">{languageCode === 'bn' ? 'মোট বরাদ্দ' : 'Total Allocations'}</div>
              <div className="text-2xl font-bold text-[#441a05]">{allocations.length}</div>
            </div>
            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-green-400 font-semibold">{languageCode === 'bn' ? 'সক্রিয়' : 'Active'}</div>
              <div className="text-2xl font-bold text-green-400">
                {allocations.filter(a => a.status === 'Active').length}
              </div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-yellow-400 font-semibold">{languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</div>
              <div className="text-2xl font-bold text-yellow-400">
                {allocations.filter(a => a.status === 'Pending').length}
              </div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-red-400 font-semibold">{languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</div>
              <div className="text-2xl font-bold text-red-400">
                {allocations.filter(a => a.status === 'Inactive').length}
              </div>
            </div>
          </div>
          {allocationsError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {languageCode === 'bn' ? 'বরাদ্দ লোড করতে ত্রুটি:' : 'Error loading allocations:'} {allocationsError.status || 'unknown'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={languageCode === 'bn' ? 'নতুন বরাদ্দ নিশ্চিত করুন' : 'Confirm New Allocation'}
        message={languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন পরিবহন বরাদ্দ তৈরি করতে চান?' : 'Are you sure you want to create a new transport allocation?'}
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass="bg-pmColor hover:bg-pmColor/80"
      />
    </div>
  );
};

export default TransportAllocation;