import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { GiCheckMark } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Appointment, Status, Patient } from "../types/Type";
import SearchBox from "../components/SearchBox";
import AddModal from "../components/AddModal";
import type { Field } from "../components/EditModal";
import type { PatientOption } from "../components/AddModal";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import Pagination from "../components/Pagination";
import CommonTable from "../components/CommonTable";
import { useOutletContext } from "react-router-dom";
import Filters from "../components/Filters";
import { LuCalendarCheck2 } from "react-icons/lu";

type LayoutContextType = {
  sidebarCollapsed: boolean;
};
type Column<T> = {
  label: string;
  value: (item: T) => React.ReactNode;
};

export default function Appointements() {
  const { sidebarCollapsed } = useOutletContext<LayoutContextType>();
  const [appointments, setAppointment] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);

  // Navigation
  const navigate = useNavigate();

  // // Search state
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filters state
  const [filterTab, setFilterTab] = useState<
    "all" | "past" | "upcoming" | "canceled" | "completed" | "Scheduled"
  >("all");
  const [visitFilter, setVisitFilter] = useState("All Types");
  const [sortBy, setSortBy] = useState("time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // Quick Add modal
  const [showAdd, setShowAdd] = useState(false);
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);


// تبدیل Patient[] به PatientOption[]
  const patientOptions: PatientOption[] = patients.map((p) => ({
    id: p.id,
    name: p.patients_name,
  }));

  // API calls
  useEffect(() => {
    api
      .get("/visits")
      .then((res) => {
        setAppointment(res.data);
        console.log(res.data[0]);
      })
      .catch((err) => console.error(err))
      .finally(() => {});
  }, []);

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data));
  }, []);


  // Filter config برای کامپوننت Filters
  const filterConfig = {
    tabs: [
      { key: "all", label: "All", mobileLabel: "All" },
      { key: "upcoming", label: "Upcoming", mobileLabel: "Up" },
      { key: "Scheduled", label: "Scheduled", mobileLabel: "Sched" },
      { key: "completed", label: "Completed", mobileLabel: "Done" },
      { key: "canceled", label: "Canceled", mobileLabel: "Cancel" },
      { key: "past", label: "Past", mobileLabel: "Past" },
    ],
    defaultTab: "all",
    selects: [
      {
        key: "visitType",
        label: "Visit Type",
        options: [
          "All Types",
          "Consultation",
          "Follow-up",
          "checkup",
          "Emergency",
        ],
        defaultValue: "All Types",
      },
      {
        key: "sortBy",
        label: "Sort By",
        options: ["time", "patient", "recent"],
        defaultValue: "time",
      },
    ],
    hasDateRange: true,
    showActiveFilters: true,
  };

  // Handlers برای کامپوننت Filters
  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
  };

  const handleTabChange = (tabKey: string) => {
    setFilterTab(tabKey as any);
  };

  const handleSelectChange = (key: string, value: string) => {
    if (key === "visitType") {
      setVisitFilter(value);
    } else if (key === "sortBy") {
      setSortBy(value);
    }
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleClearFilters = () => {
    setFilterTab("all");
    setVisitFilter("All Types");
    setSortBy("time");
    setDateFrom("");
    setDateTo("");
  };


  // Filtering logic
  const filtered = useMemo(() => {
    let list = [...appointments];

    // Filter by tab
    const today = new Date().toISOString().slice(0, 10);

    const filters = {
      past: (a: Appointment) => a.visit_date < today,
      upcoming: (a: Appointment) => a.visit_date >= today,
      canceled: (a: Appointment) => a.status === "cancelled",
      completed: (a: Appointment) => a.status === "completed",
      Scheduled: (a: Appointment) => a.status === "scheduled",
    };

    if (filterTab !== "all") {
      list = list.filter(filters[filterTab]);
    }

    if (visitFilter !== "All Types") {
      list = list.filter(
        (a) => a.visit_type?.toLowerCase() === visitFilter.toLowerCase()
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((a) => {
        const itemDate = new Date(
          `${a.visit_date ?? ""}T${a.visit_time ?? "00:00"}`
        ).getTime();
        return itemDate >= from;
      });
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      list = list.filter((a) => {
        const itemDate = new Date(
          `${a.visit_date ?? ""}T${a.visit_time ?? "00:00"}`
        ).getTime();
        return itemDate <= to;
      });
    }

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        a.patient?.patients_name?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "time") {
      list.sort((x, y) => {
        const dateX = new Date(`${x.visit_date ?? ""}T${x.visit_time ?? ""}`);
        const dateY = new Date(`${y.visit_date ?? ""}T${y.visit_time ?? ""}`);
        return dateX.getTime() - dateY.getTime();
      });
    } else if (sortBy === "patient") {
      list.sort((x, y) =>
        x.patient.patients_name.localeCompare(y.patient.patients_name)
      );
    } else if (sortBy === "recent") {
  list.sort((x, y) => y.id - x.id);
}

    return list;
  }, [appointments, filterTab, visitFilter, query, sortBy, dateFrom, dateTo]);

  const total = filtered.length;
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, perPage]);

  const toggleStatus = (id: number, newStatus: Status) => {
    setAppointment((s) =>
      s.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Add appointment
  const AddAppointment = async (patientData: any, appointmentData?: any) => {
    try {
      const dataToSend = appointmentData || patientData;

      if (!dataToSend.status) {
        dataToSend.status = "scheduled";
      }

      if (dataToSend.treatment_fee) {
        dataToSend.treatment_fee = Number(dataToSend.treatment_fee);
      }

      console.log("Data being sent to API:", dataToSend);

      await api.post("/visits", dataToSend);

      const res = await api.get("/visits");
      setAppointment(res.data);

      setShowAdd(false);
      return true;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      return false;
    }
  };

  // Edit appointment fields
  const editAppointmentFields: Field[] = [
    {
      name: "visit_date",
      label: "Visit Date",
      type: "date",
      required: true,
    },
    {
      name: "visit_time",
      label: "Visit Time",
      type: "time",
      required: true,
    },
    {
      name: "treatment_fee",
      label: "Treatment Fee",
      type: "number",
      required: true,
    },
    {
      name: "visit_type",
      label: "Visit Type",
      type: "select",
      options: ["consultation", "follow-up", "checkup", "emergency"],
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["scheduled", "completed", "cancelled"],
      required: true,
    },
  ];

  const handleEditAppointment = async (updatedData: any) => {
    try {
      const dataToSend = {
        ...updatedData,
        patient_id: editTarget?.patient_id,
        treatment_fee: Number(updatedData.treatment_fee) || 0,
      };

      await api.put(`/visits/${editTarget?.id}`, dataToSend);

      const res = await api.get("/visits");
      setAppointment(res.data);

      return true;
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      return false;
    }
  };

  // Get patient name by ID
  const getPatientNameById = (patientId: number): string => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.patients_name || "Unknown Patient";
  };

  const patientName =
    editTarget?.patient?.patients_name ||
    getPatientNameById(editTarget?.patient_id || 0) ||
    "Unknown Patient";

  // Table columns
  const columns: Column<Appointment>[] = [
    {
      label: "ID",
      value: (a: Appointment) => (
        <span className="font-mono font-bold text-gray-800">{a.id}</span>
      ),
    },
    {
      label: "Name",
      value: (a: Appointment) => (
        <div className="font-semibold text-gray-900">
          {a.patient?.patients_name || "Unknown Patient"}
        </div>
      ),
    },
    {
      label: "Date",
      value: (a: Appointment) => (
        <span className="text-gray-700">{a.visit_date}</span>
      ),
    },
    {
      label: "Time",
      value: (a: Appointment) => (
        <span className="text-gray-700">{a.visit_time}</span>
      ),
    },
    {
      label: "Treatment Fee",
      value: (a: Appointment) => (
        <span className="block text-center">{a.treatment_fee}</span>
      ),
    },
    {
      label: "Status",
      value: (a: Appointment) => <StatusBadge status={a.status} />,
    },
    {
      label: "Actions",
      value: (a: Appointment) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStatus(a.id, "completed");
              }}
              className="px-3 py-2 bg-green-100 shadow-md text-green-700 rounded text-sm cursor-pointer"
            >
              <GiCheckMark />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditTarget(a);
                setEditModalOpen(true);
              }}
              className="px-3 py-2 bg-blue-100 shadow-md text-blue-700 rounded text-sm cursor-pointer"
            >
              <FiEdit />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(a);
                setDeleteModalOpen(true);
              }}
              className="px-3 py-2 bg-red-100 shadow-md text-red-700 rounded text-sm cursor-pointer"
            >
              <RiDeleteBin6Line />
            </button>
            <button
              className="px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded font-medium shadow-md hover:shadow-xl transition-all duration-200 text-sm cursor-pointer"
              onClick={() => navigate(`/patients/${a.patient_id}/history`)}
            >
              <RiArrowRightDoubleFill />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="py-5 px-2 lg:px-4 xl:p-6 bg-[#00978814] min-h-screen">
      {/* Header */}
      <div className="lg:flex lg:items-center lg:justify-between mb-14">
        <div className="mb-5 lg:mb-0">
          <h1 className="text-2xl md:text-3xl md:font-bold font-semibold text-gray-800">Appointments</h1>
          <p className="text-sm mt-1 text-gray-500">
            Manage all appointments — past, upcoming and canceled
          </p>
        </div>

        <div className="flex justify-end items-center gap-3">
          <SearchBox
            query={query}
            setQuery={setQuery}
            open={open}
            setOpen={setOpen}
            placeholder="Search appointments..."
          />

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>
      </div>

      {/* Filters Component */}
      <Filters
        config={filterConfig}
        onFilterChange={handleFilterChange}
        sidebarCollapsed={sidebarCollapsed}
        selectedFilters={{
          visitType: visitFilter,
          sortBy: sortBy,
        }}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onTabChange={handleTabChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main content */}
      <CommonTable
        columns={columns}
        data={visible}
        page={page}
        perPage={perPage}
        emptyState={
          <>
            <LuCalendarCheck2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No medicines available</p>
            <p className="text-sm text-gray-400 mt-1">
              Add new medicines to see them here
            </p>
          </>
        }
      />

      {/* Pagination */}
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
      />

      {/* Delete Modal */}
      {deleteModalOpen && deleteTarget && (
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          target={deleteTarget}
          getName={(item) => item.patient?.patients_name || "this item"}
          deleteEndpoint={(id) => `/visits/${id}`}
          onDeleteSuccess={(id) =>
            setAppointment((prev) => prev.filter((v) => v.id !== id))
          }
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && editTarget && (
        <EditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditTarget(null);
          }}
          title="Edit Appointment"
          fields={editAppointmentFields}
          initialData={{
            visit_date: editTarget.visit_date || "",
            visit_time: editTarget.visit_time || "",
            treatment_fee: editTarget.treatment_fee || 0,
            visit_type: editTarget.visit_type || "consultation",
            status: editTarget.status || "scheduled",
          }}
          onSubmit={handleEditAppointment}
          loading={false}
          showGenderConversion={false}
          patientName={patientName}
        />
      )}

      {/* Add Modal */}
      <AddModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Appointment"
        fields={[
          {
            name: "visit_date",
            label: "Visit Date",
            type: "date",
            required: true,
          },
          {
            name: "visit_time",
            label: "Visit Time",
            type: "time",
            required: true,
          },
          {
            name: "treatment_fee",
            label: "Treatment Fee",
            type: "number",
            required: true,
          },
          {
            name: "visit_type",
            label: "Visit Type",
            type: "select",
            options: ["consultation", "follow-up", "checkup", "emergency"],
            required: true,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["scheduled", "completed", "cancelled"],
            required: true,
          },
        ]}
        onlyAppointment={true}
        patients={patientOptions}
        onSubmit={AddAppointment}
      />
    </div>
  );
}

function StatusBadge({ status, small }: { status: Status; small?: boolean }) {
  const base = `px-3 py-1 rounded text-sm font-medium ${
    small ? "text-xs px-2 py-0.5" : ""
  }`;
  if (status === "scheduled")
    return <span className={`${base} bg-blue-50 text-blue-700`}>{status}</span>;
  if (status === "completed")
    return (
      <span className={`${base} bg-green-50 text-green-700`}>{status}</span>
    );
  if (status === "cancelled")
    return <span className={`${base} bg-red-50 text-red-700`}>{status}</span>;
  return (
    <span className={`${base} bg-yellow-50 text-yellow-600`}>{status}</span>
  );
}
