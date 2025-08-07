import React from "react";
import SingleNotice from "../cards/SingleNotice";
import dayjs from "dayjs"; // install if not already: npm i dayjs
import { useGetEventsQuery } from "../../../redux/features/api/event/eventApi";
import {
  FaBell,
  FaCalendarAlt,
  FaEye,
  FaExclamationCircle,
} from "react-icons/fa";
import { primaryColor } from "../../../utilitis/getTheme";

export default function Notices() {
  const { data: events = [], isLoading, isError } = useGetEventsQuery();

  // সর্বশেষ ৩টি ইভেন্ট সিলেক্ট করো (তারিখ অনুসারে descending)
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.start) - new Date(a.start))
    .slice(0, 3);

  const convertToBanglaDate = (dateStr) => {
    return dayjs(dateStr)
      .format("D MMMM, YYYY")
      .replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  };

  return (
    <div className="h-full glass-card bg-white/5 border border-white/10 rounded-2xl relative shadow-xl animate-fadeIn transition-all duration-500">
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
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
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
          .animate-slideInLeft {
            animation: slideInLeft 0.6s ease-out forwards;
          }
          .animate-pulse-custom {
            animation: pulse 2s ease-in-out infinite;
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
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.8s;
          }
          .glass-card:hover::before {
            left: 100%;
          }
          .glass-card:hover {
            transform: translateY(-5px) scale(1.02);
          }
          .header-gradient {
            background: linear-gradient(135deg, #ef4444, #dc2626, #b91c1c);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          }
          .notice-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 10px 16px;
            margin: 0.75rem 0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .notice-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: ${primaryColor};
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .notice-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: ${primaryColor};
            transform: translateX(5px);
          }
          .notice-item:hover::before {
            opacity: 1;
          }
          .view-all-btn {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: none;
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 1rem auto 0;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          }
          .view-all-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
          }
          .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #94a3b8;
            padding: 2rem;
          }
          .error-message {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #ef4444;
            padding: 2rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            margin: 1rem;
          }
          .no-notices {
            text-align: center;
            color: #94a3b8;
            padding: 2rem;
            font-style: italic;
          }
        `}
      </style>

      {/* Header */}
      <div className=" text-[#441a05]px-4 flex items-center gap-3 mt-4">
        <div className="animate-pulse-custom">
          <FaCalendarAlt className="text-pmColor" />
        </div>
        <h3 className="font-bold text-pmColor text-sm sm:text-base">
          ইভেন্ট
        </h3>
      </div>

      {/* Content */}
      <div className="px-4 py-1">
        {/* Loading State */}
        {isLoading && (
          <div className="loading-spinner">
            <div className="animate-pulse-custom">
              <FaCalendarAlt className="text-xl" />
            </div>
            <p className="font-medium">লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="error-message animate-scaleIn">
            <FaExclamationCircle className="text-xl" />
            <p className="font-medium">ডেটা আনতে সমস্যা হয়েছে।</p>
          </div>
        )}

        {/* Notice Items */}
        {!isLoading && !isError && sortedEvents.length > 0 && (
          <div className="space-y-3">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className="notice-item animate-slideInLeft"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <FaCalendarAlt className="text-pmColor text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[#441a05]font-semibold text-xs leading-relaxed">
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-pmColor text-[10px] font-medium">
                      {convertToBanglaDate(event.start)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Notices */}
        {!isLoading && !isError && sortedEvents.length === 0 && (
          <div className="no-notices animate-scaleIn">
            <FaBell className="mx-auto text-3xl mb-3 opacity-50" />
            <p>কোন নোটিশ পাওয়া যায়নি</p>
          </div>
        )}

        {/* View All Button */}
        {!isLoading && !isError && sortedEvents.length > 0 && (
          <div className="flex justify-end mt-3">
            <button className="flex gap-1 justify-end items-center bg-pmColor transition-all duration-500 text-[#441a05]rounded-md p-2 text-xs animate-scaleIn">
              <FaEye />
              সব দেখুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
