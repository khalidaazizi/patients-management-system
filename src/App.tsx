import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import PatientsPage from "./pages/PatientsPage";
import Appointments from "./pages/Appointments";
import NewPrescription from "./pages/NewPrescription";
import PatientHistory from "./pages/PatientHistory";
import PatientTests from "./pages/PatientTests";
import MedicinesPage from "./pages/Medicines";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/new-prescription" element={<NewPrescription />} />
        <Route path="/patients/:id/history" element={<PatientHistory />} />
        <Route path="/patient-tests" element={<PatientTests />} />
        <Route path="/medicines" element={<MedicinesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
