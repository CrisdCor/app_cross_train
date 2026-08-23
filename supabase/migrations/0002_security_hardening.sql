-- Corrige hallazgos del linter de seguridad de Supabase:
-- 1) search_path mutable en función de trigger
-- 2) funciones SECURITY DEFINER de uso interno (triggers) expuestas como RPC público
--
-- Nota: Supabase otorga EXECUTE a anon/authenticated por defecto (default privileges)
-- al crear funciones en el esquema public, así que "revoke ... from public" no basta;
-- hay que revocar explícitamente de cada rol.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.ensure_head_coach_community() from public, anon, authenticated;

-- redeem_invite_code es intencional que lo llame un usuario autenticado (RPC de canje
-- de código al registrarse/unirse a una comunidad); solo se le quita a anon.
revoke execute on function public.redeem_invite_code(text) from public, anon;
