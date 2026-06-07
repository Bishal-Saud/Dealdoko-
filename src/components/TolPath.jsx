import React, { useState } from 'react';
import { MapPin, Search, GraduationCap, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TolPath() {
  const navigate = useNavigate();
  const [localInput, setLocalInput] = useState("");

  const handleQuickSearch = (area) => {
    navigate(`/users?location=${encodeURIComponent(area)}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (localInput.trim()) {
      handleQuickSearch(localInput.trim());
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-slate-100/50 flex flex-col lg:flex-row min-h-[340px]">
      
      {/* LEFT SIDE: BRANDING & MARKETING IMPACT */}
      <div className="lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-6 md:p-8 text-white relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Decorative Ambient Lighting Glowing Orbs */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-28 h-28 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-400">
            <Sparkles size={11} className="animate-pulse" /> TolPath Engine
          </div>
          
          <h2 className="text-2xl font-black tracking-tight mt-4 leading-tight">
            Education <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Right Outside</span> Your Door.
          </h2>
          
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 max-w-sm">
            Skip structural commuting bottlenecks. Match directly with certified premium private home tutors operating straight within your local lane.
          </p>
        </div>

        {/* Minimal scannable micro-trust points */}
        <div className="mt-8 lg:mt-0 space-y-2 border-t border-slate-800/60 pt-4">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
            <span>100% Background Screened Instructors</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
            <span>Personalized 1-on-1 Personalized Care</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: DISCOVERY & GEOLOCATION SHORTCUTS */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50/60 flex flex-col justify-center">
        
        {/* Dynamic Inline Location Form */}
        <form onSubmit={handleFormSubmit} className="relative w-full max-w-md mx-auto lg:mx-0">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 ml-1">
            Search Home Tutors Globally By Area
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <MapPin size={16} className="text-blue-500" />
            </span>
            <input
              type="text"
              placeholder="Enter your street, lane, or town..."
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <button 
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Search</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </form>

        {/* Popular Hubs Grid - Removed stretch styles */}
        <div className="mt-6 pt-5 border-t border-slate-200/50 w-full max-w-md mx-auto lg:mx-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Popular Local Teaching Hubs
            </span>
            <div className="h-px bg-slate-200 flex-1 ml-3" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickSearch(city)}
                className="group flex items-center justify-between text-[11px] font-bold bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:border-blue-500/30 p-2.5 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer text-left"
              >
                <span className="truncate">{city}</span>
                <ArrowRight size={10} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Global Directory Link Redirect */}
        <div className="mt-5 text-center lg:text-left max-w-md mx-auto lg:mx-0">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition group cursor-pointer"
          >
            <span>Or browse the complete global directory of registered teachers</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default TolPath;