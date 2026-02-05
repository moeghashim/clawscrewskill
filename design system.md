# Technical Minimalist Design System - Mission Control Dashboard

## Page Overview
Multi-page technical dashboard system with:
1. Landing page: Technical Minimalist mosaic and hero section
2. Mission Control: 3-column ops dashboard (navigation, 5-column kanban, live feed)

## Color Palette
- Paper (Background): #F7F7F5
- Forest Green (Primary): #1A3C2B
- Grid (Hairlines): #3A3A38 at 20% opacity
- Coral (Accent 1 - Critical/Alerts): #FF8C69
- Mint (Accent 2 - Success/Active): #9EFFBF
- Gold (Accent 3 - Warnings): #F4D35E

## Typography
- Headings: Space Grotesk, 700 weight, tight tracking, line-height 0.85-0.9
- H1: 64px-96px, text-[7xl] to text-[9xl]
- H2/H3: 32px-48px, text-[3xl] to text-[5xl]
- Dashboard titles: 14px font-bold tracking-tight uppercase
- Body: General Sans, 400-600 weights
- Paragraph: 14-16px, line-height 1.6
- Task descriptions: 12px, line-height 1.4
- Technical/Labels: JetBrains Mono, 400-500 weights
- Labels: 10px-12px, uppercase, tracking 0.1em-0.2em
- Monospaced text: 10-12px, line-height 1.6

