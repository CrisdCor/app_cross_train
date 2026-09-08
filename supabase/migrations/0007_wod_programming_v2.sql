-- Ronda 11: modelo de programación más robusto, según el detalle que dio
-- Cris. Cambios respecto a 0006:
--   * Las secciones fijas pasan de 5 a 7: calentamiento, fuerza,
--     levantamiento, gimnasia, metcon, wod, accesorios.
--   * Una sección ya no es "un bloque" — puede tener uno o más bloques de
--     trabajo (ej. "WOD A", "WOD B"), cada uno con su propio formato y
--     configuración.
--   * El formato deja de ser texto libre: ahora es EMOM / AMRAP / For
--     Time, cada uno con su propia configuración de tiempo — EMOM usa
--     duración total + ventana por ronda (no siempre 1 minuto); AMRAP usa
--     solo duración total; For Time usa rondas (1 = chipper) + un cap de
--     tiempo opcional.
--   * Cada ejercicio lleva su propia tabla de peso (lbs) por categoría y
--     género — reemplaza el peso fijo/% RM y la tabla de categorías que
--     antes vivía solo en el bloque WOD.
--   * Las observaciones pasan de un texto único a una lista de
--     observaciones por bloque (se renderizan sin numeración, en un
--     contenedor al final del bloque).
--
-- Se reemplazan por completo las tablas de la Ronda 5 (0006) — solo había
-- datos de prueba, no hay migración de datos real que preservar.

drop table if exists public.workout_wod_categories;
drop table if exists public.workout_movements;
drop table if exists public.workout_blocks;

create table public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  section_type text not null check (
    section_type in ('warmup', 'strength', 'weightlifting', 'gymnastics', 'metcon', 'wod', 'accessories')
  ),
  order_index int not null default 0,
  label text not null default '',
  format text not null check (format in ('emom', 'amrap', 'for_time')),
  total_seconds int,
  interval_seconds int,
  rounds int,
  observations jsonb not null default '[]'::jsonb
);

alter table public.workout_blocks enable row level security;

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_blocks (id) on delete cascade,
  order_index int not null default 0,
  name text not null,
  reps text not null default '',
  weights jsonb not null default '[]'::jsonb
);

alter table public.workout_exercises enable row level security;

-- Arma el jsonb anidado de la programación de un día: secciones -> bloques
-- de trabajo -> ejercicios (con su tabla de pesos). null si ese día no
-- tiene programación. Requiere ser dueño o miembro activo de la comunidad.
create or replace function public.get_workout(p_community_id uuid, p_workout_date date)
returns jsonb
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_workout_id uuid;
  v_result jsonb;
begin
  if not (public.is_community_owner(p_community_id) or public.is_community_member(p_community_id)) then
    raise exception 'not_authorized';
  end if;

  select id into v_workout_id
  from public.workouts
  where community_id = p_community_id and workout_date = p_workout_date;

  if v_workout_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', w.id,
    'workoutDate', to_char(w.workout_date, 'YYYY-MM-DD'),
    'blocks', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'sectionType', b.section_type,
          'orderIndex', b.order_index,
          'label', b.label,
          'format', b.format,
          'totalSeconds', b.total_seconds,
          'intervalSeconds', b.interval_seconds,
          'rounds', b.rounds,
          'observations', b.observations,
          'exercises', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'name', e.name,
                'reps', e.reps,
                'weights', e.weights
              ) order by e.order_index
            )
            from public.workout_exercises e
            where e.block_id = b.id
          ), '[]'::jsonb)
        )
        order by b.order_index
      )
      from public.workout_blocks b
      where b.workout_id = w.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.workouts w
  where w.id = v_workout_id;

  return v_result;
end;
$$;

-- Reemplaza por completo la programación de un día (upsert del workout,
-- borra y reinserta bloques/ejercicios desde el jsonb recibido). Solo el
-- dueño de la comunidad puede escribir su propia programación.
create or replace function public.save_workout(
  p_community_id uuid,
  p_workout_date date,
  p_blocks jsonb
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_workout_id uuid;
  v_block jsonb;
  v_exercise jsonb;
  v_block_id uuid;
  v_block_order int := 0;
  v_exercise_order int;
begin
  if not public.is_community_owner(p_community_id) then
    raise exception 'not_community_owner';
  end if;

  insert into public.workouts (community_id, workout_date, created_by)
  values (p_community_id, p_workout_date, auth.uid())
  on conflict (community_id, workout_date)
    do update set updated_at = now()
  returning id into v_workout_id;

  delete from public.workout_blocks where workout_id = v_workout_id;

  for v_block in select * from jsonb_array_elements(coalesce(p_blocks, '[]'::jsonb))
  loop
    v_block_order := v_block_order + 1;

    insert into public.workout_blocks (
      workout_id, section_type, order_index, label, format, total_seconds, interval_seconds, rounds, observations
    )
    values (
      v_workout_id,
      v_block ->> 'sectionType',
      v_block_order,
      coalesce(v_block ->> 'label', ''),
      v_block ->> 'format',
      nullif(v_block ->> 'totalSeconds', '')::int,
      nullif(v_block ->> 'intervalSeconds', '')::int,
      nullif(v_block ->> 'rounds', '')::int,
      coalesce(v_block -> 'observations', '[]'::jsonb)
    )
    returning id into v_block_id;

    v_exercise_order := 0;
    for v_exercise in select * from jsonb_array_elements(coalesce(v_block -> 'exercises', '[]'::jsonb))
    loop
      v_exercise_order := v_exercise_order + 1;
      insert into public.workout_exercises (block_id, order_index, name, reps, weights)
      values (
        v_block_id,
        v_exercise_order,
        v_exercise ->> 'name',
        coalesce(v_exercise ->> 'reps', ''),
        coalesce(v_exercise -> 'weights', '[]'::jsonb)
      );
    end loop;
  end loop;

  return v_workout_id;
end;
$$;

revoke execute on function public.get_workout(uuid, date) from public, anon;
revoke execute on function public.save_workout(uuid, date, jsonb) from public, anon;
grant execute on function public.get_workout(uuid, date) to authenticated;
grant execute on function public.save_workout(uuid, date, jsonb) to authenticated;
