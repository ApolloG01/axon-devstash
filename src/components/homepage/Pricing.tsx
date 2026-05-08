import ScrollAnimation from "./ScrollAnimation";
import PricingToggle from "./PricingToggle";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#0d0d0d] py-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <ScrollAnimation className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#e5e5e5] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[#a3a3a3] text-sm sm:text-base">
            Start free. Upgrade when you need more power.
          </p>
        </ScrollAnimation>

        <PricingToggle />
      </div>
    </section>
  );
}
