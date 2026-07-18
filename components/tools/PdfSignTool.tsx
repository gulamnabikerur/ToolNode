"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfSignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedSig, setTypedSig] = useState("");
  const [sigColor, setSigColor] = useState("#4f46e5");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "bottom-center">("bottom-right");
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [mode]);

  const loadFile = async (f: File) => {
    setFile(f);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { /* ignore */ }
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = sigColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  const sign = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const page = doc.getPage(pageNum - 1);
      const { width, height } = page.getSize();

      if (mode === "type" && typedSig.trim()) {
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 28;
        const textWidth = font.widthOfTextAtSize(typedSig, fontSize);
        const margin = 40;
        let x = margin;
        if (position === "bottom-right") x = width - textWidth - margin;
        else if (position === "bottom-center") x = (width - textWidth) / 2;
        const y = margin + 10;
        page.drawText(typedSig, {
          x, y,
          size: fontSize,
          font,
          color: hexToRgb(sigColor),
        });
        // Add date
        const dateFont = await doc.embedFont(StandardFonts.Helvetica);
        const dateStr = new Date().toLocaleDateString();
        page.drawText(dateStr, { x, y: y - 18, size: 9, font: dateFont, color: rgb(0.5, 0.5, 0.5) });
      } else if (mode === "draw") {
        const canvas = canvasRef.current;
        if (!canvas) { setStatus("error"); return; }
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
        const sigImg = await doc.embedPng(base64);
        const sigW = 200;
        const sigH = (sigImg.height / sigImg.width) * sigW;
        const margin = 40;
        let x = margin;
        if (position === "bottom-right") x = width - sigW - margin;
        else if (position === "bottom-center") x = (width - sigW) / 2;
        page.drawImage(sigImg, { x, y: margin, width: sigW, height: sigH });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <div className="upload-zone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        {file ? (<><span className="upload-icon">📄</span><div className="upload-title">{file.name}</div><div className="upload-hint">{pageCount} pages · {formatBytes(file.size)}</div></>)
          : (<><span className="upload-icon">✍️</span><div className="upload-title">Drop a PDF file here or click to browse</div><div className="upload-hint">Then add your signature below</div></>)}
      </div>

      {file && (
        <>
          <div className="options-panel">
            <div style={{ display: "flex", marginBottom: 16 }}>
              <div className="tabs">
                <button className={`tab${mode === "draw" ? " active" : ""}`} onClick={() => setMode("draw")}>✏️ Draw</button>
                <button className={`tab${mode === "type" ? " active" : ""}`} onClick={() => setMode("type")}>⌨️ Type</button>
              </div>
            </div>

            {mode === "draw" ? (
              <div>
                <canvas ref={canvasRef} width={600} height={150} className="signature-canvas"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={clearCanvas}>Clear</button>
                </div>
              </div>
            ) : (
              <input className="option-input" style={{ fontSize: "1.4rem", fontStyle: "italic" }} placeholder="Type your name..." value={typedSig} onChange={(e) => setTypedSig(e.target.value)} />
            )}

            <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div className="option-row" style={{ flex: 1 }}>
                <span className="option-label">Color</span>
                <input type="color" value={sigColor} onChange={(e) => setSigColor(e.target.value)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, width: 40, height: 32, cursor: "pointer" }} />
              </div>
              <div className="option-row" style={{ flex: 1 }}>
                <span className="option-label">Position</span>
                <select className="option-select" value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              {pageCount > 1 && (
                <div className="option-row" style={{ flex: 1 }}>
                  <span className="option-label">Page</span>
                  <select className="option-select" value={pageNum} onChange={(e) => setPageNum(parseInt(e.target.value))}>
                    {Array.from({ length: pageCount }, (_, i) => (
                      <option key={i} value={i + 1}>Page {i + 1}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-primary" onClick={sign} disabled={status === "processing"}>
            {status === "processing" ? <><span className="spinner" /> Signing...</> : "✍️ Sign & Download"}
          </button>
        </>
      )}

      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>Failed to sign PDF. Please try again.</span></div>}
      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ PDF Signed!</h3>
          <p>Your signature has been added to the PDF.</p>
          <a href={resultUrl} download={`signed_${file?.name}`} className="btn btn-primary btn-lg">⬇ Download Signed PDF</a>
        </div>
      )}
    </div>
  );
}
