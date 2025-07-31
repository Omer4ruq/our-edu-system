import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaEdit } from 'react-icons/fa';
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook
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
  .tab-glow:hover {
    box-shadow: 0 0 10px rgba(219, 158, 48, 0.3);
  }
  .edit-icon {
    transform: scale(1.1);
    background-color: ${primaryColor};
    color: #fff;
  }
  .title-underline::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: ${primaryColor};
    margin: 8px auto 0;
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
`;

export default function InstituteDetails({ institutes, handleEditInstitute }) {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  // State for active tab per institute
  const [activeTabs, setActiveTabs] = useState({});

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false;


  const setActiveTab = (instituteId, tab) => {
    setActiveTabs((prev) => ({
      ...prev,
      [instituteId]: tab,
    }));
  };

  if (permissionsLoading) {
    return <div className="p-4 text-gray-500 animate-fadeIn text-center">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="mx-auto py-8">
      <style>{customStyles}</style>
      <h1 className="sm:text-3xl text-2xl md:text-4xl font-extrabold mb-8 text-center text-white title-underline animate-fadeIn">
        প্রতিষ্ঠানের প্রোফাইল
      </h1>
      {institutes.map((institute) => {
        const activeTab = activeTabs[institute.id] || 'basic';

        return (
          <div
            key={institute.id}
            className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-md mb-10 overflow-hidden relative animate-fadeIn"
          >
            {/* Profile Header */}
            <div className="relative sm:flex items-center justify-between p-6 bg-white/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 border-4 border-white rounded-full sm:p-4 p-2 shadow-md animate-scaleIn">
                  <FaBuilding className="text-pmColor sm:text-4xl text-xl" />
                </div>
                <div>
                  <h2 className="md:text-3xl font-bold text-white">{institute.institute_name}</h2>
                  <p className="text-sm text-[#9d9087]">
                    {institute.institute_type?.name || 'অজানা'} • {institute.institute_address || 'অজানা'}
                  </p>
                </div>
              </div>
              {hasChangePermission && ( // Only show edit button if has change permission
                <button
                  onClick={() => handleEditInstitute(institute)}
                  className="edit-icon text-[#9d9087] p-2 rounded-full transition-all duration-300 btn-ripple"
                  title="প্রোফাইল সম্পাদনা করুন"
                >
                  <FaEdit className="sm:text-xl" />
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-4 bg-white/5 border-b border-[#9d9087]/50">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'basic', label: 'মৌলিক তথ্য' },
                  { id: 'online', label: 'অনলাইন তথ্য' },
                  { id: 'manager', label: 'ইনচার্জ ম্যানেজার' },
                  { id: 'additional', label: 'অতিরিক্ত তথ্য' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-pmColor text-white font-semibold'
                        : 'text-[#9d9087] hover:bg-[#9d9087]/20 tab-glow'
                    } animate-scaleIn`}
                    onClick={() => setActiveTab(institute.id, tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-4 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaBuilding className="mr-2 text-pmColor" /> মৌলিক তথ্য
                    </h3>
                    <p><span className="font-medium">প্রধান শিক্ষক:</span> {institute.headmaster_name}</p>
                    <p><span className="font-medium">মোবাইল:</span> {institute.headmaster_mobile}</p>
                    <p><span className="font-medium">ঠিকানা:</span> {institute.institute_address || 'অজানা'}</p>
                  </div>
                  <div className="space-y-4 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaInfoCircle className="mr-2 text-pmColor" /> প্রতিষ্ঠানের বিবরণ
                    </h3>
                    <p><span className="font-medium">ইমেইল:</span> {institute.institute_email_address || 'অজানা'}</p>
                    <p><span className="font-medium">ইআইআইএন নম্বর:</span> {institute.institute_eiin_no || 'অজানা'}</p>
                    <p><span className="font-medium">শিক্ষার্থীর ধরন:</span> {institute.institute_gender_type === 'Combined' ? 'মিশ্র' : institute.institute_gender_type === 'Boys' ? 'ছেলে' : 'মেয়ে'}</p>
                    <p><span className="font-medium">প্রতিষ্ঠানের ধরন:</span> {institute.institute_type?.name || 'অজানা'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'online' && (
                <div className="space-y-4 text-white animate-fadeIn">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaGlobe className="mr-2 text-pmColor" /> অনলাইন তথ্য
                  </h3>
                  <p>
                    <span className="font-medium">ওয়েবসাইট:</span>{' '}
                    {institute.institute_web ? (
                      <a
                        href={institute.institute_web}
                        className="text-pmColor hover:text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_web}
                      </a>
                    ) : (
                      'অজানা'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">ব্যবস্থাপনা ওয়েবসাইট:</span>{' '}
                    {institute.institute_management_web ? (
                      <a
                        href={institute.institute_management_web}
                        className="text-pmColor hover:text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_management_web}
                      </a>
                    ) : (
                      'অজানা'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">ফেসবুক:</span>{' '}
                    {institute.institute_fb ? (
                      <a
                        href={institute.institute_fb}
                        className="text-pmColor hover:text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_fb}
                      </a>
                    ) : (
                      'অজানা'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">ইউটিউব:</span>{' '}
                    {institute.institute_youtube ? (
                      <a
                        href={institute.institute_youtube}
                        className="text-pmColor hover:text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_youtube}
                      </a>
                    ) : (
                      'অজানা'
                    )}
                  </p>
                </div>
              )}

              {activeTab === 'manager' && (
                <div className="space-y-4 text-white animate-fadeIn">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2 text-pmColor" /> ইনচার্জ ম্যানেজার
                  </h3>
                  <p><span className="font-medium">নাম:</span> {institute.incharge_manager || 'অজানা'}</p>
                  <p><span className="font-medium">ইমেইল:</span> {institute.incharge_manager_email || 'অজানা'}</p>
                  <p><span className="font-medium">মোবাইল:</span> {institute.incharge_manager_mobile || 'অজানা'}</p>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-4 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaInfoCircle className="mr-2 text-pmColor" /> অতিরিক্ত তথ্য
                    </h3>
                    <p><span className="font-medium">দৃষ্টিভঙ্গি শিরোনাম:</span> {institute.institute_v_heading || 'অজানা'}</p>
                    <p><span className="font-medium">স্বাক্ষর:</span> {institute.signature || 'অজানা'}</p>
                    <p><span className="font-medium">স্থিতি:</span> {institute.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
                  </div>
                  <div className="space-y-4 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaGraduationCap className="mr-2 text-pmColor" /> শিক্ষা বিবরণ
                    </h3>
                    <p><span className="font-medium">বোর্ড আইডি:</span> {institute.education_board_id || 'অজানা'}</p>
                    <p><span className="font-medium">জেলা আইডি:</span> {institute.education_district_id || 'অজানা'}</p>
                    <p><span className="font-medium">বিভাগ আইডি:</span> {institute.education_division_id || 'অজানা'}</p>
                    <p><span className="font-medium">থানা আইডি:</span> {institute.education_thana_id || 'অজানা'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}