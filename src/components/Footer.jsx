import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  MapPin, 
  Phone, 
  ArrowUpRight,
  Store,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { 
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaEnvelope,
  FaFacebook,
 
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="hidden md:block bg-slate-950 text-slate-200 border-t border-slate-900 font-sans relative overflow-hidden">
      {/* Background Decorative Gradient Flares */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand Statement */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tight">
              Tol <span className="text-blue-500">Path</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The premium destination for verified local trading, secure marketplace exchanges, and community connections.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Marketplace</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition flex items-center gap-1 group">
                  <span>Browse Directory</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-0.5 group-hover:-translate-y-0 group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition flex items-center gap-1 group">
                  <span>Explore Products</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-0.5 group-hover:-translate-y-0 group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link to="/role" className="text-slate-400 hover:text-white transition flex items-center gap-1 group">
                  <span>Become a Seller</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-0.5 group-hover:-translate-y-0 group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Safety & Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Trust & Safety</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/verify" className="text-slate-400 hover:text-amber-400 transition flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-500" />
                  <span>KYC Verification</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-and-policy" className="text-slate-400 hover:text-white transition flex items-center gap-1.5">
                  <HelpCircle size={16} className="text-slate-500" />
                  <span>Terms and Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/aboutus" className="text-slate-400 hover:text-white transition flex items-center gap-1.5">
                  <HelpCircle size={16} className="text-slate-500" />
                  <span>About US</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Connect with Us</h4>
            <div className="space-y-2 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <a href="mailto:bishalbahadursaud@gmail.com" className="hover:text-white transition">dealdoko.official@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                <span>Kanchanpur, Nepal</span>
              </div>
            </div>

            {/* Custom Glowing Social Icons Container */}
            <div className="pt-2 flex items-center gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                 className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-950/30 transition-all duration-300 shadow-xs hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <FaLinkedinIn size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"
                 className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-950/30 transition-all duration-300 shadow-xs hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <FaYoutube size={18} />
              </a>
              {/* Custom TikTok SVG Vector Integration */}
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok"
                 className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-teal-400 hover:border-teal-500/30 hover:bg-teal-950/30 transition-all duration-300 shadow-xs hover:shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94.12 1.88.3 2.8.58V8.65c-1.02-.19-2.06-.24-3.1-.14-.04 1.33-.01 2.66-.02 4 .01 2.22-.57 4.54-2.19 6.13-1.6 1.63-4.04 2.37-6.28 1.9-2.31-.41-4.38-2.28-4.9-4.57-.61-2.5.47-5.38 2.62-6.7 1.48-.94 3.32-1.18 4.98-.67v4.18c-1.01-.43-2.22-.24-3.04.49-.78.65-1.08 1.77-.73 2.72.33.95 1.34 1.6 2.35 1.48 1.05-.07 1.95-.94 2.01-2v-15.7z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"
                 className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-950/30 transition-all duration-300 shadow-xs hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <FaFacebook size={18} />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"
                 className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all duration-300 shadow-xs">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Horizontal Divider Layer */}
        <div className="border-t border-slate-900 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
            Kanchanpur, Nepal • 2026
          </p>
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Tol Path. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;