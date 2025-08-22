import React, { useState, useEffect } from 'react';


import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import {   useGetClassGroupConfigsQuery,
  useGetClassGroupConfigByIdQuery,
  useCreateClassGroupConfigMutation,
  useUpdateClassGroupConfigMutation,
  usePatchClassGroupConfigMutation,
  useDeleteClassGroupConfigMutation, } from '../../redux/features/api/student/classGroupConfigsApi';
import { useGetStudentClassApIQuery } from '../../redux/features/api/student/studentClassApi';
import { useGetStudentGroupsQuery } from '../../redux/features/api/student/studentGroupApi';

const ClassGroupConfig = () => {
  const { user, group_id } = useSelector((state) => state.auth);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [editConfigId, setEditConfigId] = useState(null);
  const [editSelectedClassId, setEditSelectedClassId] = useState('');
  const [editSelectedGroupId, setEditSelectedGroupId] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks for ClassGroupConfig
  const {
    data: configData,
    isLoading: isConfigLoading,
    error: configDataError,
  } = useGetClassGroupConfigsQuery();
  const [createConfig, { isLoading: isCreating, error: createError }] = useCreateClassGroupConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateClassGroupConfigMutation();
  const [patchConfig, { isLoading: isPatching }] = usePatchClassGroupConfigMutation(); // Included but not explicitly used in action logic here
  const [deleteConfig] = useDeleteClassGroupConfigMutation();
  const { data: configByIdData } = useGetClassGroupConfigByIdQuery(editConfigId, { skip: !editConfigId });

  // API hooks for dropdown data
  const { data: classes, isLoading: areClassesLoading } = useGetStudentClassApIQuery();
  const { data: groups, isLoading: areGroupsLoading } = useGetStudentGroupsQuery();
console.log(classes)
  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks (adjust codenames as per your backend's actual permissions)
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_classgroupconfig') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_classgroupconfig') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_classgroupconfig') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_classgroupconfig') || false;

  // Effect to populate edit fields when configByIdData is fetched
  useEffect(() => {
    if (configByIdData && editConfigId) {
      setEditSelectedClassId(configByIdData.class_id || '');
      setEditSelectedGroupId(configByIdData.group_id || '');
    }
  }, [configByIdData, editConfigId]);

  // Handle form submission for creating a new config
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('ক্লাস গ্রুপ কনফিগারেশন যোগ করার অনুমতি নেই।');
      return;
    }
    if (!selectedClassId || !selectedGroupId) {
      toast.error('অনুগ্রহ করে একটি ক্লাস এবং একটি গ্রুপ নির্বাচন করুন।');
      return;
    }
    setModalAction('create');
    setModalData({ class_id: parseInt(selectedClassId), group_id: parseInt(selectedGroupId) });
    setIsModalOpen(true);
  };

  // Handle update config
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('ক্লাস গ্রুপ কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editSelectedClassId || !editSelectedGroupId) {
      toast.error('অনুগ্রহ করে একটি ক্লাস এবং একটি গ্রুপ নির্বাচন করুন।');
      return;
    }
    setModalAction('update');
    setModalData({
      id: editConfigId,
      class_id: parseInt(editSelectedClassId),
      group_id: parseInt(editSelectedGroupId),
    });
    setIsModalOpen(true);
  };

  // Handle delete config
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('ক্লাস গ্রুপ কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
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
          toast.error('ক্লাস গ্রুপ কনফিগারেশন তৈরি করার অনুমতি নেই।');
          return;
        }
        await createConfig(modalData).unwrap();
        toast.success('ক্লাস গ্রুপ কনফিগারেশন সফলভাবে তৈরি করা হয়েছে!');
        setSelectedClassId('');
        setSelectedGroupId('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error('ক্লাস গ্রুপ কনফিগারেশন আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateConfig(modalData).unwrap();
        toast.success('ক্লাস গ্রুপ কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
        setEditConfigId(null);
        setEditSelectedClassId('');
        setEditSelectedGroupId('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error('ক্লাস গ্রুপ কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteConfig(modalData.id).unwrap();
        toast.success('ক্লাস গ্রুপ কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, err);
      toast.error(`ক্লাস গ্রুপ কনফিগারেশন ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle edit button click
  const handleEditClick = (config) => {
    if (!hasChangePermission) {
      toast.error('ক্লাস গ্রুপ কনফিগারেশন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditConfigId(config.id);
    setEditSelectedClassId(config.class_id || '');
    setEditSelectedGroupId(config.group_id || '');
  };

  if (permissionsLoading || areClassesLoading || areGroupsLoading) {
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
        {/* Form to Add Class Group Configuration */}
        {hasAddPermission && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">নতুন ক্লাস গ্রুপ কনফিগারেশন যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <select
                id="selectedClassId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating || areClassesLoading}
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.student_class}
                  </option>
                ))}
              </select>
              <select
                id="selectedGroupId"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating || areGroupsLoading}
              >
                <option value="">গ্রুপ নির্বাচন করুন</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isCreating || !selectedClassId || !selectedGroupId}
                title="নতুন ক্লাস গ্রুপ কনফিগারেশন তৈরি করুন"
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
                    <span>কনফিগারেশন তৈরি করুন</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="config-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {createError.status || 'অজানা'} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Class Group Configuration Form */}
        {hasChangePermission && editConfigId && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ক্লাস গ্রুপ কনফিগারেশন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <select
                id="editSelectedClassId"
                value={editSelectedClassId}
                onChange={(e) => setEditSelectedClassId(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isUpdating || areClassesLoading}
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <select
                id="editSelectedGroupId"
                value={editSelectedGroupId}
                onChange={(e) => setEditSelectedGroupId(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isUpdating || areGroupsLoading}
              >
                <option value="">গ্রুপ নির্বাচন করুন</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isUpdating || !editSelectedClassId || !editSelectedGroupId}
                title="ক্লাস গ্রুপ কনফিগারেশন আপডেট করুন"
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
                  <span>কনফিগারেশন আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditConfigId(null);
                  setEditSelectedClassId('');
                  setEditSelectedGroupId('');
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-[#441a05] transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Class Group Configurations Grid */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[60vh] overflow-y-auto flex flex-col border border-[#441a05]/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-[#441a05]/20 pb-2 mb-4">ক্লাস গ্রুপ কনফিগারেশনের তালিকা</h3>
          {isConfigLoading ? (
            <p className="p-4 text-[#441a05]/70">কনফিগারেশন লোড হচ্ছে...</p>
          ) : configDataError ? (
            <p className="p-4 text-red-400">
              কনফিগারেশন লোড করতে ত্রুটি: {configDataError.status || 'অজানা'} - {JSON.stringify(configDataError.data || {})}
            </p>
          ) : configData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 italic">এখনও কোনো ক্লাস গ্রুপ কনফিগারেশন যোগ করা হয়নি।</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {configData?.map((config, index) => (
                <div
                  key={config.id}
                  className="p-3 border border-[#441a05]/30 rounded-lg flex items-center justify-between animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[#441a05] font-medium">
                    ক্লাস: {classes?.find(cls => cls.id === config.class_id)?.name || 'অজানা'} - গ্রুপ: {groups?.find(group => group.id === config.group_id)?.name || 'অজানা'}
                  </span>
                  {(hasChangePermission || hasDeletePermission) && (
                    <div className="flex items-center space-x-4">
                      {hasChangePermission && (
                        <button
                          onClick={() => handleEditClick(config)}
                          title="ক্লাস গ্রুপ কনফিগারেশন সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(config.id)}
                          title="ক্লাস গ্রুপ কনফিগারেশন মুছুন"
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
                {modalAction === 'create' && 'নতুন ক্লাস গ্রুপ কনফিগারেশন নিশ্চিত করুন'}
                {modalAction === 'update' && 'ক্লাস গ্রুপ কনফিগারেশন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'ক্লাস গ্রুপ কনফিগারেশন মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন ক্লাস গ্রুপ কনফিগারেশন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে ক্লাস গ্রুপ কনফিগারেশন আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই ক্লাস গ্রুপ কনফিগারেশনটি মুছে ফেলতে চান?'}
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

export default ClassGroupConfig;
