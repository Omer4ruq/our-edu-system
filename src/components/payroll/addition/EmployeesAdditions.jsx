import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';;
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useCreateEmployeeAdditionMutation, useDeleteEmployeeAdditionMutation, useGetEmployeesAdditionsQuery, useUpdateEmployeeAdditionMutation } from '../../../redux/features/api/payroll/employeesAdditionsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetAdditionTypesQuery } from '../../../redux/features/api/payroll/additionTypesApi';
import { languageCode } from '../../../utilitis/getTheme';
import DraggableModal from '../../common/DraggableModal';
import selectStyles from '../../../utilitis/selectStyles';

const EmployeesAdditions = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [additionAmounts, setAdditionAmounts] = useState({});
  const [editingAddition, setEditingAddition] = useState(null);
  const [showAdditionForm, setShowAdditionForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [errors, setErrors] = useState({});

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_employeeaddition') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_employeeaddition') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_employeeaddition') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_employeeaddition') || false;

  // API Hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff, error: staffError } = useGetRoleStaffProfileApiQuery();
  const { data: additionTypes = [], isLoading: isLoadingAdditions, error: additionsError } = useGetAdditionTypesQuery();
  const { data: employeesAdditions = [], isLoading: isLoadingEmployeeAdditions, error: employeeAdditionsError, refetch } = useGetEmployeesAdditionsQuery();
  const [createEmployeeAddition, { isLoading: isCreating, error: createError }] = useCreateEmployeeAdditionMutation();
  const [updateEmployeeAddition, { isLoading: isUpdating, error: updateError }] = useUpdateEmployeeAdditionMutation();
  const [deleteEmployeeAddition, { isLoading: isDeleting, error: deleteError }] = useDeleteEmployeeAdditionMutation();

  const isSubmitting = isCreating || isUpdating;

  // Get additions for selected employee
  const selectedEmployeeAdditions = useMemo(() => {
    if (!selectedEmployee) return [];
    return employeesAdditions.filter(addition => addition.employee_id === selectedEmployee.id);
  }, [employeesAdditions, selectedEmployee]);

  // Get available addition types
  const availableAdditionTypes = useMemo(() => {
    if (!selectedEmployee || !additionTypes.length) return [];
    const assignedAdditionTypeIds = selectedEmployeeAdditions.map(addition => addition.addition_type_id);
    return additionTypes.filter(type => !assignedAdditionTypeIds.includes(type.id));
  }, [additionTypes, selectedEmployeeAdditions, selectedEmployee]);

  // React-Select options
  const employeeOptions = staffProfiles.map(employee => ({
    value: employee.id,
    label: `${employee.name} (${employee.staff_id})`,
    employee,
  }));

  // Handle employee selection
  const handleEmployeeSelect = (option) => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'কর্মচারীর অ্যাডিশন দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view employee additions.');
      return;
    }
    setSelectedEmployee(option ? option.employee : null);
    setAdditionAmounts({});
    setEditingAddition(null);
    setShowAdditionForm(false);
    setErrors({});
  };

  // Handle amount change
  const handleAmountChange = (additionTypeId, amount) => {
    const parsedAmount = amount.trim() ? parseFloat(amount) : '';
    setAdditionAmounts(prev => ({
      ...prev,
      [additionTypeId]: parsedAmount,
    }));
    if (errors[additionTypeId]) {
      setErrors(prev => ({ ...prev, [additionTypeId]: '' }));
    }
  };

  // Validate amount
  const validateAmount = (additionTypeId, amount) => {
    const newErrors = {};
    if (!amount || amount <= 0) {
      newErrors[additionTypeId] = languageCode === 'bn' ? 'বৈধ পরিমাণ লিখুন' : 'Please enter a valid amount';
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Handle add addition
  const handleAddAddition = (additionTypeId) => {
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create additions.');
      return;
    }
    const amount = additionAmounts[additionTypeId];
    if (!validateAmount(additionTypeId, amount)) {
      return;
    }

    setModalAction('create');
    setModalData({
      amount: parseFloat(amount),
      addition_type_id: additionTypeId,
      employee_id: selectedEmployee.id,
    });
    setIsModalOpen(true);
  };

  // Handle edit addition
  const handleEditAddition = (addition) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit additions.');
      return;
    }
    setEditingAddition(addition);
    setAdditionAmounts(prev => ({
      ...prev,
      [addition.addition_type_id]: addition.amount,
    }));
  };

  // Handle update addition
  const handleUpdateAddition = (additionId, additionTypeId) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit additions.');
      return;
    }
    const amount = additionAmounts[additionTypeId];
    if (!validateAmount(additionTypeId, amount)) {
      return;
    }

    setModalAction('update');
    setModalData({
      id: additionId,
      amount: parseFloat(amount),
      addition_type_id: additionTypeId,
      employee_id: selectedEmployee.id,
    });
    setIsModalOpen(true);
  };

  // Handle delete addition
  const handleDeleteAddition = (additionId) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'অ্যাডিশন মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete additions.');
      return;
    }
    setModalAction('delete');
    setModalData({ id: additionId });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createEmployeeAddition(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন সফলভাবে তৈরি করা হয়েছে!' : 'Addition created successfully!');
        setAdditionAmounts(prev => ({
          ...prev,
          [modalData.addition_type_id]: '',
        }));
      } else if (modalAction === 'update') {
        await updateEmployeeAddition(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন সফলভাবে আপডেট করা হয়েছে!' : 'Addition updated successfully!');
        setEditingAddition(null);
      } else if (modalAction === 'delete') {
        await deleteEmployeeAddition(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'অ্যাডিশন সফলভাবে মুছে ফেলা হয়েছে!' : 'Addition deleted successfully!');
      }
      refetch();
    } catch (error) {
      console.error(`Error ${modalAction}:`, error);
      toast.error(`${languageCode === 'bn' ? 'অ্যাডিশন' : 'Addition'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${error.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAddition(null);
    setAdditionAmounts(prev => {
      const updated = { ...prev };
      if (editingAddition) {
        delete updated[editingAddition.addition_type_id];
      }
      return updated;
    });
    setErrors({});
  };

  // Get addition type name
  const getAdditionTypeName = (additionTypeId) => {
    const additionType = additionTypes.find(type => type.id === additionTypeId);
    return additionType ? additionType.addition_type : 'Unknown';
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
              {languageCode === 'bn' ? 'কর্মচারী অ্যাডিশন পরিচালনা' : 'Employee Additions Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'কর্মচারীদের জন্য পে-রোল অ্যাডিশন নিয়োগ এবং পরিচালনা করুন' : 'Assign and manage payroll additions for employees'}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Selection */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
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
          isDisabled={isLoadingStaff || isSubmitting}
        />
        {(staffError || additionsError || employeeAdditionsError) && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
            <div className="text-red-400">
              {staffError
                ? `${languageCode === 'bn' ? 'কর্মচারী লোড করতে ত্রুটি:' : 'Error loading employees:'} ${staffError.status || 'unknown'}`
                : additionsError
                  ? `${languageCode === 'bn' ? 'অ্যাডিশন টাইপ লোড করতে ত্রুটি:' : 'Error loading addition types:'} ${additionsError.status || 'unknown'}`
                  : `${languageCode === 'bn' ? 'কর্মচারী অ্যাডিশন লোড করতে ত্রুটি:' : 'Error loading employee additions:'} ${employeeAdditionsError.status || 'unknown'}`}
            </div>
          </div>
        )}
      </div>

      {/* Selected Employee Details and Additions */}
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

          {/* Add New Additions */}
          {hasAddPermission && availableAdditionTypes.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-pmColor/20 rounded-xl">
                  <IoAddCircle className="text-pmColor text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {languageCode === 'bn' ? 'নতুন অ্যাডিশন যোগ করুন' : 'Add New Additions'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableAdditionTypes.map((additionType) => (
                  <div key={additionType.id} className="flex items-center space-x-3 p-4 border border-white/20 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{additionType.addition_type}</h4>
                      <p className="text-sm text-white/70">
                        {additionType.is_every_month
                          ? (languageCode === 'bn' ? 'প্রতি মাসে' : 'Monthly')
                          : (languageCode === 'bn' ? 'এককালীন' : 'One-time')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={additionAmounts[additionType.id] || ''}
                        onChange={(e) => handleAmountChange(additionType.id, e.target.value)}
                        className={`w-24 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[additionType.id] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                          }`}
                        placeholder={languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleAddAddition(additionType.id)}
                        disabled={isCreating || !additionAmounts[additionType.id]}
                        className={`bg-pmColor hover:bg-pmColor/80 text-white px-3 py-2 rounded-xl text-sm transition-all duration-300 ${isCreating || !additionAmounts[additionType.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                      >
                        {isCreating ? (languageCode === 'bn' ? 'যোগ করা হচ্ছে...' : 'Adding...') : (languageCode === 'bn' ? 'যোগ করুন' : 'Add')}
                      </button>
                    </div>
                    {errors[additionType.id] && (
                      <p className="mt-1 text-sm text-red-400">{errors[additionType.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Additions Table */}
          {selectedEmployeeAdditions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-white/20">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <FaList className="text-pmColor" />
                  <span>{languageCode === 'bn' ? 'বর্তমান অ্যাডিশন' : 'Current Additions'} ({selectedEmployeeAdditions.length})</span>
                </h3>
              </div>
              {isLoadingEmployeeAdditions ? (
                <div className="p-8 text-center">
                  <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
                  <p className="text-white/70">
                    {languageCode === 'bn' ? 'অ্যাডিশন লোড হচ্ছে...' : 'Loading additions...'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'আইডি' : 'ID'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'অ্যাডিশন টাইপ' : 'Addition Type'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                          {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {selectedEmployeeAdditions.map((addition, index) => (
                        <tr
                          key={addition.id}
                          className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{addition.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                                <span className="text-pmColor font-medium text-sm">
                                  {getAdditionTypeName(addition.addition_type_id)?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div className="ml-4 text-sm font-medium text-white">
                                {getAdditionTypeName(addition.addition_type_id)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingAddition?.id === addition.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={additionAmounts[addition.addition_type_id] || ''}
                                  onChange={(e) => handleAmountChange(addition.addition_type_id, e.target.value)}
                                  className={`w-24 bg-white/10 backdrop-blur-sm border rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300 ${errors[addition.addition_type_id] ? 'border-red-500' : 'border-white/20 focus:border-pmColor focus:bg-white/15'
                                    }`}
                                  placeholder={languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                                  min="0"
                                  step="0.01"
                                />
                                <button
                                  onClick={() => handleUpdateAddition(addition.id, addition.addition_type_id)}
                                  disabled={isSubmitting}
                                  className="bg-pmColor hover:bg-pmColor/80 text-white px-3 py-1 rounded-xl text-sm transition-all duration-300"
                                >
                                  {isUpdating ? (languageCode === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (languageCode === 'bn' ? 'আপডেট' : 'Update')}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-xl text-sm transition-all duration-300"
                                >
                                  {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-white">${addition.amount.toFixed(2)}</span>
                            )}
                            {errors[addition.addition_type_id] && (
                              <p className="mt-1 text-sm text-red-400">{errors[addition.addition_type_id]}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingAddition?.id !== addition.id && (
                              <div className="flex justify-end gap-2">
                                {hasChangePermission && (
                                  <button
                                    onClick={() => handleEditAddition(addition)}
                                    disabled={isDeleting}
                                    className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                                    title={languageCode === 'bn' ? 'অ্যাডিশন সম্পাদনা করুন' : 'Edit addition'}
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                )}
                                {hasDeletePermission && (
                                  <button
                                    onClick={() => handleDeleteAddition(addition.id)}
                                    disabled={isDeleting}
                                    className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                                    title={languageCode === 'bn' ? 'অ্যাডিশন মুছুন' : 'Delete addition'}
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
                </div>
              )}
              {(createError || updateError || deleteError) && (
                <div className="p-4 border-t border-white/20">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-red-400">
                      {createError
                        ? `${languageCode === 'bn' ? 'অ্যাডিশন তৈরিতে ত্রুটি:' : 'Error creating addition:'} ${createError.status || 'unknown'}`
                        : updateError
                          ? `${languageCode === 'bn' ? 'অ্যাডিশন আপডেটে ত্রুটি:' : 'Error updating addition:'} ${updateError.status || 'unknown'}`
                          : `${languageCode === 'bn' ? 'অ্যাডিশন মুছে ফেলার ত্রুটি:' : 'Error deleting addition:'} ${deleteError.status || 'unknown'}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}






          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                  <FaList className="text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">
                    {languageCode === 'bn' ? 'মোট অ্যাডিশন' : 'Total Additions'}
                  </p>
                  <p className="text-2xl font-bold text-white">{selectedEmployeeAdditions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                  <span className="text-2xl">$</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">
                    {languageCode === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    ${selectedEmployeeAdditions.reduce((sum, addition) => sum + addition.amount, 0).toFixed(2)}
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
                    {languageCode === 'bn' ? 'উপলব্ধ টাইপ' : 'Available Types'}
                  </p>
                  <p className="text-2xl font-bold text-white">{availableAdditionTypes.length}</p>
                </div>
              </div>
            </div>
          </div>


          {/* No Available Additions */}
          {availableAdditionTypes.length === 0 && selectedEmployeeAdditions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center animate-fadeIn">
              <div className="text-white/70">
                <p className="text-lg font-medium">
                  {languageCode === 'bn' ? 'সমস্ত অ্যাডিশন টাইপ নিয়োগ করা হয়েছে' : 'All Addition Types Assigned'}
                </p>
                <p className="text-sm mt-1">
                  {languageCode === 'bn' ? 'এই কর্মচারীর জন্য সমস্ত উপলব্ধ অ্যাডিশন টাইপ নিয়োগ করা হয়েছে।' : 'This employee has been assigned all available addition types.'}
                </p>
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
        title={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'নতুন অ্যাডিশন নিশ্চিত করুন' : 'Confirm New Addition')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'অ্যাডিশন আপডেট নিশ্চিত করুন' : 'Confirm Addition Update')
              : (languageCode === 'bn' ? 'অ্যাডিশন মুছে ফেলা নিশ্চিত করুন' : 'Confirm Addition Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন অ্যাডিশন তৈরি করতে চান?' : 'Are you sure you want to create a new addition?')
            : modalAction === 'update'
              ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই অ্যাডিশন আপডেট করতে চান?' : 'Are you sure you want to update this addition?')
              : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই অ্যাডিশনটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this addition?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default EmployeesAdditions;