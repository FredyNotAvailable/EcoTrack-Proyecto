-- ======================================================
-- MÓDULO 4: TABLA usuarios_retos_tareas
-- ======================================================
CREATE TABLE IF NOT EXISTS public.usuarios_retos_tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_reto_id UUID NOT NULL
    REFERENCES public.usuarios_retos_semanales(id)
    ON DELETE CASCADE,

  tarea_id UUID NOT NULL
    REFERENCES public.retos_semanales_tareas(id)
    ON DELETE CASCADE,

  completado BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- ======================================================
-- RLS usuarios_retos_tareas
-- ======================================================
ALTER TABLE public.usuarios_retos_tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own weekly challenge tasks"
ON public.usuarios_retos_tareas
FOR SELECT
TO authenticated
USING (
  user_reto_id IN (
    SELECT id
    FROM public.usuarios_retos_semanales
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Insert own weekly challenge tasks"
ON public.usuarios_retos_tareas
FOR INSERT
TO authenticated
WITH CHECK (
  user_reto_id IN (
    SELECT id
    FROM public.usuarios_retos_semanales
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Update own weekly challenge tasks"
ON public.usuarios_retos_tareas
FOR UPDATE
TO authenticated
USING (
  user_reto_id IN (
    SELECT id
    FROM public.usuarios_retos_semanales
    WHERE user_id = auth.uid()
  )
);
