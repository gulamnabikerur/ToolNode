"use client";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

export default function WordCounterTool() {
  const [text, setText] = useState("");

  const words     = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars     = text.length;
  const charsNoSp = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readTime  = Math.max(1, Math.ceil(words / 238));

  // Keyword density
  const kwMap: Record<string, number> = {};
  text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 3).forEach(w => { kwMap[w] = (kwMap[w] || 0) + 1; });
  const topKw = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const copy = () => navigator.clipboard.writeText(text);
  const clear = () => setText("");

  return (
    <div>
      <textarea
        className="text-area"
        style={{ minHeight: 260, resize: "vertical" }}
        placeholder="Paste or type your text here…"
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
      />

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "14px 0" }}>
        {[
          ["Words",       words,       "var(--blue)"],
          ["Characters",  chars,       "var(--green)"],
          ["No Spaces",   charsNoSp,   "var(--cyan)"],
          ["Sentences",   sentences,   "var(--orange)"],
          ["Paragraphs",  paragraphs,  "var(--text-2)"],
          ["Read Time",   `~${readTime} min`, "var(--red)"],
        ].map(([label, val, color]) => (
          <div key={label as string} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: color as string, lineHeight: 1.1 }}>{val}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label as string}</div>
          </div>
        ))}
      </div>

      {/* Keyword density */}
      {topKw.length > 0 && (
        <div className="opts-panel" style={{ marginBottom: 14 }}>
          <div className="opts-title">Keyword Density (top words)</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {topKw.map(([w, n]) => (
              <span key={w} style={{ background: "var(--blue-soft)", color: "var(--blue)", borderRadius: 20, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 600 }}>
                {w} <strong>×{n}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={copy} disabled={!text}>Copy Text</button>
        <button className="btn btn-ghost btn-sm" onClick={clear} disabled={!text}>Clear</button>
      </div>
    </div>
  );
}
