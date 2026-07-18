"use client";
import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";

interface CollageLayout { id: string; label: string; cols: number; rows: number; slots: number }

const LAYOUTS: CollageLayout[] = [
  { id:"2x2",  label:"2×2 Grid",    cols:2, rows:2, slots:4  },
  { id:"3x1",  label:"3 Columns",   cols:3, rows:1, slots:3  },
  { id:"1+2",  label:"1 Big + 2",   cols:2, rows:2, slots:3  },
  { id:"2+3",  label:"2 Top + 3",   cols:3, rows:2, slots:5  },
  { id:"3x2",  label:"3×2 Grid",    cols:3, rows:2, slots:6  },
  { id:"1+3",  label:"1 Big + 3",   cols:4, rows:2, slots:4  },
];

export default function CollageMakerTool() {
  const [layout, setLayout]   = useState<CollageLayout>(LAYOUTS[0]);
  const [images, setImages]   = useState<Array<string>>([]);
  const [gap,    setGap]      = useState(8);
  const [bgCol,  setBgCol]    = useState("#ffffff");
  const [status, setStatus]   = useState<"idle"|"processing"|"done">("idle");
  const [result, setResult]   = useState("");

  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    Array.from(fl).slice(0, layout.slots).forEach(f => {
      const r = new FileReader();
      r.onload = e => setImages(prev => [...prev, e.target!.result as string].slice(0, layout.slots));
      r.readAsDataURL(f);
    });
  };

  const build = useCallback(async () => {
    if (images.length < 2) return;
    setStatus("processing");
    const SIZE  = 800;
    const canvas = document.createElement("canvas");
    const cols = layout.cols, rows = layout.rows;
    const W = SIZE, H = Math.round(SIZE * rows / cols);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, W, H);

    const cellW = (W - gap * (cols + 1)) / cols;
    const cellH = (H - gap * (rows + 1)) / rows;

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });

    for (let idx = 0; idx < Math.min(images.length, layout.slots); idx++) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = gap + col * (cellW + gap);
      const y = gap + row * (cellH + gap);
      const img = await loadImg(images[idx]);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 6);
      ctx.clip();
      const scale = Math.max(cellW / img.width, cellH / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, x + (cellW - sw) / 2, y + (cellH - sh) / 2, sw, sh);
      ctx.restore();
    }

    canvas.toBlob(blob => {
      if (blob) { setResult(URL.createObjectURL(blob)); setStatus("done"); }
    }, "image/jpeg", 0.95);
  }, [images, layout, gap, bgCol]);

  return (
    <div>
      {/* Layout selector */}
      <div className="opts-panel" style={{ marginBottom:14 }}>
        <div className="opts-title">Choose Layout</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {LAYOUTS.map(l => (
            <button key={l.id} onClick={()=>{ setLayout(l); setImages([]); setResult(""); setStatus("idle"); }}
              style={{ padding:"8px 14px", borderRadius:8, border:`2px solid ${layout.id===l.id?"var(--blue)":"var(--border)"}`, background:layout.id===l.id?"var(--blue-soft)":"var(--surface)", color:layout.id===l.id?"var(--blue)":"var(--text-2)", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
              {l.label} ({l.slots} photos)
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="upload-zone" style={{ marginBottom:14 }} onDrop={(e)=>{e.preventDefault();onFiles(e.dataTransfer.files);}} onDragOver={e=>e.preventDefault()}>
        <input type="file" accept="image/*" multiple onChange={e=>onFiles(e.target.files)} />
        <div className="upload-icon"><Upload size={28} /></div>
        <div className="upload-title">Add up to {layout.slots} photos</div>
        <div className="upload-sub">{images.length}/{layout.slots} photos loaded</div>
      </div>

      {/* Photo previews */}
      {images.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(images.length, 6)}, 1fr)`, gap:8, marginBottom:14 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position:"relative", borderRadius:8, overflow:"hidden", aspectRatio:"1", border:"1px solid var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{ position:"absolute",top:3,right:3,background:"rgba(0,0,0,0.6)",color:"white",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:"0.7rem",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="opts-panel" style={{ marginBottom:14 }}>
          <div className="opts-title">Style</div>
          <div className="opt-row">
            <label className="opt-label">Gap (px)</label>
            <input type="range" min="0" max="30" value={gap} onChange={e=>setGap(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
            <span style={{ fontSize:"0.82rem", minWidth:30, textAlign:"right" }}>{gap}px</span>
          </div>
          <div className="opt-row">
            <label className="opt-label">Background</label>
            <input type="color" value={bgCol} onChange={e=>setBgCol(e.target.value)} style={{ height:32,width:56,border:"1px solid var(--border)",borderRadius:6,cursor:"pointer" }} />
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:10 }}>
        <button className="btn btn-primary" onClick={build} disabled={images.length < 2 || status==="processing"}>
          {status==="processing" ? <><span className="spinner" />Creating…</> : "Create Collage"}
        </button>
        {images.length > 0 && <button className="btn btn-ghost" onClick={()=>{setImages([]);setResult("");setStatus("idle");}}>Clear</button>}
      </div>

      {status === "done" && result && (
        <div className="result-panel" style={{ marginTop:16 }}>
          <h3>Collage Ready!</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="collage" className="result-image" />
          <div className="result-actions">
            <a href={result} download="collage.jpg" className="btn btn-success">Download Collage</a>
            <button className="btn btn-ghost" onClick={()=>setStatus("idle")}>Edit</button>
          </div>
        </div>
      )}
    </div>
  );
}
