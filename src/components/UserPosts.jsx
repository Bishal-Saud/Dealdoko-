import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase.js';
import toast from 'react-hot-toast'; 
import { 
  BookOpen, Wallet, Calendar, MapPin, 
  GraduationCap, FileText, ArrowRight, X, ShieldAlert,
  Hash, Map, Lock
} from 'lucide-react';
import LiveChatModal from '../model/LiveChatModel.jsx'; 

function UserPosts({ user, posts, setPosts }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [activeChatConfig, setActiveChatConfig] = useState(null);
  const [teacherLocation, setTeacherLocation] = useState(null);

  const isAuthenticated = !!user;

  // Integrated Google OAuth Method
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, 
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error.message);
      toast.error('Authentication failed. Please try again.');
    }
  };

  useEffect(() => {
    const fetchAreaSpecificPosts = async () => {
      try {
        setLoading(true);
        
        let targetLocationName = null;

        if (isAuthenticated && user?.id) {
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

        let query = supabase
          .from('tuition_requirements')
          .select('*');

        if (isAuthenticated && targetLocationName) {
          const baseLocation = targetLocationName
            .split(/[\s\-\d]/)[0]
            .trim();

          if (baseLocation && baseLocation.length >= 3) {
            query = query.ilike('location_name', `%${baseLocation}%`);
          } else {
            query = query.eq('location_name', targetLocationName);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching regional requirements board:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaSpecificPosts();
  }, [user, setPosts, isAuthenticated]);

  const handleApplyClick = async (post) => {
    if (!isAuthenticated) {
      await handleGoogleLogin();
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
        <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
          {isAuthenticated ? "Loading active local tuition board..." : "Scanning available opportunities..."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isAuthenticated ? (
              <>Active Tuition Requirements Nearby</>
            ) : (
              <>Available Home Tuition Earning Opportunities</>
            )}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAuthenticated ? (
              "Verified matching requests from local families in your area."
            ) : (
              "Browse home tutoring vacancies posted by parents. Sign in instantly to claim assignments and unlock complete locations."
            )}
          </p>
        </div>
        
        {!isAuthenticated && (
          <button
            onClick={handleGoogleLogin}
            className="self-start md:self-auto flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>One-Click Sign In</span>
          </button>
        )}

        {isAuthenticated && teacherLocation && (
          <div className="self-start md:self-auto flex items-center gap-1.5 bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Map size={14} />
            <span>Near: {teacherLocation}</span>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 font-medium">
          {isAuthenticated && teacherLocation 
            ? `No matching tuition requirements found near "${teacherLocation}" right now.`
            : "No active opportunities found at this time."
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
                  className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 hover:border-slate-300 transition-all duration-150 flex flex-col justify-between relative group"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/60 uppercase tracking-wider">
                          Class: {post.class_level || "General"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        #{post.id?.slice(0, 8)}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                        Target Subject
                      </div>
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 capitalize leading-tight">
                            {subjectInfo.title}
                          </h3>
                          {subjectInfo.subtitle && (
                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5 capitalize">
                              <Hash size={12} /> {subjectInfo.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="p-1.5 bg-white rounded-lg text-slate-600 border border-slate-100">
                          <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Budget</p>
                          <p className="text-xs font-bold text-slate-800">Rs. {post.budget_per_month.toLocaleString()}/mo</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="p-1.5 bg-white rounded-lg text-slate-600 border border-slate-100">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Frequency</p>
                          <p className="text-xs font-bold text-slate-800">{post.frequency_per_week} Classes/wk</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 text-xs text-slate-600">
                      {post.required_qualification && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <p className="truncate">
                            <span className="font-bold text-slate-400 text-[10px] uppercase mr-1">Eligibility:</span> 
                            <span className="text-slate-700 font-medium">{post.required_qualification}</span>
                          </p>
                        </div>
                      )}

                      {/* RESTORED original blur logic without showing any explicit location text */}
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 relative overflow-hidden">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isAuthenticated ? (
                          <p className="truncate">
                            <span className="font-bold text-slate-400 text-[10px] uppercase mr-1">Location:</span> 
                            <span className="text-slate-700 font-medium">
                              {post.location_name ? `${post.location_name} ` : ''} 
                              {post.landmark_description ? `(${post.landmark_description})` : 'Nepal'}
                            </span>
                          </p>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <p className="text-slate-400 text-[11px] font-bold select-none blur-[4px]">
                              Kathmandu, Nepal (Near Landmark Area)
                            </p>
                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 border border-emerald-100/60">
                              <Lock size={10} /> Locked
                            </span>
                          </div>
                        )}
                      </div>

                      {post.description && (
                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block mb-0.5">Remarks</span>
                            <p className="text-slate-600 font-medium text-[11px] leading-relaxed line-clamp-2 italic">
                              "{post.description}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      disabled={checkingVerification}
                      onClick={() => handleApplyClick(post)}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:bg-slate-300 cursor-pointer"
                    >
                      {checkingVerification ? (
                        <>Validating Credentials...</>
                      ) : (
                        <>
                          {isAuthenticated ? "Apply for Tuition" : "Sign In to Unlock & Apply"} 
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </>
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
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <ShieldAlert className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Verification Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              To apply for open tuition vacancies and access instant direct messaging streams with families, your profile verification process must be completed first.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  navigate('/role');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors tracking-wide cursor-pointer"
              >
                Go to Verification Dashboard
              </button>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 rounded-xl text-xs transition-colors cursor-pointer"
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