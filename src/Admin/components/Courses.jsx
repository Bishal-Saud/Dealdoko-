import React from "react";
import { Tag, Edit2, Trash2 } from "lucide-react";

export default function Courses({ products, searchQuery, onEditClick, onDeleteClick }) {

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    return (
      (product.title && product.title.toLowerCase().includes(q)) ||
      (product.seller_name && product.seller_name.toLowerCase().includes(q)) ||
      (product.subject && product.subject.toLowerCase().includes(q)) ||
      (product.category && product.category.toLowerCase().includes(q))
    );
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed rounded-xl text-slate-400 text-sm">
        No custom products matching query parameters.
      </div>
    );
  }

  
  const handleConfirmDelete = (product) => {
    const confirmation = window.confirm(`Are you sure you want to permanently delete "${product.title}"? This action cannot be undone.`);
    if (confirmation && onDeleteClick) {
      onDeleteClick(product.id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
              <th className="py-3.5 px-4">Course / Product Title</th>
              <th className="py-3.5 px-4">Instructor Vector</th>
              <th className="py-3.5 px-4">Category Meta</th>
              <th className="py-3.5 px-4">Tuition Framework</th>
              <th className="py-3.5 px-4">Deal Metrics</th>
              <th className="py-3.5 px-4 text-right">Pricing / Earnings</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/60 transition">
  
                <td className="p-4 max-w-[220px]">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt="Cover" className="w-10 h-7 object-cover rounded bg-slate-100 border shrink-0" />
                    ) : (
                      <div className="w-10 h-7 bg-slate-100 rounded border flex items-center justify-center shrink-0 text-[10px] text-slate-400 font-bold">No Img</div>
                    )}
                    <div className="truncate">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={product.title}>{product.title}</h4>
                      <span className="text-[10px] text-slate-400 block font-mono truncate">ID: {product.id}</span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block">{product.seller_name || "Unknown Teacher"}</span>
                    <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[120px]">UID: {product.seller_id}</span>
                  </div>
                </td>

              
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-max">
                      <Tag size={10} /> {product.category || "General"}
                    </span>
                  </div>
                </td>

        
                <td className="p-4 space-y-0.5">
                  <div>Subject: <span className="font-bold text-slate-900">{product.subject || "N/A"}</span></div>
                  <div>Class: <span className="font-semibold text-slate-800">{product.target_class || "N/A"}</span></div>
                  <div className="text-[10px] text-slate-400">Timing: {product.timing || "Not set"}</div>
                </td>

           
                <td className="p-4 font-mono text-[11px] space-y-0.5">
                  <div className="text-emerald-600 font-bold">Deals Done: {product.successful_deals || 0}</div>
                  <div className="text-purple-600">Active Assignments: {product.active_assignments || 0}</div>
                  <div className="text-slate-400 text-[10px]">Parents: {product.active_parents || 0} active / {product.deal_parents || 0} total</div>
                </td>

              
                <td className="p-4 text-right font-mono">
                  <div className="text-slate-900 font-bold text-sm">Rs.{product.price?.toLocaleString() || 0}</div>
                  <div className="text-emerald-600 text-[10px] mt-0.5">
                    Earned: Rs.{product.completed_earnings?.toLocaleString() || 0}
                  </div>
                </td>

                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditClick(product)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="Edit course metrics"
                    >
                      <Edit2 size={14} />
                    </button>
                    
                
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(product)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete course completely"
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
    </div>
  );
}