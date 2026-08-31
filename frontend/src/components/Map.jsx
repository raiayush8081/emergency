import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import LocationMarker from "./LocationMarker.jsx";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// ─── Helpers ────────────────────────────────────────────────────────────────
const UNNAMED_WORDS = [
  "unnamed", "unnamed hospital", "unnamed police station", "unnamed pharmacy",
  "unknown", "unknown hospital", "unknown police", "unknown pharmacy", "",
];

function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  const t = name.trim();
  return t !== "" && !UNNAMED_WORDS.includes(t.toLowerCase());
}

function formatDistance(meters) {
  if (meters >= 1000) return (meters / 1000).toFixed(1) + " km";
  return Math.round(meters) + " m";
}

function formatTime(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return mins + " min";
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function parseFeatures(features) {
  return (features || [])
    .map((f) => ({
      name: f.properties.name,
      address:
        f.properties.formatted ||
        f.properties.address_line1 ||
        f.properties.street ||
        null,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .filter((h) => isValidName(h.name));
}

// ─── Marker icons ────────────────────────────────────────────────────────────
function makeIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const icons = {
  hospital: makeIcon("red"),
  police: makeIcon("blue"),
  pharmacy: makeIcon("green"),
};

// ─── Geoapify categories ─────────────────────────────────────────────────────
const CATEGORIES = {
  hospital: "healthcare.hospital",
  police: "service.police",
  pharmacy: "healthcare.pharmacy",
};

// ─── RouteController: draws polyline and fits bounds ─────────────────────────
const RouteController = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 0) {
      map.fitBounds(L.latLngBounds(route), { padding: [60, 60] });
    }
  }, [route, map]);
  if (!route || route.length === 0) return null;
  return <Polyline positions={route} color="#e63946" weight={5} opacity={0.85} />;
};

// ─── FlyToMarker: flies map to a selected place ──────────────────────────────
const FlyToMarker = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1 });
  }, [target, map]);
  return null;
};

// ─── Popup content ────────────────────────────────────────────────────────────
const PlacePopup = ({ place, onGetDirections, routeLoading, label }) => (
  <div style={{ minWidth: 200, fontSize: 13 }}>
    <p style={{ fontWeight: 700, marginBottom: 4 }}>{place.name}</p>
    {place.address && (
      <p style={{ color: "#555", marginBottom: 8, fontSize: 11 }}>{place.address}</p>
    )}
    <button
      onClick={() => onGetDirections(place)}
      disabled={routeLoading}
      style={{
        background: "#e63946", color: "#fff", border: "none",
        borderRadius: 6, padding: "6px 14px", cursor: routeLoading ? "not-allowed" : "pointer",
        fontWeight: 600, width: "100%", opacity: routeLoading ? 0.7 : 1,
      }}
    >
      {routeLoading ? "Loading route…" : `🗺️ Get Directions`}
    </button>
  </div>
);

// ─── Sidebar Card ─────────────────────────────────────────────────────────────
const PlaceCard = ({ place, onGetDirections, onViewOnMap, routeLoading, accentColor }) => (
  <div style={{
    borderBottom: "1px solid #eee", padding: "10px 4px",
    display: "flex", flexDirection: "column", gap: 4,
  }}>
    <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{place.name}</p>
    {place.address && (
      <p style={{ fontSize: 11, color: "#666", margin: 0 }}>{place.address}</p>
    )}
    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
      <button
        onClick={() => onViewOnMap(place)}
        style={{
          flex: 1, background: "#f0f0f0", color: "#333", border: "none",
          borderRadius: 5, padding: "4px 0", fontSize: 11, cursor: "pointer", fontWeight: 600,
        }}
      >
        📍 View on Map
      </button>
      <button
        onClick={() => onGetDirections(place)}
        disabled={routeLoading}
        style={{
          flex: 1, background: accentColor, color: "#fff", border: "none",
          borderRadius: 5, padding: "4px 0", fontSize: 11,
          cursor: routeLoading ? "not-allowed" : "pointer", fontWeight: 600,
          opacity: routeLoading ? 0.7 : 1,
        }}
      >
        🗺️ Directions
      </button>
    </div>
  </div>
);

