"use client";
import { useState } from "react";
import { hasCreditsRemaining, consumeCredit } from "@/lib/credits";

interface AITextToolProps {
  slug: string;
  onCreditUsed: () => void;
  onUpgradeNeeded: () => void;
}

type FieldConfig = { label: string; key: string; placeholder: string; type?: "input" | "textarea"; optional?: boolean };

interface ToolConfig {
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  extraFields?: FieldConfig[];
  examples: string[];
  outputFormat?: "text" | "list";
}

const CONFIGS: Record<string, ToolConfig> = {
  "essay-writer": {
    inputLabel: "Essay Topic",
    inputPlaceholder: "e.g. The impact of social media on mental health",
    outputLabel: "Generated Essay",
    examples: ["Climate change and its global effects", "The role of AI in modern education", "Benefits of remote work"],
    extraFields: [{ label: "Essay Type (optional)", key: "essayType", placeholder: "e.g. Persuasive, Academic, Descriptive", type: "input", optional: true }],
  },
  "story-generator": {
    inputLabel: "Story Prompt",
    inputPlaceholder: "e.g. A detective discovers a mysterious door in an alley that leads to another era",
    outputLabel: "Generated Story",
    examples: ["A young wizard discovers a forbidden spell", "Two rivals stranded on a desert island", "A robot falls in love with a human"],
  },
  "poem-generator": {
    inputLabel: "Poem Theme or Subject",
    inputPlaceholder: "e.g. The beauty of rain on autumn leaves",
    outputLabel: "Generated Poem",
    examples: ["Loneliness in a crowded city", "A child's first day at school", "The ocean at midnight"],
    extraFields: [{ label: "Style (optional)", key: "style", placeholder: "e.g. Haiku, Sonnet, Free verse, Rhyming", type: "input", optional: true }],
  },
  "content-improver": {
    inputLabel: "Your Content",
    inputPlaceholder: "Paste the text you want to improve here...",
    outputLabel: "Improved Content",
    examples: ["Our product is good and helps people do things faster.", "We offer services that clients like.", "The food at our restaurant is made fresh every day."],
    outputFormat: "text",
  },
  "grammar-fixer": {
    inputLabel: "Text to Fix",
    inputPlaceholder: "Paste text with grammar or spelling mistakes here...",
    outputLabel: "Corrected Text",
    examples: ["Their going to the store tomorrow and buyed some milk.", "She dont know how to using this tool properly.", "The team have decide to postpone there meeting."],
    outputFormat: "text",
  },
  "summarizer": {
    inputLabel: "Text to Summarize",
    inputPlaceholder: "Paste a long article, document excerpt, or any text here...",
    outputLabel: "Summary",
    examples: ["(Paste a long news article...)", "(Paste a research paper excerpt...)", "(Paste a long email thread...)"],
    outputFormat: "text",
  },
  "sentence-rewriter": {
    inputLabel: "Sentences to Rewrite",
    inputPlaceholder: "Enter the sentences you want rephrased...",
    outputLabel: "Rewritten Sentences",
    extraFields: [{ label: "Tone (optional)", key: "tone", placeholder: "e.g. Formal, Casual, Professional, Friendly", type: "input", optional: true }],
    examples: ["It is important to understand the benefits of exercise.", "The meeting was not very productive today.", "We need to improve our customer service immediately."],
    outputFormat: "text",
  },
  "instagram-caption": {
    inputLabel: "Describe Your Post",
    inputPlaceholder: "e.g. A photo of a cozy coffee shop on a rainy day",
    outputLabel: "Instagram Captions (3 variants)",
    extraFields: [{ label: "Brand/Account Vibe (optional)", key: "vibe", placeholder: "e.g. Lifestyle, Foodie, Travel, Motivational", type: "input", optional: true }],
    examples: ["Sunset on the beach with friends", "New product launch for skincare brand", "Workout gym session results"],
    outputFormat: "list",
  },
  "blog-ideas": {
    inputLabel: "Your Blog Niche or Topic",
    inputPlaceholder: "e.g. Personal finance for millennials",
    outputLabel: "Blog Post Ideas",
    examples: ["Healthy eating on a budget", "Remote work productivity tips", "Beginner investing guide"],
    outputFormat: "list",
  },
  "meta-description": {
    inputLabel: "Page Topic / URL Content",
    inputPlaceholder: "e.g. A blog post about the best free AI image tools in 2025",
    outputLabel: "Meta Description",
    extraFields: [{ label: "Target Keyword (optional)", key: "keyword", placeholder: "e.g. free AI image tools", type: "input", optional: true }],
    examples: ["Online PDF compressor tool", "Budget travel tips for Europe", "Learn Python programming for beginners"],
    outputFormat: "text",
  },
  "business-name": {
    inputLabel: "Describe Your Business",
    inputPlaceholder: "e.g. A sustainable fashion brand targeting Gen Z consumers",
    outputLabel: "Business Name Ideas",
    extraFields: [{ label: "Industry (optional)", key: "industry", placeholder: "e.g. Tech, Fashion, Food, Finance", type: "input", optional: true }],
    examples: ["An AI-powered tutoring platform", "A vegan meal prep service", "A travel photography agency"],
    outputFormat: "list",
  },
  "youtube-script": {
    inputLabel: "Video Topic",
    inputPlaceholder: "e.g. 5 habits that changed my life completely",
    outputLabel: "YouTube Script",
    extraFields: [
      { label: "Channel Style (optional)", key: "style", placeholder: "e.g. Educational, Comedy, Vlog, Tutorial", type: "input", optional: true },
      { label: "Target Audience (optional)", key: "audience", placeholder: "e.g. Beginners, Students, Professionals", type: "input", optional: true },
    ],
    examples: ["How I built a 6-figure business in 12 months", "The science behind intermittent fasting", "React vs Vue: Which should you learn in 2025?"],
  },
  "faq-generator": {
    inputLabel: "Topic or Product/Service",
    inputPlaceholder: "e.g. A cloud-based project management SaaS platform",
    outputLabel: "FAQ Section",
    examples: ["Online fitness coaching service", "A pet food subscription box", "A freelance design agency"],
    outputFormat: "list",
  },
  "youtube-description": {
    inputLabel: "Video Topic / Title",
    inputPlaceholder: "e.g. 10 Must-Know Python Tips for Beginners",
    outputLabel: "YouTube Description",
    extraFields: [
      { label: "Channel Name (optional)", key: "channel", placeholder: "e.g. CodeWithJohn", type: "input", optional: true },
      { label: "Key Topics / Timestamps (optional)", key: "topics", placeholder: "e.g. Variables, Loops, Functions", type: "input", optional: true },
    ],
    examples: ["How to Start Investing with $100", "Full Day of Eating for Muscle Gain", "React vs Next.js in 2025"],
  },
  "excel-formula": {
    inputLabel: "Describe What You Want the Formula to Do",
    inputPlaceholder: "e.g. Find the average of column B only where column A says 'Paid'",
    outputLabel: "Formula & Explanation",
    extraFields: [
      { label: "Platform (optional)", key: "platform", placeholder: "e.g. Excel, Google Sheets", type: "input", optional: true },
    ],
    examples: ["Sum cells if they contain a specific word", "Count unique values in a range", "VLOOKUP from another sheet with error handling"],
  },
  "ai-humanizer": {
    inputLabel: "Paste AI-Generated Text",
    inputPlaceholder: "Paste the text you want to humanize (from ChatGPT, Gemini, Claude, etc.)...",
    outputLabel: "Humanized Text",
    examples: ["(Paste any ChatGPT output here)", "(Paste an AI-written essay)", "(Paste an AI blog post)"],
    outputFormat: "text",
  },
  "linkedin-post": {
    inputLabel: "Post Topic or Key Message",
    inputPlaceholder: "e.g. Why I quit my 6-figure job to build a startup",
    outputLabel: "LinkedIn Post",
    extraFields: [
      { label: "Your Role/Industry (optional)", key: "role", placeholder: "e.g. Software Engineer, Marketing Director", type: "input", optional: true },
    ],
    examples: ["3 lessons from my first year as a founder", "Why soft skills matter more than coding skills", "I just got laid off — here's what I learned"],
  },
  "twitter-post": {
    inputLabel: "Tweet Topic or Idea",
    inputPlaceholder: "e.g. A hot take on why most productivity advice is wrong",
    outputLabel: "Tweet / Thread",
    extraFields: [
      { label: "Format (optional)", key: "format", placeholder: "e.g. Single tweet, Thread (5 tweets)", type: "input", optional: true },
    ],
    examples: ["Unpopular opinion about AI replacing jobs", "A thread on how I grew to 10k followers", "A funny take on developer life"],
  },
  "fb-headline": {
    inputLabel: "Product or Service to Advertise",
    inputPlaceholder: "e.g. A new AI-powered resume builder that creates ATS-friendly resumes",
    outputLabel: "Facebook Ad Headlines (10)",
    extraFields: [
      { label: "Target Audience (optional)", key: "audience", placeholder: "e.g. Job seekers, Small business owners", type: "input", optional: true },
    ],
    examples: ["Online course for learning Spanish in 30 days", "Meal prep delivery service for busy professionals", "Budget-friendly home security camera system"],
    outputFormat: "list",
  },
};

