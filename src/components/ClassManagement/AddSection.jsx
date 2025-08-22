import React, { useState } from 'react';
import {
  useCreateStudentSectionApiMutation,
  useGetStudentSectionApiQuery,
  useGetStudentSectionApiByIdQuery,
  useDeleteStudentSectionApiMutation,
  useUpdateStudentSectionApiMutation,
} from '../../redux/features/api/student/studentSectionApi';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

const AddSection = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [sectionName, setSectionName] = useState('');
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const {
    data: sectionData,
    isLoading: isSectionLoading,
    error: sectionDataError,
  } = useGetStudentSectionApiQuery();
  const [createSection, { isLoading: isCreating, error: createError }] = useCreateStudentSectionApiMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateStudentSectionApiMutation();
  const [deleteSection] = useDeleteStudentSectionApiMutation();
  const { data: sectionByIdData } = useGetStudentSectionApiByIdQuery(editSectionId, { skip: !editSectionId });

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_studentsection') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_studentsection') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_studentsection') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_studentsection') || false;

  // Handle form submission for creating a new section
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('সেকশন যোগ করার অনুমতি নেই।');
      return;
    }
    if (!sectionName.trim()) {
      toast.error('অনুগ্রহ করে একটি সেকশনের নাম লিখুন');
      return;
    }
    setModalAction('create');
    setModalData({ name: sectionName.trim() });
    setIsModalOpen(true);
  };

  // Handle update section
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('সেকশন আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editSectionName.trim()) {
      toast.error('অনুগ্রহ করে একটি সেকশনের নাম লিখুন');
      return;
    }
    setModalAction('update');
    setModalData({
      id: editSectionId,
      name: editSectionName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle delete section
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('সেকশন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for create, update, delete
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) {
          toast.error('সেকশন তৈরি করার অনুমতি নেই।');
          return;
        }
        await createSection(modalData).unwrap();
        toast.success('সেকশন সফলভাবে তৈরি করা হয়েছে!');
        setSectionName('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error('সেকশন আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateSection(modalData).unwrap();
        toast.success('সেকশন সফলভাবে আপডেট করা হয়েছে!');
        setEditSectionId(null);
        setEditSectionName('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error('সেকশন মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteSection(modalData.id).unwrap();
        toast.success('সেকশন সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, err);
      toast.error(`সেকশন ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle edit button click
  const handleEditClick = (section) => {
    if (!hasChangePermission) {
      toast.error('সেকশন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditSectionId(section.id);
    setEditSectionName(section.name);
  };

  if (permissionsLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8 w-full relative">
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <div className="">
        {/* Form to Add Section */}
        {hasAddPermission && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">নতুন সেকশন যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <input
                type="text"
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="সেকশনের নাম"
                disabled={isCreating}
                aria-describedby={createError ? 'section-error' : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="নতুন সেকশন তৈরি করুন"
                className={`relative inline-flex items-center hover:text-[#441a05] px-8 py-3 rounded-lg font-medium bg-pmColor text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating ? 'cursor-not-allowed' : 'hover:text-[#441a05] hover:shadow-md'
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>তৈরি করা হচ্ছে...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IoAdd className="w-5 h-5" />
                    <span>সেকশন তৈরি করুন</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="section-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {createError.status || 'অজানা'} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Section Form */}
        {hasChangePermission && editSectionId && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">সেকশন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editSectionName"
                value={editSectionName}
                onChange={(e) => setEditSectionName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="সেকশনের নাম সম্পাদনা করুন (যেমন, সেকশন এ)"
                disabled={isUpdating}
                aria-label="সেকশনের নাম সম্পাদনা"
                aria-describedby="edit-section-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="সেকশন আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-pmColor text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating ? 'cursor-not-allowed' : 'hover:text-[#441a05] hover:shadow-md'
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট করা হচ্ছে...</span>
                  </span>
                ) : (
                  <span>সেকশন আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditSectionId(null);
                  setEditSectionName('');
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-[#441a05] transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Sections Grid */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[60vh] overflow-y-auto flex flex-col border border-[#441a05]/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-[#441a05]/20 pb-2 mb-4">সেকশনের তালিকা</h3>
          {isSectionLoading ? (
            <p className="p-4 text-[#441a05]/70">সেকশন লোড হচ্ছে...</p>
          ) : sectionDataError ? (
            <p className="p-4 text-red-400">
              সেকশন লোড করতে ত্রুটি: {sectionDataError.status || 'অজানা'} - {JSON.stringify(sectionDataError.data || {})}
            </p>
          ) : sectionData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 italic">এখনও কোনো সেকশন যোগ করা হয়নি।</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {sectionData?.map((section, index) => (
                <div
                  key={section.id}
                  className="p-3 border border-[#441a05]/30 rounded-lg flex items-center justify-between animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[#441a05] font-medium">{section.name}</span>
                  {(hasChangePermission || hasDeletePermission) && (
                    <div className="flex items-center space-x-4">
                      {hasChangePermission && (
                        <button
                          onClick={() => handleEditClick(section)}
                          title="সেকশন সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(section.id)}
                          title="সেকশন মুছুন"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-[#441a05] backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন সেকশন নিশ্চিত করুন'}
                {modalAction === 'update' && 'সেকশন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'সেকশন মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন সেকশন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে সেকশন আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই সেকশনটি মুছে ফেলতে চান?'}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-pmColor text-[#441a05] rounded-lg hover:text-[#441a05] transition-colors duration-300 btn-glow"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSection;