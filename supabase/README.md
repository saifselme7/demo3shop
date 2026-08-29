# SAIF STORE / Supabase setup

The storefront runs with a curated local preview catalog when Supabase variables are absent. For production, use the following order:

1. Create a Supabase project.
2. Run [`schema.sql`](./schema.sql) in the SQL Editor.
3. Run [`seed.sql`](./seed.sql) once to add the starter catalog.
4. Create the first owner account in **Authentication → Users**.
5. Promote that account in SQL:

   ```sql
   update public.profiles
   set is_admin = true
   where id = 'THE_AUTH_USER_UUID';
   ```

6. Deploy the proof-upload function from the repository root:

   ```bash
   supabase functions deploy create-order
   ```

   Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the function runtime. Never copy the service role key into the Vite app.

7. Copy the project URL and publishable/anon key into a local `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```

The `payment-proofs` bucket is private. The Edge Function uploads screenshots with the service role and the admin UI requests a short-lived signed URL after the admin RLS policy authorizes the request. Customers cannot list, read, or update orders or proof files. Public tracking is handled by `get_public_order_status(order_number, phone)`, which returns only safe status data after both customer-owned values match.

Product and brand imagery use public buckets because they are storefront assets. Admin writes to those buckets are still protected by `public.is_admin()` storage policies.
