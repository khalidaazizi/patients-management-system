// AppointmentSchedule.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import type { Appointment } from "../types/Type";


const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border border-blue-200",
  completed: "bg-green-100 text-green-800 border border-green-200",
  canceled: "bg-red-100 text-red-800 border border-red-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const statusLabels: Record<string, string> = {
  Scheduled: "Scheduled",
  Completed: "Completed",
  Canceled: "Canceled",
  Pending: "Pending",
  Confirmed: "Confirmed",
};

const AppointmentSchedule: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/visits")
      .then((res) => {
        setAppointments(res.data);
      })
      .catch(() => {
        setError("Failed to load appointments");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // تابع برای گرفتن تاریخ امروز
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // فیلتر کردن قرارهای امروز
  const todayAppointments = appointments.filter((appointment) => {
    if (!appointment.visit_date) return false;
    
    // تبدیل تاریخ appointment به YYYY-MM-DD برای مقایسه
    const appointmentDate = new Date(appointment.visit_date)
      .toISOString()
      .split("T")[0];
    
    return appointmentDate === getTodayDate();
  });

  // مرتب‌سازی بر اساس زمان
  const sortedTodayAppointments = [...todayAppointments].sort((a, b) => {
    const timeA = a.visit_time || "00:00";
    const timeB = b.visit_time || "00:00";
    return timeA.localeCompare(timeB);
  });

  // فرمت زمان به خوانا
  const formatTime = (timeString: string) => {
    if (!timeString) return "No time";
    
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const minute = minutes || "00";
      
      if (hour >= 12) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute} PM`;
      } else {
        const displayHour = hour === 0 ? 12 : hour;
        return `${displayHour}:${minute} AM`;
      }
    } catch {
      return timeString;
    }
  };

  // فرمت نوع ویزیت
  const formatVisitType = (type?: string) => {
    if (!type) return "Consultation";
    
    const types: Record<string, string> = {
      consultation: "Consultation",
      followup: "Follow-up",
      follow_up: "Follow-up",
      test: "Test Result",
      test_result: "Test Result",
      emergency: "Emergency",
      routine: "Routine Check",
    };
    
    return types[type.toLowerCase()] || type;
  };

  // گرفتن وضعیت appointment
  const getAppointmentStatus = (appointment: Appointment) => {
    if (appointment.status) return appointment.status;
    
    // منطق پیش‌فرض بر اساس زمان
    const now = new Date();
    const today = getTodayDate();
    
    if (appointment.visit_date < today) return "Completed";
    if (appointment.visit_date > today) return "Scheduled";
    
    // اگر تاریخ امروز است، بر اساس زمان
    const appointmentTime = appointment.visit_time;
    if (appointmentTime) {
      const [hours] = appointmentTime.split(":");
      const appointmentHour = parseInt(hours, 10);
      const currentHour = now.getHours();
      
      if (appointmentHour < currentHour) return "Completed";
      if (appointmentHour === currentHour) return "In Progress";
    }
    
    return "Scheduled";
  };

  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
          {!loading && !error && (
            <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
              {sortedTodayAppointments.length} appointments
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-3 text-gray-600">Loading schedule...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {sortedTodayAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Visit Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTodayAppointments.map((appointment, index) => {
                    const status = getAppointmentStatus(appointment);
                    const statusColor = statusColors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
                    const statusLabel = statusLabels[status] || status;
                    
                    return (
                      <tr
                        key={appointment.id || index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                           
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patient?.patients_name || "Unknown Patient"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(appointment.visit_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {formatVisitType(appointment.visit_type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No appointments today
              </h3>
              <p className="text-gray-500">
                There are no scheduled appointments for today.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentSchedule;