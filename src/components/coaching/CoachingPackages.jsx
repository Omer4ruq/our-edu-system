import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetCoachingPackagesQuery,
  useGetCoachingPackageByIdQuery,
  useCreateCoachingPackageMutation,
  useUpdateCoachingPackageMutation,
  usePatchCoachingPackageMutation,
  useDeleteCoachingPackageMutation,
} from '../../redux/features/api/coaching/coachingPackagesApi';
import { useGetCoachingBatchesQuery } from '../../redux/features/api/coaching/coachingBatchesApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdAccessTime, MdUpdate } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import DraggableModal from '../common/DraggableModal';
import { languageCode } from '../../utilitis/getTheme';
import selectStyles from '../../utilitis/selectStyles';

const CoachingPackages = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    package_name: null,
    amount: '',
    academic_year: null,
  });
  const [editingPackage, setEditingPackage] = useState(null);
  const [editData, setEditData] = useState({
    package_name: null,
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
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_coaching_package') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_coaching_package') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_coaching_package') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_coaching_package') || false;

  // API Hooks
  const { data: packages = [], isLoading, error: packagesError, refetch } = useGetCoachingPackagesQuery();
  const { data: batches = [], isLoading: isBatchesLoading } = useGetCoachingBatchesQuery();
  const { data: academicYears = [], isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: selectedPackage, isLoading: isLoadingSelected, error: selectedPackageError } = useGetCoachingPackageByIdQuery(
    selectedPackageId,
    { skip: !selectedPackageId }
  );
  const [createPackage, { isLoading: isCreating, error: createError }] = useCreateCoachingPackageMutation();
  const [updatePackage, { isLoading: isUpdating, error: updateError }] = useUpdateCoachingPackageMutation();
  const [patchPackage, { isLoading: isPatching, error: patchError }] = usePatchCoachingPackageMutation();
  const [deletePackage, { isLoading: isDeleting, error: deleteError }] = useDeleteCoachingPackageMutation();

  // React-Select options
  const batchOptions = batches.map(batch => ({
    value: batch.id,
    label: batch.name,
  }));

  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.id,
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
      toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.');
      return;
    }
    if (!formData.package_name?.value || !formData.amount || !formData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all fields');
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error(languageCode === 'bn' ? 'মূল্য অবশ্যই ইতিবাচক হতে হবে' : 'Amount must be positive');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === formData.package_name.label.toLowerCase() && pkg.academic_year === formData.academic_year.value)) {
      toast.error(languageCode === 'bn' ? 'এই শিক্ষাবর্ষের জন্য প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists for the selected academic year!');
      return;
    }

    setModalAction('create');
    setModalData({
      package_name: formData.package_name.label,
      amount: parseFloat(formData.amount),
      academic_year: parseInt(formData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Start editing
  const handleEditStart = (pkg) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditingPackage(pkg.id);
    setEditData({
      package_name: { value: pkg.batch_id || pkg.package_name, label: pkg.package_name },
      amount: pkg.amount.toString(),
      academic_year: { value: pkg.academic_year, label: academicYears.find(year => year.id === pkg.academic_year)?.year || pkg.academic_year },
    });
  };

  // Save edit (PUT)
  const handleSaveEdit = async (id) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
      return;
    }
    if (!editData.package_name?.value || !editData.amount || !editData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all fields');
      return;
    }
    if (parseFloat(editData.amount) <= 0) {
      toast.error(languageCode === 'bn' ? 'মূল্য অবশ্যই ইতিবাচক হতে হবে' : 'Amount must be positive');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === editData.package_name.label.toLowerCase() && pkg.academic_year === editData.academic_year.value && pkg.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই শিক্ষাবর্ষের জন্য প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists for the selected academic year!');
      return;
    }

    setModalAction('update');
    setModalData({
      id,
      package_name: editData.package_name.label,
      amount: parseFloat(editData.amount),
      academic_year: parseInt(editData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Patch edit (PATCH)
  const handlePatchEdit = async (id) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
      return;
    }
    if (!editData.package_name?.value || !editData.amount || !editData.academic_year?.value) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all fields');
      return;
    }
    if (parseFloat(editData.amount) <= 0) {
      toast.error(languageCode === 'bn' ? 'মূল্য অবশ্যই ইতিবাচক হতে হবে' : 'Amount must be positive');
      return;
    }
    if (packages.some(pkg => pkg.package_name.toLowerCase() === editData.package_name.label.toLowerCase() && pkg.academic_year === editData.academic_year.value && pkg.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই শিক্ষাবর্ষের জন্য প্যাকেজের নাম ইতিমধ্যে বিদ্যমান!' : 'This package name already exists for the selected academic year!');
      return;
    }

    setModalAction('patch');
    setModalData({
      id,
      package_name: editData.package_name.label,
      amount: parseFloat(editData.amount),
      academic_year: parseInt(editData.academic_year.value),
    });
    setIsModalOpen(true);
  };

  // Delete package
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) {
          toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.');
          return;
        }
        await createPackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে তৈরি করা হয়েছে!' : 'Package created successfully!');
        setFormData({ package_name: null, amount: '', academic_year: null });
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
          return;
        }
        await updatePackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে আপডেট করা হয়েছে!' : 'Package updated successfully!');
        setEditingPackage(null);
        setEditData({ package_name: null, amount: '', academic_year: null });
      } else if (modalAction === 'patch') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
          return;
        }
        await patchPackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'প্যাকেজ সফলভাবে আপডেট করা হয়েছে!' : 'Package patched successfully!');
        setEditingPackage(null);
        setEditData({ package_name: null, amount: '', academic_year: null });
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
          return;
        }
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

  // Search by ID
  const handleSearchById = () => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view.');
      return;
    }
    if (searchId.trim()) {
      setSelectedPackageId(searchId.trim());
    } else {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে একটি প্যাকেজ আইডি দিন' : 'Please enter a package ID');
    }
  };

  // Get modal content
  const getModalContent = () => {
    switch (modalAction) {
      case 'create':
        return {
          title: languageCode === 'bn' ? 'নতুন প্যাকেজ নিশ্চিত করুন' : 'Confirm New Package',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন প্যাকেজ তৈরি করতে চান?' : 'Are you sure you want to create a new package?'
        };
      case 'update':
        return {
          title: languageCode === 'bn' ? 'প্যাকেজ আপডেট নিশ্চিত করুন' : 'Confirm Package Update',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে প্যাকেজ আপডেট করতে চান?' : 'Are you sure you want to update this package?'
        };
      case 'patch':
        return {
          title: languageCode === 'bn' ? 'প্যাকেজ আপডেট নিশ্চিত করুন' : 'Confirm Package Patch',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে প্যাকেজ আংশিকভাবে আপডেট করতে চান?' : 'Are you sure you want to patch this package?'
        };
      case 'delete':
        return {
          title: languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Package Deletion',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই প্যাকেজটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this package?'
        };
      default:
        return { title: '', message: '' };
    }
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
      {/* <Toaster position="top-right" reverseOrder={false} /> */}

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
              {languageCode === 'bn' ? 'কোচিং প্যাকেজ ব্যবস্থাপনা' : 'Coaching Packages Management'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'কোচিং প্যাকেজ তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit, and manage coaching packages'}
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit Package Form */}
      {/* {(hasAddPermission || hasChangePermission) && ( */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-pmColor/20 rounded-xl">
            {editingPackage ? (
              <FaEdit className="text-pmColor text-3xl" />
            ) : (
              <IoAddCircle className="text-pmColor text-3xl" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#441a05]">
            {editingPackage
              ? (languageCode === 'bn' ? 'প্যাকেজ সম্পাদনা করুন' : 'Edit Package')
              : (languageCode === 'bn' ? 'নতুন প্যাকেজ তৈরি করুন' : 'Create New Package')}
          </h3>
        </div>

        <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#441a05]mb-1">
              {languageCode === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
            </label>
            <Select
              value={editingPackage ? editData.package_name : formData.package_name}
              onChange={(option) => (editingPackage ? handleEditInputChange('package_name', option) : handleInputChange('package_name', option))}
              options={batchOptions}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              classNamePrefix="react-select"
              placeholder={languageCode === 'bn' ? 'ব্যাচ নির্বাচন করুন' : 'Select Batch'}
              isDisabled={isCreating || isUpdating || isPatching || isBatchesLoading}
            />
            {isBatchesLoading && (
              <p className="text-sm text-[#441a05]/70 mt-1">
                {languageCode === 'bn' ? 'ব্যাচ লোড হচ্ছে...' : 'Loading batches...'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#441a05]mb-1">
              {languageCode === 'bn' ? 'মূল্য' : 'Amount'}
            </label>
            <input
              type="number"
              value={editingPackage ? editData.amount : formData.amount}
              onChange={(e) => (editingPackage ? handleEditInputChange('amount', e.target.value) : handleInputChange('amount', e.target.value))}
              className="w-full bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
              placeholder={languageCode === 'bn' ? 'মূল্য লিখুন' : 'Enter amount'}
              disabled={isCreating || isUpdating || isPatching}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#441a05]mb-1">
              {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
            </label>
            <Select
              value={editingPackage ? editData.academic_year : formData.academic_year}
              onChange={(option) => (editingPackage ? handleEditInputChange('academic_year', option) : handleInputChange('academic_year', option))}
              options={academicYearOptions}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              classNamePrefix="react-select"
              placeholder={languageCode === 'bn' ? 'শিক্ষাবর্ষ নির্বাচন করুন' : 'Select Academic Year'}
              isDisabled={isCreating || isUpdating || isPatching || isAcademicYearsLoading}
            />
            {isAcademicYearsLoading && (
              <p className="text-sm text-[#441a05]/70 mt-1">
                {languageCode === 'bn' ? 'শিক্ষাবর্ষ লোড হচ্ছে...' : 'Loading academic years...'}
              </p>
            )}
          </div>
          <div className="flex items-end gap-4">
            {editingPackage ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingPackage)}
                  disabled={isUpdating || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value || !hasChangePermission}
                  className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${(isUpdating || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value || !hasChangePermission)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{languageCode === 'bn' ? 'আপডেট করা হচ্ছে...' : 'Updating...'}</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>{languageCode === 'bn' ? 'আপডেট (PUT)' : 'Update (PUT)'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handlePatchEdit(editingPackage)}
                  disabled={isPatching || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value || !hasChangePermission}
                  className={`bg-yellow-500 hover:bg-yellow-600 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${(isPatching || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value || !hasChangePermission)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                    }`}
                >
                  {isPatching ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{languageCode === 'bn' ? 'আপডেট করা হচ্ছে...' : 'Patching...'}</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>{languageCode === 'bn' ? 'আপডেট (PATCH)' : 'Patch (PATCH)'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackage(null);
                    setEditData({ package_name: null, amount: '', academic_year: null });
                  }}
                  className="bg-red-500 hover:bg-secColor/30 text-[#441a05]px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isCreating || !formData.package_name?.value || !formData.amount || !formData.academic_year?.value || !hasAddPermission}
                className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${(isCreating || !formData.package_name?.value || !formData.amount || !formData.academic_year?.value || !hasAddPermission)
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
            )}
          </div>
        </form>

        {(createError || updateError || patchError) && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
            <div className="text-red-400">
              {languageCode === 'bn' ? 'ত্রুটি:' : 'Error:'} {(createError || updateError || patchError).status || 'unknown'} - {JSON.stringify((createError || updateError || patchError).data || {})}
            </div>
          </div>
        )}
      </div>
      {/* )} */}

      {/* Search by ID */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaSearch className="text-pmColor text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-[#441a05]">
            {languageCode === 'bn' ? 'আইডি দ্বারা প্যাকেজ অনুসন্ধান' : 'Search Package by ID'}
          </h3>
        </div>
        <div className="flex gap-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={languageCode === 'bn' ? 'প্যাকেজ আইডি লিখুন' : 'Enter package ID'}
              className="w-full pl-10 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
              disabled={isLoadingSelected}
            />
            <FaSearch className="absolute left-3 top-4 text-[#441a05]/60" />
          </div>
          <button
            onClick={handleSearchById}
            disabled={isLoadingSelected || !searchId.trim()}
            className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${(isLoadingSelected || !searchId.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
              }`}
          >
            <FaSearch />
            <span>{languageCode === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
          </button>
        </div>
        {selectedPackage && (
          <div className="mt-4 bg-[#441a05]/5 border border-[#441a05]/20 rounded-xl p-4 animate-scaleIn">
            <h3 className="text-[#441a05]font-semibold">{languageCode === 'bn' ? 'পাওয়া প্যাকেজ:' : 'Found Package:'}</h3>
            <p className="text-[#441a05]/70">ID: {selectedPackage.id}</p>
            <p className="text-[#441a05]/70">{languageCode === 'bn' ? 'নাম:' : 'Name:'} {selectedPackage.package_name}</p>
            <p className="text-[#441a05]/70">{languageCode === 'bn' ? 'মূল্য:' : 'Amount:'} ${Number(selectedPackage.amount).toLocaleString()}</p>
            <p className="text-[#441a05]/70">{languageCode === 'bn' ? 'শিক্ষাবর্ষ:' : 'Academic Year:'} {academicYears.find(year => year.id === selectedPackage.academic_year)?.year || selectedPackage.academic_year}</p>
          </div>
        )}
        {isLoadingSelected && (
          <div className="mt-4 flex items-center text-[#441a05]/70">
            <FaSpinner className="animate-spin text-pmColor mr-2" />
            {languageCode === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}
          </div>
        )}
        {selectedPackageError && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">
              {languageCode === 'bn' ? 'প্যাকেজ অনুসন্ধানে ত্রুটি:' : 'Error searching package:'} {selectedPackageError.status || 'unknown'}
            </p>
          </div>
        )}
      </div>

      {/* Packages Table */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-[#441a05]/20">
          <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'প্যাকেজের তালিকা' : 'Packages List'} ({packages.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          {isLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'প্যাকেজ লোড হচ্ছে...' : 'Loading packages...'}
              </p>
            </div>
          ) : packagesError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'প্যাকেজ লোড করতে ত্রুটি:' : 'Error loading packages:'} {packagesError.status || 'unknown'}
                </p>
                <button
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-pmColor text-[#441a05]rounded-xl hover:bg-pmColor/80 transition-all"
                >
                  {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </button>
              </div>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'কোনো প্যাকেজ উপলব্ধ নেই।' : 'No packages available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-[#441a05]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'মূল্য' : 'Amount'}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#441a05]/10">
                {packages.map((pkg, index) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-[#441a05]/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      {editingPackage === pkg.id ? (
                        <Select
                          value={editData.package_name}
                          onChange={(option) => handleEditInputChange('package_name', option)}
                          options={batchOptions}
                            styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                          classNamePrefix="react-select"
                          isDisabled={isUpdating || isPatching}
                        />
                      ) : (
                        <div className="text-[#441a05]font-medium">{pkg.package_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]font-medium">{pkg.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingPackage === pkg.id ? (
                        <input
                          type="number"
                          value={editData.amount}
                          onChange={(e) => handleEditInputChange('amount', e.target.value)}
                          className="w-full bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-2 text-[#441a05]focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                          disabled={isUpdating || isPatching}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-[#441a05]font-medium">${Number(pkg.amount).toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingPackage === pkg.id ? (
                        <Select
                          value={editData.academic_year}
                          onChange={(option) => handleEditInputChange('academic_year', option)}
                          options={academicYearOptions}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          classNamePrefix="react-select"
                          isDisabled={isUpdating || isPatching}
                        />
                      ) : (
                        <div className="text-[#441a05]font-medium">
                          {academicYears.find(year => year.id === pkg.academic_year)?.year || pkg.academic_year}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {pkg.created_at ? new Date(pkg.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {pkg.updated_at ? new Date(pkg.updated_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingPackage === pkg.id ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleSaveEdit(pkg.id)}
                            disabled={isUpdating || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আপডেট (PUT)' : 'Update (PUT)'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePatchEdit(pkg.id)}
                            disabled={isPatching || !editData.package_name?.value || !editData.amount || !editData.academic_year?.value}
                            className="bg-yellow-500/20 hover:bg-yellow-500 hover:text-[#441a05]text-yellow-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আপডেট (PATCH)' : 'Patch (PATCH)'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPackage(null);
                              setEditData({ package_name: null, amount: '', academic_year: null });
                            }}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditStart(pkg)}
                              className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'প্যাকেজ সম্পাদনা করুন' : 'Edit package'}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              disabled={isDeleting}
                              className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'প্যাকেজ মুছুন' : 'Delete package'}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(isDeleting || deleteError) && (
          <div className="p-4 border-t border-[#441a05]/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলা হচ্ছে...' : 'Deleting package...')
                  : `${languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলতে ত্রুটি:' : 'Error deleting package:'} ${deleteError?.status || 'unknown'}`}
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
        title={getModalContent().title}
        message={getModalContent().message}
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default CoachingPackages;