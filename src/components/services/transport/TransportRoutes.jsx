import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaList, FaEdit, FaTrash, FaPlus, FaBus } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdAccessTime, MdUpdate } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { languageCode } from '../../../utilitis/getTheme';
import DraggableModal from '../../common/DraggableModal';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { useCreateTransportRouteMutation, useDeleteTransportRouteMutation, useGetTransportRoutesQuery, useUpdateTransportRouteMutation } from '../../../redux/features/api/transport/transportRoutesApi';


const TransportRoutes = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_point: '',
    end_point: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_transport_route') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_transport_route') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_transport_route') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_transport_route') || false;

  // API Hooks
  const { data: routes = [], isLoading, isError, error, refetch } = useGetTransportRoutesQuery();
  const [createRoute, { isLoading: isCreating, error: createError }] = useCreateTransportRouteMutation();
  const [updateRoute, { isLoading: isUpdating, error: updateError }] = useUpdateTransportRouteMutation();
  const [deleteRoute, { isLoading: isDeleting, error: deleteError }] = useDeleteTransportRouteMutation();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission && !editingRoute) {
      toast.error(languageCode === 'bn' ? 'রুট তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create routes.');
      return;
    }
    if (!hasChangePermission && editingRoute) {
      toast.error(languageCode === 'bn' ? 'রুট সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit routes.');
      return;
    }
    if (!formData.name.trim() || !formData.start_point.trim() || !formData.end_point.trim()) {
      toast.error(languageCode === 'bn' ? 'সমস্ত ফিল্ড পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    if (routes.some(route => route.name.toLowerCase() === formData.name.trim().toLowerCase() && route.id !== (editingRoute?.id || null))) {
      toast.error(languageCode === 'bn' ? 'এই রুটের নাম ইতিমধ্যে বিদ্যমান!' : 'This route name already exists!');
      return;
    }

    const routeData = {
      name: formData.name.trim(),
      start_point: formData.start_point.trim(),
      end_point: formData.end_point.trim(),
    };

    setModalAction(editingRoute ? 'update' : 'create');
    setModalData(editingRoute ? { id: editingRoute.id, ...routeData } : routeData);
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) {
          toast.error(languageCode === 'bn' ? 'রুট তৈরি করার অনুমতি আপনার নেই।' : 'You do not have permission to create routes.');
          return;
        }
        await createRoute(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'রুট সফলভাবে তৈরি করা হয়েছে!' : 'Route created successfully!');
        setShowCreateForm(false);
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
          toast.error(languageCode === 'bn' ? 'রুট সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit routes.');
          return;
        }
        await updateRoute(modalData).unwrap();
        toast.success(languageCode === 'bn' ? 'রুট সফলভাবে আপডেট করা হয়েছে!' : 'Route updated successfully!');
        setEditingRoute(null);
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error(languageCode === 'bn' ? 'রুট মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete routes.');
          return;
        }
        await deleteRoute(modalData.id).unwrap();
        toast.success(languageCode === 'bn' ? 'রুট সফলভাবে মুছে ফেলা হয়েছে!' : 'Route deleted successfully!');
      }
      setFormData({ name: '', start_point: '', end_point: '' });
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`Error ${modalAction}:`, err);
      toast.error(`${languageCode === 'bn' ? 'রুট' : 'Route'} ${modalAction} ${languageCode === 'bn' ? 'ব্যর্থ' : 'failed'}: ${err.status || 'unknown'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle edit button click
  const handleEdit = (route) => {
    if (!hasChangePermission) {
      toast.error(languageCode === 'bn' ? 'রুট সম্পাদনার অনুমতি আপনার নেই।' : 'You do not have permission to edit routes.');
      return;
    }
    setEditingRoute(route);
    setFormData({
      name: route.name,
      start_point: route.start_point,
      end_point: route.end_point,
    });
    setShowCreateForm(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error(languageCode === 'bn' ? 'রুট মুছে ফেলার অনুমতি আপনার নেই।' : 'You do not have permission to delete routes.');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingRoute(null);
    setFormData({
      name: '',
      start_point: '',
      end_point: '',
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(languageCode === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    <div className="py-8 w-full mx-auto">
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaBus className="text-pmColor text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {languageCode === 'bn' ? 'পরিবহন রুট' : 'Transport Routes'}
              </h1>
              <p className="text-white/70 mt-1">
                {languageCode === 'bn' ? 'পরিবহন রুট এবং সময়সূচী পরিচালনা করুন' : 'Manage transportation routes and schedules'}
              </p>
            </div>
          </div>
          {hasAddPermission && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105"
            >
              <FaPlus />
              <span>{languageCode === 'bn' ? 'নতুন রুট যোগ করুন' : 'Add New Route'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {/* {showCreateForm && hasAddPermission && ( */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 rounded-xl">
              {editingRoute ? (
                <FaEdit className="text-pmColor text-3xl" />
              ) : (
                <IoAddCircle className="text-pmColor text-3xl" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {editingRoute
                ? (languageCode === 'bn' ? 'রুট সম্পাদনা করুন' : 'Edit Route')
                : (languageCode === 'bn' ? 'নতুন রুট তৈরি করুন' : 'Create New Route')}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'রুটের নাম *' : 'Route Name *'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? 'রুটের নাম লিখুন (যেমন, রুট এ, সিটি সেন্টার লাইন)' : 'Enter route name (e.g., Route A, City Center Line)'}
                disabled={isCreating || isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'শুরুর স্থান *' : 'Start Point *'}
              </label>
              <input
                type="text"
                name="start_point"
                value={formData.start_point}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? 'শুরুর স্থান লিখুন' : 'Enter starting location'}
                disabled={isCreating || isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {languageCode === 'bn' ? 'শেষের স্থান *' : 'End Point *'}
              </label>
              <input
                type="text"
                name="end_point"
                value={formData.end_point}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-pmColor focus:bg-white/15 transition-all duration-300"
                placeholder={languageCode === 'bn' ? 'গন্তব্য স্থান লিখুন' : 'Enter destination location'}
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="md:col-span-3 flex gap-4">
              <button
                type="submit"
                disabled={isCreating || isUpdating || (!hasAddPermission && !editingRoute) || (!hasChangePermission && editingRoute)}
                className={`bg-pmColor hover:bg-pmColor/80 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  (isCreating || isUpdating || (!hasAddPermission && !editingRoute) || (!hasChangePermission && editingRoute))
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:scale-105'
                }`}
              >
                {isCreating || isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{languageCode === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>{editingRoute ? (languageCode === 'bn' ? 'রুট আপডেট করুন' : 'Update Route') : (languageCode === 'bn' ? 'রুট তৈরি করুন' : 'Create Route')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                {languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>

          {(createError || updateError) && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
              <div className="text-red-400">
                {languageCode === 'bn' ? 'রুট সংরক্ষণে ত্রুটি:' : 'Error saving route:'} {(createError || updateError).status || 'unknown'} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            </div>
          )}
        </div>
      {/* )} */}

      {/* Routes Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FaList className="text-pmColor" />
            <span>{languageCode === 'bn' ? 'সমস্ত রুট' : 'All Routes'} ({routes.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-pmColor text-2xl mx-auto mb-4" />
            <p className="text-white/70">
              {languageCode === 'bn' ? 'রুট লোড হচ্ছে...' : 'Loading routes...'}
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400">
                {languageCode === 'bn' ? 'রুট লোড করতে ত্রুটি:' : 'Error loading routes:'} {error?.status || 'unknown'}
              </p>
              <button
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-pmColor text-white rounded-xl hover:bg-pmColor/80 transition-all"
              >
                {languageCode === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </button>
            </div>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-white/70 text-xl mb-2">🚌</div>
            <p className="text-white/70">
              {languageCode === 'bn' ? 'কোনো রুট পাওয়া যায়নি। শুরু করতে আপনার প্রথম রুট তৈরি করুন।' : 'No routes found. Create your first transport route to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full" key={refreshKey}>
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'রুটের নাম' : 'Route Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শুরুর স্থান' : 'Start Point'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'শেষের স্থান' : 'End Point'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdAccessTime className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'তৈরির সময়' : 'Created At'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <MdUpdate className="text-pmColor" />
                      <span>{languageCode === 'bn' ? 'আপডেটের সময়' : 'Updated At'}</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/80 uppercase tracking-wider">
                    {languageCode === 'bn' ? 'ক্রিয়াকলাপ' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {routes.map((route, index) => (
                  <tr
                    key={route.id}
                    className="hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">#{route.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-pmColor/20 flex items-center justify-center">
                            <span className="text-pmColor font-medium text-sm">
                              {route.name?.charAt(0)?.toUpperCase() || 'R'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{route.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-500 font-medium text-xs">🚩</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-white">{route.start_point}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="h-8 w-8 rounded bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-500 font-medium text-xs">🏁</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-white">{route.end_point}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {formatDate(route.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {formatDate(route.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* {hasChangePermission && ( */}
                          <button
                            onClick={() => handleEdit(route)}
                            className="bg-pmColor/20 hover:bg-pmColor hover:text-white text-pmColor p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'রুট সম্পাদনা করুন' : 'Edit route'}
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        {/* )} */}
                        {/* {hasDeletePermission && ( */}
                          <button
                            onClick={() => handleDelete(route.id)}
                            disabled={isDeleting}
                            className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all duration-300"
                            title={languageCode === 'bn' ? 'রুট মুছুন' : 'Delete route'}
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
          </div>
        )}

        {(isDeleting || deleteError) && (
          <div className="p-4 border-t border-white/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400">
                {isDeleting
                  ? (languageCode === 'bn' ? 'রুট মুছে ফেলা হচ্ছে...' : 'Deleting route...')
                  : `${languageCode === 'bn' ? 'রুট মুছে ফেলতে ত্রুটি:' : 'Error deleting route:'} ${deleteError?.status || 'unknown'}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {routes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-pmColor/20 rounded-lg flex items-center justify-center">
                <FaBus className="text-pmColor text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'মোট রুট' : 'Total Routes'}
                </p>
                <p className="text-2xl font-semibold text-white">{routes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">📍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'অনন্য শুরুর স্থান' : 'Unique Start Points'}
                </p>
                <p className="text-2xl font-semibold text-white">{new Set(routes.map(route => route.start_point)).size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-500 text-xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'অনন্য গন্তব্য' : 'Unique Destinations'}
                </p>
                <p className="text-2xl font-semibold text-white">{new Set(routes.map(route => route.end_point)).size}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-scaleIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-orange-500 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">
                  {languageCode === 'bn' ? 'সম্প্রতি যোগ করা' : 'Recently Added'}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {routes.filter(route => {
                    const createdDate = new Date(route.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Overview */}
      {routes.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-pmColor/20 p-3 rounded-xl">
              <FaBus className="text-pmColor text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {languageCode === 'bn' ? 'রুট ওভারভিউ' : 'Route Overview'}
            </h3>
          </div>
          <div className="space-y-3">
            {routes.slice(0, 5).map((route) => (
              <div key={route.id} className="flex items-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center flex-1">
                  <span className="text-sm font-medium text-white bg-pmColor/20 px-2 py-1 rounded">
                    {route.name}
                  </span>
                  <span className="mx-3 text-white/70">🚩</span>
                  <span className="text-sm text-white">{route.start_point}</span>
                  <span className="mx-3 text-white/70">→</span>
                  <span className="text-sm text-white">{route.end_point}</span>
                  <span className="mx-3 text-white/70">🏁</span>
                </div>
              </div>
            ))}
            {routes.length > 5 && (
              <div className="text-center py-2">
                <span className="text-sm text-white/70">
                  {languageCode === 'bn' ? `এবং আরও ${routes.length - 5}টি রুট...` : `And ${routes.length - 5} more routes...`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAction}
        title={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'নতুন রুট নিশ্চিত করুন' : 'Confirm New Route')
            : modalAction === 'update'
            ? (languageCode === 'bn' ? 'রুট আপডেট নিশ্চিত করুন' : 'Confirm Route Update')
            : (languageCode === 'bn' ? 'রুট মুছে ফেলা নিশ্চিত করুন' : 'Confirm Route Deletion')
        }
        message={
          modalAction === 'create'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে নতুন রুট তৈরি করতে চান?' : 'Are you sure you want to create a new route?')
            : modalAction === 'update'
            ? (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে রুট আপডেট করতে চান?' : 'Are you sure you want to update this route?')
            : (languageCode === 'bn' ? 'আপনি কি নিশ্চিত যে এই রুটটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this route?')
        }
        confirmText={languageCode === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
        cancelText={languageCode === 'bn' ? 'বাতিল' : 'Cancel'}
        confirmButtonClass={modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-pmColor hover:bg-pmColor/80'}
      />
    </div>
  );
};

export default TransportRoutes;