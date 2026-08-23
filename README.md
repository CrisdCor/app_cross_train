# App Cross Train

App mobile-first (PWA) para entrenadores/boxes de CrossFit: comparten con sus
atletas la programación del día (movilidad, calentamiento, fuerza/habilidad,
WOD, accesorios) y hacen seguimiento de su comunidad.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Auth + Postgres + Storage) vía `@supabase/ssr`
- framer-motion para las animaciones de navegación
- Tipografías self-hosted: Audiowide (títulos) y Exo 2 (texto)

## Cómo correr el proyecto en local

```bash
npm install
npm run dev
```

Antes de correrlo, crea un archivo `.env.local` en la raíz del proyecto (no se
sincroniza automáticamente por seguridad) con este contenido, reemplazando
los valores por los de tu proyecto de Supabase (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Abre http://localhost:3000 — te manda directo a `/login`.

## Variables de entorno

Ver `.env.local.example`. Se obtienen desde el dashboard de Supabase del
proyecto (Project Settings → API).

## Estructura

```
src/
  app/
    login/          pantalla de inicio de sesión
    signup/         registro de atleta (con código de invitación opcional)
    home/            feed/home con navegación semanal (shell inicial)
    workout/         placeholder del detalle de la sesión
    perfil/          perfil del usuario + cerrar sesión
  components/
    ui/              primitivas: Button, Input, Card, BottomNav, WeekDayStrip...
    home/            piezas específicas del home
  lib/
    supabase/        clientes de Supabase (browser, server, middleware)
    types.ts         tipos compartidos (Role, Profile, Community, Membership)
supabase/
  migrations/         esquema SQL versionado (roles, comunidades, invitaciones)
```

## Modelo de datos (resumen)

- **profiles**: perfil de cada usuario autenticado, con `role` en
  `admin | head_coach | coach | user`.
- **communities**: la "red" de un Head Coach (o futuro Box). Se crea sola
  cuando un perfil pasa a `head_coach`.
- **memberships**: relación usuario↔comunidad con estado `active/inactive`
  (control manual de mensualidad por ahora).
- **invite_codes** + función `redeem_invite_code`: un atleta entra a una
  comunidad canjeando un código que genera su Head Coach.

Ver `supabase/migrations/0001_init.sql` para el detalle completo (incluye
políticas de RLS).

## Roadmap inmediato (no incluido aún)

- Panel del Head Coach: crear planes, generar códigos de invitación,
  activar/inactivar atletas.
- Programación real por día (contenido de cada bloque) en vez del placeholder.
- Seguimiento de RM/PR/marcas personales.
- Feed social tipo historias 24h.
