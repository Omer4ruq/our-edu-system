import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetCoachingBatchesQuery,
  useGetCoachingBatchByIdQuery,
  useCreateCoachingBatchMutation,
  useUpdateCoachingBatchMutation,
  usePatchCoachingBatchMutation,
  useDeleteCoachingBatchMutation,
} from '../../redux/features/api/coaching/coachingBatchesApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdAccessTime, MdUpdate } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import DraggableModal from '../common/DraggableModal';
import { languageCode } from '../../utilitis/getTheme';

const CoachingBatches = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [newBatchName, setNewBatchName] = useState('');
  const [editingBatch, setEditingBatch] = useState(null);
  const [editName, setEditName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_coaching_batch') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_coaching_batch') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_coaching_batch') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_coaching_batch') || false;

  // API Hooks
  const { data: batches = [], isLoading, error: batchesError, refetch } = useGetCoachingBatchesQuery();
  const { data: selectedBatch, isLoading: isLoadingSelected, error: selectedBatchError } = useGetCoachingBatchByIdQuery(
    selectedBatchId,
    { skip: !selectedBatchId }
  );
  const [createBatch, { isLoading: isCreating, error: createError }] = useCreateCoachingBatchMutation();
  const [updateBatch, { isLoading: isUpdating, error: updateError }] = useUpdateCoachingBatchMutation();
  const [patchBatch, { isLoading: isPatching, error: patchError }] = usePatchCoachingBatchMutation();
  const [deleteBatch, { isLoading: isDeleting, error: deleteError }] = useDeleteCoachingBatchMutation();

  // Handle create batch
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.');
      return;
    }
    if (!newBatchName.trim()) {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে ব্যাচের নাম লিখুন' : 'Please enter the batch name');
      return;
    }
    if (batches.some(batch => batch.name.toLowerCase() === newBatchName.trim().toLowerCase())) {
      toast.error(languageCode === 'bn' ? 'এই ব্যাচের নাম ইতিমধ্যে বিদ্যমান!' : 'This batch name already exists!');
      return;
    }

    setModalAction('create');
    setModalData({ name: newBatchName.trim() });
    setIsModalOpen(true);
  };

  // Handle edit start
  const handleEditStart = (batch) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditingBatch(batch.id);
    setEditName(batch.name);
  };

  // Handle update (PUT)
  const handleSaveEdit = (id) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
      return;
    }
    if (!editName.trim()) {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে ব্যাচের নাম লিখুন' : 'Please enter the batch name');
      return;
    }
    if (batches.some(batch => batch.name.toLowerCase() === editName.trim().toLowerCase() && batch.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই ব্যাচের নাম ইতিমধ্যে বিদ্যমান!' : 'This batch name already exists!');
      return;
    }

    setModalAction('update');
    setModalData({ id, name: editName.trim() });
    setIsModalOpen(true);
  };

  // Handle patch (PATCH)
  const handlePatchEdit = (id) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
      return;
    }
    if (!editName.trim()) {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে ব্যাচের নাম লিখুন' : 'Please enter the batch name');
      return;
    }
    if (batches.some(batch => batch.name.toLowerCase() === editName.trim().toLowerCase() && batch.id !== id)) {
      toast.error(languageCode === 'bn' ? 'এই ব্যাচের নাম ইতিমধ্যে বিদ্যমান!' : 'This batch name already exists!');
      return;
    }

    setModalAction('patch');
    setModalData({ id, name: editName.trim() });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) {
          toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.');
          return;
        }
        await createBatch(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'ব্যাচ সফলভাবে তৈরি করা হয়েছে!' : 'Batch created successfully!');
        setNewBatchName('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
          return;
        }
        await updateBatch(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'ব্যাচ সফলভাবে আপডেট করা হয়েছে!' : 'Batch updated successfully!');
        setEditingBatch(null);
        setEditName('');
      } else if (modalAction === 'patch') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
          return;
        }
        await patchBatch(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'ব্যাচ সফলভাবে আপডেট করা হয়েছে!' : 'Batch patched successfully!');
        setEditingBatch(null);
        setEditName('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
          return;
        }
        await deleteBatch(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'ব্যাচ সফলভাবে মুছে ফেলা হয়েছে!' : 'Batch deleted successfully!');
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'ব্যাচ' : 'Batch'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle search by ID
  const handleSearchById = () => {
    if (!hasViewPermission) {
      toast.error(languageCode === 'bn' ? 'দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view.');
      return;
    }
    if (searchId.trim()) {
      setSelectedBatchId(searchId.trim());
    } else {
      toast.error(languageCode === 'bn' ? 'অনুগ্রহ করে একটি ব্যাচ আইডি দিন' : 'Please enter a batch ID');
    }
  };

  // Get modal content
  const getModalContent = () => {
    switch (modalAction) {
      case 'create':
        return {
          title: languageCode === 'bn' ? 'নতুন ব্যাচ নিশ্চিত করুন' : 'Confirm New Batch',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন ব্যাচ তৈরি করতে চান?' : 'Are you sure you want to create a new batch?'
        };
      case 'update':
        return {
          title: languageCode === 'bn' ? 'ব্যাচ আপডেট নিশ্চিত করুন' : 'Confirm Batch Update',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে ব্যাচ আপডেট করতে চান?' : 'Are you sure you want to update this batch?'
        };
      case 'patch':
        return {
          title: languageCode === 'bn' ? 'ব্যাচ আপডেট নিশ্চিত করুন' : 'Confirm Batch Patch',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে ব্যাচ আংশিকভাবে আপডেট করতে চান?' : 'Are you sure you want to patch this batch?'
        };
      case 'delete':
        return {
          title: languageCode === 'bn' ? 'ব্যাচ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Batch Deletion',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই ব্যাচটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this batch?'
        };
      default:
        return { title: '', message: '' };
    }
  };

  // Permission-based Rendering
  // if (permissionsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
  //         <div className="text-white">
  //           {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!hasViewPermission) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <div className="text-secColor text-xl font-semibold">
  //           {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="py-8 w-full mx-auto">
      <Toaster position="top-right" reverseOrder={false} />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
        `}
      </style>

      {/* Page Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {languageCode === 'bn' ? 'কোচিং ব্যাচ ব্যবস্থাপনা' : 'Coaching Batches Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'কোচিং ব্যাচ তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit, and manage coaching batches'}
            </p>
          </div>
        </div>
      </div>

      {/* Create/Edit Batch Form */}
      {/* {(hasAddPermission || hasChangePermission) && ( */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editingBatch ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editingBatch
                ? (languageCode === 'bn' ? 'ব্যাচ সম্পাদনা করুন' : 'Edit Batch')
                : (languageCode === 'bn' ? 'নতুন ব্যাচ তৈরি করুন' : 'Create New Batch')}
            </h3>
          </div>

          <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <input
                type="text"
                value={editingBatch ? editName : newBatchName}
                onChange={(e) => (editingBatch ? setEditName(e.target.value) : setNewBatchName(e.target.value))}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? 'ব্যাচের নাম লিখুন' : 'Enter batch name'}
                disabled={isCreating || isUpdating || isPatching}
                aria-label={languageCode === 'bn' ? 'ব্যাচের নাম' : 'Batch Name'}
              />
            </div>

            {editingBatch ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingBatch)}
                  disabled={isUpdating || !editName.trim() || !hasChangePermission}
                  className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                    (isUpdating || !editName.trim() || !hasChangePermission)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{languageCode === 'bn' ? 'আপডেট করা হচ্ছে...' : 'Updating...'}</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>{languageCode === 'bn' ? 'আপডেট (PUT)' : 'Update (PUT)'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handlePatchEdit(editingBatch)}
                  disabled={isPatching || !editName.trim() || !hasChangePermission}
                  className={`bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                    (isPatching || !editName.trim() || !hasChangePermission)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isPatching ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{languageCode === 'bn' ? 'আপডেট করা হচ্ছে...' : 'Patching...'}</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>{languageCode === 'bn' ? 'আপডেট (PATCH)' : 'Patch (PATCH)'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBatch(null);
                    setEditName('');
                  }}
                  className="bg-red-500 hover:bg-secColor/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isCreating || !newBatchName.trim() || !hasAddPermission}
                className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  (isCreating || !newBatchName.trim() || !hasAddPermission)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                {isCreating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{languageCode === 'bn' ? 'তৈরি করা হচ্ছে...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>{languageCode === 'bn' ? 'ব্যাচ তৈরি করুন' : 'Create Batch'}</span>
                  </>
                )}
              </button>
            )}
          </form>

          {(createError || updateError || patchError) && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {languageCode === 'bn' ? 'ত্রুটি:' : 'Error:'} {(createError || updateError || patchError).status || 'unknown'} - {JSON.stringify((createError || updateError || patchError).data || {})}
              </div>
            </div>
          )}
        </div>
      {/* )} */}

      {/* Search by ID */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaSearch className="text-pmColor text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {languageCode === 'bn' ? 'আইডি দ্বারা ব্যাচ অনুসন্ধান' : 'Search Batch by ID'}
          </h3>
        </div>
        <div className="flex gap-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={languageCode === 'bn' ? 'ব্যাচ আইডি লিখুন' : 'Enter batch ID'}
              className="w-full pl-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
              disabled={isLoadingSelected}
            />
            <FaSearch className="absolute left-3 top-4 text-white/60" />
          </div>
          <button
            onClick={handleSearchById}
            disabled={isLoadingSelected || !searchId.trim()}
            className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
              (isLoadingSelected || !searchId.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'
            }`}
          >
            <FaSearch />
            <span>{languageCode === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
          </button>
        </div>
        {selectedBatch && (
          <div className="mt-4 bg-white/5 border border-white/20 rounded-xl p-4 animate-scaleIn">
            <h3 className="text-white font-semibold">{languageCode === 'bn' ? 'পাওয়া ব্যাচ:' : 'Found Batch:'}</h3>
            <p className="text-white/70">ID: {selectedBatch.id}</p>
            <p className="text-white/70">{languageCode === 'bn' ? 'নাম:' : 'Name:'} {selectedBatch.name}</p>
          </div>
        )}
        {isLoadingSelected && (
          <div className="mt-4 flex items-center text-white/70">
            <FaSpinner className="animate-spin text-pmColor mr-2" />
            {languageCode === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}
          </div>
        )}
        {selectedBatchError && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">
              {languageCode === 'bn' ? 'ব্যাচ অনুসন্ধানে ত্রুটি:' : 'Error searching batch:'} {selectedBatchError.status || 'unknown'}
            </p>
          </div>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'ব্যাচের তালিকা' : 'Batches List'} ({batches.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          {isLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-white/70">
                {languageCode === 'bn' ? 'ব্যাচ লোড হচ্ছে...' : 'Loading batches...'}
              </p>
            </div>
          ) : batchesError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'ব্যাচ লোড করতে ত্রুটি:' : 'Error loading batches:'} {batchesError.status || 'unknown'}
                </p>
                <button
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-pmColor text-white rounded-xl hover:bg-pmColor/80 transition-all"
                >
                  {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </button>
              </div>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/70">
                {languageCode === 'bn' ? 'কোনো ব্যাচ উপলব্ধ নেই।' : 'No batches available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ব্যাচের নাম' : 'Batch Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {batches.map((batch, index) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      {editingBatch === batch.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                          disabled={isUpdating || isPatching}
                        />
                      ) : (
                        <div className="text-white font-medium">{batch.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{batch.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {batch.created_at ? new Date(batch.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {batch.updated_at ? new Date(batch.updated_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingBatch === batch.id ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleSaveEdit(batch.id)}
                            disabled={isUpdating || !editName.trim()}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আপডেট (PUT)' : 'Update (PUT)'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePatchEdit(batch.id)}
                            disabled={isPatching || !editName.trim()}
                            className="bg-yellow-500/20 hover:bg-yellow-500 hover:text-white text-yellow-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আপডেট (PATCH)' : 'Patch (PATCH)'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBatch(null);
                              setEditName('');
                            }}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditStart(batch)}
                              className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'ব্যাচ সম্পাদনা করুন' : 'Edit batch'}
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(batch.id)}
                              disabled={isDeleting}
                              className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                              title={languageCode === 'bn' ? 'ব্যাচ মুছুন' : 'Delete batch'}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(isDeleting || deleteError) && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'ব্যাচ মুছে ফেলা হচ্ছে...' : 'Deleting batch...')
                  : `${languageCode === 'bn' ? 'ব্যাচ মুছে ফেলতে ত্রুটি:' : 'Error deleting batch:'} ${deleteError?.status || 'unknown'}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={getModalContent().title}
        message={getModalContent().message}
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default CoachingBatches;