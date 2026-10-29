import React, { useState, useRef, useEffect } from "react";

export default function Navbar({
  activeTab,
  selectedToolName,
  onSelectCoreTool,
  onSelectExtendedTool,
  coreTools,
  extendedTools,
  bgTheme,
  setBgTheme,
  themes,
}) {
  const [openCategory, setOpenCategory] = useState(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  const categories = [
    { name: "Cyber Cafe Pro", icon: "🏪" },
    { name: "QR & Barcode", icon: "🔳" },
    { name: "Image", icon: "🖼️" },
    { name: "PDF & Documents", icon: "📄" },
    { name: "Video & Audio", icon: "🎥" },
    { name: "GIF", icon: "🎬" },
    { name: "Others", icon: "🛠️" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults =
    quickSearch.trim().length > 0
      ? [
          ...coreTools.map((t) => ({
            ...t,
            isCore: true,
            category: "Core Studio",
          })),
          ...extendedTools,
        ].filter((t) =>
          t.name.toLowerCase().includes(quickSearch.toLowerCase()),
        )
      : [];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Top Primary Bar: Brand, Search, Theme Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectCoreTool(coreTools[0])}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00e5ff] via-blue-500 to-indigo-600 flex items-center justify-center text-xl font-black text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                FormFix <span className="text-[#00e5ff]">Pro</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 px-2 py-0.5 rounded-full font-bold">
                All-In-One Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              100% Client-Side • Zero Upload • Cyber Cafe & Conversion Suite
            </p>
          </div>
        </div>

        {/* Instant Tool Finder Search Bar */}
        <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Quick jump to any service (e.g., Passport, UPI QR, WEBP, PAN)..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 transition-all"
            />
            {quickSearch && (
              <button
                onClick={() => setQuickSearch("")}
                className="absolute right-3 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Instant Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#0d1322] border border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-2 space-y-1">
              {searchResults.map((tool, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (tool.isCore) onSelectCoreTool(tool);
                    else onSelectExtendedTool(tool);
                    setQuickSearch("");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#00e5ff]/15 text-left transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{tool.icon}</span>
                    <span className="text-xs font-bold text-white group-hover:text-[#00e5ff]">
                      {tool.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {tool.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Background Theme Switcher & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1">
            <span className="text-[10px] text-slate-400 px-2 font-semibold">
              ✨ Theme:
            </span>
            {Object.values(themes).map((t) => (
              <button
                key={t.id}
                onClick={() => setBgTheme(t.id)}
                title={t.label}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  bgTheme === t.id
                    ? "bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden lg:inline">{t.short}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-[#00e5ff]"
          >
            {mobileMenuOpen ? "✕ Close" : "☰ All Services"}
          </button>
        </div>
      </div>

      {/* Second Bar: Full Top Services Mega-Menu Bar */}
      <div className="border-t border-white/5 bg-[#050811]/90">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Core Flagship Tools Pill Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1 hidden xl:inline">
              Core Studios:
            </span>
            {coreTools.map((tool) => {
              const isActive =
                activeTab === tool.id && selectedToolName === tool.name;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectCoreTool(tool);
                    setOpenCategory(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-[#00e5ff] border border-slate-800"
                  }`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                  {tool.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? "bg-black/20 text-black"
                          : "bg-[#00e5ff]/20 text-[#00e5ff]"
                      }`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 shrink-0 hidden lg:block" />

          {/* Category Dropdown Triggers */}
          <div className="flex items-center gap-1 shrink-0">
            {categories.map((cat) => {
              const catTools = extendedTools.filter(
                (t) => t.category === cat.name,
              );
              const isCatOpen = openCategory === cat.name;
              const hasActiveTool = catTools.some(
                (t) => t.name === selectedToolName,
              );

              return (
                <div key={cat.name} className="relative">
                  <button
                    onClick={() => setOpenCategory(isCatOpen ? null : cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                      isCatOpen || hasActiveTool
                        ? "bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/50"
                        : "bg-transparent text-slate-300 border-transparent hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="text-[9px] opacity-70">▼</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mega-Menu Dropdown Drawer */}
        {openCategory && (
          <div className="border-t border-slate-800 bg-[#0a0f1d]/95 backdrop-blur-2xl shadow-2xl animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#00e5ff]">
                    {openCategory} Services
                  </span>
                  <span className="text-[11px] text-slate-400">
                    — Select any tool to launch immediately in workspace
                  </span>
                </div>
                <button
                  onClick={() => setOpenCategory(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
                >
                  ✕ Close Menu
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {extendedTools
                  .filter((t) => t.category === openCategory)
                  .map((tool, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectExtendedTool(tool);
                        setOpenCategory(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                        selectedToolName === tool.name
                          ? "bg-[#00e5ff]/15 border-[#00e5ff] text-white shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                          : "bg-slate-900/70 border-slate-800/80 hover:border-[#00e5ff]/50 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-xl p-2 rounded-lg bg-slate-950 group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-100 group-hover:text-[#00e5ff] truncate">
                          {tool.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {tool.desc || "Instant Client Tool"}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Full Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0a0f1d] p-4 max-h-[75vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Background Theme:
              </span>
              <div className="flex gap-1">
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBgTheme(t.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      bgTheme === t.id
                        ? "bg-[#00e5ff] text-black"
                        : "bg-slate-900 text-slate-300"
                    }`}
                  >
                    {t.icon} {t.short}
                  </button>
                ))}
              </div>
            </div>

            {categories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#00e5ff] uppercase tracking-wider">
                  {cat.icon} {cat.name}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {extendedTools
                    .filter((t) => t.category === cat.name)
                    .map((tool, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectExtendedTool(tool);
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center gap-2"
                      >
                        <span>{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
