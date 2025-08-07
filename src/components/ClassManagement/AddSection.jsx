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
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook

const AddSection = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  const [sectionName, setSectionName] = useState('');
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditEditSectionName] = useState('');
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
    setModalData({ name: sectionName.trim(), is_active: true });
    setIsModalOpen(true);
  };

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
      } else if (modalAction === 'toggle') {
        if (!hasChangePermission) {
          toast.error('সেকশনের স্থিতি পরিবর্তন করার অনুমতি নেই।');
          return;
        }
        await updateSection(modalData).unwrap();
        toast.success(`সেকশন ${modalData.name} এখন ${modalData.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`সেকশন ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
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
      is_active: sectionByIdData?.is_active || true,
    });
    setIsModalOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = (section) => {
    if (!hasChangePermission) {
      toast.error('সেকশনের স্থিতি পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    setModalAction('toggle');
    setModalData({
      id: section.id,
      name: section.name,
      is_active: !section.is_active,
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
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:checked + span {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
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
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05]tracking-tight">নতুন সেকশন যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <input
                type="text"
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05]placeholder-[#441a05]pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="সেকশনের নাম"
                disabled={isCreating}
                aria-describedby={createError ? 'section-error' : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="নতুন সেকশন তৈরি করুন"
                className={`relative inline-flex items-center hover:text-[#441a05]px-8 py-3 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-300 animate-scaleIn ${
                  isCreating ? 'cursor-not-allowed' : 'hover:text-[#441a05]hover:shadow-md'
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
              <h3 className="text-2xl font-bold text-[#441a05]tracking-tight">সেকশন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editSectionName"
                value={editSectionName}
                onChange={(e) => setEditSectionName(e.target.value)}
                className="w-full bg-transparent text-[#441a05]placeholder-[#441a05]pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="সেকশনের নাম সম্পাদনা করুন (যেমন, সেকশন এ)"
                disabled={isUpdating}
                aria-label="সেকশনের নাম সম্পাদনা"
                aria-describedby="edit-section-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="সেকশন আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-300 animate-scaleIn ${
                  isUpdating ? 'cursor-not-allowed' : 'hover:text-[#441a05]hover:shadow-md'
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
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05]hover:text-[#441a05]transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Sections Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05]p-4 border-b border-[#441a05]/20">সেকশনের তালিকা</h3>
          {isSectionLoading ? (
            <p className="p-4 text-[#441a05]/70">সেকশন লোড হচ্ছে...</p>
          ) : sectionDataError ? (
            <p className="p-4 text-red-400">
              সেকশন লোড করতে ত্রুটি: {sectionDataError.status || 'অজানা'} - {JSON.stringify(sectionDataError.data || {})}
            </p>
          ) : sectionData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো সেকশন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#441a05]/20">
                <thead className="bg-[#441a05]/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">সেকশনের নাম</th>
                    {hasChangePermission && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">সক্রিয়</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">তৈরির সময়</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">আপডেটের সময়</th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ক্রিয়াকলাপ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#441a05]/20">
                  {sectionData?.map((section, index) => (
                    <tr
                      key={section.id}
                      className="bg-[#441a05]/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 [#441a05]space-nowrap text-sm font-medium text-[#441a05]">{section.name}</td>
                      {hasChangePermission && (
                        <td className="px-6 py-4 [#441a05]space-nowrap text-[#441a05]">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={section.is_active}
                              onChange={() => handleToggleActive(section)}
                              className="hidden"
                            />
                            <span
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                                section.is_active
                                  ? 'bg-pmColor border-pmColor'
                                  : 'bg-[#441a05]/10 border-[#9d9087] hover:border-[#441a05]'
                              }`}
                            >
                              {section.is_active && (
                                <svg
                                  className="w-4 h-4 text-[#441a05]animate-scaleIn"
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
                      )}
                      <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]/70">
                        {new Date(section.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 [#441a05]space-nowrap text-sm text-[#441a05]/70">
                        {new Date(section.updated_at).toLocaleString('bn-BD')}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 [#441a05]space-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(section)}
                              title="সেকশন সম্পাদনা করুন"
                              className="text-[#441a05]hover:text-blue-500 mr-4 transition-colors duration-300"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(section.id)}
                              title="সেকশন মুছুন"
                              className="text-[#441a05]hover:text-red-500 transition-colors duration-300"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-[#441a05]backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05]mb-4">
                {modalAction === 'create' && 'নতুন সেকশন নিশ্চিত করুন'}
                {modalAction === 'update' && 'সেকশন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'সেকশন মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'সেকশনের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05]mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন সেকশন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে সেকশন আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই সেকশনটি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে সেকশনটি ${modalData?.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05]rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-pmColor text-[#441a05]rounded-lg hover:text-[#441a05]transition-colors duration-300 btn-glow"
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