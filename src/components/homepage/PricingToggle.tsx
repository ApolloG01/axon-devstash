"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING_TIERS } from "@/lib/homepage-data";
import { BillingIntervalToggle } from "@/components/shared/billing-interval-toggle";
import { PricingCard } from "@/components/shared/pricing-card";

export default function PricingToggle() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-12">
        <BillingIntervalToggle yearly={yearly} onChange={setYearly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PRICING_TIERS.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            yearly={yearly}
            cta={
              <Link
                href="/register"
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tier.popular
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "border border-border text-foreground hover:border-muted-foreground hover:bg-muted/30"
                }`}
              >
                {tier.cta}
              </Link>
            }
          />
        ))}
      </div>
    </div>
  );
}
