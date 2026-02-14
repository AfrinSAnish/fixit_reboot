import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import RequireAuth from "./auth/RequireAuth";

import Splash from "./pages/Splash";
import LandingPage from "./LandingPage";

// USER
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyComplaints from "./pages/MyComplaints";
import RaiseComplaint from "./pages/RaiseComplaint";
import ComplaintDetail from "./pages/ComplaintDetail";
import Profile from "./pages/Profile";

// ADMIN
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminHeatmap from "./pages/Admin/AdminHeatmap";
import AdminComplaints from "./pages/Admin/AdminComplaints";
import AdminFeedback from "./pages/Admin/AdminFeedback";


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrowserRouter>
      {showSplash ? (
        <Splash />
      ) : (
        <Routes>
          {/* MAIN ENTRY */}
          <Route path="/" element={<LandingPage />} />

          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* USER PROTECTED */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/my-complaints" element={<RequireAuth><MyComplaints /></RequireAuth>} />
          <Route path="/raise-complaint" element={<RequireAuth><RaiseComplaint /></RequireAuth>} />
          <Route path="/complaint/:id" element={<RequireAuth><ComplaintDetail /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/heatmap" element={<AdminHeatmap />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/analytics" element={<AdminFeedback />} />
          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
