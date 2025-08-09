import React, { useState, useEffect } from 'react';

import { DollarSign, Users, Clock, CheckCircle, AlertCircle, RefreshCw, Search, Filter, User, CreditCard, Calculator, ArrowRight, X } from 'lucide-react';
import { useGetSalaryProcessesQuery, usePatchSalaryProcessMutation, useUpdateSalaryProcessMutation } from '../../../redux/features/api/payroll/salaryProcessApi';

const SalaryProcess = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    salaryMonth: '',
    salaryStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [partialAmounts, setPartialAmounts] = useState({});
  const [showPartialInput, setShowPartialInput] = useState({});

  // API hooks
  const { 
    data: salaryProcesses = [], 
    isLoading: salaryLoading, 
    error: salaryError,
    refetch: refetchSalaries
  } = useGetSalaryProcessesQuery();

  const [patchSalaryProcess, { 
    isLoading: isUpdating,
    error: updateError
  }] = usePatchSalaryProcessMutation();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Filter salary processes
  const filteredSalaries = salaryProcesses.filter(salary => {
    const matchesSearch = !filters.searchTerm || 
      salary.employee_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      salary.employee_user_id?.toString().includes(filters.searchTerm);
    
    const matchesMonth = !filters.salaryMonth || salary.salary_month === filters.salaryMonth;
    const matchesStatus = !filters.salaryStatus || salary.salary_status === filters.salaryStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const handleFullPayment = async (salary) => {
    if (salary.salary_status === 'paid') return;
    
    setProcessingId(salary.id);
    
    try {
      // Send only the fields that need to be updated
      const updateData = {
        salary_status: 'paid',
        payment_amount: parseFloat(salary.total_salary || 0)
      };

      console.log('Full payment data:', updateData); // Debug log

      await patchSalaryProcess({ id: salary.id, ...updateData }).unwrap();
      await refetchSalaries();
      
    } catch (error) {
      console.error('Failed to process full payment:', error);
      console.error('Error details:', error?.data); // More detailed error logging
      alert(error?.data?.message || error?.data?.detail || 'Failed to process payment. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePartialPayment = async (salary, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const paymentAmount = parseFloat(amount);
    const totalSalary = parseFloat(salary.total_salary || 0);
    
    console.log('Payment validation check:');
    console.log('Input amount:', amount);
    console.log('Parsed payment amount:', paymentAmount);
    console.log('Total salary:', totalSalary);
    console.log('Is payment amount > 0?', paymentAmount > 0);
    console.log('Is payment amount <= total salary?', paymentAmount <= totalSalary);
    
    if (paymentAmount > totalSalary) {
      alert('Payment amount cannot exceed total salary');
      return;
    }

    setProcessingId(salary.id);
    
    try {
      // Determine status based on payment amount
      let status = 'partial';
      if (paymentAmount >= totalSalary) {
        status = 'paid';
      }

      // Try with the exact field names from your sample data
      const updateData = {
        salary_status: status,
        payment_amount: paymentAmount,
        // Let's also include the total_salary to make sure the backend has context
        total_salary: totalSalary
      };

      console.log('Sending PATCH request to:', `/salary-process/${salary.id}/`);
      console.log('Update payload:', JSON.stringify(updateData, null, 2));

      const result = await patchSalaryProcess({ id: salary.id, ...updateData }).unwrap();
      console.log('PATCH response:', result);
      
      // Clear the partial amount input and hide input section
      setPartialAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[salary.id];
        return newAmounts;
      });
      
      setShowPartialInput(prev => ({
        ...prev,
        [salary.id]: false
      }));
      
      await refetchSalaries();
      
    } catch (error) {
      console.error('PATCH request failed:', error);
      console.error('Error status:', error?.status);
      console.error('Error data:', error?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Show detailed error message
      let errorMessage = 'Failed to process payment. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error?.data) {
        // If there are field-specific errors
        const fieldErrors = Object.entries(error.data)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
        if (fieldErrors) {
          errorMessage = `Validation errors:\n${fieldErrors}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePartialAmountChange = (salaryId, amount) => {
    setPartialAmounts(prev => ({
      ...prev,
      [salaryId]: amount
    }));
  };

  const togglePartialInput = (salaryId) => {
    setShowPartialInput(prev => ({
      ...prev,
      [salaryId]: !prev[salaryId]
    }));
    
    // Clear the amount when hiding the input
    if (showPartialInput[salaryId]) {
      setPartialAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[salaryId];
        return newAmounts;
      });
    }
  };

  const cancelPartialPayment = (salaryId) => {
    setShowPartialInput(prev => ({
      ...prev,
      [salaryId]: false
    }));
    setPartialAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[salaryId];
      return newAmounts;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStats = () => {
    const total = filteredSalaries.length;
    const paid = filteredSalaries.filter(s => s.salary_status === 'paid').length;
    const partial = filteredSalaries.filter(s => s.salary_status === 'partial').length;
    const unpaid = filteredSalaries.filter(s => s.salary_status === 'unpaid').length;
    const totalAmount = filteredSalaries.reduce((sum, s) => sum + parseFloat(s.total_salary || 0), 0);
    const paidAmount = filteredSalaries.reduce((sum, s) => sum + parseFloat(s.payment_amount || 0), 0);
    
    return { total, paid, partial, unpaid, totalAmount, paidAmount };
  };

  const stats = getTotalStats();
    const getRemainingAmount = (salary) => {
    const totalSalary = parseFloat(salary.total_salary || 0);
    const alreadyPaid = parseFloat(salary.payment_amount || 0);
    return totalSalary - alreadyPaid;
  }; 

  if (salaryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-500 mb-4">{salaryError?.data?.message || 'Unable to load salary data'}</p>
            <button 
              onClick={() => refetchSalaries()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Salary Process Management</h1>
                <p className="text-gray-600 text-sm">Process and manage employee salary payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-700">{stats.unpaid}</p>
                <p className="text-xs text-gray-500">Partial: {stats.partial}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Progress</p>
                <p className="text-lg font-bold text-purple-700">
                  ৳{formatCurrency(stats.paidAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  of ৳{formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Process Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Salary Records</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {salaryLoading ? 'Loading...' : `${filteredSalaries.length} records found`}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search by employee name or ID..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters || filters.salaryMonth || filters.salaryStatus
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <button 
                  onClick={() => refetchSalaries()}
                  disabled={salaryLoading}
                  className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${salaryLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Month</label>
                    <select
                      value={filters.salaryMonth}
                      onChange={(e) => setFilters(prev => ({ ...prev, salaryMonth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Months</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={filters.salaryStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, salaryStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ searchTerm: '', salaryMonth: '', salaryStatus: '' })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {salaryLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-3 text-gray-500">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading salary records...</span>
                </div>
              </div>
            ) : filteredSalaries.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No salary records found</h3>
                <p className="text-gray-500">
                  {salaryProcesses.length === 0 
                    ? 'No salary records have been created yet.' 
                    : 'No records match your current filters.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Salary
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSalaries.map((salary, index) => (
                    <tr key={salary.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {salary.employee_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {salary.employee_user_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{salary.salary_month}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ৳{formatCurrency(salary.total_salary)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ৳{formatCurrency(salary.payment_amount)}
                        </div>
                        {salary.total_salary && salary.payment_amount && (
                          <div className="text-xs text-gray-500">
                            {((parseFloat(salary.payment_amount) / parseFloat(salary.total_salary)) * 100).toFixed(1)}% paid
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(salary.salary_status)}`}>
                          {salary.salary_status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {salary.payment_method || salary.transaction_no ? (
                          <div>
                            {salary.payment_method && (
                              <div className="flex items-center text-sm text-gray-900">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {salary.payment_method}
                              </div>
                            )}
                            {salary.transaction_no && (
                              <div className="text-xs text-gray-500">
                                Txn: {salary.transaction_no}
                              </div>
                            )}
                            {salary.payment_date && (
                              <div className="text-xs text-gray-500">
                                {formatDate(salary.payment_date)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No payment details</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {salary.salary_status === 'paid' ? (
                          <div className="flex items-center justify-end space-x-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Full Payment Button */}
                            <button
                              onClick={() => handleFullPayment(salary)}
                              disabled={processingId === salary.id}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              {processingId === salary.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} />
                                  <span>
                                    {salary.salary_status === 'partial' 
                                      ? `Pay Remaining (৳${formatCurrency(getRemainingAmount(salary))})`
                                      : `Full Pay (৳${formatCurrency(salary.total_salary)})`
                                    }
                                  </span>
                                </>
                              )}
                            </button>

                            {/* Partial Payment Section */}
                            <div className="border-t border-gray-200 pt-3">
                              {!showPartialInput[salary.id] ? (
                                /* Partial Payment Button */
                                <button
                                  onClick={() => togglePartialInput(salary.id)}
                                  disabled={processingId === salary.id}
                                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                  <Calculator size={14} />
                                  <span>Partial Payment</span>
                                </button>
                              ) : (
                                /* Partial Payment Input Section */
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-blue-900">Enter Partial Amount</h4>
                                    <button
                                      onClick={() => cancelPartialPayment(salary.id)}
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="text-xs text-blue-700">
                                      Total Salary: ৳{formatCurrency(salary.total_salary)}
                                    </div>
                                    <div className="flex space-x-2">
                                      <div className="flex-1">
                                        <div className="relative">
                                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">৳</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={salary.total_salary}
                                            value={partialAmounts[salary.id] || ''}
                                            onChange={(e) => handlePartialAmountChange(salary.id, e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-2 border border-blue-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handlePartialPayment(salary, partialAmounts[salary.id])}
                                        disabled={processingId === salary.id || !partialAmounts[salary.id] || parseFloat(partialAmounts[salary.id]) <= 0}
                                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                                      >
                                        {processingId === salary.id ? (
                                          <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            <span>Processing...</span>
                                          </>
                                        ) : (
                                          <>
                                            <ArrowRight size={14} />
                                            <span>Pay</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    
                                    {partialAmounts[salary.id] && parseFloat(partialAmounts[salary.id]) > 0 && (
                                      <div className="text-xs text-blue-700">
                                        {parseFloat(partialAmounts[salary.id]) >= parseFloat(salary.total_salary) 
                                          ? "This will mark as fully paid" 
                                          : `Remaining: ৳${formatCurrency(parseFloat(salary.total_salary) - parseFloat(partialAmounts[salary.id]))}`
                                        }
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer with summary */}
          {!salaryLoading && filteredSalaries.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4 text-sm text-gray-700">
                  <span>
                    Total: <span className="font-medium">{stats.total}</span> records
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    Paid: <span className="font-medium text-green-600">{stats.paid}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    Pending: <span className="font-medium text-red-600">{stats.unpaid + stats.partial}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>Total Paid:</span>
                    <span className="font-semibold text-green-700">
                      ৳{formatCurrency(stats.paidAmount)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Remaining:</span>
                    <span className="font-semibold text-red-700">
                      ৳{formatCurrency(stats.totalAmount - stats.paidAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryProcess;