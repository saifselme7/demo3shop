# Portfolio audit / SAIF STORE transformation

Audit completed before application changes on `arena/01a04b30-demo3shop`.

## Existing stack

- Vite 5, React 18, TypeScript 5, Tailwind CSS 3.
- Framer Motion for viewport reveals, scroll-linked transforms, sticky project cards, mobile menu transitions, and loader exit.
- Three.js / React Three Fiber / Drei for a shader orb environment in `src/three/HeroScene.tsx`; the component existed but was not mounted by the original `HeroSection`.
- HLS.js dynamically imported for the original external hero video.
- Lucide React for UI icons.
- No router, backend, authentication, data persistence, local assets, or public directory.

## Visual and motion systems identified

| System | Original source | Transformation decision |
| --- | --- | --- |
| Scroll reveal | `src/components/FadeIn.tsx` | Kept and made shared, with reduced-motion behavior. |
| Character reveal | `src/components/AnimatedText.tsx` | Kept in the portfolio source for recoverability; storefront uses the same restrained reveal language. |
| Magnetic interaction | `src/components/Magnet.tsx` | Kept as a reusable interaction primitive. |
| Tilt hover | `src/components/TiltCard.tsx` | Kept for future editorial/admin affordances without forcing it on every card. |
| Custom pointer | `src/components/CustomCursor.tsx` | Kept for fine pointers only; touch and reduced-motion devices are not affected. |
| Loading hand-off | `src/components/Preloader.tsx` + `loader-3.tsx` | Adapted into Arabic SAIF STORE copy and monochrome colors; geometry and cinematic exit remain. |
| Particle drift | `src/components/ParticleField.tsx` | Reused in the store hero and loader with the original capped canvas approach. |
| Shader atmosphere | `src/components/AboutShaderBackground.tsx` | Reused in the editorial studio section and shifted from purple accents to charcoal/silver. |
| Scroll depth | original hero/project scroll transforms | Reinterpreted as a dark full-viewport store hero, editorial image frame, orbit lines, and structured section reveals. |
| Sticky stack | `ProjectsSection.tsx` | Not copied into repetitive product cards; product browsing prioritizes scanability and touch targets. |

## Performance observations

- The original checkout had no local assets and depended on external video/GIF/image hosts.
- The unused React Three Fiber hero scene was not mounted, but its dependencies were present. The storefront retains the source files and packages without loading that scene.
- The active shader is lazy-loaded only for the home editorial section; the admin bundle is lazy-loaded only under `/admin`.
- Product/category imagery is lazy-loaded outside the first product view and requested through resized Unsplash CDN URLs.
- `prefers-reduced-motion` is respected in CSS, Framer Motion reveals, cursor, loader, particles, drawer, and navigation transitions.

## Transformation strategy

The store is intentionally not a stock `navbar → hero → grid → footer` template. The home composition keeps the portfolio's dark cinematic opening, oversized display type, asymmetric image frame, black/off-white section hand-off, editorial copy, and purposeful motion. Commerce is introduced through a secondary layer of catalog, cart, checkout, order tracking, and private admin operations rather than by flattening the original visual language into cards.

The app has a curated local preview mode for design review. Production mode is selected automatically when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exist. The browser and proof-upload function use the publishable key only. Supabase SQL/RLS/RPCs and the `create-order` Edge Function define the live security boundary.
