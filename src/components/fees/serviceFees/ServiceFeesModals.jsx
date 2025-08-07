// components/ServiceFeesModals.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import { FaSpinner, FaBus, FaHome, FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetGfeeSubheadsQuery } from '../../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useCreateFeesNameMutation, useUpdateFeesNameMutation, useDeleteFeesNameMutation } from '../../../redux/features/api/fees-name/feesName';

const ServiceFeesModals = ({
  isModalOpen,
  setIsModalOpen,
  isUpdateModalOpen,
  setIsUpdateModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedFee,
  setSelectedFee,
  configurations,
  setConfigurations,
  selectedServiceType,
  serviceTypes,
  getServiceFlags,
  isSubmitting,
  setIsSubmitting,
  hasAddPermission,
  hasChangePermission,
  hasDeletePermission
}) => {
  const { user } = useSelector((state) => state.auth);
  const [updateForm, setUpdateForm] = useState({
    fees_title: '',
    startdate: '',
    enddate: '',
    is_hostel_fee: false,
    is_transport_fee: false,
    is_coaching_fee: false,
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});

  // RTK Query hooks
  const { data: academicYears } = useGetAcademicYearApiQuery();
  const { data: feeSubheads } = useGetGfeeSubheadsQuery();
  const [createFeesName, { error: submitError }] = useCreateFeesNameMutation();
  const [updateFeesName, { error: updateError }] = useUpdateFeesNameMutation();
  const [deleteFeesName, { error: deleteError }] = useDeleteFeesNameMutation();

  // Initialize update form when modal opens
  const initializeUpdateForm = (fee) => {
    setUpdateForm({
      fees_title: fee.fees_title,
      startdate: format(new Date(fee.startdate), 'yyyy-MM-dd'),
      enddate: format(new Date(fee.enddate), 'yyyy-MM-dd'),
      is_hostel_fee: fee.is_hostel_fee || false,
      is_transport_fee: fee.is_transport_fee || false,
      is_coaching_fee: fee.is_coaching_fee || false,
      status: fee.status,
    });
  };

  // Set selected fee and initialize form
  const handleSetSelectedFee = (fee) => {
    setSelectedFee(fee);
    initializeUpdateForm(fee);
  };

  // Validate dates before submission
  const validateDates = () => {
    const invalidConfigs = configurations.filter(
      (config) => !config.startDate || !config.endDate
    );
    if (invalidConfigs.length > 0) {
      toast.error('সকল কনফিগারেশনের জন্য শুরুর এবং শেষের তারিখ নির্বাচন করুন।');
      return false;
    }
    return true;
  };

  // Submit configurations to API (Create)
  const handleSubmit = async () => {
    if (!hasAddPermission) {
      toast.error('ফি কনফিগারেশন জমা দেওয়ার অনুমতি নেই।');
      return;
    }
    
    if (!validateDates()) {
      return;
    }

    setIsSubmitting(true);
    try {
      for (const config of configurations) {
        const academicYearName = academicYears?.find((y) => y.id === parseInt(config.academicYear))?.name || 'Unknown';
        // Modified fee title generation: Service + Subhead + Academic Year
        const feesTitle = `${config.serviceLabel} ${config.subheadName} ${academicYearName}`.replace(/\s+/g, ' ').trim();
        
        const payload = {
        //   fee_amount_id: null, // Set to null as per requirement
          fees_title: feesTitle,
          status: 'ACTIVE',
          startdate: format(new Date(config.startDate), 'yyyy-MM-dd'),
          enddate: format(new Date(config.endDate), 'yyyy-MM-dd'),
          is_hostel_fee: config.is_hostel_fee,
          is_transport_fee: config.is_transport_fee,
          is_coaching_fee: config.is_coaching_fee,
          fees_sub_type: config.subheadId,
          academic_year: parseInt(config.academicYear),
          created_by: user?.id || 1,
          updated_by: null,
        };
        await createFeesName(payload).unwrap();
      }
      toast.success('সার্ভিস ফি কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
      setConfigurations([]);
      setErrors({});
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`সংরক্ষণ ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update form change
  const handleUpdateFormChange = (field, value) => {
    if (!hasChangePermission) {
      toast.error('ফি কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validate update form
  const validateUpdateForm = () => {
    const newErrors = {};
    if (!updateForm.fees_title) newErrors.fees_title = 'ফি টাইটেল প্রয়োজন';
    if (!updateForm.startdate) newErrors.startdate = 'শুরুর তারিখ প্রয়োজন';
    if (!updateForm.enddate) newErrors.enddate = 'শেষের তারিখ প্রয়োজন';
    return Object.keys(newErrors).length ? newErrors : null;
  };

  // Submit update to API
  const handleUpdateSubmit = async () => {
    if (!hasChangePermission) {
      toast.error('ফি কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    
    const validationErrors = validateUpdateForm();
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: selectedFee.id,
        fee_amount_id: null, // Set to null as per requirement
        fees_title: updateForm.fees_title,
        status: updateForm.status,
        startdate: updateForm.startdate,
        enddate: updateForm.enddate,
        is_hostel_fee: updateForm.is_hostel_fee,
        is_transport_fee: updateForm.is_transport_fee,
        is_coaching_fee: updateForm.is_coaching_fee,
        fees_sub_type: selectedFee.fees_sub_type,
        academic_year: selectedFee.academic_year,
        created_by: selectedFee.created_by,
        updated_by: user?.id || 1,
      };
      await updateFeesName(payload).unwrap();
      toast.success('সার্ভিস ফি কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
      setIsUpdateModalOpen(false);
      setSelectedFee(null);
      setUpdateForm({
        fees_title: '',
        startdate: '',
        enddate: '',
        is_hostel_fee: false,
        is_transport_fee: false,
        is_coaching_fee: false,
        status: 'ACTIVE',
      });
      setErrors({});
    } catch (error) {
      toast.error(`আপডেট ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit delete to API
  const handleDeleteSubmit = async () => {
    if (!hasDeletePermission) {
      toast.error('ফি কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteFeesName(selectedFee.id).unwrap();
      toast.success('সার্ভিস ফি কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
      setIsDeleteModalOpen(false);
      setSelectedFee(null);
    } catch (error) {
      toast.error(`মুছে ফেলা ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (key) => {
    switch(key) {
      case 'hostel': return FaHome;
      case 'transport': return FaBus;
      case 'coaching': return FaGraduationCap;
      default: return FaHome;
    }
  };

  return (
    <>
      {/* Create Confirmation Modal */}
      {hasAddPermission && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-[#441a05]backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05]mb-4">সার্ভিস ফি কনফিগারেশন জমা নিশ্চিত করুন</h3>
            <p className="text-[#441a05]mb-6">আপনি কি নিশ্চিত যে নির্বাচিত সার্ভিস ফি কনফিগারেশনগুলি জমা দিতে চান?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05]rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-pmColor text-[#441a05]rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-[#441a05]'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>জমা হচ্ছে...</span>
                  </span>
                ) : (
                  'নিশ্চিত করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {hasChangePermission && isUpdateModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-[#441a05]backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05]mb-4">সার্ভিস ফি কনফিগারেশন আপডেট করুন</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#441a05]font-medium">ফি টাইটেল</label>
                <input
                  type="text"
                  value={updateForm.fees_title}
                  onChange={(e) => handleUpdateFormChange('fees_title', e.target.value)}
                  className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.fees_title && <p className="text-red-400 text-sm mt-1">{errors.fees_title}</p>}
              </div>
              <div>
                <label className="text-[#441a05]font-medium">শুরুর তারিখ</label>
                <input
                  type="date"
                  value={updateForm.startdate}
                  onChange={(e) => handleUpdateFormChange('startdate', e.target.value)}
                  className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.startdate && <p className="text-red-400 text-sm mt-1">{errors.startdate}</p>}
              </div>
              <div>
                <label className="text-[#441a05]font-medium">শেষের তারিখ</label>
                <input
                  type="date"
                  value={updateForm.enddate}
                  onChange={(e) => handleUpdateFormChange('enddate', e.target.value)}
                  className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.enddate && <p className="text-red-400 text-sm mt-1">{errors.enddate}</p>}
              </div>
              <div>
                <label className="text-[#441a05]font-medium mb-2 block">সার্ভিস ধরন</label>
                <div className="flex space-x-2">
                  {serviceTypes.map((service) => {
                    const IconComponent = getIcon(service.key);
                    const isSelected = 
                      (service.key === 'hostel' && updateForm.is_hostel_fee) ||
                      (service.key === 'transport' && updateForm.is_transport_fee) ||
                      (service.key === 'coaching' && updateForm.is_coaching_fee);
                    
                    return (
                      <button
                        key={service.key}
                        type="button"
                        onClick={() => {
                          const flags = getServiceFlags(service.key);
                          handleUpdateFormChange('is_hostel_fee', flags.is_hostel_fee);
                          handleUpdateFormChange('is_transport_fee', flags.is_transport_fee);
                          handleUpdateFormChange('is_coaching_fee', flags.is_coaching_fee);
                        }}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                          isSelected
                            ? `${service.color} text-[#441a05]`
                            : 'bg-gray-500/20 text-[#441a05]hover:bg-gray-500/30'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-1" />
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[#441a05]font-medium">স্ট্যাটাস</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => handleUpdateFormChange('status', e.target.value)}
                  className="w-full bg-transparent text-[#441a05]pl-3 py-2 border border-[#9d9087] rounded-lg"
                >
                  <option value="ACTIVE">সক্রিয়</option>
                  <option value="INACTIVE">নিষ্ক্রিয়</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05]rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-pmColor text-[#441a05]rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-[#441a05]'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  'আপডেট নিশ্চিত করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {hasDeletePermission && isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-[#441a05]backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-[#441a05]/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05]mb-4">সার্ভিস ফি কনফিগারেশন মুছে ফেলুন</h3>
            <p className="text-[#441a05]mb-6">আপনি কি নিশ্চিত যে সার্ভিস ফি কনফিগারেশন "{selectedFee?.fees_title}" মুছে ফেলতে চান?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05]rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-red-500 text-[#441a05]rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:bg-red-600'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </span>
                ) : (
                  'মুছে ফেলুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(submitError || updateError || deleteError) && (
        <div className="fixed bottom-4 right-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn z-50">
          ত্রুটি: {(submitError || updateError || deleteError)?.status || 'অজানা'} - {JSON.stringify((submitError || updateError || deleteError)?.data || {})}
        </div>
      )}
    </>
  );
};

export default ServiceFeesModals;