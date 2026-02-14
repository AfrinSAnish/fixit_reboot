import { useMemo, useState } from "react";
import CitizenLayout from "../layout/CitizenLayout";
import { MapPin, Phone, User, Mail } from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return (a + b).toUpperCase();
}

function maskAadhaar(a) {
  const s = String(a || "").replace(/\s+/g, "");
  if (s.length !== 12) return s || "";
  return `XXXX-XXXX-${s.slice(8)}`;
}

export default function Profile() {
  const [user] = useState(() => {
    const raw = localStorage.getItem("fixit_user");
    return raw ? JSON.parse(raw) : {};
  });

  const initials = useMemo(() => getInitials(user?.name), [user]);

  // ✅ FIX: accept all possible aadhaar keys (since your app uses aadhaar, backend uses aadhar)
  const aadhaarValue =
    user?.aadhaar || user?.aadhar_no || user?.aadhar || user?.aadhaar_no || "";

  // ✅ FIX: accept both mobile keys
  const mobileValue = user?.mobile_no || user?.mobile || "";

  // ✅ address from stored location_text (Signup already saves it)
  const locationText = user?.location_text || "";

  return (
    <CitizenLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Profile</h1>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* MAIN CARD ONLY (same UI styling) */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
          <div className="flex items-center gap-8">
            <div className="w-28 h-28 rounded-full bg-[#7C83FF] text-white flex items-center justify-center text-4xl font-extrabold">
              {initials}
            </div>

            <div>
              <div className="text-3xl font-extrabold text-gray-900">
                {user?.name || "User"}
              </div>
              <div className="text-gray-500 mt-2">Citizen Account</div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-8" />

          <div className="grid grid-cols-2 gap-8">
            {/* Full Name */}
            <div>
              <div className="font-bold text-gray-900 mb-3">Full Name</div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <User className="text-gray-400" size={18} />
                <input
                  value={user?.name || ""}
                  readOnly
                  className="w-full outline-none bg-transparent text-gray-800"
                />
              </div>
            </div>

            {/* Same UI block, but now shows Aadhaar instead of useless email */}
            <div>
              <div className="font-bold text-gray-900 mb-3">Aadhaar Number</div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <Mail className="text-gray-400" size={18} />
                <input
                  value={maskAadhaar(aadhaarValue)}
                  readOnly
                  placeholder="—"
                  className="w-full outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <div className="font-bold text-gray-900 mb-3">Mobile Number</div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <Phone className="text-gray-400" size={18} />
                <input
                  value={mobileValue}
                  readOnly
                  placeholder="—"
                  className="w-full outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="font-bold text-gray-900 mb-3">Address</div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <MapPin className="text-gray-400" size={18} />
                <input
                  value={locationText}
                  readOnly
                  placeholder="—"
                  className="w-full outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* keep this section exactly like your file (no behavior change) */}
          <div className="mt-10 flex gap-4"></div>
        </div>
      </div>
    </CitizenLayout>
  );
}
