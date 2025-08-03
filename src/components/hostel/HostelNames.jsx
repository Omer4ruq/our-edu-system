import React, { useState } from 'react';
import {   useGetHostelNamesQuery,
  useCreateHostelNameMutation,
  useUpdateHostelNameMutation,
  useDeleteHostelNameMutation } from '../../redux/features/api/hostel/hostelNames';


const HostelNames = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHostelName, setEditingHostelName] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  // API hooks
  const { data: hostelNames = [], isLoading, isError, error } = useGetHostelNamesQuery();
  const [createHostelName, { isLoading: isCreating }] = useCreateHostelNameMutation();
  const [updateHostelName, { isLoading: isUpdating }] = useUpdateHostelNameMutation();
  const [deleteHostelName] = useDeleteHostelNameMutation();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission for create/update
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a hostel name');
      return;
    }
    
    try {
      const hostelNameData = {
        name: formData.name.trim()
      };

      if (editingHostelName) {
        await updateHostelName({ id: editingHostelName.id, ...hostelNameData }).unwrap();
        setEditingHostelName(null);
      } else {
        await createHostelName(hostelNameData).unwrap();
        setShowCreateForm(false);
      }

      // Reset form
      setFormData({
        name: ''
      });
    } catch (error) {
      console.error('Error saving hostel name:', error);
      alert('Error saving hostel name. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (hostelName) => {
    setEditingHostelName(hostelName);
    setFormData({
      name: hostelName.name
    });
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hostel name?')) {
      try {
        await deleteHostelName(id).unwrap();
      } catch (error) {
        console.error('Error deleting hostel name:', error);
        alert('Error deleting hostel name. Please try again.');
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingHostelName(null);
    setFormData({
      name: ''
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Hostel Names</h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel names'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hostel Names</h1>
            <p className="text-gray-600 mt-2">Manage hostel name directory</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Hostel Name
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingHostelName ? 'Edit Hostel Name' : 'Create New Hostel Name'}
            </h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hostel name (e.g., Green Valley Hostel, City Center Dormitory, etc.)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingHostelName ? 'Update Hostel Name' : 'Create Hostel Name'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hostel Names List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Hostel Names ({hostelNames.length})
            </h2>
          </div>

          {hostelNames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">🏨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hostel names found</h3>
              <p className="text-gray-500">Create your first hostel name to get started.</p>
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
                      Hostel Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hostelNames.map((hostelName) => (
                    <tr key={hostelName.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{hostelName.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {hostelName.name?.charAt(0)?.toUpperCase() || 'H'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{hostelName.name}</div>
                            <div className="text-sm text-gray-500">
                              {hostelName.name?.length > 30 ? 
                                `${hostelName.name.substring(0, 30)}...` : 
                                hostelName.name
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(hostelName.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(hostelName.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(hostelName)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(hostelName.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {hostelNames.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🏨</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Hostel Names</p>
                  <p className="text-2xl font-semibold text-gray-900">{hostelNames.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recently Added</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {hostelNames.filter(hostelName => {
                      const createdDate = new Date(hostelName.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate > weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">🔧</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recently Updated</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {hostelNames.filter(hostelName => {
                      const updatedDate = new Date(hostelName.updated_at);
                      const createdDate = new Date(hostelName.created_at);
                      return updatedDate > createdDate;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelNames;