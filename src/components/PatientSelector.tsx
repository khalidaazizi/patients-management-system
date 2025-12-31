// components/PatientSelector.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { Search, UserPlus, X } from "lucide-react";

import CustomSelect from "./CustomSelect";
import type { PatientSelectorProps, Patient } from "../types/Type";

const PatientSelector = ({
  patients,
  selectedPatient,
  onPatientSelect,
  onNewPatient,
  error,
}: PatientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchList, setShowSearchList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // محاسبه بیماران با نام تکراری
  const duplicateNamesMap = useMemo(() => {
    const nameCount: Record<string, number> = {};
    patients.forEach(patient => {
      nameCount[patient.patients_name] = (nameCount[patient.patients_name] || 0) + 1;
    });
    return nameCount;
  }, [patients]);

  // ایجاد نام نمایشی منحصر به فرد برای هر بیمار
  const getPatientDisplayName = (patient: Patient): string => {
    if (duplicateNamesMap[patient.patients_name] > 1) {
      // اگر نام تکراری است، شماره تلفن کامل را نشان می‌دهیم
      return `${patient.patients_name} (${patient.phone_number})`;
    }
    return patient.patients_name;
  };

  // پیدا کردن بیمار بر اساس نام نمایشی
  const findPatientByDisplayName = (displayName: string): Patient | null => {
    if (!displayName || displayName === "Select Patient") return null;
    
    // بررسی اگر شماره تلفن داخل پرانتز هست
    if (displayName.includes('(') && displayName.includes(')')) {
      const match = displayName.match(/^(.*?)\s*\(([^)]+)\)$/);
      if (match) {
        const [, name, phone] = match;
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();
        
        // جستجوی دقیق با نام و شماره تلفن
        return patients.find(p => 
          p.patients_name === trimmedName && 
          p.phone_number === trimmedPhone
        ) || null;
      }
    }
    
    // اگر پرانتز ندارد، فقط بر اساس نام جستجو کن
    return patients.find(p => p.patients_name === displayName) || null;
  };

  // فیلتر بیماران برای جستجو
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.patients_name.toLowerCase().includes(query) ||
        patient.phone_number.includes(query) ||
        getPatientDisplayName(patient).toLowerCase().includes(query)
    );
  }, [patients, searchQuery, duplicateNamesMap]);

  // بستن dropdown وقتی خارج کلیک می‌شود
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSearchList(false);
        setSearchQuery("");
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    onPatientSelect(patient);
    setShowSearchList(false);
    setSearchQuery("");
    setOpen(false);
  };

  const handleClearSelection = () => {
    onPatientSelect(null);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
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

  // ایجاد لیست options برای CustomSelect
  const selectOptions = useMemo(() => {
    return [
      "",
      ...patients.map(patient => getPatientDisplayName(patient))
    ];
  }, [patients, duplicateNamesMap]);

  // مقدار انتخاب شده برای CustomSelect
  const selectedDisplayName = useMemo(() => {
    return selectedPatient ? getPatientDisplayName(selectedPatient) : "Select Patient";
  }, [selectedPatient, duplicateNamesMap]);

  // مدیریت انتخاب در CustomSelect
  const handleCustomSelectChange = (value: string) => {
    if (value === "") {
      onPatientSelect(null);
      return;
    }
    
    const patient = findPatientByDisplayName(value);
    if (patient) {
      onPatientSelect(patient);
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Select Patient Section */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">
          Select Patient
        </label>
        <div className="relative">
          {/* Custom Select */}
          <CustomSelect
            selected={selectedDisplayName}
            setSelected={handleCustomSelectChange}
            options={selectOptions}
            width="w-full"
            className="h-[42px]"
            variant="minimal"
          />

          {/* Search Button (ALWAYS visible) */}
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute right-0 top-0 h-[42px] px-3 border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center z-10 rounded-r"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Search Overlay */}
          {open && (
            <div className="absolute inset-0 flex items-center bg-white z-20">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchList(true);
                }}
                onFocus={() => setShowSearchList(true)}
                placeholder="Search by name or phone..."
                className="w-full h-[42px] px-3 border border-gray-300 rounded-l focus:outline-none outline-none"
              />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchQuery("");
                  setShowSearchList(false);
                }}
                className="px-3 border border-gray-300 hover:bg-gray-50 h-[42px] flex items-center justify-center rounded-r"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {open && showSearchList && (
          <div className="relative">
            <div className="absolute left-0 right-0 mt-1 -top-2 bg-white border border-gray-300 rounded-md rounded-t-none shadow-lg z-30 max-h-56 overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{patient.patients_name}</div>
                    <div className="text-sm text-gray-500">
                      {patient.phone_number} • {calculateAge(patient.date_of_birth)}y • {patient.gender}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No patients found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Add New Patient Button */}
      <button
        type="button"
        onClick={onNewPatient}
        className="w-full py-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-[#028477] font-medium"
      >
        <UserPlus className="w-5 h-5" />
        Add New Patient
      </button>

      {/* Selected Patient Info */}
      {selectedPatient && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">
              Selected Patient Information
            </h4>
            <button
              onClick={handleClearSelection}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <label htmlFor="name" className="block text-gray-600 mb-1">
                Full Name:
              </label>
              <input
                type="text"
                id="name"
                readOnly
                value={selectedPatient.patients_name}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-gray-600 mb-1">
                Age:
              </label>
              <input
                type="number"
                id="age"
                readOnly
                value={calculateAge(selectedPatient.date_of_birth)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-gray-600 mb-1">
                Gender:
              </label>
              <input
                type="text"
                id="gender"
                readOnly
                value={selectedPatient.gender}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="phone" className="block text-gray-600 mb-1">
                Phone Number:
              </label>
              <input
                type="text"
                id="phone"
                readOnly
                value={selectedPatient.phone_number}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="birth" className="block text-gray-600 mb-1">
                Date of Birth:
              </label>
              <input
                type="text"
                id="birth"
                readOnly
                value={new Date(
                  selectedPatient.date_of_birth
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSelector;



