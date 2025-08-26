import React, { useState } from 'react';
import {   useGetLayoutNamesQuery,
  useCreateLayoutNameMutation,
  useUpdateLayoutNameMutation,
  useDeleteLayoutNameMutation, } from '../../redux/features/api/layout/layoutNamesApi';


const AddLayoutName = () => {
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // API hooks
  const { data: layoutNames, isLoading, error } = useGetLayoutNamesQuery();
  const [createLayoutName, { isLoading: isCreating }] = useCreateLayoutNameMutation();
  const [updateLayoutName, { isLoading: isUpdating }] = useUpdateLayoutNameMutation();
  const [deleteLayoutName, { isLoading: isDeleting }] = useDeleteLayoutNameMutation();

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await createLayoutName({ name: inputValue.trim() }).unwrap();
      setInputValue(''); // Clear input after successful creation
    } catch (err) {
      console.error('Failed to create layout name:', err);
    }
  };

  // Handle edit
  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  // Handle update
  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;

    try {
      await updateLayoutName({ id, name: editValue.trim() }).unwrap();
      setEditingId(null);
      setEditValue('');
    } catch (err) {
      console.error('Failed to update layout name:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this layout name?')) {
      try {
        await deleteLayoutName(id).unwrap();
      } catch (err) {
        console.error('Failed to delete layout name:', err);
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (isLoading) return <div className="p-4">Loading layout names...</div>;
  
  // Handle the case where no layout names exist yet (don't show error)
  const hasLayoutNames = layoutNames && Array.isArray(layoutNames) && layoutNames.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Layout Names</h2>
      
      {/* Add New Layout Name Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Layout Name</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter layout name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCreating}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isCreating || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Adding...' : 'Add Layout Name'}
          </button>
        </div>
      </div>

      {/* Layout Names Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Layout Names List</h3>
        </div>
        
        {!hasLayoutNames ? (
          <div className="p-6 text-center text-gray-500">
            No layout names found. Add one above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {layoutNames.map((layoutName) => (
                  <tr key={layoutName.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {layoutName.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === layoutName.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(layoutName.id)}
                            disabled={isUpdating || !editValue.trim()}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900">{layoutName.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId !== layoutName.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(layoutName.id, layoutName.name)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isDeleting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(layoutName.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isDeleting}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

export default AddLayoutName;