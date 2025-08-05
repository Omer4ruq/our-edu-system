import React, { useState } from 'react';
import { useGetDeductionTypesQuery,
  useCreateDeductionTypeMutation,
  useUpdateDeductionTypeMutation,
  useDeleteDeductionTypeMutation } from '../../../redux/features/api/payroll/deductionTypesApi';

const AddDeduction = () => {
  const [formData, setFormData] = useState({
    deduction_type: '',
    is_every_month: false
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  
  // API hooks
  const { data: deductionTypes = [], isLoading: isLoadingTypes, error: fetchError, refetch } = useGetDeductionTypesQuery();
  const [createDeductionType, { isLoading: isCreating }] = useCreateDeductionTypeMutation();
  const [updateDeductionType, { isLoading: isUpdating }] = useUpdateDeductionTypeMutation();
  const [deleteDeductionType, { isLoading: isDeleting }] = useDeleteDeductionTypeMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.deduction_type.trim()) {
      newErrors.deduction_type = 'Deduction type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await updateDeductionType({ id: editingId, ...formData }).unwrap();
      } else {
        await createDeductionType(formData).unwrap();
      }
      
      // Reset form on success
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save deduction type:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      deduction_type: '',
      is_every_month: false
    });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (deductionType) => {
    setFormData({
      deduction_type: deductionType.deduction_type,
      is_every_month: deductionType.is_every_month
    });
    setEditingId(deductionType.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deduction type?')) {
      try {
        await deleteDeductionType(id).unwrap();
      } catch (err) {
        console.error('Failed to delete deduction type:', err);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  if (isLoadingTypes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading deduction types: {fetchError?.data?.message || fetchError?.message || 'Unknown error'}</p>
          <button 
            onClick={refetch}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Deduction Types Management</h1>
        
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Add New Deduction Type
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? 'Edit Deduction Type' : 'Create New Deduction Type'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deduction Type Input */}
              <div>
                <label htmlFor="deduction_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Deduction Type *
                </label>
                <input
                  type="text"
                  id="deduction_type"
                  name="deduction_type"
                  value={formData.deduction_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.deduction_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter deduction type"
                  disabled={isSubmitting}
                />
                {errors.deduction_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.deduction_type}</p>
                )}
              </div>

              {/* Is Every Month Checkbox */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="is_every_month"
                  name="is_every_month"
                  checked={formData.is_every_month}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_every_month" className="ml-2 block text-sm text-gray-700">
                  Occurs every month
                </label>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
          <h2 className="text-xl font-semibold text-gray-800">Deduction Types List</h2>
        </div>
        
        {deductionTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <p className="text-lg">No deduction types found</p>
            <p className="text-sm mt-2">Click "Add New Deduction Type" to create your first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deduction Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Every Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deductionTypes.map((deductionType) => (
                  <tr key={deductionType.id} className="hover:bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deductionType.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {deductionType.deduction_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        deductionType.is_every_month 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {deductionType.is_every_month ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(deductionType)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(deductionType.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {deductionTypes.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Summary</h3>
              <p className="text-sm text-gray-600">
                Total Deduction Types: <span className="font-semibold">{deductionTypes.length}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Monthly Deductions: <span className="font-semibold text-orange-600">
                  {deductionTypes.filter(d => d.is_every_month).length}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                One-time Deductions: <span className="font-semibold text-gray-600">
                  {deductionTypes.filter(d => !d.is_every_month).length}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDeduction;