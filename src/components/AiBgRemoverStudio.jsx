import React, { useState, useEffect, useRef, useCallback } from "react";

const STUDIO_BACKDROPS = [
  {
    id: "transparent",
    name: "Transparent PNG",
    color: "transparent",
    badge: "Checker",
  },
  { id: "white", name: "Pure White (SSC/UPSC)", color: "#FFFFFF" },
  { id: "passport_blue", name: "Passport Royal Blue", color: "#0052CC" },
  { id: "sky_blue", name: "Light Sky Blue", color: "#38BDF8" },
  { id: "red", name: "Visa Studio Red", color: "#DC2626" },
  { id: "grey", name: "Corporate Slate Grey", color: "#CBD5E1" },
  {
    id: "gradient_cyber",
    name: "Cyber Cyan Glow",
    color: "linear-gradient(135deg, #00e5ff, #1d4ed8)",
  },
  {
    id: "gradient_sunset",
    name: "Royal Indigo",
    color: "linear-gradient(135deg, #4f46e5, #9333ea)",
  },
];

export default function AiBgRemoverStudio({
  selectedTool = "AI Background Remover",
}) {
  const [sourceFile, setSourceFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [cutoutImg, setCutoutImg] = useState(null); // Transparent foreground Image object
  const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);

  // AI Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [engineMode, setEngineMode] = useState("neural"); // 'neural' | 'smart_edge'

  // Post-Processing Studio Customizations
  const [selectedBg, setSelectedBg] = useState("transparent");
  const [customColor, setCustomColor] = useState("#00e5ff");
  const [addWhiteOutline, setAddWhiteOutline] = useState(false);
  const [addDropShadow, setAddDropShadow] = useState(false);
  const [featherSensitivity, setFeatherSensitivity] = useState(42);
  const [compareSlider, setCompareSlider] = useState(50);
  const [showComparison, setShowComparison] = useState(false);

  const canvasRef = useRef(null);

  // Handle Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setCutoutImg(null);
    setFinalPreviewUrl(null);
    runAiBackgroundRemoval(file, url);
  };

  // Primary AI Removal Pipeline (Neural WASM with Smart Corner Flood-Fill Fallback)
  const runAiBackgroundRemoval = async (file, fallbackUrl) => {
    setIsProcessing(true);
    setProgressText("Initializing AI Neural Segmentation Engine...");

    if (engineMode === "neural") {
      try {
        // Dynamically import @imgly/background-removal so app builds cleanly even if not yet installed
        const imglyModule = await import("@imgly/background-removal");
        const removeBackground =
          imglyModule.removeBackground || imglyModule.default;

        const resultBlob = await removeBackground(file, {
          progress: (key, current, total) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              setProgressText(`AI Model Processing (${key}): ${pct}%`);
            }
          },
        });

        const cutoutUrl = URL.createObjectURL(resultBlob);
        const img = new Image();
        img.onload = () => {
          setCutoutImg(img);
          setIsProcessing(false);
          setProgressText("");
        };
        img.src = cutoutUrl;
        return;
      } catch (err) {
        console.warn(
          "Neural WASM package not detected or offline, switching to Smart Edge AI Cutout:",
          err,
        );
        setProgressText("Running Smart Edge-Flood AI Cutout...");
      }
    }

    // Fallback: Instant Smart Corner-Sampled Edge Cutout with Alpha Feathering
    runSmartEdgeFallback(fallbackUrl || originalUrl, featherSensitivity);
  };

  const runSmartEdgeFallback = useCallback((imgUrl, toleranceVal) => {
    if (!imgUrl) return;
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 1000;
      const scale =
        Math.max(img.width, img.height) > maxDim
          ? maxDim / Math.max(img.width, img.height)
          : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample 4 corners/edges to detect background color profile
      const samplePoints = [
        [2, 2],
        [w - 3, 2],
        [2, Math.floor(h / 2)],
        [w - 3, Math.floor(h / 2)],
        [Math.floor(w / 2), 2],
      ];

      const bgSamples = samplePoints.map(([sx, sy]) => {
        const idx = (sy * w + sx) * 4;
        return [data[idx], data[idx + 1], data[idx + 2]];
      });

      const tol = toleranceVal * 1.6;
      const softEdge = tol + 22;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];

        // Find minimum color distance to any sampled background point
        let minDist = 999;
        for (const [br, bg, bb] of bgSamples) {
          const dist = Math.sqrt(
            (r - br) ** 2 * 0.3 + (g - bg) ** 2 * 0.59 + (b - bb) ** 2 * 0.11,
          );
          if (dist < minDist) minDist = dist;
        }

        if (minDist < tol) {
          data[i + 3] = 0; // 100% Transparent
        } else if (minDist < softEdge) {
          // Smooth anti-aliased feather edge
          const alphaFactor = (minDist - tol) / (softEdge - tol);
          data[i + 3] = Math.round(alphaFactor * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const resultImg = new Image();
      resultImg.onload = () => {
        setCutoutImg(resultImg);
        setIsProcessing(false);
        setProgressText("");
      };
      resultImg.src = canvas.toDataURL("image/png");
    };
    img.src = imgUrl;
  }, []);

  // Re-run smart edge if user adjusts sensitivity slider in Smart Edge mode
  useEffect(() => {
    if (originalUrl && engineMode === "smart_edge") {
      const timer = setTimeout(() => {
        runSmartEdgeFallback(originalUrl, featherSensitivity);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [featherSensitivity, engineMode, originalUrl, runSmartEdgeFallback]);

  // Composite Foreground Cutout + Selected Studio Backdrop + Effects
  useEffect(() => {
    if (!cutoutImg) return;

    const canvas = document.createElement("canvas");
    const w = cutoutImg.width;
    const h = cutoutImg.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // 1. Draw Selected Background
    const bgObj = STUDIO_BACKDROPS.find((b) => b.id === selectedBg);
    if (selectedBg === "custom") {
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgObj && bgObj.color !== "transparent") {
      if (bgObj.color.startsWith("linear-gradient")) {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        if (bgObj.id === "gradient_cyber") {
          grad.addColorStop(0, "#00e5ff");
          grad.addColorStop(1, "#1d4ed8");
        } else {
          grad.addColorStop(0, "#4f46e5");
          grad.addColorStop(1, "#9333ea");
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bgObj.color;
      }
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Optional YouTube / Sticker White Outline Effect
    if (addWhiteOutline) {
      const offsets = [
        [-6, 0],
        [6, 0],
        [0, -6],
        [0, 6],
        [-4, -4],
        [4, -4],
        [-4, 4],
        [4, 4],
      ];
      const outlineCanvas = document.createElement("canvas");
      outlineCanvas.width = w;
      outlineCanvas.height = h;
      const oCtx = outlineCanvas.getContext("2d");

      offsets.forEach(([ox, oy]) => {
        oCtx.drawImage(cutoutImg, ox, oy, w, h);
      });
      oCtx.globalCompositeOperation = "source-in";
      oCtx.fillStyle = "#FFFFFF";
      oCtx.fillRect(0, 0, w, h);

      ctx.drawImage(outlineCanvas, 0, 0);
    }

    // 3. Optional Studio Portrait Drop Shadow
    if (addDropShadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(cutoutImg, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(cutoutImg, 0, 0, w, h);
    }

    canvasRef.current = canvas;
    setFinalPreviewUrl(canvas.toDataURL("image/png"));
  }, [cutoutImg, selectedBg, customColor, addWhiteOutline, addDropShadow]);

  const downloadImage = (format = "png") => {
    if (!canvasRef.current) return;
    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95);
    const link = document.createElement("a");
    const baseName =
      sourceFile?.name.substring(0, sourceFile.name.lastIndexOf(".")) ||
      "photo";
    link.download = `${baseName}-ai-nobg.${format}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-3 py-1 rounded-full">
              ✨ AI Vision Studio
            </span>
            <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              100% Free & Private
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-2">
            {selectedTool}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Remove image backgrounds in 1 click, export transparent PNGs, or
            apply instant Passport/Studio backdrops.
          </p>
        </div>

        {/* AI Engine Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setEngineMode("neural");
              if (sourceFile) runAiBackgroundRemoval(sourceFile, originalUrl);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              engineMode === "neural"
                ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧠 Deep Neural AI
          </button>
          <button
            onClick={() => {
              setEngineMode("smart_edge");
              if (originalUrl)
                runSmartEdgeFallback(originalUrl, featherSensitivity);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              engineMode === "smart_edge"
                ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Instant Edge Cutout
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls Panel */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
          {/* Upload Dropzone */}
          <label className="w-full border-2 border-dashed border-[#00e5ff]/40 hover:border-[#00e5ff] bg-slate-950/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
              🪄
            </div>
            <span className="text-sm font-extrabold text-white">
              {sourceFile
                ? sourceFile.name
                : "Upload Photo to Remove Background"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Supports Portraits, Products, Signatures & Logos (JPG, PNG, WEBP)
            </span>
          </label>

          {/* Studio Backdrop Replacement Palette */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-200">
                1. Choose New Background:
              </label>
              <span className="text-[11px] text-[#00e5ff] font-semibold">
                {STUDIO_BACKDROPS.find((b) => b.id === selectedBg)?.name ||
                  "Custom Color"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {STUDIO_BACKDROPS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg.id)}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedBg === bg.id
                      ? "border-[#00e5ff] bg-[#00e5ff]/15 shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full border border-white/20 shadow-inner"
                    style={{
                      background:
                        bg.id === "transparent"
                          ? "repeating-conic-gradient(#334155 0% 25%, #0f172a 0% 50%) 50% / 10px 10px"
                          : bg.color,
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full">
                    {bg.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Color Picker Row */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                🎨 Or Pick Any Custom Backdrop Color:
              </span>
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedBg("custom");
                }}
                className="w-8 h-8 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* Edge Refinement Slider (Visible in Smart Edge Mode) */}
          {engineMode === "smart_edge" && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">
                  🎯 Edge Cutout Sensitivity
                </span>
                <span className="text-[#00e5ff] font-black">
                  {featherSensitivity}%
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="85"
                value={featherSensitivity}
                onChange={(e) => setFeatherSensitivity(Number(e.target.value))}
                className="w-full accent-[#00e5ff] cursor-pointer"
              />
            </div>
          )}

          {/* Studio Effects (Sticker Outline & 3D Shadow) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold text-slate-200 block">
              2. Studio Cutout Enhancements:
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addWhiteOutline}
                  onChange={(e) => setAddWhiteOutline(e.target.checked)}
                  className="accent-[#00e5ff] w-4 h-4"
                />
                <span className="font-bold text-slate-200">
                  ⚪ Sticker Outline
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addDropShadow}
                  onChange={(e) => setAddDropShadow(e.target.checked)}
                  className="accent-[#00e5ff] w-4 h-4"
                />
                <span className="font-bold text-slate-200">
                  🌑 3D Drop Shadow
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Live Preview & Before/After Comparison Panel */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🖼️ Live AI Cutout Workspace</span>
            </h3>

            {finalPreviewUrl && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showComparison
                    ? "bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {showComparison
                  ? "✨ Viewing Before/After Slider"
                  : "↔️ Compare Before / After"}
              </button>
            )}
          </div>

          {/* Canvas / Image Preview Container with Transparency Checkerboard */}
          <div
            className="relative rounded-2xl border border-slate-800 flex items-center justify-center min-h-[340px] overflow-hidden"
            style={{
              background:
                "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px",
            }}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                <div className="text-sm font-extrabold text-white">
                  {progressText || "Removing Background with AI..."}
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Running 100% locally in your browser — your photo is never
                  uploaded to any external server.
                </p>
              </div>
            )}

            {finalPreviewUrl ? (
              showComparison && originalUrl ? (
                <div className="relative w-full max-h-[380px] flex items-center justify-center select-none">
                  {/* After Image (Full) */}
                  <img
                    src={finalPreviewUrl}
                    alt="AI Cutout"
                    className="max-h-[360px] object-contain rounded-lg"
                  />
                  {/* Before Image (Clipped by Slider) */}
                  <img
                    src={originalUrl}
                    alt="Original"
                    style={{
                      clipPath: `inset(0 ${100 - compareSlider}% 0 0)`,
                    }}
                    className="absolute max-h-[360px] object-contain rounded-lg"
                  />
                  {/* Slider Control */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compareSlider}
                    onChange={(e) => setCompareSlider(Number(e.target.value))}
                    className="absolute bottom-3 w-3/4 accent-[#00e5ff] cursor-ew-resize z-10"
                  />
                </div>
              ) : (
                <img
                  src={finalPreviewUrl}
                  alt="AI Background Removed"
                  className="max-h-[360px] w-auto object-contain rounded-lg shadow-2xl transition-all"
                />
              )
            ) : (
              <div className="text-center p-8 space-y-2">
                <div className="text-4xl">✨</div>
                <p className="text-xs font-bold text-slate-300">
                  No Image Loaded Yet
                </p>
                <p className="text-[11px] text-slate-500">
                  Upload any portrait, signature, or product photo on the left
                  to isolate the subject automatically.
                </p>
              </div>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => downloadImage("png")}
              disabled={!finalPreviewUrl || isProcessing}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 hover:from-cyan-400 hover:to-[#00e5ff] disabled:opacity-40 text-black font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,229,255,0.35)] cursor-pointer transition flex items-center justify-center gap-2"
            >
              <span>⬇️ Download Transparent / HD .PNG</span>
            </button>

            <button
              onClick={() => downloadImage("jpg")}
              disabled={!finalPreviewUrl || isProcessing}
              className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-white font-black text-xs sm:text-sm cursor-pointer transition flex items-center justify-center gap-2"
            >
              <span>📸 Download Studio .JPG (Form Ready)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
