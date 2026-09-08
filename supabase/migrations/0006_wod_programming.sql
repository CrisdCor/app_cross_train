-- Ronda 5: programación diaria (WOD). El Head Coach arma el entrenamiento de
-- un día para su comunidad en 5 bloques fijos: calentamiento, fuerza,
-- habilidad, wod y accesorios. Cada bloque tiene un formato libre (AMRAP,
-- EMOM, FOR TIME...), rondas opcionales, observaciones y una lista de
-- ejercicios (nombre, repeticiones, peso fijo o % de RM). El bloque "wod"
-- además puede llevar una tabla de pesos por categoría (Principiante,
-- Intermedio, Avanzado, RX...) con valor para hombre y mujer.
--
-- Todo el contenido de un día se guarda de forma atómica con save_workout()
-- (upsert + reemplazo completo de bloques) y se lee de forma anidada con
-- get_workout() (arma el jsonb del día completo en una sola llamada). Ambas
-- son SECURITY DEFINER y reutilizan is_community_owner()/is_community_member()
-- para autorizar — las tablas en sí quedan con RLS activo y sin políticas,
-- así que solo son accesibles a través de estas dos funciones.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  workout_date date not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, workout_date)
);

alter table public.workouts enable row level security;

create table public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  block_type text not null check (block_type in ('warmup', 'strength', 'skill', 'wod', 'accessories')),
  order_index int not null default 0,
  format text not null default '',
  rounds int,
  observations text not null default '',
  unique (workout_id, block_type)
);

alter table public.workout_blocks enable row level security;

create table public.workout_movements (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_blocks (id) on delete cascade,
  order_index int not null default 0,
  name text not null,
  reps text not null default '',
  weight_type text check (weight_type in ('fixed', 'percentage')),
  weight_value text not null default ''
);

alter table public.workout_movements enable row level security;

create table public.workout_wod_categories (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.workout_blocks (id) on delete cascade,
  order_index int not null default 0,
  category_name text not null,
  weight_male text not null default '',
  weight_female text not null default ''
);

alter table public.workout_wod_categories enable row level security;

create trigger trg_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- Arma el jsonb anidado de la programación de un día: bloques, ejercicios y,
-- si aplica, la tabla de pesos por categoría del wod. null si ese día no
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
          'blockType', b.block_type,
          'format', b.format,
          'rounds', b.rounds,
          'observations', b.observations,
          'movements', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'name', m.name,
                'reps', m.reps,
                'weightType', m.weight_type,
                'weightValue', m.weight_value
              ) order by m.order_index
            )
            from public.workout_movements m
            where m.block_id = b.id
          ), '[]'::jsonb),
          'categories', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'name', c.category_name,
                'weightMale', c.weight_male,
                'weightFemale', c.weight_female
              ) order by c.order_index
            )
            from public.workout_wod_categories c
            where c.block_id = b.id
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
-- borra y reinserta bloques/ejercicios/categorías desde el jsonb recibido).
-- Solo el dueño de la comunidad puede escribir su propia programación.
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
  v_movement jsonb;
  v_category jsonb;
  v_block_id uuid;
  v_block_order int := 0;
  v_movement_order int;
  v_category_order int;
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

    insert into public.workout_blocks (workout_id, block_type, order_index, format, rounds, observations)
    values (
      v_workout_id,
      v_block ->> 'blockType',
      v_block_order,
      coalesce(v_block ->> 'format', ''),
      nullif(v_block ->> 'rounds', '')::int,
      coalesce(v_block ->> 'observations', '')
    )
    returning id into v_block_id;

    v_movement_order := 0;
    for v_movement in select * from jsonb_array_elements(coalesce(v_block -> 'movements', '[]'::jsonb))
    loop
      v_movement_order := v_movement_order + 1;
      insert into public.workout_movements (block_id, order_index, name, reps, weight_type, weight_value)
      values (
        v_block_id,
        v_movement_order,
        v_movement ->> 'name',
        coalesce(v_movement ->> 'reps', ''),
        nullif(v_movement ->> 'weightType', ''),
        coalesce(v_movement ->> 'weightValue', '')
      );
    end loop;

    v_category_order := 0;
    for v_category in select * from jsonb_array_elements(coalesce(v_block -> 'categories', '[]'::jsonb))
    loop
      v_category_order := v_category_order + 1;
      insert into public.workout_wod_categories (block_id, order_index, category_name, weight_male, weight_female)
      values (
        v_block_id,
        v_category_order,
        v_category ->> 'name',
        coalesce(v_category ->> 'weightMale', ''),
        coalesce(v_category ->> 'weightFemale', '')
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
