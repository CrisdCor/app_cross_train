-- Ronda 2: login con usuario o correo, bandeja de notificaciones y aviso al
-- head coach cuando un atleta pide unirse a su comunidad.

-- ---------------------------------------------------------------------
-- 1) Tabla de notificaciones
-- ---------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('join_request', 'join_approved', 'join_rejected', 'system')),
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = auth.uid());

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

-- ---------------------------------------------------------------------
-- 2) Login con username: resuelve el correo asociado a un @usuario.
--    Solo devuelve el correo si el username existe exactamente (sin
--    búsqueda parcial), disponible para anon porque se usa antes de
--    autenticar.
-- ---------------------------------------------------------------------

create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer set search_path = public
stable
as $$
  select email from public.profiles where username = lower(p_username) limit 1;
$$;

revoke execute on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to authenticated, anon;

-- ---------------------------------------------------------------------
-- 3) Marcar notificación como leída (propia únicamente)
-- ---------------------------------------------------------------------

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.notifications
  set read_at = now()
  where id = p_notification_id and recipient_id = auth.uid() and read_at is null;
end;
$$;

revoke execute on function public.mark_notification_read(uuid) from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 4) Notificar al head coach cuando un atleta pide unirse, y notificar
--    de vuelta al atleta cuando se aprueba/rechaza.
-- ---------------------------------------------------------------------

create or replace function public.request_join_community(p_community_id uuid)
returns public.community_join_requests
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.community_join_requests%rowtype;
  v_owner_id uuid;
  v_athlete_username text;
begin
  if exists (
    select 1 from public.memberships
    where athlete_id = auth.uid() and community_id = p_community_id and status = 'active'
  ) then
    raise exception 'already_member';
  end if;

  select owner_id into v_owner_id from public.communities where id = p_community_id;
  if v_owner_id is null then
    raise exception 'community_not_found';
  end if;

  select username into v_athlete_username from public.profiles where id = auth.uid();

  insert into public.community_join_requests (community_id, athlete_id)
  values (p_community_id, auth.uid())
  returning * into v_row;

  insert into public.notifications (recipient_id, type, title, body, data)
  values (
    v_owner_id,
    'join_request',
    'Nueva solicitud para tu comunidad',
    '@' || v_athlete_username || ' quiere unirse a tu comunidad.',
    jsonb_build_object(
      'request_id', v_row.id,
      'athlete_id', auth.uid(),
      'athlete_username', v_athlete_username,
      'status', 'pending'
    )
  );

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

  update public.notifications
  set data = data || jsonb_build_object('status', 'approved'), read_at = coalesce(read_at, now())
  where type = 'join_request' and (data ->> 'request_id')::uuid = p_request_id;

  insert into public.notifications (recipient_id, type, title, body, data)
  values (
    v_athlete_id,
    'join_approved',
    'Solicitud aprobada',
    'Tu solicitud para unirte a la comunidad fue aprobada.',
    jsonb_build_object('community_id', v_community_id)
  );
end;
$$;

create or replace function public.reject_join_request(p_request_id uuid)
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
  set status = 'rejected', resolved_at = now(), resolved_by = auth.uid()
  where id = p_request_id;

  update public.notifications
  set data = data || jsonb_build_object('status', 'rejected'), read_at = coalesce(read_at, now())
  where type = 'join_request' and (data ->> 'request_id')::uuid = p_request_id;

  insert into public.notifications (recipient_id, type, title, body, data)
  values (
    v_athlete_id,
    'join_rejected',
    'Solicitud rechazada',
    'Tu solicitud para unirte a la comunidad fue rechazada.',
    jsonb_build_object('community_id', v_community_id)
  );
end;
$$;
