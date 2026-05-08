import Navbar from "@/components/homepage/Navbar";
import Hero from "@/components/homepage/Hero";
import Features from "@/components/homepage/Features";
import AISection from "@/components/homepage/AISection";
import Pricing from "@/components/homepage/Pricing";
import CTA from "@/components/homepage/CTA";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#0d0d0d] min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AISection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
