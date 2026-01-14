-- ======================================================
-- MÓDULO 1: TABLA user_rachas
-- ======================================================
-- Guarda el estado actual de la racha ecológica del usuario
-- NO guarda historial diario, solo estado agregado

create table if not exists public.user_rachas (
  user_id uuid primary key references public.profiles(id) on delete cascade,

  racha_actual int not null default 0,
  racha_maxima int not null default 0,

  ultima_fecha date, -- último día con al menos una misión diaria completada

  updated_at timestamp with time zone default now()
);

-- ======================================================
-- MÓDULO 2: RLS PARA user_rachas
-- ======================================================
-- El usuario solo puede LEER su propia racha
-- INSERT y UPDATE solo por triggers (backend)

alter table public.user_rachas enable row level security;

create policy "Users can read own streak"
on public.user_rachas
for select
to authenticated
using (user_id = auth.uid());

-- Permitir INSERT de racha solo para el propio usuario (via trigger)
create policy "System can insert user streak"
on public.user_rachas
for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- Permitir UPDATE de racha solo para el propio usuario (via trigger)
create policy "System can update user streak"
on public.user_rachas
for update
to authenticated
using (
  user_id = auth.uid()
);
