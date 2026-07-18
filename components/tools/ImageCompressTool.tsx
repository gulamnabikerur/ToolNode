"use client";
import { useState, useRef } from "react";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageCompressTool() {
  const [original, setOriginal] = useState<{ file: File; url: string; w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState("image/jpeg");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => setOriginal({ file: f, url, w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  };

  const compress = () => {
    if (!original) return;
    setStatus("processing");
    const canvas = document.createElement("canvas");
    canvas.width = original.w; canvas.height = original.h;
    const img = new Image();
    img.onload = () => {
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        setResult({ url: URL.createObjectURL(blob), size: blob.size });
        setStatus("done");
      }, format, quality / 100);
    };
    img.src = original.url;
  };

  const savings = result && original ? Math.round((1 - result.size / original.file.size) * 100) : 0;
  const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";

  return (
    <div>
      {!original ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <span className="upload-zone-icon">🗜️</span>
          <div className="upload-zone-title">Drop an image here or click to browse</div>
          <div className="upload-zone-sub">JPG, PNG, WebP — up to 20MB</div>
        </div>
      ) : (
        <div>
          <div className="file-item">
            <span className="file-item-icon">🖼️</span>
            <span className="file-item-name">{original.file.name}</span>
            <span className="file-item-size">{formatBytes(original.file.size)} · {original.w}×{original.h}</span>
            <button className="file-item-remove" onClick={() => { setOriginal(null); setResult(null); setStatus("idle"); }}>✕</button>
          </div>

          <div className="options-panel" style={{ marginTop: 14 }}>
            <div className="options-panel-title">Compression Options</div>
            <div className="opt-row">
              <label className="opt-label">Quality</label>
              <div style={{ flex: 1 }}>
                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.73rem", color: "var(--text-3)", marginTop: 2 }}>
                  <span>10 (smallest)</span><span style={{ color: "var(--accent)", fontWeight: 700 }}>{quality}%</span><span>100 (best)</span>
                </div>
              </div>
            </div>
            <div className="opt-row">
              <label className="opt-label">Output Format</label>
              <select className="opt-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/jpeg">JPG (best compression)</option>
                <option value="image/webp">WebP (modern, tiny)</option>
                <option value="image/png">PNG (lossless)</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[[40,"Heavy 📦"],[65,"Balanced ⚖️"],[85,"Light ✨"]].map(([q, l]) => (
                <button key={l} className={`copy-btn${quality === Number(q) ? " active" : ""}`} onClick={() => setQuality(Number(q))} style={quality === Number(q) ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}>{l}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={compress} disabled={status === "processing"} style={{ marginTop: 14 }}>
            {status === "processing" ? <><span className="spinner" /> Compressing…</> : "🗜️ Compress Image"}
          </button>
        </div>
      )}

      {status === "done" && result && original && (
        <div className="result-panel" style={{ marginTop: 20, textAlign: "left" }}>
          <h3>✅ Compressed!</h3>
          <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Original</div><div style={{ fontWeight: 700 }}>{formatBytes(original.file.size)}</div></div>
            <div style={{ color: "var(--success)", fontWeight: 700, fontSize: "1.2rem", alignSelf: "center" }}>→</div>
            <div><div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Compressed</div><div style={{ fontWeight: 700, color: "var(--success)" }}>{formatBytes(result.size)}</div></div>
            <div><div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Saved</div><div style={{ fontWeight: 700, color: "var(--success)" }}>{savings}% smaller</div></div>
          </div>
          <img src={result.url} alt="result" className="result-image" />
          <div style={{ display: "flex", gap: 10 }}>
            <a href={result.url} download={`compressed.${ext}`} className="btn btn-success">⬇ Download</a>
            <button className="btn btn-secondary" onClick={() => { setOriginal(null); setResult(null); setStatus("idle"); }}>↺ New Image</button>
          </div>
        </div>
      )}
    </div>
  );
}
