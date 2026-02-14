// src/pages/RaiseComplaint.jsx
import { useEffect, useMemo, useState } from "react";
import CitizenLayout from "../layout/CitizenLayout";
import { Image as ImageIcon, Sparkles, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";

// -------------------- TYPE (AI-ish) --------------------
function detectType(text) {
  const t = (text || "").toLowerCase();

  const rules = [
    { type: "Sanitation", kws: ["garbage", "waste", "smell", "trash", "dump", "mosquito"] },
    { type: "Water", kws: ["water", "leak", "pipe", "drain", "drainage", "overflow", "sewage"] },
    { type: "Electricity", kws: ["power", "current", "shock", "transformer", "electric", "light", "street light"] },
    { type: "Road", kws: ["pothole", "road", "asphalt", "broken road", "traffic", "signal"] },
    { type: "Internet", kws: ["wifi", "internet", "broadband", "network"] },
  ];

  for (const r of rules) {
    if (r.kws.some((k) => t.includes(k))) return r.type;
  }
  return "Other";
}

// -------------------- PRIORITY (AI-ish) --------------------
function hashToInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function detectPriority(text) {
  const raw = (text || "").trim();
  const t = raw.toLowerCase();

  const high = [
    "fire",
    "accident",
    "electrocution",
    "shock",
    "collapse",
    "gas",
    "explosion",
    "emergency",
    "danger",
    "bleeding",
    "short circuit",
    "live wire",
  ];

  if (high.some((w) => t.includes(w))) return "High";

  const h = hashToInt(t);
  const bangs = Math.min((raw.match(/!/g) || []).length, 3);
  const value = (h + bangs * 101) % 100;

  if (value < 20) return "High";
  if (value < 65) return "Medium";
  return "Low";
}

// -------------------- BADGES --------------------
function typeBadge(type) {
  switch (type) {
    case "Sanitation":
      return "bg-purple-100 text-purple-700";
    case "Water":
      return "bg-sky-100 text-sky-700";
    case "Electricity":
      return "bg-yellow-100 text-yellow-800";
    case "Road":
      return "bg-orange-100 text-orange-700";
    case "Internet":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function priorityBadge(priority) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

// -------------------- IMAGE HELPERS --------------------

// Fallback: raw base64 (big)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ✅ Compress + resize to reduce base64 size drastically (keeps same UI)
async function compressToDataUrl(file, maxW = 900, quality = 0.7) {
  const img = new Image();
  const blobUrl = URL.createObjectURL(file);

  try {
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = blobUrl;
    });

    const scale = Math.min(1, maxW / img.width);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    // Convert to JPEG dataURL at chosen quality
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// Simple department mapping (required by DB)
function departmentFromType(type) {
  switch (type) {
    case "Electricity":
      return "Electricity";
    case "Water":
      return "Water";
    case "Sanitation":
      return "Sanitation";
    case "Road":
      return "Roads";
    case "Internet":
      return "IT/Network";
    default:
      return "General";
  }
}

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null); // {lat, lng}
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // objectURL (fast preview)
  const [imageDataUrl, setImageDataUrl] = useState(""); // compressed base64

  const type = useMemo(() => detectType(description), [description]);
  const priority = useMemo(() => detectPriority(description), [description]);

  useEffect(() => {
    let cancelled = false;

    if (!imageFile) {
      setImagePreview("");
      setImageDataUrl("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    (async () => {
      try {
        // ✅ compress first
        const compressed = await compressToDataUrl(imageFile, 900, 0.7);
        if (!cancelled) setImageDataUrl(compressed);
      } catch {
        // fallback to original (big) if compression fails
        try {
          const raw = await fileToDataUrl(imageFile);
          if (!cancelled) setImageDataUrl(raw);
        } catch {
          if (!cancelled) setImageDataUrl("");
        }
      }
    })();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const canSubmit =
    description.trim().length >= 10 &&
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // You store user_id in localStorage (token). Keep as-is.
    let userId = localStorage.getItem("fixit_token");

    // Fallback if you ever stored a user object:
    if (!userId) {
      try {
        const u = JSON.parse(localStorage.getItem("fixit_user") || "{}");
        userId = u.user_id;
      } catch {}
    }

    if (!userId) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          type,
          priority,
          department: departmentFromType(type),
          description: description.trim(),
          image_url: imageDataUrl || null, // ✅ compressed dataURL
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.detail || "Failed to submit complaint");
        return;
      }

      navigate(`/complaint/${json.complaint_id}`);
    } catch {
      alert("Backend not reachable. Is uvicorn running?");
    }
  };

  return (
    <CitizenLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Raise Complaint</h1>
        <p className="text-gray-600 mt-2">
          Describe the issue, upload a photo, and pinpoint the location on the map.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI badges */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles size={18} /> AI Detection
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${typeBadge(
                    type
                  )}`}
                >
                  Type: {type}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${priorityBadge(
                    priority
                  )}`}
                >
                  Priority: {priority}
                </span>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Type and priority update automatically from your description.
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Explain the issue clearly… (min 10 characters)"
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
              />
              <div className="text-xs text-gray-500 mt-2">
                Tip: Add landmarks (junction/shop/school) for faster resolution.
              </div>
            </div>

            {/* Image upload (single preview only) */}
            <div>
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <ImageIcon size={16} /> Upload Photo (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white"
              />

              {imagePreview ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-[220px] object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-500">No photo selected.</div>
              )}
            </div>

            {/* Submit warning */}
            {!location?.lat ? (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertTriangle size={18} className="mt-[2px]" />
                <div>Please select the location on the map before submitting.</div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full h-11 rounded-xl font-semibold transition
                ${
                  canSubmit
                    ? "bg-[#1E3A8A] text-white hover:bg-[#16306E]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              Submit Complaint
            </button>
          </form>
        </div>

        {/* RIGHT: Map */}
        <div className="space-y-6">
          <MapPicker value={location} onChange={setLocation} />

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="font-bold text-lg">What we’ll store</div>
            <div className="text-sm text-gray-600 mt-2">
              • Type (AI): <b>{type}</b> <br />
              • Priority (AI): <b>{priority}</b> <br />
              • Location:{" "}
              <b>{location ? `${location.lat}, ${location.lng}` : "Not selected"}</b>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
