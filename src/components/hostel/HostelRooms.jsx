import React, { useState } from 'react';
import { useGetHostelNamesQuery } from '../../redux/features/api/hostel/hostelNames';
import {
  useGetHostelRoomsQuery,
  useCreateHostelRoomMutation,
  useDeleteHostelRoomMutation,
  useUpdateHostelRoomMutation
} from '../../redux/features/api/hostel/hostelRoomsApi';

const HostelRooms = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hostel_name_id: '',
    room_name: '',
    seat_no: ''
  });

  // API hooks
  const { data: hostelNames = [] } = useGetHostelNamesQuery();
  const { data: rooms = [], isLoading, isError, error } = useGetHostelRoomsQuery();
  const [createRoom, { isLoading: isCreating }] = useCreateHostelRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateHostelRoomMutation();
  const [deleteRoom] = useDeleteHostelRoomMutation();

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
    if (!formData.hostel_name_id || !formData.room_name.trim() || !formData.seat_no.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const roomData = {
        hostel_name_id: parseInt(formData.hostel_name_id),
        room_name: formData.room_name.trim(),
        seat_no: formData.seat_no.trim()
      };

      if (editingRoom) {
        await updateRoom({ id: editingRoom.id, ...roomData }).unwrap();
        setEditingRoom(null);
      } else {
        await createRoom(roomData).unwrap();
        setShowCreateForm(false);
      }

      // Reset form
      setFormData({
        hostel_name_id: '',
        room_name: '',
        seat_no: ''
      });
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (room) => {
    setEditingRoom(room);
    
    setFormData({
      hostel_name_id: room.hostel_name_id?.toString() || '',
      room_name: room.room_name || '',
      seat_no: room.seat_no || ''
    });
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id).unwrap();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room. Please try again.');
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingRoom(null);
    setFormData({
      hostel_name_id: '',
      room_name: '',
      seat_no: ''
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
          <h2 className="text-red-800 font-semibold">Error Loading Rooms</h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel rooms'}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Hostel Rooms</h1>
            <p className="text-gray-600 mt-2">Manage hostel room inventory with seat assignments</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Room
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingRoom ? 'Edit Room' : 'Create New Room'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hostel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name *
                </label>
                <select
                  name="hostel_name_id"
                  value={formData.hostel_name_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Hostel</option>
                  {hostelNames.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="room_name"
                  value={formData.room_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room name (e.g., Room 101, A-Block-01)"
                />
              </div>

              {/* Seat Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seat Number *
                </label>
                <input
                  type="text"
                  name="seat_no"
                  value={formData.seat_no}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter seat number (e.g., S001, Seat-A1)"
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
                {isCreating || isUpdating ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
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

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Rooms ({rooms.length})
            </h2>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-500">Create your first hostel room to get started.</p>
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
                      Room Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{room.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {(() => {
                                  const hostel = hostelNames.find(h => h.id === room.hostel_name_id);
                                  return hostel?.name?.charAt(0)?.toUpperCase() || 'H';
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(() => {
                                const hostel = hostelNames.find(h => h.id === room.hostel_name_id);
                                return hostel?.name || 'Unknown Hostel';
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-xs">
                                {room.room_name?.charAt(0)?.toUpperCase() || 'R'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{room.room_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {room.seat_no}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(room.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
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
        {rooms.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🏠</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-semibold text-gray-900">{rooms.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🏨</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unique Hostels</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(rooms.map(room => room.hostel_name?.name).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">💺</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Seats</p>
                  <p className="text-2xl font-semibold text-gray-900">{rooms.length}</p>
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
                    {rooms.filter(room => {
                      const createdDate = new Date(room.created_at);
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
      </div>
    </div>
  );
};

export default HostelRooms;