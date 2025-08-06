import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaList, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useCreateSalaryIncrementMutation, useDeleteSalaryIncrementMutation, useGetSalaryIncrementsQuery, useUpdateSalaryIncrementMutation } from '../../../redux/features/api/payroll/salaryIncrementsApi';
import { languageCode } from '../../../utilitis/getTheme';
import DraggableModal from '../../common/DraggableModal';
import selectStyles from '../../../utilitis/selectStyles';

const SalaryIncrements = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    is_percentage: true,
    increment_amount: '',
    effective_month: '',
  });
  const [editingIncrement, setEditingIncrement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [errors, setErrors] = useState({});

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_salaryincrement') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_salaryincrement') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_salaryincrement') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_salaryincrement') || false;

  // API Hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff, error: staffError } = useGetRoleStaffProfileApiQuery();
  const { data: salaryIncrements = [], isLoading: isLoadingIncrements, error: incrementsError, refetch } = useGetSalaryIncrementsQuery();
  const [createSalaryIncrement, { isLoading: isCreating, error: createError }] = useCreateSalaryIncrementMutation();
  const [updateSalaryIncrement, { isLoading: isUpdating, error: updateError }] = useUpdateSalaryIncrementMutation();
  const [deleteSalaryIncrement, { isLoading: isDeleting, error: deleteError }] = useDeleteSalaryIncrementMutation();

  const isSubmitting = isCreating || isUpdating;

  // Get increments for selected employee
  const selectedEmployeeIncrements = useMemo(() => {
    if (!selectedEmployee) return [];
    return salaryIncrements.filter(increment => increment.employee === selectedEmployee.id);
  }, [salaryIncrements, selectedEmployee]);

  // React-Select options
  const employeeOptions = staffProfiles.map(employee => ({
    value: employee.id,
    label: `${employee.name} (${employee.staff_id})`,
    employee,
  }));

  // Handle employee selection
  const handleEmployeeSelect = (option) => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'বেতন বৃদ্ধি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view salary increments.');
      return;
    }
    setSelectedEmployee(option ? option.employee : null);
    setFormData({
      is_percentage: true,
      increment_amount: '',
      effective_month: '',
    });
    setEditingIncrement(null);
    setErrors({});
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.increment_amount || formData.increment_amount <= 0) {
      newErrors.increment_amount = languageCode === 'bn' ? 'বৈধ বৃদ্ধির পরিমাণ লিখুন' : 'Please enter a valid increment amount';
    }
    if (formData.is_percentage && formData.increment_amount > 100) {
      newErrors.increment_amount = languageCode === 'bn' ? 'শতাংশ ১০০% এর বেশি হতে পারে না' : 'Percentage cannot exceed 100%';
    }
    if (!formData.effective_month) {
      newErrors.effective_month = languageCode === 'bn' ? 'কার্যকর মাস নির্বাচন করুন' : 'Please select an effective month';
    } else {
      // Validate date format (YYYY-MM-DD)
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(formData.effective_month)) {
        newErrors.effective_month = 'Date must be in YYYY-MM-DD format';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasAddPermission && !editingIncrement) {
      toast.error(languageCode === 'bn' ? 'বেতন বৃদ্ধি তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create salary increments.');
      return;
    }
    if (!hasChangePermission && editingIncrement) {
      toast.error(languageCode === 'bn' ? 'বেতন বৃদ্ধি সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit salary increments.');
      return;
    }
    if (!validateForm()) {
      return;
    }

    const incrementData = {
      employee: selectedEmployee.id,
      is_percentage: formData.is_percentage,
      increment_amount: parseFloat(formData.increment_amount),
      effective_month: formData.effective_month,
    };

    setModalAction(editingIncrement ? 'update' : 'create');
    setModalData(editingIncrement ? { id: editingIncrement.id, ...incrementData } : incrementData);
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (increment) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'বেতন বৃদ্ধি সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit salary increments.');
      return;
    }
    setEditingIncrement(increment);
    setFormData({
      is_percentage: increment.is_percentage,
      increment_amount: increment.increment_amount,
      effective_month: increment.effective_month,
    });
  };

  // Handle delete
  const handleDelete = (incrementId) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'বেতন বৃদ্ধি মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete salary increments.');
      return;
    }
    setModalAction('delete');
    setModalData({ id: incrementId });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createSalaryIncrement(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'বেতন বৃদ্ধি সফলভাবে তৈরি করা হয়েছে!' : 'Salary increment created successfully!');
        setFormData({
          is_percentage: true,
          increment_amount: '',
          effective_month: '',
        });
        setEditingIncrement(null);
      } else if (modalAction === 'update') {
        await updateSalaryIncrement(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'বেতন বৃদ্ধি সফলভাবে আপডেট করা হয়েছে!' : 'Salary increment updated successfully!');
        setFormData({
          is_percentage: true,
          increment_amount: '',
          effective_month: '',
        });
        setEditingIncrement(null);
      } else if (modalAction === 'delete') {
        await deleteSalaryIncrement(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'বেতন বৃদ্ধি সফলভাবে মুছে ফেলা হয়েছে!' : 'Salary increment deleted successfully!');
      }
      refetch();
    } catch (error) {
      console.error(`Error ${modalAction}:`, error);
      toast.error(`${languageCode === 'bn' ? 'বেতন বৃদ্ধি' : 'Salary increment'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${error.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Format increment for display
  const formatIncrement = (increment) => {
    return increment.is_percentage ? `${increment.increment_amount}%` : `$${increment.increment_amount.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(languageCode === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Permission-based Rendering
  if (permissionsLoading || isLoadingStaff || isLoadingIncrements) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-white">
            {languageCode === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
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

      {/* Main Content */}
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
            <div className="flex items-center space-x-4">
              <div className="bg-pmColor/20 p-3 rounded-xl">
                <FaList className="text-pmColor text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {languageCode === 'bn' ? 'বেতন বৃদ্ধি পরিচালনা' : 'Salary Increments Management'}
                </h1>
                <p className="text-white/70 mt-1">
                  {languageCode === 'bn' ? 'কর্মচারীদের জন্য বেতন বৃদ্ধি নিয়োগ এবং পরিচালনা করুন' : 'Assign and manage salary increments for employees'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-pmColor/20 p-3 rounded-xl">
                <FaList className="text-pmColor text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {languageCode === 'bn' ? 'কর্মচারী নির্বাচন করুন' : 'Select Employee'}
              </h3>
            </div>
            <Select
              value={employeeOptions.find(opt => opt.value === selectedEmployee?.id) || null}
              onChange={handleEmployeeSelect}
              options={employeeOptions}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              placeholder={languageCode === 'bn' ? 'কর্মচারী নির্বাচন করুন' : 'Select Employee'}
              isClearable
              isDisabled={isSubmitting}
            />
            {(staffError || incrementsError) && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
                <div className="text-red-400">
                  {staffError
                    ? `${languageCode === 'bn' ? 'কর্মচারী লোড করতে ত্রুটি:' : 'Error loading employees:'} ${staffError.status || 'unknown'}`
                    : `${languageCode === 'bn' ? 'বেতন বৃদ্ধি লোড করতে ত্রুটি:' : 'Error loading salary increments:'} ${incrementsError.status || 'unknown'}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Employee Details and Increments */}
        {selectedEmployee && (
          <div className="space-y-8">
            {/* Employee Details */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
              <h3 className="text-xl font-semibold text-white mb-4">
                {languageCode === 'bn' ? 'কর্মচারী বিবরণ' : 'Employee Details'}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-pmColor/20 flex items-center justify-center">
                  <span className="text-pmColor font-medium text-lg">
                    {selectedEmployee.name?.charAt(0)?.toUpperCase() || 'E'}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{selectedEmployee.name}</div>
                  <div className="text-sm text-white/70">
                    {languageCode === 'bn' ? 'স্টাফ আইডি' : 'Staff ID'}: {selectedEmployee.staff_id}
                  </div>
                </div>
              </div>
            </div>

            {/* Increment Form */}
            {hasAddPermission && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-pmColor/20 rounded-xl">
                  <IoAddCircle className="text-pmColor text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {editingIncrement
                    ? (languageCode === 'bn' ? 'বেতন বৃদ্ধি সম্পাদনা করুন' : 'Edit Salary Increment')
                    : (languageCode === 'bn' ? 'নতুন বেতন বৃদ্ধি যোগ করুন' : 'Add New Salary Increment')}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {languageCode === 'bn' ? 'বৃদ্ধির ধরন' : 'Increment Type'}
                    </label>
                    <label className="inline-flex items-center cursor-pointer gap-2">
                      {/* Hidden checkbox */}
                      <input
                        type="checkbox"
                        name="is_percentage"
                        checked={formData.is_percentage}
                        onChange={handleInputChange}
                        className="hidden"
                      />

                      {/* Custom checkbox box */}
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${formData.is_percentage
                            ? "bg-pmColor border-pmColor"
                            : "bg-white/10 border-white/20 hover:border-white"
                          }`}
                      >
                        {formData.is_percentage && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Label text */}
                      <span className="text-white">
                        {languageCode === "bn" ? "শতাংশ" : "Percentage"}
                      </span>
                    </label>

                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {languageCode === 'bn' ? 'বৃদ্ধির পরিমাণ' : 'Increment Amount'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="increment_amount"
                        value={formData.increment_amount}
                        onChange={handleInputChange}
                        className={`w-full bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300 ${errors.increment_amount ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                          }`}
                        placeholder={formData.is_percentage ? 'e.g., 5%' : 'e.g., 500'}
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
                        {formData.is_percentage ? '%' : '$'}
                      </span>
                    </div>
                    {errors.increment_amount && (
                      <p className="mt-1 text-sm text-red-400">{errors.increment_amount}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {languageCode === 'bn' ? 'কার্যকর মাস' : 'Effective Month'}
                    </label>
                    <input
                      type="date"
                      name="effective_month"
                      value={formData.effective_month}
                      onChange={handleInputChange}
                      className={`w-full bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300 ${errors.effective_month ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                        }`}
                    />
                    {errors.effective_month && (
                      <p className="mt-1 text-sm text-red-400">{errors.effective_month}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  {editingIncrement && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIncrement(null);
                        setFormData({
                          is_percentage: true,
                          increment_amount: '',
                          effective_month: '',
                        });
                        setErrors({});
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300"
                    >
                      {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-pmColor hover:bg-pmColor/80 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                  >
                    {isSubmitting
                      ? (languageCode === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                      : editingIncrement
                        ? (languageCode === 'bn' ? 'আপডেট' : 'Update')
                        : (languageCode === 'bn' ? 'যোগ করুন' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
            )}

            {/* Current Increments Table */}
            {isLoadingIncrements ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
                <p className="text-white/70">
                  {languageCode === 'bn' ? 'বেতন বৃদ্ধি লোড হচ্ছে...' : 'Loading increments...'}
                </p>
              </div>
            ) : selectedEmployeeIncrements.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <div className="text-white/70">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    {languageCode === 'bn' ? 'কোনো বেতন বৃদ্ধি নেই' : 'No Salary Increments'}
                  </p>
                  <p className="text-sm mt-1">
                    {languageCode === 'bn' ? 'এই কর্মচারীর জন্য কোনো বেতন বৃদ্ধির ইতিহাস নেই।' : 'This employee has no salary increment history.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-white/20">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <FaList className="text-pmColor" />
                    <span>{languageCode === 'bn' ? 'বর্তমান বেতন বৃদ্ধি' : 'Current Salary Increments'} ({selectedEmployeeIncrements.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'আইডি' : 'ID'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'ধরন' : 'Type'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'কার্যকর মাস' : 'Effective Month'}
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {selectedEmployeeIncrements.map((increment, index) => (
                        <tr
                          key={increment.id}
                          className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{increment.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${increment.is_percentage ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                }`}
                            >
                              {increment.is_percentage
                                ? (languageCode === 'bn' ? 'শতাংশ' : 'Percentage')
                                : (languageCode === 'bn' ? 'নির্দিষ্ট পরিমাণ' : 'Fixed Amount')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                            {formatIncrement(increment)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatDate(increment.effective_month)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {hasChangePermission && (
                              <button
                                onClick={() => handleEdit(increment)}
                                disabled={isDeleting}
                                className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                                title={languageCode === 'bn' ? 'বৃদ্ধি সম্পাদনা করুন' : 'Edit increment'}
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              )}
                              {hasDeletePermission && (
                              <button
                                onClick={() => handleDelete(increment.id)}
                                disabled={isDeleting}
                                className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                                title={languageCode === 'bn' ? 'বৃদ্ধি মুছুন' : 'Delete increment'}
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(createError || updateError || deleteError) && (
                  <div className="p-4 border-t border-white/20">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="text-red-400">
                        {createError
                          ? `${languageCode === 'bn' ? 'বেতন বৃদ্ধি তৈরিতে ত্রুটি:' : 'Error creating increment:'} ${createError.status || 'unknown'}`
                          : updateError
                            ? `${languageCode === 'bn' ? 'বেতন বৃদ্ধি আপডেটে ত্রুটি:' : 'Error updating increment:'} ${updateError.status || 'unknown'}`
                            : `${languageCode === 'bn' ? 'বেতন বৃদ্ধি মুছে ফেলার ত্রুটি:' : 'Error deleting increment:'} ${deleteError.status || 'unknown'}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* Summary Statistics */}
      {selectedEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                <FaList className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'মোট বৃদ্ধি' : 'Total Increments'}
                </p>
                <p className="text-2xl font-bold text-white">{selectedEmployeeIncrements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                <FaList className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'শতাংশ বৃদ্ধি' : 'Percentage Increases'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {selectedEmployeeIncrements.filter(inc => inc.is_percentage).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
                <FaList className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'নির্দিষ্ট বৃদ্ধি' : 'Fixed Increases'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {selectedEmployeeIncrements.filter(inc => !inc.is_percentage).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
                <FaList className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'সর্বশেষ বৃদ্ধি' : 'Latest Increment'}
                </p>
                <p className="text-lg font-bold text-white">
                  {selectedEmployeeIncrements.length > 0
                    ? formatDate(
                      selectedEmployeeIncrements.sort((a, b) => new Date(b.effective_month) - new Date(a.effective_month))[0].effective_month
                    )
                    : languageCode === 'bn' ? 'কোনোটি নেই' : 'None'}
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
            ? (languageCode === 'bn' ? 'নতুন বেতন বৃদ্ধি নিশ্চিত করুন' : 'Confirm New Salary Increment')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'বেতন বৃদ্ধি আপডেট নিশ্চিত করুন' : 'Confirm Salary Increment Update')
              : (languageCode === 'bn' ? 'বেতন বৃদ্ধি মুছে ফেলা নিশ্চিত করুন' : 'Confirm Salary Increment Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন বেতন বৃদ্ধি তৈরি করতে চান?' : 'Are you sure you want to create a new salary increment?')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই বেতন বৃদ্ধি আপডেট করতে চান?' : 'Are you sure you want to update this salary increment?')
              : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই বেতন বৃদ্ধিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this salary increment?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
      </div>
  );
};

export default SalaryIncrements;