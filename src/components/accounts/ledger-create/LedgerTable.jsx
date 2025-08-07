import React, { useState, useMemo } from 'react';
import { useGetLedgerListQuery, useUpdateLedgerEntryMutation, useDeleteLedgerEntryMutation } from '../../../redux/features/api/accounts/ledger/ledgerListApi';
import { Edit, Trash2, Search, Filter, ChevronDown, ChevronUp, MoreHorizontal, Eye, Copy, Archive, RefreshCw, Download, Settings } from 'lucide-react';

const LedgerTable = ({ refreshTrigger }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    group: '',
    searchTerm: '',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // detailed, compact

  // API hooks
  const { 
    data: ledgerList = [], 
    isLoading: ledgerLoading, 
    error: ledgerError,
    refetch: refetchLedgers
  } = useGetLedgerListQuery();

  const [updateLedgerEntry, { isLoading: isUpdating }] = useUpdateLedgerEntryMutation();
  const [deleteLedgerEntry, { isLoading: isDeleting }] = useDeleteLedgerEntryMutation();

  // Sort and filter ledger data
  const filteredAndSortedLedgerList = useMemo(() => {
    if (!ledgerList.length) return [];

    let filtered = ledgerList.filter(ledger => {
      const matchesCategory = !filters.category || 
        ledger.subcategory?.toLowerCase().includes(filters.category.toLowerCase());
      
      const matchesGroup = !filters.group || 
        ledger.group?.toLowerCase().includes(filters.group.toLowerCase());
      
      const matchesSearch = !filters.searchTerm || 
        ledger.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ledger.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ledger.code?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'active' && ledger.is_active) ||
        (filters.status === 'inactive' && !ledger.is_active);

      return matchesCategory && matchesGroup && matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle numeric fields
        if (sortConfig.key === 'current_balance') {
          aVal = parseFloat(aVal || 0);
          bVal = parseFloat(bVal || 0);
        }
        
        // Handle string fields
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [ledgerList, filters, sortConfig]);

  // Helper functions
  const getCategoryOptions = () => {
    const categories = [...new Set(ledgerList.map(ledger => ledger.subcategory).filter(Boolean))];
    return categories.sort();
  };

  const getGroupOptions = () => {
    let groups = ledgerList.map(ledger => ledger.group).filter(Boolean);
    
    if (filters.category) {
      groups = ledgerList
        .filter(ledger => ledger.subcategory?.toLowerCase().includes(filters.category.toLowerCase()))
        .map(ledger => ledger.group)
        .filter(Boolean);
    }
    
    return [...new Set(groups)].sort();
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredAndSortedLedgerList.map(ledger => ledger.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleEdit = (ledger) => {
    setEditingId(ledger.id);
    setEditFormData({
      name: ledger.name || '',
      code: ledger.code || '',
      category: ledger.category || '',
      subcategory: ledger.subcategory || '',
      group: ledger.group || '',
      balance_type: ledger.balance_type || 'Debit',
      current_balance: ledger.current_balance || '',
      description: ledger.description || '',
      is_active: ledger.is_active !== undefined ? ledger.is_active : true
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateLedgerEntry({ id, ...editFormData }).unwrap();
      setEditingId(null);
      setEditFormData({});
      refetchLedgers();
    } catch (error) {
      console.error('Failed to update ledger:', error);
    }
  };

  const handleDelete = async (id, ledgerName) => {
    if (window.confirm(`Are you sure you want to delete "${ledgerName}"?`)) {
      try {
        await deleteLedgerEntry(id).unwrap();
        refetchLedgers();
      } catch (error) {
        console.error('Failed to delete ledger:', error);
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      ...(filterType === 'category' && { group: '' })
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      group: '',
      searchTerm: '',
      status: 'all'
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  if (ledgerError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 text-red-700">
          <div className="bg-red-100 p-2 rounded-full">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Error Loading Ledger Data</h3>
            <p className="text-sm">{ledgerError?.data?.message || 'Unable to load ledger entries'}</p>
            <button 
              onClick={() => refetchLedgers()}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-2 flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Advanced Header Controls */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left side - Search and filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search accounts..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || Object.values(filters).some(v => v && v !== 'all')
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.values(filters).some(v => v && v !== 'all') && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(v => v && v !== 'all').length}
                </span>
              )}
            </button>

            {selectedRows.size > 0 && (
              <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-700 text-sm font-medium">
                  {selectedRows.size} selected
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>

          {/* Right side - View controls and actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Compact
              </button>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <button 
              onClick={() => refetchLedgers()}
              disabled={ledgerLoading}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${ledgerLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subcategories</option>
                  {getCategoryOptions().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                <select
                  value={filters.group}
                  onChange={(e) => handleFilterChange('group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Groups</option>
                  {getGroupOptions().map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {ledgerLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading ledger entries...</span>
            </div>
          </div>
        ) : filteredAndSortedLedgerList.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Archive className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {ledgerList.length === 0 
                ? 'No ledger accounts have been created yet. Create your first account to get started.' 
                : 'No accounts match your current filters. Try adjusting your search criteria.'}
            </p>
            {Object.values(filters).some(v => v && v !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredAndSortedLedgerList.length && filteredAndSortedLedgerList.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Account Name</span>
                    {getSortIcon('name')}
                  </div>
                </th>

                {viewMode === 'detailed' && (
                  <th 
                    onClick={() => handleSort('code')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Code</span>
                      {getSortIcon('code')}
                    </div>
                  </th>
                )}

                <th 
                  onClick={() => handleSort('category')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {getSortIcon('category')}
                  </div>
                </th>

                {viewMode === 'detailed' && (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Type
                    </th>
                  </>
                )}

                <th 
                  onClick={() => handleSort('current_balance')}
                  className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Current Balance</span>
                    {getSortIcon('current_balance')}
                  </div>
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedLedgerList.map((ledger, index) => (
                <tr 
                  key={ledger.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows.has(ledger.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {editingId === ledger.id ? (
                    // Edit Mode Row
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          disabled
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      {viewMode === 'detailed' && (
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            name="code"
                            value={editFormData.code}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <select
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Asset">Asset</option>
                          <option value="Liability">Liability</option>
                          <option value="Equity">Equity</option>
                          <option value="Income">Income</option>
                          <option value="Expense">Expense</option>
                        </select>
                      </td>
                      {viewMode === 'detailed' && (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              name="subcategory"
                              value={editFormData.subcategory}
                              onChange={handleEditInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              name="group"
                              value={editFormData.group}
                              onChange={handleEditInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              name="balance_type"
                              value={editFormData.balance_type}
                              onChange={handleEditInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Debit">Debit</option>
                              <option value="Credit">Credit</option>
                            </select>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          name="current_balance"
                          value={editFormData.current_balance}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={editFormData.is_active}
                            onChange={handleEditInputChange}
                            className="sr-only"
                          />
                          <div className={`w-8 h-5 rounded-full relative transition-colors ${
                            editFormData.is_active ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              editFormData.is_active ? 'translate-x-3' : 'translate-x-0'
                            }`}></div>
                          </div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(ledger.id)}
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
                    // View Mode Row
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(ledger.id)}
                          onChange={(e) => handleSelectRow(ledger.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ledger.name}</div>
                            {ledger.description && viewMode === 'detailed' && (
                              <div className="text-xs text-gray-500 mt-1">{ledger.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {viewMode === 'detailed' && (
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{ledger.code}</span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ledger.category === 'Asset' ? 'bg-green-100 text-green-800' :
                          ledger.category === 'Liability' ? 'bg-red-100 text-red-800' :
                          ledger.category === 'Equity' ? 'bg-blue-100 text-blue-800' :
                          ledger.category === 'Income' ? 'bg-purple-100 text-purple-800' :
                          ledger.category === 'Expense' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ledger.category}
                        </span>
                      </td>
                      {viewMode === 'detailed' && (
                        <>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{ledger.subcategory}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{ledger.group}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ledger.balance_type === 'Debit' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {ledger.balance_type}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ৳{formatCurrency(ledger.current_balance)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ledger.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ledger.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(ledger)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Account"
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
                          <button
                            onClick={() => {}}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Copy Account"
                          >
                            <Copy size={16} />
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
                                  onClick={() => handleEdit(ledger)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit size={14} />
                                  <span>Edit Account</span>
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
                                  <Copy size={14} />
                                  <span>Duplicate</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  onClick={() => handleDelete(ledger.id, ledger.name)}
                                  disabled={isDeleting}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete Account</span>
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

      {/* Footer with pagination and summary */}
      {!ledgerLoading && filteredAndSortedLedgerList.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{filteredAndSortedLedgerList.length}</span> of{' '}
                <span className="font-medium">{ledgerList.length}</span> accounts
              </span>
              {selectedRows.size > 0 && (
                <span className="text-blue-600">
                  {selectedRows.size} selected
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Total Balance:</span>
                <span className="font-semibold text-gray-900">
                  ৳{formatCurrency(
                    filteredAndSortedLedgerList.reduce((sum, ledger) => 
                      sum + parseFloat(ledger.current_balance || 0), 0
                    )
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active: {filteredAndSortedLedgerList.filter(l => l.is_active).length}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Inactive: {filteredAndSortedLedgerList.filter(l => !l.is_active).length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerTable;