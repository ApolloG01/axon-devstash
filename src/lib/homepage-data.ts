export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
  accent: string;
  tag: string;
};

export const FEATURES: FeatureItem[] = [
  {
    title: "Code Snippets",
    description: "Save reusable code with syntax highlighting. Monaco editor with language detection built in.",
    icon: "Code",
    accent: "#3b82f6",
    tag: "snippet",
  },
  {
    title: "AI Prompts",
    description: "Build a library of battle-tested prompts. Access them instantly when you need AI assistance.",
    icon: "Sparkles",
    accent: "#f59e0b",
    tag: "prompt",
  },
  {
    title: "Instant Search",
    description: "Find anything in milliseconds with full-text search and Cmd+K command palette across all items.",
    icon: "Search",
    accent: "#6366f1",
    tag: "⌘K search",
  },
  {
    title: "Commands",
    description: "Store CLI commands, git aliases, and shell scripts. Never search bash history again.",
    icon: "Terminal",
    accent: "#06b6d4",
    tag: "command",
  },
  {
    title: "Files & Docs",
    description: "Upload context files, templates, and documentation. Images with gallery view included.",
    icon: "FileText",
    accent: "#64748b",
    tag: "file · image",
  },
  {
    title: "Collections",
    description: "Group related items into collections. One item can belong to multiple collections.",
    icon: "FolderOpen",
    accent: "#22c55e",
    tag: "collections",
  },
];

export type PricingFeature = { label: string; included: boolean; ai?: boolean };

export type PricingTier = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyTotal: number;
  description: string;
  features: PricingFeature[];
  cta: string;
  popular: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyTotal: 0,
    description: "Perfect for getting started and organizing your most-used snippets.",
    features: [
      { label: "50 items total", included: true },
      { label: "3 collections", included: true },
      { label: "All text-based types", included: true },
      { label: "Basic search", included: true },
      { label: "Tags & favorites", included: true },
      { label: "File uploads", included: false },
      { label: "Image uploads", included: false },
      { label: "AI features", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 8,
    yearlyPrice: 6,
    yearlyTotal: 72,
    description: "For developers who want to harness their full knowledge potential with AI.",
    features: [
      { label: "Unlimited items", included: true },
      { label: "Unlimited collections", included: true },
      { label: "All item types", included: true },
      { label: "Full-text search", included: true },
      { label: "Tags, favorites & pins", included: true },
      { label: "File uploads (10 MB)", included: true },
      { label: "Image uploads (5 MB)", included: true },
      { label: "All AI features", included: true, ai: true },
    ],
    cta: "Start Pro Free",
    popular: true,
  },
];

export type FooterLink = { label: string; href: string };

export const FOOTER_LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ],
};