export default function AITextTool({ slug, onCreditUsed, onUpgradeNeeded }: AITextToolProps) {
  const cfg = CONFIGS[slug];
  const [input, setInput] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!cfg) return <div className="status-box status-error">Tool not configured</div>;

  const generate = async () => {
    if (!input.trim()) return;
    if (!hasCreditsRemaining()) { onUpgradeNeeded(); return; }
    setStatus("loading");
    setError("");
    setOutput("");
    try {
      const res = await fetch("/api/tools/ai-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: slug, input: input.trim(), extras }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(data.text || "");
      consumeCredit();
      onCreditUsed();
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStatus("error");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${slug}.txt`; a.click();
  };

  return (
    <div>
      {/* Input */}
      <div className="options-panel" style={{ marginBottom: 16 }}>
        <div className="options-panel-title">{cfg.inputLabel}</div>
        <textarea
          className="text-area"
          style={{ minHeight: 110 }}
          placeholder={cfg.inputPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
        />
        <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 4 }}>{input.length}/2000</div>

        {cfg.extraFields?.map((f) => (
          <div key={f.key} style={{ marginTop: 12 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>{f.label}</div>
            {f.type === "textarea"
              ? <textarea className="text-area" style={{ minHeight: 70 }} placeholder={f.placeholder} value={extras[f.key] || ""} onChange={(e) => setExtras(p => ({ ...p, [f.key]: e.target.value }))} />
              : <input className="opt-input" placeholder={f.placeholder} value={extras[f.key] || ""} onChange={(e) => setExtras(p => ({ ...p, [f.key]: e.target.value }))} />
            }
          </div>
        ))}

        {/* Examples */}
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: "0.73rem", color: "var(--text-3)" }}>💡 Examples: </span>
          {cfg.examples.slice(0, 3).map((ex) => (
            <button key={ex} className="copy-btn" style={{ margin: "3px", fontSize: "0.72rem" }} onClick={() => setInput(ex)}>
              {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={generate}
        disabled={!input.trim() || status === "loading"}
      >
        {status === "loading" ? <><span className="spinner" /> Generating…</> : "✨ Generate"}
      </button>

      {status === "loading" && (
        <div className="status-box status-info" style={{ marginTop: 14 }}>
          <span className="spinner spinner-dark" />
          <span>AI is writing… This may take 10–30 seconds.</span>
        </div>
      )}
      {status === "error" && <div className="status-box status-error" style={{ marginTop: 14 }}><span>❌</span><span>{error}</span></div>}

      {/* Output */}
      {status === "done" && output && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>✅ {cfg.outputLabel}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
              <button className="copy-btn" onClick={download}>⬇ Download</button>
              <button className="copy-btn" onClick={() => { setOutput(""); setStatus("idle"); }}>↺ Regenerate</button>
            </div>
          </div>
          <textarea
            className="text-area"
            style={{ minHeight: 280 }}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
          />
          <p style={{ fontSize: "0.73rem", color: "var(--text-3)", marginTop: 6 }}>
            {output.split(/\s+/).filter(Boolean).length} words · {output.length} characters · Click to edit
          </p>
        </div>
      )}
    </div>
  );
}
