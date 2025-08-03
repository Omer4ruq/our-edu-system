import React, { useState, useMemo } from 'react';
import {   useGetHostelsQuery,
  useUpdateHostelMutation,
  useDeleteHostelMutation } from '../../redux/features/api/hostel/hostelsApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetHostelPackagesQuery } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetHostelRoomsQuery } from '../../redux/features/api/hostel/hostelRoomsApi';

const AllocatedStudentsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    academic_year: '',
    hostel_package: '',
    room: ''
  });

  // API hooks
  const { data: allocations = [], isLoading, refetch } = useGetHostelsQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: hostelPackages = [] } = useGetHostelPackagesQuery();
  const { data: hostelRooms = [] } = useGetHostelRoomsQuery();
  const [updateAllocation, { isLoading: isUpdating }] = useUpdateHostelMutation();
  const [deleteAllocation] = useDeleteHostelMutation();
console.log(allocations)
  // Filter allocations based on search term
  const filteredAllocations = useMemo(() => {
    if (!searchTerm.trim()) return allocations;

    return allocations.filter(allocation => {
      const searchLower = searchTerm.toLowerCase();
      
      // Get related data for searching
      const academicYear = academicYears.find(year => year.id === allocation.academic_year);
      const hostelPackage = hostelPackages.find(pkg => pkg.id === allocation.hostel_package);
      const room = hostelRooms.find(r => r.id === allocation.room);
      
      return (
        // Search by student username
        allocation.student?.username?.toLowerCase().includes(searchLower) ||
        // Search by student user_id
        allocation.student_id?.toString().includes(searchTerm) ||
        // Search by student name
        allocation.student?.name?.toLowerCase().includes(searchLower) ||
        // Search by hostel package name
        hostelPackage?.package_name?.toLowerCase().includes(searchLower) ||
        // Search by room name
        room?.name?.toLowerCase().includes(searchLower) ||
        // Search by academic year
        academicYear?.year?.toString().includes(searchTerm) ||
        academicYear?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [allocations, searchTerm, academicYears, hostelPackages, hostelRooms]);

  // Handle edit
  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setEditFormData({
      status: allocation.status,
      academic_year: allocation.academic_year,
      hostel_package: allocation.hostel_package,
      room: allocation.room
    });
  };

  // Handle update
  const handleUpdate = async () => {
    try {
      await updateAllocation({
        id: editingAllocation.id,
        ...editFormData,
        student_id: editingAllocation.student_id
      }).unwrap();
      
      setEditingAllocation(null);
      refetch();
      alert('Allocation updated successfully!');
    } catch (error) {
      console.error('Error updating allocation:', error);
      alert('Error updating allocation. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await deleteAllocation(id).unwrap();
        refetch();
        alert('Allocation deleted successfully!');
      } catch (error) {
        console.error('Error deleting allocation:', error);
        alert('Error deleting allocation. Please try again.');
      }
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hostel Allocation Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin-bottom: 5px; }
            .header p { color: #6b7280; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .status-active { color: #059669; font-weight: bold; }
            .status-inactive { color: #dc2626; font-weight: bold; }
            .status-pending { color: #d97706; font-weight: bold; }
            .summary { margin-top: 30px; }
            .summary-item { display: inline-block; margin-right: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hostel Allocation Report</h1>
            <p>Generated on: ${currentDate}</p>
            <p>Total Allocations: ${filteredAllocations.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Username</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Academic Year</th>
                <th>Hostel Package</th>
                <th>Room</th>
                <th>Allocated Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAllocations.map(allocation => {
                const academicYear = academicYears.find(year => year.id === allocation.academic_year);
                const hostelPackage = hostelPackages.find(pkg => pkg.id === allocation.hostel_package);
                const room = hostelRooms.find(r => r.id === allocation.room);
                
                return `
                  <tr>
                    <td>${allocation.student?.name || 'N/A'}</td>
                    <td>${allocation.student?.username || 'N/A'}</td>
                    <td>${allocation.student_id || 'N/A'}</td>
                    <td class="status-${allocation.status?.toLowerCase()}">${allocation.status || 'N/A'}</td>
                    <td>${academicYear?.year || academicYear?.name || 'N/A'}</td>
                    <td>${hostelPackage?.package_name || 'N/A'}</td>
                    <td>${room?.name || 'N/A'}</td>
                    <td>${allocation.created_at ? new Date(allocation.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-item">
              <strong>Active:</strong> ${filteredAllocations.filter(a => a.status === 'Active').length}
            </div>
            <div class="summary-item">
              <strong>Inactive:</strong> ${filteredAllocations.filter(a => a.status === 'Inactive').length}
            </div>
            <div class="summary-item">
              <strong>Pending:</strong> ${filteredAllocations.filter(a => a.status === 'Pending').length}
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Get display names
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year?.year || year?.name || year?.academic_year || yearId;
  };

  const getPackageName = (packageId) => {
    const pkg = hostelPackages.find(p => p.id === packageId);
    return pkg?.package_name || packageId;
  };

  const getRoomName = (roomId) => {
    const room = hostelRooms.find(r => r.id === roomId);
    return room?.name || roomId;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header with Search and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Allocated Students</h2>
            <p className="text-gray-600 mt-1">Manage student hostel allocations</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username, user ID, package, or room..."
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <button
              onClick={generatePDFReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              📄 Download PDF
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredAllocations.length} of {allocations.length} allocations
          </div>
        )}

        {/* Allocations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {allocation.student_name.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {allocation.student_name || 'Unknown Student'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{allocation.student_class
 || 'N/A'} | ID: {allocation.student_roll}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      allocation.status === 'Active' ? 'bg-green-100 text-green-800' :
                      allocation.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {allocation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getAcademicYearName(allocation.academic_year)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPackageName(allocation.hostel_package)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoomName(allocation.room)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(allocation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(allocation)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(allocation.id)}
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

        {/* Empty State */}
        {filteredAllocations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-2">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No allocations found' : 'No allocations yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first hostel allocation above.'}
            </p>
          </div>
        )}

        {/* Allocation Statistics */}
        {allocations.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-800 font-semibold">Total Allocations</div>
              <div className="text-2xl font-bold text-blue-900">{allocations.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-800 font-semibold">Active</div>
              <div className="text-2xl font-bold text-green-900">
                {allocations.filter(a => a.status === 'Active').length}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-800 font-semibold">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {allocations.filter(a => a.status === 'Pending').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-800 font-semibold">Inactive</div>
              <div className="text-2xl font-bold text-red-900">
                {allocations.filter(a => a.status === 'Inactive').length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAllocation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Allocation
              </h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={editFormData.academic_year}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.year || year.name || year.academic_year || year.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hostel Package */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostel Package
                  </label>
                  <select
                    value={editFormData.hostel_package}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, hostel_package: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hostelPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.package_name} - ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    value={editFormData.room}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hostelRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => setEditingAllocation(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocatedStudentsTable;