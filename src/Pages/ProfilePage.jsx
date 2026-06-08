import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase.js'; 
import { 
  CheckCircle, Star, ShieldCheck, Clock, Handshake, 
  Calendar, Award, ArrowLeft, GraduationCap, Briefcase, 
  MapPin, BookOpen, Layers, Navigation, UserCheck,
  PhoneCall, Wallet, Percent, CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function ProfilePage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isOwnProfile, setIsOwnProfile] = useState(false); 

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const targetId = id || sessionUser?.id;

      if (!targetId) {
        setLoading(false);
        return;
      }

      setIsOwnProfile(sessionUser?.id === targetId);

      // 1. Fetch Profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        
        // 2. Only fetch courses IF is_verified_seller is true
        if (data.is_verified_seller === true) {
          const { data: coursesData, error: coursesError } = await supabase
            .from('products')
            .select('id, title, subject, timing, price, description, successful_deals, active_parents, completed_earnings, seller_id')
            .eq('seller_id', targetId)
            .order('created_at', { ascending: false });

          if (!coursesError && coursesData) {
            setTeacherCourses(coursesData);
          }
        } else {
          // Explicitly clear/set to empty if not a verified seller
          setTeacherCourses([]);
        }

        // Tab logic
        if (data.is_verified_seller) {
          setActiveTab('teaching');
        } else {
          setActiveTab('overview');
        }
      } else if (sessionUser && sessionUser.id === targetId) {
        // Fallback for new users
        setProfile({
          full_name: sessionUser.user_metadata?.full_name || 'Anonymous User',
          email: sessionUser.email,
          avatar_url: sessionUser.user_metadata?.avatar_url || '',
          created_at: sessionUser.created_at,
          is_verified_seller: false,
          is_verified_buyer: false,
          location: 'Not Specified'
        });
        setTeacherCourses([]); 
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error.message);
  toast.error('Please log in to view your profile.');
    } finally {
      setLoading(false);
    }
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const initiateDirectCall = () => {
    if (profile?.phone_number) {
      window.open(`tel:${profile.phone_number}`, "_self");
    } else {
      toast.error("This educator has not configured a public telephone contact record.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fullName = profile?.full_name || "Guest User";
  const email = profile?.email || "No email linked";
  const avatarUrl = profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback";
  
  const isVerifiedSeller = profile?.is_verified_seller === true;
  const isVerifiedBuyer = profile?.is_verified_buyer === true;

  let verifiedBadgeLabel = "Standard User";
  let kycStatusText = profile?.verification_status || "Unverified";

  if (isVerifiedSeller && isVerifiedBuyer) {
    verifiedBadgeLabel = "Verified Teacher";
    kycStatusText = "Authorized Teacher";
  } else if (isVerifiedBuyer) {
    verifiedBadgeLabel = "Verified Student / Client";
    kycStatusText = "Verified Operator";
  }
  
  const userLocation = profile?.location || "Not Specified";
  const lat = profile?.latitude;
  const lon = profile?.longitude;
  const joinedDate = formatJoinedDate(profile?.created_at);
  
  const rating = profile?.rating ? Number(profile.rating).toFixed(2) : "0.00";
  const totalReviews = profile?.review_count || 0;
  const experienceYears = profile?.experience_years || 0;

  // 📈 COMPUTE REAL-TIME STATS FROM DIRECT ACCOUNT LEDGER DATA
  let totalEarningsValue = 0;
  let totalCompletedCycles = 0;
  let totalDealsTargeted = 0;

  teacherCourses.forEach(product => {
    const earnings = parseFloat(product.completed_earnings) || 0;
    const baseRate = parseFloat(product.price) || 1;
    const targetCount = parseInt(product.successful_deals, 10) || 0;
    
    totalEarningsValue += earnings;
    totalCompletedCycles += earnings / baseRate;
    totalDealsTargeted += targetCount;
  });

  const completionRateCalculated = totalDealsTargeted > 0 
    ? Math.round((totalCompletedCycles / totalDealsTargeted) * 100) 
    : 0;
  
  const globalCompletionRate = completionRateCalculated > 100 ? "100%" : `${completionRateCalculated}%`;
  const totalCompletedBatches = Math.floor(totalCompletedCycles);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      <Toaster />
      <div className="h-40 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 shadow-inner" />

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        
        <div className="flex justify-between items-center mb-4">
          {id ? (
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:text-slate-900 transition px-3 py-2 rounded-xl border border-slate-200/60 shadow-xs"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT PANEL: MAIN IDENTIFICATION BADGE CARD */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col items-center text-center h-fit">
            <div className="relative">
              <img 
                src={avatarUrl} 
                alt={fullName} 
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-slate-100"
              />
              {isVerifiedSeller && isVerifiedBuyer && (
                <div className="absolute bottom-1 right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-md border-2 border-white">
                  <Award size={16} className="fill-current" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-black text-slate-900 mt-4 flex items-center justify-center gap-1.5">
              {fullName}
              {isVerifiedBuyer && (
                <CheckCircle 
                  size={18} 
                  className={isVerifiedSeller ? "text-amber-500 fill-amber-500/10" : "text-blue-500 fill-blue-500/10"} 
                />
              )}
            </h2>
            
            {profile?.username && (
              <p className="text-xs font-bold text-blue-600 mt-0.5">@{profile.username}</p>
            )}
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{email}</p>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {isVerifiedSeller && isVerifiedBuyer ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                  <GraduationCap size={12} /> {verifiedBadgeLabel}
                </span>
              ) : isVerifiedBuyer ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                  <UserCheck size={12} /> {verifiedBadgeLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  {verifiedBadgeLabel}
                </span>
              )}
            </div>

            <div className="w-full border-t border-slate-100 my-5" />

            <div className="w-full space-y-3 text-left text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400"><Calendar size={13}/> Joined Desk</span>
                <span className="font-bold text-slate-800">{joinedDate}</span>
              </div>
              
              <div className="flex justify-between items-start text-slate-500">
                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400 pt-0.5"><MapPin size={13}/> Location</span>
                <span className="font-bold text-slate-800 text-right max-w-[160px] break-words">{userLocation}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400"><ShieldCheck size={13}/> Security</span>
                <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${
                  isVerifiedSeller && isVerifiedBuyer 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : isVerifiedBuyer 
                    ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                  {kycStatusText}
                </span>
              </div>
            </div>

            {lat && lon && (
              <div className="w-full mt-5 pt-4 border-t border-slate-100 text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                  <Navigation size={12} className="text-blue-500" /> Operational Proximity
                </p>
                <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <iframe
                    title="Teacher Coordinates Proximity Frame"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: MAIN PROFILE METRICS AND TABS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Metric Header Overview Strip */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Rating Score</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={15} className={totalReviews > 0 ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} />
                  <span className="text-base font-black text-slate-900">{rating}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">({totalReviews} reviews)</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active Batches</p>
                <p className="text-base font-black text-blue-600 mt-1">{teacherCourses.length} Active</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Classes Offered</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Experience</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-slate-800 font-black text-base">
                  <Briefcase size={14} className="text-slate-400" />
                  <span>{experienceYears} Years</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Home Tuitions</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Course Completion</p>
                <p className={`text-base font-black mt-1 ${globalCompletionRate === '0%' ? 'text-slate-400' : 'text-emerald-600'}`}>{globalCompletionRate}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Average Syllabus Rate</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-1.5 shadow-2xs border border-slate-100 flex gap-1">
              {isVerifiedSeller && (
  <button 
    onClick={() => setActiveTab('teaching')}
    className={`flex-1 py-2 rounded-xl text-xs font-black transition ${activeTab === 'teaching' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
  >
    Academic Classes
  </button>
)}
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                F2F Deal Overviews
              </button>
            </div>

            {/* DYNAMIC TAB SWITCHING LOGIC */}
            {activeTab === 'teaching' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} className="text-amber-500" /> Active Service Offerings ({teacherCourses.length})
                  </h3>

                  {teacherCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs font-semibold">
                      This educator hasn't launched any public tuition services this session.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacherCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {course.subject || "General"}
                              </span>
                              <span className="text-xs font-black text-emerald-600">
                                Rs. {course.price ? parseFloat(course.price).toLocaleString() : '0'} /mo
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-2 group-hover:text-blue-600 transition">{course.title}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                              <Clock size={12} /> {course.timing || "Flexible Timings"}
                            </p>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-2 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                          
                          <button 
                            onClick={initiateDirectCall}
                            className="w-full mt-4 py-2 bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1"
                          >
                            Contact Now <PhoneCall size={16} /> 
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" /> Professional Overview
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {profile?.bio || "This educator hasn't customized their background biography overview yet."}
                  </p>

                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'overview' ? (
              
              /* REFACTORED TUITION METRICS PANEL */
              <div className="space-y-6">
                
                {isVerifiedSeller ? (
                  <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
                    <h3 className="text-base font-black text-slate-900 mb-4 tracking-tight">Tuition Contract Metrics Summary</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* COMPLETED BATCHES METRIC */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Completed Batches</p>
                          <p className="text-xl font-black text-slate-900">
                            {totalCompletedBatches} <span className="text-xs font-normal text-slate-500">{totalCompletedBatches === 1 ? 'cycle' : 'cycles'}</span>
                          </p>
                        </div>
                      </div>

                      {/* COURSE COMPLETION RATE METRIC */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                          <Percent size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Completion Rate</p>
                          <p className="text-xl font-black text-amber-600">
                            {globalCompletionRate}
                          </p>
                        </div>
                      </div>

                      {/* REVENUE EARNED METRIC */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Wallet size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Revenue Earned</p>
                          <p className="text-base font-black text-emerald-600">
                            रू {totalEarningsValue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-slate-400 text-xs font-semibold shadow-xs">
                    This account is registered as a student. F2F operational business insights are exclusively configured for verified seller/teacher profiles.
                  </div>
                )}

                {isVerifiedSeller && (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs font-semibold shadow-xs">
                    No historic face-to-face tuition settlement ledger entries verified on-record yet.
                  </div>
                )}
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;