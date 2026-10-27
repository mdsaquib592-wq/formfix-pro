import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";

export default function IdCardStudio() {
  const [idCards, setIdCards] = useState([
    { id: 1, front: null, back: null, label: "Card 1" },
  ]);
  const [showCutLines, setShowCutLines] = useState(true);
  const [cardBorder, setCardBorder] = useState(true);
  const [a4PreviewUrl, setA4PreviewUrl] = useState(null);

  const handleCardUpload = (slotId, side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setIdCards((prev) =>
          prev.map((c) => (c.id === slotId ? { ...c, [side]: img } : c)),
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const addCardSlot = () => {
    if (idCards.length >= 5) return;
    setIdCards([
      ...idCards,
      {
        id: Date.now(),
        front: null,
        back: null,
        label: `Card ${idCards.length + 1}`,
      },
    ]);
  };

  const removeCardSlot = (id) => {
    if (idCards.length <= 1) return;
    setIdCards(idCards.filter((c) => c.id !== id));
  };

  const generateA4SheetCanvas = useCallback(() => {
    const a4Canvas = document.createElement("canvas");
    const scale = 10;
    a4Canvas.width = 210 * scale;
    a4Canvas.height = 297 * scale;
    const ctx = a4Canvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

    const cardW = 86 * scale;
    const cardH = 54 * scale;
    const marginX = 14 * scale;
    const startY = 12 * scale;
    const gapX = 10 * scale;
    const gapY = 4.5 * scale;

    idCards.forEach((card, rowIdx) => {
      const y = startY + rowIdx * (cardH + gapY);
      const frontX = marginX;
      const backX = marginX + cardW + gapX;

      [
        { img: card.front, x: frontX, title: "FRONT" },
        { img: card.back, x: backX, title: "BACK" },
      ].forEach(({ img, x, title }) => {
        if (img) {
          ctx.drawImage(img, x, y, cardW, cardH);
        } else {
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(x, y, cardW, cardH);
          ctx.fillStyle = "#94A3B8";
          ctx.font = `bold ${4 * scale}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(
            `${card.label} - ${title} (8.6 × 5.4 cm)`,
            x + cardW / 2,
            y + cardH / 2,
          );
        }

        if (cardBorder) {
          ctx.strokeStyle = "#1E293B";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, cardW, cardH);
        }

        if (showCutLines) {
          ctx.save();
          ctx.strokeStyle = "#64748B";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(x - 4, y - 4, cardW + 8, cardH + 8);
          ctx.restore();
        }
      });
    });

    return a4Canvas;
  }, [idCards, cardBorder, showCutLines]);

  useEffect(() => {
    const canvas = generateA4SheetCanvas();
    setA4PreviewUrl(canvas.toDataURL("image/jpeg", 0.85));
  }, [generateA4SheetCanvas]);

  const downloadA4Pdf = () => {
    const canvas = generateA4SheetCanvas();
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    pdf.save(`A4_ID_Cards_Sheet_${Date.now()}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Side: Card Slots Upload */}
      <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-white">
              🪪 Smart ID Card A4 Maker (Front & Back)
            </h2>
            <p className="text-[11px] text-slate-400">
              Auto-scales to official PVC / ID size (8.6 cm × 5.4 cm) on A4
              sheet
            </p>
          </div>
          <button
            onClick={addCardSlot}
            disabled={idCards.length >= 5}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer"
          >
            + Add Card Row ({idCards.length}/5)
          </button>
        </div>

        <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
          {idCards.map((card, idx) => (
            <div
              key={card.id}
              className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  Card #{idx + 1} (Front & Back)
                </span>
                {idCards.length > 1 && (
                  <button
                    onClick={() => removeCardSlot(card.id)}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900/60 flex flex-col items-center justify-center min-h-[85px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleCardUpload(card.id, "front", e.target.files?.[0])
                    }
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    {card.front ? "✅ Front Loaded" : "➕ Upload Front Side"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    8.6 × 5.4 cm Auto-Fit
                  </span>
                </label>

                <label className="border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900/60 flex flex-col items-center justify-center min-h-[85px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleCardUpload(card.id, "back", e.target.files?.[0])
                    }
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    {card.back ? "✅ Back Loaded" : "➕ Upload Back Side"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    8.6 × 5.4 cm Auto-Fit
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cardBorder}
              onChange={(e) => setCardBorder(e.target.checked)}
              className="accent-emerald-500"
            />
            <span>Add Black Card Outline</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCutLines}
              onChange={(e) => setShowCutLines(e.target.checked)}
              className="accent-emerald-500"
            />
            <span>Show Scissor Cut Marks ✂️</span>
          </label>
        </div>
      </div>

      {/* Right Side: Live A4 Sheet Preview & Download */}
      <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">
            📄 Live A4 Print Sheet Preview (300 DPI)
          </h3>
          <span className="text-xs text-slate-400">210 × 297 mm</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center">
          {a4PreviewUrl && (
            <img
              src={a4PreviewUrl}
              alt="A4 Preview"
              className="max-h-[380px] w-auto rounded shadow-lg border border-slate-700"
            />
          )}
        </div>

        <button
          onClick={downloadA4Pdf}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 cursor-pointer transition"
        >
          🖨️ Download Ready-to-Print A4 PDF Sheet
        </button>
      </div>
    </div>
  );
}
