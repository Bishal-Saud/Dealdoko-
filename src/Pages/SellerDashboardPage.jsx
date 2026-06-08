import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import ManageOrderPage from "./ManageOrderPage";
import BuyerChat from "../components/BuyerChat.jsx";
import ManageCourse from "../components/ManageCourse.jsx";
import { Link } from "react-router-dom";

function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50/50 text-slate-900 flex flex-col md:flex-row">
      <Toaster />

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-6 shrink-0 shadow-lg">
        <Link to ="/">
          <h2 className="text-xl font-black tracking-tight text-amber-400 flex items-center gap-2">
            Educator OS <Sparkles size={16} />
          </h2>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">
            Tuition Desk Console
          </p>
        </Link>

        <nav className="flex flex-row md:flex-col gap-2 w-full overflow-x-auto no-scrollbar md:overflow-visible">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard size={16} />
            Showcase Classes
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <ClipboardList size={16} />
            Booking Requests
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 md:flex-initial flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === "messages"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <MessageSquare size={16} />
            Student Messages
          </button>
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab === "orders" ? (
          <ManageOrderPage />
        ) : activeTab === "messages" ? (
          <BuyerChat />
        ) : (
          <ManageCourse />
        )}
      </main>
    </div>
  );
}

export default SellerDashboardPage;