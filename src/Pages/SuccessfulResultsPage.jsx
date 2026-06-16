import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js';
import { CheckCircle2, User, Phone, Sparkles, GraduationCap, Calendar, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import HomeLayout from '../Layouts/HomeLayout.jsx';

function SuccessfulResultsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalDeals: 0, totalVolume: 0 });

  useEffect(() => {
    const fetchSuccessfulDeals = async () => {
      try {
        setLoading(true);

        // 1. Fetch ALL hired transactions without constraints
        const { data: hires, error: hiresError } = await supabase
          .from('hired_teachers')
          .select('id, created_at, teacher_name, teacher_phone, parent_id, post_id, tuition_requirements(subject, budget_per_month)')
          .order('created_at', { ascending: false });

        if (hiresError) throw hiresError;

        if (!hires || hires.length === 0) {
          setDeals([]);
          setStats({ totalDeals: 0, totalVolume: 0 });
          return;
        }

        // 2. Extract IDs and Phones carefully for cross-referencing
        const parentIds = hires.map(h => h.parent_id).filter(Boolean);
        const teacherPhones = hires
          .map(h => h.teacher_phone?.trim())
          .filter(Boolean);

        // 3. Concurrent requests to find profiles if they exist
        const [parentsResponse, teachersResponse] = await Promise.all([
          parentIds.length > 0 
            ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', parentIds)
            : { data: [], error: null },
          teacherPhones.length > 0 
            ? supabase.from('profiles').select('full_name, avatar_url, phone_number').in('phone_number', teacherPhones)
            : { data: [], error: null }
        ]);

        const parentProfiles = parentsResponse.data || [];
        const verifiedTeacherProfiles = teachersResponse.data || [];

        // 4. Combine data securely with foolproof fallbacks so records ALWAYS show up beautifully
        let dynamicVolume = 0;
        const combinedData = hires.map(hire => {
          const matchedParent = parentProfiles.find(p => p.id === hire.parent_id);
          const matchedTeacherProfile = verifiedTeacherProfiles.find(t => 
            t.phone_number?.trim() === hire.teacher_phone?.trim()
          );

          const currentBudget = hire.tuition_requirements?.budget_per_month || 0;
          dynamicVolume += currentBudget;

          return {
            id: hire.id,
            date: hire.created_at,
            subject: hire.tuition_requirements?.subject || 'General Tuition',
            budget: currentBudget,
            teacher: {
              // Priority 1: Profile Name | Priority 2: Stored Contract Name | Fallback: Registered Tutor
              name: matchedTeacherProfile?.full_name || hire.teacher_name || 'Independent Tutor',
              phone: hire.teacher_phone || 'Verified Line',
              avatar: matchedTeacherProfile?.avatar_url || null 
            },
            parent: {
              // Priority 1: Profile Name | Fallback: Standard client label
              name: matchedParent?.full_name || 'Anonymous Parent',
              avatar: matchedParent?.avatar_url || null
            }
          };
        });

        setDeals(combinedData);
        setStats({
          totalDeals: combinedData.length,
          totalVolume: dynamicVolume
        });
      } catch (err) {
        console.error('Error fetching matchup board details:', err.message);
        toast.error('Failed to load public placement history.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessfulDeals();
  }, []);

  if (loading) {
    return (
      <HomeLayout>
        <div className="py-32 text-center">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-slate-950 mx-auto"></div>
          <p className="text-xs text-slate-400 mt-4 font-bold tracking-wider uppercase">
            Syncing platform success reports...
          </p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header Module Section */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={11} className="text-emerald-600 animate-pulse" /> Platform Analytics
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              Success Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Every card below represents a successful deal finalized between a parent and an educator for home tuition.
            </p>
          </div>

          {/* Minimalist Dashboard Metrics to show off Success/Earnings */}
          {deals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Matches Locked</p>
                  <h4 className="text-xl font-black text-slate-900">{stats.totalDeals} Placements</h4>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Board Volume</p>
                  <h4 className="text-xl font-black text-slate-900">Rs. {stats.totalVolume.toLocaleString()}</h4>
                </div>
              </div>
            </div>
          )}

          {deals.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center max-w-md mx-auto shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No active matches indexed</p>
              <p className="text-xs text-slate-500 mt-1">Hiring logs display here publicly as soon as requirements close.</p>
            </div>
          ) : (
            /* Responsive Grid System showing ALL records */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deals.map((deal) => (
                <div 
                  key={deal.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Status Stamped Accent */}
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} /> Deal Closed
                  </div>

                  <div className="space-y-5">
                    {/* Header: Class subject info meta details */}
                    <div className="flex items-start justify-between pr-24">
                      <div>
                        <h3 className="text-base font-black text-slate-900 capitalize leading-tight">
                          {deal.subject}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar size={11} /> {new Date(deal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          Rs. {deal.budget.toLocaleString()}
                        </span>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">/ month</p>
                      </div>
                    </div>

                    {/* Dual Profiles Matchup Layout */}
                    <div className="grid grid-cols-7 items-center bg-slate-50/70 border border-slate-100 rounded-xl p-4 gap-1">
                      
                      {/* Left: Parent Node */}
                      <div className="col-span-3 text-center space-y-2">
                        {deal.parent.avatar ? (
                          <img 
                            src={deal.parent.avatar} 
                            alt={deal.parent.name} 
                            className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-white ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-950/10 flex items-center justify-center mx-auto text-white font-bold text-xs">
                            {deal.parent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Client Parent</p>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[110px] mx-auto">{deal.parent.name}</p>
                        </div>
                      </div>

                      {/* Middle Link Icon */}
                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <div className="p-1 bg-white border border-slate-100 rounded-lg shadow-3xs text-slate-400">
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      {/* Right: Resolved Teacher Node */}
                      <div className="col-span-3 text-center space-y-2">
                        {deal.teacher.avatar ? (
                          <img 
                            src={deal.teacher.avatar} 
                            alt={deal.teacher.name} 
                            className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-white ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-white ring-1 ring-emerald-200 flex items-center justify-center mx-auto text-emerald-700 font-bold text-xs">
                            {deal.teacher.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="text-[9px] uppercase font-black text-emerald-600 tracking-wider flex items-center justify-center gap-0.5">
                            <GraduationCap size={10} /> Appointed Teacher
                          </p>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[110px] mx-auto">{deal.teacher.name}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footing Log System Markers */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[9px]">
                      REC_{deal.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 select-none font-semibold text-emerald-600">
                      <Phone size={11} /> Arrangement Finalized
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}

export default SuccessfulResultsPage;