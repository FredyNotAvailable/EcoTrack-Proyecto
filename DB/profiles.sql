-- ======================================================
-- 1. CREAR TABLA PROFILES
-- ======================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  username text unique,
  avatar_url text,
  bio text,

  puntos_totales int default 0,
  nivel int default 1,

  rol text default 'usuario',

  is_verified boolean default false,
  is_completed boolean default false,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ======================================================
-- 2. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ======================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ======================================================
-- 3. TRIGGER PARA updated_at
-- ======================================================
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

-- ======================================================
-- 4. ACTIVAR ROW LEVEL SECURITY
-- ======================================================
alter table public.profiles
enable row level security;

-- ======================================================
-- 5. POLÍTICAS RLS
-- ======================================================

-- 5.1 SELECT:
-- Usuarios autenticados pueden ver perfiles (ranking, comunidad, etc.)
create policy "Profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using ( true );

-- 5.2 INSERT:
-- Cada usuario solo puede crear SU propio perfil
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ( id = auth.uid() );

-- 5.3 UPDATE:
-- Cada usuario solo puede actualizar SU perfil
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ( id = auth.uid() )
with check ( id = auth.uid() );

-- 5.4 DELETE:
-- Cada usuario solo puede eliminar SU perfil
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ( id = auth.uid() );
