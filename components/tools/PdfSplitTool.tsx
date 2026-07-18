"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "every">("range");
  const [rangeInput, setRangeInput] = useState("1-3, 4-6");
  const [everyN, setEveryN] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("split.zip");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (f: File) => {
    setFile(f);
    setStatus("loading");
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const parseRanges = (input: string, total: number): number[][] => {
    return input.split(",").map((s) => {
      const trimmed = s.trim();
      const match = trimmed.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) return [];
      const start = Math.max(1, parseInt(match[1]));
      const end = Math.min(total, match[2] ? parseInt(match[2]) : start);
      return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    }).filter((r) => r.length > 0);
  };

  const split = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(10);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = src.getPageCount();
      let groups: number[][] = [];

      if (mode === "range") {
        groups = parseRanges(rangeInput, total);
      } else {
        for (let i = 0; i < total; i += everyN) {
          groups.push(Array.from({ length: Math.min(everyN, total - i) }, (_, j) => i + j));
        }
      }

      if (groups.length === 0) { setStatus("error"); return; }

      setProgress(30);
      const zip = new JSZip();
      for (let g = 0; g < groups.length; g++) {
        setProgress(30 + Math.floor((g / groups.length) * 60));
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(src, groups[g]);
        pages.forEach((p) => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        zip.file(`part_${g + 1}.pdf`, pdfBytes);
      }

      setProgress(95);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setResultUrl(URL.createObjectURL(zipBlob));
      setResultName(`split_${file.name.replace(".pdf", "")}.zip`);
      setStatus("done");
      setProgress(100);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <div
        className={`upload-zone`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {file ? (
          <>
            <span className="upload-icon">📄</span>
            <div className="upload-title">{file.name}</div>
            <div className="upload-hint">{pageCount} pages · {formatBytes(file.size)} · Click to change</div>
          </>
        ) : (
          <>
            <span className="upload-icon">📂</span>
            <div className="upload-title">Drop a PDF file here or click to browse</div>
            <div className="upload-hint">Supports any PDF file</div>
          </>
        )}
      </div>

      {status === "loading" && <div className="status-box status-box-info" style={{ marginTop: 12 }}><span className="spinner" /><span>Loading PDF...</span></div>}

      {file && status !== "loading" && (
        <div className="options-panel" style={{ marginTop: 20 }}>
          <h4>Split Options</h4>
          <div style={{ display: "flex", marginBottom: 16 }}>
            <div className="tabs">
              <button className={`tab${mode === "range" ? " active" : ""}`} onClick={() => setMode("range")}>By Page Range</button>
              <button className={`tab${mode === "every" ? " active" : ""}`} onClick={() => setMode("every")}>Every N Pages</button>
            </div>
          </div>

          {mode === "range" ? (
            <div className="option-row">
              <span className="option-label">Page ranges</span>
              <input className="option-input" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} placeholder="e.g. 1-3, 4-6, 7" />
            </div>
          ) : (
            <div className="option-row">
              <span className="option-label">Split every</span>
              <input className="option-input" type="number" min={1} max={pageCount} value={everyN} onChange={(e) => setEveryN(parseInt(e.target.value) || 1)} style={{ maxWidth: 80 }} />
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>page(s) · {pageCount} total</span>
            </div>
          )}
        </div>
      )}

      {file && status !== "loading" && (
        <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={status === "processing"} onClick={split}>
          {status === "processing" ? <><span className="spinner" /> Splitting...</> : "✂️ Split PDF"}
        </button>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Failed to split PDF. Check page ranges and try again.</span></div>}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Split Complete!</h3>
          <p>Your PDF has been split into separate files, bundled as a ZIP.</p>
          <a href={resultUrl} download={resultName} className="btn btn-primary btn-lg">⬇ Download ZIP</a>
        </div>
      )}
    </div>
  );
}
