import React, { useState, useEffect } from 'react';
import { useGetAccountGroupCategoriesQuery, useGetAccountSubCategoriesQuery } from '../../../redux/features/api/accounts/ledger/gcategory/accountSubGroupApi';
import { useCreateLedgerEntryMutation } from '../../../redux/features/api/accounts/ledger/ledgerListApi';
import LedgerTable from './LedgerTable';
import { Plus, X, Save, RotateCcw, AlertCircle, CheckCircle, Info } from 'lucide-react';


const LedgerCreate = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category: '',
    group: '',
    ledger: '',
    opening_balance: '',
    description: '',
    is_active: true
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [refreshTable, setRefreshTable] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  // API hooks
  const { 
    data: subCategories = [], 
    isLoading: subCategoriesLoading, 
    error: subCategoriesError 
  } = useGetAccountSubCategoriesQuery();

  const { 
    data: groupCategories = [], 
    isLoading: groupCategoriesLoading, 
    error: groupCategoriesError 
  } = useGetAccountGroupCategoriesQuery(selectedSubCategory, {
    skip: !selectedSubCategory
  });

  const [createLedgerEntry, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateLedgerEntryMutation();

  // Reset group when subcategory changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, group: '' }));
  }, [selectedSubCategory]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.category) errors.category = 'Account category is required';
    if (!formData.group) errors.group = 'Account group is required';
    if (!formData.ledger.trim()) errors.ledger = 'Ledger name is required';
    if (!formData.opening_balance.trim()) {
      errors.opening_balance = 'Opening balance is required';
    } else if (isNaN(formData.opening_balance) || formData.opening_balance < 0) {
      errors.opening_balance = 'Opening balance must be a valid positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
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

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedSubCategory(value);
    setFormData(prev => ({
      ...prev,
      category: value,
      group: '' // Reset group selection
    }));

    // Clear validation errors
    if (validationErrors.category) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await createLedgerEntry(formData).unwrap();
      
      // Reset form
      setFormData({
        category: '',
        group: '',
        ledger: '',
        opening_balance: '',
        description: '',
        is_active: true
      });
      setSelectedSubCategory('');
      setValidationErrors({});
      
      // Trigger table refresh
      setRefreshTable(prev => prev + 1);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error('Failed to create ledger entry:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      category: '',
      group: '',
      ledger: '',
      opening_balance: '',
      description: '',
      is_active: true
    });
    setSelectedSubCategory('');
    setValidationErrors({});
  };

  const handleCancel = () => {
    handleReset();
    if (onCancel) {
      onCancel();
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || (createError?.data?.errors?.[fieldName]?.[0]);
  };

  if (subCategoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center space-x-3 text-red-700">
              <AlertCircle size={24} />
              <div>
                <h3 className="font-semibold">Error Loading Data</h3>
                <p className="text-sm">{subCategoriesError?.data?.message || 'Unable to load account categories'}</p>
              </div>
            </div>
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
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ledger Management</h1>
                <p className="text-gray-600 text-sm">Create and manage your chart of accounts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showForm 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showForm ? 'Hide Form' : 'New Ledger'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Create Form Section */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New Ledger Account</span>
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
                      <p className="font-medium">Error creating ledger entry</p>
                      <p className="text-sm">{createError?.data?.message || 'Please check your input and try again'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Account Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Category
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleSubCategoryChange}
                      disabled={subCategoriesLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        getFieldError('category') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {subCategoriesLoading ? 'Loading categories...' : 'Select Account Category'}
                      </option>
                      {subCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.code})
                        </option>
                      ))}
                    </select>
                    {getFieldError('category') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('category')}</span>
                      </p>
                    )}
                  </div>

                  {/* Account Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Group
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="group"
                      value={formData.group}
                      onChange={handleInputChange}
                      disabled={!selectedSubCategory || groupCategoriesLoading}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        getFieldError('group') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } disabled:bg-gray-100`}
                    >
                      <option value="">
                        {!selectedSubCategory 
                          ? 'First select a category' 
                          : groupCategoriesLoading 
                          ? 'Loading groups...' 
                          : 'Select Account Group'
                        }
                      </option>
                      {groupCategories.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    {getFieldError('group') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('group')}</span>
                      </p>
                    )}
                    {groupCategoriesError && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>Error loading groups: {groupCategoriesError?.data?.message || 'Unknown error'}</span>
                      </p>
                    )}
                  </div>

                  {/* Ledger Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ledger Account Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="ledger"
                      value={formData.ledger}
                      onChange={handleInputChange}
                      placeholder="e.g., Cash in Hand, Accounts Receivable, Bank of America"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        getFieldError('ledger') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {getFieldError('ledger') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('ledger')}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Opening Balance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Balance
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="opening_balance"
                        value={formData.opening_balance}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          getFieldError('opening_balance') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {getFieldError('opening_balance') && (
                      <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle size={16} />
                        <span>{getFieldError('opening_balance')}</span>
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1 flex items-center space-x-1">
                      <Info size={16} />
                      <span>Enter the initial balance for this account</span>
                    </p>
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
                      placeholder="Additional details about this ledger account (optional)"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors"
                    />
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Account Status</h4>
                        <p className="text-sm text-gray-500">Enable this account for transactions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full relative transition-colors ${
                          formData.is_active ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            formData.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}></div>
                        </div>
                        <span className={`ml-3 text-sm font-medium ${
                          formData.is_active ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {formData.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
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
                  <RotateCcw size={18} />
                  <span>Reset</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCreating}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors min-w-[140px] justify-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ledger Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Chart of Accounts</h2>
            <p className="text-gray-600 text-sm">Manage your existing ledger accounts</p>
          </div>
          <LedgerTable refreshTrigger={refreshTable} />
        </div>
      </div>
    </div>
  );
};

export default LedgerCreate;