"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

interface FileEntry {
  file: File;
  id: string;
}

export default function PdfMergeTool() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles((prev) => [...prev, ...pdfs.map((f) => ({ file: f, id: crypto.randomUUID() }))]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const merge = async () => {
    if (files.length < 2) return;
    setStatus("processing");
    setProgress(10);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(10 + Math.floor((i / files.length) * 80));
        const bytes = await files[i].file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress(95);
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
      setProgress(100);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        className={`upload-zone${dragOver ? " drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: "none" }} />
        <span className="upload-icon">📂</span>
        <div className="upload-title">Drop PDF files here or click to browse</div>
        <div className="upload-hint">Select 2 or more PDF files to merge • Files processed locally in your browser</div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={f.id} className="file-item">
              <span className="file-item-icon">📄</span>
              <span className="file-item-name">
                <span style={{ color: "var(--text-muted)", marginRight: 6, fontSize: "0.75rem" }}>#{i + 1}</span>
                {f.file.name}
              </span>
              <span className="file-item-size">{formatBytes(f.file.size)}</span>
              <button className="file-item-remove" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <button className="btn btn-primary" disabled={files.length < 2 || status === "processing"} onClick={merge}>
          {status === "processing" ? <><span className="spinner" /> Merging...</> : "🔗 Merge PDFs"}
        </button>
        {files.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFiles([])}>Clear All</button>
        )}
      </div>

      {files.length > 0 && files.length < 2 && (
        <div className="status-box status-box-info" style={{ marginTop: 12 }}>
          <span>ℹ️</span><span>Add at least 2 PDF files to merge.</span>
        </div>
      )}

      {/* Progress */}
      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>Merging {files.length} files...</p>
        </div>
      )}

      {status === "error" && (
        <div className="status-box status-box-error" style={{ marginTop: 16 }}>
          <span>❌</span><span>Failed to merge PDFs. Make sure all files are valid, unencrypted PDFs.</span>
        </div>
      )}

      {/* Result */}
      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Merge Complete!</h3>
          <p>Your PDFs have been merged successfully.</p>
          <a href={resultUrl} download="merged.pdf" className="btn btn-primary btn-lg">
            ⬇ Download Merged PDF
          </a>
        </div>
      )}
    </div>
  );
}
