import React, { useState, useEffect } from "react";
import { LuUsersRound } from "react-icons/lu";
import { AiOutlineDollar } from "react-icons/ai";
import { LuCalendarCheck2 } from "react-icons/lu";
import { FaRegFileAlt } from "react-icons/fa";
import { PiCalendarDotsThin } from "react-icons/pi";
import CustomSelect from "./CustomSelect";
import api from "../services/api";
import type { Patient, Appointment } from "../types/Type";

const Overview: React.FC = () => {
  const [dateRange, setDateRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReports: 0,
    totalEarnings: 0,
    totalAppointments: 0,
    patientChange: 0,
    reportChange: 0,
    earningsChange: 0,
    appointmentChange: 0,
  });

  // تابع برای محاسبه تاریخ‌ها بر اساس رنج انتخاب شده
  const getDateRange = (range: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setMonth(now.getMonth() - 1);
        break;
    }
    
    return { start, end: now };
  };

  // تابع برای محاسبه درصد تغییر
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // تابع برای محاسبه درآمد از visits
  const calculateEarningsFromVisits = (visits: Appointment[]) => {
    // فرض می‌کنیم هر visit مبلغ ثابتی دارد یا فیلد price دارد
    const pricePerVisit = 100; // به دلار - این را بر اساس منطق کسب‌وکار تنظیم کنید
    return visits.length * pricePerVisit;
  };

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        // دریافت تمام داده‌ها
        const [patientsRes, visitsRes] = await Promise.all([
          api.get("/patients"),
          api.get("/visits")
        ]);

        const allPatients: Patient[] = patientsRes.data;
        const allVisits: Appointment[] = visitsRes.data;

        // محاسبه رنج تاریخ فعلی و قبلی
        const currentRange = getDateRange(dateRange);
        const previousRange = getDateRange(dateRange);
        
        // برای رنج قبلی، تاریخ‌ها را به عقب می‌بریم
        const previousStart = new Date(previousRange.start);
        const previousEnd = new Date(previousRange.end);
        
        switch (dateRange) {
          case "daily":
            previousStart.setDate(previousStart.getDate() - 1);
            previousEnd.setDate(previousEnd.getDate() - 1);
            break;
          case "weekly":
            previousStart.setDate(previousStart.getDate() - 7);
            previousEnd.setDate(previousEnd.getDate() - 7);
            break;
          case "monthly":
            previousStart.setMonth(previousStart.getMonth() - 1);
            previousEnd.setMonth(previousEnd.getMonth() - 1);
            break;
        }

        // فیلتر کردن بیماران بر اساس تاریخ ایجاد (فرضی)
        const filterByDate = (items: any[], dateField: string, start: Date, end: Date) => {
          return items.filter(item => {
            if (!item[dateField]) return false;
            const itemDate = new Date(item[dateField]);
            return itemDate >= start && itemDate <= end;
          });
        };

        // محاسبه آمار برای رنج فعلی
        const currentPatients = filterByDate(allPatients, 'created_at', currentRange.start, currentRange.end);
        const currentVisits = filterByDate(allVisits, 'visit_date', currentRange.start, currentRange.end);
        
        // محاسبه آمار برای رنج قبلی
        const previousPatients = filterByDate(allPatients, 'created_at', previousStart, previousEnd);
        const previousVisits = filterByDate(allVisits, 'visit_date', previousStart, previousEnd);

        // محاسبه گزارش‌ها - فرض می‌کنیم هر visit یک گزارش ایجاد می‌کند
        // یا اگر API جداگانه برای گزارش‌ها دارید، اینجا fetch کنید
        const currentReports = currentVisits.length; // این یک فرض است
        const previousReports = previousVisits.length;

        // محاسبه آمار
        setStats({
          totalPatients: currentPatients.length,
          totalReports: currentReports,
          totalEarnings: calculateEarningsFromVisits(currentVisits),
          totalAppointments: currentVisits.length,
          
          // محاسبه درصد تغییرات
          patientChange: calculatePercentageChange(currentPatients.length, previousPatients.length),
          reportChange: calculatePercentageChange(currentReports, previousReports),
          earningsChange: calculatePercentageChange(
            calculateEarningsFromVisits(currentVisits),
            calculateEarningsFromVisits(previousVisits)
          ),
          appointmentChange: calculatePercentageChange(currentVisits.length, previousVisits.length),
        });

      } catch (error) {
        console.error("Error fetching overview data:", error);
        // مقادیر پیش‌فرض در صورت خطا
        setStats({
          totalPatients: 24839,
          totalReports: 245,
          totalEarnings: 92372,
          totalAppointments: 879,
          patientChange: 78,
          reportChange: 42,
          earningsChange: 23,
          appointmentChange: 56,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [dateRange]);

  // تابع فرمت کردن اعداد
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString('en-US');
    }
    return num.toString();
  };

  // تابع فرمت کردن درآمد
  // const formatEarnings = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(amount);
  // };

  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
        
        <CustomSelect
          selected={dateRange}
          setSelected={setDateRange}
          options={["daily", "weekly", "monthly"]}
          leadingIcon={<PiCalendarDotsThin />}
          upArrow={true}
          downArrow={true}
          rotateOnOpen={false}
          className="h-9 "
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 p-5 rounded-lg animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Total Patients Card */}
          <div className="bg-gradient-to-br  from-teal-600 to-teal-500 py-4 px-3 md:p-5  text-white rounded-md shadow-lg">
            <div className="flex  min-w-[120px]  flex-col-reverse md:flex-row gap-2  justify-between items-start">
              <div>
                <h6 className="text-[14px] md:text-lg     font-medium opacity-90">Total Patients</h6>
                <div className=" md:text-3xl ms-1  font-bold my-2">{formatNumber(stats.totalPatients)}</div>
                <p className="text-[12px] mt-1 md:mt-4 md-text-md opacity-90">
                  <span className="font-semibold">
                    {stats.patientChange > 0 ? '+' : ''}
                    {Math.round(stats.patientChange)}%
                  </span>{" "}
                  from last {dateRange}
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
                <LuUsersRound />
              </div>
            </div>
          </div>

          {/* Total Reports Card */}
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex justify-between   min-w-[120px]  flex-col-reverse md:flex-row gap-2 items-start">
              <div>
                <h6 className="text-[14px] md:text-lg   font-medium text-gray-600">Total Reports</h6>
                <div className="md:text-3xl ms-1 font-bold my-2 text-gray-800">{formatNumber(stats.totalReports)}</div>
                <p className="text-[12px] mt-1 md:mt-4 md-text-md text-gray-500">
                  <span className={`font-semibold ${stats.reportChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.reportChange > 0 ? '+' : ''}
                    {Math.round(stats.reportChange)}%
                  </span>{" "}
                  from last {dateRange}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                <FaRegFileAlt />
              </div>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start  gap-2 min-w-[120px]  flex-col-reverse md:flex-row">
              <div>
                <h6 className="text-[14px] md:text-lg   font-medium text-gray-600">Total Earnings</h6>
                <div className="md:text-3xl ms-1 font-bold my-2 text-gray-800">
                  {(stats.totalEarnings)} <span className="text-gray-600"> afg</span>
                </div>
                <p className="text-[12px] mt-1 md:mt-4 md-text-md text-gray-500">
                  <span className={`font-semibold ${stats.earningsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.earningsChange > 0 ? '+' : ''}
                    {Math.round(stats.earningsChange)}%
                  </span>{" "}
                  from last {dateRange}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                <AiOutlineDollar />
              </div>
            </div>
          </div>

          {/* Total Appointments Card */}
          <div className="bg-white p-5 rounded-md shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start   min-w-[120px]  flex-col-reverse md:flex-row gap-2">
              <div>
                <h6 className="text-[14px] md:text-lg   font-medium text-gray-600">Total Appointments</h6>
                <div className="md:text-3xl ms-1 font-bold my-2 text-gray-800">
                  {formatNumber(stats.totalAppointments)}
                </div>
                <p className="text-[12px] mt-1 md:mt-4 md-text-md text-gray-500">
                  <span className={`font-semibold ${stats.appointmentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.appointmentChange > 0 ? '+' : ''}
                    {Math.round(stats.appointmentChange)}%
                  </span>{" "}
                  from last {dateRange}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
                <LuCalendarCheck2 />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;