import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaEdit, FaLanguage, FaExternalLinkAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { MdCorporateFare, MdSchool, MdLocationOn, MdEmail, MdPhone, MdWeb, MdFacebook, MdAccountCircle, MdSettings } from 'react-icons/md';
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
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  .animate-slideIn {
    animation: slideIn 0.5s ease-out forwards;
  }
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .edit-button:hover {
    background: ${secondaryColor};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .link-item {
    color: ${primaryColor};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .link-item:hover {
    background: ${primaryColor};
    color: [#441a05];
    transform: translateX(4px);
  }
  
  .section-title::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: ${primaryColor};
    margin-top: 8px;
  }
`;

export default function InstituteDetails({ institutes, handleEditInstitute }) {
  const { user, group_id } = useSelector((state) => state.auth);
  const [activeTabs, setActiveTabs] = useState({});

  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false;

  const setActiveTab = (instituteId, tab) => {
    setActiveTabs((prev) => ({
      ...prev,
      [instituteId]: tab,
    }));
  };

  const getGenderTypeText = (type) => {
    if (languageCode === 'bn') {
      return type === 'Combined' ? 'মিশ্র' : type === 'Boys' ? 'ছেলে' : 'মেয়ে';
    }
    return type;
  };

  const getStatusText = (status) => {
    if (languageCode === 'bn') {
      return status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়';
    }
    return status;
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-12 text-center animate-pulse">
          <div className="text-pmColor text-2xl font-semibold">
            {languageCode === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-12 text-center">
          <div className="text-secColor text-xl font-semibold">
            {languageCode === 'bn' 
              ? 'এই পৃষ্ঠাটি দেখার অনুমতি নেই।' 
              : 'No permission to view this page.'}
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, isLink = false, href = null }) => (
    <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-xl p-6 hover:bg-[#441a05]/20 hover:border-pmColor/50 transition-all duration-300 animate-slideIn">
      <div className="flex items-start space-x-4">
        <div className="text-pmColor text-xl mt-1">
          <Icon />
        </div>
        <div className="flex-1">
          <div className="text-[#441a05]/80 font-medium text-sm mb-2">{label}</div>
          <div className="text-[#441a05]font-semibold">
            {isLink && href ? (
              <a
                href={href}
                className="link-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                {value}
                <FaExternalLinkAlt className="text-sm" />
              </a>
            ) : (
              value || (languageCode === 'bn' ? 'অজানা' : 'Unknown')
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <style>{customStyles}</style>

      {/* Page Header */}
      <div className="mx-auto mb-8">
        <div className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl p-8 text-center animate-fadeIn">
          <h1 className="text-3xl font-bold text-[#441a05]mb-4">
            {languageCode === 'bn' ? 'প্রতিষ্ঠান ড্যাশবোর্ড' : 'Institute Dashboard'}
          </h1>
          <p className="text-[#441a05]/80">
            {languageCode === 'bn' 
              ? 'আপনার প্রতিষ্ঠানের সম্পূর্ণ তথ্য ব্যবস্থাপনা' 
              : 'Complete management of your institute information'}
          </p>
        </div>
      </div>

      {/* Institutes List */}
      <div className="mx-auto space-y-8">
        {institutes.map((institute, index) => {
          const activeTab = activeTabs[institute.id] || 'basic';

          return (
            <div
              key={institute.id}
              className="bg-[#441a05]/10 backdrop-blur-md border border-[#441a05]/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Institute Header */}
              <div className="bg-gradient-to-r from-pmColor to-secColor p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-6">
                    <div className="bg-[#441a05]/20 backdrop-blur-sm p-4 rounded-2xl">
                      <MdCorporateFare className="text-[#441a05]text-4xl" />
                    </div>
                    <div>
                      <h2 className="text-[#441a05]text-3xl lg:text-4xl font-bold mb-2">
                        {institute.institute_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-[#441a05]/90">
                        <div className="flex items-center space-x-2">
                          <MdSchool />
                          <span>{institute.institute_type?.name || (languageCode === 'bn' ? 'অজানা' : 'Unknown')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MdLocationOn />
                          <span>{institute.institute_address || (languageCode === 'bn' ? 'অজানা' : 'Unknown')}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          institute.status === 'Active' ? 'bg-pmColor text-[#441a05]' : 'bg-secColor text-[#441a05]'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-[#441a05]animate-pulse"></div>
                            <span>{getStatusText(institute.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {hasChangePermission && (
                    <button
                      onClick={() => handleEditInstitute(institute)}
                      className="edit-button bg-pmColor text-[#441a05]px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300"
                    >
                      <FaEdit />
                      <span>{languageCode === 'bn' ? 'সম্পাদনা করুন' : 'Edit Profile'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-[#441a05]/5 backdrop-blur-sm border-b border-[#441a05]/10 p-6">
                <div className="flex flex-wrap gap-3">
                  {[
                    { 
                      id: 'basic', 
                      label: languageCode === 'bn' ? 'মৌলিক তথ্য' : 'Basic Information',
                      icon: FaBuilding 
                    },
                    { 
                      id: 'online', 
                      label: languageCode === 'bn' ? 'অনলাইন তথ্য' : 'Online Information',
                      icon: FaGlobe 
                    },
                    { 
                      id: 'manager', 
                      label: languageCode === 'bn' ? 'ম্যানেজার তথ্য' : 'Manager Information',
                      icon: MdAccountCircle 
                    },
                    { 
                      id: 'additional', 
                      label: languageCode === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Information',
                      icon: MdSettings 
                    },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-pmColor text-[#441a05]shadow-lg' 
                            : 'bg-[#441a05]/10 text-[#441a05]/80 border border-[#441a05]/20 hover:bg-[#441a05]/20 hover:border-pmColor/50'
                        }`}
                        onClick={() => setActiveTab(institute.id, tab.id)}
                      >
                        <IconComponent />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="section-title text-2xl font-bold text-[#441a05]">
                        {languageCode === 'bn' ? 'মৌলিক তথ্য ' : 'Basic Information'}
                      </h3>
                      
                      <InfoItem
                        icon={FaUser}
                        label={languageCode === 'bn' ? 'প্রধান শিক্ষক' : 'Headmaster'}
                        value={institute.headmaster_name}
                      />
                      
                      <InfoItem
                        icon={FaPhone}
                        label={languageCode === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                        value={institute.headmaster_mobile}
                      />
                      
                      <InfoItem
                        icon={FaMapMarkerAlt}
                        label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ঠিকানা' : 'Institute Address'}
                        value={institute.institute_address}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="section-title text-2xl font-bold text-[#441a05]">
                        {languageCode === 'bn' ? 'প্রতিষ্ঠানের বিবরণ' : 'Institute Details'}
                      </h3>
                      
                      <InfoItem
                        icon={FaEnvelope}
                        label={languageCode === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                        value={institute.institute_email_address}
                      />
                      
                      <InfoItem
                        icon={FaInfoCircle}
                        label={languageCode === 'bn' ? 'ইআইআইএন নম্বর' : 'EIIN Number'}
                        value={institute.institute_eiin_no}
                      />
                      
                      <InfoItem
                        icon={FaUser}
                        label={languageCode === 'bn' ? 'শিক্ষার্থীর ধরন' : 'Student Type'}
                        value={getGenderTypeText(institute.institute_gender_type)}
                      />
                      
                      <InfoItem
                        icon={MdSchool}
                        label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ধরন' : 'Institute Type'}
                        value={institute.institute_type?.name}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'online' && (
                  <div>
                    <h3 className="section-title text-2xl font-bold text-[#441a05]mb-8">
                      {languageCode === 'bn' ? 'অনলাইন তথ্য' : 'Online Information'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InfoItem
                        icon={MdWeb}
                        label={languageCode === 'bn' ? 'প্রতিষ্ঠানের ওয়েবসাইট' : 'Institute Website'}
                        value={institute.institute_web}
                        isLink={true}
                        href={institute.institute_web}
                      />
                      
                      <InfoItem
                        icon={MdWeb}
                        label={languageCode === 'bn' ? 'ব্যবস্থাপনা ওয়েবসাইট' : 'Management Website'}
                        value={institute.institute_management_web}
                        isLink={true}
                        href={institute.institute_management_web}
                      />
                      
                      <InfoItem
                        icon={MdFacebook}
                        label={languageCode === 'bn' ? 'ফেসবুক পেইজ' : 'Facebook Page'}
                        value={institute.institute_fb}
                        isLink={true}
                        href={institute.institute_fb}
                      />
                      
                      <InfoItem
                        icon={FaGlobe}
                        label={languageCode === 'bn' ? 'ইউটিউব চ্যানেল' : 'YouTube Channel'}
                        value={institute.institute_youtube}
                        isLink={true}
                        href={institute.institute_youtube}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'manager' && (
                  <div>
                    <h3 className="section-title text-2xl font-bold text-[#441a05]mb-8">
                      {languageCode === 'bn' ? 'ইনচার্জ ম্যানেজার' : 'Manager Information'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <InfoItem
                        icon={FaUser}
                        label={languageCode === 'bn' ? 'ম্যানেজারের নাম' : 'Manager Name'}
                        value={institute.incharge_manager}
                      />
                      
                      <InfoItem
                        icon={FaEnvelope}
                        label={languageCode === 'bn' ? 'ম্যানেজারের ইমেইল' : 'Manager Email'}
                        value={institute.incharge_manager_email}
                      />
                      
                      <InfoItem
                        icon={FaPhone}
                        label={languageCode === 'bn' ? 'ম্যানেজারের মোবাইল' : 'Manager Mobile'}
                        value={institute.incharge_manager_mobile}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'additional' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="section-title text-2xl font-bold text-[#441a05]">
                        {languageCode === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Information'}
                      </h3>
                      
                      <InfoItem
                        icon={FaInfoCircle}
                        label={languageCode === 'bn' ? 'দৃষ্টিভঙ্গি শিরোনাম' : 'Vision Heading'}
                        value={institute.institute_v_heading}
                      />
                      
                      <InfoItem
                        icon={FaInfoCircle}
                        label={languageCode === 'bn' ? 'স্বাক্ষর' : 'Signature'}
                        value={institute.signature}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="section-title text-2xl font-bold text-[#441a05]">
                        {languageCode === 'bn' ? 'শিক্ষা বিবরণ' : 'Education Details'}
                      </h3>
                      
                      <InfoItem
                        icon={FaGraduationCap}
                        label={languageCode === 'bn' ? 'শিক্ষা বোর্ড আইডি' : 'Education Board ID'}
                        value={institute.education_board_id}
                      />
                      
                      <InfoItem
                        icon={FaGraduationCap}
                        label={languageCode === 'bn' ? 'শিক্ষা জেলা আইডি' : 'Education District ID'}
                        value={institute.education_district_id}
                      />
                      
                      <InfoItem
                        icon={FaGraduationCap}
                        label={languageCode === 'bn' ? 'শিক্ষা বিভাগ আইডি' : 'Education Division ID'}
                        value={institute.education_division_id}
                      />
                      
                      <InfoItem
                        icon={FaGraduationCap}
                        label={languageCode === 'bn' ? 'শিক্ষা থানা আইডি' : 'Education Thana ID'}
                        value={institute.education_thana_id}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}