import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import {
  useCreateMealsNameApiMutation,
  useDeleteMealsNameApiMutation,
  useGetMealsNameApiQuery,
  useUpdateMealsNameApiMutation,
} from "../../redux/features/api/meal/mealsNameApi";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook


const AddMealType = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  const [mealName, setMealName] = useState("");
  const [editMealId, setEditMealId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_meal_name') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_meal_name') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_meal_name') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_meal_name') || false;


  // API hooks
  const {
    data: mealTypes,
    isLoading: isMealsLoading,
    error: mealsError,
    refetch,
  } = useGetMealsNameApiQuery(undefined, { skip: !hasViewPermission });
  const [createMeal, { isLoading: isCreating, error: createError }] = useCreateMealsNameApiMutation();
  const [updateMeal, { isLoading: isUpdating, error: updateError }] = useUpdateMealsNameApiMutation();
  const [deleteMeal, { isLoading: isDeleting, error: deleteError }] = useDeleteMealsNameApiMutation();

  // Handle form submission for adding or updating meal type
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMealId && !hasChangePermission) {
      toast.error('খাবারের ধরন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    if (!editMealId && !hasAddPermission) {
      toast.error('নতুন খাবারের ধরন যোগ করার অনুমতি নেই।');
      return;
    }

    const name = mealName.trim();
    if (!name) {
      toast.error("অনুগ্রহ করে খাবারের ধরনের নাম লিখুন");
      return;
    }
    if (mealTypes?.some((mt) => mt.name.toLowerCase() === name.toLowerCase() && mt.id !== editMealId)) {
      toast.error("এই খাবারের ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction(editMealId ? "update" : "create");
    setModalData({
      id: editMealId,
      name: name,
      is_active: editMealId ? mealTypes.find((mt) => mt.id === editMealId)?.is_active || true : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (meal) => {
    if (!hasChangePermission) {
      toast.error('খাবারের ধরন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditMealId(meal.id);
    setMealName(meal.name);
  };

  // Handle toggle active status
  const handleToggleActive = (meal) => {
    if (!hasChangePermission) {
      toast.error('খাবারের ধরনের স্থিতি পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    setModalAction("toggle");
    setModalData({
      id: meal.id,
      name: meal.name,
      is_active: !meal.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete meal type
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('খাবারের ধরন মুছে ফেলার অনুমতি নেই।');
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
        if (!hasAddPermission) { toast.error('খাবারের ধরন তৈরি করার অনুমতি নেই।'); return; }
        await createMeal({ name: modalData.name, is_active: modalData.is_active }).unwrap();
        toast.success("খাবারের ধরন সফলভাবে তৈরি করা হয়েছে!");
        setMealName("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { toast.error('খাবারের ধরন আপডেট করার অনুমতি নেই।'); return; }
        await updateMeal(modalData).unwrap();
        toast.success("খাবারের ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditMealId(null);
        setMealName("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { toast.error('খাবারের ধরন মুছে ফেলার অনুমতি নেই।'); return; }
        await deleteMeal(modalData.id).unwrap();
        toast.success("খাবারের ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        if (!hasChangePermission) { toast.error('খাবারের ধরনের স্থিতি পরিবর্তন করার অনুমতি নেই।'); return; }
        await updateMeal(modalData).unwrap();
        toast.success(`খাবারের ধরন ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`, err);
      toast.error(`খাবারের ধরন ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  const isFormDisabled = isCreating || isUpdating || (!editMealId && !hasAddPermission) || (editMealId && !hasChangePermission);

  if (isMealsLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-pmColor" />
          <span className="text-lg font-medium text-white">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
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

      <div>
        {/* Add/Edit Meal Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              {editMealId ? (
                <FaEdit className="text-4xl text-white" />
              ) : (
                <IoAddCircle className="text-4xl text-white" />
              )}
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05]tracking-tight">
                {editMealId ? "খাবারের ধরন সম্পাদনা করুন" : "নতুন খাবারের ধরন যোগ করুন"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text"
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05]placeholder-[#441a05]pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="খাবারের ধরন"
                disabled={isFormDisabled}
                aria-label="খাবারের ধরন"
                title="খাবারের ধরন লিখুন (উদাহরণ: সকালের নাস্তা) / Enter meal type (e.g., Breakfast)"
                aria-describedby={createError || updateError ? "meal-error" : undefined}
              />
              <button
                type="submit"
                disabled={isFormDisabled}
                title={editMealId ? "খাবারের ধরন আপডেট করুন / Update meal type" : "নতুন খাবারের ধরন তৈরি করুন / Create a new meal type"}
                className={`relative inline-flex items-center hover:text-[#441a05]px-8 py-3 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-300 animate-scaleIn ${
                  isFormDisabled ? "cursor-not-allowed" : "hover:text-[#441a05]hover:shadow-md"
                }`}
              >
                {(isCreating || isUpdating) ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>{editMealId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IoAdd className="w-5 h-5" />
                    <span>{editMealId ? "খাবার আপডেট করুন" : "খাবার তৈরি করুন"}</span>
                  </span>
                )}
              </button>
              {editMealId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditMealId(null);
                    setMealName("");
                  }}
                  title="সম্পাদনা বাতিল করুন / Cancel editing"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05]hover:text-[#441a05]transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              )}
            </form>
            {(createError || updateError) && (
              <div
                id="meal-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {(createError || updateError).status || "অজানা"} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            )}
          </div>
        )}

        {/* Meal Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05]p-4 border-b border-white/20">খাবারের ধরনের তালিকা</h3>
          {isMealsLoading ? (
            <p className="p-4 text-white/70">খাবারের ধরন লোড হচ্ছে...</p>
          ) : mealsError ? (
            <p className="p-4 text-red-400">
              খাবারের ধরন লোড করতে ত্রুটি: {mealsError.status || "অজানা"} - {JSON.stringify(mealsError.data || {})}
            </p>
          ) : mealTypes?.length === 0 ? (
            <p className="p-4 text-white/70">কোনো খাবারের ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      খাবারের ধরন
                    </th>
                    {hasChangePermission && ( // Conditionally render active column
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        সক্রিয়
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {(hasChangePermission || hasDeletePermission) && ( // Conditionally render actions column
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {mealTypes?.map((meal, index) => (
                    <tr
                      key={meal.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {meal.name}
                      </td>
                      {hasChangePermission && ( // Conditionally render active toggle
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={meal.is_active}
                              onChange={() => handleToggleActive(meal)}
                              className="hidden"
                              disabled={!hasChangePermission} // Disable if no change permission
                            />
                            <span
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                                meal.is_active
                                  ? "bg-pmColor border-pmColor"
                                  : "bg-white/10 border-[#9d9087] hover:border-white"
                              }`}
                            >
                              {meal.is_active && (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(meal.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(meal.updated_at).toLocaleString("bn-BD")}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && ( // Conditionally render action buttons
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(meal)}
                              title="খাবারের ধরন সম্পাদনা করুন / Edit meal type"
                              className="text-[#441a05]hover:text-blue-500 mr-4 transition-colors duration-300"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(meal.id)}
                              title="খাবারের ধরন মুছুন / Delete meal type"
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
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "খাবারের ধরন মুছে ফেলা হচ্ছে..."
                : `খাবারের ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && ( // Only show if user has relevant permissions
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-[#441a05]backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05]mb-4">
                {modalAction === "create" && "নতুন খাবারের ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "খাবারের ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "খাবারের ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "খাবারের ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05]mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন খাবারের ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে খাবারের ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই খাবারের ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে খাবারের ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05]rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-pmColor text-[#441a05]rounded-lg hover:text-[#441a05]transition-colors duration-300 btn-glow"
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

export default AddMealType;