import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";

const PAPER_SIZES = {
  a4: {
    id: "a4",
    name: "A4 Sheet (210 × 297 mm) - Up to 36 Photos",
    wMm: 210,
    hMm: 297,
    maxCopies: 36,
    defaultCopies: 30,
  },
  photo_4x6: {
    id: "photo_4x6",
    name: "4×6 Inch Lab Paper (102 × 152 mm) - Up to 12 Photos",
    wMm: 102,
    hMm: 152,
    maxCopies: 12,
    defaultCopies: 8,
  },
};

export default function PassportStudio() {
  const [photoImg, setPhotoImg] = useState(null);
  const [paperType, setPaperType] = useState("a4");
  const [copies, setCopies] = useState(30);
  const [addBorder, setAddBorder] = useState(true);
  const [addNameBand, setAddNameBand] = useState(false);
  const [personName, setPersonName] = useState("");
  const [dopDate, setDopDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState(null);

  const currentPaper = PAPER_SIZES[paperType];

  const handlePaperChange = (type) => {
    setPaperType(type);
    setCopies(PAPER_SIZES[type].defaultCopies);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setPhotoImg(img);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderPassportSheet = useCallback(() => {
    const scale = 10; // 10 px per mm (~254 DPI crisp output)
    const canvas = document.createElement("canvas");
    canvas.width = currentPaper.wMm * scale;
    canvas.height = currentPaper.hMm * scale;
    const ctx = canvas.getContext("2d");

    // White sheet background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Standard Indian Passport Size: 35mm x 45mm (or 30x38mm on 4x6 to fit 8-12 cleanly)
    const photoW = (paperType === "a4" ? 31 : 29) * scale;
    const photoH = (paperType === "a4" ? 41 : 38) * scale;
    const gap = 2.5 * scale;

    const cols = paperType === "a4" ? 6 : 3;
    const totalGridW = cols * photoW + (cols - 1) * gap;
    const startX = Math.max(4 * scale, (canvas.width - totalGridW) / 2);
    const startY = 8 * scale;

    for (let i = 0; i < copies; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (photoW + gap);
      const y = startY + row * (photoH + gap);

      if (photoImg) {
        // Center-crop image into passport aspect ratio
        const targetRatio = photoW / photoH;
        const imgRatio = photoImg.width / photoImg.height;
        let sx = 0,
          sy = 0,
          sw = photoImg.width,
          sh = photoImg.height;

        if (imgRatio > targetRatio) {
          sw = photoImg.height * targetRatio;
          sx = (photoImg.width - sw) / 2;
        } else {
          sh = photoImg.width / targetRatio;
          sy = (photoImg.height - sh) / 2;
        }

        ctx.drawImage(photoImg, sx, sy, sw, sh, x, y, photoW, photoH);

        // Optional Name & Date Strip at bottom of each passport photo
        if (addNameBand) {
          const bandH = photoH * 0.17;
          const bandY = y + photoH - bandH;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, bandY, photoW, bandH);

          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.font = `bold ${Math.round(bandH * 0.34)}px Arial`;
          ctx.fillText(
            (personName || "NAME").toUpperCase(),
            x + photoW / 2,
            bandY + bandH * 0.44,
          );
          ctx.fillText(
            `DOP: ${dopDate.split("-").reverse().join("-")}`,
            x + photoW / 2,
            bandY + bandH * 0.85,
          );
        }
      } else {
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(x, y, photoW, photoH);
        ctx.fillStyle = "#94A3B8";
        ctx.font = `bold ${2.8 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(`Photo #${i + 1}`, x + photoW / 2, y + photoH / 2);
      }

      // Draw border & cut guide
      if (addBorder) {
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, photoW, photoH);
      }
    }

    return canvas;
  }, [
    photoImg,
    currentPaper,
    paperType,
    copies,
    addBorder,
    addNameBand,
    personName,
    dopDate,
  ]);

  useEffect(() => {
    const canvas = renderPassportSheet();
    setSheetPreviewUrl(canvas.toDataURL("image/jpeg", 0.88));
  }, [renderPassportSheet]);

  const handleDownloadPdf = () => {
    const canvas = renderPassportSheet();
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [currentPaper.wMm, currentPaper.hMm],
    });
    pdf.addImage(imgData, "JPEG", 0, 0, currentPaper.wMm, currentPaper.hMm);
    pdf.save(`Passport_Sheet_${copies}_Photos_${Date.now()}.pdf`);
  };

  const handleDownloadJpg = () => {
    const canvas = renderPassportSheet();
    const link = document.createElement("a");
    link.download = `Passport_Sheet_${copies}_Photos_${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.98);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Settings Panel */}
      <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-white">
            👔 Instant Passport Photo Sheet Maker
          </h2>
          <p className="text-xs text-slate-400">
            Generate 8, 12, 30, or 36 passport photos on A4 or 4×6 glossy paper
            in 1 click
          </p>
        </div>

        {/* Upload Box */}
        <label className="w-full border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <span className="text-3xl mb-1">📷</span>
          <span className="text-xs font-bold text-white">
            {photoImg
              ? "✅ Photo Loaded (Click to Change)"
              : "Upload Candidate Photo"}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Auto Center-Crops to Passport Ratio (3.5 × 4.5 cm)
          </span>
        </label>

        {/* Paper Size Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Select Print Paper Size:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.values(PAPER_SIZES).map((p) => (
              <button
                key={p.id}
                onClick={() => handlePaperChange(p.id)}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                  paperType === p.id
                    ? "bg-amber-600/20 border-amber-500 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Copies */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">
              Number of Passport Photos:
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs">
              {copies} Copies
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(paperType === "a4"
              ? [6, 12, 18, 24, 30, 36]
              : [4, 6, 8, 9, 12]
            ).map((num) => (
              <button
                key={num}
                onClick={() => setCopies(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  copies === num
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                {num} Photos
              </button>
            ))}
          </div>
        </div>

        {/* Name Band & Border Options */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-wrap gap-5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={addBorder}
                onChange={(e) => setAddBorder(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Black Cut Border</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-300">
              <input
                type="checkbox"
                checked={addNameBand}
                onChange={(e) => setAddNameBand(e.target.checked)}
                className="accent-amber-500"
              />
              <span>Add Name & DOP Strip</span>
            </label>
          </div>

          {addNameBand && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <input
                type="text"
                placeholder="Candidate Name..."
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <input
                type="date"
                value={dopDate}
                onChange={(e) => setDopDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Live Sheet Preview & Download */}
      <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">
            🖨️ Live Print Sheet Preview
          </h3>
          <span className="text-xs text-amber-400 font-bold">
            {copies} Photos Ready
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center">
          {sheetPreviewUrl && (
            <img
              src={sheetPreviewUrl}
              alt="Passport Sheet Preview"
              className="max-h-[380px] w-auto rounded shadow-lg border border-slate-700"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadPdf}
            className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-lg cursor-pointer transition"
          >
            📄 Download PDF for Print
          </button>
          <button
            onClick={handleDownloadJpg}
            className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs sm:text-sm cursor-pointer transition"
          >
            🖼️ Download High-Res JPG
          </button>
        </div>
      </div>
    </div>
  );
}
