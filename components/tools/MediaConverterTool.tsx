"use client";
import { useState, useRef, useCallback } from "react";

type OutputFormat = "mp4" | "webm" | "avi" | "mov" | "mkv" | "mp3" | "wav" | "aac" | "ogg";

const VIDEO_FORMATS: OutputFormat[] = ["mp4", "webm", "avi", "mov", "mkv"];
const AUDIO_FORMATS: OutputFormat[] = ["mp3", "wav", "aac", "ogg"];

function formatBytes(b: number) {
  if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

export default function MediaConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp4");
  const [status, setStatus] = useState<"idle" | "loading-ffmpeg" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultName, setResultName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const ffmpegRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const convert = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(0);
    setErrorMsg("");

    try {
      const ffmpeg = await loadFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`;
      const outputFilename = `converted_${file.name.split('.')[0]}.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Build FFmpeg arguments based on format
      const args = ["-i", inputName];
      
      // If converting to audio only, ensure video is stripped
      if (AUDIO_FORMATS.includes(outputFormat)) {
        args.push("-vn");
      }

      args.push(outputFilename);

      const code = await ffmpeg.exec(args);
      
      if (code !== 0) {
        throw new Error("Conversion failed. The format may not be supported or the file is corrupted.");
      }

      const data = await ffmpeg.readFile(outputFilename);
      const blob = new Blob([data as any], {
        type: VIDEO_FORMATS.includes(outputFormat) ? `video/${outputFormat}` : `audio/${outputFormat}`,
      });

      setResultUrl(URL.createObjectURL(blob));
      setResultName(outputFilename);
      setStatus("done");
      
      // Cleanup
      ffmpeg.deleteFile(inputName);
      ffmpeg.deleteFile(outputFilename);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An unknown error occurred during conversion.");
      setStatus("error");
    }
  }, [file, outputFormat]);

  const isVideo = file?.type.startsWith("video/") || false;

  return (
    <div>
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setStatus("idle"); setResultUrl(""); } }}
      >
        <input ref={inputRef} type="file" accept="video/*,audio/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setStatus("idle"); setResultUrl(""); } }} />
        {file ? (
          <><span className="upload-icon">{isVideo ? "🎬" : "🎵"}</span><div className="upload-title">{file.name}</div><div className="upload-hint">{formatBytes(file.size)} · Click to change</div></>
        ) : (
          <><span className="upload-icon">🔄</span><div className="upload-title">Drop a Video or Audio file here</div><div className="upload-hint">100% Free · Unlimited File Size · Processed locally</div></>
        )}
      </div>

      {file && (
        <div className="options-panel">
          <h4>Convert To:</h4>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Video Formats</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {VIDEO_FORMATS.map(f => (
                  <button key={f} className={`btn ${outputFormat === f ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setOutputFormat(f)}>
                    .{f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Audio Formats</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AUDIO_FORMATS.map(f => (
                  <button key={f} className={`btn ${outputFormat === f ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setOutputFormat(f)}>
                    .{f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {file && status !== "done" && (
        <button className="btn btn-primary" onClick={convert} disabled={status === "processing" || status === "loading-ffmpeg"}>
          {status === "loading-ffmpeg" ? <><span className="spinner" /> Loading Converter Engine...</> :
           status === "processing" ? <><span className="spinner" /> Converting ({progress}%)...</> : 
           `🔄 Convert to ${outputFormat.toUpperCase()}`}
        </button>
      )}

      {status === "processing" && (
        <div style={{ marginTop: 16 }}>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>{errorMsg}</span></div>}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✅ Conversion Complete!</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>Your file has been successfully converted to {outputFormat.toUpperCase()}.</p>
          <a href={resultUrl} download={resultName} className="btn btn-primary btn-lg">⬇ Download Converted File</a>
          <button className="btn btn-secondary btn-lg" onClick={() => { setStatus("idle"); setFile(null); setResultUrl(""); }} style={{ marginLeft: 12 }}>Convert Another File</button>
        </div>
      )}
    </div>
  );
}
