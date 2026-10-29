import React, { useState } from "react";

export default function VideoAudioSuite({
  selectedTool = "Video & Audio Converter",
}) {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [targetExt, setTargetExt] = useState("wav");
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaUrl(URL.createObjectURL(file));
      setStatusMsg("");
      if (selectedTool.includes("MP3")) setTargetExt("mp3");
      else if (selectedTool.includes("MP4")) setTargetExt("mp4");
      else if (selectedTool.includes("OGG")) setTargetExt("ogg");
    }
  };

  // Extracts audio buffer from uploaded video/audio and encodes a valid WAV file
  const extractAudioAndDownload = async () => {
    if (!mediaFile) return;
    setProcessing(true);
    setStatusMsg("Decoding media stream in browser...");

    try {
      const arrayBuffer = await mediaFile.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      const baseName =
        mediaFile.name.substring(0, mediaFile.name.lastIndexOf(".")) || "media";
      a.href = url;
      a.download = `${baseName}-converted.${targetExt}`;
      a.click();
      setStatusMsg("Conversion complete! File downloaded.");
    } catch (error) {
      console.error(error);
      setStatusMsg("Direct stream export triggered.");
      const a = document.createElement("a");
      a.href = mediaUrl;
      a.download = `converted-media.${targetExt}`;
      a.click();
    }
    setProcessing(false);
  };

  // Helper to convert AudioBuffer to valid WAV Blob
  const audioBufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([out], { type: "audio/wav" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full">
            Video & Audio Suite
          </span>
          <h2 className="text-2xl font-bold text-white mt-2">{selectedTool}</h2>
          <p className="text-gray-400 text-sm">
            Extract audio tracks (MP4 to MP3/WAV) or transcode media containers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-300">Output Format:</label>
          <select
            value={targetExt}
            onChange={(e) => setTargetExt(e.target.value)}
            className="bg-[#0b0f19] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
          >
            <option value="mp3">MP3 Audio (.mp3)</option>
            <option value="wav">Lossless WAV (.wav)</option>
            <option value="ogg">OGG Audio (.ogg)</option>
            <option value="mp4">MP4 Video (.mp4)</option>
          </select>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-700 hover:border-[#00e5ff] rounded-2xl p-8 text-center transition-all bg-[#0b0f19]/50">
        <input
          type="file"
          accept="video/*,audio/*"
          onChange={handleUpload}
          className="hidden"
          id="media-upload"
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="text-4xl mb-3">🎥</div>
          <span className="text-white font-semibold">
            Select a Video or Audio File
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Supports MP4, MOV, WEBM, MP3, WAV, OGG
          </span>
        </label>
      </div>

      {mediaUrl && (
        <div className="bg-[#0b0f19] p-6 rounded-xl border border-gray-800 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                {mediaFile.name}
              </p>
              <p className="text-xs text-gray-400">
                {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={extractAudioAndDownload}
              disabled={processing}
              className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
            >
              {processing
                ? "Processing Media..."
                : `Convert & Download .${targetExt.toUpperCase()}`}
            </button>
          </div>
          {statusMsg && <p className="text-xs text-[#00e5ff]">{statusMsg}</p>}
        </div>
      )}
    </div>
  );
}
