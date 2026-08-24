-- Continúa el fix de la 0005: las políticas que comprueban
-- "role = 'admin'" haciendo un select sobre la propia tabla public.profiles
-- son auto-referenciales y también disparan "infinite recursion detected
-- in policy for relation profiles" (Postgres no puede probar en tiempo de
-- planeación que el OR con profiles_select_own evita la recursión).
--
-- Mismo remedio: una función SECURITY DEFINER que resuelve "¿soy admin?"
-- sin volver a evaluar RLS sobre profiles dentro de sí misma.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- communities
drop policy if exists "communities_select_admin" on public.communities;
create policy "communities_select_admin" on public.communities
  for select using (public.is_admin());

-- role_invite_codes
drop policy if exists "role_invite_codes_admin_all" on public.role_invite_codes;
create policy "role_invite_codes_admin_all" on public.role_invite_codes
  for all using (public.is_admin())
  with check (public.is_admin());
