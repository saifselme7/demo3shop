-- SAIF STORE / complete production schema
-- Run this file in the new Supabase project's SQL editor. It creates the schema,
-- security policies, storage buckets, RPCs, and starter catalog.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on update cascade on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0),
  old_price integer check (old_price is null or old_price >= price),
  discount_percent integer check (discount_percent is null or discount_percent between 0 and 100),
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key default 'store' check (id = 'store'),
  store_name text not null default 'SAIF STORE',
  logo_url text not null default '',
  contact_phone text not null default '',
  whatsapp_number text not null default '',
  vodafone_cash_number text not null default '',
  instapay_number text not null default '',
  delivery_fee integer not null default 75 check (delivery_fee >= 0),
  hero_title text not null default 'اللبس اللي يشبهك.',
  hero_subtitle text not null default '',
  promo_text text not null default '',
  store_description text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  notes text,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total = subtotal + delivery_fee),
  payment_method text not null check (payment_method in ('vodafone_cash', 'instapay')),
  transfer_phone text not null,
  payment_proof_path text check (payment_proof_path is null or payment_proof_path like 'pending/%'),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected')),
  payment_rejection_reason text,
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  created_at timestamptz not null default now()
);

create index if not exists categories_active_order_idx on public.categories (is_active, sort_order);
create index if not exists products_category_active_order_idx on public.products (category_id, is_active, sort_order);
create index if not exists products_featured_idx on public.products (is_featured, is_active);
create index if not exists product_images_product_order_idx on public.product_images (product_id, sort_order);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_order_status_idx on public.orders (order_status);
create index if not exists order_items_order_idx on public.order_items (order_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.email, 'عميل'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

-- Order numbers are generated on the server, never trusted from the browser.
create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'SAIF-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_order_number on public.orders;
create trigger orders_order_number before insert on public.orders for each row execute procedure public.set_order_number();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select on public.categories for select using (is_active or public.is_admin());
drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories for insert to authenticated with check (public.is_admin());
drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories for delete to authenticated using (public.is_admin());

drop policy if exists products_public_select on public.products;
create policy products_public_select on public.products for select using ((is_active and exists (select 1 from public.categories c where c.id = category_id and c.is_active)) or public.is_admin());
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products for delete to authenticated using (public.is_admin());

drop policy if exists product_images_public_select on public.product_images;
create policy product_images_public_select on public.product_images for select using (exists (select 1 from public.products p join public.categories c on c.id = p.category_id where p.id = product_id and ((p.is_active and c.is_active) or public.is_admin())));
drop policy if exists product_images_admin_insert on public.product_images;
create policy product_images_admin_insert on public.product_images for insert to authenticated with check (public.is_admin());
drop policy if exists product_images_admin_update on public.product_images;
create policy product_images_admin_update on public.product_images for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists product_images_admin_delete on public.product_images;
create policy product_images_admin_delete on public.product_images for delete to authenticated using (public.is_admin());

drop policy if exists settings_public_select on public.store_settings;
create policy settings_public_select on public.store_settings for select using (true);
drop policy if exists settings_admin_insert on public.store_settings;
create policy settings_admin_insert on public.store_settings for insert to authenticated with check (public.is_admin());
drop policy if exists settings_admin_update on public.store_settings;
create policy settings_admin_update on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select on public.orders for select to authenticated using (public.is_admin());
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists order_items_admin_select on public.order_items;
create policy order_items_admin_select on public.order_items for select to authenticated using (public.is_admin());

-- Live checkout reaches this RPC only through the server-side Edge Function.
-- Prices, delivery, stock, variants, totals, and the payment method are all validated here.
create or replace function public.create_order(p_order jsonb)
returns table (
  id uuid,
  order_number text,
  subtotal integer,
  delivery_fee integer,
  total integer,
  payment_method text,
  payment_status text,
  order_status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_name text := nullif(trim(p_order ->> 'customer_name'), '');
  v_phone text := regexp_replace(regexp_replace(coalesce(p_order ->> 'phone', ''), '[^0-9]', '', 'g'), '^20', '');
  v_email text := nullif(trim(p_order ->> 'email'), '');
  v_address text := nullif(trim(p_order ->> 'address'), '');
  v_notes text := nullif(trim(p_order ->> 'notes'), '');
  v_payment_method text := p_order ->> 'payment_method';
  v_transfer_phone text := regexp_replace(regexp_replace(coalesce(p_order ->> 'transfer_phone', ''), '[^0-9]', '', 'g'), '^20', '');
  v_proof_path text := nullif(trim(p_order ->> 'payment_proof_path'), '');
  v_payment_destination text;
  v_subtotal integer := 0;
  v_delivery_fee integer := 0;
  v_order public.orders%rowtype;
  v_product public.products%rowtype;
  v_item record;
begin
  if v_customer_name is null or char_length(v_customer_name) < 3 then raise exception 'الاسم مطلوب'; end if;
  if v_address is null or char_length(v_address) < 10 then raise exception 'العنوان مطلوب'; end if;
  if v_phone !~ '^01[0125][0-9]{8}$' then raise exception 'رقم الموبايل غير صحيح'; end if;
  if v_transfer_phone !~ '^01[0125][0-9]{8}$' then raise exception 'رقم التحويل غير صحيح'; end if;
  if v_payment_method not in ('vodafone_cash', 'instapay') then raise exception 'طريقة الدفع غير صحيحة'; end if;
  select case when v_payment_method = 'vodafone_cash' then nullif(trim(store_settings.vodafone_cash_number), '') else nullif(trim(store_settings.instapay_number), '') end
    into v_payment_destination from public.store_settings where store_settings.id = 'store';
  if v_payment_destination is null then raise exception 'طريقة الدفع دي مش متاحة دلوقتي'; end if;
  if v_proof_path is null then raise exception 'إثبات الدفع مطلوب'; end if;
  if v_proof_path not like 'pending/%' then raise exception 'إثبات الدفع غير صحيح'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'payment-proofs' and name = v_proof_path) then raise exception 'إثبات الدفع غير موجود'; end if;
  if coalesce(jsonb_typeof(p_order -> 'items'), '') <> 'array' or coalesce(jsonb_array_length(p_order -> 'items'), 0) = 0 then raise exception 'السلة فاضية'; end if;

  for v_item in select * from jsonb_to_recordset(p_order -> 'items') as x(product_id uuid, quantity integer, size text, color text) loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 20 then raise exception 'كمية غير صحيحة'; end if;
    select p.* into v_product from public.products p join public.categories c on c.id = p.category_id where p.id = v_item.product_id and p.is_active = true and c.is_active = true for update of p;
    if not found then raise exception 'المنتج غير متاح'; end if;
    if v_product.stock < v_item.quantity then raise exception 'المخزون مش مكفي للمنتج: %', v_product.name; end if;
    if coalesce(array_length(v_product.sizes, 1), 0) > 0 and nullif(trim(v_item.size), '') is null then raise exception 'اختار المقاس للمنتج: %', v_product.name; end if;
    if nullif(trim(v_item.size), '') is not null and (coalesce(array_length(v_product.sizes, 1), 0) = 0 or not (trim(v_item.size) = any(v_product.sizes))) then raise exception 'المقاس غير متاح'; end if;
    if coalesce(array_length(v_product.colors, 1), 0) > 0 and nullif(trim(v_item.color), '') is null then raise exception 'اختار اللون للمنتج: %', v_product.name; end if;
    if nullif(trim(v_item.color), '') is not null and (coalesce(array_length(v_product.colors, 1), 0) = 0 or not (trim(v_item.color) = any(v_product.colors))) then raise exception 'اللون غير متاح'; end if;
    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    update public.products set stock = stock - v_item.quantity where products.id = v_product.id;
  end loop;

  select coalesce(store_settings.delivery_fee, 0) into v_delivery_fee from public.store_settings where store_settings.id = 'store';
  insert into public.orders (order_number, customer_name, phone, email, address, notes, subtotal, delivery_fee, total, payment_method, transfer_phone, payment_proof_path)
  values ('', v_customer_name, v_phone, v_email, v_address, v_notes, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee, v_payment_method, v_transfer_phone, v_proof_path)
  returning * into v_order;

  for v_item in select * from jsonb_to_recordset(p_order -> 'items') as x(product_id uuid, quantity integer, size text, color text) loop
    select * into v_product from public.products where products.id = v_item.product_id;
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size, color)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_item.quantity, nullif(trim(v_item.size), ''), nullif(trim(v_item.color), ''));
  end loop;

  return query select v_order.id, v_order.order_number, v_order.subtotal, v_order.delivery_fee, v_order.total, v_order.payment_method, v_order.payment_status, v_order.order_status, v_order.created_at;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;

