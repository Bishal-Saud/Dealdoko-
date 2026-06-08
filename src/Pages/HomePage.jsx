import React from "react";
import { Helmet } from "react-helmet-async"; 
import HomeLayout from "../Layouts/HomeLayout";
import ListingProducts from "../components/ListingProducts.jsx";
import TolPath from "../components/TolPath.jsx";
import { AlertCircle, Terminal, CheckCircle2, ShieldCheck, Users } from "lucide-react";

function HomePage() {
  return (
    <HomeLayout>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Find Verified Home Tuition Teachers in Nepal | Tol Path</title>
        <meta 
          name="description" 
          content="Connect with the best home tuition teachers across Nepal. Tol Path provides verified, expert tutors for all subjects. Find a tutor near you today for academic success." 
        />
        <meta name="keywords" content="home tuition Nepal, home tutor near me, find teachers Kanchanpur, academic support, verified tutors" />
        <link rel="canonical" href="https://tolpath.com/" />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 space-y-6 md:space-y-10">
        
        {/* H1 Tag: The most important SEO signal for Google */}
        <section className="text-center py-8">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Expert <span className="text-blue-600">Home Tuition</span> in Nepal
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Bridging the gap between students and verified academic mentors. Find qualified home tutors near your city for personalized learning and better grades.
          </p>
        </section>

        {/* TRUST SIGNALS (SEO: Google likes platforms that emphasize safety) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-bold text-xs">
            <CheckCircle2 size={20} /> Verified Academic Backgrounds
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 font-bold text-xs">
            <ShieldCheck size={20} /> KYC & Safety Screened
          </div>
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800 font-bold text-xs">
            <Users size={20} /> Nationwide Tutor Network
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