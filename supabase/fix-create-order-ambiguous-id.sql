-- Fix for ambiguous "id" reference in public.create_order(jsonb)
-- Root cause: RETURNS TABLE (id uuid, ...) makes "id" visible as output column.
-- The statement "where id = 'store'" from store_settings was unqualified, so Postgres
-- sees two candidates: output column "id" and store_settings.id -> ambiguous.
-- Also delivery_fee appears in both output and store_settings.
-- Minimal fix: qualify with table name store_settings.

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
  -- FIXED: qualify id and payment number columns with store_settings alias
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

  -- FIXED: qualify delivery_fee with store_settings
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
