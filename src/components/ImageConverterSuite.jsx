import React, { useState } from "react";

export default function ImageConverterSuite({
  selectedTool = "Image Converter",
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetFormat, setTargetFormat] = useState("png");
  const [converting, setConverting] = useState(false);

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setPreview(URL.createObjectURL(uploaded));
      if (selectedTool.includes("to PNG")) setTargetFormat("png");
      else if (selectedTool.includes("to JPG")) setTargetFormat("jpeg");
      else if (selectedTool.includes("to SVG")) setTargetFormat("svg");
    }
  };

  const convertImage = () => {
    if (!file) return;
    setConverting(true);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      if (targetFormat === "svg") {
        const dataUrl = canvas.toDataURL("image/png");
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
          <image href="${dataUrl}" width="${img.width}" height="${img.height}" />
        </svg>`;
        const blob = new Blob([svgContent], {
          type: "image/svg+xml;charset=utf-8",
        });
        triggerDownload(URL.createObjectURL(blob), "svg");
      } else {
        const mimeType = `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
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
            Image Suite
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
          <p className="text-gray-400 text-sm">
            Convert WEBP, JFIF, PNG, JPG, and SVG directly in your browser.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-300">Target Format:</label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="bg-[#0b0f19] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG / JPEG</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
          </select>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-700 hover:border-[#00e5ff] rounded-2xl p-8 text-center transition-all bg-[#0b0f19]/50">
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
            Click to upload an image
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Supports WEBP, JFIF, PNG, JPG, SVG, GIF
          </span>
        </label>
      </div>

      {preview && (
        <div className="bg-[#0b0f19] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>

          <button
            onClick={convertImage}
            disabled={converting}
            className="w-full md:w-auto px-6 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            {converting
              ? "Converting..."
              : `Convert & Download .${targetFormat === "jpeg" ? "JPG" : targetFormat.toUpperCase()}`}
          </button>
        </div>
      )}
    </div>
  );
}
