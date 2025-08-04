import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaChevronDown, FaChevronUp, FaSpinner, FaLanguage } from 'react-icons/fa';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdCorporateFare, MdSchool, MdLocationOn, MdEmail, MdPhone, MdWeb, MdFacebook, MdAccountCircle } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select';
import { useCreateInstituteMutation, useUpdateInstituteMutation } from '../../redux/features/api/institute/instituteApi';
import { useGetInstituteTypesQuery } from '../../redux/features/api/institute/instituteTypeApi';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
<<<<<<< HEAD
import { languageCode, primaryColor, secondaryColor } from '../../utilitis/getTheme';
=======
import { primaryColor } from '../../utilitis/getTheme';
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1

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
  @keyframes slideDown {
    from { max-height: 0; opacity: 0; }
    to { max-height: 1000px; opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes iconHover {
    to { transform: scale(1.1); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out forwards;
  }
  .btn-glow:hover {
    box-shadow: 0 0 25px rgba(219, 158, 48, 0.5);
    transform: translateY(-2px);
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
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor});
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
    margin: 12px auto 0;
    border-radius: 2px;
  }
  .section-card {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  .section-header {
    // background: linear-gradient(90deg, rgba(219, 158, 48, 0.1), rgba(255, 107, 107, 0.1));
    border-radius: 12px;
    padding: 16px;
    margin: -24px -24px 16px -24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .input-group {
    position: relative;
    margin-bottom: 24px;
  }
  .input-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ffffff;
    transition: color 0.3s ease;
  }
  .required-label {
    color: #ff6b6b;
  }
  .input-field {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    padding: 14px 16px 14px 44px;
    border: 2px solid rgba(157, 144, 135, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
    font-size: 16px;
  }
  .input-field:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 0 3px rgba(219, 158, 48, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }
  .input-field::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  .input-icon-wrapper {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${primaryColor};
    font-size: 18px;
    transition: all 0.3s ease;
  }
  .language-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 10px 20px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .language-toggle:hover {
    background: rgba(219, 158, 48, 0.2);
    transform: scale(1.05);
  }
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${primaryColor};
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #fff;
  }
`;

// Custom React Select styles
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    background: 'rgba(255, 255, 255, 0.1)',
    border: `2px solid ${state.isFocused ? primaryColor : 'rgba(157, 144, 135, 0.3)'}`,
    borderRadius: '12px',
    minHeight: '52px',
    paddingLeft: '36px',
    boxShadow: state.isFocused ? `0 0 0 3px rgba(219, 158, 48, 0.1)` : 'none',
    '&:hover': {
      borderColor: primaryColor,
    },
  }),
  input: (provided) => ({
  ...provided,
  color: '#ffffff', 
  fontSize: '16px',
}),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffffff',
    fontSize: '16px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '16px',
  }),
  menuPortal: (base) => ({
  ...base,
  zIndex: 9999,
}),
  menu: (provided) => ({
    ...provided,
   background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected 
      ? primaryColor 
      : state.isFocused 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'transparent',
    color: '#ffffff',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
       background: secondaryColor,
    color: '#ffffff',
    },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: primaryColor,
    '&:hover': { 
      color: '#ffffff',
    },
  }),
};

const InstituteProfileForm = ({ institute, onSubmit, onCancel }) => {
  const { user, group_id } = useSelector((state) => state.auth);
<<<<<<< HEAD
  
=======
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
  const { data: instituteTypes, isLoading: isTypesLoading, error: typesError } = useGetInstituteTypesQuery();

  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false;

<<<<<<< HEAD
=======
  // Updated formData to match API schema
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
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

  // Options for React Select
  const genderTypeOptions = [
    { value: 'Combined', label: languageCode === 'bn' ? 'মিশ্র' : 'Combined' },
    { value: 'Boys', label: languageCode === 'bn' ? 'ছেলে' : 'Boys' },
    { value: 'Girls', label: languageCode === 'bn' ? 'মেয়ে' : 'Girls' },
  ];

  const statusOptions = [
    { value: 'Active', label: languageCode === 'bn' ? 'সক্রিয়' : 'Active' },
    { value: 'Inactive', label: languageCode === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive' },
  ];

  const instituteTypeOptions = instituteTypes?.map(type => ({
    value: type.id.toString(),
    label: type.name
  })) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData((prev) => ({ 
      ...prev, 
      [actionMeta.name]: selectedOption ? selectedOption.value : '' 
    }));
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleLanguage = () => {
    setLanguageCode(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredPermission = institute ? hasChangePermission : hasAddPermission;

    if (!requiredPermission) {
      toast.error(languageCode === 'bn' 
        ? `প্রতিষ্ঠান ${institute ? 'হালনাগাদ' : 'তৈরি'} করার অনুমতি নেই।`
        : `No permission to ${institute ? 'update' : 'create'} institute.`
      );
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
<<<<<<< HEAD
      if (institute) {
        await updateInstitute({ id: institute.id, ...payload }).unwrap();
        toast.success(languageCode === 'bn' 
          ? 'প্রতিষ্ঠান সফলভাবে হালনাগাদ করা হয়েছে!' 
          : 'Institute updated successfully!'
        );
      } else {
        await createInstitute(payload).unwrap();
        toast.success(languageCode === 'bn' 
          ? 'প্রতিষ্ঠান সফলভাবে তৈরি করা হয়েছে!' 
          : 'Institute created successfully!'
        );
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
      }

      console.log('Operation result:', result);
      toast.success(`প্রতিষ্ঠান সফলভাবে ${institute ? 'হালনাগাদ' : 'তৈরি'} করা হয়েছে!`);
      onSubmit();
    } catch (err) {
<<<<<<< HEAD
      console.error('Error response:', err);
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || 
        (languageCode === 'bn' ? 'অজানা ত্রুটি' : 'Unknown error');
      toast.error(languageCode === 'bn' 
        ? `প্রতিষ্ঠান সংরক্ষণ ব্যর্থ: ${errorMessage}`
        : `Failed to save institute: ${errorMessage}`
      );
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
    }
  };

  const isFormDisabled = permissionsLoading || isTypesLoading || typesError || 
    (institute && !hasChangePermission) || (!institute && !hasAddPermission);

  const InputField = ({ 
    icon: Icon, 
    label, 
    name, 
    type = 'text', 
    required = false, 
    placeholder, 
    value, 
    onChange, 
    disabled = false 
  }) => (
    <div className="input-group">
      <label htmlFor={name} className={`input-label ${required ? 'required-label' : ''}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative input-icon">
        <div className="input-icon-wrapper">
          <Icon />
        </div>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled || isFormDisabled}
          className="input-field"
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
    </div>
  );

  const SelectField = ({ 
    icon: Icon, 
    label, 
    name, 
    required = false, 
    placeholder, 
    value, 
    options, 
    onChange, 
    disabled = false 
  }) => (
    <div className="input-group">
      <label htmlFor={name} className={`input-label ${required ? 'required-label' : ''}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="input-icon-wrapper" style={{ zIndex: 10 }}>
          <Icon />
        </div>
        <Select
          name={name}
          value={options.find(option => option.value === value) || null}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          isDisabled={disabled || isFormDisabled}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen relative">
      <style>{customStyles}</style>
    

      <div className="mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 mb-12 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-4">
            <IoAddCircleOutline className="text-5xl text-pmColor mb-3" />
            <h2 className="text-4xl font-bold text-white title-underline text-center">
              {institute 
                ? (languageCode === 'bn' ? 'প্রতিষ্ঠান প্রোফাইল সম্পাদনা' : 'Edit Institute Profile')
                : (languageCode === 'bn' ? 'প্রতিষ্ঠান প্রোফাইল তৈরি' : 'Create Institute Profile')
              }
            </h2>
          </div>
        </div>

        {/* Loading and Error States */}
        {isTypesLoading && (
          <div className="text-center text-pmColor mb-6 animate-scaleIn text-lg">
            {languageCode === 'bn' ? 'প্রতিষ্ঠানের ধরন লোড হচ্ছে...' : 'Loading institute types...'}
          </div>
        )}
        {typesError && (
          <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-xl shadow-inner animate-fadeIn mb-6">
            {languageCode === 'bn' 
              ? `প্রতিষ্ঠানের ধরন লোড করতে ত্রুটি: ${typesError.data?.message || 'অজানা ত্রুটি'}`
              : `Error loading institute types: ${typesError.data?.message || 'Unknown error'}`
            }
          </div>
        )}

<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          {/* Basic Information */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center space-x-3">
                  <MdCorporateFare className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-white">
                    {languageCode === 'bn' ? 'মৌলিক তথ্য' : 'Basic Information'}
                  </h3>
                </div>
                {openSections.basic ? 
                  <FaChevronUp className="text-pmColor text-xl" /> : 
                  <FaChevronDown className="text-pmColor text-xl" />
                }
              </div>
            </div>
            
            {openSections.basic && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                <InputField
                  icon={MdCorporateFare}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Institute Name'}
                  name="institute_name"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রতিষ্ঠানের নাম লিখুন' : 'Enter institute name'}
                  value={formData.institute_name}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaBuilding}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠান আইডি' : 'Institute ID'}
                  name="institute_id"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রতিষ্ঠান আইডি লিখুন' : 'Enter institute ID'}
                  value={formData.institute_id}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaUser}
                  label={languageCode === 'bn' ? 'প্রধান শিক্ষকের নাম' : 'Headmaster Name'}
                  name="headmaster_name"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রধান শিক্ষকের নাম লিখুন' : 'Enter headmaster name'}
                  value={formData.headmaster_name}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdPhone}
                  label={languageCode === 'bn' ? 'প্রধান শিক্ষকের মোবাইল' : 'Headmaster Mobile'}
                  name="headmaster_mobile"
                  type="tel"
                  required
                  placeholder={languageCode === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Enter mobile number'}
                  value={formData.headmaster_mobile}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdLocationOn}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ঠিকানা' : 'Institute Address'}
                  name="institute_address"
                  placeholder={languageCode === 'bn' ? 'ঠিকানা লিখুন' : 'Enter address'}
                  value={formData.institute_address}
                  onChange={handleChange}
                />
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Institute Details */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('details')}
              >
                <div className="flex items-center space-x-3">
                  <MdSchool className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-white">
                    {languageCode === 'bn' ? 'প্রতিষ্ঠানের বিবরণ' : 'Institute Details'}
                  </h3>
                </div>
                {openSections.details ? 
                  <FaChevronUp className="text-pmColor text-xl" /> : 
                  <FaChevronDown className="text-pmColor text-xl" />
                }
              </div>
            </div>
            
            {openSections.details && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                <InputField
                  icon={MdEmail}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ইমেইল' : 'Institute Email'}
                  name="institute_email_address"
                  type="email"
                  placeholder={languageCode === 'bn' ? 'ইমেইল ঠিকানা লিখুন' : 'Enter email address'}
                  value={formData.institute_email_address}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'ইআইআইএন নম্বর' : 'EIIN Number'}
                  name="institute_eiin_no"
                  placeholder={languageCode === 'bn' ? 'ইআইআইএন নম্বর লিখুন' : 'Enter EIIN number'}
                  value={formData.institute_eiin_no}
                  onChange={handleChange}
                />
                
                <SelectField
                  icon={FaUser}
                  label={languageCode === 'bn' ? 'শিক্ষার্থীর ধরন' : 'Student Type'}
                  name="institute_gender_type"
                  placeholder={languageCode === 'bn' ? 'ধরন নির্বাচন করুন' : 'Select type'}
                  value={formData.institute_gender_type}
                  options={genderTypeOptions}
                  onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta)}
                />
                
                <SelectField
                  icon={MdSchool}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ধরন' : 'Institute Type'}
                  name="institute_type_id"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রতিষ্ঠানের ধরন নির্বাচন করুন' : 'Select institute type'}
                  value={formData.institute_type_id}
                  options={instituteTypeOptions}
                  onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta)}
                  disabled={isTypesLoading || typesError}
                />
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Online Information */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('online')}
              >
                <div className="flex items-center space-x-3">
                  <FaGlobe className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-white">
                    {languageCode === 'bn' ? 'অনলাইন তথ্য' : 'Online Information'}
                  </h3>
                </div>
                {openSections.online ? 
                  <FaChevronUp className="text-pmColor text-xl" /> : 
                  <FaChevronDown className="text-pmColor text-xl" />
                }
              </div>
            </div>
            
            {openSections.online && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                <InputField
                  icon={MdWeb}
                  label={languageCode === 'bn' ? 'ওয়েবসাইট' : 'Website'}
                  name="institute_web"
                  type="url"
                  placeholder={languageCode === 'bn' ? 'ওয়েবসাইট ইউআরএল লিখুন' : 'Enter website URL'}
                  value={formData.institute_web}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdWeb}
                  label={languageCode === 'bn' ? 'ব্যবস্থাপনা ওয়েবসাইট' : 'Management Website'}
                  name="institute_management_web"
                  type="url"
                  placeholder={languageCode === 'bn' ? 'ব্যবস্থাপনা ওয়েবসাইট ইউআরএল লিখুন' : 'Enter management website URL'}
                  value={formData.institute_management_web}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdFacebook}
                  label={languageCode === 'bn' ? 'ফেসবুক' : 'Facebook'}
                  name="institute_fb"
                  type="url"
                  placeholder={languageCode === 'bn' ? 'ফেসবুক ইউআরএল লিখুন' : 'Enter Facebook URL'}
                  value={formData.institute_fb}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaGlobe}
                  label={languageCode === 'bn' ? 'ইউটিউব' : 'YouTube'}
                  name="institute_youtube"
                  type="url"
                  placeholder={languageCode === 'bn' ? 'ইউটিউব ইউআরএল লিখুন' : 'Enter YouTube URL'}
                  value={formData.institute_youtube}
                  onChange={handleChange}
                />
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Manager Information */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('manager')}
              >
                <div className="flex items-center space-x-3">
                  <MdAccountCircle className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-white">
                    {languageCode === 'bn' ? 'ইনচার্জ ম্যানেজার' : 'Manager Information'}
                  </h3>
                </div>
                {openSections.manager ? 
                  <FaChevronUp className="text-pmColor text-xl" /> : 
                  <FaChevronDown className="text-pmColor text-xl" />
                }
              </div>
            </div>
            
            {openSections.manager && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                <InputField
                  icon={FaUser}
                  label={languageCode === 'bn' ? 'ইনচার্জ ম্যানেজার' : 'Manager Name'}
                  name="incharge_manager"
                  placeholder={languageCode === 'bn' ? 'ম্যানেজারের নাম লিখুন' : 'Enter manager name'}
                  value={formData.incharge_manager}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdEmail}
                  label={languageCode === 'bn' ? 'ম্যানেজারের ইমেইল' : 'Manager Email'}
                  name="incharge_manager_email"
                  type="email"
                  placeholder={languageCode === 'bn' ? 'ম্যানেজারের ইমেইল লিখুন' : 'Enter manager email'}
                  value={formData.incharge_manager_email}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdPhone}
                  label={languageCode === 'bn' ? 'ম্যানেজারের মোবাইল' : 'Manager Mobile'}
                  name="incharge_manager_mobile"
                  type="tel"
                  placeholder={languageCode === 'bn' ? 'ম্যানেজারের মোবাইল লিখুন' : 'Enter manager mobile'}
                  value={formData.incharge_manager_mobile}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('additional')}
              >
                <div className="flex items-center space-x-3">
                  <FaInfoCircle className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-white">
                    {languageCode === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Information'}
                  </h3>
                </div>
                {openSections.additional ? 
                  <FaChevronUp className="text-pmColor text-xl" /> : 
                  <FaChevronDown className="text-pmColor text-xl" />
                }
              </div>
            </div>
            
            {openSections.additional && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideDown">
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'দৃষ্টিভঙ্গি শিরোনাম' : 'Vision Heading'}
                  name="institute_v_heading"
                  placeholder={languageCode === 'bn' ? 'দৃষ্টিভঙ্গি শিরোনাম লিখুন' : 'Enter vision heading'}
                  value={formData.institute_v_heading}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'স্বাক্ষর' : 'Signature'}
                  name="signature"
                  placeholder={languageCode === 'bn' ? 'স্বাক্ষর লিখুন' : 'Enter signature'}
                  value={formData.signature}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'শিক্ষা বোর্ড আইডি' : 'Education Board ID'}
                  name="education_board_id"
                  placeholder={languageCode === 'bn' ? 'বোর্ড আইডি লিখুন' : 'Enter board ID'}
                  value={formData.education_board_id}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'শিক্ষা জেলা আইডি' : 'Education District ID'}
                  name="education_district_id"
                  placeholder={languageCode === 'bn' ? 'জেলা আইডি লিখুন' : 'Enter district ID'}
                  value={formData.education_district_id}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'শিক্ষা বিভাগ আইডি' : 'Education Division ID'}
                  name="education_division_id"
                  placeholder={languageCode === 'bn' ? 'বিভাগ আইডি লিখুন' : 'Enter division ID'}
                  value={formData.education_division_id}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'শিক্ষা থানা আইডি' : 'Education Thana ID'}
                  name="education_thana_id"
                  placeholder={languageCode === 'bn' ? 'থানা আইডি লিখুন' : 'Enter thana ID'}
                  value={formData.education_thana_id}
                  onChange={handleChange}
                />
=======
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
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Status */}
          <div className="section-card p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SelectField
                icon={FaInfoCircle}
                label={languageCode === 'bn' ? 'স্থিতি' : 'Status'}
                name="status"
                placeholder={languageCode === 'bn' ? 'স্থিতি নির্বাচন করুন' : 'Select status'}
                value={formData.status}
                options={statusOptions}
                onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-6 pt-8">
=======
          {/* বোতাম */}
          <div className="text-center space-x-4">
>>>>>>> 3a1dae982768cf0c91532f47f02239384e0189c1
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ripple inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 animate-scaleIn btn-glow"
              title={languageCode === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            >
              {languageCode === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              disabled={isFormDisabled || isCreating || isUpdating}
              className={`btn btn-ripple inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-pmColor hover:bg-yellow-600 text-white transition-all duration-300 animate-scaleIn ${
                isFormDisabled || isCreating || isUpdating 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'btn-glow'
              }`}
              title={institute 
                ? (languageCode === 'bn' ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'Update Institute')
                : (languageCode === 'bn' ? 'প্রতিষ্ঠান তৈরি করুন' : 'Create Institute')
              }
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{languageCode === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                </span>
              ) : (
                <span>
                  {institute 
                    ? (languageCode === 'bn' ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'Update Institute')
                    : (languageCode === 'bn' ? 'প্রতিষ্ঠান তৈরি করুন' : 'Create Institute')
                  }
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfileForm;