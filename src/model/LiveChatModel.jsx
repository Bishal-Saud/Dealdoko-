import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../api/supabase.js";
import { 
  Send, 
  MessageSquare, 
  Loader2, 
  GraduationCap, 
  Paperclip, 
  X, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";

// 🌟 ADDED 'contextMode' prop ("product" or "tuition") to know which table to query
function LiveChatModal({ productId, sellerId, buyerId, authenticatedUserId, onClose, viewAsMode = "auto", contextMode = "product" }) {

  const currentUserId = authenticatedUserId || buyerId || sellerId; 

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [sending, setSending] = useState(false);

  const [attachedFile, setAttachedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (currentUserId) {
      fetchChatRooms(currentUserId);
    } else {
      setLoadingRooms(false);
    }
  }, [currentUserId, viewAsMode, productId, contextMode]);

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
        created_at
      `);

    if (viewAsMode === "buyer") {
      query = query.eq("buyer_id", userId);
    } else if (viewAsMode === "seller") {
      query = query.eq("seller_id", userId);
    } else {
      query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    }

    const { data: roomsData, error: roomsError } = await query.order("created_at", { ascending: false });
    if (roomsError) throw roomsError;

    const enhancedRooms = await Promise.all(
      (roomsData || []).map(async (room) => {
        const isUserSeller = room.seller_id === userId;
        const targetProfileId = isUserSeller ? room.buyer_id : room.seller_id;
        let itemContext = null;

       
        if (room.product_id) {
          // 1. Try fetching from tuition_requirements first
         const { data: tuitionData } = await supabase
  .from("tuition_requirements")
  .select("subject, budget_per_month")
  .eq("id", room.product_id)
  .maybeSingle();

if (tuitionData) {
  itemContext = {
    title: tuitionData.subject,
    budget: tuitionData.budget_per_month,
    isTuition: true
  };
}else {
            // 2. Fallback to checking the products table
            const { data: productData } = await supabase
              .from("products")
              .select("title, price, image_url")
              .eq("id", room.product_id)
              .maybeSingle();

            if (productData) {
              itemContext = {
                title: productData.title,
                budget: productData.price,
                image_url: productData.image_url,
                isTuition: false
              };
            }
          }
        }

        
        let profileDetails = { full_name: "User Context", username: "user" };
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, username, avatar_url, phone_number, email, location_name")
            .eq("id", targetProfileId)
            .single();
          if (profileData) profileDetails = profileData;
        } catch (e) {
          console.warn("Profile fetching fallback activated.");
        }

        return {
          ...room,
          isUserSeller,
          derivedContext: itemContext, 
          counterparty_profile: profileDetails
        };
      })
    );

    setRooms(enhancedRooms);

    if (productId) {
      const matchingRoom = enhancedRooms.find(r => r.product_id === productId);
      if (matchingRoom) {
        setActiveRoom(matchingRoom);
      } else if (sellerId && buyerId && buyerId !== sellerId) {
        createAdHocChatRoomContext();
      } else if (enhancedRooms.length > 0) {
        setActiveRoom(enhancedRooms[0]);
      }
    } else if (enhancedRooms.length > 0 && !activeRoom) {
      setActiveRoom(enhancedRooms[0]);
    }

  } catch (err) {
    console.error("Room population error:", err);
    toast.error("Failed to map user channels.");
  } finally {
    setLoadingRooms(false);
  }
};

const createAdHocChatRoomContext = async () => {
 
  if (!productId) return;

  try {
    let contextData = null;

  if (contextMode === "tuition") {
  const { data } = await supabase
    .from("tuition_requirements")
    .select("subject, budget_per_month") 
    .eq("id", productId)
    .maybeSingle();
  
  if (data) {
    contextData = { 
      title: data.subject,
      price: data.budget_per_month, 
      isTuition: true 
    };
  }
}else {
      const { data } = await supabase
        .from("products")
        .select("title, price, image_url")
        .eq("id", productId)
        .maybeSingle();
      
      if (data) {
        contextData = { ...data, isTuition: false };
      }
    }

    const { data: counterProfile } = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url, phone_number, email, location_name")
      .eq("id", sellerId)
      .single();

    const adHocStub = {
      id: "NEW_ROOM_STUB", 
      product_id: productId,
      seller_id: sellerId,
      buyer_id: currentUserId,
      isUserSeller: false,
      derivedContext: contextData,
      counterparty_profile: counterProfile || { full_name: "User Context", username: "user" }
    };

    setActiveRoom(adHocStub);
  } catch (err) {
    console.error("Could not mount ad-hoc stream context:", err);
  }
};

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
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      setMessages(data.filter(msg => (Date.now() - new Date(msg.created_at).getTime()) < twentyFourHoursInMs));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setAttachedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("File limits capped at 5MB.");
    }
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    setImagePreview(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeRoom || !currentUserId || (!typedMessage.trim() && !attachedFile)) return;

    try {
      setSending(true);
      let targetRoomId = activeRoom.id;
      let uploadedImageUrl = null;

      if (targetRoomId === "NEW_ROOM_STUB") {
        // Create actual database connection chat room context safely
        const { data: newRoom, error: roomError } = await supabase
          .from("chat_rooms")
          .insert([{
            seller_id: sellerId,
            buyer_id: currentUserId,
            product_id: productId 
          }])
          .select()
          .single();

        if (roomError) throw roomError;
        targetRoomId = newRoom.id;
      }

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `chat-${targetRoomId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("products").upload(fileName, attachedFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        uploadedImageUrl = data.publicUrl;
      }

      const { error: msgError } = await supabase
        .from("chat_messages")
        .insert([{
          room_id: targetRoomId,
          sender_id: currentUserId,
          message_text: typedMessage.trim() || null,
          image_url: uploadedImageUrl,
        }]);

      if (msgError) throw msgError;

      setTypedMessage("");
      clearAttachedFile();

      if (activeRoom.id === "NEW_ROOM_STUB") {
        await fetchChatRooms(currentUserId);
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
        
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-blue-600 w-5 h-5" />
            <span className="font-black text-gray-800 text-base md:text-lg tracking-tight">
              Tuition Conversation Stream
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* SIDEBAR */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-slate-50/40 ${activeRoom ? "hidden md:flex" : "flex"}`}>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingRooms ? (
                <div className="h-40 flex justify-center items-center"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>
              ) : (
                <div className="space-y-1">
                  {/* Ad-hoc item */}
                  {activeRoom && activeRoom.id === "NEW_ROOM_STUB" && (
                    <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">?</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black truncate">{activeRoom.counterparty_profile?.full_name}</h4>
                        <p className="text-[11px] truncate text-blue-100 flex items-center gap-1 mt-0.5">
                          {contextMode === "tuition" ? <GraduationCap size={12} /> : <ShoppingBag size={12} />}
                          {activeRoom.derivedContext?.title || "Connecting..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Room Lists */}
                  {rooms.map((room) => {
                    const isSelected = activeRoom?.id === room.id;
                    const contextTitle = room.tuition_requirements?.target_subject || room.products?.title || "Class Setup Context";
                    const isTuitionContext = !!room.tuition_requirements;

                    return (
                      <div
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                          isSelected ? "bg-blue-600 text-white shadow-xs" : "hover:bg-gray-100 bg-white border border-gray-100"
                        }`}
                      >
                        <img
                          src={room.counterparty_profile?.avatar_url || "https://via.placeholder.com/150"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border border-black/5"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {room.counterparty_profile?.full_name}
                          </h4>
                          <p className={`text-[11px] truncate flex items-center gap-1 font-medium mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                            {isTuitionContext ? <GraduationCap size={12} /> : <ShoppingBag size={12} />}
                            {contextTitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        
          <div className={`flex-1 flex flex-col bg-white ${!activeRoom ? "hidden md:flex items-center justify-center text-gray-400 p-8" : "flex"}`}>
            {activeRoom ? (
              <>
                <div className="p-4 border-b border-gray-100 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeRoom.counterparty_profile?.avatar_url || "https://via.placeholder.com/150"}
                        alt="Active Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-black text-sm md:text-base text-gray-900">{activeRoom.counterparty_profile?.full_name}</h4>
                        <p className="text-[11px] font-bold text-blue-600">@{activeRoom.counterparty_profile?.username || "user"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-black border border-amber-200/40">
                      <Clock size={12} /> Ephemeral: 24h Purge Active
                    </div>
                  </div>

                  {/* Profile info cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t text-[11px] font-bold text-gray-600">
                    <div className="bg-slate-50 p-1.5 rounded-lg border truncate"><Phone size={12} className="inline mr-1 text-gray-400" />{activeRoom.counterparty_profile?.phone_number || "N/A"}</div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border truncate"><Mail size={12} className="inline mr-1 text-gray-400" />{activeRoom.counterparty_profile?.email || "N/A"}</div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border truncate"><MapPin size={12} className="inline mr-1 text-gray-400" />{activeRoom.counterparty_profile?.location || "Nepal"}</div>
                  </div>
                </div>

                {/* MESSAGES FLOW */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 border rounded-tl-none"
                        }`}>
                          {msg.image_url && <img src={msg.image_url} alt="Attachment" className="rounded-lg mb-1.5 max-h-48 object-cover" />}
                          {msg.message_text && <p className="leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                {/* INPUT */}
                <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2 bg-white">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
                    <Paperclip size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 border text-sm rounded-xl px-4 py-2.5 outline-none"
                  />
                  <button type="submit" disabled={sending || (!typedMessage.trim() && !attachedFile)} className="p-2.5 bg-blue-600 text-white rounded-xl">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-black text-sm">No Active Conversation</h3>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default LiveChatModal;