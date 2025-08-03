import React, { useState } from 'react';
import {   useGetCoachingBatchesQuery,
  useGetCoachingBatchByIdQuery,
  useCreateCoachingBatchMutation,
  useUpdateCoachingBatchMutation,
  usePatchCoachingBatchMutation,
  useDeleteCoachingBatchMutation } from '../../redux/features/api/coaching/coachingBatchesApi';


const CoachingBatches = () => {
  const [newBatchName, setNewBatchName] = useState('');
  const [editingBatch, setEditingBatch] = useState(null);
  const [editName, setEditName] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [searchId, setSearchId] = useState('');

  // API Hooks
  const { data: batches = [], isLoading, error, refetch } = useGetCoachingBatchesQuery();
  const { data: selectedBatch, isLoading: isLoadingSelected } = useGetCoachingBatchByIdQuery(
    selectedBatchId,
    { skip: !selectedBatchId }
  );
  
  const [createBatch, { isLoading: isCreating }] = useCreateCoachingBatchMutation();
  const [updateBatch, { isLoading: isUpdating }] = useUpdateCoachingBatchMutation();
  const [patchBatch, { isLoading: isPatching }] = usePatchCoachingBatchMutation();
  const [deleteBatch, { isLoading: isDeleting }] = useDeleteCoachingBatchMutation();

  // Create new batch
  const handleCreateBatch = async (e) => {
    if (e) e.preventDefault();
    if (!newBatchName.trim()) return;

    try {
      await createBatch({ name: newBatchName.trim() }).unwrap();
      setNewBatchName('');
      console.log('Batch created successfully');
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  // Start editing
  const handleEditStart = (batch) => {
    setEditingBatch(batch.id);
    setEditName(batch.name);
  };

  // Save edit (using PUT - full update)
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    try {
      await updateBatch({ id, name: editName.trim() }).unwrap();
      setEditingBatch(null);
      setEditName('');
      console.log('Batch updated successfully');
    } catch (error) {
      console.error('Failed to update batch:', error);
    }
  };

  // Patch edit (using PATCH - partial update)
  const handlePatchEdit = async (id) => {
    if (!editName.trim()) return;

    try {
      await patchBatch({ id, name: editName.trim() }).unwrap();
      setEditingBatch(null);
      setEditName('');
      console.log('Batch patched successfully');
    } catch (error) {
      console.error('Failed to patch batch:', error);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingBatch(null);
    setEditName('');
  };

  // Delete batch
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteBatch(id).unwrap();
        console.log('Batch deleted successfully');
      } catch (error) {
        console.error('Failed to delete batch:', error);
      }
    }
  };

  // Search by ID
  const handleSearchById = () => {
    if (searchId.trim()) {
      setSelectedBatchId(searchId.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading batches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-medium">Error loading batches</h3>
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
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Coaching Batches Management</h1>

      {/* Create New Batch Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Create New Batch</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            placeholder="Enter batch name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateBatch(e)}
          />
          <button
            onClick={handleCreateBatch}
            disabled={isCreating || !newBatchName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "+"
            )}
            {isCreating ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </div>

      {/* Search by ID */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Search Batch by ID</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter batch ID"
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
        {selectedBatch && (
          <div className="mt-3 p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-800">Found Batch:</h3>
            <p className="text-gray-600">ID: {selectedBatch.id}</p>
            <p className="text-gray-600">Name: {selectedBatch.name}</p>
          </div>
        )}
        {isLoadingSelected && (
          <div className="mt-3 flex items-center text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Batches List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">All Batches ({batches.length})</h2>
        </div>
        
        {batches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No batches found. Create your first batch above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <div key={batch.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingBatch === batch.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isUpdating || isPatching}
                        />
                        <button
                          onClick={() => handleSaveEdit(batch.id)}
                          disabled={isUpdating || !editName.trim()}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          title="Save (PUT)"
                        >
                          {isUpdating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            "💾"
                          )}
                        </button>
                        <button
                          onClick={() => handlePatchEdit(batch.id)}
                          disabled={isPatching || !editName.trim()}
                          className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1"
                          title="Patch (PATCH)"
                        >
                          {isPatching ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            "📝"
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-1"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{batch.name}</h3>
                        <p className="text-sm text-gray-500">ID: {batch.id}</p>
                        {batch.created_at && (
                          <p className="text-sm text-gray-500">
                            Created: {new Date(batch.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingBatch !== batch.id && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditStart(batch)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="Edit batch"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id)}
                        disabled={isDeleting}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                        title="Delete batch"
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
        {isCreating && <span className="text-blue-600">Creating batch...</span>}
        {isUpdating && <span className="text-green-600">Updating batch...</span>}
        {isPatching && <span className="text-yellow-600">Patching batch...</span>}
        {isDeleting && <span className="text-red-600">Deleting batch...</span>}
      </div>
    </div>
  );
};

export default CoachingBatches;