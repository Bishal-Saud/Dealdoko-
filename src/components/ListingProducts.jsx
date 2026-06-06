import React, { useState, useEffect } from "react";
import {
  Heart,
  CheckCircle2,
  BookOpen,
  Loader2,
  GraduationCap,
  MessageSquare,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Phone,
  User,
  Layers,
  PhoneCall
} from "lucide-react";
import { supabase } from "../api/supabase.js";
import toast, { Toaster } from "react-hot-toast";
import ContactSellerPage from "../Pages/ContactSellerPage.jsx"; 
import LiveChatModal from "../model/LiveChatModel.jsx";
import { useNavigate } from "react-router-dom";

function ListingProducts() {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [courses, setCourses] = useState([]);
  const [localTutors, setLocalTutors] = useState([]);
  const [localCourses, setLocalCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chatActive, setChatActive] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const subjects = [
    "Mathematics",
    "Science & Tech",
    "English Literature",
    "Computer Science",
    "Economics / Accountancy",
    "Physics / Chemistry",
    "All Primary Subjects"
  ];

  const fetchTuitionDirectoryAndProfiles = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      let currentLoc = null;
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("location")
          .eq("id", user.id)
          .single();
        
        if (profileData?.location) {
          setUserLocation(profileData.location);
          currentLoc = profileData.location;
        }
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, phone_number, location, is_verified_seller");

      if (profilesError) throw profilesError;

      // Map profiles onto products directly
      const combinedData = productsData.map(product => {
        const matchingTutor = profilesData.find(p => p.id === product.seller_id);
        return {
          ...product,
          tutor_profile: matchingTutor || null
        };
      });
      setCourses(combinedData);

      if (currentLoc) {
        const cleanLoc = currentLoc.toLowerCase().trim();

        // Filter out tutors running within target address range
        const activeLocalTutors = profilesData.filter(profile => {
          const locationMatch = profile.location && profile.location.toLowerCase().trim() === cleanLoc;
          const isVerified = profile.is_verified_seller ?? true;
          return locationMatch && isVerified;
        }).map(tutor => {
          const tutorCourses = productsData.filter(p => p.seller_id === tutor.id);
          const uniqueSubjects = [...new Set(tutorCourses.map(c => c.subject || c.category).filter(Boolean))];
          return {
            ...tutor,
            active_subjects: uniqueSubjects,
            total_courses: tutorCourses.length
          };
        });
        setLocalTutors(activeLocalTutors);

        // Filter out specific course listings matching user environment profiles
        const filteredLocalBatches = combinedData.filter(course => 
          course.tutor_profile?.location && course.tutor_profile.location.toLowerCase().trim() === cleanLoc
        );
        setLocalCourses(filteredLocalBatches);
      }

    } catch (err) {
      console.error("Error reading tuition directory stream:", err.message);
      toast.error("Failed to sync structural tutor course listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTuitionDirectoryAndProfiles();
  }, []);

  const filteredCourses = courses.filter(
    (item) => (item.subject || item.category)?.toLowerCase() === activeSubject.toLowerCase()
  );

  const fallbackImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";

  const renderAvatar = (tutor) => {
    const displayName = tutor.full_name || tutor.username || "E";
    const initial = displayName.charAt(0).toUpperCase();
    
    if (tutor.avatar_url) {
      return (
        <img 
          src={tutor.avatar_url} 
          alt={displayName} 
          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-50 shrink-0" 
        />
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs ring-2 ring-blue-50 shrink-0">
        {initial}
      </div>
    );
  };

  if (selectedCourse) {
    return (
      <ContactSellerPage 
        product={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <Toaster />
      
      {/* LOCAL AREA PROFILE AND COURSES INTEGRATION BANNER */}
      <section>
        {userLocation ? (
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-3xl p-6 shadow-xs space-y-8">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <MapPin size={12} className="animate-bounce" /> Hub Proximity Tracker
              </span>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Neighborhood Directory for <span className="text-blue-600">{userLocation}</span>
              </h2>
            </div>

            {/* Sub-Section 1: Local Teachers Profiles */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-blue-500" /> Nearby Educators ({localTutors.length})
              </h3>
              {localTutors.length === 0 ? (
                <div className="text-center py-6 bg-white/60 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500">
                  No educators registered in {userLocation} yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {localTutors.map((tutor) => (
                    <div key={tutor.id} className="bg-white rounded-2xl border border-blue-100/70 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          {renderAvatar(tutor)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h4 className="text-sm font-black text-gray-900 truncate">
                                {tutor.full_name || (tutor.username ? `@${tutor.username}` : "Educator")}
                              </h4>
                              <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-500/10 shrink-0" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5 mt-0.5">
                              <GraduationCap size={11} /> {tutor.total_courses} active {tutor.total_courses === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-4 text-xs">
                          {tutor.active_subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {tutor.active_subjects.map((sub, idx) => (
                                <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-100">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400 font-medium italic">General Syllabus Tutors</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 mt-auto">
                        {tutor.phone_number ? (
                          <a href={`tel:${tutor.phone_number}`} className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition">
                            <Phone size={12} /> Call Now
                          </a>
                        ) : (
                          <button onClick={() => toast.error("Phone number wasn't listed.")} className="py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed">
                            <Phone size={12} /> No Phone
                          </button>
                        )}
                        <button onClick={() => navigate(`/profile/${tutor.id}`)} className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-2xs transition">
                          <User size={12} /> View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-Section 2: Local Target Classes With Explicit Dialer Injection */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" /> Active Local Batches ({localCourses.length})
              </h3>
              {localCourses.length === 0 ? (
                <div className="text-center py-6 bg-white/60 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500">
                  No tuition bundles targeted down {userLocation} streets yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {localCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-blue-100/70 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group">
                      <div onClick={() => setSelectedCourse(course)} className="cursor-pointer space-y-3">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
                          <img src={course.image_url || fallbackImage} alt={course.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {course.target_class || "All Levels"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">{course.title}</h4>
                          <p className="text-xs text-emerald-600 font-extrabold mt-0.5">रू {parseFloat(course.price || 0).toLocaleString()} /mo</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{course.description}</p>
                        </div>
                      </div>

                      {/* Direct Integrated Contact/Dialer Infrastructure row exactly like Profile Panel */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 mt-4">
                        {course.tutor_profile?.phone_number ? (
                          <a href={`tel:${course.tutor_profile.phone_number}`} className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition">
                            <PhoneCall size={12} /> Contact Now
                          </a>
                        ) : (
                          <button onClick={() => toast.error("Educator contact line unconfigured.")} className="py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed">
                            <PhoneCall size={12} /> No Contact
                          </button>
                        )}
                        <button onClick={() => navigate(`/profile/${course.seller_id}`)} className="py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition">
                          <User size={12} /> Tutor Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-blue-50/30 border border-amber-200/60 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-xs">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5 shadow-2xs">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900">Find the Perfect Home Tutor Near You</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl mt-0.5">
                  You haven't customized your matching neighborhood hub yet. Update your address layer to automatically extract home teachers taking batches down your street!
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/verify")} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm">
              <span>Add Your Location</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>

      {/* ACADEMIC SUBJECTS NAVIGATION TABS */}
      <section className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2.5 pb-2 md:pb-0">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setActiveSubject(subj)}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeSubject === subj
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </section>

      {/* RECENT / ALL SYSTEM LISTINGS DIRECTORY GRID */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            All Available General Tuitions{" "}
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {activeSubject}
            </span>
          </h2>
          <button onClick={fetchTuitionDirectoryAndProfiles} className="text-xs md:text-sm font-bold text-blue-600 hover:underline cursor-pointer">
            Refresh Classes
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="text-sm font-black text-gray-700">No active classes found</h3>
            <p className="text-xs font-medium text-gray-400 mt-1">
              Be the first educator to list a home tuition batch or crash course option under {activeSubject}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 hover:shadow-md transition duration-300 group flex flex-col h-full cursor-pointer"
              >
                <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                  <img src={course.image_url || fallbackImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />
                  <button onClick={(e) => { e.stopPropagation(); }} className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-xs rounded-full shadow-xs text-gray-500 hover:text-red-500 hover:bg-white transition z-10">
                    <Heart size={16} />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                    {course.target_class || "All Levels"}
                  </span>
                </div>

                <div className="p-3 md:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-amber-600 truncate mb-1">
                      <GraduationCap size={12} className="shrink-0 text-amber-500" />
                      <span className="truncate">Tutor: {course.seller_name || "Verified Educator"}</span>
                      <CheckCircle2 size={10} className="text-emerald-500 fill-emerald-500/10 shrink-0" strokeWidth={3} />
                    </div>
                    
                    <div className="text-base md:text-xl font-black text-gray-900 tracking-tight">
                      रू {parseFloat(course.price || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">/ month</span>
                    </div>

                    <h3 className="text-xs md:text-sm text-gray-700 font-bold line-clamp-1 group-hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                    
                    {course.timing && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded w-max mt-1">
                        <Clock size={10} className="text-slate-400" /> {course.timing}
                      </div>
                    )}

                    {course.tutor_profile?.location && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded w-max mt-1">
                        <MapPin size={10} className="text-blue-400" /> {course.tutor_profile.location}
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed pt-1">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-50 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(course);
                        setChatActive(true);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={13} /> Contact Educator
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LIVE INTERACTION CHAT MODAL MOUNT CONTROLLER */}
      {chatActive && selectedCourse && (
        <LiveChatModal 
          productId={selectedCourse.id}
          sellerId={selectedCourse.seller_id}
          buyerId={currentUser?.id} 
          onClose={() => setChatActive(false)}
        />
      )}
    </div>
  );
}

export default ListingProducts;