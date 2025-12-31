import React, { useState, useEffect, useCallback } from "react";
import {  NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Doctor } from "../types/Type";
// import api from "../services/api";

type LayoutMode = "mobile" | "lg" | "xl";

 
const Sidebar: React.FC<{
  sidebarCollapsed: boolean;
 setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

}> = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutMode>("mobile");
  const location = useLocation();
const [doctor, setDoctor] = useState<Doctor | null>(null);

  
//  useEffect(() => {
//     api
//       .get("/user")
//       .then((res) => {
//         setDoctor([res.data]);
       
//        console.log("doctor record :", res.data);


//       })
//       .catch((err) => console.error(err))
//       .finally(() => {});
//   }, []);

// const [doctor, setDoctor] = useState<Doctor | null>(null);

// useEffect(() => {
//   api.get("/user").then(res => {
//     setDoctor(res.data);
//     console.log("doctor record :",res.data);
//   });
// }, []);
// useEffect(() => {
//   api
//     .get("/user")
//     .then((res) => {
//       // console.log("FULL RESPONSE:", res);
//       // console.log("DATA:", res.data);
//       // setDoctor([res.data]);
//     })
//     .catch((err) => {
//       // console.error("API ERROR:", err.response?.status, err.response?.data);
//     });
// }, []);
// useEffect(() => {
//   api.get("/user").then(res => {
//     setDoctor(res.data);
//     console.log(" doctor", res.data)
//   });
// }, []);

useEffect(() => {
  setDoctor({
    id: 1,
    name: "Dr. Ahmad Habibi",
    role: "doctor",
  } as Doctor);
}, []);


  /* ------------------ Resize Logic ------------------ */
  const handleResize = useCallback(() => {
    const width = window.innerWidth;

    // MOBILE
    if (width < 1024 && layout !== "mobile") {
      setLayout("mobile");
      setSidebarCollapsed(false); // موبایل همیشه باز
      return;
    }

    // LG
    if (width >= 1024 && width < 1280 && layout !== "lg") {
      setLayout("lg");
      setSidebarCollapsed(true); // lg → collapse
      return;
    }

    // XL
    if (width >= 1280 && layout !== "xl") {
      setLayout("xl");
      setSidebarCollapsed(false); // xl → باز
    }
  }, [layout, setSidebarCollapsed]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  /* بستن منوی موبایل هنگام تغییر مسیر */
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const isMobile = layout === "mobile";
  const showText = isMobile || !sidebarCollapsed;

  /* ------------------ Navigation ------------------ */
  const navItems = [
    { to: "/", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/patients", label: "Patients", icon: <Users size={20} /> },
    { to: "/appointments", label: "Appointments", icon: <Calendar size={20} /> },
    { to: "/new-prescription", label: "New Prescription", icon: <FileText size={20} /> },
    { to: "/patient-tests", label: "Patient Tests", icon: <FlaskConical size={20} /> },
    { to: "/medicines", label: "Medicines", icon: <Pill size={20} /> },
  ];

  const getLinkClass = (isActive: boolean) => `
    flex items-center
    ${showText ? "gap-3 px-4" : "justify-center px-3"}
    py-3 rounded-md transition-all duration-200 group
    ${
      isActive
        ? "bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-md"
        : "text-white/90 hover:bg-white/15 hover:text-white"
    }
    relative
  `;

  const toggleCollapse = () => {
    if (!isMobile) setSidebarCollapsed((v) => !v);
  };

  /* ------------------ Render ------------------ */
  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-teal-500 to-teal-400 text-white rounded-md shadow-md"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-40 h-full
          bg-gradient-to-b from-teal-600 via-teal-500 to-teal-600
          text-white transition-all duration-300
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col p-4 shadow-xl
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            
              <div className={` ${sidebarCollapsed ? "h-10 w-10 rounded-md bg-white/20 flex items-center justify-center text-[12px]" : "hidden"} `}>
         
              M
            </div>

            {showText && (
              <div>
                <h1 className="text-lg font-bold">MediCare</h1>
                <p className="text-sm text-white/80">Patients Mangment System</p>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="h-8 w-8 rounded-md ms-1 cursor-e-resize hover:bg-white/20 flex items-center justify-center"
            >
              {sidebarCollapsed ? <ChevronRight  size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              {item.icon}

              {showText && <span className="font-medium">{item.label}</span>}

              {/* Tooltip فقط دسکتاپ collapsed */}
              {!showText && !isMobile && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-teal-700 text-sm rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        
          <div className={`flex items-center gap-3 rounded-md  justify-center mb-5 ${sidebarCollapsed ? "bg-transparent" : "bg-white/10  p-3"} `}>
          <div className={`h-9 w-9 rounded-full  flex items-center bg-gradient-to-r from-cyan-400 to-blue-500 justify-center `}>
              <span className="font-bold text-white text-sm">JD</span>
          </div>
          
 
      {/* // <div  className="overflow-hidden">
      //   <p className="font-medium text-sm">Dr. John Doe</p>
      //   <p className="text-xs text-white/80">admin</p>
      // </div> */}

        {!sidebarCollapsed && doctor && (
  <div className="overflow-hidden">
    <p className="font-medium text-sm">{doctor.name}</p>
    <p className="text-xs text-white/80">{doctor.role}</p>
  </div>
)}



          </div>
         

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <button className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} w-full p-3 rounded-md text-white/90 hover:bg-white/15 hover:text-white transition-all duration-200`}>
            
            
            <LogOut size={20} />
            {showText && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
