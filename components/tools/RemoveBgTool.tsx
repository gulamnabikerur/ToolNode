"use client";
import { useState, useRef } from "react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

interface RemoveBgToolProps {
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function RemoveBgTool({ onCreditUsed, onUpgradeNeeded }: RemoveBgToolProps) {
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

      const res = await fetch("/api/tools/remove-bg", { method: "POST", body: formData });
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
      const msg = e instanceof Error ? e.message : "Processing failed";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  return (
    <div>
      <div
        className={`upload-zone${dragOver ? " drag-over" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Upload image to remove background"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
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
            <span className="upload-icon">🪄</span>
            <div className="upload-title">Drop an image here or click to browse</div>
            <div className="upload-hint">JPG, PNG, WebP supported · Uses 1 AI credit</div>
          </>
        )}
      </div>

      {file && (
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={process} disabled={status === "processing"}>
            {status === "processing" ? <><span className="spinner" /> Removing background...</> : "🪄 Remove Background"}
          </button>
          {resultUrl && <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setPreview(null); setResultUrl(null); setStatus("idle"); }}>New Image</button>}
        </div>
      )}

      {status === "processing" && (
        <div className="status-box status-box-info" style={{ marginTop: 16 }}>
          <span className="spinner" />
          <span>AI is processing your image... This may take 15–30 seconds on first use.</span>
        </div>
      )}

      {status === "error" && (
        <div className="status-box status-box-error" style={{ marginTop: 16 }}>
          <span>❌</span>
          <span>{errorMsg || "Background removal failed. Please try again with a different image."}</span>
        </div>
      )}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Background Removed!</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Original</div>
              {preview && <img src={preview} alt="Original" className="result-image" style={{ maxHeight: 200 }} />}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>Background Removed</div>
              <div style={{ background: "repeating-conic-gradient(#888 0% 25%, transparent 0% 50%) 0 0 / 16px 16px", borderRadius: 8 }}>
                <img src={resultUrl} alt="Result" className="result-image" style={{ maxHeight: 200 }} />
              </div>
            </div>
          </div>
          <a href={resultUrl} download="no-background.png" className="btn btn-primary btn-lg">⬇ Download PNG</a>
        </div>
      )}
    </div>
  );
}
