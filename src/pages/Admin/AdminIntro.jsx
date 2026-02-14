import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminIntro() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin-dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">

      <h1 className="text-4xl font-bold text-blue-900 transition duration-300
      hover:text-blue-500 hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
        Admin Dashboard
      </h1>

      <p className="mt-6 text-lg text-gray-600 transition duration-300
      hover:text-blue-500 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">
        Oversee reports. Resolve issues. Empower communities.
      </p>

    </div>
  );
}

export default AdminIntro;
