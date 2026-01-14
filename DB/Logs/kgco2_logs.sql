-- ======================================================
-- MÓDULO: TABLA kgco2_logs (FUENTE DE VERDAD)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.kgco2_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  -- cantidad de CO2 ahorrado o generado (en kilogramos)
  kg_co2 NUMERIC(10, 3) NOT NULL,

  -- origen lógico del registro
  -- 'mision' | 'reto' | 'post' | 'comentario'
  origen TEXT NOT NULL,

  -- id del objeto que generó el registro de CO2
  referencia_id UUID,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- RLS kgco2_logs
-- ======================================================
ALTER TABLE public.kgco2_logs ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede leer su historial de CO2
CREATE POLICY "Users can read own kgco2 logs"
ON public.kgco2_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Inserción permitida solo para el propio usuario
-- (normalmente realizada por triggers del sistema)
CREATE POLICY "System can insert kgco2 logs"
ON public.kgco2_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir borrar registros propios
-- (ej. cuando se elimina un post o misión)
CREATE POLICY "Delete own kgco2 logs"
ON public.kgco2_logs
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