-- Public tracking asks for both pieces of customer-owned information; it never
-- exposes addresses, transfer numbers, proof files, or another customer's order.
create or replace function public.get_public_order_status(p_order_number text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_phone text := regexp_replace(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '^20', '');
  v_items jsonb;
begin
  select * into v_order from public.orders where orders.order_number = upper(trim(p_order_number)) and regexp_replace(orders.phone, '[^0-9]', '', 'g') = v_phone;
  if not found then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object('product_name', product_name, 'quantity', quantity, 'unit_price', unit_price, 'size', size, 'color', color) order by created_at), '[]'::jsonb)
    into v_items from public.order_items where order_id = v_order.id;
  return jsonb_build_object('order_number', v_order.order_number, 'customer_name', v_order.customer_name, 'total', v_order.total, 'payment_method', v_order.payment_method, 'payment_status', v_order.payment_status, 'order_status', v_order.order_status, 'created_at', v_order.created_at, 'items', v_items);
end;
$$;

grant execute on function public.get_public_order_status(text, text) to anon, authenticated;

-- Storage buckets: product/brand imagery is public; payment proofs are private.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('store-assets', 'store-assets', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false) on conflict (id) do update set public = false;

-- payment-proofs stays private. create-order creates a signed upload URL with the
-- anon INSERT policy below and writes through it, so the anon role deliberately has
-- NO SELECT policy here: signed uploads do not need RETURNING RLS reads, and the
-- RPC verifies the object through a SECURITY DEFINER check.

