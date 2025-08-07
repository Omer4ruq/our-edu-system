import React, { useState, useEffect } from 'react';
import { useGetPaymentsQuery, useCreatePaymentMutation, useUpdatePaymentMutation, useDeletePaymentMutation } from "../../../../redux/features/api/accounts/payment/paymentsApi";
import { useGetLedgerOptionsQuery } from "../../../../redux/features/api/accounts/ledger/ledgerListApi";
import { Calendar, CreditCard, DollarSign, FileText, Plus, X, Save, Edit, Trash2, Search, Filter, Eye, Download, RefreshCw, AlertCircle, CheckCircle, MoreHorizontal } from 'lucide-react';

const Payment = () => {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cash_ledger: '',
    expense_ledger: '',
    amount: '',
    description: ''
  });
  const [refreshTable, setRefreshTable] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // API hooks
  const { 
    data: ledgerOptions = { cash_ledgers: [], expense_ledgers: [], income_ledgers: [] }, 
    isLoading: ledgerOptionsLoading 
  } = useGetLedgerOptionsQuery();

  const { 
    data: payments = [], 
    isLoading: paymentsLoading, 
    error: paymentsError,
    refetch: refetchPayments
  } = useGetPaymentsQuery();

  const [createPayment, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreatePaymentMutation();

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.cash_ledger) errors.cash_ledger = 'Payment by account is required';
    if (!formData.expense_ledger) errors.expense_ledger = 'Payment for account is required';
    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be a valid positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      await createPayment(paymentData).unwrap();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        cash_ledger: '',
        expense_ledger: '',
        amount: '',
        description: ''
      });
      setValidationErrors({});
      
      // Trigger table refresh
      setRefreshTable(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      cash_ledger: '',
      expense_ledger: '',
      amount: '',
      description: ''
    });
    setValidationErrors({});
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || (createError?.data?.errors?.[fieldName]?.[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-gray-600 text-sm">Create and manage payment transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showForm 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {showForm ? 'Hide Form' : 'New Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Payment Creation Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New Payment</span>
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Success/Error Messages */}
              {createError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div className="text-red-800">
                      <p className="font-medium">Error creating payment</p>
                      <p className="text-sm">{createError?.data?.message || 'Please check your input and try again'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                          getFieldError('date') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {getFieldError('date') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('date')}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment By (Cash Account)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="cash_ledger"
                      value={formData.cash_ledger}
                      onChange={handleInputChange}
                      disabled={ledgerOptionsLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        getFieldError('cash_ledger') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {ledgerOptionsLoading ? 'Loading accounts...' : 'Select cash account'}
                      </option>
                      {ledgerOptions.cash_ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.id}>
                          {ledger.name}
                        </option>
                      ))}
                    </select>
                    {getFieldError('cash_ledger') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('cash_ledger')}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment For */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment For (Expense Account)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="expense_ledger"
                      value={formData.expense_ledger}
                      onChange={handleInputChange}
                      disabled={ledgerOptionsLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                        getFieldError('expense_ledger') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {ledgerOptionsLoading ? 'Loading accounts...' : 'Select expense account'}
                      </option>
                      {ledgerOptions.expense_ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.id}>
                          {ledger.name}
                        </option>
                      ))}
                    </select>
                    {getFieldError('expense_ledger') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('expense_ledger')}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <span className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                          getFieldError('amount') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {getFieldError('amount') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('amount')}</span>
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Additional payment details (optional)"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <X size={18} />
                  <span>Reset</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <PaymentTable refreshTrigger={refreshTable} />
      </div>
    </div>
  );
};

// Payment Table Component
const PaymentTable = ({ refreshTrigger }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // API hooks
  const { 
    data: paymentsResponse = { results: [], count: 0 }, 
    isLoading: paymentsLoading, 
    error: paymentsError,
    refetch: refetchPayments
  } = useGetPaymentsQuery();

  const payments = paymentsResponse.results || [];

  const { 
    data: ledgerOptions = { cash_ledgers: [], expense_ledgers: [] }, 
    isLoading: ledgerOptionsLoading 
  } = useGetLedgerOptionsQuery();

  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !filters.searchTerm || 
      payment.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      payment.voucher_no?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      payment.expense_ledger?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      payment.cash_ledger?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      payment.amount?.toString().includes(filters.searchTerm);
    
    const matchesDateFrom = !filters.dateFrom || new Date(payment.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(payment.date) <= new Date(filters.dateTo);

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleEdit = (payment) => {
    setEditingId(payment.id);
    setEditFormData({
      date: payment.date || '',
      voucher_no: payment.voucher_no || '',
      cash_ledger: payment.cash_ledger || '',
      expense_ledger: payment.expense_ledger || '',
      amount: payment.amount || '',
      description: payment.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await updatePayment({ id, ...editFormData }).unwrap();
      setEditingId(null);
      setEditFormData({});
      refetchPayments();
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  const handleDelete = async (id, voucher_no) => {
    if (window.confirm(`Are you sure you want to delete payment "${voucher_no}"?`)) {
      try {
        await deletePayment(id).unwrap();
        refetchPayments();
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const getLedgerName = (ledgerName) => {
    // Since the API returns ledger names directly as strings, just return them
    return ledgerName || 'Unknown';
  };

  if (paymentsError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error Loading Payments</h3>
              <p className="text-sm">{paymentsError?.data?.message || 'Unable to load payment data'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            <p className="text-gray-600 text-sm">Manage your payment transactions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search by voucher, description, ledgers..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || filters.dateFrom || filters.dateTo
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <button 
              onClick={() => refetchPayments()}
              disabled={paymentsLoading}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ searchTerm: '', dateFrom: '', dateTo: '' })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {paymentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading payments...</span>
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">
              {payments.length === 0 
                ? 'No payments have been created yet.' 
                : 'No payments match your current filters.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher No
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense Account
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment, index) => (
                <tr key={payment.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {editingId === payment.id ? (
                    // Edit Mode
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="reference"
                          value={editFormData.reference}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="payment_by"
                          value={editFormData.payment_by}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {ledgerOptions.cash_ledgers.map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                              {ledger.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="payment_for"
                          value={editFormData.payment_for}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {ledgerOptions.expense_ledgers.map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                              {ledger.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          name="amount"
                          value={editFormData.amount}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(payment.id)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(payment.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blue-600">{payment.voucher_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-900">{getLedgerName(payment.cash_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-900">{getLedgerName(payment.expense_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ৳{formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Payment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {}}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <div className="relative group">
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(payment)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit size={14} />
                                  <span>Edit Payment</span>
                                </button>
                                <button
                                  onClick={() => {}}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Eye size={14} />
                                  <span>View Details</span>
                                </button>
                                <button
                                  onClick={() => {}}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Download size={14} />
                                  <span>Print Receipt</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDelete(payment.id, payment.voucher_no)}
                                  disabled={isDeleting}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Payment</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with summary */}
      {!paymentsLoading && filteredPayments.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{filteredPayments.length}</span> of{' '}
                <span className="font-medium">{paymentsResponse.count || 0}</span> payments
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Page <span className="font-medium">{paymentsResponse.current_page || 1}</span> of{' '}
                <span className="font-medium">{paymentsResponse.num_pages || 1}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Total Amount:</span>
                <span className="font-semibold text-gray-900">
                  ৳{formatCurrency(
                    filteredPayments.reduce((sum, payment) => 
                      sum + parseFloat(payment.amount || 0), 0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>This Month:</span>
                <span className="font-semibold text-green-700">
                  ৳{formatCurrency(
                    filteredPayments
                      .filter(payment => {
                        const paymentDate = new Date(payment.date);
                        const now = new Date();
                        return paymentDate.getMonth() === now.getMonth() && 
                               paymentDate.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;