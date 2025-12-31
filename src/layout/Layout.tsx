// Layout.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
// import { Outlet } from "react-router-dom";
import ContentLoader from "../components/Loader";
import { Outlet, useLocation } from "react-router-dom";
const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [loading, setLoading] = useState(false);
  const location = useLocation();

  
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400); // لودر نرم و حرفه‌ای

    return () => clearTimeout(timer);
  }, [location.pathname]);
  console.log("current path:", location.pathname);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* هدر در بالای همه چیز */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* سایدبار زیر هدر */}
         <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        {/* محتوای اصلی */}
        <main className="flex-1   relative  p-4  lg:p-3 xl:p-6 overflow-auto bg-gradient-to-br from-white ">
          
           {loading && <ContentLoader />}
           <Outlet context={{ sidebarCollapsed }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;





