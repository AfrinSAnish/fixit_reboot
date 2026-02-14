import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Wrench } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple demo login check
    if (adminId === "admin" && password === "1234") {
      navigate("/admin"); // ✅ go to admin dashboard
    } else {
      alert("Invalid Admin ID or Password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-md">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3 mb-8">
          <Wrench className="text-blue-600 w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">FIXit</h2>
            <p className="text-sm text-gray-500">Admin Login</p>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h3>
        <p className="text-gray-500 mb-8">Login to access the admin dashboard.</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Admin ID */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Admin ID</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Enter admin ID"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#2D4B9B] text-white py-3 rounded-xl font-semibold hover:bg-[#1E3A8A] transition"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-8">
          Admin portal for complaint management.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
