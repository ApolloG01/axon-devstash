import {
  Code,
  Sparkles,
  Search,
  Terminal,
  FileText,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import { FEATURES } from "@/lib/homepage-data";
import ScrollAnimation from "./ScrollAnimation";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Search,
  Terminal,
  FileText,
  FolderOpen,
};

export default function Features() {
  return (
    <section id="features" className="bg-[#0d0d0d] py-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <ScrollAnimation className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#e5e5e5] mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-[#a3a3a3] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Organize all your developer knowledge across 7 specialized item types
            with collections, tags, and instant search.
          </p>
        </ScrollAnimation>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <ScrollAnimation key={feature.title} delay={i * 60}>
                <div
                  className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 hover:border-[#333] transition-colors h-full"
                  style={{ borderTopColor: `${feature.accent}30` }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${feature.accent}15`,
                      color: feature.accent,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <h3 className="text-[#e5e5e5] font-semibold mb-2 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-[#a3a3a3] text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Tag */}
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded border"
                    style={{
                      color: feature.accent,
                      borderColor: `${feature.accent}30`,
                    }}
                  >
                    {feature.tag}
                  </span>
                </div>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </section>
  );
}
