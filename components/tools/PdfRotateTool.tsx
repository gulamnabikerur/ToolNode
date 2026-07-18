"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

type Rotation = 90 | 180 | 270;

export default function PdfRotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotateAll, setRotateAll] = useState(true);
  const [pageInput, setPageInput] = useState("");
  const [rotation, setRotation] = useState<Rotation>(90);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState("");

  const onFile = async (f: File) => {
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
  };

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();

      let targetPages: number[];
      if (rotateAll) {
        targetPages = pages.map((_, i) => i);
      } else {
        targetPages = pageInput
          .split(",")
          .flatMap((p) => {
            const [s, e] = p.trim().split("-").map(Number);
            if (isNaN(s)) return [];
            if (isNaN(e)) return [s - 1];
            return Array.from({ length: e - s + 1 }, (_, i) => s + i - 1);
          })
          .filter((i) => i >= 0 && i < pages.length);
      }

      targetPages.forEach((i) => {
        const page = pages[i];
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept=".pdf,application/pdf" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <span className="upload-zone-icon">🔃</span>
          <div className="upload-zone-title">Drop a PDF here or click to browse</div>
          <div className="upload-zone-sub">PDF files only · All pages processed in browser</div>
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
            <div className="options-panel-title">Rotation Options</div>
            <div className="opt-row">
              <label className="opt-label">Rotation</label>
              <div style={{ display: "flex", gap: 8 }}>
                {([90, 180, 270] as Rotation[]).map((r) => (
                  <button key={r} className={`copy-btn`} style={rotation === r ? { borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-soft)" } : {}} onClick={() => setRotation(r)}>
                    {r === 90 ? "↻ 90°" : r === 180 ? "🔄 180°" : "↺ 270°"}
                  </button>
                ))}
              </div>
            </div>
            <div className="opt-row">
              <label className="opt-label">Pages</label>
              <div style={{ flex: 1 }}>
                <select className="opt-select" value={rotateAll ? "all" : "custom"} onChange={(e) => setRotateAll(e.target.value === "all")}>
                  <option value="all">All pages</option>
                  <option value="custom">Custom pages</option>
                </select>
                {!rotateAll && (
                  <input className="opt-input" style={{ marginTop: 8 }} placeholder={`e.g. 1,3,5-7 (of ${pageCount} pages)`} value={pageInput} onChange={(e) => setPageInput(e.target.value)} />
                )}
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={process} disabled={status === "processing"}>
            {status === "processing" ? <><span className="spinner" /> Rotating…</> : "🔃 Rotate PDF"}
          </button>
        </div>
      )}

      {status === "error" && <div className="status-box status-error" style={{ marginTop: 14 }}>❌ Failed to process PDF. Please try a different file.</div>}
      {status === "done" && (
        <div className="result-panel" style={{ marginTop: 20, textAlign: "left" }}>
          <h3>✅ PDF Rotated!</h3>
          <p>Pages have been rotated by {rotation}°</p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={resultUrl} download="rotated.pdf" className="btn btn-success">⬇ Download Rotated PDF</a>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setStatus("idle"); setResultUrl(""); }}>↺ New PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
