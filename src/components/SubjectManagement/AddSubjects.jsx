import React, { useEffect, useState } from 'react';
; // Assuming this path
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useCreateSubjectMutation,
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useDeleteSubjectMutation,
  useUpdateSubjectMutation,
  usePatchSubjectMutation, } from '../../redux/features/api/class-subjects/subjectsApi';

const AddSubjects = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [subjectName, setSubjectName] = useState('');
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks for Subjects
  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    error: subjectDataError,
  } = useGetSubjectsQuery();
  const [createSubject, { isLoading: isCreating, error: createError }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [patchSubject, { isLoading: isPatching }] = usePatchSubjectMutation(); // Not used in this example, but included for completeness
  const [deleteSubject] = useDeleteSubjectMutation();
  const { data: subjectByIdData } = useGetSubjectByIdQuery(editSubjectId, { skip: !editSubjectId });

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks (adjust codenames as per your backend's actual permissions for subjects)
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_classsubject') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_classsubject') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_classsubject') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_classsubject') || false;

  // Effect to populate edit fields when subjectByIdData is fetched
  useEffect(() => {
    if (subjectByIdData && editSubjectId) {
      setEditSubjectName(subjectByIdData.class_subject || '');
    }
  }, [subjectByIdData, editSubjectId]);

  // Handle form submission for creating a new subject
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('বিষয় যোগ করার অনুমতি নেই।');
      return;
    }
    if (!subjectName.trim()) {
      toast.error('অনুগ্রহ করে একটি বিষয়ের নাম লিখুন');
      return;
    }
    setModalAction('create');
    setModalData({ class_subject: subjectName.trim() }); // Sending as class_subject
    setIsModalOpen(true);
  };

  // Handle update subject
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('বিষয় আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editSubjectName.trim()) {
      toast.error('অনুগ্রহ করে একটি বিষয়ের নাম লিখুন');
      return;
    }
    setModalAction('update');
    setModalData({
      id: editSubjectId,
      class_subject: editSubjectName.trim(), // Sending as class_subject
    });
    setIsModalOpen(true);
  };

  // Handle delete subject
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('বিষয় মুছে ফেলার অনুমতি নেই।');
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
          toast.error('বিষয় তৈরি করার অনুমতি নেই।');
          return;
        }
        await createSubject(modalData).unwrap();
        toast.success('বিষয় সফলভাবে তৈরি করা হয়েছে!');
        setSubjectName('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error('বিষয় আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateSubject(modalData).unwrap();
        toast.success('বিষয় সফলভাবে আপডেট করা হয়েছে!');
        setEditSubjectId(null);
        setEditSubjectName('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error('বিষয় মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteSubject(modalData.id).unwrap();
        toast.success('বিষয় সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, err);
      toast.error(`বিষয় ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle edit button click
  const handleEditClick = (subject) => {
    if (!hasChangePermission) {
      toast.error('বিষয় সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditSubjectId(subject.id);
    setEditSubjectName(subject.class_subject); // Populating with class_subject
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
        {/* Form to Add Subject */}
        {hasAddPermission && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">নতুন বিষয় যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <input
                type="text"
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="বিষয়ের নাম"
                disabled={isCreating}
                aria-describedby={createError ? 'subject-error' : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="নতুন বিষয় তৈরি করুন"
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
                    <span>বিষয় তৈরি করুন</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="subject-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {createError.status || 'অজানা'} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Subject Form */}
        {hasChangePermission && editSubjectId && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">বিষয় সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editSubjectName"
                value={editSubjectName}
                onChange={(e) => setEditSubjectName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="বিষয়ের নাম সম্পাদনা করুন"
                disabled={isUpdating}
                aria-label="বিষয়ের নাম সম্পাদনা"
                aria-describedby="edit-subject-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="বিষয় আপডেট করুন"
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
                  <span>বিষয় আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditSubjectId(null);
                  setEditSubjectName('');
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-[#441a05] transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[60vh] overflow-y-auto flex flex-col border border-[#441a05]/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-[#441a05]/20 pb-2 mb-4">বিষয়ের তালিকা</h3>
          {isSubjectLoading ? (
            <p className="p-4 text-[#441a05]/70">বিষয় লোড হচ্ছে...</p>
          ) : subjectDataError ? (
            <p className="p-4 text-red-400">
              বিষয় লোড করতে ত্রুটি: {subjectDataError.status || 'অজানা'} - {JSON.stringify(subjectDataError.data || {})}
            </p>
          ) : subjectData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 italic">এখনও কোনো বিষয় যোগ করা হয়নি।</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {subjectData?.map((subject, index) => (
                <div
                  key={subject.id}
                  className="p-3 border border-[#441a05]/30 rounded-lg flex items-center justify-between animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[#441a05] font-medium">{subject.class_subject}</span> {/* Displaying class_subject */}
                  {(hasChangePermission || hasDeletePermission) && (
                    <div className="flex items-center space-x-4">
                      {hasChangePermission && (
                        <button
                          onClick={() => handleEditClick(subject)}
                          title="বিষয় সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      )}
                      {hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(subject.id)}
                          title="বিষয় মুছুন"
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
                {modalAction === 'create' && 'নতুন বিষয় নিশ্চিত করুন'}
                {modalAction === 'update' && 'বিষয় আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'বিষয় মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন বিষয় তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে বিষয় আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই বিষয় মুছতে চান?'}
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

export default AddSubjects;
