import { Users, Ticket, FileWarning } from "lucide-react";
import logo from "../../assets/fixit_logo.png";
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getFirstWorking } from "../../api"; // must exist

function AdminDashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  const [stats, setStats] = useState({
    total_today: 0,
    percentage_change: 0,
    escalated_today: 0,
    total_users: 0,
    active_tickets: 0,
  });

  // ✅ Escalations fetch (your notification panel needs this)
  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/escalations");
        setNotifications(res.data.escalated || []);
      } catch (err) {
        console.error("Escalation fetch failed:", err);
      }
    };
    fetchEscalations();
  }, []);

  // ✅ Stats fetch (ONLY ONE place)
  useEffect(() => {
    (async () => {
      try {
        const { data, path } = await getFirstWorking([
          "/api/stats",
          "/stats",
          "/dashboard",
          "/api/dashboard",
        ]);
        console.log("✅ Stats loaded from:", path);
        setStats(data);
      } catch (err) {
        console.error("❌ Stats fetch failed on all paths:", err);
      }
    })();
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
        {/* Notification */}
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
        <div className="relative bg-[#3B82F6] text-white p-10 rounded-3xl shadow-lg mb-10">
          <FileWarning className="absolute right-8 top-8 w-20 h-20 opacity-20" />

          <h2 className="text-xl opacity-80">Total Complaints Today</h2>
          <p className="text-5xl font-bold mt-4">{stats.total_today}</p>

          <p className={`mt-4 font-semibold ${getChangeColor(stats.percentage_change)}`}>
            {stats.percentage_change > 0 ? "+" : ""}
            {stats.percentage_change}% from yesterday
          </p>

          <p className="mt-2 text-sm opacity-80">{stats.escalated_today} escalated</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white border p-8 rounded-2xl flex justify-between">
            <div>
              <p className="text-gray-600">Total Users</p>
              <h3 className="text-3xl font-bold mt-3">{stats.total_users}</h3>
            </div>
            <Users className="text-[#1E3A8A] w-12 h-12" />
          </div>

          <div className="bg-white border p-8 rounded-2xl flex justify-between">
            <div>
              <p className="text-gray-600">Active Tickets</p>
              <h3 className="text-3xl font-bold mt-3">{stats.active_tickets}</h3>
            </div>
            <Ticket className="text-[#1E3A8A] w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
