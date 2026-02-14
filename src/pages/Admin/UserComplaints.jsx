import { Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserComplaints() {
  const navigate = useNavigate();

  const complaints = [
    {
      id: 1,
      title: "Street Light Broken",
      ward: "Ward 12",
      zone: "Zone A",
      description:
        "Street light near Phoenix Mall junction has been non-functional for the past week, causing safety concerns.",
      date: "10 Feb · 4:30 PM",
      pending: "Pending since 3 days 2 hours",
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
      pending: "Pending since 1 day 9 hours",
      status: "Acknowledged",
    },
    {
      id: 3,
      title: "Garbage Collection",
      ward: "Ward 12",
      zone: "Zone A",
      description:
        "Garbage has not been collected for 3 days in HSR Layout Sector 2.",
      date: "8 Feb · 7:00 AM",
      pending: "",
      status: "Resolved",
    },
  ];

  const statusStyles = {
    "In Progress": "bg-yellow-100 text-yellow-700",
    Acknowledged: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-4xl font-bold text-[#1E3A8A] mb-10">
        My Complaints
      </h1>

      <div className="space-y-8">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-start hover:shadow-xl transition"
          >
            {/* LEFT CONTENT */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {complaint.title}
                </h2>

                <div className="flex items-center text-gray-500 text-sm gap-1">
                  <MapPin size={14} />
                  {complaint.ward}, {complaint.zone}
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {complaint.description}
              </p>

              <div className="flex items-center text-sm text-gray-500 gap-2 mb-1">
                <Clock size={14} />
                {complaint.date}
              </div>

              {complaint.pending && (
                <p className="text-red-500 text-sm">
                  {complaint.pending}
                </p>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col items-end gap-4">
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${statusStyles[complaint.status]}`}
              >
                {complaint.status}
              </span>

              <button
                onClick={() => navigate(`/complaint/${complaint.id}`)}
                className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserComplaints;
