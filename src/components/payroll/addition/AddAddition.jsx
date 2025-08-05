import React, { useState } from 'react';
import {   useGetAdditionTypesQuery,
  useCreateAdditionTypeMutation,
  useUpdateAdditionTypeMutation,
  useDeleteAdditionTypeMutation } from '../../../redux/features/api/payroll/additionTypesApi';


const AddAddition = () => {
  const [formData, setFormData] = useState({
    addition_type: '',
    is_every_month: false
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  
  // API hooks
  const { data: additionTypes = [], isLoading: isLoadingTypes, error: fetchError, refetch } = useGetAdditionTypesQuery();
  const [createAdditionType, { isLoading: isCreating }] = useCreateAdditionTypeMutation();
  const [updateAdditionType, { isLoading: isUpdating }] = useUpdateAdditionTypeMutation();
  const [deleteAdditionType, { isLoading: isDeleting }] = useDeleteAdditionTypeMutation();

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
    
    if (!formData.addition_type.trim()) {
      newErrors.addition_type = 'Addition type is required';
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
        await updateAdditionType({ id: editingId, ...formData }).unwrap();
      } else {
        await createAdditionType(formData).unwrap();
      }
      
      // Reset form on success
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save addition type:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      addition_type: '',
      is_every_month: false
    });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (additionType) => {
    setFormData({
      addition_type: additionType.addition_type,
      is_every_month: additionType.is_every_month
    });
    setEditingId(additionType.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this addition type?')) {
      try {
        await deleteAdditionType(id).unwrap();
      } catch (err) {
        console.error('Failed to delete addition type:', err);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading addition types: {fetchError?.data?.message || fetchError?.message || 'Unknown error'}</p>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Addition Types Management</h1>
        
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Addition Type
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? 'Edit Addition Type' : 'Create New Addition Type'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Addition Type Input */}
              <div>
                <label htmlFor="addition_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Addition Type *
                </label>
                <input
                  type="text"
                  id="addition_type"
                  name="addition_type"
                  value={formData.addition_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.addition_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter addition type"
                  disabled={isSubmitting}
                />
                {errors.addition_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.addition_type}</p>
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                className={`py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Addition Types List</h2>
        </div>
        
        {additionTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No addition types found</p>
            <p className="text-sm mt-2">Click "Add New Addition Type" to create your first one</p>
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
                    Addition Type
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
                {additionTypes.map((additionType) => (
                  <tr key={additionType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {additionType.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {additionType.addition_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        additionType.is_every_month 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {additionType.is_every_month ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(additionType)}
                        disabled={isDeleting}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(additionType.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
    </div>
  );
};

export default AddAddition;