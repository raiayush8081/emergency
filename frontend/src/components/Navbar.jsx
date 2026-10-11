import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex flex-row items-center justify-between p-2 border-b-2 border-gray-300 bg-amber-100">
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
          width="36"
          height="36"
          fill="none"
          aria-hidden="true"
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
        <span className="text-2xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-200">
          Emergency Service Finder
        </span>
      </Link>

      {/* Right side: site tagline or empty */}
      <span className="text-sm text-gray-500 hidden md:block">
        Find help near you, instantly.
      </span>
    </div>
  );
};

export default Navbar;