-- App Cross Train — esquema nuevo (reinicio 2026-09-08)
--
-- Roles: admin, head_coach, athlete (por defecto al registrarse).
-- Ascenso a head_coach: el propio usuario pide, el admin aprueba/rechaza.
-- Ingreso a una comunidad: el atleta busca al head coach por su username
-- (tipo Instagram) y pide unirse; el head coach aprueba/rechaza.
--
-- Todas las escrituras de "flujo" (pedir ascenso, aprobar, pedir unirse,
-- aprobar membresía) pasan por funciones SECURITY DEFINER — nunca por
-- INSERT/UPDATE directo del cliente — así el rol nunca se auto-asigna y
-- el estado siempre queda consistente.
--
-- IMPORTANTE (lección de la recursión de RLS del proyecto anterior):
-- ninguna política de RLS aquí consulta su propia tabla ni una tabla que
-- la referencia de vuelta directamente vía exists(). Todo chequeo de
-- rol/propiedad/membresía pasa por una función SECURITY DEFINER
-- (is_admin, is_community_owner, is_community_member), que al ejecutar
-- como dueña de las tablas evita volver a disparar RLS y por lo tanto
-- evita el ciclo.
--
-- Orden del archivo: 1) todas las tablas, 2) todas las funciones,
-- 3) triggers, 4) políticas RLS, 5) storage. Así ninguna función queda
-- referenciando una tabla que todavía no existe.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1) Tablas
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'athlete' check (role in ('admin', 'head_coach', 'athlete')),
  username text not null unique,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username = lower(username) and username ~ '^[a-z0-9._]{3,30}$')
);

alter table public.profiles enable row level security;

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create table public.head_coach_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id)
);

create unique index head_coach_requests_one_pending
  on public.head_coach_requests (profile_id)
  where status = 'pending';

alter table public.head_coach_requests enable row level security;

create table public.community_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id)
);

create unique index community_join_requests_one_pending
  on public.community_join_requests (community_id, athlete_id)
  where status = 'pending';

alter table public.community_join_requests enable row level security;

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'inactive')),
  joined_at timestamptz not null default now(),
  deactivated_at timestamptz,
  unique (athlete_id, community_id)
);

alter table public.memberships enable row level security;

