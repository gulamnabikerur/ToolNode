"use client";
import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";

export default function PhotoToSketchTool() {
  const [src,     setSrc]     = useState("");
  const [fname,   setFname]   = useState("sketch");
  const [intensity, setIntensity] = useState(80);
  const [colorMode, setColorMode] = useState<"bw"|"color">("bw");
  const [status,  setStatus]  = useState<"idle"|"processing"|"done">("idle");
  const [result,  setResult]  = useState("");

  const onFile = (f: File) => {
    setFname(f.name.replace(/\.[^.]+$/, ""));
    setSrc(URL.createObjectURL(f));
    setStatus("idle"); setResult("");
  };

  const convert = useCallback(() => {
    if (!src) return;
    setStatus("processing");
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = src;
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;

      // 1. Original canvas
      const c0 = document.createElement("canvas"); c0.width=W; c0.height=H;
      c0.getContext("2d")!.drawImage(img, 0, 0);
      const d0 = c0.getContext("2d")!.getImageData(0, 0, W, H);

      // 2. Grayscale
      const c1 = document.createElement("canvas"); c1.width=W; c1.height=H;
      const ctx1 = c1.getContext("2d")!;
      ctx1.filter = "grayscale(100%)"; ctx1.drawImage(img, 0, 0);
      const d1 = ctx1.getImageData(0, 0, W, H);

      // 3. Invert
      const c2 = document.createElement("canvas"); c2.width=W; c2.height=H;
      const ctx2 = c2.getContext("2d")!;
      for (let i = 0; i < d1.data.length; i += 4) {
        d1.data[i]   = 255 - d1.data[i];
        d1.data[i+1] = 255 - d1.data[i+1];
        d1.data[i+2] = 255 - d1.data[i+2];
      }
      ctx2.putImageData(d1, 0, 0);

      // 4. Gaussian blur on inverted
      const c3 = document.createElement("canvas"); c3.width=W; c3.height=H;
      const ctx3 = c3.getContext("2d")!;
      ctx3.filter = `blur(${Math.round(intensity / 20)}px)`; ctx3.drawImage(c2, 0, 0);

      // 5. Color Dodge blend
      const ctx0b = c0.getContext("2d")!; ctx0b.filter="grayscale(100%)"; ctx0b.drawImage(img,0,0);
      const gray = ctx0b.getImageData(0,0,W,H);
      const blur = ctx3.getImageData(0,0,W,H);

      const out = document.createElement("canvas"); out.width=W; out.height=H;
      const ctxOut = out.getContext("2d")!;
      const dOut = ctxOut.createImageData(W, H);

      for (let i = 0; i < gray.data.length; i += 4) {
        const g = gray.data[i];
        const b = blur.data[i];
        const sketch = b === 255 ? 255 : Math.min(255, (g * 255) / (255 - b));
        if (colorMode === "bw") {
          dOut.data[i]   = sketch;
          dOut.data[i+1] = sketch;
          dOut.data[i+2] = sketch;
        } else {
          dOut.data[i]   = Math.min(255, d0.data[i]   * (sketch/255) + sketch * 0.5);
          dOut.data[i+1] = Math.min(255, d0.data[i+1] * (sketch/255) + sketch * 0.5);
          dOut.data[i+2] = Math.min(255, d0.data[i+2] * (sketch/255) + sketch * 0.5);
        }
        dOut.data[i+3] = 255;
      }
      ctxOut.putImageData(dOut, 0, 0);
      out.toBlob(blob => {
        if (blob) { setResult(URL.createObjectURL(blob)); setStatus("done"); }
      }, "image/jpeg", 0.95);
    };
  }, [src, intensity, colorMode]);

  return (
    <div>
      {!src ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop an image to convert to sketch</div>
          <div className="upload-sub">Works best with portraits and clear subjects</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Original</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="original" style={{ width:"100%", borderRadius:8, border:"1px solid var(--border)" }} />
          </div>
          <div>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-3)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Sketch Preview</div>
            {result
              ? <img src={result} alt="sketch" style={{ width:"100%", borderRadius:8, border:"1px solid var(--border)" }} />
              : <div style={{ width:"100%", aspectRatio:"1", borderRadius:8, border:"1px dashed var(--border)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-3)", fontSize:"0.82rem" }}>Preview will appear here</div>
            }
          </div>
        </div>
      )}

      {src && (
        <>
          <div className="opts-panel" style={{ marginBottom:14 }}>
            <div className="opts-title">Sketch Settings</div>
            <div className="opt-row">
              <label className="opt-label">Intensity</label>
              <input type="range" min="20" max="120" value={intensity} onChange={e=>setIntensity(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
              <span style={{ fontSize:"0.82rem", minWidth:30 }}>{intensity}</span>
            </div>
            <div className="opt-row">
              <label className="opt-label">Color Mode</label>
              <div style={{ display:"flex", gap:8 }}>
                {(["bw","color"] as const).map(m => (
                  <button key={m} onClick={()=>setColorMode(m)}
                    style={{ padding:"6px 14px", borderRadius:8, border:`2px solid ${colorMode===m?"var(--blue)":"var(--border)"}`, background:colorMode===m?"var(--blue-soft)":"var(--surface)", color:colorMode===m?"var(--blue)":"var(--text-2)", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
                    {m==="bw"?"Pencil B&W":"Color Sketch"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-primary" onClick={convert} disabled={status==="processing"}>
              {status==="processing" ? <><span className="spinner"/>Converting…</> : "Convert to Sketch"}
            </button>
            <button className="btn btn-ghost" onClick={()=>{setSrc("");setResult("");setStatus("idle");}}>New Image</button>
          </div>
          {status==="done" && result && (
            <div className="result-panel" style={{ marginTop:14 }}>
              <h3>Sketch Generated!</h3>
              <div className="result-actions">
                <a href={result} download={`${fname}_sketch.jpg`} className="btn btn-success">Download Sketch</a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
