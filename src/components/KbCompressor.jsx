import React, { useState, useEffect, useCallback } from "react";

const EXAM_PRESETS = [
  {
    id: "custom",
    label: "⚡ Custom Target KB",
    targetKb: 50,
    width: 0,
    height: 0,
    desc: "Original Ratio • Any KB Limit",
  },
  {
    id: "ssc_photo",
    label: "🏛️ SSC / Railway Photo (20-50 KB)",
    targetKb: 45,
    width: 413,
    height: 531,
    desc: "3.5 × 4.5 cm • Supports Name & Date Stamp",
  },
  {
    id: "ssc_sig",
    label: "✍️ SSC / IBPS Signature (10-20 KB)",
    targetKb: 18,
    width: 472,
    height: 236,
    desc: "4.0 × 2.0 cm • High-Contrast B&W Ready",
  },
  {
    id: "upsc_photo",
    label: "🇮🇳 UPSC Photo (350×350 px)",
    targetKb: 45,
    width: 350,
    height: 350,
    desc: "Square Ratio • Under 50 KB",
  },
  {
    id: "pan_photo",
    label: "💳 NSDL / UTI PAN Photo",
    targetKb: 28,
    width: 213,
    height: 213,
    desc: "213 × 213 px (300 DPI) • Under 30 KB",
  },
  {
    id: "pan_sig",
    label: "🖋️ PAN Card Signature",
    targetKb: 15,
    width: 400,
    height: 200,
    desc: "Under 20 KB • Clean White Background",
  },
];

