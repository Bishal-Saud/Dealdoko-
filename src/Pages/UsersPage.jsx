import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabase.js';
import { Search, MapPin, ShieldCheck, Star, ChevronRight, UserMinus } from 'lucide-react';
import HomeLayout from '../Layouts/HomeLayout.jsx';
import { Helmet } from 'react-helmet-async';

function UsersPage() {
  const [searchParams] = useSearchParams();
  
  // Extract parameters sent from the Header setup
  const searchQuery = searchParams.get('search') || '';
  const locationQuery = searchParams.get('location') || '';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilteredUsers();
  }, [searchQuery, locationQuery]); 

const fetchFilteredUsers = async () => {
  try {
    setLoading(true);
    // Fetch profile AND their courses (assuming a foreign key exists)
    let dbQuery = supabase.from('profiles').select('*, products(*)');

    if (locationQuery.trim() !== '') {
      dbQuery = dbQuery.ilike('location', `%${locationQuery.trim()}%`);
    } else if (searchQuery.trim() !== '') {
      dbQuery = dbQuery.or(`full_name.ilike.%${searchQuery.trim()}%,username.ilike.%${searchQuery.trim()}%`);
    }

    const { data, error } = await dbQuery.order('rating', { ascending: false });
    if (error) throw error;
    setUsers(data || []);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    setLoading(false);
  }
};

  // Determine subheader display text dynamically
  const getSubheaderText = () => {
    if (locationQuery) {
      return `Showing teachers & users located in "${locationQuery}" (${users.length} found)`;
    }
    if (searchQuery) {
      return `Showing match results for "${searchQuery}" (${users.length} found)`;
    }
    return "Discover and browse active peer-to-peer network users";
  };

  return (
    <HomeLayout>
      <Helmet>
  <title>
    {locationQuery 
      ? `Best Home Tuition Teachers in ${locationQuery} | Tol Path` 
      : "Find Professional Home Tuition Teachers | Tol Path"}
  </title>
  <meta name="description" content={`Browse and hire verified home tuition teachers. ${locationQuery ? `Find educators available in ${locationQuery}.` : "High-quality academic support for students across Nepal."}`} />
</Helmet>
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Summary Metadata Block */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Platform Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            {getSubheaderText()}
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
              We couldn't locate any accounts matching your search inputs. Try checking spellings or look up a different area.
            </p>
          </div>
        ) : (
          /* Dynamic Profile Match Render Loop Grid */
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {users.map((profile) => (
    <div key={profile.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      
      {/* Profile Header with Rating */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={profile.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
            className="w-14 h-14 rounded-2xl object-cover" 
          />
          <div>
            <h3 className="font-black text-slate-900">{profile.full_name}</h3>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <MapPin size={10} className="text-blue-500" /> {profile.location || "Nepal"}
            </p>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-xl font-black text-xs">
          <Star size={12} className="fill-yellow-500 text-yellow-500" />
          {profile.rating ? Number(profile.rating).toFixed(1) : "0.0"}
        </div>
      </div>

      {/* Course Listing (Small Cards) */}
      <div className="flex-grow space-y-2 mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Featured Courses</p>
        
        {profile.products && profile.products.length > 0 ? (
          profile.products.slice(0, 2).map((course) => ( // Show max 2 to keep layout clean
            <div key={course.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
              <span className="font-bold text-xs text-slate-700 truncate mr-2">{course.title}</span>
              <span className="text-[10px] font-black text-blue-600">Rs. {course.price}</span>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-slate-400 italic">No courses listed.</p>
        )}
      </div>

      {/* Action Button */}
      <Link 
        to={`/profile/${profile.id}`} 
        className="w-full text-center py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
      >
        View Full Profile
      </Link>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
    </HomeLayout>
  );
}

export default UsersPage;