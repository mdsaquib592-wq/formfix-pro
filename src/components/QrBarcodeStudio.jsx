import React, { useState, useEffect, useCallback } from "react";

// Standard Code-39 Barcode patterns for 100% offline canvas rendering
const CODE39_MAP = {
  0: "nnnwwnwnn",
  1: "wnnwnnnnw",
  2: "nnwwnnnnw",
  3: "wnwwnnnnn",
  4: "nnnwwnnnw",
  5: "wnnwwnnnn",
  6: "nnwwwnnnn",
  7: "nnnwnnwnw",
  8: "wnnwnnwnn",
  9: "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "*": "nwnnwnwnn",
};

export default function QrBarcodeStudio({
  selectedTool = "QR & Barcode Studio",
}) {
  const [mode, setMode] = useState("upi"); // 'upi' | 'qr' | 'barcode'

  useEffect(() => {
    const l = selectedTool.toLowerCase();
    if (l.includes("barcode")) setMode("barcode");
    else if (l.includes("upi")) setMode("upi");
    else setMode("qr");
  }, [selectedTool]);

  // UPI QR State
  const [upiId, setUpiId] = useState("merchant@upi");
  const [payeeName, setPayeeName] = useState("FormFix Cyber Cafe");
  const [amount, setAmount] = useState("");
  const [qrColor, setQrColor] = useState("000000");

  // Generic QR State
  const [qrText, setQrText] = useState("https://techsqb.in");

  // Barcode State
  const [barcodeValue, setBarcodeValue] = useState("ID-2026-001");
  const [barcodeLabel, setBarcodeLabel] = useState("STUDENT / PVC CARD ID");
  const [barcodeDataUrl, setBarcodeDataUrl] = useState(null);

  const getQrImageUrl = () => {
    const payload =
      mode === "upi"
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
            payeeName,
          )}${amount ? `&am=${encodeURIComponent(amount)}` : ""}&cu=INR`
        : qrText || "https://techsqb.in";

    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=${qrColor}&bgcolor=FFFFFF&margin=14&data=${encodeURIComponent(
      payload,
    )}`;
  };

  const renderCode39Barcode = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 560;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cleanText = `*${(barcodeValue || "FORMFIX")
      .toUpperCase()
      .replace(/[^0-9A-Z\-. ]/g, "")}*`;

    let x = 35;
    const y = 35;
    const barH = 105;
    const narrow = 3;
    const wide = 7.5;

    for (let c = 0; c < cleanText.length; c++) {
      const pattern = CODE39_MAP[cleanText[c]] || CODE39_MAP["*"];
      for (let i = 0; i < 9; i++) {
        const isBar = i % 2 === 0;
        const w = pattern[i] === "w" ? wide : narrow;
        if (isBar) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(x, y, w, barH);
        }
        x += w;
      }
      x += narrow; // inter-character gap
    }

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(cleanText.replace(/\*/g, ""), canvas.width / 2, 165);

    if (barcodeLabel) {
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 12px Arial";
      ctx.fillText(barcodeLabel.toUpperCase(), canvas.width / 2, 185);
    }

    setBarcodeDataUrl(canvas.toDataURL("image/png"));
  }, [barcodeValue, barcodeLabel]);

  useEffect(() => {
    if (mode === "barcode") renderCode39Barcode();
  }, [mode, renderCode39Barcode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-3 py-1 rounded-full">
            🔳 QR & Barcode Generator Suite
          </span>
          <h2 className="text-2xl font-black text-white mt-2">
            {selectedTool}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Create instant UPI Payment Standees, URL QR codes, and Code-39 ID
            Barcodes.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: "upi", label: "🇮🇳 UPI Payment QR" },
            { id: "qr", label: "🌐 Custom URL / Text QR" },
            { id: "barcode", label: "🏷️ ID Card Barcode" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === t.id
                  ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {mode !== "barcode" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            {mode === "upi" ? (
              <>
                <h3 className="text-sm font-extrabold text-white">
                  Instant Shop / Cyber Cafe UPI QR Generator
                </h3>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">
                    Merchant UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@ybl or shop@okaxis"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#00e5ff] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">
                      Shop / Payee Name
                    </label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">
                      Fixed Amount (₹) (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Leave blank for any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-extrabold text-white">
                  Website URL, Wi-Fi, or vCard QR Code
                </h3>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">
                    Enter Link, Text, or Information
                  </label>
                  <textarea
                    rows="4"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-[#00e5ff] outline-none"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-300">
                QR Foreground Color:
              </span>
              <div className="flex gap-2">
                {[
                  { hex: "000000", label: "Black" },
                  { hex: "0F172A", label: "Navy" },
                  { hex: "0369A1", label: "Ocean" },
                  { hex: "047857", label: "Emerald" },
                  { hex: "4F46E5", label: "Indigo" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setQrColor(c.hex)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      qrColor === c.hex
                        ? "bg-[#00e5ff] text-black border-[#00e5ff]"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-xl text-center space-y-2">
              {mode === "upi" && (
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {payeeName || "SCAN & PAY VIA ANY UPI APP"}
                </div>
              )}
              <img
                src={getQrImageUrl()}
                alt="Generated QR"
                className="w-52 h-52 mx-auto object-contain"
              />
              {mode === "upi" && (
                <div className="text-[11px] font-bold text-slate-600">
                  {upiId} {amount ? `• ₹${amount}` : ""}
                </div>
              )}
            </div>

            <a
              href={getQrImageUrl()}
              target="_blank"
              rel="noreferrer"
              download="FormFix_QR.png"
              className="w-full py-3.5 bg-[#00e5ff] hover:bg-cyan-400 text-black font-black text-center rounded-xl text-sm shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              🔍 Open / Save High-Res QR Code (.PNG)
            </a>
          </div>
        </div>
      ) : (
        /* BARCODE GENERATOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white">
              Code-39 Printable ID & Inventory Barcode Maker
            </h3>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                Barcode ID / Roll Number (A-Z, 0-9, -)
              </label>
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                Bottom Sub-Label
              </label>
              <input
                type="text"
                value={barcodeLabel}
                onChange={(e) => setBarcodeLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center w-full">
              {barcodeDataUrl && (
                <img
                  src={barcodeDataUrl}
                  alt="Barcode"
                  className="max-h-44 rounded shadow-lg"
                />
              )}
            </div>
            <a
              href={barcodeDataUrl}
              download={`Barcode_${barcodeValue}.png`}
              className="w-full py-3.5 bg-[#00e5ff] hover:bg-cyan-400 text-black font-black text-center rounded-xl text-sm shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              ⬇️ Download Printable Barcode (.PNG)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
