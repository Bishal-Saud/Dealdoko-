import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../api/supabase.js';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, requireVerifiedSeller }) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        // 1. Grab the secure authenticated user session from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        // 2. Query your 'profiles' table to check the verification column
        if (requireVerifiedSeller) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_verified_seller')
            .eq('id', user.id) // Assuming your profiles table uses the auth user ID as the key
            .single();

          if (profileError || !profile) {
            setIsVerifiedSeller(false);
          } else {
            // Set true or false based exactly on your database row value
            setIsVerifiedSeller(profile.is_verified_seller === true);
          }
        } else {
          // If this specific route doesn't require a verified seller, pass them through
          setIsVerifiedSeller(true);
        }

      } catch (err) {
        console.error("Verification guard database query error:", err);
        setIsVerifiedSeller(false);
      } finally {
        setSessionChecked(true);
      }
    };

    checkVerificationStatus();
  }, [requireVerifiedSeller]);

  // Show a loading spinner while checking security credentials
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Not logged in? Boot them out to the homepage
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Logged in, but the database shows they are not a verified seller? Redirect them
  if (requireVerifiedSeller && !isVerifiedSeller) {
    return <Navigate to="/" replace />;
  }

  // Approved! Render the merchant workspaces
  return children;
}

export default ProtectedRoute;