"use client";
import { useState, useRef } from "react";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageResizeTool() {
  const [original, setOriginal] = useState<{ file: File; url: string; w: number; h: number } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAR, setLockAR] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setOriginal({ file: f, url, w: img.naturalWidth, h: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    };
    img.src = url;
  };

  const onWidthChange = (v: string) => {
    setWidth(v);
    if (lockAR && original && Number(v) > 0) {
      setHeight(String(Math.round(original.h * (Number(v) / original.w))));
    }
  };
  const onHeightChange = (v: string) => {
    setHeight(v);
    if (lockAR && original && Number(v) > 0) {
      setWidth(String(Math.round(original.w * (Number(v) / original.h))));
    }
  };

  const resize = () => {
    if (!original) return;
    setStatus("processing");
    const canvas = document.createElement("canvas");
    canvas.width = Number(width); canvas.height = Number(height);
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { setStatus("error"); return; }
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        setStatus("done");
      }, format, 0.92);
    };
    img.src = original.url;
  };

  const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";

  return (
    <div>
      {!original ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept="image/*" ref={fileRef} onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <span className="upload-zone-icon">📐</span>
          <div className="upload-zone-title">Drop an image here or click to browse</div>
          <div className="upload-zone-sub">JPG, PNG, WebP, GIF — any image format</div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <img src={original.url} alt="preview" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Original: {original.file.name}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>Size: {formatBytes(original.file.size)}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>Dimensions: {original.w} × {original.h}px</div>
              <button className="copy-btn" style={{ marginTop: 8 }} onClick={() => { setOriginal(null); setStatus("idle"); setResultUrl(""); }}>✕ Remove</button>
            </div>
          </div>

          <div className="options-panel">
            <div className="options-panel-title">Resize Options</div>
            <div className="opt-row">
              <label className="opt-label">Width (px)</label>
              <input className="opt-input" type="number" value={width} onChange={(e) => onWidthChange(e.target.value)} min="1" />
            </div>
            <div className="opt-row">
              <label className="opt-label">Height (px)</label>
              <input className="opt-input" type="number" value={height} onChange={(e) => onHeightChange(e.target.value)} min="1" />
            </div>
            <div className="opt-row">
              <label className="opt-label">Lock Ratio</label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", color: "var(--text-2)" }}>
                <input type="checkbox" checked={lockAR} onChange={(e) => setLockAR(e.target.checked)} />
                Maintain aspect ratio
              </label>
            </div>
            <div className="opt-row">
              <label className="opt-label">Output Format</label>
              <select className="opt-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            {/* Presets */}
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ fontSize: "0.73rem", color: "var(--text-3)", marginBottom: 8 }}>Quick Presets</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["1080×1080 (Instagram)","1080","1080"],["1920×1080 (HD)","1920","1080"],["800×600","800","600"],["400×400 (Thumb)","400","400"]].map(([label, w, h]) => (
                  <button key={label} className="copy-btn" onClick={() => { setLockAR(false); setWidth(w); setHeight(h); }}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={resize} disabled={status === "processing"} style={{ marginTop: 14 }}>
            {status === "processing" ? <><span className="spinner" /> Resizing…</> : "📐 Resize Image"}
          </button>
        </div>
      )}

      {status === "done" && resultUrl && (
        <div className="result-panel" style={{ textAlign: "left", marginTop: 20 }}>
          <h3>✅ Image Resized!</h3>
          <p>New size: {width} × {height}px · {formatBytes(resultSize)}</p>
          <img src={resultUrl} alt="result" className="result-image" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={resultUrl} download={`resized.${ext}`} className="btn btn-success">⬇ Download Resized Image</a>
            <button className="btn btn-secondary" onClick={() => { setStatus("idle"); setResultUrl(""); }}>↺ Resize Another</button>
          </div>
        </div>
      )}
    </div>
  );
}
