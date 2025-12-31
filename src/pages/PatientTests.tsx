import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LuUsersRound } from "react-icons/lu";
import api from "../services/api";
import SearchBox from "../components/SearchBox";
import CommonTable from "../components/CommonTable";
import Pagination from "../components/Pagination";
import Filters from "../components/Filters";

/* ===================== Types ===================== */

interface PatientLab {
  id: number;
  test_name: string;
}

interface PatientVisitTest {
  id: number;
  patient_visit_id: number;
  test_id: number;
  result?: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  test?: PatientLab;
  visit?: {
    id: number;
    patient?: {
      id: number;
      patients_name: string;
    };
  };
}

type LayoutContextType = {
  sidebarCollapsed: boolean;
};

interface Column<T> {
  label: string;
  value: (row: T, i?: number) => React.ReactNode;
}

/* ===================== Component ===================== */

const PatientTests = () => {
  const { sidebarCollapsed } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  const [tests, setTests] = useState<PatientVisitTest[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [filters, setFilters] = useState({
    patient: "",
    test: "",
    status: "all" as "all" | "pending" | "completed" | "cancelled",
  });

  /* ===================== Fetch Data ===================== */
  const fetchData = async () => {
    try {
      const res = await api.get("/visit-tests?include=test,visit.patient");
      setTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ===================== Prepare Options for Selects ===================== */
  const patientOptions = useMemo(() => {
    return Array.from(
      new Set(
        tests
          .map(t => t.visit?.patient?.patients_name)
          .filter(Boolean) as string[]
      )
    )
    .sort();
  }, [tests]);

  const testOptions = useMemo(() => {
    return Array.from(
      new Set(
        tests
          .map(t => t.test?.test_name)
          .filter(Boolean) as string[]
      )
    )
    .sort();
  }, [tests]);

  /* ===================== Helpers ===================== */
  const statusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-600";
      case "pending":
        return "bg-yellow-50 text-yellow-600";
      case "cancelled":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  /* ===================== Filters ===================== */
  const filteredTests = tests.filter((t) => {
    const patientName = t.visit?.patient?.patients_name?.toLowerCase() ?? "";
    const testName = t.test?.test_name?.toLowerCase() ?? "";
    const resultText = t.result?.toLowerCase() ?? "";

    const matchesPatient = filters.patient === "" ||
      patientName.includes(filters.patient.toLowerCase());

    const matchesTest = filters.test === "" ||
      testName.includes(filters.test.toLowerCase());

    const matchesStatus = filters.status === "all" ||
      t.status === filters.status;

    const matchesGlobalSearch = query === "" ||
      patientName.includes(query.toLowerCase()) ||
      testName.includes(query.toLowerCase()) ||
      resultText.includes(query.toLowerCase());

    return matchesPatient && matchesTest && matchesStatus && matchesGlobalSearch;
  });

  const total = filteredTests.length;
  const visible = filteredTests.slice((page - 1) * perPage, page * perPage);

  /* ===================== Columns ===================== */
  const columns: Column<PatientVisitTest>[] = [
    {
      label: "#",
      value: (t) => <span className="font-mono font-semibold">{t.id}</span>,
    },
    {
      label: "Patient",
      value: (t) => (
        <div>
          <div className="font-semibold text-gray-900">
            {t.visit?.patient?.patients_name ?? "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            Visit #{t.patient_visit_id}
          </div>
        </div>
      ),
    },
    {
      label: "Test",
      value: (t) => (
        <div>
          <div className="font-medium">
            {t.test?.test_name ?? "Unknown"}
          </div>
          {t.result && (
            <div className="text-xs text-gray-500 truncate max-w-[180px]">
              {t.result}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      value: (t) => (
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${statusBadge(t.status)}`}
        >
          <span className="font-bold">{String(t.status)}</span>
        </span>
      ),
    },
    {
      label: "Actions",
      value: (t) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/patients/${t.visit?.patient?.id}/history`)}
            className="px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded font-medium shadow hover:shadow-xl text-sm cursor-pointer"
          >
            View History
          </button>
        </div>
      ),
    },
  ];

  /* ===================== Filters Config ===================== */
  const filterConfig = {
    tabs: [
      { key: "all", label: "All" },
      { key: "pending", label: "Pending" },
      { key: "completed", label: "Completed" },
      { key: "cancelled", label: "Cancelled" },
    ],
    defaultTab: "all",
    selects: [
      {
        key: "patient",
        label: "Patient",
        options: patientOptions, // فقط آرایه string[]
        defaultValue: "",
      },
      {
        key: "test",
        label: "Test",
        options: testOptions, // فقط آرایه string[]
        defaultValue: "",
      },
    ],
    hasDateRange: false,
    showActiveFilters: true,
  };

  /* ===================== Event Handlers ===================== */
  const handleTabChange = (tab: string) => {
    setFilters(prev => ({ ...prev, status: tab as typeof filters.status }));
    setPage(1);
  };

  const handleFilterChange = (updatedFilters: any) => {
    if (updatedFilters.tab) {
      setFilters(prev => ({ ...prev, status: updatedFilters.tab }));
    }
    
    if (updatedFilters.selects) {
      const newFilters = { ...filters };
      if (updatedFilters.selects.patient !== undefined) {
        newFilters.patient = updatedFilters.selects.patient;
      }
      if (updatedFilters.selects.test !== undefined) {
        newFilters.test = updatedFilters.selects.test;
      }
      setFilters(newFilters);
    }
    
    setPage(1);
  };

  // const handleClearFilter = (key: string) => {
  //   if (key === "status") {
  //     setFilters(prev => ({ ...prev, status: "all" }));
  //   } else if (key === "patient") {
  //     setFilters(prev => ({ ...prev, patient: "" }));
  //   } else if (key === "test") {
  //     setFilters(prev => ({ ...prev, test: "" }));
  //   }
  //   setPage(1);
  // };

  // const handleClearAll = () => {
  //   setFilters({
  //     patient: "",
  //     test: "",
  //     status: "all",
  //   });
  //   setQuery("");
  //   setPage(1);
  // };

  // /* ===================== Active Filters ===================== */
  // const activeFilters = {
  //   status: filters.status !== "all" ? filters.status : undefined,
  //   patient: filters.patient ? `Patient: ${filters.patient}` : undefined,
  //   test: filters.test ? `Test: ${filters.test}` : undefined,
  // };

  /* ===================== UI ===================== */
  return (
    <div className="p-4 bg-[#00978814] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl md:font-bold font-semibold text-gray-800">
            Patient Tests
          </h1>
          <p className="text-gray-500">Manage laboratory tests</p>
        </div>
        <SearchBox
          query={query}
          setQuery={setQuery}
          open={open}
          setOpen={setOpen}
          placeholder="Search tests..."
        />
      </div>

      {/* Filters */}
      <Filters
        config={filterConfig}
        sidebarCollapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        selectedFilters={{
          patient: filters.patient,
          test: filters.test,
        }}
        // activeFilters={activeFilters}
        // onClearFilter={handleClearFilter}
        // onClearAll={handleClearAll}
      />

      {/* Table */}
      <CommonTable
        columns={columns}
        data={visible}
        page={page}
        perPage={perPage}
        emptyState={
          <>
            <LuUsersRound className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-center">No tests available</p>
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
    </div>
  );
};

export default PatientTests;