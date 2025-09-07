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
import { languageCode, primaryColor, secondaryColor } from '../../utilitis/getTheme';

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
    color: #441a05fff;
    transition: color 0.3s ease;
  }
  .required-label {
    color: #ff6b6b;
  }
  .input-field {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    color: #441a05fff;
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
    color: [#441a05];
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
    background: #441a05;
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
  color: '#441a05fff', 
  fontSize: '16px',
}),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#441a05fff',
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
    color: '#441a05fff',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
       background: secondaryColor,
    color: '#441a05fff',
    },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: primaryColor,
    '&:hover': { 
      color: '#441a05fff',
    },
  }),
};

const InstituteProfileForm = ({ institute, onSubmit, onCancel }) => {
  const { user, group_id } = useSelector((state) => state.auth);
  
  const { data: instituteTypes, isLoading: isTypesLoading, error: typesError } = useGetInstituteTypesQuery();

  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false;

  const [formData, setFormData] = useState({
    institute_id: institute?.institute_id || '',
    institute_english_name: institute?.institute_english_name || '',
    institute_Bangla_name: institute?.institute_Bangla_name || '',
    institute_gender_type: institute?.institute_gender_type || 'Combined',
    institute_type: institute?.institute_type?.id?.toString() || '',
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
  
  // State for vision heading file
  const [vHeadingFile, setVHeadingFile] = useState(null);
  const [vHeadingPreview, setVHeadingPreview] = useState(institute?.institute_v_heading || null);

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

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData((prev) => ({ 
      ...prev, 
      [actionMeta.name]: selectedOption ? selectedOption.value : '' 
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add handler for vision heading file
  const handleVHeadingChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVHeadingFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVHeadingPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    if (!formData.institute_type) {
      toast.error('প্রতিষ্ঠানের ধরন নির্বাচন করুন।');
      return;
    }

    try {
      let payload;
      
      // Check if we have files to upload
      if (logoFile || vHeadingFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.keys(formData).forEach(key => {
          if (formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        });

        // Append logo file if exists
        if (logoFile) {
          formDataToSend.append('institute_logo', logoFile);
        }
        
        // Append vision heading file if exists
        if (vHeadingFile) {
          formDataToSend.append('institute_v_heading', vHeadingFile);
        }
        
        payload = formDataToSend;
      } else {
        // Use regular JSON for text-only data
        payload = { ...formData };
        // Remove empty fields
        Object.keys(payload).forEach(key => {
          if (payload[key] === '') {
            delete payload[key];
          }
        });
      }

      let result;
      if (institute) {
        if (logoFile || vHeadingFile) {
          result = await updateInstitute({ id: institute.id, formData: payload }).unwrap();
        } else {
          result = await updateInstitute({ id: institute.id, ...payload }).unwrap();
        }
        toast.success(languageCode === 'bn' 
          ? 'প্রতিষ্ঠান সফলভাবে হালনাগাদ করা হয়েছে!' 
          : 'Institute updated successfully!'
        );
      } else {
        result = await createInstitute(payload).unwrap();
        toast.success(languageCode === 'bn' 
          ? 'প্রতিষ্ঠান সফলভাবে তৈরি করা হয়েছে!' 
          : 'Institute created successfully!'
        );
      }

      console.log('Operation result:', result);
      onSubmit();
    } catch (err) {
      console.error('Error response:', err);
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || 
        (languageCode === 'bn' ? 'অজানা ত্রুটি' : 'Unknown error');
      toast.error(languageCode === 'bn' 
        ? `প্রতিষ্ঠান সংরক্ষণ ব্যর্থ: ${errorMessage}`
        : `Failed to save institute: ${errorMessage}`
      );
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

  const FileInputField = ({ 
    icon: Icon, 
    label, 
    name, 
    required = false, 
    onChange, 
    disabled = false,
    preview
  }) => (
    <div className="input-group">
      <label htmlFor={name} className={`input-label ${required ? 'required-label' : ''}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative input-icon border-2 border-gray-400 border-opacity-50 rounded-xl ">
        <div className="input-icon-wrapper">
          <Icon />
        </div>
        <input
          type="file"
          id={name}
          name={name}
          onChange={onChange}
          disabled={disabled || isFormDisabled}
          className="py-1 pl-10"
          accept="image/*"
          aria-label={label}
        />
      </div>
      {preview && (
        <div className="mt-2">
          <img 
            src={preview} 
            alt="Logo preview" 
            className="w-20 h-20 object-contain border border-gray-300 rounded"
          />
        </div>
      )}
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
            <h2 className="text-4xl font-bold text-[#441a05]title-underline text-center">
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
                  <h3 className="text-2xl font-bold text-[#441a05]">
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
                  icon={FaBuilding}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠান আইডি' : 'Institute ID'}
                  name="institute_id"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রতিষ্ঠান আইডি লিখুন' : 'Enter institute ID'}
                  value={formData.institute_id}
                  onChange={handleChange}
                />
                
                <FileInputField
                  icon={MdCorporateFare}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের লোগো' : 'Institute Logo'}
                  name="institute_logo"
                  onChange={handleLogoChange}
                  preview={logoPreview}
                />
                
                <InputField
                  icon={MdCorporateFare}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ইংরেজি নাম' : 'Institute English Name'}
                  name="institute_english_name"
                  required
                  placeholder={languageCode === 'bn' ? 'ইংরেজি নাম লিখুন' : 'Enter English name'}
                  value={formData.institute_english_name}
                  onChange={handleChange}
                />
                
                <InputField
                  icon={MdCorporateFare}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের বাংলা নাম' : 'Institute Bangla Name'}
                  name="institute_Bangla_name"
                  required
                  placeholder={languageCode === 'bn' ? 'বাংলা নাম লিখুন' : 'Enter Bangla name'}
                  value={formData.institute_Bangla_name}
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
                  name="institute_type"
                  required
                  placeholder={languageCode === 'bn' ? 'প্রতিষ্ঠানের ধরন নির্বাচন করুন' : 'Select institute type'}
                  value={formData.institute_type}
                  options={instituteTypeOptions}
                  onChange={(selectedOption, actionMeta) => handleSelectChange(selectedOption, actionMeta)}
                  disabled={isTypesLoading || typesError}
                />
              </div>
            )}
          </div>

          {/* Institute Details */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('details')}
              >
                <div className="flex items-center space-x-3">
                  <MdSchool className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-[#441a05]">
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
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'ইআইআইএন নম্বর' : 'EIIN Number'}
                  name="institute_eiin_no"
                  placeholder={languageCode === 'bn' ? 'ইআইআইএন নম্বর লিখুন' : 'Enter EIIN number'}
                  value={formData.institute_eiin_no}
                  onChange={handleChange}
                />
                
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
                  icon={MdLocationOn}
                  label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ঠিকানা' : 'Institute Address'}
                  name="institute_address"
                  placeholder={languageCode === 'bn' ? 'ঠিকানা লিখুন' : 'Enter address'}
                  value={formData.institute_address}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Online Information */}
          <div className="section-card p-6 rounded-2xl">
            <div className="section-header">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSection('online')}
              >
                <div className="flex items-center space-x-3">
                  <FaGlobe className="text-3xl text-pmColor" />
                  <h3 className="text-2xl font-bold text-[#441a05]">
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
                  label={languageCode === 'bn' ? 'फेसবুক' : 'Facebook'}
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
                  <h3 className="text-2xl font-bold text-[#441a05]">
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
                <FileInputField
                  icon={FaInfoCircle}
                  label={languageCode === 'bn' ? 'দৃষ্টিভঙ্গি শিরোনাম' : 'Vision Heading'}
                  name="institute_v_heading"
                  onChange={handleVHeadingChange}
                  preview={vHeadingPreview}
                />
                
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
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center space-x-6 pt-8">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ripple inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-gray-600 hover:bg-gray-700 text-[#441a05]transition-all duration-300 animate-scaleIn btn-glow"
              title={languageCode === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            >
              {languageCode === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              disabled={isFormDisabled || isCreating || isUpdating}
              className={`btn btn-ripple inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-pmColor hover:bg-yellow-600 text-[#441a05]transition-all duration-300 animate-scaleIn ${
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