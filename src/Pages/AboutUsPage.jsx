import React, { useEffect } from 'react';
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
  CheckCircle2,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import ceo from '../assets/images/founder.jpg';
import manager from '../assets/images/manager.jpeg';
import productManager from '../assets/images/productManager.jpeg';
import HomeLayout from '../Layouts/HomeLayout';
import SocialMedia from '../components/SocialMedia';

function AboutUsPage() {
useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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
      desc: "Every educator undergoes rigorous profile mapping to guarantee credible qualifications and safe neighborhood experiences."
    },
    {
      icon: <Target className="text-amber-600" size={24} />,
      title: "Direct Access",
      desc: "We eliminate hidden commissions. Call or live chat with your prospective neighborhood mentor completely transparently."
    }
  ];

  const pillars = [
    "Tutors can create their profile for free",
    "Parents can post tuition requirements for free",
    "Teachers can apply to nearby tuition opportunities",
    "No unnecessary middlemen",
    "No 30–40% commission cuts",
    "More transparency for both parents and tutors"
  ];

  return (
    <HomeLayout>
      <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased py-12 px-4 sm:px-6 lg:px-8 space-y-20">
        <Toaster position="top-center" reverseOrder={false} />
        
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

       
        <section className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden sm:block">
            <HeartHandshake size={140} className="text-blue-600" />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Why We Built TolPath
              </h2>
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
            </div>

            <div className="text-slate-600 text-sm md:text-base space-y-4 leading-relaxed font-medium">
              <p>
                A few months ago, one of my friends in Kathmandu was looking for a home tuition job. He joined several Facebook groups and tuition pages. 
              </p>
              <p>
                After finally finding a student, he was asked to pay an upfront registration fee. Then, when he secured the tuition opportunity, <span className="text-red-600 font-bold">another 30–40% commission was deducted</span> from his first month's earnings.
              </p>
              <p className="italic bg-slate-50 border-l-4 border-blue-500 p-3 rounded-r-xl text-slate-700">
                "As a student trying to earn and support himself, it felt fundamentally unfair."
              </p>
              <p>
                That experience made me realize a bigger problem: Why should teachers lose a large part of their hard-earned income just to get connected with students?
              </p>
              <p className="font-semibold text-slate-900">
                That's exactly where <span className="text-blue-600 font-extrabold">TolPath</span> was born.
              </p>
            </div>

           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {pillars.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-md mt-0.5 shrink-0">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Our Mission is Simple</p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Help students find quality tutors and help tutors find teaching opportunities near their area without paying huge commissions to third parties. We believe education opportunities should be accessible, fair, and transparent.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs md:text-sm font-black text-slate-950 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 w-max max-w-full">
                <RocketIcon className="text-blue-600 animate-bounce" /> 
                <span>Join us and help build a better tuition ecosystem in Nepal.</span>
              </div>
            </div>
          </div>
        </section>

       
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

        <section className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
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
            <div className="space-y-1 pt-6 md:pt-0">
              <div className="text-3xl font-black text-amber-400">Verified</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Local Teachers</div>
            </div>
          </div>
        </section>

        {/*  LEADERSHIP TEAM SECTION */}
        <section className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <Users className="text-blue-600" size={24} /> Meet Our Leadership
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              The minds driving education technology from Kanchanpur, Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-2xs hover:shadow-md transition duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
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

                  <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                    {member.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 mt-5">
                  <a 
                    href={`tel:${member.phone}`} 
                    className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <PhoneCall size={12} /> Call
                  </a>
                  <button 
                    onClick={() => handleEmailInitiation(member.name, member.email)}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <Mail size={12} /> Mail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SocialMedia />

  
        <div className="max-w-md mx-auto text-center border-t border-slate-200/60 pt-8">
          <p className="text-xs text-slate-400 font-bold flex items-center justify-center gap-1.5">
            <GraduationCap size={14} /> Building the future of learning, one neighborhood at a time.
          </p>
        </div>
      </div>
    </HomeLayout>
  );
}


function RocketIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ${props.className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.38m5.96 5.99V14.38m-5.96-6a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 009.63 8.38m0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

export default AboutUsPage;