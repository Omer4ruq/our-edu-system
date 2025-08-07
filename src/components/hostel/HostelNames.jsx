import React, { useState } from 'react';
import {
  useGetHostelNamesQuery,
  useCreateHostelNameMutation,
  useUpdateHostelNameMutation,
  useDeleteHostelNameMutation
} from '../../redux/features/api/hostel/hostelNames';
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";

const HostelNames = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [hostelName, setHostelName] = useState("");
  const [editHostelNameId, setEditHostelNameId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_hostelname') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_hostelname') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_hostelname') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_hostelname') || false;

  // API hooks
  const { data: hostelNames = [], isLoading, isError, error } = useGetHostelNamesQuery();
  const [createHostelName, { isLoading: isCreating, error: createError }] = useCreateHostelNameMutation();
  const [updateHostelName, { isLoading: isUpdating, error: updateError }] = useUpdateHostelNameMutation();
  const [deleteHostelName, { isLoading: isDeleting, error: deleteError }] = useDeleteHostelNameMutation();

  // Convert number to Bangla if needed
  const formatNumber = (num) => {
    if (languageCode === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().split('').map(digit => bnDigits[parseInt(digit)] || digit).join('');
    }
    return num;
  };

  // Handle form submission for adding or updating hostel name
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editHostelNameId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    const name = hostelName.trim();
    if (!name) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে হোস্টেলের নাম লিখুন" : "Please enter hostel name");
      return;
    }
    if (hostelNames?.some((hn) => hn.name.toLowerCase() === name.toLowerCase() && hn.id !== editHostelNameId)) {
      toast.error(languageCode === 'bn' ? "এই হোস্টেলের নাম ইতিমধ্যে বিদ্যমান!" : "This hostel name already exists!");
      return;
    }

    setModalAction(editHostelNameId ? "update" : "create");
    setModalData({
      id: editHostelNameId,
      name: name,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (hostelNameObj) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditHostelNameId(hostelNameObj.id);
    setHostelName(hostelNameObj.name);
  };

  // Handle delete hostel name
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
        await createHostelName(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "হোস্টেলের নাম সফলভাবে তৈরি করা হয়েছে!" : "Hostel name created successfully!");
        setHostelName("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.'); 
          return; 
        }
        await updateHostelName(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "হোস্টেলের নাম সফলভাবে আপডেট করা হয়েছে!" : "Hostel name updated successfully!");
        setEditHostelNameId(null);
        setHostelName("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { 
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.'); 
          return; 
        }
        await deleteHostelName(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? "হোস্টেলের নাম সফলভাবে মুছে ফেলা হয়েছে!" : "Hostel name deleted successfully!");
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'হোস্টেলের নাম' : 'Hostel name'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
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
          title: languageCode === 'bn' ? "নতুন হোস্টেলের নাম নিশ্চিত করুন" : "Confirm New Hostel Name",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন হোস্টেলের নাম তৈরি করতে চান?" : "Are you sure you want to create a new hostel name?"
        };
      case "update":
        return {
          title: languageCode === 'bn' ? "হোস্টেলের নাম আপডেট নিশ্চিত করুন" : "Confirm Hostel Name Update",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে হোস্টেলের নাম আপডেট করতে চান?" : "Are you sure you want to update this hostel name?"
        };
      case "delete":
        return {
          title: languageCode === 'bn' ? "হোস্টেলের নাম মুছে ফেলা নিশ্চিত করুন" : "Confirm Hostel Name Deletion",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে এই হোস্টেলের নামটি মুছে ফেলতে চান?" : "Are you sure you want to delete this hostel name?"
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return languageCode === 'bn' ? 'প্রযোজ্য নয়' : 'N/A';
    return new Date(dateString).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-[#441a05]">
            {languageCode === 'bn' ? 'হোস্টেলের নাম লোড হচ্ছে...' : 'Loading hostel names...'}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">
            {languageCode === 'bn' ? 'হোস্টেলের নাম লোড করতে ত্রুটি' : 'Error Loading Hostel Names'}
          </h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel names'}</p>
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
              {languageCode === 'bn' ? 'হোস্টেলের নাম ব্যবস্থাপনা' : 'Hostel Names Management'}
            </h1>
            <p className="text-[#441a05]/70 mt-1">
              {languageCode === 'bn' ? 'হোস্টেলের নাম তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit and manage hostel names'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Hostel Name Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editHostelNameId ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-[#441a05]">
              {editHostelNameId 
                ? (languageCode === 'bn' ? "হোস্টেলের নাম সম্পাদনা করুন" : "Edit Hostel Name")
                : (languageCode === 'bn' ? "নতুন হোস্টেলের নাম যোগ করুন" : "Add New Hostel Name")
              }
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <input
                type="text"
                id="hostelName"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="w-full bg-[#441a05]/10 backdrop-blur-sm border border-[#441a05]/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-[#441a05]/60 focus:outline-none focus:border-pmColor focus:bg-[#441a05]/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "হোস্টেলের নাম" : "Hostel Name"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "হোস্টেলের নাম" : "Hostel Name"}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || isUpdating || (editHostelNameId ? !hasChangePermission : !hasAddPermission)}
              className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                (isCreating || isUpdating || (editHostelNameId ? !hasChangePermission : !hasAddPermission)) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>
                    {editHostelNameId 
                      ? (languageCode === 'bn' ? "আপডেট করা হচ্ছে..." : "Updating...")
                      : (languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating...")
                    }
                  </span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>
                    {editHostelNameId 
                      ? (languageCode === 'bn' ? "হোস্টেলের নাম আপডেট করুন" : "Update Hostel Name")
                      : (languageCode === 'bn' ? "হোস্টেলের নাম তৈরি করুন" : "Create Hostel Name")
                    }
                  </span>
                </>
              )}
            </button>
            
            {editHostelNameId && (
              <button
                type="button"
                onClick={() => {
                  setEditHostelNameId(null);
                  setHostelName("");
                }}
                className="bg-red-500 hover:bg-red-600 text-[#441a05]px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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

      {/* Hostel Names Table */}
      <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-[#441a05]/20">
          <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'হোস্টেলের নামের তালিকা' : 'Hostel Names List'} ({formatNumber(hostelNames.length)})</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          {hostelNames.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[#441a05]/40 text-6xl mb-4">🏨</div>
              <h3 className="text-lg font-medium text-[#441a05]mb-2">
                {languageCode === 'bn' ? 'কোনো হোস্টেলের নাম পাওয়া যায়নি' : 'No hostel names found'}
              </h3>
              <p className="text-[#441a05]/70">
                {languageCode === 'bn' ? 'শুরু করতে আপনার প্রথম হোস্টেলের নাম তৈরি করুন।' : 'Create your first hostel name to get started.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-[#441a05]/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'হোস্টেলের নাম' : 'Hostel Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#441a05]/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#441a05]/10">
                {hostelNames?.map((hostelNameObj, index) => (
                  <tr
                    key={hostelNameObj.id}
                    className="hover:bg-[#441a05]/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]font-medium">#{formatNumber(hostelNameObj.id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center border border-pmColor/30">
                            <span className="text-pmColor font-medium text-sm">
                              {hostelNameObj.name?.charAt(0)?.toUpperCase() || 'H'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-[#441a05]font-medium">{hostelNameObj.name}</div>
                          <div className="text-[#441a05]/60 text-sm">
                            {hostelNameObj.name?.length > 30 ? 
                              `${hostelNameObj.name.substring(0, 30)}...` : 
                              hostelNameObj.name
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {formatDate(hostelNameObj.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]/70 text-sm">
                        {formatDate(hostelNameObj.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(hostelNameObj)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'হোস্টেলের নাম সম্পাদনা করুন' : 'Edit hostel name'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(hostelNameObj.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'হোস্টেলের নাম মুছুন' : 'Delete hostel name'}
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
                  ? (languageCode === 'bn' ? "হোস্টেলের নাম মুছে ফেলা হচ্ছে..." : "Deleting hostel name...")
                  : `${languageCode === 'bn' ? 'হোস্টেলের নাম মুছে ফেলতে ত্রুটি:' : 'Error deleting hostel name:'} ${deleteError?.status || "unknown"}`
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {hostelNames.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-pmColor/20 rounded-xl flex items-center justify-center border border-pmColor/30">
                <span className="text-pmColor text-xl">🏨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#441a05]/70">
                  {languageCode === 'bn' ? 'মোট হোস্টেলের নাম' : 'Total Hostel Names'}
                </p>
                <p className="text-2xl font-semibold text-[#441a05]">{formatNumber(hostelNames.length)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <span className="text-green-400 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#441a05]/70">
                  {languageCode === 'bn' ? 'সাম্প্রতিক যোগ করা' : 'Recently Added'}
                </p>
                <p className="text-2xl font-semibold text-[#441a05]">
                  {formatNumber(hostelNames.filter(hostelNameObj => {
                    const createdDate = new Date(hostelNameObj.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                <span className="text-orange-400 text-xl">🔧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#441a05]/70">
                  {languageCode === 'bn' ? 'সাম্প্রতিক আপডেট' : 'Recently Updated'}
                </p>
                <p className="text-2xl font-semibold text-[#441a05]">
                  {formatNumber(hostelNames.filter(hostelNameObj => {
                    const updatedDate = new Date(hostelNameObj.updated_at);
                    const createdDate = new Date(hostelNameObj.created_at);
                    return updatedDate > createdDate;
                  }).length)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default HostelNames;