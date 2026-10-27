import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Simple parser for opening‑hours strings like "Mo-Fr 09:00-17:00; Sa 10:00-14:00"
function parseOpeningHours(hoursStr) {
  if (!hoursStr) return null;
  const segments = hoursStr.split(";").map((s) => s.trim());
  const now = new Date();
  const dayAbbr = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][now.getDay()];
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (const seg of segments) {
    const [dayPart, timePart] = seg.split(/\s+(?=\d)/);
    if (!timePart) continue;
    const [startDay, endDay] = dayPart.includes("-") ? dayPart.split("-") : [dayPart, dayPart];
    const days = [];
    const idx = (d) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].indexOf(d);
    let i = idx(startDay);
    const endIdx = idx(endDay);
    while (true) {
      days.push(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i]);
      if (i === endIdx) break;
      i = (i + 1) % 7;
    }
    if (!days.includes(dayAbbr)) continue;
    const intervals = timePart.split(",");
    for (const intv of intervals) {
      const [start, end] = intv.split("-");
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const startM = sh * 60 + sm;
      const endM = eh * 60 + em;
      if (minutesNow >= startM && minutesNow <= endM) {
        return { isOpen: true, nextChange: end };
      }
    }
  }
  return { isOpen: false, nextChange: null };
}

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // First try sessionStorage (saved when user clicked View Details)
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedHospital");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id === id || String(parsed.id) === String(id)) {
          setHospital(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Could not parse selectedHospital:", e);
      }
    }

    // Fallback: fetch directly from Geoapify using place_id filter
    async function fetchDetails() {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v2/places?filter=place_id:${id}&limit=1&apiKey=${GEOAPIFY_KEY}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.features || data.features.length === 0) throw new Error("Hospital record not found.");
        const f = data.features[0];
        const props = f.properties || {};
        const enriched = {
          id: props.place_id || props.id || id,
          name: props.name,
          address: props.formatted || props.address_line1 || props.street || null,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          phone: props.phone || null,
          website: props.website || props.url || null,
          opening_hours: props.opening_hours || props.hours || null,
          booking_url: props.booking_url || null,
        };
        setHospital(enriched);
      } catch (e) {
        console.error(e);
        setError("Failed to load hospital details. Please go back to the map.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleDirections = () => {
    if (hospital) {
      sessionStorage.setItem(
        "directionTarget",
        JSON.stringify({ lat: hospital.lat, lng: hospital.lng, name: hospital.name })
      );
    }
    navigate("/app");
  };

  const statusInfo = hospital ? parseOpeningHours(hospital.opening_hours) : null;
  const isOpen = statusInfo?.isOpen;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-red-600 transition cursor-pointer"
          >
            <span>←</span>
            <span>Back to Emergency Map</span>
          </button>
          <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
            🏥 Hospital Details
          </span>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading hospital information…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
            <p className="font-bold text-lg mb-2">Notice</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate("/app")}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-red-700"
            >
              Return to Map
            </button>
          </div>
        )}

        {!loading && !error && hospital && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header banner */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-linear-to-r from-red-50 to-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  🏥
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {hospital.name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>{hospital.address || "Address not provided"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Content grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="border border-gray-100 bg-gray-50/60 rounded-xl p-5 space-y-3">
                <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <span>📞</span>
                  <span>Contact Information</span>
                </h2>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  {hospital.phone ? (
                    <a
                      href={`tel:${hospital.phone.replace(/[\s\-()]/g, "")}`}
                      className="text-base font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5 mt-0.5"
                    >
                      <span>📞</span>
                      <span>{hospital.phone}</span>
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Direct phone not listed</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Official Website</p>
                  {hospital.website ? (
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-1 mt-0.5"
                    >
                      <span>🌐</span>
                      <span>{hospital.website}</span>
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Website not available</p>
                  )}
                </div>
              </div>

              {/* Opening Hours */}
              <div className="border border-gray-100 bg-gray-50/60 rounded-xl p-5 space-y-3">
                <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <span>🕒</span>
                  <span>Operating Status</span>
                </h2>
                {hospital.opening_hours ? (
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                        isOpen
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {isOpen ? "🟢 OPEN NOW" : "🔴 CURRENTLY CLOSED"}
                    </span>
                    <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 font-mono">
                      {hospital.opening_hours}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700 mb-1">
                      ℹ️ 24/7 Emergency Care Typical
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Specific outpatient hours not listed. Emergency units are typically open 24/7.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDirections}
                className="flex-1 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🗺️</span>
                <span>Get Directions on Map</span>
              </button>

              {hospital.booking_url ? (
                <a
                  href={hospital.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 text-center"
                >
                  <span>📅</span>
                  <span>Book Appointment</span>
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-200 text-gray-400 font-medium py-3 px-5 rounded-xl text-sm cursor-not-allowed text-center"
                  title="Online appointment booking is not configured for this facility"
                >
                  📅 Online Booking Unavailable
                </button>
              )}

              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-emergency-call"))}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>🚨</span>
                <span>Call 112</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
