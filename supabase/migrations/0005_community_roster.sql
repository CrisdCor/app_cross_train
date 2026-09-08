-- Ronda 4: "Comunidades" — el atleta ve a los demás miembros activos de su
-- comunidad, y el Head Coach ve (y busca) a todos los miembros de la suya.

create or replace function public.get_my_community()
returns table (community_id uuid, community_name text, is_owner boolean)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_owner_id uuid;
  v_owner_name text;
begin
  select c.id, c.name into v_owner_id, v_owner_name
  from public.communities c
  where c.owner_id = auth.uid()
  limit 1;

  if v_owner_id is not null then
    community_id := v_owner_id;
    community_name := v_owner_name;
    is_owner := true;
    return next;
    return;
  end if;

  return query
  select c.id, c.name, false
  from public.communities c
  join public.memberships m on m.community_id = c.id
  where m.athlete_id = auth.uid() and m.status = 'active'
  order by m.joined_at desc
  limit 1;
end;
$$;

revoke execute on function public.get_my_community() from public, anon;
grant execute on function public.get_my_community() to authenticated;

create or replace function public.list_community_members(p_community_id uuid, p_query text default '')
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  if not (public.is_community_owner(p_community_id) or public.is_community_member(p_community_id)) then
    raise exception 'not_authorized';
  end if;

  return query
  select p.id, p.username, p.full_name, p.avatar_url
  from public.memberships m
  join public.profiles p on p.id = m.athlete_id
  where m.community_id = p_community_id
    and m.status = 'active'
    and (
      p_query = '' or
      p.username ilike '%' || p_query || '%' or
      p.full_name ilike '%' || p_query || '%'
    )
  order by p.username;
end;
$$;

revoke execute on function public.list_community_members(uuid, text) from public, anon;
grant execute on function public.list_community_members(uuid, text) to authenticated;
