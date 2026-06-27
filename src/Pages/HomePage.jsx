import React, { useState } from "react"; 
import { Link } from "react-router-dom"; 
import HomeLayout from "../Layouts/HomeLayout";
import { AlertCircle, Terminal, CheckCircle2, ShieldCheck, Users, PlusCircle, Sparkles, Briefcase } from "lucide-react"; // Added Briefcase icon
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
import { Helmet } from "react-helmet-async";

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
        <title>
          Find Home Tuition Teachers Near You in Nepal | Home Tutors | TolPath
        </title>
        <meta
          name="description"
          content="Find trusted home tuition teachers near you in Nepal. Browse qualified tutors for Math, Science, English, Computer, and more. Connect with verified home tutors on TolPath."
        />
        <meta
          name="keywords"
          content="home tuition near me, home tutor near me, tuition teacher near me, private tutor Nepal, home tuition Nepal, math tutor, science tutor, English tutor, tuition jobs Nepal, TolPath"
        />
        <meta property="og:title" content="Find Home Tuition Teachers Near You in Nepal | TolPath" />
        <meta
          property="og:description"
          content="Discover qualified home tutors near you. Find teachers for school subjects, exam preparation, and personalized learning across Nepal."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TolPath" />
        <link rel="canonical" href="https://www.tolpath.com/" />
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
        
        <section className="text-center py-8">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Expert <span className="text-blue-600">Home Tuition</span> in Nepal
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium mb-6">
            Bridging the gap between students and verified academic mentors. Find qualified home tutors near your city for personalized learning and better grades.
          </p>

          {/* Action Buttons Container */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row max-w-2xl mx-auto">
            {user && (
              <button
                onClick={() => setIsFlowOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your Tuition Requirement
              </button>
            )}

            {/* ATTRACTIVE TEACHER JOB PORTAL BUTTON */}
            <Link
              to="/hometuitionjobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95 text-sm ring-4 ring-orange-500/10 whitespace-nowrap"
            >
              <Briefcase className="w-4 h-4 text-orange-100 animate-pulse" />
              Search Tuition Jobs
            </Link>

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
        <Warning />
        <SocialMedia />
      </main>
    </HomeLayout>
  );
}

export default HomePage;