## Design Principles
- Aesthetic: Technical Minimalist, flat, 2D, no shadows
- Borders: 1px hairlines (#3A3A38 at 20% opacity) for all dividers
- Border Radius: 0px or 2px (sm) only
- Spacing: Generous negative space with 32px padding baseline
- Micro-interactions: Linear ease-out curves, snappy 0.1s transitions
- Images: mix-blend-luminosity at 90% opacity, full color on hover

# Technical Minimalist Design System

## Color Palette
- Paper (Background): #F7F7F5
- Forest Green (Primary): #1A3C2B
- Grid (Hairlines): #3A3A38 at 20% opacity
- Coral (Accent 1): #FF8C69
- Mint (Accent 2): #9EFFBF
- Gold (Accent 3): #F4D35E

## Typography
- Headings: Space Grotesk, 700 weight, tight tracking, line-height 0.85-0.9
- H1: 64px-96px, text-[7xl] to text-[9xl]
- H2/H3: 32px-48px, text-[3xl] to text-[5xl]
- Body: General Sans, 400-600 weights
- Paragraph: 14-16px, line-height 1.6
- Technical/Labels: JetBrains Mono, 400-500 weights
- Labels: 10px-12px, uppercase, tracking 0.1em-0.2em
- Monospaced text: 10-12px, line-height 1.6

## Design Principles
- Aesthetic: Technical Minimalist, flat, 2D, no shadows
- Borders: 1px hairlines (#3A3A38 at 20% opacity) for all dividers
- Border Radius: 0px or 2px (sm) only
- Spacing: Generous negative space with 32px padding baseline
- Micro-interactions: Linear ease-out curves, snappy 0.1s transitions
- Images: mix-blend-luminosity at 90% opacity, full color on hover

## Reusable Components

### Navigation Bar
```html
<nav class="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between">
  <div class="flex items-center gap-12">
    <div class="w-8 h-8 bg-[#1A3C2B] rounded-sm flex items-center justify-center">
      <div class="w-4 h-4 border-2 border-white rotate-45"></div>
    </div>
    <div class="hidden md:flex gap-8 font-mono text-[10px] tracking-[0.15em] uppercase">
      <a id="nav-01" href="#" class="hover:text-coral transition-colors">01 Solutions</a>
      <a id="nav-02" href="#" class="hover:text-mint transition-colors">02 Infrastructure</a>
      <a id="nav-03" href="#" class="hover:text-gold transition-colors">03 Protocol</a>
    </div>
  </div>
  <div class="flex items-center gap-4 font-mono text-[10px] tracking-[0.1em] uppercase">
    <button id="nav-ghost" class="px-4 py-2 border border-transparent hover:border-[#1A3C2B] transition-all duration-150">Technical Docs</button>
    <button id="nav-cta" class="bg-[#1A3C2B] text-white px-6 py-2 rounded-sm btn-snappy">Deploy Node</button>
  </div>
</nav>
```

### Status Badge
```html
<div class="inline-flex items-center gap-2 border border-[#3A3A38]/20 px-2 py-1">
  <span class="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
  <span class="font-mono text-[10px] uppercase tracking-wider">System Status: Operational</span>
</div>
```

### Bento Feature Grid
```html
<section class="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#3A3A38]/20 border border-[#3A3A38]/20">
  <!-- Feature Card -->
  <div class="bg-[#F7F7F5] p-10 flex flex-col justify-between border-l-4 border-mint h-80">
    <div>
      <span class="font-mono text-[10px] uppercase tracking-widest text-[#3A3A38]/60">Module_01</span>
      <h3 class="font-space text-3xl mt-4 leading-none uppercase">Deterministic<br/>Processing</h3>
    </div>
    <div class="bg-white border border-[#3A3A38]/10 p-4 rounded-sm">
      <pre class="font-mono text-[11px] text-[#1A3C2B]/80 overflow-hidden">
        <code>fn main() { let system = Kernel::init(); system.execute_task(T_001); }</code>
      </pre>
    </div>
  </div>
</section>
```

### Network Topology Graph
```html
<div class="relative w-[400px] h-[400px] flex items-center justify-center">
  <!-- Orbiting Rings -->
  <div class="absolute w-full h-full border border-dashed border-[#3A3A38]/20 rounded-full"></div>
  <div class="absolute w-2/3 h-2/3 border border-dashed border-[#3A3A38]/20 rounded-full"></div>

  <!-- Center Node -->
  <div class="w-12 h-12 bg-[#1A3C2B] rounded-sm flex items-center justify-center z-20">
    <div class="w-6 h-6 border border-white/40 rotate-12"></div>
  </div>

  <!-- Orbiting Nodes -->
  <div class="absolute orbiting-node" style="animation-delay: -5s;">
    <div class="w-3 h-3 bg-coral rounded-sm"></div>
  </div>
  <div class="absolute orbiting-node" style="animation-delay: -12s; animation-duration: 25s;">
    <div class="w-3 h-3 bg-mint rounded-sm"></div>
  </div>
  <div class="absolute orbiting-node" style="animation-delay: -18s; animation-duration: 15s;">
    <div class="w-3 h-3 bg-gold rounded-sm"></div>
  </div>

  <!-- Connection Lines -->
  <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 400">
    <line x1="200" y1="200" x2="100" y2="100" stroke="#1A3C2B" stroke-width="1" />
    <line x1="200" y1="200" x2="320" y2="150" stroke="#1A3C2B" stroke-width="1" />
    <line x1="200" y1="200" x2="240" y2="340" stroke="#1A3C2B" stroke-width="1" />
  </svg>
</div>

<style>
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  .orbiting-node { animation: orbit 20s linear infinite; }
</style>
```

### Testimonial Card
```html
<div class="border border-[#3A3A38]/20 p-8 flex flex-col h-full bg-[#F7F7F5]">
  <iconify-icon icon="ri:double-quotes-l" class="text-2xl text-coral mb-6"></iconify-icon>
  <p class="font-mono text-xs leading-relaxed flex-grow">
    "THE SYSTEM INTEGRITY REMAINS UNCOMPROMISED UNDER EXTREME LOAD. CORE ARCHITECTURE IS REMARKABLY EFFICIENT FOR HIGH-FREQUENCY OPERATIONS."
  </p>
  <div class="mt-8 pt-6 border-t border-[#3A3A38]/10">
    <div class="flex text-gold text-xs mb-2">
      <iconify-icon icon="material-symbols:star"></iconify-icon>
      <iconify-icon icon="material-symbols:star"></iconify-icon>
      <iconify-icon icon="material-symbols:star"></iconify-icon>
      <iconify-icon icon="material-symbols:star"></iconify-icon>
      <iconify-icon icon="material-symbols:star"></iconify-icon>
    </div>
    <span class="block font-mono text-[10px] uppercase font-bold tracking-widest">DR. ELIAS VANCE</span>
    <span class="block font-mono text-[9px] opacity-40">CTO @ NEURALCORE</span>
  </div>
</div>
```

### Technical Form CTA
```html
<div class="relative w-full max-w-[640px] border border-[#3A3A38]/40 p-12 bg-white">
  <!-- L-shaped corner markers -->
  <div class="corner-marker top-0 left-0 border-t border-l"></div>
  <div class="corner-marker top-0 right-0 border-t border-r"></div>
  <div class="corner-marker bottom-0 left-0 border-b border-l"></div>
  <div class="corner-marker bottom-0 right-0 border-b border-r"></div>

  <div class="text-center mb-10">
    <h2 class="font-space text-5xl uppercase tracking-tighter mb-4">Request Terminal Access</h2>
    <p class="font-mono text-[10px] opacity-60 tracking-[0.2em]">VALID_CREDENTIALS_REQUIRED</p>
  </div>

  <form class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="font-mono text-[10px] uppercase opacity-60 tracking-wider">System.User.Identify()</label>
        <input type="text" placeholder="Full Name" class="w-full bg-white border border-[#3A3A38]/20 px-4 py-3 font-mono text-xs focus:outline-none focus:border-[#1A3C2B] transition-colors rounded-[2px]">
      </div>
      <div class="space-y-2">
        <label class="font-mono text-[10px] uppercase opacity-60 tracking-wider">Network.Address.Get()</label>
        <input type="email" placeholder="Email Address" class="w-full bg-white border border-[#3A3A38]/20 px-4 py-3 font-mono text-xs focus:outline-none focus:border-[#1A3C2B] transition-colors rounded-[2px]">
      </div>
    </div>
    <div class="space-y-2">
      <label class="font-mono text-[10px] uppercase opacity-60 tracking-wider">Message.Buffer.Write()</label>
      <textarea rows="4" placeholder="Initial Project Scope" class="w-full bg-white border border-[#3A3A38]/20 px-4 py-3 font-mono text-xs focus:outline-none focus:border-[#1A3C2B] transition-colors rounded-[2px] resize-none"></textarea>
    </div>
    <button type="submit" class="w-full bg-[#1A3C2B] text-white py-4 font-mono text-[12px] uppercase tracking-[0.2em] rounded-[2px]">
      Initialize_Connection_Request
    </button>
  </form>
</div>

<style>
  .corner-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-color: #1A3C2B;
  }
</style>
```

### Footer
```html
<footer class="px-8 py-12 border-t border-[#3A3A38]/10">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
    <div>
      <div class="flex items-center gap-4 mb-4">
        <div class="w-6 h-6 bg-[#1A3C2B]"></div>
        <span class="font-space text-2xl tracking-tighter uppercase">Future Infrastructure</span>
      </div>
      <p class="font-mono text-[10px] opacity-40 max-w-xs uppercase">
        All rights reserved © 2024. Designed for high-frequency operations. Zero latency guaranteed.
      </p>
    </div>
    <div class="flex gap-12 font-mono text-[10px] uppercase tracking-widest">
      <div class="flex flex-col gap-2">
        <span class="opacity-30 mb-2">Connect</span>
        <a href="#" class="hover:text-coral">GitHub</a>
        <a href="#" class="hover:text-mint">Twitter/X</a>
      </div>
      <div class="flex flex-col gap-2">
        <span class="opacity-30 mb-2">Resources</span>
        <a href="#" class="hover:text-gold">Whitepaper</a>
        <a href="#" class="hover:text-mint">Network Status</a>
      </div>
    </div>
  </div>
</footer>
```

## CSS Animations & Utilities

### Orbit Animation
```css
@keyframes orbit {
  from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
}
.orbiting-node { animation: orbit 20s linear infinite; }
.btn-snappy { transition: transform 0.1s linear, background-color 0.1s linear; }
.btn-snappy:active { transform: scale(0.98); }
.image-luminosity { mix-blend-mode: luminosity; opacity: 0.9; transition: all 0.3s ease-out; }
.image-luminosity:hover { mix-blend-mode: normal; opacity: 1; }
```

## Fonts to Load
- Space Grotesk (Google Fonts): @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
- JetBrains Mono (Google Fonts): @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap');
- General Sans (Fontshare): @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap');

## Visual Identity Summary
A sophisticated Technical Minimalist system that emphasizes structural precision, computational aesthetics, and clean hierarchy. The design leverages extreme negative space, monospaced typography for technical credibility, and strategic color accents (Coral, Mint, Gold) to highlight key elements. All UI elements use flat geometry, hairline borders, and snappy interactions to convey high-performance infrastructure excellence. Perfect for SaaS platforms, developer tools, distributed systems, and fintech applications.
