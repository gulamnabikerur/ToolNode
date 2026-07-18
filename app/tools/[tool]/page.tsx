"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Shield, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { TOOLS, CATEGORIES } from "@/lib/constants";
import { SEO_DATA } from "@/lib/seo-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ICON_MAP, CATEGORY_COLORS } from "@/components/ToolIcon";
import CreditBar from "@/components/CreditBar";
import UpgradeModal from "@/components/UpgradeModal";
import AdSlot from "@/components/AdSlot";

import ToolRenderer from "@/components/ToolRenderer";

function addToRecent(slug: string) {
  try {
    const prev = JSON.parse(localStorage.getItem("recents") || "[]") as string[];
    localStorage.setItem("recents", JSON.stringify([slug, ...prev.filter(s => s !== slug)].slice(0, 10)));
  } catch {}
}

// ── Loading skeleton ─────────────────────────────────────────────
const Skeleton = () => (
  <div style={{ padding: "24px", textAlign: "center", color: "var(--text-3)" }}>
    <span className="spinner spinner-dark spinner-lg" />
    <div style={{ marginTop: 12, fontSize: "0.85rem" }}>Loading tool…</div>
  </div>
);


// ── Main Page ────────────────────────────────────────────────────
export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = use(params);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [creditKey,   setCreditKey]   = useState(0);

  const tool       = TOOLS.find(t => t.slug === slug);
  const nextTools  = (tool?.workflowNext || []).map(s => TOOLS.find(t => t.slug === s)).filter(Boolean) as typeof TOOLS;
  const related    = TOOLS.filter(t => t.slug !== slug && t.category === tool?.category).slice(0, 6);
  const Icon       = slug ? (ICON_MAP[slug] ?? Zap) : Zap;
  const colors     = tool ? CATEGORY_COLORS[tool.category] : undefined;
  const catLabel   = CATEGORIES.find(c => c.id === tool?.category)?.label ?? "Tools";
  const seoContent = slug ? SEO_DATA[slug] : undefined;

  useEffect(() => { if (slug) addToRecent(slug); }, [slug]);

  if (!tool) {
    return (
      <div className="tool-page">
        <div className="container" style={{ textAlign:"center", paddingTop:80 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--red-soft)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Zap size={28} color="var(--red)" />
          </div>
          <h1 style={{ marginBottom:12 }}>Tool not found</h1>
          <p style={{ color:"var(--text-2)", marginBottom:24 }}>The tool you're looking for doesn't exist or has moved.</p>
          <Link href="/" className="btn btn-primary btn-lg">Browse All Tools</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

      <div className="tool-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link href="/" style={{ color:"var(--text-3)" }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/" style={{ color:"var(--text-3)" }}>{catLabel}</Link>
            <ChevronRight size={12} />
            <span style={{ color:"var(--text-2)", fontWeight:600 }}>{tool.name}</span>
          </div>

          <div className="tool-layout">
            {/* ── MAIN COLUMN ── */}
            <div>
              {/* Tool header card */}
              <div className="tool-header">
                <div className="tool-header-top">
                  <div className="tool-header-icon" style={{ background: colors?.bg }}>
                    <Icon size={26} color={colors?.color} strokeWidth={2} />
                  </div>
                  <div className="tool-header-meta">
                    <h1>{tool.name}</h1>
                    <div className="tool-badges">
                      {tool.creditCost === 0
                        ? <span className="tag tag-free">Free · Unlimited</span>
                        : <span className="tag tag-ai">AI · Uses 1 credit</span>
                      }
                      {tool.isNew && <span className="tag tag-new">New</span>}
                    </div>
                  </div>
                </div>
                <p style={{ color:"var(--text-2)", fontSize:"0.925rem", margin:"12px 0" }}>{tool.description}</p>
                <div className="tool-features">
                  {tool.features.map(f => (
                    <span key={f} className="tool-feat-chip">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ad banner */}
              <AdSlot variant="banner" />

              {/* Tool panel */}
              <div className="tool-panel">
                <ErrorBoundary>
                  <ToolRenderer
                    slug={slug}
                    onCreditUsed={() => setCreditKey(k => k + 1)}
                    onUpgradeNeeded={() => setUpgradeOpen(true)}
                  />
                </ErrorBoundary>
              </div>

              {/* Workflow: next steps */}
              {nextTools.length > 0 && (
                <div className="workflow-next">
                  <div className="workflow-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Continue your workflow
                  </div>
                  <div className="workflow-steps">
                    {nextTools.map(t => {
                      const NIcon = ICON_MAP[t.slug] ?? Zap;
                      const nc    = CATEGORY_COLORS[t.category];
                      return (
                        <Link key={t.slug} href={`/tools/${t.slug}`} className="workflow-btn">
                          <div style={{ width:20, height:20, borderRadius:5, background:nc?.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <NIcon size={12} color={nc?.color} strokeWidth={2} />
                          </div>
                          {t.name}
                          <ArrowRight size={13} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SEO CONTENT ARTICLE ── */}
              {seoContent && (
                <article className="seo-article" style={{ marginTop: 40, paddingTop: 30, borderTop: "1px solid var(--border)" }}>
                  <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>About {tool.name}</h2>
                  <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginBottom: 32 }}>{seoContent.longDescription}</p>

                  {/* How-To Section */}
                  {seoContent.howTo && seoContent.howTo.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontSize: "1.25rem", marginBottom: 16 }}>How to use this tool</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {seoContent.howTo.map((step, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "var(--bg-card)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: colors?.bg || "var(--blue-soft)", color: colors?.color || "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.9rem", flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            <div>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>{step.step}</h4>
                              <p style={{ margin: 0, color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.5 }}>{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ Section */}
                  {seoContent.faqs && seoContent.faqs.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <h3 style={{ fontSize: "1.25rem", marginBottom: 16 }}>Frequently Asked Questions</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {seoContent.faqs.map((faq, idx) => (
                          <div key={idx} style={{ background: "var(--bg-card)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                              <CheckCircle2 size={16} color="var(--green)" />
                              {faq.question}
                            </h4>
                            <p style={{ margin: 0, color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.5, paddingLeft: 24 }}>{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* Related Tools */}
              {related.length > 0 && (
                <div style={{ marginTop:24 }}>
                  <div className="sec-hd" style={{ marginBottom:12 }}>
                    <div className="sec-title">More {catLabel}</div>
                  </div>
                  <div className="related-grid">
                    {related.map(t => {
                      const RIcon = ICON_MAP[t.slug] ?? Zap;
                      const rc    = CATEGORY_COLORS[t.category];
                      return (
                        <Link key={t.slug} href={`/tools/${t.slug}`} className="related-card">
                          <div className="related-card-icon" style={{ width:28, height:28, borderRadius:7, background:rc?.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <RIcon size={14} color={rc?.color} strokeWidth={2} />
                          </div>
                          {t.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="tool-sidebar">
              {tool.creditCost > 0 && (
                <CreditBar key={creditKey} onUpgrade={() => setUpgradeOpen(true)} />
              )}

              {/* Ad sidebar */}
              <AdSlot variant="sidebar" />

              {/* Privacy card */}
              <div className="sidebar-card">
                <div className="sidebar-card-title"><Shield size={12} /> Privacy</div>
                <p style={{ fontSize:"0.82rem", color:"var(--text-2)", lineHeight:1.7 }}>
                  {tool.creditCost === 0
                    ? <><strong>100% client-side.</strong> Your files never leave your device — processed entirely in your browser.</>
                    : <>Files are sent over <strong>encrypted HTTPS</strong> and permanently deleted within 1 hour.</>
                  }
                </p>
              </div>

              <Link href="/" className="btn btn-secondary" style={{ width:"100%", justifyContent:"center" }}>
                ← All Tools
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
