import React, { useState } from "react";
import { Helmet } from "react-helmet-async"; 
import HomeLayout from "../Layouts/HomeLayout";
import { AlertCircle, Terminal, CheckCircle2, ShieldCheck, Users, PlusCircle } from "lucide-react";
import SocialMedia from "../components/SocialMedia.jsx";
import Warning from "../components/Warning.jsx";
import { useAuth } from "../context/AuthProvider.jsx"; 
import LocationModal from "../model/LocationModel.jsx"; 
import UserFlowModel from "../model/UserFlowModel.jsx"; 
import MapMark from "../components/MapMark.jsx";
import BecomeATeacherAds from "../Ads/BecomeATeacherAds.jsx";
import HomeTutorModel from "../model/HomeTutorModel.jsx";
import ImportantQuestions from "../components/ImportantQuestions.jsx";
import UserPosts from "../components/UserPosts.jsx";

function HomePage() {
  const { user, loading } = useAuth();
  
  // ✅ 1. Manage Post Requirement Modal state
  const [isFlowOpen, setIsFlowOpen] = useState(false);

  // ✅ 2. Shared posts state moved ABOVE the early return so it always runs in order!
  const [posts, setPosts] = useState([]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // ✅ 3. Early return can safely sit down here now!
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <HomeLayout>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Find Verified Home Tuition Teachers in Nepal | Tol Path</title>
        <meta 
          name="description" 
          content="Connect with the best home tuition teachers across Nepal. Tol Path provides verified, expert tutors for all subjects. Find a tutor near you today for academic success." 
        />
        <meta name="keywords" content="home tuition Nepal, home tutor near me, find teachers Kanchanpur, academic support, verified tutors" />
        <link rel="canonical" href="https://tolpath.com/" />
      </Helmet>

      {user && <BecomeATeacherAds is_verified_seller={user.is_verified_seller} />}
   
      {/* Geolocation check modal on initialization */}
      <LocationModal user={user} />

      {/* CONNECTED USERFLOW MODAL */}
      <UserFlowModel 
        user={user} 
        isOpen={isFlowOpen} 
        onClose={() => setIsFlowOpen(false)} 
        onPostCreated={handlePostCreated} 
      />

      <main className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 space-y-6 md:space-y-10">
        <Warning />
        
        <section className="text-center py-8">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Expert <span className="text-blue-600">Home Tuition</span> in Nepal
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium mb-6">
            Bridging the gap between students and verified academic mentors. Find qualified home tutors near your city for personalized learning and better grades.
          </p>

          {/* CTA Trigger Button */}
          {user && (
            <button
              onClick={() => setIsFlowOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post Your Tuition Requirement
            </button>
          )}
        </section>

        {/* Beautiful Scrollable Feed Panel */}
        <UserPosts user={user} posts={posts} setPosts={setPosts}/>
        
        <HomeTutorModel />
        <MapMark />
        <ImportantQuestions />
        
        <SocialMedia />
      </main>
    </HomeLayout>
  );
}

export default HomePage;