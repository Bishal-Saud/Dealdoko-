import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard.jsx"; 
import { ShieldAlert, KeyRound } from "lucide-react";

export default function ProtectedAdmin() {
  const [passcode, setPasscode] = useState("");

  const [isAuthorized, setIsAuthorized] = useState(
    () => sessionStorage.getItem("admin_authenticated") === "true"
  );
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const secretCode = import.meta.env.VITE_SECRET_CODE;

    if (passcode === secretCode) {
      sessionStorage.setItem("admin_authenticated", "true");
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
      setPasscode("");
    }
  };


  if (isAuthorized) {
    return <AdminDashboard />;
  }


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center">
          <ShieldAlert size={24} />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-100 tracking-tight">Restricted Overlord Space</h2>
          <p className="text-xs text-slate-400">
            Authorization token code verification required for interface deployment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <KeyRound size={16} className="absolute left-3.5 text-slate-500" />
            <input
              type="password"
              placeholder="Enter secure system console key..."
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full bg-slate-950/60 border ${
                error ? "border-rose-500 text-rose-400" : "border-slate-800 text-slate-200"
              } rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-blue-500 transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-600`}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-500 tracking-wide text-left animate-shake">
              ✕ Invalid authorization credentials. Access denied.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition"
          >
            Verify System Key
          </button>
        </form>
      </div>
    </div>
  );
}