import React, { useState } from 'react';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import {
  Calendar, DollarSign, ArrowLeftRight, Plus, X, Save, AlertCircle
} from 'lucide-react';
import { useGetLedgerOptionsQuery } from '../../../../redux/features/api/accounts/ledger/ledgerListApi';
import { useCreateContraMutation, useDeleteContraMutation, useGetContraListQuery, useUpdateContraMutation } from '../../../../redux/features/api/accounts/contra/contraApi';
import ContraTable from './ContraTable';
import DraggableModal from '../../../common/DraggableModal';
import { languageCode } from '../../../../utilitis/getTheme';
import selectStyles from '../../../../utilitis/selectStyles';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const { 
    data: ledgerOptions = { cash_ledgers: [] }, 
    isLoading: ledgerOptionsLoading 
  } = useGetLedgerOptionsQuery();

  const { 
    data: contraResponse = { results: [], count: 0 }, 
    isLoading: contraLoading, 
    error: contraError,
    refetch: refetchContras
  } = useGetContraListQuery();

  const [createContra, { isLoading: isCreating, error: createError }] = useCreateContraMutation();
   const [updateContra, { isLoading: isUpdating }] = useUpdateContraMutation();
  const [deleteContra, { isLoading: isDeleting }] = useDeleteContraMutation();

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.date) errors.date = languageCode === 'bn' ? 'তারিখ প্রয়োজন' : 'Date is required';
    if (!formData.from_ledger) errors.from_ledger = languageCode === 'bn' ? 'আদান অ্যাকাউন্ট প্রয়োজন' : 'From cash account is required';
    if (!formData.to_ledger) errors.to_ledger = languageCode === 'bn' ? 'প্রাপ্তি অ্যাকাউন্ট প্রয়োজন' : 'To cash account is required';
    if (formData.from_ledger && formData.to_ledger && formData.from_ledger === formData.to_ledger) {
      errors.to_ledger = languageCode === 'bn' ? 'প্রাপ্তি অ্যাকাউন্ট আদান অ্যাকাউন্ট থেকে ভিন্ন হতে হবে' : 'To account must be different from From account';
      errors.from_ledger = languageCode === 'bn' ? 'আদান অ্যাকাউন্ট প্রাপ্তি অ্যাকাউন্ট থেকে ভিন্ন হতে হবে' : 'From account must be different from To account';
    }
    if (!formData.amount.trim()) {
      errors.amount = languageCode === 'bn' ? 'পরিমাণ প্রয়োজন' : 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = languageCode === 'bn' ? 'পরিমাণ একটি বৈধ ধনাত্মক সংখ্যা হতে হবে' : 'Amount must be a valid positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  const handleSelectChange = (name) => (selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  const handleSubmit = () => {
    if (!validateForm()) return;
    setModalAction('create');
    setModalData({
      date: formData.date,
      from_ledger: parseInt(formData.from_ledger),
      to_ledger: parseInt(formData.to_ledger),
      amount: parseFloat(formData.amount),
      description: formData.description
    });
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createContra(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'ট্রান্সফার সফলভাবে তৈরি হয়েছে!' : 'Transfer created successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          from_ledger: '',
          to_ledger: '',
          amount: '',
          description: ''
        });
        setValidationErrors({});
        setRefreshTable(prev => prev + 1);
      } else if (modalAction === 'update') {
        await modalData.updateContra({ id: modalData.id, ...modalData.data }).unwrap();
        toast.success(languageCode === 'bn' ? 'ট্রান্সফার সফলভাবে আপডেট হয়েছে!' : 'Transfer updated successfully!');
        modalData.setEditingId(null);
        modalData.setEditFormData({});
        refetchContras();
      } else if (modalAction === 'delete') {
        await modalData.deleteContra(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'ট্রান্সফার সফলভাবে মুছে ফেলা হয়েছে!' : 'Transfer deleted successfully!');
        refetchContras();
      }
    } catch (error) {
      console.error(`Failed to ${modalAction} contra:`, error);
      toast.error(languageCode === 'bn' ? `ট্রান্সফার ${modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'তৈরি'} ব্যর্থ: ` : `Transfer ${modalAction === 'update' ? 'update' : modalAction === 'delete' ? 'deletion' : 'creation'} failed: ` + (error.status || 'unknown'));
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
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

  const getModalContent = () => {
    switch (modalAction) {
      case 'create':
        return {
          title: languageCode === 'bn' ? 'নতুন ট্রান্সফার নিশ্চিত করুন' : 'Confirm New Transfer',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন ট্রান্সফার তৈরি করতে চান?' : 'Are you sure you want to create a new transfer?'
        };
      case 'update':
        return {
          title: languageCode === 'bn' ? 'ট্রান্সফার আপডেট নিশ্চিত করুন' : 'Confirm Transfer Update',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই ট্রান্সফারটি আপডেট করতে চান?' : 'Are you sure you want to update this transfer?'
        };
      case 'delete':
        return {
          title: languageCode === 'bn' ? 'ট্রান্সফার মুছে ফেলা নিশ্চিত করুন' : 'Confirm Transfer Deletion',
          message: languageCode === 'bn' ? `আপনি কি নিশ্চিত যে ট্রান্সফার "${modalData?.voucher_no}" মুছে ফেলতে চান?` : `Are you sure you want to delete transfer "${modalData?.voucher_no}"?`
        };
      default:
        return { title: '', message: '' };
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || (createError?.data?.errors?.[fieldName]?.[0]);
  };

  const ledgerOptionsFormatted = ledgerOptions.cash_ledgers.map(ledger => ({
    value: ledger.id.toString(),
    label: ledger.name
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount || 0));
  };

  const getLedgerName = (ledgerName) => {
    return ledgerName || (languageCode === 'bn' ? 'অজানা' : 'Unknown');
  };

  return (
    <div className="py-8 w-full mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-2 mb-8 animate-fadeIn">
        <div className="flex items-center justify-between space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <ArrowLeftRight className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'কন্ট্রা ম্যানেজমেন্ট' : 'Contra Management'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'নগদ অ্যাকাউন্টের মধ্যে তহবিল স্থানান্তর করুন' : 'Transfer funds between cash accounts'}
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05] px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              {showForm ? (
                <>
                  <X size={18} />
                  <span>{languageCode === 'bn' ? 'ফর্ম লুকান' : 'Hide Form'}</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>{languageCode === 'bn' ? 'নতুন ট্রান্সফার' : 'New Transfer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contra Creation Form */}
      {showForm && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              <Plus className="text-pmColor text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'নতুন তহবিল স্থানান্তর তৈরি করুন' : 'Create New Fund Transfer'}
            </h3>
          </div>

          {createError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">{languageCode === 'bn' ? 'তহবিল স্থানান্তর তৈরিতে ত্রুটি' : 'Error creating fund transfer'}</p>
                  <p className="text-sm">{createError?.data?.message || (languageCode === 'bn' ? 'অনুগ্রহ করে আপনার ইনপুট চেক করুন এবং আবার চেষ্টা করুন' : 'Please check your input and try again')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">
                {languageCode === 'bn' ? 'স্থানান্তরের তারিখ' : 'Transfer Date'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#441a05]/60" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300 ${getFieldError('date') ? 'border-red-500 bg-red-500/10' : ''}`}
                />
              </div>
              {getFieldError('date') && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{getFieldError('date')}</span>
                </p>
              )}
            </div>

            {/* From Ledger */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">
                {languageCode === 'bn' ? 'আদান নগদ অ্যাকাউন্ট' : 'From Cash Account'} <span className="text-red-500">*</span>
              </label>
              <Select
                name="from_ledger"
                value={ledgerOptionsFormatted.find(option => option.value === formData.from_ledger) || null}
                onChange={handleSelectChange('from_ledger')}
                options={ledgerOptionsFormatted}
                isDisabled={ledgerOptionsLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                placeholder={ledgerOptionsLoading ? (languageCode === 'bn' ? 'অ্যাকাউন্ট লোড হচ্ছে...' : 'Loading accounts...') : (languageCode === 'bn' ? 'উৎস অ্যাকাউন্ট নির্বাচন করুন' : 'Select source account')}
                className={`${getFieldError('from_ledger') ? 'border-red-500 bg-red-500/10' : ''}`}
              />
              {getFieldError('from_ledger') && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{getFieldError('from_ledger')}</span>
                </p>
              )}
            </div>

            {/* To Ledger */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">
                {languageCode === 'bn' ? 'প্রাপ্তি নগদ অ্যাকাউন্ট' : 'To Cash Account'} <span className="text-red-500">*</span>
              </label>
              <Select
                name="to_ledger"
                value={ledgerOptionsFormatted.find(option => option.value === formData.to_ledger) || null}
                onChange={handleSelectChange('to_ledger')}
                options={ledgerOptionsFormatted.filter(option => option.value !== formData.from_ledger)}
                isDisabled={ledgerOptionsLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                placeholder={ledgerOptionsLoading ? (languageCode === 'bn' ? 'অ্যাকাউন্ট লোড হচ্ছে...' : 'Loading accounts...') : (languageCode === 'bn' ? 'গন্তব্য অ্যাকাউন্ট নির্বাচন করুন' : 'Select destination account')}
                className={`${getFieldError('to_ledger') ? 'border-red-500 bg-red-500/10' : ''}`}
              />
              {getFieldError('to_ledger') && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{getFieldError('to_ledger')}</span>
                </p>
              )}
              {formData.from_ledger && (
                <p className="text-[#441a05]/70 text-sm mt-1 flex items-center space-x-1">
                  <ArrowLeftRight size={16} />
                  <span>{languageCode === 'bn' ? 'আদান অ্যাকাউন্টের মতো একই অ্যাকাউন্ট নির্বাচন করা যাবে না' : 'Cannot select the same account as From account'}</span>
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">
                {languageCode === 'bn' ? 'স্থানান্তরের পরিমাণ' : 'Transfer Amount'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#441a05]/60" />
                <span className="absolute left-8 top-1/2 transform -translate-y-1/2 text-[#441a05]/60">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-4 py-3 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300 ${getFieldError('amount') ? 'border-red-500 bg-red-500/10' : ''}`}
                />
              </div>
              {getFieldError('amount') && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{getFieldError('amount')}</span>
                </p>
              )}
            </div>

            {/* Transfer Preview */}
            {formData.from_ledger && formData.to_ledger && formData.amount && (
              <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[#441a05] mb-3">{languageCode === 'bn' ? 'স্থানান্তরের পূর্বরূপ' : 'Transfer Preview'}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#441a05]/70">{languageCode === 'bn' ? 'আদান:' : 'From:'}</span>
                    <span className="font-medium text-[#441a05]">
                      {ledgerOptions.cash_ledgers.find(l => l.id.toString() === formData.from_ledger)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <ArrowLeftRight className="h-5 w-5 text-pmColor" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#441a05]/70">{languageCode === 'bn' ? 'প্রাপ্তি:' : 'To:'}</span>
                    <span className="font-medium text-[#441a05]">
                      {ledgerOptions.cash_ledgers.find(l => l.id.toString() === formData.to_ledger)?.name}
                    </span>
                  </div>
                  <div className="border-t border-[#441a05]/20 pt-2 mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#441a05]/70">{languageCode === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>
                      <span className="font-semibold text-pmColor">৳{formData.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">
                {languageCode === 'bn' ? 'বিবরণ' : 'Description'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={languageCode === 'bn' ? 'স্থানান্তরের বিবরণ (ঐচ্ছিক)' : 'Transfer details (optional)'}
                rows="4"
                className="w-full px-4 py-3 bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl text-[#441a05] focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300 resize-vertical"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-[#441a05]/20">
            <button
              type="button"
              onClick={handleReset}
              disabled={isCreating}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-[#441a05] rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              <span>{languageCode === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating}
              className={`flex items-center space-x-2 px-6 py-3 bg-pmColor hover:bg-pmColor/80 text-[#441a05] rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#441a05]"></div>
                  <span>{languageCode === 'bn' ? 'তৈরি হচ্ছে...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{languageCode === 'bn' ? 'ট্রান্সফার তৈরি করুন' : 'Create Transfer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contra Table */}
      <ContraTable
        refreshTrigger={refreshTable}
        contraResponse={contraResponse}
        contraLoading={contraLoading}
        contraError={contraError}
        refetchContras={refetchContras}
        ledgerOptions={ledgerOptions}
        ledgerOptionsLoading={ledgerOptionsLoading}
        updateContra={updateContra}
        deleteContra={deleteContra}
        setModalAction={setModalAction}
        setModalData={setModalData}
        setIsModalOpen={setIsModalOpen}
        languageCode={languageCode}
        formatCurrency={formatCurrency}
        getLedgerName={getLedgerName}
      />

      {/* Draggable Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={getModalContent().title}
        message={getModalContent().message}
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default Contra;