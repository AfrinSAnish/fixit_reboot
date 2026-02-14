import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const STATUS_FLOW = [
  "Reported",
  "Acknowledged",
  "In Progress",
  "Resolved",
];

function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const complaintData = {
    id: id,
    title: "Street Light Broken",
    ward: "Ward 12",
    zone: "Zone A",
    location: "Phoenix Mall Junction",
    description:
      "Street light near Phoenix Mall junction has been non-functional for the past week, causing safety concerns during night hours.",
    date: "10 Feb 2026 · 4:30 PM",
    citizen: "Rahul Sharma",
    phone: "+91 98765 43210",
    status: "In Progress",
  };

  const [status, setStatus] = useState(complaintData.status);
  const [open, setOpen] = useState(false);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setOpen(false);

    console.log("Send to backend:", {
      complaintId: id,
      status: newStatus,
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case "Reported":
        return "bg-gray-200 text-gray-700";
      case "Acknowledged":
        return "bg-yellow-200 text-yellow-800";
      case "In Progress":
        return "bg-blue-200 text-blue-800";
      case "Resolved":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-12">
      <div className="max-w-7xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-complaints")}
          className="mb-6 bg-[#1E3A8A] text-white px-5 py-2 rounded-lg hover:bg-[#16307A] transition"
        >
          ← Back to Complaints
        </button>

        {/* MAIN CARD */}
        <div className="bg-white shadow-xl rounded-3xl p-10 flex gap-16">

          {/* LEFT SIDE - DETAILS */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {complaintData.title}
                </h1>
                <p className="text-gray-500">
                  Complaint ID: #{complaintData.id}
                </p>
              </div>

              {/* STATUS DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className={`px-5 py-2 rounded-full font-semibold transition ${getStatusColor()}`}
                >
                  {status}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-xl w-44 z-50">
                    {STATUS_FLOW.map((s) => (
                      <div
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                <span className="font-semibold">Ward:</span> {complaintData.ward}
              </p>
              <p>
                <span className="font-semibold">Zone:</span> {complaintData.zone}
              </p>
              <p>
                <span className="font-semibold">Location:</span> {complaintData.location}
              </p>
              <p>
                <span className="font-semibold">Reported On:</span> {complaintData.date}
              </p>
              <p>
                <span className="font-semibold">Citizen:</span> {complaintData.citizen}
              </p>
              <p>
                <span className="font-semibold">Contact:</span> {complaintData.phone}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {complaintData.description}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - TIMELINE */}
          <div className="w-80">
            <h2 className="text-2xl font-bold mb-8">Status Timeline</h2>

            <div className="relative">
              {STATUS_FLOW.map((step, index) => {
                const isCompleted =
                  STATUS_FLOW.indexOf(status) >= index;

                return (
                  <div key={step} className="flex items-start mb-10 relative">

                    {/* Vertical Line */}
                    {index !== STATUS_FLOW.length - 1 && (
                      <div
                        className={`absolute left-3 top-6 w-1 h-16 ${
                          isCompleted ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      ></div>
                    )}

                    {/* Circle */}
                    <div
                      className={`w-6 h-6 rounded-full z-10 ${
                        isCompleted ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    ></div>

                    {/* Text */}
                    <div className="ml-6">
                      <p
                        className={`font-medium ${
                          isCompleted ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {step}
                      </p>
                      {isCompleted && (
                        <p className="text-sm text-gray-500">
                          Completed
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminComplaintDetails;
