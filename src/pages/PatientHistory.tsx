import {
  FileText,
  CalendarDays,
  Stethoscope,
  Pill,
 
  User,
  Phone,
  Droplets,
  AlertTriangle,

  Clock,
  CreditCard,
  
  Calendar,
  ChevronRight,
  Activity,
  Shield,
  IdCard,
 
  ClipboardList,
  History,
 
  Folder
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import type { Patient, Appointment, PatientMedicalInfo } from "../types/Type";
import { BsFileMedical } from "react-icons/bs";

const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
 
  const [error, setError] = useState<string | null>(null);
  const [expandedVisits, setExpandedVisits] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'documents'>('overview');

  useEffect(() => {
    if (!id) return;

    const fetchPatientHistory = async () => {
      try {
       
        setError(null);
        const response = await api.get(`/patients/${id}/history`);
        setPatient(response.data.patient);
        setAppointments(response.data.visits || []);
      } catch (err) {
        console.error("Error fetching patient history:", err);
        setError("Failed to load patient history. Please try again later.");
      } finally {
        
      }
    };

    fetchPatientHistory();
  }, [id]);

  const toggleVisitExpansion = (visitId: number) => {
    const newExpanded = new Set(expandedVisits);
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId);
    } else {
      newExpanded.add(visitId);
    }
    setExpandedVisits(newExpanded);
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

  const getGenderText = (gender: number | string): string => {
    if (typeof gender === "number") {
      return gender === 0 ? "Male" : "Female";
    }
    return gender === "male" ? "Male" : "Female";
  };

  const getMedicineName = (medication: any): string => {
    return (
      medication?.medicine_detail?.medicine?.medicines_name ||
      "Unknown Medicine"
    );
  };

  const getPacking = (medication: any): string => {
    return medication?.medicine_detail?.packing || "";
  };

  const getAllergiesText = (medicalInfo?: PatientMedicalInfo): string => {
    if (!medicalInfo?.allergies || medicalInfo.allergies.length === 0) {
      return "None recorded";
    }
    return medicalInfo.allergies.join(", ");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-[#028477]/20 text-[#028477] border-[#028477]/30';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };



  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#028477] hover:bg-[#009b8c] text-white font-medium rounded-md transition-colors duration-200 shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Not Found</h3>
          <p className="text-gray-600">The requested patient record could not be found.</p>
        </div>
      </div>
    );
  }

  const patientAge = calculateAge(patient.date_of_birth);

  return (
    <div className="min-h-screen bg-[#00978814] p-4 md:p-6 lg:p-8">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl md:font-bold  font-semibold text-gray-800">Patient Medical History</h1>
          </div>
          <p className="text-sm mt-1 text-gray-500">Complete clinical records and visit history for {patient.patients_name}</p>
        </div>
        

        {/* Patient Profile Card */}
        <div className="bg-white rounded-lg  shadow-xs  border border-gray-200 mb-6 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#03ad9c] to-[#0ac5b2] p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <User className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                    <h2 className="text-2xl font-bold">{patient.patients_name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        {patientAge} years
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        {getGenderText(patient.gender)}
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                        <IdCard className="w-3 h-3" />
                        ID: {id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone_number}</span>
                    </div>
                    {patient.fee && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Fee: ${patient.fee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Blood Type Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 hover:border-[#028477]/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#028477]/10 rounded-md">
                    <Droplets className="w-5 h-5 text-[#028477]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Blood Type</p>
                    <p className="text-lg font-bold text-gray-900">
                      {patient.medical_info?.blood_type || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Allergies Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 hover:border-[#028477]/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#028477]/10 rounded-md">
                    <AlertTriangle className="w-5 h-5 text-[#028477]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Allergies</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {getAllergiesText(patient.medical_info)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chronic Condition Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 hover:border-[#028477]/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#028477]/10 rounded-md">
                    <Activity className="w-5 h-5 text-[#028477]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Chronic Condition</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {patient.medical_info?.condition_name || "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card */}
              {patient.medical_info?.emergency_contact && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 hover:border-[#028477]/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#028477]/10 rounded-md">
                      <Shield className="w-5 h-5 text-[#028477]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Emergency Contact</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {patient.medical_info.emergency_contact}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Condition Notes */}
            {patient.medical_info?.condition_notes?.trim() && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                  <BsFileMedical className="w-4 h-4 text-[#028477]" />
               
                  Clinical Notes
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded border border-gray-100">
                  {patient.medical_info.condition_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'text-[#028477] border-[#028477]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'visits'
                ? 'text-[#028477] border-[#028477]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Visits ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'text-[#028477] border-[#028477]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {/* <FolderMedical className="w-4 h-4" /> */}
            <Folder className="w-4 h-4" />
            Documents
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#028477]" />
                  Health Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-2xl font-bold text-[#028477]">{appointments.length}</p>
                    <p className="text-sm text-gray-600">Total Visits</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-2xl font-bold text-[#028477]">
                      {appointments.filter(a => a.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-2xl font-bold text-[#028477]">
                      {appointments.filter(a => a.diseases && a.diseases.length > 0).length}
                    </p>
                    <p className="text-sm text-gray-600">Diagnoses</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-2xl font-bold text-[#028477]">
                      {appointments.reduce((acc, a) => acc + (a.medications?.length || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Medications</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl  shadow-xs  border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#028477]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {appointments.slice(0, 3).map((visit) => (
                  <div key={visit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-8 h-8 bg-[#028477]/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#028477]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(visit.visit_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{visit.visit_type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(visit.status)}`}>
                      {visit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-lg  shadow-xs  border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#028477]/10 rounded-md">
                    <CalendarDays className="w-5 h-5 text-[#028477]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Visit History</h3>
                    <p className="text-sm text-gray-600">{appointments.length} visits recorded</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Visit History</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No previous visits have been recorded for this patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((visit) => {
                    const isExpanded = expandedVisits.has(visit.id);
                    return (
                      <div
                        key={visit.id}
                        className={`border border-gray-200 rounded-md overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'shadow-xs' : 'hover:shadow-xs'
                        }`}
                      >
                        {/* Visit Header */}
                        <div 
                          className="bg-gray-50 hover:bg-gray-100 p-4 cursor-pointer transition-colors duration-200"
                          onClick={() => toggleVisitExpansion(visit.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-[#028477]" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {new Date(visit.visit_date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {visit.visit_time}
                                    </span>
                                    <span className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                                      {visit.visit_type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(visit.status)}`}>
                                {visit.status}
                              </span>
                              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="p-6 border-t border-gray-200 bg-white">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Clinical Notes */}
                              {visit.note && (
                                <div className="lg:col-span-3">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    Clinical Notes
                                  </h4>
                                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                    <p className="text-gray-700 text-sm leading-relaxed">{visit.note}</p>
                                  </div>
                                </div>
                              )}

                              {/* Vital Signs */}
                              {(visit.bp || visit.weight) && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#028477]" />
                                    Vital Signs
                                  </h4>
                                  <div className="space-y-2">
                                    {visit.bp && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm text-gray-600">Blood Pressure</span>
                                        <span className="font-medium text-gray-800">{visit.bp}</span>
                                      </div>
                                    )}
                                    {visit.weight && (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm text-gray-600">Weight</span>
                                        <span className="font-medium text-gray-800">{visit.weight} kg</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Diagnoses */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Stethoscope className="w-4 h-4 text-red-500" />
                                  Diagnoses
                                </h4>
                                {visit.diseases && visit.diseases.length > 0 ? (
                                  <div className="space-y-2">
                                    {visit.diseases.map((disease) => (
                                      <div
                                        key={disease.id}
                                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md"
                                      >
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-800">{disease.disease_name}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="text-gray-500 text-sm">No diagnoses</p>
                                  </div>
                                )}
                              </div>

                              {/* Medications */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-blue-500" />
                                  Medications
                                </h4>
                                {visit.medications && visit.medications.length > 0 ? (
                                  <div className="space-y-2">
                                    {visit.medications.map((medication) => (
                                      <div
                                        key={medication.id}
                                        className="p-3 bg-blue-50 border border-blue-100 rounded-md"
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="font-medium text-gray-900 text-sm">
                                            {getMedicineName(medication)}
                                          </span>
                                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {medication.quantity}x
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          <span className="font-medium">Dosage:</span> {medication.dosage}
                                          {getPacking(medication) && (
                                            <span className="ml-2">
                                              • <span className="font-medium">Pack:</span> {getPacking(medication)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="text-gray-500 text-sm">No medications</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl  shadow-xs  border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* <FolderMedical className="w-8 h-8 text-gray-400" /> */}
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Medical Documents</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This section is under development. Medical documents and reports will be available soon.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>Medical History • Patient ID: {id}</span>
            </div>
            <div className="mt-2 md:mt-0">
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;