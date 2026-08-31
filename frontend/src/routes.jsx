import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import EmergencyApp from "./pages/EmergencyApp.jsx";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<EmergencyApp />} />
    </Routes>
  </Router>
);

export default AppRoutes;
