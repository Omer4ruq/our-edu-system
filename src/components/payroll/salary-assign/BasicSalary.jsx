import React, { useState, useMemo } from 'react';
import {   useGetBasicSalariesQuery,
  useCreateBasicSalaryMutation,
  useUpdateBasicSalaryMutation,
  useDeleteBasicSalaryMutation } from '../../../redux/features/api/payroll/basicSalaryApi';
import { useGetRoleStaffProfileApiQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';



const BasicSalary = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    basic_salary: ''
  });
  const [editingSalary, setEditingSalary] = useState(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [errors, setErrors] = useState({});

  // API hooks
  const { data: staffProfiles = [], isLoading: isLoadingStaff } = useGetRoleStaffProfileApiQuery();
  const { data: basicSalaries = [], isLoading: isLoadingSalaries } = useGetBasicSalariesQuery();
  console.log(basicSalaries)
  const [createBasicSalary, { isLoading: isCreating }] = useCreateBasicSalaryMutation();
  const [updateBasicSalary, { isLoading: isUpdating }] = useUpdateBasicSalaryMutation();
  const [deleteBasicSalary, { isLoading: isDeleting }] = useDeleteBasicSalaryMutation();

  // Get salary data for selected employee
  const selectedEmployeeSalary = useMemo(() => {
    if (!selectedEmployee) return null;
    return basicSalaries.find(salary => salary.employee === selectedEmployee.id);
  }, [basicSalaries, selectedEmployee]);

  // Get all salary data with employee names
  const enrichedSalaries = useMemo(() => {
    return basicSalaries.map(salary => {
      const employee = staffProfiles.find(staff => staff.id === salary.employee);
      return {
        ...salary,
        employeeName: employee?.name || 'Unknown Employee',
        employeeDesignation: employee?.designation || 'No designation'
      };
    });
  }, [basicSalaries, staffProfiles]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData({ basic_salary: '' });
    setEditingSalary(null);
    setShowSalaryForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.basic_salary || formData.basic_salary <= 0) {
      newErrors.basic_salary = 'Please enter a valid basic salary amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const salaryData = {
      employee: selectedEmployee.id,
      basic_salary: parseFloat(formData.basic_salary)
    };

    try {
      if (editingSalary) {
        await updateBasicSalary({ id: editingSalary.id, ...salaryData }).unwrap();
      } else {
        await createBasicSalary(salaryData).unwrap();
      }
      
      // Reset form
      setFormData({ basic_salary: '' });
      setEditingSalary(null);
      setShowSalaryForm(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to save basic salary:', error);
      alert('Failed to save salary. Please try again.');
    }
  };

  const handleEdit = (salary) => {
    const employee = staffProfiles.find(staff => staff.id === salary.employee);
    if (employee) {
      setSelectedEmployee(employee);
      setEditingSalary(salary);
      setFormData({ basic_salary: salary.basic_salary });
      setShowSalaryForm(true);
      setErrors({});
    }
  };

  const handleDelete = async (salaryId) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await deleteBasicSalary(salaryId).unwrap();
      } catch (error) {
        console.error('Failed to delete salary:', error);
        alert('Failed to delete salary. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ basic_salary: '' });
    setEditingSalary(null);
    setShowSalaryForm(false);
    setErrors({});
  };

  const handleAddNew = () => {
    if (selectedEmployeeSalary) {
      alert('This employee already has a salary record. You can edit the existing one.');
      return;
    }
    setFormData({ basic_salary: '' });
    setEditingSalary(null);
    setShowSalaryForm(true);
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoadingStaff || isLoadingSalaries) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Basic Salary Management</h1>
        <p className="text-gray-600">Manage employee basic salary records and view comprehensive salary data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
              <h2 className="text-xl font-semibold text-gray-800">Staff Members</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {staffProfiles.map((staff) => {
                const hasSalary = basicSalaries.some(salary => salary.employee === staff.id);
                return (
                  <div
                    key={staff.id}
                    onClick={() => handleEmployeeSelect(staff)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors ${
                      selectedEmployee?.id === staff.id ? 'bg-purple-100 border-purple-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600">{staff.designation || 'No designation'}</div>
                      </div>
                      {hasSalary && (
                        <div className="ml-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Set
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedEmployee ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
              <p className="text-gray-600">Choose a staff member from the list to view or manage their salary</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Employee Info & Controls */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h2>
                    <p className="text-gray-600">{selectedEmployee.designation || 'No designation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Employee ID: {selectedEmployee.id}</p>
                    <p className="text-sm text-purple-600">
                      Status: {selectedEmployeeSalary ? 'Salary Set' : 'No Salary'}
                    </p>
                  </div>
                </div>

                {!showSalaryForm && (
                  <div className="flex space-x-3">
                    {!selectedEmployeeSalary ? (
                      <button
                        onClick={handleAddNew}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        Set Basic Salary
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(selectedEmployeeSalary)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        Edit Basic Salary
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Salary Form */}
              {showSalaryForm && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {editingSalary ? 'Edit Basic Salary' : 'Set Basic Salary'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="basic_salary" className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary Amount (৳) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="basic_salary"
                          name="basic_salary"
                          value={formData.basic_salary}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            errors.basic_salary ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter basic salary amount"
                          min="0"
                          step="0.01"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 text-sm">৳</span>
                        </div>
                      </div>
                      {errors.basic_salary && (
                        <p className="mt-1 text-sm text-red-600">{errors.basic_salary}</p>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isCreating || isUpdating}
                        className={`py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          isCreating || isUpdating
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isCreating || isUpdating 
                          ? (editingSalary ? 'Updating...' : 'Setting...') 
                          : (editingSalary ? 'Update Salary' : 'Set Salary')
                        }
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isCreating || isUpdating}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Current Salary Details */}
              {selectedEmployeeSalary && !showSalaryForm && (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                    <h3 className="text-lg font-semibold text-gray-800">Salary Details</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-800 mb-1">Basic Salary</h4>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatCurrency(selectedEmployeeSalary.basic_salary)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-1">Total Additions</h4>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(selectedEmployeeSalary.additions)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-red-800 mb-1">Total Deductions</h4>
                        <p className="text-2xl font-bold text-red-900">
                          -{formatCurrency(selectedEmployeeSalary.deductions)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Total Increments</h4>
                        <p className="text-2xl font-bold text-blue-900">
                          +{formatCurrency(selectedEmployeeSalary.increment)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg md:col-span-2">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Final Salary</h4>
                        <p className="text-3xl font-bold text-yellow-900">
                          {formatCurrency(selectedEmployeeSalary.total_salary)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Created:</span> {formatDate(selectedEmployeeSalary.created_at)}</p>
                        <p><span className="font-medium">Updated:</span> {formatDate(selectedEmployeeSalary.updated_at)}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Created by ID:</span> {selectedEmployeeSalary.created_by}</p>
                        <p><span className="font-medium">Updated by ID:</span> {selectedEmployeeSalary.updated_by}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Salaries Table */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
          <h2 className="text-xl font-semibold text-gray-800">All Employee Salaries</h2>
        </div>
        
        {enrichedSalaries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-lg font-medium">No Salary Records</p>
            <p className="text-sm mt-1">No employees have salary records set up yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Increments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrichedSalaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-purple-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{salary.employeeName}</div>
                        <div className="text-sm text-gray-500">{salary.employeeDesignation}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                      {formatCurrency(salary.basic_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(salary.additions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      -{formatCurrency(salary.deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      +{formatCurrency(salary.increment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(salary.total_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(salary)}
                        disabled={isDeleting}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(salary.id)}
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
        )}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800">Total Employees</h3>
          <p className="text-2xl font-bold text-purple-900">{staffProfiles.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800">Salary Records</h3>
          <p className="text-2xl font-bold text-green-900">{enrichedSalaries.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">Avg Basic Salary</h3>
          <p className="text-2xl font-bold text-blue-900">
            {enrichedSalaries.length > 0 
              ? formatCurrency(enrichedSalaries.reduce((sum, s) => sum + parseFloat(s.basic_salary), 0) / enrichedSalaries.length)
              : '৳0.00'
            }
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800">Total Payroll</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {formatCurrency(enrichedSalaries.reduce((sum, s) => sum + parseFloat(s.total_salary || 0), 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicSalary;