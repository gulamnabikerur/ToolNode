"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

type AiColorizeProps = { onCreditUsed: () => void; onUpgradeNeeded: () => void };

export default function AiColorizeTool({ onCreditUsed, onUpgradeNeeded }: AiColorizeProps) {
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status,  setStatus]  = useState<"idle"|"loading"|"done"|"error">("idle");
  const [result,  setResult]  = useState("");
  const [error,   setError]   = useState("");

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
      const res  = await fetch("/api/tools/ai-colorize", { method:"POST", body:form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Colorization failed");
      setResult(data.url || "");
      consumeCredit(); onCreditUsed();
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
      setStatus("error");
    }
  };

  return (
    <div>
      <div className="status-box status-info" style={{ marginBottom:14 }}>
        Works best on black-and-white or faded historical photos. AI adds realistic colors based on scene context.
      </div>

      {!file ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop a black & white photo</div>
          <div className="upload-sub">JPG, PNG, WebP — any size</div>
        </div>
      ) : (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>B&W Original</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="bw" style={{ width:"100%", borderRadius:8, border:"1px solid var(--border)", filter:"grayscale(30%)" }} />
            </div>
            <div>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Colorized</div>
              {status==="done" && result
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={result} alt="colorized" style={{ width:"100%", borderRadius:8, border:"1px solid var(--green)" }} />
                : <div style={{ width:"100%", aspectRatio:"1", borderRadius:8, border:"1px dashed var(--border)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8, color:"var(--text-3)" }}>
                    {status==="loading" ? <><span className="spinner spinner-dark spinner-lg"/><span style={{ fontSize:"0.82rem" }}>Colorizing…</span></> : <span style={{ fontSize:"0.82rem" }}>Result appears here</span>}
                  </div>
              }
            </div>
          </div>

          {status==="error" && <div className="status-box status-error" style={{ marginBottom:12 }}>{error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            {status!=="done"
              ? <button className="btn btn-primary" onClick={process} disabled={status==="loading"}>
                  {status==="loading" ? <><span className="spinner"/>Colorizing…</> : "Colorize Photo (1 credit)"}
                </button>
              : result && <a href={result} download="colorized.jpg" className="btn btn-success">Download Colorized</a>
            }
            <button className="btn btn-ghost" onClick={()=>{setFile(null);setPreview("");setResult("");setStatus("idle");}}>New Photo</button>
          </div>
        </div>
      )}
    </div>
  );
}
