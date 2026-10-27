import { Link } from "react-router-dom";

const Navbar = () => {
  const handleOpenEmergencyCall = () => {
    window.dispatchEvent(new CustomEvent("open-emergency-call"));
  };

  return (
    <header className="flex flex-row items-center justify-between px-3 md:px-6 py-2 border-b-2 border-gray-300 bg-amber-50 shadow-xs z-30">
      {/* Logo — clicking redirects to homepage */}
      <Link
        to="/"
        className="flex items-center gap-2 no-underline group"
        title="Go to homepage"
      >
        {/* Emergency bolt / shield logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="34"
          height="34"
          fill="none"
          aria-hidden="true"
          className="transition-transform group-hover:scale-105"
        >
          {/* Shield background */}
          <path
            d="M24 4L6 12v12c0 10.5 7.5 20.3 18 22.5C35.5 44.3 42 34.5 42 24V12L24 4z"
            fill="#dc2626"
          />
          {/* Lightning bolt */}
          <path
            d="M26 8l-8 14h8l-4 12 10-16h-8l4-10z"
            fill="white"
          />
        </svg>

        {/* Site name */}
        <span className="text-lg md:text-xl font-extrabold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
          Emergency Service Finder
        </span>
      </Link>

      {/* Right side: Emergency Call Button & Quick Navigation */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/app"
          className="text-xs md:text-sm font-semibold text-gray-700 hover:text-red-600 px-2 py-1 transition hidden sm:inline-block"
        >
          🗺️ Map
        </Link>

        {/* Prominent Emergency Calling button */}
        <button
          onClick={handleOpenEmergencyCall}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-1.5 px-3 md:px-4 rounded-full text-xs md:text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          title="Emergency Call 112 / 108"
          aria-label="Open emergency call dialog"
        >
          <span className="text-sm md:text-base animate-pulse">🚨</span>
          <span>Emergency Call</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;