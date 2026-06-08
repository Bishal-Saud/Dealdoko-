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
      
      {/* LEFT SIDE: SEO Value Proposition */}
      <div className="lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-6 md:p-8 text-white relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-400">
            <Sparkles size={11} className="animate-pulse" /> Verified Home Tuition Network
          </div>
          
          {/* H2 for SEO: Semantic meaning */}
          <h2 className="text-2xl font-black tracking-tight mt-4 leading-tight">
            Find <span className="text-blue-400">Expert Home Tutors</span> in Your Neighborhood
          </h2>
          
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 max-w-sm">
            Tol Path connects students across Nepal with verified, background-checked private tutors. High-quality home tuition for Mathematics, Science, and all academic subjects.
          </p>
        </div>

        <div className="mt-8 lg:mt-0 space-y-2 border-t border-slate-800/60 pt-4">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <CheckCircle2 size={13} className="text-blue-400" /> <span>100% Verified Home Tutors</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <CheckCircle2 size={13} className="text-blue-400" /> <span>Personalized 1-on-1 Academic Support</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: SEO Discovery & Local Intents */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50/60 flex flex-col justify-center">
        
        <form onSubmit={handleFormSubmit} className="relative w-full max-w-md mx-auto lg:mx-0">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 ml-1">
            Search for Home Tuition Teachers by City or Area
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400">
              <MapPin size={16} className="text-blue-500" />
            </span>
            <input
              type="text"
              aria-label="Enter city or area for home tuition"
              placeholder="e.g., Kanchanpur, Kathmandu, Pokhara..."
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button 
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-black rounded-lg transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Hubs: These are important SEO "Keyword Anchors" */}
        <div className="mt-6 pt-5 border-t border-slate-200/50 w-full max-w-md mx-auto lg:mx-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            Popular Local Tuition Hubs
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'].map((city) => (
              <button
                key={city}
                onClick={() => handleQuickSearch(city)}
                className="text-[11px] font-bold bg-white text-slate-700 hover:text-blue-600 border border-slate-200 p-2.5 rounded-xl transition-all"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TolPath;