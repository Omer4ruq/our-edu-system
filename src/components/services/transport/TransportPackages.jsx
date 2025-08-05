import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus, FaSearch, FaBus } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useCreateTransportPackageMutation, useDeleteTransportPackageMutation, useGetTransportPackageByIdQuery, useGetTransportPackagesQuery, usePatchTransportPackageMutation, useUpdateTransportPackageMutation } from '../../../redux/features/api/transport/transportPackagesApi';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { languageCode } from '../../../utilitis/getTheme';
import DraggableModal from '../../common/DraggableModal';
import selectStyles from '../../../utilitis/selectStyles';


const TransportPackages = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    package_name: '',
    amount: '',
    academic_year: null,
  });
  const [editingPackage, setEditingPackage] = useState(null);
  const [editData, setEditData] = useState({
    package_name: '',
    amount: '',
    academic_year: null,
  });
  const [searchId, setSearchId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_transport_package') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_transport_package') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_transport_package') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_transport_package') || false;

  // API Hooks
  const { data: packages = [], isLoading, error, refetch } = useGetTransportPackagesQuery();
  const { data: academicYears = [], isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: selectedPackage, isLoading: isLoadingSelected, error: selectedPackageError } = useGetTransportPackageByIdQuery(selectedPackageId, { skip: !selectedPackageId });
  const [createPackage, { isLoading: isCreating, error: createError }] = useCreateTransportPackageMutation();
  const [updatePackage, { isLoading: isUpdating, error: updateError }] = useUpdateTransportPackageMutation();
  const [patchPackage, { isLoading: isPatching, error: patchError }] = usePatchTransportPackageMutation();
  const [deletePackage, { isLoading: isDeleting, error: deleteError }] = useDeleteTransportPackageMutation();

  // React-Select options
  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.academic_year || year.id,
  }));

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create new package
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create packages.');
      return;
    }
    if (!formData.package_name.trim() || !formData.amount || !formData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === formData.package_name.trim().toLowerCase())) {
      toast.error(languageCode === 'bn' ? 'এই প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists!');
      return;
    }

    setModalAction('create');
    setModalData({
      package_name: formData.package_name.trim(),
      amount: formData.amount.toString(),
      academic_year: parseInt(formData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Save edit (PUT - full update)
  const handleSaveEdit = async (id, e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit packages.');
      return;
    }
    if (!editData.package_name.trim() || !editData.amount || !editData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === editData.package_name.trim().toLowerCase() && pkg.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists!');
      return;
    }

    setModalAction('update');
    setModalData({
      id,
      package_name: editData.package_name.trim(),
      amount: editData.amount.toString(),
      academic_year: parseInt(editData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Patch edit (PATCH - partial update)
  const handlePatchEdit = async (id, e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit packages.');
      return;
    }
    if (!editData.package_name.trim() || !editData.amount || !editData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === editData.package_name.trim().toLowerCase() && pkg.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists!');
      return;
    }

    setModalAction('patch');
    setModalData({
      id,
      package_name: editData.package_name.trim(),
      amount: editData.amount.toString(),
      academic_year: parseInt(editData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createPackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে তৈরি করা হয়েছে!' : 'Package created successfully!');
        setFormData({ package_name: '', amount: '', academic_year: null });
      } else if (modalAction === 'update') {
        await updatePackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে আপডেট করা হয়েছে!' : 'Package updated successfully!');
        setEditingPackage(null);
        setEditData({ package_name: '', amount: '', academic_year: null });
      } else if (modalAction === 'patch') {
        await patchPackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে প্যাচ করা হয়েছে!' : 'Package patched successfully!');
        setEditingPackage(null);
        setEditData({ package_name: '', amount: '', academic_year: null });
      } else if (modalAction === 'delete') {
        await deletePackage(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে!' : 'Package deleted successfully!');
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'প্যাকেজ' : 'Package'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Start editing
  const handleEditStart = (pkg) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit packages.');
      return;
    }
    setEditingPackage(pkg.id);
    setEditData({
      package_name: pkg.package_name,
      amount: pkg.amount.toString(),
      academic_year: academicYearOptions.find(opt => opt.value === pkg.academic_year) || null,
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingPackage(null);
    setEditData({ package_name: '', amount: '', academic_year: null });
  };

  // Delete package
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete packages.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Search by ID
  const handleSearchById = () => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'প্যাকেজ দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view packages.');
      return;
    }
    if (searchId.trim()) {
      setSelectedPackageId(searchId.trim());
    } else {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে একটি প্যাকেজ আইডি লিখুন' : 'Please enter a package ID');
    }
  };

  // Get academic year name
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === parseInt(yearId));
    return year?.year || year?.name || year?.academic_year || yearId || 'N/A';
  };

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
            color: #ffffff;
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
            color: #ffffff;
          }
          .react-select__option {
            background: transparent;
            color: #ffffff;
          }
          .react-select__option--is-focused {
            background: rgba(255, 255, 255, 0.05);
          }
          .react-select__option--is-selected {
            background: #4a90e2;
          }
          .react-select__single-value {
            color: #ffffff;
          }
          .react-select__placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
        `}
      </style>

      {/* Page Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaBus className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {languageCode === 'bn' ? 'পরিবহন প্যাকেজ' : 'Transport Packages'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'পরিবহন প্যাকেজ এবং তাদের বিবরণ পরিচালনা করুন' : 'Manage transport packages and their details'}
            </p>
          </div>
        </div>
      </div>

      {/* Create New Package Form */}
      {/* {hasAddPermission && ( */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-pmColor/20 rounded-xl">
            <IoAddCircle className="text-pmColor text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {languageCode === 'bn' ? 'নতুন প্যাকেজ তৈরি করুন' : 'Create New Transport Package'}
          </h3>
        </div>

        <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {languageCode === 'bn' ? 'প্যাকেজের নাম *' : 'Package Name *'}
            </label>
            <input
              type="text"
              value={formData.package_name}
              onChange={(e) => handleInputChange('package_name', e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
              placeholder={languageCode === 'bn' ? 'প্যাকেজের নাম লিখুন' : 'Enter package name'}
              disabled={isCreating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {languageCode === 'bn' ? 'মূল্য *' : 'Amount *'}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
              placeholder={languageCode === 'bn' ? 'মূল্য লিখুন' : 'Enter amount'}
              disabled={isCreating}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {languageCode === 'bn' ? 'শিক্ষাবর্ষ *' : 'Academic Year *'}
            </label>
            <Select
              value={formData.academic_year}
              onChange={(option) => handleInputChange('academic_year', option)}
              options={academicYearOptions}
                styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
              classNamePrefix="react-select"
              placeholder={languageCode === 'bn' ? 'শিক্ষাবর্ষ নির্বাচন করুন' : 'Select Academic Year'}
              isDisabled={isCreating || isAcademicYearsLoading}
            />
            {isAcademicYearsLoading && (
              <p className="text-sm text-white/70 mt-1">
                {languageCode === 'bn' ? 'শিক্ষাবর্ষ লোড হচ্ছে...' : 'Loading academic years...'}
              </p>
            )}
          </div>
          <div className="md:col-span-3 flex gap-4">
            <button
              type="submit"
              disabled={isCreating || !formData.package_name || !formData.amount || !formData.academic_year}
              className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${isCreating || !formData.package_name || !formData.amount || !formData.academic_year
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
                  <span>{languageCode === 'bn' ? 'প্যাকেজ তৈরি করুন' : 'Create Package'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ package_name: '', amount: '', academic_year: null })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              {languageCode === 'bn' ? 'রিসেট' : 'Reset'}
            </button>
          </div>
        </form>

        {createError && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
            <div className="text-red-400">
              {languageCode === 'bn' ? 'প্যাকেজ তৈরিতে ত্রুটি:' : 'Error creating package:'} {createError.status || 'unknown'} - {JSON.stringify(createError.data || {})}
            </div>
          </div>
        )}
      </div>
      {/* )} */}

      {/* Search by ID */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaSearch className="text-pmColor text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {languageCode === 'bn' ? 'আইডি দিয়ে প্যাকেজ অনুসন্ধান' : 'Search Package by ID'}
          </h3>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
            placeholder={languageCode === 'bn' ? 'প্যাকেজ আইডি লিখুন' : 'Enter package ID'}
          />
          <button
            onClick={handleSearchById}
            disabled={!searchId.trim()}
            className="bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSearch />
            {languageCode === 'bn' ? 'অনুসন্ধান' : 'Search'}
          </button>
        </div>
        {isLoadingSelected && (
          <div className="mt-3 flex items-center text-white/70">
            <FaSpinner className="animate-spin text-pmColor mr-2" />
            {languageCode === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}
          </div>
        )}
        {selectedPackage && (
          <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/20 animate-scaleIn">
            <h3 className="font-medium text-white">
              {languageCode === 'bn' ? 'পাওয়া প্যাকেজ:' : 'Found Package:'}
            </h3>
            <p className="text-white/70">{languageCode === 'bn' ? 'আইডি:' : 'ID:'} {selectedPackage.id}</p>
            <p className="text-white/70">{languageCode === 'bn' ? 'নাম:' : 'Name:'} {selectedPackage.package_name}</p>
            <p className="text-white/70">{languageCode === 'bn' ? 'মূল্য:' : 'Amount:'} ${Number(selectedPackage.amount).toLocaleString()}</p>
            <p className="text-white/70">{languageCode === 'bn' ? 'শিক্ষাবর্ষ:' : 'Academic Year:'} {getAcademicYearName(selectedPackage.academic_year)}</p>
          </div>
        )}
        {selectedPackageError && (
          <div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-scaleIn">
            <p className="text-red-400">
              {languageCode === 'bn' ? 'প্যাকেজ অনুসন্ধানে ত্রুটি:' : 'Package Search Error:'} {selectedPackageError.status || 'unknown'}
            </p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pmColor/20 text-pmColor">
              <FaBus className="text-2xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">
                {languageCode === 'bn' ? 'মোট প্যাকেজ' : 'Total Packages'}
              </p>
              <p className="text-2xl font-bold text-white">{packages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">
                {languageCode === 'bn' ? 'গড় মূল্য' : 'Average Amount'}
              </p>
              <p className="text-2xl font-bold text-white">
                ${packages.length > 0
                  ? Math.round(packages.reduce((sum, pkg) => sum + Number(pkg.amount || 0), 0) / packages.length).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">
                {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Years'}
              </p>
              <p className="text-2xl font-bold text-white">{new Set(packages.map(pkg => pkg.academic_year)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'সমস্ত পরিবহন প্যাকেজ' : 'All Transport Packages'} ({packages.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
            <p className="text-white/70">
              {languageCode === 'bn' ? 'প্যাকেজ লোড হচ্ছে...' : 'Loading packages...'}
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400">
                {languageCode === 'bn' ? 'প্যাকেজ লোড করতে ত্রুটি:' : 'Error loading packages:'} {error.status || 'unknown'}
              </p>
              <button
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-pmColor text-white rounded-xl hover:bg-pmColor/80 transition-all"
              >
                {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </button>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-white/70 text-xl mb-2">🚌</div>
            <p className="text-white/70">
              {languageCode === 'bn' ? 'কোনো প্যাকেজ পাওয়া যায়নি। উপরে আপনার প্রথম প্যাকেজ তৈরি করুন!' : 'No transport packages found. Create your first package above!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'মূল্য' : 'Amount'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {packages.map((pkg, index) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {editingPackage === pkg.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{pkg.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editData.package_name}
                            onChange={(e) => handleEditInputChange('package_name', e.target.value)}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                            placeholder={languageCode === 'bn' ? 'প্যাকেজের নাম' : 'Package name'}
                            disabled={isUpdating || isPatching}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={(e) => handleEditInputChange('amount', e.target.value)}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                            placeholder={languageCode === 'bn' ? 'মূল্য' : 'Amount'}
                            disabled={isUpdating || isPatching}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={editData.academic_year}
                            onChange={(option) => handleEditInputChange('academic_year', option)}
                            options={academicYearOptions}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            placeholder={languageCode === 'bn' ? 'শিক্ষাবর্ষ নির্বাচন করুন' : 'Select Academic Year'}
                            isDisabled={isUpdating || isPatching || isAcademicYearsLoading}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {pkg.created_at ? new Date(pkg.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => handleSaveEdit(pkg.id, e)}
                              disabled={isUpdating || !editData.package_name || !editData.amount || !editData.academic_year}
                              className="bg-green-500/20 hover:bg-green-500 hover:text-white text-green-400 p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'সংরক্ষণ করুন (PUT)' : 'Save (PUT)'}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handlePatchEdit(pkg.id, e)}
                              disabled={isPatching || !editData.package_name || !editData.amount || !editData.academic_year}
                              className="bg-yellow-500/20 hover:bg-yellow-500 hover:text-white text-yellow-400 p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'প্যাচ করুন (PATCH)' : 'Patch (PATCH)'}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500/20 hover:bg-gray-500 text-white p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{pkg.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                              <span className="text-pmColor font-medium text-sm">
                                {pkg.package_name?.charAt(0)?.toUpperCase() || 'P'}
                              </span>
                            </div>
                            <div className="ml-4 text-sm font-medium text-white">{pkg.package_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">${Number(pkg.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{getAcademicYearName(pkg.academic_year)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {pkg.created_at ? new Date(pkg.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {/* {hasChangePermission && ( */}
                              <button
                                onClick={() => handleEditStart(pkg)}
                                className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                                title={languageCode === 'bn' ? 'প্যাকেজ সম্পাদনা করুন' : 'Edit package'}
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                             {/* )} */}
                            {/* {hasDeletePermission && ( */}
                              <button
                                onClick={() => handleDelete(pkg.id)}
                                disabled={isDeleting}
                                className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                                title={languageCode === 'bn' ? 'প্যাকেজ মুছুন' : 'Delete package'}
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            {/* )} */}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(isDeleting || updateError || patchError || deleteError) && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলা হচ্ছে...' : 'Deleting package...')
                  : `${languageCode === 'bn' ? 'প্যাকেজ অপারেশনে ত্রুটি:' : 'Package operation error:'} ${(updateError || patchError || deleteError)?.status || 'unknown'}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'নতুন প্যাকেজ নিশ্চিত করুন' : 'Confirm New Package')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'প্যাকেজ আপডেট নিশ্চিত করুন' : 'Confirm Package Update')
              : modalAction === 'patch'
                ? (languageCode === 'bn' ? 'প্যাকেজ প্যাচ নিশ্চিত করুন' : 'Confirm Package Patch')
                : (languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Package Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন প্যাকেজ তৈরি করতে চান?' : 'Are you sure you want to create a new package?')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে প্যাকেজ আপডেট করতে চান?' : 'Are you sure you want to update this package?')
              : modalAction === 'patch'
                ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে প্যাকেজ প্যাচ করতে চান?' : 'Are you sure you want to patch this package?')
                : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই প্যাকেজটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this package?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default TransportPackages;