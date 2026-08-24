-- Corrige "infinite recursion detected in policy for relation memberships".
--
-- Causa: profiles_select_head_coach_of_member consulta memberships + communities;
-- memberships_select_owner consulta communities; communities_select_member
-- consulta memberships de vuelta -> ciclo. Postgres detecta la recursión y
-- la consulta falla completa (incluso para leer tu propia fila de profiles,
-- porque todas las políticas permissive de profiles se evalúan igual).
--
-- Esto rompía getSessionProfile() para TODOS los usuarios autenticados
-- (no solo admin): la fila de profiles sí existía, pero el select fallaba
-- silenciosamente (data: null) por el error de RLS, y la UI caía al
-- fallback "Atleta" / nombre desde el correo.
--
-- Solución: funciones SECURITY DEFINER que evalúan pertenencia/propiedad
-- sin volver a disparar RLS sobre memberships/communities dentro de sí
-- mismas, rompiendo el ciclo.

create or replace function public.is_community_owner(p_community_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.communities c
    where c.id = p_community_id and c.owner_id = auth.uid()
  );
$$;

create or replace function public.is_community_member(p_community_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.community_id = p_community_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_head_coach_of_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    join public.communities c on c.id = m.community_id
    where m.user_id = p_profile_id and c.owner_id = auth.uid()
  );
$$;

revoke execute on function public.is_community_owner(uuid) from public, anon;
revoke execute on function public.is_community_member(uuid) from public, anon;
revoke execute on function public.is_head_coach_of_profile(uuid) from public, anon;
grant execute on function public.is_community_owner(uuid) to authenticated;
grant execute on function public.is_community_member(uuid) to authenticated;
grant execute on function public.is_head_coach_of_profile(uuid) to authenticated;

-- profiles: ya no hace join directo a memberships/communities
drop policy if exists "profiles_select_head_coach_of_member" on public.profiles;
create policy "profiles_select_head_coach_of_member" on public.profiles
  for select using (public.is_head_coach_of_profile(profiles.id));

-- memberships: ya no consulta communities directamente
drop policy if exists "memberships_select_owner" on public.memberships;
create policy "memberships_select_owner" on public.memberships
  for select using (public.is_community_owner(memberships.community_id));

drop policy if exists "memberships_write_owner" on public.memberships;
create policy "memberships_write_owner" on public.memberships
  for all using (public.is_community_owner(memberships.community_id))
  with check (public.is_community_owner(memberships.community_id));

-- communities: ya no consulta memberships directamente
drop policy if exists "communities_select_member" on public.communities;
create policy "communities_select_member" on public.communities
  for select using (public.is_community_member(communities.id));
