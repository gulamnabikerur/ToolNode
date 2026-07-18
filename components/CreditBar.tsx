"use client";
import { useState, useEffect } from "react";
import { Zap, X } from "lucide-react";
import { getRemainingCredits, DAILY_LIMIT } from "@/lib/credits";

interface CreditBarProps {
  onUpgrade: () => void;
}

export default function CreditBar({ onUpgrade }: CreditBarProps) {
  const [remaining, setRemaining] = useState(DAILY_LIMIT);

  useEffect(() => { setRemaining(getRemainingCredits()); }, []);

  const pct = Math.max(0, (remaining / DAILY_LIMIT) * 100);
  const fillColor = pct > 50 ? "var(--green)" : pct > 20 ? "var(--orange)" : "var(--red)";
  const isEmpty = remaining === 0;

  return (
    <div className="sidebar-card">
      <div className="sidebar-card-title"><Zap size={12} /> Daily AI Credits</div>
      <div className="credit-hd">
        <span className="credit-label">Available</span>
        <span className={`credit-num${isEmpty ? " empty" : ""}`}>{remaining}/{DAILY_LIMIT}</span>
      </div>
      <div className="credit-bar">
        <div className="credit-fill" style={{ width: `${pct}%`, background: fillColor }} />
      </div>
      <p className="credit-sub">
        {isEmpty
          ? <><button onClick={onUpgrade} className="credit-upgrade-link">Upgrade to Pro</button> for unlimited AI credits.</>
          : `${remaining} credits left today. Resets at midnight.`
        }
      </p>
      {isEmpty && (
        <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={onUpgrade}>
          <Zap size={13} /> Go Pro — Unlimited
        </button>
      )}
    </div>
  );
}
