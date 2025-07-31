import { FaBars } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";
import Profile from "./Profile";
import SchoolName from "./SchoolName";
import { themeList } from "../../Theme/themeList";
import { MdColorLens } from "react-icons/md";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export default function TopNavbar({ setShowSidebar }) {
  const [isFloating, setIsFloating] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored ? JSON.parse(stored) : themeList[0];
  });
  const languages = [
    { code: "en", name: "English", flag: "https://flagcdn.com/w20/gb.png" },
    { code: "bn", name: "বাংলা", flag: "https://flagcdn.com/w20/bd.png" },
  ];
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("language");
    return stored ? JSON.parse(stored) : languages[0];
  });
  const themeMenuRef = useRef(null);
  const languageMenuRef = useRef(null);

  // Apply theme colors
  const applyTheme = (selectedTheme) => {
    document.documentElement.style.setProperty("--pm-color", selectedTheme.primary);
    document.documentElement.style.setProperty("--sec-color", selectedTheme.secondary);
    localStorage.setItem("theme", JSON.stringify(selectedTheme));
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem("language", JSON.stringify(language));
  }, [language]);

  // Handle clicks outside to close language menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <div className="fixed top-0 z-50 h-[8vh] w-full px-6 flex justify-center items-center">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideInFromRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOutToRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideInFromRight {
            animation: slideInFromRight 0.3s ease-out forwards;
          }
          .animate-slideOutToRight {
            animation: slideOutToRight 0.3s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
          }
          .navbar-bg {
            background: rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.3s ease;
          }
        `}
      </style>

      <div className={`w-full py-3 sm:py-3 relative transition-all duration-300 ${isFloating ? "navbar-bg" : ""} flex items-center justify-between`}>

        {/* Left Section */}
        <div className="flex gap-3 sm:gap-4 items-center">
          <button
            className="w-8 h-8 p-1.5 rounded border border-white/30 bg-pmColor text-white hover:bg-blue-600/20 btn-glow xl:hidden transition-all duration-300 ease-in-out"
            onClick={() => setShowSidebar((state) => !state)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FaBars className="w-full h-full animate-scaleIn" />
          </button>
          <div className="animate-fadeIn">
            <SchoolName />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <div className="relative mb-1">
            <button
              onClick={() => setShowLanguageMenu((prev) => !prev)}
              className="flex items-center gap-2 text-pmColor border rounded-full border-pmColor px-2 py-1 hover:opacity-90 transition"
              title="Change Language"
            >
              <img
                src={language.flag}
                alt={`${language.name} flag`}
                className="w-6 h-6 object-contain"
              />
              <span className="text-sm">{language.name}</span>
            </button>

            {showLanguageMenu && (
              <div
                ref={languageMenuRef}
                className={`absolute right-0 mt-2 w-48 bg-black/50 backdrop-blur-3xl border border-white/20 text-pmColor p-2 rounded-lg z-[99999999] animate-scaleIn`}
              >
                <h4 className="font-semibold text-sm px-1 mb-2">Choose Language</h4>
                {languages.map((item) => (
                  <div
                    key={item.code}
                    onClick={() => {
                      setLanguage(item);
                      setShowLanguageMenu(false);
                      window.location.reload();
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200 ${
                      language.code === item.code ? "bg-white/5" : ""
                    }`}
                  >
                    <img
                      src={item.flag}
                      alt={`${item.name} flag`}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-xs">{item.name}</span>
                    {language.code === item.code && (
                      <IoCheckmarkCircleOutline className="ml-auto text-xl" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu((prev) => !prev)}
              className="text-3xl hover:opacity-90 text-pmColor border rounded-full border-pmColor transition"
              title="Change Theme"
            >
              <MdColorLens />
            </button>

            {showThemeMenu && (
              <div
                ref={themeMenuRef}
                className={`fixed -right-3 top-0 h-screen bg-black/50 backdrop-blur-3xl border-l border-white/20 text-pmColor w-72 p-3 z-[99999999] space-y-2 ${showThemeMenu ? "animate-slideInFromRight" : "animate-slideOutToRight"}`}
              >
                <h4 className="font-semibold text-sm px-1">Choose Theme</h4>
                <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                  {themeList.map((item, index) => {
                    const isSelected = theme.name === item.name;
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setTheme(item);
                          applyTheme(item); // Apply theme immediately
                          setShowThemeMenu(false);
                        }}
                        className={`relative group flex items-center gap-3 py-2 rounded-lg cursor-pointer transition-all duration-200`}
                      >
                        <div
                          className="w-full h-20 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.bg})` }}
                        >
                          {isSelected && (
                            <div className="absolute top-[50%] translate-y-[-50%] translate-x-[50%] left-[-50%] w-full h-20 bg-white/5 flex items-center justify-center text-pmColor text-sm rounded-lg">
                              <IoCheckmarkCircleOutline className="text-4xl" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="animate-scaleIn" style={{ animationDelay: "0.4s" }}>
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
}