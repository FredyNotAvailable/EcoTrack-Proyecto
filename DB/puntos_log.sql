-- ======================================================
-- MÓDULO 1: TABLA puntos_logs (FUENTE DE VERDAD)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.puntos_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  puntos INT NOT NULL,

  -- origen lógico del puntaje
  -- 'mision' | 'reto' | 'post' | 'comentario'
  origen TEXT NOT NULL,

  -- id del objeto que generó los puntos
  referencia_id UUID,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS puntos_logs
-- ======================================================
ALTER TABLE public.puntos_logs ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede leer su historial
DROP POLICY IF EXISTS "Users can read own points logs" ON public.puntos_logs;
CREATE POLICY "Users can read own points logs"
ON public.puntos_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Inserción permitida solo para el propio usuario
-- (normalmente realizada por triggers o backend)
DROP POLICY IF EXISTS "System can insert points logs" ON public.puntos_logs;
CREATE POLICY "System can insert points logs"
ON public.puntos_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- BORRAR logs propios (para DELETE de post)
DROP POLICY IF EXISTS "Delete own points logs" ON public.puntos_logs;
create policy "Delete own points logs"
on public.puntos_logs
for delete
to authenticated
using (user_id = auth.uid());
