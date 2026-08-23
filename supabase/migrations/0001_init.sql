-- App Cross Train — esquema inicial
-- Roles: admin, head_coach, coach (reservado), user
-- Comunidades = "red" de un Head Coach (o futuro Box). Un usuario puede
-- pertenecer a varias comunidades, cada membresía con su propio estado.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'head_coach', 'coach', 'user')),
  first_name text not null default '',
  last_name text not null default '',
  alias text,
  document_id text,
  email text not null,
  avatar_url text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea automáticamente el perfil cuando se registra un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, alias, document_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'alias',
    new.raw_user_meta_data ->> 'document_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- communities (la "red" de un Head Coach o Box)
-- ---------------------------------------------------------------------
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

-- Cuando un perfil pasa a head_coach, le crea su comunidad si no tiene una
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
    values (new.id, coalesce(nullif(new.alias, ''), new.first_name || ' ' || new.last_name, 'Mi comunidad'));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ensure_head_coach_community on public.profiles;
create trigger trg_ensure_head_coach_community
  after insert or update of role on public.profiles
  for each row execute function public.ensure_head_coach_community();

-- ---------------------------------------------------------------------
-- memberships (un usuario puede pertenecer a varias comunidades)
-- ---------------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid not null references public.communities (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'inactive')),
  invited_by uuid references public.profiles (id),
  joined_at timestamptz not null default now(),
  activated_at timestamptz,
  deactivated_at timestamptz,
  unique (user_id, community_id)
);

alter table public.memberships enable row level security;

-- ---------------------------------------------------------------------
-- invite_codes
-- ---------------------------------------------------------------------
create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles (id),
  max_uses int not null default 1,
  uses_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

-- ---------------------------------------------------------------------
-- RPC: redimir código de invitación (lo llama el usuario recién creado)
-- ---------------------------------------------------------------------
create or replace function public.redeem_invite_code(p_code text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.invite_codes%rowtype;
begin
  select * into v_invite
  from public.invite_codes
  where code = p_code
    and (expires_at is null or expires_at > now())
    and uses_count < max_uses
  for update;

  if not found then
    raise exception 'invalid_or_expired_code';
  end if;

  insert into public.memberships (user_id, community_id, status, invited_by, activated_at)
  values (auth.uid(), v_invite.community_id, 'active', v_invite.created_by, now())
  on conflict (user_id, community_id)
    do update set status = 'active', activated_at = now(), deactivated_at = null;

  update public.invite_codes
  set uses_count = uses_count + 1
  where id = v_invite.id;
end;
$$;

grant execute on function public.redeem_invite_code(text) to authenticated;

-- ---------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_select_head_coach_of_member" on public.profiles
  for select using (
    exists (
      select 1
      from public.memberships m
      join public.communities c on c.id = m.community_id
      where m.user_id = profiles.id and c.owner_id = auth.uid()
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- communities
create policy "communities_select_owner" on public.communities
  for select using (owner_id = auth.uid());

create policy "communities_select_member" on public.communities
  for select using (
    exists (
      select 1 from public.memberships m
      where m.community_id = communities.id and m.user_id = auth.uid()
    )
  );

create policy "communities_select_admin" on public.communities
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "communities_write_owner" on public.communities
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- memberships
create policy "memberships_select_self" on public.memberships
  for select using (user_id = auth.uid());

create policy "memberships_select_owner" on public.memberships
  for select using (
    exists (
      select 1 from public.communities c
      where c.id = memberships.community_id and c.owner_id = auth.uid()
    )
  );

create policy "memberships_write_owner" on public.memberships
  for all using (
    exists (
      select 1 from public.communities c
      where c.id = memberships.community_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.communities c
      where c.id = memberships.community_id and c.owner_id = auth.uid()
    )
  );

-- invite_codes
create policy "invite_codes_owner" on public.invite_codes
  for all using (
    exists (
      select 1 from public.communities c
      where c.id = invite_codes.community_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.communities c
      where c.id = invite_codes.community_id and c.owner_id = auth.uid()
    )
  );
