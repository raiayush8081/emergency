import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import EmergencyApp from "./pages/EmergencyApp.jsx";
import HospitalDetails from "./pages/HospitalDetails.jsx";
import EmergencyCallPanel from "./components/EmergencyCallPanel.jsx";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<EmergencyApp />} />
      <Route path="/hospital/:id" element={<HospitalDetails />} />
    </Routes>
    {/* Global Emergency Call floating button and modal accessible across all routes */}
    <EmergencyCallPanel />
  </Router>
);

export default AppRoutes;
