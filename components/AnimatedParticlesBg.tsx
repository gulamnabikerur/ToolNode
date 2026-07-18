"use client";
import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  r: number; color: string; opacity: number; baseY: number;
}

// Google brand colors — NO purple
const COLORS = ["#1a73e8", "#34a853", "#ea4335", "#fbbc04", "#00acc1", "#4285f4", "#0f9d58"];

export default function AnimatedParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const count = Math.min(Math.floor((W * H) / 10000), 90);
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      baseY: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1), // float upward (anti-gravity)
      r: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const mx = mouseRef.current.x, my = mouseRef.current.y;

    ctx.clearRect(0, 0, W, H);

    particlesRef.current.forEach((p) => {
      // Anti-gravity: float upward, wrap around
      p.x += p.vx;
      p.y += p.vy;

      // Mouse repulsion (anti-gravity feel)
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
      }
      // Dampen velocity
      p.vx *= 0.98; p.vy *= 0.98;
      // Ensure slight upward drift
      if (p.vy > -0.05) p.vy -= 0.01;
      // Clamp
      p.vx = Math.max(-1.5, Math.min(1.5, p.vx));
      p.vy = Math.max(-1.8, Math.min(0.5, p.vy));

      // Wrap vertically (anti-gravity: appear at bottom when off top)
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      // Wrap horizontally
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    init();
    draw();

    const onResize = () => { init(); };
    const onMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };

    window.addEventListener("resize", onResize);
    canvasRef.current?.parentElement?.addEventListener("mousemove", onMouse);
    canvasRef.current?.parentElement?.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [init, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    />
  );
}
