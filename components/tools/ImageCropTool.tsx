"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageCropTool() {
  const [srcUrl, setSrcUrl] = useState("");
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<null | { ox: number; oy: number; cx: number; cy: number }>(null);
  const [aspect, setAspect] = useState<string>("free");
  const [status, setStatus] = useState<"idle"|"done">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const previewRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ASPECTS: Record<string, [number, number] | null> = {
    free: null, "1:1": [1,1], "16:9": [16,9], "4:3": [4,3], "3:2": [3,2], "9:16": [9,16],
  };

  const applyAspect = useCallback((key: string, imgW: number, imgH: number) => {
    const ar = ASPECTS[key];
    if (!ar) return;
    const ratio = ar[0] / ar[1];
    let w = imgW * 0.8, h = w / ratio;
    if (h > imgH * 0.8) { h = imgH * 0.8; w = h * ratio; }
    setCrop({ x: (imgW - w) / 2, y: (imgH - h) / 2, w, h });
  }, []); // eslint-disable-line

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setSrcUrl(url);
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      const w = img.naturalWidth * 0.8, h = img.naturalHeight * 0.8;
      setCrop({ x: img.naturalWidth * 0.1, y: img.naturalHeight * 0.1, w, h });
    };
    img.src = url;
  };

  // Scale crop overlay to preview size
  const getScaleFactors = () => {
    if (!previewRef.current || !imgDims.w) return { sx: 1, sy: 1 };
    const rect = previewRef.current.getBoundingClientRect();
    return { sx: rect.width / imgDims.w, sy: rect.height / imgDims.h };
  };

  const doCrop = () => {
    if (!srcUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.w); canvas.height = Math.round(crop.h);
    const ctx = canvas.getContext("2d")!;
    const img = new Image(); img.src = srcUrl;
    img.onload = () => {
      ctx.drawImage(img, Math.round(crop.x), Math.round(crop.y), Math.round(crop.w), Math.round(crop.h), 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => { if (blob) { setResultUrl(URL.createObjectURL(blob)); setStatus("done"); } }, "image/jpeg", 0.95);
    };
  };

  const { sx, sy } = getScaleFactors();

  return (
    <div>
      {!srcUrl ? (
        <div className="upload-zone" onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }} onDragOver={(e) => e.preventDefault()}>
          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
          <span className="upload-zone-icon">✂️</span>
          <div className="upload-zone-title">Drop an image to crop</div>
          <div className="upload-zone-sub">JPG, PNG, WebP supported</div>
        </div>
      ) : (
        <div>
          {/* Aspect Ratio Selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.keys(ASPECTS).map((k) => (
              <button key={k} className={`copy-btn${aspect === k ? " active" : ""}`} style={aspect === k ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}} onClick={() => { setAspect(k); applyAspect(k, imgDims.w, imgDims.h); }}>{k}</button>
            ))}
          </div>

          {/* Crop Preview */}
          <div ref={containerRef} style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={previewRef} src={srcUrl} alt="source" style={{ maxWidth: "100%", display: "block", userSelect: "none" }} draggable={false} />
            {/* Overlay */}
            <div style={{
              position: "absolute",
              left: crop.x * sx, top: crop.y * sy,
              width: crop.w * sx, height: crop.h * sy,
              border: "2px solid white", boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              cursor: "move", boxSizing: "border-box",
            }}
              onMouseDown={(e) => { e.preventDefault(); setDragging({ ox: e.clientX, oy: e.clientY, cx: crop.x, cy: crop.y }); }}
            />
          </div>

          {/* Mouse move handler */}
          {dragging && (
            <div style={{ position: "fixed", inset: 0, zIndex: 9999, cursor: "move" }}
              onMouseMove={(e) => {
                const dx = (e.clientX - dragging.ox) / sx, dy = (e.clientY - dragging.oy) / sy;
                setCrop((c) => ({
                  ...c,
                  x: Math.max(0, Math.min(imgDims.w - c.w, dragging.cx + dx)),
                  y: Math.max(0, Math.min(imgDims.h - c.h, dragging.cy + dy)),
                }));
              }}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
            />
          )}

          <div style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--text-3)" }}>
            Crop area: {Math.round(crop.w)} × {Math.round(crop.h)}px · Drag the overlay to reposition
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={doCrop}>✂️ Apply Crop</button>
            <button className="btn btn-secondary" onClick={() => { setSrcUrl(""); setStatus("idle"); setResultUrl(""); }}>↺ New Image</button>
          </div>
        </div>
      )}

      {status === "done" && resultUrl && (
        <div className="result-panel" style={{ marginTop: 20, textAlign: "left" }}>
          <h3>✅ Image Cropped!</h3>
          <p>Size: {Math.round(crop.w)} × {Math.round(crop.h)}px</p>
          <img src={resultUrl} alt="cropped" className="result-image" />
          <div style={{ display: "flex", gap: 10 }}>
            <a href={resultUrl} download="cropped.jpg" className="btn btn-success">⬇ Download Cropped</a>
            <button className="btn btn-secondary" onClick={() => { setStatus("idle"); setResultUrl(""); }}>↺ Crop Again</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
