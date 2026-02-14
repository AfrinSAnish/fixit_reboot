import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/fixit_logo.png";
import { useEffect, useState } from "react";
import MapPicker from "../components/MapPicker";
import { AlertTriangle } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState(null); // {lat, lng}
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fixit_token");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (name.trim().length < 2) {
      alert("Enter your full name.");
      return;
    }
    if (aadhaar.trim().length !== 12) {
      alert("Enter a valid 12-digit Aadhaar.");
      return;
    }
    if (mobile.trim().length !== 10) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }
    if (password.trim().length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      alert("Please select your location on the map.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          aadhar: aadhaar.trim(), // backend expects "aadhar"
          ward: 1, // temp
          mobile: mobile.trim(),
          password: password,
          lat: location.lat,
          lng: location.lng,
          location_text: `${location.lat}, ${location.lng}`,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json.detail || "Signup failed");
        return;
      }

      const cleaned = aadhaar.trim();

      const user = {
        user_id: json.user_id,
        name: name.trim(),

        // ✅ store Aadhaar under all keys (so Profile never misses it)
        aadhaar: cleaned,
        aadhar: cleaned,
        aadhar_no: cleaned,
        aadhaar_no: cleaned,

        mobile_no: mobile.trim(),
        mobile: mobile.trim(),
        ward: 1,
        createdAt: new Date().toISOString(),

        lat: location.lat,
        lng: location.lng,
        location_text: `${location.lat}, ${location.lng}`,
      };

      localStorage.setItem("fixit_user", JSON.stringify(user));
      localStorage.setItem("fixit_aadhaar", cleaned);
      localStorage.setItem("fixit_mobile", mobile.trim());
      localStorage.setItem("fixit_token", String(json.user_id));

      navigate("/", { replace: true });
    } catch (err) {
      alert("Backend not reachable. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="FIXit" className="w-10 h-10" />
          <div>
            <div className="text-2xl font-bold text-[#1F2937]">FIXit</div>
            <div className="text-sm text-gray-500">Citizen Sign Up</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1F2937]">Create your account</h1>
        <p className="text-gray-600 mt-2 mb-6">
          Sign up to raise complaints and track updates in your area.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
              required
              className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3
                         focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Aadhaar</label>
            <input
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
              type="text"
              inputMode="numeric"
              placeholder="12-digit Aadhaar"
              maxLength={12}
              required
              className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3
                         focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              type="text"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              maxLength={10}
              required
              className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3
                         focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Create a password"
              required
              className="mt-2 w-full h-11 rounded-xl border border-gray-200 px-3
                         focus:outline-none focus:ring-2 focus:ring-[#93C5FD]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Select Location</label>
            <div className="mt-3">
              <MapPicker value={location} onChange={setLocation} />
            </div>

            {!location?.lat ? (
              <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertTriangle size={18} className="mt-[2px]" />
                <div>Please select your location on the map before signing up.</div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-gray-500">
                Selected: <b>{location.lat}, {location.lng}</b>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#1E3A8A] text-white font-semibold
                       hover:bg-[#16306E] transition disabled:opacity-60"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1E3A8A] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
