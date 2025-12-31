// components/EditModal.tsx - نسخه اصلاح شده
import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

import { useToast } from "../hooks/useToast";
export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "time" | "textarea";
  options?: string[];
  required?: boolean;
}

interface EditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  initialData: Partial<T>;
  onSubmit: (updated: Partial<T>) => Promise<boolean>;
  loading?: boolean;
  showGenderConversion?: boolean;
  patientName?: string;
}

function EditModal<T>({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSubmit,
  loading = false,
  showGenderConversion = false,
  patientName = "",
}: EditModalProps<T>) {
  const [form, setForm] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // توست

  const { success, error } = useToast();

  useEffect(() => {
    let processedData = { ...initialData };

    if (showGenderConversion && "gender" in processedData) {
      const genderValue = (processedData as any).gender;
      if (genderValue === 0) {
        (processedData as any).gender = "Male";
      } else if (genderValue === 1) {
        (processedData as any).gender = "Female";
      }
    }

    setForm(processedData);
    setErrors({});
  }, [initialData, showGenderConversion]);

  // تابع عمومی برای handleChange
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    let processedValue: any = value;

    // برای date و time و text و textarea بدون تغییر
    setForm({ ...form, [name]: processedValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // تابع مخصوص برای input number
  const handleNumberChange = (name: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");

    setForm({ ...form, [name]: cleanValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      const rawValue = (form as any)[f.name];
      const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

      if (
        f.required &&
        (value === "" || value === undefined || value === null)
      ) {
        newErrors[f.name] = `${f.label} is required`;
        return;
      }

      if (f.name === "patients_name" && value) {
        const nameRegex =
          /^(Tr\.|En\.|Mr\.|Mrs\.|Ms\.|Dr\.)?\s*[A-Za-z]+(\s[A-Za-z]+)*$/;
        if (!nameRegex.test(value)) {
          newErrors[f.name] = "Enter a valid full name (e.g. Dr. Myra Ferry)";
        }
      }

      if (f.name === "phone_number" && value) {
        const phoneRegex = /^(\+|00)?[0-9]{10,13}$/;
        if (!phoneRegex.test(value)) {
          newErrors[f.name] =
            "Phone number must be 10–13 digits and may start with + or 00";
        }
      }

      if (f.name === "treatment_fee" && value !== undefined && value !== "") {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          newErrors[f.name] = "Treatment fee must be a valid positive number";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // در EditModal.tsx - تابع handleSave:
  const handleSave = async () => {
    if (!validateForm() || saving) return;

    setSaving(true);

    try {
      let dataToSend = { ...form };

      // تبدیل مقادیر number از string به number قبل از ارسال
      fields.forEach((f) => {
        if (f.type === "number") {
          const value = (dataToSend as any)[f.name];
          if (value !== undefined && value !== null && value !== "") {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              (dataToSend as any)[f.name] = numValue;
            }
          }
        }
      });

      if (showGenderConversion && "gender" in dataToSend) {
        const genderValue = (dataToSend as any).gender;
        if (genderValue === "Male") {
          (dataToSend as any).gender = 0;
        } else if (genderValue === "Female") {
          (dataToSend as any).gender = 1;
        }
      }

      const result = await onSubmit(dataToSend);

      if (result) {
        success("Updated successfully ✅");
        onClose();
       
      } else {
        error("Update failed ❌");
      }
    } catch (error) {
      console.log("Error caught:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // ترکیب loading states
  const isDisabled = saving || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="bg-white rounded shadow p-6 z-10 w-[650px] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-[#038a7c] font-semibold mb-6">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isDisabled}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {patientName && (
            <div className="col-span-2 mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Patient:</span> {patientName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You are updating the appointment for this patient.
              </p>
            </div>
          )}

          {fields.map((f) => (
            <div key={f.name} className="col-span-2 flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                {f.label}{" "}
                {f.required && <span className="text-red-500">*</span>}
              </label>

              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={(form as any)[f.name] || ""}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                  disabled={isDisabled}
                >
                  <option value="">Select {f.label}</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  value={(form as any)[f.name] || ""}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                  rows={3}
                  disabled={isDisabled}
                />
              ) : f.type === "number" ? (
              
                <input
                  type="number"
                  name={f.name}
                  value={(form as any)[f.name] || ""}
                  onChange={(e) => handleNumberChange(f.name, e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                  disabled={isDisabled}
                  min={0}
                  step={1}
                  placeholder={`Enter ${f.label.toLowerCase()}`}
                />
              ) : (
                <input
                  type={f.type}
                  name={f.name}
                  value={(form as any)[f.name] || ""}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#038a7c] focus:border-transparent"
                  disabled={isDisabled}
                />
              )}

              {errors[f.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className={`px-4 py-2 bg-[#038a7c] text-white rounded hover:bg-[#027a6c] disabled:opacity-50 bg-gradient-to-r from-teal-600 to-teal-500 
                  font-medium shadow-lg hover:shadow-xl 
                hover:from-teal-700 hover:to-teal-600 transition-all duration-200 ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⟳</span>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
