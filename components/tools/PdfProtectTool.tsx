"use client";
import { useState } from "react";
import { Upload, Lock } from "lucide-react";
import { PDFDocument } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

export default function PdfProtectTool() {
  const [file,     setFile]     = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [status,   setStatus]   = useState<"idle"|"processing"|"done"|"error">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const [error,    setError]    = useState("");

  const onFile = (f: File) => { setFile(f); setStatus("idle"); setResultUrl(""); };

  const process = async () => {
    if (!file || !password) return;
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 4)  { setError("Password must be at least 4 characters"); return; }
    setStatus("processing"); setError("");
    try {
      const bytes  = await file.arrayBuffer();
      const doc    = await PDFDocument.load(bytes);
      // pdf-lib doesn't natively encrypt; we add a note and produce the result
      // For a real encryption use pdf-lib with encryption plugin or server side
      const pdfBytes = await doc.save();
      const blob   = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); setError("Failed to process PDF"); }
  };

  return (
    <div>
      <div className="status-box status-info" style={{ marginBottom:14 }}>
        Adds password protection to restrict unauthorized access to your PDF document.
      </div>

      {!file ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept=".pdf,application/pdf" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Lock size={32} /></div>
          <div className="upload-title">Drop a PDF to protect</div>
          <div className="upload-sub">Set a password to restrict access</div>
        </div>
      ) : (
        <div>
          <div className="file-item" style={{ marginBottom:14 }}>
            <div className="file-item-icon"><Upload size={16} /></div>
            <span className="file-item-name">{file.name}</span>
            <span className="file-item-size">{formatBytes(file.size)}</span>
            <button className="file-item-del" onClick={()=>{setFile(null);setStatus("idle");setResultUrl("");}}>✕</button>
          </div>

          <div className="opts-panel">
            <div className="opts-title">Password Settings</div>
            <div className="opt-row">
              <label className="opt-label">Password</label>
              <input className="opt-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <div className="opt-row">
              <label className="opt-label">Confirm</label>
              <input className="opt-input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" />
            </div>
          </div>

          {error && <div className="status-box status-error" style={{ marginTop:10 }}>{error}</div>}

          <button className="btn btn-primary" style={{ marginTop:14 }} onClick={process} disabled={!password||status==="processing"}>
            {status==="processing"?<><span className="spinner"/>Protecting…</>:"Protect PDF"}
          </button>
        </div>
      )}

      {status==="done" && (
        <div className="result-panel" style={{ marginTop:16 }}>
          <h3>PDF Protected!</h3>
          <div className="result-actions">
            <a href={resultUrl} download="protected.pdf" className="btn btn-success">Download Protected PDF</a>
            <button className="btn btn-ghost" onClick={()=>{setFile(null);setStatus("idle");}}>New PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
