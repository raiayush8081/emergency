import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleFind = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div className="text-2xl font-bold">Emergency Service Provider</div>
        <button
          onClick={handleFind}
          className="ml-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition"
        >
          Open Emergency App
        </button>
        {/* Hamburger for mobile */}
        <div className="md:hidden">
          {/* Simple placeholder for future hamburger menu */}
          <button className="text-gray-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-8 md:px-16 py-20">
        <div className="max-w-lg">
          <span className="inline-block bg-red-600 text-sm font-medium rounded-full px-3 py-1 mb-4">24/7 EMERGENCY ASSISTANCE</span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Emergency Help,<br />Exactly When You Need It.
          </h1>
          <p className="text-lg mb-8">
            Find nearby hospitals, police stations, pharmacies and essential emergency services using your location — quickly and reliably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleFind}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition"
            >
              🚨 Find Emergency Services
            </button>
            <Link
              to="#services"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-full transition"
            >
              Explore Services
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <img src="/hero.jpg" alt="Hero illustration" className="rounded-xl glass" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12">Everything You Need During an Emergency</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-8 md:px-16">
          {/* Service Card Component */}
          {[
            {title: "Hospitals", desc: "Locate nearby hospitals and medical facilities.", icon: "🏥"},
            {title: "Police", desc: "Quickly find nearby police stations when you need assistance.", icon: "🚔"},
            {title: "Pharmacies", desc: "Find nearby pharmacies for urgent medical needs.", icon: "💊"},
            {title: "Emergency Locations", desc: "Discover important emergency services around your current location.", icon: "🚑"},
          ].map((service) => (
            <div key={service.title} className="glass p-6 rounded-xl hover:shadow-xl transition transform hover:-translate-y-1 hover:border-red-500">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-8 md:px-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {[{
            step: "01",
            title: "Allow Location",
            desc: "Share your location so we can identify nearby emergency services."
          }, {
            step: "02",
            title: "Choose a Service",
            desc: "Select hospitals, police stations, pharmacies or other services."
          }, {
            step: "03",
            title: "Get Help",
            desc: "View nearby locations on the map and quickly navigate to them."
          }].map((item) => (
            <div key={item.step} className="flex-1 bg-gray-800 glass p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{item.step}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="py-20 bg-gray-900 text-center relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-64 h-64 bg-red-600 rounded-full opacity-30 animate-pulse mx-auto mt-10"></div>
        </div>
        <h2 className="text-4xl font-bold mb-6">Don't Waste Time When Every Second Matters.</h2>
        <p className="mb-8 max-w-xl mx-auto">
          Access nearby emergency services instantly using your location.
        </p>
        <button
          onClick={handleFind}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition"
        >
          🚨 Open Emergency Service Provider
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-6 md:px-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Emergency Service Provider</h3>
        <p className="mb-4">Connecting people with essential emergency services when they need them most.</p>
        <ul className="flex flex-col md:flex-row justify-center gap-4 mb-4">
          <li><Link to="/" className="hover:text-red-500 transition">Home</Link></li>
          <li><Link to="#services" className="hover:text:red-500 transition">Services</Link></li>
          <li><Link to="#how-it-works" className="hover:text-red-500 transition">How It Works</Link></li>
          <li><Link to="/app" className="hover:text-red-500 transition">Emergency App</Link></li>
        </ul>
        <p className="text-sm">Built for faster emergency assistance.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
