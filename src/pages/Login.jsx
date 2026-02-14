import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/fixit_logo.png";
import { useEffect, useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [aadhaar, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fixit_token");
    // ✅ if already logged in, go to user dashboard
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (aadhaar.trim().length !== 12) {
      alert("Enter a valid 12-digit Aadhaar.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhar: aadhaar.trim(),
          password: password,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 404) {
          alert("Aadhaar not registered. Please sign up first.");
          navigate("/signup");
          return;
        }
        if (res.status === 401) {
          alert("Incorrect password. Please try again.");
          return;
        }
        alert(json.detail || "Login failed");
        return;
      }

      localStorage.setItem("fixit_token", String(json.user_id));

      const prev = localStorage.getItem("fixit_user");
      const prevUser = prev ? JSON.parse(prev) : {};
      const cleaned = aadhaar.trim();

      const user = {
        ...prevUser,
        ...json,
        user_id: json.user_id,
        name: json.name,
        aadhaar: cleaned,
        aadhar: cleaned,
        aadhar_no: cleaned,
        aadhaar_no: cleaned,
        mobile_no: json.mobile_no || prevUser.mobile_no || prevUser.mobile || "",
        mobile: json.mobile || json.mobile_no || prevUser.mobile || prevUser.mobile_no || "",
        location_text: json.location_text || prevUser.location_text || "",
        lat: json.lat ?? prevUser.lat ?? null,
        lng: json.lng ?? prevUser.lng ?? null,
      };

      localStorage.setItem("fixit_user", JSON.stringify(user));
      localStorage.setItem("fixit_aadhaar", cleaned);

      // ✅ after login go to dashboard (not "/")
      navigate("/dashboard", { replace: true });
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
          <h2 className="text-2xl font-bold">FIXit</h2>
        </div>

        <h1 className="text-2xl font-bold text-[#1F2937]">Welcome back</h1>
        <p className="text-gray-600 mt-2 mb-6">
          Login using your Aadhaar to raise and track complaints.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
            type="text"
            placeholder="12-digit Aadhaar"
            required
            minLength={12}
            maxLength={12}
            className="w-full h-11 rounded-xl border border-gray-200 px-3"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            className="w-full h-11 rounded-xl border border-gray-200 px-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#1E3A8A] text-white font-semibold hover:bg-[#16306E] transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#1E3A8A] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
