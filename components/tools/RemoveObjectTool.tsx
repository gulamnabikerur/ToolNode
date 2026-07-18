"use client";
import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

type Props = { onCreditUsed: () => void; onUpgradeNeeded: () => void };

export default function RemoveObjectTool({ onCreditUsed, onUpgradeNeeded }: Props) {
  const [src,      setSrc]    = useState("");
  const [file,     setFile]   = useState<File|null>(null);
  const [drawing,  setDrawing] = useState(false);
  const [hasMask,  setHasMask] = useState(false);
  const [status,   setStatus]  = useState<"idle"|"loading"|"done"|"error">("idle");
  const [result,   setResult]  = useState("");
  const [error,    setError]   = useState("");
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef        = useRef<HTMLImageElement>(null);

  const onFile = (f: File) => {
    setFile(f); setSrc(URL.createObjectURL(f));
    setStatus("idle"); setResult(""); setError(""); setHasMask(false);
    setTimeout(() => {
      const canvas = maskCanvasRef.current;
      const img    = imgRef.current;
      if (!canvas || !img) return;
      canvas.width  = img.naturalWidth  || img.clientWidth;
      canvas.height = img.naturalHeight || img.clientHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 300);
  };

  const startDraw = (e: React.MouseEvent) => setDrawing(true);
  const stopDraw  = ()                     => setDrawing(false);
  const paint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = maskCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    ctx.fillStyle = "rgba(255,50,50,0.6)";
    ctx.beginPath(); ctx.arc(x, y, 20 * scaleX, 0, Math.PI*2); ctx.fill();
    setHasMask(true);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current; if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  };

  const process = useCallback(async () => {
    if (!file || !hasMask) return;
    if (!hasCreditsRemaining()) { onUpgradeNeeded(); return; }
    setStatus("loading"); setError("");
    try {
      const maskCanvas = maskCanvasRef.current!;
      const maskBlob   = await new Promise<Blob>((res, rej) =>
        maskCanvas.toBlob(b => b ? res(b) : rej(new Error("mask")), "image/png")
      );
      const form = new FormData();
      form.append("image", file);
      form.append("mask",  maskBlob, "mask.png");
      const resp = await fetch("/api/tools/remove-object", { method:"POST", body:form });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed");
      setResult(data.url); consumeCredit(); onCreditUsed();
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
      setStatus("error");
    }
  }, [file, hasMask, onCreditUsed, onUpgradeNeeded]);

  return (
    <div>
      <div className="status-box status-info" style={{ marginBottom:14 }}>
        Upload a photo, then paint over the object you want removed. AI will fill the area naturally.
      </div>

      {!src ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop a photo to remove objects</div>
          <div className="upload-sub">Paint over objects with a brush — AI removes them</div>
        </div>
      ) : (
        <div>
          <div style={{ position:"relative", display:"inline-block", width:"100%", marginBottom:12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="source" style={{ width:"100%", borderRadius:8, display:"block", userSelect:"none" }} draggable={false} />
            <canvas
              ref={maskCanvasRef}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", borderRadius:8, cursor:"crosshair", touchAction:"none" }}
              onMouseDown={startDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onMouseMove={paint}
            />
          </div>

          <div style={{ fontSize:"0.82rem", color:"var(--text-3)", marginBottom:12 }}>
            Paint in red over the area to remove · Click and drag to paint a mask
          </div>

          {status==="error" && <div className="status-box status-error" style={{ marginBottom:10 }}>{error}</div>}

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button className="btn btn-primary" onClick={process} disabled={!hasMask||status==="loading"}>
              {status==="loading"?<><span className="spinner"/>Removing…</>:"Remove Object (1 credit)"}
            </button>
            <button className="btn btn-ghost" onClick={clearMask} disabled={!hasMask}>Clear Mask</button>
            <button className="btn btn-ghost" onClick={()=>{setSrc("");setFile(null);setResult("");setStatus("idle");}}>New Photo</button>
          </div>

          {status==="done" && result && (
            <div className="result-panel" style={{ marginTop:14 }}>
              <h3>Object Removed!</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result} alt="result" className="result-image" />
              <div className="result-actions">
                <a href={result} download="removed.png" className="btn btn-success">Download</a>
                <button className="btn btn-ghost" onClick={()=>{setResult("");setStatus("idle");}}>Try Again</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
