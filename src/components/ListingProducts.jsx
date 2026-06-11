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
  PhoneCall,
  SlidersHorizontal,
  Briefcase,
} from "lucide-react";
import { supabase } from "../api/supabase.js";
import toast, { Toaster } from "react-hot-toast";
import LiveChatModal from "../model/LiveChatModel.jsx";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LocationAccess from "./LocationAccess.jsx";

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

  // Filter States for Local Batches/Courses
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");

  const subjects = [
    "Mathematics",
    "Science & Tech",
    "English Literature",
    "Computer Science",
    "Economics / Accountancy",
    "Physics / Chemistry",
    "All Primary Subjects",
  ];

  const fetchTuitionDirectoryAndProfiles = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user);

      // 1. Fetch Profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, avatar_url, phone_number, location, location_name, location_description, is_verified_seller"
        );

      if (profilesError) throw profilesError;

      // 2. Fetch All Products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // 3. Filter products: Keep verified sellers
      const verifiedProducts = productsData.filter((product) => {
        const tutor = profilesData.find((p) => p.id === product.seller_id);
        return tutor && tutor.is_verified_seller === true;
      });

      // 4. Map profiles to listings
      const combinedData = verifiedProducts.map((product) => {
        const matchingTutor = profilesData.find(
          (p) => p.id === product.seller_id
        );

        return {
          ...product,
          tutor_profile: matchingTutor || null,
        };
      });

      setCourses(combinedData);

      // --- Logic for Local Filters ---
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("location")
          .eq("id", user.id)
          .single();

        if (profileData?.location) {
          const currentLoc = profileData.location;
          setUserLocation(currentLoc);
          const cleanLoc = currentLoc.toLowerCase().trim();

          const activeLocalTutors = profilesData
            .filter((profile) => {
              const pLoc = profile.location?.toLowerCase() || "";
              const pLocName = profile.location_name?.toLowerCase() || "";

              const isLocationMatch =
                pLoc.includes(cleanLoc) ||
                cleanLoc.includes(pLoc) ||
                pLocName.includes(cleanLoc) ||
                cleanLoc.includes(pLocName);

              return isLocationMatch && profile.is_verified_seller === true;
            })
            .map((tutor) => {
              const tutorCourses = verifiedProducts.filter(
                (p) => p.seller_id === tutor.id
              );
              const uniqueSubjects = [
                ...new Set(
                  tutorCourses
                    .map((c) => c.subject || c.category)
                    .filter(Boolean)
                ),
              ];

              return {
                ...tutor,
                active_subjects: uniqueSubjects,
                total_courses: tutorCourses.length,
              };
            });

          setLocalTutors(activeLocalTutors);

          setLocalCourses(
            combinedData.filter((c) => {
              const pLoc = c.tutor_profile?.location?.toLowerCase() || "";
              const pLocName =
                c.tutor_profile?.location_name?.toLowerCase() || "";

              return (
                pLoc.includes(cleanLoc) ||
                cleanLoc.includes(pLoc) ||
                pLocName.includes(cleanLoc) ||
                cleanLoc.includes(pLocName)
              );
            })
          );
        }
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
    (item) =>
      (item.subject || item.category)?.toLowerCase() ===
      activeSubject.toLowerCase()
  );

  // Filter local courses based on interactive user parameters
  const filteredLocalCourses = localCourses.filter((course) => {
    const matchesPrice = maxPrice
      ? parseFloat(course.price || 0) <= parseFloat(maxPrice)
      : true;
    const matchesClass =
      selectedClass === "All"
        ? true
        : course.target_class?.toLowerCase() === selectedClass.toLowerCase();
    return matchesPrice && matchesClass;
  });

  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";

  const renderAvatar = (tutor) => {
    const displayName = tutor.full_name || tutor.username || "E";
    const initial = displayName.charAt(0).toUpperCase();

    if (tutor.avatar_url) {
      return (
        <img
          src={tutor.avatar_url}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50 shrink-0"
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center ring-2 ring-blue-50 shrink-0">
        {initial}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12 px-4 max-w-7xl mx-auto">
      <Helmet>
        <title>
          {userLocation
            ? `Verified Home Tuition Teachers in ${userLocation} | Tol Path`
            : "Find Verified Home Tutors Near You in Nepal | Tol Path"}
        </title>
        <meta
          name="description"
          content={
            userLocation
              ? `Find the best home tuition teachers in ${userLocation}. Verified educators for all subjects on Tol Path.`
              : "Connect with verified home tutors across Nepal. Personalized academic support and home tuition for all classes."
          }
        />
      </Helmet>

      <Toaster />

      {/* LOCAL AREA PROFILE AND COURSES INTEGRATION BANNER */}
      <section>
        {userLocation ? (
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100/80 rounded-3xl p-4 md:p-6 shadow-xs space-y-6">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <MapPin size={10} className="animate-pulse" /> Hub Proximity Tracker
              </span>
              <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">
                Home Tuition Setup in {userLocation}
              </h1>
            </div>

            {/* Sub-Section 1: Local Teachers Profiles - Max 5 Teachers, Compact UI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User size={14} className="text-blue-500" /> Nearby Educators (Showing Max 5)
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  Total available: {localTutors.length}
                </span>
              </div>

              {localTutors.length === 0 ? (
                <div className="text-center py-6 bg-white/60 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500">
                  No educators registered in {userLocation} yet.
                </div>
              ) : (
                /* Native Responsive Horizontal Slider Layout */
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                  {localTutors.slice(0, 5).map((tutor) => (
                    <div
                      key={tutor.id}
                      className="bg-white rounded-xl border border-blue-100 p-3 shadow-2xs hover:shadow-xs transition flex flex-col justify-between min-w-[240px] max-w-[250px] sm:flex-1 snap-start shrink-0"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderAvatar(tutor)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-0.5">
                              <h4 className="text-xs font-black text-gray-900 truncate">
                                {tutor.full_name || `@${tutor.username || "Educator"}`}
                              </h4>
                              <CheckCircle2
                                size={11}
                                className="text-emerald-500 fill-emerald-500/10 shrink-0"
                                strokeWidth={3}
                              />
                            </div>
                            <p className="text-[10px] font-bold text-blue-600 truncate uppercase">
                              {tutor.location_name || tutor.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="bg-slate-50 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-0.5">
                            <GraduationCap size={10} /> {tutor.total_courses} Classes
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-50">
                        {tutor.phone_number ? (
                          <a
                            href={`tel:${tutor.phone_number}`}
                            className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-0.5 transition"
                          >
                            <Phone size={10} /> Call
                          </a>
                        ) : (
                          <button
                            onClick={() => toast.error("Phone number wasn't listed.")}
                            className="py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-not-allowed"
                          >
                            <Phone size={10} /> None
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/profile/${tutor.id}`)}
                          className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-0.5 transition"
                        >
                          Profile <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-Section 2: Interactive Local Batches System (With Filter Controls) */}
            <div className="space-y-4 pt-2 border-t border-blue-100/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-500" /> Active Local Batches ({filteredLocalCourses.length})
                </h3>

                {/* Filter Controls Bar */}
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                    <SlidersHorizontal size={12} className="text-gray-400" />
                    <input
                      type="number"
                      placeholder="Max Price (रू)"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-24 outline-hidden text-[11px] font-medium"
                    />
                  </div>

                </div>
              </div>

              {filteredLocalCourses.length === 0 ? (
                <div className="text-center py-6 bg-white/60 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500">
                  No courses matching filter rules down {userLocation}.
                </div>
              ) : (
                /* Highly Compact High Density Mobile Friendly Grid Layout */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredLocalCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-blue-100/70 p-2.5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group"
                    >
                      <div
                        onClick={() => navigate(`/book-tutor/${course.id}`)}
                        className="cursor-pointer space-y-2"
                      >
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-50">
                          <img
                            src={course.image_url || fallbackImage}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                            {course.target_class || "General"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-emerald-600 font-black mt-0.5">
                            रू {parseFloat(course.price || 0).toLocaleString()} /mo
                          </p>

                          {/* Interactive Deal Architecture Metric Row */}
                          <div className="flex flex-col gap-0.5 mt-1 text-[9px] text-slate-400 font-bold">
                            {course.timing && (
                              <span className="flex items-center gap-0.5 text-gray-600">
                                <Clock size={9} /> {course.timing}
                              </span>
                            )}
                        
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-2 border-t border-gray-50 mt-2">
                        {course.tutor_profile?.phone_number ? (
                          <a
                            href={`tel:${course.tutor_profile.phone_number}`}
                            className="py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[9px] font-black flex items-center justify-center gap-0.5 transition"
                          >
                            <PhoneCall size={9} /> Call
                          </a>
                        ) : (
                          <button
                            onClick={() => toast.error("Educator line unconfigured.")}
                            className="py-1 bg-gray-50 text-gray-400 rounded-md text-[9px] font-bold flex items-center justify-center gap-0.5 cursor-not-allowed"
                          >
                            <PhoneCall size={9} /> None
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/profile/${course.seller_id}`)}
                          className="py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[9px] font-black flex items-center justify-center transition"
                        >
                          View Bio
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <LocationAccess />
        )}
      </section>

    

      {/* LIVE INTERACTION CHAT MODAL */}
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