"use client";

import { useEffect, useRef } from "react";

const CHAOS_ICONS = [
  {
    id: "notion",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M6 3v18M18 3v18M6 3l12 18" stroke="#e5e5e5" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "github",
    svg: (
      <svg viewBox="0 0 24 24" fill="#d4d4d4" className="w-full h-full">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    id: "slack",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="5.5" y="5.5" width="5" height="5" rx="1.5" fill="#E01E5A" />
        <rect x="13.5" y="5.5" width="5" height="5" rx="1.5" fill="#36C5F0" />
        <rect x="5.5" y="13.5" width="5" height="5" rx="1.5" fill="#2EB67D" />
        <rect x="13.5" y="13.5" width="5" height="5" rx="1.5" fill="#ECB22E" />
      </svg>
    ),
  },
  {
    id: "vscode",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M17.5 3.5L3 10l4 3.5L3 17l3 1.5L21 13V5l-3.5-1.5z" fill="#007ACC" opacity="0.9" />
        <path d="M7 13.5l10-8.5v17L7 13.5z" fill="#1f8ad2" />
        <path d="M3 10l4 3.5-4 3.5v-7z" fill="#007ACC" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "browser",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#888" strokeWidth="1.4" />
        <line x1="2" y1="9" x2="22" y2="9" stroke="#666" strokeWidth="1.2" />
        <circle cx="5" cy="6.5" r="1" fill="#ff5f57" />
        <circle cx="8.2" cy="6.5" r="1" fill="#febc2e" />
        <circle cx="11.4" cy="6.5" r="1" fill="#28c840" />
        <rect x="5" y="11" width="14" height="1.5" rx="0.75" fill="#444" />
        <rect x="5" y="14" width="9" height="1.5" rx="0.75" fill="#333" />
      </svg>
    ),
  },
  {
    id: "terminal",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#111" stroke="#333" strokeWidth="1.2" />
        <polyline points="7,9.5 11.5,12 7,14.5" stroke="#22c55e" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="13.5" y1="14.5" x2="17.5" y2="14.5" stroke="#555" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "file",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#888" strokeWidth="1.4" />
        <polyline points="14,2 14,8 20,8" stroke="#888" strokeWidth="1.4" fill="none" />
        <line x1="8" y1="13" x2="16" y2="13" stroke="#666" strokeWidth="1.2" />
        <line x1="8" y1="16.5" x2="13" y2="16.5" stroke="#555" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "bookmark",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="#8b5cf6" strokeWidth="1.5" fill="#8b5cf615" />
      </svg>
    ),
  },
];

type Particle = { x: number; y: number; vx: number; vy: number };

const ICON_SIZE = 40;
const REPEL_DIST = 90;
const REPEL_FORCE = 0.4;
const MAX_SPEED = 1.2;

export default function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();

    particlesRef.current = CHAOS_ICONS.map(() => ({
      x: 20 + Math.random() * (width - ICON_SIZE - 40),
      y: 20 + Math.random() * (height - ICON_SIZE - 40),
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    function tick() {
      const { width: w, height: h } = container!.getBoundingClientRect();
      const mouse = mouseRef.current;

      particlesRef.current.forEach((p, i) => {
        const cx = p.x + ICON_SIZE / 2;
        const cy = p.y + ICON_SIZE / 2;
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_DIST && dist > 0) {
          const force = ((REPEL_DIST - dist) / REPEL_DIST) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > w - ICON_SIZE) { p.x = w - ICON_SIZE; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > h - ICON_SIZE) { p.y = h - ICON_SIZE; p.vy = -Math.abs(p.vy); }

        const el = iconRefs.current[i];
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {CHAOS_ICONS.map((icon, i) => (
        <div
          key={icon.id}
          ref={(el) => { iconRefs.current[i] = el; }}
          className="absolute w-10 h-10 p-1 opacity-80"
          style={{ transform: "translate(0px, 0px)", willChange: "transform" }}
          aria-hidden="true"
        >
          {icon.svg}
        </div>
      ))}
    </div>
  );
}
