import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js';
import { 
  ShieldCheck, GraduationCap, BookOpen, ArrowLeft,
  CheckCircle2, Loader2, Sparkles, KeyRound, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import HomeLayout from '../Layouts/HomeLayout.jsx';

function RolePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const googleFormLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSd2e32JiRHJv5qx9WU4szCP8CwgVc6mYgSMZGbuGtkcAEoHjA/viewform";

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login.");
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 When user clicks apply
  const handleApplyTutor = async () => {
    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('profiles')
        .update({
          tutor_request_status: "pending_review"
        })
        .eq('id', user.id);

      toast.success("Redirecting to verification form...");

      setTimeout(() => {
        window.open(googleFormLink, "_blank");
      }, 800);

    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  const isTutor = profile?.is_verified_seller;
  const isPending = profile?.tutor_request_status === "pending_review";

  return (
    <HomeLayout>

   
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <Toaster />

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black flex items-center justify-center gap-2">
            Choose Workspace <Sparkles className="text-blue-600" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Select your role access level
          </p>
        </div>

        {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

  {/* STUDENT CARD */}
  <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition">

    <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-4">
      <BookOpen />
    </div>

    <h2 className="text-xl font-black">Student / Parent</h2>
    <p className="text-xs text-slate-400 mt-1">
      Find tutors and request home tuition near you
    </p>

    {/* BENEFITS BOX */}
    <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <h3 className="text-xs font-black text-blue-700 mb-2">
        🎓 Student Benefits
      </h3>

      <ul className="space-y-1 text-xs text-slate-600">
        <li>✔ Find verified local home tutors</li>
        <li>✔ Affordable one-to-one learning</li>
        <li>✔ Improve weak subjects faster</li>
        <li>✔ Flexible timing at home</li>
        <li>✔ Safe face-to-face learning</li>
      </ul>
    </div>

    <button className="w-full mt-6 py-3 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl">
      Active Role
    </button>
  </div>

  {/* TUTOR CARD */}
  <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition">

    <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-2xl mb-4">
      <GraduationCap />
    </div>

    <h2 className="text-xl font-black flex items-center gap-2">
      Home Tutor
    </h2>

    <p className="text-xs text-slate-400 mt-1">
      Teach students and earn by sharing your knowledge
    </p>

    {/* BENEFITS BOX */}
    <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4">
      <h3 className="text-xs font-black text-amber-700 mb-2">
        💰 Tutor Benefits
      </h3>

      <ul className="space-y-1 text-xs text-slate-600">
        <li>✔ Earn monthly income from teaching</li>
        <li>✔ Get students near your location</li>
        <li>✔ Build teaching experience</li>
        <li>✔ Flexible working hours</li>
        <li>✔ Verified tutor badge & trust boost</li>
      </ul>
    </div>

    {/* VERIFIED */}
    {profile?.is_verified_seller && (
      <button className="w-full mt-6 py-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl">
        Verified Tutor Active
      </button>
    )}

    {/* APPLY BUTTON */}
    {!profile?.is_verified_seller && (
      <button
        onClick={handleApplyTutor}
        disabled={submitting}
        className="w-full mt-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <>
            <KeyRound size={14} />
            Apply as Tutor (Google Form)
          </>
        )}
      </button>
    )}

  </div>

</div>

      </div>
    </div>
     </HomeLayout>
  );
}

export default RolePage;