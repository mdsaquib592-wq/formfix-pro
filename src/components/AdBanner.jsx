import React, { useEffect, useRef } from "react";

export default function AdBanner({
  slotLabel = "Sponsored Advertisement",
  adKey = "", // Yahan apna Adsterra Key daalein (optional)
  width = 300,
  height = 250,
}) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adKey || !adRef.current) return;
    adRef.current.innerHTML = "";

    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;

    adRef.current.appendChild(confScript);
    adRef.current.appendChild(invokeScript);
  }, [adKey, width, height]);

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-4 flex flex-col items-center justify-center">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
        {slotLabel}
      </span>
      {adKey ? (
        <div
          ref={adRef}
          style={{ minWidth: width, minHeight: height }}
          className="flex items-center justify-center bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800"
        />
      ) : (
        <div className="w-full py-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-[11px] text-slate-500">
          Ad Space ({width}×{height} Clean Banner Unit)
        </div>
      )}
    </div>
  );
}
