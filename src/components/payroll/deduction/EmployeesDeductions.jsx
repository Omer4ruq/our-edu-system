import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaList, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetDeductionTypesQuery } from '../../../redux/features/api/payroll/deductionTypesApi';
import { useCreateEmployeeDeductionMutation, useDeleteEmployeeDeductionMutation, useGetEmployeesDeductionsQuery, useUpdateEmployeeDeductionMutation } from '../../../redux/features/api/payroll/employeesDeductionsApi';
import { languageCode } from '../../../utilitis/getTheme';
import DraggableModal from '../../common/DraggableModal';
import selectStyles from '../../../utilitis/selectStyles';

const EmployeesDeductions = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deductionAmounts, setDeductionAmounts] = useState({});
  const [deductionDates, setDeductionDates] = useState({});
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [errors, setErrors] = useState({});

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_employeededuction') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_employeededuction') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_employeededuction') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_employeededuction') || false;

  // API Hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff, error: staffError } = useGetRoleStaffProfileApiQuery();
  const { data: deductionTypes = [], isLoading: isLoadingDeductions, error: deductionsError } = useGetDeductionTypesQuery();
  const { data: employeesDeductions = [], isLoading: isLoadingEmployeeDeductions, error: employeeDeductionsError, refetch } = useGetEmployeesDeductionsQuery();
  const [createEmployeeDeduction, { isLoading: isCreating, error: createError }] = useCreateEmployeeDeductionMutation();
  const [updateEmployeeDeduction, { isLoading: isUpdating, error: updateError }] = useUpdateEmployeeDeductionMutation();
  const [deleteEmployeeDeduction, { isLoading: isDeleting, error: deleteError }] = useDeleteEmployeeDeductionMutation();

  const isSubmitting = isCreating || isUpdating;

  // Get deductions for selected employee
  const selectedEmployeeDeductions = useMemo(() => {
    if (!selectedEmployee) return [];
    return employeesDeductions.filter(deduction => deduction.employee_id === selectedEmployee.id);
  }, [employeesDeductions, selectedEmployee]);

  // Get available deduction types
  const availableDeductionTypes = useMemo(() => {
    if (!selectedEmployee || !deductionTypes.length) return [];
    const assignedDeductionTypeIds = selectedEmployeeDeductions.map(deduction => deduction.deduction_type_id);
    return deductionTypes.filter(type => !assignedDeductionTypeIds.includes(type.id));
  }, [deductionTypes, selectedEmployeeDeductions, selectedEmployee]);

  // React-Select options
  const employeeOptions = staffProfiles.map(employee => ({
    value: employee.id,
    label: `${employee.name} (${employee.staff_id})`,
    employee,
  }));

  // Handle employee selection
  const handleEmployeeSelect = (option) => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'কর্মচারীর কর্তন দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view employee deductions.');
      return;
    }
    setSelectedEmployee(option ? option.employee : null);
    setDeductionAmounts({});
    setDeductionDates({});
    setEditingDeduction(null);
    setErrors({});
  };

  // Handle amount change
  const handleAmountChange = (deductionTypeId, amount) => {
    const parsedAmount = amount.trim() ? parseFloat(amount) : '';
    setDeductionAmounts(prev => ({
      ...prev,
      [deductionTypeId]: parsedAmount,
    }));
    if (errors[deductionTypeId]) {
      setErrors(prev => ({ ...prev, [deductionTypeId]: '' }));
    }
  };

  // Handle date change
  const handleDateChange = (deductionTypeId, date) => {
    setDeductionDates(prev => ({
      ...prev,
      [deductionTypeId]: date,
    }));
    if (errors[`date_${deductionTypeId}`]) {
      setErrors(prev => ({ ...prev, [`date_${deductionTypeId}`]: '' }));
    }
  };

  // Validate form
  const validateForm = (deductionTypeId, amount, date) => {
    const newErrors = {};
    if (!amount || amount <= 0) {
      newErrors[deductionTypeId] = languageCode === 'bn' ? 'বৈধ পরিমাণ লিখুন' : 'Please enter a valid amount';
    }
    // Only validate date if it exists (optional)
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      newErrors[`date_${deductionTypeId}`] = languageCode === 'bn' ? 'তারিখ YYYY-MM-DD ফরম্যাটে হতে হবে' : 'Date must be in YYYY-MM-DD format';
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Handle add deduction
  const handleAddDeduction = (deductionTypeId) => {
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'কর্তন তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create deductions.');
      return;
    }
    const amount = deductionAmounts[deductionTypeId];
    const date = deductionDates[deductionTypeId] || ''; // Optional date
    if (!validateForm(deductionTypeId, amount, date)) {
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      deduction_type_id: deductionTypeId,
      employee_id: selectedEmployee.id,
    };
    if (date) payload.effective_date = date; // Include date only if provided

    setModalAction('create');
    setModalData(payload);
    setIsModalOpen(true);
  };

  // Handle edit deduction
  const handleEditDeduction = (deduction) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'কর্তন সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit deductions.');
      return;
    }
    setEditingDeduction(deduction);
    setDeductionAmounts(prev => ({
      ...prev,
      [deduction.deduction_type_id]: deduction.amount,
    }));
    setDeductionDates(prev => ({
      ...prev,
      [deduction.deduction_type_id]: deduction.effective_date || '',
    }));
  };

  // Handle update deduction
  const handleUpdateDeduction = (deductionId, deductionTypeId) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'কর্তন সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit deductions.');
      return;
    }
    const amount = deductionAmounts[deductionTypeId];
    const date = deductionDates[deductionTypeId] || '';
    if (!validateForm(deductionTypeId, amount, date)) {
      return;
    }

    const payload = {
      id: deductionId,
      amount: parseFloat(amount),
      deduction_type_id: deductionTypeId,
      employee_id: selectedEmployee.id,
    };
    if (date) payload.effective_date = date;

    setModalAction('update');
    setModalData(payload);
    setIsModalOpen(true);
  };

  // Handle delete deduction
  const handleDeleteDeduction = (deductionId) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'কর্তন মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete deductions.');
      return;
    }
    setModalAction('delete');
    setModalData({ id: deductionId });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createEmployeeDeduction(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'কর্তন সফলভাবে তৈরি করা হয়েছে!' : 'Deduction created successfully!');
        setDeductionAmounts({});
        setDeductionDates({});
      } else if (modalAction === 'update') {
        await updateEmployeeDeduction(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'কর্তন সফলভাবে আপডেট করা হয়েছে!' : 'Deduction updated successfully!');
        setDeductionAmounts({});
        setDeductionDates({});
        setEditingDeduction(null);
      } else if (modalAction === 'delete') {
        await deleteEmployeeDeduction(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'কর্তন সফলভাবে মুছে ফেলা হয়েছে!' : 'Deduction deleted successfully!');
      }
      refetch();
    } catch (error) {
      console.error(`Error ${modalAction}:`, error);
      toast.error(`${languageCode === 'bn' ? 'কর্তন' : 'Deduction'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${error.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingDeduction(null);
    setDeductionAmounts({});
    setDeductionDates({});
    setErrors({});
  };

  // Get deduction type name
  const getDeductionTypeName = (deductionTypeId) => {
    const deductionType = deductionTypes.find(type => type.id === deductionTypeId);
    return deductionType ? deductionType.deduction_type : 'Unknown';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return languageCode === 'bn' ? 'কোনো তারিখ নেই' : 'No Date';
    const date = new Date(dateString);
    return date.toLocaleDateString(languageCode === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Permission-based Rendering
  if (permissionsLoading || isLoadingStaff || isLoadingDeductions) {
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

      {/* Main Content */}
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
            <div className="flex items-center space-x-4">
              <div className="bg-pmColor/20 p-3 rounded-xl">
                <FaList className="text-pmColor text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {languageCode === 'bn' ? 'কর্মচারী কর্তন পরিচালনা' : 'Employee Deductions Management'}
                </h1>
                <p className="text-white/70 mt-1">
                  {languageCode === 'bn' ? 'কর্মচারীদের জন্য পে-রোল কর্তন নিয়োগ এবং পরিচালনা করুন' : 'Assign and manage payroll deductions for employees'}
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
            {(staffError || deductionsError || employeeDeductionsError) && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
                <div className="text-red-400">
                  {staffError
                    ? `${languageCode === 'bn' ? 'কর্মচারী লোড করতে ত্রুটি:' : 'Error loading employees:'} ${staffError.status || 'unknown'}`
                    : deductionsError
                      ? `${languageCode === 'bn' ? 'কর্তন টাইপ লোড করতে ত্রুটি:' : 'Error loading deduction types:'} ${deductionsError.status || 'unknown'}`
                      : `${languageCode === 'bn' ? 'কর্মচারী কর্তন লোড করতে ত্রুটি:' : 'Error loading employee deductions:'} ${employeeDeductionsError.status || 'unknown'}`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Employee Details and Deductions */}
        {selectedEmployee && (
          <div className="space-y-8">
            {/* Employee Details */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
              <h3 className="text-xl font-semibold text-[#441a05]mb-4">
                {languageCode === 'bn' ? 'কর্মচারী বিবরণ' : 'Employee Details'}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-pmColor/20 flex items-center justify-center">
                  <span className="text-pmColor font-medium text-lg">
                    {selectedEmployee.name?.charAt(0)?.toUpperCase() || 'E'}
                  </span>
                </div>
                <div>
                  <div className="text-[#441a05]font-medium">{selectedEmployee.name}</div>
                  <div className="text-sm text-white/70">
                    {languageCode === 'bn' ? 'স্টাফ আইডি' : 'Staff ID'}: {selectedEmployee.staff_id}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Deductions Table */}
            {isLoadingEmployeeDeductions ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
                <p className="text-white/70">
                  {languageCode === 'bn' ? 'কর্তন লোড হচ্ছে...' : 'Loading deductions...'}
                </p>
              </div>
            ) : selectedEmployeeDeductions.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <div className="text-white/70">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    {languageCode === 'bn' ? 'কোনো কর্তন পাওয়া যায়নি' : 'No Deductions Found'}
                  </p>
                  <p className="text-sm mt-1">
                    {languageCode === 'bn' ? 'এই কর্মচারীর জন্য কোনো কর্তন নিয়োগ করা হয়নি।' : 'No deductions have been assigned to this employee.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-white/20">
                  <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
                    <FaList className="text-pmColor" />
                    <span>{languageCode === 'bn' ? 'বর্তমান কর্তন' : 'Current Deductions'} ({selectedEmployeeDeductions.length})</span>
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
                          {languageCode === 'bn' ? 'কর্তন টাইপ' : 'Deduction Type'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'কার্যকর তারিখ' : 'Effective Date'}
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {selectedEmployeeDeductions.map((deduction, index) => (
                        <tr
                          key={deduction.id}
                          className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{deduction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                                <span className="text-pmColor font-medium text-sm">
                                  {getDeductionTypeName(deduction.deduction_type_id)?.charAt(0)?.toUpperCase() || 'D'}
                                </span>
                              </div>
                              <div className="ml-4 text-sm font-medium text-white">
                                {getDeductionTypeName(deduction.deduction_type_id)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingDeduction?.id === deduction.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={deductionAmounts[deduction.deduction_type_id] || ''}
                                  onChange={(e) => handleAmountChange(deduction.deduction_type_id, e.target.value)}
                                  className={`w-24 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-[#441a05]placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[deduction.deduction_type_id] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                                    }`}
                                  placeholder={languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                                  min="0"
                                  step="0.01"
                                />
                                <input
                                  type="date"
                                  value={deductionDates[deduction.deduction_type_id] || ''}
                                  onChange={(e) => handleDateChange(deduction.deduction_type_id, e.target.value)}
                                  className={`w-40 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-[#441a05]placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[`date_${deduction.deduction_type_id}`] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                                    }`}
                                />
                                <button
                                  onClick={() => handleUpdateDeduction(deduction.id, deduction.deduction_type_id)}
                                  disabled={isSubmitting}
                                  className="bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-3 py-1 rounded-xl text-sm transition-all duration-300"
                                >
                                  {isUpdating ? (languageCode === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (languageCode === 'bn' ? 'আপডেট' : 'Update')}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 hover:bg-gray-600 text-[#441a05]px-3 py-1 rounded-xl text-sm transition-all duration-300"
                                >
                                  {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-white">-${deduction.amount.toFixed(2)}</span>
                            )}
                            {errors[deduction.deduction_type_id] && (
                              <p className="mt-1 text-sm text-red-400">{errors[deduction.deduction_type_id]}</p>
                            )}
                            {errors[`date_${deduction.deduction_type_id}`] && (
                              <p className="mt-1 text-sm text-red-400">{errors[`date_${deduction.deduction_type_id}`]}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatDate(deduction.effective_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingDeduction?.id !== deduction.id && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditDeduction(deduction)}
                                  disabled={isDeleting}
                                  className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                                  title={languageCode === 'bn' ? 'কর্তন সম্পাদনা করুন' : 'Edit deduction'}
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDeduction(deduction.id)}
                                  disabled={isDeleting}
                                  className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                                  title={languageCode === 'bn' ? 'কর্তন মুছুন' : 'Delete deduction'}
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            )}
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
                          ? `${languageCode === 'bn' ? 'কর্তন তৈরিতে ত্রুটি:' : 'Error creating deduction:'} ${createError.status || 'unknown'}`
                          : updateError
                            ? `${languageCode === 'bn' ? 'কর্তন আপডেটে ত্রুটি:' : 'Error updating deduction:'} ${updateError.status || 'unknown'}`
                            : `${languageCode === 'bn' ? 'কর্তন মুছে ফেলার ত্রুটি:' : 'Error deleting deduction:'} ${deleteError.status || 'unknown'}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Available Deductions to Add */}
            {hasAddPermission && availableDeductionTypes.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-pmColor/20 rounded-xl">
                    <IoAddCircle className="text-pmColor text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {languageCode === 'bn' ? 'নতুন কর্তন যোগ করুন' : 'Add New Deductions'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDeductionTypes.map((deductionType) => (
                    <div key={deductionType.id} className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{deductionType.deduction_type}</h4>
                        <p className="text-sm text-white/70">
                          {deductionType.is_every_month
                            ? (languageCode === 'bn' ? 'প্রতি মাসে' : 'Monthly')
                            : (languageCode === 'bn' ? 'এককালীন' : 'One-time')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={deductionAmounts[deductionType.id] || ''}
                          onChange={(e) => handleAmountChange(deductionType.id, e.target.value)}
                          className={`w-24 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-[#441a05]placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[deductionType.id] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                            }`}
                          placeholder={languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="date"
                          value={deductionDates[deductionType.id] || ''}
                          onChange={(e) => handleDateChange(deductionType.id, e.target.value)}
                          className={`w-40 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-[#441a05]placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[`date_${deductionType.id}`] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                            }`}
                        />
                        <button
                          onClick={() => handleAddDeduction(deductionType.id)}
                          disabled={isCreating || !deductionAmounts[deductionType.id]}
                          className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-3 py-2 rounded-xl text-sm transition-all duration-300 ${isCreating || !deductionAmounts[deductionType.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                        >
                          {isCreating ? (languageCode === 'bn' ? 'যোগ করা হচ্ছে...' : 'Adding...') : (languageCode === 'bn' ? 'যোগ করুন' : 'Add')}
                        </button>
                      </div>
                      {errors[deductionType.id] && (
                        <p className="mt-1 text-sm text-red-400">{errors[deductionType.id]}</p>
                      )}
                      {errors[`date_${deductionType.id}`] && (
                        <p className="mt-1 text-sm text-red-400">{errors[`date_${deductionType.id}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Available Deductions */}
            {availableDeductionTypes.length === 0 && selectedEmployeeDeductions.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <div className="text-white/70">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    {languageCode === 'bn' ? 'সমস্ত কর্তন টাইপ নিয়োগ করা হয়েছে' : 'All Deduction Types Assigned'}
                  </p>
                  <p className="text-sm mt-1">
                    {languageCode === 'bn' ? 'এই কর্মচারীর জন্য সমস্ত উপলব্ধ কর্তন টাইপ নিয়োগ করা হয়েছে।' : 'This employee has been assigned all available deduction types.'}
                  </p>
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            {selectedEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                      <FaList className="text-2xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        {languageCode === 'bn' ? 'মোট কর্তন' : 'Total Deductions'}
                      </p>
                      <p className="text-2xl font-bold text-white">{selectedEmployeeDeductions.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-500/20 text-orange-500">
                      <span className="text-2xl">$</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        {languageCode === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        -${selectedEmployeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
                      <FaList className="text-2xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">
                        {languageCode === 'bn' ? 'উপলব্ধ টাইপ' : 'Available Types'}
                      </p>
                      <p className="text-2xl font-bold text-white">{availableDeductionTypes.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Deductions at All */}
            {selectedEmployeeDeductions.length === 0 && availableDeductionTypes.length === 0 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
                <div className="text-white/70">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">
                    {languageCode === 'bn' ? 'কোনো কর্তন টাইপ উপলব্ধ নেই' : 'No Deduction Types Available'}
                  </p>
                  <p className="text-sm mt-1">
                    {languageCode === 'bn' ? 'কর্মচারীদের নিয়োগ করার আগে কর্তন টাইপ তৈরি করুন।' : 'Please create deduction types first before assigning them to employees.'}
                  </p>
                </div>
              </div>
            )}
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
            ? (languageCode === 'bn' ? 'নতুন কর্তন নিশ্চিত করুন' : 'Confirm New Deduction')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'কর্তন আপডেট নিশ্চিত করুন' : 'Confirm Deduction Update')
              : (languageCode === 'bn' ? 'কর্তন মুছে ফেলা নিশ্চিত করুন' : 'Confirm Deduction Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন কর্তন তৈরি করতে চান?' : 'Are you sure you want to create a new deduction?')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই কর্তন আপডেট করতে চান?' : 'Are you sure you want to update this deduction?')
              : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই কর্তনটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this deduction?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default EmployeesDeductions;