"use client";
import { useState } from "react";
import { Upload, Droplets } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfWatermarkTool() {
  const [file,     setFile]     = useState<File | null>(null);
  const [text,     setText]     = useState("CONFIDENTIAL");
  const [opacity,  setOpacity]  = useState(25);
  const [diagonal, setDiagonal] = useState(true);
  const [fontSize, setFontSize] = useState(48);
  const [color,    setColor]    = useState("#888888");
  const [status,   setStatus]   = useState<"idle"|"processing"|"done"|"error">("idle");
  const [resultUrl, setResultUrl] = useState("");

  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1,3),16)/255,
    g: parseInt(hex.slice(3,5),16)/255,
    b: parseInt(hex.slice(5,7),16)/255,
  });

  const process = async () => {
    if (!file || !text.trim()) return;
    setStatus("processing");
    try {
      const bytes = await file.arrayBuffer();
      const doc   = await PDFDocument.load(bytes);
      const font  = await doc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      const pages = doc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const angle = diagonal ? 45 : 0;
        page.drawText(text, {
          x: width / 2 - (text.length * fontSize * 0.3),
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          rotate: degrees(angle),
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={(e)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")setFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept=".pdf,application/pdf" onChange={e=>{if(e.target.files?.[0])setFile(e.target.files[0]);}} />
          <div className="upload-icon"><Droplets size={32} /></div>
          <div className="upload-title">Drop a PDF to add watermark</div>
          <div className="upload-sub">Watermark applied to every page · client-side</div>
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
            <div className="opts-title">Watermark Options</div>
            <div className="opt-row">
              <label className="opt-label">Text</label>
              <input className="opt-input" value={text} onChange={e=>setText(e.target.value)} placeholder="CONFIDENTIAL" maxLength={30} />
            </div>
            <div className="opt-row">
              <label className="opt-label">Opacity</label>
              <input type="range" min="5" max="80" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
              <span style={{ minWidth:36, fontSize:"0.82rem", color:"var(--text-2)" }}>{opacity}%</span>
            </div>
            <div className="opt-row">
              <label className="opt-label">Font Size</label>
              <input className="opt-input" type="number" min="20" max="120" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{ maxWidth:80 }} />
            </div>
            <div className="opt-row">
              <label className="opt-label">Color</label>
              <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{ height:34, width:60, border:"1px solid var(--border)", borderRadius:6, cursor:"pointer" }} />
            </div>
            <div className="opt-row">
              <label className="opt-label">Angle</label>
              <div style={{ display:"flex", gap:8 }}>
                {[true,false].map(d=>(
                  <button key={String(d)} onClick={()=>setDiagonal(d)}
                    style={{ padding:"6px 12px", borderRadius:8, border:`2px solid ${diagonal===d?"var(--blue)":"var(--border)"}`, background:diagonal===d?"var(--blue-soft)":"var(--surface)", color:diagonal===d?"var(--blue)":"var(--text-2)", fontWeight:600, fontSize:"0.8rem", cursor:"pointer" }}>
                    {d?"Diagonal 45°":"Horizontal"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:"0.72rem", color:"var(--text-3)", alignSelf:"center" }}>Quick:</span>
              {["CONFIDENTIAL","DRAFT","SAMPLE","DO NOT COPY"].map(t=>(
                <button key={t} onClick={()=>setText(t)} className="icon-btn" style={{ fontSize:"0.72rem" }}>{t}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop:14 }} onClick={process} disabled={status==="processing"||!text.trim()}>
            {status==="processing"?<><span className="spinner"/>Adding Watermark…</>:"Add Watermark"}
          </button>
        </div>
      )}

      {status==="error" && <div className="status-box status-error" style={{ marginTop:12 }}>Failed to process PDF. Please try again.</div>}
      {status==="done" && (
        <div className="result-panel" style={{ marginTop:16 }}>
          <h3>Watermark Added!</h3>
          <p>"{text}" watermark applied to all pages at {opacity}% opacity</p>
          <div className="result-actions">
            <a href={resultUrl} download="watermarked.pdf" className="btn btn-success">Download PDF</a>
            <button className="btn btn-ghost" onClick={()=>{setFile(null);setStatus("idle");setResultUrl("");}}>New PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
