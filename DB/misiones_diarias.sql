-- ======================================================
-- TABLA: misiones_diarias (Asegurar existencia)
-- ======================================================
create table if not exists public.misiones_diarias (
  id uuid primary key default gen_random_uuid(),

  titulo text not null,
  descripcion text not null,

  eco_tip text,
  impacto text,

  kg_co2_ahorrado numeric(10,2),
  puntos int not null,

  dificultad text, -- 'Fácil', 'Media', 'Difícil' (opcional)
  activa boolean default true,

  created_at timestamp with time zone default now()
);

-- ======================================================
-- ROW LEVEL SECURITY: misiones_diarias
-- ======================================================
alter table public.misiones_diarias enable row level security;

-- Lectura pública para usuarios autenticados
drop policy if exists "Authenticated users can read daily missions" on public.misiones_diarias;
create policy "Authenticated users can read daily missions"
on public.misiones_diarias
for select
to authenticated
using ( true );
