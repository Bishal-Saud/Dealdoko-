import React from 'react';
import { Lock } from 'lucide-react';

function RestrictedMapBanner() {
  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[80px]">
      
      {/* Content Left Side */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl flex-shrink-0">
          <Lock size={16} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
            Radar Mapping Restricted
          </span>
          <h2 className="text-xs font-bold text-slate-800 tracking-tight mt-1">
            Sign in to explore nearby tutors on the map
          </h2>
        </div>
      </div>
      
  
    </div>
  );
}

export default RestrictedMapBanner;