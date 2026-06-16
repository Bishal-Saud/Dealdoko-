import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js'; 
import { ShieldCheck, MapPin, Phone, CheckCircle2, Clock, UserCheck, Navigation, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import HomeLayout from '../Layouts/HomeLayout.jsx';

function VerificationPage() {
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState('unverified'); 
  const [submitting, setSubmitting] = useState(false);


  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+977');
  
  // Geolocation States
  const [district, setDistrict] = useState('');
  const [cityLocation, setCityLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  const isPhoneNumberValid = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        fetchCurrentVerificationStatus(user.id);
      }
    });
  }, []);

  const fetchCurrentVerificationStatus = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      // Cleaned select: Only requesting the primary location column
      .select('verification_status, phone_number, location, latitude, longitude') 
      .eq('id', userId)
      .single();

    if (data) {
      setKycStatus(data.verification_status || 'unverified');
      if (data.phone_number) {
        const cleanPhone = data.phone_number.replace(/^\+977/, '');
        setPhoneNumber(cleanPhone);
      }
      if (data.latitude) setLatitude(data.latitude);
      if (data.longitude) setLongitude(data.longitude);
      
      // Strict parsing using only the standard 'location' string
      const rawLocation = data.location; 
      if (rawLocation && typeof rawLocation === 'string' && !rawLocation.includes('[object')) {
        const parts = rawLocation.split(',');
        if (parts.length >= 2) {
          setCityLocation(parts[0].trim());
          setDistrict(parts[1].trim());
        } else {
          setCityLocation(rawLocation);
        }
      }
    }
  };


  useEffect(() => {
    if ((kycStatus === 'unverified' || kycStatus === 'rejected') && !latitude && !longitude) {
      handleGetCurrentLocation(false); 
    }
  }, [kycStatus]);

  const handleGetCurrentLocation = (showToast = true) => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser.");
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setLocLoading(false);
        
        if (showToast) toast.success("Live GPS coordinates synchronized!");

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const detectedCity = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.village || 'Near Me';
            const detectedDistrict = data.address.county || data.address.state || 'Nepal';
            
            setCityLocation(String(detectedCity));
            setDistrict(String(detectedDistrict).replace('District', '').trim());
          }
        } catch (err) {
          console.error("Error reading reverse location coordinates:", err);
        }
      },
      (error) => {
        console.error(error);
        setLocLoading(false);
        if (showToast) toast.error("Location access denied. Please enable permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();

    if (!isPhoneNumberValid(phoneNumber)) {
      return toast.error("Please enter a valid 10-digit WhatsApp number.");
    }
    if (!user) return toast.error('Please log in first.');

    setSubmitting(true);

    const finalCity = cityLocation ? String(cityLocation).trim() : "Unknown City";
    const finalDistrict = district ? String(district).trim() : "Nepal";
    const absoluteLocationString = `${finalCity}, ${finalDistrict}`;
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
 
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone_number: fullPhoneNumber,
          location: absoluteLocationString,
          verification_status: 'pending' 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setKycStatus('pending');
      toast.success('Verification submitted! Review in progress.', { duration: 5000 });
    } catch (error) {
      console.error("Supabase Save Error Details:", error);
      toast.error(error.message || 'Submission error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <Toaster />
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md text-blue-400">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight"> User Verification</h2>
                <p className="text-xs text-slate-300">Verify your identity to build trust and ensure a safer experience.</p>
              </div>
            </div>
            
            <div>
              {kycStatus === 'unverified' && <span className="bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-600">Unverified</span>}
              {kycStatus === 'rejected' && <span className="bg-rose-500/20 text-rose-500 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-500/30 flex items-center gap-1">Rejected</span>}
              {kycStatus === 'pending' && <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1"><Clock size={14}/> Awaiting Review</span>}
              {kycStatus === 'verified' && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle2 size={14}/> Verified User</span>}
            </div>
          </div>

          {kycStatus === 'pending' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Application Pending Admin Action</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                The database administrator is currently inspecting your registered contact information and coordinate metrics. Your profile updates as soon as the check resolves.
              </p>
            </div>
          )}

          {kycStatus === 'verified' && (
            <div className="p-10 text-center space-y-5 bg-gradient-to-b from-blue-50 to-white">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                <CheckCircle2 size={40} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">🎉 Congratulations!</h2>
                <p className="text-blue-600 font-bold mt-1">You are a Verified Account</p>
              </div>

              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your mobile identity contact data and localized boundary parameters are fully approved. You can now use all marketplace features without restrictions.
              </p>

              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-200">
                <UserCheck size={14} />
                Verified Active Profile
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => window.location.href = "/"}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
            <form onSubmit={handleSubmitVerification} className="p-6 md:p-8 space-y-6">
              
              {kycStatus === 'rejected' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-headShake">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-rose-950 uppercase tracking-wide">Verification Declined</h5>
                    <p className="text-xs text-rose-700/90 mt-0.5 leading-relaxed">
                      Your previous submission did not match our system security metrics. Please ensure you are providing a valid 10-digit number and giving active map telemetry permissions before re-applying.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={16} className="text-green-500" /> WhatsApp Contact
                </h4>
                
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-2 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="+977">+977 (NP)</option>
                  </select>

                  <input 
                    type="tel" 
                    required
                    maxLength="10"
                    placeholder="98XXXXXXXX" 
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhoneNumber(val);
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>
                {!isPhoneNumberValid(phoneNumber) && phoneNumber.length > 0 && (
                  <p className="text-[10px] text-rose-500 font-bold tracking-tight">Must be exactly 10 digits.</p>
                )}
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" /> Live Proximity Mapping
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleGetCurrentLocation(true)}
                    disabled={locLoading}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-blue-100"
                  >
                    <Navigation size={12} className={locLoading ? "animate-spin" : ""} />
                    {locLoading ? "Tracking..." : "Refresh Location"}
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our platform parses your explicit coordinate anchor layout map structure automatically to keep P2P tracking transparent.
                </p>

                {latitude && longitude ? (
                  <div className="space-y-4">
                    <div className="w-full h-56 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
                      <iframe
                        title="User Live Verification Coordinates Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                        allowFullScreen
                      ></iframe>
                    </div>
                    {cityLocation && district && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700">
                          Detected: <span className="text-blue-600">{cityLocation}</span>, <span className="text-slate-900">{district}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm">
                          {latitude.toFixed(4)}, {longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center space-y-2">
                    <MapPin size={28} className="mx-auto text-slate-400 animate-bounce" />
                    <p className="text-xs font-bold text-slate-600">Location Access Required</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Please allow browser prompt location coordinates to link physical reach metrics properly.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleGetCurrentLocation(true)}
                      className="mt-2 px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    >
                      Grant Location Access
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-sm rounded-xl shadow-md tracking-tight active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'Updating Identity Profile...' : 'Submit Profile Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}

export default VerificationPage;