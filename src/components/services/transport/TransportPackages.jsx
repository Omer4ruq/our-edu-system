import React, { useState } from 'react';




import { useGetTransportPackagesQuery,
  useGetTransportPackageByIdQuery,
  useCreateTransportPackageMutation,
  useUpdateTransportPackageMutation,
  usePatchTransportPackageMutation,
  useDeleteTransportPackageMutation, } from '../../../redux/features/api/transport/transportPackagesApi';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';

const TransportPackages = () => {
  const [formData, setFormData] = useState({
    package_name: '',
    amount: '',
    academic_year: ''
  });
  const [editingPackage, setEditingPackage] = useState(null);
  const [editData, setEditData] = useState({
    package_name: '',
    amount: '',
    academic_year: ''
  });
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [searchId, setSearchId] = useState('');

  // API Hooks
  const { data: packages = [], isLoading, error, refetch } = useGetTransportPackagesQuery();
  const { data: academicYears = [], isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: selectedPackage, isLoading: isLoadingSelected } = useGetTransportPackageByIdQuery(
    selectedPackageId,
    { skip: !selectedPackageId }
  );
  
  const [createPackage, { isLoading: isCreating }] = useCreateTransportPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateTransportPackageMutation();
  const [patchPackage, { isLoading: isPatching }] = usePatchTransportPackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeleteTransportPackageMutation();

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new package
  const handleCreatePackage = async () => {
    if (!formData.package_name || !formData.amount || !formData.academic_year) {
      alert('Please fill all fields');
      return;
    }

    try {
      const packageData = {
        package_name: formData.package_name.trim(),
        amount: formData.amount.toString(),
        academic_year: parseInt(formData.academic_year)
      };
      
      await createPackage(packageData).unwrap();
      setFormData({ package_name: '', amount: '', academic_year: '' });
      console.log('Transport package created successfully');
    } catch (error) {
      console.error('Failed to create transport package:', error);
      alert('Failed to create transport package. Please try again.');
    }
  };

  // Start editing
  const handleEditStart = (pkg) => {
    setEditingPackage(pkg.id);
    setEditData({
      package_name: pkg.package_name,
      amount: pkg.amount.toString(),
      academic_year: pkg.academic_year.toString()
    });
  };

  // Save edit (using PUT - full update)
  const handleSaveEdit = async (id) => {
    if (!editData.package_name || !editData.amount || !editData.academic_year) {
      alert('Please fill all fields');
      return;
    }

    try {
      const packageData = {
        id,
        package_name: editData.package_name.trim(),
        amount: editData.amount.toString(),
        academic_year: parseInt(editData.academic_year)
      };
      
      await updatePackage(packageData).unwrap();
      setEditingPackage(null);
      setEditData({ package_name: '', amount: '', academic_year: '' });
      console.log('Transport package updated successfully');
    } catch (error) {
      console.error('Failed to update transport package:', error);
      alert('Failed to update transport package. Please try again.');
    }
  };

  // Patch edit (using PATCH - partial update)
  const handlePatchEdit = async (id) => {
    if (!editData.package_name || !editData.amount || !editData.academic_year) {
      alert('Please fill all fields');
      return;
    }

    try {
      const packageData = {
        id,
        package_name: editData.package_name.trim(),
        amount: editData.amount.toString(),
        academic_year: parseInt(editData.academic_year)
      };
      
      await patchPackage(packageData).unwrap();
      setEditingPackage(null);
      setEditData({ package_name: '', amount: '', academic_year: '' });
      console.log('Transport package patched successfully');
    } catch (error) {
      console.error('Failed to patch transport package:', error);
      alert('Failed to patch transport package. Please try again.');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingPackage(null);
    setEditData({ package_name: '', amount: '', academic_year: '' });
  };

  // Delete package
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transport package?')) {
      try {
        await deletePackage(id).unwrap();
        console.log('Transport package deleted successfully');
      } catch (error) {
        console.error('Failed to delete transport package:', error);
        alert('Failed to delete transport package. Please try again.');
      }
    }
  };

  // Search by ID
  const handleSearchById = () => {
    if (searchId.trim()) {
      setSelectedPackageId(searchId.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading transport packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-medium">Error loading transport packages</h3>
        <p className="text-red-600 text-sm mt-1">
          {error?.data?.message || error?.message || 'Something went wrong'}
        </p>
        <button
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🚌 Transport Packages Management</h1>

      {/* Create New Package Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Transport Package</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Package Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
            <input
              type="text"
              value={formData.package_name}
              onChange={(e) => handleInputChange('package_name', e.target.value)}
              placeholder="Enter package name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
              min="0"
              step="0.01"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
            <select
              value={formData.academic_year}
              onChange={(e) => handleInputChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating || isAcademicYearsLoading}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year || year.name || year.id}
                </option>
              ))}
            </select>
            {isAcademicYearsLoading && <p className="text-sm text-gray-500 mt-1">Loading academic years...</p>}
          </div>
        </div>

        <button
          onClick={handleCreatePackage}
          disabled={isCreating || !formData.package_name || !formData.amount || !formData.academic_year}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "+"
          )}
          {isCreating ? 'Creating...' : 'Create Package'}
        </button>
      </div>

      {/* Search by ID */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Search Package by ID</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter package ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearchById}
            disabled={!searchId.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            🔍 Search
          </button>
        </div>
        {selectedPackage && (
          <div className="mt-3 p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-800">Found Package:</h3>
            <p className="text-gray-600">ID: {selectedPackage.id}</p>
            <p className="text-gray-600">Name: {selectedPackage.package_name}</p>
            <p className="text-gray-600">Amount: ${selectedPackage.amount}</p>
            <p className="text-gray-600">Academic Year: {selectedPackage.academic_year}</p>
          </div>
        )}
        {isLoadingSelected && (
          <div className="mt-3 flex items-center text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              🚌
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${packages.length > 0 ? 
                  Math.round(packages.reduce((sum, pkg) => sum + Number(pkg.amount || 0), 0) / packages.length).toLocaleString() 
                  : 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              🎓
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Academic Years</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(packages.map(pkg => pkg.academic_year)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">All Transport Packages ({packages.length})</h2>
        </div>
        
        {packages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🚌</div>
            <p>No transport packages found. Create your first package above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingPackage === pkg.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Edit Package Name */}
                        <div>
                          <input
                            type="text"
                            value={editData.package_name}
                            onChange={(e) => handleEditInputChange('package_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isUpdating || isPatching}
                            placeholder="Package name"
                          />
                        </div>

                        {/* Edit Amount */}
                        <div>
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={(e) => handleEditInputChange('amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isUpdating || isPatching}
                            placeholder="Amount"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Edit Academic Year */}
                        <div>
                          <select
                            value={editData.academic_year}
                            onChange={(e) => handleEditInputChange('academic_year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isUpdating || isPatching}
                          >
                            <option value="">Select Academic Year</option>
                            {academicYears.map((year) => (
                              <option key={year.id} value={year.id}>
                                {year.year || year.name || year.id}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Edit Action Buttons */}
                        <div className="md:col-span-3 flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(pkg.id)}
                            disabled={isUpdating || !editData.package_name || !editData.amount || !editData.academic_year}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            title="Save (PUT)"
                          >
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              "💾"
                            )}
                            Save
                          </button>
                          <button
                            onClick={() => handlePatchEdit(pkg.id)}
                            disabled={isPatching || !editData.package_name || !editData.amount || !editData.academic_year}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1"
                            title="Patch (PATCH)"
                          >
                            {isPatching ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              "📝"
                            )}
                            Patch
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-1"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                          🚌 {pkg.package_name}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          <p>ID: {pkg.id}</p>
                          <p>Amount: <span className="font-semibold text-green-600">${Number(pkg.amount || 0).toLocaleString()}</span></p>
                          <p>Academic Year: {pkg.academic_year}</p>
                          {pkg.created_at && (
                            <p>Created: {new Date(pkg.created_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editingPackage !== pkg.id && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditStart(pkg)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit package"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                        title="Delete package"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Status Indicators */}
      <div className="mt-6 flex gap-4 text-sm">
        {isCreating && <span className="text-blue-600">Creating package...</span>}
        {isUpdating && <span className="text-green-600">Updating package...</span>}
        {isPatching && <span className="text-yellow-600">Patching package...</span>}
        {isDeleting && <span className="text-red-600">Deleting package...</span>}
      </div>
    </div>
  );
};

export default TransportPackages;