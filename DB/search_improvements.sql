-- =====================================================
-- MEJORAS DE BÚSQUEDA (Soporte de tildes y corrección de esquema)
-- =====================================================

-- 1. Habilitar la extensión 'unaccent' para ignorar tildes
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Asegurar que existe la columna 'full_name' en 'profiles'
-- Si no existe, la agregamos. Si existe, no hace nada.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;
END $$;

-- 3. Función mejorada para buscar HASHTAGS (ignorando tildes y mayúsculas)
DROP FUNCTION IF EXISTS search_hashtags(text);

CREATE OR REPLACE FUNCTION search_hashtags(search_query text)
RETURNS TABLE (hashtag text, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
  WHERE unaccent(t.tag) ILIKE unaccent('%' || search_query || '%')
     OR unaccent(t.tag) ILIKE unaccent(search_query || '%')
  GROUP BY t.tag
  ORDER BY count DESC
  LIMIT 5;
END;
$$;

-- 4. Nueva función para buscar PERFILES (ignorando tildes)
-- Soluciona el error "column profiles.full_name does not exist"
DROP FUNCTION IF EXISTS search_profiles(text);

CREATE OR REPLACE FUNCTION search_profiles(search_query text)
RETURNS TABLE (id uuid, username text, full_name text, avatar_url text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.username, 
    COALESCE(p.full_name, ''), -- Retorna string vacío si es nulo
    p.avatar_url
  FROM profiles p
  WHERE 
    unaccent(p.username) ILIKE unaccent('%' || search_query || '%') 
    OR 
    (p.full_name IS NOT NULL AND unaccent(p.full_name) ILIKE unaccent('%' || search_query || '%'))
  LIMIT 5;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION search_hashtags(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_profiles(text) TO anon, authenticated, service_role;
