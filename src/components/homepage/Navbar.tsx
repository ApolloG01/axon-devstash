"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LogoMark = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#3b82f6" strokeWidth="1.8" fill="#3b82f615" />
    <path d="M12 8v8M8 10l4-2 4 2" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#2a2a2a]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1140px] mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[#e5e5e5] hover:text-white transition-colors"
        >
          <LogoMark />
          Axon - DevStash
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5] px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#141414] border-b border-[#2a2a2a] px-6 py-5 flex flex-col gap-4">
          <a
            href="#features"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5]"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5]"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </a>
          <Link
            href="/sign-in"
            className="text-sm text-[#a3a3a3] hover:text-[#e5e5e5]"
            onClick={() => setMobileOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#3b82f6] text-white px-4 py-2.5 rounded-lg text-center font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
