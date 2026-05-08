import Link from "next/link";
import ScrollAnimation from "./ScrollAnimation";

export default function CTA() {
  return (
    <section className="bg-[#0a0a0a] border-t border-[#1c1c1c] py-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <ScrollAnimation>
          <div className="relative text-center rounded-2xl border border-[#2a2a2a] bg-[#111] px-8 py-16 overflow-hidden">
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 50%, #3b82f618 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            <h2 className="relative text-3xl sm:text-4xl font-bold text-[#e5e5e5] mb-4">
              Ready to Organize
              <br />
              Your Knowledge?
            </h2>
            <p className="relative text-[#a3a3a3] text-sm sm:text-base mb-8 max-w-md mx-auto">
              Join thousands of developers who stopped losing their best code,
              prompts, and ideas.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-7 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium rounded-lg transition-colors text-sm"
              >
                Get Started Free
              </Link>
              <span className="text-xs text-[#525252]">No credit card required</span>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
