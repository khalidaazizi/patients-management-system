import React, { useEffect, useState } from "react";
import type { Appointment } from "../types/Type";
import api from "../services/api";
import { Link } from "react-router-dom";

const UpcomingAppointments: React.FC = () => {
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

  // تابع برای گرفتن تاریخ فردا
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // تابع برای فرمت کردن تاریخ نمایش
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // مقایسه تاریخ‌ها (بدون در نظر گرفتن زمان)
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    // نمایش تاریخ به صورت DD/MM/YYYY
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const tomorrowDate = getTomorrowDate();

  // فیلتر کردن قرارهای فردا
  const tomorrowAppointments = appointments.filter((appointment) => {
    if (!appointment.visit_date) return false;
    
    // تبدیل تاریخ appointment به YYYY-MM-DD برای مقایسه
    const appointmentDate = new Date(appointment.visit_date)
      .toISOString()
      .split("T")[0];
    
    return appointmentDate === tomorrowDate;
  });

  // اگر قرار فردا نیست، ۳ قرار بعدی را نشان بده
  const upcomingAppointments = tomorrowAppointments.length > 0 
    ? tomorrowAppointments.slice(0, 3) // فقط ۳ قرار اول فردا
    : appointments
        .filter((appointment) => {
          if (!appointment.visit_date) return false;
          const appointmentDate = new Date(appointment.visit_date);
          const today = new Date();
          return appointmentDate > today;
        })
        .sort((a, b) => {
          if (!a.visit_date || !b.visit_date) return 0;
          return new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime();
        })
        .slice(0, 3); // ۳ قرار بعدی

  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Upcoming Appointments</h2>
        {tomorrowAppointments.length > 0 && (
          <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {tomorrowAppointments.length} tomor..
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment, index) => (
              <div
                key={appointment.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                        {appointment.patient?.patients_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {appointment.patient?.patients_name || "Unknown Patient"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{appointment.visit_time || "No time set"}</span>
                        <span>•</span>
                        <span>{appointment.visit_type || "Consultation"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <span className="text-sm font-medium text-gray-600">
                    {formatDisplayDate(appointment.visit_date || "")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          )}

          {appointments.length > 3 && (
            <button className="w-full mt-4 text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2 hover:bg-teal-50 rounded-lg transition-colors">
 <Link to="/Appointements" >
              View all appointments
            </Link>
            </button>
           
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;