import React, { useState, useMemo } from 'react';


import {   useGetEmployeesDeductionsQuery,
  useCreateEmployeeDeductionMutation,
  useUpdateEmployeeDeductionMutation,
  useDeleteEmployeeDeductionMutation } from '../../../redux/features/api/payroll/employeesDeductionsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetDeductionTypesQuery } from '../../../redux/features/api/payroll/deductionTypesApi';

const EmployeesDeductions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deductionAmounts, setDeductionAmounts] = useState({});
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [showDeductionForm, setShowDeductionForm] = useState(false);

  // API hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff } = useGetRoleStaffProfileApiQuery();
  const { data: deductionTypes = [], isLoading: isLoadingDeductions } = useGetDeductionTypesQuery();
  const { data: employeesDeductions = [], isLoading: isLoadingEmployeeDeductions, refetch } = useGetEmployeesDeductionsQuery();
  
  const [createEmployeeDeduction, { isLoading: isCreating }] = useCreateEmployeeDeductionMutation();
  const [updateEmployeeDeduction, { isLoading: isUpdating }] = useUpdateEmployeeDeductionMutation();
  const [deleteEmployeeDeduction, { isLoading: isDeleting }] = useDeleteEmployeeDeductionMutation();

  // Get deductions for selected employee
  const selectedEmployeeDeductions = useMemo(() => {
    if (!selectedEmployee) return [];
    return employeesDeductions.filter(deduction => deduction.employee_id === selectedEmployee.id);
  }, [employeesDeductions, selectedEmployee]);

  // Get available deduction types (not yet assigned to selected employee)
  const availableDeductionTypes = useMemo(() => {
    if (!selectedEmployee || !deductionTypes.length) return [];
    const assignedDeductionTypeIds = selectedEmployeeDeductions.map(deduction => deduction.deduction_type_id);
    return deductionTypes.filter(type => !assignedDeductionTypeIds.includes(type.id));
  }, [deductionTypes, selectedEmployeeDeductions, selectedEmployee]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setDeductionAmounts({});
    setEditingDeduction(null);
    setShowDeductionForm(false);
  };

  const handleAmountChange = (deductionTypeId, amount) => {
    setDeductionAmounts(prev => ({
      ...prev,
      [deductionTypeId]: amount
    }));
  };

  const handleAddDeduction = async (deductionTypeId) => {
    const amount = deductionAmounts[deductionTypeId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await createEmployeeDeduction({
        amount: parseFloat(amount),
        deduction_type_id: deductionTypeId,
        employee_id: selectedEmployee.id
      }).unwrap();
      
      setDeductionAmounts(prev => ({
        ...prev,
        [deductionTypeId]: ''
      }));
    } catch (error) {
      console.error('Failed to add employee deduction:', error);
      alert('Failed to add deduction. Please try again.');
    }
  };

  const handleEditDeduction = (deduction) => {
    setEditingDeduction(deduction);
    setDeductionAmounts(prev => ({
      ...prev,
      [deduction.deduction_type_id]: deduction.amount
    }));
  };

  const handleUpdateDeduction = async (deductionId, deductionTypeId) => {
    const amount = deductionAmounts[deductionTypeId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await updateEmployeeDeduction({
        id: deductionId,
        amount: parseFloat(amount),
        deduction_type_id: deductionTypeId,
        employee_id: selectedEmployee.id
      }).unwrap();
      
      setEditingDeduction(null);
    } catch (error) {
      console.error('Failed to update employee deduction:', error);
      alert('Failed to update deduction. Please try again.');
    }
  };

  const handleDeleteDeduction = async (deductionId) => {
    if (window.confirm('Are you sure you want to delete this deduction?')) {
      try {
        await deleteEmployeeDeduction(deductionId).unwrap();
      } catch (error) {
        console.error('Failed to delete employee deduction:', error);
        alert('Failed to delete deduction. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingDeduction(null);
    setDeductionAmounts(prev => {
      const updated = { ...prev };
      if (editingDeduction) {
        delete updated[editingDeduction.deduction_type_id];
      }
      return updated;
    });
  };

  const getDeductionTypeName = (deductionTypeId) => {
    const deductionType = deductionTypes.find(type => type.id === deductionTypeId);
    return deductionType ? deductionType.deduction_type : 'Unknown';
  };

  if (isLoadingStaff || isLoadingDeductions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Employee Deductions Management</h1>
        <p className="text-gray-600">Assign and manage deduction amounts for employees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <h2 className="text-xl font-semibold text-gray-800">Staff Members</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {staffProfiles.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleEmployeeSelect(staff)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-red-50 transition-colors ${
                    selectedEmployee?.id === staff.id ? 'bg-red-100 border-red-200' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{staff.name}</div>
                  <div className="text-sm text-gray-600">{staff.designation || 'No designation'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {!selectedEmployee ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
              <p className="text-gray-600">Choose a staff member from the list to manage their deductions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Employee Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h2>
                    <p className="text-gray-600">{selectedEmployee.designation || 'No designation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Employee ID: {selectedEmployee.id}</p>
                    <p className="text-sm text-red-600">
                      Total Deductions: {selectedEmployeeDeductions.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Deductions */}
              {selectedEmployeeDeductions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                    <h3 className="text-lg font-semibold text-gray-800">Current Deductions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deduction Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedEmployeeDeductions.map((deduction) => (
                          <tr key={deduction.id} className="hover:bg-red-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getDeductionTypeName(deduction.deduction_type_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingDeduction?.id === deduction.id ? (
                                <input
                                  type="number"
                                  value={deductionAmounts[deduction.deduction_type_id] || ''}
                                  onChange={(e) => handleAmountChange(deduction.deduction_type_id, e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  min="0"
                                  step="0.01"
                                />
                              ) : (
                                <span className="font-semibold text-red-600">
                                  -${deduction.amount.toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {editingDeduction?.id === deduction.id ? (
                                <div className="space-x-2">
                                  <button
                                    onClick={() => handleUpdateDeduction(deduction.id, deduction.deduction_type_id)}
                                    disabled={isUpdating}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="space-x-2">
                                  <button
                                    onClick={() => handleEditDeduction(deduction)}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => handleDeleteDeduction(deduction.id)}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Available Deductions to Add */}
              {availableDeductionTypes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                    <h3 className="text-lg font-semibold text-gray-800">Add New Deductions</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableDeductionTypes.map((deductionType) => (
                        <div key={deductionType.id} className="flex items-center space-x-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{deductionType.deduction_type}</h4>
                            <p className="text-sm text-gray-500">
                              {deductionType.is_every_month ? 'Monthly' : 'One-time'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={deductionAmounts[deductionType.id] || ''}
                              onChange={(e) => handleAmountChange(deductionType.id, e.target.value)}
                              placeholder="Amount"
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleAddDeduction(deductionType.id)}
                              disabled={isCreating || !deductionAmounts[deductionType.id]}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {isCreating ? 'Adding...' : 'Add'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Available Deductions */}
              {availableDeductionTypes.length === 0 && selectedEmployeeDeductions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">All Deduction Types Assigned</p>
                    <p className="text-sm mt-1">This employee has been assigned all available deduction types.</p>
                  </div>
                </div>
              )}

              {/* No Deductions at all */}
              {selectedEmployeeDeductions.length === 0 && availableDeductionTypes.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">No Deduction Types Available</p>
                    <p className="text-sm mt-1">Please create deduction types first before assigning them to employees.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      {selectedEmployee && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Total Deductions</h3>
            <p className="text-2xl font-bold text-red-900">{selectedEmployeeDeductions.length}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800">Total Amount</h3>
            <p className="text-2xl font-bold text-orange-900">
              -${selectedEmployeeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800">Available Types</h3>
            <p className="text-2xl font-bold text-yellow-900">{availableDeductionTypes.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesDeductions;