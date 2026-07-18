"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload } from "lucide-react";

type VideoOp = "compress" | "trim" | "to-gif" | "mp4-to-mp3";

interface VideoToolProps { operation: VideoOp }

function formatBytes(b: number) {
  if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

export default function VideoProcessingTool({ operation }: VideoToolProps) {
  const [file,     setFile]     = useState<File|null>(null);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd,   setTrimEnd]   = useState(0);
  const [status,   setStatus]   = useState<"idle"|"loading-ffmpeg"|"processing"|"done"|"error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultName, setResultName] = useState("");
  const [error,    setError]    = useState("");
  const ffmpegRef  = useRef<unknown>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  const onFile = (f: File) => {
    setFile(f); setStatus("idle"); setResultUrl(""); setError(""); setProgress(0);
    const url = URL.createObjectURL(f);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.onloadedmetadata = () => {
        const dur = videoRef.current!.duration;
        setDuration(dur); setTrimStart(0); setTrimEnd(dur);
      };
    }
  };

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStatus("loading-ffmpeg");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
    await ffmpeg.load({
      coreURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js", "text/javascript"),
      wasmURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm", "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const process = useCallback(async () => {
    if (!file) return;
    setStatus("processing"); setError(""); setProgress(0);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ffmpeg = await loadFfmpeg() as any;
      const { fetchFile } = await import("@ffmpeg/util");
      const inName = "input." + (file.name.split(".").pop() || "mp4");
      await ffmpeg.writeFile(inName, await fetchFile(file));

      let outName = "output.mp4";
      let cmd: string[] = [];

      if (operation === "compress") {
        outName = "compressed.mp4";
        cmd = ["-i", inName, "-vcodec", "libx264", "-crf", "28", "-preset", "fast", "-acodec", "aac", outName];
      } else if (operation === "trim") {
        outName = "trimmed.mp4";
        cmd = ["-i", inName, "-ss", String(trimStart), "-to", String(trimEnd), "-c", "copy", outName];
      } else if (operation === "to-gif") {
        outName = "output.gif";
        cmd = ["-i", inName, "-vf", "fps=10,scale=480:-1:flags=lanczos", "-loop", "0", outName];
      } else if (operation === "mp4-to-mp3") {
        outName = "audio.mp3";
        cmd = ["-i", inName, "-vn", "-acodec", "libmp3lame", "-b:a", "192k", outName];
      }

      await ffmpeg.exec(cmd);
      const data = await ffmpeg.readFile(outName);
      const mimes: Record<string, string> = { mp4:"video/mp4", gif:"image/gif", mp3:"audio/mpeg" };
      const ext = outName.split(".").pop()!;
      const blob = new Blob([data], { type: mimes[ext] || "application/octet-stream" });
      setResultUrl(URL.createObjectURL(blob));
      setResultName(outName);
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Processing failed");
      setStatus("error");
    }
  }, [file, operation, trimStart, trimEnd, loadFfmpeg]);

  const labels: Record<VideoOp, { title: string; btn: string; accept: string }> = {
    "compress":   { title:"Compress Video", btn:"Compress Video",     accept:"video/*" },
    "trim":       { title:"Trim Video",     btn:"Trim Video",         accept:"video/*" },
    "to-gif":     { title:"Video to GIF",   btn:"Convert to GIF",     accept:"video/*" },
    "mp4-to-mp3": { title:"Extract Audio",  btn:"Extract MP3",        accept:"video/*,audio/*" },
  };
  const meta = labels[operation];

  const fmt = (s: number) => {
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m}:${String(sec).padStart(2,"0")}`;
  };

  return (
    <div>
      {!file ? (
        <div className="upload-zone" onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f) onFile(f);}} onDragOver={e=>e.preventDefault()}>
          <input type="file" accept={meta.accept} onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
          <div className="upload-icon"><Upload size={32} /></div>
          <div className="upload-title">Drop a video file here</div>
          <div className="upload-sub">MP4, MOV, WEBM, AVI · Processed in your browser</div>
        </div>
      ) : (
        <div>
          <div className="file-item" style={{ marginBottom:14 }}>
            <div className="file-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            </div>
            <span className="file-item-name">{file.name}</span>
            <span className="file-item-size">{formatBytes(file.size)} {duration > 0 && `· ${fmt(duration)}`}</span>
            <button className="file-item-del" onClick={()=>{setFile(null);setResultUrl("");setStatus("idle");}}>✕</button>
          </div>

          <video ref={videoRef} style={{ width:"100%", borderRadius:8, border:"1px solid var(--border)", marginBottom:14, maxHeight:280 }} controls />

          {operation === "trim" && duration > 0 && (
            <div className="opts-panel" style={{ marginBottom:14 }}>
              <div className="opts-title">Trim Range</div>
              <div className="opt-row">
                <label className="opt-label">Start</label>
                <input type="range" min="0" max={duration} step="0.1" value={trimStart} onChange={e=>setTrimStart(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
                <span style={{ fontSize:"0.82rem", minWidth:44, textAlign:"right" }}>{fmt(trimStart)}</span>
              </div>
              <div className="opt-row">
                <label className="opt-label">End</label>
                <input type="range" min="0" max={duration} step="0.1" value={trimEnd} onChange={e=>setTrimEnd(Number(e.target.value))} style={{ flex:1, marginRight:8 }} />
                <span style={{ fontSize:"0.82rem", minWidth:44, textAlign:"right" }}>{fmt(trimEnd)}</span>
              </div>
              <div style={{ fontSize:"0.78rem", color:"var(--text-3)", marginTop:6 }}>
                Duration: {fmt(Math.max(0, trimEnd - trimStart))}
              </div>
            </div>
          )}

          {(status === "loading-ffmpeg" || status === "processing") && (
            <div className="status-box status-info" style={{ marginBottom:12 }}>
              <span className="spinner spinner-dark" />
              <div>
                <div style={{ fontWeight:600 }}>{status==="loading-ffmpeg" ? "Loading FFmpeg engine… (first time only)" : "Processing…"}</div>
                {status==="processing" && <div className="progress-wrap"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>}
                {status==="processing" && <div style={{ fontSize:"0.72rem", color:"var(--text-3)", marginTop:4 }}>{progress}% complete</div>}
              </div>
            </div>
          )}

          {status==="error" && <div className="status-box status-error" style={{ marginBottom:12 }}>{error}</div>}

          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-primary" onClick={process} disabled={status==="loading-ffmpeg"||status==="processing"}>
              {status==="loading-ffmpeg"||status==="processing" ? <><span className="spinner"/>Processing…</> : meta.btn}
            </button>
            {status==="done" && resultUrl && (
              <a href={resultUrl} download={resultName} className="btn btn-success">Download Result</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
