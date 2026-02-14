import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CitizenLayout from "../layout/CitizenLayout";
import { MapPin, Calendar, Hash } from "lucide-react";

function statusPill(statusLabel) {
  switch (statusLabel) {
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

function fmt(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return d.toLocaleString();
}

function TimelineItem({ active, title, time, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            active
              ? "bg-[#1E3A8A] border-[#1E3A8A] text-white"
              : "bg-white border-gray-300 text-gray-400"
          }`}
        >
          <span className="text-lg font-bold">✓</span>
        </div>

        {!isLast && (
          <div
            className={`w-[2px] flex-1 mt-2 ${
              active ? "bg-[#1E3A8A]" : "bg-gray-200"
            }`}
            style={{ minHeight: 48 }}
          />
        )}
      </div>

      <div className="pb-8">
        <div className={`font-bold ${active ? "text-[#111827]" : "text-gray-400"}`}>
          {title}
        </div>
        <div className={`text-sm mt-1 ${active ? "text-gray-500" : "text-gray-400"}`}>
          {time}
        </div>
      </div>
    </div>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const API = import.meta.env.VITE_API_URL;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Guard: if API or id missing, don't call
    if (!API || !id) {
      setComplaint(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/complaints/${id}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setComplaint(null);
          return;
        }

        // ✅ Accept multiple backend response shapes
        // Expected: { status:"success", complaint:{...} }
        // But handle: { data:{...} } or directly { id:... }
        const c = json.complaint ?? json.data ?? json;

        // ✅ Validate minimal shape
        if (c && typeof c === "object" && (c.id || c.id === 0)) {
          setComplaint(c);
        } else {
          setComplaint(null);
        }
      } catch {
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, id]);

  const timeline = useMemo(() => {
    if (!complaint) return [];

    const items = [
      { title: "Reported", time: fmt(complaint.reported_at), active: !!complaint.reported_at },
      { title: "Acknowledged", time: fmt(complaint.acknowledged_at), active: !!complaint.acknowledged_at },
      { title: "In Progress", time: fmt(complaint.in_progress_at), active: !!complaint.in_progress_at },
      { title: "Resolved", time: fmt(complaint.resolved_at), active: !!complaint.resolved_at },
    ];

    // If current status is later but timestamp missing, still mark active up to status
    const s = complaint.status;
    const reached = (name) => {
      const order = ["Reported", "Acknowledged", "InProgress", "Resolved"];
      const idx = order.indexOf(s);
      const need = order.indexOf(name);
      return idx >= 0 && need >= 0 && idx >= need;
    };

    items[0].active = items[0].active || reached("Reported");
    items[1].active = items[1].active || reached("Acknowledged");
    items[2].active = items[2].active || reached("InProgress");
    items[3].active = items[3].active || reached("Resolved");

    return items;
  }, [complaint]);

  if (loading) {
    return (
      <CitizenLayout>
        <div className="text-gray-600">Loading…</div>
      </CitizenLayout>
    );
  }

  if (!complaint) {
    return (
      <CitizenLayout>
        <div className="text-gray-600">Complaint not found.</div>
      </CitizenLayout>
    );
  }

  const statusLabel = dbStatusToUiLabel(complaint.status);

  return (
    <CitizenLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Complaint Details</h1>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold">{complaint.type}</h2>

              <div className="mt-4 space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Hash size={16} />
                  <span className="font-semibold text-gray-700">Complaint ID:</span>
                  <span>#{complaint.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>
                    Ward {complaint.ward_no ?? "—"}, {complaint.department ?? "General"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{fmt(complaint.reported_at)}</span>
                </div>
              </div>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${statusPill(statusLabel)}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-8">
            <div className="text-lg font-bold mb-3">Description</div>
            <p className="text-gray-600 leading-relaxed">{complaint.description}</p>
          </div>

          <div className="mt-8">
            <div className="text-lg font-bold mb-3">Attached Image</div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              <img
                src={complaint.image_url || "https://via.placeholder.com/1200x600?text=No+Image"}
                alt="Complaint Attachment"
                className="w-full h-[260px] object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/1200x600?text=Image+Not+Available";
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-8">Status Timeline</h2>

          <div className="pl-2">
            {timeline.map((t, idx) => (
              <TimelineItem
                key={t.title}
                active={t.active}
                title={t.title}
                time={t.time}
                isLast={idx === timeline.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