export default function KbCompressor() {
  const [sourceImg, setSourceImg] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [targetKb, setTargetKb] = useState(45);
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");

  // Special Exam Add-ons
  const [addNameStamp, setAddNameStamp] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [photoDate, setPhotoDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sigEnhanceMode, setSigEnhanceMode] = useState(false);
  const [sigThreshold, setSigThreshold] = useState(145);
  const [rotation, setRotation] = useState(0);

  // Output Result State
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [outputDims, setOutputDims] = useState({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    const found = EXAM_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTargetKb(found.targetKb);
      setCustomWidth(found.width);
      setCustomHeight(found.height);
      if (presetId.includes("sig")) {
        setSigEnhanceMode(true);
        setAddNameStamp(false);
      } else {
        setSigEnhanceMode(false);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setSourceImg(img);
        if (selectedPreset === "custom") {
          setCustomWidth(img.width);
          setCustomHeight(img.height);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processImage = useCallback(async () => {
    if (!sourceImg) return;
    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const isRotated90 = rotation % 180 !== 0;
    const rawW = isRotated90 ? sourceImg.height : sourceImg.width;
    const rawH = isRotated90 ? sourceImg.width : sourceImg.height;

    let targetW = customWidth > 0 ? Number(customWidth) : rawW;
    let targetH = customHeight > 0 ? Number(customHeight) : rawH;
    const targetBytes = Math.max(4, Number(targetKb)) * 1024;

    const renderToCanvas = (w, h) => {
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (isRotated90) {
        ctx.drawImage(sourceImg, -h / 2, -w / 2, h, w);
      } else {
        ctx.drawImage(sourceImg, -w / 2, -h / 2, w, h);
      }
      ctx.restore();

      // Signature B&W Scanner Mode
      if (sigEnhanceMode) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const val = avg < sigThreshold ? 15 : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // SSC Name & Date Stamp Strip
      if (addNameStamp) {
        const stripHeight = Math.round(h * 0.18);
        const stripY = h - stripHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, stripY, w, stripHeight);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(1, Math.round(w * 0.005));
        ctx.strokeRect(0, stripY, w, stripHeight);

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        const fontSize = Math.max(10, Math.round(stripHeight * 0.33));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;

        const displayName = (candidateName || "CANDIDATE NAME").toUpperCase();
        const formattedDate = photoDate
          ? photoDate.split("-").reverse().join("-")
          : "DD-MM-YYYY";

        ctx.fillText(displayName, w / 2, stripY + stripHeight * 0.42);
        ctx.fillText(
          `DOP: ${formattedDate}`,
          w / 2,
          stripY + stripHeight * 0.82,
        );
      }
    };

    const canvasToBlob = (qual) =>
      new Promise((resolve) => canvas.toBlob(resolve, outputFormat, qual));

    let currentW = targetW;
    let currentH = targetH;
    let bestBlob = null;

    for (let scaleStep = 0; scaleStep < 6; scaleStep++) {
      renderToCanvas(Math.round(currentW), Math.round(currentH));

      let minQ = 0.05;
      let maxQ = 0.98;
      let candidateBlob = null;

      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob = await canvasToBlob(midQ);
        if (!blob) break;

        if (blob.size <= targetBytes) {
          candidateBlob = blob;
          minQ = midQ;
        } else {
          maxQ = midQ;
        }
      }

      if (candidateBlob) {
        bestBlob = candidateBlob;
        break;
      } else {
        bestBlob = await canvasToBlob(0.05);
        if (customWidth > 0 && customHeight > 0) break;
        currentW *= 0.82;
        currentH *= 0.82;
      }
    }

    if (bestBlob) {
      setCompressedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(bestBlob);
      });
      setCompressedSize(bestBlob.size);
      setOutputDims({ w: Math.round(currentW), h: Math.round(currentH) });
    }
    setIsProcessing(false);
  }, [
    sourceImg,
    targetKb,
    customWidth,
    customHeight,
    outputFormat,
    addNameStamp,
    candidateName,
    photoDate,
    sigEnhanceMode,
    sigThreshold,
    rotation,
  ]);

  useEffect(() => {
    if (sourceImg) {
      const timer = setTimeout(() => processImage(), 120);
      return () => clearTimeout(timer);
    }
  }, [processImage, sourceImg]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Controls Panel */}
      <div className="lg:col-span-7 space-y-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-white">
            1. Select Exam Preset or Target Size
          </h2>
          <span className="text-xs text-cyan-400 font-semibold">
            Binary-Search KB Engine
          </span>
        </div>

        {/* Preset Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EXAM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                selectedPreset === preset.id
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md"
                  : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="text-xs font-bold">{preset.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Quick KB Target Buttons & Slider */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              Maximum File Size Limit (KB):
            </label>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs">
              Under {targetKb} KB
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[10, 15, 20, 30, 50, 100, 200].map((kb) => (
              <button
                key={kb}
                onClick={() => setTargetKb(kb)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition ${
                  Number(targetKb) === kb
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {kb} KB
              </button>
            ))}
          </div>

          <input
            type="range"
            min="5"
            max="500"
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Dimensions & Format */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              Width (px) (0 = Auto)
            </label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              Height (px) (0 = Auto)
            </label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="image/jpeg">JPG (Best)</option>
              <option value="image/webp">WEBP</option>
              <option value="image/png">PNG</option>
            </select>
          </div>
        </div>

        {/* Exclusive Exam Add-ons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-amber-300">
                🏷️ Add Name & Date on Photo
              </span>
              <input
                type="checkbox"
                checked={addNameStamp}
                onChange={(e) => setAddNameStamp(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
            {addNameStamp && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter Candidate Name..."
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-cyan-300">
                ✍️ Clean B&W Signature Mode
              </span>
              <input
                type="checkbox"
                checked={sigEnhanceMode}
                onChange={(e) => setSigEnhanceMode(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
            {sigEnhanceMode && (
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Ink Darkness</span>
                  <span>{sigThreshold}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="210"
                  value={sigThreshold}
                  onChange={(e) => setSigThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Upload & Live Preview Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-white">
              2. Upload & Instant Download
            </h2>
            {sourceImg && (
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg font-bold text-slate-200 cursor-pointer"
              >
                🔄 Rotate 90°
              </button>
            )}
          </div>

          <label className="w-full border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-950/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <span className="text-3xl mb-1">📤</span>
            <span className="text-xs font-bold text-white">
              {sourceFile
                ? sourceFile.name
                : "Click to Select Photo or Signature"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Supports JPG, PNG, WEBP
            </span>
          </label>
        </div>

        {compressedUrl ? (
          <div className="space-y-4 my-auto">
            <div className="relative bg-slate-950 rounded-2xl p-3 border border-slate-800 flex items-center justify-center min-h-[210px]">
              <img
                src={compressedUrl}
                alt="Compressed output"
                className="max-h-56 object-contain rounded shadow"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center rounded-2xl text-xs font-bold text-indigo-300">
                  ⚡ Optimizing to Exact KB...
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400">Original</div>
                <div className="text-xs font-bold text-slate-200">
                  {sourceFile ? (sourceFile.size / 1024).toFixed(1) : 0} KB
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Final Size</div>
                <div className="text-sm font-black text-emerald-400">
                  {(compressedSize / 1024).toFixed(2)} KB ✅
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Resolution</div>
                <div className="text-xs font-bold text-indigo-300">
                  {outputDims.w}×{outputDims.h} px
                </div>
              </div>
            </div>

            <a
              href={compressedUrl}
              download={`FormFix_${Math.round(compressedSize / 1024)}KB_${
                sourceFile?.name.split(".")[0] || "image"
              }.jpg`}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              ⬇️ Download Ready Image ({(compressedSize / 1024).toFixed(1)} KB)
            </a>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Upload any photo or signature to see live KB compression preview.
          </div>
        )}
      </div>
    </div>
  );
}
