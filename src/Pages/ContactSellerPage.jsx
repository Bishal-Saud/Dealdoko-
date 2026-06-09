import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, GraduationCap, CheckCircle2, PhoneCall, Calendar, ShieldCheck, Clock, MessageSquare, Star, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "../api/supabase.js";
import LiveChatModal from "../model/LiveChatModel.jsx";
import toast, { Toaster } from "react-hot-toast";

function ContactSellerPage() {
  const { courseId } = useParams(); // Safely extract UUID from /book-tutor/:courseId
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [chatActive, setChatActive] = useState(false);
  const [initializingChat, setInitializingChat] = useState(false);

  // Rating & Review Form State — Set to 1 by default
  const [selectedRating, setSelectedRating] = useState(1);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // Feed Data State
  const [publicReviews, setPublicReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";

  // 1. Core Data Fetching Pipeline
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch product listing and join its tutor/seller profile row dynamically
        const { data, error } = await supabase
          .from("products")
          .select("*, tutor_profile:profiles(*)")
          .eq("id", courseId)
          .single();

        if (error) throw error;
        setProduct(data);

        // Fetch dependent rows only once we have a valid product configuration
        if (data) {
          fetchSessionAndReviewStatus(data.id);
          fetchPublicReviews(data.seller_id || data.user_id);
        }
      } catch (err) {
        console.error("Error fetching course details:", err.message);
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchProductDetails();
    }
  }, [courseId]);

  const fetchSessionAndReviewStatus = async (productId) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      
      setUser(authUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_verified_buyer")
        .eq("id", authUser.id)
        .single();
      
      setUserProfile(profileData);

      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id, rating_score, comment_text")
        .eq("product_id", productId)
        .eq("buyer_id", authUser.id);

      if (existingReview && existingReview.length > 0) {
        setHasAlreadyReviewed(true);
        setSelectedRating(existingReview[0].rating_score);
        setReviewComment(existingReview[0].comment_text || "");
      }
    } catch (err) {
      console.error("Initialization error:", err.message);
    }
  };

  const fetchPublicReviews = async (sellerId) => {
    if (!sellerId) return;
    try {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating_score,
          comment_text,
          created_at,
          profiles:buyer_id ( full_name, is_verified_buyer )
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPublicReviews(data || []);
    } catch (err) {
      console.error("Error pulling public feedback feed:", err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleStartChat = async () => {
    if (initializingChat || !product) return;
    const sellerId = product.seller_id || product.user_id;

    try {
      setInitializingChat(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("Please log in to contact the educator.");
        return;
      }
      setUser(currentUser);

      if (currentUser.id === sellerId) {
        toast.error("This is your own course listing.");
        return;
      }

      const { data: existingRooms, error: fetchError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("product_id", product.id)
        .eq("buyer_id", currentUser.id)
        .eq("seller_id", sellerId);

      if (fetchError) throw fetchError;

      if (existingRooms && existingRooms.length > 0) {
        setChatActive(true);
      } else {
        const { error: createError } = await supabase
          .from("chat_rooms")
          .insert([{ product_id: product.id, buyer_id: currentUser.id, seller_id: sellerId }]);

        if (createError) throw createError;
        toast.success("Tuition conversation stream initialized!");
        setChatActive(true);
      }
    } catch (err) {
      console.error("Chat Router Error: ", err.message);
      toast.error("Could not safely link chat fields.");
    } finally {
      setInitializingChat(false);
    }
  };

  const submitEducatorReview = async (e) => {
    e.preventDefault();
    if (!user || !userProfile || !product) {
      toast.error("Authentication credentials required.");
      return;
    }

    const sellerId = product.seller_id || product.user_id;

    if (!userProfile.is_verified_buyer) {
      toast.error("Access Denied: Only Verified Buyers are authorized to rate educators.");
      return;
    }

    if (user.id === sellerId) {
      toast.error("Operation canceled: Educators cannot rate their own profiles.");
      return;
    }

    try {
      setSubmittingReview(true);
      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            product_id: product.id,
            buyer_id: user.id,
            seller_id: sellerId,
            rating_score: selectedRating,
            comment_text: reviewComment.trim()
          }
        ]);

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already submitted a rating entry for this class listing.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Rating submitted successfully!");
      setHasAlreadyReviewed(true);
      fetchPublicReviews(sellerId); 
    } catch (err) {
      console.error("Review Pipeline Error:", err.message);
      toast.error("Failed to save rating entry.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const initiateDirectCall = () => {
    const phoneNumber = product?.seller_phone || product?.tutor_profile?.phone_number;
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
    } else {
      toast.success("No active telephone link. Initializing secure message routing...");
      handleStartChat();
    }
  };

  // 2. Loading State guard matching your style
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 3. Fallback Route checking
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <p className="text-gray-600 font-bold mb-4">Course details could not be found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  // Safely extract names from unified schema properties
  const sellerName = product.seller_name || product.tutor_profile?.full_name || "Verified Tutor";
  const sellerLocation = product.location || product.tutor_profile?.location_name || "Nepal";

  return (
    <div className="max-w-5xl mx-auto px-2 py-4 animate-in fade-in duration-200">
      <Toaster />
      
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 hover:text-blue-600 transition mb-6 group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Tuition Directory
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 bg-white border border-gray-100 rounded-3xl p-4 md:p-6 shadow-xs">
        
        {/* Left Column Aspect Presentation */}
        <div className="w-full space-y-6">
          <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-50">
            <img
              src={product.image_url || fallbackImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* VERIFIED PUBLIC REVIEWS FEED BLOCK */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2 mb-4">
              <MessageCircle size={18} className="text-blue-600" />
              Verified Community Feedback ({publicReviews.length})
            </h3>

            {loadingReviews ? (
              <p className="text-xs font-semibold text-gray-400 animate-pulse py-2">Syncing verified comment rows...</p>
            ) : publicReviews.length === 0 ? (
              <p className="text-xs font-medium text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed">
                No performance evaluations documented yet for this educator profile.
              </p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {publicReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-gray-50/60 border border-gray-100 rounded-2xl space-y-1.5 transition hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800">
                          {rev.profiles?.full_name || "Verified Student"}
                        </span>
                        {rev.profiles?.is_verified_buyer && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide flex items-center gap-0.5">
                            <CheckCircle2 size={9} className="fill-emerald-800/10" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={11} 
                          className={star <= rev.rating_score ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                        />
                      ))}
                    </div>

                    {rev.comment_text && (
                      <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {rev.comment_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Aspect Presentation */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                {product.subject || product.category || "General Academic"}
              </span>
              
              {product.target_class && (
                <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <GraduationCap size={13} className="text-slate-500" />
                  {product.target_class}
                </span>
              )}

              {product.timing && (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock size={13} className="text-emerald-600" />
                  {product.timing}
                </span>
              )}
              
              <div className="flex items-center gap-1 bg-gray-50 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-100">
                <MapPin size={13} className="text-gray-400 shrink-0" />
                <span>{sellerLocation}</span>
              </div>
            </div>

            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="text-2xl md:text-4xl font-black text-blue-600 tracking-tight flex items-baseline gap-1">
              रू {parseFloat(product.price || 0).toLocaleString()}
              <span className="text-xs md:text-sm text-gray-400 font-bold">/ month</span>
            </div>

            <hr className="border-gray-100" />

            {/* Educator Identity Summary Row */}
            <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 font-black rounded-xl flex items-center justify-center text-sm shadow-xs border border-amber-200/20">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400">Verified Independent Educator</div>
                  <div className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                    {sellerName}
                    <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-500/10 shrink-0" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-gray-400 hidden sm:block">
                <div className="flex items-center gap-1 justify-end">
                  <Calendar size={11} /> Registered Listing
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs uppercase font-black text-gray-400 tracking-wider">Class Highlights & Details</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                {product.description || "The educator has not attached additional course outline syllabus remarks."}
              </p>
            </div>
          </div>

          {/* Practical Actions Module */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <button
              onClick={initiateDirectCall}
              disabled={initializingChat}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white font-black text-sm rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-blue-400"
            >
              <PhoneCall size={16} /> Contact Educator & Call Now
            </button>

            <button
              type="button"
              onClick={handleStartChat}
              disabled={initializingChat}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-99 text-slate-700 font-bold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <MessageSquare size={14} /> 
              {initializingChat ? "Connecting Channels..." : "Discuss via Live Chat"}
            </button>

            {/* LIVE DYNAMIC REVIEW FORM INTERACTION BLOCK */}
            <div className="mt-4 pt-4 border-t border-gray-100/80">
              <h3 className="text-xs uppercase font-black text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Star size={13} className="text-amber-500 fill-amber-500" /> Educator Evaluation Protocol
              </h3>

              {userProfile?.is_verified_buyer ? (
                user?.id === (product.seller_id || product.user_id) ? (
                  <p className="text-xs font-semibold text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                    You cannot submit rating parameters on your own listing profile.
                  </p>
                ) : hasAlreadyReviewed ? (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-center">
                    <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-600/10" /> Review Documented
                    </p>
                    <div className="flex justify-center gap-0.5 my-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= selectedRating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                        />
                      ))}
                    </div>
                    {reviewComment && <p className="text-[11px] text-slate-600 italic">"{reviewComment}"</p>}
                  </div>
                ) : (
                  <form onSubmit={submitEducatorReview} className="space-y-2.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Assign Score Value:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition duration-150 transform active:scale-90 cursor-pointer"
                          >
                            <Star
                              size={20}
                              className={
                                star <= (hoveredRating || selectedRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Attach constructive remarks regarding tuition progress layout..."
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium placeholder-slate-400"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {submittingReview ? "Processing Metric Entry..." : "Commit Verified Review Entry"}
                    </button>
                  </form>
                )
              ) : (
                <div className="flex gap-2 items-start p-3 bg-slate-100/70 rounded-xl border border-slate-200/40">
                  <ShieldCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 font-medium leading-normal">
                    Review submission channel restricted. Only accounts possessing verified student/buyer credentials are key to altering rating structures.
                  </p>
                </div>
              )}

              <div className="flex gap-2 items-start p-3 bg-amber-50/40 rounded-xl border border-amber-100/40 mt-3">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-semibold leading-normal">
                  Safety Note: Arrange initial consultations or class trials in safe academic setups, public centers, or accompanied home environments.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {chatActive && product && user && (
        <LiveChatModal 
          productId={product.id}
          sellerId={product.seller_id || product.user_id}
          buyerId={user.id} 
          onClose={() => setChatActive(false)}
        />
      )}
    </div>
  );
}

export default ContactSellerPage;