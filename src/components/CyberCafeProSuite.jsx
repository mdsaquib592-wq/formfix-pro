import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";

export default function CyberCafeProSuite({
  selectedTool = "Photo + Signature Joint Merger",
}) {
  // Determine active sub-mode based on clicked menu item
  const [subMode, setSubMode] = useState("joint"); // 'joint' | 'backdrop' | 'scanner'

  useEffect(() => {
    const lower = selectedTool.toLowerCase();
    if (lower.includes("background") || lower.includes("backdrop")) {
      setSubMode("backdrop");
    } else if (lower.includes("scanner") || lower.includes("enhance")) {
      setSubMode("scanner");
    } else {
      setSubMode("joint");
    }
  }, [selectedTool]);

  // ================= 1. PHOTO + SIGNATURE JOINT MERGER STATE =================
  const [photoImg, setPhotoImg] = useState(null);
  const [sigImg, setSigImg] = useState(null);
  const [mergeLayout, setMergeLayout] = useState("vertical"); // 'vertical' | 'horizontal'
  const [jointLabel, setJointLabel] = useState("");
  const [jointPreview, setJointPreview] = useState(null);

  const loadImg = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setter(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderJointCanvas = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (mergeLayout === "vertical") {
      // Standard 3.5cm x 4.5cm photo on top + 3.5cm x 1.5cm signature below
      canvas.width = 413;
      canvas.height = 700;
    } else {
      // Side by side
      canvas.width = 820;
      canvas.height = 531;
    }

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mergeLayout === "vertical") {
      // Draw Photo Box (413 x 520)
      if (photoImg) {
        ctx.drawImage(photoImg, 10, 10, 393, 500);
      } else {
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(10, 10, 393, 500);
        ctx.fillStyle = "#64748B";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PASSPORT PHOTO AREA", 206, 260);
      }
      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 393, 500);

      // Draw Signature Box (393 x 150)
      if (sigImg) {
        ctx.drawImage(sigImg, 10, 525, 393, 130);
      } else {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(10, 525, 393, 130);
        ctx.fillStyle = "#64748B";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SIGNATURE AREA", 206, 595);
      }
      ctx.strokeRect(10, 525, 393, 130);

      if (jointLabel) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(jointLabel.toUpperCase(), 206, 682);
      }
    } else {
      // Horizontal Side-by-Side
      if (photoImg) {
        ctx.drawImage(photoImg, 15, 15, 380, 501);
      } else {
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(15, 15, 380, 501);
        ctx.fillStyle = "#64748B";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PHOTO (LEFT)", 205, 265);
      }
      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 15, 380, 501);

      if (sigImg) {
        ctx.drawImage(sigImg, 415, 165, 390, 200);
      } else {
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(415, 165, 390, 200);
        ctx.fillStyle = "#64748B";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SIGNATURE (RIGHT)", 610, 265);
      }
      ctx.strokeRect(415, 165, 390, 200);
    }

    setJointPreview(canvas.toDataURL("image/jpeg", 0.92));
  }, [photoImg, sigImg, mergeLayout, jointLabel]);

  useEffect(() => {
    if (subMode === "joint") renderJointCanvas();
  }, [subMode, renderJointCanvas]);

  // ================= 2. STUDIO BACKDROP & COLOR TUNER STATE =================
  const [bgSourceImg, setBgSourceImg] = useState(null);
  const [targetBgColor, setTargetBgColor] = useState("#FFFFFF");
  const [tolerance, setTolerance] = useState(48);
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(105);
  const [bgPreview, setBgPreview] = useState(null);

  const processBackdrop = useCallback(() => {
    if (!bgSourceImg) return;
    const canvas = document.createElement("canvas");
    const w = 450;
    const h = 550;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // Temp canvas to get original pixels
    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tCtx = temp.getContext("2d");
    tCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    tCtx.drawImage(bgSourceImg, 0, 0, w, h);

    const imgData = tCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample top-left & top-right corner color as the background reference
    const r0 = data[0],
      g0 = data[1],
      b0 = data[2];

    // Parse target hex
    const hex = targetBgColor.replace("#", "");
    const tr = parseInt(hex.substring(0, 2), 16);
    const tg = parseInt(hex.substring(2, 4), 16);
    const tb = parseInt(hex.substring(4, 6), 16);

    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i] - r0);
      const dg = Math.abs(data[i + 1] - g0);
      const db = Math.abs(data[i + 2] - b0);
      const dist = (dr + dg + db) / 3;
      if (dist < tolerance) {
        data[i] = tr;
        data[i + 1] = tg;
        data[i + 2] = tb;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setBgPreview(canvas.toDataURL("image/jpeg", 0.95));
  }, [bgSourceImg, targetBgColor, tolerance, brightness, contrast]);

  useEffect(() => {
    if (subMode === "backdrop") processBackdrop();
  }, [subMode, processBackdrop]);

  // ================= 3. DOCUMENT CAMSCANNER FILTER STATE =================
  const [scanImg, setScanImg] = useState(null);
  const [scanMode, setScanMode] = useState("bw"); // 'bw' | 'magic' | 'gray'
  const [scanThreshold, setScanThreshold] = useState(150);
  const [scanPreview, setScanPreview] = useState(null);

  const processScan = useCallback(() => {
    if (!scanImg) return;
    const canvas = document.createElement("canvas");
    const maxW = 1200;
    const scale = scanImg.width > maxW ? maxW / scanImg.width : 1;
    canvas.width = Math.round(scanImg.width * scale);
    canvas.height = Math.round(scanImg.height * scale);
    const ctx = canvas.getContext("2d");

    if (scanMode === "magic") {
      ctx.filter = "contrast(145%) brightness(112%) saturate(130%)";
      ctx.drawImage(scanImg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(scanImg, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (scanMode === "bw") {
          const v = lum < scanThreshold ? 12 : 255;
          d[i] = d[i + 1] = d[i + 2] = v;
        } else {
          // Crisp Grayscale
          const v = Math.min(255, Math.max(0, (lum - 128) * 1.3 + 135));
          d[i] = d[i + 1] = d[i + 2] = v;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    setScanPreview(canvas.toDataURL("image/jpeg", 0.92));
  }, [scanImg, scanMode, scanThreshold]);

  useEffect(() => {
    if (subMode === "scanner") processScan();
  }, [subMode, processScan]);

  const downloadScannedPdf = () => {
    if (!scanPreview) return;
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(scanPreview, "JPEG", 10, 10, 190, 277);
    pdf.save(`Scanned_Document_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tool Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-3 py-1 rounded-full">
            🏪 Cyber Cafe & Exam Form Pro Suite
          </span>
          <h2 className="text-2xl font-black text-white mt-2">
            {selectedTool}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Specialized tools for government exam portals, CSC centers, and
            instant document preparation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: "joint", label: "🔗 Photo + Sign Merger" },
            { id: "backdrop", label: "🎨 Studio Backdrop Changer" },
            { id: "scanner", label: "🖨️ Document CamScanner" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubMode(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                subMode === tab.id
                  ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: PHOTO + SIGNATURE JOINT MERGER */}
      {subMode === "joint" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white">
              Combine Candidate Photo & Signature in 1 Frame
            </h3>
            <p className="text-xs text-slate-400">
              Required by BPSC, UPPSC, State Police, and University portals
              where photo & signature must be uploaded as a single combined JPG.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 flex flex-col items-center justify-center min-h-[110px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => loadImg(e.target.files?.[0], setPhotoImg)}
                  className="hidden"
                />
                <span className="text-2xl mb-1">🧑</span>
                <span className="text-xs font-bold text-white">
                  {photoImg ? "✅ Photo Uploaded" : "1. Upload Passport Photo"}
                </span>
              </label>

              <label className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 flex flex-col items-center justify-center min-h-[110px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => loadImg(e.target.files?.[0], setSigImg)}
                  className="hidden"
                />
                <span className="text-2xl mb-1">✍️</span>
                <span className="text-xs font-bold text-white">
                  {sigImg ? "✅ Signature Uploaded" : "2. Upload Signature"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Layout Orientation
                </label>
                <select
                  value={mergeLayout}
                  onChange={(e) => setMergeLayout(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="vertical">
                    Vertical (Photo Top, Sign Bottom)
                  </option>
                  <option value="horizontal">Horizontal (Side-by-Side)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Optional Bottom Name/Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. MD SAQUIB • 29-10-2026"
                  value={jointLabel}
                  onChange={(e) => setJointLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between items-center space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center w-full min-h-[280px]">
              {jointPreview && (
                <img
                  src={jointPreview}
                  alt="Joint Preview"
                  className="max-h-72 object-contain rounded shadow-lg"
                />
              )}
            </div>
            <a
              href={jointPreview}
              download={`Combined_Photo_Sign_${Date.now()}.jpg`}
              className="w-full py-3.5 bg-[#00e5ff] hover:bg-cyan-400 text-black font-black text-center rounded-xl text-sm shadow-[0_0_15px_rgba(0,229,255,0.4)] transition"
            >
              ⬇️ Download Combined Photo + Signature (.JPG)
            </a>
          </div>
        </div>
      )}

      {/* MODE 2: STUDIO BACKDROP CHANGER */}
      {subMode === "backdrop" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white">
              Smart Passport Backdrop Color Changer & Studio Tuner
            </h3>
            <p className="text-xs text-slate-400">
              Automatically replaces plain wall backgrounds with official White,
              Passport Blue, or Red studio colors.
            </p>

            <label className="border-2 border-dashed border-[#00e5ff]/40 hover:border-[#00e5ff] rounded-2xl p-5 text-center cursor-pointer bg-slate-950/60 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => loadImg(e.target.files?.[0], setBgSourceImg)}
                className="hidden"
              />
              <span className="text-3xl mb-1">🎨</span>
              <span className="text-xs font-bold text-white">
                Upload Portrait Photo with Plain Wall Background
              </span>
            </label>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Select Studio Backdrop Color:
                </span>
                <div className="flex gap-2">
                  {[
                    { color: "#FFFFFF", name: "Pure White" },
                    { color: "#0066CC", name: "Passport Blue" },
                    { color: "#38BDF8", name: "Sky Blue" },
                    { color: "#DC2626", name: "Studio Red" },
                    { color: "#E2E8F0", name: "Light Grey" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setTargetBgColor(c.color)}
                      title={c.name}
                      style={{ backgroundColor: c.color }}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                        targetBgColor === c.color
                          ? "border-[#00e5ff] scale-125 shadow-lg"
                          : "border-slate-600"
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={targetBgColor}
                    onChange={(e) => setTargetBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Wall Color Match Sensitivity</span>
                  <span>{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="110"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-[#00e5ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Face Brightness ({brightness}%)
                  </span>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Contrast ({contrast}%)
                  </span>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between items-center space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center w-full min-h-[280px]">
              {bgPreview ? (
                <img
                  src={bgPreview}
                  alt="Backdrop Preview"
                  className="max-h-72 object-contain rounded shadow-lg border border-slate-700"
                />
              ) : (
                <span className="text-xs text-slate-500">
                  Upload a photo to preview studio background replacement
                </span>
              )}
            </div>
            {bgPreview && (
              <a
                href={bgPreview}
                download={`Passport_Backdrop_${Date.now()}.jpg`}
                className="w-full py-3.5 bg-[#00e5ff] hover:bg-cyan-400 text-black font-black text-center rounded-xl text-sm shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              >
                ⬇️ Download Studio Photo (.JPG)
              </a>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: DOCUMENT CAMSCANNER ENHANCER */}
      {subMode === "scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white">
              A4 Document Scanner & Shadow Remover
            </h3>
            <p className="text-xs text-slate-400">
              Convert dimly-lit mobile photos of marksheets, certificates, or
              Aadhaar cards into crisp, laser-printer ready scans.
            </p>

            <label className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-5 text-center cursor-pointer bg-slate-950/60 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => loadImg(e.target.files?.[0], setScanImg)}
                className="hidden"
              />
              <span className="text-3xl mb-1">📄</span>
              <span className="text-xs font-bold text-white">
                Upload Document Photo to Clean & Scan
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bw", label: "🖨️ B&W Laser Scan" },
                { id: "magic", label: "✨ Magic Color" },
                { id: "gray", label: "🪨 Crisp Grayscale" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setScanMode(m.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    scanMode === m.id
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {scanMode === "bw" && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Text Darkness / Shadow Cut</span>
                  <span>{scanThreshold}</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="210"
                  value={scanThreshold}
                  onChange={(e) => setScanThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[280px]">
              {scanPreview ? (
                <img
                  src={scanPreview}
                  alt="Scanned Document"
                  className="max-h-72 object-contain rounded shadow-lg"
                />
              ) : (
                <span className="text-xs text-slate-500">
                  Upload any document image to preview clean scan
                </span>
              )}
            </div>

            {scanPreview && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadScannedPdf}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  📄 Download A4 PDF
                </button>
                <a
                  href={scanPreview}
                  download={`Cleaned_Scan_${Date.now()}.jpg`}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm text-center"
                >
                  🖼️ Download Clean JPG
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
