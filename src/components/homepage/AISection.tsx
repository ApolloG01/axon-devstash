import ScrollAnimation from "./ScrollAnimation";
import { MacOsDots } from "@/components/shared/macos-dots";

function CodeMockup() {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#2a2a2a] bg-[#1c1c1c]">
        <MacOsDots />
        <span className="text-xs text-[#525252] ml-2 font-mono">useDebounce.ts</span>
      </div>

      {/* Code */}
      <div className="p-5 font-mono text-xs leading-6 overflow-x-auto">
        <div>
          <span className="text-[#c678dd]">import</span>
          <span className="text-[#e5e5e5]">{" { "}</span>
          <span className="text-[#61afef]">useState</span>
          <span className="text-[#e5e5e5]">, </span>
          <span className="text-[#61afef]">useEffect</span>
          <span className="text-[#e5e5e5]">{" } "}</span>
          <span className="text-[#c678dd]">from</span>
          <span className="text-[#98c379]">{" 'react'"}</span>
        </div>
        <div className="h-3" />
        <div>
          <span className="text-[#c678dd]">export function </span>
          <span className="text-[#61afef]">useDebounce</span>
          <span className="text-[#e5e5e5]">{"<"}</span>
          <span className="text-[#e5c07b]">T</span>
          <span className="text-[#e5e5e5]">{">("}</span>
        </div>
        <div className="ml-4">
          <span className="text-[#e06c75]">value</span>
          <span className="text-[#e5e5e5]">: </span>
          <span className="text-[#e5c07b]">T</span>
          <span className="text-[#e5e5e5]">,</span>
        </div>
        <div className="ml-4">
          <span className="text-[#e06c75]">delay</span>
          <span className="text-[#e5e5e5]">: </span>
          <span className="text-[#e5c07b]">number</span>
        </div>
        <div>
          <span className="text-[#e5e5e5]">{"): "}</span>
          <span className="text-[#e5c07b]">T</span>
          <span className="text-[#e5e5e5]">{" {"}</span>
        </div>
        <div className="ml-4">
          <span className="text-[#c678dd]">const </span>
          <span className="text-[#e5e5e5]">{"["}</span>
          <span className="text-[#e06c75]">debounced</span>
          <span className="text-[#e5e5e5]">, </span>
          <span className="text-[#e06c75]">setDebounced</span>
          <span className="text-[#e5e5e5]">{"]"}</span>
        </div>
        <div className="ml-8">
          <span className="text-[#e5e5e5]">{"= "}</span>
          <span className="text-[#61afef]">useState</span>
          <span className="text-[#e5e5e5]">{"<"}</span>
          <span className="text-[#e5c07b]">T</span>
          <span className="text-[#e5e5e5]">{">(value)"}</span>
        </div>
      </div>

      {/* AI tag strip */}
      <div className="border-t border-[#2a2a2a] bg-[#0f1117] px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#f59e0b] text-xs">✦</span>
          <span className="text-xs text-[#a3a3a3] font-medium">AI Generated Tags</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "react", color: "#3b82f6" },
            { label: "hooks", color: "#f59e0b" },
            { label: "performance", color: "#22c55e" },
            { label: "typescript", color: "#6366f1" },
            { label: "utility", color: "#06b6d4" },
          ].map((tag) => (
            <span
              key={tag.label}
              className="text-xs font-mono px-2 py-0.5 rounded border"
              style={{ color: tag.color, borderColor: `${tag.color}40` }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const AI_FEATURES = [
  {
    title: "Auto-Tag Suggestions",
    description: "AI reads your content and suggests the most relevant tags automatically",
  },
  {
    title: "Code Explanation",
    description: "Understand any snippet instantly — from a one-liner to a complex algorithm",
  },
  {
    title: "Prompt Optimizer",
    description: "Improve your AI prompts with GPT-powered suggestions and rewrites",
  },
  {
    title: "AI Summaries",
    description: "Get concise summaries of long notes, docs, and pasted content",
  },
];

export default function AISection() {
  return (
    <section id="ai" className="py-24 bg-[#0a0a0a] border-y border-[#1c1c1c]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <ScrollAnimation>
            <div className="inline-flex items-center gap-2 text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/25 px-3 py-1.5 rounded-full mb-5 font-medium">
              ✦ Pro Feature
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#e5e5e5] mb-4">
              Let AI Do the Heavy Lifting
            </h2>
            <p className="text-[#a3a3a3] text-sm sm:text-base leading-relaxed mb-8">
              DevStash Pro includes powerful AI features to help you organize,
              understand, and optimize your knowledge base.
            </p>

            <ul className="space-y-5">
              {AI_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center text-xs shrink-0">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#e5e5e5]">{f.title}</p>
                    <p className="text-sm text-[#a3a3a3] mt-0.5">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollAnimation>

          {/* Right */}
          <ScrollAnimation delay={150}>
            <CodeMockup />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
