import React, { useState } from 'react';
import {
  useGetHostelPackagesQuery,
  useCreateHostelPackageMutation,
  useDeleteHostelPackageMutation,
  useUpdateHostelPackageMutation } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { FaEdit, FaSpinner, FaTrash, FaPlus, FaList } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { languageCode } from "../../utilitis/getTheme";
import DraggableModal from "../common/DraggableModal";
import Select from 'react-select'; // Import react-select
import selectStyles from '../../utilitis/selectStyles';

const HostelPackages = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [packageName, setPackageName] = useState("");
  const [amount, setAmount] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [editPackageId, setEditPackageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_hostelpackage') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_hostelpackage') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_hostelpackage') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_hostelpackage') || false;

  // API hooks
  const { data: packages = [], isLoading, isError, error } = useGetHostelPackagesQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const [createPackage, { isLoading: isCreating, error: createError }] = useCreateHostelPackageMutation();
  const [updatePackage, { isLoading: isUpdating, error: updateError }] = useUpdateHostelPackageMutation();
  const [deletePackage, { isLoading: isDeleting, error: deleteError }] = useDeleteHostelPackageMutation();

  // Handle form submission for adding or updating package
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editPackageId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error(languageCode === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.');
      return;
    }

    const name = packageName.trim();
    if (!name || !amount.trim() || !academicYear) {
      toast.error(languageCode === 'bn' ? "অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    if (packages?.some((pkg) => pkg.package_name.toLowerCase() === name.toLowerCase() && pkg.id !== editPackageId)) {
      toast.error(languageCode === 'bn' ? "এই প্যাকেজটি ইতিমধ্যে বিদ্যমান!" : "This package already exists!");
      return;
    }

    setModalAction(editPackageId ? "update" : "create");
    setModalData({
      id: editPackageId,
      package_name: name,
      amount: amount.toString(),
      academic_year: parseInt(academicYear),
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (pkg) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditPackageId(pkg.id);
    setPackageName(pkg.package_name);
    setAmount(pkg.amount.toString());
    setAcademicYear(pkg.academic_year.toString());
  };

  // Handle delete package
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
        await createPackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "প্যাকেজ সফলভাবে তৈরি করা হয়েছে!" : "Package created successfully!");
        setPackageName("");
        setAmount("");
        setAcademicYear("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { 
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.'); 
          return; 
        }
        await updatePackage(modalData).unwrap();
        toast.success(languageCode === 'bn' ? "প্যাকেজ সফলভাবে আপডেট করা হয়েছে!" : "Package updated successfully!");
        setEditPackageId(null);
        setPackageName("");
        setAmount("");
        setAcademicYear("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { 
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.'); 
          return; 
        }
        await deletePackage(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? "প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে!" : "Package deleted successfully!");
      }
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'প্যাকেজ' : 'Package'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || "unknown"}`);
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
          title: languageCode === 'bn' ? "নতুন প্যাকেজ নিশ্চিত করুন" : "Confirm New Package",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে নতুন প্যাকেজ তৈরি করতে চান?" : "Are you sure you want to create a new package?"
        };
      case "update":
        return {
          title: languageCode === 'bn' ? "প্যাকেজ আপডেট নিশ্চিত করুন" : "Confirm Package Update",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে প্যাকেজ আপডেট করতে চান?" : "Are you sure you want to update this package?"
        };
      case "delete":
        return {
          title: languageCode === 'bn' ? "প্যাকেজ মুছে ফেলা নিশ্চিত করুন" : "Confirm Package Deletion",
          message: languageCode === 'bn' ? "আপনি কি নিশ্চিত যে এই প্যাকেজটি মুছে ফেলতে চান?" : "Are you sure you want to delete this package?"
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(languageCode === 'bn' ? "bn-BD" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Prepare options for react-select
  const academicYearOptions = [
    { value: "", label: languageCode === 'bn' ? "শিক্ষাবর্ষ নির্বাচন করুন" : "Select Academic Year" },
    ...academicYears.map((year) => ({
      value: year.id.toString(),
      label: year.year || year.name || year.academic_year || year.id,
    })),
  ];

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
            {languageCode === 'bn' ? 'প্যাকেজ লোড হচ্ছে...' : 'Loading packages...'}
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
            {languageCode === 'bn' ? 'প্যাকেজ লোড করতে ত্রুটি' : 'Error Loading Packages'}
          </h2>
          <p className="text-red-600">{error?.data?.message || 'Failed to load hostel packages'}</p>
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
              {languageCode === 'bn' ? 'হোস্টেল প্যাকেজ ব্যবস্থাপনা' : 'Hostel Package Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'হোস্টেল প্যাকেজ তৈরি, সম্পাদনা এবং পরিচালনা করুন' : 'Create, edit and manage hostel packages'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Package Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editPackageId ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editPackageId 
                ? (languageCode === 'bn' ? "প্যাকেজ সম্পাদনা করুন" : "Edit Package")
                : (languageCode === 'bn' ? "নতুন প্যাকেজ যোগ করুন" : "Add New Package")
              }
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <input
                type="text"
                id="packageName"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "প্যাকেজের নাম" : "Package Name"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "প্যাকেজের নাম" : "Package Name"}
              />
            </div>
            
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? "পরিমাণ" : "Amount"}
                disabled={isCreating || isUpdating}
                aria-label={languageCode === 'bn' ? "পরিমাণ" : "Amount"}
              />
            </div>
            
            <div className="relative">
              <Select
                id="academicYear"
                value={academicYearOptions.find(option => option.value === academicYear)}
                onChange={(selectedOption) => setAcademicYear(selectedOption ? selectedOption.value : "")}
                options={academicYearOptions}
                styles={selectStyles}
                menuPortalTarget={document.body}
              menuPosition="fixed"
                isDisabled={isCreating || isUpdating}
                placeholder={languageCode === 'bn' ? "শিক্ষাবর্ষ নির্বাচন করুন" : "Select Academic Year"}
                aria-label={languageCode === 'bn' ? "শিক্ষাবর্ষ" : "Academic Year"}
              />
            </div>
            
            <button
              type="submit"
              disabled={isCreating || isUpdating || (editPackageId ? !hasChangePermission : !hasAddPermission)}
              className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                (isCreating || isUpdating || (editPackageId ? !hasChangePermission : !hasAddPermission)) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>
                    {editPackageId 
                      ? (languageCode === 'bn' ? "আপডেট করা হচ্ছে..." : "Updating...")
                      : (languageCode === 'bn' ? "তৈরি করা হচ্ছে..." : "Creating...")
                    }
                  </span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>
                    {editPackageId 
                      ? (languageCode === 'bn' ? "প্যাকেজ আপডেট করুন" : "Update Package")
                      : (languageCode === 'bn' ? "প্যাকেজ তৈরি করুন" : "Create Package")
                    }
                  </span>
                </>
              )}
            </button>
            
            {editPackageId && (
              <button
                type="button"
                onClick={() => {
                  setEditPackageId(null);
                  setPackageName("");
                  setAmount("");
                  setAcademicYear("");
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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

      {/* Packages Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'প্যাকেজের তালিকা' : 'Packages List'} ({packages.length})</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          {packages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/70">
                {languageCode === 'bn' ? 'কোনো প্যাকেজ উপলব্ধ নেই।' : 'No packages available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'পরিমাণ' : 'Amount'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {packages?.map((pkg, index) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{pkg.package_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        ${pkg.amount ? Number(pkg.amount).toLocaleString() : '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-pmColor">
                        {academicYears.find(year => year.id === pkg.academic_year)?.year || 
                         academicYears.find(year => year.id === pkg.academic_year)?.name || 
                         academicYears.find(year => year.id === pkg.academic_year)?.academic_year || 
                         pkg.academic_year}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {formatDate(pkg.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">
                        {formatDate(pkg.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(pkg)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'প্যাকেজ সম্পাদনা করুন' : 'Edit package'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'প্যাকেজ মুছুন' : 'Delete package'}
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
                  ? (languageCode === 'bn' ? "প্যাকেজ মুছে ফেলা হচ্ছে..." : "Deleting package...")
                  : `${languageCode === 'bn' ? 'প্যাকেজ মুছে ফেলতে ত্রুটি:' : 'Error deleting package:'} ${deleteError?.status || "unknown"}`
                }
              </div>
            </div>
          </div>
        )}
      </div>

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

export default HostelPackages;