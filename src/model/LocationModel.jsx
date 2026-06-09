import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js';
import { MapPin, Building2 } from 'lucide-react'; // Clean UI Icons

const LocationModal = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // New States for step tracking and custom landmarks
  const [step, setStep] = useState(1); // Step 1: Detect, Step 2: Landmark
  const [detectedData, setDetectedData] = useState({ fullAddress: '', city: '' });
  const [landmark, setLandmark] = useState('');

  useEffect(() => {
    if (user && (!user.location_name || user.location_name === "") && !localStorage.getItem("dismissed_location")) {
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    localStorage.setItem("dismissed_location", "true");
    setIsOpen(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error("Failed to fetch address.");
          const data = await response.json();

          const fullAddress = data.display_name; 
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "Unknown";

          // Save detected data to state and advance to Step 2
          setDetectedData({ fullAddress, city, latitude, longitude });
          setStep(2); 
        } catch (err) {
          console.error("Fetch failed:", err);
          setErrorMsg("Could not detect your exact city. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setErrorMsg("Location access denied. Please enable browser permissions.");
        setLoading(false);
      }
    );
  };

  const handleSaveFinalLocation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Update Supabase with both GPS info AND your new custom landmark
      const { error } = await supabase
        .from('profiles')
        .update({
          location_name: detectedData.fullAddress, 
          location: detectedData.city,
          latitude: detectedData.latitude,   
          longitude: detectedData.longitude,
          location_description: landmark // Saves "Near Mahakali Hospital", etc.
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setIsOpen(false);
      window.location.reload(); 
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMsg("Could not save to database. Try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl border border-slate-100 transition-all">
        
        {/* STEP 1: DETECT AUTOMATIC LOCATION */}
        {step === 1 && (
          <>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">Set Your Location</h2>
            <p className="mb-4 text-sm text-slate-500">We need your general area to show tutors or students near you.</p>
            
            {errorMsg && <p className="mb-3 text-xs text-red-500 bg-red-50 p-2 rounded">{errorMsg}</p>}

            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={handleGetLocation}
                disabled={loading}
                className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors ${
                  loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? "Detecting Location..." : "Allow Location Access"}
              </button>
              <button 
                onClick={handleClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}

        {/* STEP 2: ADD FAMOUS LANDMARK / DESCRIPTION */}
        {step === 2 && (
          <form onSubmit={handleSaveFinalLocation}>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-slate-800">Add Nearby Landmark</h2>
            <p className="mb-4 text-xs text-slate-400">Detected: <span className="font-semibold text-slate-600">{detectedData.city}</span></p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Famous Place Nearby (Landmark)
              </label>
              <input 
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Mahakali Hospital, Opposite Campus Gate"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">This helps tutors easily pinpoint your neighborhood sector.</p>
            </div>

            {errorMsg && <p className="mb-3 text-xs text-red-500 bg-red-50 p-2 rounded">{errorMsg}</p>}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors ${
                loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? "Saving Details..." : "Confirm & Finish Setup"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default LocationModal;