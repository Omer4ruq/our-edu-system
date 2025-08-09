import React, { useState, useEffect } from 'react';

import { Calendar, DollarSign, Users, Clock, CheckCircle, AlertCircle, RefreshCw, Download, FileText, User, CreditCard, GraduationCap } from 'lucide-react';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGenerateUnpaidSalariesMutation, useGetUnpaidSalariesByMonthQuery } from '../../../redux/features/api/payroll/generateUnpaidSalariesApi';

const SalaryAllocation = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [showUnpaidList, setShowUnpaidList] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // API hooks
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  
  const { 
    data: unpaidSalaries = [], 
    isLoading: unpaidLoading, 
    error: unpaidError,
    refetch: refetchUnpaid
  } = useGetUnpaidSalariesByMonthQuery(selectedMonth, {
    skip: !selectedMonth
  });

  const [generateUnpaidSalaries, { 
    isLoading: isGenerating, 
    error: generateError,
    isSuccess: generateSuccess
  }] = useGenerateUnpaidSalariesMutation();

  // Show unpaid list when both month and academic year are selected and data is available
  useEffect(() => {
    if (selectedMonth && selectedAcademicYear && !unpaidLoading) {
      setShowUnpaidList(true);
    }
  }, [selectedMonth, selectedAcademicYear, unpaidLoading]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setShowUnpaidList(false);
  };

  const handleAcademicYearChange = (e) => {
    const academicYearId = e.target.value;
    setSelectedAcademicYear(academicYearId);
    setShowUnpaidList(false);
  };

  const handleGenerateSalaries = async () => {
    if (!selectedMonth) {
      alert('Please select a month first');
      return;
    }
    
    if (!selectedAcademicYear) {
      alert('Please select an academic year first');
      return;
    }

    try {
      await generateUnpaidSalaries({ 
        salary_month: selectedMonth,
        academic_year: parseInt(selectedAcademicYear)
      }).unwrap();
      // Refetch the unpaid salaries after generation
      refetchUnpaid();
    } catch (error) {
      console.error('Failed to generate salaries:', error);
    }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalUnpaidAmount = () => {
    return unpaidSalaries.reduce((total, salary) => total + parseFloat(salary.payment_amount || 0), 0);
  };

  const getUnpaidCount = () => {
    return unpaidSalaries.filter(salary => salary.salary_status === 'unpaid').length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Salary Allocation</h1>
                <p className="text-gray-600 text-sm">Generate and manage monthly employee salaries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Month Selection and Generation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar size={20} />
              <span>Monthly Salary Generation</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">Select a month to generate or view unpaid employee salaries</p>
          </div>

          <div className="p-6">
            {/* Success/Error Messages */}
            {generateSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-green-800">
                    <p className="font-medium">Salaries generated successfully!</p>
                    <p className="text-sm">Unpaid salaries for {selectedMonth} have been created.</p>
                  </div>
                </div>
              </div>
            )}

            {generateError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="text-red-800">
                    <p className="font-medium">Error generating salaries</p>
                    <p className="text-sm">{generateError?.data?.message || 'Please try again'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Academic Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Academic Year
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedAcademicYear}
                    onChange={handleAcademicYearChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name || year.year || `${year.start_year}-${year.end_year}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Salary Month
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleGenerateSalaries}
                  disabled={!selectedMonth || !selectedAcademicYear || isGenerating}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign size={18} />
                      <span>Generate Salaries</span>
                    </>
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  This will create unpaid salary records for all employees
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {selectedMonth && selectedAcademicYear && showUnpaidList && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{unpaidSalaries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unpaid Salaries</p>
                  <p className="text-2xl font-bold text-gray-900">{getUnpaidCount()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(getTotalUnpaidAmount())}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unpaid Salaries List */}
        {selectedMonth && selectedAcademicYear && showUnpaidList && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText size={20} />
                    <span>Unpaid Salaries - {selectedMonth}</span>
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {unpaidLoading ? 'Loading...' : `${unpaidSalaries.length} employee records found`}
                    {selectedAcademicYear && (
                      <span className="ml-2 text-orange-600">
                        • Academic Year: {academicYears.find(year => year.id.toString() === selectedAcademicYear)?.name || 
                                         academicYears.find(year => year.id.toString() === selectedAcademicYear)?.year ||
                                         `${academicYears.find(year => year.id.toString() === selectedAcademicYear)?.start_year}-${academicYears.find(year => year.id.toString() === selectedAcademicYear)?.end_year}`}
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => refetchUnpaid()}
                    disabled={unpaidLoading}
                    className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${unpaidLoading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {unpaidLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center space-x-3 text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading salary data...</span>
                  </div>
                </div>
              ) : unpaidError ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500">{unpaidError?.data?.message || 'Unable to load salary data'}</p>
                    <button 
                      onClick={() => refetchUnpaid()}
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : unpaidSalaries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Records Found</h3>
                  <p className="text-gray-500 mb-4">
                    No unpaid salary records found for {selectedMonth}. 
                  </p>
                  <button
                    onClick={handleGenerateSalaries}
                    disabled={isGenerating || !selectedAcademicYear}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed"
                  >
                    Generate Salaries for {selectedMonth}
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary Month
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Salary
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Amount
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unpaidSalaries.map((salary, index) => (
                      <tr key={salary.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-orange-100 p-2 rounded-full mr-3">
                              <User className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {salary.employee_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Record ID: {salary.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{salary.employee_user_id}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{salary.salary_month}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {salary.total_salary ? `৳${formatCurrency(salary.total_salary)}` : 'Not Set'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ৳{formatCurrency(salary.payment_amount)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            salary.salary_status === 'unpaid' 
                              ? 'bg-red-100 text-red-800' 
                              : salary.salary_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
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
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(salary.updated_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer with summary */}
            {!unpaidLoading && unpaidSalaries.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4 text-sm text-gray-700">
                    <span>
                      Total: <span className="font-medium">{unpaidSalaries.length}</span> employees
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>
                      Unpaid: <span className="font-medium text-red-600">{getUnpaidCount()}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>Total Unpaid Amount:</span>
                      <span className="font-semibold text-orange-700">
                        ৳{formatCurrency(getTotalUnpaidAmount())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryAllocation;