import logo from "../assets/fixit_logo.png";

export default function Splash() {
  return (
    <div className="min-h-screen bg-[#0B1F5C] flex items-center justify-center px-4">
      <div className="text-center text-white">
        <img src={logo} alt="FIXit" className="w-20 h-20 mx-auto mb-6 drop-shadow" />
        <h1 className="text-4xl font-extrabold tracking-wide">FIXit</h1>
        <p className="mt-3 text-white/80 text-lg">
          “Report. Track. Confirm. Make your ward better.”
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/60 text-sm">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
          Loading civic portal…
        </div>
      </div>
    </div>
  );
}
