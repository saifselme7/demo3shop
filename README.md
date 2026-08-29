# SAIF STORE

Premium fashion storefront evolved from Saif Selme's portfolio foundation. The experience keeps the original site's cinematic loading, scroll reveals, magnetic interactions, custom cursor, editorial scale, and purposeful transitions while adding a complete Arabic-first RTL store flow.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app intentionally works without Supabase variables as a curated preview: products, cart, and orders are stored locally in the browser. Connect Supabase for production catalog management, secure orders, private proof storage, and the admin dashboard.

```bash
npm run typecheck
npm run build
```

## Public routes

- `/` — art-directed home
- `/products` — full catalog, category filters, and sorting
- `/category/:slug` — category storefront
- `/product/:slug` — gallery, variants, stock, and related products
- `/cart` — persistent cart
- `/checkout` — Arabic checkout with Vodafone Cash / InstaPay proof upload
- `/success/:orderNumber` — order confirmation
- `/track` — customer-owned order tracking

The admin route is `/admin` and is not linked from the public navigation. It requires a Supabase-authenticated user whose `profiles.is_admin` value is `true`.

## Supabase

Run [`supabase/schema.sql`](./supabase/schema.sql), then [`supabase/seed.sql`](./supabase/seed.sql). Deployment and first-admin instructions are in [`supabase/README.md`](./supabase/README.md).

The browser only receives the public Supabase key. Order creation validates prices, totals, variants, stock, delivery, and payment method inside a server-side RPC. Screenshots go through the `create-order` Edge Function into the private `payment-proofs` bucket; admins view them through short-lived signed URLs.

## Design notes

- Monochrome black / white / warm off-white identity with grayscale fashion imagery.
- Arabic Egyptian copy and RTL layout are the default.
- Framer Motion powers controlled reveals and transitions; `prefers-reduced-motion` is respected across the storefront.
- Images are lazy-loaded outside the first view, and the original loader/particle/shader systems are retained or adapted rather than replaced with generic template animation.
