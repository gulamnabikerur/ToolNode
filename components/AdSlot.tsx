interface AdSlotProps {
  variant?: "banner" | "sidebar" | "inline";
}

export default function AdSlot({ variant = "banner" }: AdSlotProps) {
  const isSidebar = variant === "sidebar";
  return (
    <div
      className={`ad-slot ${isSidebar ? "ad-slot-sidebar" : "ad-slot-banner"}`}
      style={{
        minHeight: isSidebar ? 250 : 90,
        minWidth: isSidebar ? 300 : 728,
        background: "var(--bg-card)",
        border: "1px dashed var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        overflow: "hidden"
      }}
    >
      <span className="ad-label" style={{ fontWeight: 600, color: "var(--text-3)", marginBottom: 4 }}>Advertisement</span>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {isSidebar ? "Support us (300×250)" : "Support us (728×90)"}
      </span>
    </div>
  );
}
