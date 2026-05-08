import Link from "next/link";
import ChaosAnimation from "./ChaosAnimation";
import ScrollAnimation from "./ScrollAnimation";

const TYPE_COLORS = [
  { color: "#3b82f6", label: "snippet" },
  { color: "#f59e0b", label: "prompt" },
  { color: "#06b6d4", label: "command" },
  { color: "#22c55e", label: "note" },
  { color: "#8b5cf6", label: "prompt" },
  { color: "#ec4899", label: "image" },
];

function DashboardMockup() {
  return (
    <div className="w-full h-full bg-[#0d0d0d] rounded-lg overflow-hidden border border-[#2a2a2a] flex">
      {/* Sidebar */}
      <div className="w-9 bg-[#111] border-r border-[#222] flex flex-col items-center py-2 gap-2 shrink-0">
        <div className="w-5 h-5 mb-1">
          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
            <path d="M8 1L1.5 4.5v7L8 15l6.5-3.5v-7L8 1z" stroke="#3b82f6" strokeWidth="1.2" fill="#3b82f615" />
          </svg>
        </div>
        {TYPE_COLORS.map((t, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "opacity-100" : "opacity-40"}`}
            style={{ backgroundColor: t.color }}
          />
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-7 border-b border-[#222] flex items-center px-2 gap-1.5 shrink-0">
          <div className="flex-1 h-3 bg-[#1c1c1c] rounded" />
          <div className="w-5 h-5 rounded-full bg-[#222]" />
        </div>
        {/* Section label */}
        <div className="flex items-center gap-1.5 px-2 py-1">
          <span className="text-[8px] text-[#525252] font-mono">Recent Items</span>
          <span className="text-[8px] text-[#333] bg-[#1c1c1c] px-1 rounded">18</span>
        </div>
        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-1 px-1.5 pb-1.5">
          {TYPE_COLORS.map((t, i) => (
            <div
              key={i}
              className="rounded bg-[#141414] border-l-2 p-1.5"
              style={{ borderLeftColor: t.color }}
            >
              <span className="text-[7px] font-mono" style={{ color: t.color }}>
                {t.label}
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="h-1 bg-[#2a2a2a] rounded w-full" />
                <div className="h-1 bg-[#222] rounded w-3/4" />
                <div className="h-1 bg-[#1c1c1c] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransformArrow() {
  return (
    <div className="flex items-center justify-center md:rotate-0 rotate-90 shrink-0">
      <svg
        className="w-10 h-5 md:w-12 md:h-6"
        viewBox="0 0 48 24"
        fill="none"
      >
        <path d="M2 12H42" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 4l8 8-8 8" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="arrowGrad" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0d0d0d] pt-[60px]">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, #3b82f610 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1140px] mx-auto px-6 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Column */}
          <ScrollAnimation className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/25 px-3 py-1.5 rounded-full mb-6 font-medium">
              ✦ Developer Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#e5e5e5] leading-tight mb-5">
              Stop Losing Your
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)",
                }}
              >
                Developer Knowledge
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#a3a3a3] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Code snippets, AI prompts, commands, notes, files, and links — all
              unified in one fast, searchable hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium rounded-lg transition-colors text-sm"
              >
                Get Started Free
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 border border-[#333] hover:border-[#555] text-[#e5e5e5] hover:bg-[#1c1c1c] font-medium rounded-lg transition-colors text-sm"
              >
                See Features →
              </a>
            </div>
          </ScrollAnimation>

          {/* Visual Column */}
          <ScrollAnimation className="flex-1 w-full max-w-xl lg:max-w-none" delay={150}>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3">
              {/* Chaos Box */}
              <div className="flex-1 w-full md:w-auto">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#111] overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#222]">
                    <span className="text-[11px] text-[#525252] font-mono">
                      Your knowledge today…
                    </span>
                  </div>
                  <div className="relative h-48 md:h-56">
                    <ChaosAnimation />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <TransformArrow />

              {/* Dashboard Box */}
              <div className="flex-1 w-full md:w-auto">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#111] overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#222]">
                    <span className="text-[11px] text-[#525252] font-mono">
                      …with DevStash
                    </span>
                  </div>
                  <div className="h-48 md:h-56 p-2">
                    <DashboardMockup />
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
