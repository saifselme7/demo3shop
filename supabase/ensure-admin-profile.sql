-- SAIF STORE / ensure the store-owner admin profile
--
-- WHY YOU MAY NEED THIS
-- ---------------------
-- /admin/login is an AUTHORIZATION check on top of Supabase Auth:
--   1) Supabase verifies your email + password (Authentication).
--   2) The app then reads public.profiles by the authenticated user's real
--      auth.id (auth.uid()) and requires role = 'admin' (Authorization).
--
-- If the profiles row for your Auth user is MISSING — e.g. the user was
-- created manually in Supabase Dashboard (Authentication → Users) BEFORE the
-- on_auth_user_created trigger was installed, or was created and never
-- promoted — the login is correctly blocked with
-- "الحساب ده مش مسموح له يدخل لوحة التحكم".
--
-- WHAT MUST EXIST IN public.profiles FOR AN ADMIN LOGIN
-- -----------------------------------------------------
-- Exactly one row where:
--   public.profiles.id  =  auth.users.id   (your Auth user's uuid)
--   public.profiles.role = 'admin'
--
-- HOW TO RUN (safe, idempotent — Supabase SQL Editor)
-- ---------------------------------------------------
-- 1. Replace OWNER_EMAIL below (3 places) with the owner's exact email as
--    shown in Authentication → Users.
-- 2. Run statement 1 — confirm the Auth user exists (1 row, note the uuid).
-- 3. Run statement 2 — creates the profiles row ONLY if it is missing.
-- 4. Run statement 3 — promotes exactly that user to admin.
-- 5. Run statement 4 — verify role = 'admin' for your email.
--
-- This script does NOT modify RLS, policies, triggers, functions, or any
-- other user. It only ensures one owner's row and role.

-- 1) Confirm the Auth user exists (expect exactly 1 row):
select id, email, created_at
from auth.users
where email = 'OWNER_EMAIL';

-- 2) Create the profiles row only if it is missing (no-op when it exists):
insert into public.profiles (id, name)
select id, coalesce(raw_user_meta_data ->> 'name', email, 'صاحب المتجر')
from auth.users
where email = 'OWNER_EMAIL'
on conflict (id) do nothing;

-- 3) Promote exactly that user to admin (0 rows if the user does not exist):
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'OWNER_EMAIL' limit 1);

-- 4) Verify (expect one row with role = 'admin' for your email):
select p.id, p.name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'OWNER_EMAIL';
