import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase.js'; 


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*') 
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        setUser({ ...authUser, ...profile });
      } else {
        setUser(authUser);
      }
    } catch (err) {
      console.error("Error linking auth profile details:", err.message);
      setUser(authUser); 
    } finally {
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      fetchProfile(session?.user || null);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children} 
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth hook was called outside of an <AuthProvider /> wrapper.");
  }
  return context;
};