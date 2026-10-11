import Navbar from "../components/Navbar.jsx";
import Map from "../components/Map.jsx";

const EmergencyApp = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
    <Navbar />
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      <Map />
    </div>
  </div>
);

export default EmergencyApp;
