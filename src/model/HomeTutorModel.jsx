import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../api/supabase.js"; 
import {
  CheckCircle,
  Phone,
  MapPin,
  Star,
  BookOpen,
  Clock,
  Layers,
  Search,
  Users,
  GripHorizontal,
} from "lucide-react";

function HomeTutorModel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userLocation, setUserLocation] = useState("");

  // Shared Filter States
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile-Specific View Switcher Tab
  const [mobileActiveTab, setMobileActiveTab] = useState("tutors");

  // Dragging State for Mobile Sticky Bar
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);

  // Auto-switch mobile view tab to 'batches' when user starts searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setMobileActiveTab("batches");
    }
  }, [searchQuery]);

  useEffect(() => {
    async function fetchTutorData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1. Fetch user profile location
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Authentication session missing. Please sign in.");
        }

        const { data: currentUserProfile, error: profileError } = await supabase
          .from("profiles")
          .select("location_name")
          .eq("id", user.id)
          .single();

        if (profileError || !currentUserProfile?.location_name) {
          throw new Error("Could not retrieve your profile location context.");
        }

        const detectedLocation = currentUserProfile.location_name;
        setUserLocation(detectedLocation);

        // 2. Fetch verified local data matching current user's profile location
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            id, title, subject, target_class, price, timing, image_url, seller_name,
            profiles!inner (avatar_url, phone_number, rating, location_name, is_verified_seller)
          `)
          .eq("profiles.is_verified_seller", true)
          .eq("profiles.location_name", detectedLocation);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (err) {
        console.error("Data fetching failed:", err);
        setErrorMsg(err.message);
      } finally {
        // FIXED: Removed the accidental 'loading(false)' function call bug
        setLoading(false);
      }
    }

    fetchTutorData();
  }, []);

  // Native Drag handlers to make the sticky bar draggable
  const handleTouchStart = (e) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY - dragOffset;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentOffset = e.touches[0].clientY - startY.current;
    if (currentOffset >= -10 && currentOffset <= 120) {
      setDragOffset(currentOffset);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setDragOffset(0);
  };

  // 1. Extract unique teachers, sort them by highest rating, and slice the Top 5
  const topTeachers = Array.from(
    new Map(products.map((p) => [p.seller_name, p])).values()
  )
    .sort((a, b) => (b.profiles.rating || 0) - (a.profiles.rating || 0))
    .slice(0, 5);

  // 2. Compute full list of batches independently (shows ALL regional courses)
  const filteredBatches = products.filter((batch) => {
    const matchesTeacher = selectedTeacher
      ? batch.seller_name === selectedTeacher
      : true;
    const matchesSearch =
      batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeacher && matchesSearch;
  });

  // Handler utility to redirect user to book tutor route
  const handleCourseNavigation = (courseId) => {
    window.location.href = `/book-tutor/${courseId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">
            Finding tutors near you...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full text-center shadow-sm">
          <p className="text-sm text-red-600 font-bold mb-1">
            Connection Issue
          </p>
          <p className="text-xs text-slate-500 mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-slate-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 1. UNIVERSAL STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 backdrop-blur-md px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" />{" "}
              {userLocation || "Detecting Location"}
            </span>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900">
              Home Tuition Hub
            </h1>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects or classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 lg:bg-slate-50 border border-transparent lg:border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>
            {selectedTeacher && (
              <button
                onClick={() => setSelectedTeacher(null)}
                className="hidden lg:block text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MOBILE-ONLY TOP STICKY DRAGGABLE NAVIGATION BAR */}
      <div
        className="lg:hidden sticky top-[73px] z-30 px-4 py-2.5 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 touch-none select-none transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${dragOffset}px)` }}
      >
        <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-1 flex flex-col items-center">
          {/* Visual Drag Handle Anchor */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full flex justify-center py-1 cursor-grab active:cursor-grabbing"
          >
            <GripHorizontal className="w-5 h-3 text-slate-300" />
          </div>

          <div className="w-full flex">
            <button
              onClick={() => setMobileActiveTab("tutors")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                mobileActiveTab === "tutors"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4" /> Top Tutors ({topTeachers.length})
            </button>
            <button
              onClick={() => setMobileActiveTab("batches")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                mobileActiveTab === "batches"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-4 h-4" /> All Classes ({filteredBatches.length})
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        {/* DESKTOP LAYOUT (Large Screens) */}
        <div className="hidden lg:grid grid-cols-12 gap-8">
          {/* Desktop Left Sidebar: Tutors List (Top 5 Rated Only) */}
          <section className="col-span-4 space-y-4">
            <div className="flex flex-col gap-0.5 px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top Rated Tutors
              </h2>
              <span className="text-[10px] font-medium text-slate-400 italic">
                Showing up to 5 best matches near you
              </span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 scrollbar-none">
              <button
                onClick={() => setSelectedTeacher(null)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedTeacher === null
                    ? "bg-white border-indigo-600 ring-1 ring-indigo-600 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  ALL
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    All Batches
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Show everything locally available
                  </p>
                </div>
              </button>

              {topTeachers.map((teacher) => (
                <div
                  // FIXED: Changed key from teacher.id to unique seller_name
                  key={teacher.seller_name}
                  onClick={() => setSelectedTeacher(teacher.seller_name)}
                  className={`p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                    selectedTeacher === teacher.seller_name
                      ? "border-indigo-600 ring-1 ring-indigo-600 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={teacher.profiles.avatar_url || "https://via.placeholder.com/150"}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-800 truncate">
                          {teacher.seller_name}
                        </h3>
                        {teacher.profiles.is_verified_seller && (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{" "}
                        {teacher.profiles.location_name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded mt-2">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                        {teacher.profiles.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Desktop Right Panel: Course Cards Grid */}
          <section className="col-span-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Batches {selectedTeacher && `by ${selectedTeacher}`}
            </h2>

            {filteredBatches.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  No active courses found matching conditions.
                </p>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-1 grid grid-cols-2 gap-4 auto-rows-max">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => handleCourseNavigation(batch.id)}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="h-32 bg-slate-100 relative">
                      <img
                        src={batch.image_url || "https://via.placeholder.com/400x200"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 left-4 bg-white/95 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase">
                        {batch.subject}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {batch.title}
                          </h3>
                          <p className="text-base font-black text-slate-900 whitespace-nowrap">
                            Rs {batch.price.toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-400">
                              /mo
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          By {batch.seller_name}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <span className="flex items-center gap-1.5 truncate">
                            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                            {batch.target_class}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                            {batch.timing}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`tel:${batch.profiles.phone_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 fill-white/10" /> Call Educator
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* MOBILE LAYOUT (Phone/Tablet Screens) */}
        <div className="block lg:hidden">
          {/* Sub-View 1: Instructors Tab active */}
          {mobileActiveTab === "tutors" ? (
            <div className="space-y-2.5">
              {topTeachers.map((teacher) => (
                <div
                  // FIXED: Changed key from teacher.id to unique seller_name
                  key={teacher.seller_name}
                  onClick={() => {
                    setSelectedTeacher(teacher.seller_name);
                    setMobileActiveTab("batches");
                  }}
                  className="bg-white border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between shadow-sm active:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={teacher.profiles.avatar_url || "https://via.placeholder.com/150"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-sm text-slate-800 truncate">
                          {teacher.seller_name}
                        </h3>
                        {teacher.profiles.is_verified_seller && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {teacher.profiles.location_name?.length > 15
                          ? `${teacher.profiles.location_name.substring(0, 15)}...`
                          : teacher.profiles.location_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />{" "}
                      {teacher.profiles.rating || "N/A"}
                    </span>
                    <p className="text-[9px] text-indigo-600 font-bold mt-1">
                      View Classes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Sub-View 2: Classes Tab active */
            <div className="space-y-3.5">
              {selectedTeacher && (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl mx-0.5">
                  <p className="text-xs text-indigo-700 font-medium">
                    Filtering listings by <span className="font-bold">{selectedTeacher}</span>
                  </p>
                  <button
                    onClick={() => setSelectedTeacher(null)}
                    className="text-xs font-bold text-indigo-600 underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {filteredBatches.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-8 text-center mt-4">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    No courses found matching parameters.
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scrollbar-none">
                  {filteredBatches.map((batch) => (
                    <div
                      key={batch.id}
                      onClick={() => handleCourseNavigation(batch.id)}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm active:bg-slate-50/50 cursor-pointer w-[290px] shrink-0 snap-start"
                    >
                      <div>
                        <div className="flex gap-3 items-start">
                          <img
                            src={batch.image_url || "https://via.placeholder.com/150"}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover bg-slate-50 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-wide mb-1">
                              {batch.subject}
                            </span>
                            <h3 className="font-bold text-sm text-slate-800 line-clamp-1">
                              {batch.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              By {batch.seller_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between mt-4">
                          <p className="text-base font-extrabold text-slate-900">
                            Rs {batch.price.toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-400">/mo</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                          <span className="flex items-center gap-1 truncate">
                            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {batch.target_class}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {batch.timing}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`tel:${batch.profiles.phone_number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 fill-white/10" /> Call Educator
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomeTutorModel;