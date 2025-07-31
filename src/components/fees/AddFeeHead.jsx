import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateFeeHeadMutation, useDeleteFeeHeadMutation, useGetFeeHeadsQuery, useUpdateFeeHeadMutation } from "../../redux/features/api/fee-heads/feeHeadsApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const AddFeeHead = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [feeHeadName, setFeeHeadName] = useState("");
  const [editFeeHeadId, setEditFeeHeadId] = useState(null);
  const [editFeeHeadName, setEditFeeHeadName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const { data: feeHeads = [], isLoading: isFeeHeadLoading, error: feeHeadError } = useGetFeeHeadsQuery();
  const [createFeeHead, { isLoading: isCreating, error: createError }] = useCreateFeeHeadMutation();
  const [updateFeeHead, { isLoading: isUpdating, error: updateError }] = useUpdateFeeHeadMutation();
  const [deleteFeeHead, { isLoading: isDeleting, error: deleteError }] = useDeleteFeeHeadMutation();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_feehead') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_feehead') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_feehead') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_feehead') || false;

  // Handle form submission for adding new fee head
  const handleSubmitFeeHead = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('ফি হেড যোগ করার অনুমতি নেই।');
      return;
    }
    if (!feeHeadName.trim()) {
      toast.error("অনুগ্রহ করে ফি হেডের নাম লিখুন");
      return;
    }
    if (feeHeads.some((fh) => fh.name.toLowerCase() === feeHeadName.toLowerCase())) {
      toast.error("এই ফি হেড ইতিমধ্যে বিদ্যমান!");
      return;
    }
    setModalAction("create");
    setModalData({
      sl: Math.floor(Math.random() * 2147483647),
      name: feeHeadName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (feeHead) => {
    if (!hasChangePermission) {
      toast.error('ফি হেড সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditFeeHeadId(feeHead.id);
    setEditFeeHeadName(feeHead.name);
  };

  // Handle update fee head
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('ফি হেড আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editFeeHeadName.trim()) {
      toast.error("অনুগ্রহ করে ফি হেডের নাম লিখুন");
      return;
    }
    setModalAction("update");
    setModalData({
      id: editFeeHeadId,
      name: editFeeHeadName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle delete fee head
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('ফি হেড মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        if (!hasAddPermission) {
          toast.error('ফি হেড যোগ করার অনুমতি নেই।');
          return;
        }
        await createFeeHead(modalData).unwrap();
        toast.success("ফি হেড সফলভাবে তৈরি হয়েছে!");
        setFeeHeadName("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) {
          toast.error('ফি হেড আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateFeeHead(modalData).unwrap();
        toast.success("ফি হেড সফলভাবে আপডেট হয়েছে!");
        setEditFeeHeadId(null);
        setEditFeeHeadName("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error('ফি হেড মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteFeeHead(modalData.id).unwrap();
        toast.success("ফি হেড সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error(`Error ${modalAction === "create" ? "creating" : modalAction === "update" ? "updating" : "deleting"} fee head:`, err);
      toast.error(`ফি হেড ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"} ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // If user only has view permission and no other permissions, restrict to view-only
  if (hasViewPermission && !hasAddPermission && !hasChangePermission && !hasDeletePermission) {
    return (
      <div className="py-8 w-full relative">
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { background: '#DB9E30', color: '#fff' } }} />
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
          <h3 className="text-lg font-semibold text-white p-4 border-b border-white/20">ফি হেড তালিকা</h3>
          {isFeeHeadLoading ? (
            <p className="p-4 text-white/70">লোড হচ্ছে...</p>
          ) : feeHeadError ? (
            <p className="p-4 text-red-400">
              ফি হেড লোড করতে ত্রুটি: {feeHeadError.status || "অজানা"} -{" "}
              {JSON.stringify(feeHeadError.data || {})}
            </p>
          ) : feeHeads.length === 0 ? (
            <p className="p-4 text-white/70">কোনো ফি হেড উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      ক্রমিক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      ফি হেড
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {feeHeads.map((feeHead, index) => (
                    <tr key={feeHead?.sl || index} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{feeHead.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (permissionsLoading) {
    return <div className="p-4 text-white/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8 w-full">
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { background: '#DB9E30', color: '#fff' } }} />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Form to Add Fee Head */}
      {hasAddPermission && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <IoAddCircle className="text-4xl text-white" />
            <h3 className="text-2xl font-bold text-white tracking-tight">নতুন ফি হেড যোগ করুন</h3>
          </div>
          <form onSubmit={handleSubmitFeeHead} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="feeHeadName"
              value={feeHeadName}
              onChange={(e) => setFeeHeadName(e.target.value)}
              className="w-full bg-transparent text-white placeholder-white pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="ফি হেড লিখুন (যেমন: টিউশন ফি)"
              disabled={isCreating}
              aria-describedby={createError ? "fee-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন ফি হেড তৈরি করুন"
              className={`flex items-center justify-center px-8 py-3 rounded-lg font-medium bg-pmColor text-white transition-all duration-300 animate-scaleIn ${
                isCreating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>তৈরি হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>ফি হেড তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div id="fee-head-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>
      )}

      {/* Edit Fee Head Form */}
      {hasChangePermission && editFeeHeadId && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <FaEdit className="text-3xl text-white" />
            <h3 className="text-2xl font-bold text-white tracking-tight">ফি হেড সম্পাদনা করুন</h3>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <input
              type="text"
              id="editFeeHeadName"
              value={editFeeHeadName}
              onChange={(e) => setEditFeeHeadName(e.target.value)}
              className="w-full bg-transparent text-white placeholder-white pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="ফি হেড সম্পাদনা করুন (যেমন: টিউশন ফি)"
              disabled={isUpdating}
              aria-label="ফি হেড সম্পাদনা"
              aria-describedby={updateError ? "edit-fee-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isUpdating}
              title="ফি হেড আপডেট করুন"
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-pmColor text-white transition-all duration-300 animate-scaleIn ${
                isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>আপডেট হচ্ছে...</span>
                </span>
              ) : (
                <span>ফি হেড আপডেট করুন</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditFeeHeadId(null);
                setEditFeeHeadName("");
              }}
              title="সম্পাদনা বাতিল করুন"
              className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white hover:text-white transition-all duration-300 animate-scaleIn"
            >
              বাতিল
            </button>
          </form>
          {updateError && (
            <div id="edit-fee-head-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              ত্রুটি: {updateError.status || "অজানা"} - {JSON.stringify(updateError.data || {})}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {(hasAddPermission || hasChangePermission || hasDeletePermission) && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-white mb-4">
              {modalAction === "create" && "নতুন ফি হেড নিশ্চিত করুন"}
              {modalAction === "update" && "ফি হেড আপডেট নিশ্চিত করুন"}
              {modalAction === "delete" && "ফি হেড মুছে ফেলা নিশ্চিত করুন"}
            </h3>
            <p className="text-white mb-6">
              {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন ফি হেড তৈরি করতে চান?"}
              {modalAction === "update" && "আপনি কি নিশ্চিত যে ফি হেড আপডেট করতে চান?"}
              {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই ফি হেডটি মুছে ফেলতে চান?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={confirmAction}
                disabled={isCreating || isUpdating || isDeleting}
                className={`px-4 py-2 bg-pmColor text-white rounded-lg transition-colors duration-300 btn-glow ${
                  (isCreating || isUpdating || isDeleting) ? "cursor-not-allowed opacity-60" : "hover:text-white"
                }`}
              >
                {isCreating || isUpdating || isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>
                      {modalAction === "create" && "তৈরি হচ্ছে..."}
                      {modalAction === "update" && "আপডেট হচ্ছে..."}
                      {modalAction === "delete" && "মুছছে..."}
                    </span>
                  </span>
                ) : (
                  "নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Heads Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-white p-4 border-b border-white/20">ফি হেড তালিকা</h3>
        {isFeeHeadLoading ? (
          <p className="p-4 text-white/70">লোড হচ্ছে...</p>
        ) : feeHeadError ? (
          <p className="p-4 text-red-400">
            ফি হেড লোড করতে ত্রুটি: {feeHeadError.status || "অজানা"} - {JSON.stringify(feeHeadError.data || {})}
          </p>
        ) : feeHeads.length === 0 ? (
          <p className="p-4 text-white/70">কোনো ফি হেড উপলব্ধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    ক্রমিক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    ফি হেড
                  </th>
                  {(hasChangePermission || hasDeletePermission) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      কার্যক্রম
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {feeHeads.map((feeHead, index) => (
                  <tr key={feeHead?.sl || index} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{feeHead.name}</td>
                    {(hasChangePermission || hasDeletePermission) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(feeHead)}
                              title="ফি হেড সম্পাদনা"
                              className="text-white hover:text-blue-500 p-2 rounded-lg transition-colors duration-300"
                              aria-label={`সম্পাদনা ${feeHead.name}`}
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(feeHead.id)}
                              title="ফি হেড মুছুন"
                              className="text-white hover:text-red-500 p-2 rounded-lg transition-colors duration-300"
                              aria-label={`মুছুন ${feeHead.name}`}
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "মুছছে..." : `ফি হেড মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFeeHead;