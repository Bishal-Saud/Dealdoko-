import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase.js'; 
import { 
  CheckCircle, Star, ShieldCheck, Calendar, Award, 
  ArrowLeft, GraduationCap, Briefcase, MapPin, BookOpen, 
  Layers, PhoneCall, Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import HomeLayout from '../Layouts/HomeLayout.jsx';

function ProfilePage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false); 
  const [isViewerVerifiedSeller, setIsViewerVerifiedSeller] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      // Fetch the viewer's status to check contact permissions
      if (sessionUser) {
        const { data: viewerData, error: viewerError } = await supabase
          .from('profiles')
          .select('is_verified_seller')
          .eq('id', sessionUser.id)
          .single();
        
        if (!viewerError && viewerData) {
          setIsViewerVerifiedSeller(viewerData.is_verified_seller === true);
        }
      }

      const targetId = id || sessionUser?.id;

      if (!targetId) {
        setLoading(false);
        return;
      }

      setIsOwnProfile(sessionUser?.id === targetId);

      // Fetch profile info
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        
        // Fetch posted courses/tuitions if they are a teacher
        if (data.is_verified_seller === true) {
          const { data: coursesData, error: coursesError } = await supabase
            .from('products')
            .select('id, title, subject, timing, price, description, seller_id')
            .eq('seller_id', targetId)
            .order('created_at', { ascending: false });

          if (!coursesError && coursesData) {
            setTeacherCourses(coursesData);
          }
        }
      } else if (sessionUser && sessionUser.id === targetId) {
        setProfile({
          full_name: sessionUser.user_metadata?.full_name || 'Anonymous User',
          email: sessionUser.email,
          avatar_url: sessionUser.user_metadata?.avatar_url || '',
          created_at: sessionUser.created_at,
          is_verified_seller: false,
          is_verified_buyer: false,
          location: 'Not Specified'
        });
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      toast.error('Please log in to view this profile.');
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
    if (isOwnProfile || isViewerVerifiedSeller) {
      if (profile?.phone_number) {
        window.open(`tel:${profile.phone_number}`, "_self");
      } else {
        toast.error("This educator has not configured a public telephone contact record.");
      }
    } else {
      toast.error("Access Protected: Only Verified Teachers can contact posters.");
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
  if (isVerifiedSeller && isVerifiedBuyer) {
    verifiedBadgeLabel = "Verified Teacher";
  } else if (isVerifiedBuyer) {
    verifiedBadgeLabel = "Verified Student / Client";
  }
  
  const userLocation = profile?.location || "Not Specified";
  const joinedDate = formatJoinedDate(profile?.created_at);
  const rating = profile?.rating ? Number(profile.rating).toFixed(1) : "0.0";
  const totalReviews = profile?.review_count || 0;
  const experienceYears = profile?.experience_years || 0;

  const canViewPhoneNumber = isOwnProfile || isViewerVerifiedSeller;
  const displayPhoneNumber = canViewPhoneNumber 
    ? (profile?.phone_number || "Not Provided") 
    : "Contact Details Hidden (Verified Teachers Only)";

  return (
    <HomeLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
        <Toaster />
        <div className="h-40 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 shadow-inner" />

        <div className="max-w-5xl mx-auto px-4 -mt-16">
          
          <div className="flex justify-between items-center mb-4">
            {id ? (
              <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:text-slate-900 transition px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT SIDEBAR: PROFILE CARD */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center h-fit">
              {isOwnProfile && (
                <div className="w-full flex justify-end -mt-2 mb-2">
                  <button 
                    onClick={() => navigate('/edit-profile')} 
                    className="text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition border border-slate-100"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
              
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
              
              <p className={`text-xs font-bold mt-2 px-3 py-1 rounded-lg ${canViewPhoneNumber ? 'text-slate-700 bg-slate-50' : 'text-rose-600 bg-rose-50'}`}>
                {displayPhoneNumber}
              </p>

              <div className="mt-3">
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isVerifiedSeller ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <GraduationCap size={12} /> {verifiedBadgeLabel}
                </span>
              </div>

              <div className="w-full border-t border-slate-100 my-5" />

              <div className="w-full space-y-3 text-left text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400"><Calendar size={13}/> Joined</span>
                  <span className="font-bold text-slate-800">{joinedDate}</span>
                </div>
                
                <div className="flex justify-between items-start text-slate-500">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400 pt-0.5"><MapPin size={13}/> Location</span>
                  <span className="font-bold text-slate-800 text-right max-w-[160px] break-words">{userLocation}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400"><Briefcase size={13}/> Experience</span>
                  <span className="font-bold text-slate-800">{experienceYears} Years</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400"><Star size={13}/> Ratings</span>
                  <span className="font-bold text-slate-800">{rating} ({totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA: BIOGRAPHY & USER POSTS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bio Block */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" /> About Me
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {profile?.bio || "This user hasn't customized their background biography overview yet."}
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

              {/* Course Listings Block */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-amber-500" /> Posted Academic Classes ({teacherCourses.length})
                </h3>

                {teacherCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs font-semibold shadow-sm">
                    No active academic tuition offerings posted on this profile.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherCourses.map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
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
                          Contact Now <PhoneCall size={14} /> 
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default ProfilePage;