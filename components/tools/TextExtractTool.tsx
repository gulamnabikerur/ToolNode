"use client";
import { useState, useRef } from "react";
import { useTesseractOcr } from "@/hooks/useTesseractOcr";

interface TextExtractToolProps {
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function TextExtractTool({ onCreditUsed, onUpgradeNeeded }: TextExtractToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { status, progress, progressStatus, extractedText, setExtractedText, errorMsg, extractText } = useTesseractOcr();

  const loadFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleExtract = () => {
    if (file) extractText(file, language);
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_${file?.name?.split(".")[0] || "text"}.txt`;
    a.click();
  };

  return (
    <div>
      <div
        className={`upload-zone${dragOver ? " drag-over" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Upload image or PDF for OCR"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {preview ? (
          <div>
            <img src={preview} alt="Preview" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, marginBottom: 8 }} />
            <div className="upload-hint">{file?.name} · {file ? formatBytes(file.size) : ""}</div>
          </div>
        ) : file ? (
          <>
            <span className="upload-icon">📄</span>
            <div className="upload-title">{file.name}</div>
            <div className="upload-hint">{formatBytes(file.size)} · Click to change</div>
          </>
        ) : (
          <>
            <span className="upload-icon">📝</span>
            <div className="upload-title">Drop an image here or click to browse</div>
            <div className="upload-hint">JPG, PNG supported · 100% Free · Powered by Tesseract WebAssembly</div>
          </>
        )}
      </div>

      {file && (
        <div className="options-panel">
          <h4>Language</h4>
          <select className="option-select" style={{ maxWidth: 200 }} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="eng">English</option>
            <option value="ara">Arabic</option>
            <option value="chi_sim">Chinese (Simplified)</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="hin">Hindi</option>
            <option value="jpn">Japanese</option>
            <option value="kor">Korean</option>
            <option value="por">Portuguese</option>
            <option value="rus">Russian</option>
            <option value="spa">Spanish</option>
          </select>
        </div>
      )}

      {file && (
        <button className="btn btn-primary" onClick={handleExtract} disabled={status === "processing"}>
          {status === "processing" ? <><span className="spinner" /> Extracting text...</> : "📝 Extract Text (OCR)"}
        </button>
      )}

      {status === "processing" && (
        <div className="status-box status-box-info" style={{ marginTop: 16 }}>
          <span className="spinner" />
          <div style={{ flex: 1, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem" }}>
              <span style={{ textTransform: "capitalize" }}>{progressStatus}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--blue)", transition: "width 0.2s ease" }} />
            </div>
          </div>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>{errorMsg}</span></div>}

      {status === "done" && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>✅ Extracted Text</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="copy-btn" onClick={copyText}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
              <button className="copy-btn" onClick={downloadText}>⬇ Download .txt</button>
            </div>
          </div>
          <textarea
            className="text-output"
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            style={{ minHeight: 300 }}
            readOnly={false}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8 }}>
            {extractedText.split(/\s+/).filter(Boolean).length} words · {extractedText.length} characters
          </p>
        </div>
      )}
    </div>
  );
}
