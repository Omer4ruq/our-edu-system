import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateExamApiMutation,
  useDeleteExamApiMutation,
  useGetExamApiQuery,
  useUpdateExamApiMutation,
} from "../../../redux/features/api/exam/examApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../../redux/features/api/permissionRole/groupsApi";

const AddExamType = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  
  // Form states
  const [examName, setExamName] = useState("");
  const [isTestExam, setIsTestExam] = useState(false);
  const [isPercentage, setIsPercentage] = useState(false);
  const [markValue, setMarkValue] = useState("");
  const [examConnect, setExamConnect] = useState("");
  
  // Edit states
  const [editExamId, setEditExamId] = useState(null);
  const [editExamName, setEditExamName] = useState("");
  const [editIsTestExam, setEditIsTestExam] = useState(false);
  const [editIsPercentage, setEditIsPercentage] = useState(false);
  const [editMarkValue, setEditMarkValue] = useState("");
  const [editExamConnect, setEditExamConnect] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const {
    data: examTypes,
    isLoading: isExamLoading,
    error: examError,
  } = useGetExamApiQuery();
  const [createExam, { isLoading: isCreating, error: createError }] = useCreateExamApiMutation();
  const [updateExam, { isLoading: isUpdating, error: updateError }] = useUpdateExamApiMutation();
  const [deleteExam, { isLoading: isDeleting, error: deleteError }] = useDeleteExamApiMutation();
  
  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });
  
  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_examname') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_examname') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_examname') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_examname') || false;

  // Handle form submission for adding new exam type
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('পরীক্ষার ধরন যোগ করার অনুমতি নেই।');
      return;
    }
    if (!examName.trim()) {
      toast.error("অনুগ্রহ করে একটি পরীক্ষার ধরনের নাম লিখুন");
      return;
    }
    if (!markValue || isNaN(markValue) || parseFloat(markValue) <= 0) {
      toast.error("অনুগ্রহ করে একটি বৈধ নম্বর মান দিন");
      return;
    }
    
    // Check for duplicate exam name
    if (examTypes?.some((et) => et.exam_name?.toLowerCase() === examName.toLowerCase())) {
      toast.error("এই পরীক্ষার ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction("create");
    setModalData({
      exam_name: examName.trim(),
      is_test_exam: isTestExam,
      is_percentage: isPercentage,
      mark_value: parseFloat(markValue),
      exam_connect: examConnect || null,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (exam) => {
    if (!hasChangePermission) {
      toast.error('পরীক্ষার ধরন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditExamId(exam.id);
    setEditExamName(exam.exam_name || "");
    setEditIsTestExam(exam.is_test_exam || false);
    setEditIsPercentage(exam.is_percentage || false);
    setEditMarkValue(exam.mark_value?.toString() || "");
    setEditExamConnect(exam.exam_connect?.toString() || "");
  };

  // Handle update exam type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('পরীক্ষার ধরন আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editExamName.trim()) {
      toast.error("অনুগ্রহ করে একটি পরীক্ষার ধরনের নাম লিখুন");
      return;
    }
    if (!editMarkValue || isNaN(editMarkValue) || parseFloat(editMarkValue) <= 0) {
      toast.error("অনুগ্রহ করে একটি বৈধ নম্বর মান দিন");
      return;
    }

    setModalAction("update");
    setModalData({
      id: editExamId,
      exam_name: editExamName.trim(),
      is_test_exam: editIsTestExam,
      is_percentage: editIsPercentage,
      mark_value: parseFloat(editMarkValue),
      exam_connect: editExamConnect || null,
    });
    setIsModalOpen(true);
  };

  // Handle delete exam type
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('পরীক্ষার ধরন মুছে ফেলার অনুমতি নেই।');
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
          toast.error('পরীক্ষার ধরন তৈরি করার অনুমতি নেই।');
          return;
        }
        await createExam(modalData).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে তৈরি করা হয়েছে!");
        setExamName("");
        setIsTestExam(false);
        setIsPercentage(false);
        setMarkValue("");
        setExamConnect("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) {
          toast.error('পরীক্ষার ধরন আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateExam(modalData).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditExamId(null);
        setEditExamName("");
        setEditIsTestExam(false);
        setEditIsPercentage(false);
        setEditMarkValue("");
        setEditExamConnect("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error('পরীক্ষার ধরন মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteExam(modalData.id).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"}:`, err);
      toast.error(`পরীক্ষার ধরন ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট করা" : "মুছে ফেলা"} ব্যর্থ: ${err.status || "অজানা ত্রুটি"} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Get exam name by ID for exam_connect
  const getExamNameById = (examId) => {
    const exam = examTypes?.find(exam => exam.id === examId);
    return exam ? exam.exam_name : 'N/A';
  };

  if (isExamLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-[#441a05]/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-pmColor" />
          <span className="text-lg font-medium text-[#441a05]">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
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
            animation: slideUp 0.3s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
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
            background: rgba(10, 10, 21, 0.44);
          }
        `}
      </style>

      <div className="">
        {/* Form to Add Exam Type */}
        {hasAddPermission && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">নতুন পরীক্ষার ধরন যোগ করুন</h3>
            </div>
            <form onSubmit={handleSubmitExam} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {/* Exam Name */}
              <input
                type="text"
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full p-3 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="পরীক্ষার নাম লিখুন (যেমন, মধ্যবর্তী)"
                disabled={isCreating}
              />

              {/* Is Test Exam */}
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestExam}
                    onChange={(e) => setIsTestExam(e.target.checked)}
                    disabled={isCreating}
                    className="hidden"
                  />
                  <span
                    className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                      isTestExam
                        ? "bg-pmColor border-pmColor"
                        : "bg-transparent border-[#9d9087] hover:border-[#441a05]"
                    }`}
                  >
                    {isTestExam && (
                      <svg
                        className="w-4 h-4 text-[#441a05]"
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
                <span className="text-[#441a05] font-medium">টেস্ট পরীক্ষা</span>
              </div>

              {/* Is Percentage */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-[#441a05]">নম্বর প্রকার</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPercentage(false)}
                    disabled={isCreating}
                    className={`flex-1 p-2 rounded-lg font-medium transition-all duration-300 ${
                      !isPercentage
                        ? 'bg-pmColor text-[#441a05] shadow-md'
                        : 'bg-transparent border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/10'
                    }`}
                  >
                    সংখ্যায় নম্বর
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPercentage(true)}
                    disabled={isCreating}
                    className={`flex-1 p-2 rounded-lg font-medium transition-all duration-300 ${
                      isPercentage
                        ? 'bg-pmColor text-[#441a05] shadow-md'
                        : 'bg-transparent border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/10'
                    }`}
                  >
                    শতাংশে নম্বর
                  </button>
                </div>
              </div>

              {/* Mark Value */}
              <input
                type="number"
                step="0.01"
                min="0"
                value={markValue}
                onChange={(e) => setMarkValue(e.target.value)}
                className="w-full p-3 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="নম্বর মান (যেমন, 100)"
                disabled={isCreating}
              />

              {/* Exam Connect */}
              <select
                value={examConnect}
                onChange={(e) => setExamConnect(e.target.value)}
                className="w-full p-3 bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating}
              >
                <option value="" className="bg-[#441a05] text-white">পরীক্ষা সংযোগ নির্বাচন করুন (ঐচ্ছিক)</option>
                {examTypes?.filter(exam => !exam.is_test_exam).map((exam) => (
                  <option key={exam.id} value={exam.id} className="bg-[#441a05] text-white">
                    {exam.exam_name}
                  </option>
                ))}
              </select>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCreating}
                title="নতুন পরীক্ষার ধরন তৈরি করুন"
                className={`relative inline-flex items-center hover:text-[#441a05] px-8 py-3 rounded-lg font-medium bg-pmColor text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating ? "cursor-not-allowed" : "hover:text-[#441a05] hover:shadow-md"
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
                    <span>পরীক্ষার ধরন তৈরি করুন</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="exam-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Exam Form */}
        {hasChangePermission && editExamId && (
          <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">পরীক্ষার ধরন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
              {/* Edit Exam Name */}
              <input
                type="text"
                value={editExamName}
                onChange={(e) => setEditExamName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="পরীক্ষার নাম সম্পাদনা করুন"
                disabled={isUpdating}
              />

              {/* Edit Is Test Exam */}
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsTestExam}
                    onChange={(e) => setEditIsTestExam(e.target.checked)}
                    disabled={isUpdating}
                    className="hidden"
                  />
                  <span
                    className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                      editIsTestExam
                        ? "bg-pmColor border-pmColor"
                        : "bg-transparent border-[#9d9087] hover:border-[#441a05]"
                    }`}
                  >
                    {editIsTestExam && (
                      <svg
                        className="w-4 h-4 text-[#441a05]"
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
                <span className="text-[#441a05] font-medium">টেস্ট পরীক্ষা</span>
              </div>

              {/* Edit Is Percentage */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-[#441a05]">নম্বর প্রকার</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPercentage(false)}
                    disabled={isUpdating}
                    className={`flex-1 p-2 rounded-lg font-medium transition-all duration-300 ${
                      !editIsPercentage
                        ? 'bg-pmColor text-[#441a05] shadow-md'
                        : 'bg-transparent border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/10'
                    }`}
                  >
                    সংখ্যায় নম্বর
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsPercentage(true)}
                    disabled={isUpdating}
                    className={`flex-1 p-2 rounded-lg font-medium transition-all duration-300 ${
                      editIsPercentage
                        ? 'bg-pmColor text-[#441a05] shadow-md'
                        : 'bg-transparent border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/10'
                    }`}
                  >
                    শতাংশে নম্বর
                  </button>
                </div>
              </div>

              {/* Edit Mark Value */}
              <input
                type="number"
                step="0.01"
                min="0"
                value={editMarkValue}
                onChange={(e) => setEditMarkValue(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="নম্বর মান"
                disabled={isUpdating}
              />

              {/* Edit Exam Connect */}
              <select
                value={editExamConnect}
                onChange={(e) => setEditExamConnect(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isUpdating}
              >
                <option value="" className="bg-[#441a05] text-white">পরীক্ষা সংযোগ নির্বাচন করুন (ঐচ্ছিক)</option>
                {examTypes?.filter(exam => exam.id !== editExamId && !exam.is_test_exam).map((exam) => (
                  <option key={exam.id} value={exam.id} className="bg-[#441a05] text-white">
                    {exam.exam_name}
                  </option>
                ))}
              </select>

              {/* Update and Cancel Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  title="পরীক্ষার ধরন আপডেট করুন"
                  className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-pmColor text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    isUpdating ? "cursor-not-allowed" : "hover:text-[#441a05] hover:shadow-md"
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center space-x-2">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>আপডেট করা হচ্ছে...</span>
                    </span>
                  ) : (
                    <span>আপডেট করুন</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditExamId(null);
                    setEditExamName("");
                    setEditIsTestExam(false);
                    setEditIsPercentage(false);
                    setEditMarkValue("");
                    setEditExamConnect("");
                  }}
                  title="সম্পাদনা বাতিল করুন"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-[#441a05] transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              </div>
            </form>
            {updateError && (
              <div
                id="edit-exam-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {updateError.status || "অজানা"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Exam Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-[#441a05]/20">পরীক্ষার ধরনের তালিকা</h3>
          {isExamLoading ? (
            <p className="p-4 text-[#441a05]/70">পরীক্ষার ধরন লোড হচ্ছে...</p>
          ) : examError ? (
            <p className="p-4 text-red-400">
              পরীক্ষার ধরন লোড করতে ত্রুটি: {examError.status || "অজানা"} -{" "}
              {JSON.stringify(examError.data || {})}
            </p>
          ) : examTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো পরীক্ষার ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#441a05]/20">
                <thead className="bg-[#441a05]/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পরীক্ষার নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পরীক্ষার ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শতাংশ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নম্বর মান
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সংযুক্ত পরীক্ষা
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th> */}
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#441a05]/20">
                  {examTypes?.map((exam, index) => (
                    <tr
                      key={exam.id}
                      className="bg-[#441a05]/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {exam.exam_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {exam.is_test_exam ? "টেস্ট পরীক্ষা" : "নিয়মিত পরীক্ষা"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {exam.is_percentage ? "হ্যাঁ" : "না"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {exam.mark_value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {exam.exam_connect ? getExamNameById(exam.exam_connect) : "N/A"}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {exam.created_at ? new Date(exam.created_at).toLocaleString("bn-BD") : "N/A"}
                      </td> */}
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(exam)}
                              title="পরীক্ষার ধরন সম্পাদনা করুন"
                              className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(exam.id)}
                              title="পরীক্ষার ধরন মুছুন"
                              className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
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
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "পরীক্ষার ধরন মুছে ফেলা হচ্ছে..."
                : `পরীক্ষার ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন পরীক্ষার ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "পরীক্ষার ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "পরীক্ষার ধরন মুছে ফেলা নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন পরীক্ষার ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে পরীক্ষার ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই পরীক্ষার ধরনটি মুছে ফেলতে চান?"}
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

export default AddExamType;