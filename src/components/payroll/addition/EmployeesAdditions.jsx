import React, { useState, useMemo } from 'react';


import {   useGetEmployeesAdditionsQuery,
  useCreateEmployeeAdditionMutation,
  useUpdateEmployeeAdditionMutation,
  useDeleteEmployeeAdditionMutation } from '../../../redux/features/api/payroll/employeesAdditionsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetAdditionTypesQuery } from '../../../redux/features/api/payroll/additionTypesApi';

const EmployeesAdditions = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [additionAmounts, setAdditionAmounts] = useState({});
  const [editingAddition, setEditingAddition] = useState(null);
  const [showAdditionForm, setShowAdditionForm] = useState(false);

  // API hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff } = useGetRoleStaffProfileApiQuery();
  const { data: additionTypes = [], isLoading: isLoadingAdditions } = useGetAdditionTypesQuery();
  const { data: employeesAdditions = [], isLoading: isLoadingEmployeeAdditions, refetch } = useGetEmployeesAdditionsQuery();
  
  const [createEmployeeAddition, { isLoading: isCreating }] = useCreateEmployeeAdditionMutation();
  const [updateEmployeeAddition, { isLoading: isUpdating }] = useUpdateEmployeeAdditionMutation();
  const [deleteEmployeeAddition, { isLoading: isDeleting }] = useDeleteEmployeeAdditionMutation();

  // Get additions for selected employee
  const selectedEmployeeAdditions = useMemo(() => {
    if (!selectedEmployee) return [];
    return employeesAdditions.filter(addition => addition.employee_id === selectedEmployee.id);
  }, [employeesAdditions, selectedEmployee]);

  // Get available addition types (not yet assigned to selected employee)
  const availableAdditionTypes = useMemo(() => {
    if (!selectedEmployee || !additionTypes.length) return [];
    const assignedAdditionTypeIds = selectedEmployeeAdditions.map(addition => addition.addition_type_id);
    return additionTypes.filter(type => !assignedAdditionTypeIds.includes(type.id));
  }, [additionTypes, selectedEmployeeAdditions, selectedEmployee]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setAdditionAmounts({});
    setEditingAddition(null);
    setShowAdditionForm(false);
  };

  const handleAmountChange = (additionTypeId, amount) => {
    setAdditionAmounts(prev => ({
      ...prev,
      [additionTypeId]: amount
    }));
  };

  const handleAddAddition = async (additionTypeId) => {
    const amount = additionAmounts[additionTypeId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await createEmployeeAddition({
        amount: parseFloat(amount),
        addition_type_id: additionTypeId,
        employee_id: selectedEmployee.id
      }).unwrap();
      
      setAdditionAmounts(prev => ({
        ...prev,
        [additionTypeId]: ''
      }));
    } catch (error) {
      console.error('Failed to add employee addition:', error);
      alert('Failed to add addition. Please try again.');
    }
  };

  const handleEditAddition = (addition) => {
    setEditingAddition(addition);
    setAdditionAmounts(prev => ({
      ...prev,
      [addition.addition_type_id]: addition.amount
    }));
  };

  const handleUpdateAddition = async (additionId, additionTypeId) => {
    const amount = additionAmounts[additionTypeId];
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await updateEmployeeAddition({
        id: additionId,
        amount: parseFloat(amount),
        addition_type_id: additionTypeId,
        employee_id: selectedEmployee.id
      }).unwrap();
      
      setEditingAddition(null);
    } catch (error) {
      console.error('Failed to update employee addition:', error);
      alert('Failed to update addition. Please try again.');
    }
  };

  const handleDeleteAddition = async (additionId) => {
    if (window.confirm('Are you sure you want to delete this addition?')) {
      try {
        await deleteEmployeeAddition(additionId).unwrap();
      } catch (error) {
        console.error('Failed to delete employee addition:', error);
        alert('Failed to delete addition. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingAddition(null);
    setAdditionAmounts(prev => {
      const updated = { ...prev };
      if (editingAddition) {
        delete updated[editingAddition.addition_type_id];
      }
      return updated;
    });
  };

  const getAdditionTypeName = (additionTypeId) => {
    const additionType = additionTypes.find(type => type.id === additionTypeId);
    return additionType ? additionType.addition_type : 'Unknown';
  };

  if (isLoadingStaff || isLoadingAdditions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Employee Additions Management</h1>
        <p className="text-gray-600">Assign and manage addition amounts for employees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Staff Members</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {staffProfiles.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleEmployeeSelect(staff)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedEmployee?.id === staff.id ? 'bg-blue-100 border-blue-200' : ''
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
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
              <p className="text-gray-600">Choose a staff member from the list to manage their additions</p>
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
                    <p className="text-sm text-blue-600">
                      Total Additions: {selectedEmployeeAdditions.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Additions */}
              {selectedEmployeeAdditions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Current Additions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Addition Type
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
                        {selectedEmployeeAdditions.map((addition) => (
                          <tr key={addition.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getAdditionTypeName(addition.addition_type_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {editingAddition?.id === addition.id ? (
                                <input
                                  type="number"
                                  value={additionAmounts[addition.addition_type_id] || ''}
                                  onChange={(e) => handleAmountChange(addition.addition_type_id, e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  min="0"
                                  step="0.01"
                                />
                              ) : (
                                <span className="font-semibold text-green-600">
                                  ${addition.amount.toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {editingAddition?.id === addition.id ? (
                                <div className="space-x-2">
                                  <button
                                    onClick={() => handleUpdateAddition(addition.id, addition.addition_type_id)}
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
                                    onClick={() => handleEditAddition(addition)}
                                    disabled={isDeleting}
                                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => handleDeleteAddition(addition.id)}
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

              {/* Available Additions to Add */}
              {availableAdditionTypes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Add New Additions</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableAdditionTypes.map((additionType) => (
                        <div key={additionType.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{additionType.addition_type}</h4>
                            <p className="text-sm text-gray-500">
                              {additionType.is_every_month ? 'Monthly' : 'One-time'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={additionAmounts[additionType.id] || ''}
                              onChange={(e) => handleAmountChange(additionType.id, e.target.value)}
                              placeholder="Amount"
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleAddAddition(additionType.id)}
                              disabled={isCreating || !additionAmounts[additionType.id]}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

              {/* No Available Additions */}
              {availableAdditionTypes.length === 0 && selectedEmployeeAdditions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">All Addition Types Assigned</p>
                    <p className="text-sm mt-1">This employee has been assigned all available addition types.</p>
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
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Total Additions</h3>
            <p className="text-2xl font-bold text-blue-900">{selectedEmployeeAdditions.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Total Amount</h3>
            <p className="text-2xl font-bold text-green-900">
              ${selectedEmployeeAdditions.reduce((sum, addition) => sum + addition.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Available Types</h3>
            <p className="text-2xl font-bold text-purple-900">{availableAdditionTypes.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesAdditions;