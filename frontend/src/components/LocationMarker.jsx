import { Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Custom SVG User Location Marker with Animated Pulse
const userLocationIcon = L.divIcon({
  className: "custom-user-pin",
  html: `
    <div style="position: relative; width: 36px; height: 46px; display: flex; justify-content: center; align-items: flex-end;">
      <div style="position: absolute; bottom: 0; width: 22px; height: 12px; background: rgba(37, 99, 235, 0.45); border-radius: 50%; animation: user-pin-pulse 2s infinite ease-out;"></div>
      <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
        <defs>
          <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </linearGradient>
        </defs>
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28c0-9.94-8.06-18-18-18z" fill="url(#userGrad)"/>
        <circle cx="18" cy="18" r="7.5" fill="white"/>
        <circle cx="18" cy="18" r="4" fill="#1d4ed8"/>
      </svg>
    </div>
  `,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -44],
});

const LocationMarker = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div style={{ textAlign: "center", padding: "4px" }}>
          <span style={{ fontSize: "16px" }}>📍</span>
          <div style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "13px" }}>You Are Here</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Your current GPS location</div>
        </div>
      </Popup>
    </Marker>
  );
};

export default LocationMarker;