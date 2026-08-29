-- SAIF STORE / production schema
-- Run this file in the Supabase SQL editor before using the live admin.

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
  full_name text,
  is_admin boolean not null default false,
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
  display_order integer not null default 0 check (display_order >= 0),
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
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  display_order integer not null default 0 check (display_order >= 0),
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

create index if not exists categories_active_order_idx on public.categories (is_active, display_order);
create index if not exists products_category_active_order_idx on public.products (category_id, is_active, display_order);
create index if not exists products_featured_idx on public.products (is_featured, is_active);
create index if not exists product_images_product_order_idx on public.product_images (product_id, display_order);
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
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
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
create policy products_public_select on public.products for select using (is_active or public.is_admin());
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products for delete to authenticated using (public.is_admin());

drop policy if exists product_images_public_select on public.product_images;
create policy product_images_public_select on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
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
  v_phone text := regexp_replace(coalesce(p_order ->> 'phone', ''), '[^0-9]', '', 'g');
  v_email text := nullif(trim(p_order ->> 'email'), '');
  v_address text := nullif(trim(p_order ->> 'address'), '');
  v_notes text := nullif(trim(p_order ->> 'notes'), '');
  v_payment_method text := p_order ->> 'payment_method';
  v_transfer_phone text := regexp_replace(coalesce(p_order ->> 'transfer_phone', ''), '[^0-9]', '', 'g');
  v_proof_path text := nullif(trim(p_order ->> 'payment_proof_path'), '');
  v_subtotal integer := 0;
  v_delivery_fee integer := 0;
  v_order public.orders%rowtype;
  v_product public.products%rowtype;
  v_item record;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'إنشاء الطلبات متاح من خادم المتجر فقط'; end if;
  if v_customer_name is null or char_length(v_customer_name) < 3 then raise exception 'الاسم مطلوب'; end if;
  if v_address is null or char_length(v_address) < 10 then raise exception 'العنوان مطلوب'; end if;
  if v_phone !~ '^01[0125][0-9]{8}$' then raise exception 'رقم الموبايل غير صحيح'; end if;
  if v_transfer_phone !~ '^01[0125][0-9]{8}$' then raise exception 'رقم التحويل غير صحيح'; end if;
  if v_payment_method not in ('vodafone_cash', 'instapay') then raise exception 'طريقة الدفع غير صحيحة'; end if;
  if v_proof_path is null then raise exception 'إثبات الدفع مطلوب'; end if;
  if v_proof_path not like 'pending/%' then raise exception 'إثبات الدفع غير صحيح'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'payment-proofs' and name = v_proof_path) then raise exception 'إثبات الدفع غير موجود'; end if;
  if jsonb_typeof(p_order -> 'items') <> 'array' or jsonb_array_length(p_order -> 'items') = 0 then raise exception 'السلة فاضية'; end if;

  for v_item in select * from jsonb_to_recordset(p_order -> 'items') as x(product_id uuid, quantity integer, size text, color text) loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 20 then raise exception 'كمية غير صحيحة'; end if;
    select * into v_product from public.products where products.id = v_item.product_id and products.is_active = true for update;
    if not found then raise exception 'المنتج غير متاح'; end if;
    if v_product.stock < v_item.quantity then raise exception 'المخزون مش مكفي للمنتج: %', v_product.name; end if;
    if coalesce(array_length(v_product.sizes, 1), 0) > 0 and nullif(v_item.size, '') is null then raise exception 'اختار المقاس للمنتج: %', v_product.name; end if;
    if nullif(v_item.size, '') is not null and not (v_item.size = any(v_product.sizes)) then raise exception 'المقاس غير متاح'; end if;
    if nullif(v_item.color, '') is not null and coalesce(array_length(v_product.colors, 1), 0) > 0 and not (v_item.color = any(v_product.colors)) then raise exception 'اللون غير متاح'; end if;
    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    update public.products set stock = stock - v_item.quantity where products.id = v_product.id;
  end loop;

  select coalesce(delivery_fee, 0) into v_delivery_fee from public.store_settings where store_settings.id = 'store';
  insert into public.orders (order_number, customer_name, phone, email, address, notes, subtotal, delivery_fee, total, payment_method, transfer_phone, payment_proof_path)
  values ('', v_customer_name, v_phone, v_email, v_address, v_notes, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee, v_payment_method, v_transfer_phone, v_proof_path)
  returning * into v_order;

  for v_item in select * from jsonb_to_recordset(p_order -> 'items') as x(product_id uuid, quantity integer, size text, color text) loop
    select * into v_product from public.products where products.id = v_item.product_id;
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, size, color)
    values (v_order.id, v_product.id, v_product.name, v_product.price, v_item.quantity, nullif(v_item.size, ''), nullif(v_item.color, ''));
  end loop;

  return query select v_order.id, v_order.order_number, v_order.subtotal, v_order.delivery_fee, v_order.total, v_order.payment_method, v_order.payment_status, v_order.order_status, v_order.created_at;
end;
$$;

revoke execute on function public.create_order(jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb) to service_role;

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
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
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

insert into public.store_settings (id) values ('store') on conflict (id) do nothing;

-- Storage buckets: product/brand imagery is public; payment proofs are private.
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('store-assets', 'store-assets', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false) on conflict (id) do update set public = false;

drop policy if exists product_images_storage_admin_insert on storage.objects;
create policy product_images_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists product_images_storage_admin_delete on storage.objects;
create policy product_images_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists store_assets_storage_admin_insert on storage.objects;
create policy store_assets_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'store-assets' and public.is_admin());
drop policy if exists store_assets_storage_admin_delete on storage.objects;
create policy store_assets_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'store-assets' and public.is_admin());
drop policy if exists payment_proofs_storage_admin_select on storage.objects;
create policy payment_proofs_storage_admin_select on storage.objects for select to authenticated using (bucket_id = 'payment-proofs' and public.is_admin());
