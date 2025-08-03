import React, { useState } from 'react';
import { useCreateTransportRouteMutation, useDeleteTransportRouteMutation, useGetTransportRoutesQuery, useUpdateTransportRouteMutation } from '../../../redux/features/api/transport/transportRoutesApi';


const TransportRoutes = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_point: '',
    end_point: ''
  });

  // API hooks
  const { data: routes = [], isLoading, isError, error } = useGetTransportRoutesQuery();
  const [createRoute, { isLoading: isCreating }] = useCreateTransportRouteMutation();
  const [updateRoute, { isLoading: isUpdating }] = useUpdateTransportRouteMutation();
  const [deleteRoute] = useDeleteTransportRouteMutation();

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
    if (!formData.name.trim() || !formData.start_point.trim() || !formData.end_point.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const routeData = {
        name: formData.name.trim(),
        start_point: formData.start_point.trim(),
        end_point: formData.end_point.trim()
      };

      if (editingRoute) {
        await updateRoute({ id: editingRoute.id, ...routeData }).unwrap();
        setEditingRoute(null);
      } else {
        await createRoute(routeData).unwrap();
        setShowCreateForm(false);
      }

      // Reset form
      setFormData({
        name: '',
        start_point: '',
        end_point: ''
      });
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error saving route. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      start_point: route.start_point,
      end_point: route.end_point
    });
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(id).unwrap();
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Error deleting route. Please try again.');
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingRoute(null);
    setFormData({
      name: '',
      start_point: '',
      end_point: ''
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
          <h2 className="text-red-800 font-semibold">Error Loading Transport Routes</h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load transport routes'}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Transport Routes</h1>
            <p className="text-gray-600 mt-2">Manage transportation routes and schedules</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Route
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingRoute ? 'Edit Route' : 'Create New Route'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter route name (e.g., Route A, City Center Line)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Point *
                </label>
                <input
                  type="text"
                  name="start_point"
                  value={formData.start_point}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter starting location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Point *
                </label>
                <input
                  type="text"
                  name="end_point"
                  value={formData.end_point}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter destination location"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                {isCreating || isUpdating ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
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
        )}

        {/* Routes List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Routes ({routes.length})
            </h2>
          </div>

          {routes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">🚌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-500">Create your first transport route to get started.</p>
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
                      Route Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Point
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
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{route.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                {route.name?.charAt(0)?.toUpperCase() || 'R'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{route.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-xs">🚩</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm text-gray-900">{route.start_point}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-medium text-xs">🏁</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm text-gray-900">{route.end_point}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(route.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(route.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
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
        {routes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🚌</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Routes</p>
                  <p className="text-2xl font-semibold text-gray-900">{routes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📍</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unique Start Points</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(routes.map(route => route.start_point)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unique Destinations</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(routes.map(route => route.end_point)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recently Added</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {routes.filter(route => {
                      const createdDate = new Date(route.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate > weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Direction Indicator */}
        {routes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Overview</h3>
            <div className="space-y-3">
              {routes.slice(0, 5).map((route) => (
                <div key={route.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-900 bg-green-100 px-2 py-1 rounded">
                      {route.name}
                    </span>
                    <span className="mx-3 text-gray-400">🚩</span>
                    <span className="text-sm text-gray-700">{route.start_point}</span>
                    <span className="mx-3 text-gray-400">→</span>
                    <span className="text-sm text-gray-700">{route.end_point}</span>
                    <span className="mx-3 text-gray-400">🏁</span>
                  </div>
                </div>
              ))}
              {routes.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">And {routes.length - 5} more routes...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportRoutes;