"use client";
import React from "react";
import { Network, Hexagon, Zap, Layers, Box } from "lucide-react";

export default function LogoTestPage() {
  return (
    <div style={{ padding: "80px 20px", maxWidth: 800, margin: "0 auto", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 40, textAlign: "center" }}>Logo Integration Concepts</h1>
      <p style={{ color: "var(--text-2)", textAlign: "center", marginBottom: 60 }}>
        Here is how the two styles translate into pure CSS/SVG code for your navigation bar. 
        You can visually compare them below.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
        
        {/* GOOGLE STYLE */}
        <div style={{ padding: 30, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 20, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Option A: Google Inspired (Multi-Color)</h2>
          
          <div style={{ display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
            {/* Logo 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "linear-gradient(135deg, #4285F4 0%, #34A853 33%, #FBBC05 66%, #EA4335 100%)", color: "white" }}>
                <Network size={18} strokeWidth={2.5} />
              </div>
              ToolNode
            </div>

            {/* Logo 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#4285F4" }}>
                <Layers size={28} strokeWidth={2.5} />
              </div>
              <span style={{ background: "linear-gradient(90deg, #4285F4, #EA4335)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ToolNode</span>
            </div>
          </div>
        </div>

        {/* BRAVE STYLE */}
        <div style={{ padding: 30, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 20, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Option B: Brave Inspired (Bold Gradient)</h2>
          
          <div style={{ display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
            {/* Logo 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "linear-gradient(135deg, #FF6B00 0%, #E60023 100%)", color: "white" }}>
                <Hexagon size={18} strokeWidth={2.5} />
              </div>
              ToolNode
            </div>

            {/* Logo 2 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B00" }}>
                <Box size={28} strokeWidth={2.5} />
              </div>
              <span style={{ background: "linear-gradient(90deg, #FF6B00, #E60023)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ToolNode</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
