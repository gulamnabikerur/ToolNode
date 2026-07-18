"use client";
import { useState, useRef } from "react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

interface ImageUpscaleToolProps {
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageUpscaleTool({ onCreditUsed, onUpgradeNeeded }: ImageUpscaleToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setResultUrl(null);
  };

  const process = async () => {
    if (!file) return;
    if (!hasCreditsRemaining()) { onUpgradeNeeded(); return; }
    setStatus("processing");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/tools/image-upscale", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "API error");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      consumeCredit();
      onCreditUsed();
      setStatus("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Processing failed");
      setStatus("error");
    }
  };

  return (
    <div>
      <div
        className={`upload-zone${dragOver ? " drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {preview ? (
          <div>
            <img src={preview} alt="Preview" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, marginBottom: 8 }} />
            <div className="upload-hint">{file?.name} · {file ? formatBytes(file.size) : ""} · Click to change</div>
          </div>
        ) : (
          <>
            <span className="upload-icon">🔬</span>
            <div className="upload-title">Drop an image to upscale or click to browse</div>
            <div className="upload-hint">JPG, PNG, WebP · Up to 4× AI upscaling · Uses 1 AI credit</div>
          </>
        )}
      </div>

      <div className="status-box status-box-info" style={{ marginTop: 12 }}>
        <span>ℹ️</span>
        <span>Uses Real-ESRGAN AI model. First request may take 30–60 seconds to warm up.</span>
      </div>

      {file && (
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={process} disabled={status === "processing"}>
          {status === "processing" ? <><span className="spinner" /> Upscaling with AI...</> : "🔬 Upscale 4× with AI"}
        </button>
      )}

      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>{errorMsg}</span></div>}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Image Upscaled!</h3>
          <img src={resultUrl} alt="Upscaled" className="result-image" />
          <a href={resultUrl} download="upscaled.png" className="btn btn-primary btn-lg">⬇ Download Upscaled Image</a>
        </div>
      )}
    </div>
  );
}
