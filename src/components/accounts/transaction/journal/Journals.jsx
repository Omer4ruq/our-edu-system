import React, { useState, useEffect, useMemo } from 'react';


import { Calendar, FileText, Plus, X, Save, Edit, Trash2, Search, Filter, Eye, Download, RefreshCw, AlertCircle, CheckCircle, MoreHorizontal, BookOpen, DollarSign, Scale, Minus } from 'lucide-react';
import { useGetLedgerOptionsQuery } from '../../../../redux/features/api/accounts/ledger/ledgerListApi';
import { useCreateJournalMutation, useDeleteJournalMutation, useGetJournalsQuery } from '../../../../redux/features/api/accounts/journal/journalsApi';

const Journal = () => {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    voucher_no: '',
    description: ''
  });
  const [entries, setEntries] = useState([
    {
      id: Date.now(),
      ledger_id: '',
      entry_type: 'Debit',
      amount: '',
      description: ''
    }
  ]);
  const [refreshTable, setRefreshTable] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // API hooks
  const { 
    data: ledgerOptions = { cash_ledgers: [], expense_ledgers: [], income_ledgers: [] }, 
    isLoading: ledgerOptionsLoading 
  } = useGetLedgerOptionsQuery();

  const { 
    data: journalsResponse = { results: [], count: 0 }, 
    isLoading: journalsLoading, 
    error: journalsError,
    refetch: refetchJournals
  } = useGetJournalsQuery();

  const journals = journalsResponse.results || [];

  const [createJournal, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateJournalMutation();

  // Combine all ledgers from different categories
  const allLedgers = useMemo(() => {
    return [
      ...ledgerOptions.cash_ledgers.map(ledger => ({ ...ledger, category: 'Cash' })),
      ...ledgerOptions.expense_ledgers.map(ledger => ({ ...ledger, category: 'Expense' })),
      ...ledgerOptions.income_ledgers.map(ledger => ({ ...ledger, category: 'Income' }))
    ];
  }, [ledgerOptions]);

  // Calculate totals
  const totals = useMemo(() => {
    const debitTotal = entries
      .filter(entry => entry.entry_type === 'Debit' && entry.amount)
      .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    const creditTotal = entries
      .filter(entry => entry.entry_type === 'Credit' && entry.amount)
      .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    return { debitTotal, creditTotal, difference: debitTotal - creditTotal };
  }, [entries]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.voucher_no.trim()) errors.voucher_no = 'Voucher number is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    // Check if we have at least one debit and one credit
    const hasDebit = entries.some(entry => entry.entry_type === 'Debit' && entry.ledger_id && entry.amount);
    const hasCredit = entries.some(entry => entry.entry_type === 'Credit' && entry.ledger_id && entry.amount);
    
    if (!hasDebit) errors.entries = 'At least one Debit entry is required';
    if (!hasCredit) errors.entries = 'At least one Credit entry is required';
    
    // Check if totals are balanced
    if (Math.abs(totals.difference) > 0.01) {
      errors.balance = 'Debit and Credit totals must be equal';
    }
    
    // Validate individual entries
    entries.forEach((entry, index) => {
      if (entry.ledger_id && (!entry.amount || parseFloat(entry.amount) <= 0)) {
        errors[`entry_${index}_amount`] = 'Amount is required and must be positive';
      }
      if (entry.amount && !entry.ledger_id) {
        errors[`entry_${index}_ledger`] = 'Ledger account is required';
      }
    });

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

  const handleEntryChange = (index, field, value) => {
    setEntries(prev => 
      prev.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    );

    // Clear validation errors for this entry
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`entry_${index}_${field}`];
      delete newErrors[`entry_${index}_amount`];
      delete newErrors[`entry_${index}_ledger`];
      delete newErrors.balance;
      delete newErrors.entries;
      return newErrors;
    });
  };

  const addEntry = () => {
    setEntries(prev => [
      ...prev,
      {
        id: Date.now(),
        ledger_id: '',
        entry_type: 'Debit',
        amount: '',
        description: ''
      }
    ]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const journalData = {
        voucher_no: formData.voucher_no,
        date: formData.date,
        description: formData.description,
        entries: entries
          .filter(entry => entry.ledger_id && entry.amount)
          .map(entry => ({
            ledger_id: parseInt(entry.ledger_id),
            entry_type: entry.entry_type,
            amount: parseFloat(entry.amount).toFixed(2),
            description: entry.description || formData.description
          }))
      };
      
      await createJournal(journalData).unwrap();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        voucher_no: '',
        description: ''
      });
      setEntries([{
        id: Date.now(),
        ledger_id: '',
        entry_type: 'Debit',
        amount: '',
        description: ''
      }]);
      setValidationErrors({});
      
      // Trigger table refresh
      setRefreshTable(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to create journal:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      voucher_no: '',
      description: ''
    });
    setEntries([{
      id: Date.now(),
      ledger_id: '',
      entry_type: 'Debit',
      amount: '',
      description: ''
    }]);
    setValidationErrors({});
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || (createError?.data?.errors?.[fieldName]?.[0]);
  };

  const getLedgerName = (ledgerId) => {
    const ledger = allLedgers.find(l => l.id === parseInt(ledgerId));
    return ledger ? `${ledger.name} (${ledger.category})` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Journal Management</h1>
                <p className="text-gray-600 text-sm">Create and manage double-entry journal transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showForm 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {showForm ? 'Hide Form' : 'New Journal Entry'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Journal Creation Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New Journal Entry</span>
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
                      <p className="font-medium">Error creating journal entry</p>
                      <p className="text-sm">{createError?.data?.message || 'Please check your input and try again'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance Summary */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-medium">Total Debit</span>
                    <span className="text-blue-900 font-bold">৳{totals.debitTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Total Credit</span>
                    <span className="text-green-900 font-bold">৳{totals.creditTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className={`border rounded-lg p-4 ${
                  Math.abs(totals.difference) < 0.01 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium flex items-center space-x-1 ${
                      Math.abs(totals.difference) < 0.01 ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      <Scale size={16} />
                      <span>Difference</span>
                    </span>
                    <span className={`font-bold ${
                      Math.abs(totals.difference) < 0.01 ? 'text-emerald-900' : 'text-red-900'
                    }`}>
                      ৳{Math.abs(totals.difference).toFixed(2)}
                    </span>
                  </div>
                  {Math.abs(totals.difference) < 0.01 && (
                    <p className="text-emerald-600 text-xs mt-1">✓ Balanced</p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
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

                {/* Voucher Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voucher Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="voucher_no"
                      value={formData.voucher_no}
                      onChange={handleInputChange}
                      placeholder="e.g., JRNL20250808001"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        getFieldError('voucher_no') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {getFieldError('voucher_no') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle size={16} />
                      <span>{getFieldError('voucher_no')}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Journal Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Purchase of office supplies"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      getFieldError('description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('description') && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle size={16} />
                      <span>{getFieldError('description')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Journal Entries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
                  <button
                    onClick={addEntry}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Entry</span>
                  </button>
                </div>

                {entries.map((entry, index) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Entry #{index + 1}</h4>
                      {entries.length > 1 && (
                        <button
                          onClick={() => removeEntry(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remove Entry"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Account Ledger */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Ledger
                        </label>
                        <select
                          value={entry.ledger_id}
                          onChange={(e) => handleEntryChange(index, 'ledger_id', e.target.value)}
                          disabled={ledgerOptionsLoading}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            getFieldError(`entry_${index}_ledger`) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Account</option>
                          {allLedgers.map((ledger) => (
                            <option key={ledger.id} value={ledger.id}>
                              {ledger.name} ({ledger.category})
                            </option>
                          ))}
                        </select>
                        {getFieldError(`entry_${index}_ledger`) && (
                          <p className="text-red-600 text-xs mt-1">{getFieldError(`entry_${index}_ledger`)}</p>
                        )}
                      </div>

                      {/* Entry Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={entry.entry_type}
                          onChange={(e) => handleEntryChange(index, 'entry_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        >
                          <option value="Debit">Debit</option>
                          <option value="Credit">Credit</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">৳</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.amount}
                            onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                              getFieldError(`entry_${index}_amount`) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {getFieldError(`entry_${index}_amount`) && (
                          <p className="text-red-600 text-xs mt-1">{getFieldError(`entry_${index}_amount`)}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                          placeholder="Entry description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Errors */}
              {(getFieldError('entries') || getFieldError('balance')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      {getFieldError('entries') && (
                        <p className="font-medium">{getFieldError('entries')}</p>
                      )}
                      {getFieldError('balance') && (
                        <p className="font-medium">{getFieldError('balance')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={isCreating || Math.abs(totals.difference) > 0.01}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Journal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Journal Table */}
        <JournalTable refreshTrigger={refreshTable} allLedgers={allLedgers} />
      </div>
    </div>
  );
};

// Journal Table Component
const JournalTable = ({ refreshTrigger, allLedgers }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // API hooks
  const { 
    data: journalsResponse = { results: [], count: 0 }, 
    isLoading: journalsLoading, 
    error: journalsError,
    refetch: refetchJournals
  } = useGetJournalsQuery();

  const journals = journalsResponse.results || [];

  const [deleteJournal, { isLoading: isDeleting }] = useDeleteJournalMutation();

  // Filter journals
  const filteredJournals = journals.filter(journal => {
    const matchesSearch = !filters.searchTerm || 
      journal.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      journal.voucher_no?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      journal.entries?.some(entry => 
        entry.ledger?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    
    const matchesDateFrom = !filters.dateFrom || new Date(journal.date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(journal.date) <= new Date(filters.dateTo);

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleDelete = async (id, voucher_no) => {
    if (window.confirm(`Are you sure you want to delete journal "${voucher_no}"?`)) {
      try {
        await deleteJournal(id).unwrap();
        refetchJournals();
      } catch (error) {
        console.error('Failed to delete journal:', error);
      }
    }
  };

  const toggleRowExpansion = (journalId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(journalId)) {
        newSet.delete(journalId);
      } else {
        newSet.add(journalId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const getLedgerName = (ledgerName) => {
    // Since the API returns ledger names directly as strings, just return them
    return ledgerName || 'Unknown Ledger';
  };

  const getJournalTotal = (entries) => {
    return entries
      .filter(entry => entry.entry_type === 'Debit')
      .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  };

  if (journalsError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error Loading Journals</h3>
              <p className="text-sm">{journalsError?.data?.message || 'Unable to load journal data'}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Journal Entries</h2>
            <p className="text-gray-600 text-sm">Manage your double-entry journal transactions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Search by voucher, description, ledger names..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || filters.dateFrom || filters.dateTo
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <button 
              onClick={() => refetchJournals()}
              disabled={journalsLoading}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${journalsLoading ? 'animate-spin' : ''}`} />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
        {journalsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading journal entries...</span>
            </div>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
            <p className="text-gray-500">
              {journals.length === 0 
                ? 'No journal entries have been created yet.' 
                : 'No entries match your current filters.'}
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
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJournals.map((journal, index) => (
                <React.Fragment key={journal.id}>
                  {/* Main Row */}
                  <tr className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(journal.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer" 
                           onClick={() => toggleRowExpansion(journal.id)}>
                        {journal.voucher_no}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {journal.voucher_no.startsWith('OPEN-') ? 'Opening Balance' :
                         journal.voucher_no.includes('PAY') ? 'Payment' :
                         journal.voucher_no.includes('REC') ? 'Receipt' :
                         journal.voucher_no.includes('CONTRA') ? 'Transfer' :
                         'Manual Entry'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{journal.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {journal.entries?.length || 0} entries • 
                        {journal.entries?.filter(e => e.entry_type === 'Debit').length || 0} debits, 
                        {journal.entries?.filter(e => e.entry_type === 'Credit').length || 0} credits
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        ৳{formatCurrency(getJournalTotal(journal.entries || []))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleRowExpansion(journal.id)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          expandedRows.has(journal.id)
                            ? 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        <span>{journal.entries?.length || 0} entries</span>
                        <Eye size={14} className={expandedRows.has(journal.id) ? 'rotate-180' : ''} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => toggleRowExpansion(journal.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Entries"
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
                                onClick={() => toggleRowExpansion(journal.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Eye size={14} />
                                <span>View Entries</span>
                              </button>
                              <button
                                onClick={() => {}}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Edit size={14} />
                                <span>Edit Journal</span>
                              </button>
                              <button
                                onClick={() => {}}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <Download size={14} />
                                <span>Print Journal</span>
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDelete(journal.id, journal.voucher_no)}
                                disabled={isDeleting}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                <span>Delete Journal</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row - Journal Entries */}
                  {expandedRows.has(journal.id) && (
                    <tr>
                      <td colSpan="6" className="px-0 py-0">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-l-4 border-indigo-400">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-indigo-900 flex items-center space-x-2">
                              <BookOpen size={18} />
                              <span>Journal Entries - {journal.voucher_no}</span>
                            </h4>
                            <div className="text-sm text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                              Date: {new Date(journal.date).toLocaleDateString('en-GB')}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg shadow-sm border border-indigo-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-indigo-200">
                              <thead className="bg-indigo-100">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Account Ledger
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Debit (Dr.)
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                                    Credit (Cr.)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {journal.entries?.map((entry, entryIndex) => (
                                  <tr key={entryIndex} className="hover:bg-indigo-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                          entry.entry_type === 'Debit' ? 'bg-blue-500' : 'bg-green-500'
                                        }`}></div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {getLedgerName(entry.ledger)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {entry.entry_type} Entry
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-gray-700">
                                        {entry.description || journal.description}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      {entry.entry_type === 'Debit' ? (
                                        <div>
                                          <div className="text-sm font-semibold text-blue-700">
                                            ৳{formatCurrency(entry.amount)}
                                          </div>
                                          <div className="text-xs text-blue-600">Dr.</div>
                                        </div>
                                      ) : (
                                        <div className="text-gray-400 text-sm">-</div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      {entry.entry_type === 'Credit' ? (
                                        <div>
                                          <div className="text-sm font-semibold text-green-700">
                                            ৳{formatCurrency(entry.amount)}
                                          </div>
                                          <div className="text-xs text-green-600">Cr.</div>
                                        </div>
                                      ) : (
                                        <div className="text-gray-400 text-sm">-</div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              
                              {/* Totals Footer */}
                              <tfoot className="bg-gray-50 border-t-2 border-indigo-300">
                                <tr>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan="2">
                                    <div className="flex items-center space-x-2">
                                      <Scale size={16} className="text-indigo-600" />
                                      <span>TOTALS:</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right border-t border-gray-300">
                                    <div className="text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded">
                                      ৳{formatCurrency(
                                        journal.entries?.filter(e => e.entry_type === 'Debit')
                                          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0
                                      )}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">Total Debit</div>
                                  </td>
                                  <td className="px-6 py-4 text-right border-t border-gray-300">
                                    <div className="text-sm font-bold text-green-800 bg-green-100 px-3 py-1 rounded">
                                      ৳{formatCurrency(
                                        journal.entries?.filter(e => e.entry_type === 'Credit')
                                          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0
                                      )}
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">Total Credit</div>
                                  </td>
                                </tr>
                                
                                {/* Balance Verification */}
                                <tr>
                                  <td colSpan="4" className="px-6 py-3 bg-indigo-50">
                                    <div className="flex items-center justify-center space-x-4">
                                      {Math.abs(
                                        (journal.entries?.filter(e => e.entry_type === 'Debit')
                                          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0) -
                                        (journal.entries?.filter(e => e.entry_type === 'Credit')
                                          .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0)
                                      ) < 0.01 ? (
                                        <div className="flex items-center space-x-2 text-green-700">
                                          <CheckCircle size={16} />
                                          <span className="text-sm font-medium">Balanced Entry ✓</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-2 text-red-700">
                                          <AlertCircle size={16} />
                                          <span className="text-sm font-medium">Unbalanced Entry</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with summary */}
      {!journalsLoading && filteredJournals.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{filteredJournals.length}</span> of{' '}
                <span className="font-medium">{journalsResponse.count || 0}</span> journal entries
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Page <span className="font-medium">{journalsResponse.current_page || 1}</span> of{' '}
                <span className="font-medium">{journalsResponse.num_pages || 1}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Total Journal Amount:</span>
                <span className="font-semibold text-indigo-700">
                  ৳{formatCurrency(
                    filteredJournals.reduce((sum, journal) => 
                      sum + getJournalTotal(journal.entries || []), 0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>This Month:</span>
                <span className="font-semibold text-indigo-700">
                  ৳{formatCurrency(
                    filteredJournals
                      .filter(journal => {
                        const journalDate = new Date(journal.date);
                        const now = new Date();
                        return journalDate.getMonth() === now.getMonth() && 
                               journalDate.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, journal) => sum + getJournalTotal(journal.entries || []), 0)
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

export default Journal;