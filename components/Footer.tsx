"use client";
import Link from "next/link";
import { Zap } from "lucide-react";
import { APP_NAME, TOOLS } from "@/lib/constants";

export default function Footer() {
  const pdfTools  = TOOLS.filter(t => t.category === "pdf").slice(0, 5);
  const imgTools  = TOOLS.filter(t => t.category === "image").slice(0, 5);
  const writingTools = TOOLS.filter(t => t.category === "writing").slice(0, 5);
  const videoTools = TOOLS.filter(t => t.category === "video").slice(0, 5);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <Zap size={15} strokeWidth={2.5} />
              </div>
              {APP_NAME}
            </div>
            <p className="footer-brand-desc">
              Free online tools for PDF, image, video, and AI writing. Privacy-first — no sign-up required.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
              {["Twitter", "GitHub", "Discord"].map(s => (
                <a key={s} href="#" style={{ fontSize: "0.82rem", color: "var(--text-3)", transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--blue)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>{s}</a>
              ))}
            </div>
          </div>

          {/* PDF Tools */}
          <div className="footer-col">
            <h4>PDF Tools</h4>
            <ul>
              {pdfTools.map(t => <li key={t.slug}><Link href={`/tools/${t.slug}`}>{t.name}</Link></li>)}
              <li><Link href="/?cat=pdf" style={{ color: "var(--blue)" }}>View all →</Link></li>
            </ul>
          </div>

          {/* Image + Writing column */}
          <div className="footer-col">
            <h4>Image & AI</h4>
            <ul>
              {imgTools.map(t => <li key={t.slug}><Link href={`/tools/${t.slug}`}>{t.name}</Link></li>)}
              <li><Link href="/?cat=image" style={{ color: "var(--blue)" }}>View all →</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4>AI Writing</h4>
            <ul>
              {writingTools.map(t => <li key={t.slug}><Link href={`/tools/${t.slug}`}>{t.name}</Link></li>)}
              <li><Link href="/?cat=writing" style={{ color: "var(--blue)" }}>View all →</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <div style={{ display: "flex", gap: 18 }}>
            {["Privacy Policy", "Terms of Service", "Contact"].map(l => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
