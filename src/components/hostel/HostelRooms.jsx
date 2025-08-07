import React, { useState } from 'react';
import { useGetHostelNamesQuery } from '../../redux/features/api/hostel/hostelNames';
import {
  useGetHostelRoomsQuery,
  useCreateHostelRoomMutation,
  useDeleteHostelRoomMutation,
  useUpdateHostelRoomMutation
} from '../../redux/features/api/hostel/hostelRoomsApi';
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";
import Select from 'react-select';
import selectStyles from '../../utilitis/selectStyles';

const HostelRooms = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [hostelNameId, setHostelNameId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [editRoomId, setEditRoomId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_hostelroom') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_hostelroom') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_hostelroom') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_hostelroom') || false;

  // API hooks
  const { data: hostelNames = [] } = useGetHostelNamesQuery();
  const { data: rooms = [], isLoading, isError, error } = useGetHostelRoomsQuery();
  const [createRoom, { isLoading: isCreating, error: createError }] = useCreateHostelRoomMutation();
  const [updateRoom, { isLoading: isUpdating, error: updateError }] = useUpdateHostelRoomMutation();
  const [deleteRoom, { isLoading: isDeleting, error: deleteError }] = useDeleteHostelRoomMutation();

  // Convert number to Bangla if needed
  const formatNumber = (num) => {
    if (languageCode === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().split('').map(digit => bnDigits[parseInt(digit)] || digit).join('');
    }
    return num;
  };

  // React Select options for hostels
  const hostelOptions = hostelNames.map(hostel => ({
    value: hostel.id,
    label: hostel.name
  }));


  // Handle form submission for adding or updating room
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editRoomId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    if (!hostelNameId || !roomName.trim() || !seatNo.trim()) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    if (rooms?.some((room) => room.room_name.toLowerCase() === roomName.toLowerCase() && room.id !== editRoomId)) {
      toast.error(languageCode === 'bn' ? "এই রুমের নাম ইতিমধ্যে বিদ্যমান!" : "This room name already exists!");
      return;
    }

    setModalAction(editRoomId ? "update" : "create");
    setModalData({
      id: editRoomId,
      hostel_name_id: parseInt(hostelNameId),
      room_name: roomName.trim(),
      seat_no: seatNo.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (room) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditRoomId(room.id);
    setHostelNameId(room.hostel_name_id?.toString() || '');
    setRoomName(room.room_name || '');
    setSeatNo(room.seat_no || '');
  };

  // Handle delete room
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
        await createRoom(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "রুম সফলভাবে তৈরি করা হয়েছে!" : "Room created successfully!");
        setHostelNameId("");
        setRoomName("");
        setSeatNo("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.'); 
          return; 
        }
        await updateRoom(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "রুম সফলভাবে আপডেট করা হয়েছে!" : "Room updated successfully!");
        setEditRoomId(null);
        setHostelNameId("");
        setRoomName("");
        setSeatNo("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { 
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.'); 
          return; 
        }
        await deleteRoom(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? "রুম সফলভাবে মুছে ফেলা হয়েছে!" : "Room deleted successfully!");
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'রুম' : 'Room'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
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
          title: languageCode === 'bn' ? "নতুন রুম নিশ্চিত করুন" : "Confirm New Room",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন রুম তৈরি করতে চান?" : "Are you sure you want to create a new room?"
        };
      case "update":
        return {
          title: languageCode === 'bn' ? "রুম আপডেট নিশ্চিত করুন" : "Confirm Room Update",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে রুম আপডেট করতে চান?" : "Are you sure you want to update this room?"
        };
      case "delete":
        return {
          title: languageCode === 'bn' ? "রুম মুছে ফেলা নিশ্চিত করুন" : "Confirm Room Deletion",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে এই রুমটি মুছে ফেলতে চান?" : "Are you sure you want to delete this room?"
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
          <div className="text-white">
            {languageCode === 'bn' ? 'রুম লোড হচ্ছে...' : 'Loading rooms...'}
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
            {languageCode === 'bn' ? 'রুম লোড করতে ত্রুটি' : 'Error Loading Rooms'}
          </h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel rooms'}</p>
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
              {languageCode === 'bn' ? 'হোস্টেল রুম ব্যবস্থাপনা' : 'Hostel Rooms Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'হোস্টেল রুম তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Manage hostel room inventory with seat assignments'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Room Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editRoomId ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editRoomId 
                ? (languageCode === 'bn' ? "রুম সম্পাদনা করুন" : "Edit Room")
                : (languageCode === 'bn' ? "নতুন রুম যোগ করুন" : "Add New Room")
              }
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Hostel Selection with React Select */}
            <div className="relative">
              {/* <label className="block text-sm font-medium text-white/80 mb-2">
                {languageCode === 'bn' ? "হোস্টেলের নাম *" : "Hostel Name *"}
              </label> */}
              <Select
                options={hostelOptions}
                value={hostelOptions.find(option => option.value.toString() === hostelNameId)}
                onChange={(selectedOption) => setHostelNameId(selectedOption ? selectedOption.value.toString() : "")}
                styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                placeholder={languageCode === 'bn' ? "হোস্টেল নির্বাচন করুন" : "Select Hostel"}
                isDisabled={isCreating || isUpdating}
                isClearable
              />
            </div>
            
            <div className="relative">
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "রুমের নাম" : "Room Name"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "রুমের নাম" : "Room Name"}
              />
            </div>
            
            <div className="relative">
              <input
                type="text"
                id="seatNo"
                value={seatNo}
                onChange={(e) => setSeatNo(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-[#441a05]placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "সিট নম্বর" : "Seat Number"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "সিট নম্বর" : "Seat Number"}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || isUpdating || (editRoomId ? !hasChangePermission : !hasAddPermission)}
              className={`bg-pmColor hover:bg-pmColor/80 text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                (isCreating || isUpdating || (editRoomId ? !hasChangePermission : !hasAddPermission)) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>
                    {editRoomId 
                      ? (languageCode === 'bn' ? "আপডেট করা হচ্ছে..." : "Updating...")
                      : (languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating...")
                    }
                  </span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>
                    {editRoomId 
                      ? (languageCode === 'bn' ? "রুম আপডেট করুন" : "Update Room")
                      : (languageCode === 'bn' ? "রুম তৈরি করুন" : "Create Room")
                    }
                  </span>
                </>
              )}
            </button>
            
            {editRoomId && (
              <button
                type="button"
                onClick={() => {
                  setEditRoomId(null);
                  setHostelNameId("");
                  setRoomName("");
                  setSeatNo("");
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

      {/* Rooms Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-xl font-semibold text-[#441a05]flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'রুমের তালিকা' : 'Rooms List'} ({formatNumber(rooms.length)})</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          {rooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-white/40 text-6xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-[#441a05]mb-2">
                {languageCode === 'bn' ? 'কোনো রুম পাওয়া যায়নি' : 'No rooms found'}
              </h3>
              <p className="text-white/70">
                {languageCode === 'bn' ? 'শুরু করতে আপনার প্রথম হোস্টেল রুম তৈরি করুন।' : 'Create your first hostel room to get started.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'হোস্টেলের নাম' : 'Hostel Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'রুমের নাম' : 'Room Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'সিট নম্বর' : 'Seat Number'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rooms?.map((room, index) => (
                  <tr
                    key={room.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-[#441a05]font-medium">#{formatNumber(room.id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center border border-pmColor/30">
                            <span className="text-pmColor font-medium text-sm">
                              {(() => {
                                const hostel = hostelNames.find(h => h.id === room.hostel_name_id);
                                return hostel?.name?.charAt(0)?.toUpperCase() || 'H';
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-[#441a05]font-medium">
                            {(() => {
                              const hostel = hostelNames.find(h => h.id === room.hostel_name_id);
                              return hostel?.name || (languageCode === 'bn' ? 'অজানা হোস্টেল' : 'Unknown Hostel');
                            })()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <span className="text-blue-400 font-medium text-xs">
                              {room.room_name?.charAt(0)?.toUpperCase() || 'R'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-[#441a05]font-medium">{room.room_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        {room.seat_no}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {formatDate(room.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(room)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-[#441a05]text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'রুম সম্পাদনা করুন' : 'Edit room'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-[#441a05]text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'রুম মুছুন' : 'Delete room'}
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
                  ? (languageCode === 'bn' ? "রুম মুছে ফেলা হচ্ছে..." : "Deleting room...")
                  : `${languageCode === 'bn' ? 'রুম মুছে ফেলতে ত্রুটি:' : 'Error deleting room:'} ${deleteError?.status || "unknown"}`
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {rooms.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <span className="text-blue-400 text-xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'মোট রুম' : 'Total Rooms'}
                </p>
                <p className="text-2xl font-semibold text-white">{formatNumber(rooms.length)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-pmColor/20 rounded-xl flex items-center justify-center border border-pmColor/30">
                <span className="text-pmColor text-xl">🏨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'অনন্য হোস্টেল' : 'Unique Hostels'}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {formatNumber(new Set(rooms.map(room => room.hostel_name_id).filter(Boolean)).size)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <span className="text-green-400 text-xl">💺</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'মোট সিট' : 'Total Seats'}
                </p>
                <p className="text-2xl font-semibold text-white">{formatNumber(rooms.length)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                <span className="text-orange-400 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'সাম্প্রতিক যোগ করা' : 'Recently Added'}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {formatNumber(rooms.filter(room => {
                    const createdDate = new Date(room.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
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

export default HostelRooms;