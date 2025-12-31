
export type VisitType = "consultation" | "follow-up" | "checkup" | "emergency";
export type Status = "scheduled" | "completed" | "cancelled";
export type Gender = 0 | 1;
export const genderText: Record<Gender, string> = {
  0: "Male",
  1: "Female",
};

export interface Patient {
  id: number;
  patients_name: string;
  date_of_birth: string;
  gender: Gender
  phone_number: string;
  fee?: number; 
  age?: number;
  gender_text?: string;
  medical_info?: PatientMedicalInfo;
  visits?: Appointment[];
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  patient: Patient;
  visit_date: string;
  visit_time: string;
  treatment_fee: number;
  bp?: string | null;
  weight?: string | null;
  visit_type: VisitType;
  status: Status;
  note?: string | null;
  diseases?: Disease[];
  medications?: PatientVisitMedication[];
  tests?: PatientLab[];
  created_at: string;
  updated_at: string;
}


export interface Disease {
  id: number;
  disease_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Medicine {
  id: number;
  medicines_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicineDetail {
  id: number;
  medicines_id: number;
  packing: string;    
  // strength: string;    
  // form: string;      
  status: "Available" | "Not Available";
  medicine?: Medicine;
  created_at?: string;
  updated_at?: string;
}

export interface PatientLab {
  id: number;
  test_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientVisitMedication {
  id: number;
  
  patient_visit_id: number;
  medicines_detail_id: number;
  quantity: number;
  dosage: string;
  medicine_detail?: MedicineDetail;
  created_at?: string;
  updated_at?: string;
}

export interface PatientHistoryResponse {
  patient: Patient;
  visits: Appointment[];
}
export interface Doctor {
  id: number;
  name:string;
  email: string;
  email_verified_at: string;
  password: string;
  role: string;
}
 
export interface PatientMedicalInfo {
  id: number;
  patient_id: number;
  condition_name?: string;
  condition_notes?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}


// types/filter.ts
export type FilterTab = {
  key: string;
  label: string;
  mobileLabel?: string;
  title?: string;
}

export type SelectOption = {
  value: string;
  label: string;
}

export type FilterConfig = {
  // تنظیمات تب‌ها
  tabs: FilterTab[];
  defaultTab: string;
  
  // تنظیمات فیلترهای انتخاب
  selects: Array<{
    key: string;
    label: string;
    options: SelectOption[];
    defaultValue: string;
    width?: string;
  }>;
  
  // تنظیمات دیت رنج
  hasDateRange?: boolean;
  
  // تنظیمات فعال
  showActiveFilters?: boolean;
  showResultsSummary?: boolean;
  
  // استایل‌های سفارشی
  styles?: {
    container?: string;
    tabActive?: string;
    tabInactive?: string;
    activeFilterBadge?: string;
  };
}

// NewPrescription
export interface PrescriptionMedicineItem {
  id: number;
  medicine_id: number;
  medicine_detail_id: number;
  medicine_name: string;
  packing: string;
  quantity: number;
  dosage: string;
}
export interface PrescriptionDiseaseItem {
  id: number;
  disease_id: number;
  disease_name: string;
}

export interface PrescriptionTestItem {
  id: number;
  test_id: number;
  test_name: string;
  result: string;
}

// PatientSelector
export interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  onNewPatient: () => void;
  error?: string;
}