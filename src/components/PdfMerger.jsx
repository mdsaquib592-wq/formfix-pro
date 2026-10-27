import React, { useState } from "react";
import { jsPDF } from "jspdf";

export default function PdfMerger() {
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfMaxKbPerImg, setPdfMaxKbPerImg] = useState(150);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleAddPdfImages = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPdfPages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            src: ev.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const movePage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pdfPages.length) return;
    const copy = [...pdfPages];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setPdfPages(copy);
  };

  const generateMergedPdf = async () => {
    if (pdfPages.length === 0) return;
    setIsGeneratingPdf(true);
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pdfPages.length; i++) {
      if (i > 0) pdf.addPage();
      const page = pdfPages[i];

      const img = await new Promise((res) => {
        const image = new Image();
        image.onload = () => res(image);
        image.src = page.src;
      });

      const canvas = document.createElement("canvas");
      const maxDim = 1400;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      let quality = 0.78;
      const maxBytes = pdfMaxKbPerImg * 1024;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length * 0.75 > maxBytes && quality > 0.15) {
        quality -= 0.12;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      const pdfW = 190;
      const pdfH = Math.min(277, (h * pdfW) / w);
      pdf.addImage(dataUrl, "JPEG", 10, 10, pdfW, pdfH);
    }

    pdf.save(`Merged_Documents_${Date.now()}.pdf`);
    setIsGeneratingPdf(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-white">
            📑 Multi-Document Image to PDF Merger
          </h2>
          <p className="text-xs text-slate-400">
            Combine marksheets, certificates, or receipts into a single
            compressed PDF
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Size Limit/Page:</span>
          <select
            value={pdfMaxKbPerImg}
            onChange={(e) => setPdfMaxKbPerImg(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
          >
            <option value={80}>Ultra Small (~80 KB/page)</option>
            <option value={150}>Balanced (~150 KB/page)</option>
            <option value={300}>High Print Quality (~300 KB/page)</option>
          </select>
        </div>
      </div>

      <label className="w-full border-2 border-dashed border-pink-500/40 hover:border-pink-400 bg-slate-950/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPdfImages}
          className="hidden"
        />
        <span className="text-3xl mb-1">📚</span>
        <span className="text-sm font-bold text-white">
          Click to Add Multiple Document Photos
        </span>
        <span className="text-xs text-slate-400 mt-0.5">
          Select 1 or more images to merge into 1 PDF
        </span>
      </label>

      {pdfPages.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pdfPages.map((p, i) => (
              <div
                key={p.id}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <img
                  src={p.src}
                  alt={p.name}
                  className="h-28 w-full object-cover rounded-lg"
                />
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-[10px] font-bold text-slate-300">
                    Page {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => movePage(i, -1)}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 cursor-pointer"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => movePage(i, 1)}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 cursor-pointer"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() =>
                        setPdfPages(pdfPages.filter((item) => item.id !== p.id))
                      }
                      className="text-[10px] text-rose-400 font-bold ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={generateMergedPdf}
            disabled={isGeneratingPdf}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm shadow-lg cursor-pointer transition"
          >
            {isGeneratingPdf
              ? "⏳ Generating PDF..."
              : `⬇️ Download Combined PDF (${pdfPages.length} Pages)`}
          </button>
        </div>
      )}
    </div>
  );
}
