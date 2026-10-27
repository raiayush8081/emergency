import { useState, useEffect } from "react";

// Easily configurable emergency services for target region (e.g. India)
const EMERGENCY_SERVICES = [
  {
    id: "112",
    number: "112",
    label: "112 — National Emergency Helpline",
    subtitle: "All-in-one Emergency Response",
    badge: "24/7 National",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    description: "Single unified emergency number for Police, Fire, and Ambulance across India.",
    availability: "National coverage · Operational nationwide · 24/7 response",
    icon: "🚨",
  },
  {
    id: "108",
    number: "108",
    label: "108 — Emergency Ambulance Service",
    subtitle: "Disaster & Medical Transport",
    badge: "State Medical / Ambulance",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Emergency medical dispatch, emergency transport, and disaster response.",
    availability: "Available in many participating states/regions (coverage varies locally). Not an official government affiliation.",
    icon: "🚑",
  },
];

// Simple telephone number validator: cleans non-digits, checks for 5-15 digits
function validatePhone(input) {
  if (!input || typeof input !== "string") return false;
  const cleaned = input.replace(/[\s\-().]/g, "");
  return /^\+?[0-9]{5,15}$/.test(cleaned);
}

export default function EmergencyCallPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState(null); // { number, label }
  const [contactInput, setContactInput] = useState("");
  const [contactNameInput, setContactNameInput] = useState("");
  const [savedContact, setSavedContact] = useState(null); // { name, phone }
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  // Load saved trusted contact from localStorage on mount
  useEffect(() => {
    try {
      const storedJson = localStorage.getItem("emergency_trusted_contact");
      if (storedJson) {
        setSavedContact(JSON.parse(storedJson));
      } else {
        // Fallback for older key
        const legacyPhone = localStorage.getItem("trustedContact");
        if (legacyPhone) {
          setSavedContact({ name: "Primary Contact", phone: legacyPhone });
        }
      }
    } catch (e) {
      console.warn("Could not load contact from localStorage:", e);
    }
  }, []);

  // Listen for global custom event 'open-emergency-call' from Navbar, Map, or LandingPage
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-emergency-call", handleOpen);
    return () => window.removeEventListener("open-emergency-call", handleOpen);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (confirmInfo) setConfirmInfo(null);
        else if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirmInfo]);

  const openPanel = () => setIsOpen(true);
  const closePanel = () => {
    setIsOpen(false);
    setConfirmInfo(null);
    setContactError("");
    setIsEditingContact(false);
  };

  const requestCall = (number, label) => {
    setConfirmInfo({ number, label });
  };

  const confirmCall = () => {
    if (confirmInfo) {
      const numToCall = confirmInfo.number.replace(/[\s\-()]/g, "");
      // Trigger tel: link to open device dialer
      window.location.href = `tel:${numToCall}`;
      setConfirmInfo(null);
    }
  };

  const saveContact = () => {
    setContactError("");
    if (!validatePhone(contactInput)) {
      setContactError("Please enter a valid phone number (at least 5 digits, e.g. +91 9876543210).");
      return;
    }

    const newContact = {
      name: contactNameInput.trim() || "Trusted Contact",
      phone: contactInput.trim(),
    };

    try {
      localStorage.setItem("emergency_trusted_contact", JSON.stringify(newContact));
      localStorage.setItem("trustedContact", newContact.phone);
      setSavedContact(newContact);
      setContactInput("");
      setContactNameInput("");
      setIsEditingContact(false);
    } catch (e) {
      console.error(e);
      setContactError("Unable to save to local storage.");
    }
  };

  const clearContact = () => {
    try {
      localStorage.removeItem("emergency_trusted_contact");
      localStorage.removeItem("trustedContact");
      setSavedContact(null);
      setContactInput("");
      setContactNameInput("");
      setIsEditingContact(false);
      setContactError("");
    } catch (e) {
      console.error(e);
    }
  };

  const startEditContact = () => {
    if (savedContact) {
      setContactNameInput(savedContact.name || "");
      setContactInput(savedContact.phone || "");
      setIsEditingContact(true);
      setContactError("");
    }
  };

  return (
    <>
      {/* ── Prominent Floating SOS Button ──────────────────────────────────── */}
      <button
        onClick={openPanel}
        style={{ zIndex: 99999 }}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition-all transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="Open Emergency Call panel"
        title="Emergency Calling Assistance (112 / 108)"
      >
        <span className="text-xl animate-pulse">🚨</span>
        <span className="tracking-wider text-sm md:text-base">SOS CALL</span>
      </button>

      {/* ── Main Emergency Call Modal ───────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{ zIndex: 100000 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          onClick={closePanel}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-red-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🚨</span>
                <div>
                  <h2 id="emergency-modal-title" className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                    Emergency Calling Assistance
                  </h2>
                  <p className="text-xs text-gray-500">Quick-dial emergency services and trusted contacts</p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-gray-800 text-sm">
              {/* Important Disclaimer Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <span className="text-base leading-none">ℹ️</span>
                <p>
                  <strong>Notice:</strong> Tapping <em>"Call Now"</em> opens your device's native phone handler with the selected number. This app does not automatically dispatch responders or place background calls.
                </p>
              </div>

              {/* Emergency Service Cards */}
              <div className="space-y-3">
                {EMERGENCY_SERVICES.map((srv) => (
                  <div
                    key={srv.id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-red-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{srv.icon}</span>
                        <h3 className="font-bold text-base text-gray-900">{srv.label}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${srv.badgeColor}`}>
                          {srv.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{srv.description}</p>
                      <p className="text-[11px] text-gray-400 mt-1 italic">{srv.availability}</p>
                      <div className="mt-1 font-mono font-bold text-red-600 text-sm">
                        Dial: {srv.number}
                      </div>
                    </div>
                    <button
                      onClick={() => requestCall(srv.number, srv.label)}
                      className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 min-w-[120px] text-sm cursor-pointer"
                    >
                      <span>📞</span>
                      <span>Call Now</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* ── Trusted Contact Section ───────────────────────────────────── */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">👤</span>
                    <h3 className="font-bold text-sm text-gray-900">Personal Emergency Contact</h3>
                  </div>
                  <span className="text-[11px] text-gray-400">Saved locally</span>
                </div>

                {savedContact && !isEditingContact ? (
                  <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{savedContact.name}</p>
                      <p className="font-mono text-sm text-indigo-700 font-semibold">{savedContact.phone}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Stored on your device only</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => requestCall(savedContact.phone, `${savedContact.name} (${savedContact.phone})`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </button>
                      <button
                        onClick={startEditContact}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-600 hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={clearContact}
                        className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/60 space-y-2.5">
                    <p className="text-xs text-gray-500">
                      Add a trusted family member or friend's number for 1-click calling in an emergency:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Contact name (e.g. Mom, Doctor)"
                        value={contactNameInput}
                        onChange={(e) => setContactNameInput(e.target.value)}
                        className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label="Contact name"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number (+91 98765...)"
                        value={contactInput}
                        onChange={(e) => {
                          setContactInput(e.target.value);
                          setContactError("");
                        }}
                        className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label="Contact phone number"
                      />
                    </div>
                    {contactError && (
                      <p className="text-xs text-red-600 font-medium">{contactError}</p>
                    )}
                    <div className="flex gap-2 justify-end">
                      {isEditingContact && (
                        <button
                          onClick={() => {
                            setIsEditingContact(false);
                            setContactError("");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={saveContact}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-xs transition"
                      >
                        Save Contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                On non-phone devices, manual dialing may be required.
              </span>
              <button
                onClick={closePanel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Dialog ─────────────────────────────────────────────── */}
      {confirmInfo && (
        <div
          style={{ zIndex: 100001 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-call-title"
          onClick={() => setConfirmInfo(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold">
                📞
              </div>
              <div>
                <h3 id="confirm-call-title" className="text-base font-bold text-gray-900">
                  Call Emergency Services?
                </h3>
                <p className="text-xs text-gray-400">Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              You are about to open your phone application to initiate a call to:
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p className="font-bold text-red-800 text-sm">{confirmInfo.label}</p>
              <p className="text-2xl font-mono font-extrabold text-red-600 mt-1 tracking-wider">
                {confirmInfo.number}
              </p>
            </div>

            <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
              Your device's native dialer will launch with this number. No call is connected automatically until you press call in your phone app.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmInfo(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmCall}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition flex items-center justify-center gap-1.5"
              >
                <span>Continue to Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
