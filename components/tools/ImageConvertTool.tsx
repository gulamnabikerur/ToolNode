"use client";
import { useState } from "react";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

type ConvertFormat = "image/jpeg" | "image/png" | "image/webp";
const EXT: Record<ConvertFormat, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export default function ImageConvertTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [results, setResults] = useState<Array<{ name: string; url: string; size: number }>>([]);
  const [heicWarning, setHeicWarning] = useState(false);

  const onFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const hasHeic = arr.some((f) => f.name.toLowerCase().endsWith(".heic") || f.type === "image/heic");
    setHeicWarning(hasHeic);
    setFiles((prev) => [...prev, ...arr]);
  };

  const convert = async () => {
    if (!files.length) return;
    setStatus("processing");
    const out: Array<{ name: string; url: string; size: number }> = [];

    for (const f of files) {
      try {
        let src = URL.createObjectURL(f);

        // HEIC conversion
        if (f.name.toLowerCase().endsWith(".heic") || f.type === "image/heic" || f.type === "") {
          try {
            const heic2any = (await import("heic2any")).default;
            const blob = await heic2any({ blob: f, toType: "image/jpeg", quality: 0.95 }) as Blob;
            src = URL.createObjectURL(blob);
          } catch { /* fallback to native */ }
        }

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) { resolve(); return; }
              const baseName = f.name.replace(/\.[^.]+$/, "");
              out.push({ name: `${baseName}.${EXT[targetFormat]}`, url: URL.createObjectURL(blob), size: blob.size });
              resolve();
            }, targetFormat, quality / 100);
          };
          img.onerror = () => resolve();
          img.src = src;
        });
      } catch { /* skip bad file */ }
    }

    setResults(out);
    setStatus("done");
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      const a = document.createElement("a"); a.href = results[0].url; a.download = results[0].name; a.click();
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const r of results) {
      const blob = await fetch(r.url).then((res) => res.blob());
      zip.file(r.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(zipBlob); a.download = "converted.zip"; a.click();
  };

  return (
    <div>
      <div className="upload-zone" style={{ marginBottom: 16 }} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}>
        <input type="file" accept="image/*,.heic" multiple onChange={(e) => onFiles(e.target.files)} />
        <span className="upload-zone-icon">🔄</span>
        <div className="upload-zone-title">Drop images here (batch supported)</div>
        <div className="upload-zone-sub">JPG · PNG · WebP · HEIC · GIF — up to 20 files</div>
      </div>

      {heicWarning && (
        <div className="status-box status-info" style={{ marginBottom: 12 }}>
          📱 HEIC files detected. Will auto-convert using heic2any library.
        </div>
      )}

      {files.length > 0 && (
        <div>
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={i} className="file-item">
                <span className="file-item-icon">🖼️</span>
                <span className="file-item-name">{f.name}</span>
                <span className="file-item-size">{formatBytes(f.size)}</span>
                <button className="file-item-remove" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>✕</button>
              </li>
            ))}
          </ul>

          <div className="options-panel" style={{ marginTop: 14 }}>
            <div className="options-panel-title">Conversion Options</div>
            <div className="opt-row">
              <label className="opt-label">Convert To</label>
              <select className="opt-select" value={targetFormat} onChange={(e) => setTargetFormat(e.target.value as ConvertFormat)}>
                <option value="image/jpeg">JPG — Best for photos</option>
                <option value="image/png">PNG — Lossless, transparency</option>
                <option value="image/webp">WebP — Smallest modern format</option>
              </select>
            </div>
            {targetFormat !== "image/png" && (
              <div className="opt-row">
                <label className="opt-label">Quality</label>
                <input type="range" min="60" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: "0.82rem", color: "var(--text-2)", minWidth: 36 }}>{quality}%</span>
              </div>
            )}
          </div>

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={convert} disabled={status === "processing"}>
            {status === "processing" ? <><span className="spinner" /> Converting…</> : `🔄 Convert ${files.length} Image${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <div className="result-panel" style={{ marginTop: 20, textAlign: "left" }}>
          <h3>✅ Conversion Complete!</h3>
          <p>{results.length} image{results.length > 1 ? "s" : ""} converted to {EXT[targetFormat].toUpperCase()}</p>
          <ul className="file-list" style={{ marginBottom: 16 }}>
            {results.map((r, i) => (
              <li key={i} className="file-item">
                <span className="file-item-icon">✅</span>
                <span className="file-item-name">{r.name}</span>
                <span className="file-item-size">{formatBytes(r.size)}</span>
                <a href={r.url} download={r.name} className="copy-btn" style={{ fontSize: "0.78rem" }}>⬇</a>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-success" onClick={downloadAll}>⬇ Download {results.length > 1 ? "All as ZIP" : "File"}</button>
            <button className="btn btn-secondary" onClick={() => { setFiles([]); setResults([]); setStatus("idle"); }}>↺ New Batch</button>
          </div>
        </div>
      )}
    </div>
  );
}
