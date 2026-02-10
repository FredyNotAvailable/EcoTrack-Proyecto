-- ======================================================
-- 1. CREAR TABLA PROFILES
-- ======================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,

  username text UNIQUE,
  avatar_url text,
  bio text,

  role text NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),

  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
