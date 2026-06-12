import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../api/supabase.js";
import { 
  Send, 
  MessageSquare, 
  Loader2, 
  User, 
  GraduationCap, 
  Paperclip, 
  X, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

function LiveChatModal({ productId, sellerId, buyerId, authenticatedUserId, onClose, viewAsMode = "auto" }) {

  const currentUserId = authenticatedUserId || buyerId || sellerId; 

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [sending, setSending] = useState(false);

  // Attachment states
  const [attachedFile, setAttachedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. Unified channel parsing pipeline
  useEffect(() => {
    if (currentUserId) {
      fetchChatRooms(currentUserId);
    } else {
      setLoadingRooms(false);
    }
  }, [currentUserId, viewAsMode, productId]);

  const fetchChatRooms = async (userId) => {
    try {
      setLoadingRooms(true);

      let query = supabase
        .from("chat_rooms")
        .select(`
          id,
          product_id,
          seller_id,
          buyer_id,
          created_at,
          products (title, price, image_url)
        `);

      if (viewAsMode === "buyer") {
        query = query.eq("buyer_id", userId);
      } else if (viewAsMode === "seller") {
        query = query.eq("seller_id", userId);
      } else {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      const enhancedRooms = await Promise.all(
        (data || []).map(async (room) => {
          const isUserSeller = room.seller_id === userId;
          const targetProfileId = isUserSeller ? room.buyer_id : room.seller_id;
          const roleLabel = isUserSeller ? "Student" : "Tutor";

          try {
            // 💡 UPDATED: Now fetching full expanded dataset details (phone, email, location) directly from profile maps
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, username, avatar_url, phone_number, email, location")
              .eq("id", targetProfileId)
              .single();

            return {
              ...room,
              isUserSeller,
              counterparty_profile: profileData || {
                full_name: `${roleLabel} ${targetProfileId.slice(0, 6)}`,
                username: "user",
                avatar_url: null,
                phone_number: "N/A",
                email: "N/A",
                location: "N/A"
              },
            };
          } catch {
            return {
              ...room,
              isUserSeller,
              counterparty_profile: {
                full_name: `${roleLabel} ${targetProfileId.slice(0, 6)}`,
                username: "user",
                avatar_url: null,
                phone_number: "N/A",
                email: "N/A",
                location: "N/A"
              },
            };
          }
        })
      );

      setRooms(enhancedRooms);

      if (enhancedRooms.length > 0) {
        if (productId) {
          const matchingRoom = enhancedRooms.find(r => r.product_id === productId);
          if (matchingRoom) {
            setActiveRoom(matchingRoom);
          } else {
            setActiveRoom(enhancedRooms[0]);
          }
        } else if (!activeRoom) {
          setActiveRoom(enhancedRooms[0]);
        }
      } else if (productId && sellerId && buyerId && buyerId !== sellerId) {
        createAdHocChatRoomContext();
      }
    } catch (err) {
      console.error("Room population error tracking context:", err);
      toast.error("Failed to map user communication pathways.");
    } finally {
      setLoadingRooms(false);
    }
  };

  const createAdHocChatRoomContext = async () => {
    try {
      const { data: courseData } = await supabase
        .from("products")
        .select("title, price, image_url")
        .eq("id", productId)
        .single();

      // 💡 UPDATED: Fetching complete dynamic communication rows for new adhoc chats
      const { data: tutorProfile } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url, phone_number, email, location")
        .eq("id", sellerId)
        .single();

      const adHocStub = {
        id: "NEW_ROOM_STUB", 
        product_id: productId,
        seller_id: sellerId,
        buyer_id: currentUserId,
        isUserSeller: false,
        products: courseData,
        counterparty_profile: tutorProfile || { 
          full_name: "Educator", 
          username: "tutor", 
          phone: "N/A", 
          email: "N/A", 
          location: "N/A" 
        }
      };

      setActiveRoom(adHocStub);
    } catch (err) {
      console.error("Could not mount visual room generation stub.", err);
    }
  };

  // 2. Message Synchronization Feed Subscription with Frontend 24hr Deletion Filter Logic
  useEffect(() => {
    if (!activeRoom || activeRoom.id === "NEW_ROOM_STUB") {
      setMessages([]);
      return;
    }

    fetchRoomMessages(activeRoom.id);

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${activeRoom.id}`,
        },
        (payload) => {
          // 💡 FIXED/ADDED: Block messages from loading if they've already crossed the 24-hour threshold
          const timeDifference = Date.now() - new Date(payload.new.created_at).getTime();
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
          if (timeDifference > twentyFourHoursInMs) return;

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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchRoomMessages = async (roomId) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      // 💡 ADDED: Frontend Filter layer to strip out old components immediately upon render fetch operations
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      const filteredMessages = data.filter(msg => {
        return (Date.now() - new Date(msg.created_at).getTime()) < twentyFourHoursInMs;
      });
      setMessages(filteredMessages);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File limit boundaries capped at 5MB.");
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const hasText = typedMessage.trim().length > 0;
    if (!activeRoom || !currentUserId || (!hasText && !attachedFile)) return;

    try {
      setSending(true);
      let targetRoomId = activeRoom.id;
      let uploadedImageUrl = null;
      const messagePayloadText = typedMessage.trim();

      if (targetRoomId === "NEW_ROOM_STUB") {
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert([{
            product_id: productId,
            seller_id: sellerId,
            buyer_id: currentUserId
          }])
          .select()
          .single();

        if (roomError) throw roomError;
        targetRoomId = newRoom.id;
      }

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `chat-${targetRoomId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, attachedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        uploadedImageUrl = data.publicUrl;
      }

      const { error: msgError } = await supabase
        .from("chat_messages")
        .insert([{
          room_id: targetRoomId,
          sender_id: currentUserId,
          message_text: messagePayloadText || null,
          image_url: uploadedImageUrl,
        }]);

      if (msgError) throw msgError;

      setTypedMessage("");
      clearAttachedFile();

      if (activeRoom.id === "NEW_ROOM_STUB") {
        await fetchChatRooms(currentUserId);
        const { data: refreshedRooms } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("product_id", productId)
          .eq("buyer_id", currentUserId)
          .single();
        
        if (refreshedRooms) {
          setActiveRoom(prev => ({ ...prev, id: refreshedRooms.id }));
        }
      } else {
        fetchRoomMessages(targetRoomId);
      }

    } catch (err) {
      console.error(err);
      toast.error("Delivery failure mapping transmission packages.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-blue-600/60 backdrop-blur-xs">
      <div className="w-full max-w-5xl bg-white h-full md:h-[85vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* TOP HEADER */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-blue-600 w-5 h-5" />
            <span className="font-black text-gray-800 text-base md:text-lg tracking-tight">
              {viewAsMode === "seller" ? "Inbound Class Enquiries" : "Tuition Conversation Stream"}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* LEFT INBOX SIDEBAR */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-slate-50/40 ${activeRoom ? "hidden md:flex" : "flex"}`}>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingRooms ? (
                <div className="h-40 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : rooms.length === 0 && (!activeRoom || activeRoom.id !== "NEW_ROOM_STUB") ? (
                <div className="p-8 text-center text-gray-400">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                  <p className="text-xs font-bold">No active tuition queries found.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activeRoom && activeRoom.id === "NEW_ROOM_STUB" && (
                    <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs flex items-center gap-3 select-none border border-transparent">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
                        ?
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black truncate">{activeRoom.counterparty_profile?.full_name}</h4>
                        <p className="text-[11px] truncate text-blue-100 flex items-center gap-1 font-medium mt-0.5">
                          <GraduationCap size={12} /> Connecting...
                        </p>
                      </div>
                    </div>
                  )}

                  {rooms.map((room) => {
                    const isSelected = activeRoom?.id === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 select-none ${
                          isSelected 
                            ? "bg-blue-600 text-white shadow-xs" 
                            : "hover:bg-gray-100 bg-white border border-gray-100"
                        }`}
                      >
                        <img
                          src={room.counterparty_profile?.avatar_url || "https://via.placeholder.com/150"}
                          alt="Profile Visual"
                          className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-black/5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                              {room.counterparty_profile?.full_name}
                            </h4>
                            {viewAsMode === "auto" && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                              }`}>
                                {room.isUserSeller ? "Student" : "Educator"}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate flex items-center gap-1 font-medium mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                            <GraduationCap size={12} /> {room.products?.title || "Class Setup Context"}
                          </p>
                        </div>
                        <ChevronRight size={16} className={isSelected ? "text-white" : "text-gray-300"} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CHAT WINDOW */}
          <div className={`flex-1 flex flex-col bg-white ${!activeRoom ? "hidden md:flex items-center justify-center text-gray-400 p-8" : "flex"}`}>
            {activeRoom ? (
              <>
                {/* 💡 UPDATED HEADER PANEL WITH EXPANDED USER DETAILS */}
                <div className="p-4 border-b border-gray-100 bg-white shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveRoom(null)}
                        className="md:hidden font-bold text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded-lg"
                      >
                        &larr; Back
                      </button>
                      <img
                        src={activeRoom.counterparty_profile?.avatar_url || "https://via.placeholder.com/150"}
                        alt="Active Avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/10"
                      />
                      <div>
                        <h4 className="font-black text-sm md:text-base text-gray-900">{activeRoom.counterparty_profile?.full_name}</h4>
                        <p className="text-[11px] font-bold text-blue-600">@{activeRoom.counterparty_profile?.username || "user"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-black border border-amber-200/40">
                      <Clock size={12} className="text-amber-600" /> Ephemeral: 24h Purge Active
                    </div>
                  </div>

                  {/* 💡 SELLER/BUYER DETAILS STRIP (Phone, Location, Email) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-50 text-[11px] font-bold text-gray-600">
                    <a href={`tel:${activeRoom.counterparty_profile?.phone_number}`} className="flex items-center gap-1.5 hover:text-blue-600 transition bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <Phone size={12} className="text-gray-400" /> {activeRoom.counterparty_profile?.phone_number || "No Contact Number"}
                    </a>
                    <a href={`mailto:${activeRoom.counterparty_profile?.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                      <Mail size={12} className="text-gray-400" /> <span className="truncate">{activeRoom.counterparty_profile?.email || "No Email Bound"}</span>
                    </a>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                      <MapPin size={12} className="text-gray-400" /> <span className="truncate">{activeRoom.counterparty_profile?.location || "Nepal"}</span>
                    </div>
                  </div>
                </div>

                {/* MESSAGES FLOW BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs border ${
                          isMe 
                            ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                            : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                        }`}>
                          {msg.image_url && (
                            <img
                              src={msg.image_url}
                              alt="Uploaded delivery attachment"
                              className="rounded-lg max-w-full mb-1.5 border object-cover max-h-48"
                            />
                          )}
                          {msg.message_text && <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>}
                          <span className={`block text-[9px] mt-1 text-right font-medium ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                {imagePreview && (
                  <div className="p-2 px-4 bg-gray-50 border-t flex items-center gap-3">
                    <div className="relative w-14 h-14 border rounded-lg overflow-hidden bg-white shadow-xs">
                      <img src={imagePreview} alt="Upload selection preview" className="w-full h-full object-cover" />
                      <button
                        onClick={clearAttachedFile}
                        className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 truncate">{attachedFile?.name}</p>
                  </div>
                )}

                {/* BOTTOM CHAT ENTRY FORM */}
                <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2 bg-white">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder={activeRoom.isUserSeller ? "Reply to student..." : "Type a message to the educator..."}
                    className="flex-1 bg-gray-100 border text-sm rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!typedMessage.trim() && !attachedFile)}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition cursor-pointer"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-800" />
                <h3 className="font-black text-gray-700 text-sm">No Active Conversation Selected</h3>
                <p className="text-xs text-gray-400 mt-1">Select an active chat log on the left side panel to start messaging.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default LiveChatModal;