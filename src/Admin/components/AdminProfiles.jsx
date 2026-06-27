import React, { useState } from "react";
import { Mail, MapPin, DollarSign, Edit2, ShieldAlert } from "lucide-react";

export default function AdminProfiles({ 
  profiles, 
  searchQuery, 
  onEditClick 
}) {

  const filteredProfiles = profiles.filter((profile) => {
    const q = searchQuery.toLowerCase();
    return (
      (profile.email && profile.email.toLowerCase().includes(q)) ||
      (profile.full_name && profile.full_name.toLowerCase().includes(q)) ||
      (profile.username && profile.username.toLowerCase().includes(q))
    );
  });

  if (filteredProfiles.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed rounded-xl text-slate-400 text-sm">
        No users found matching query params.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
              <th className="py-3.5 px-4">User Metadata</th>
              <th className="py-3.5 px-4">Verification Check</th>
              <th className="py-3.5 px-4">Financials / Experience</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {filteredProfiles.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                      alt="avatar" 
                      className="w-9 h-9 rounded-full border object-cover bg-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{user.full_name || "Unset"}</h4>
                      <span className="text-xs text-slate-400 block font-mono">@{user.username || "none"}</span>
                      <span className="text-xs text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-slate-400" /> {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                      user.verification_status === "verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      user.verification_status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {user.verification_status || "pending"}
                    </span>
                    <div className="flex gap-1.5 text-[10px] text-slate-400 font-semibold">
                      <span className={user.is_verified_buyer ? "text-blue-600" : ""}>B: {user.is_verified_buyer ? "Yes" : "No"}</span>
                      <span>•</span>
                      <span className={user.is_verified_seller ? "text-purple-600" : ""}>S: {user.is_verified_seller ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </td>
                
                <td className="p-4 font-mono text-xs text-slate-700">
                  <div className="flex items-center text-slate-900 font-bold font-sans text-sm mb-0.5">
                    <DollarSign size={13} className="text-slate-400" />
                    {user.total_earnings?.toLocaleString() || 0}
                  </div>

                  {/* Dynamic Validation Block: Only displays editable component layout for verified sellers */}
                  <div className="mt-1 mb-1 font-sans">
                    {user.is_verified_seller ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-xs font-medium">Exp:</span>
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                          {user.experience_years || 0} Yrs
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[10px] italic flex items-center gap-0.5">
                        <ShieldAlert size={11} className="text-slate-300" /> Exp Closed (Not a Seller)
                      </div>
                    )}
                  </div>

                  <div className="text-slate-400 text-[10px]">Rating: {user.rating || 0}★ ({user.review_count || 0})</div>
                </td>

                <td className="p-4 text-xs text-slate-500 max-w-[140px] truncate">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{user.location_name || "Not set"}</span>
                  </div>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => onEditClick(user)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title={user.is_verified_seller ? "Edit metrics including Experience Years" : "Edit profile metadata"}
                  >
                    <Edit2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}