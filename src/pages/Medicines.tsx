// pages/MedicinesPage.tsx
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import SearchBox from "../components/SearchBox";
import Pagination from "../components/Pagination";
import CommonTable from "../components/CommonTable";
import Filters from "../components/Filters";
import { Pill } from "lucide-react";

/* ✅ TYPE Definitions */
interface Medicine {
  id: number;
  medicines_name: string;
  created_at?: string;
  updated_at?: string;
}

interface MedicineDetail {
  id: number;
  medicines_id: number;
  packing: string;
  strength: string;
  form: string;
  status: string;
  stock?: number;
  min_stock?: number;
  price?: number;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
  medicine?: Medicine;
}

interface MedicineWithDetails {
  id: number;
  medicines_name: string;
  details: MedicineDetail[];
  total_stock: number;
  packing_count: number;
  low_stock: boolean;
  created_at?: string;
  updated_at?: string;
}
interface Column<T> {
  label: string;
  value: (row: T) => React.ReactNode;
}
export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<MedicineWithDetails[]>([]);
  // const [loading, setLoading] = useState(true);

  // Search state
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filters state
  const [filterTab, setFilterTab] = useState("all");
  const [forms, setForms] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [selectedStrength, setSelectedStrength] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch data
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      // setLoading(true);
      const [medicinesRes, detailsRes] = await Promise.all([
        api.get("/medicines"),
        api.get("/medicine-details"),
      ]);

      const medicinesData: Medicine[] = medicinesRes.data;
      const detailsData: MedicineDetail[] = detailsRes.data;

      const detailsWithMedicine = detailsData.map((detail) => ({
        ...detail,
        medicine: medicinesData.find((m) => m.id === detail.medicines_id),
      }));

      const allForms = Array.from(
        new Set(
          detailsData.map((d) => d.form?.toLowerCase().trim()).filter(Boolean)
        )
      );

      const allStrengths = Array.from(
        new Set(
          detailsData
            .map((d) => d.strength?.toLowerCase().trim())
            .filter(Boolean)
        )
      );

      setForms(allForms);
      setStrengths(allStrengths);

      const groupedMedicines: MedicineWithDetails[] = medicinesData.map(
        (medicine) => {
          const medicineDetails = detailsWithMedicine.filter(
            (d) => d.medicines_id === medicine.id
          );
          const totalStock = medicineDetails.reduce(
            (sum, d) => sum + (d.stock || 0),
            0
          );

          return {
            ...medicine,
            details: medicineDetails,
            total_stock: totalStock,
            packing_count: medicineDetails.length,
            low_stock: medicineDetails.some(
              (d) => (d.stock || 0) <= (d.min_stock || 10)
            ),
          };
        }
      );

      setMedicines(groupedMedicines);
      // setTotalPages(Math.ceil(groupedMedicines.length / perPage));
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      // setLoading(false);
    }
  };

  // Filter config for medicines
  const medicinesFilterConfig = {
    tabs: [
      { key: "all", label: "All Medicines", mobileLabel: "All" },
      { key: "available", label: "Available", mobileLabel: "Available" },
    ],
    defaultTab: "all",
    selects: [
      {
        key: "form",
        label: "Form",
        options: ["all", ...forms],
        defaultValue: "all",
        width: "w-48",
      },
      {
        key: "strength",
        label: "Strength",
        options: ["all", ...strengths],
        defaultValue: "all",
        width: "w-48",
      },
    ],
    hasDateRange: false,
    showActiveFilters: true,
    showResultsSummary: true,
    styles: {
      container:
        "bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8",
      tabActive: "bg-white text-teal-600 shadow-md shadow-teal-100",
      tabInactive: "text-gray-600 hover:text-teal-600 hover:bg-white/50",
      activeFilterBadge: "bg-blue-50 text-blue-700",
    },
  };

  const handleFilterChange = (filters: any) => {
    console.log("Applied filters:", filters);
    // اعمال فیلترها به state
    setFilterTab(filters.tab);
    setSelectedForm(filters.selects.form || "all");
    setSelectedStrength(filters.selects.strength || "all");
    // setCurrentPage(1); // بازگشت به صفحه اول هنگام تغییر فیلتر
  };

  const handleClearFilters = () => {
    setFilterTab("all");
    setSelectedForm("all");
    setSelectedStrength("all");
  };

  // Filter and sort
  const filtered = useMemo(() => {
    let list = [...medicines].flatMap((m) =>
      m.details.map((detail) => ({
        ...detail,
        medicine_name: m.medicines_name,
        medicine_id: m.id,
        total_stock: m.total_stock,
        low_stock: m.low_stock,
      }))
    );

    /* ---------------- FILTERING ---------------- */
    if (filterTab === "available") {
      list = list.filter((item) => item.status === "Available");
    } else if (filterTab === "form") {
      // فیلتر فرم از طریق selectedForm اعمال می‌شود
    } else if (filterTab === "strength") {
      // فیلتر strength از طریق selectedStrength اعمال می‌شود
    }

    if (selectedForm !== "all") {
      list = list.filter(
        (item) =>
          item.form?.toLowerCase().trim() === selectedForm.toLowerCase().trim()
      );
    }

    if (selectedStrength !== "all") {
      list = list.filter(
        (item) =>
          item.strength?.toLowerCase().trim() ===
          selectedStrength.toLowerCase().trim()
      );
    }

    /* ---------------- SEARCH ---------------- */
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) =>
        `${item.medicine_name} ${item.packing} ${item.form} ${item.strength}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [medicines, query, filterTab, selectedForm, selectedStrength]);

  const total = filtered.length;
  const visible = filtered.slice((page - 1) * perPage, page * perPage);


  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, perPage]);

  // Table columns
  const columns: Column<MedicineDetail>[] = [
    {
      label: "#",
      value: (m) => <span className="font-mono font-semibold">{ m.id}</span>,
    },
    {
      label: "Medicine Name",
      value: (t) => (
        <div>
          <div className="font-semibold text-gray-900">{t.medicine?.medicines_name }</div>
         
        </div>
      ),
    },
    {
      label: "Packing",
      value: (m) => (
        <div>
          <div className="font-medium">{m.packing }</div>
         
        </div>
      ),
    },
    
    {
  label: "Status",
  value: (m) => (
    <span
     className={`inline-flex items-center px-4 py-1 rounded text-sm font-semibold transition-all duration-200 shadow-sm ${
                  m.status === "Available"
                    ? "text-emerald-600  bg-emerald-50 group-hover:shadow-emerald-200/50"
                    : " text-rose-600 bg-rose-50 group-hover:shadow-rose-200/50"
                }`}
    >
      <span className=" font-bold">
  {String(m.status)}
</span>

    </span>
  ),
},

   
  ];


  return (
    <div className="py-5 px-2 lg:px-4 xl:p-6 bg-[#00978814] min-h-screen">
      {/* Header */}
        <div className="lg:flex  lg:items-center lg:justify-between mb-20">
          <div>
            <h1 className="text-2xl md:text-3xl md:font-bold font-semibold text-gray-800">
              Medicines Inventory
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all medicines — availability, stock levels, and pricing
            </p>
          </div>
          <div className="float-end mt-6">
            <SearchBox
              query={query}
              setQuery={setQuery}
              open={open}
              setOpen={setOpen}
              placeholder="Search appointments..."
            />
          </div>
        </div>
      {/* Filters Component */}
        <Filters
          config={medicinesFilterConfig}
          onFilterChange={handleFilterChange}
          totalResults={total}
          onTabChange={setFilterTab}
          onClearFilters={handleClearFilters}
        />

      {/* Table Container */}
      <CommonTable
        columns={columns}
        data={visible}
        page={page}
        perPage={perPage}
        emptyState={
    <>
      <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
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
    </div>
  );
}
