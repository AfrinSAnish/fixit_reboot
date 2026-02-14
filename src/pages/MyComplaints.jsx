import CitizenLayout from "../layout/CitizenLayout";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";

function badge(status) {
  switch (status) {
    case "Reported":
      return "bg-gray-100 text-gray-700";
    case "Acknowledged":
      return "bg-sky-100 text-sky-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Resolved":
      return "bg-emerald-100 text-emerald-700";
    case "Escalated":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function dbStatusToUiLabel(dbStatus) {
  if (dbStatus === "InProgress") return "In Progress";
  return dbStatus || "Reported";
}

function pendingText(hours) {
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  if (hours <= 0) return "—";
  if (d === 0) return `Pending since ${h} hours`;
  if (h === 0) return `Pending since ${d} days`;
  return `Pending since ${d} days ${h} hours`;
}

function fmtDateText(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return d.toLocaleString();
}

function hoursSince(dt) {
  if (!dt) return 0;
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return 0;
  const diffMs = Date.now() - d.getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  return Math.max(0, hrs);
}

export default function MyComplaints() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("fixit_token");
    const userId = raw ? parseInt(raw, 10) : NaN;

    if (!Number.isFinite(userId)) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/complaints/user/${userId}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setComplaints([]);
          setLoading(false);
          return;
        }
        setComplaints(Array.isArray(json.complaints) ? json.complaints : []);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const mapped = complaints.map((c) => {
    const statusLabel = dbStatusToUiLabel(c.status);
    const pendingHours =
      statusLabel === "Resolved" ? 0 : hoursSince(c.reported_at);

    return {
      id: c.id,
      title: c.type || "Complaint",
      ward: c.location_text ? c.location_text : "Location",
      zone: c.department ? c.department : "General",
      desc: c.description || "—",
      status: statusLabel,
      dateText: fmtDateText(c.reported_at),
      pendingHours,
    };
  });

  return (
    <CitizenLayout>
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Complaints</h1>
          <p className="text-gray-600 mt-2">
            Track updates and confirm resolutions from your community.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : mapped.length === 0 ? (
        <div className="text-gray-600">No complaints yet.</div>
      ) : (
        <div className="space-y-6">
          {mapped.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6
                         hover:shadow-lg hover:-translate-y-[2px] transition cursor-pointer"
              onClick={() => navigate(`/complaint/${c.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold">{c.title}</h2>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin size={16} />
                      <span>
                        {c.ward}, {c.zone}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mt-3">{c.desc}</p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>{c.dateText}</span>
                  </div>

                  <div className="mt-2 text-sm font-semibold text-red-600">
                    {pendingText(c.pendingHours)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${badge(
                      c.status
                    )}`}
                  >
                    {c.status}
                  </span>

                  <button
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl
                               whitespace-nowrap
                               hover:bg-[#16306E]
                               transition"
                  >
                    Show Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}
