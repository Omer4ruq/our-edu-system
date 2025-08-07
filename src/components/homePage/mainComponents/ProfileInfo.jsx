import React from 'react';
import { useSelector } from 'react-redux';
import { FaUserEdit, FaFacebookF, FaLinkedinIn, FaGithub, FaInstagram, FaTwitter, FaUserCheck } from 'react-icons/fa';

export default function ProfileInfo() {
  const {
    user, role, profile, username
  } = useSelector((state) => state.auth);

  return (
    <div className="h-full glass-card bg-[#441a05]/5 border border-[#441a05]/10 rounded-2xl px-4 relative shadow-xl animate-fadeIn text-center space-y-4 transition-all duration-500">
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
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
            50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
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
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
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

      {/* Top Row */}
      <div className="flex justify-between items-center text-[#441a05]px-2">
        <p className="text-sm sm:text-base font-semibold text-pmColor flex items-center gap-2"><FaUserCheck />{role || 'রোল নির্ধারিত নয়'}</p>
        <button className="text-xl hover:text-pmColor transition-colors duration-200">
          <FaUserEdit />
        </button>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center">
        <div className="rounded-full border-4 border-pmColor p-1 animate-scaleIn animate-glow">
          <img
            src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            alt="প্রোফাইল ছবি"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="text-[#441a05]space-y-1">
        <h4 className="text-lg font-bold">{user?.name || 'নাম পাওয়া যায়নি'}</h4>
        <p className="text-xs">{profile?.designation || 'পদবী নির্ধারিত নয়'}</p>
        <p className="text-xs">{profile?.phone_number || 'মোবাইল নম্বর নেই'}</p>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center gap-4 pt-2">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-[#441a05]/10 border border-[#441a05]/20 rounded-full p-2 hover:bg-pmColor transition">
          <FaFacebookF className="text-[#441a05]text-sm" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-[#441a05]/10 border border-[#441a05]/20 rounded-full p-2 hover:bg-pmColor transition">
          <FaLinkedinIn className="text-[#441a05]text-sm" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-[#441a05]/10 border border-[#441a05]/20 rounded-full p-2 hover:bg-pmColor transition">
          <FaGithub className="text-[#441a05]text-sm" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-[#441a05]/10 border border-[#441a05]/20 rounded-full p-2 hover:bg-pmColor transition">
          <FaInstagram className="text-[#441a05]text-sm" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-[#441a05]/10 border border-[#441a05]/20 rounded-full p-2 hover:bg-pmColor transition">
          <FaTwitter className="text-[#441a05]text-sm" />
        </a>
      </div>
    </div>
  );
}
