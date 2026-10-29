import React, { useState } from "react";

export default function ImageConverterSuite({
  selectedTool = "Image Converter",
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetFormat, setTargetFormat] = useState("png");
  const [quality, setQuality] = useState(92);
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [filterMode, setFilterMode] = useState("none"); // 'none' | 'grayscale' | 'invert'
  const [converting, setConverting] = useState(false);

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      const url = URL.createObjectURL(uploaded);
      setPreview(url);

      const img = new Image();
      img.onload = () => {
        setResizeW(img.width);
        setResizeH(img.height);
      };
      img.src = url;

      if (selectedTool.includes("to PNG")) setTargetFormat("png");
      else if (selectedTool.includes("to JPG")) setTargetFormat("jpeg");
      else if (selectedTool.includes("to SVG")) setTargetFormat("svg");
      else if (selectedTool.includes("WEBP")) setTargetFormat("webp");
    }
  };

  const convertImage = () => {
    if (!file) return;
    setConverting(true);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const finalW = resizeW > 0 ? Number(resizeW) : img.width;
      const finalH = resizeH > 0 ? Number(resizeH) : img.height;
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");

      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (filterMode === "grayscale") ctx.filter = "grayscale(100%)";
      if (filterMode === "invert") ctx.filter = "invert(100%)";

      ctx.drawImage(img, 0, 0, finalW, finalH);

      if (targetFormat === "svg") {
        const dataUrl = canvas.toDataURL("image/png");
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${finalW}" height="${finalH}">
          <image href="${dataUrl}" width="${finalW}" height="${finalH}" />
        </svg>`;
        const blob = new Blob([svgContent], {
          type: "image/svg+xml;charset=utf-8",
        });
        triggerDownload(URL.createObjectURL(blob), "svg");
      } else {
        const mimeType = `image/${
          targetFormat === "jpg" ? "jpeg" : targetFormat
        }`;
        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        triggerDownload(
          dataUrl,
          targetFormat === "jpeg" ? "jpg" : targetFormat,
        );
      }
      setConverting(false);
    };
  };

  const triggerDownload = (url, ext) => {
    const link = document.createElement("a");
    const baseName =
      file.name.substring(0, file.name.lastIndexOf(".")) || "converted";
    link.download = `${baseName}-formfix.${ext}`;
    link.href = url;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full">
            Image Conversion & Resize Suite
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
          <p className="text-gray-400 text-sm">
            Convert WEBP, JFIF, PNG, JPG, and SVG with custom dimensions and
            color filters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-300 font-semibold">
            Output Format:
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="bg-[#0b0f19] border border-gray-700 text-white rounded-xl px-3.5 py-2 text-sm focus:border-[#00e5ff] outline-none font-bold"
          >
            <option value="png">PNG (Lossless)</option>
            <option value="jpeg">JPG / JPEG</option>
            <option value="webp">WEBP (Modern)</option>
            <option value="svg">SVG (Vector Wrap)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="border-2 border-dashed border-gray-700 hover:border-[#00e5ff] rounded-2xl p-8 text-center transition-all bg-[#0b0f19]/60">
            <input
              type="file"
              accept="image/*,.heic,.jfif,.webp,.svg"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-4xl mb-3">🖼️</div>
              <span className="text-white font-semibold">
                {file ? file.name : "Click to upload an image"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Supports WEBP, JFIF, PNG, JPG, SVG, GIF
              </span>
            </label>
          </div>

          {/* Pro Adjustment Controls */}
          <div className="bg-[#0b0f19] p-4 rounded-2xl border border-gray-800 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 font-bold block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={resizeW}
                  onChange={(e) => setResizeW(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 font-bold block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={resizeH}
                  onChange={(e) => setResizeH(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 font-bold block mb-1">
                  Color Filter
                </label>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="w-full bg-slate-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="none">Original Color</option>
                  <option value="grayscale">B&W Grayscale</option>
                  <option value="invert">Invert Colors</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Compression Quality</span>
                <span className="text-[#00e5ff] font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#00e5ff]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#0b0f19] p-6 rounded-2xl border border-gray-800 flex flex-col justify-between items-center space-y-4">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                style={{
                  filter:
                    filterMode === "grayscale"
                      ? "grayscale(100%)"
                      : filterMode === "invert"
                        ? "invert(100%)"
                        : "none",
                }}
                className="max-h-60 object-contain rounded-xl border border-gray-700 shadow-lg"
              />
              <div className="text-center">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-gray-400">
                  Original: {(file.size / 1024).toFixed(2)} KB • Target:{" "}
                  {resizeW}×{resizeH} px
                </p>
              </div>

              <button
                onClick={convertImage}
                disabled={converting}
                className="w-full py-3.5 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-black rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
              >
                {converting
                  ? "Converting..."
                  : `⬇️ Convert & Download .${
                      targetFormat === "jpeg"
                        ? "JPG"
                        : targetFormat.toUpperCase()
                    }`}
              </button>
            </>
          ) : (
            <div className="my-auto text-center text-xs text-gray-500 py-16">
              Upload any image on the left to preview & convert
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
