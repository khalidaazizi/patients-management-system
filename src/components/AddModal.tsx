

                  
                  
// components / AddModal.tsx
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useToast } from "../hooks/useToast";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea" | "time";
  options?: (string | SelectOption)[];
  required?: boolean;
}

// ✅ اضافه کردن interface برای بیمار
export interface PatientOption {
  id: string | number;
  name: string;
}

interface AddModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  initialData?: Partial<T>;
  onSubmit: (
    patientData: Partial<T>,
    appointmentData?: any
  ) => Promise<boolean>;
  onlyAppointment?: boolean;
  patients?: PatientOption[]; // تغییر به PatientOption
}

function AddModal<T extends { gender?: number | string }>({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSubmit,
  onlyAppointment = false,
  patients = [],
}: AddModalProps<T>) {
  const [patientForm, setPatientForm] = useState<Partial<T>>({});
  const [appointmentForm, setAppointmentForm] = useState<any>({});
  const [showAppointment, setShowAppointment] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
 const { success, error } = useToast();

  useEffect(() => {
    if (initialData) {
      const dataCopy = { ...initialData };
      if ("gender" in dataCopy) {
        dataCopy.gender =
          dataCopy.gender === 0
            ? "Male"
            : dataCopy.gender === 1
            ? "Female"
            : dataCopy.gender;
      }
      setPatientForm(dataCopy);
    } else {
      setPatientForm({});
    }
    setAppointmentForm({});
    setErrors({});
    setShowAppointment(onlyAppointment);
   
  }, [initialData, isOpen, onlyAppointment]);

  const handlePatientChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handleAppointmentChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let tempErrors: { [key: string]: string } = {};

    if (!onlyAppointment) {
      fields.forEach((f) => {
        let value = (patientForm as any)[f.name];
         value = typeof value === "string" ? value.trim() : value;
        if (f.required && !value) {
          tempErrors[f.name] = `${f.label} is required`;
          return;
        }

        if (f.name === "patients_name" && value) {
        const nameRegex = /^(Tr\.|En\.|Mr\.|Mrs\.|Ms\.|Dr\.)?\s*[A-Za-z]+(\s[A-Za-z]+)*$/;
          if (!nameRegex.test(value)) {
            tempErrors[f.name] =
              "Enter a valid full name (e.g. Dr. Myra Ferry);";
          }
        } 

        if (f.name === "phone_number" && value) {
          const phoneRegex = /^(\+|00)?[0-9]{10,13}$/;
          if (!phoneRegex.test(value)) {
            tempErrors[f.name] =
              "Phone number must be 10–13 digits and may start with + or 00";
          }
        }

        if (f.name === "gender" && !value) {
          tempErrors[f.name] = "Gender is required";
        }

        if (f.name === "date_of_birth" && !value) {
          tempErrors[f.name] = "Date of birth is required";
        }
        // در تابع validate داخل AddModal:
if (showAppointment) {
  // ... validationهای دیگر
  
  // ✅ اضافه کردن validation برای status
  if (!appointmentForm.status) {
    tempErrors.status = "Status is required";
  }
}
      });
    }

    if (showAppointment) {
      if (onlyAppointment && !appointmentForm.patient_id) {
        tempErrors.patient_id = "Patient selection is required";
      }

      if (!appointmentForm.visit_date) {
        tempErrors.visit_date = "Visit date is required";
      }

      if (!appointmentForm.visit_time) {
        tempErrors.visit_time = "Visit time is required";
      }

      if (!appointmentForm.treatment_fee) {
        tempErrors.treatment_fee = "Treatment fee is required";
      } else if (
        isNaN(appointmentForm.treatment_fee) ||
        appointmentForm.treatment_fee <= 0
      ) {
        tempErrors.treatment_fee = "Treatment fee must be a valid number";
      }

      if (!appointmentForm.visit_type) {
        tempErrors.visit_type = "Visit type is required";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

 // در AddModal.tsx - تابع handleSave:
const handleSave = async () => {
  if (!validate()) {
    console.log("Validation failed");
    return;
  }

  setSaving(true);

  let payload: Partial<T> = { ...patientForm };

  if ("gender" in payload && typeof payload.gender === "string") {
    payload.gender = payload.gender === "Male" ? 0 : 1;
  }

  try {
    const isSuccess = await onSubmit(
      payload,
      showAppointment ? appointmentForm : undefined
    );

    if (isSuccess) {
     success(
  showAppointment
    ? "Appointment created successfully ✅"
    : "Patient created successfully ✅"
);

      onClose();
    } else {
      error("Create failed ❌");
    }

  } catch (err:any) {

    console.log("Error caught:", err);
    if (err.response?.status === 422) {
    // پیام سرور را به فرم اضافه کن
    setErrors({ ...errors, server: err.response.data.message });
  } else {
   success(
  showAppointment
    ? "Appointment created failed   ❌"
    : "Patient created failed   ❌"
    );
  }

  } finally {
    setSaving(false);
  }
};


  if (!isOpen) return null;

  // تابع helper برای رندر کردن options
  const renderOptions = (options?: (string | SelectOption)[]) => {
    if (!options) return null;

    return options.map((opt) => {
      if (typeof opt === "string") {
        return (
          <option key={opt} value={opt}>
            {opt}
          </option>
        );
      } else {
        // TypeScript اکنون می‌داند که opt یک SelectOption است
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="bg-white rounded shadow p-6 z-10 w-[650px] max-h-[90vh] overflow-auto transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-[#038a7c] font-semibold mb-6">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

       

        {!onlyAppointment && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Patient Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.name} className="col-span-2 flex flex-col">
                  
                  <label className="mb-1 font-medium text-gray-700">
                    {f.label}  {f.required && <span className=" text-red-500">*</span>}
                  </label>
                  {f.type === "select" ? (
                    <select
                      name={f.name}
                      value={(patientForm as any)[f.name] || ""}
                      onChange={handlePatientChange}
                      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                    >
                      <option value="">Select {f.label}</option>
                      {renderOptions(f.options)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      name={f.name}
                      value={(patientForm as any)[f.name] || ""}
                      onChange={handlePatientChange}
                      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f.type}
                      name={f.name}
                      value={(patientForm as any)[f.name] || ""}
                      onChange={handlePatientChange}
                      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                    />
                  )}
                  {errors[f.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[f.name]}
                    </p>
                  )}
                  {errors.server && <p className="text-red-500 text-sm mt-1">{errors.server}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* // components/AddModal.tsx - بخش appointment fields کامل: */}

{showAppointment && (
  <div className="mt-6 border-t border-gray-200 pt-6">
    <h4 className="text-xl text-[#038a7c] font-semibold mb-6">
      Appointment Details  
    </h4>
    <div className="grid grid-cols-2 gap-3">
      {onlyAppointment && (
        <div className="col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
           Select Patient  <span className="text-red-500">*</span>
          </label>
          <select
            name="patient_id"
            value={appointmentForm.patient_id || ""}
            onChange={handleAppointmentChange}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          {errors.patient_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.patient_id}
            </p>
          )}
        </div>
      )}

      {/* ✅ فیلدهای appointment کامل شامل status */}
      {[
        { 
          name: "visit_date", 
          label: "Visit Date", 
          type: "date" as const,
          required: true 
        },
        { 
          name: "visit_time", 
          label: "Visit Time", 
          type: "time" as const,
          required: true 
        },
        {
          name: "treatment_fee",
          label: "Treatment Fee",
          type: "number" as const,
          required: true
        },
        {
          name: "visit_type",
          label: "Visit Type",
          type: "select" as const,
          options: [
            "consultation",
            "follow-up",
            "checkup",
            "emergency",
          ] as string[],
          required: true
        },
        {
          name: "status", // ✅ اضافه شده
          label: "Status",
          type: "select" as const,
          options: [
            "scheduled",
            "completed", 
            "cancelled"
          ] as string[],
          required: true
        },
      ].map((f) => (
        <div key={f.name} className="col-span-2 flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          {f.type === "select" ? (
            <select
              name={f.name}
              value={appointmentForm[f.name] || ""}
              onChange={handleAppointmentChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
            >
              <option value="">Select {f.label}</option>
              {renderOptions(f.options)}
            </select>
          ) : (
            <input
              type={f.type}
              name={f.name}
              value={appointmentForm[f.name] || ""}
              onChange={handleAppointmentChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
              placeholder={f.label}
              required={f.required}
            />
          )}
          {errors[f.name] && (
            <p className="text-red-500 text-sm mt-1">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}

        <div className="flex justify-between mt-6">
          {!onlyAppointment && !showAppointment && (
            <button
              onClick={() => setShowAppointment(true)}
              className="px-4 py-2 border border-[#038a7c] text-[#038a7c] rounded hover:bg-gradient-to-r from-teal-600 to-teal-500 
                  font-medium shadow-md hover:shadow-lg 
                hover:from-teal-700 hover:to-teal-600 transition-all duration-200 hover:text-white"
            >
              Add Appointment
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#038a7c] text-white rounded hover:bg-[#027a6c] disabled:opacity-50 bg-gradient-to-r from-teal-600 to-teal-500 
                  font-medium shadow-lg hover:shadow-xl 
                hover:from-teal-700 hover:to-teal-600 transition-all duration-200"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddModal;
