"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfDeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const [keepMode, setKeepMode] = useState(false); // false = delete, true = keep
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const [resultPages, setResultPages] = useState(0);

  const onFile = async (f: File) => {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  };

  const parsePages = (input: string, total: number): number[] => {
    const indices = new Set<number>();
    input.split(",").forEach((part) => {
      const [a, b] = part.trim().split("-").map(Number);
      if (!isNaN(a)) {
        if (!isNaN(b)) { for (let i = a; i <= b; i++) if (i >= 1 && i <= total) indices.add(i - 1); }
        else if (a >= 1 && a <= total) indices.add(a - 1);
      }
    });
    return Array.from(indices).sort((a, b) => a - b);
  };

  const process = async () => {
    if (!file || !pageInput.trim()) return;
    setStatus("processing");
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const total = src.getPageCount();
      const parsed = parsePages(pageInput, total);

      let keepIndices: number[];
      if (keepMode) keepIndices = parsed;
      else keepIndices = Array.from({ length: total }, (_, i) => i).filter((i) => !parsed.includes(i));

      if (keepIndices.length === 0) { setStatus("error"); return; }

      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keepIndices);
      copied.forEach((p) => out.addPage(p));

      const pdfBytes = await out.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setResultPages(keepIndices.length);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <span className="upload-zone-icon">🗑️</span>
          <div className="upload-zone-title">Drop a PDF here or click to browse</div>
          <div className="upload-zone-sub">Select pages to delete or keep</div>
        </div>
      ) : (
        <div>
          <div className="file-item">
            <span className="file-item-icon">📄</span>
            <span className="file-item-name">{file.name}</span>
            <span className="file-item-size">{formatBytes(file.size)} · {pageCount} pages</span>
            <button className="file-item-remove" onClick={() => { setFile(null); setStatus("idle"); setResultUrl(""); }}>✕</button>
          </div>

          <div className="options-panel" style={{ marginTop: 14 }}>
            <div className="options-panel-title">Page Options</div>
            <div className="opt-row">
              <label className="opt-label">Mode</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="copy-btn" style={!keepMode ? { borderColor: "var(--error)", color: "var(--error)", background: "var(--error-soft)" } : {}} onClick={() => setKeepMode(false)}>🗑️ Delete listed</button>
                <button className="copy-btn" style={keepMode ? { borderColor: "var(--success)", color: "var(--success)", background: "var(--success-soft)" } : {}} onClick={() => setKeepMode(true)}>✅ Keep listed</button>
              </div>
            </div>
            <div className="opt-row">
              <label className="opt-label">Pages</label>
              <input className="opt-input" placeholder={`e.g. 1,3,5-7 (of ${pageCount} pages)`} value={pageInput} onChange={(e) => setPageInput(e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={process} disabled={status === "processing" || !pageInput.trim()}>
            {status === "processing" ? <><span className="spinner" /> Processing…</> : keepMode ? "✅ Keep Selected Pages" : "🗑️ Delete Selected Pages"}
          </button>
        </div>
      )}

      {status === "error" && <div className="status-box status-error" style={{ marginTop: 14 }}>❌ Failed. Check page numbers are valid (1–{pageCount}).</div>}
      {status === "done" && (
        <div className="result-panel" style={{ marginTop: 20, textAlign: "left" }}>
          <h3>✅ Done!</h3>
          <p>Result: {resultPages} page{resultPages !== 1 ? "s" : ""} remaining</p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={resultUrl} download="modified.pdf" className="btn btn-success">⬇ Download PDF</a>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setStatus("idle"); setResultUrl(""); }}>↺ New PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
