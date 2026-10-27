import React, { useState } from "react";
import Navbar from "./components/Navbar";
import AdBanner from "./components/AdBanner";
import KbCompressor from "./components/KbCompressor";
import PassportStudio from "./components/PassportStudio";
import IdCardStudio from "./components/IdCardStudio";
import PdfMerger from "./components/PdfMerger";

export default function App() {
  const [activeTab, setActiveTab] = useState("compressor");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Sticky Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Top Banner Ad Slot */}
      <AdBanner slotLabel="Sponsored Top Banner" width={728} height={90} />

      {/* Main Studio Content */}
      <main className="max-w-6xl w-full mx-auto px-4 py-5 flex-1">
        {activeTab === "compressor" && <KbCompressor />}
        {activeTab === "passport" && <PassportStudio />}
        {activeTab === "idstudio" && <IdCardStudio />}
        {activeTab === "pdfmerger" && <PdfMerger />}
      </main>

      {/* Bottom Ad Slot & Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <AdBanner
            slotLabel="Sponsored Bottom Unit"
            width={300}
            height={250}
          />
          <p className="text-xs text-slate-500">
            FormFix Pro Studio 2026 • 100% Browser-Based Processing (Your files
            never leave your computer or phone)
          </p>
        </div>
      </footer>
    </div>
  );
}
