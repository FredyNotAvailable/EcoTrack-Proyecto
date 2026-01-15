-- =====================================================
-- FUNCIÓN PARA OBTENER HASHTAGS POPULARES (VERSION CORREGIDA)
-- =====================================================
-- Esta función realiza un unnest de la columna hashtags y
-- cuenta las ocurrencias para devolver el top 5 (ajustado a la UI).

-- Primero eliminamos si existe para evitar conflictos de firma
DROP FUNCTION IF EXISTS get_popular_hashtags();

CREATE OR REPLACE FUNCTION get_popular_hashtags()
RETURNS TABLE (hashtag text, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permite ejecutar con privilegios del creador (bypass RLS)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tag as hashtag, 
    COUNT(*)::bigint as count
  FROM (
    SELECT unnest(hashtags) as tag
    FROM posts
    WHERE is_public = true
  ) t
  WHERE t.tag IS NOT NULL AND t.tag != ''
  GROUP BY t.tag
  ORDER BY count DESC
  LIMIT 5;
END;
$$;

-- Otorgar permisos de ejecución para roles de Supabase
GRANT EXECUTE ON FUNCTION get_popular_hashtags() TO anon;
GRANT EXECUTE ON FUNCTION get_popular_hashtags() TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_hashtags() TO service_role;
