import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IncidentDetails from "./pages/IncidentDetails";
import DigitalTwin from "./pages/DigitalTwin";
import SpillDetection from "./pages/SpillDetection";
import VesselIntelligence from "./pages/VesselIntelligence";
import SpillDatabase from "./pages/SpillDatabase";
import Reports from "./pages/Reports";
import HistoricalAIS from "./pages/HistoricalAIS";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incidents" element={<IncidentDetails />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/spill-detection" element={<SpillDetection />} />
        <Route
          path="/vessel-intelligence"
          element={<VesselIntelligence />}
        />
        <Route path="/spill-database" element={<SpillDatabase />} />
        <Route path="/reports" element={<Reports />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/historical-ais" element={<HistoricalAIS />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;