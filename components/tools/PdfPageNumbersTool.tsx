"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

export default function PdfPageNumbersTool() {
  const [file,     setFile]     = useState<File|null>(null);
  const [pos,      setPos]      = useState<"bottom-center"|"bottom-right"|"top-center">("bottom-center");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(10);
  const [status,   setStatus]   = useState<"idle"|"processing"|"done"|"error">("idle");
  const [resultUrl, setResultUrl] = useState("");

  const onFile = (f: File) => { setFile(f); setStatus("idle"); setResultUrl(""); };

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const bytes  = await file.arrayBuffer();
      const doc    = await PDFDocument.load(bytes);
      const font   = await doc.embedFont(StandardFonts.Helvetica);
      const pages  = doc.getPages();

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const num  = String(startNum + i);
        const tw   = font.widthOfTextAtSize(num, fontSize);
        let x = width / 2 - tw / 2;
        let y = pos.startsWith("bottom") ? 20 : height - 28;
        if (pos === "bottom-right") x = width - 28 - tw;
        page.drawText(num, { x, y, size:fontSize, font, color:rgb(0.3,0.3,0.3) });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type:"application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept=".pdf,application/pdf" onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop a PDF to add page numbers</div>
        </div>
      ) : (
        <div>
          <div className="file-item" style={{ marginBottom:14 }}>
            <div className="file-item-icon"><Upload size={16} /></div>
            <span className="file-item-name">{file.name}</span>
            <span className="file-item-size">{formatBytes(file.size)}</span>
            <button className="file-item-del" onClick={()=>{setFile(null);setStatus("idle");}}>✕</button>
          </div>
          <div className="opts-panel">
            <div className="opts-title">Page Number Options</div>
            <div className="opt-row">
              <label className="opt-label">Position</label>
              <select className="opt-select" value={pos} onChange={e=>setPos(e.target.value as typeof pos)}>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-center">Top Center</option>
              </select>
            </div>
            <div className="opt-row">
              <label className="opt-label">Start from</label>
              <input className="opt-input" type="number" min="1" max="999" value={startNum} onChange={e=>setStartNum(Number(e.target.value))} style={{ maxWidth:80 }} />
            </div>
            <div className="opt-row">
              <label className="opt-label">Font size</label>
              <input type="range" min="8" max="18" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
              <span style={{ fontSize:"0.8rem", minWidth:30 }}>{fontSize}pt</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop:14 }} onClick={process} disabled={status==="processing"}>
            {status==="processing"?<><span className="spinner"/>Adding…</>:"Add Page Numbers"}
          </button>
        </div>
      )}
      {status==="done" && (
        <div className="result-panel" style={{ marginTop:16 }}>
          <h3>Page Numbers Added!</h3>
          <div className="result-actions">
            <a href={resultUrl} download="numbered.pdf" className="btn btn-success">Download PDF</a>
            <button className="btn btn-ghost" onClick={()=>{setFile(null);setStatus("idle");}}>New PDF</button>
          </div>
        </div>
      )}
      {status==="error" && <div className="status-box status-error" style={{ marginTop:12 }}>Failed to process PDF.</div>}
    </div>
  );
}
