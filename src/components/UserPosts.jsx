import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase.js';
import { 
  BookOpen, Wallet, Calendar, MapPin, 
  GraduationCap, FileText, ArrowRight, X, ShieldAlert,
  Hash, Map
} from 'lucide-react';
import LiveChatModal from '../model/LiveChatModel.jsx'; 

function UserPosts({ user, posts, setPosts }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [activeChatConfig, setActiveChatConfig] = useState(null);
  const [teacherLocation, setTeacherLocation] = useState(null);

  useEffect(() => {
    const fetchAreaSpecificPosts = async () => {
      try {
        setLoading(true);
        
        let targetLocationName = null;

        // 1. Fetch user profile context if logged in
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified_seller, location_name')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            targetLocationName = profile.location_name;
            setTeacherLocation(profile.location_name || null);
          }
        }

        // 2. Initialize Base Query
        let query = supabase
          .from('tuition_requirements')
          .select('*');

        // 3. SIMILARITY FILTER LOGIC:
        // If a location is present, match the root base name (e.g., "Bhimdatta") 
        // to catch trailing ward changes like "Bhimdatta - 13" or "Bhimdatta - 14"
        if (targetLocationName) {
          // Clean the string: take characters before any space, dash, or number
          // This turns "Bhimdatta - 13" into "Bhimdatta"
          const baseLocation = targetLocationName
            .split(/[\s\-\d]/)[0]
            .trim();

          if (baseLocation && baseLocation.length >= 3) {
            // Case-insensitive wildcard match: finds anything starting or containing the base name
            query = query.ilike('location_name', `%${baseLocation}%`);
          } else {
            // Fallback to exact match if the string string parsing yielded a short keyword
            query = query.eq('location_name', targetLocationName);
          }
        }

        // 4. Fire clean database query execution
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching filtered regional requirements board:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaSpecificPosts();
  }, [user, setPosts]);

  const handleApplyClick = async (post) => {
    if (!user) {
      alert("Please register or log in to apply for tuition positions.");
      return;
    }

    try {
      setCheckingVerification(true);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_verified_seller, is_verified_buyer')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile?.is_verified_seller === true) {
        setActiveChatConfig({
          productId: post.id,
          sellerId: post.user_id, 
          buyerId: user.id        
        });
      } else {
        setShowRoleModal(true);
      }

    } catch (err) {
      console.error("Error mapping user verification logs:", err);
      if (user.is_teacher || user.role === 'teacher') {
        setActiveChatConfig({
          productId: post.id,
          sellerId: post.user_id,
          buyerId: user.id
        });
      } else {
        setShowRoleModal(true);
      }
    } finally {
      setCheckingVerification(false);
    }
  };

  const parseSubjectString = (rawSubject) => {
    if (!rawSubject) return { title: "General Tuition", subtitle: null };
    const match = rawSubject.match(/^(.*?)\s*((?:class|code)?\s*\d+)$/i);
    if (match) {
      return {
        title: match[1].trim(),
        subtitle: match[2].trim()
      };
    }
    return { title: rawSubject, subtitle: null };
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">Loading active local tuition board...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Active <span className="text-blue-600">Tuition Requirements</span> Nearby
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            Verified matching requests from local families. Connect with parents and students who need dedicated home tuition teachers right now.
          </p>
        </div>
        
        {/* Dynamic Area Badge Indicator */}
        {teacherLocation && (
          <div className="self-start md:self-auto flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Map size={14} className="animate-pulse" />
            <span>Showing options near: {teacherLocation}</span>
          </div>
        )}
      </div>

      {/* Grid List View Container */}
      {posts.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500 font-medium">
          {teacherLocation 
            ? `No matching tuition requirements found near "${teacherLocation}" right now.`
            : "No tuition requirements have been posted in this region yet."
          }
        </div>
      ) : (
        <div className="max-h-[640px] overflow-y-auto pr-2 space-y-4 custom-scrollbar scroll-smooth">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => {
              const subjectInfo = parseSubjectString(post.subject);

              return (
                <div 
                  key={post.id} 
                  className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative group"
                >
                  {/* Card Body */}
                  <div className="space-y-4">
                    
                    {/* Header Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">
                          Class: {post.class_level || "General"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        ID: #{post.id?.slice(0, 8)}
                      </div>
                    </div>

                    {/* Subject Display Block */}
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 space-y-1">
                      <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                        Target Subject
                      </div>
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <h3 className="text-base font-black text-slate-900 capitalize leading-tight">
                            {subjectInfo.title}
                          </h3>
                          {subjectInfo.subtitle && (
                            <p className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-0.5 capitalize">
                              <Hash size={12} /> {subjectInfo.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/40">
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Monthly Budget</p>
                          <p className="text-xs font-black text-emerald-700">Rs. {post.budget_per_month.toLocaleString()}/mo</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/40">
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Frequency</p>
                          <p className="text-xs font-black text-indigo-700">{post.frequency_per_week} Classes/wk</p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Layers */}
                    <div className="space-y-2.5 pt-1 text-xs font-semibold text-slate-600">
                      {post.required_qualification && (
                        <div className="flex items-center gap-2 bg-slate-50/40 px-3 py-2 rounded-xl border border-slate-100/60">
                          <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                          <p className="truncate">
                            <span className="font-black text-slate-400 text-[10px] uppercase mr-1">Eligibility:</span> 
                            <span className="text-slate-700 font-bold">{post.required_qualification}</span>
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 bg-slate-50/40 px-3 py-2 rounded-xl border border-slate-100/60">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="truncate">
                          <span className="font-black text-slate-400 text-[10px] uppercase mr-1">Location:</span> 
                          <span className="text-slate-700 font-bold">
                            {post.location_name ? `${post.location_name} ` : ''} 
                            {post.landmark_description ? `(${post.landmark_description})` : 'Nepal'}
                          </span>
                        </p>
                      </div>

                      {post.description && (
                        <div className="flex items-start gap-2 bg-amber-50/30 p-3 rounded-xl border border-amber-100/30">
                          <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-black text-amber-700/70 text-[9px] uppercase tracking-wider block mb-0.5">Parent Remarks</span>
                            <p className="text-slate-600 font-medium text-[11px] leading-relaxed line-clamp-2 italic">
                              "{post.description}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      disabled={checkingVerification}
                      onClick={() => handleApplyClick(post)}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 group-hover:bg-blue-600 shadow-xs disabled:bg-slate-300 cursor-pointer"
                    >
                      {checkingVerification ? (
                        <>Validating Credentials...</>
                      ) : (
                        <>Apply for Tuition <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Upgrade Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden relative p-6 text-center animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1.5">Verification Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              To apply for open tuition vacancies and access instant direct messaging streams with families, your profile verification process must be completed first.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  navigate('/role');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors tracking-wide cursor-pointer"
              >
                Go to Verification Dashboard
              </button>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {activeChatConfig && (
        <LiveChatModal
          productId={activeChatConfig.productId}
          sellerId={activeChatConfig.sellerId}
          buyerId={activeChatConfig.buyerId}
          authenticatedUserId={user.id}
          viewAsMode="buyer" 
          onClose={() => setActiveChatConfig(null)} 
        />
      )}
    </section>
  );
}

export default UserPosts;