import { useEffect, useState } from "react";
import api from "../services/api";
import type { Patient } from "../types/Type";
import { Plus } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import SearchBox from "../components/SearchBox";
import EditModal from "../components/EditModal";
import type { Field } from "../components/EditModal";
import AddModal from "../components/AddModal";
import Pagination from "../components/Pagination";
import CommonTable from "../components/CommonTable";
import { LuUsersRound } from "react-icons/lu";
import {genderText} from "../types/Type"
interface Column<T> {
  label: string;
  value: (row: T) => React.ReactNode;
}
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  // const [loading, setLoading] = useState(true);
  // navigate
  const navigate = useNavigate();

  // Search filter
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // model
  const [showAdd, setShowAdd] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // edit
  const [selectedRow, setSelectedRow] = useState<Partial<Patient> | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // api
  const fetchPatients = async () => {
    // setLoading(true);
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, []);
  // age
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };



  const columns: Column<Patient>[] = [
    {
      label: "ID",
      value: (p: Patient) => (
        <span className="font-mono font-bold text-gray-800">{p.id}</span>
      ),
    },
    {
      label: "Name",
      value: (p: Patient) => (
        <div>
          <div className="font-semibold text-gray-900">{p.patients_name}</div>
        </div>
      ),
    },
    {
      label: "Age",
      value: (p: Patient) => (
        <span className="text-gray-700">{calculateAge(p.date_of_birth)}</span>
      ),
    },
    {
      label: "Gender",
      // value: (p: Patient) => <span>{p.gender === 0 ? "Male" : "Female"}</span>,
      value: (p: Patient) => <span>{genderText[p.gender]}</span>,
    },
    {
      label: "Phone",
      value: (p: Patient) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-900 font-medium">{p.phone_number}</span>
        </div>
      ),
    },
    {
      label: "Actions",
      value: (p: Patient) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedRow(p);
              setEditModalOpen(true);
            }}
            className="px-3 py-2 bg-blue-50 shadow-lg text-blue-700 rounded text-sm cursor-pointer"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => navigate(`/patients/${p.id}/history`)}
            className="px-3 py-2  bg-gradient-to-r from-teal-600 to-teal-500 
                text-white  rounded font-medium shadow-lg hover:shadow-xl 
                hover:from-teal-700 hover:to-teal-600 transition-all duration-200  text-sm cursor-pointer"
          >
            <RiArrowRightDoubleFill />
          </button>
        </div>
      ),
    },
  ];

  const createPatient = async (
    patientData: Partial<Patient>,
    appointmentData?: any
  ): Promise<boolean> => {
    try {
      const res = await api.post("/patients", patientData);
      const newPatient = res.data;

      if (appointmentData) {
        await api.post("/visits", {
          ...appointmentData,
          patient_id: newPatient.id,
        });
      }

      fetchPatients();

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  };

  // در Patients.tsx - تابع updatePatient را اینگونه تغییر دهید:
  const updatePatient = async (
    updatedData: Partial<Patient>
  ): Promise<boolean> => {
    if (!selectedRow?.id) return false;

    try {
      await api.put(`/patients/${selectedRow.id}`, updatedData);
      fetchPatients(); // refresh list
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
  let list = [...patients];
  const total = list.length;
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter((a) => a.patients_name?.toLowerCase().includes(q));
  }

  const visible = list.slice((page - 1) * perPage, page * perPage);
  // تعریف فیلدهای مودال برای صفحه Patients
  const patientFields: Field[] = [
    { name: "patients_name", label: "Patient Name", type: "text" },
    { name: "phone_number", label: "Phone", type: "text" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female"],
    },
    { name: "date_of_birth", label: "Date of Birth", type: "date" },
  ];

  // if (loading)
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50 ">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009788d5]"></div>
  //     </div>
  //   );

  return (
    <div className="  py-5 px-2 lg:px-4 xl:p-6 bg-[#00978814] min-h-screen">
      {/* Header */}
      <div className="lg:flex lg:items-center lg:justify-between mb-14 ">
        <div className="mb-10 lg:mb-0 ">
          <h1 className="text-2xl md:text-3xl md:font-bold font-semibold text-gray-800">Patients Management </h1>
          <p className="text-sm  mt-1 text-gray-500">
            Manage all patient records — personal details, medical history and
            profiles{" "}
          </p>
        </div>

        <div className="flex justify-end  items-center gap-3 ">
          <SearchBox
            query={query}
            setQuery={setQuery}
            open={open}
            setOpen={setOpen}
            placeholder="Search patients..."
          />

          <button
            onClick={() => setShowAdd(true)}
            className="text-sm md:text-md inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 
                text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl 
                hover:from-teal-700 hover:to-teal-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5" /> Add Patient
          </button>
        </div>
      </div>
      {/* main content */}

      {/* <div className="bg-white rounded shadow  "> */}
      <CommonTable
        columns={columns}
        data={visible}
        page={page}
        perPage={perPage}
        emptyState={
          <>
            <LuUsersRound className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No Patients available</p>
            <p className="text-sm text-gray-400 mt-1">
              Add new Patients to see them here
            </p>
          </>
        }
        // renderRow={(p) => (
        //   <tr key={p.id} className="border-b border-gray-300 hover:bg-slate-50">
        //     <td className="p-4">
        //       <button
        //         onClick={() => {
        //           setSelectedRow(p);
        //           setEditModalOpen(true);
        //         }}
        //         className="px-3 py-2 bg-blue-50 shadow-lg text-blue-700 rounded text-sm cursor-pointer"
        //       >
        //         <FiEdit />
        //       </button>

        //       <button
        //         className="px-3 py-2 ms-3 bg-gradient-to-r from-teal-600 to-teal-500 
        //         text-white  rounded font-medium shadow-lg hover:shadow-xl 
        //         hover:from-teal-700 hover:to-teal-600 transition-all duration-200  text-sm cursor-pointer"
        //         onClick={() => navigate(`/patients/${p.id}/history`)}
        //       >
        //         <RiArrowRightDoubleFill />
        //       </button>
        //     </td>
        //   </tr>
        // )}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
      />
      {/* </div> */}

      {/* Edit Modal */}
      {editModalOpen && selectedRow && (
        <EditModal<Patient>
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Patient"
          fields={patientFields}
          initialData={selectedRow}
          onSubmit={updatePatient}
          showGenderConversion={true} // ✅ این را اضافه کنید
          // patientName={selectedRow.patients_name} // ✅ این هم اضافه کنید اگر EditModal نیاز دارد
        />
      )}

      <AddModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Patient"
        fields={[
          {
            name: "patients_name",
            label: "Patient Name",
            type: "text",
            required: true,
          },
          {
            name: "phone_number",
            label: "Phone",
            type: "text",
            required: true,
          },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            required: true,
            options: ["Male", "Female"],
          },
          {
            name: "date_of_birth",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
        ]}
        onSubmit={createPatient}
      />
    </div>
  );
}




