import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HomeLayout from '../Layouts/HomeLayout';
import { useAuth } from "../context/AuthProvider.jsx"; 
import { supabase } from '../api/supabase.js'; 
import { LogIn, X, Search, MapPin, Loader2 } from "lucide-react";

function HomeTuitionJobs() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // Helper handling logic to clean up addresses and extract district/city names
  const getCleanedLocation = (fullAddress) => {
    if (!fullAddress) return ''; // Default to empty string if nothing provided

    const segments = fullAddress.split(',').map(s => s.trim());
    const districtSegment = segments.find(s => s.toLowerCase().includes('district'));
    
    if (districtSegment) {
      return districtSegment.replace(/\bdistrict\b/gi, '').trim(); 
    }
    if (segments.length >= 3) {
      return segments[2]; 
    }
    return segments[0]; 
  };

  // Location Fallback Strategy: Extracts cleaned district name or defaults to empty string ''
  const rawLocation = locationName || user?.location_name || '';
  const initialSearchLocation = getCleanedLocation(rawLocation);
  
  // Format the location for headers; if empty, use 'Nepal' or 'All' as a backup context string
  const formattedLocation = initialSearchLocation 
    ? initialSearchLocation.charAt(0).toUpperCase() + initialSearchLocation.slice(1) 
    : 'Kathmandu'; // Fallback for UI visualization blocks if empty
  
  // Dynamic Application State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Search Form Controls
  const [searchSubject, setSearchSubject] = useState('');
  const [searchLocation, setSearchLocation] = useState(initialSearchLocation);
  const [searchClass, setSearchClass] = useState('Select Class');
  const [searchSalary, setSearchSalary] = useState('Any Salary');

  useEffect(() => {
    if (locationName) {
      setSearchLocation(getCleanedLocation(locationName));
    }
  }, [locationName]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchLocation, locationName]);

  // Unified dynamic database fetch
  const fetchTuitionJobs = useCallback(async (locationTerm) => {
    setLoading(true);
    try {
      let query = supabase.from('tuition_requirements').select('*');

      // 1. Unstructured string location matching logic
      if (locationTerm && locationTerm !== 'Select Class' && locationTerm !== 'Any Salary') {
        const cleanTerm = locationTerm.trim();
        query = query.or(`location_name.ilike.%${cleanTerm}%,landmark_description.ilike.%${cleanTerm}%`);
      }

      // 2. Client Side Form Filtering - Subject
      if (searchSubject.trim()) {
        query = query.ilike('subject', `%${searchSubject.trim()}%`);
      }

      // 3. Client Side Form Filtering - Class Level Mapping
      if (searchClass !== 'Select Class') {
        query = query.eq('class_level', searchClass);
      }

      // 4. Client Side Form Filtering - Budget Range Mapping
      if (searchSalary !== 'Any Salary') {
        if (searchSalary === 'Below Rs. 5,000') {
          query = query.lt('budget_per_month', 5000);
        } else if (searchSalary === 'Rs. 5,000 - 10,000') {
          query = query.gte('budget_per_month', 5000).lte('budget_per_month', 10000);
        } else if (searchSalary === 'Rs. 10,000 - 15,000') {
          query = query.gte('budget_per_month', 10001).lte('budget_per_month', 15000);
        } else if (searchSalary === 'Above Rs. 15,000') {
          query = query.gt('budget_per_month', 15000);
        }
      }

      // Order by newest posts first
      const { data, error } = await query.order('id', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Error retrieving tuition requirements data:", err.message);
    } finally {
      setLoading(false);
    }
  }, [searchSubject, searchClass, searchSalary]);

  // Runs fetch when initial context fields OR search changes
  useEffect(() => {
    fetchTuitionJobs(searchLocation);
  }, [searchLocation, initialSearchLocation, user?.location_name, fetchTuitionJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/hometuitionjobs/${encodeURIComponent(searchLocation.trim().toLowerCase())}`);
    fetchTuitionJobs(searchLocation);
  };

  // Helper handling logic for local footer links or quick filtering buttons
  const handleAreaSelect = (area) => {
    const cleanedArea = getCleanedLocation(area);
    setSearchLocation(cleanedArea);
    navigate(`/hometuitionjobs/${encodeURIComponent(cleanedArea.trim().toLowerCase())}`);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleApplyNow = async (postedByUserId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!postedByUserId) {
      console.error("No user ID associated with this tuition post.");
      return;
    }

    try {
      setLoading(true); 
      
      // FETCH THE CLICKING USER'S PROFILE (the logged-in user)
      const { data: currentUserProfile, error } = await supabase
        .from('profiles')
        .select('is_verified_seller')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (currentUserProfile?.is_verified_seller === true) {
        navigate(`/profile/${postedByUserId}`); 
      } else {
        navigate('/role');
      }
    } catch (err) {
      console.error("Error evaluating viewer validation flags:", err.message);
      navigate('/role');
    } finally {
      setLoading(false);
    }
  };

  const handleModalLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/role`, 
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Supabase OAuth initialization failed:", error.message);
    }
  };

  // Dynamically generated schema meta configurations
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": `Home Tuition Jobs in ${formattedLocation}`,
    "description": `Find the latest home tuition jobs in ${formattedLocation}. Direct parent contact, zero commission.`,
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": formattedLocation,
        "addressCountry": "NP"
      }
    }
  };

  const uiDisplayLocation = searchLocation || formattedLocation;

  return (
    <HomeLayout>
      <div className="bg-gray-50 text-gray-800 mb-10 relative">
        <Helmet>
          <title>{`Home Tuition Jobs in ${uiDisplayLocation} | TolPath`}</title>
          <meta name="description" content={`Looking for home tuition jobs in ${uiDisplayLocation}? Find high-paying tuition vacancies near you. Connect directly with parents.`} />
          <link rel="canonical" href={`https://tolpath.com/hometuitionjobs/${initialSearchLocation.toLowerCase()}`} />
          <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
        </Helmet>

        {/* 1. HEADER HERO */}
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 text-center">
          <h1 className="text-4xl font-extrabold mb-4">
            Home Tuition Jobs in {uiDisplayLocation}
          </h1>
          <p className="text-xl text-blue-100">
            Find the latest home tuition jobs in {uiDisplayLocation}. Earn on your own terms.
          </p>
        </header>

        {/* 2. LIVE FILTER FORM DESK BAR */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" onSubmit={handleSearchSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  placeholder="e.g., Math, Physics" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Location</label>
                <input 
                  type="text" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g., Lalitpur, Pokhara" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Class</label>
                <select 
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-600"
                >
                  <option>Select Class</option>
                  <option value="Class 1-5">Class 1-5</option>
                  <option value="Class 6-8">Class 6-8</option>
                  <option value="Class 9-10 (SEE)">Class 9-10 (SEE)</option>
                  <option value="Class 11-12 (+2)">Class 11-12 (+2)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Salary Range</label>
                <select 
                  value={searchSalary}
                  onChange={(e) => setSearchSalary(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-600"
                >
                  <option>Any Salary</option>
                  <option>Below Rs. 5,000</option>
                  <option>Rs. 5,000 - 10,000</option>
                  <option>Rs. 10,000 - 15,000</option>
                  <option>Above Rs. 15,000</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition duration-200 inline-flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Search Jobs
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 3. DYNAMIC DATABASE JOBS GRID */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Latest Tuition Jobs in {uiDisplayLocation}</h2>
          <p className="text-center text-gray-600 mb-10">Fresh listings updated daily. Direct contact with parents.</p>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500 font-medium">Scanning local neighborhoods for matching opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center bg-white border border-gray-200 rounded-2xl p-12 max-w-xl mx-auto shadow-sm">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Jobs Found in This Region</h3>
              <p className="text-sm text-gray-500 mb-6">
                We couldn't find matches matching your current preferences or parameters in your selected criteria. Try adjusting the search radius or look into adjacent sectors.
              </p>
              <button 
                onClick={() => handleAreaSelect('')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear Filters & View All Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{job.subject}</h3>
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{job.class_level}</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <p className="flex items-start">
                        <span>📍</span>
                        <span className="line-clamp-2" title={job.location_name}>
                          {job.landmark_description ? `${job.landmark_description}, ` : ''}{job.location_name}
                        </span>
                      </p>
                      <p className="flex items-center font-semibold text-green-600">
                        <span className="mr-2">💰</span>Rs. {job.budget_per_month.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApplyNow(job.user_id)} 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-lg transition duration-150 text-center"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="border-gray-200 max-w-6xl mx-auto" />

        {/* 4. POPULAR SUBJECTS */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Popular Subjects for Home Tuition</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {['Math', 'Science', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer', 'IELTS'].map((subject) => (
              <button 
                key={subject} 
                onClick={() => { setSearchSubject(subject); fetchTuitionJobs(searchLocation); }}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center font-medium hover:border-blue-500 hover:text-blue-600 shadow-sm transition duration-150 cursor-pointer"
              >
                {subject}
              </button>
            ))}
          </div>
        </section>

        {/* 5. VALUE PROPOSITION */}
        <section className="bg-gray-100 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose TolPath?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'No Registration Fee', desc: 'Start applying right away without paying any entry fee.', icon: '🎉' },
                { title: 'No Commission', desc: 'Keep 100% of your earnings. We do not extract hidden cuts from your hard work.', icon: '💸' },
                { title: 'Verified Parents', desc: 'Safety first. We screen profiles to provide reliable and safe working conditions.', icon: '🛡️' },
                { title: 'Tuition Near Your Area', desc: 'Minimize travel time. Find local jobs specific to your current location.', icon: '📍' },
                { title: 'Free Profile', desc: 'Build your stunning tutoring resume and get noticed by parents easily.', icon: '📝' },
                { title: 'Fast Matching', desc: 'Get connected with parents requiring your skillset within 24 to 48 hours.', icon: '⚡' },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. LOCAL SALARY ESTIMATES */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{formattedLocation} Tuition Salary Guide</h2>
          <p className="text-center text-gray-600 mb-8">Estimated market standard rates based on teacher qualifications and class level.</p>
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Level</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Average Monthly Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Class 1–5</td>
                  <td className="px-6 py-4 text-gray-600">Rs. 5,000 – 8,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Class 6–8</td>
                  <td className="px-6 py-4 text-gray-600">Rs. 7,000 – 10,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">SEE (Class 9-10)</td>
                  <td className="px-6 py-4 text-gray-600">Rs. 10,000 – 15,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">+2 (Class 11-12)</td>
                  <td className="px-6 py-4 text-gray-600">Rs. 12,000 – 20,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. INTERNAL LINKING MAPS */}
        <section className="bg-gray-50 py-16 border-t border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Find Tuition Jobs by Local Areas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Baneshwor', 'Koteshwor', 'Kalanki', 'Lalitpur'].map((area) => (
                <button 
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className="text-blue-600 hover:underline text-left text-sm font-medium"
                >
                  Tuition Jobs in {area}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Success Stories</h2>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-yellow-400 text-xl mb-4">★★★★★</div>
            <p className="text-lg italic text-gray-700 mb-4">"I found my first tuition job within one week. The parent contact was direct, and everything went incredibly smoothly."</p>
            <p className="text-sm font-bold text-gray-900">— Ramesh, Home Tutor</p>
          </div>
        </section>

        {/* 9. ACCORDION FAQS */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How do I apply?", a: "Simply browse through our active tuition listings, select a job matching your criteria, and click 'Apply Now' to directly view client preferences." },
              { q: "Is TolPath free?", a: "Yes, creating a tutor profile and checking local jobs on TolPath is completely free." },
              { q: "Do parents pay commission?", a: "Neither tutors nor parents pay commissions on jobs closed through our normal matching processes." },
              { q: "How can I become verified?", a: "You can become verified by uploading a copy of your Citizenship/National ID card and your highest academic transcripts onto your portal profile." },
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggleFaq(index)} className="w-full text-left px-6 py-4 font-medium text-gray-900 flex justify-between items-center focus:outline-none hover:bg-gray-50">
                  <span>{faq.q}</span>
                  <span>{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MODERN LOGIN MODAL */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mt-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Please log in with your account to view complete home tuition files and connect with parents directly.
                </p>
                
                <button
                  onClick={handleModalLogin}
                  className="w-full inline-flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-xs transition duration-150 text-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}

export default HomeTuitionJobs;