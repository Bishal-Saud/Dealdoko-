import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabase.js";
import { 
  PlusCircle, BookOpen, Upload, Loader2, AlertCircle, 
  Trash2, Edit3, Check, X, Users, Banknote, Clock, Percent
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function ManageCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState(null); 

  // Dynamic Dashboard Aggregated Metrics
  const [profileMetrics, setProfileMetrics] = useState({
    total_completed_revenue: 0,
    completion_rate: 0,
    total_completed_courses: 0
  });

  // Editing Row States 
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editTiming, setEditTiming] = useState("");
  const [editActiveParents, setEditActiveParents] = useState("");

  // Tuition Form Field States
  const [title, setTitle] = useState(""); 
  const [price, setPrice] = useState(""); 
  const [subject, setSubject] = useState("Mathematics");
  const [targetClass, setTargetClass] = useState("Class 9-10 (SEE)");
  const [timing, setTiming] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchDashboardInitialData();
  }, []);

  const fetchDashboardInitialData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (productError) throw productError;
      
      const safeProducts = productData || [];
      setCourses(safeProducts);

      let totalCompletedRev = 0;
      let totalCompletedCycles = 0;
      let totalDeals = 0;

      safeProducts.forEach(product => {
        const individualCompleted = parseFloat(product.completed_earnings) || 0;
        const productPrice = parseFloat(product.price) || 1; // Avoid division by zero
        const deals = parseInt(product.successful_deals) || 0;

        totalCompletedRev += individualCompleted;
        totalCompletedCycles += individualCompleted / productPrice;
        totalDeals += deals;
      });

      // Avoid NaN calculations if total deals are zero
      const calculatedRate = totalDeals > 0 ? Math.round((totalCompletedCycles / totalDeals) * 100) : 0;

      setProfileMetrics({
        total_completed_revenue: totalCompletedRev,
        completion_rate: calculatedRate > 100 ? 100 : calculatedRate, // Cap at 100% physically
        total_completed_courses: Math.floor(totalCompletedCycles)
      });

    } catch (err) {
      toast.error("Failed to query professional tuition listing directory records.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (item) => {
    try {
      setCompletingId(item.id);
      
      const currentCompletedEarnings = parseFloat(item.completed_earnings) || 0;
      const productPrice = parseFloat(item.price) || 0;
      const updatedTotal = currentCompletedEarnings + productPrice;

      // Increment successful deals concurrently to keep accurate completion metrics
      const currentDeals = parseInt(item.successful_deals) || 0;

      const { error } = await supabase
        .from("products")
        .update({ 
          completed_earnings: updatedTotal,
          successful_deals: currentDeals + 1 
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success(`Earning of रू ${productPrice.toLocaleString()} registered successfully!`);
      await fetchDashboardInitialData();
    } catch (err) {
      toast.error("Failed to update completed milestones.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication credential missing.");

      let publicImageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        publicImageUrl = data.publicUrl;
      }

      const educatorDisplayName = user.user_metadata?.full_name || user.user_metadata?.username || "Verified Educator";

      const { error: insertError } = await supabase
        .from("products")
        .insert([{
          seller_id: user.id,
          seller_name: educatorDisplayName,
          title: title.trim(),
          price: parseFloat(price) || 0,
          subject: subject,         
          target_class: targetClass, 
          timing: timing.trim(),     
          description: description.trim(), 
          image_url: publicImageUrl,
          successful_deals: 0,
          active_assignments: 0,
          active_parents: "",
          completed_earnings: 0 
        }]);

      if (insertError) throw insertError;

      toast.success("Tuition course published live!");
      setTitle("");
      setPrice("");
      setSubject("Mathematics");
      setTargetClass("Class 9-10 (SEE)");
      setTiming("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      
      await fetchDashboardInitialData();
    } catch (err) {
      toast.error(err.message || "Failed to publish tuition service.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title || "");
    setEditPrice(item.price || "");
    setEditTiming(item.timing || "");
    setEditActiveParents(item.active_parents || "");
  };

  const saveCourseEdits = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: productUpdateError } = await supabase
        .from("products")
        .update({
          title: editTitle.trim(),
          price: parseFloat(editPrice) || 0,
          timing: editTiming.trim(),
          active_parents: editActiveParents.trim()
        })
        .eq("id", id);

      if (productUpdateError) throw productUpdateError;

      toast.success("Tuition settings synchronized perfectly.");
      setEditingId(null);
      await fetchDashboardInitialData(); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes to the data matrix.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: linkedRooms } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("product_id", courseId);

      if (linkedRooms && linkedRooms.length > 0) {
        const roomIds = linkedRooms.map(r => r.id);
        await supabase.from("chat_messages").delete().in("room_id", roomIds);
        await supabase.from("chat_rooms").delete().in("id", roomIds);
      }

      await supabase.from("orders").delete().eq("product_id", courseId);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      toast.success("Listing removed cleanly.");
      fetchDashboardInitialData();
    } catch (err) {
      toast.error("Database connectivity mismatch error.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster />
      
      {/* Header Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tuition Directory</h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Publish home tuition packages or update active fees below.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Completed Cycles Metric (Time Spent / Finished Courses) */}
          <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-center">
            <span className="block text-[10px] font-black text-blue-800 uppercase tracking-wider">Completed Batches</span>
            <span className="text-sm font-black text-blue-700">{profileMetrics.total_completed_courses} Times</span>
          </div>

          {/* Completion Rate Metric */}
          <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-center">
            <span className="block text-[10px] font-black text-amber-800 uppercase tracking-wider">Completion Rate</span>
            <span className="text-sm font-black text-amber-700">{profileMetrics.completion_rate}%</span>
          </div>

          {/* Total Revenue Metric */}
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-center">
            <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider">Total Revenue (Completed)</span>
            <span className="text-sm font-black text-emerald-700">रू {profileMetrics.total_completed_revenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* TUITION CREATION FORM */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-blue-600" /> List New Class
          </h2>

          <form onSubmit={handleAddCourse} className="space-y-4">
            {/* Banner/Display Photo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Course / Profile Banner</label>
              <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl cursor-pointer p-4 transition h-28 bg-gray-50/50 overflow-hidden group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center flex flex-col items-center gap-1">
                    <Upload size={18} className="text-gray-400 group-hover:text-blue-500 transition" />
                    <span className="text-[11px] font-bold text-gray-500">Upload Display Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tuition Service Title</label>
              <input 
                type="text" required placeholder="e.g., SEE Mathematics Home Tuition" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Pricing and Subject Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fee (Monthly NPR)</label>
                <input 
                  type="number" required min="100" placeholder="Rs. 8000" value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject</label>
                <select
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition font-semibold"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Tech">Science & Tech</option>
                  <option value="English Literature">English Literature</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Economics / Accountancy">Economics / Accountancy</option>
                  <option value="Physics / Chemistry">Physics / Chemistry</option>
                  <option value="All Primary Subjects">All Primary Subjects</option>
                </select>
              </div>
            </div>

            {/* Target Class and Timings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Level/Class</label>
                <select
                  value={targetClass} onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition font-semibold"
                >
                  <option value="Primary (Class 1-5)">Primary (Class 1-5)</option>
                  <option value="Lower Sec (Class 6-8)">Lower Sec (Class 6-8)</option>
                  <option value="Class 9-10 (SEE)">Class 9-10 (SEE)</option>
                  <option value="Plus Two (+2 / HSEB)">Plus Two (+2 / HSEB)</option>
                  <option value="Bachelor / Engineering">Bachelor / Engineering</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Available Timing Slots</label>
                <input 
                  type="text" required placeholder="e.g., 5 PM - 7 PM" value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Experience & Class Specifications</label>
              <textarea 
                required rows="3" placeholder="Provide details about your academic background..." value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition disabled:bg-blue-400 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Tuition Course'}
            </button>
          </form>
        </div>

        {/* INVENTORY CARD MANAGER SECTION */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500" /> Active Service Catalog
          </h2>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 flex justify-center items-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
              <AlertCircle size={20} className="text-gray-300 mb-2" />
              <h3 className="font-bold text-gray-700 text-xs">No active tuition courses listed yet</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-xs transition flex flex-col gap-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      {editingId === item.id ? (
                        /* EDITING MODE INPUT FIELDS */
                        <div className="space-y-4 w-full max-w-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Modify Service Title</label>
                            <input 
                              type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-500 rounded-xl text-xs bg-white outline-none font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Monthly Service Rate</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-400">Rs.</span>
                                <input 
                                  type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full px-3 py-2 border border-blue-500 rounded-xl text-xs bg-white outline-none font-bold"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Timing Slot</label>
                              <input 
                                type="text" value={editTiming} onChange={(e) => setEditTiming(e.target.value)}
                                className="w-full px-3 py-2 border border-blue-500 rounded-xl text-xs bg-white outline-none font-semibold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Active Batch Buyer / Parents Name</label>
                            <input 
                              type="text" value={editActiveParents} onChange={(e) => setEditActiveParents(e.target.value)}
                              placeholder="e.g., Ram Bahadur / Sita Thapa"
                              className="w-full px-3 py-2 border border-blue-500 rounded-xl text-xs bg-white outline-none font-medium"
                            />
                          </div>
                        </div>
                      ) : (
                        /* STANDARD DISPLAY RENDER WITH METADATA BADGES */
                        <>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {item.subject}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
                            <p className="font-bold text-emerald-600">
                              Rs. {parseFloat(item.price).toLocaleString()} / month
                            </p>
                            {item.timing && (
                              <p className="text-gray-400 font-medium flex items-center gap-1">
                                <Clock size={12} /> {item.timing}
                              </p>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 font-medium line-clamp-2 max-w-xl mt-1.5">{item.description}</p>
                          
                          {/* DISPLAY ACTIVE BUYER PARENT INFO AND POST EARNINGS */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl pt-2 border-t border-gray-100">
                            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100/70 text-xs">
                              <span className="block text-[10px] font-black text-blue-800 uppercase tracking-wider mb-0.5">
                                Active Batch Buyer
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                <Users size={13} className="text-blue-600 shrink-0" />
                                <span className="truncate">
                                  {item.active_parents && item.active_parents.trim() !== "" ? item.active_parents : "Unassigned / No active clients"}
                                </span>
                              </div>
                            </div>

                            <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/70 text-xs flex flex-col justify-center">
                              <span className="block text-[9px] font-black text-amber-800 uppercase tracking-wider">Earnings Earned</span>
                              <div className="flex items-center gap-1 text-amber-700 font-black mt-0.5">
                                <Banknote size={13} />
                                <span>रू {(parseFloat(item.completed_earnings) || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ACTION CONTROL BUTTONS */}
                    <div className="flex items-center gap-2 self-end sm:self-start pt-1 flex-wrap justify-end">
                      {editingId === item.id ? (
                        <>
                          <button 
                            onClick={() => saveCourseEdits(item.id)}
                            className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            <Check size={14} /> Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            disabled={completingId === item.id}
                            onClick={() => handleMarkAsCompleted(item)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition flex items-center gap-1 text-[11px] font-bold px-3 cursor-pointer disabled:bg-emerald-100 disabled:text-emerald-400"
                          >
                            {completingId === item.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )} 
                            Completed
                          </button>

                          <button 
                            onClick={() => startEditing(item)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center gap-1 text-[11px] font-bold px-3 cursor-pointer"
                          >
                            <Edit3 size={12} /> Modify
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteCourse(item.id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageCourse;