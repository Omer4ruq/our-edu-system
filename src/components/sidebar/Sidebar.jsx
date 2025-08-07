import { useEffect, useRef, useState } from "react";
import { MdHighlightOff } from "react-icons/md";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarSearchMenu from "./SidebarSearchMenu";

export default function Sidebar({ showSidebar, setShowSidebar }) {
  const sidebarRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSidebar]);

  return (
    <div className="">
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
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .report-button:hover {
            background-color: #3B567D;
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .report-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>
      <nav
        ref={sidebarRef}
        id="sidebar-menu"
        className={`fixed transition-all p-5 rounded-lg bg-pmColor duration-300 ease-in-out h-[92vh] bottom-0 shadow-sm w-0 xl:w-72 ${showSidebar && "w-72"
          } z-20 animate-fadeIn`}
      >

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover z-0"
        // style={{
        //   backgroundImage:
        //     "url('https://shaha.ancorathemes.com/wp-content/uploads/2017/06/bg-15.jpg?id=370')",
        // }}
        ></div>

        {/* Overlay Color */}
        {/* <div className="absolute inset-0 bg-black opacity-20 z-0"></div> */}

        {/* Sidebar Content */}
        <div className="relative h-full overflow-y-auto scrollbar-webkit z-10 text-[#441a05]bg-white/10 backdrop-blur-3xl rounded-xl">
          <SidebarHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {!searchTerm ? (
            <SidebarMenu />
          ) : (
            <SidebarSearchMenu searchTerm={searchTerm} />
          )}
          <MdHighlightOff
            className="text-[#441a05]w-6 h-6 absolute top-[14px] right-3 xl:hidden cursor-pointer"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      </nav>
    </div>
  );
}
