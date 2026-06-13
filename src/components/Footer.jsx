import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

function Footer() {
  return (
    <footer className="hidden md:block bg-slate-950 text-slate-200 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Brand & National Reach Statement */}
          <section className="space-y-4">
            {/* Logo + Name */}
            <div className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="TolPath Logo"
                className="w-8 h-8 rounded-md"
              />
              <h3 className="text-2xl font-black text-white tracking-tight">
                Tol Path
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              The premier platform for verified home tuition in Nepal. We
              connect students across all 77 districts with expert, verified
              local tutors for personalized academic success. Based in
              Kanchanpur, serving the nation.
            </p>
          </section>

          {/* Tutoring Services (Keywords: Nationwide, Home Tuition) */}
          <nav className="space-y-4" aria-label="Tutoring Services">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Tutoring Services
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              {/* <li>
                <Link
                  to="/blog"
                  className="text-slate-400 hover:text-white transition"
                >
                  Blog
                </Link>
              </li> */}
              <li>
                <Link
                  to="/recent-queries"
                  className="text-slate-400 hover:text-white transition"
                >
                  Recently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  to="/role"
                  className="text-slate-400 hover:text-white transition"
                >
                  Become a Tutor
                </Link>
              </li>
            </ul>
          </nav>

          {/* Trust & Verification */}
          <nav className="space-y-4" aria-label="Trust and Legal">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
          
              <li>
                <Link
                  to="/terms-and-policy"
                  className="text-slate-400 hover:text-white transition"
                >
                  Terms and Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/aboutus"
                  className="text-slate-400 hover:text-white transition"
                >
                  About Tol Path
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact & National Presence */}
          <address className="space-y-4 not-italic">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Connect
            </h4>
            <div className="space-y-2 text-sm font-medium text-slate-400">
              <a
                href="mailto:tolpath.official@gmail.com"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <Mail size={16} className="text-blue-500" />{" "}
                tolpath.official@gmail.com
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />{" "}
                <span>HQ: Kanchanpur, Nepal</span>
              </div>
            </div>
          </address>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-900 pt-8 mt-4 flex justify-between text-slate-500 text-xs">
          <p>
            &copy; {new Date().getFullYear()} Tol Path. Providing home tuition
            services across Nepal.
          </p>
          <p>Nepal's Trusted Academic Tutoring Network</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
