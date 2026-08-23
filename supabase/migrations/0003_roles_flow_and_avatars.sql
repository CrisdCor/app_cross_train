-- Soporta el nuevo flujo de onboarding:
-- - Campo whatsapp en el perfil
-- - community_id en profiles (afiliación futura del rol 'coach' a un box)
-- - role_invite_codes: códigos que el Admin emite para registrarse como
--   head_coach, y que un Head Coach emite para registrar coaches de su box
-- - RPC redeem_role_code: canjea el código y asigna el rol correspondiente
-- - Bucket de Storage 'avatars' para la foto de perfil

alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles
  add column if not exists community_id uuid references public.communities (id);

-- ---------------------------------------------------------------------
-- role_invite_codes
-- ---------------------------------------------------------------------
create table if not exists public.role_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  target_role text not null check (target_role in ('head_coach', 'coach')),
  community_id uuid references public.communities (id), -- requerido solo si target_role = 'coach'
  created_by uuid not null references public.profiles (id),
  max_uses int not null default 1,
  uses_count int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.role_invite_codes enable row level security;

create policy "role_invite_codes_admin_all" on public.role_invite_codes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "role_invite_codes_head_coach_coach_codes" on public.role_invite_codes
  for all using (
    target_role = 'coach'
    and exists (
      select 1 from public.communities c
      where c.id = role_invite_codes.community_id and c.owner_id = auth.uid()
    )
  )
  with check (
    target_role = 'coach'
    and exists (
      select 1 from public.communities c
      where c.id = role_invite_codes.community_id and c.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- RPC: canjear código de rol (head_coach o coach) al registrarse
-- ---------------------------------------------------------------------
create or replace function public.redeem_role_code(p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.role_invite_codes%rowtype;
begin
  select * into v_invite
  from public.role_invite_codes
  where code = p_code
    and (expires_at is null or expires_at > now())
    and uses_count < max_uses
  for update;

  if not found then
    raise exception 'invalid_or_expired_code';
  end if;

  update public.profiles
  set role = v_invite.target_role,
      community_id = v_invite.community_id
  where id = auth.uid();

  update public.role_invite_codes
  set uses_count = uses_count + 1
  where id = v_invite.id;

  return v_invite.target_role;
end;
$$;

revoke execute on function public.redeem_role_code(text) from public, anon;
grant execute on function public.redeem_role_code(text) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: avatars (público de lectura, escritura solo en la carpeta propia)
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