drop policy if exists product_images_storage_admin_insert on storage.objects;
create policy product_images_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists product_images_storage_admin_delete on storage.objects;
create policy product_images_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists store_assets_storage_admin_insert on storage.objects;
create policy store_assets_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'store-assets' and public.is_admin());
drop policy if exists store_assets_storage_admin_delete on storage.objects;
create policy store_assets_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'store-assets' and public.is_admin());
drop policy if exists payment_proofs_customer_insert on storage.objects;
create policy payment_proofs_customer_insert on storage.objects for insert to anon, authenticated with check (bucket_id = 'payment-proofs' and name like 'pending/%');
drop policy if exists payment_proofs_storage_admin_select on storage.objects;
create policy payment_proofs_storage_admin_select on storage.objects for select to authenticated using (bucket_id = 'payment-proofs' and public.is_admin());

-- SAIF STORE / curated starter catalog (included for clean-project setup)
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('c1000001-0000-4000-8000-000000000001', 'تيشيرتات', 'tshirts', 'قطع أساسية بقصّات مريحة وخامات بتستحمل يومك كله.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88', 1),
  ('c1000002-0000-4000-8000-000000000002', 'هوديز', 'hoodies', 'دفا خفيف وشكل تقيل للّبس اللي مبيحتاجش مجهود.', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88', 2),
  ('c1000003-0000-4000-8000-000000000003', 'بناطيل', 'pants', 'قصّات مظبوطة تديك مساحة تتحرك وتفضل شيك.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 3),
  ('c1000004-0000-4000-8000-000000000004', 'قمصان', 'shirts', 'بين الرسمي والكاجوال، على مزاجك وعلى طريقتك.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88', 4),
  ('c1000005-0000-4000-8000-000000000005', 'جاكيتات', 'jackets', 'طبقة أخيرة تكمل اللوك من غير ما تزودها.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=88', 5),
  ('c1000006-0000-4000-8000-000000000006', 'شورتات', 'shorts', 'خفيفة، عملية، ومناسبة لأيام الصيف الطويلة.', 'https://images.unsplash.com/photo-1506629905607-d9a3e15d14c8?auto=format&fit=crop&w=1400&q=88', 6),
  ('c1000007-0000-4000-8000-000000000007', 'ملابس رياضية', 'sportswear', 'لبس بيتحرك معاك، للتمرين ولليوم اللي مبيوقفش.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88', 7),
  ('c1000008-0000-4000-8000-000000000008', 'إكسسوارات', 'accessories', 'التفاصيل الصغيرة اللي بتعمل الفرق الكبير.', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=88', 8)
on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order;

insert into public.products (id, category_id, name, slug, description, price, old_price, discount_percent, sizes, colors, stock, is_featured, sort_order) values
  ('a1000001-0000-4000-8000-000000000001', 'c1000001-0000-4000-8000-000000000001', 'تيشيرت Essential أبيض', 'essential-white-tee', 'تيشيرت قطن ناعم بقصّة واسعة محسوبة. قطعة أساسية تلبسها كل يوم وتفضل شكلها حاضر.', 690, '790', '13', array['M', 'L', 'XL'], array['أبيض', 'أسود'], 24, True, 1),
  ('a1000002-0000-4000-8000-000000000002', 'c1000001-0000-4000-8000-000000000001', 'تيشيرت Heavyweight أسود', 'heavyweight-black-tee', 'خامة تقيلة بملمس نضيف وياقة ثابتة. الأسود اللي ينفع مع كل حاجة.', 780, null, null, array['M', 'L', 'XL'], array['أسود', 'رمادي'], 18, True, 2),
  ('a1000003-0000-4000-8000-000000000003', 'c1000001-0000-4000-8000-000000000001', 'تيشيرت Line رمادي', 'line-grey-tee', 'تفصيلة جرافيك هادية على قطن مريح، عشان اللوك يتكلم من غير زعيق.', 720, null, null, array['M', 'L', 'XL'], array['رمادي', 'أوف وايت'], 12, False, 3),
  ('a1000004-0000-4000-8000-000000000004', 'c1000002-0000-4000-8000-000000000002', 'هودي Studio أسود', 'studio-black-hoodie', 'هودي ناعم من جوه وتقيل في حضوره. البلوك المظبوط لليوم البارد.', 1290, '1490', '13', array['S', 'M', 'L', 'XL'], array['أسود'], 15, True, 4),
  ('a1000005-0000-4000-8000-000000000005', 'c1000002-0000-4000-8000-000000000002', 'هودي Form أوف وايت', 'form-off-white-hoodie', 'أوف وايت دافي ببطانة مريحة وقصّة تنفع لوحدها أو تحت جاكيت.', 1390, null, null, array['M', 'L', 'XL'], array['أوف وايت', 'رمادي'], 9, False, 5),
  ('a1000006-0000-4000-8000-000000000006', 'c1000002-0000-4000-8000-000000000002', 'سويت شيرت Mark رمادي', 'mark-grey-sweatshirt', 'سويت شيرت من غير كابيشو، تصميم نظيف وتطريز صغير يبان من قريب.', 990, null, null, array['M', 'L', 'XL'], array['رمادي', 'أسود'], 20, False, 6),
  ('a1000007-0000-4000-8000-000000000007', 'c1000003-0000-4000-8000-000000000003', 'بنطلون Wide Utility', 'wide-utility-pants', 'بنطلون واسع بجيوب عملية وقماش ماسك نفسه. راحة من غير شكل مهمل.', 1190, '1390', '14', array['30', '32', '34', '36'], array['أسود', 'زيتي'], 11, True, 7),
  ('a1000008-0000-4000-8000-000000000008', 'c1000003-0000-4000-8000-000000000003', 'بنطلون Straight أسود', 'straight-black-pants', 'قصّة مستقيمة وخط نظيف يشتغل من الصبح لحد آخر الليل.', 1090, null, null, array['30', '32', '34', '36'], array['أسود'], 17, False, 8),
  ('a1000009-0000-4000-8000-000000000009', 'c1000003-0000-4000-8000-000000000003', 'بنطلون Relaxed كتان', 'relaxed-linen-pants', 'خامة كتان خفيفة وقصّة واسعة لأيام الحر والستايل الهادي.', 1150, null, null, array['30', '32', '34', '36'], array['أوف وايت', 'بيج'], 8, False, 9),
  ('a1000010-0000-4000-8000-000000000010', 'c1000004-0000-4000-8000-000000000004', 'قميص Oxford أوف وايت', 'oxford-off-white-shirt', 'قميص أوكسفورد بملمس خفيف. يظبط مع جينز أو بنطلون رسمي بنفس السهولة.', 990, '1190', '17', array['S', 'M', 'L', 'XL'], array['أوف وايت', 'أزرق فاتح'], 13, True, 10),
  ('a1000011-0000-4000-8000-000000000011', 'c1000004-0000-4000-8000-000000000004', 'قميص Overshirt أسود', 'overshirt-black', 'قميص جاكت خفيف ينفع طبقة زيادة أو لوحده. عملي بس مش عادي.', 1250, null, null, array['M', 'L', 'XL'], array['أسود', 'رمادي'], 10, False, 11),
  ('a1000012-0000-4000-8000-000000000012', 'c1000004-0000-4000-8000-000000000004', 'قميص Resort مخطط', 'resort-striped-shirt', 'قميص صيفي خفيف بخطوط بسيطة وقصّة واسعة على قد الحركة.', 890, null, null, array['M', 'L', 'XL'], array['أبيض وأسود'], 14, False, 12),
  ('a1000013-0000-4000-8000-000000000013', 'c1000005-0000-4000-8000-000000000005', 'جاكيت Workwear أسود', 'workwear-black-jacket', 'جاكيت عملي بتفاصيل محسوبة وسحّاب قوي. الطبقة اللي بتقفل اللوك.', 1790, '2090', '14', array['S', 'M', 'L', 'XL'], array['أسود'], 6, True, 13),
  ('a1000014-0000-4000-8000-000000000014', 'c1000005-0000-4000-8000-000000000005', 'جاكيت Coach رمادي', 'coach-grey-jacket', 'جاكيت خفيف ضد الهوا، بيلحقك في المشاوير السريعة والسفر.', 1590, null, null, array['M', 'L', 'XL'], array['رمادي', 'أسود'], 7, False, 14),
  ('a1000015-0000-4000-8000-000000000015', 'c1000005-0000-4000-8000-000000000005', 'جاكيت Denim خام', 'raw-denim-jacket', 'دينم خام هيفضل ياخد شخصيتك مع الوقت. تصميمه بسيط ومش بيقدم.', 1490, null, null, array['M', 'L', 'XL'], array['كحلي غامق'], 9, False, 15),
  ('a1000016-0000-4000-8000-000000000016', 'c1000006-0000-4000-8000-000000000006', 'شورت Daily أسود', 'daily-black-shorts', 'شورت قطن بخصر مريح وجيوب عميقة. بسيط لدرجة إنك هتلبسه كتير.', 690, null, null, array['M', 'L', 'XL'], array['أسود', 'رمادي'], 22, False, 16),
  ('a1000017-0000-4000-8000-000000000017', 'c1000006-0000-4000-8000-000000000006', 'شورت Terry أوف وايت', 'terry-off-white-shorts', 'تيري ناعم وخفيف للبيت، البحر، وكل يوم عايز فيه راحة.', 740, null, null, array['M', 'L', 'XL'], array['أوف وايت', 'أسود'], 16, False, 17),
  ('a1000018-0000-4000-8000-000000000018', 'c1000006-0000-4000-8000-000000000006', 'شورت Cargo زيتي', 'cargo-olive-shorts', 'جيوب زيادة وقصّة مريحة، عشان تاخد يومك معاك من غير شنطة.', 790, null, null, array['S', 'M', 'L', 'XL'], array['زيتي', 'أسود'], 10, False, 18),
  ('a1000019-0000-4000-8000-000000000019', 'c1000007-0000-4000-8000-000000000007', 'تيشيرت Motion رياضي', 'motion-sports-tee', 'خامة سريعة الجفاف وقصّة تتحرك معاك، للتمرين أو يوم مليان مشاوير.', 850, null, null, array['M', 'L', 'XL'], array['أسود', 'أبيض'], 14, True, 19),
  ('a1000020-0000-4000-8000-000000000020', 'c1000007-0000-4000-8000-000000000007', 'بنطلون Track أسود', 'track-black-pants', 'بنطلون رياضي بخط مستقيم ورباط مريح. الأداء شكله نضيف هنا.', 1090, null, null, array['S', 'M', 'L', 'XL'], array['أسود'], 12, False, 20),
  ('a1000021-0000-4000-8000-000000000021', 'c1000007-0000-4000-8000-000000000007', 'جاكيت Run خفيف', 'run-light-jacket', 'طبقة خفيفة للهواء والحركة، بتتطبق بسهولة وتاخد مساحة صغيرة.', 1390, '1590', '13', array['M', 'L', 'XL'], array['أسود', 'رمادي'], 5, False, 21),
  ('a1000022-0000-4000-8000-000000000022', 'c1000008-0000-4000-8000-000000000008', 'كاب Saif Signature', 'saif-signature-cap', 'كاب قطن بتطريز صغير وحافة مظبوطة. تفصيلة واحدة تكفي.', 490, null, null, array['مقاس واحد'], array['أسود', 'أوف وايت'], 28, True, 22),
  ('a1000023-0000-4000-8000-000000000023', 'c1000008-0000-4000-8000-000000000008', 'شنطة Crossbody Utility', 'utility-crossbody-bag', 'شنطة صغيرة تشيل الأساسيات من غير ما تعطل حركتك.', 690, null, null, array['مقاس واحد'], array['أسود'], 13, False, 23),
  ('a1000024-0000-4000-8000-000000000024', 'c1000008-0000-4000-8000-000000000008', 'شراب Ribbed أسود', 'ribbed-black-socks', 'شراب مريح بتفصيلة ريب خفيفة. اللمسة اللي تكمل اللبس.', 290, null, null, array['مقاس واحد'], array['أسود', 'أبيض'], 40, False, 24)
on conflict (slug) do update set category_id = excluded.category_id, name = excluded.name, description = excluded.description, price = excluded.price, old_price = excluded.old_price, discount_percent = excluded.discount_percent, sizes = excluded.sizes, colors = excluded.colors, stock = excluded.stock, is_featured = excluded.is_featured, sort_order = excluded.sort_order, is_active = true;

delete from public.product_images where product_id in ('a1000001-0000-4000-8000-000000000001','a1000002-0000-4000-8000-000000000002','a1000003-0000-4000-8000-000000000003','a1000004-0000-4000-8000-000000000004','a1000005-0000-4000-8000-000000000005','a1000006-0000-4000-8000-000000000006','a1000007-0000-4000-8000-000000000007','a1000008-0000-4000-8000-000000000008','a1000009-0000-4000-8000-000000000009','a1000010-0000-4000-8000-000000000010','a1000011-0000-4000-8000-000000000011','a1000012-0000-4000-8000-000000000012','a1000013-0000-4000-8000-000000000013','a1000014-0000-4000-8000-000000000014','a1000015-0000-4000-8000-000000000015','a1000016-0000-4000-8000-000000000016','a1000017-0000-4000-8000-000000000017','a1000018-0000-4000-8000-000000000018','a1000019-0000-4000-8000-000000000019','a1000020-0000-4000-8000-000000000020','a1000021-0000-4000-8000-000000000021','a1000022-0000-4000-8000-000000000022','a1000023-0000-4000-8000-000000000023','a1000024-0000-4000-8000-000000000024');
insert into public.product_images (product_id, image_url, sort_order) values
  ('a1000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000002-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000002-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000003-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000003-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000004-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000004-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000005-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000005-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000006-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000006-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000007-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000007-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000008-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000008-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000009-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000009-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000010-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000010-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000011-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000011-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000012-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000012-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000013-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000013-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000014-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000014-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000015-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000015-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000016-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1506629905607-d9a3e15d14c8?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000016-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000017-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000017-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000018-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000018-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1506629905607-d9a3e15d14c8?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000019-0000-4000-8000-000000000019', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000019-0000-4000-8000-000000000019', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000020-0000-4000-8000-000000000020', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000020-0000-4000-8000-000000000020', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000021-0000-4000-8000-000000000021', 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000021-0000-4000-8000-000000000021', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000022-0000-4000-8000-000000000022', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000022-0000-4000-8000-000000000022', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000023-0000-4000-8000-000000000023', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000023-0000-4000-8000-000000000023', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=88', 1),
  ('a1000024-0000-4000-8000-000000000024', 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=1400&q=88', 0),
  ('a1000024-0000-4000-8000-000000000024', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=88', 1);

insert into public.store_settings (id, store_name, contact_phone, whatsapp_number, vodafone_cash_number, instapay_number, delivery_fee, hero_title, hero_subtitle, store_description) values ('store', 'SAIF STORE', '0100 000 0000', '201000000000', '0100 000 0000', 'saif.store@instapay', 75, 'اللبس اللي يشبهك.', 'قطع أساسية، معمولة بعناية، عشان تعيش معاك أكتر من موسم.', 'SAIF STORE براند مصري بيحب القطع الهادية، الخامات المظبوطة، والتفاصيل اللي بتبان مع الوقت.') on conflict (id) do nothing;
