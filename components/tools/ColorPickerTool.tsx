"use client";
import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}
function rgbToHsl(r: number, g: number, b: number) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0,s=0; const l=(max+min)/2;
  if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){ case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break; }
    h/=6; }
  return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
}

export default function ColorPickerTool() {
  const [src, setSrc] = useState("");
  const [picked, setPicked] = useState<Array<{hex:string;r:number;g:number;b:number}>>([]);
  const [hover, setHover] = useState<{hex:string;x:number;y:number}|null>(null);
  const [copied, setCopied] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onFile = (f: File) => setSrc(URL.createObjectURL(f));

  const onImgLoad = useCallback(() => {
    const img = imgRef.current; const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
  }, []);

  const getColor = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current; const img = imgRef.current;
    if (!canvas || !img) return null;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const pixel = canvas.getContext("2d")!.getImageData(x, y, 1, 1).data;
    const hex = "#" + [pixel[0],pixel[1],pixel[2]].map(v=>v.toString(16).padStart(2,"0")).join("");
    return { hex, r: pixel[0], g: pixel[1], b: pixel[2], x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const c = getColor(e);
    if (c) setHover({ hex: c.hex, x: c.x, y: c.y });
  };
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const c = getColor(e);
    if (c) setPicked(prev => [{ hex: c.hex, r: c.r, g: c.g, b: c.b }, ...prev.slice(0,11)]);
  };

  const copy = (val: string) => { navigator.clipboard.writeText(val); setCopied(val); setTimeout(() => setCopied(""), 1800); };

  return (
    <div>
      {!src ? (
        <div className="upload-zone" onDrop={(e)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept="image/*" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}}/>
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop an image to pick colors</div>
          <div className="upload-sub">Hover over the image to preview · Click to capture a color</div>
        </div>
      ) : (
        <div>
          {hover && (
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 14px", marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:hover.hex, border:"1px solid var(--border)", flexShrink:0 }} />
              <div>
                <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{hover.hex.toUpperCase()}</div>
                <div style={{ fontSize:"0.72rem", color:"var(--text-3)" }}>Hover to preview · Click to capture</div>
              </div>
            </div>
          )}

          <div style={{ position:"relative", cursor:"crosshair" }} onMouseMove={onMouseMove} onMouseLeave={()=>setHover(null)} onClick={onClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="source" onLoad={onImgLoad} crossOrigin="anonymous" style={{ width:"100%", maxHeight:340, objectFit:"contain", display:"block", borderRadius:10, border:"1px solid var(--border)" }} draggable={false} />
            {hover && (
              <div style={{ position:"absolute", left:Math.min(hover.x+12, 200), top:Math.max(hover.y-44, 4), background:hover.hex, border:"2px solid white", borderRadius:8, padding:"4px 10px", color:"white", fontSize:"0.78rem", fontWeight:700, pointerEvents:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.25)", textShadow:"0 1px 3px rgba(0,0,0,0.5)" }}>
                {hover.hex.toUpperCase()}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display:"none" }} />

          <button className="btn btn-ghost btn-sm" style={{ marginTop:10 }} onClick={()=>{setSrc("");setPicked([]);}}>Use Different Image</button>
        </div>
      )}

      {picked.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontWeight:700, fontSize:"0.88rem", marginBottom:10 }}>Captured Colors ({picked.length})</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {picked.map((c, i) => {
              const hsl = rgbToHsl(c.r, c.g, c.b);
              return (
                <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", width:120 }}>
                  <div style={{ height:48, background:c.hex }} />
                  <div style={{ padding:"8px" }}>
                    <div style={{ fontWeight:700, fontSize:"0.78rem", marginBottom:4 }}>{c.hex.toUpperCase()}</div>
                    <div style={{ fontSize:"0.68rem", color:"var(--text-3)", marginBottom:6 }}>
                      RGB({c.r},{c.g},{c.b})<br/>HSL({hsl.h}°,{hsl.s}%,{hsl.l}%)
                    </div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {[c.hex.toUpperCase(), `rgb(${c.r},${c.g},${c.b})`, `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`].map(v=>(
                        <button key={v} className="icon-btn" style={{ fontSize:"0.62rem", padding:"2px 6px" }} onClick={()=>copy(v)}>
                          {copied===v ? "Copied!" : v.startsWith("#") ? "HEX" : v.startsWith("rgb") && !v.startsWith("rgba") ? "RGB" : "HSL"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:10 }} onClick={()=>setPicked([])}>Clear All</button>
        </div>
      )}
    </div>
  );
}
