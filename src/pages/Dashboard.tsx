import Overview from "../components/Overview";
import AppointmentSchedule from "../components/AppointmentSchedule";
import UpcomingAppointments from "../components/UpcomingAppointments";
import Notifications from "../components/Notifications";
// bg-gradient-to-br from-stone-50 to-stone-100
const Dashboard = () => {
  return (
    <div className="min-h-screen  bg-[#00978814]  py-5 px-2 lg:px-4 xl:p-6 ">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ">
        <div>
          <h1 className="text-2xl md:text-3xl md:font-bold text-gray-800  font-semibold">
            Medical Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, Dr. Smith</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Overview />
          {/* Appointment Schedule */}
          <AppointmentSchedule />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <UpcomingAppointments />
          {/* Notifications */}
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
