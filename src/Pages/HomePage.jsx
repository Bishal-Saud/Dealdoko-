import React, { useState, useEffect } from "react";
import HomeLayout from "../Layouts/HomeLayout";
import toast, { Toaster } from "react-hot-toast";
import ListingProducts from "../components/ListingProducts.jsx";
import TolPath from "../components/TolPath.jsx";
import { AlertCircle, Terminal } from "lucide-react";

function HomePage() {
  return (
    <HomeLayout>
      <Toaster />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 space-y-6 md:space-y-10">
        
        {/* PREMIUM WARNING / TESTING BANNER */}
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-start sm:items-center gap-3.5 shadow-xs backdrop-blur-xs relative overflow-hidden">
          {/* Ambient background accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl" />
          
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0 animate-pulse">
            <AlertCircle size={18} />
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block mb-1 sm:mb-0 sm:mr-2">
                Beta Environment
              </span>
              <p className="text-xs text-slate-600 font-bold inline-block">
                This platform is currently running strictly for testing purposes.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 self-start sm:self-auto">
              <Terminal size={13} />
              <span className="tracking-tight uppercase">Launching Soon</span>
            </div>
          </div>
        </div>

        {/* GEOLOCATION TUTOR SEARCH SEGMENT */}
        <TolPath />
        
        {/* PRODUCTS DIRECTORY GRID */}
        <ListingProducts />
      </main>
    </HomeLayout>
  );
}

export default HomePage;