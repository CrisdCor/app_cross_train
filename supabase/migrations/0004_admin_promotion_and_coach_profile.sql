-- Ronda 3: perfil extendido de Head Coach (bio, nombre de programación),
-- perfil público de coach, y promoción directa por parte del Administrador.

-- ---------------------------------------------------------------------
-- 1) Campos nuevos en profiles
-- ---------------------------------------------------------------------

alter table public.profiles
  add column bio text not null default '',
  add column program_name text not null default '';

-- ---------------------------------------------------------------------
-- 2) Admin: buscar cualquier usuario y promoverlo a Head Coach
--    directamente (sin pasar por una solicitud previa del usuario).
-- ---------------------------------------------------------------------

create or replace function public.admin_search_profiles(p_query text)
returns table (
  id uuid,
  username text,
  full_name text,
  role text,
  avatar_url text
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only';
  end if;

  return query
  select p.id, p.username, p.full_name, p.role, p.avatar_url
  from public.profiles p
  where p.username ilike '%' || p_query || '%' or p.full_name ilike '%' || p_query || '%'
  order by p.username
  limit 20;
end;
$$;

revoke execute on function public.admin_search_profiles(text) from public, anon;
grant execute on function public.admin_search_profiles(text) to authenticated;

create or replace function public.admin_promote_to_head_coach(p_profile_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_current_role text;
begin
  if not public.is_admin() then
    raise exception 'admin_only';
  end if;

  select role into v_current_role from public.profiles where id = p_profile_id for update;

  if not found then
    raise exception 'profile_not_found';
  end if;
  if v_current_role = 'head_coach' then
    raise exception 'already_head_coach';
  end if;
  if v_current_role = 'admin' then
    raise exception 'cannot_change_admin_role';
  end if;

  update public.profiles set role = 'head_coach' where id = p_profile_id;

  insert into public.head_coach_requests (profile_id, status, resolved_at, resolved_by)
  values (p_profile_id, 'approved', now(), auth.uid());
end;
$$;

revoke execute on function public.admin_promote_to_head_coach(uuid) from public, anon;
grant execute on function public.admin_promote_to_head_coach(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 3) Perfil público de un Head Coach (foto, bio, programación) y
--    búsqueda, ambas con las columnas nuevas. El tipo de retorno cambió,
--    así que search_head_coaches se recrea (drop + create).
-- ---------------------------------------------------------------------

drop function if exists public.search_head_coaches(text);

create or replace function public.search_head_coaches(p_query text)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  program_name text,
  community_id uuid,
  community_name text
)
language sql
security definer set search_path = public
stable
as $$
  select p.id, p.username, p.full_name, p.avatar_url, p.bio, p.program_name,
         c.id as community_id, c.name as community_name
  from public.profiles p
  join public.communities c on c.owner_id = p.id
  where p.role = 'head_coach'
    and (p.username ilike '%' || p_query || '%' or p.full_name ilike '%' || p_query || '%')
  order by p.username
  limit 20;
$$;

revoke execute on function public.search_head_coaches(text) from public, anon;
grant execute on function public.search_head_coaches(text) to authenticated;

create or replace function public.get_head_coach_profile(p_username text)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  program_name text,
  community_id uuid,
  community_name text
)
language sql
security definer set search_path = public
stable
as $$
  select p.id, p.username, p.full_name, p.avatar_url, p.bio, p.program_name,
         c.id as community_id, c.name as community_name
  from public.profiles p
  join public.communities c on c.owner_id = p.id
  where p.role = 'head_coach' and p.username = lower(p_username)
  limit 1;
$$;

revoke execute on function public.get_head_coach_profile(text) from public, anon;
grant execute on function public.get_head_coach_profile(text) to authenticated;
