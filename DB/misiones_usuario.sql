-- ======================================================
-- TABLA: misiones_usuario
-- ======================================================
create table if not exists public.misiones_usuario (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id) on delete cascade,

  mision_id uuid not null references public.misiones_diarias(id) on delete cascade,

  fecha date not null default current_date,
  created_at timestamp with time zone default now(),

  -- Evita que un usuario complete la misma misión más de una vez por día
  unique (user_id, mision_id, fecha)
);

-- ======================================================
-- ROW LEVEL SECURITY: misiones_usuario
-- ======================================================
alter table public.misiones_usuario enable row level security;

-- El usuario puede ver solo SUS misiones completadas
drop policy if exists "Users can read their own daily missions" on public.misiones_usuario;
create policy "Users can read their own daily missions"
on public.misiones_usuario
for select
to authenticated
using ( user_id = auth.uid() );

-- El usuario puede insertar solo SUS misiones
drop policy if exists "Users can complete a daily mission" on public.misiones_usuario;
create policy "Users can complete a daily mission"
on public.misiones_usuario
for insert
to authenticated
with check ( user_id = auth.uid() );

-- El usuario NO puede actualizar misiones (son eventos)
drop policy if exists "Users cannot update daily missions" on public.misiones_usuario;
create policy "Users cannot update daily missions"
on public.misiones_usuario
for update
to authenticated
using ( false );

-- El usuario NO puede borrar misiones (historial)
drop policy if exists "Users cannot delete daily missions" on public.misiones_usuario;
create policy "Users cannot delete daily missions"
on public.misiones_usuario
for delete
to authenticated
using ( false );