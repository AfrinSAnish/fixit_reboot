import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/fixit_logo.png";

export default function CitizenLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/dashboard" }, // ✅ FIX: was "/"
    { name: "My Complaints", path: "/my-complaints" },
    { name: "Raise Complaint", path: "/raise-complaint" },
    { name: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("fixit_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1E3A8A] text-white p-8 flex flex-col">
        {/* Logo */}
        <div className="flex items-center mb-12 space-x-3">
          <img src={logo} alt="FIXit Logo" className="w-10 h-10" />
          <h2 className="text-2xl font-bold tracking-wide">FIXit</h2>
        </div>

        {/* Navigation */}
        <ul className="space-y-6 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`block pr-4 transition duration-300 ${
                    isActive
                      ? "text-[#93C5FD] font-semibold"
                      : "group-hover:text-[#93C5FD]"
                  }`}
                >
                  {item.name}
                </Link>

                {/* Right Side Indicator Bar */}
                <span
                  className={`absolute right-0 top-0 h-full w-1 bg-[#93C5FD] transition-transform duration-300 origin-top ${
                    isActive
                      ? "scale-y-100"
                      : "scale-y-0 group-hover:scale-y-100"
                  }`}
                />
              </li>
            );
          })}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full text-left text-red-200 hover:text-red-400 transition font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12">{children}</div>
    </div>
  );
}
