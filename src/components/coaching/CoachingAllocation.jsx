import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetAcademicYearApiQuery,
} from '../../redux/features/api/academic-year/academicYearApi';
import {
  useGetStudentActiveApiQuery,
} from '../../redux/features/api/student/studentActiveApi';

import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { FaSpinner, FaList, FaPlus, FaSearch } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdAccessTime, MdUpdate } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import DraggableModal from '../common/DraggableModal';
import { languageCode } from '../../utilitis/getTheme';
import { useGetCoachingBatchesQuery } from '../../redux/features/api/coaching/coachingBatchesApi';
import { useGetCoachingPackagesQuery } from '../../redux/features/api/coaching/coachingPackagesApi';
import { useCreateCoachingMutation, useGetCoachingsQuery } from '../../redux/features/api/coaching/coachingsApi';
import selectStyles from '../../utilitis/selectStyles';

const CoachingAllocation = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    student_id: null,
    academic_year: null,
    coaching_package: null,
    batch: null,
  });
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_coaching_allocation') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_coaching_allocation') || false;

  // API Hooks
  const { data: academicYears = [], isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: coachingPackages = [], isLoading: isPackagesLoading } = useGetCoachingPackagesQuery();
  const { data: coachingBatches = [], isLoading: isBatchesLoading } = useGetCoachingBatchesQuery();
  const { data: allocations = [], isLoading: isAllocationsLoading, error: allocationsError, refetch } = useGetCoachingsQuery();
  const { 
    data: studentData, 
    isLoading: studentLoading, 
    error: studentError 
  } = useGetStudentActiveApiQuery(searchParams || undefined, { skip: !searchParams });
  const [createAllocation, { isLoading: isCreating, error: createError }] = useCreateCoachingMutation();

  // React-Select options
  const statusOptions = [
    { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    { value: 'Inactive', label: languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive' },
    { value: 'Pending', label: languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending' },
    { value: 'Suspended', label: languageCode === 'bn' ? 'স্থগিত' : 'Suspended' },
  ];

  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.academic_year || year.id,
  }));

  const coachingPackageOptions = coachingPackages.map(pkg => ({
    value: pkg.id,
    label: `${pkg.package_name} - $${Number(pkg.amount).toLocaleString()}`,
  }));

  const batchOptions = coachingBatches.map(batch => ({
    value: batch.id,
    label: batch.name,
  }));

  // Allocation Statistics
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
      packageCounts,
    };
  }, [allocations]);

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

  // Update search results
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
      student_id: student.id,
    }));
    setShowStudentSearch(false);
    setStudentSearchTerm(`${student.name} (${student.username})`);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'বরাদ্দ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create allocations.');
      return;
    }
    if (!formData.student_id || !formData.academic_year?.value || !formData.coaching_package?.value || !formData.batch?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (allocations.some(allocation => 
      allocation.student_id === formData.student_id && 
      allocation.academic_year === formData.academic_year.value &&
      allocation.coaching_package === formData.coaching_package.value &&
      allocation.batch === formData.batch.value
    )) {
      toast.error(languageCode === 'bn' ? 'এই বরাদ্দ ইতিমধ্যে বিদ্যমান!' : 'This allocation already exists!');
      return;
    }

    setModalAction('create');
    setModalData({
      status: formData.status.value,
      student_id: parseInt(formData.student_id),
      academic_year: parseInt(formData.academic_year.value),
      coaching_package: parseInt(formData.coaching_package.value),
      batch: parseInt(formData.batch.value),
    });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) {
          toast.error(languageCode === 'bn' ? 'বরাদ্দ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create allocations.');
          return;
        }
        await createAllocation(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'বরাদ্দ সফলভাবে তৈরি করা হয়েছে!' : 'Allocation created successfully!');
        setFormData({
          status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
          student_id: null,
          academic_year: null,
          coaching_package: null,
          batch: null,
        });
        setSelectedStudent(null);
        setStudentSearchTerm('');
        setSearchParams(null);
        setSearchResults([]);
        refetch();
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error creating allocation:', err);
      toast.error(`${languageCode === 'bn' ? 'বরাদ্দ তৈরিতে ত্রুটি:' : 'Error creating allocation:'} ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      status: { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
      student_id: null,
      academic_year: null,
      coaching_package: null,
      batch: null,
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
    const pkg = coachingPackages.find(p => p.id === parseInt(packageId));
    return pkg?.package_name || packageId || 'N/A';
  };

  const getPackageAmount = (packageId) => {
    const pkg = coachingPackages.find(p => p.id === parseInt(packageId));
    return pkg?.amount ? Number(pkg.amount).toLocaleString() : '0';
  };

  const getBatchName = (batchId) => {
    const batch = coachingBatches.find(b => b.id === parseInt(batchId));
    return batch?.name || batchId || 'N/A';
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
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'কোচিং বরাদ্দ' : 'Coaching Allocation'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'শিক্ষার্থীদের কোচিং প্যাকেজ এবং ব্যাচে বরাদ্দ করুন' : 'Allocate students to coaching packages and batches'}
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
              {languageCode === 'bn' ? 'নতুন বরাদ্দ' : 'New Allocation'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'শিক্ষার্থী *' : 'Student *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onFocus={() => setShowStudentSearch(true)}
                  className="w-full pl-10 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                  placeholder={languageCode === 'bn' ? 'ইউজার আইডি বা ইউজারনেম দিয়ে অনুসন্ধান করুন...' : 'Search by User ID or Username...'}
                />
                <FaSearch className="absolute left-3 top-4 text-[#441a05]/60" />
                {studentLoading && (
                  <div className="absolute right-3 top-3.5">
                    <FaSpinner className="animate-spin text-pmColor" />
                  </div>
                )}
                {showStudentSearch && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="px-4 py-3 hover:bg-[#441a05]/5 cursor-pointer border-b border-[#441a05]/10 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                              <span className="text-pmColor font-medium text-sm">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-[#441a05]">{student.name}</div>
                            <div className="text-sm text-[#441a05]/70">
                              {languageCode === 'bn' ? 'ইউজারনেম:' : 'Username:'} {student.username} | {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {student.user_id}
                            </div>
                            <div className="text-sm text-[#441a05]/70">
                              {languageCode === 'bn' ? 'শ্রেণি:' : 'Class:'} {student.class_name} | {languageCode === 'bn' ? 'রোল:' : 'Roll:'} {student.roll_no} | {languageCode === 'bn' ? 'ফোন:' : 'Phone:'} {student.phone_number}
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
                      {languageCode === 'bn' ? 'এই অনুসন্ধান শব্দের সাথে কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No student found with this search term'}
                    </div>
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
                          <div className="font-medium text-[#441a05]">
                            {selectedStudent.name}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'ইউজারনেম:' : 'Username:'} {selectedStudent.username} | {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {selectedStudent.user_id}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'শ্রেণি:' : 'Class:'} {selectedStudent.class_name} | {languageCode === 'bn' ? 'সেকশন:' : 'Section:'} {selectedStudent.section_name} | {languageCode === 'bn' ? 'রোল:' : 'Roll:'} {selectedStudent.roll_no}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'ফোন:' : 'Phone:'} {selectedStudent.phone_number} | {languageCode === 'bn' ? 'লিঙ্গ:' : 'Gender:'} {selectedStudent.gender}
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
              {studentError && (
                <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400">
                    {languageCode === 'bn' ? 'শিক্ষার্থী অনুসন্ধানে ত্রুটি:' : 'Student Search Error:'} {studentError?.status || 'unknown'}
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'অবস্থা *' : 'Status *'}
              </label>
              <Select
                value={formData.status}
                onChange={(option) => handleInputChange('status', option)}
                options={statusOptions}
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                classNamePrefix="react-select"
                isDisabled={isCreating}
              />
            </div>

            {/* Academic Year */}
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
              {isAcademicYearsLoading && (
                <p className="text-sm text-[#441a05]/70 mt-1">
                  {languageCode === 'bn' ? 'শিক্ষাবর্ষ লোড হচ্ছে...' : 'Loading academic years...'}
                </p>
              )}
            </div>

            {/* Coaching Package */}
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'কোচিং প্যাকেজ *' : 'Coaching Package *'}
              </label>
              <Select
                value={formData.coaching_package}
                onChange={(option) => handleInputChange('coaching_package', option)}
                options={coachingPackageOptions}
                classNamePrefix="react-select"
                  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                placeholder={languageCode === 'bn' ? 'কোচিং প্যাকেজ নির্বাচন করুন' : 'Select Coaching Package'}
                isDisabled={isCreating || isPackagesLoading}
              />
              {isPackagesLoading && (
                <p className="text-sm text-[#441a05]/70 mt-1">
                  {languageCode === 'bn' ? 'প্যাকেজ লোড হচ্ছে...' : 'Loading packages...'}
                </p>
              )}
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-[#441a05]mb-1">
                {languageCode === 'bn' ? 'কোচিং ব্যাচ *' : 'Coaching Batch *'}
              </label>
              <Select
                value={formData.batch}
                onChange={(option) => handleInputChange('batch', option)}
                options={batchOptions}
                classNamePrefix="react-select"
  styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                placeholder={languageCode === 'bn' ? 'কোচিং ব্যাচ নির্বাচন করুন' : 'Select Coaching Batch'}
                isDisabled={isCreating || isBatchesLoading}
              />
              {isBatchesLoading && (
                <p className="text-sm text-[#441a05]/70 mt-1">
                  {languageCode === 'bn' ? 'ব্যাচ লোড হচ্ছে...' : 'Loading batches...'}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={isCreating || !hasAddPermission}
                className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  (isCreating || !hasAddPermission) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
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

          {createError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {languageCode === 'bn' ? 'বরাদ্দ তৈরিতে ত্রুটি:' : 'Error creating allocation:'} {createError.status || 'unknown'} - {JSON.stringify(createError.data || {})}
              </div>
            </div>
          )}
        </div>
      {/* )} */}

      {/* Allocation Summary */}
      {formData.student_id && formData.academic_year?.value && formData.coaching_package?.value && formData.batch?.value && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaList className="text-pmColor text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'বরাদ্দের সারাংশ' : 'Allocation Summary'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'শিক্ষার্থী:' : 'Student:'}</span>
              <div className="text-[#441a05]">
                {selectedStudent?.name} ({selectedStudent?.username})
              </div>
              <div className="text-sm text-[#441a05]/70">
                {languageCode === 'bn' ? 'ইউজার আইডি:' : 'User ID:'} {selectedStudent?.user_id} | {languageCode === 'bn' ? 'শ্রেণি:' : 'Class:'} {selectedStudent?.class_name}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'অবস্থা:' : 'Status:'}</span>
              <div className="text-[#441a05]">{formData.status.label}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'শিক্ষাবর্ষ:' : 'Academic Year:'}</span>
              <div className="text-[#441a05]">{formData.academic_year.label}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'প্যাকেজ:' : 'Package:'}</span>
              <div className="text-[#441a05]">
                {getPackageName(formData.coaching_package.value)}
                <span className="text-sm text-[#441a05]/70 ml-2">
                  (${getPackageAmount(formData.coaching_package.value)})
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-[#441a05]/70">{languageCode === 'bn' ? 'ব্যাচ:' : 'Batch:'}</span>
              <div className="text-[#441a05]">{formData.batch.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Allocations */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-[#441a05]/20">
          <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'সাম্প্রতিক বরাদ্দ' : 'Recent Allocations'} ({allocations.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          {isAllocationsLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'বরাদ্দ লোড হচ্ছে...' : 'Loading allocations...'}
              </p>
            </div>
          ) : allocationsError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'বরাদ্দ লোড করতে ত্রুটি:' : 'Error loading allocations:'} {allocationsError.status || 'unknown'}
                </p>
                <button
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-pmColor text-[#441a05]rounded-xl hover:bg-pmColor/80 transition-all"
                >
                  {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </button>
              </div>
            </div>
          ) : allocations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'কোনো বরাদ্দ পাওয়া যায়নি। উপরে আপনার প্রথম বরাদ্দ তৈরি করুন!' : 'No allocations found. Create your first allocation above!'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-[#441a05]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শিক্ষার্থী' : 'Student'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'অবস্থা' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্যাকেজ' : 'Package'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ব্যাচ' : 'Batch'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#441a05]/10">
                {allocations.slice(0, 10).map((allocation, index) => (
                  <tr
                    key={allocation.id}
                    className="hover:bg-[#441a05]/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 [#441a05]space-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-pmColor/20 flex items-center justify-center">
                          <span className="text-pmColor font-medium text-xs">
                            {allocation.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[#441a05]">
                            {allocation.student?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-[#441a05]/70">
                            {languageCode === 'bn' ? 'আইডি:' : 'ID:'} {allocation.student_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 [#441a05]space-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        allocation.status === 'Active' 
                          ? 'bg-green-500/20 text-green-500'
                          : allocation.status === 'Pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {languageCode === 'bn' 
                          ? (statusOptions.find(opt => opt.value === allocation.status)?.label || allocation.status)
                          : allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]">
                      {getPackageName(allocation.coaching_package)}
                    </td>
                    <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]">
                      {getBatchName(allocation.batch)}
                    </td>
                    <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]">
                      {getAcademicYearName(allocation.academic_year)}
                    </td>
                    <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]/70">
                      {allocation.created_at ? new Date(allocation.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

            {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6 animate-scaleIn">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pmColor/20 text-pmColor">
              <FaList className="text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#441a05]/70">
                {languageCode === 'bn' ? 'মোট বরাদ্দ' : 'Total Allocations'}
              </p>
              <p className="text-2xl font-bold text-[#441a05]">{allocationStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
              <FaList className="text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#441a05]/70">
                {languageCode === 'bn' ? 'সক্রিয় বরাদ্দ' : 'Active Allocations'}
              </p>
              <p className="text-2xl font-bold text-[#441a05]">{allocationStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
              <FaList className="text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[#441a05]/70">
                {languageCode === 'bn' ? 'উপলব্ধ প্যাকেজ' : 'Available Packages'}
              </p>
              <p className="text-2xl font-bold text-[#441a05]">{coachingPackages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={languageCode === 'bn' ? 'নতুন বরাদ্দ নিশ্চিত করুন' : 'Confirm New Allocation'}
        message={languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন বরাদ্দ তৈরি করতে চান?' : 'Are you sure you want to create a new allocation?'}
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass="bg-pmColor hover:bg-pmColor/80"
      />
    </div>
  );
};

export default CoachingAllocation;