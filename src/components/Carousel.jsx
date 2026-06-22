import React from 'react';
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Carousel() {
  return (
    <div className="w-full text-left p-2 md:p-4">
      {/* Header Block aligned with your site typography */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <span>The Old Way</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">VS</span>
          <span className="text-blue-600">TolPath Journey</span>
        </h2>
        <p className="text-sm md:text-base font-medium text-slate-500 mt-2">
          Same Goal. <span className="text-blue-600 italic font-serif">Better Journey.</span>
        </p>
      </div>

      {/* Modern Side-by-Side Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* --- Card 1: The Old Way (Elegant Muted Slate styling) --- */}
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between relative transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Traditional Process</h3>
            </div>
            
            <ul className="space-y-5">
              {[
                { title: "No Clear Direction", desc: "Don't know where to start or what step comes next." },
                { title: "Expensive & Uncertain", desc: "High registration fees, tuition pages, and hidden costs." },
                { title: "Low Earnings", desc: "30-40% commission cuts reduce what you earn." },
                { title: "Too Many Middlemen", desc: "Depend on others for information and support." },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3.5 items-start">
                  <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide">{item.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="text-base">🙁</span>
            <span>You do everything alone without the results you deserve.</span>
          </div>
        </div>

        {/* --- Card 2: The Tolpath Way (Premium Brand Blue styling) --- */}
        <div className="bg-blue-50/30 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between relative transition-all hover:border-blue-200 shadow-xs">
          {/* Subtle brand glow highlight banner inside card top */}
          <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-blue-600 text-[10px] font-bold uppercase tracking-widest text-white px-2.5 py-1 rounded-full shadow-sm">
            Recommended
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">The TolPath Solution</h3>
            </div>
            
            <ul className="space-y-5">
              {[
                { title: "Easy Start", desc: "Create profile for FREE and get started in minutes." },
                { title: "Post Requirement for Free", desc: "Parents can post tuition needs for FREE." },
                { title: "No Commission Cuts", desc: "Keep 100% of your earnings from students." },
                { title: "Real Support", desc: "We're here to support you every step of the way." },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3.5 items-start">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-wide">{item.title}</h4>
                    <p className="text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 pt-4 border-t border-blue-100 text-xs font-bold text-blue-700 flex items-center gap-2">
            <span className="text-base">😊</span>
            <span>You teach, students learn, and you retain 100% of your income.</span>
          </div>
        </div>

      </div>
    </div>
  );
}