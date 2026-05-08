"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING_TIERS } from "@/lib/homepage-data";

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={`text-sm font-medium transition-colors ${
            !yearly ? "text-[#e5e5e5]" : "text-[#525252]"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            yearly ? "bg-[#3b82f6]" : "bg-[#2a2a2a]"
          }`}
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle billing period"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              yearly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium flex items-center gap-2 transition-colors ${
            yearly ? "text-[#e5e5e5]" : "text-[#525252]"
          }`}
        >
          Yearly
          <span className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded-full border border-[#3b82f6]/30">
            Save 25%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-xl border p-7 flex flex-col ${
              tier.popular
                ? "border-[#3b82f6]/60 bg-[#3b82f6]/5"
                : "border-[#2a2a2a] bg-[#141414]"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs font-semibold bg-[#3b82f6] text-white px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className="text-sm font-medium text-[#a3a3a3] mb-3">{tier.name}</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[#a3a3a3] text-lg">$</span>
                <span className="text-4xl font-bold text-[#e5e5e5]">
                  {yearly ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span className="text-[#525252] text-sm mb-1">/month</span>
              </div>
              {tier.popular && (
                <p
                  className={`text-xs transition-opacity duration-200 ${
                    yearly ? "text-[#3b82f6] opacity-100" : "opacity-0"
                  }`}
                >
                  Billed ${tier.yearlyTotal}/year — 2 months free
                </p>
              )}
              <p className="text-sm text-[#a3a3a3] mt-3">{tier.description}</p>
            </div>

            <ul className="space-y-2.5 mb-7 flex-1">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm">
                  {f.ai ? (
                    <span className="text-[#f59e0b] text-xs">✦</span>
                  ) : f.included ? (
                    <span className="text-[#22c55e] text-sm">✓</span>
                  ) : (
                    <span className="text-[#525252] text-sm">✕</span>
                  )}
                  <span className={f.included ? "text-[#e5e5e5]" : "text-[#525252]"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tier.popular
                  ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                  : "border border-[#333] text-[#e5e5e5] hover:border-[#555] hover:bg-[#1c1c1c]"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
