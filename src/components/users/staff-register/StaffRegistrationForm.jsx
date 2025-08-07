import React, { useState } from 'react';
import { FaSpinner, FaUser, FaEnvelope, FaPhone, FaHome, FaBriefcase, FaIdCard, FaCalendarAlt, FaVenusMars, FaHeart, FaMap, FaMapMarkerAlt, FaWheelchair, FaUserTag, FaChild, FaFileAlt, FaBuilding, FaBusinessTime, FaRing, FaUpload, FaFileExcel, FaTimes } from 'react-icons/fa'; // Added FaTimes
import { IoAddCircleOutline } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';

import * as XLSX from 'xlsx';
import { useCreateStaffsBulkRegistrationApiMutation } from '../../../redux/features/api/staff/staffBulkRegisterApi';
import { useCreateStaffRegistrationApiMutation } from '../../../redux/features/api/staff/staffRegistration';
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi'; // Import permission hook
import { useGetGroupListQuery } from '../../../redux/features/api/permissionRole/groupListApi';
import { useGetRoleTypesQuery } from '../../../redux/features/api/roleType/roleTypesApi';


const StaffRegistrationForm = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    name_in_bangla: '',
    user_id: '',
    phone_number: '',
    email: '',
    gender: '',
    dob: '',
    blood_group: '',
    nid: '',
    rfid: '',
    present_address: '',
    permanent_address: '',
    disability_info: '',
    short_name: '',
    name_tag: '',
    tin: '',
    qualification: '',
    fathers_name: '',
    mothers_name: '',
    spouse_name: '',
    spouse_phone_number: '',
    children_no: '',
    marital_status: '',
    staff_id_no: '',
    employee_type: '',
    job_nature: '',
    designation: '',
    joining_date: '',
    role_id: '',
    department_id: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [createStaff, { isLoading, error }] = useCreateStaffRegistrationApiMutation();
  const [createStaffsBulkRegistration, { isLoading: isBulkLoading, error: bulkError }] = useCreateStaffsBulkRegistrationApiMutation();
  const {
    data: groups,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGetGroupListQuery();
    const {
      data: roleTypes,
      isLoading: isRoleLoading,
      error: roleError,
      refetch,
    } = useGetRoleTypesQuery();
  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_staffprofile') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_staffprofile') || false;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasAddPermission) {
      toast.error('স্টাফ নিবন্ধন করার অনুমতি নেই।');
      return;
    }

    // Validate numeric fields
    if (
      isNaN(parseInt(formData.user_id)) ||
      (formData.children_no && isNaN(parseInt(formData.children_no))) ||
      isNaN(parseInt(formData.role_id)) ||
      (formData.department_id && isNaN(parseInt(formData.department_id)))
    ) {
      toast.error('অনুগ্রহ করে ইউজার আইডি, সন্তানের সংখ্যা, রোল আইডি এবং বিভাগ আইডি-তে বৈধ সংখ্যা লিখুন।');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        children_no: formData.children_no ? parseInt(formData.children_no) : '',
        role_id: parseInt(formData.role_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : '',
        joining_date: formData.joining_date || '',
        disability_info: formData.disability_info || '',
        rfid: formData.rfid || '',
        tin: formData.tin || '',
        spouse_name: formData.spouse_name || '',
        spouse_phone_number: formData.spouse_phone_number || '',
        name_in_bangla: formData.name_in_bangla || '',
        qualification: formData.qualification || '',
        name_tag: formData.name_tag || '',
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));
      await createStaff(payload).unwrap();
      toast.success('স্টাফ সফলভাবে নিবন্ধিত হয়েছে!');
      setFormData({
        username: '',
        password: '',
        name: '',
        name_in_bangla: '',
        user_id: '',
        phone_number: '',
        email: '',
        gender: '',
        dob: '',
        blood_group: '',
        nid: '',
        rfid: '',
        present_address: '',
        permanent_address: '',
        disability_info: '',
        short_name: '',
        name_tag: '',
        tin: '',
        qualification: '',
        fathers_name: '',
        mothers_name: '',
        spouse_name: '',
        spouse_phone_number: '',
        children_no: '',
        marital_status: '',
        staff_id_no: '',
        employee_type: '',
        job_nature: '',
        designation: '',
        joining_date: '',
        role_id: '',
        department_id: '',
      });
    } catch (err) {
      console.error('Full Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || 'অজানা ত্রুটি';
      toast.error(`স্টাফ নিবন্ধন ব্যর্থ: ${errorMessage}`);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
    } else {
      toast.error('দয়া করে একটি বৈধ Excel ফাইল (.xlsx) আপলোড করুন।');
      setFile(null);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('বাল্ক স্টাফ নিবন্ধন করার অনুমতি নেই।');
      return;
    }
    if (!file) {
      toast.error('দয়া করে একটি Excel ফাইল আপলোড করুন।');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await createStaffsBulkRegistration(formData).unwrap();
      toast.success('স্টাফদের বাল্ক নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!');
      setFile(null);
      setIsModalOpen(false);
      e.target.reset();
    } catch (err) {
      console.error('Bulk Registration Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || 'অজানা ত্রুটি';
      toast.error(`বাল্ক নিবন্ধন ব্যর্থ: ${errorMessage}`);
    }
  };

  const downloadSampleExcel = () => {
    const headers = [
      'UserId',
      'phone_number',
      'name',
      'rfid',
      'gender',
      'dob',
      'blood_group',
      'qualification',
      'employee_type',
      'designation',
      'role',
      'joining_date',
    ];
    const ws = XLSX.utils.json_to_sheet([{}], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'sample_staff_import.xlsx');
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-[#441a05]/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-pmColor" />
          <span className="text-lg font-medium text-[#441a05]">
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
    <div className="py-10 w-full min-h-screen">
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
            background: #DB9E30;
            margin: 8px auto 0;
          }
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: #441a05;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 100%;
            position: relative;
          }
          .modal-close {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            cursor: pointer;
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
            background: #441a05;
          }
        `}
      </style>

      <div className="mx-auto">
        <div className="sticky top-0 z-10 mb-8 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-end space-x-3">
            {hasAddPermission && ( // Only show bulk registration button if has add permission
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-ripple inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-200 animate-scaleIn btn-glow"
                  title="বাল্ক স্টাফ নিবন্ধন"
                >
                  <FaUpload className="text-lg" />
                  <span>বাল্ক স্টাফ নিবন্ধন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Registration Modal */}
        {isModalOpen && hasAddPermission && ( // Only show modal if has add permission
          <div className="modal-overlay">
            <div className="modal-content animate-scaleIn">
              <span className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</span>
              <h3 className="text-2xl font-semibold text-[#441a05]text-center mb-4">বাল্ক স্টাফ নিবন্ধন</h3>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="relative input-icon">
                  <label htmlFor="file" className="block font-medium text-[#441a05]">
                    Excel ফাইল আপলোড করুন <span className="text-pmColor">*</span>
                  </label>
                  <FaFileExcel className="absolute left-3 top-[43px] text-pmColor" />
                  <input
                    type="file"
                    id="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    required
                    aria-label="Excel ফাইল আপলোড করুন"
                    disabled={isBulkLoading || !hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="btn btn-ripple inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gray-200 text-[#441a05]transition-all duration-200 animate-scaleIn btn-glow"
                    title="নমুনা Excel ডাউনলোড করুন"
                  >
                    <FaFileExcel className="text-lg" />
                    <span>নমুনা Excel ডাউনলোড</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isBulkLoading || !file || !hasAddPermission} // Disable if no add permission
                    className={`btn btn-ripple inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-200 animate-scaleIn ${isBulkLoading || !file || !hasAddPermission ? 'opacity-50 cursor-not-allowed' : 'btn-glow'}`}
                    title="ফাইল আপলোড করুন"
                  >
                    {isBulkLoading ? (
                      <span className="flex items-center gap-2">
                        <FaSpinner className="animate-spin text-lg" />
                        <span>আপলোড হচ্ছে...</span>
                      </span>
                    ) : (
                      <span>ফাইল আপলোড করুন</span>
                    )}
                  </button>
                </div>
              </form>
              {bulkError && (
                <div
                  id="bulk-error-message"
                  className="text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn text-center mt-4"
                  aria-describedby="bulk-error-message"
                >
                  ত্রুটি: {bulkError.data?.message || bulkError.data?.error || bulkError.data?.detail || bulkError.status || 'অজানা ত্রুটি'}
                </div>
              )}
            </div>
          </div>
        )}

        {hasAddPermission && ( // Only show the main form if has add permission
          <form onSubmit={handleSubmit} className="rounded-2xl animate-fadeIn space-y-10">
            {/* ব্যক্তিগত তথ্য */}
            <div className="bg-black/10 backdrop-blur-sm border animate-fadeIn border-[#441a05]/20 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FaUser className="text-3xl text-pmColor" />
              </div>
              <h3 className="text-2xl font-semibold text-[#441a05]text-center">ব্যক্তিগত তথ্য</h3>
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative input-icon">
                  <label htmlFor="name" className="block text-lg font-medium text-[#441a05]">
                    পূর্ণ নাম <span className="text-pmColor">*</span>
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="পূর্ণ নাম লিখুন"
                    required
                    aria-label="পূর্ণ নাম"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="name_in_bangla" className="block text-lg font-medium text-[#441a05]">
                    বাংলায় নাম
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="name_in_bangla"
                    name="name_in_bangla"
                    value={formData.name_in_bangla}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="বাংলায় নাম লিখুন"
                    aria-label="বাংলায় নাম"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="user_id" className="block text-lg font-medium text-[#441a05]">
                    ইউজার আইডি <span className="text-pmColor">*</span>
                  </label>
                  <FaIdCard className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="number"
                    id="user_id"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="ইউজার আইডি লিখুন"
                    required
                    aria-label="ইউজার আইডি"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="gender" className="block text-lg font-medium text-[#441a05]">
                    লিঙ্গ
                  </label>
                  <FaVenusMars className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="লিঙ্গ"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="Male">পুরুষ</option>
                    <option value="Female">নারী</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="dob" className="block text-lg font-medium text-[#441a05]">
                    জন্ম তারিখ
                  </label>
                  <FaCalendarAlt className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="জন্ম তারিখ"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="blood_group" className="block text-lg font-medium text-[#441a05]">
                    রক্তের গ্রুপ
                  </label>
                  <FaHeart className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="blood_group"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="রক্তের গ্রুপ"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="nid" className="block text-lg font-medium text-[#441a05]">
                    জাতীয় পরিচয়পত্র
                  </label>
                  <FaIdCard className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="nid"
                    name="nid"
                    value={formData.nid}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="জাতীয় পরিচয়পত্র নম্বর লিখুন"
                    aria-label="জাতীয় পরিচয়পত্র"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="fathers_name" className="block text-lg font-medium text-[#441a05]">
                    পিতার নাম
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="fathers_name"
                    name="fathers_name"
                    value={formData.fathers_name}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="পিতার নাম লিখুন"
                    aria-label="পিতার নাম"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="mothers_name" className="block text-lg font-medium text-[#441a05]">
                    মাতার নাম
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="mothers_name"
                    name="mothers_name"
                    value={formData.mothers_name}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="মাতার নাম লিখুন"
                    aria-label="মাতার নাম"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="marital_status" className="block text-lg font-medium text-[#441a05]">
                    বৈবাহিক অবস্থা
                  </label>
                  <FaRing className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="marital_status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="বৈবাহিক অবস্থা"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">বৈবাহিক অবস্থা নির্বাচন করুন</option>
                    <option value="MARRIED">বিবাহিত</option>
                    <option value="SINGLE">অবিবাহিত</option>
                    <option value="DIVORCED">তালাকপ্রাপ্ত</option>
                    <option value="WIDOWED">বিধবা/বিপত্নীক</option>
                  </select>
                </div>
              </div>
            </div>

            {/* যোগাযোগের তথ্য */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FaPhone className="text-3xl text-pmColor" />
              </div>
              <h3 className="text-2xl font-semibold text-[#441a05]text-center">যোগাযোগের তথ্য</h3>
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative input-icon">
                  <label htmlFor="phone_number" className="block text-lg font-medium text-[#441a05]">
                    ফোন নম্বর <span className="text-pmColor">*</span>
                  </label>
                  <FaPhone className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="ফোন নম্বর লিখুন"
                    required
                    aria-label="ফোন নম্বর"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="email" className="block text-lg font-medium text-[#441a05]">
                    ইমেইল
                  </label>
                  <FaEnvelope className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="ইমেইল ঠিকানা লিখুন"
                    aria-label="ইমেইল"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="rfid" className="block text-lg font-medium text-[#441a05]">
                    আরএফআইডি
                  </label>
                  <FaIdCard className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="rfid"
                    name="rfid"
                    value={formData.rfid}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="আরএফআইডি লিখুন"
                    aria-label="আরএফআইডি"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="present_address" className="block text-lg font-medium text-[#441a05]">
                    বর্তমান ঠিকানা
                  </label>
                  <FaMapMarkerAlt className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="present_address"
                    name="present_address"
                    value={formData.present_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="বর্তমান ঠিকানা লিখুন"
                    aria-label="বর্তমান ঠিকানা"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="permanent_address" className="block text-lg font-medium text-[#441a05]">
                    স্থায়ী ঠিকানা
                  </label>
                  <FaMap className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="permanent_address"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="স্থায়ী ঠিকানা লিখুন"
                    aria-label="স্থায়ী ঠিকানা"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="disability_info" className="block text-lg font-medium text-[#441a05]">
                    প্রতিবন্ধকতার তথ্য
                  </label>
                  <FaWheelchair className="absolute left-3 top-[50px] text-pmColor" />
                  <textarea
                    id="disability_info"
                    name="disability_info"
                    value={formData.disability_info}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="প্রতিবন্ধকতার তথ্য লিখুন"
                    rows="3"
                    aria-label="প্রতিবন্ধকতার তথ্য"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
              </div>
            </div>

            {/* পারিবারিক তথ্য */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FaHome className="text-3xl text-pmColor" />
              </div>
              <h3 className="text-2xl font-semibold text-[#441a05]text-center">পারিবারিক তথ্য</h3>
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {/* Spouse Name */}
    <div className="relative">
      <label htmlFor="spouse_name" className="block text-lg font-medium text-[#441a05]">
        স্ত্রী/স্বামীর নাম
      </label>
      <FaUser className="absolute left-3 top-[50px] text-pmColor" />
      <input
        type="text"
        id="spouse_name"
        name="spouse_name"
        value={formData.spouse_name}
        onChange={handleChange}
        className="mt-1 w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-pmColor transition-all duration-300"
        placeholder="স্ত্রী/স্বামীর নাম লিখুন"
        aria-label="স্ত্রী/স্বামীর নাম"
        disabled={!hasAddPermission} // Disable if no add permission
      />
    </div>

    {/* Spouse Phone Number */}
    <div className="relative">
      <label htmlFor="spouse_phone_number" className="block text-lg font-medium text-[#441a05]">
        স্ত্রী/স্বামীর ফোন নম্বর
      </label>
      <FaPhone className="absolute left-3 top-[50px] text-pmColor" />
      <input
        type="text"
        id="spouse_phone_number"
        name="spouse_phone_number"
        value={formData.spouse_phone_number}
        onChange={handleChange}
        className="mt-1 w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-pmColor transition-all duration-300"
        placeholder="স্ত্রী/স্বামীর ফোন নম্বর লিখুন"
        aria-label="স্ত্রী/স্বামীর ফোন নম্বর"
        disabled={!hasAddPermission} // Disable if no add permission
      />
    </div>

    {/* Number of Children */}
    <div className="relative">
      <label htmlFor="children_no" className="block text-lg font-medium text-[#441a05]">
        সন্তানের সংখ্যা
      </label>
      <FaChild className="absolute left-3 top-[50px] text-pmColor" />
      <input
        type="number"
        id="children_no"
        name="children_no"
        value={formData.children_no}
        onChange={handleChange}
        className="mt-1 w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-pmColor transition-all duration-300"
        placeholder="সন্তানের সংখ্যা লিখুন"
        aria-label="সন্তানের সংখ্যা"
        disabled={!hasAddPermission} // Disable if no add permission
      />
    </div>
  </div>

            </div>

            {/* কর্মসংস্থানের তথ্য */}
            <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FaBriefcase className="text-3xl text-pmColor" />
              </div>
              <h3 className="text-2xl font-semibold text-[#441a05]text-center">কর্মসংস্থানের তথ্য</h3>
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative input-icon">
                  <label htmlFor="short_name" className="block text-lg font-medium text-[#441a05]">
                    সংক্ষিপ্ত নাম
                  </label>
                  <FaUserTag className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="short_name"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="সংক্ষিপ্ত নাম লিখুন"
                    aria-label="সংক্ষিপ্ত নাম"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="name_tag" className="block text-lg font-medium text-[#441a05]">
                    নাম ট্যাগ
                  </label>
                  <FaUserTag className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="name_tag"
                    name="name_tag"
                    value={formData.name_tag}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="নাম ট্যাগ লিখুন (যেমন: সিনিয়র শিক্ষক)"
                    aria-label="নাম ট্যাগ"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="tin" className="block text-lg font-medium text-[#441a05]">
                    টিআইএন
                  </label>
                  <FaFileAlt className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="tin"
                    name="tin"
                    value={formData.tin}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="টিআইএন লিখুন"
                    aria-label="টিআইএন"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="qualification" className="block text-lg font-medium text-[#441a05]">
                    যোগ্যতা
                  </label>
                  <FaFileAlt className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="যোগ্যতা লিখুন"
                    aria-label="যোগ্যতা"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="staff_id_no" className="block text-lg font-medium text-[#441a05]">
                    স্টাফ আইডি নম্বর
                  </label>
                  <FaIdCard className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="staff_id_no"
                    name="staff_id_no"
                    value={formData.staff_id_no}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="স্টাফ আইডি নম্বর লিখুন"
                    aria-label="স্টাফ আইডি নম্বর"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="employee_type" className="block text-lg font-medium text-[#441a05]">
                    কর্মচারীর ধরন
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="employee_type"
                    name="employee_type"
                    value={formData.employee_type}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="কর্মচারীর ধরন"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">কর্মচারীর ধরন নির্বাচন করুন</option>
                    <option value="Permanent">স্থায়ী</option>
                    <option value="Contract">চুক্তিভিত্তিক</option>
                    <option value="PartTime">খণ্ডকালীন</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="job_nature" className="block text-lg font-medium text-[#441a05]">
                    চাকরির প্রকৃতি
                  </label>
                  <FaBusinessTime className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="job_nature"
                    name="job_nature"
                    value={formData.job_nature}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="চাকরির প্রকৃতি"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">চাকরির প্রকৃতি নির্বাচন করুন</option>
                    <option value="Fulltime">পূর্ণকালীন</option>
                    <option value="Parttime">খণ্ডকালীন</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="designation" className="block text-lg font-medium text-[#441a05]">
                    পদবী
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    placeholder="পদবী লিখুন"
                    aria-label="পদবী"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="joining_date" className="block text-lg font-medium text-[#441a05]">
                    যোগদানের তারিখ
                  </label>
                  <FaCalendarAlt className="absolute left-3 top-[50px] text-pmColor" />
                  <input
                    type="date"
                    id="joining_date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="যোগদানের তারিখ"
                    disabled={!hasAddPermission} // Disable if no add permission
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="role_id" className="block text-lg font-medium text-[#441a05]">
                    ভূমিকা <span className="text-pmColor">*</span>
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-pmColor" />
        <select
  id="role_id"
  name="role_id"
  value={formData.role_id}
  onChange={handleChange}
  className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
  required
  aria-label="ভূমিকা"
  disabled={!hasAddPermission} // Disable if no add permission
>
  <option value="">ভূমিকা নির্বাচন করুন</option>
  {roleTypes?.map((group) => (
    <option key={group.id} value={group.id}>
      {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
    </option>
  ))}
</select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="department_id" className="block text-lg font-medium text-[#441a05]">
                    বিভাগ আইডি
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-pmColor" />
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-[#441a05]/10 text-[#441a05]pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-pmColor border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                    aria-label="বিভাগ আইডি"
                    disabled={!hasAddPermission} // Disable if no add permission
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    <option value="1">গণিত</option>
                    <option value="2">বিজ্ঞান</option>
                    <option value="3">প্রশাসন</option>
                  </select>
                </div>
              </div>
            </div>

            {/* জমা দিন বাটন */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || !hasAddPermission} // Disable if no add permission
                className={`btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-pmColor text-[#441a05]transition-all duration-200 animate-scaleIn ${isLoading || !hasAddPermission ? 'opacity-50 cursor-not-allowed' : 'btn-glow'}`}
                title="স্টাফ নিবন্ধন করুন"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>জমা হচ্ছে...</span>
                  </span>
                ) : (
                  <span>স্টাফ নিবন্ধন করুন</span>
                )}
              </button>
            </div>

            {/* ত্রুটি বার্তা */}
            {error && (
              <div
                id="error-message"
                className="text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn text-center"
                aria-describedby="error-message"
              >
                ত্রুটি: {error.data?.message || error.data?.error || error.data?.detail || error.status || 'অজানা ত্রুটি'}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffRegistrationForm;