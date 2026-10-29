import React, { useState } from "react";
import JSZip from "jszip";

export default function OtherUtilitiesSuite({
  selectedTool = "UnitConverter",
}) {
  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState("length");
  const [inputValue, setInputValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");

  // Time Converter State
  const [timeInput, setTimeInput] = useState(1);
  const [fromTime, setFromTime] = useState("hours");
  const [toTime, setToTime] = useState("minutes");

  // Archive ZIP State
  const [zipFiles, setZipFiles] = useState([]);
  const [zipping, setZipping] = useState(false);

  const unitRates = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, inch: 39.3701, ft: 3.28084 },
    weight: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274 },
    data: { MB: 1, KB: 1024, GB: 1 / 1024, TB: 1 / (1024 * 1024) },
  };

  const timeRates = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
  };

  const calculateUnitResult = () => {
    const rates = unitRates[unitCategory];
    if (!rates[fromUnit] || !rates[toUnit]) return 0;
    const baseVal = parseFloat(inputValue || 0) / rates[fromUnit];
    return (baseVal * rates[toUnit]).toFixed(4);
  };

  const calculateTimeResult = () => {
    const inSeconds = parseFloat(timeInput || 0) * timeRates[fromTime];
    return (inSeconds / timeRates[toTime]).toFixed(4);
  };

  const createZipArchive = async () => {
    if (zipFiles.length === 0) return;
    setZipping(true);
    const zip = new JSZip();
    zipFiles.forEach((file) => {
      zip.file(file.name, file);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "formfix-archive.zip";
    link.click();
    setZipping(false);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full">
          Utility & Archive Suite
        </span>
        <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
        <p className="text-gray-400 text-sm">
          Instant Unit Conversion, Time Calculation, and ZIP Archive Creation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Unit Converter Box */}
        <div className="bg-[#0b0f19] p-5 rounded-xl border border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              📏 Unit Converter
            </h3>
            <select
              value={unitCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setUnitCategory(cat);
                const keys = Object.keys(unitRates[cat]);
                setFromUnit(keys[0]);
                setToUnit(keys[1]);
              }}
              className="bg-[#111827] text-xs border border-gray-700 rounded px-2 py-1 text-[#00e5ff]"
            >
              <option value="length">Length</option>
              <option value="weight">Weight</option>
              <option value="data">Digital Storage</option>
            </select>
          </div>

          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-[#111827] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="bg-[#111827] border border-gray-800 rounded-lg px-2 py-2 text-xs text-gray-300"
            >
              {Object.keys(unitRates[unitCategory]).map((u) => (
                <option key={u} value={u}>
                  From: {u}
                </option>
              ))}
            </select>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="bg-[#111827] border border-gray-800 rounded-lg px-2 py-2 text-xs text-gray-300"
            >
              {Object.keys(unitRates[unitCategory]).map((u) => (
                <option key={u} value={u}>
                  To: {u}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#111827] rounded-lg border border-gray-800/80 text-center">
            <span className="text-xs text-gray-400">Result:</span>
            <p className="text-lg font-bold text-[#00e5ff]">
              {calculateUnitResult()} {toUnit}
            </p>
          </div>
        </div>

        {/* 2. Time Converter Box */}
        <div className="bg-[#0b0f19] p-5 rounded-xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            ⏰ Time Converter
          </h3>
          <input
            type="number"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="w-full bg-[#111827] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="bg-[#111827] border border-gray-800 rounded-lg px-2 py-2 text-xs text-gray-300"
            >
              {Object.keys(timeRates).map((t) => (
                <option key={t} value={t}>
                  From: {t}
                </option>
              ))}
            </select>
            <select
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="bg-[#111827] border border-gray-800 rounded-lg px-2 py-2 text-xs text-gray-300"
            >
              {Object.keys(timeRates).map((t) => (
                <option key={t} value={t}>
                  To: {t}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#111827] rounded-lg border border-gray-800/80 text-center">
            <span className="text-xs text-gray-400">Converted Time:</span>
            <p className="text-lg font-bold text-[#00e5ff]">
              {calculateTimeResult()} {toTime}
            </p>
          </div>
        </div>

        {/* 3. Archive (ZIP) Converter Box */}
        <div className="bg-[#0b0f19] p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              📦 Archive Converter (.ZIP)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Pack multiple files into a compressed ZIP archive.
            </p>

            <input
              type="file"
              multiple
              onChange={(e) => setZipFiles(Array.from(e.target.files))}
              className="mt-4 block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111827] file:text-[#00e5ff] hover:file:bg-gray-800"
            />
            {zipFiles.length > 0 && (
              <p className="text-xs text-[#00e5ff] mt-2">
                {zipFiles.length} file(s) ready to compress
              </p>
            )}
          </div>

          <button
            onClick={createZipArchive}
            disabled={zipping || zipFiles.length === 0}
            className="w-full py-2.5 bg-[#00e5ff] disabled:opacity-40 text-black font-bold text-sm rounded-xl shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all"
          >
            {zipping ? "Creating ZIP..." : "Download .ZIP Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
