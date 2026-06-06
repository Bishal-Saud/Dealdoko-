import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js';
import { 
  ShieldAlert, ShieldCheck, GraduationCap, BookOpen, ArrowLeft, 
  Lock, KeyRound, CheckCircle2, Loader2, Sparkles, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function RolePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to change account workspaces.");
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
      console.error(err.message);
      toast.error("Failed to load user credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleTutorActivation = async (e) => {
    e.preventDefault();
    
    // Clean, explicit Vite environment syntax
    const EXPECTED_SECRET = import.meta.env.VITE_SECRET_CODE;

    if (!EXPECTED_SECRET) {
      console.error("Environment Variable Error: VITE_SECRET_CODE key missing from .env configuration.");
      toast.error("Server configuration error. Contact administration.");
      return;
    }

    // Strict match evaluation logic comparison
    if (secretCode.trim() !== EXPECTED_SECRET.trim()) {
      toast.error("Invalid instructor authorization code!");
      return;
    }

    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Updates the user flags inside your backend table for tuition access permissions
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified_seller: true, // keeping database structural flags identical to prevent breaking references
          is_verified_buyer: true,
          kyc_status: "Level 1 - Authorized Home Tutor"
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Tutor Account Verified! Welcome to the academic instructor roster.");
      setShowSecretModal(false);
      setSecretCode('');
      fetchUserProfile(); // Refreshes UI state
    } catch (err) {
      toast.error("Database connection dropped.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isTutor = profile?.is_verified_seller || false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4">
      <Toaster />
      
      <div className="max-w-3xl mx-auto">
        {/* Top Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-2xs"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Title Content */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            Choose Portal Workspace <Sparkles className="text-blue-600 fill-blue-500/10" size={24} />
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Toggle your access layout layer to reveal appropriate tuition and academic features.
          </p>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* STUDENT / PARENT PROFILE CARD */}
          <div className={`bg-white rounded-3xl p-6 border transition relative overflow-hidden flex flex-col justify-between shadow-xs ${
            !isTutor ? 'border-2 border-blue-600 ring-4 ring-blue-50' : 'border-slate-200'
          }`}>
            {!isTutor && (
              <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                Active Portal
              </span>
            )}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Student / Parent</h2>
              <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                Default account space for learners and guardians. Search verified local tuition instructors, request home tuition sessions, and monitor academic progress tracking logs.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Request home tutors</li>
                <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Rate & review assigned teachers</li>
                <li className="flex items-center gap-2 text-slate-400 line-through"><Lock size={12} /> Direct batch curriculum creation logs</li>
              </ul>
            </div>

            <button 
              disabled={!isTutor}
              className={`w-full mt-8 py-3 text-xs font-black rounded-xl transition ${
                !isTutor 
                  ? 'bg-blue-50 text-blue-600 cursor-default' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {!isTutor ? 'Currently Selected' : 'Return to Student Space'}
            </button>
          </div>

          {/* AUTHORIZED HOME TUTOR CARD */}
          <div className={`bg-white rounded-3xl p-6 border transition relative overflow-hidden flex flex-col justify-between shadow-xs ${
            isTutor ? 'border-2 border-amber-500 ring-4 ring-amber-50' : 'border-slate-200'
          }`}>
            {isTutor && (
              <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                Instructor Tier
              </span>
            )}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <GraduationCap size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-1.5">
                Home Tutor 
                {isTutor && <ShieldCheck className="text-amber-500 fill-amber-500/10" size={18} />}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                Unlock official system capabilities to list your tutoring credentials, publish class schedule availabilities, receive tuition applications, and claim premium badges.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-2 text-amber-700"><CheckCircle2 size={14} /> Display verified gold educator badge</li>
                <li className="flex items-center gap-2 text-amber-700"><CheckCircle2 size={14} /> Accept parent home tuition requests</li>
                <li className="flex items-center gap-2 text-amber-700"><CheckCircle2 size={14} /> Manage premium batch pricing parameters</li>
              </ul>
            </div>

            {isTutor ? (
              <button className="w-full mt-8 py-3 bg-amber-50 text-amber-700 text-xs font-black rounded-xl cursor-default">
                Instructor Privileges Active
              </button>
            ) : (
              <button 
                onClick={() => setShowSecretModal(true)}
                className="w-full mt-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 group"
              >
                <KeyRound size={14} className="text-amber-400 group-hover:scale-110 transition" /> Activate Tutor Node
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ADMINISTRATION CODE VERIFICATION MODAL */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <div className="text-center mb-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Instructor Authorization</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Enter the center secret key token to activate verified educator features.</p>
            </div>

            <form onSubmit={handleTutorActivation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Administration Code Phrase</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-sm outline-none font-mono tracking-widest text-center text-blue-600"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowSecretModal(false); setSecretCode(''); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition shadow-xs disabled:bg-blue-400 flex items-center justify-center"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Activation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePage;