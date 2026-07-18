"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Moon, Sun, ChevronDown, Zap, X, ArrowRight, Layers
} from "lucide-react";
import { TOOLS, CATEGORIES, APP_NAME, type ToolCategory } from "@/lib/constants";
import { ICON_MAP, CATEGORY_COLORS } from "./ToolIcon";

const CAT_ORDER: Array<{ id: ToolCategory | "all"; label: string }> = [
  { id: "writing", label: "AI Writing" },
  { id: "pdf",     label: "PDF" },
  { id: "image",   label: "Image & AI" },
  { id: "video",   label: "Video & Audio" },
  { id: "utility", label: "Utilities" },
];

function score(tool: { name: string; keywords: string[] }, q: string) {
  const lq = q.toLowerCase();
  if (tool.name.toLowerCase().includes(lq)) return 3;
  if (tool.keywords.some((k) => k.includes(lq))) return 2;
  if (lq.split(" ").some((w) => tool.keywords.some((k) => k.includes(w)))) return 1;
  return 0;
}

export default function Navigation() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hl, setHl] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const t = saved ?? sys;
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // Keyboard shortcut "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault(); setSearchOpen(true);
      }
      if (e.key === "Escape") { setSearchOpen(false); setOpenCat(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenCat(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = query.trim()
    ? TOOLS.map((t) => ({ ...t, s: score(t, query) }))
        .filter((t) => t.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
    : [];

  const catTools = (id: string) => TOOLS.filter((t) => t.category === id);

  const navigate = useCallback((slug: string) => {
    setSearchOpen(false); setQuery(""); router.push(`/tools/${slug}`);
  }, [router]);

  return (
    <>
      <nav className="nav" ref={navRef}>
        <div className="container nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo" onClick={() => setOpenCat(null)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#4285F4" }}>
              <Layers size={22} strokeWidth={2.5} />
            </div>
            <span style={{ background: "linear-gradient(90deg, #4285F4, #EA4335)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, letterSpacing: "-0.03em" }}>
              {APP_NAME}
            </span>
          </Link>

          {/* Category dropdowns */}
          <div className="nav-categories" style={{ display: "flex", alignItems: "center", gap: 0, position: "relative" }}>
            {CAT_ORDER.map((cat) => (
              <div key={cat.id} style={{ position: "relative" }}>
                <button
                  className={`nav-cat-btn${openCat === cat.id ? " open" : ""}`}
                  onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                  aria-haspopup="true"
                  aria-expanded={openCat === cat.id}
                >
                  <span>{cat.label}</span>
                  <ChevronDown size={13} />
                </button>

                {openCat === cat.id && (
                  <div className="nav-dropdown" style={{ minWidth: 240 }}>
                    {catTools(cat.id).map((tool) => {
                      const Icon = ICON_MAP[tool.slug] ?? Zap;
                      const colors = CATEGORY_COLORS[tool.category];
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="nav-dropdown-item"
                          onClick={() => setOpenCat(null)}
                        >
                          <div className="nav-dropdown-item-icon" style={{ background: colors?.bg }}>
                            <Icon size={15} color={colors?.color} strokeWidth={2} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.83rem", color: "var(--text)" }}>{tool.name}</div>
                            {tool.badge === "AI" && (
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI</span>
                            )}
                          </div>
                          {tool.isNew && (
                            <span style={{ marginLeft: "auto", fontSize: "0.6rem", fontWeight: 800, background: "var(--orange)", color: "white", padding: "1px 5px", borderRadius: 3, textTransform: "uppercase" }}>NEW</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: search + theme + pro */}
          <div className="nav-right">
            <button
              className="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search tools"
            >
              <Search size={15} />
              <span>Search tools…</span>
              <span className="nav-search-shortcut">/</span>
            </button>
            <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <Link href="/pricing" className="btn-nav-pro">
              <Zap size={14} strokeWidth={2.5} />
              <span>Go Pro</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="search-panel-input">
              <Search size={18} color="var(--text-3)" />
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search 50 tools… e.g. 'compress pdf'"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHl(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setHl((h) => Math.min(h + 1, results.length - 1));
                  if (e.key === "ArrowUp")   setHl((h) => Math.max(h - 1, 0));
                  if (e.key === "Enter" && results[hl]) navigate(results[hl].slug);
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
              <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
                <X size={16} />
              </button>
            </div>

            {query.trim() ? (
              results.length > 0 ? (
                <div>
                  {results.map((t, i) => {
                    const Icon = ICON_MAP[t.slug] ?? Zap;
                    const colors = CATEGORY_COLORS[t.category];
                    return (
                      <div
                        key={t.slug}
                        className={`search-result-item${i === hl ? " hl" : ""}`}
                        onClick={() => navigate(t.slug)}
                      >
                        <div className="search-result-icon" style={{ background: colors?.bg }}>
                          <Icon size={16} color={colors?.color} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="search-result-name">{t.name}</div>
                          <div className="search-result-cat">{CATEGORIES.find(c => c.id === t.category)?.label}</div>
                        </div>
                        {t.badge === "AI" && <span className="tag tag-ai">AI</span>}
                        <ArrowRight size={14} color="var(--text-3)" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="search-empty">
                  <Search size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                  <div>No tools found for &quot;{query}&quot;</div>
                  <div style={{ fontSize: "0.78rem", marginTop: 5, color: "var(--text-3)" }}>Try: compress, essay, colorize, trim</div>
                </div>
              )
            ) : (
              <div style={{ padding: "10px 8px" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", padding: "6px 12px 8px" }}>Popular</div>
                {TOOLS.filter(t => ["essay-writer","remove-bg","pdf-compress","ai-generate","audio-to-text","video-compress"].includes(t.slug)).map(t => {
                  const Icon = ICON_MAP[t.slug] ?? Zap;
                  const colors = CATEGORY_COLORS[t.category];
                  return (
                    <div key={t.slug} className="search-result-item" onClick={() => navigate(t.slug)}>
                      <div className="search-result-icon" style={{ background: colors?.bg }}>
                        <Icon size={16} color={colors?.color} strokeWidth={2} />
                      </div>
                      <div className="search-result-name">{t.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
