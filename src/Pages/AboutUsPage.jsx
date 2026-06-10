import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  PhoneCall, 
  Mail, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import ceo from '../assets/images/founder.jpg';
import manager from '../assets/images/manager.jpeg';
import productManager from '../assets/images/productManager.jpeg';
import HomeLayout from '../Layouts/HomeLayout';
import SocialMedia from '../components/SocialMedia';

function AboutUsPage() {



  const team = [
    {
      name: "Bishal Saud",
      role: "CEO & Founder",
      location: "Kanchanpur, Nepal",
      bio: "Full Stack Developer passionate about breaking down educational barriers. Founded this platform to build transparent, reliable neighborhood networks connecting students with premium local educators.",
      image: ceo, 
      phone: "+977 9865742290",
      email: "bishalbahadursaud@gmail.com"
    },
    {
      name: "Bibek Joshi",
      role: "Operations Manager",
      location: "Kanchanpur, Nepal",
      bio: "Operational strategist ensuring top-tier safety screening, verification mapping, and seamless coordination between local communities, parent requests, and teaching cohorts.",
      image: manager, 
      phone: "+977 986-8736074",
      email: "bebikjoshi1@gmail.com"
    },
    {
  name: "Bikash Dhami",
  role: "Project Manager",
  location: "Kanchanpur, Nepal",
  bio: "Responsible for planning, executing, and delivering projects efficiently while coordinating between teams and ensuring timely completion of platform goals.",
  image: productManager, 
  phone: "+977 986-8813739",
  email: "bikashdhami7350@gmail.com"
}
  ];

  const handleEmailInitiation = (name, email) => {
    toast.success(`Opening mail client to contact ${name}!`, {
      style: {
        borderRadius: '16px',
        background: '#0f172a',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold'
      },
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#fff',
      },
    });
    
    // Smooth delay before popping native client layer
    setTimeout(() => {
      window.location.href = `mailto:${email}?subject=Tuition Platform Inquiry`;
    }, 400);
  };

  const features = [
    {
      icon: <MapPin className="text-blue-600" size={24} />,
      title: "Hyper-Local Proximity",
      desc: "No more long commutes. Track active tutor batches and certified crash-courses executing right down your street."
    },
    {
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      title: "Verified Quality",
      desc: "Every educator undergo rigorous profile mapping to guarantee credible qualifications and safe neighborhood experiences."
    },
    {
      icon: <Target className="text-amber-600" size={24} />,
      title: "Direct Access",
      desc: "We eliminate hidden commissions. Call or live chat with your prospective neighborhood mentor completely transparently."
    }
  ];

  return (
    <HomeLayout>

  
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Dynamic Toast Mount Registry Wrapper Container */}
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* 1. HERO VISION BANNER */}
      <section className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-blue-600 animate-pulse" /> Empowering Local Education
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Bridging the Gap Between Star Students & Premium Tutors
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          We are building the definitive home tuition hub for Nepal. By merging cutting-edge proximity tracking with an absolute focus on security, we bring elite micro-classrooms right to your living room.
        </p>
      </section>

      {/* 2. PLATFORM VALUES / ADVANTAGES */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feat, index) => (
          <div key={index} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-2xs hover:shadow-md transition duration-300 space-y-3">
            <div className="p-3 bg-slate-50 w-max rounded-xl border border-slate-100">
              {feat.icon}
            </div>
            <h3 className="text-base font-black text-slate-900">{feat.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* 3. DYNAMIC STATS INSIGHT */}
      <section className="max-w-5xl mx-auto bg-gradient-to-r  text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="space-y-1">
            <div className="text-3xl font-black text-blue-400">100%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Direct Communication</div>
          </div>
          <div className="space-y-1 pt-6 md:pt-0">
            <div className="text-3xl font-black text-emerald-400">Verified</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Local Profiles</div>
          </div>
          {/* <div className="space-y-1 pt-6 md:pt-0">
            <div className="text-3xl font-black text-amber-400">रू 0</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Hidden Middleman Fees</div>
          </div> */}
          <div className="space-y-1 pt-6 md:pt-0">
            <div className="text-3xl font-black text-amber-400">Verified</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Local Teachers</div>
          </div>
        </div>
      </section>



      {/* 4. LEADERSHIP TEAM SECTION */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <Users className="text-blue-600" size={24} /> Meet Our Leadership
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            The minds driving education technology from Kanchanpur, Nepal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs hover:shadow-md transition duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Image & Main Meta row */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-slate-50 shrink-0">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-slate-900 truncate">
                        {member.name}
                      </h3>
                      <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10 shrink-0" strokeWidth={3} />
                    </div>
                    <p className="text-xs font-extrabold text-blue-600">{member.role}</p>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-0.5">
                      <MapPin size={11} className="text-slate-400" /> {member.location}
                    </span>
                  </div>
                </div>

                {/* Description Bio */}
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium pt-1">
                  {member.bio}
                </p>
              </div>

              {/* Communication Links Group Row Footer Layout */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 mt-5">
                <a 
                  href={`tel:${member.phone}`} 
                  className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall size={12} /> Call Direct
                </a>
                <button 
                  onClick={() => handleEmailInitiation(member.name, member.email)}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Mail size={12} /> Send Mail
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
<SocialMedia/>
      {/* 5. COMMUNITY FOOTNOTE */}
      <div className="max-w-md mx-auto text-center border-t border-slate-200/60 pt-8">
        <p className="text-xs text-slate-400 font-bold flex items-center justify-center gap-1.5">
          <GraduationCap size={14} /> Building the future of learning, one neighborhood at a time.
        </p>
      </div>

    </div>
      </HomeLayout>
  );
}

export default AboutUsPage;