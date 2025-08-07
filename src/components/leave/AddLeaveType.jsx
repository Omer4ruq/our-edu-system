import React, { useState } from "react";
import {
  useGetLeaveApiQuery,
  useCreateLeaveApiMutation,
  useUpdateLeaveApiMutation,
  useDeleteLeaveApiMutation,
} from "../../redux/features/api/leave/leaveApi";
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";


const AddLeaveType = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [leaveName, setLeaveName] = useState("");
  const [editLeaveId, setEditLeaveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_leavetype') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_leavetype') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_leavetype') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_leavetype') || false;

  // API hooks
  const {
    data: leaveTypes,
    isLoading: isLeaveLoading,
    error: leaveError,
    refetch,
  } = useGetLeaveApiQuery();
  const [createLeave, { isLoading: isCreating, error: createError }] = useCreateLeaveApiMutation();
  const [updateLeave, { isLoading: isUpdating, error: updateError }] = useUpdateLeaveApiMutation();
  const [deleteLeave, { isLoading: isDeleting, error: deleteError }] = useDeleteLeaveApiMutation();

  // Handle form submission for adding or updating leave type
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editLeaveId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    const name = leaveName.trim();
    if (!name) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে ছুটির ধরনের নাম লিখুন" : "Please enter leave type name");
      return;
    }
    if (leaveTypes?.some((lt) => lt.name.toLowerCase() === name.toLowerCase() && lt.id !== editLeaveId)) {
      toast.error(languageCode === 'bn' ? "এই ছুটির ধরন ইতিমধ্যে বিদ্যমান!" : "This leave type already exists!");
      return;
    }

    setModalAction(editLeaveId ? "update" : "create");
    setModalData({
      id: editLeaveId,
      name: name,
      is_active: editLeaveId ? leaveTypes.find((lt) => lt.id === editLeaveId)?.is_active || true : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (leave) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditLeaveId(leave.id);
    setLeaveName(leave.name);
  };

  // Handle delete leave type
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
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
          toast.error(languageCode === 'bn' ? 'তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create.'); 
          return; 
        }
        await createLeave({ name: modalData.name, is_active: modalData.is_active }).unwrap();
        toast.success(languageCode === 'bn' ? "ছুটির ধরন সফলভাবে তৈরি করা হয়েছে!" : "Leave type created successfully!");
        setLeaveName("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.'); 
          return; 
        }
        await updateLeave(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "ছুটির ধরন সফলভাবে আপডেট করা হয়েছে!" : "Leave type updated successfully!");
        setEditLeaveId(null);
        setLeaveName("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { 
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.'); 
          return; 
        }
        await deleteLeave(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? "ছুটির ধরন সফলভাবে মুছে ফেলা হয়েছে!" : "Leave type deleted successfully!");
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'ছুটির ধরন' : 'Leave type'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Get modal content based on action
  const getModalContent = () => {
    switch (modalAction) {
      case "create":
        return {
          title: languageCode === 'bn' ? "নতুন ছুটির ধরন নিশ্চিত করুন" : "Confirm New Leave Type",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন ছুটির ধরন তৈরি করতে চান?" : "Are you sure you want to create a new leave type?"
        };
      case "update":
        return {
          title: languageCode === 'bn' ? "ছুটির ধরন আপডেট নিশ্চিত করুন" : "Confirm Leave Type Update",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে ছুটির ধরন আপডেট করতে চান?" : "Are you sure you want to update this leave type?"
        };
      case "delete":
        return {
          title: languageCode === 'bn' ? "ছুটির ধরন মুছে ফেলা নিশ্চিত করুন" : "Confirm Leave Type Deletion",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে এই ছুটির ধরনটি মুছে ফেলতে চান?" : "Are you sure you want to delete this leave type?"
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Permission-based Rendering
  if (permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-[#441a05]">
            {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center">
          <div className="text-secColor text-xl font-semibold">
            {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#441a05]">
              {languageCode === 'bn' ? 'ছুটির ধরন ব্যবস্থাপনা' : 'Leave Type Management'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'ছুটির ধরন তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit and manage leave types'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Leave Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editLeaveId ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-[#441a05]">
              {editLeaveId 
                ? (languageCode === 'bn' ? "ছুটির ধরন সম্পাদনা করুন" : "Edit Leave Type")
                : (languageCode === 'bn' ? "নতুন ছুটির ধরন যোগ করুন" : "Add New Leave Type")
              }
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <input
                type="text"
                id="leaveName"
                value={leaveName}
                onChange={(e) => setLeaveName(e.target.value)}
                className="w-full bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "ছুটির ধরন" : "Leave Type"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "ছুটির ধরন" : "Leave Type"}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || isUpdating || (editLeaveId ? !hasChangePermission : !hasAddPermission)}
              className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                (isCreating || isUpdating || (editLeaveId ? !hasChangePermission : !hasAddPermission)) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>
                    {editLeaveId 
                      ? (languageCode === 'bn' ? "আপডেট করা হচ্ছে..." : "Updating...")
                      : (languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating...")
                    }
                  </span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>
                    {editLeaveId 
                      ? (languageCode === 'bn' ? "ছুটি আপডেট করুন" : "Update Leave")
                      : (languageCode === 'bn' ? "ছুটি তৈরি করুন" : "Create Leave")
                    }
                  </span>
                </>
              )}
            </button>
            
            {editLeaveId && (
              <button
                type="button"
                onClick={() => {
                  setEditLeaveId(null);
                  setLeaveName("");
                }}
                className="bg-red-500 hover:bg-secColor/30 text-[#441a05]px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
          </form>
          
          {(createError || updateError) && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {languageCode === 'bn' ? 'ত্রুটি:' : 'Error:'} {(createError || updateError).status || "unknown"} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave Types Table */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-[#441a05]/20">
          <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'ছুটির ধরনের তালিকা' : 'Leave Types List'}</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          {isLeaveLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'ছুটির ধরন লোড হচ্ছে...' : 'Loading leave types...'}
              </p>
            </div>
          ) : leaveError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'ছুটির ধরন লোড করতে ত্রুটি:' : 'Error loading leave types:'} {leaveError.status || "unknown"}
                </p>
              </div>
            </div>
          ) : leaveTypes?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'কোনো ছুটির ধরন উপলব্ধ নেই।' : 'No leave types available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-[#441a05]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#441a05]/80">
                    {languageCode === 'bn' ? 'ছুটির ধরন' : 'Leave Type'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#441a05]/80">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#441a05]/80">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#441a05]/80">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#441a05]/10">
                {leaveTypes?.map((leave, index) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-[#441a05]/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]font-medium">{leave.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {new Date(leave.created_at).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {new Date(leave.updated_at).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(leave)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'ছুটির ধরন সম্পাদনা করুন' : 'Edit leave type'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'ছুটির ধরন মুছুন' : 'Delete leave type'}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {(isDeleting || deleteError) && (
          <div className="p-4 border-t border-[#441a05]/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? "ছুটির ধরন মুছে ফেলা হচ্ছে..." : "Deleting leave type...")
                  : `${languageCode === 'bn' ? 'ছুটির ধরন মুছে ফেলতে ত্রুটি:' : 'Error deleting leave type:'} ${deleteError?.status || "unknown"}`
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reusable Draggable Modal */}
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

export default AddLeaveType;