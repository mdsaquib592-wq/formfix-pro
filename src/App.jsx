import React, { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import IdCardStudio from "./components/IdCardStudio";
import KbCompressor from "./components/KbCompressor";
import PassportStudio from "./components/PassportStudio";
import PdfMerger from "./components/PdfMerger";
import AdBanner from "./components/AdBanner";

// Newly added separated category suites
import ImageConverterSuite from "./components/ImageConverterSuite";
import DocumentConverterSuite from "./components/DocumentConverterSuite";
import VideoAudioSuite from "./components/VideoAudioSuite";
import GifConverterSuite from "./components/GifConverterSuite";
import OtherUtilitiesSuite from "./components/OtherUtilitiesSuite";

import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("compressor");
  const [selectedToolName, setSelectedToolName] = useState("KB Compressor");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const workspaceRef = useRef(null);

  // Original 4 Studio Tools
  const coreTools = [
    { id: "compressor", name: "KB Compressor", icon: "🗜️" },
    { id: "pdfmerger", name: "PDF Merger", icon: "🔗" },
    { id: "passport", name: "Passport Studio", icon: "🛂" },
    { id: "idcard", name: "ID Card Studio", icon: "🪪" },
  ];

  // Full FreeConvert services list mapped to their respective functional suite
  const extendedTools = [
    // Video & Audio
    {
      name: "Video Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎥",
    },
    {
      name: "Audio Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎵",
    },
    {
      name: "MP3 Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎧",
    },
    {
      name: "MP4 to MP3",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🔄",
    },
    {
      name: "Video to MP3",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🔊",
    },
    {
      name: "MP4 Converter",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎞️",
    },
    {
      name: "MOV to MP4",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "📹",
    },
    {
      name: "MP3 to OGG",
      category: "Video & Audio",
      targetSuite: "video-audio",
      icon: "🎵",
    },

    // Image
    {
      name: "Image Converter",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🖼️",
    },
    {
      name: "WEBP to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🔄",
    },
    {
      name: "JFIF to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📷",
    },
    {
      name: "PNG to SVG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "✨",
    },
    {
      name: "HEIC to JPG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📱",
    },
    {
      name: "HEIC to PNG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "📲",
    },
    {
      name: "WEBP to JPG",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🌐",
    },
    {
      name: "SVG Converter",
      category: "Image",
      targetSuite: "image-suite",
      icon: "🎨",
    },

    // PDF & Documents
    {
      name: "PDF Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📄",
    },
    {
      name: "Document Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📑",
    },
    {
      name: "Ebook Converter",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📚",
    },
    {
      name: "PDF to Word",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📝",
    },
    {
      name: "PDF to JPG",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "🖼️",
    },
    {
      name: "PDF to EPUB",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📖",
    },
    {
      name: "EPUB to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📘",
    },
    {
      name: "HEIC to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📂",
    },
    {
      name: "DOCX to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📋",
    },
    {
      name: "JPG to PDF",
      category: "PDF & Documents",
      targetSuite: "doc-suite",
      icon: "📇",
    },

    // GIF
    {
      name: "Video to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🎬",
    },
    {
      name: "MP4 to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🎞️",
    },
    {
      name: "WEBM to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "📽️",
    },
    {
      name: "APNG to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🎞️",
    },
    {
      name: "GIF to MP4",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🔄",
    },
    {
      name: "GIF to APNG",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "✨",
    },
    {
      name: "Image to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "🖼️",
    },
    {
      name: "MOV to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "📹",
    },
    {
      name: "AVI to GIF",
      category: "GIF",
      targetSuite: "gif-suite",
      icon: "📼",
    },

    // Others
    {
      name: "Unit Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "📏",
    },
    {
      name: "Time Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "⏰",
    },
    {
      name: "Archive Converter",
      category: "Others",
      targetSuite: "others-suite",
      icon: "📦",
    },
  ];

  const categories = [
    "All",
    "Video & Audio",
    "Image",
    "PDF & Documents",
    "GIF",
    "Others",
  ];

  const handleSelectExtendedTool = (tool) => {
    setActiveTab(tool.targetSuite);
    setSelectedToolName(tool.name);
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderActiveTool = () => {
    switch (activeTab) {
      case "compressor":
        return <KbCompressor />;
      case "pdfmerger":
        return <PdfMerger />;
      case "passport":
        return <PassportStudio />;
      case "idcard":
        return <IdCardStudio />;
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans flex flex-col justify-between selection:bg-[#00e5ff] selection:text-black">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 mt-4">
          <AdBanner />
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8" ref={workspaceRef}>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#00e5ff] to-blue-500 bg-clip-text text-transparent">
              FormFix Pro Suite
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              All-in-one document processing, image optimization, and file
              conversion workspace.
            </p>
          </div>

          {/* Core Studio Switcher Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-3">
              {coreTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTab(tool.id);
                    setSelectedToolName(tool.name);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                    activeTab === tool.id
                      ? "bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-[#111827] text-gray-300 hover:bg-gray-800 border border-gray-800"
                  }`}
                >
                  <span>{tool.icon}</span>
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Workspace Render Box */}
          <div className="bg-[#111827]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl mb-12">
            {renderActiveTool()}
          </div>

          {/* All Conversion Services Directory */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  All Conversion Services
                </h2>
                <p className="text-xs text-gray-400">
                  Click any utility below to launch its dedicated converter
                  above
                </p>
              </div>

              <input
                type="text"
                placeholder="Search any tool (e.g. WEBP to PNG, MP4 to MP3)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-[#111827] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-[#00e5ff] w-full md:w-80"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#00e5ff] text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                      : "bg-[#111827] text-gray-400 hover:bg-gray-800 border border-gray-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Clickable Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredExtendedTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectExtendedTool(tool)}
                  className={`text-left p-4 rounded-xl transition-all flex items-center space-x-3 group border ${
                    selectedToolName === tool.name
                      ? "bg-[#111827] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                      : "bg-[#111827]/40 border-gray-800/60 hover:border-[#00e5ff]/50"
                  }`}
                >
                  <span className="text-2xl p-2 bg-gray-900 rounded-lg group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 group-hover:text-[#00e5ff] transition-colors">
                      {tool.name}
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {tool.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-900 mt-12">
        © {new Date().getFullYear()} FormFix Pro • Powered by React & Vite
      </footer>

      <Analytics />
    </div>
  );
}
