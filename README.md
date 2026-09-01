# SAIF STORE

Premium fashion storefront. Arabic-first RTL clothing brand: tees, hoodies, pants, jackets, and essentials — with cinematic loading, editorial layouts, and a complete checkout flow.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app works without Supabase variables as a curated preview: products, cart, and orders are stored locally in the browser. Connect Supabase for production catalog management, secure orders, private proof storage, and the admin dashboard.

```bash
npm run typecheck
npm run build
```

## Public routes

- `/` — campaign homepage
- `/products` — full catalog, category filters, and sorting
- `/category/:slug` — category storefront
- `/product/:slug` — gallery, variants, stock, and related products
- `/cart` — persistent cart
- `/checkout` — Arabic checkout with Vodafone Cash / InstaPay proof upload
- `/success/:orderNumber` — order confirmation
- `/track` — customer-owned order tracking

The admin route is `/admin` and is not linked from the public navigation. It requires a Supabase-authenticated user whose `profiles.role` value is `admin`.

## Supabase

Run [`supabase/schema.sql`](./supabase/schema.sql) in the new project; it contains the full schema, policies, buckets, RPCs, and starter catalog. [`supabase/seed.sql`](./supabase/seed.sql) remains available as a repeatable catalog-only seed. Deployment and first-admin instructions are in [`supabase/README.md`](./supabase/README.md).

The browser only receives the public Supabase key. Order creation validates prices, totals, variants, stock, delivery, and payment method inside a server-side RPC. Screenshots go through the `create-order` Edge Function into the private `payment-proofs` bucket; admins view them through short-lived signed URLs.
