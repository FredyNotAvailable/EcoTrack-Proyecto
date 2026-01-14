-- ======================================================
-- MÓDULO 1: TABLA niveles
-- ======================================================
-- Define las reglas del sistema de niveles
-- ESTA es la fuente de verdad
-- Cambiar niveles NO requiere tocar frontend ni triggers

create table if not exists public.niveles (
  nivel int primary key,
  puntos_minimos int not null
);

-- ======================================================
-- MÓDULO 2: DATA INICIAL DE NIVELES
-- ======================================================
-- Puedes modificar estos valores cuando quieras

insert into public.niveles (nivel, puntos_minimos) values
(1, 0),
(2, 100),
(3, 300),
(4, 600),
(5, 1000),
(6, 3000),
(7, 5000),
(8, 7000),
(9, 10000)
on conflict (nivel) do nothing;

