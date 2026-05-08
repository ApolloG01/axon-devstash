# Homepage Spec

## Overview

Convert the standalone HTML prototype at `@prototypes/homepage` into a Next.js page at `/` (root). Use Tailwind CSS v4 and shadcn/ui components to match the rest of the app.

## Requirements

- Root route `/` serves the homepage (not `/dashboard` redirect)
- Public page (no auth required)
- All sections: hero, features, AI section, pricing, CTA, footer
- Smooth scroll animations on element entry
- Responsive design (mobile-first, tested on 320px, 768px, 1440px)
- All buttons and links route to correct destinations
- Use `#` links for internal navigation (Features, Pricing)

## Component Structure

### Server Components

- `src/app/page.tsx` - Root page, fetches no data
- `src/components/homepage/Navbar.tsx` - Fixed top nav with scroll detection
- `src/components/homepage/Hero.tsx` - Hero section with animated chaos icons
- `src/components/homepage/Features.tsx` - 6-card feature grid
- `src/components/homepage/AISection.tsx` - Pro features showcase
- `src/components/homepage/Pricing.tsx` - Free vs Pro cards with yearly toggle
- `src/components/homepage/CTA.tsx` - Final call-to-action
- `src/components/homepage/Footer.tsx` - Footer with links

### Client Components

- `src/components/homepage/ChaosAnimation.tsx` - Icon drift, bounce, mouse repel via `requestAnimationFrame`
- `src/components/homepage/PricingToggle.tsx` - Monthly/yearly price toggle
- `src/components/homepage/ScrollAnimation.tsx` - Fade-in trigger on Intersection Observer

## Key Implementation Notes

- **Dark theme by default**: Use `bg-slate-950`, `text-slate-200`, etc. Match dashboard palette.
- **Blue accent color**: `#3b82f6` (from snippets type) for primary buttons, links, accents.
- **Gradients**: Use Tailwind gradient stops; hero heading gradient goes blue → light-blue.
- **Icons**: Use lucide-react for feature card icons (Code, Sparkles, Terminal, etc.).
- **Animation**:
  - Chaos icons: Animate with JS, no CSS-only (needs mouse tracking).
  - Scroll reveal: Use Intersection Observer to add `opacity-100 translate-y-0` on entry.
  - Arrow pulse: Simple CSS keyframe animation.
- **Buttons**: Use shadcn Button component; style as `variant="default"` (primary) or `variant="outline"`.
- **Responsive**:
  - Hero visual stacks vertically on `md:` breakpoint.
  - Features grid: 3 columns on desktop, 2 on tablet, 1 on mobile.
  - Arrow rotates 90° on mobile.

## Routes & Navigation

| Link                   | Destination          | Auth Required |
| ---------------------- | -------------------- | ------------- |
| Logo, "Home"           | `/`                  | No            |
| "Features" nav link    | `#features` (scroll) | No            |
| "Pricing" nav link     | `#pricing` (scroll)  | No            |
| "Sign In" button       | `/sign-in`           | No            |
| "Get Started" buttons  | `/sign-up`           | No            |
| Footer links (Product) | Placeholder `#`      | No            |

## Files to Create

1. `src/app/page.tsx` - Root page
2. `src/components/homepage/Navbar.tsx`
3. `src/components/homepage/Hero.tsx`
4. `src/components/homepage/ChaosAnimation.tsx`
5. `src/components/homepage/Features.tsx`
6. `src/components/homepage/AISection.tsx`
7. `src/components/homepage/Pricing.tsx`
8. `src/components/homepage/PricingToggle.tsx`
9. `src/components/homepage/CTA.tsx`
10. `src/components/homepage/Footer.tsx`
11. `src/components/homepage/ScrollAnimation.tsx`
12. `src/lib/homepage-data.ts` - Feature cards, pricing tiers, footer links

## Data Structure

`src/lib/homepage-data.ts` exports:

```typescript
export const FEATURES = [
  { title: "Code Snippets", description: "...", icon: "Code", accent: "#3b82f6" },
  // ...
];

export const PRICING_TIERS = {
  free: { name, price, features: [] },
  pro: { name, price, features: [], popular: true },
};

export const FOOTER_LINKS = {
  product: [{ label, href }, ...],
  resources: [...],
  company: [...],
};
```

## Testing Checklist

- [ ] Root `/` loads without redirect
- [ ] All internal links (`#features`, `#pricing`) scroll smoothly
- [ ] Chaos icons animate on hover and drift
- [ ] Pricing toggle updates both price and yearly note
- [ ] Buttons route to `/sign-in`, `/sign-up` correctly
- [ ] Responsive: Test at 320px, 768px, 1440px
- [ ] Scroll animations trigger when elements enter viewport

## References

- @prototypes/homepage/index.html - Design reference
- @prototypes/homepage/styles.css - Color palette, layout
- @context/project-overview.md - Brand guidelines
- @context/coding-standards.md - Next.js/React patterns
