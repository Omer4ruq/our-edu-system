import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { languageCode } from '../../../utilitis/getTheme';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useCreateAdditionTypeMutation, useDeleteAdditionTypeMutation, useGetAdditionTypesQuery, useUpdateAdditionTypeMutation } from '../../../redux/features/api/payroll/additionTypesApi';
import DraggableModal from '../../common/DraggableModal';
import selectStyles from '../../../utilitis/selectStyles';

const AddAddition = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    addition_type: '',
    is_every_month: { value: false, label: languageCode === 'bn' ? 'না' : 'No' },
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_additiontype') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_additiontype') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_additiontype') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_additiontype') || false;

  // API Hooks
  const { data: additionTypes = [], isLoading: isLoadingTypes, error: fetchError, refetch } = useGetAdditionTypesQuery();
  const [createAdditionType, { isLoading: isCreating, error: createError }] = useCreateAdditionTypeMutation();
  const [updateAdditionType, { isLoading: isUpdating, error: updateError }] = useUpdateAdditionTypeMutation();
  const [deleteAdditionType, { isLoading: isDeleting, error: deleteError }] = useDeleteAdditionTypeMutation();

  const isSubmitting = isCreating || isUpdating;

  // React-Select options
  const isEveryMonthOptions = [
    { value: true, label: languageCode === 'bn' ? 'হ্যাঁ' : 'Yes' },
    { value: false, label: languageCode === 'bn' ? 'না' : 'No' },
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.addition_type.trim()) {
      newErrors.addition_type = languageCode === 'bn' ? 'অ্যাডিশন টাইপ প্রয়োজন' : 'Addition type is required';
    }
    if (additionTypes.some(type => type.addition_type.toLowerCase() === formData.addition_type.trim().toLowerCase() && type.id !== editingId)) {
      newErrors.addition_type = languageCode === 'bn' ? 'এই অ্যাডিশন টাইপ ইতিমধ্যে বিদ্যমান!' : 'This addition type already exists!';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasAddPermission && !editingId) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন টাইপ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create addition types.');
      return;
    }
    if (!hasChangePermission && editingId) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন টাইপ সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit addition types.');
      return;
    }
    if (!validateForm()) {
      return;
    }

    setModalAction(editingId ? 'update' : 'create');
    setModalData({
      id: editingId,
      addition_type: formData.addition_type.trim(),
      is_every_month: formData.is_every_month.value,
    });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createAdditionType(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন টাইপ সফলভাবে তৈরি করা হয়েছে!' : 'Addition type created successfully!');
      } else if (modalAction === 'update') {
        await updateAdditionType(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন টাইপ সফলভাবে আপডেট করা হয়েছে!' : 'Addition type updated successfully!');
      } else if (modalAction === 'delete') {
        await deleteAdditionType(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন টাইপ সফলভাবে মুছে ফেলা হয়েছে!' : 'Addition type deleted successfully!');
      }
      resetForm();
      setShowForm(false);
      refetch();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'অ্যাডিশন টাইপ' : 'Addition type'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      addition_type: '',
      is_every_month: { value: false, label: languageCode === 'bn' ? 'না' : 'No' },
    });
    setEditingId(null);
    setErrors({});
  };

  // Handle edit
  const handleEdit = (additionType) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন টাইপ সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit addition types.');
      return;
    }
    setFormData({
      addition_type: additionType.addition_type,
      is_every_month: isEveryMonthOptions.find(opt => opt.value === additionType.is_every_month) || { value: false, label: languageCode === 'bn' ? 'না' : 'No' },
    });
    setEditingId(additionType.id);
    setShowForm(true);
    setErrors({});
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন টাইপ মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete addition types.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Handle add new
  const handleAddNew = () => {
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন টাইপ তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create addition types.');
      return;
    }
    resetForm();
    setShowForm(true);
  };

  // Permission-based Rendering
  if (permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-white">
            {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <div className="text-secColor text-xl font-semibold">
            {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 w-full mx-auto">
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
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {languageCode === 'bn' ? 'অ্যাডিশন টাইপ পরিচালনা' : 'Addition Types Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'পে-রোল অ্যাডিশন টাইপ এবং তাদের বিবরণ পরিচালনা করুন' : 'Manage payroll addition types and their details'}
            </p>
          </div>
        </div>
      </div>

  
     

      {/* Form Section */}
      {hasAddPermission && showForm && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              <IoAddCircle className="text-pmColor text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editingId
                ? (languageCode === 'bn' ? 'অ্যাডিশন টাইপ সম্পাদনা করুন' : 'Edit Addition Type')
                : (languageCode === 'bn' ? 'নতুন অ্যাডিশন টাইপ তৈরি করুন' : 'Create New Addition Type')}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'অ্যাডিশন টাইপ *' : 'Addition Type *'}
              </label>
              <input
                type="text"
                value={formData.addition_type}
                onChange={(e) => handleInputChange('addition_type', e.target.value)}
                className={`w-full bg-white/10 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none transition-all duration-300 ${
                  errors.addition_type ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                }`}
                placeholder={languageCode === 'bn' ? 'অ্যাডিশন টাইপ লিখুন' : 'Enter addition type'}
                disabled={isSubmitting}
              />
              {errors.addition_type && (
                <p className="mt-1 text-sm text-red-400">{errors.addition_type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'প্রতি মাসে' : 'Every Month'}
              </label>
              <Select
                value={formData.is_every_month}
                onChange={(option) => handleInputChange('is_every_month', option)}
                options={isEveryMonthOptions}
                 styles={selectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                placeholder={languageCode === 'bn' ? 'প্রতি মাসে নির্বাচন করুন' : 'Select Every Month'}
                isDisabled={isSubmitting}
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{editingId ? (languageCode === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (languageCode === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...')}</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>{editingId ? (languageCode === 'bn' ? 'আপডেট করুন' : 'Update') : (languageCode === 'bn' ? 'তৈরি করুন' : 'Create')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>

          {(createError || updateError) && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {createError
                  ? `${languageCode === 'bn' ? 'অ্যাডিশন টাইপ তৈরিতে ত্রুটি:' : 'Error creating addition type:'} ${createError.status || 'unknown'}`
                  : `${languageCode === 'bn' ? 'অ্যাডিশন টাইপ আপডেটে ত্রুটি:' : 'Error updating addition type:'} ${updateError.status || 'unknown'}`}
              </div>
            </div>
          )}
        </div>
       )} 

      {/* Table Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <FaList className="text-pmColor" />
              <span>{languageCode === 'bn' ? 'অ্যাডিশন টাইপ তালিকা' : 'Addition Types List'} ({additionTypes.length})</span>
            </h2>
            {hasAddPermission && !showForm && (
              <button
                onClick={handleAddNew}
                className="bg-pmColor hover:bg-pmColor/80 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
              >
                <FaPlus />
                <span>{languageCode === 'bn' ? 'নতুন অ্যাডিশন টাইপ যোগ করুন' : 'Add New Addition Type'}</span>
              </button>
            )}
          </div>
        </div>

        {isLoadingTypes ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
            <p className="text-white/70">
              {languageCode === 'bn' ? 'অ্যাডিশন টাইপ লোড হচ্ছে...' : 'Loading addition types...'}
            </p>
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400">
                {languageCode === 'bn' ? 'অ্যাডিশন টাইপ লোড করতে ত্রুটি:' : 'Error loading addition types:'} {fetchError.status || 'unknown'}
              </p>
              <button
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-pmColor text-white rounded-xl hover:bg-pmColor/80 transition-all"
              >
                {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </button>
            </div>
          </div>
        ) : additionTypes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-white/70 text-xl mb-2">💼</div>
            <p className="text-white/70">
              {languageCode === 'bn' ? 'কোনো অ্যাডিশন টাইপ পাওয়া যায়নি। উপরে আপনার প্রথম টাইপ তৈরি করুন!' : 'No addition types found. Create your first type above!'}
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
                    {languageCode === 'bn' ? 'অ্যাডিশন টাইপ' : 'Addition Type'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্রতি মাসে' : 'Every Month'}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {additionTypes.map((additionType, index) => (
                  <tr
                    key={additionType.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{additionType.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                          <span className="text-pmColor font-medium text-sm">
                            {additionType.addition_type?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="ml-4 text-sm font-medium text-white">{additionType.addition_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          additionType.is_every_month
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {additionType.is_every_month
                          ? (languageCode === 'bn' ? 'হ্যাঁ' : 'Yes')
                          : (languageCode === 'bn' ? 'না' : 'No')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* {hasChangePermission && ( */}
                          <button
                            onClick={() => handleEdit(additionType)}
                            disabled={isDeleting}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'অ্যাডিশন টাইপ সম্পাদনা করুন' : 'Edit addition type'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        {/* )} */}
                        {/* {hasDeletePermission && ( */}
                          <button
                            onClick={() => handleDelete(additionType.id)}
                            disabled={isDeleting}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'অ্যাডিশন টাইপ মুছুন' : 'Delete addition type'}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        {/* )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        

        {(isDeleting || deleteError) && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'অ্যাডিশন টাইপ মুছে ফেলা হচ্ছে...' : 'Deleting addition type...')
                  : `${languageCode === 'bn' ? 'অ্যাডিশন টাইপ মুছে ফেলার ত্রুটি:' : 'Error deleting addition type:'} ${deleteError?.status || 'unknown'}`}
              </div>
            </div>
          </div>
        )}
      </div>


    {/* Statistics Cards */}
       {additionTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pmColor/20 text-pmColor">
                <FaList className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'মোট অ্যাডিশন টাইপ' : 'Total Addition Types'}
                </p>
                <p className="text-2xl font-bold text-white">{additionTypes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                <span className="text-2xl">✔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'প্রতি মাসে' : 'Every Month'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {additionTypes.filter(type => type.is_every_month).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'নতুন অ্যাডিশন টাইপ নিশ্চিত করুন' : 'Confirm New Addition Type')
            : modalAction === 'update'
            ? (languageCode === 'bn' ? 'অ্যাডিশন টাইপ আপডেট নিশ্চিত করুন' : 'Confirm Addition Type Update')
            : (languageCode === 'bn' ? 'অ্যাডিশন টাইপ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Addition Type Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন অ্যাডিশন টাইপ তৈরি করতে চান?' : 'Are you sure you want to create a new addition type?')
            : modalAction === 'update'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই অ্যাডিশন টাইপ আপডেট করতে চান?' : 'Are you sure you want to update this addition type?')
            : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই অ্যাডিশন টাইপটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this addition type?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default AddAddition;