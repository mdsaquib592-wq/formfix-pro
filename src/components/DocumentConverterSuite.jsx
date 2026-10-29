import React, { useState } from "react";
import { jsPDF } from "jspdf";

export default function DocumentConverterSuite({
  selectedTool = "PDF & Document Converter",
}) {
  const [files, setFiles] = useState([]);
  const [textContent, setTextContent] = useState("");
  const [outputType, setOutputType] = useState("pdf");
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(uploadedFiles);

    if (
      uploadedFiles[0] &&
      (uploadedFiles[0].type === "text/plain" ||
        uploadedFiles[0].name.endsWith(".txt") ||
        uploadedFiles[0].name.endsWith(".md"))
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => setTextContent(ev.target.result);
      reader.readAsText(uploadedFiles[0]);
    }
  };

  const processDocument = async () => {
    if (files.length === 0 && !textContent) return;
    setProcessing(true);

    try {
      if (outputType === "pdf") {
        const doc = new jsPDF();

        if (files.length > 0 && files[0].type.startsWith("image/")) {
          for (let i = 0; i < files.length; i++) {
            if (i > 0) doc.addPage();
            const imgData = await readFileAsDataURL(files[i]);
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(imgData, "JPEG", 10, 10, pdfWidth, pdfHeight);
          }
        } else {
          const content =
            textContent ||
            `Document Generated via FormFix Pro\nFile: ${files[0]?.name}`;
          const splitText = doc.splitTextToSize(content, 180);
          doc.text(splitText, 15, 20);
        }
        doc.save(`formfix-document.pdf`);
      } else if (outputType === "doc") {
        const content =
          textContent || `Exported from ${files[0]?.name || "FormFix Pro"}`;
        const blob = new Blob(["\ufeff", content], {
          type: "application/msword",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "formfix-converted.doc";
        link.click();
      } else if (outputType === "txt") {
        const blob = new Blob(
          [textContent || `Extracted from ${files[0]?.name}`],
          { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "formfix-converted.txt";
        link.click();
      }
    } catch (err) {
      console.error("Conversion error:", err);
    }
    setProcessing(false);
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full">
            PDF & Documents Suite
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
          <p className="text-gray-400 text-sm">
            Convert images, text, and files into PDF, Word (.DOC), or plain
            text.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-300">Convert To:</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value)}
            className="bg-[#0b0f19] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
          >
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="doc">Word Document (.doc)</option>
            <option value="txt">Text Document (.txt)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-700 hover:border-[#00e5ff] rounded-2xl p-6 text-center transition-all bg-[#0b0f19]/50 flex flex-col justify-center">
          <input
            type="file"
            multiple
            accept="image/*,.txt,.md,.csv,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="doc-upload"
          />
          <label
            htmlFor="doc-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="text-4xl mb-3">📄</div>
            <span className="text-white font-semibold">
              Upload Images or Document Files
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Supports JPG to PDF, TXT to PDF/Word, and multi-image PDF creation
            </span>
          </label>
          {files.length > 0 && (
            <div className="mt-4 text-xs text-[#00e5ff] font-medium">
              {files.length} file(s) selected:{" "}
              {files.map((f) => f.name).join(", ")}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-2 font-medium">
            Or type / edit document text directly:
          </label>
          <textarea
            rows="5"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste or write content here to export directly to PDF or Word (.doc)..."
            className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#00e5ff] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={processDocument}
          disabled={processing || (files.length === 0 && !textContent)}
          className="px-6 py-3 bg-[#00e5ff] disabled:opacity-40 hover:bg-[#00cce6] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
        >
          {processing
            ? "Generating Document..."
            : `Generate & Download .${outputType.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
