import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../api/supabase.js";
import { useNavigate } from "react-router-dom"; 
import { Send, MessageSquare, Loader2, User, GraduationCap, Paperclip, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function BuyerChat() {
  const navigate = useNavigate(); 
  const [seller, setSeller] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [sending, setSending] = useState(false);
  
  // States for Attachment Upload Workflow
  const [attachedFile, setAttachedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. Get authenticated educator session info
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSeller(user);
        fetchActiveChatRooms(user.id);
      }
    });
  }, []);

  // 2. Query active communication rooms and parse profile metadata maps
  const fetchActiveChatRooms = async (sellerId) => {
    try {
      setLoadingRooms(true);
      
      // Select chat rooms while safely resolving courses / products metadata definitions
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`
          id,
          product_id,
          buyer_id,
          created_at,
          products (title, price, image_url)
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map through active rooms and pull student information from profiles table
      const enhancedRooms = await Promise.all((data || []).map(async (room) => {
        try {
          const { data: profileData } = await supabase
            .from("profiles") 
            .select("full_name, username, avatar_url")
            .eq("id", room.buyer_id)
            .single();

          return {
            ...room,
            buyer_profile: profileData || {
              full_name: `Student ${room.buyer_id.slice(0, 6)}`,
              username: "student",
              avatar_url: null
            }
          };
        } catch {
          return {
            ...room,
            buyer_profile: { 
              full_name: `Student ${room.buyer_id.slice(0, 6)}`, 
              username: "student", 
              avatar_url: null 
            }
          };
        }
      }));

      setRooms(enhancedRooms);
    } catch (err) {
      console.error("Inbox query failure:", err.message);
      toast.error("Failed to query active communications desk.");
    } finally {
      setLoadingRooms(false);
    }
  };

  // 3. Track real-time message stream changes
  useEffect(() => {
    if (!activeRoom) return;

    fetchRoomMessages(activeRoom.id);

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${activeRoom.id}`
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom]);

  // 4. Auto scroll window alignment helper
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRoomMessages = async (roomId) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!error && data) setMessages(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB allocations.");
        return;
      }
      setAttachedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 5. Send Message Stream Package
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const hasText = typedMessage.trim().length > 0;
    if (!activeRoom || !seller || (!hasText && !attachedFile)) return;

    try {
      setSending(true);
      let uploadedImageUrl = null;
      const messagePayloadText = typedMessage.trim();

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `chat-${activeRoom.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("products") // Keeps storage bucket reference consistent
          .upload(fileName, attachedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        uploadedImageUrl = data.publicUrl;
      }

      setTypedMessage("");
      clearAttachedFile();

      const { error } = await supabase
        .from("chat_messages")
        .insert([{
          room_id: activeRoom.id,
          sender_id: seller.id,
          message_text: messagePayloadText || null,
          image_url: uploadedImageUrl
        }]);

      if (error) throw error;
    } catch (err) {
      toast.error("Failed to dispatch course conversation message.");
    } finally {
      setSending(false);
    }
  };

  // Redirect handling router view snapshots
  const viewBuyerProfile = (buyerId) => {
    if (!buyerId) return;
    toast.loading("Navigating to student profile layout...");
    setTimeout(() => {
      toast.dismiss();
      navigate(`/profile/${buyerId}`); 
    }, 400);
  };

  if (loadingRooms) {
    return (
      <div className="h-[75vh] flex justify-center items-center bg-white rounded-3xl border border-gray-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col md:flex-row h-[78vh]">
      
      {/* LEFT COLUMN SIDEBAR: INBOX ROOM FEED LIST */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600" /> Student Inquiry Inbox
          </h3>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Active registration leads</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {rooms.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-xs font-bold text-gray-400">No active student inquiries available.</p>
            </div>
          ) : (
            rooms.map((room) => {
              const courseMeta = room.products || {};
              const isSelected = activeRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setActiveRoom(room);
                    clearAttachedFile();
                  }}
                  className={`w-full text-left p-3 rounded-xl transition flex gap-3 items-center cursor-pointer border ${
                    isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs" 
                      : "bg-white border-gray-100 hover:bg-gray-100 text-slate-800"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
                    {courseMeta.image_url ? (
                      <img src={courseMeta.image_url} alt="course thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <GraduationCap size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {courseMeta.title || "Untitled Course Setup"}
                    </h4>
                    <p className={`text-[10px] font-semibold truncate ${isSelected ? "text-blue-100" : "text-gray-400"} mt-0.5`}>
                      From: {room.buyer_profile?.full_name}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN PANEL: CHAT WINDOW AND BUYER CARD CONTAINER */}
      <div className="flex-1 flex flex-col bg-white h-full min-w-0">
        {activeRoom ? (
          <>
            {/* INTERACTIVE HEADER ROW FRAME */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/40">
              
              <div 
                onClick={() => viewBuyerProfile(activeRoom.buyer_id)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-white p-1.5 pr-4 rounded-2xl transition border border-transparent hover:border-gray-100"
                title="Explore student profile portfolio records"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center overflow-hidden border border-blue-100 shrink-0">
                  {activeRoom.buyer_profile?.avatar_url ? (
                    <img src={activeRoom.buyer_profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1 group-hover:text-blue-600 transition">
                    {activeRoom.buyer_profile?.full_name} 
                    <ExternalLink size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 lowercase tracking-tight">
                    @{activeRoom.buyer_profile?.username || 'student'}
                  </div>
                </div>
              </div>

              {/* Course Context Information Pin */}
              <div className="hidden sm:block text-right bg-white border border-gray-100 px-3 py-1.5 rounded-xl">
                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Class Context</span>
                <span className="text-[11px] font-black text-slate-800 truncate max-w-[140px] block">
                  {activeRoom.products?.title}
                </span>
              </div>
            </div>

            {/* Message Stream Bubble Container Display */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
              {messages.map((msg) => {
                const isMerchantSender = msg.sender_id === seller.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isMerchantSender ? "items-end" : "items-start"}`}
                  >
                    <div className={`max-w-[70%] p-1.5 rounded-2xl text-xs font-medium shadow-2xs flex flex-col gap-1.5 ${
                      isMerchantSender 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-white border border-gray-100 text-slate-800 rounded-bl-none"
                    }`}>
                      {msg.image_url && (
                        <div className="rounded-xl overflow-hidden max-h-60 max-w-full bg-slate-100 border border-black/5">
                          <img 
                            src={msg.image_url} 
                            alt="Attachment reference" 
                            className="w-full h-full object-contain max-h-56 cursor-zoom-in"
                            onClick={() => window.open(msg.image_url, "_blank")}
                          />
                        </div>
                      )}
                      {msg.message_text && (
                        <p className="px-2 py-1 leading-relaxed">{msg.message_text}</p>
                      )}
                    </div>
                    <span className="text-[8px] text-gray-400 mt-1 font-semibold px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Media Upload Attachment Preview Bar */}
            {imagePreview && (
              <div className="px-4 py-2 border-t border-gray-100 bg-slate-50 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                  <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={clearAttachedFile}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{attachedFile?.name}</p>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase">Ready to transmit image payload</p>
                </div>
              </div>
            )}

            {/* Form Input Interface Control Layout */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <button
                type="button"
                disabled={sending}
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
                  attachedFile 
                    ? "bg-amber-50 text-amber-600 border-amber-200" 
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Paperclip size={14} />
              </button>

              <input
                type="text"
                placeholder={attachedFile ? "Add a caption note description..." : "Type your reply response here..."}
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-gray-50 text-xs px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-blue-500 transition"
              />
              
              <button
                type="submit"
                disabled={sending || (!typedMessage.trim() && !attachedFile)}
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 rounded-xl transition cursor-pointer shrink-0"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-gray-50/20">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-xs font-black text-slate-800">No Convergent Active Room Loaded</h3>
            <p className="text-[11px] font-semibold text-gray-400 max-w-xs mt-1">
              Select an ongoing student text channel pipeline from the left catalog folder row to respond to questions instantly.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default BuyerChat;