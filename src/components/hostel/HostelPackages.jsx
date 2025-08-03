import React, { useState } from 'react';
import { useGetHostelPackagesQuery,
  useCreateHostelPackageMutation,
  useDeleteHostelPackageMutation,
  useUpdateHostelPackageMutation } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';


const HostelPackages = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    package_name: '',
    amount: '',
    academic_year: ''
  });

  // API hooks
  const { data: packages = [], isLoading, isError, error } = useGetHostelPackagesQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const [createPackage, { isLoading: isCreating }] = useCreateHostelPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateHostelPackageMutation();
  const [deletePackage] = useDeleteHostelPackageMutation();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'academic_year' ? (value ? parseInt(value) : '') : value
    }));
  };

  // Handle form submission for create/update
  const handleSubmit = async () => {
    if (!formData.package_name || !formData.amount || !formData.academic_year) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const packageData = {
        package_name: formData.package_name,
        amount: formData.amount.toString(),
        academic_year: formData.academic_year
      };

      if (editingPackage) {
        await updatePackage({ id: editingPackage.id, ...packageData }).unwrap();
        setEditingPackage(null);
      } else {
        await createPackage(packageData).unwrap();
        setShowCreateForm(false);
      }

      // Reset form
      setFormData({
        package_name: '',
        amount: '',
        academic_year: ''
      });
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      package_name: pkg.package_name,
      amount: pkg.amount,
      academic_year: pkg.academic_year
    });
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id).unwrap();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingPackage(null);
    setFormData({
      package_name: '',
      amount: '',
      academic_year: ''
    });
  };

  // Format date
  const formatDate = (dateString) => {
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
          <h2 className="text-red-800 font-semibold">Error Loading Packages</h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel packages'}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Hostel Packages</h1>
            <p className="text-gray-600 mt-2">Manage hostel accommodation packages</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Package
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="package_name"
                  value={formData.package_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year || year.name || year.academic_year || year.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
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

        {/* Packages List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Packages ({packages.length})
            </h2>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-500">Create your first hostel package to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
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
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.package_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {academicYears.find(year => year.id === pkg.academic_year)?.year || 
                           academicYears.find(year => year.id === pkg.academic_year)?.name || 
                           academicYears.find(year => year.id === pkg.academic_year)?.academic_year || 
                           pkg.academic_year}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pkg.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pkg.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
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
      </div>
    </div>
  );
};

export default HostelPackages;