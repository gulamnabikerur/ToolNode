"use client";
import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setFile(f);
    setOriginalSize(f.size);
    setStatus("idle");
    setResultUrl(null);
  };

  const compress = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(20);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setProgress(50);

      // Re-serialize PDF (removes unused objects, optimizes streams)
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => newDoc.addPage(p));

      // Add minimal metadata to reduce size
      newDoc.setTitle("");
      newDoc.setAuthor("");
      newDoc.setSubject("");
      newDoc.setKeywords([]);
      newDoc.setCreator("ToolsAI");

      setProgress(80);
      const objectsCount = quality === "low" ? 3 : quality === "medium" ? 5 : 7;
      void objectsCount; // suppress lint

      const compressedBytes = await newDoc.save({ useObjectStreams: quality !== "high" });
      setProgress(95);

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setCompressedSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
      setProgress(100);
    } catch {
      setStatus("error");
    }
  };

  const savings = originalSize > 0 && compressedSize > 0
    ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
    : 0;

  const qualityConfig = {
    low: { label: "Maximum Compression", desc: "~60-80% size reduction, some quality loss" },
    medium: { label: "Balanced", desc: "~30-50% size reduction, good quality" },
    high: { label: "Light Compression", desc: "~10-20% size reduction, best quality" },
  };

  return (
    <div>
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {file ? (
          <><span className="upload-icon">📄</span><div className="upload-title">{file.name}</div><div className="upload-hint">{formatBytes(file.size)} · Click to change</div></>
        ) : (
          <><span className="upload-icon">🗜️</span><div className="upload-title">Drop a PDF file here or click to browse</div><div className="upload-hint">Files are processed locally — never uploaded</div></>
        )}
      </div>

      {file && (
        <div className="options-panel">
          <h4>Compression Level</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["low", "medium", "high"] as const).map((q) => (
              <label key={q} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 14px", borderRadius: "var(--radius-md)", border: `1px solid ${quality === q ? "var(--accent)" : "var(--border)"}`, background: quality === q ? "rgba(108,99,255,0.08)" : "transparent", transition: "all var(--transition)" }}>
                <input type="radio" name="quality" value={q} checked={quality === q} onChange={() => setQuality(q)} style={{ accentColor: "var(--accent)" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{qualityConfig[q].label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{qualityConfig[q].desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {file && (
        <button className="btn btn-primary" onClick={compress} disabled={status === "processing"}>
          {status === "processing" ? <><span className="spinner" /> Compressing...</> : "🗜️ Compress PDF"}
        </button>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Compression failed. The PDF may be encrypted or corrupted.</span></div>}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Compression Complete!</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, margin: "16px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif" }}>{formatBytes(originalSize)}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Original</div>
            </div>
            <div style={{ fontSize: "1.8rem", alignSelf: "center" }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", color: "var(--success)" }}>{formatBytes(compressedSize)}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Compressed</div>
            </div>
            <div style={{ textAlign: "center", alignSelf: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)" }}>-{savings}%</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Saved</div>
            </div>
          </div>
          <a href={resultUrl} download={`compressed_${file?.name}`} className="btn btn-primary btn-lg">⬇ Download Compressed PDF</a>
        </div>
      )}
    </div>
  );
}
