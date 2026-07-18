"use client";
import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";

type FilterName = "none"|"grayscale"|"sepia"|"vivid"|"fade"|"cool"|"warm"|"hdr"|"matte"|"blueprint"|"sharpen";

interface Filter {
  name: FilterName;
  label: string;
  css: string;
}

const FILTERS: Filter[] = [
  { name: "none",      label: "Original",   css: "none" },
  { name: "grayscale", label: "B&W",         css: "grayscale(100%)" },
  { name: "sepia",     label: "Vintage",     css: "sepia(70%) contrast(1.1) brightness(0.95)" },
  { name: "vivid",     label: "Vivid",       css: "saturate(180%) contrast(1.1)" },
  { name: "fade",      label: "Fade",        css: "saturate(70%) brightness(1.1) contrast(0.9)" },
  { name: "cool",      label: "Cool",        css: "hue-rotate(30deg) saturate(120%)" },
  { name: "warm",      label: "Warm",        css: "hue-rotate(-20deg) saturate(130%) sepia(20%)" },
  { name: "hdr",       label: "HDR",         css: "contrast(140%) saturate(140%) brightness(0.95)" },
  { name: "matte",     label: "Matte",       css: "contrast(0.85) brightness(1.05) saturate(80%)" },
  { name: "blueprint", label: "Blueprint",   css: "hue-rotate(180deg) saturate(150%) brightness(0.9)" },
];

export default function PhotoEffectsTool() {
  const [src, setSrc] = useState("");
  const [fileName, setFileName] = useState("photo");
  const [filter, setFilter] = useState<Filter>(FILTERS[0]);
  const [brightness, setBrightness] = useState(100);
  const [contrast,   setContrast]   = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [status, setStatus] = useState<"idle"|"done">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  const onFile = (f: File) => {
    setFileName(f.name.replace(/\.[^.]+$/, ""));
    setSrc(URL.createObjectURL(f));
  };

  const fullFilter = `${filter.css !== "none" ? filter.css : ""} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`.trim();

  const apply = useCallback(() => {
    if (!src || !imgRef.current) return;
    setStatus("idle");
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = fullFilter;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    }, "image/jpeg", 0.95);
  }, [src, fullFilter]);

  return (
    <div>
      {!src ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop an image to apply filters</div>
          <div className="upload-sub">JPG, PNG, WebP supported</div>
        </div>
      ) : (
        <div>
          {/* Live Preview */}
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, position: "relative", background: "var(--bg)", border: "1px solid var(--border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="preview" crossOrigin="anonymous" style={{ width: "100%", maxHeight: 340, objectFit: "contain", display: "block", filter: fullFilter }} />
          </div>

          {/* Preset Filters */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 14, scrollbarWidth: "none" }}>
            {FILTERS.map(f => (
              <button key={f.name} onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, width: 70, borderRadius: 8, border: `2px solid ${filter.name === f.name ? "var(--blue)" : "var(--border)"}`,
                  background: "var(--surface)", cursor: "pointer", overflow: "hidden", padding: 0,
                }}
              >
                {/* Mini preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={f.label} style={{ width: "100%", height: 48, objectFit: "cover", filter: f.css }} />
                <div style={{ fontSize: "0.65rem", fontWeight: 600, padding: "4px 0", textAlign: "center", color: filter.name === f.name ? "var(--blue)" : "var(--text-2)" }}>{f.label}</div>
              </button>
            ))}
          </div>

          {/* Manual controls */}
          <div className="opts-panel">
            <div className="opts-title">Adjustments</div>
            {[["Brightness", brightness, setBrightness], ["Contrast", contrast, setContrast], ["Saturation", saturation, setSaturation]].map(([label, val, setter]) => (
              <div key={label as string} className="opt-row">
                <label className="opt-label">{label as string}</label>
                <input type="range" min="50" max="200" value={val as number} onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))} style={{ flex: 1, marginRight: 8 }} />
                <span style={{ minWidth: 36, fontSize: "0.8rem", color: "var(--text-2)", textAlign: "right" }}>{val as number}%</span>
                <button className="icon-btn" onClick={() => (setter as (v: number) => void)(100)} style={{ fontSize: "0.72rem" }}>Reset</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={apply}>Apply & Download</button>
            <button className="btn btn-ghost" onClick={() => { setSrc(""); setStatus("idle"); setResultUrl(""); }}>New Image</button>
          </div>
        </div>
      )}

      {status === "done" && resultUrl && (
        <div className="result-panel" style={{ marginTop: 16 }}>
          <h3>Applied: {filter.label}</h3>
          <div className="result-actions">
            <a href={resultUrl} download={`${fileName}_${filter.name}.jpg`} className="btn btn-success">Download Result</a>
            <button className="btn btn-ghost" onClick={() => setStatus("idle")}>Edit More</button>
          </div>
        </div>
      )}
    </div>
  );
}
