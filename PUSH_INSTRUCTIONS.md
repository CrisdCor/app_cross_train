# Push manual a GitHub + configuración de Vercel

## 1. Por qué es manual

El sandbox no tiene permiso de escritura sobre `CrisdCor/app_cross_train` (el proxy
de la plataforma exige que el repo esté autorizado explícitamente para push, y
no lo está). La lectura sí funciona, así que confirmé que el repo remoto sigue
vacío. El resto del trabajo (código, build, Supabase, Vercel) ya está listo;
solo falta este push.

## 2. Aplicar el bundle

En tu máquina, con git instalado:

```bash
git clone app-cross-train.bundle app-cross-train
cd app-cross-train
git remote set-url origin https://github.com/CrisdCor/app_cross_train.git
git push origin main
```

Si ya tienes una copia local del repo, en su lugar:

```bash
cd /ruta/a/tu/app-cross-train
git fetch /ruta/al/app-cross-train.bundle main:main
git checkout main
git push origin main
```

## 3. Configurar variables de entorno en Vercel

El proyecto Vercel ya está creado y enlazado a este repo (se desplegará
automáticamente en cada push a `main`). Antes de que el primer deploy sea
útil, agrega estas dos variables en Vercel → Project Settings → Environment
Variables (entorno: Production, Preview y Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://zwxwboksjqbucpzazbmk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHdib2tzanFidWNwemF6Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTk3OTYsImV4cCI6MjEwMzA3NTc5Nn0.EctPp6R-z9w4pco4AO7IWr8qbOjdUTmLDwpoDehwBy8
```

## 4. Verificar

Después del push, Vercel desplegará automáticamente. Con la URL que te dé
Vercel, entra a `/login` con:

- Correo: `cristiandavid.corrales@gmail.com`
- Contraseña: `AppCrossTrain#2026`

Deberías ver tu rol como **Administrador**. Desde ahí puedes crear las cuentas
de Head Coach y Atleta usando `/signup`, tal como quedamos.
