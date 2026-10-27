import React from "react";

const TABS = [
  {
    id: "compressor",
    label: "📸 Exact KB & Photo Tool",
    activeBg: "bg-indigo-600",
  },
  {
    id: "passport",
    label: "👔 Passport Photo Sheet",
    activeBg: "bg-amber-600",
  },
  { id: "idstudio", label: "🪪 A4 ID Card Studio", activeBg: "bg-emerald-600" },
  { id: "pdfmerger", label: "📑 Image to PDF Merger", activeBg: "bg-pink-600" },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/85 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("compressor")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-400 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              FormFix <span className="text-cyan-400">Pro</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                4-in-1 Studio
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              100% Client-Side • Zero Server Upload • Instant Print & Exam Tools
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? `${tab.activeBg} text-white shadow`
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
