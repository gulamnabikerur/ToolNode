"use client";
export default function PricingPage() {
  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + 60px)", paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Pricing</span>
          <h1 className="section-title">Simple, Transparent Pricing</h1>
          <p className="section-subtitle">
            PDF tools are free forever. AI tools get 5 free uses per day. Upgrade for unlimited access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card">
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🆓</div>
            <h2 style={{ fontSize: "1.3rem" }}>Free</h2>
            <div className="pricing-price" style={{ fontSize: "2.5rem" }}>$0</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Forever free, no credit card</p>

            <ul className="pricing-features">
              {[
                "Unlimited PDF merge, split, compress, sign",
                "Unlimited image → PDF conversion",
                "5 AI tool uses per day",
                "Background removal (5/day)",
                "Image upscaling (5/day)",
                "AI image generation (5/day)",
                "Text extraction/OCR (5/day)",
                "Files up to 10MB",
                "Client-side processing (max privacy)",
              ].map((f) => (
                <li key={f}>
                  <span>✓</span>
                  <span>{f}</span>
                </li>
              ))}
              {["Real-time collaboration", "API access", "Priority processing", "No ads"].map((f) => (
                <li key={f}>
                  <span style={{ color: "var(--text-muted)" }}>✗</span>
                  <span style={{ textDecoration: "line-through", opacity: 0.5 }}>{f}</span>
                </li>
              ))}
            </ul>

            <a href="/#tools" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              Start Free →
            </a>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card featured">
            <div className="featured-label">Most Popular</div>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>⚡</div>
            <h2 style={{ fontSize: "1.3rem" }}>Pro</h2>
            <div className="pricing-price">$9<span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-muted)" }}>/mo</span></div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Everything in Free, plus:</p>

            <ul className="pricing-features">
              {[
                "Unlimited AI tool uses",
                "Priority AI processing (2× faster)",
                "Files up to 100MB",
                "No advertisements",
                "API access (1,000 calls/day)",
                "Real-time collaboration",
                "Batch processing",
                "Custom branding on outputs",
                "Email support",
              ].map((f) => (
                <li key={f}>
                  <span>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => alert("Stripe integration coming soon! This is a prototype.")}
            >
              ✦ Upgrade to Pro
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" style={{ marginTop: 80 }}>
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                q: "Do I need to sign up to use the tools?",
                a: "No! All tools work without any account. Just visit the tool page and start working. AI credits are tracked via your browser's local storage.",
              },
              {
                q: "How do the daily AI credits work?",
                a: "Free users get 5 AI tool uses per day. This counter resets every midnight. PDF tools (merge, split, compress, sign, convert) are always unlimited and don't use credits.",
              },
              {
                q: "Are my files private?",
                a: "PDF tools run entirely in your browser — your files never leave your device. AI tools require sending files to our API, but we delete them immediately after processing and never use them for training.",
              },
              {
                q: "What AI models do you use?",
                a: "We use BRIA RMBG 2.0 for background removal, Real-ESRGAN for upscaling, FLUX Schnell / AI Horde for image generation, and OCR.space for text extraction — all industry-leading, free-tier models.",
              },
              {
                q: "What is the file size limit?",
                a: "Free: up to 10MB per file. Pro: up to 100MB. PDF tools have no practical limit since they process locally in your browser.",
              },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "20px 24px" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>❓ {q}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
