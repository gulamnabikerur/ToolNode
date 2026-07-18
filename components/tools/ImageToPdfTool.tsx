"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    const imgs = Array.from(fl).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
  };

  const PAGE_SIZES = {
    a4: [595.28, 841.89] as [number, number],
    letter: [612, 792] as [number, number],
  };

  const convert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setProgress(10);
    try {
      const doc = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(10 + Math.floor((i / files.length) * 80));
        const f = files[i];
        const buf = await f.arrayBuffer();
        const uint8 = new Uint8Array(buf);
        let img;
        if (f.type === "image/jpeg" || f.type === "image/jpg") {
          img = await doc.embedJpg(uint8);
        } else {
          // Convert any image to PNG via canvas
          const canvas = document.createElement("canvas");
          const imgEl = new Image();
          const url = URL.createObjectURL(f);
          await new Promise<void>((res, rej) => {
            imgEl.onload = () => {
              canvas.width = imgEl.naturalWidth;
              canvas.height = imgEl.naturalHeight;
              canvas.getContext("2d")?.drawImage(imgEl, 0, 0);
              res();
            };
            imgEl.onerror = rej;
            imgEl.src = url;
          });
          URL.revokeObjectURL(url);
          const pngData = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
          img = await doc.embedPng(pngData);
        }

        let pageW: number, pageH: number;
        if (pageSize === "fit") {
          pageW = img.width;
          pageH = img.height;
        } else {
          [pageW, pageH] = PAGE_SIZES[pageSize];
        }

        const page = doc.addPage([pageW, pageH]);
        const scale = Math.min(pageW / img.width, pageH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        page.drawImage(img, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }
      setProgress(95);
      const pdfBytes = await doc.save();
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
      <div
        className={`upload-zone${dragOver ? " drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
        <span className="upload-icon">🖼️</span>
        <div className="upload-title">Drop images here or click to browse</div>
        <div className="upload-hint">JPG, PNG, WebP, GIF supported · Multiple images → single PDF</div>
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i} className="file-item">
              <span className="file-item-icon">🖼️</span>
              <span className="file-item-name">{f.name}</span>
              <span className="file-item-size">{formatBytes(f.size)}</span>
              <button className="file-item-remove" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="options-panel">
          <h4>Page Size</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {(["a4", "letter", "fit"] as const).map((ps) => (
              <button key={ps} className={`btn ${pageSize === ps ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setPageSize(ps)}>
                {ps === "a4" ? "A4" : ps === "letter" ? "Letter" : "Fit to Image"}
              </button>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={convert} disabled={status === "processing"}>
            {status === "processing" ? <><span className="spinner" /> Converting...</> : "🖼️ Convert to PDF"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFiles([])}>Clear All</button>
        </div>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Conversion failed. Please check your image files.</span></div>}
      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Conversion Complete!</h3>
          <p>{files.length} image{files.length > 1 ? "s" : ""} converted to PDF.</p>
          <a href={resultUrl} download="images.pdf" className="btn btn-primary btn-lg">⬇ Download PDF</a>
        </div>
      )}
    </div>
  );
}
