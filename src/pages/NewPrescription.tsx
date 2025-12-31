import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  User,
  Pill,
  Stethoscope,
  FlaskConical,
  Activity,
  Scale,
  Clock,
  Save,
  X,
  Check,
  Download,
  Printer,
  Clipboard,
  TimerIcon,
  DollarSign,
  AlertCircle,
} from "lucide-react";

import type {
  Patient,
  Medicine,
  MedicineDetail,
  Disease,
  PatientLab,
  PrescriptionMedicineItem,
  PrescriptionDiseaseItem,
  PrescriptionTestItem,
  Gender,
} from "../types/Type";
import PatientSelector from "../components/PatientSelector";
import api from "../services/api";

const NewPrescription = () => {
  // ==============================================
  // STATES - حالت‌های کامپوننت
  // ==============================================

  // اطلاعات بیمار
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientMode, setPatientMode] = useState<"select" | "new">("select");

  // فرم بیمار جدید
  const [newPatient, setNewPatient] = useState<{
    patients_name: string;
    date_of_birth: string;
    gender: Gender; // 0 | 1
    phone_number: string;
  }>({
    patients_name: "",
    date_of_birth: "",
    gender: 0, // یا 1 (مقدار پیش‌فرض)
    phone_number: "",
  });

  // اطلاعات پزشکی بیمار (اختیاری)
  const [patientMedicalInfo, setPatientMedicalInfo] = useState({
    blood_type: "",
    allergies: "",
    emergency_contact: "",
  });

  const [errors, setErrors] = useState<{
    patients_name?: string;
    date_of_birth?: string;
    gender?: string;
    phone_number?: string;
  }>({});

  // اطلاعات ویزیت
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitType, setVisitType] = useState<
    "consultation" | "follow-up" | "checkup" | "emergency"
  >("consultation");
  const [status, setStatus] = useState<"completed" | "scheduled" | "cancelled">(
    "completed"
  );
  const [bp, setBp] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [treatmentFee, setTreatmentFee] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");

  // لیست‌های انتخاب
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineDetails, setMedicineDetails] = useState<MedicineDetail[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [tests, setTests] = useState<PatientLab[]>([]);

  // آیتم‌های انتخاب شده فعلی
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [selectedMedicineDetail, setSelectedMedicineDetail] =
    useState<MedicineDetail | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [dosage, setDosage] = useState("");
  const [selectedTest, setSelectedTest] = useState<PatientLab | null>(null);
  const [testResult, setTestResult] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");

  // لیست‌های آیتم‌های اضافه شده
  const [medicineList, setMedicineList] = useState<PrescriptionMedicineItem[]>(
    []
  );
  const [diseaseList, setDiseaseList] = useState<PrescriptionDiseaseItem[]>([]);
  const [testList, setTestList] = useState<PrescriptionTestItem[]>([]);

  // وضعیت UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ==============================================
  // CONSTANTS & DERIVED VALUES
  // ==============================================

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // فیلتر جزئیات دارو بر اساس داروی انتخاب شده
  const medicineDetailOptions = medicineDetails.filter(
    (detail) =>
      detail.medicines_id === selectedMedicine?.id &&
      detail.status === "Available"
  );

  const canAddDiagnosis =
    !!selectedPatient || newPatient.patients_name.trim() !== "";

  // ==============================================
  // EFFECTS - هوک‌های useEffect
  // ==============================================

  // بارگذاری اولیه داده‌ها
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // دریافت همزمان تمام داده‌های مورد نیاز
        const [
          patientsRes,
          medicinesRes,
          medicineDetailsRes,
          diseasesRes,
          testsRes,
        ] = await Promise.all([
          api.get("/patients"),
          api.get("/medicines"),
          api.get("/medicine-details"),
          api.get("/diseases"),
          api.get("/labs"),
        ]);

        setPatients(patientsRes.data);
        setMedicines(medicinesRes.data);
        setMedicineDetails(medicineDetailsRes.data);
        setDiseases(diseasesRes.data);
        setTests(testsRes.data);

        // تنظیم تاریخ و زمان پیش‌فرض
        setVisitDate(today);
        setVisitTime(currentTime);

        // تنظیم تاریخ ویزیت بعدی (30 روز بعد)
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 30);
        setNextVisitDate(nextDate.toISOString().split("T")[0]);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("خطا در بارگذاری داده‌ها");
      } finally {
      }
    };

    fetchInitialData();
  }, [today, currentTime]);

  // منطق اتوماتیک برای وضعیت ویزیت
  useEffect(() => {
    if (nextVisitDate) {
      setStatus("completed");
      if (visitType === "consultation") {
        setVisitType("follow-up");
      }
    }
  }, [nextVisitDate, visitType]);

  // ==============================================
  // VALIDATION FUNCTIONS - توابع اعتبارسنجی
  // ==============================================

  const validatePatientForm = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!newPatient.patients_name.trim()) {
      newErrors.patients_name = "نام بیمار الزامی است";
    }

    if (!newPatient.date_of_birth) {
      newErrors.date_of_birth = "تاریخ تولد الزامی است";
    }

    if (!newPatient.gender) {
      newErrors.gender = "جنسیت الزامی است";
    }

    if (!newPatient.phone_number.trim()) {
      newErrors.phone_number = "شماره تماس الزامی است";
    } else if (!/^09\d{9}$/.test(newPatient.phone_number)) {
      newErrors.phone_number = "شماره تماس معتبر نیست (09xxxxxxxxx)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newPatient]);

  const validatePrescriptionForm = useCallback(() => {
    if (!selectedPatient && patientMode === "select") {
      alert("لطفاً بیمار را انتخاب کنید");
      return false;
    }

    if (patientMode === "new" && !validatePatientForm()) {
      return false;
    }

    if (!visitDate) {
      alert("لطفاً تاریخ ویزیت را وارد کنید");
      return false;
    }

    if (!visitTime) {
      alert("لطفاً زمان ویزیت را وارد کنید");
      return false;
    }

    return true;
  }, [selectedPatient, patientMode, visitDate, visitTime, validatePatientForm]);

  // ==============================================
  // PATIENT HANDLERS - توابع مدیریت بیمار
  // ==============================================

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);
    setPatientMode("select");
    setErrors({});
  };

  const handleNewPatientClick = () => {
    setPatientMode("new");
    setSelectedPatient(null);
    setNewPatient({
      patients_name: "",
      date_of_birth: "",
      gender: 0,
      phone_number: "",
    });
    setPatientMedicalInfo({
      blood_type: "",
      allergies: "",
      emergency_contact: "",
    });
    setErrors({});
  };

  const savePatient = async (): Promise<number | null> => {
    try {
      let patientId: number;

      if (patientMode === "new") {
        if (!validatePatientForm()) {
          return null;
        }

        // ذخیره بیمار جدید
        const patientResponse = await api.post("/patients", newPatient);
        patientId = patientResponse.data.id;

        // ذخیره اطلاعات پزشکی بیمار (در صورت وجود)
        if (
          patientMedicalInfo.blood_type ||
          patientMedicalInfo.allergies ||
          patientMedicalInfo.emergency_contact
        ) {
          await api.post("/patient-medical-infos", {
            patient_id: patientId,
            ...patientMedicalInfo,
          });
        }

        // اضافه کردن بیمار جدید به لیست
        const newPatientObj: Patient = {
          id: patientId,
          ...newPatient,
        };

        setPatients((prev) => [...prev, newPatientObj]);
        setSelectedPatient(newPatientObj);
        setPatientMode("select");
      } else {
        if (!selectedPatient) {
          alert("لطفاً بیمار را انتخاب کنید");
          return null;
        }
        patientId = selectedPatient.id;
      }

      return patientId;
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("خطا در ذخیره بیمار");
      return null;
    }
  };

  // ==============================================
  // ITEM HANDLERS - توابع مدیریت آیتم‌ها
  // ==============================================

  const handleAddMedicine = () => {
    if (!selectedMedicine || !selectedMedicineDetail || !quantity || !dosage) {
      alert("لطفاً تمام فیلدهای دارو را پر کنید");
      return;
    }

    const newMedicine: PrescriptionMedicineItem = {
      id: Date.now(),
      medicine_id: selectedMedicineDetail.medicines_id,
      medicine_detail_id: selectedMedicineDetail.id,
      medicine_name: selectedMedicine.medicines_name,
      packing: selectedMedicineDetail.packing,
      quantity: Number(quantity),
      dosage: dosage,
    };

    setMedicineList([...medicineList, newMedicine]);

    // ریست فرم
    setSelectedMedicine(null);
    setSelectedMedicineDetail(null);
    setQuantity("");
    setDosage("");
  };

  const handleAddDisease = () => {
    if (!canAddDiagnosis) {
      alert("لطفاً ابتدا بیمار را انتخاب یا وارد کنید");
      return;
    }

    if (!diseaseInput.trim()) {
      alert("لطفاً نام بیماری را وارد کنید");
      return;
    }

    // جستجو برای بیماری موجود
    const existingDisease = diseases.find(
      (d) => d.disease_name.toLowerCase() === diseaseInput.trim().toLowerCase()
    );

    if (existingDisease) {
      const newDisease: PrescriptionDiseaseItem = {
        id: Date.now(),
        disease_id: existingDisease.id,
        disease_name: diseaseInput.trim(),
      };
      setDiseaseList([...diseaseList, newDisease]);
      setDiseaseInput("");
    }
  };

  const handleAddTest = () => {
    if (!selectedTest) {
      alert("لطفاً آزمایش را انتخاب کنید");
      return;
    }

    const newTest: PrescriptionTestItem = {
      id: Date.now(),
      test_id: selectedTest.id,
      test_name: selectedTest.test_name,
      result: testResult || "Pending",
    };

    setTestList([...testList, newTest]);
    setSelectedTest(null);
    setTestResult("");
  };

  // توابع حذف آیتم‌ها
  const handleRemoveMedicine = (id: number) => {
    setMedicineList(medicineList.filter((item) => item.id !== id));
  };

  const handleRemoveDisease = (id: number) => {
    setDiseaseList(diseaseList.filter((item) => item.id !== id));
  };

  const handleRemoveTest = (id: number) => {
    setTestList(testList.filter((item) => item.id !== id));
  };

  // ==============================================
  // SUBMISSION HANDLER - تابع ارسال فرم
  // ==============================================

  const handleSubmit = async () => {
    if (!validatePrescriptionForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ذخیره بیمار (جدید یا موجود)
      const patientId = await savePatient();
      if (!patientId) {
        setIsSubmitting(false);
        return;
      }

      // 1. ایجاد ویزیت بیمار در جدول patient_visits
      const visitData = {
        patient_id: patientId,
        visit_date: visitDate,
        visit_time: visitTime,
        bp: bp || null,
        weight: weight || null,
        status: status,
        treatment_fee: treatmentFee || 0,
        visit_type: visitType,
        note: note || null,
      };

      const visitResponse = await api.post("/visits", visitData);
      const visitId = visitResponse.data.id;

      // 2. ذخیره داروها در جدول patient_visits_medications
      if (medicineList.length > 0) {
        const medicationsPromises = medicineList.map((medicine) =>
          api.post("/visit-medications", {
            patient_visit_id: visitId,
            medicines_detail_id: medicine.medicine_detail_id,
            quantity: medicine.quantity,
            dosage: medicine.dosage,
          })
        );
        await Promise.all(medicationsPromises);
      }

      // 3. ذخیره بیماری‌ها در جدول patient_visits_diseases
      if (diseaseList.length > 0) {
        const diseasesPromises = diseaseList.map((disease) =>
          api.post("/visit-diseases", {
            patient_visit_id: visitId,
            disease_id: disease.disease_id,
          })
        );
        await Promise.all(diseasesPromises);
      }

      // 4. ذخیره تست‌ها در جدول patient_visit_tests
      if (testList.length > 0) {
        const testsPromises = testList.map((test) =>
          api.post("/visit-tests", {
            patient_visit_id: visitId,
            test_id: test.test_id,
            status: test.result === "Pending" ? "pending" : "completed",
          })
        );
        await Promise.all(testsPromises);
      }

      // 5. اگر ویزیت بعدی وجود دارد، آن را هم ذخیره کنیم
      if (nextVisitDate) {
        const nextVisitData = {
          patient_id: patientId,
          visit_date: nextVisitDate,
          visit_time: "09:00", // زمان پیش‌فرض
          status: "scheduled",
          visit_type: "follow-up",
          note: `Follow-up visit from visit #${visitId}`,
        };
        await api.post("/visits", nextVisitData);
      }

      // نمایش پیام موفقیت
      setSuccessMessage("نسخه با موفقیت ایجاد شد!");

      // ریست فرم بعد از ۳ ثانیه
      setTimeout(() => {
        resetForm();
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Error creating prescription:", err);
      alert(
        err.response?.data?.message ||
          "خطا در ایجاد نسخه. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================================
  // FORM RESET - تابع ریست فرم
  // ==============================================

  const resetForm = () => {
    setSelectedPatient(null);
    setPatientMode("select");
    setNewPatient({
      patients_name: "",
      date_of_birth: "",
      gender: 0,
      phone_number: "",
    });
    setPatientMedicalInfo({
      blood_type: "",
      allergies: "",
      emergency_contact: "",
    });
    setVisitDate(today);
    setVisitTime(currentTime);
    setVisitType("consultation");
    setStatus("completed");
    setBp("");
    setWeight("");
    setTreatmentFee("");
    setNote("");
    setNextVisitDate("");
    setMedicineList([]);
    setDiseaseList([]);
    setTestList([]);
    setSelectedMedicine(null);
    setSelectedMedicineDetail(null);
    setSelectedTest(null);
    setErrors({});
  };

  // ==============================================
  // UI COMPONENT - بخش رندر
  // ==============================================

  return (
    <div className="min-h-screen bg-[#00978814] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                New Prescription
              </h1>
              <p className="text-sm mt-1 text-gray-500">
                Create a new prescription for patient
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#028477] hover:bg-[#009b8c] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-800">
                    {successMessage}
                  </p>
                  <p className="text-sm text-emerald-600">
                    Form will be cleared shortly...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info and Vital Signs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Selection Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#028477]" />
                  Patient Information
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <PatientSelector
                  patients={patients}
                  selectedPatient={selectedPatient}
                  onPatientSelect={handlePatientSelect}
                  onNewPatient={handleNewPatientClick}
                />

                {/* New Patient Form */}
                {patientMode === "new" && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">
                        New Patient Information
                      </h4>
                      <button
                        onClick={() => {
                          setPatientMode("select");
                          setNewPatient({
                            patients_name: "",
                            date_of_birth: "",
                            gender: 0,
                            phone_number: "",
                          });
                          setErrors({});
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-700 text-sm">
                        Basic Information
                      </h5>

                      {/* Name */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter patient full name"
                          value={newPatient.patients_name}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              patients_name: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none ${
                            errors.patients_name
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.patients_name && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.patients_name}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth & Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Date of Birth{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={newPatient.date_of_birth}
                            onChange={(e) =>
                              setNewPatient({
                                ...newPatient,
                                date_of_birth: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none ${
                              errors.date_of_birth
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.date_of_birth && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.date_of_birth}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          {/* <select
                            value={newPatient.gender}
                            onChange={(e) =>
                              setNewPatient({
                                ...newPatient,
                                gender: e.target.value as "male" | "female",
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none ${
                              errors.gender
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select> */}
                          <select
                            value={newPatient.gender.toString()} // تبدیل به string برای select
                            onChange={(e) =>
                              setNewPatient({
                                ...newPatient,
                                gender: parseInt(e.target.value) as Gender, // تبدیل به عدد
                              })
                            }
                          >
                            <option value="0">Male</option>
                            <option value="1">Female</option>
                          </select>
                          {errors.gender && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.gender}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="09xxxxxxxxx"
                          value={newPatient.phone_number}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              phone_number: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none ${
                            errors.phone_number
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.phone_number && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Medical Information (Optional) */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-700 text-sm">
                        Medical Information (Optional)
                      </h5>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Blood Type
                          </label>
                          <select
                            value={patientMedicalInfo.blood_type}
                            onChange={(e) =>
                              setPatientMedicalInfo({
                                ...patientMedicalInfo,
                                blood_type: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                          >
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Emergency Contact
                          </label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={patientMedicalInfo.emergency_contact}
                            onChange={(e) =>
                              setPatientMedicalInfo({
                                ...patientMedicalInfo,
                                emergency_contact: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Allergies
                        </label>
                        <textarea
                          placeholder="List any allergies..."
                          value={patientMedicalInfo.allergies}
                          onChange={(e) =>
                            setPatientMedicalInfo({
                              ...patientMedicalInfo,
                              allergies: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent resize-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visit Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#028477]" />
                  Visit Information
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Visit Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visit Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visit Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <TimerIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="120/80"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="70"
                        value={weight}
                        onChange={(e) =>
                          setWeight(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <Scale className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Treatment Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Fee
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={treatmentFee}
                      onChange={(e) =>
                        setTreatmentFee(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    />
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={status === "completed"}
                      onChange={(e) =>
                        setStatus(e.target.checked ? "completed" : "scheduled")
                      }
                    />
                    Completed
                  </label>
                </div>

                {/* Visit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Type
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="checkup">Checkup</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Enter clinical notes, observations, or instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent resize-none outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Next Visit Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#028477]" />
                  Next Visit Information
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Visit Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={nextVisitDate}
                      onChange={(e) => setNextVisitDate(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    />
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {nextVisitDate && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600">
                        Next visit will be scheduled automatically
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Printer className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Print</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-2">
                    <Download className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Prescription Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medicines Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#028477]" />
                  Medications
                </h3>
              </div>
              <div className="p-4">
                {/* Add Medicine Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine
                    </label>
                    <select
                      value={selectedMedicine?.id || ""}
                      onChange={(e) => {
                        const medicine = medicines.find(
                          (m) => m.id === parseInt(e.target.value)
                        );
                        setSelectedMedicine(medicine || null);
                        setSelectedMedicineDetail(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.medicines_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Details
                    </label>
                    <select
                      value={selectedMedicineDetail?.id || ""}
                      onChange={(e) => {
                        const detail = medicineDetailOptions.find(
                          (d) => d.id === parseInt(e.target.value)
                        );
                        setSelectedMedicineDetail(detail || null);
                      }}
                      disabled={
                        !selectedMedicine || medicineDetailOptions.length === 0
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent disabled:bg-gray-50 outline-none"
                    >
                      <option value="">Select Packing</option>
                      {medicineDetailOptions.map((detail) => (
                        <option key={detail.id} value={detail.id}>
                          {detail.packing}
                        </option>
                      ))}
                    </select>
                    {selectedMedicine && medicineDetailOptions.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No packing details available for this medicine
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="1-0-1"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleAddMedicine}
                        disabled={
                          !selectedMedicine ||
                          !selectedMedicineDetail ||
                          !quantity ||
                          !dosage
                        }
                        className="px-4 py-2 bg-[#028477] text-white rounded-lg hover:bg-[#009b8c] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Medicine List Table */}
                {medicineList.length > 0 ? (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Medicine Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Packing
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Strength/Form
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Dosage
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicineList.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.medicine_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.packing}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.dosage}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveMedicine(item.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No medications added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add medications using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Diseases Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#028477]" />
                  Diagnoses
                </h3>
              </div>
              <div className="p-4">
                {/* Add Disease Form */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disease
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter disease name"
                        value={diseaseInput}
                        onChange={(e) => setDiseaseInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      />
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const disease = diseases.find(
                              (d) => d.id === parseInt(e.target.value)
                            );
                            if (disease) {
                              setDiseaseInput(disease.disease_name);
                            }
                          }
                        }}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                      >
                        <option value="">Select from list</option>
                        {diseases.map((disease) => (
                          <option key={disease.id} value={disease.id}>
                            {disease.disease_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddDisease}
                      disabled={!canAddDiagnosis || !diseaseInput.trim()}
                      className={`px-4 py-2 h-[42px] rounded-lg flex items-center gap-2 ${
                        canAddDiagnosis && diseaseInput.trim()
                          ? "bg-[#028477] text-white hover:bg-[#009b8c]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Disease List Table */}
                {diseaseList.length > 0 ? (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Disease Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {diseaseList.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.disease_name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.disease_id
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.disease_id ? "Standard" : "Custom"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveDisease(item.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No diagnoses added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add diagnoses using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#028477]" />
                  Laboratory Tests
                </h3>
              </div>
              <div className="p-4">
                {/* Add Test Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test
                    </label>
                    <select
                      value={selectedTest?.id || ""}
                      onChange={(e) => {
                        const test = tests.find(
                          (t) => t.id === parseInt(e.target.value)
                        );
                        setSelectedTest(test || null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    >
                      <option value="">Select Test</option>
                      {tests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.test_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Result
                    </label>
                    <input
                      type="text"
                      placeholder="Enter result or 'Pending'"
                      value={testResult}
                      onChange={(e) => setTestResult(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03b5a3] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAddTest}
                      disabled={!selectedTest}
                      className={`px-4 py-2 h-[42px] rounded-lg flex items-center gap-2 ${
                        selectedTest
                          ? "bg-[#028477] text-white hover:bg-[#009b8c]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add Test
                    </button>
                  </div>
                </div>

                {/* Test List Table */}
                {testList.length > 0 ? (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Test Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Result
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testList.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.test_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.result}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.result === "Pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {item.result === "Pending"
                                  ? "Pending"
                                  : "Completed"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveTest(item.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No tests added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add tests using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-[#028477]" />
                Prescription Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                      <Pill className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {medicineList.length}
                    </p>
                    <p className="text-sm text-gray-600">Medications</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-2">
                      <Stethoscope className="w-6 h-6 text-rose-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {diseaseList.length}
                    </p>
                    <p className="text-sm text-gray-600">Diagnoses</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                      <FlaskConical className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {testList.length}
                    </p>
                    <p className="text-sm text-gray-600">Tests</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#028477] hover:bg-[#009b8c] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Finalize Prescription"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPrescription;
