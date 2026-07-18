"use client";
import { Zap, Check, X } from "lucide-react";

interface Props { onClose: () => void; }

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><Zap size={24} /></div>
        <h2>Go Pro — Remove All Limits</h2>
        <p>You've used all your free AI credits for today. Upgrade to Pro for unlimited access, faster processing, and no ads.</p>

        <div className="pricing-grid" style={{ margin: "0 0 20px", gridTemplateColumns: "1fr 1fr" }}>
          <div className="pricing-card">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Supporter</div>
            <div className="pricing-price" style={{ fontSize: "2rem" }}>$5.99<span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-2)" }}>/mo</span></div>
            <ul className="pricing-features" style={{ textAlign: "left", fontSize: "0.8rem" }}>
              <li><Check size={14} className="check" />No ads</li>
              <li><Check size={14} className="check" />20 AI credits/day</li>
              <li><Check size={14} className="check" />Priority queue</li>
              <li><X size={14} className="cross" />Unlimited credits</li>
            </ul>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>Choose</button>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-popular">Most Popular</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Unlimited</div>
            <div className="pricing-price" style={{ fontSize: "2rem" }}>$15<span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-2)" }}>/mo</span></div>
            <ul className="pricing-features" style={{ textAlign: "left", fontSize: "0.8rem" }}>
              <li><Check size={14} className="check" />No ads</li>
              <li><Check size={14} className="check" />Unlimited AI credits</li>
              <li><Check size={14} className="check" />Fastest processing</li>
              <li><Check size={14} className="check" />Early access</li>
            </ul>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>Start Free Trial</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}><X size={15} /> Maybe Later</button>
        </div>
      </div>
    </div>
  );
}
