import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase.js'; 
import { ShieldCheck, Upload, MapPin, Phone, FileText, CheckCircle2, Clock, Map, UserCheck, Navigation, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function VerificationPage() {
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState('unverified'); // unverified, pending, verified, rejected
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  
  // F2F Physical Accountability States
  const [district, setDistrict] = useState('');
  const [cityLocation, setCityLocation] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  
  // Geolocation Tracking States
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

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
      .select('verification_status, phone_number, location, citizenship_number, latitude, longitude')
      .eq('id', userId)
      .single();

    if (data) {
      setKycStatus(data.verification_status || 'unverified');
      if (data.phone_number) setPhoneNumber(data.phone_number);
      if (data.citizenship_number) setCitizenshipNumber(data.citizenship_number);
      if (data.latitude) setLatitude(data.latitude);
      if (data.longitude) setLongitude(data.longitude);
      if (data.location) {
        const parts = data.location.split(',');
        if (parts.length >= 2) {
          setCityLocation(parts[0].trim());
          setDistrict(parts[1].trim());
        }
      }
    }
  };

  // Automatically fetch coordinates on component mount if user is unverified or rejected
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
            
            setCityLocation(detectedCity);
            setDistrict(detectedDistrict.replace('District', '').trim());
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('File size exceeds 5MB limit.');
      }
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in first.');
    if (!idFile) return toast.error('Please upload a clear National ID or Citizenship Card image.');
    if (!latitude || !longitude) return toast.error('Please unlock your live physical coordinates map pin before submitting.');

    setSubmitting(true);
    try {
      const fileExt = idFile.name.split('.').pop();
      const filePath = `${user.id}/national_id_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, idFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath);

      const publicDocUrl = urlData.publicUrl;
      const fullLocationString = cityLocation && district ? `${cityLocation}, ${district}` : "Verified Physical Location";

      // Re-submitting updates state back to 'pending' for review
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          phone_number: phoneNumber,
          id_document_url: publicDocUrl,
          location: fullLocationString,
          citizenship_number: citizenshipNumber,
          latitude: latitude,   
          longitude: longitude, 
          verification_status: 'pending' 
        });

      if (profileError) throw profileError;

      setKycStatus('pending');
      toast.success('Re-application submitted! Owner verification review in progress.', { duration: 5000 });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Submission error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <Toaster />
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Top Branding Banner Header */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md text-blue-400">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">F2F Trader Verification</h2>
              <p className="text-xs text-slate-300">Verify identity parameters to trade safely in person</p>
            </div>
          </div>
          
          {/* Marketplace Status Badge Display */}
          <div>
            {kycStatus === 'unverified' && <span className="bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-600">Unverified</span>}
            {kycStatus === 'rejected' && <span className="bg-rose-500/20 text-rose-500 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-500/30 flex items-center gap-1">Rejected</span>}
            {kycStatus === 'pending' && <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1"><Clock size={14}/> Awaiting Review</span>}
            {kycStatus === 'verified' && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle2 size={14}/> Verified User</span>}
          </div>
        </div>

        {/* CONDITION STATE PANEL RENDERS */}
        {kycStatus === 'pending' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Application Pending Admin Action</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The database owner is currently inspecting your citizenship metrics, registered location fields, and document scan layout. Your visibility profile updates as soon as checking resolves.
            </p>
          </div>
        )}

        {kycStatus === 'verified' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Verified Marketplace Integrity</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Account status successfully cleared. You are verified as an authentic peer-to-peer operator. Buyers and sellers can securely execute face-to-face handovers with confidence.
            </p>
          </div>
        )}

        {/* SHOW FORM IF UNVERIFIED OR REJECTED */}
        {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
          <form onSubmit={handleSubmitVerification} className="p-6 md:p-8 space-y-6">
            
            {/* Direct Rejection Warning Message Box */}
            {kycStatus === 'rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-headShake">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-rose-950 uppercase tracking-wide">Verification Declined</h5>
                  <p className="text-xs text-rose-700/90 mt-0.5 leading-relaxed">
                    Your previous submission did not match our peer validation standards (e.g., blurry image, invalid registration info, or incorrect map tracking location). Please double-check your metrics below, apply updates, and re-submit.
                  </p>
                </div>
              </div>
            )}
            
            {/* Field Section 1: Contact validation */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2"><Phone size={16} className="text-blue-500" /> Phone Contact Number</h4>
              <input 
                type="tel" 
                required
                placeholder="e.g., 98XXXXXXXX" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Field Section 2: Citizenship Number Setup */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Government Registration ID</h4>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Citizenship or National ID Number</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 12-34-56-7890" 
                  value={citizenshipNumber}
                  onChange={(e) => setCitizenshipNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Field Section 3: Physical Geographic Locations Mapping */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" /> Live Trading Proximity
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
                Our marketplace requires your device physical map pointer coordinates. This protects our trading pool by calculating whether localized buyers are within physical reach for close proximity handovers.
              </p>

              {/* LIVE GOOGLE MAP IFRAME CONTAINER */}
              {latitude && longitude ? (
                <div className="space-y-2">
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
                    Please allow browser prompt location coordinates to automatically draw your safe-zone proximity market boundary.
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

            {/* Field Section 4: File Upload Elements */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2"><Map size={16} className="text-blue-500" /> Identity Document Front Image</h4>
              <p className="text-xs text-slate-400">Upload a crisp image of your Nepali Citizenship document or National Identity Card structure.</p>
              
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 p-6 rounded-2xl cursor-pointer transition group">
                {idPreview ? (
                  <div className="relative max-h-48 overflow-hidden rounded-xl">
                    <img src={idPreview} alt="ID preview" className="object-contain h-40" />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">Change File</div>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="text-slate-400 group-hover:text-blue-500 mb-2 transition" />
                    <span className="text-xs font-bold text-slate-600">Click to upload Document Front</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Submit Action Block */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-sm rounded-xl shadow-md tracking-tight active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Uploading Document Metrics...' : 'Re-submit Verification Metrics'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default VerificationPage;