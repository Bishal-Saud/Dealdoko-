import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabase.js"; 
import { toast, Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, Users, BookOpen, FileText, MessageSquare 
} from "lucide-react";


import AdminProfiles from "./components/AdminProfiles.jsx";
import Courses from "./components/Courses.jsx"; 
import TuitionRequirements from "./components/TuitionRequirements.jsx"; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("profiles"); 
  const [profiles, setProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // States for Profile Editing
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // States for Course Editing
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      setLoading(true);
      
      // 1. Get current authenticated user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error("Unauthorized. Please sign in.");
        navigate("/login"); 
        return;
      }

      // 2. Cross-verify if user is actually an admin in the profiles DB table
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (fetchError || !profile?.is_admin) {
        toast.error("Access Denied: You are not an administrator.");
        navigate("/"); 
        return;
      }

      // 3. User is valid admin -> Load standard matrices
      await fetchAllData();

    } catch (err) {
      console.error("Security verification error:", err.message);
      toast.error("Authorization check failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch Profiles
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (profileErr) throw profileErr;
      setProfiles(profileData || []);

      // Fetch Tuition Requirements 
      const { data: reqData, error: reqErr } = await supabase
        .from("tuition_requirements")
        .select("*")
        .order("created_at", { ascending: false });
      if (reqErr) throw reqErr;
      setRequirements(reqData || []);

      // Fetch Products/Courses
      const { data: productData, error: productErr } = await supabase
        .from("products")
        .select(`
          id, created_at, seller_id, seller_name, title, price, category, 
          description, image_url, subject, target_class, timing, 
          successful_deals, active_assignments, deal_parents, 
          active_parents, completed_earnings
        `)
        .order("created_at", { ascending: false });
      if (productErr) throw productErr;
      setProducts(productData || []);

    } catch (err) {
      console.error("Error loading administration data matrices:", err.message);
      toast.error("Failed to load initial console tables");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: selectedProfile.full_name,
          verification_status: selectedProfile.verification_status,
          is_verified_buyer: selectedProfile.is_verified_buyer,
          is_verified_seller: selectedProfile.is_verified_seller,
          total_earnings: parseFloat(selectedProfile.total_earnings || 0),
          experience_years: parseInt(selectedProfile.experience_years || 0, 10),
          location_name: selectedProfile.location_name,
        })
        .eq("id", selectedProfile.id);

      if (error) throw error;

      toast.success("Profile record updated cleanly!");
      setIsEditModalOpen(false);
      
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles(data || []);
    } catch (err) {
      console.error("Error modifying row data:", err.message);
      toast.error("Database update request failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      setUpdatingCourse(true);
      const { error } = await supabase
        .from("products")
        .update({
          title: selectedCourse.title,
          category: selectedCourse.category,
          price: parseFloat(selectedCourse.price || 0),
          subject: selectedCourse.subject,
          target_class: selectedCourse.target_class,
          timing: selectedCourse.timing,
        })
        .eq("id", selectedCourse.id);

      if (error) throw error;

      toast.success("Course details updated successfully!");
      setIsEditCourseModalOpen(false);
      
      const { data } = await supabase
        .from("products")
        .select(`
          id, created_at, seller_id, seller_name, title, price, category, 
          description, image_url, subject, target_class, timing, 
          successful_deals, active_assignments, deal_parents, 
          active_parents, completed_earnings
        `)
        .order("created_at", { ascending: false });
      setProducts(data || []);
    } catch (err) {
      console.error("Error modifying course row data:", err.message);
      toast.error("Database update request failed");
    } finally {
      setUpdatingCourse(false);
    }
  };

  const handleCourseDeletion = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course item?")) return;
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== courseId));
      toast.success("Course entry permanently scrubbed from schema tables!");
    } catch (err) {
      console.error("Error executing row delete command:", err.message);
      toast.error("Database deletion request failed");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 text-slate-800">
      <Toaster />

      {/* Main Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Link to='/' className="hover:text-blue-600 transition">Admin Console</Link>
            <ShieldCheck className="text-blue-600" size={24} />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage tuition profiles, course listings, requirements, and assignments database records directly.
          </p>
        </div>
        
        <div className="flex items-center gap-3 font-medium text-xs">
          <div className="bg-slate-100 border px-3 py-1.5 rounded-lg text-slate-600">
            Profiles: <span className="font-bold text-slate-900">{profiles.length}</span>
          </div>
          <div className="bg-slate-100 border px-3 py-1.5 rounded-lg text-slate-600">
            Requirements: <span className="font-bold text-slate-900">{requirements.length}</span>
          </div>
          <div className="bg-slate-100 border px-3 py-1.5 rounded-lg text-slate-600">
            Products/Tuition: <span className="font-bold text-slate-900">{products.length}</span>
          </div>
        </div>
      </div>

      {/* MULTI-TAB NAVIGATION */}
      <div className="border-b border-slate-200 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveTab("profiles"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide border-b-2 transition ${
            activeTab === "profiles"
              ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
          }`}
        >
          <Users size={15} />
          Profiles User Registry
        </button>

        <button
          onClick={() => { setActiveTab("products"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide border-b-2 transition ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
          }`}
        >
          <BookOpen size={15} />
          Products & Courses
        </button>

        <button
          onClick={() => { setActiveTab("requirements"); setSearchQuery(""); }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide border-b-2 transition ${
            activeTab === "requirements" // 👈 Fixed conditional evaluation rule error
              ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
          }`}
        >
          <FileText size={15} />
          Tuition Requirements 
        </button>

        <button
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wide border-b-2 border-transparent text-slate-400 cursor-not-allowed"
          disabled
          title="Placeholder for reviews table extension"
        >
          <MessageSquare size={15} />
          Reviews Feed (Soon)
        </button>
      </div>

      {/* SEARCH UTILITY */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder={
            activeTab === "profiles" 
              ? "Filter profiles list by username, email string, or full name..." 
              : activeTab === "requirements"
              ? "Filter student queries by subject theme, grade level or district map area..."
              : "Filter course catalog by lesson title, seller name, subject or target class grade..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-slate-400 font-medium"
        />
      </div>

      {/* RUNTIME FEEDBACK & VIEW CONDITIONAL RENDERING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-semibold">Pulling Supabase schema tables...</span>
        </div>
      ) : (
        <>
          {/* VIEW 1: MODULAR PROFILES LAYER */}
          {activeTab === "profiles" && (
            <AdminProfiles 
              profiles={profiles}
              searchQuery={searchQuery}
              onEditClick={(user) => {
                setSelectedProfile({ ...user });
                setIsEditModalOpen(true);
              }}
            />
          )}

          {/* VIEW 2: MODULAR PRODUCTS LAYER */}
          {activeTab === "products" && (
            <Courses 
              products={products} 
              searchQuery={searchQuery} 
              onEditClick={(course) => {
                setSelectedCourse({ ...course });
                setIsEditCourseModalOpen(true);
              }}
              onDeleteClick={handleCourseDeletion}
            />
          )}

          {/* VIEW 3: TUITION REQUIREMENTS LAYER */}
          {activeTab === "requirements" && (
            <TuitionRequirements 
              requirements={requirements}
              setRequirements={setRequirements}
              searchQuery={searchQuery}
            />
          )}
        </>
      )}

      {/* EDIT MODAL WINDOW (PROFILES) */}
      {isEditModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Modify DB Profile Row</h3>
                <p className="text-xs text-slate-400 font-mono select-all">UUID: {selectedProfile.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 p-1.5 px-2.5 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={selectedProfile.full_name || ""}
                  onChange={(e) => setSelectedProfile({ ...selectedProfile, full_name: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Verification Status</label>
                  <select
                    value={selectedProfile.verification_status || "pending"}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, verification_status: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 border p-3 rounded-xl flex justify-around">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedProfile.is_verified_buyer}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, is_verified_buyer: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  Verified Buyer
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedProfile.is_verified_seller}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, is_verified_seller: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  Verified Seller
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Earnings ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedProfile.total_earnings || 0}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, total_earnings: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Experience (Years)</label>
                  <input
                    type="number"
                    value={selectedProfile.experience_years || 0}
                    onChange={(e) => setSelectedProfile({ ...selectedProfile, experience_years: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location Name</label>
                <input
                  type="text"
                  value={selectedProfile.location_name || ""}
                  onChange={(e) => setSelectedProfile({ ...selectedProfile, location_name: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs tracking-wide transition">Cancel</button>
                <button type="submit" disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition">
                  {updating ? "Saving Changes..." : "Commit Override Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL WINDOW (COURSES/PRODUCTS) */}
      {isEditCourseModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Modify Course Record</h3>
                <p className="text-xs text-slate-400 font-mono select-all">ID: {selectedCourse.id}</p>
              </div>
              <button onClick={() => setIsEditCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 p-1.5 px-2.5 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Course Title</label>
                <input
                  type="text"
                  value={selectedCourse.title || ""}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                  <input
                    type="text"
                    value={selectedCourse.category || ""}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, category: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price (Rs.)</label>
                  <input
                    type="number"
                    value={selectedCourse.price || 0}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, price: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    value={selectedCourse.subject || ""}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, subject: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Class</label>
                  <input
                    type="text"
                    value={selectedCourse.target_class || ""}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, target_class: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Timing Info</label>
                <input
                  type="text"
                  value={selectedCourse.timing || ""}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, timing: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsEditCourseModalOpen(false)} className="flex-1 border bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs tracking-wide transition">Cancel</button>
                <button type="submit" disabled={updatingCourse} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition">
                  {updatingCourse ? "Saving Changes..." : "Commit Course Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}