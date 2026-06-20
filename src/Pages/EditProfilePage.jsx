import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabase.js";
import toast, { Toaster } from "react-hot-toast";
import { User, Mail, Smartphone, Upload, Loader2 } from "lucide-react";
import HomeLayout from "../Layouts/HomeLayout.jsx";

function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Profile Form States
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(""); 
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // File Upload States
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // 1. Fetch current authenticated user session and their profile record
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const user = session.user;
          setUserId(user.id);
          setEmail(user.email || "");

          // Fetch matching row from your profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, username, phone_number, avatar_url")
            .eq("id", user.id)
            .single();

          // Handle case where profile row might not exist yet for a new OAuth user
          if (profileError && profileError.code !== "PGRST116") {
            throw profileError;
          }

          if (profile) {
            setFullName(profile.full_name || "");
            setUsername(profile.username || "");
            
            // Sanitize initial values coming from database just in case old formats exist
            const sanitizedPhone = (profile.phone_number || "").replace(/\D/g, "");
            setPhoneNumber(sanitizedPhone);
            
            setAvatarUrl(profile.avatar_url || "");
            setAvatarPreview(profile.avatar_url || null);
          }
        } else {
          toast.error("Please log in to access settings.");
        }
      } catch (error) {
        console.error("Error loading profile settings:", error.message);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Handle file selection for the avatar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size must be less than 2MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 3. Upload avatar image directly to Supabase storage bucket
  const uploadAvatarImage = async (uid, file) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uid}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload avatar exception:", error.message);
      return null;
    }
  };

  // 4. Submit form updates back to profiles table
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setUpdating(true);
      let finalAvatarUrl = avatarUrl;

      // Sanitize username input fields
      const cleanedUsername = username
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

      if (avatarFile) {
        const uploadedUrl = await uploadAvatarImage(userId, avatarFile);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
          setAvatarUrl(uploadedUrl);
        } else {
          throw new Error("Failed uploading your profile photo to bucket storage.");
        }
      }

      // Upsert profile data object mapping (phoneNumber is already pure digits)
      const updates = {
        id: userId,
        full_name: fullName.trim(),
        username: cleanedUsername,
        phone_number: phoneNumber, 
        avatar_url: finalAvatarUrl,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;

      // Sync data back up cleanly to Auth Metadata context too 
      await supabase.auth.updateUser({
        data: { 
          full_name: fullName.trim(),
          username: cleanedUsername,
          avatar_url: finalAvatarUrl
        }
      });

      toast.success("Profile updated successfully!");
      setAvatarFile(null); 
    } catch (error) {
      toast.error(error.message || "An error occurred while updating your profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading settings configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <Toaster />
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Settings Branding Bar */}
          <div className="p-6 md:p-8 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your public profile identity, contact values, and avatars.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-6">
            
            {/* AVATAR PICTURE ROW DESIGN */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative group">
                <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-gray-200 shadow-xs overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition active:scale-95">
                  <Upload size={14} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-sm font-bold text-gray-800">Profile Photo</h3>
                <p className="text-xs text-gray-400">Accepts PNG, JPEG or WebP formats. Max capacity size threshold capped at 2MB.</p>
                {avatarFile && (
                  <span className="inline-block text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                    New picture selected
                  </span>
                )}
              </div>
            </div>

            {/* DATA INPUT GRIDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* FULL NAME INPUT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* UNIQUE USERNAME INPUT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-bold text-blue-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="username123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none font-mono text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS LAYER */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Email Address <span className="text-[10px] lowercase text-gray-400 font-normal">(Managed by Google)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-sm select-none outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* PHONE NUMBER VALUE BOX (RESTRICTED TO DIGITS ONLY) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Smartphone size={16} />
                  </span>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={phoneNumber}
                    // Real-time sanitation blocks characters like +, space, and country codes
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

            </div>

            {/* SUBMISSION FOOTER REGION */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Updates...</span>
                  </>
                ) : (
                  <span>Save Modifications</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </HomeLayout>
  );
}

export default EditProfilePage;