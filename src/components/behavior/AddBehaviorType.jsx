import React, { useState } from "react";
import {
  useCreateBehaviorTypeApiMutation,
  useGetBehaviorTypeApiQuery,
  useUpdateBehaviorTypeApiMutation,
  useDeleteBehaviorTypeApiMutation,
} from "../../redux/features/api/behavior/behaviorTypeApi";
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";

const AddBehaviorType = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [behavior, setBehavior] = useState("");
  const [marks, setMarks] = useState("");
  const [editBehaviorId, setEditBehaviorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_student_behavior_report_type') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_student_behavior_report_type') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_student_behavior_report_type') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_student_behavior_report_type') || false;

  // API hooks
  const {
    data: behaviorTypes,
    isLoading: isBehaviorLoading,
    error: behaviorError,
    refetch,
  } = useGetBehaviorTypeApiQuery();
  const [createBehavior, { isLoading: isCreating, error: createError }] = useCreateBehaviorTypeApiMutation();
  const [updateBehavior, { isLoading: isUpdating, error: updateError }] = useUpdateBehaviorTypeApiMutation();
  const [deleteBehavior, { isLoading: isDeleting, error: deleteError }] = useDeleteBehaviorTypeApiMutation();

  // Validate marks
  const validateMarks = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Handle form submission for adding or updating behavior
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editBehaviorId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    const name = behavior.trim();
    if (!name || !marks.trim()) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে আচরণের ধরন এবং নম্বর উভয়ই লিখুন" : "Please enter both behavior type and marks");
      return;
    }
    if (!validateMarks(marks)) {
      toast.error(languageCode === 'bn' ? "নম্বর ০ থেকে ১০০ এর মধ্যে হতে হবে" : "Marks must be between 0 and 100");
      return;
    }
    if (
      behaviorTypes?.some(
        (bt) => bt.name.toLowerCase() === name.toLowerCase() && bt.id !== editBehaviorId
      )
    ) {
      toast.error(languageCode === 'bn' ? "এই আচরণের ধরন ইতিমধ্যে বিদ্যমান!" : "This behavior type already exists!");
      return;
    }

    setModalAction(editBehaviorId ? "update" : "create");
    setModalData({
      id: editBehaviorId,
      name,
      obtain_mark: Number(marks),
      is_active: editBehaviorId
        ? behaviorTypes.find((bt) => bt.id === editBehaviorId)?.is_active || true
        : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (behavior) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditBehaviorId(behavior.id);
    setBehavior(behavior.name);
    setMarks(behavior.obtain_mark.toString());
  };

  // Handle toggle active status
  const handleToggleActive = (behavior) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।' : 'You do not have permission to change status.');
      return;
    }
    setModalAction("toggle");
    setModalData({
      id: behavior.id,
      name: behavior.name,
      obtain_mark: behavior.obtain_mark,
      is_active: !behavior.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete behavior
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
        await createBehavior(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "আচরণের ধরন সফলভাবে তৈরি করা হয়েছে!" : "Behavior type created successfully!");
        setBehavior("");
        setMarks("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.'); 
          return; 
        }
        await updateBehavior(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "আচরণের ধরন সফলভাবে আপডেট করা হয়েছে!" : "Behavior type updated successfully!");
        setEditBehaviorId(null);
        setBehavior("");
        setMarks("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { 
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.'); 
          return; 
        }
        await deleteBehavior(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? "আচরণের ধরন সফলভাবে মুছে ফেলা হয়েছে!" : "Behavior type deleted successfully!");
      } else if (modalAction === "toggle") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।' : 'You do not have permission to change status.'); 
          return; 
        }
        await updateBehavior(modalData).unwrap();
        toast.success(languageCode === 'bn' ? `আচরণ ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!` : `Behavior ${modalData.name} is now ${modalData.is_active ? "active" : "inactive"}!`);
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'আচরণের ধরন' : 'Behavior type'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
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
          title: languageCode === 'bn' ? "নতুন আচরণের ধরন নিশ্চিত করুন" : "Confirm New Behavior Type",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন আচরণের ধরন তৈরি করতে চান?" : "Are you sure you want to create a new behavior type?"
        };
      case "update":
        return {
          title: languageCode === 'bn' ? "আচরণের ধরন আপডেট নিশ্চিত করুন" : "Confirm Behavior Type Update",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে আচরণের ধরন আপডেট করতে চান?" : "Are you sure you want to update this behavior type?"
        };
      case "delete":
        return {
          title: languageCode === 'bn' ? "আচরণের ধরন মুছে ফেলা নিশ্চিত করুন" : "Confirm Behavior Type Deletion",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে এই আচরণের ধরনটি মুছে ফেলতে চান?" : "Are you sure you want to delete this behavior type?"
        };
      case "toggle":
        return {
          title: languageCode === 'bn' ? "আচরণের ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন" : "Confirm Behavior Type Status Change",
          message: languageCode === 'bn' ? `আপনি কি নিশ্চিত যে আচরণের ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?` : `Are you sure you want to ${modalData?.is_active ? "activate" : "deactivate"} this behavior type?`
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Permission-based Rendering
  if (permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-white">
            {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {languageCode === 'bn' ? 'আচরণের ধরন ব্যবস্থাপনা' : 'Behavior Type Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'আচরণের ধরন তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit and manage behavior types'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Behavior Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editBehaviorId ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editBehaviorId 
                ? (languageCode === 'bn' ? "আচরণের ধরন সম্পাদনা করুন" : "Edit Behavior Type")
                : (languageCode === 'bn' ? "নতুন আচরণের ধরন যোগ করুন" : "Add New Behavior Type")
              }
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <input
                type="text"
                id="behaviorName"
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "আচরণের ধরন" : "Behavior Type"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "আচরণের ধরন" : "Behavior Type"}
              />
            </div>
            
            <div className="relative">
              <input
                type="number"
                id="marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "নম্বর লিখুন" : "Enter marks"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "নম্বর" : "Marks"}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || isUpdating || (editBehaviorId ? !hasChangePermission : !hasAddPermission)}
              className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                (isCreating || isUpdating || (editBehaviorId ? !hasChangePermission : !hasAddPermission)) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>
                    {editBehaviorId 
                      ? (languageCode === 'bn' ? "আপডেট করা হচ্ছে..." : "Updating...")
                      : (languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating...")
                    }
                  </span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>
                    {editBehaviorId 
                      ? (languageCode === 'bn' ? "আচরণ আপডেট করুন" : "Update Behavior")
                      : (languageCode === 'bn' ? "আচরণ তৈরি করুন" : "Create Behavior")
                    }
                  </span>
                </>
              )}
            </button>
            
            {editBehaviorId && (
              <button
                type="button"
                onClick={() => {
                  setEditBehaviorId(null);
                  setBehavior("");
                  setMarks("");
                }}
                className="bg-red-500 hover:bg-secColor/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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

      {/* Behavior Types Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'আচরণের ধরনের তালিকা' : 'Behavior Types List'}</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          {isBehaviorLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-white/70">
                {languageCode === 'bn' ? 'আচরণের ধরন লোড হচ্ছে...' : 'Loading behavior types...'}
              </p>
            </div>
          ) : behaviorError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'আচরণের ধরন লোড করতে ত্রুটি:' : 'Error loading behavior types:'} {behaviorError.status || "unknown"}
                </p>
              </div>
            </div>
          ) : behaviorTypes?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/70">
                {languageCode === 'bn' ? 'কোনো আচরণের ধরন উপলব্ধ নেই।' : 'No behavior types available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আচরণের ধরন' : 'Behavior Type'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'নম্বর' : 'Marks'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'সক্রিয়' : 'Active'}
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
                {behaviorTypes?.map((behavior, index) => (
                  <tr
                    key={behavior.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{behavior.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{behavior.obtain_mark}</div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={behavior.is_active}
                          onChange={() => handleToggleActive(behavior)}
                          className="hidden"
                          disabled={!hasChangePermission}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                            behavior.is_active
                              ? "bg-pmColor border-pmColor"
                              : "bg-white/10 border-white/20 hover:border-white"
                          }`}
                        >
                          {behavior.is_active && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {new Date(behavior.created_at).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {new Date(behavior.updated_at).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(behavior)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আচরণের ধরন সম্পাদনা করুন' : 'Edit behavior type'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(behavior.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'আচরণের ধরন মুছুন' : 'Delete behavior type'}
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
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? "আচরণের ধরন মুছে ফেলা হচ্ছে..." : "Deleting behavior type...")
                  : `${languageCode === 'bn' ? 'আচরণের ধরন মুছে ফেলতে ত্রুটি:' : 'Error deleting behavior type:'} ${deleteError?.status || "unknown"}`
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

export default AddBehaviorType;