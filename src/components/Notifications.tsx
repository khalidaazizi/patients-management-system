// Notifications.tsx
import React from "react";
import { FaRegUser, FaRegComments } from "react-icons/fa";
import user_img from "../assets/dr_Img.jpg";

type Notification = {
  message: string;
  time?: string;
  senderName?: string;
  senderImage?: string;
};

const notifications: Notification[] = [
  {
    message: "you have 38 appointment requests.",
    time: "08:30 AM",
  },
  {
    message: "New test results are available for Mariam Karimi.",
    senderName: "Maryam Karimi",
    time: "09:00 AM",
    senderImage: user_img,
  },
  {
    message: "Khalida sent you a message regarding her appointment.",
    senderName: "Khalida Azizi",
    time: "11:20 AM",
  },
  {
    message: "someone wants to become your patient.",
    time: "10:15 AM",
  },
];

const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const renderAvatar = (notif: Notification) => {
  if (notif.senderImage) {
    return (
      <img
        src={notif.senderImage}
        alt={notif.senderName ?? "user"}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }

  if (notif.senderName) {
    const initials = getInitials(notif.senderName);
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
        style={{ backgroundColor: "#e6f7f5", color: "#006f63" }}
      >
        {initials}
      </div>
    );
  }

  const lower = notif.message.toLowerCase();
  if (
    lower.includes("appointment") ||
    lower.includes("request") ||
    lower.includes("requests")
  ) {
    return (
      <div className="bg-[#00978811] p-3 rounded-full">
        <FaRegComments className="text-[#009788] text-lg" />
      </div>
    );
  }

  return (
    <div className="bg-[#00978811] p-3 rounded-full">
      <FaRegUser className="text-[#009788] text-lg" />
    </div>
  );
};

const Notifications: React.FC = () => {
  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        {notifications.length > 0 && (
          <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {notifications.length} new
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
          >
            {/* آواتار هوشمند */}
            {renderAvatar(notif)}

            {/* متن و زمان */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug">
                {notif.message}
              </p>
              {notif.time && (
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              )}
            </div>

            {/* دات نشان‌دهنده خوانده نشده */}
            <div className="w-2 h-2 rounded-full bg-teal-500 mt-1"></div>
          </div>
        ))}
      </div>

      {/* دکمه مشاهده همه */}
      {notifications.length > 3 && (
        <button className="w-full mt-4 text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2 hover:bg-teal-50 rounded-lg transition-colors">
          View all notifications
        </button>
      )}
    </div>
  );
};

export default Notifications;
