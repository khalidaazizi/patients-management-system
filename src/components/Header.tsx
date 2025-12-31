// Header.tsx
import React, { useState } from "react";
import { Bell, HelpCircle, ChevronDown, Clock,Settings } from "lucide-react";
import dr_img from "../assets/dr_Img.jpg";

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: "Patient appointment at 2:00 PM", time: "10 min ago", unread: true },
    { id: 2, text: "New test results available", time: "1 hour ago", unread: true },
    { id: 3, text: "Medicine restocked", time: "2 hours ago", unread: false },
  ];

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        
        {/* Left: Brand & Time */}
        <div className="flex items-center ">
          {/* Brand
          <div className="flex items-center gap-2">
            
             <h1 className="text-lg font-bold text-gray-800 hidden md:block">MediSync Pro</h1> 
          </div> */}
          
          {/* Time & Status */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{currentTime}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">System Active</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          
          {/* Help */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            title="Help Center"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0 -right-0 h-4 w-4 bg-red-400 
                  text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl 
                shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                        notification.unread ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="text-right hidden md:block">
                <p className="font-semibold text-gray-800 text-sm">Dr. Khalid Azizi</p>
                <p className="text-xs text-gray-500">CMO</p>
              </div>
              
              <div className="h-9 w-9 rounded-full overflow-hidden ">
                <img 
                  src={dr_img} 
                  alt="Dr. Khalida Azizi" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                showProfileMenu ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl 
                shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">Dr. Khalida Azizi</p>
                  <p className="text-sm text-gray-500">Chief Medical Officer</p>
                </div>
                
                <div className="py-1">
                  <a href="/profile" className="block px-4 py-2.5 hover:bg-gray-50 
                    text-gray-700 transition-colors">
                    My Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2.5 hover:bg-gray-50 
                    text-gray-700 transition-colors">
                    Account Settings
                  </a>
                  <a href="/preferences" className="block px-4 py-2.5 hover:bg-gray-50 
                    text-gray-700 transition-colors">
                    Preferences
                  </a>
                </div>
                
                <div className="border-t border-gray-100 pt-1">
                  <button className="block w-full text-left px-4 py-2.5 
                    hover:bg-red-50 text-red-600 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      

      {/* Backdrop */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}

      {/* <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style> */}
    </header>
  );
};

export default Header;