import CitizenLayout from "../layout/CitizenLayout";
import { MapPin, ThumbsUp, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// keep your old formatter (still used if backend ever returns reported_at)
function fmtWhen(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday - startOfThatDay) / 86400000);

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago · ${time}`;
  return d.toLocaleString();
}

export default function Dashboard() {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  // still keep token read (UI unchanged)
  const rawId = localStorage.getItem("fixit_token");
  const userId = rawId ? parseInt(rawId, 10) : NaN;

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  // local upvote storage (hackathon)
  const [voteMap, setVoteMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fixit_votes") || "{}");
    } catch {
      return {};
    }
  });

  const toggleVote = (id) => {
    setVoteMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("fixit_votes", JSON.stringify(next));
      return next;
    });
  };

  const votesOf = (c) => (c.votes || 0) + (voteMap[c.id] ? 1 : 0);

  useEffect(() => {
    // same behavior: if not logged in, show nothing
    if (!Number.isFinite(userId)) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    // ✅ ONLY CHANGE: fetch nearby complaints based on saved user lat/lng
    (async () => {
      setLoading(true);
      try {
        const rawUser = localStorage.getItem("fixit_user");
        const user = rawUser ? JSON.parse(rawUser) : {};

        const lat = user?.lat;
        const lng = user?.lng;

        if (typeof lat !== "number" || typeof lng !== "number") {
          setComplaints([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/complaints/nearby`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            radius_km: 5,
            limit: 50,
            only_unresolved: true,
          }),
        });

        const json = await res.json().catch(() => ({}));
        const items = Array.isArray(json?.items) ? json.items : [];

        // Map nearby items -> SAME dashboard card model (UI stays same)
        const mapped = items.map((r) => {
          const uiStatus = dbStatusToUiLabel(r.current_status || r.status);

          // time line in the same place:
          // prefer backend formatted waiting_time/reported_time; fallback to reported_at
          const timeText =
            (r.waiting_time && r.reported_time)
              ? `${r.waiting_time} · ${r.reported_time}`
              : fmtWhen(r.reported_at);

          // keep description area same, just append distance quietly
          const dist =
            typeof r.distance_km === "number" ? ` · ${r.distance_km.toFixed(2)} km` : "";

          return {
            id: r.id,
            title: r.type || "Complaint",
            zone: r.department || "General",
            status: uiStatus,
            time: `${timeText}${dist}`,
            desc: r.description || "—",
            votes: 0, // no votes in DB (keep same UI behavior)
          };
        });

        setComplaints(mapped);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, userId]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const open = total - resolved;
    return { total, open, resolved };
  }, [complaints]);

  return (
    <CitizenLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Welcome back 👋</h1>
        <p className="text-gray-600 mt-2">See what’s happening around you.</p>
      </div>

      {/* Summary (UNCHANGED UI) */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-gray-600 text-sm">Total Complaints</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-gray-600 text-sm">Pending</div>
          <div className="text-3xl font-bold mt-2">{stats.open}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
          <div className="text-gray-600 text-sm">Resolved</div>
          <div className="text-3xl font-bold mt-2">{stats.resolved}</div>
        </div>
      </div>

      {/* Around You (UNCHANGED UI) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">What’s happening around you</h2>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <MapPin size={16} />
          Local Feed
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-gray-600">
          Loading…
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-gray-600">
          No complaints found yet.
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6
                         hover:shadow-lg hover:-translate-y-[2px] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold">{c.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${badge(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={16} />
                      {c.zone}
                    </div>
                  </div>

                  <p className="text-gray-600 mt-3">{c.desc}</p>

                  <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={16} />
                    {c.time}
                  </div>
                </div>

                {/* Right controls (UNCHANGED UI) */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => toggleVote(c.id)}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition
                      whitespace-nowrap
                      ${
                        voteMap[c.id]
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                  >
                    <ThumbsUp size={18} />
                    {votesOf(c)}
                  </button>

                  <button
                    onClick={() => navigate(`/complaint/${c.id}`)}
                    className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-semibold
                               whitespace-nowrap min-w-[120px] text-center"
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
