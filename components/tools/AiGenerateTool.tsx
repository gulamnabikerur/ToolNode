"use client";
import { useState } from "react";
import { useAiGeneration } from "@/hooks/useAiGeneration";

interface AiGenerateToolProps {
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

const EXAMPLE_PROMPTS = [
  "A serene Japanese garden at sunset, photorealistic",
  "Neon-lit cyberpunk city street in the rain, 4K",
  "Cute cartoon robot holding a coffee cup",
  "Abstract watercolor painting of northern lights",
  "Minimalist logo design for a tech startup",
];

export default function AiGenerateTool({ onCreditUsed, onUpgradeNeeded }: AiGenerateToolProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const { status, resultUrl, errorMsg, generate, reset } = useAiGeneration({ onCreditUsed, onUpgradeNeeded });

  const handleGenerate = () => {
    if (prompt.trim()) generate(prompt, style);
  };

  return (
    <div>
      <div className="options-panel">
        <h4>Describe Your Image</h4>
        <textarea
          className="text-output"
          style={{ minHeight: 100, marginBottom: 12 }}
          placeholder="A futuristic cityscape at dawn, golden light, photorealistic, 8K quality..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={500}
        />
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 }}>
          {prompt.length}/500 characters
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>💡 Try these prompts:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXAMPLE_PROMPTS.map((ex) => (
              <button key={ex} className="copy-btn" onClick={() => setPrompt(ex)} style={{ fontSize: "0.72rem" }}>
                {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
              </button>
            ))}
          </div>
        </div>

        <div className="option-row">
          <span className="option-label">Style</span>
          <select className="option-select" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="photorealistic">Photorealistic</option>
            <option value="digital art">Digital Art</option>
            <option value="watercolor painting">Watercolor</option>
            <option value="oil painting">Oil Painting</option>
            <option value="anime style">Anime</option>
            <option value="3D render">3D Render</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={!prompt.trim() || status === "processing"}>
        {status === "processing" ? <><span className="spinner" /> Generating with AI...</> : "✨ Generate Image"}
      </button>

      {status === "processing" && (
        <div className="status-box status-box-info" style={{ marginTop: 16 }}>
          <span className="spinner" />
          <span>AI is creating your image... This typically takes 15–90 seconds depending on server load.</span>
        </div>
      )}

      {status === "error" && <div className="status-box status-box-error" style={{ marginTop: 16 }}><span>❌</span><span>{errorMsg}</span></div>}

      {status === "done" && resultUrl && (
        <div className="result-section">
          <h3>✨ Image Generated!</h3>
          <p style={{ fontStyle: "italic", color: "var(--text-muted)", marginBottom: 16 }}>&ldquo;{prompt}&rdquo;</p>
          <img src={resultUrl} alt="Generated" className="result-image" />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <a href={resultUrl} download="ai-generated.png" className="btn btn-primary">⬇ Download Image</a>
            <button className="btn btn-secondary" onClick={reset}>Generate Another →</button>
          </div>
        </div>
      )}
    </div>
  );
}
