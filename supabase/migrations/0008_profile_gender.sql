-- Ronda: agrega el sexo (hombre/mujer) a la información del perfil.
-- Obligatorio para completar el perfil (Head Coach y Atleta), igual que
-- nombre y biografía; nullable a nivel de columna porque los perfiles
-- existentes aún no lo tienen y se editan igual que el resto de campos
-- del perfil (UPDATE directo vía la política `profiles_update_own`, sin
-- RPC nuevo).

alter table public.profiles
  add column gender text check (gender in ('male', 'female'));
