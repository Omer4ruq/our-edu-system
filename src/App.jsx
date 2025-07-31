import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Breadcrumb from "./components/common/Breadcrumb";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/topNavbar/Footer";
import TopNavbar from "./components/topNavbar/TopNavbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n/i18n.js";
import { SelectedMenuProvider } from "./context/SelectedMenuContext";
import { Toaster } from "react-hot-toast";
import bgImg from '../public/images/bg.png'
// ... other imports

export default function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { pathname } = useLocation();

  // Compute module, route, and nestedRoute
  const pathSegments = pathname.split("/").filter(segment => segment);
  const moduleName = pathSegments[0]?.replace(/-/g, " ") || "";
  const routeName = pathSegments[1]?.replace(/-/g, " ") || "";
  const nestedRouteName = pathSegments[2]?.replace(/-/g, " ") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowSidebar(false);
  }, [pathname]);

  return (
    <SelectedMenuProvider>
      <div className="font-roboto text-base font-normal text-gray-600 dark:text-gray-400 dark:bg-gray-800 relative overflow-hidden">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div className={`relative text-textBlack flex flex-col justify-between min-h-screen transition-all duration-500 ease-in-out p-3 ml-0 xl:ml-72 ${showSidebar && "max-xl:opacity-65"}`}>
          {/* <div className="fixed inset-0 bg-cover bg-center z-0" style={{

             backgroundImage: `url("https://super-admin.avidtemplates.com/3.e41aa4f9.jpg")` 
            //  backgroundImage: `url(${bgImg})` 
             
             }}></div> */}
          <div className="relative z-10 w-full">
            <TopNavbar setShowSidebar={setShowSidebar} />
            {pathname.length > 1 && (
              <Breadcrumb
                module={moduleName}
                route={routeName}
                nestedRoute={nestedRouteName}
              />
            )}
            <Outlet />
          </div>
          {/* <Footer /> */}
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </SelectedMenuProvider>
  );
}



