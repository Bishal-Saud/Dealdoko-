import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js';
import { X, Clipboard, BookOpen, Wallet, Calendar, MapPin, GraduationCap, FileText } from 'lucide-react';

function UserFlowModel({ user, isOpen, onClose, onPostCreated }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parentLocationName, setParentLocationName] = useState(null); // Stores regional profile tag
  const [formData, setFormData] = useState({
    subject: '',
    class_level: '',
    budget_per_month: '',
    frequency_per_week: '',
    landmark_description: '',
    required_qualification: '', 
    description: ''             
  });

  // Fetch the logged-in parent's standard location_name from profiles
  useEffect(() => {
    const fetchParentProfileLocation = async () => {
      if (!user?.id || !isOpen) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('location_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.location_name) {
          setParentLocationName(data.location_name);
        }
      } catch (err) {
        console.error("Error fetching parent location token metadata:", err);
      }
    };

    fetchParentProfileLocation();
  }, [user, isOpen]);

  if (!isOpen) return null;

  if (!user?.is_verified_buyer) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Verification Required</h2>
          <p className="text-sm text-slate-500 mb-4">
            Only verified student or parent accounts can post new tuition requirements. Please complete your profile verification first.
          </p>
          <button 
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Security Check: Ensure the user has a location set on their account profile
      if (!parentLocationName) {
        throw new Error("Please configure your region/city in your profile setup dashboard before creating public tuition listings.");
      }

      const { data, error } = await supabase
        .from('tuition_requirements')
        .insert([
          {
            user_id: user.id, 
            subject: formData.subject,
            class_level: formData.class_level,
            budget_per_month: Number(formData.budget_per_month),
            frequency_per_week: Number(formData.frequency_per_week),
            landmark_description: formData.landmark_description,
            required_qualification: formData.required_qualification, 
            description: formData.description,
            location_name: parentLocationName // 🔥 CRITICAL: Binds post to teacher region matching key
          }
        ])
        .select();

      if (error) throw error;

      if (onPostCreated) onPostCreated(data[0]);
      onClose(); 
    } catch (err) {
      console.error("Error creating tuition post:", err);
      setErrorMsg(err.message || "Failed to post requirement. Make sure your profile status is updated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Post Tuition Requirement</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100">{errorMsg}</p>
          )}

          {/* Active Posting Region Readonly Badge */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Publishing Context Region:</span>
            <span className="font-black text-blue-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md shadow-xs border border-blue-200">
              {parentLocationName || "Loading..."}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Subject Name
              </label>
              <input
                type="text"
                name="subject"
                required
                placeholder="e.g., Physics, Mathematics"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Class / Grade Level
              </label>
              <input
                type="text"
                name="class_level"
                required
                placeholder="e.g., Class 11 (+2)"
                value={formData.class_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Budget (NPR/mo)
              </label>
              <input
                type="number"
                name="budget_per_month"
                required
                placeholder="e.g., 7500"
                value={formData.budget_per_month}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Classes per Week
              </label>
              <input
                type="number"
                name="frequency_per_week"
                required
                min="1"
                max="7"
                placeholder="e.g., 3 days, 5 days"
                value={formData.frequency_per_week}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Teacher Qualification Required
            </label>
            <input
              type="text"
              name="required_qualification"
              placeholder="e.g., Bachelor in Physics, Completed +2, or Open to all"
              value={formData.required_qualification}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Specific Area Landmark
            </label>
            <textarea
              name="landmark_description"
              required
              rows="2"
              placeholder="e.g., Near Campus Gate, Opposite City Hospital, Ward 13"
              value={formData.landmark_description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Additional Details / Specific Needs
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="e.g., Student is weak in mechanics. Looking for an energetic teacher who can teach in evening shifts."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !parentLocationName}
              className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors ${
                loading || !parentLocationName ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? "Publishing Post..." : "Publish Tuition Requirement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFlowModel;