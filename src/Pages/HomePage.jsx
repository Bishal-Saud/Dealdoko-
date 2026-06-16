import React, { useState } from "react";
import { Helmet } from "react-helmet-async"; 
import { Link } from "react-router-dom"; // Make sure Link is imported
import HomeLayout from "../Layouts/HomeLayout";
import { AlertCircle, Terminal, CheckCircle2, ShieldCheck, Users, PlusCircle, Sparkles } from "lucide-react";
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
  const [isFlowOpen, setIsFlowOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <HomeLayout>
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
      
      <LocationModal user={user} />

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

          {/* Action Buttons Container */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user && (
              <button
                onClick={() => setIsFlowOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your Tuition Requirement
              </button>
            )}

            
            <Link
              to="/success-reports"
              className="block md:hidden w-full inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold px-5 py-2.5 rounded-lg transition-all shadow-xs text-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              View Success Board
            </Link>
          </div>
        </section>

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