-- ---------------------------------------------------------------------
-- 2) Funciones
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Crea automáticamente el perfil cuando se registra un usuario en auth.users.
-- username y full_name vienen del signUp({ options: { data: {...} } }) del cliente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_community_owner(p_community_id uuid)
returns boolean
language sql
security definer set search_path = public
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
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.community_id = p_community_id and m.athlete_id = auth.uid() and m.status = 'active'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_community_owner(uuid) from public, anon;
revoke execute on function public.is_community_member(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_community_owner(uuid) to authenticated;
grant execute on function public.is_community_member(uuid) to authenticated;

-- Evita que un usuario se auto-ascienda cambiando su propio rol por un
-- update directo a profiles (defensa adicional; el único camino real de
-- cambio de rol es approve_head_coach_request()).
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'role_change_not_allowed';
  end if;
  return new;
end;
$$;

-- Cuando un perfil pasa a head_coach (solo ocurre vía approve_head_coach_request),
-- se le crea su comunidad si no tiene una.
create or replace function public.ensure_head_coach_community()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role = 'head_coach' and not exists (
    select 1 from public.communities where owner_id = new.id
  ) then
    insert into public.communities (owner_id, name)
    values (new.id, coalesce(nullif(new.full_name, ''), '@' || new.username));
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- RPCs de flujo (únicas puertas de escritura para requests/membresías/rol)
-- ---------------------------------------------------------------------

create or replace function public.request_head_coach_promotion()
returns public.head_coach_requests
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.head_coach_requests%rowtype;
begin
  if (select role from public.profiles where id = auth.uid()) <> 'athlete' then
    raise exception 'only_athletes_can_request_promotion';
  end if;

  insert into public.head_coach_requests (profile_id)
  values (auth.uid())
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.approve_head_coach_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_only';
  end if;

  select profile_id into v_profile_id
  from public.head_coach_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'request_not_pending';
  end if;

  update public.head_coach_requests
  set status = 'approved', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id;

  update public.profiles set role = 'head_coach' where id = v_profile_id;
end;
$$;

create or replace function public.reject_head_coach_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only';
  end if;

  update public.head_coach_requests
  set status = 'rejected', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'request_not_pending';
  end if;
end;
$$;

create or replace function public.request_join_community(p_community_id uuid)
returns public.community_join_requests
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.community_join_requests%rowtype;
begin
  if exists (
    select 1 from public.memberships
    where athlete_id = auth.uid() and community_id = p_community_id and status = 'active'
  ) then
    raise exception 'already_member';
  end if;

  insert into public.community_join_requests (community_id, athlete_id)
  values (p_community_id, auth.uid())
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.approve_join_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_community_id uuid;
  v_athlete_id uuid;
begin
  select community_id, athlete_id into v_community_id, v_athlete_id
  from public.community_join_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'request_not_pending';
  end if;

  if not public.is_community_owner(v_community_id) then
    raise exception 'not_community_owner';
  end if;

  update public.community_join_requests
  set status = 'approved', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id;

  insert into public.memberships (athlete_id, community_id, status)
  values (v_athlete_id, v_community_id, 'active')
  on conflict (athlete_id, community_id)
    do update set status = 'active', deactivated_at = null;
end;
$$;

create or replace function public.reject_join_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_community_id uuid;
begin
  select community_id into v_community_id
  from public.community_join_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'request_not_pending';
  end if;

  if not public.is_community_owner(v_community_id) then
    raise exception 'not_community_owner';
  end if;

  update public.community_join_requests
  set status = 'rejected', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id;
end;
$$;

create or replace function public.set_membership_status(p_membership_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_community_id uuid;
begin
  if p_status not in ('active', 'inactive') then
    raise exception 'invalid_status';
  end if;

  select community_id into v_community_id
  from public.memberships
  where id = p_membership_id
  for update;

  if not found then
    raise exception 'membership_not_found';
  end if;

  if not public.is_community_owner(v_community_id) then
    raise exception 'not_community_owner';
  end if;

  update public.memberships
  set status = p_status,
      deactivated_at = case when p_status = 'inactive' then now() else null end
  where id = p_membership_id;
end;
$$;

create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

-- Búsqueda pública de head coaches por username/nombre, solo columnas no
-- sensibles (nunca expone email u otros datos privados).
create or replace function public.search_head_coaches(p_query text)
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  community_id uuid,
  community_name text
)
language sql
security definer set search_path = public
stable
as $$
  select p.id, p.username, p.full_name, p.avatar_url, c.id as community_id, c.name as community_name
  from public.profiles p
  join public.communities c on c.owner_id = p.id
  where p.role = 'head_coach'
    and (p.username ilike '%' || p_query || '%' or p.full_name ilike '%' || p_query || '%')
  order by p.username
  limit 20;
$$;

revoke execute on function public.request_head_coach_promotion() from public, anon;
revoke execute on function public.approve_head_coach_request(uuid) from public, anon;
revoke execute on function public.reject_head_coach_request(uuid) from public, anon;
revoke execute on function public.request_join_community(uuid) from public, anon;
revoke execute on function public.approve_join_request(uuid) from public, anon;
revoke execute on function public.reject_join_request(uuid) from public, anon;
revoke execute on function public.set_membership_status(uuid, text) from public, anon;
revoke execute on function public.is_username_available(text) from public, anon;
revoke execute on function public.search_head_coaches(text) from public, anon;

grant execute on function public.request_head_coach_promotion() to authenticated;
grant execute on function public.approve_head_coach_request(uuid) to authenticated;
grant execute on function public.reject_head_coach_request(uuid) to authenticated;
grant execute on function public.request_join_community(uuid) to authenticated;
grant execute on function public.approve_join_request(uuid) to authenticated;
grant execute on function public.reject_join_request(uuid) to authenticated;
grant execute on function public.set_membership_status(uuid, text) to authenticated;
grant execute on function public.is_username_available(text) to authenticated, anon;
grant execute on function public.search_head_coaches(text) to authenticated;

-- ---------------------------------------------------------------------
-- 3) Triggers
-- ---------------------------------------------------------------------

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger trg_prevent_role_self_escalation
  before update of role on public.profiles
  for each row execute function public.prevent_role_self_escalation();

create trigger trg_ensure_head_coach_community
  after insert or update of role on public.profiles
  for each row execute function public.ensure_head_coach_community();

-- ---------------------------------------------------------------------
-- 4) RLS: solo SELECT directo (todas las escrituras de flujo van por RPC)
-- ---------------------------------------------------------------------

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- communities
create policy "communities_select_owner" on public.communities
  for select using (owner_id = auth.uid());

create policy "communities_select_member" on public.communities
  for select using (public.is_community_member(id));

create policy "communities_select_admin" on public.communities
  for select using (public.is_admin());

create policy "communities_update_owner" on public.communities
  for update using (owner_id = auth.uid());

-- head_coach_requests
create policy "head_coach_requests_select_own" on public.head_coach_requests
  for select using (profile_id = auth.uid());

create policy "head_coach_requests_select_admin" on public.head_coach_requests
  for select using (public.is_admin());

-- community_join_requests
create policy "community_join_requests_select_own" on public.community_join_requests
  for select using (athlete_id = auth.uid());

create policy "community_join_requests_select_owner" on public.community_join_requests
  for select using (public.is_community_owner(community_id));

create policy "community_join_requests_select_admin" on public.community_join_requests
  for select using (public.is_admin());

-- memberships
create policy "memberships_select_own" on public.memberships
  for select using (athlete_id = auth.uid());

create policy "memberships_select_owner" on public.memberships
  for select using (public.is_community_owner(community_id));

create policy "memberships_select_admin" on public.memberships
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5) Storage: avatars (público de lectura, escritura solo en la carpeta propia)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
