# SAIF STORE / Supabase setup

The storefront runs with a curated local preview catalog when Supabase variables are absent. For production, use the following order:

1. Create a Supabase project.
2. Run [`schema.sql`](./schema.sql) in the SQL Editor.
3. `schema.sql` includes the starter catalog. [`seed.sql`](./seed.sql) is also available as a repeatable catalog-only seed if needed.
4. Create the first owner account in **Authentication → Users**.
5. Promote that account in SQL:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'THE_AUTH_USER_UUID';
   ```

6. Deploy the proof-upload function from the repository root. It uses only the publishable key and the RLS policies in the schema:

   ```bash
   supabase functions deploy create-order
   supabase secrets set NEXT_PUBLIC_SUPABASE_URL=https://pmqhuenycudppwkumorm.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

7. Copy the project URL and publishable key into a local `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://pmqhuenycudppwkumorm.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

The `payment-proofs` bucket is private. The Edge Function validates and uploads screenshots with the publishable client under the pending-path insert policy, then calls `create_order`; the RPC verifies the uploaded object exists before it changes stock or creates an order. The admin UI requests a short-lived signed URL after the admin RLS policy authorizes the request. Customers cannot list, read, or update orders or proof files. Public tracking is handled by `get_public_order_status(order_number, phone)`, which returns only safe status data after both customer-owned values match.

Product and brand imagery use public buckets because they are storefront assets. Admin writes to those buckets are still protected by `public.is_admin()` storage policies.
