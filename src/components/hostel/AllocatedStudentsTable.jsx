import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetHostelsQuery,
  useUpdateHostelMutation,
  useDeleteHostelMutation,
} from '../../redux/features/api/hostel/hostelsApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetHostelPackagesQuery } from '../../redux/features/api/hostel/hostelPackagesApi';
import { useGetHostelRoomsQuery } from '../../redux/features/api/hostel/hostelRoomsApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { FaSpinner, FaList, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-select';
import DraggableModal from '../common/DraggableModal';
import { languageCode } from '../../utilitis/getTheme';
import selectStyles from '../../utilitis/selectStyles';

const AllocatedStudentsTable = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: null,
    academic_year: null,
    hostel_package: null,
    room: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_hostel_allocation') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_hostel_allocation') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_hostel_allocation') || false;

  // API hooks
  const { data: allocations = [], isLoading, error: allocationsError, refetch } = useGetHostelsQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: hostelPackages = [] } = useGetHostelPackagesQuery();
  const { data: hostelRooms = [] } = useGetHostelRoomsQuery();
  const [updateAllocation, { isLoading: isUpdating, error: updateError }] = useUpdateHostelMutation();
  const [deleteAllocation, { isLoading: isDeleting, error: deleteError }] = useDeleteHostelMutation();

  // Filter allocations based on search term
  const filteredAllocations = useMemo(() => {
    if (!searchTerm.trim()) return allocations;

    return allocations.filter(allocation => {
      const searchLower = searchTerm.toLowerCase();
      const academicYear = academicYears.find(year => year.id === allocation.academic_year);
      const hostelPackage = hostelPackages.find(pkg => pkg.id === allocation.hostel_package);
      const room = hostelRooms.find(r => r.id === allocation.room);

      return (
        allocation.student?.username?.toLowerCase().includes(searchLower) ||
        allocation.student_id?.toString().includes(searchTerm) ||
        allocation.student?.name?.toLowerCase().includes(searchLower) ||
        hostelPackage?.package_name?.toLowerCase().includes(searchLower) ||
        room?.name?.toLowerCase().includes(searchLower) ||
        academicYear?.year?.toString().includes(searchTerm) ||
        academicYear?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [allocations, searchTerm, academicYears, hostelPackages, hostelRooms]);

  // Handle edit button click
  const handleEditClick = (allocation) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'সম্পাদনা করার অনুমতি আপনার নেই।' : 'You do not have permission to edit.');
      return;
    }
    setEditingAllocation(allocation);
    setEditFormData({
      status: { value: allocation.status, label: allocation.status },
      academic_year: { value: allocation.academic_year, label: getAcademicYearName(allocation.academic_year) },
      hostel_package: { value: allocation.hostel_package, label: getPackageName(allocation.hostel_package) },
      room: { value: allocation.room, label: getRoomName(allocation.room) },
    });
  };

  // Handle update submission
  const handleUpdate = () => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
      return;
    }
    setModalAction('update');
    setModalData({
      id: editingAllocation.id,
      student_id: editingAllocation.student_id,
      status: editFormData.status?.value,
      academic_year: editFormData.academic_year?.value,
      hostel_package: editFormData.hostel_package?.value,
      room: editFormData.room?.value,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'আপডেট করার অনুমতি আপনার নেই।' : 'You do not have permission to update.');
          return;
        }
        await updateAllocation(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'বরাদ্দ সফলভাবে আপডেট করা হয়েছে!' : 'Allocation updated successfully!');
        setEditingAllocation(null);
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error(languageCode === 'bn' ? 'মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete.');
          return;
        }
        await deleteAllocation(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'বরাদ্দ সফলভাবে মুছে ফেলা হয়েছে!' : 'Allocation deleted successfully!');
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'বরাদ্দ' : 'Allocation'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Get modal content
  const getModalContent = () => {
    switch (modalAction) {
      case 'update':
        return {
          title: languageCode === 'bn' ? 'বরাদ্দ আপডেট নিশ্চিত করুন' : 'Confirm Allocation Update',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই বরাদ্দ আপডেট করতে চান?' : 'Are you sure you want to update this allocation?'
        };
      case 'delete':
        return {
          title: languageCode === 'bn' ? 'বরাদ্দ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Allocation Deletion',
          message: languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই বরাদ্দটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this allocation?'
        };
      default:
        return { title: '', message: '' };
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${languageCode === 'bn' ? 'হোস্টেল বরাদ্দ প্রতিবেদন' : 'Hostel Allocation Report'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #4a90e2; margin-bottom: 5px; }
            .header p { color: #a0aec0; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255, 255, 255, 0.1); border: 1px solid #000; }
            th, td { border: 1px solid #000; padding: 12px; text-align: left; }
            th { background: rgba(255, 255, 255, 0.05); font-weight: bold; text-transform: uppercase; }
            .status-active { color: #2ecc71; font-weight: bold; }
            .status-inactive { color: #e74c3c; font-weight: bold; }
            .status-pending { color: #f1c40f; font-weight: bold; }
            .summary { margin-top: 30px; }
            .summary-item { display: inline-block; margin-right: 30px; color: #ffffff; }
            .summary-item strong { color: #4a90e2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${languageCode === 'bn' ? 'হোস্টেল বরাদ্দ প্রতিবেদন' : 'Hostel Allocation Report'}</h1>
            <p>${languageCode === 'bn' ? 'তৈরির তারিখ:' : 'Generated on:'} ${currentDate}</p>
            <p>${languageCode === 'bn' ? 'মোট বরাদ্দ:' : 'Total Allocations:'} ${filteredAllocations.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>${languageCode === 'bn' ? 'ছাত্রের নাম' : 'Student Name'}</th>
                <th>${languageCode === 'bn' ? 'ব্যবহারকারীর নাম' : 'Username'}</th>
                <th>${languageCode === 'bn' ? 'ব্যবহারকারীর আইডি' : 'User ID'}</th>
                <th>${languageCode === 'bn' ? 'স্থিতি' : 'Status'}</th>
                <th>${languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}</th>
                <th>${languageCode === 'bn' ? 'হোস্টেল প্যাকেজ' : 'Hostel Package'}</th>
                <th>${languageCode === 'bn' ? 'রুম' : 'Room'}</th>
                <th>${languageCode === 'bn' ? 'বরাদ্দের তারিখ' : 'Allocated Date'}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAllocations.map(allocation => {
                const academicYear = academicYears.find(year => year.id === allocation.academic_year);
                const hostelPackage = hostelPackages.find(pkg => pkg.id === allocation.hostel_package);
                const room = hostelRooms.find(r => r.id === allocation.room);
                
                return `
                  <tr>
                    <td>${allocation.student?.name || 'N/A'}</td>
                    <td>${allocation.student?.username || 'N/A'}</td>
                    <td>${allocation.student_id || 'N/A'}</td>
                    <td class="status-${allocation.status?.toLowerCase()}">${allocation.status || 'N/A'}</td>
                    <td>${academicYear?.year || academicYear?.name || 'N/A'}</td>
                    <td>${hostelPackage?.package_name || 'N/A'}</td>
                    <td>${room?.name || 'N/A'}</td>
                    <td>${allocation.created_at ? new Date(allocation.created_at).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>${languageCode === 'bn' ? 'সারাংশ' : 'Summary'}</h3>
            <div class="summary-item">
              <strong>${languageCode === 'bn' ? 'সক্রিয়:' : 'Active:'}</strong> ${filteredAllocations.filter(a => a.status === 'Active').length}
            </div>
            <div class="summary-item">
              <strong>${languageCode === 'bn' ? 'নিষ্ক্রিয়:' : 'Inactive:'}</strong> ${filteredAllocations.filter(a => a.status === 'Inactive').length}
            </div>
            <div class="summary-item">
              <strong>${languageCode === 'bn' ? 'অপেক্ষমাণ:' : 'Pending:'}</strong> ${filteredAllocations.filter(a => a.status === 'Pending').length}
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Get display names
  const getAcademicYearName = (yearId) => {
    const year = academicYears.find(y => y.id === yearId);
    return year?.year || year?.name || year?.academic_year || yearId || 'N/A';
  };

  const getPackageName = (packageId) => {
    const pkg = hostelPackages.find(p => p.id === packageId);
    return pkg?.package_name ? `${pkg.package_name} - $${Number(pkg.amount).toLocaleString()}` : packageId || 'N/A';
  };

  const getRoomName = (roomId) => {
    const room = hostelRooms.find(r => r.id === roomId);
    return room?.name || roomId || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US');
  };

  // React-Select options
  const statusOptions = [
    { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    { value: 'Inactive', label: languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive' },
    { value: 'Pending', label: languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending' },
  ];

  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.year || year.name || year.academic_year || year.id,
  }));

  const hostelPackageOptions = hostelPackages.map(pkg => ({
    value: pkg.id,
    label: `${pkg.package_name} - $${Number(pkg.amount).toLocaleString()}`,
  }));

  const roomOptions = hostelRooms.map(room => ({
    value: room.id,
    label: room.name,
  }));

  // Permission-based Rendering
  // if (permissionsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
  //         <div className="text-white">
  //           {languageCode === 'bn' ? 'অনুমতি লোড হচ্ছে...' : 'Loading permissions...'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!hasViewPermission) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
  //         <div className="text-secColor text-xl font-semibold">
  //           {languageCode === 'bn' ? 'এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।' : 'You do not have permission to view this page.'}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className=" w-full mx-auto">


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
          .react-select__control {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 0.75rem;
            padding: 0.25rem;
          }
          .react-select__control--is-focused {
            border-color: #4a90e2 !important;
            box-shadow: none !important;
            background: rgba(255, 255, 255, 0.15);
          }
          .react-select__menu {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            color: #ffffff;
          }
          .react-select__option {
            background: transparent;
            color: #ffffff;
          }
          .react-select__option--is-focused {
            background: rgba(255, 255, 255, 0.05);
          }
          .react-select__option--is-selected {
            background: #4a90e2;
          }
          .react-select__single-value {
            color: #ffffff;
          }
          .react-select__placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
        `}
      </style>

      {/* Page Header */}
      {/* <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex items-center space-x-4">
          <div className="bg-pmColor/20 p-3 rounded-xl">
            <FaList className="text-pmColor text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {languageCode === 'bn' ? 'বরাদ্দকৃত ছাত্র ব্যবস্থাপনা' : 'Allocated Students Management'}
            </h1>
            <p className="text-white/70 mt-1">
              {languageCode === 'bn' ? 'ছাত্রদের হোস্টেল বরাদ্দ পরিচালনা করুন' : 'Manage student hostel allocations'}
            </p>
          </div>
        </div>
      </div> */}

      {/* Search and Actions */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={languageCode === 'bn' ? 'ব্যবহারকারীর নাম, আইডি, প্যাকেজ বা রুম দ্বারা অনুসন্ধান করুন...' : 'Search by username, ID, package, or room...'}
              className="w-full pl-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-white/60 hover:text-white"
              >
                ✕
              </button>
            )}
            <FaSearch className="absolute left-3 top-4 text-white/60" />
          </div>
          <button
            onClick={generatePDFReport}
            className="bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span>{languageCode === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF'}</span>
          </button>
        </div>
        {searchTerm && (
          <div className="mt-4 text-sm text-white/70">
            {languageCode === 'bn' ? `${filteredAllocations.length}টি বরাদ্দ দেখানো হচ্ছে মোট ${allocations.length}টির মধ্যে` : `Showing ${filteredAllocations.length} of ${allocations.length} allocations`}
          </div>
        )}
      </div>

      {/* Allocations Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'বরাদ্দকৃত ছাত্রদের তালিকা' : 'Allocated Students List'}</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          {isLoading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
              <p className="text-white/70">
                {languageCode === 'bn' ? 'বরাদ্দ লোড হচ্ছে...' : 'Loading allocations...'}
              </p>
            </div>
          ) : allocationsError ? (
            <div className="p-8 text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">
                  {languageCode === 'bn' ? 'বরাদ্দ লোড করতে ত্রুটি:' : 'Error loading allocations:'} {allocationsError.status || 'unknown'}
                </p>
              </div>
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/70">
                {languageCode === 'bn' ? (searchTerm ? 'কোনো বরাদ্দ পাওয়া যায়নি।' : 'কোনো বরাদ্দ উপলব্ধ নেই।') : (searchTerm ? 'No allocations found.' : 'No allocations available.')}
              </p>
            </div>
          ) : (
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ছাত্র' : 'Student'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'স্থিতি' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'প্যাকেজ' : 'Package'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'রুম' : 'Room'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'বরাদ্দের তারিখ' : 'Allocated Date'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredAllocations.map((allocation, index) => (
                  <tr
                    key={allocation.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                            <span className="text-pmColor font-medium text-sm">
                              {allocation.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-white font-medium">{allocation.student?.name || 'Unknown Student'}</div>
                          <div className="text-white/70 text-sm">
                            @{allocation.student?.username || 'N/A'} | ID: {allocation.student_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        allocation.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        allocation.status === 'Inactive' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {languageCode === 'bn' ? 
                          (allocation.status === 'Active' ? 'সক্রিয়' :
                           allocation.status === 'Inactive' ? 'নিষ্ক্রিয়' : 'অপেক্ষমাণ') :
                          allocation.status
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{getAcademicYearName(allocation.academic_year)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{getPackageName(allocation.hostel_package)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{getRoomName(allocation.room)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/70 text-sm">{formatDate(allocation.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* {hasChangePermission && ( */}
                          <button
                            onClick={() => handleEditClick(allocation)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'বরাদ্দ সম্পাদনা করুন' : 'Edit allocation'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                         {/* )} */}
                        {/* {hasDeletePermission && ( */}
                          <button
                            onClick={() => handleDelete(allocation.id)}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'বরাদ্দ মুছুন' : 'Delete allocation'}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        {/* )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(isDeleting || deleteError || updateError) && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'বরাদ্দ মুছে ফেলা হচ্ছে...' : 'Deleting allocation...')
                  : `${languageCode === 'bn' ? 'বরাদ্দ প্রক্রিয়ায় ত্রুটি:' : 'Error processing allocation:'} ${(deleteError || updateError)?.status || 'unknown'}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {allocations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="text-white/70 font-semibold">{languageCode === 'bn' ? 'মোট বরাদ্দ' : 'Total Allocations'}</div>
            <div className="text-2xl font-bold text-white">{allocations.length}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="text-green-400 font-semibold">{languageCode === 'bn' ? 'সক্রিয়' : 'Active'}</div>
            <div className="text-2xl font-bold text-green-400">{allocations.filter(a => a.status === 'Active').length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
            <div className="text-yellow-400 font-semibold">{languageCode === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</div>
            <div className="text-2xl font-bold text-yellow-400">{allocations.filter(a => a.status === 'Pending').length}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <div className="text-red-400 font-semibold">{languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</div>
            <div className="text-2xl font-bold text-red-400">{allocations.filter(a => a.status === 'Inactive').length}</div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAllocation && (
        <DraggableModal
          isOpen={!!editingAllocation}
          onClose={() => setEditingAllocation(null)}
          onConfirm={handleUpdate}
          title={languageCode === 'bn' ? 'বরাদ্দ সম্পাদনা করুন' : 'Edit Allocation'}
          confirmText={languageCode === 'bn' ? 'আপডেট' : 'Update'}
          cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
          confirmButtonClass="bg-pmColor hover:bg-pmColor/80"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'স্থিতি' : 'Status'}
              </label>
              <Select
                value={editFormData.status}
                onChange={(option) => setEditFormData(prev => ({ ...prev, status: option }))}
                options={statusOptions}
                  styles={selectStyles}
                                menuPortalTarget={document.body}
                              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'স্থিতি নির্বাচন করুন' : 'Select Status'}
                isDisabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'শিক্ষাবর্ষ' : 'Academic Year'}
              </label>
              <Select
                value={editFormData.academic_year}
                onChange={(option) => setEditFormData(prev => ({ ...prev, academic_year: option }))}
                options={academicYearOptions}
                  styles={selectStyles}
                                menuPortalTarget={document.body}
                              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'শিক্ষাবর্ষ নির্বাচন করুন' : 'Select Academic Year'}
                isDisabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'হোস্টেল প্যাকেজ' : 'Hostel Package'}
              </label>
              <Select
                value={editFormData.hostel_package}
                onChange={(option) => setEditFormData(prev => ({ ...prev, hostel_package: option }))}
                options={hostelPackageOptions}
                  styles={selectStyles}
                                menuPortalTarget={document.body}
                              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'প্যাকেজ নির্বাচন করুন' : 'Select Package'}
                isDisabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'রুম' : 'Room'}
              </label>
              <Select
                value={editFormData.room}
                onChange={(option) => setEditFormData(prev => ({ ...prev, room: option }))}
                options={roomOptions}
                  styles={selectStyles}
                                menuPortalTarget={document.body}
                              menuPosition="fixed"
                classNamePrefix="react-select"
                placeholder={languageCode === 'bn' ? 'রুম নির্বাচন করুন' : 'Select Room'}
                isDisabled={isUpdating}
              />
            </div>
          </div>
        </DraggableModal>
      )}

      {/* Confirmation Modal */}
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

export default AllocatedStudentsTable;