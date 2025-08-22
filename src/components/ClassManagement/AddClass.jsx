import React, { useState } from 'react';
import {
  useCreateStudentClassApIMutation,
  useGetStudentClassApIQuery,
  useGetStudentClassApIByIdQuery,
  useDeleteStudentClassApIMutation,
  useUpdateStudentClassApIMutation,
} from '../../redux/features/api/student/studentClassApi';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

const AddClass = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [className, setClassName] = useState('');
  const [editClassId, setEditClassId] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const {
    data: classData,
    isLoading: isClassLoading,
    error: classDataError,
  } = useGetStudentClassApIQuery();
  const [createClass, { isLoading: isCreating, error: createError }] = useCreateStudentClassApIMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateStudentClassApIMutation();
  const [deleteClass] = useDeleteStudentClassApIMutation();
  const { data: classByIdData } = useGetStudentClassApIByIdQuery(editClassId, { skip: !editClassId });

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_studentclass') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_studentclass') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_studentclass') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_studentclass') || false;

  // Handle form submission for creating a new class
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('ক্লাস যোগ করার অনুমতি নেই।');
      return;
    }
    if (!className.trim()) {
      toast.error('অনুগ্রহ করে একটি ক্লাসের নাম লিখুন');
      return;
    }
    setModalAction('create');
    setModalData({ student_class: className.trim() });
    setIsModalOpen(true);
  };

  // Handle update class
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('ক্লাস আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editClassName.trim()) {
      toast.error('অনুগ্রহ করে একটি ক্লাসের নাম লিখুন');
      return;
    }
    setModalAction('update');
    setModalData({
      id: editClassId,
      student_class: editClassName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle delete class
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('ক্লাস মুছে ফেলার অনুমতি নেই।');
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
          toast.error('ক্লাস তৈরি করার অনুমতি নেই।');
          return;
        }
        await createClass(modalData).unwrap();
        toast.success('ক্লাস সফলভাবে তৈরি করা হয়েছে!');
        setClassName('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error('ক্লাস আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateClass(modalData).unwrap();
        toast.success('ক্লাস সফলভাবে আপডেট করা হয়েছে!');
        setEditClassId(null);
        setEditClassName('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error('ক্লাস মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteClass(modalData.id).unwrap();
        toast.success('ক্লাস সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, err);
      toast.error(`ক্লাস ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle edit button click
  const handleEditClick = (classItem) => {
    if (!hasChangePermission) {
      toast.error('ক্লাস সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditClassId(classItem.id);
    setEditClassName(classItem.student_class);
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
        {/* Form to Add Class */}
        {hasAddPermission && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">নতুন ক্লাস যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <input
                type="text"
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="ক্লাসের নাম"
                disabled={isCreating}
                aria-describedby={createError ? 'class-error' : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="নতুন ক্লাস তৈরি করুন"
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
                    <span>ক্লাস তৈরি করুন</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="class-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {createError.status || 'অজানা'} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Class Form */}
        {hasChangePermission && editClassId && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ক্লাস সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editClassName"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="ক্লাসের নাম সম্পাদনা করুন (যেমন, ক্লাস ১)"
                disabled={isUpdating}
                aria-label="ক্লাসের নাম সম্পাদনা"
                aria-describedby="edit-class-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="ক্লাস আপডেট করুন"
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
                  <span>ক্লাস আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditClassId(null);
                  setEditClassName('');
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-[#441a05] transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Classes Grid */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[60vh] overflow-y-auto flex flex-col border border-[#441a05]/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-[#441a05]/20 pb-2 mb-4">ক্লাসের তালিকা</h3>
          {isClassLoading ? (
            <p className="p-4 text-[#441a05]/70">ক্লাস লোড হচ্ছে...</p>
          ) : classDataError ? (
            <p className="p-4 text-red-400">
              ক্লাস লোড করতে ত্রুটি: {classDataError.status || 'অজানা'} - {JSON.stringify(classDataError.data || {})}
            </p>
          ) : classData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 italic">এখনও কোনো ক্লাস যোগ করা হয়নি।</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {classData?.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="p-3 border border-[#441a05]/30 rounded-lg flex items-center justify-between animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[#441a05] font-medium">{classItem.student_class}</span>
                  {(hasChangePermission || hasDeletePermission) && (
                    <div className="flex items-center space-x-4">
                      {hasChangePermission && (
                        <button
                          onClick={() => handleEditClick(classItem)}
                          title="ক্লাস সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(classItem.id)}
                          title="ক্লাস মুছুন"
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
                {modalAction === 'create' && 'নতুন ক্লাস নিশ্চিত করুন'}
                {modalAction === 'update' && 'ক্লাস আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'ক্লাস মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন ক্লাস তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে ক্লাস আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই ক্লাসটি মুছে ফেলতে চান?'}
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

export default AddClass;