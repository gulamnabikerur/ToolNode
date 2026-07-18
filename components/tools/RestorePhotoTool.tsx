"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

function formatBytes(b: number) {
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

type RestoreProps = { onCreditUsed: () => void; onUpgradeNeeded: () => void };

export default function RestorePhotoTool({ onCreditUsed, onUpgradeNeeded }: RestoreProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus]   = useState<"idle"|"loading"|"done"|"error">("idle");
  const [result, setResult]   = useState("");
  const [error,  setError]    = useState("");

  const onFile = (f: File) => {
    setFile(f); setPreview(URL.createObjectURL(f));
    setStatus("idle"); setResult(""); setError("");
  };

  const process = async () => {
    if (!file) return;
    if (!hasCreditsRemaining()) { onUpgradeNeeded(); return; }
    setStatus("loading"); setError("");
    try {
      const form = new FormData(); form.append("image", file);
      const res = await fetch("/api/tools/restore-photo", { method:"POST", body:form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.url || "");
      consumeCredit(); onCreditUsed();
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Restoration failed");
      setStatus("error");
    }
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop a damaged or old photo</div>
          <div className="upload-sub">Works great on old, scratched, or faded photos · JPG, PNG</div>
        </div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Original</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="original" style={{ width:"100%", borderRadius:8, border:"1px solid var(--border)" }} />
              <div style={{ fontSize:"0.75rem", color:"var(--text-3)", marginTop:5 }}>{file.name} · {formatBytes(file.size)}</div>
            </div>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Restored</div>
              {status==="done" && result
                ? <img src={result} alt="restored" style={{ width:"100%", borderRadius:8, border:"1px solid var(--green)" }} />
                : <div style={{ width:"100%", aspectRatio:"1", borderRadius:8, border:"1px dashed var(--border)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, color:"var(--text-3)" }}>
                    {status==="loading" ? <><span className="spinner spinner-dark spinner-lg" /><span style={{ fontSize:"0.82rem" }}>Restoring…</span></> : <span style={{ fontSize:"0.82rem" }}>Result appears here</span>}
                  </div>
              }
            </div>
          </div>

          {status==="error" && <div className="status-box status-error" style={{ marginBottom:12 }}>{error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            {status!=="done" && (
              <button className="btn btn-primary" onClick={process} disabled={status==="loading"}>
                {status==="loading" ? <><span className="spinner"/>Restoring…</> : "Restore Photo (1 credit)"}
              </button>
            )}
            {status==="done" && result && (
              <a href={result} download="restored.jpg" className="btn btn-success">Download Restored</a>
            )}
            <button className="btn btn-ghost" onClick={()=>{setFile(null);setPreview("");setResult("");setStatus("idle");}}>New Photo</button>
          </div>
        </div>
      )}
    </div>
  );
}
