-- =====================================================
-- TABLA: user_stats
-- MÓDULO: Progreso y estadísticas del usuario
--
-- Esta tabla almacena un RESUMEN del estado actual del
-- usuario dentro de EcoTrack. No es la fuente de verdad,
-- sino un cache/estado derivado para consultas rápidas
-- como dashboard, perfil y ranking.
--
-- Contiene:
-- - Progreso del usuario (puntos, nivel, experiencia)
-- - Impacto ambiental acumulado (kg CO2)
-- - Actividad y constancia (retos, misiones)
-- - Participación en la comunidad (posts, comentarios, likes)
--
-- Los valores de esta tabla se actualizan únicamente desde
-- el backend, a partir de logs y acciones del usuario.
-- Nunca deben ser modificados directamente por el frontend.
-- =====================================================

CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Progreso general
  puntos_totales int NOT NULL DEFAULT 0,
  nivel int NOT NULL DEFAULT 1,
  experiencia int NOT NULL DEFAULT 0,

  -- Impacto ambiental
  kg_co2_ahorrado numeric(10,2) NOT NULL DEFAULT 0,

  -- Actividad y constancia
  retos_completados int NOT NULL DEFAULT 0,
  misiones_diarias_completadas int NOT NULL DEFAULT 0,

  -- Comunidad
  posts_creados int NOT NULL DEFAULT 0,
  comentarios_creados int NOT NULL DEFAULT 0,
  likes_recibidos int NOT NULL DEFAULT 0,

  -- Metadatos
  ultimo_evento timestamptz, -- Última interacción relevante del usuario
  updated_at timestamptz DEFAULT now()
);


-- =====================================================
-- RLS: user_stats
-- El backend (service role) maneja escritura total.
-- El frontend SOLO puede leer sus propios stats.
-- =====================================================

-- Activar RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- READ: el usuario puede ver SOLO sus propias estadísticas
-- =====================================================
CREATE POLICY "Read own user stats"
ON public.user_stats
FOR SELECT
USING (
  auth.uid() = user_id
);

-- =====================================================
-- INSERT: bloqueado para clientes (solo backend/service role)
-- =====================================================
CREATE POLICY "No insert from client"
ON public.user_stats
FOR INSERT
WITH CHECK (
  false
);

-- =====================================================
-- UPDATE: bloqueado para clientes (solo backend/service role)
-- =====================================================
CREATE POLICY "No update from client"
ON public.user_stats
FOR UPDATE
USING (
  false
);

-- =====================================================
-- DELETE: bloqueado para clientes (no se borra desde frontend)
-- =====================================================
CREATE POLICY "No delete from client"
ON public.user_stats
FOR DELETE
USING (
  false
);
