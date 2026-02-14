import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield } from "lucide-react";
import logo from "./assets/fixit_logo.png";

function LandingPage() {
  const navigate = useNavigate();
  const mainSectionRef = useRef(null);
  const roleSectionRef = useRef(null);

  // Auto scroll from splash to main landing
  useEffect(() => {
    const timer = setTimeout(() => {
      mainSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const scrollToRoles = () => {
    roleSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#F9FAFB] overflow-x-hidden">

      {/* ---------------- SPLASH SCREEN ---------------- */}
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <img src={logo} alt="FixIt Logo" className="w-32 h-32 mb-6" />
        <h1 className="text-9xl font-extrabold text-[#1E3A8A]">
          FIXit
        </h1>
      </div>

      {/* ---------------- MAIN LANDING ---------------- */}
      <div
        ref={mainSectionRef}
        className="min-h-screen flex flex-col items-center pt-24"
      >
        {/* Small header FIXit */}
        <div className="flex flex-col items-center mb-16">
          <img src={logo} alt="FixIt Logo" className="w-16 h-16 mb-3" />
          <h1 className="text-5xl font-bold text-[#1E3A8A]">
            FIXit
          </h1>
        </div>

        {/* Quote */}
        <div className="text-center px-6">
          <p className="text-4xl font-medium text-gray-700 leading-relaxed">
            Your voice{" "}
            <span className="text-[#3B82F6] text-5xl font-semibold">
              matters.
            </span>
            <br />
            Your issues,{" "}
            <span className="text-[#3B82F6] text-5xl font-semibold">
              resolved.
            </span>
          </p>

          <button
            onClick={scrollToRoles}
            className="mt-12 bg-[#1E3A8A] text-white px-10 py-4 rounded-xl text-lg hover:bg-[#16307A] transition duration-300"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* ---------------- ROLE SECTION ---------------- */}
      <div
        ref={roleSectionRef}
        className="min-h-screen flex flex-col items-center justify-center bg-white"
      >
        <h2 className="text-4xl font-bold text-[#1E3A8A] mb-12">
          Choose Your Role
        </h2>

        <div className="flex gap-12">

          <div
            onClick={() => navigate("/login")}
            className="cursor-pointer bg-[#F3F4F6] w-72 h-60 rounded-2xl shadow-md flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            <User size={55} className="text-[#1E3A8A] mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800">User</h3>
          </div>

          <div
            onClick={() => navigate("/admin-login")}
            className="cursor-pointer bg-[#F3F4F6] w-72 h-60 rounded-2xl shadow-md flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl"
          >
            <Shield size={55} className="text-[#1E3A8A] mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800">Admin</h3>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LandingPage;
