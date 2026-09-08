-- Los triggers `ensure_head_coach_community` y `prevent_role_self_escalation`
-- son de uso interno (solo deben dispararse vía trigger), pero al crearse
-- quedaron ejecutables por RPC para anon/authenticated. Se revoca ese acceso.

revoke execute on function public.ensure_head_coach_community() from public, anon, authenticated;
revoke execute on function public.prevent_role_self_escalation() from public, anon, authenticated;
