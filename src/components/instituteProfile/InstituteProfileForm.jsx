import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';
import { IoAddCircleOutline } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import { useCreateInstituteMutation, useUpdateInstituteMutation } from '../../redux/features/api/institute/instituteApi';
import { useGetInstituteTypesQuery } from '../../redux/features/api/institute/instituteTypeApi';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { primaryColor } from '../../utilitis/getTheme';

// Custom CSS for animations and styling
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes iconHover {
    to { transform: scale(1.1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  .btn-glow:hover {
    box-shadow: 0 0 20px rgba(219, 158, 48, 0.4);
  }
  .input-icon:hover svg {
    animation: iconHover 0.3s ease-out forwards;
  }
  .btn-ripple {
    position: relative;
    overflow: hidden;
  }
  .btn-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1);
    transform-origin: 50% 50%;
    animation: none;
  }
  .btn-ripple:active::after {
    animation: ripple 0.6s ease-out;
  }
  .title-underline::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: ${primaryColor};
    margin: 8px auto 0;
  }
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #9d9087;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #fff;
  }
`;

const InstituteProfileForm = ({ institute, onSubmit, onCancel }) => {
  const { user, group_id } = useSelector((state) => state.auth);
  const { data: instituteTypes, isLoading: isTypesLoading, error: typesError } = useGetInstituteTypesQuery();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false;

  // Updated formData to match API schema
  const [formData, setFormData] = useState({
    institute_id: institute?.institute_id || '',
    institute_english_name: institute?.institute_english_name || '', // Updated field name
    institute_Bangla_name: institute?.institute_Bangla_name || institute?.institute_name || '', // Updated field name
    institute_gender_type: institute?.institute_gender_type || 'Combined',
    institute_type_id: institute?.institute_type?.id?.toString() || '',
    status: institute?.status || 'Active',
    institute_address: institute?.institute_address || '',
    institute_email_address: institute?.institute_email_address || '',
    institute_eiin_no: institute?.institute_eiin_no || '',
    institute_web: institute?.institute_web || '',
    institute_management_web: institute?.institute_management_web || '',
    institute_fb: institute?.institute_fb || '',
    institute_youtube: institute?.institute_youtube || '',
    institute_v_heading: institute?.institute_v_heading || '',
  });

  // Separate state for file handling
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(institute?.institute_logo || null);

  const [openSections, setOpenSections] = useState({
    basic: true,
    details: true,
    online: true,
    additional: true,
  });

  const [createInstitute, { isLoading: isCreating }] = useCreateInstituteMutation();
  const [updateInstitute, { isLoading: isUpdating }] = useUpdateInstituteMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('শুধুমাত্র JPG, PNG বা GIF ফাইল আপলোড করুন।');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('ফাইলের আকার ৫ MB এর চেয়ে কম হতে হবে।');
        return;
      }

      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(institute?.institute_logo || null);
    // Reset file input
    const fileInput = document.getElementById('institute_logo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine required permission based on whether we are creating or updating
    const requiredPermission = institute ? hasChangePermission : hasAddPermission;
    const actionType = institute ? 'হালনাগাদ' : 'তৈরি';

    if (!requiredPermission) {
      toast.error(`প্রতিষ্ঠান ${actionType} করার অনুমতি নেই।`);
      return;
    }

    // Validate required fields
    if (!formData.institute_id.trim()) {
      toast.error('প্রতিষ্ঠান আইডি আবশ্যক।');
      return;
    }
    if (!formData.institute_Bangla_name.trim()) {
      toast.error('প্রতিষ্ঠানের বাংলা নাম আবশ্যক।');
      return;
    }
    if (!formData.institute_english_name.trim()) {
      toast.error('প্রতিষ্ঠানের ইংরেজি নাম আবশ্যক।');
      return;
    }
    if (!formData.institute_type_id) {
      toast.error('প্রতিষ্ঠানের ধরন নির্বাচন করুন।');
      return;
    }

    try {
      let result;
      
      if (logoFile) {
        // If there's a logo file, use FormData
        const payload = new FormData();
        
        // Add all required fields
        payload.append('institute_type_id', formData.institute_type_id);
        payload.append('institute_id', formData.institute_id.trim());
        payload.append('institute_english_name', formData.institute_english_name.trim());
        payload.append('institute_Bangla_name', formData.institute_Bangla_name.trim());
        payload.append('institute_gender_type', formData.institute_gender_type);
        payload.append('status', formData.status);
        
        // Add optional fields only if they have values
        if (formData.institute_eiin_no.trim()) {
          payload.append('institute_eiin_no', formData.institute_eiin_no.trim());
        }
        if (formData.institute_email_address.trim()) {
          payload.append('institute_email_address', formData.institute_email_address.trim());
        }
        if (formData.institute_address.trim()) {
          payload.append('institute_address', formData.institute_address.trim());
        }
        if (formData.institute_web.trim()) {
          payload.append('institute_web', formData.institute_web.trim());
        }
        if (formData.institute_management_web.trim()) {
          payload.append('institute_management_web', formData.institute_management_web.trim());
        }
        if (formData.institute_youtube.trim()) {
          payload.append('institute_youtube', formData.institute_youtube.trim());
        }
        if (formData.institute_fb.trim()) {
          payload.append('institute_fb', formData.institute_fb.trim());
        }
        if (formData.institute_v_heading.trim()) {
          payload.append('institute_v_heading', formData.institute_v_heading.trim());
        }

        // Add logo file
        payload.append('institute_logo', logoFile);

        // Log payload for debugging
        console.log('Submitting FormData with file:', logoFile.name);
        for (let [key, value] of payload.entries()) {
          console.log(key, value);
        }

        if (institute) {
          result = await updateInstitute({ id: institute.id, formData: payload }).unwrap();
        } else {
          result = await createInstitute(payload).unwrap();
        }
      } else {
        // If no logo file, use JSON payload
        const payload = {
          institute_type_id: parseInt(formData.institute_type_id),
          institute_id: formData.institute_id.trim(),
          institute_english_name: formData.institute_english_name.trim(),
          institute_Bangla_name: formData.institute_Bangla_name.trim(),
          institute_gender_type: formData.institute_gender_type,
          status: formData.status,
        };

        // Add optional fields only if they have values
        if (formData.institute_eiin_no.trim()) {
          payload.institute_eiin_no = formData.institute_eiin_no.trim();
        }
        if (formData.institute_email_address.trim()) {
          payload.institute_email_address = formData.institute_email_address.trim();
        }
        if (formData.institute_address.trim()) {
          payload.institute_address = formData.institute_address.trim();
        }
        if (formData.institute_web.trim()) {
          payload.institute_web = formData.institute_web.trim();
        }
        if (formData.institute_management_web.trim()) {
          payload.institute_management_web = formData.institute_management_web.trim();
        }
        if (formData.institute_youtube.trim()) {
          payload.institute_youtube = formData.institute_youtube.trim();
        }
        if (formData.institute_fb.trim()) {
          payload.institute_fb = formData.institute_fb.trim();
        }
        if (formData.institute_v_heading.trim()) {
          payload.institute_v_heading = formData.institute_v_heading.trim();
        }

        // Log payload for debugging
        console.log('Submitting JSON payload:', payload);

        if (institute) {
          result = await updateInstitute({ id: institute.id, ...payload }).unwrap();
        } else {
          result = await createInstitute(payload).unwrap();
        }
      }

      console.log('Operation result:', result);
      toast.success(`প্রতিষ্ঠান সফলভাবে ${institute ? 'হালনাগাদ' : 'তৈরি'} করা হয়েছে!`);
      onSubmit();
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error status:', err.status);
      console.error('Error data:', err.data);
      
      // More detailed error handling
      let errorMessage = 'অজানা ত্রুটি';
      
      if (err.data) {
        if (typeof err.data === 'string') {
          errorMessage = err.data;
        } else if (err.data.message) {
          errorMessage = err.data.message;
        } else if (err.data.error) {
          errorMessage = err.data.error;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.non_field_errors) {
          errorMessage = err.data.non_field_errors.join(', ');
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.keys(err.data).forEach(field => {
            if (Array.isArray(err.data[field])) {
              fieldErrors.push(`${field}: ${err.data[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${err.data[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(`প্রতিষ্ঠান সংরক্ষণ ব্যর্থ: ${errorMessage}`);
    }
  };

  const isFormDisabled = permissionsLoading || isTypesLoading || typesError || (institute && !hasChangePermission) || (!institute && !hasAddPermission);

  return (
    <div className="py-10 w-full min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        <div className="sticky top-0 z-10 mb-8 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-3">
            <IoAddCircleOutline className="text-4xl text-pmColor mb-3" />
            <h2 className="text-3xl font-bold text-white title-underline">
              {institute ? 'প্রতিষ্ঠান প্রোফাইল সম্পাদনা' : 'প্রতিষ্ঠান প্রোফাইল তৈরি'}
            </h2>
          </div>
        </div>

        {isTypesLoading && (
          <div className="text-center text-[#9d9087] mb-4 animate-scaleIn">প্রতিষ্ঠানের ধরন লোড হচ্ছে...</div>
        )}
        {typesError && (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn">
            প্রতিষ্ঠানের ধরন লোড করতে ত্রুটি: {typesError.data?.message || 'অজানা ত্রুটি'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl animate-fadeIn space-y-10">
          {/* মৌলিক তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('basic')}>
              <div className="flex items-center">
                <FaBuilding className="text-3xl text-pmColor mr-2" />
                <h3 className="text-2xl font-semibold text-white">মৌলিক তথ্য</h3>
              </div>
              {openSections.basic ? <FaChevronUp className="text-pmColor" /> : <FaChevronDown className="text-pmColor" />}
            </div>
            {openSections.basic && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_Bangla_name" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠানের নাম (বাংলা) <span className="text-red-600">*</span>
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_Bangla_name"
                    name="institute_Bangla_name"
                    value={formData.institute_Bangla_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠানের বাংলা নাম লিখুন"
                    aria-label="প্রতিষ্ঠানের বাংলা নাম"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_english_name" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-red-600">*</span>
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_english_name"
                    name="institute_english_name"
                    value={formData.institute_english_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠানের ইংরেজি নাম লিখুন"
                    aria-label="প্রতিষ্ঠানের ইংরেজি নাম"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_id" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠান আইডি <span className="text-red-600">*</span>
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_id"
                    name="institute_id"
                    value={formData.institute_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠান আইডি লিখুন"
                    aria-label="প্রতিষ্ঠান আইডি"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_logo" className="block text-lg font-medium text-white">
                    প্রতিষ্ঠানের লোগো
                  </label>
                  <div className="mt-1">
                    {logoPreview && (
                      <div className="mb-3 relative inline-block">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="w-20 h-20 object-cover rounded-lg border-2 border-pmColor"
                        />
                        <button
                          type="button"
                          onClick={removeLogoFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          title="লোগো সরান"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-[14px] text-pmColor z-10" />
                      <input
                        type="file"
                        id="institute_logo"
                        name="institute_logo"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        className="block w-full bg-white/10 text-white pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pmColor file:text-white hover:file:bg-pmColor/80"
                        disabled={isFormDisabled}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      JPG, PNG বা GIF ফাইল (সর্বোচ্চ ৫MB)
                    </p>
                  </div>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_address" className="block text-lg font-medium text-white">
                    প্রতিষ্ঠানের ঠিকানা
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_address"
                    name="institute_address"
                    value={formData.institute_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ঠিকানা লিখুন"
                    aria-label="প্রতিষ্ঠানের ঠিকানা"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* প্রতিষ্ঠানের বিবরণ */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('details')}>
              <div className="flex items-center">
                <FaInfoCircle className="text-3xl text-pmColor mr-2" />
                <h3 className="text-2xl font-semibold text-white">প্রতিষ্ঠানের বিবরণ</h3>
              </div>
              {openSections.details ? <FaChevronUp className="text-pmColor" /> : <FaChevronDown className="text-pmColor" />}
            </div>
            {openSections.details && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_email_address" className="block text-lg font-medium text-white">
                    প্রতিষ্ঠানের ইমেইল
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="email"
                    id="institute_email_address"
                    name="institute_email_address"
                    value={formData.institute_email_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইমেইল ঠিকানা লিখুন"
                    aria-label="প্রতিষ্ঠানের ইমেইল"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_eiin_no" className="block text-lg font-medium text-white">
                    ইআইআইএন নম্বর
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_eiin_no"
                    name="institute_eiin_no"
                    value={formData.institute_eiin_no}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইআইআইএন নম্বর লিখুন"
                    aria-label="ইআইআইএন নম্বর"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_gender_type" className="block text-lg font-medium text-white">
                    শিক্ষার্থীর ধরন
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="institute_gender_type"
                    name="institute_gender_type"
                    value={formData.institute_gender_type}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    aria-label="প্রতিষ্ঠানের ধরন"
                    disabled={isFormDisabled}
                  >
                    <option value="Combined">মিশ্র</option>
                    <option value="Boys">ছেলে</option>
                    <option value="Girls">মেয়ে</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_type_id" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠানের ধরন <span className="text-red-600">*</span>
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="institute_type_id"
                    name="institute_type_id"
                    value={formData.institute_type_id}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled || isTypesLoading || typesError}
                    className="mt-1 block w-full bg-white/10 text-white pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠানের ধরন নির্বাচন করুন"
                    aria-label="প্রতিষ্ঠানের ধরন"
                  >
                    <option value="">প্রতিষ্ঠানের ধরন নির্বাচন করুন</option>
                    {instituteTypes?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* অনলাইন উপস্থিতি */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('online')}>
              <div className="flex items-center">
                <FaGlobe className="text-3xl text-pmColor mr-2" />
                <h3 className="text-2xl font-semibold text-white">অনলাইন তথ্য</h3>
              </div>
              {openSections.online ? <FaChevronUp className="text-pmColor" /> : <FaChevronDown className="text-pmColor" />}
            </div>
            {openSections.online && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_web" className="block text-lg font-medium text-white">
                    ওয়েবসাইট
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="url"
                    id="institute_web"
                    name="institute_web"
                    value={formData.institute_web}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ওয়েবসাইট ইউআরএল লিখুন"
                    aria-label="ওয়েবসাইট"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_management_web" className="block text-lg font-medium text-white">
                    ব্যবস্থাপনা ওয়েবসাইট
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="url"
                    id="institute_management_web"
                    name="institute_management_web"
                    value={formData.institute_management_web}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ব্যবস্থাপনা ওয়েবসাইট ইউআরএল লিখুন"
                    aria-label="ব্যবস্থাপনা ওয়েবসাইট"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_fb" className="block text-lg font-medium text-white">
                    ফেসবুক
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="url"
                    id="institute_fb"
                    name="institute_fb"
                    value={formData.institute_fb}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ফেসবুক ইউআরএল লিখুন"
                    aria-label="ফেসবুক"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_youtube" className="block text-lg font-medium text-white">
                    ইউটিউব
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="url"
                    id="institute_youtube"
                    name="institute_youtube"
                    value={formData.institute_youtube}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইউটিউব ইউআরএল লিখুন"
                    aria-label="ইউটিউব"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* অতিরিক্ত তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('additional')}>
              <div className="flex items-center">
                <FaInfoCircle className="text-3xl text-pmColor mr-2" />
                <h3 className="text-2xl font-semibold text-white">অতিরিক্ত তথ্য</h3>
              </div>
              {openSections.additional ? <FaChevronUp className="text-pmColor" /> : <FaChevronDown className="text-pmColor" />}
            </div>
            {openSections.additional && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_v_heading" className="block text-lg font-medium text-white">
                    দৃষ্টিভঙ্গি শিরোনাম
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="institute_v_heading"
                    name="institute_v_heading"
                    value={formData.institute_v_heading}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white placeholder-white/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="দৃষ্টিভঙ্গি শিরোনাম লিখুন"
                    aria-label="দৃষ্টিভঙ্গি শিরোনাম"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="status" className="block text-lg font-medium text-white">
                    স্থিতি
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-white pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300"
                    aria-label="স্থিতি"
                    disabled={isFormDisabled}
                  >
                    <option value="Active">সক্রিয়</option>
                    <option value="Inactive">নিষ্ক্রিয়</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* বোতাম */}
          <div className="text-center space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-[#9d9087] text-white transition-all duration-200 animate-scaleIn btn-glow"
              title="বাতিল করুন"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isFormDisabled || isCreating || isUpdating}
              className={`btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-pmColor text-white transition-all duration-200 animate-scaleIn ${isFormDisabled || isCreating || isUpdating ? 'opacity-50 cursor-not-allowed' : 'btn-glow'}`}
              title={institute ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'প্রতিষ্ঠান তৈরি করুন'}
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </span>
              ) : (
                <span>{institute ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'প্রতিষ্ঠান তৈরি করুন'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfileForm;