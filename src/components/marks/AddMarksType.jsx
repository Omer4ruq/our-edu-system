import React, { useState } from 'react';
import {  useGetMarkTypesQuery,
  useCreateMarkTypeMutation,
  useUpdateMarkTypeMutation,
  useDeleteMarkTypeMutation, } from '../../redux/features/api/marks/markTypesApi';

const AddMarksType = () => {
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // API hooks
  const { data: markTypes, isLoading, error } = useGetMarkTypesQuery();
  const [createMarkType, { isLoading: isCreating }] = useCreateMarkTypeMutation();
  const [updateMarkType, { isLoading: isUpdating }] = useUpdateMarkTypeMutation();
  const [deleteMarkType, { isLoading: isDeleting }] = useDeleteMarkTypeMutation();

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await createMarkType({ name: inputValue.trim() }).unwrap();
      setInputValue(''); // Clear input after successful creation
    } catch (err) {
      console.error('Failed to create mark type:', err);
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
      await updateMarkType({ id, name: editValue.trim() }).unwrap();
      setEditingId(null);
      setEditValue('');
    } catch (err) {
      console.error('Failed to update mark type:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mark type?')) {
      try {
        await deleteMarkType(id).unwrap();
      } catch (err) {
        console.error('Failed to delete mark type:', err);
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (isLoading) return <div className="p-4">Loading mark types...</div>;
  
  // Handle the case where no mark types exist yet (don't show error)
  const hasMarkTypes = markTypes && Array.isArray(markTypes) && markTypes.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Mark Types</h2>
      
      {/* Add New Mark Type Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Mark Type</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter mark type name"
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
            {isCreating ? 'Adding...' : 'Add Mark Type'}
          </button>
        </div>
      </div>

      {/* Mark Types Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Mark Types List</h3>
        </div>
        
        {!hasMarkTypes ? (
          <div className="p-6 text-center text-gray-500">
            No mark types found. Add one above to get started.
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
                {markTypes.map((markType) => (
                  <tr key={markType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {markType.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === markType.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(markType.id)}
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
                        <span className="text-sm text-gray-900">{markType.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId !== markType.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(markType.id, markType.name)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isDeleting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(markType.id)}
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

export default AddMarksType;