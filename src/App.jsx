import React, { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import IdCardStudio from "./components/IdCardStudio";
import KbCompressor from "./components/KbCompressor";
import PassportStudio from "./components/PassportStudio";
import PdfMerger from "./components/PdfMerger";
import AdBanner from "./components/AdBanner";
import AiBgRemoverStudio from "./components/AiBgRemoverStudio";

// Separated Category Suites
import ImageConverterSuite from "./components/ImageConverterSuite";
import DocumentConverterSuite from "./components/DocumentConverterSuite";
import VideoAudioSuite from "./components/VideoAudioSuite";
import GifConverterSuite from "./components/GifConverterSuite";
import OtherUtilitiesSuite from "./components/OtherUtilitiesSuite";

// Newly Added Pro Suites
import CyberCafeProSuite from "./components/CyberCafeProSuite";
import QrBarcodeStudio from "./components/QrBarcodeStudio";

import { Analytics } from "@vercel/analytics/react";

const BG_THEMES = {
  obsidian: {
    id: "obsidian",
    short: "Cyber",
    label: "Cyber Obsidian (Default)",
    icon: "🌌",
    wrapperClass:
      "bg-[#060913] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(0,229,255,0.18),rgba(15,23,42,0.2),#060913)]",
  },
  aurora: {
    id: "aurora",
    short: "Aurora",
    label: "Stripe Indigo Aurora",
    icon: "🔮",
    wrapperClass:
      "bg-[#090718] bg-[radial-gradient(ellipse_85%_60%_at_50%_-15%,rgba(99,102,241,0.26),rgba(168,85,247,0.08),#090718)]",
  },
  emerald: {
    id: "emerald",
    short: "Matrix",
    label: "Emerald Studio",
    icon: "🌿",
    wrapperClass:
      "bg-[#04100d] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(16,185,129,0.22),rgba(6,78,59,0.1),#04100d)]",
  },
  slate: {
    id: "slate",
    short: "Slate",
    label: "Clean Carbon Slate",
    icon: "⚡",
    wrapperClass:
      "bg-[#0f172a] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.15),transparent)]",
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("compressor");
  const [selectedToolName, setSelectedToolName] = useState("KB Compressor");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bgTheme, setBgTheme] = useState("obsidian");
  const workspaceRef = useRef(null);

  // Core Flagship Studio Tools (All aligned in the top menu bar)
  const coreTools = [
    { id: "compressor", name: "KB Compressor", icon: "🗜️", badge: "SSC/PAN" },
    { id: "ai-bg", name: "AI BG Remover", icon: "🪄", badge: "AI FREE" }, // <-- Added at Top Menu
    { id: "passport", name: "Passport Studio", icon: "🛂", badge: "A4/4×6" },
    { id: "idcard", name: "ID Card Studio", icon: "🪪", badge: "PVC A4" },
    { id: "pdfmerger", name: "PDF Merger", icon: "🔗" },
    { id: "cyber-suite", name: "Cyber Cafe Pro", icon: "🏪", badge: "NEW" },
    { id: "qr-suite", name: "QR & Barcode", icon: "🔳", badge: "UPI" },
  ];
  // Extended Conversion & Utility Services
  const extendedTools = [
    // NEW: Cyber Cafe Pro
    {
      name: "Photo + Signature Joint Merger",
      category: "Cyber Cafe Pro",
      targetSuite: "cyber-suite",
      icon: "🔗",
      desc: "Side-by-side or Top-Bottom",
    },
    {
      name: "Passport Backdrop Changer",
      category: "Cyber Cafe Pro",
      targetSuite: "cyber-suite",
      icon: "🎨",
      desc: "White, Blue, or Red BG",
    },
    {
      name: "A4 Document Scanner & Enhancer",
      category: "Cyber Cafe Pro",
      targetSuite: "cyber-suite",
      icon: "🖨️",
      desc: "Clean B&W Marksheet Scan",
    },

    // NEW: QR & Barcode
    {
      name: "UPI Payment QR Generator",
      category: "QR & Barcode",
      targetSuite: "qr-suite",
      icon: "🇮🇳",
      desc: "Custom Shop UPI Standee",
    },
    {
      name: "Website & Wi-Fi QR Maker",
      category: "QR & Barcode",
      targetSuite: "qr-suite",
      icon: "🌐",
      desc: "High-Res Custom Color QR",
    },
    {
      name: "ID Card Barcode Generator",
      category: "QR & Barcode",
      targetSuite: "qr-suite",
      icon: "🏷️",
      desc: "Code-39 Printable Barcode",
    },

    // Image
    {
      name: "Image Converter",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🖼️",
      desc: "PNG, JPG, WEBP, SVG",
    },
    {
      name: "WEBP to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🔄",
      desc: "Lossless PNG export",
    },
    {
      name: "JFIF to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📷",
      desc: "Instant JFIF conversion",
    },
    {
      name: "PNG to SVG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "✨",
      desc: "Vector wrapper export",
    },
    {
      name: "HEIC to JPG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📱",
      desc: "iPhone photo converter",
    },
    {
      name: "HEIC to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📲",
      desc: "Transparent HEIC export",
    },
    {
      name: "WEBP to JPG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🌐",
      desc: "Universal JPG output",
    },
    {
      name: "SVG Converter",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🎨",
      desc: "Rasterize or wrap SVG",
    },

    // PDF & Documents
    {
      name: "PDF Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📄",
      desc: "Generate A4 PDFs",
    },
    {
      name: "Document Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📑",
      desc: "DOC, TXT, PDF",
    },
    {
      name: "Ebook Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📚",
      desc: "EPUB & Text tools",
    },
    {
      name: "PDF to Word",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📝",
      desc: "Editable Word export",
    },
    {
      name: "PDF to JPG",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "🖼️",
      desc: "Extract PDF pages",
    },
    {
      name: "DOCX to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📋",
      desc: "Instant print PDF",
    },
    {
      name: "JPG to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📇",
      desc: "Multi-image to PDF",
    },

    // Video & Audio
    {
      name: "Video Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎥",
      desc: "MP4, WEBM, MOV",
    },
    {
      name: "Audio Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎵",
      desc: "MP3, WAV, OGG",
    },
    {
      name: "MP3 Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎧",
      desc: "Fast audio extraction",
    },
    {
      name: "MP4 to MP3",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🔄",
      desc: "Video to audio track",
    },
    {
      name: "Video to MP3",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🔊",
      desc: "Extract clean MP3",
    },
    {
      name: "MOV to MP4",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "📹",
      desc: "QuickTime to MP4",
    },

    // GIF
    {
      name: "Video to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🎬",
      desc: "Animated clip capture",
    },
    {
      name: "MP4 to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🎞️",
      desc: "Convert MP4 frame",
    },
    {
      name: "WEBM to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "📽️",
      desc: "WebM animation tool",
    },
    {
      name: "GIF to MP4",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🔄",
      desc: "Optimize GIF size",
    },
    {
      name: "Image to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🖼️",
      desc: "Static to GIF format",
    },

    // Others
    {
      name: "Unit Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "📏",
      desc: "Length, Weight, Data",
    },
    {
      name: "Time Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "⏰",
      desc: "Sec, Min, Hours, Days",
    },
    {
      name: "Archive Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "📦",
      desc: " Multi-file ZIP packer",
    },
  ];

  const categories = [
    "All",
    "Cyber Cafe Pro",
    "QR & Barcode",
    "Image",
    "PDF & Documents",
    "Video & Audio",
    "GIF",
    "Others",
  ];

  const handleSelectCoreTool = (tool) => {
    setActiveTab(tool.id);
    setSelectedToolName(tool.name);
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSelectExtendedTool = (tool) => {
    setActiveTab(tool.targetSuite);
    setSelectedToolName(tool.name);
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const renderActiveTool = () => {
    switch (activeTab) {
      case "compressor":
        return <KbCompressor />;
      case "pdfmerger":
        return <PdfMerger />;
      case "ai-bg":
        return <AiBgRemoverStudio selectedTool={selectedToolName} />;
      case "passport":
        return <PassportStudio />;
      case "idcard":
        return <IdCardStudio />;
      case "cyber-suite":
        return <CyberCafeProSuite selectedTool={selectedToolName} />;
      case "qr-suite":
        return <QrBarcodeStudio selectedTool={selectedToolName} />;
      case "image-suite":
        return <ImageConverterSuite selectedTool={selectedToolName} />;
      case "doc-suite":
        return <DocumentConverterSuite selectedTool={selectedToolName} />;
      case "video-audio":
        return <VideoAudioSuite selectedTool={selectedToolName} />;
      case "gif-suite":
        return <GifConverterSuite selectedTool={selectedToolName} />;
      case "others-suite":
        return <OtherUtilitiesSuite selectedTool={selectedToolName} />;
      default:
        return <KbCompressor />;
    }
  };

  const filteredExtendedTools = extendedTools.filter((tool) => {
    const matchesCat =
      selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentTheme = BG_THEMES[bgTheme] || BG_THEMES.obsidian;

  return (
    <div
      className={`min-h-screen ${currentTheme.wrapperClass} text-white font-sans flex flex-col justify-between selection:bg-[#00e5ff] selection:text-black transition-colors duration-500 relative`}
    >
      {/* Subtle Cyber Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          selectedToolName={selectedToolName}
          onSelectCoreTool={handleSelectCoreTool}
          onSelectExtendedTool={handleSelectExtendedTool}
          coreTools={coreTools}
          extendedTools={extendedTools}
          bgTheme={bgTheme}
          setBgTheme={setBgTheme}
          themes={BG_THEMES}
        />

        <div className="max-w-7xl mx-auto px-4 mt-4">
          <AdBanner />
        </div>

        <main className="max-w-7xl mx-auto px-4 py-6" ref={workspaceRef}>
          {/* Compact Workspace Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
              <div>
                <span className="text-xs text-slate-400">Active Service: </span>
                <span className="text-sm font-extrabold text-[#00e5ff]">
                  {selectedToolName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>🔒 100% Browser-Processed (Files Never Leave Device)</span>
            </div>
          </div>

          {/* Active Tool Workspace Render Box */}
          <div className="bg-[#0b1120]/75 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] mb-12">
            {renderActiveTool()}
          </div>

          {/* Bottom Full Directory (Also synced with Top Menu) */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>🧭 Complete Services Directory</span>
                  <span className="text-xs bg-[#00e5ff]/15 text-[#00e5ff] px-2.5 py-0.5 rounded-full">
                    {extendedTools.length + coreTools.length} Tools
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All tools are accessible from the top menu bar or via quick
                  cards below
                </p>
              </div>

              <input
                type="text"
                placeholder="Filter directory (e.g. UPI QR, Scanner, WEBP to PNG)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00e5ff] w-full md:w-80"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                      : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Clickable Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredExtendedTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectExtendedTool(tool)}
                  className={`text-left p-4 rounded-2xl transition-all flex items-center space-x-3.5 group border cursor-pointer ${
                    selectedToolName === tool.name
                      ? "bg-slate-900 border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      : "bg-slate-900/50 border-white/5 hover:border-[#00e5ff]/50 hover:bg-slate-900/90"
                  }`}
                >
                  <span className="text-2xl p-2.5 bg-slate-950 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </span>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#00e5ff] transition-colors truncate">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {tool.desc || tool.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 border-t border-white/10 bg-[#050811]/80 mt-12">
        © {new Date().getFullYear()} FormFix Pro • Engineered by{" "}
        <span className="text-[#00e5ff] font-bold">Tech SQB</span>
      </footer>

      <Analytics />
    </div>
  );
}
