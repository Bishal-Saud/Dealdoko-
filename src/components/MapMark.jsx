import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../api/supabase.js'; 
import { MapPin, Star, GraduationCap, MessageSquare, Loader2, AlertCircle, Lock, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import RestrictedMapBanner from './RestrictedMapBanner.jsx';

// 1. Premium Glowing Interactive Map Pins
const customTeacherIcon = new L.DivIcon({
  className: 'custom-teacher-geo-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping opacity-75"></div>
      <div class="relative bg-white border-2 border-blue-600 text-blue-600 p-1.5 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// 2. Map Recenter Controller to dynamically slide the view smoothly
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapMark() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Map positioning states (Defaults to central Mahendranagar/Bhimdatta coordinates)
  const [mapCenter, setMapCenter] = useState([28.9634, 80.1741]); 
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const initializeGeoMapping = async () => {
      setLoading(true);
      try {
        // Step A: Fetch current authenticated session details
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;

        // CRITICAL CHECK: If no session exists, break early out of the block
        if (!session?.user) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        setCurrentUser(session.user);
        let centerCoords = [28.9634, 80.1741]; 
        
        // Step B: Get coordinates of current logged-in user (buyer context)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('latitude, longitude, is_verified_buyer')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profileData) {
          if (profileData.latitude && profileData.longitude) {
            centerCoords = [parseFloat(profileData.latitude), parseFloat(profileData.longitude)];
            setMapCenter(centerCoords);
          }
        }

        // Step C: Query all verified sellers (teachers) to overlay on map bounds
        const { data: sellersData, error: sellersError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, location, latitude, longitude, is_verified_seller, rating')
          .eq('is_verified_seller', true);

        if (sellersError) throw sellersError;

        // Clean & filter sellers that have fully valid coordinate records
        const formattedTeachers = (sellersData || [])
          .filter(t => t.latitude && t.longitude && t.id !== session.user.id)
          .map(t => ({
            id: t.id,
            name: t.full_name || "Verified Instructor",
            avatar: t.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback",
            locationName: t.location || "Nearby Local Area",
            lat: parseFloat(t.latitude),
            lng: parseFloat(t.longitude),
            subject: "Home Tuition Expert", 
            rating: t.rating 
          }));

        setTeachers(formattedTeachers);
      } catch (err) {
        console.error("Map Data Fetch Error:", err.message);
        setError("Unable to stream live location coordinates.");
      } finally {
        setLoading(false);
      }
    };

    initializeGeoMapping();
  }, []);

  // 1. RENDER LOADING STATE
  if (loading) {
    return (
      <div className="w-full h-80 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin text-blue-600" size={24} />
        <span className="text-xs font-bold tracking-tight">Syncing Neighborhood Map Data...</span>
      </div>
    );
  }

  // 2. RENDER ERROR STATE
  if (error) {
    return (
      <div className="w-full h-80 bg-red-50/50 border border-red-100 rounded-3xl flex flex-col items-center justify-center text-red-500 p-6 text-center gap-2">
        <AlertCircle size={24} />
        <p className="text-xs font-black">{error}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
 <RestrictedMapBanner />
    );
  }

  // 4. RENDER FULL AUTHENTICATED GEO-MAP GRAPHICS
  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* HEADER SECTION METADATA */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">
            Tutors near your home base
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Showing verified professional local instructors found within your radius
          </p>
        </div>
        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
          {teachers.length} Available Tutors
        </span>
      </div>

      {/* DYNAMIC LEAFLET MAP ELEMENT WINDOW */}
      <div className="w-full h-80 rounded-3xl overflow-hidden border border-slate-200/60 shadow-xs relative z-10">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapRecenter center={mapCenter} />

          {teachers.map((teacher) => (
            <Marker 
              key={teacher.id} 
              position={[teacher.lat, teacher.lng]} 
              icon={customTeacherIcon}
              eventHandlers={{
                click: () => {
                  setMapCenter([teacher.lat, teacher.lng]);
                  setSelectedTeacher(teacher);
                },
              }}
            >
              <Popup>
                <div className="p-0.5 font-sans">
                  <p className="font-bold text-xs text-slate-900">{teacher.name}</p>
                  <p className="text-[10px] text-blue-600 font-semibold">{teacher.locationName}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* DETAILED INTERACTIVE INTERFACE DRAWER PREVIEW CARD */}
      {selectedTeacher ? (
        <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-lg shadow-slate-200/40 flex items-center gap-3.5 animate-fade-in">
          <img 
            src={selectedTeacher.avatar} 
            alt={selectedTeacher.name} 
            className="w-12 h-12 object-cover rounded-full border border-slate-100 bg-slate-50"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-800 truncate">{selectedTeacher.name}</h4>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0">
                Verified Expert
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1 truncate">
              <GraduationCap size={13} className="text-blue-500 flex-shrink-0" />
              <span>{selectedTeacher.locationName}</span>
            </p>
            
            <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold text-[11px]">
              <Star size={11} fill="currentColor" />
              <span>{selectedTeacher.rating}</span>
            </div>
          </div>

     <button 
  onClick={() => window.location.href = `/profile/${selectedTeacher.id}`}
  className="p-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition cursor-pointer active:scale-95 flex-shrink-0 shadow-xs"
  title="View Teacher Profile"
>
  <User size={14} />
</button>
        </div>
      ) : (
        <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center text-[11px] font-bold text-slate-400">
          Tap on any active teacher location pin across the map grid to look into credentials.
        </div>
      )}

    </div>
  );
}

export default MapMark;