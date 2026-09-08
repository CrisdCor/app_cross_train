-- Reinicio completo del proyecto (a pedido de Cris, 2026-09-08).
-- Elimina todo el esquema anterior (roles con códigos de invitación) para
-- reconstruir desde cero con el nuevo modelo: 3 roles, username único tipo
-- Instagram, ascenso a Head Coach por aprobación del admin, e ingreso a una
-- comunidad por solicitud aprobada por el Head Coach (sin códigos).

-- Triggers sobre auth.users
drop trigger if exists trg_on_auth_user_created on auth.users;

-- Tablas del esquema anterior (cascade arrastra policies, triggers propios,
-- foreign keys)
drop table if exists public.role_invite_codes cascade;
drop table if exists public.invite_codes cascade;
drop table if exists public.memberships cascade;
drop table if exists public.communities cascade;
drop table if exists public.profiles cascade;

-- Funciones del esquema anterior
drop function if exists public.redeem_invite_code(text);
drop function if exists public.redeem_role_code(text);
drop function if exists public.is_admin();
drop function if exists public.is_community_owner(uuid);
drop function if exists public.is_community_member(uuid);
drop function if exists public.is_head_coach_of_profile(uuid);
drop function if exists public.ensure_head_coach_community();
drop function if exists public.set_updated_at();
drop function if exists public.handle_new_user();

-- Storage: policies del bucket avatars (el bucket en sí se reutiliza tal
-- cual en la 0001 con "on conflict do nothing" — Supabase bloquea el DELETE
-- directo sobre las tablas de storage).
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_owner_insert" on storage.objects;
drop policy if exists "avatars_owner_update" on storage.objects;
drop policy if exists "avatars_owner_delete" on storage.objects;

-- Todas las cuentas de auth (empezamos con cero usuarios; Cris y el resto
-- se vuelven a registrar por la app)
delete from auth.users;
