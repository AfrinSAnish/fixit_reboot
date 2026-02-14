import { useNavigate, NavLink } from "react-router-dom";
import logo from "../../assets/fixit_logo.png";

function AdminComplaints() {
  const navigate = useNavigate();

  const complaints = [
    {
      id: 1,
      title: "Street Light Broken",
      ward: "Ward 12",
      zone: "Zone A",
      description:
        "Street light near Phoenix Mall junction has been non-functional for the past week.",
      date: "10 Feb · 4:30 PM",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Pothole on Main Road",
      ward: "Ward 8",
      zone: "Zone B",
      description:
        "Large pothole on MG Road causing traffic disruption and vehicle damage.",
      date: "12 Feb · 9:15 AM",
      status: "Acknowledged",
    },
  ];

  const statusStyles = {
    "In Progress": "bg-yellow-100 text-yellow-700",
    Acknowledged: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
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
            to="/admin-dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin-heatmap"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Heatmap
          </NavLink>

          <NavLink
            to="/admin-complaints"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Complaints
          </NavLink>

          <NavLink
            to="/admin-feedback"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-[#1E3A8A] font-semibold"
                  : "hover:bg-[#2C4DB0]"
              }`
            }
          >
            Analytics
          </NavLink>

          <li
            onClick={() => navigate("/admin-login")}
            className="cursor-pointer mt-10 text-red-300 hover:text-white"
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12">
        <h1 className="text-4xl font-bold mb-10">All Complaints</h1>

        <div className="space-y-8">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between hover:shadow-xl transition"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {complaint.title}
                </h2>

                <p className="text-sm text-gray-500 mb-2">
                  {complaint.ward}, {complaint.zone}
                </p>

                <p className="text-gray-600 mb-3">
                  {complaint.description}
                </p>

                <p className="text-sm text-gray-500">
                  {complaint.date}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${statusStyles[complaint.status]}`}
                >
                  {complaint.status}
                </span>

                {/* ✅ FIXED BUTTON */}
                <button
                  onClick={() =>
                    navigate(`/complaints/${complaint.id}`)
                  }
                  className="mt-4 bg-[#1E3A8A] text-white px-5 py-2 rounded-lg hover:bg-[#16307A] transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminComplaints;
