"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search, Shield, Zap, Brain, Link2 as ChainIcon,
  Clock, Heart,  ArrowRight, Star,
} from "lucide-react";
import { TOOLS, CATEGORIES, AI_FINDER_SUGGESTIONS, APP_NAME, APP_TAGLINE, type ToolCategory } from "@/lib/constants";
import { ICON_MAP, CATEGORY_COLORS } from "@/components/ToolIcon";

const AnimatedParticlesBg = dynamic(() => import("@/components/AnimatedParticlesBg"), { ssr: false });

// Tool card
function ToolCard({ tool, isFav, onFav }: { tool: typeof TOOLS[0]; isFav: boolean; onFav: (slug: string) => void }) {
  const Icon = ICON_MAP[tool.slug] ?? Zap;
  const colors = CATEGORY_COLORS[tool.category];
  return (
    <div className="tool-card" style={{ position: "relative" }}>
      {tool.isNew && <div className="badge-new">New</div>}
      <div className="tool-card-header">
        <div className="tool-card-icon" style={{ background: colors?.bg }}>
          <Icon size={20} color={colors?.color} strokeWidth={2} />
        </div>
        <button
          className={`fav-btn${isFav ? " active" : ""}`}
          onClick={(e) => { e.preventDefault(); onFav(tool.slug); }}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={`/tools/${tool.slug}`} className="tool-card-name" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {tool.name}
      </Link>
      <div className="tool-card-desc">{tool.description}</div>
      <div className="tool-card-footer">
        <div className="tool-tags">
          {tool.creditCost === 0
            ? <span className="tag tag-free">Free</span>
            : <span className="tag tag-ai">AI</span>
          }
        </div>
        <Link href={`/tools/${tool.slug}`} className="tool-arrow" aria-label={`Open ${tool.name}`}>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

// Live counter — uses fixed locale to prevent SSR/client hydration mismatch
function LiveCounter() {
  const [count, setCount] = useState(1847293);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const iv = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 4) + 1), 2800);
    return () => clearInterval(iv);
  }, []);
  // Use explicit "en-US" locale so server and client always produce the same format
  return <strong>{mounted ? count.toLocaleString("en-US") : "1,847,293"}</strong>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [favs, setFavs] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [finderQ, setFinderQ] = useState("");
  const [finderResult, setFinderResult] = useState<typeof TOOLS[0] | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<typeof TOOLS>([]);
  const heroSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem("favs") || "[]"));
      setRecents(JSON.parse(localStorage.getItem("recents") || "[]"));
    } catch {}
  }, []);

  const toggleFav = (slug: string) => {
    const next = favs.includes(slug) ? favs.filter(f => f !== slug) : [slug, ...favs];
    setFavs(next);
    localStorage.setItem("favs", JSON.stringify(next));
  };

  // Search logic
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const q = searchQ.toLowerCase();
    const scored = TOOLS.map(t => ({
      ...t,
      s: t.name.toLowerCase().includes(q) ? 3
        : t.keywords.some(k => k.includes(q)) ? 2
        : q.split(" ").some(w => t.keywords.some(k => k.includes(w))) ? 1 : 0
    })).filter(t => t.s > 0).sort((a, b) => b.s - a.s).slice(0, 6);
    setSearchResults(scored);
  }, [searchQ]);

  // AI Finder
  const runFinder = () => {
    if (!finderQ.trim()) return;
    const q = finderQ.toLowerCase();
    const best = TOOLS.map(t => ({
      ...t,
      s: t.name.toLowerCase().includes(q) ? 4
        : t.keywords.filter(k => q.includes(k) || k.includes(q)).length * 2
        + (q.split(" ").filter(w => t.keywords.some(k => k.includes(w))).length)
    })).sort((a, b) => b.s - a.s)[0];
    setFinderResult(best || null);
  };

  // Filtered tools
  const displayTools = (() => {
    let tools = activeTab === "all" ? TOOLS
      : activeTab === "favs" ? TOOLS.filter(t => favs.includes(t.slug))
      : TOOLS.filter(t => t.category === activeTab);
    return tools;
  })();

  const recentTools = recents.slice(0, 5).map(s => TOOLS.find(t => t.slug === s)).filter(Boolean) as typeof TOOLS;
  const newTools = TOOLS.filter(t => t.isNew).slice(0, 4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <AnimatedParticlesBg />
        <div className="container hero-inner">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            {TOOLS.length} tools available · No sign-up required
          </div>
          <h1>
            Free AI-Powered<br />
            <em>Online Tools</em>
          </h1>
          <p className="hero-sub">
            PDF editing, AI writing, image processing, video tools and more — all free, all in your browser.
          </p>

          {/* Hero search */}
          <div className="hero-search-wrap">
            <Search size={18} className="hero-search-icon" />
            <input
              ref={heroSearchRef}
              className="hero-search"
              placeholder='Search 50 tools… e.g. "compress pdf" or "remove background"'
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && searchResults[0]) window.location.href = `/tools/${searchResults[0].slug}`; }}
            />
            {searchResults.length > 0 && searchQ && (
              <div className="hero-search-dropdown">
                {searchResults.map((t) => {
                  const Icon = ICON_MAP[t.slug] ?? Zap;
                  const colors = CATEGORY_COLORS[t.category];
                  return (
                    <Link key={t.slug} href={`/tools/${t.slug}`} className="search-result-item" onClick={() => setSearchQ("")}>
                      <div className="search-result-icon" style={{ background: colors?.bg }}>
                        <Icon size={15} color={colors?.color} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="search-result-name">{t.name}</div>
                        <div className="search-result-cat">{CATEGORIES.find(c => c.id === t.category)?.label}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><Zap size={14} className="hero-stat-icon" /><span><LiveCounter /> files processed</span></div>
            <div className="hero-stat"><Shield size={14} className="hero-stat-icon" /><span><strong>100%</strong> private — files never stored</span></div>
            <div className="hero-stat"><Star size={14} className="hero-stat-icon" /><span><strong>{TOOLS.length}</strong> tools · always free</span></div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY TABS ── */}
      <div className="cat-bar">
        <div className="container">
          <div className="cat-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-tab${activeTab === cat.id ? " active" : ""}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.label}
                <span className="cat-tab-count">{cat.count}</span>
              </button>
            ))}
            {favs.length > 0 && (
              <button className={`cat-tab${activeTab === "favs" ? " active" : ""}`} onClick={() => setActiveTab("favs")}>
                <Heart size={13} fill={activeTab === "favs" ? "white" : "none"} />
                Favorites
                <span className="cat-tab-count">{favs.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="main">
        <div className="container">

          {/* Ad slot */}
          <div className="ad-slot ad-slot-banner">
            <div className="ad-label">Advertisement</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>728×90</div>
          </div>

          {/* AI Finder */}
          <div className="ai-finder">
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <Brain size={18} />
              <div className="ai-finder-title">AI Tool Finder</div>
            </div>
            <div className="ai-finder-sub">Describe what you need in plain English — AI recommends the right tool</div>
            <div className="ai-finder-row">
              <input
                className="ai-finder-input"
                placeholder='e.g. "I want to make my PDF smaller" or "remove background from photo"'
                value={finderQ}
                onChange={(e) => setFinderQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runFinder()}
              />
              <button className="ai-finder-btn" onClick={runFinder}>Find Tool</button>
            </div>
            <div className="ai-finder-suggestions">
              {AI_FINDER_SUGGESTIONS.map(s => (
                <button key={s} className="ai-sugg-chip" onClick={() => { setFinderQ(s); setTimeout(runFinder, 0); }}>{s}</button>
              ))}
            </div>
            {finderResult && (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)", fontSize: "0.88rem" }}>
                  Best match: <strong style={{ color: "white" }}>{finderResult.name}</strong>
                </div>
                <Link href={`/tools/${finderResult.slug}`} className="btn btn-sm" style={{ background: "white", color: "var(--text)", marginLeft: "auto" }}>
                  Open Tool <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Recently Used */}
          {recentTools.length > 0 && activeTab === "all" && (
            <div style={{ marginBottom: 28 }}>
              <div className="sec-hd">
                <div className="sec-title">
                  <Clock size={16} className="sec-title-icon" />
                  Recently Used
                </div>
              </div>
              <div className="recent-strip">
                {recentTools.map(t => {
                  const Icon = ICON_MAP[t.slug] ?? Zap;
                  const colors = CATEGORY_COLORS[t.category];
                  return (
                    <Link key={t.slug} href={`/tools/${t.slug}`} className="recent-chip">
                      <div className="recent-chip-icon" style={{ color: colors?.color }}>
                        <Icon size={14} strokeWidth={2} />
                      </div>
                      {t.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Tools (when on All tab) */}
          {newTools.length > 0 && activeTab === "all" && (
            <div style={{ marginBottom: 28 }}>
              <div className="sec-hd">
                <div className="sec-title">
                  <Star size={16} className="sec-title-icon" />
                  New Tools
                  <span className="sec-count">{newTools.length} just added</span>
                </div>
              </div>
              <div className="tools-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
                {newTools.map(t => <ToolCard key={t.slug} tool={t} isFav={favs.includes(t.slug)} onFav={toggleFav} />)}
              </div>
            </div>
          )}

          {/* Main grid */}
          <div>
            <div className="sec-hd">
              <div className="sec-title">
                {activeTab === "favs"
                  ? <><Heart size={16} className="sec-title-icon" fill="var(--red)" color="var(--red)" />Favorites</>
                  : <><Zap size={16} className="sec-title-icon" />{CATEGORIES.find(c => c.id === activeTab)?.label ?? "All Tools"}</>
                }
                <span className="sec-count">{displayTools.length} tools</span>
              </div>
            </div>

            {displayTools.length === 0 && activeTab === "favs" ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
                <Heart size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No favorites yet</div>
                <div style={{ fontSize: "0.85rem" }}>Click the heart icon on any tool card to save it here</div>
              </div>
            ) : (
              <div className="tools-grid">
                {displayTools.map(t => <ToolCard key={t.slug} tool={t} isFav={favs.includes(t.slug)} onFav={toggleFav} />)}
              </div>
            )}
          </div>

          {/* Features strip */}
          <div className="features-grid" style={{ marginTop: 48 }}>
            {[
              { icon: <Shield size={20} />, color: "var(--blue-soft)", iconColor: "var(--blue)", title: "Privacy First", desc: "Files are processed locally in your browser or deleted from servers within 1 hour." },
              { icon: <Zap size={20} />, color: "var(--yellow-soft)", iconColor: "var(--orange)", title: "Instant Results", desc: "PDF & image tools run client-side for zero wait time and no upload needed." },
              { icon: <Brain size={20} />, color: "var(--cyan-soft)", iconColor: "var(--cyan)", title: "Real AI Power", desc: "Background removal, upscaling, text extraction, and writing powered by top AI models." },
              { icon: <ChainIcon size={20} />, color: "var(--green-soft)", iconColor: "var(--green)", title: "Workflow Chaining", desc: "After each tool, instantly continue to the next logical step without losing your work." },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color, color: f.iconColor }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Bottom ad */}
          <div className="ad-slot ad-slot-banner">
            <div className="ad-label">Advertisement</div>
          </div>
        </div>
      </main>
    </div>
  );
}
