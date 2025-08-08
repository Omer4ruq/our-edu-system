import React, { useState } from 'react';
import Select from 'react-select';
import { Search, Filter, Edit, Trash2, Eye, RefreshCw, ArrowLeftRight, AlertCircle } from 'lucide-react';
import selectStyles from '../../../../utilitis/selectStyles';

const ContraTable = ({
  refreshTrigger,
  contraResponse,
  contraLoading,
  contraError,
  refetchContras,
  ledgerOptions,
  ledgerOptionsLoading,
  updateContra,
  deleteContra,
  setModalAction,
  setModalData,
  setIsModalOpen,
  languageCode,
  formatCurrency,
  getLedgerName
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredContras = contraResponse.results.filter(contra => {
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

  const handleSaveEdit = (id) => {
    setModalAction('update');
    setModalData({ id, data: editFormData, updateContra, setEditingId, setEditFormData });
    setIsModalOpen(true);
  };

  const handleDelete = (id, voucher_no) => {
    setModalAction('delete');
    setModalData({ id, voucher_no, deleteContra });
    setIsModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name) => (selectedOption) => {
    setEditFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };

  const ledgerOptionsFormatted = ledgerOptions.cash_ledgers.map(ledger => ({
    value: ledger.id.toString(),
    label: ledger.name
  }));

  if (contraError) {
    return (
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 animate-fadeIn">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">{languageCode === 'bn' ? 'ট্রান্সফার লোড করতে ত্রুটি' : 'Error Loading Transfers'}</h3>
              <p className="text-sm">{contraError?.data?.message || (languageCode === 'bn' ? 'ট্রান্সফার ডেটা লোড করতে অক্ষম' : 'Unable to load transfer data')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden animate-fadeIn">
      <div className="px-6 py-4 border-b border-[#441a05]/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-[#441a05] flex items-center space-x-2">
              <ArrowLeftRight className="text-pmColor" />
              <span>{languageCode === 'bn' ? 'ট্রান্সফার ইতিহাস' : 'Transfer History'}</span>
            </h2>
            <p className="text-[#441a05]/70 text-sm">{languageCode === 'bn' ? 'আপনার নগদ অ্যাকাউন্টের মধ্যে তহবিল স্থানান্তর পরিচালনা করুন' : 'Manage your fund transfers between cash accounts'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#441a05]/60" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder={languageCode === 'bn' ? 'ভাউচার, বিবরণ, অ্যাকাউন্ট দ্বারা অনুসন্ধান...' : 'Search by voucher, description, ledgers...'}
                className="pl-10 pr-4 py-2 w-64 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 bg-[#441a05]/10 border border-[#441a05]/20 rounded-xl text-[#441a05] transition-all duration-300 hover:bg-[#441a05]/15 ${showFilters || filters.dateFrom || filters.dateTo ? 'bg-pmColor/20 border-pmColor text-pmColor' : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span>{languageCode === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
            </button>
            <button 
              onClick={() => refetchContras()}
              disabled={contraLoading}
              className="p-2 bg-[#441a05]/10 border border-[#441a05]/20 rounded-xl text-[#441a05] hover:bg-[#441a05]/15 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${contraLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-[#441a05]/5 rounded-xl border border-[#441a05]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-2">{languageCode === 'bn' ? 'তারিখ হতে' : 'Date From'}</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-2">{languageCode === 'bn' ? 'তারিখ পর্যন্ত' : 'Date To'}</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ searchTerm: '', dateFrom: '', dateTo: '' })}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-[#441a05] rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  {languageCode === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear Filters'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {contraLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
            <p className="text-[#441a05]/70">{languageCode === 'bn' ? 'ট্রান্সফার লোড হচ্ছে...' : 'Loading transfers...'}</p>
          </div>
        ) : filteredContras.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-[#441a05]/10 rounded-full flex items-center justify-center mb-4">
              <ArrowLeftRight className="h-8 w-8 text-[#441a05]/60" />
            </div>
            <h3 className="text-lg font-medium text-[#441a05] mb-2">{languageCode === 'bn' ? 'কোনো ট্রান্সফার পাওয়া যায়নি' : 'No transfers found'}</h3>
            <p className="text-[#441a05]/70">
              {contraResponse.results.length === 0 
                ? (languageCode === 'bn' ? 'এখনো কোনো তহবিল স্থানান্তর তৈরি করা হয়নি।' : 'No fund transfers have been created yet.')
                : (languageCode === 'bn' ? 'আপনার বর্তমান ফিল্টারের সাথে কোনো ট্রান্সফার মেলেনি।' : 'No transfers match your current filters.')}
            </p>
          </div>
        ) : (
          <table className="min-w-full" key={refreshTrigger}>
            <thead className="bg-[#441a05]/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'তারিখ' : 'Date'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'ভাউচার নং' : 'Voucher No'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'বিবরণ' : 'Description'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'আদান অ্যাকাউন্ট' : 'From Account'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'প্রাপ্তি অ্যাকাউন্ট' : 'To Account'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                  {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#441a05]/10">
              {filteredContras.map((contra, index) => (
                <tr
                  key={contra.id}
                  className={`hover:bg-[#441a05]/5 transition-colors duration-300 animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {editingId === contra.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="voucher_no"
                          value={editFormData.voucher_no}
                          onChange={handleEditInputChange}
                          disabled
                          className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditInputChange}
                          rows="2"
                          className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          name="from_ledger"
                          value={ledgerOptionsFormatted.find(option => option.value === editFormData.from_ledger) || null}
                          onChange={handleEditSelectChange('from_ledger')}
                          options={ledgerOptionsFormatted}
                          isDisabled={ledgerOptionsLoading}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={languageCode === 'bn' ? 'নির্বাচন করুন' : 'Select'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          name="to_ledger"
                          value={ledgerOptionsFormatted.find(option => option.value === editFormData.to_ledger) || null}
                          onChange={handleEditSelectChange('to_ledger')}
                          options={ledgerOptionsFormatted.filter(option => option.value !== editFormData.from_ledger)}
                          isDisabled={ledgerOptionsLoading}
                          styles={selectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          placeholder={languageCode === 'bn' ? 'নির্বাচন করুন' : 'Select'}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          name="amount"
                          value={editFormData.amount}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] text-right focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(contra.id)}
                            disabled={false}
                            className="px-3 py-1 bg-pmColor hover:bg-pmColor/80 text-[#441a05] rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                          >
                            {languageCode === 'bn' ? 'সংরক্ষণ' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={false}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-[#441a05] rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                          >
                            {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#441a05]">
                          {new Date(contra.date).toLocaleDateString(languageCode === 'bn' ? 'bn-BD' : 'en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-pmColor">{contra.voucher_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#441a05]">{contra.description || (languageCode === 'bn' ? 'কোনো বিবরণ নেই' : 'No description')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-[#441a05]">{getLedgerName(contra.from_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-[#441a05]">{getLedgerName(contra.to_ledger)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-pmColor">
                          ৳{formatCurrency(contra.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(contra)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05] text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'ট্রান্সফার সম্পাদনা করুন' : 'Edit Transfer'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {}}
                            className="bg-[#441a05]/20 hover:bg-[#441a05]/30 text-[#441a05] p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contra.id, contra.voucher_no)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05] text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'ট্রান্সফার মুছুন' : 'Delete Transfer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {!contraLoading && filteredContras.length > 0 && (
        <div className="border-t border-[#441a05]/20 bg-[#441a05]/5 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-[#441a05]/70">
              <span>
                {languageCode === 'bn' ? 'দেখানো হচ্ছে' : 'Showing'} <span className="font-medium">{filteredContras.length}</span> {languageCode === 'bn' ? 'ট্রান্সফারের মধ্যে' : 'of'} <span className="font-medium">{contraResponse.count || 0}</span> {languageCode === 'bn' ? 'ট্রান্সফার' : 'transfers'}
              </span>
              <span className="text-[#441a05]/40">•</span>
              <span>
                {languageCode === 'bn' ? 'পৃষ্ঠা' : 'Page'} <span className="font-medium">{contraResponse.current_page || 1}</span> {languageCode === 'bn' ? 'এর মধ্যে' : 'of'} <span className="font-medium">{contraResponse.num_pages || 1}</span>
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-[#441a05]/70">
              <div className="flex items-center space-x-2">
                <span>{languageCode === 'bn' ? 'মোট স্থানান্তরিত:' : 'Total Transferred:'}</span>
                <span className="font-semibold text-pmColor">
                  ৳{formatCurrency(
                    filteredContras.reduce((sum, contra) => sum + parseFloat(contra.amount || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{languageCode === 'bn' ? 'এই মাসে:' : 'This Month:'}</span>
                <span className="font-semibold text-pmColor">
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

export default ContraTable;