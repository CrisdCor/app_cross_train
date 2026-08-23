-- Los códigos de invitación (rol y comunidad) ahora se comparan sin importar
-- mayúsculas/minúsculas ni espacios extra al escribirlos.

create or replace function public.redeem_role_code(p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.role_invite_codes%rowtype;
  v_normalized text := upper(trim(p_code));
begin
  select * into v_invite
  from public.role_invite_codes
  where code = v_normalized
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

create or replace function public.redeem_invite_code(p_code text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite public.invite_codes%rowtype;
  v_normalized text := upper(trim(p_code));
begin
  select * into v_invite
  from public.invite_codes
  where code = v_normalized
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
