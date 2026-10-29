import React, { useState, useRef } from "react";

export default function GifConverterSuite({
  selectedTool = "GIF Studio & Converter",
}) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef(null);

  const handleFile = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setPreviewUrl(URL.createObjectURL(uploaded));
      setIsVideo(uploaded.type.startsWith("video/"));
    }
  };

  const captureSnapshotOrExport = () => {
    if (!file) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (isVideo && videoRef.current) {
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 360;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/gif");
      downloadFile(dataUrl, "captured-frame.gif");
    } else {
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const ext = selectedTool.includes("to MP4") ? "png" : "gif";
        const dataUrl = canvas.toDataURL(`image/${ext}`);
        downloadFile(dataUrl, `converted-animation.${ext}`);
      };
    }
  };

  const downloadFile = (url, fileName) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full">
          GIF & Animation Suite
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
        <p className="text-gray-400 text-sm">
          Convert videos (MP4, WEBM, MOV, AVI) or images into GIF format.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-700 hover:border-[#00e5ff] rounded-2xl p-8 text-center transition-all bg-[#0b0f19]/50">
        <input
          type="file"
          accept="video/*,image/*"
          onChange={handleFile}
          className="hidden"
          id="gif-upload"
        />
        <label
          htmlFor="gif-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="text-4xl mb-3">🎬</div>
          <span className="text-white font-semibold">
            Upload Video (MP4/WEBM) or Image to Convert
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Supports MP4, WEBM, MOV, AVI, APNG, GIF, PNG
          </span>
        </label>
      </div>

      {previewUrl && (
        <div className="bg-[#0b0f19] p-6 rounded-xl border border-gray-800 flex flex-col items-center space-y-4">
          {isVideo ? (
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              className="max-h-64 rounded-lg border border-gray-700"
            />
          ) : (
            <img
              src={previewUrl}
              alt="GIF Preview"
              className="max-h-64 rounded-lg border border-gray-700"
            />
          )}

          <button
            onClick={captureSnapshotOrExport}
            className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            Export & Download GIF
          </button>
        </div>
      )}
    </div>
  );
}
