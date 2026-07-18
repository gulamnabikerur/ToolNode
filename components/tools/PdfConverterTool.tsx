"use client";
import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"txt" | "csv">("txt");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const convert = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(5);
    setExtractedData("");
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= total; i++) {
        setProgress(5 + Math.floor((i / total) * 90));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        if (format === "txt") {
          // Join items with spaces, preserving natural structure loosely
          const pageText = content.items.map((item: any) => item.str).join(" ");
          fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
        } else {
          // Attempt to map text items as CSV rows by grouping Y-coordinates
          const rows: Record<number, string[]> = {};
          content.items.forEach((item: any) => {
            // Round Y coordinate to group text on the same line
            const y = Math.round(item.transform[5] / 5) * 5; 
            if (!rows[y]) rows[y] = [];
            // Escape commas in strings
            const str = item.str.includes(",") ? `"${item.str}"` : item.str;
            if (str.trim()) rows[y].push(str);
          });
          
          // Sort rows top to bottom (Y decreases)
          const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a);
          const pageCsv = sortedY.map((y) => rows[y].join(",")).join("\n");
          fullText += pageCsv + "\n";
        }
      }

      setExtractedData(fullText);
      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const download = () => {
    const blob = new Blob([extractedData], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_${file?.name?.replace(".pdf", "")}.${format}`;
    a.click();
  };

  const copy = () => {
    navigator.clipboard.writeText(extractedData);
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
          : (<><span className="upload-icon">📑</span><div className="upload-title">Drop a PDF file here or click to browse</div><div className="upload-hint">Extract all text and tables locally. 100% Free.</div></>)}
      </div>

      {file && (
        <div className="options-panel">
          <h4>Output Format</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {(["txt", "csv"] as const).map((f) => (
              <button key={f} className={`btn ${format === f ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setFormat(f)}>
                {f === "txt" ? "TXT (Plain Text)" : "CSV (Excel Spreadsheet)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {file && (
        <button className="btn btn-primary" onClick={convert} disabled={status === "processing"}>
          {status === "processing" ? <><span className="spinner" /> Extracting Data...</> : `📑 Extract to ${format.toUpperCase()}`}
        </button>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>Processing Document... {progress}%</p>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Failed to extract text. The file may be an image-only PDF without OCR data.</span></div>}

      {status === "done" && (
        <div className="result-section" style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>✅ Data Extracted</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={copy}>📋 Copy Text</button>
              <button className="btn btn-primary btn-sm" onClick={download}>⬇ Download .{format}</button>
            </div>
          </div>
          <textarea
            readOnly
            className="text-output"
            value={extractedData.slice(0, 1000) + (extractedData.length > 1000 ? "\n\n...[Preview truncated. Download full file to see the rest]..." : "")}
            style={{ width: "100%", height: 300, padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "monospace", fontSize: "0.85rem" }}
          />
        </div>
      )}
    </div>
  );
}
