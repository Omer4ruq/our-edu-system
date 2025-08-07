import React from 'react';
import { FaPeopleCarry, FaUserFriends, FaUserTie } from 'react-icons/fa';
import { FaGoogleScholar, FaPeoplePulling } from 'react-icons/fa6';
import { RiUserSettingsFill } from 'react-icons/ri';

import { useGetStudentActiveApiQuery } from '../../../redux/features/api/student/studentActiveApi';
import { useGetRoleStaffProfileApiQuery, useGetTeacherStaffProfilesQuery } from '../../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { PiStudentFill } from 'react-icons/pi';

export default function Overview() {
  const { data: activeStudent, isLoading: activeStudentLoading } = useGetStudentActiveApiQuery();
  const { data: allStaff, isLoading: staffLoading } = useGetRoleStaffProfileApiQuery();
  const { data: teachers, isLoading: teacherLoading } = useGetTeacherStaffProfilesQuery();

  const toBn = (n) => n.toLocaleString("bn-BD");

  const studentCount = toBn(activeStudent?.length || 0);
  const teacherCount = teachers?.length || 0;
  const staffCount = (allStaff?.length || 0) - teacherCount;

  return (
    <div className="">
      <style>
        {`
          @keyframes slideInRight {
            from { 
              opacity: 0; 
              transform: translateX(50px) scale(0.9); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0) scale(1); 
            }
          }
          @keyframes slideInLeft {
            from { 
              opacity: 0; 
              transform: translateX(-50px) scale(0.9); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0) scale(1); 
            }
          }
          @keyframes pulse {
            0% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.1);
              box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
            }
            100% { 
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            }
          }
          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
            }
            50% { 
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
            }
          }
          .animate-slideInRight {
            animation: slideInRight 0.8s ease-out forwards;
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.8s ease-out forwards;
          }
          .animate-pulse-custom {
            animation: pulse 2.5s ease-in-out infinite;
          }
          .animate-glow {
            animation: glow 3s ease-in-out infinite;
          }
          .glass-card {
            backdrop-filter: blur(25px);
            position: relative;
            overflow: hidden;
          }
          .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.1), 
              transparent);
            transition: left 0.8s;
          }
          .glass-card:hover::before {
            left: 100%;
          }
          .glass-card:hover {
            transform: translateY(-5px) scale(1.03);
          }
        `}
      </style>


       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        <div
          className="glass-card p-5 shadow-xl rounded-xl transition-all duration-500 ease-out animate-slideInLeft hover:cursor-pointer relative bg-[#441a05]/5 border border-[#441a05]/10"
          style={{ animationDelay: '0s' }}
        >
                      <h4 className="text-[#441a05]/90 font-semibold text-xs mb-4 tracking-wide ml-1">মোট শিক্ষার্থী</h4>
            <PiStudentFill className="w-12 h-12 drop-shadow-2xl text-pmColor animate-pulse-custom" />
          <div>

            <h4 className="text-xl font-bold text-[#441a05]drop-shadow-lg mt-4 ml-1">
              {activeStudentLoading ? "লোড হচ্ছে..." : studentCount}
            </h4>
          </div>
        </div>

        
        <div
          className="glass-card p-5 shadow-xl rounded-xl transition-all duration-500 ease-out animate-slideInLeft hover:cursor-pointer relative bg-[#441a05]/5 border border-[#441a05]/10"
          style={{ animationDelay: '0s' }}
        >
                      <h4 className="text-[#441a05]/90 font-semibold text-xs mb-4 tracking-wide ml-1">মোট শিক্ষক</h4>
            <FaUserTie className="w-10 h-10 drop-shadow-2xl text-pmColor animate-pulse-custom" />
          <div>

            <h4 className="text-xl font-bold text-[#441a05]drop-shadow-lg mt-6 ml-1">
               {staffLoading || teacherLoading ? "লোড হচ্ছে..." : toBn(teacherCount)}
            </h4>
          </div>
        </div>


        <div
          className="glass-card p-5 shadow-xl rounded-xl transition-all duration-500 ease-out animate-slideInLeft hover:cursor-pointer relative bg-[#441a05]/5 border border-[#441a05]/10"
          style={{ animationDelay: '0s' }}
        >
                      <h4 className="text-[#441a05]/90 font-semibold text-xs mb-4 tracking-wide ml-1">মোট কর্মী</h4>
            <FaPeopleCarry className="w-12 h-12 drop-shadow-2xl text-pmColor animate-pulse-custom" />
          <div>

            <h4 className="text-xl font-bold text-[#441a05]drop-shadow-lg mt-4 ml-1">
              {staffLoading || teacherLoading ? "লোড হচ্ছে..." : toBn(staffCount)}
            </h4>
          </div>
        </div>


        <div
          className="glass-card p-5 shadow-xl rounded-xl transition-all duration-500 ease-out animate-slideInLeft hover:cursor-pointer relative bg-[#441a05]/5 border border-[#441a05]/10"
          style={{ animationDelay: '0s' }}
        >
                      <h4 className="text-[#441a05]/90 font-semibold text-xs mb-4 tracking-wide ml-1">মোট অভিভাবক</h4>
            <FaPeoplePulling className="w-12 h-12 drop-shadow-2xl text-pmColor animate-pulse-custom" />
          <div>

            <h4 className="text-xl font-bold text-[#441a05]drop-shadow-lg mt-4 ml-1">
              500
            </h4>
          </div>
        </div>


      </div>
    </div>
  );
}

