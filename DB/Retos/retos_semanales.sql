-- ======================================================
-- MÓDULO 1: TABLA retos_semanales
-- ======================================================
CREATE TABLE IF NOT EXISTS public.retos_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,

  -- categorias macro:
  -- energia | agua | transporte | residuos
  categoria TEXT NOT NULL CHECK (categoria IN ('energia', 'agua', 'transporte', 'residuos')),

  puntos_totales INT NOT NULL,
  kgco2_total NUMERIC(10,3) NOT NULL,

  -- NUEVO: vigencia del reto (UTC)
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,

  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);



alter table public.retos_semanales
add constraint retos_semanales_fechas_check
check (fecha_fin > fecha_inicio);


-- ======================================================
-- RLS retos_semanales
-- ======================================================
ALTER TABLE public.retos_semanales ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden leer retos activos
CREATE POLICY "Read active weekly challenges"
ON public.retos_semanales
FOR SELECT
TO authenticated
USING (activo = true);
