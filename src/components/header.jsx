import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Home,
  PlusCircle,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
  ChevronRightIcon,
  UserCheckIcon,
  Store,
  MessageSquare,
  Users2,
} from "lucide-react";
import { supabase } from "../api/supabase.js";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import LiveChatModel from "../model/LiveChatModel.jsx";
import { Helmet } from "react-helmet-async";

function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // LIVE DATABASE PROFILE STATES
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [userLocation, setUserLocation] = useState("Invalid Location");
  const [dbFullName, setDbFullName] = useState("");
  const [dbAvatarUrl, setDbAvatarUrl] = useState("");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch custom profile records dynamically from public.profiles table
  const fetchUserProfileData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_verified_seller, location, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setIsVerifiedSeller(!!data.is_verified_seller);
        setUserLocation(data.location ? data.location : "Invalid Location");
        setDbFullName(data.full_name || "");
        setDbAvatarUrl(data.avatar_url || "");
      }
    } catch (err) {
      console.error("Error fetching live profile metadata:", err.message);
      setIsVerifiedSeller(false);
      setUserLocation("Invalid Location");
    }
  };

  // Listen to Auth status changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) fetchUserProfileData(user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchUserProfileData(user.id);
      } else {
        setIsVerifiedSeller(false);
        setUserLocation("Invalid Location");
        setDbFullName("");
        setDbAvatarUrl("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // REALTIME SUBSCRIPTION for messages
  useEffect(() => {
    if (!currentUser) {
      setHasNewMessage(false);
      return;
    }

    const chatSubscription = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        () => {
          if (!isChatOpen) {
            setHasNewMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, [currentUser, isChatOpen]);

  // Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin, 
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Failed to initialize Google login.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false);
    setIsChatOpen(false);
    toast.success("Logged out successfully.");
  };

  const handleMobileMenuClick = () => {
    if (currentUser) {
      setIsSidebarOpen(true);
    } else {
      setIsAuthOpen(true);
      toast.error("Please log in to view your account menu.");
    }
  };

  const handleOpenChat = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      toast.error("Please log in to check your direct messages.");
      return;
    }
    setIsChatOpen(true);
    setHasNewMessage(false);
  };

  // 🔍 MANAGED SEARCH ROUTER
 const executeSearchRouting = () => {
  const rawInput = searchQuery.trim();
  if (!rawInput) return;

  // Only allow location search
  const locationPrefixRegex = /^(loc|location):\s*(.*)/i;
  const match = rawInput.match(locationPrefixRegex);

  if (match) {
    const extractedLocation = match[2].trim();

    if (extractedLocation) {
      navigate(`/users?location=${encodeURIComponent(extractedLocation)}`);
    }
  } else {
    // If user does NOT use loc: format, still treat input as location only
    navigate(`/users?location=${encodeURIComponent(rawInput)}`);
  }
};

  // Quick helper to search explicitly by user's current profile location pinned label
  const handleLocationBadgeClick = () => {
    if (userLocation && userLocation !== "Invalid Location") {
     navigate(`/users?location=${encodeURIComponent(rawInput)}`);
    }
  };

  const userFullName =
    dbFullName ||
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    "Active User";
    
  const userAvatar =
    dbAvatarUrl ||
    currentUser?.user_metadata?.avatar_url || 
    "https://api.dicebear.com/7.x/bottts/svg?seed=fallback";

  return (
    <div>
      <Toaster />
<Helmet>
        <title>{`Home Tuition Near ${userLocation} | Find Verified Tutors | Tol Path`}</title>
        <meta 
          name="description" 
          content={`Looking for home tuition near ${userLocation}? Find highly rated, verified home tutors on Tol Path. Book your private tutor for Math, Science, and more today.`} 
        />
        <meta name="keywords" content={`home tuition near ${userLocation}, private tutors ${userLocation}, home teachers, verified tutors, Tol Path, education Nepal`} />
      </Helmet>
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 md:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight">
                Tol Path
              </Link>
              <div 
                onClick={handleLocationBadgeClick}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 mt-0.5 cursor-pointer hover:text-blue-600 transition"
              >
                <MapPin size={14} className={userLocation === "Invalid Location" ? "text-gray-400" : "text-blue-500"} />
                <span className={userLocation === "Invalid Location" ? "text-gray-400 italic" : "text-gray-700 font-bold"}>
                  {userLocation}
                </span>
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleMobileMenuClick}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition active:scale-95 relative"
              >
                <Menu size={22} />
                {hasNewMessage && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>

          {/* Managed Search Bar Input Block */}
          <div className="relative flex-1 max-w-2xl mx-auto w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
             placeholder="Search by location only (e.g. Kathmandu, Pokhara)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  executeSearchRouting();
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-gray-600">
            <Link to="/" className="text-blue-600 font-semibold flex items-center gap-1">
              <Home size={18} /> Home
            </Link>

            <button
              onClick={handleOpenChat}
              className="text-gray-600 hover:text-blue-600 font-semibold flex items-center gap-1 transition cursor-pointer relative"
            >
              <div className="relative">
                <MessageSquare size={18} className="text-gray-500 hover:text-blue-500" />
                {hasNewMessage && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
              <span>Messages</span>
            </button>

            {isVerifiedSeller && (
              <Link
                to="/seller-dashboard"
                className="text-gray-600 hover:text-amber-600 font-semibold flex items-center gap-1 transition"
              >
                <Store size={18} className="text-amber-500" /> Dashboard
              </Link>
            )}

            {currentUser ? (
              <div
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100 transition shadow-xs relative"
              >
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-blue-100 object-cover"
                />
                <span className="font-bold text-gray-800 tracking-tight hover:text-blue-600">
                  {userFullName}
                </span>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="hover:text-blue-600 flex items-center gap-1">
                <User size={18} /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2.5 flex justify-between items-center z-40 shadow-md">
        <Link to="/" className="flex flex-col items-center gap-1 text-blue-600 text-[10px] font-semibold">
          <Home size={20} />
          <span>Home</span>
        </Link>

        <button onClick={handleOpenChat} className="flex flex-col items-center gap-1 text-gray-400 text-[10px] relative">
          <MessageSquare size={20} />
          {hasNewMessage && <span className="absolute top-0 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
          <span>Messages</span>
        </button>

        <Link to={isVerifiedSeller ? "/seller-dashboard" : "/role"} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 text-[10px] transition">
          <PlusCircle size={20} />
          <span>Sell</span>
        </Link>

                <Link to="/aboutus" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 text-[10px] transition">
          <Users2 size={20} />
          <span>About Us</span>
        </Link>

        {currentUser ? (
          <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 text-[10px]">
            <img src={userAvatar} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-gray-200" />
            <span className="font-semibold truncate max-w-[60px]">{userFullName.split(" ")[0]}</span>
          </button>
        ) : (
          <button onClick={() => setIsAuthOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 text-[10px]">
            <User size={20} />
            <span>Profile</span>
          </button>
        )}
      </nav>

      {/* RIGHT SIDEBAR DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-full max-w-xs md:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <span className="font-black text-gray-800 text-lg">Account Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b flex flex-col items-center text-center bg-gradient-to-b from-gray-50 to-white">
              <img src={userAvatar} alt="Profile Card" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mb-3" />
              <h3 className="text-lg font-black text-gray-900">{userFullName}</h3>
              <p className="text-xs text-gray-400 font-medium truncate max-w-full">{currentUser?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                   <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl font-semibold transition group">
                <div className="flex items-center gap-3">
                  <UserCheckIcon size={18} className="text-gray-400" />
                  <span>Profile</span>
                </div>
                <ChevronRightIcon size={16} />
              </Link>

              <Link to={isVerifiedSeller ? "/seller-dashboard" : "/role"} onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl font-semibold transition group">
                <div className="flex items-center gap-3">
                  <Store size={18} className={isVerifiedSeller ? "text-amber-500" : "text-gray-400"} />
                  <span>{isVerifiedSeller ? "Teacher Dashboard" : "Become a Teacher"}</span>
                </div>
                <ChevronRight size={16} />
              </Link>

                 <Link to="/verify" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-amber-50/50 hover:text-amber-600 rounded-xl font-semibold transition group">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-gray-400" />
                  <span>Verify User</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">KYC</span>
              </Link>

              <button onClick={() => { setIsSidebarOpen(false); handleOpenChat(); }} className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl font-semibold transition group text-left">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-gray-400" />
                  <span>Direct Messages</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-blue-50/50 rounded-xl font-semibold transition group">
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-gray-400" />
                  <span>Settings</span>
                </div>
                <ChevronRight size={16} />
              </Link>

         
           
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button onClick={handleLogout} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 transition border border-red-200/40">
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Tol Path</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in or create your account instantly using your Google profile.</p>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-xs hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.79 1.21 5.49l4.11-3.25z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.66l4.11 3.25c.94-2.85 3.57-4.96 6.68-4.96z"
                />
              </svg>
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC LiveChatModel INJECTION */}
      {isChatOpen && currentUser && (
        <LiveChatModel
          isOpen={isChatOpen}
          authenticatedUserId={currentUser.id}
          viewAsMode="auto"
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}

export default Header;