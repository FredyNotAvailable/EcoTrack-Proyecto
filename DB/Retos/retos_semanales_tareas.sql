-- ======================================================
-- MÓDULO 2: TABLA retos_semanales_tareas
-- ======================================================
CREATE TABLE IF NOT EXISTS public.retos_semanales_tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  reto_semanal_id UUID NOT NULL
    REFERENCES public.retos_semanales(id)
    ON DELETE CASCADE,

  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,

  -- 1=Lunes ... 5=Viernes
  dia_orden INT NOT NULL,

  puntos INT NOT NULL,
  kgco2 NUMERIC(10,3) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS retos_semanales_tareas
-- ======================================================
ALTER TABLE public.retos_semanales_tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read weekly challenge tasks"
ON public.retos_semanales_tareas
FOR SELECT
TO authenticated
USING (true);
