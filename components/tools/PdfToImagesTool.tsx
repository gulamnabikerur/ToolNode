"use client";
import { useState, useRef } from "react";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<"72" | "150" | "300">("150");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const convert = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(5);
    setPreviews([]);
    try {
      const scale = { "72": 1, "150": 2, "300": 4 }[dpi];
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = pdf.numPages;
      const zip = new JSZip();
      const previewUrls: string[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress(5 + Math.floor((i / total) * 90));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL("image/png");
        previewUrls.push(dataUrl);
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
        zip.file(`page_${i}.png`, bytes);
      }

      setPreviews(previewUrls.slice(0, 4));
      setProgress(98);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setResultUrl(URL.createObjectURL(zipBlob));
      setStatus("done");
      setProgress(100);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
        {file ? (<><span className="upload-icon">📄</span><div className="upload-title">{file.name}</div><div className="upload-hint">{formatBytes(file.size)} · Click to change</div></>)
          : (<><span className="upload-icon">📸</span><div className="upload-title">Drop a PDF file here or click to browse</div><div className="upload-hint">Each page will be converted to a PNG image</div></>)}
      </div>

      {file && (
        <div className="options-panel">
          <h4>Output Quality (DPI)</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {(["72", "150", "300"] as const).map((d) => (
              <button key={d} className={`btn ${dpi === d ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setDpi(d)}>
                {d} DPI {d === "72" ? "(Fast)" : d === "150" ? "(Balanced)" : "(High-Res)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {file && (
        <button className="btn btn-primary" onClick={convert} disabled={status === "processing"}>
          {status === "processing" ? <><span className="spinner" /> Converting pages...</> : "📸 Convert to Images"}
        </button>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>Rendering pages... {progress}%</p>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Failed to convert PDF. The file may be corrupted or password-protected.</span></div>}

      {status === "done" && (
        <div className="result-section">
          <h3>✅ Conversion Complete!</h3>
          {previews.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, margin: "16px 0" }}>
              {previews.map((url, i) => (
                <img key={i} src={url} alt={`Page ${i + 1}`} style={{ borderRadius: 8, border: "1px solid var(--border)", width: "100%" }} />
              ))}
              {previews.length < 4 ? null : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: 8 }}>+more</div>}
            </div>
          )}
          <a href={resultUrl!} download={`pages_${file?.name?.replace(".pdf", "")}.zip`} className="btn btn-primary btn-lg">⬇ Download All Pages (ZIP)</a>
        </div>
      )}
    </div>
  );
}