// ─── Main Map Component ───────────────────────────────────────────────────────
const Map = () => {
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Per-category data
  const [hospitals, setHospitals] = useState([]);
  const [police, setPolice] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);

  // Per-category loading/error states
  const [loading, setLoading] = useState({ hospital: false, police: false, pharmacy: false });
  const [fetchError, setFetchError] = useState({ hospital: null, police: null, pharmacy: null });

  // Visibility toggles
  const [visible, setVisible] = useState({ hospital: true, police: true, pharmacy: true });

  // Active sidebar tab
  const [activeTab, setActiveTab] = useState("hospital");

  // Routing
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // FlyTo target
  const [flyTarget, setFlyTarget] = useState(null);

  const positionRef = useRef(null);
  const fetchedRef = useRef(false);

  useEffect(() => { positionRef.current = position; }, [position]);

  // ── Fetch a category ────────────────────────────────────────────────────────
  const fetchCategory = useCallback(async (key, lat, lng) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setFetchError((prev) => ({ ...prev, [key]: null }));
    try {
      const res = await fetch(
        `https://api.geoapify.com/v2/places?categories=${CATEGORIES[key]}&filter=circle:${lng},${lat},5000&limit=20&apiKey=${GEOAPIFY_KEY}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = parseFeatures(data.features);
      if (key === "hospital") setHospitals(parsed);
      if (key === "police") setPolice(parsed);
      if (key === "pharmacy") setPharmacies(parsed);
    } catch (err) {
      console.error(`Failed to fetch ${key}:`, err);
      setFetchError((prev) => ({ ...prev, [key]: `Unable to fetch ${key === "pharmacy" ? "pharmacies" : key + " stations"}.` }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  // ── Geolocation on mount ────────────────────────────────────────────────────
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        if (!fetchedRef.current) {
          fetchedRef.current = true;
          fetchCategory("hospital", lat, lng);
          fetchCategory("police", lat, lng);
          fetchCategory("pharmacy", lat, lng);
        }
      },
      (err) => {
        console.error(err);
        setLocationError("Location access denied. Please enable GPS in your browser settings and refresh.");
      }
    );
  }, [fetchCategory]);

  // ── Get directions ──────────────────────────────────────────────────────────
  const getDirections = useCallback(async (place) => {
    const userPos = positionRef.current;
    if (!userPos) { setRouteError("Your location is not available yet."); return; }
    setRouteLoading(true);
    setRouteError(null);
    setRoute(null);
    setRouteInfo(null);
    try {
      const [uLat, uLng] = userPos;
      const url = `https://api.geoapify.com/v1/routing?waypoints=${uLat},${uLng}|${place.lat},${place.lng}&mode=drive&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.features || data.features.length === 0) throw new Error("No route found.");
      const feature = data.features[0];
      const coords = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      const props = feature.properties.legs?.[0] || feature.properties;
      setRoute(coords);
      setRouteInfo({
        to: place.name,
        distance: props.distance != null ? formatDistance(props.distance) : "N/A",
        time: props.time != null ? formatTime(props.time) : "N/A",
      });
    } catch (err) {
      console.error("Routing error:", err);
      setRouteError("Could not get directions. Please try again.");
    } finally {
      setRouteLoading(false);
    }
  }, []);

  const clearRoute = () => { setRoute(null); setRouteInfo(null); setRouteError(null); };

  const toggleVisible = (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Sidebar data for active tab ──────────────────────────────────────────────
  const tabData = { hospital: hospitals, police: police, pharmacy: pharmacies };
  const tabColors = { hospital: "#e63946", police: "#1d3557", pharmacy: "#2d6a4f" };
  const tabEmojis = { hospital: "🏥", police: "👮", pharmacy: "💊" };
  const tabLabels = { hospital: "Hospitals", police: "Police Stations", pharmacy: "Pharmacies" };

  const currentList = tabData[activeTab] || [];
  const currentLoading = loading[activeTab];
  const currentError = fetchError[activeTab];

  // ─── Location denied ────────────────────────────────────────────────────────
  if (locationError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 px-6 text-center">
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h2 className="text-2xl font-bold">Location Access Required</h2>
        <p className="max-w-sm text-gray-300">{locationError}</p>
      </div>
    );
  }

  // ─── Getting location loading screen ────────────────────────────────────────
  if (!position) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg">Getting your location…</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen">

      {/* ── MAP ─────────────────────────────────────────────────────────────── */}
      <MapContainer center={position} zoom={13} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        <LocationMarker position={position} />

        {/* Hospital markers */}
        {visible.hospital && hospitals.map((h, i) => (
          <Marker key={`h-${i}`} position={[h.lat, h.lng]} icon={icons.hospital}>
            <Popup minWidth={220}>
              <PlacePopup place={h} onGetDirections={getDirections} routeLoading={routeLoading} label="Hospital" />
            </Popup>
          </Marker>
        ))}

        {/* Police markers */}
        {visible.police && police.map((p, i) => (
          <Marker key={`p-${i}`} position={[p.lat, p.lng]} icon={icons.police}>
            <Popup minWidth={220}>
              <PlacePopup place={p} onGetDirections={getDirections} routeLoading={routeLoading} label="Police Station" />
            </Popup>
          </Marker>
        ))}

        {/* Pharmacy markers */}
        {visible.pharmacy && pharmacies.map((ph, i) => (
          <Marker key={`ph-${i}`} position={[ph.lat, ph.lng]} icon={icons.pharmacy}>
            <Popup minWidth={220}>
              <PlacePopup place={ph} onGetDirections={getDirections} routeLoading={routeLoading} label="Pharmacy" />
            </Popup>
          </Marker>
        ))}

        {/* Route */}
        <RouteController route={route} />

        {/* Fly to selected */}
        {flyTarget && <FlyToMarker target={flyTarget} />}
      </MapContainer>

      {/* ── CATEGORY TOGGLE BAR (bottom-left) ───────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: routeInfo ? 80 : 24, left: 16, zIndex: 1000,
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        {[
          { key: "hospital", emoji: "🏥", label: "Hospitals", color: "#e63946" },
          { key: "police",   emoji: "👮", label: "Police",    color: "#1d3557" },
          { key: "pharmacy", emoji: "💊", label: "Pharmacy",  color: "#2d6a4f" },
        ].map(({ key, emoji, label, color }) => (
          <button
            key={key}
            onClick={() => toggleVisible(key)}
            style={{
              background: visible[key] ? color : "#ccc",
              color: "#fff", border: "none", borderRadius: 20,
              padding: "6px 14px", fontWeight: 600, fontSize: 12,
              cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              transition: "background 0.2s",
            }}
          >
            {emoji} {label}
          </button>
        ))}
        <button
          onClick={() => { clearRoute(); }}
          style={{
            background: "#444", color: "#fff", border: "none", borderRadius: 20,
            padding: "6px 14px", fontWeight: 600, fontSize: 12,
            cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          📍 My Location
        </button>
      </div>

      {/* ── ROUTE INFO BANNER ────────────────────────────────────────────────── */}
      {routeInfo && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "#fff", borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", padding: "10px 18px",
          display: "flex", alignItems: "center", gap: 16, fontSize: 13,
          maxWidth: "90vw",
        }}>
          <div>
            <p style={{ fontWeight: 700, margin: 0 }}>🗺️ Route to {routeInfo.to}</p>
            <p style={{ color: "#555", margin: 0, marginTop: 2 }}>📏 {routeInfo.distance} &nbsp;·&nbsp; ⏱ {routeInfo.time}</p>
          </div>
          <button onClick={clearRoute} style={{
            background: "#e63946", color: "#fff", border: "none", borderRadius: 6,
            padding: "6px 12px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
          }}>
            ✕ Clear Route
          </button>
        </div>
      )}

      {/* ── ROUTE ERROR ──────────────────────────────────────────────────────── */}
      {routeError && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "#fee2e2", border: "1px solid #f87171",
          color: "#b91c1c", borderRadius: 12, padding: "10px 18px",
          display: "flex", alignItems: "center", gap: 12, fontSize: 13,
          maxWidth: "90vw",
        }}>
          <span>{routeError}</span>
          <button onClick={() => setRouteError(null)} style={{ fontWeight: 700, cursor: "pointer", background: "none", border: "none", color: "#b91c1c" }}>✕</button>
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 1000,
        background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        width: 280, maxHeight: "78vh", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Tab headers */}
        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          {["hospital", "police", "pharmacy"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1, padding: "10px 4px", border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600,
                background: activeTab === key ? tabColors[key] : "#f9f9f9",
                color: activeTab === key ? "#fff" : "#555",
                borderBottom: activeTab === key ? `2px solid ${tabColors[key]}` : "none",
                transition: "all 0.15s",
              }}
            >
              {tabEmojis[key]}<br />{tabLabels[key]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 12px" }}>
          <p style={{ fontWeight: 700, margin: "8px 0 4px", fontSize: 14 }}>
            Nearby {tabLabels[activeTab]}
            <span style={{ fontWeight: 400, color: "#999", marginLeft: 6, fontSize: 12 }}>
              ({currentList.length})
            </span>
          </p>

          {currentLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", color: "#666", fontSize: 12 }}>
              <div style={{
                width: 16, height: 16, border: "2px solid #ddd",
                borderTop: `2px solid ${tabColors[activeTab]}`,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              Finding nearby {tabLabels[activeTab].toLowerCase()}…
            </div>
          )}

          {currentError && !currentLoading && (
            <p style={{ color: "#e63946", fontSize: 12, marginTop: 8 }}>{currentError}</p>
          )}

          {!currentLoading && !currentError && currentList.length === 0 && (
            <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>No {tabLabels[activeTab].toLowerCase()} found nearby.</p>
          )}

          {!currentLoading && currentList.map((place, i) => (
            <PlaceCard
              key={i}
              place={place}
              onGetDirections={getDirections}
              onViewOnMap={(p) => setFlyTarget({ ...p, _t: Date.now() })}
              routeLoading={routeLoading}
              accentColor={tabColors[activeTab]}
            />
          ))}
        </div>
      </div>

      {/* Spinner keyframe (injected once) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Map;