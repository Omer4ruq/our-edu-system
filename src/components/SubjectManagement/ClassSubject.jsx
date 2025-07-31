import React, { useState, useEffect } from "react";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useGetClassSubjectsQuery,
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
  useDeleteClassSubjectMutation,
} from "../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetGSubjectsByClassQuery } from "../../redux/features/api/class-subjects/gsubjectApi";
import { useGetStudentClassApIQuery } from "../../redux/features/api/student/studentClassApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";

const ClassSubject = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [filterClassId, setFilterClassId] = useState("all"); // For filtering the active subjects table
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  // Fetch data
  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useGetStudentClassApIQuery();
  const {
    data: classSubjects = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsQuery();
  const {
    data: gSubjects = [],
    isLoading: gSubjectsLoading,
    error: gSubjectsError,
  } = useGetGSubjectsByClassQuery(selectedClassId, { skip: !selectedClassId });
  const [createClassSubject, { isLoading: createLoading }] =
    useCreateClassSubjectMutation();
  const [updateClassSubject, { isLoading: updateLoading }] =
    useUpdateClassSubjectMutation();
  const [deleteClassSubject, { isLoading: deleteLoading }] =
    useDeleteClassSubjectMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  console.log("classSubjects", classSubjects);

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_classsubject') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_classsubject') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_classsubject') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_classsubject') || false;

  // Set the first class as selected by default when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].student_class.id);
    }
  }, [classes, selectedClassId]);

  // Handle class tab selection
  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
  };

  console.log(selectedClassId);
  console.log("classes", classes);

  // Handle subject checkbox change - for activating/deactivating subjects
  const handleSubjectStatusChange = async (subjectId, isActive) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('বিষয় যোগ বা আপডেট করার অনুমতি নেই।');
      return;
    }

    // Check if subject is already activated for this class
    const existingSubject = classSubjects.find(
      (sub) => sub.class_subject === subjectId && sub.class_info?.id === selectedClassId
    );
    
    const action = existingSubject ? "আপডেট" : "তৈরি";
    const payload = {
      is_active: isActive,
      class_subject: subjectId,
    };

    console.log("payload", payload);

    try {
      if (existingSubject) {
        if (!hasChangePermission) {
          toast.error('বিষয় আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateClassSubject({
          id: existingSubject.id,
          ...payload,
        }).unwrap();
        toast.success(`বিষয় সফলভাবে ${action} করা হয়েছে!`);
      } else {
        if (!hasAddPermission) {
          toast.error('বিষয় তৈরি করার অনুমতি নেই।');
          return;
        }
        await createClassSubject(payload).unwrap();
        toast.success(`বিষয় সফলভাবে ${action} করা হয়েছে!`);
      }
    } catch (err) {
      console.error(`বিষয় ${action} ব্যর্থ:`, err);
      const errorDetail =
        err?.data?.detail ||
        err?.data?.non_field_errors?.join(", ") ||
        err?.message ||
        "অজানা ত্রুটি ঘটেছে";
      toast.error(`বিষয় ${action} ব্যর্থ: ${errorDetail}`);
    }
  };

  // Handle delete button click
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('বিষয় মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm modal action
  const confirmAction = async () => {
    try {
      if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error('বিষয় মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteClassSubject(modalData.id).unwrap();
        toast.success("বিষয় সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error("বিষয় মুছে ফেলা ব্যর্থ:", err);
      const errorDetail =
        err?.data?.detail ||
        err?.data?.non_field_errors?.join(", ") ||
        err?.message ||
        "অজানা ত্রুটি";
      toast.error(`বিষয় মুছে ফেলা ব্যর্থ: ${errorDetail}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  if (classesLoading || subjectsLoading || gSubjectsLoading || permissionsLoading) {
    return (
      <div className="text-center animate-fadeIn">
        <FaSpinner className="inline-block animate-spin text-2xl text-white mb-2" />
        <p className="text-white/70">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8">
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
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
        {/* Header */}
        {/* Class Tabs */}
        <div className="mb-6">
          <div className="border-b border-white/20 bg-black/10 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex items-center space-x-4 m-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-white" />
              <h1 className="sm:text-2xl text-xl font-bold text-white tracking-tight">
                ক্লাস বিষয় ব্যবস্থাপনা
              </h1>
            </div>
            <nav className="flex space-x-4 overflow-x-auto px-8 pb-5 pt-3">
              {classesLoading ? (
                <span className="text-white/70 p-4 animate-fadeIn">
                  ক্লাস লোড হচ্ছে...
                </span>
              ) : classesError ? (
                <span className="text-red-400 p-4 animate-fadeIn">
                  ক্লাস লোডে ত্রুটি: {classesError.message}
                </span>
              ) : classes.length > 0 ? (
                classes?.map((cls, index) => (
                  <button
                    key={cls.id}
                    onClick={() => handleClassSelect(cls?.student_class.id)}
                    className={`whitespace-nowrap py-2 px-4 font-medium text-sm rounded-md transition-all duration-300 animate-scaleIn ${
                      selectedClassId === cls.student_class.id
                        ? "bg-pmColor text-white shadow-md"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    aria-label={`ক্লাস নির্বাচন ${cls?.student_class?.name}`}
                    title={`ক্লাস নির্বাচন করুন / Select class ${cls?.student_class?.name}`}
                  >
                    {cls?.student_class?.name}
                  </button>
                ))
              ) : (
                <span className="text-white/70 p-4 animate-fadeIn">
                  কোনো ক্লাস পাওয়া যায়নি
                </span>
              )}
            </nav>
          </div>
        </div>

        {/* Subject List with Checkboxes for Activation/Deactivation */}
        {selectedClassId && (hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-10 mx-auto animate-fadeIn">
            <h2 className="text-lg font-semibold text-white mb-4">
              নির্বাচিত ক্লাসের জন্য বিষয় (সক্রিয়/নিষ্ক্রিয় করুন)
            </h2>
            {gSubjectsLoading ? (
              <div className="text-center animate-fadeIn">
                <FaSpinner className="inline-block animate-spin text-2xl text-white mb-2" />
                <p className="text-white/70">বিষয় লোড হচ্ছে...</p>
              </div>
            ) : gSubjectsError ? (
              <p className="text-red-400 text-center animate-fadeIn">
                ত্রুটি: {gSubjectsError.message}
              </p>
            ) : gSubjects.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gSubjects.map((subject, index) => {
                  // Check if this subject is already activated for the selected class
                  const existingSubject = classSubjects.find(
                    (sub) => sub.class_subject === subject.id && sub.class_info?.id === selectedClassId
                  );
                  
                  return (
                    <li
                      key={subject.id}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-md hover:bg-white/20 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={existingSubject ? existingSubject.is_active : false}
                          onChange={(e) =>
                            handleSubjectStatusChange(
                              subject.id,
                              e.target.checked
                            )
                          }
                          disabled={createLoading || updateLoading || (!hasAddPermission && !existingSubject) || (!hasChangePermission && existingSubject)}
                          className="hidden"
                          aria-label={`বিষয় নির্বাচন ${subject.name}`}
                          title={`বিষয় নির্বাচন করুন / Select subject ${subject.name}`}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                            existingSubject?.is_active
                              ? "bg-pmColor border-pmColor"
                              : "bg-white/10 border-[#9d9087] hover:border-white"
                          }`}
                        >
                          {existingSubject?.is_active && (
                            <svg
                              className="w-4 h-4 text-white animate-scaleIn"
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
                        <span className="ml-3 text-sm text-white">
                          {subject.name} (SL: {subject.sl})
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-white/70 text-center animate-fadeIn">
                এই ক্লাসের জন্য কোনো বিষয় পাওয়া যায়নি
              </p>
            )}
          </div>
        )}

        {/* Display Only Active Class Subjects */}
        {subjectsLoading || classesLoading ? (
          <div className="text-center animate-fadeIn">
            <FaSpinner className="inline-block animate-spin text-2xl text-white mb-2" />
            <p className="text-white/70">লোড হচ্ছে...</p>
          </div>
        ) : subjectsError || classesError ? (
          <p className="text-red-400 text-center animate-fadeIn">
            ত্রুটি: {subjectsError?.message || classesError?.message}
          </p>
        ) : (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">
                সক্রিয় ক্লাস বিষয় তালিকা
              </h3>
              
              {/* Class Filter Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-white/70">ক্লাস ফিল্টার:</label>
                <select
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-pmColor focus:border-transparent"
                >
                  <option value="all">সকল ক্লাস</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.student_class.id}>
                      {cls.student_class.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      ক্লাস
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      বিষয়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      SL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      স্ট্যাটাস
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {hasDeletePermission && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {classSubjects
                    ?.filter((subject) => {
                      // Filter by active status
                      if (!subject.is_active) return false;
                      
                      // Filter by selected class if not "all"
                      if (filterClassId !== "all") {
                        return subject.class_info?.id === parseInt(filterClassId);
                      }
                      
                      return true;
                    })
                    .map((subject, index) => {
                      return (
                        <tr
                          key={subject.id}
                          className="bg-white/5 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {subject.class_info?.name || "অজানা"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {subject.name || "অজানা"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {subject.sl || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              সক্রিয়
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {new Date(subject.created_at).toLocaleString("bn-BD")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {new Date(subject.updated_at).toLocaleString("bn-BD")}
                          </td>
                          {hasDeletePermission && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDelete(subject.id)}
                                disabled={deleteLoading}
                                className={`text-white hover:text-red-500 transition-colors duration-300 ${
                                  deleteLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                title="বিষয় মুছুন / Delete subject"
                                aria-label="বিষয় মুছুন"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {classSubjects?.filter((subject) => {
              // Filter by active status
              if (!subject.is_active) return false;
              
              // Filter by selected class if not "all"
              if (filterClassId !== "all") {
                return subject.class_info?.id === parseInt(filterClassId);
              }
              
              return true;
            }).length === 0 && (
              <p className="text-white/70 p-4 text-center animate-fadeIn">
                {filterClassId === "all" 
                  ? "কোনো সক্রিয় ক্লাস বিষয় পাওয়া যায়নি" 
                  : "নির্বাচিত ক্লাসের জন্য কোনো সক্রিয় বিষয় পাওয়া যায়নি"}
              </p>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && hasDeletePermission && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-white mb-4">
                বিষয় মুছে ফেলা নিশ্চিত করুন
              </h3>
              <p className="text-white mb-6">
                আপনি কি নিশ্চিত যে এই বিষয় মুছে ফেলতে চান?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-pmColor text-white rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
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

export default ClassSubject;