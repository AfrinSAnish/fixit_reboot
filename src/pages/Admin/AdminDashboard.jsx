import { Users, Ticket, FileWarning } from "lucide-react";
import logo from "../../assets/fixit_logo.png";
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const complaintsChange = 12;
  const escalatedCount = 3;

  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/escalations");
        setNotifications(res.data.escalated || []);
      } catch (err) {
        console.error("Escalation fetch failed:", err);
      }
    };

    fetchEscalations();
    const interval = setInterval(fetchEscalations, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate("/admin-login");
  };

  const getChangeColor = (value) => {
    if (value > 0) return "text-red-200";
    if (value < 0) return "text-green-200";
    return "text-white";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1E3A8A] text-white p-8">
        <div className="flex items-center mb-12 space-x-3">
          <img src={logo} alt="FixIt Logo" className="w-10 h-10" />
          <h2 className="text-2xl font-bold">FixIt Control</h2>
        </div>

        <ul className="space-y-4">
          {/* ✅ IMPORTANT: These routes MUST match App.jsx */}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold border-l-4 border-white"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/heatmap"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold border-l-4 border-white"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Heatmap
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold border-l-4 border-white"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Complaints
          </NavLink>

         <NavLink
  to="/admin/analytics"
  className={({ isActive }) =>
    `block px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-white text-[#1E3A8A] font-semibold border-l-4 border-white"
        : "hover:bg-[#2C4DB0]"
    }`
  }
>
  Analytics
</NavLink>


          <li
            onClick={handleLogout}
            className="cursor-pointer mt-10 text-red-300 hover:text-white"
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 relative">
        {/* TEXT "Notification" TOP RIGHT */}
        <div className="absolute top-8 right-12 text-right">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-blue-700 font-semibold hover:underline"
          >
            Notification
          </button>

          {showPanel && (
            <div className="mt-3 bg-white shadow-xl rounded-xl p-4 w-80 text-left border">
              <h4 className="font-semibold mb-3 text-gray-700">
                Auto Escalation Alerts
              </h4>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No new notifications.</p>
              ) : (
                notifications.map((item) => (
                  <div key={item.id} className="mb-3 p-3 bg-gray-100 rounded-lg">
                    <div className="font-semibold">Complaint ID #{item.id}</div>
                    <div className="text-sm">
                      {item.type} ({item.priority})
                    </div>
                    <div className="text-xs text-gray-500">
                      Department: {item.department}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">Welcome back, Admin</h1>
        <p className="text-gray-600 mb-8">Here’s what’s happening today.</p>

        {/* Complaints Card */}
        <div
          className="relative bg-[#3B82F6] text-white p-10 rounded-3xl shadow-lg mb-10
        transform transition duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl"
        >
          <FileWarning className="absolute right-8 top-8 w-20 h-20 opacity-20" />

          <h2 className="text-xl opacity-80">Total Complaints Today</h2>
          <p className="text-5xl font-bold mt-4">245</p>

          <p className={`mt-4 font-semibold ${getChangeColor(complaintsChange)}`}>
            {complaintsChange > 0 ? "+" : ""}
            {complaintsChange}% from yesterday
          </p>

          <p className="mt-2 text-sm opacity-80">{escalatedCount} escalated</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8">
          <div
            className="bg-white border p-8 rounded-2xl flex justify-between
          transform transition duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
          >
            <div>
              <p className="text-gray-600">Total Users</p>
              <h3 className="text-3xl font-bold mt-3">1,245</h3>
            </div>
            <Users className="text-[#1E3A8A] w-12 h-12" />
          </div>

          <div
            className="bg-white border p-8 rounded-2xl flex justify-between
          transform transition duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
          >
            <div>
              <p className="text-gray-600">Active Tickets</p>
              <h3 className="text-3xl font-bold mt-3">87</h3>
            </div>
            <Ticket className="text-[#1E3A8A] w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
