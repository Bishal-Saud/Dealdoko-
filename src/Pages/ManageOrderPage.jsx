import React, { useState, useEffect } from "react";
import { supabase } from "../api/supabase.js";
import { 
  ClipboardList, DollarSign, Calendar, Loader2, 
  AlertCircle, RefreshCw, Users, Percent, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

function ManageOrderPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Dashboard Aggregated Metrics derived from database attributes
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    completion_rate: 0,
    completed_courses: 0
  });

  useEffect(() => {
    fetchDashboardInitialData();
  }, []);

  const fetchDashboardInitialData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Select statements modified to map structural schema properties explicitly
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, title, subject, timing, price, successful_deals, active_parents, completed_earnings, seller_id")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (productError) throw productError;
      
      const safeProducts = productData || [];
      setProducts(safeProducts);

      let aggregatedRevenue = 0;
      let totalCompletedCycles = 0;
      let totalDealsTargeted = 0;

      safeProducts.forEach(product => {
        const earnings = parseFloat(product.completed_earnings) || 0;
        const rate = parseFloat(product.price) || 1; // Safeguard division boundaries
        const deals = parseInt(product.successful_deals, 10) || 0;

        aggregatedRevenue += earnings;
        totalCompletedCycles += earnings / rate;
        totalDealsTargeted += deals;
      });

      // Avoid structural math NaN outputs if operations metrics are zero
      const rateOutput = totalDealsTargeted > 0 ? Math.round((totalCompletedCycles / totalDealsTargeted) * 100) : 0;

      setMetrics({
        total_revenue: aggregatedRevenue,
        completion_rate: rateOutput > 100 ? 100 : rateOutput,
        completed_courses: Math.floor(totalCompletedCycles)
      });

    } catch (err) {
      console.error("Database sync error:", err);
      toast.error("Failed to sync customer tuition database registry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-0 my-6">
      
      {/* HEADER OPERATIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Tuition Engagements Manager <ClipboardList className="text-blue-600" size={24} />
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Real-time control interface to monitor completed earnings, batch progression milestones, and active clients.
          </p>
        </div>
        <button 
          onClick={fetchDashboardInitialData}
          className="self-start sm:self-auto p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition cursor-pointer flex items-center justify-center"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* METRICS GRID OVERVIEW BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Revenue from Completed Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Revenue (Completed)</span>
            <span className="text-lg font-black text-emerald-600">रू {metrics.total_revenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Percent size={20} /></div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Completion Rate</span>
            <span className="text-lg font-black text-amber-600">{metrics.completion_rate}% Metrics</span>
          </div>
        </div>

        {/* Metric 3: Time Completed Courses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><CheckCircle2 size={20} /></div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Completed Batches</span>
            <span className="text-lg font-black text-blue-600">{metrics.completed_courses} Cycles Delivered</span>
          </div>
        </div>

      </div>

      {/* REAL-TIME PRODUCT MODULES LOG TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-50 bg-white">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Active Operations Directory Matrix</h2>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center items-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <AlertCircle size={32} className="text-gray-300 mb-2" />
            <h3 className="font-bold text-sm text-gray-700">No tuition specifications recorded yet</h3>
            <p className="text-xs text-gray-400 mt-0.5">When you add class profiles or modules, they populate right here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 uppercase font-black text-[10px] tracking-wider">
                  <th className="p-4">Tuition Assignment Details</th>
                  <th className="p-4">Client Access (Parents Username)</th>
                  <th className="p-4">Base Rate</th>
                  <th className="p-4">Earnings Generated</th>
                  <th className="p-4 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const productPrice = parseFloat(product.price) || 1;
                  const itemEarnings = parseFloat(product.completed_earnings) || 0;
                  const targetDeals = parseInt(product.successful_deals, 10) || 0;
                  
                  // Per row cycle percentage calculation logic
                  const cyclesFinished = itemEarnings / productPrice;
                  const individualRate = targetDeals > 0 ? Math.round((cyclesFinished / targetDeals) * 100) : 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/40 transition">
                      
                      {/* Column 1: Assignment Details */}
                      <td className="p-4">
                        <span className="font-black text-slate-900 block text-[13px]">{product.title || "Untitled Class Specification"}</span>
                        <div className="flex gap-1.5 items-center mt-1">
                          <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {product.subject || "General Academic"}
                          </span>
                          <div className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                            <Calendar size={11} /> {product.timing || "Flexible Hours"}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Parent Identifiers */}
                      <td className="p-4 max-w-[180px]">
                        {product.active_parents ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-xl w-fit">
                            <Users size={12} className="text-blue-500 shrink-0" />
                            <span className="truncate" title={product.active_parents}>
                              @{product.active_parents.trim().toLowerCase().replace(/\s+/g, "_")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium italic text-gray-400">Unassigned / No active client</span>
                        )}
                      </td>

                      {/* Column 3: Monthly Class Value */}
                      <td className="p-4 font-black text-slate-500">
                        रू {parseFloat(product.price || 0).toLocaleString()}
                      </td>

                      {/* Column 4: Revenue generated via completed earnings */}
                      <td className="p-4 font-black text-emerald-600 text-[13px]">
                        रू {itemEarnings.toLocaleString()}
                      </td>

                      {/* Column 5: Performance completion badges split */}
                      <td className="p-4 text-right">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wide border ${
                            individualRate >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            individualRate >= 40 ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-slate-50 text-slate-600 border-slate-100"
                          }`}>
                            {individualRate}% Done
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                            {Math.floor(cyclesFinished)} of {targetDeals} cycles
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageOrderPage;