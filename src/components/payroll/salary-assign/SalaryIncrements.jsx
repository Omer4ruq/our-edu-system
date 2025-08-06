import React, { useState, useMemo } from 'react';


import {   useGetSalaryIncrementsQuery,
  useCreateSalaryIncrementMutation,
  useUpdateSalaryIncrementMutation,
  useDeleteSalaryIncrementMutation } from '../../../redux/features/api/payroll/salaryIncrementsApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';

const SalaryIncrements = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    is_percentage: true,
    increment_amount: '',
    effective_month: ''
  });
  const [editingIncrement, setEditingIncrement] = useState(null);
  const [showIncrementForm, setShowIncrementForm] = useState(false);
  const [errors, setErrors] = useState({});

  // API hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff } = useGetRoleStaffProfileApiQuery();
  const { data: salaryIncrements = [], isLoading: isLoadingIncrements } = useGetSalaryIncrementsQuery();
  
  const [createSalaryIncrement, { isLoading: isCreating }] = useCreateSalaryIncrementMutation();
  const [updateSalaryIncrement, { isLoading: isUpdating }] = useUpdateSalaryIncrementMutation();
  const [deleteSalaryIncrement, { isLoading: isDeleting }] = useDeleteSalaryIncrementMutation();

  // Get increments for selected employee
  const selectedEmployeeIncrements = useMemo(() => {
    if (!selectedEmployee) return [];
    return salaryIncrements.filter(increment => increment.employee === selectedEmployee.id);
  }, [salaryIncrements, selectedEmployee]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      is_percentage: true,
      increment_amount: '',
      effective_month: ''
    });
    setEditingIncrement(null);
    setShowIncrementForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.increment_amount || formData.increment_amount <= 0) {
      newErrors.increment_amount = 'Please enter a valid increment amount';
    }

    if (formData.is_percentage && formData.increment_amount > 100) {
      newErrors.increment_amount = 'Percentage cannot exceed 100%';
    }

    if (!formData.effective_month) {
      newErrors.effective_month = 'Please select an effective month';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const incrementData = {
      employee: selectedEmployee.id,
      is_percentage: formData.is_percentage,
      increment_amount: parseFloat(formData.increment_amount),
      effective_month: formData.effective_month
    };

    try {
      if (editingIncrement) {
        await updateSalaryIncrement({ id: editingIncrement.id, ...incrementData }).unwrap();
      } else {
        await createSalaryIncrement(incrementData).unwrap();
      }
      
      // Reset form
      setFormData({
        is_percentage: true,
        increment_amount: '',
        effective_month: ''
      });
      setEditingIncrement(null);
      setShowIncrementForm(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to save salary increment:', error);
      alert('Failed to save increment. Please try again.');
    }
  };

  const handleEdit = (increment) => {
    setEditingIncrement(increment);
    setFormData({
      is_percentage: increment.is_percentage,
      increment_amount: increment.increment_amount,
      effective_month: increment.effective_month
    });
    setShowIncrementForm(true);
    setErrors({});
  };

  const handleDelete = async (incrementId) => {
    if (window.confirm('Are you sure you want to delete this salary increment?')) {
      try {
        await deleteSalaryIncrement(incrementId).unwrap();
      } catch (error) {
        console.error('Failed to delete salary increment:', error);
        alert('Failed to delete increment. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      is_percentage: true,
      increment_amount: '',
      effective_month: ''
    });
    setEditingIncrement(null);
    setShowIncrementForm(false);
    setErrors({});
  };

  const handleAddNew = () => {
    setFormData({
      is_percentage: true,
      increment_amount: '',
      effective_month: ''
    });
    setEditingIncrement(null);
    setShowIncrementForm(true);
    setErrors({});
  };

  const formatIncrement = (increment) => {
    if (increment.is_percentage) {
      return `+${increment.increment_amount}%`;
    }
    return `+৳${increment.increment_amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  if (isLoadingStaff || isLoadingIncrements) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Salary Increments Management</h1>
        <p className="text-gray-600">Manage salary increments and promotions for employees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-semibold text-gray-800">Staff Members</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {staffProfiles.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleEmployeeSelect(staff)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors ${
                    selectedEmployee?.id === staff.id ? 'bg-green-100 border-green-200' : ''
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
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
              <p className="text-gray-600">Choose a staff member from the list to manage their salary increments</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Employee Info & Add Button */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h2>
                    <p className="text-gray-600">{selectedEmployee.designation || 'No designation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Employee ID: {selectedEmployee.id}</p>
                    <p className="text-sm text-green-600">
                      Total Increments: {selectedEmployeeIncrements.length}
                    </p>
                  </div>
                </div>
                
                {!showIncrementForm && (
                  <button
                    onClick={handleAddNew}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Salary Increment
                  </button>
                )}
              </div>

              {/* Increment Form */}
              {showIncrementForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {editingIncrement ? 'Edit Salary Increment' : 'Add New Salary Increment'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Increment Type */}
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="increment_type"
                              checked={formData.is_percentage}
                              onChange={() => setFormData(prev => ({ ...prev, is_percentage: true }))}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Percentage (%)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="increment_type"
                              checked={!formData.is_percentage}
                              onChange={() => setFormData(prev => ({ ...prev, is_percentage: false }))}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Fixed Amount (৳)</span>
                          </label>
                        </div>
                      </div>

                      {/* Increment Amount */}
                      <div>
                        <label htmlFor="increment_amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Increment {formData.is_percentage ? 'Percentage' : 'Amount'} *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="increment_amount"
                            name="increment_amount"
                            value={formData.increment_amount}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              errors.increment_amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={formData.is_percentage ? "Enter percentage (e.g., 10)" : "Enter amount (e.g., 5000)"}
                            min="0"
                            max={formData.is_percentage ? "100" : undefined}
                            step={formData.is_percentage ? "0.1" : "0.01"}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 text-sm">
                              {formData.is_percentage ? '%' : '৳'}
                            </span>
                          </div>
                        </div>
                        {errors.increment_amount && (
                          <p className="mt-1 text-sm text-red-600">{errors.increment_amount}</p>
                        )}
                      </div>

                      {/* Effective Month */}
                      <div>
                        <label htmlFor="effective_month" className="block text-sm font-medium text-gray-700 mb-1">
                          Effective Month *
                        </label>
                        <input
                          type="date"
                          id="effective_month"
                          name="effective_month"
                          value={formData.effective_month}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.effective_month ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.effective_month && (
                          <p className="mt-1 text-sm text-red-600">{errors.effective_month}</p>
                        )}
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isCreating || isUpdating}
                        className={`py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          isCreating || isUpdating
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isCreating || isUpdating 
                          ? (editingIncrement ? 'Updating...' : 'Creating...') 
                          : (editingIncrement ? 'Update Increment' : 'Add Increment')
                        }
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isCreating || isUpdating}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Current Increments */}
              {selectedEmployeeIncrements.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <h3 className="text-lg font-semibold text-gray-800">Salary Increment History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Increment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Effective Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedEmployeeIncrements
                          .sort((a, b) => new Date(b.effective_month) - new Date(a.effective_month))
                          .map((increment) => (
                          <tr key={increment.id} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                increment.is_percentage 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {increment.is_percentage ? 'Percentage' : 'Fixed Amount'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              {formatIncrement(increment)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(increment.effective_month)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleEdit(increment)}
                                disabled={isDeleting}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(increment.id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Increments */}
              {selectedEmployeeIncrements.length === 0 && !showIncrementForm && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">No Salary Increments</p>
                    <p className="text-sm mt-1">This employee has no salary increment history.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      {selectedEmployee && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Total Increments</h3>
            <p className="text-2xl font-bold text-green-900">{selectedEmployeeIncrements.length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Percentage Increases</h3>
            <p className="text-2xl font-bold text-blue-900">
              {selectedEmployeeIncrements.filter(inc => inc.is_percentage).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Fixed Increases</h3>
            <p className="text-2xl font-bold text-purple-900">
              {selectedEmployeeIncrements.filter(inc => !inc.is_percentage).length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800">Latest Increment</h3>
            <p className="text-lg font-bold text-yellow-900">
              {selectedEmployeeIncrements.length > 0 
                ? formatDate(selectedEmployeeIncrements.sort((a, b) => new Date(b.effective_month) - new Date(a.effective_month))[0].effective_month)
                : 'None'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryIncrements;