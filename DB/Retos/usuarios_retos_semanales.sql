-- ======================================================
-- MÓDULO 3: TABLA usuarios_retos_semanales
-- ======================================================
CREATE TABLE IF NOT EXISTS public.usuarios_retos_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  reto_semanal_id UUID NOT NULL
    REFERENCES public.retos_semanales(id)
    ON DELETE CASCADE,

  -- activo | completado | abandonado
  estado TEXT NOT NULL DEFAULT 'activo',

  progreso INT DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ======================================================
-- RLS usuarios_retos_semanales
-- ======================================================
ALTER TABLE public.usuarios_retos_semanales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own weekly challenges"
ON public.usuarios_retos_semanales
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Insert own weekly challenge"
ON public.usuarios_retos_semanales
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own weekly challenge"
ON public.usuarios_retos_semanales
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
