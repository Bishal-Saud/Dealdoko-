import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabase.js';
import { Search, MapPin, ShieldCheck, Star, ChevronRight, UserMinus } from 'lucide-react';

function UsersPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('search') || '';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilteredUsers();
  }, [queryParam]); // Re-runs whenever the search term in the URL updates

const fetchFilteredUsers = async () => {
    try {
      setLoading(true);
      let dbQuery = supabase.from('profiles').select('*');

      if (queryParam.trim() !== '') {
        // 1. Clean the term (lowercase + trim space handles)
        const cleanQuery = queryParam.trim().toLowerCase();
        
        // 2. Format wildcards explicitly before injecting into the string
        const matchString = `%${cleanQuery}%`;
        
        // 3. CLEAN SYNTAX FIX: Notice how the wildcards are structured out securely
        dbQuery = dbQuery.or(`full_name.ilike.${matchString},username.ilike.${matchString}`);
        console.log("data",dbQuery) 
      }

      const { data, error } = await dbQuery;
      
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching user list matrix:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Summary Metadata Block */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Platform Traders</h1>
          <p className="text-sm text-slate-500 mt-1">
            {queryParam 
              ? `Showing match results for "${queryParam}" (${users.length} found)`
              : "Discover and browse active peer-to-peer network users"
            }
          </p>
        </div>

        {/* Loading Indicator Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          /* Empty Search Fallback State Graphic */
          <div className="bg-white rounded-3xl p-12 border border-slate-200/60 text-center shadow-xs flex flex-col items-center max-w-md mx-auto mt-8">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <UserMinus size={32} />
            </div>
            <h3 className="font-black text-slate-800 text-base">No Users Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              We couldn't locate any accounts matching your search inputs. Try checking spellings or look up a different user handle.
            </p>
          </div>
        ) : (
          /* Dynamic Profile Match Render Loop Grid */
          <div className="space-y-3">
            {users.map((profile) => (
              <div 
                key={profile.id} 
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Profile Meta Left Wing info group */}
                <div className="flex items-center gap-4">
                  <img 
                    src={profile.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                    alt={profile.full_name} 
                    className="w-14 h-14 rounded-full object-cover border border-slate-100 bg-slate-50"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm leading-tight">
                        {profile.full_name || 'Anonymous User'}
                      </h3>
                      
                      {/* NEW: Explicitly render username handle beside their display name */}
                      {profile.username && (
                        <span className="text-xs font-bold text-blue-600">
                          @{profile.username}
                        </span>
                      )}

                      {profile.is_verified_seller && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck size={10} /> Seller
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{profile.email}</p>
                    
                    {/* Secondary Metrics Row Indicators */}
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium mt-1.5">
                      <span className="flex items-center gap-0.5 text-slate-600">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <strong>{profile.rating ? Number(profile.rating).toFixed(2) : "0.00"}</strong>
                      </span>
                      <span>•</span>
                      <span>{profile.completion_rate || "0%"} Completion</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10}/> Nepal</span>
                    </div>
                  </div>
                </div>

                {/* View Actions Link navigation button right layout */}
                <div className="flex items-center justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-50">
                  <Link 
                    to={profile.id ? `/profile/${profile.id}` : '#'} 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-bold bg-slate-50 text-slate-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl border border-slate-200/60 transition group cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;