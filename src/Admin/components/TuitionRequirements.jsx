import React, { useState } from "react";
import { ClipboardList, Edit2, Trash2, Tag, Calendar, MapPin, Award } from "lucide-react";
import { supabase } from "../../api/supabase.js"; 
import { toast } from "react-hot-toast";

export default function TuitionRequirements({ requirements, setRequirements, searchQuery }) {

  const [selectedReq, setSelectedReq] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

 
  const filteredRequirements = requirements.filter((req) => {
    const q = searchQuery.toLowerCase();
    return (
      (req.subject && req.subject.toLowerCase().includes(q)) ||
      (req.class_level && req.class_level.toLowerCase().includes(q)) ||
      (req.location_name && req.location_name.toLowerCase().includes(q)) ||
      (req.id && req.id.toLowerCase().includes(q))
    );
  });


  const handleUpdateRequirement = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("tuition_requirements")
        .update({
          subject: selectedReq.subject,
          class_level: selectedReq.class_level,
          budget_per_month: parseFloat(selectedReq.budget_per_month || 0),
          frequency_per_week: parseInt(selectedReq.frequency_per_week || 0, 10),
          landmark_description: selectedReq.landmark_description,
          required_qualification: selectedReq.required_qualification,
          description: selectedReq.description,
          location_name: selectedReq.location_name,
          status: selectedReq.status,
        })
        .eq("id", selectedReq.id);

      if (error) throw error;

      toast.success("Requirement matrix updated cleanly!");
      setIsEditModalOpen(false);

      
      setRequirements((prev) =>
        prev.map((item) => (item.id === selectedReq.id ? { ...selectedReq, updated_at: new Date().toISOString() } : item))
      );
    } catch (err) {
      console.error("Error patching requirement data row:", err.message);
      toast.error("Database schema update failed.");
    } finally {
      setUpdating(false);
    }
  };

 
  const handleConfirmDelete = async (req) => {
    const confirmation = window.confirm(`Permanently scrub requirement query for "${req.subject}"? This action is irreversible.`);
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from("tuition_requirements")
        .delete()
        .eq("id", req.id);

      if (error) throw error;

      toast.success("Requirement registry entry successfully deleted.");
      setRequirements((prev) => prev.filter((item) => item.id !== req.id));
    } catch (err) {
      console.error("Error executing row delete command:", err.message);
      toast.error("Database deletion request failed.");
    }
  };

  if (filteredRequirements.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed rounded-xl text-slate-400 text-sm">
        No tuition requirement records match your query parameters.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
              <th className="py-3.5 px-4">Subject & Level</th>
              <th className="py-3.5 px-4">Logistics / Budget</th>
              <th className="py-3.5 px-4">Location Meta</th>
              <th className="py-3.5 px-4">Target Qualifications</th>
              <th className="py-3.5 px-4">Status Flag</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {filteredRequirements.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/60 transition">
                {/* Subject and IDs */}
                <td className="p-4 max-w-[220px]">
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 text-sm truncate" title={req.subject}>{req.subject}</h4>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Class: {req.class_level || "N/A"}</span>
                    <span className="text-[9px] text-slate-400 block font-mono truncate mt-1">ID: {req.id}</span>
                  </div>
                </td>

                {/* Pricing and Frequencies */}
                <td className="p-4 space-y-0.5 font-mono">
                  <div className="text-slate-900 font-bold">Rs.{req.budget_per_month?.toLocaleString()}/mo</div>
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Calendar size={10} /> {req.frequency_per_week || 0} days / week
                  </div>
                </td>

                {/* Geo Location Profiles */}
                <td className="p-4 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{req.location_name || "Remote / Not set"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-[180px]" title={req.landmark_description}>
                    {req.landmark_description || "No landmark set"}
                  </p>
                </td>

                {/* Descriptions and Requirements */}
                <td className="p-4 space-y-1 max-w-[200px]">
                  <div className="flex items-center gap-1 text-blue-700 font-bold text-[10px] uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded w-max border border-blue-100">
                    <Award size={10} /> {req.required_qualification || "Open Status"}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2" title={req.description}>
                    {req.description || "No detailed briefing description provided."}
                  </p>
                </td>

                {/* Dynamic Badging for System Statuses */}
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      req.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : req.status === "completed"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {req.status || "Pending"}
                  </span>
                </td>

                {/* Operations Engine */}
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedReq({ ...req });
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit tuition configurations"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(req)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Shed profile requirement Completely"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CORE ADMINISTRATIVE DATA OVERRIDE WINDOW */}
      {isEditModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Modify Tuition Requirement Schema</h3>
                <p className="text-xs text-slate-400 font-mono select-all">UUID: {selectedReq.id}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-50 hover:bg-slate-100 p-1.5 px-2.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRequirement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject Title</label>
                  <input
                    type="text"
                    value={selectedReq.subject || ""}
                    onChange={(e) => setSelectedReq({ ...selectedReq, subject: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Class Level</label>
                  <input
                    type="text"
                    value={selectedReq.class_level || ""}
                    onChange={(e) => setSelectedReq({ ...selectedReq, class_level: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Budget (Rs.)</label>
                  <input
                    type="number"
                    value={selectedReq.budget_per_month || 0}
                    onChange={(e) => setSelectedReq({ ...selectedReq, budget_per_month: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Days / Week</label>
                  <input
                    type="number"
                    value={selectedReq.frequency_per_week || 0}
                    onChange={(e) => setSelectedReq({ ...selectedReq, frequency_per_week: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pipeline Status</label>
                  <select
                    value={selectedReq.status || "pending"}
                    onChange={(e) => setSelectedReq({ ...selectedReq, status: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location Base Name</label>
                  <input
                    type="text"
                    value={selectedReq.location_name || ""}
                    onChange={(e) => setSelectedReq({ ...selectedReq, location_name: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Required Qualification</label>
                  <input
                    type="text"
                    value={selectedReq.required_qualification || ""}
                    onChange={(e) => setSelectedReq({ ...selectedReq, required_qualification: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Landmark Description Hint</label>
                <input
                  type="text"
                  value={selectedReq.landmark_description || ""}
                  onChange={(e) => setSelectedReq({ ...selectedReq, landmark_description: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Requirement Description Summary</label>
                <textarea
                  rows={3}
                  value={selectedReq.description || ""}
                  onChange={(e) => setSelectedReq({ ...selectedReq, description: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 border bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs tracking-wide transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md transition"
                >
                  {updating ? "Saving Schema Changes..." : "Commit Override Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}