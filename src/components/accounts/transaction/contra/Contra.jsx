import React, { useState, useEffect } from 'react';


import { Calendar, DollarSign, ArrowLeftRight, Plus, X, Save, Edit, Trash2, Search, Filter, Eye, Download, RefreshCw, AlertCircle, CheckCircle, MoreHorizontal, Repeat } from 'lucide-react';
import { useGetLedgerOptionsQuery } from '../../../../redux/features/api/accounts/ledger/ledgerListApi';
import { useCreateContraMutation, useDeleteContraMutation, useGetContraListQuery, useUpdateContraMutation } from '../../../../redux/features/api/accounts/contra/contraApi';

const Contra = () => {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    from_ledger: '',
    to_ledger: '',
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
    data: contraResponse = { results: [], count: 0 }, 
    isLoading: contraLoading, 
    error: contraError,
    refetch: refetchContras
  } = useGetContraListQuery();

  const contras = contraResponse.results || [];

  const [createContra, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateContraMutation();

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.from_ledger) errors.from_ledger = 'From cash account is required';
    if (!formData.to_ledger) errors.to_ledger = 'To cash account is required';
    if (formData.from_ledger && formData.to_ledger && formData.from_ledger === formData.to_ledger) {
      errors.to_ledger = 'To account must be different from From account';
      errors.from_ledger = 'From account must be different from To account';
    }
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

    // Also clear the other ledger error if user changes selection to make them different
    if ((name === 'from_ledger' || name === 'to_ledger') && validationErrors.from_ledger && validationErrors.to_ledger) {
      const otherField = name === 'from_ledger' ? 'to_ledger' : 'from_ledger';
      const otherValue = name === 'from_ledger' ? formData.to_ledger : formData.from_ledger;
      
      if (value !== otherValue) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.from_ledger;
          delete newErrors.to_ledger;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const contraData = {
        date: formData.date,
        from_ledger: parseInt(formData.from_ledger),
        to_ledger: parseInt(formData.to_ledger),
        amount: parseFloat(formData.amount),
        description: formData.description
      };
      
      await createContra(contraData).unwrap();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        from_ledger: '',
        to_ledger: '',
        amount: '',
        description: ''
      });
      setValidationErrors({});
      
      // Trigger table refresh
      setRefreshTable(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to create contra:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      from_ledger: '',
      to_ledger: '',
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
              <div className="bg-purple-600 p-2 rounded-lg">
                <ArrowLeftRight className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contra Management</h1>
                <p className="text-gray-600 text-sm">Transfer funds between cash accounts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showForm 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {showForm ? 'Hide Form' : 'New Transfer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Contra Creation Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New Fund Transfer</span>
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
                      <p className="font-medium">Error creating fund transfer</p>
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
                      Transfer Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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

                  {/* From Ledger */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Cash Account
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="from_ledger"
                      value={formData.from_ledger}
                      onChange={handleInputChange}
                      disabled={ledgerOptionsLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        getFieldError('from_ledger') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {ledgerOptionsLoading ? 'Loading accounts...' : 'Select source account'}
                      </option>
                      {ledgerOptions.cash_ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.id}>
                          {ledger.name}
                        </option>
                      ))}
                    </select>
                    {getFieldError('from_ledger') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('from_ledger')}</span>
                      </p>
                    )}
                  </div>

                  {/* To Ledger */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Cash Account
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="to_ledger"
                      value={formData.to_ledger}
                      onChange={handleInputChange}
                      disabled={ledgerOptionsLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                        getFieldError('to_ledger') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {ledgerOptionsLoading ? 'Loading accounts...' : 'Select destination account'}
                      </option>
                      {ledgerOptions.cash_ledgers.map((ledger) => (
                        <option 
                          key={ledger.id} 
                          value={ledger.id}
                          disabled={ledger.id.toString() === formData.from_ledger}
                          className={ledger.id.toString() === formData.from_ledger ? 'text-gray-400 bg-gray-100' : ''}
                        >
                          {ledger.name}
                          {ledger.id.toString() === formData.from_ledger && ' (Selected as From Account)'}
                        </option>
                      ))}
                    </select>
                    {getFieldError('to_ledger') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('to_ledger')}</span>
                      </p>
                    )}
                    {formData.from_ledger && (
                      <p className="text-gray-500 text-sm mt-1 flex items-center space-x-1">
                        <ArrowLeftRight size={16} />
                        <span>Cannot select the same account as From account</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer Amount
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
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
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

                  {/* Transfer Preview */}
                  {formData.from_ledger && formData.to_ledger && formData.amount && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-3">Transfer Preview</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">From:</span>
                          <span className="font-medium text-gray-900">
                            {ledgerOptions.cash_ledgers.find(l => l.id.toString() === formData.from_ledger)?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-center py-2">
                          <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">To:</span>
                          <span className="font-medium text-gray-900">
                            {ledgerOptions.cash_ledgers.find(l => l.id.toString() === formData.to_ledger)?.name}
                          </span>
                        </div>
                        <div className="border-t border-purple-200 pt-2 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold text-purple-800">৳{formData.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Transfer details (optional)"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-colors"
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
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contra Table */}
        <ContraTable refreshTrigger={refreshTable} />
      </div>
    </div>
  );
};

// Contra Table Component
const ContraTable = ({ refreshTrigger }) => {
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
    data: contraResponse = { results: [], count: 0 }, 
    isLoading: contraLoading, 
    error: contraError,
    refetch: refetchContras
  } = useGetContraListQuery();

  const contras = contraResponse.results || [];

  const { 
    data: ledgerOptions = { cash_ledgers: [] }, 
    isLoading: ledgerOptionsLoading 
  } = useGetLedgerOptionsQuery();

  const [updateContra, { isLoading: isUpdating }] = useUpdateContraMutation();
  const [deleteContra, { isLoading: isDeleting }] = useDeleteContraMutation();

  // Filter contras
  const filteredContras = contras.filter(contra => {
    const matchesSearch = !filters.searchTerm || 
      contra.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contra.voucher_no?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contra.from_ledger?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contra.to_ledger?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contra.amount?.toString().includes(filters.searchTerm);
    
    const matchesDateFrom = !filters.dateFrom || new Date(contra.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(contra.date) <= new Date(filters.dateTo);

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleEdit = (contra) => {
    setEditingId(contra.id);
    setEditFormData({
      date: contra.date || '',
      voucher_no: contra.voucher_no || '',
      from_ledger: contra.from_ledger || '',
      to_ledger: contra.to_ledger || '',
      amount: contra.amount || '',
      description: contra.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateContra({ id, ...editFormData }).unwrap();
      setEditingId(null);
      setEditFormData({});
      refetchContras();
    } catch (error) {
      console.error('Failed to update contra:', error);
    }
  };

  const handleDelete = async (id, voucher_no) => {
    if (window.confirm(`Are you sure you want to delete transfer "${voucher_no}"?`)) {
      try {
        await deleteContra(id).unwrap();
        refetchContras();
      } catch (error) {
        console.error('Failed to delete contra:', error);
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

  if (contraError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error Loading Transfers</h3>
              <p className="text-sm">{contraError?.data?.message || 'Unable to load transfer data'}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Transfer History</h2>
            <p className="text-gray-600 text-sm">Manage your fund transfers between cash accounts</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search by voucher, description, ledgers..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || filters.dateFrom || filters.dateTo
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <button 
              onClick={() => refetchContras()}
              disabled={contraLoading}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${contraLoading ? 'animate-spin' : ''}`} />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        {contraLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading transfers...</span>
            </div>
          </div>
        ) : filteredContras.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ArrowLeftRight className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
            <p className="text-gray-500">
              {contras.length === 0 
                ? 'No fund transfers have been created yet.' 
                : 'No transfers match your current filters.'}
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
                  From Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Account
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
              {filteredContras.map((contra, index) => (
                <tr key={contra.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {editingId === contra.id ? (
                    // Edit Mode
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="voucher_no"
                          value={editFormData.voucher_no}
                          onChange={handleEditInputChange}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="from_ledger"
                          value={editFormData.from_ledger}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          name="to_ledger"
                          value={editFormData.to_ledger}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          {ledgerOptions.cash_ledgers.map((ledger) => (
                            <option 
                              key={ledger.id} 
                              value={ledger.id}
                              disabled={ledger.id.toString() === editFormData.from_ledger}
                              className={ledger.id.toString() === editFormData.from_ledger ? 'text-gray-400 bg-gray-100' : ''}
                            >
                              {ledger.name}
                              {ledger.id.toString() === editFormData.from_ledger && ' (Same as From)'}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(contra.id)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
                          {new Date(contra.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-purple-600">{contra.voucher_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{contra.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-900">{getLedgerName(contra.from_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-900">{getLedgerName(contra.to_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-purple-700">
                          ৳{formatCurrency(contra.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(contra)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Transfer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {}}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                                  onClick={() => handleEdit(contra)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit size={14} />
                                  <span>Edit Transfer</span>
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
                                  <Repeat size={14} />
                                  <span>Reverse Transfer</span>
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
                                  onClick={() => handleDelete(contra.id, contra.voucher_no)}
                                  disabled={isDeleting}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Transfer</span>
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
      {!contraLoading && filteredContras.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{filteredContras.length}</span> of{' '}
                <span className="font-medium">{contraResponse.count || 0}</span> transfers
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Page <span className="font-medium">{contraResponse.current_page || 1}</span> of{' '}
                <span className="font-medium">{contraResponse.num_pages || 1}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Total Transferred:</span>
                <span className="font-semibold text-purple-700">
                  ৳{formatCurrency(
                    filteredContras.reduce((sum, contra) => 
                      sum + parseFloat(contra.amount || 0), 0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>This Month:</span>
                <span className="font-semibold text-purple-700">
                  ৳{formatCurrency(
                    filteredContras
                      .filter(contra => {
                        const contraDate = new Date(contra.date);
                        const now = new Date();
                        return contraDate.getMonth() === now.getMonth() && 
                               contraDate.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, contra) => sum + parseFloat(contra.amount || 0), 0)
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

export default Contra;