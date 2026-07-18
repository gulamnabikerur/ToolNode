"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Grid, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mobile-nav">
      <Link href="/" className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>
      
      {/* We can just trigger the same search shortcut or link to a search page */}
      {/* For now, linking to root #search or similar, or we can use an event.
          Let's just dispatch a keyboard event for '/' to trigger Navigation.tsx search */}
      <button 
        className="mobile-nav-item" 
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
        }}
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      <Link href="/pricing" className={`mobile-nav-item ${pathname === "/pricing" ? "active" : ""}`}>
        <Zap size={20} />
        <span>Pro</span>
      </Link>
    </div>
  );
}
