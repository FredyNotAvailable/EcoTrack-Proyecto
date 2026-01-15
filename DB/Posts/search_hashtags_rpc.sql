-- =====================================================
-- FUNCIÓN PARA BUSCAR HASHTAGS (AUTOCUMPLETADO)
-- =====================================================

CREATE OR REPLACE FUNCTION search_hashtags(search_query text)
RETURNS TABLE (hashtag text, count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
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
  WHERE t.tag ILIKE search_query || '%'
  GROUP BY t.tag
  ORDER BY count DESC
  LIMIT 5;
END;
$$;

GRANT EXECUTE ON FUNCTION search_hashtags(text) TO anon;
GRANT EXECUTE ON FUNCTION search_hashtags(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_hashtags(text) TO service_role;
