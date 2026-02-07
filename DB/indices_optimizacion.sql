-- ===============================================
-- ÍNDICES DE OPTIMIZACIÓN - EcoTrack
-- Ejecutar en Supabase SQL Editor
-- ===============================================

-- Posts: Ordenar por fecha (feed)
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC);

-- Posts: Filtrar por usuario
CREATE INDEX IF NOT EXISTS idx_posts_user_id 
ON posts(user_id);

-- Posts: Filtrar públicos ordenados por fecha (feed principal)
CREATE INDEX IF NOT EXISTS idx_posts_public_feed 
ON posts(is_public, created_at DESC) 
WHERE is_public = true;

-- Post Likes: Verificar si usuario dio like (consulta frecuente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_user_post 
ON post_likes(user_id, post_id);

-- Post Likes: Contar likes por post
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id 
ON post_likes(post_id);

-- Post Comments: Listar comentarios de un post
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
ON post_comments(post_id, created_at DESC);

-- Usuarios Retos Semanales: Buscar retos de usuario
CREATE INDEX IF NOT EXISTS idx_usuarios_retos_user_reto 
ON usuarios_retos_semanales(user_id, reto_semanal_id);

-- Usuarios Retos Semanales: Filtrar por estado
CREATE INDEX IF NOT EXISTS idx_usuarios_retos_estado 
ON usuarios_retos_semanales(user_id, estado);

-- Usuarios Retos Tareas: Buscar tareas por user_reto
CREATE INDEX IF NOT EXISTS idx_usuarios_retos_tareas_user_reto 
ON usuarios_retos_tareas(user_reto_id);

-- Misiones Usuario: Buscar por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_misiones_usuario_user_fecha 
ON misiones_usuario(user_id, fecha DESC);

-- Misiones Diarias: Filtrar activas
CREATE INDEX IF NOT EXISTS idx_misiones_diarias_activo 
ON misiones_diarias(activo) 
WHERE activo = true;

-- User Stats: Ranking por puntos
CREATE INDEX IF NOT EXISTS idx_user_stats_ranking 
ON user_stats(puntos_totales DESC);

-- User Rachas: Buscar racha de usuario
CREATE INDEX IF NOT EXISTS idx_user_rachas_user_id 
ON user_rachas(user_id);

-- Profiles: Búsqueda por username
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Retos Semanales: Filtrar activos
CREATE INDEX IF NOT EXISTS idx_retos_semanales_activo 
ON retos_semanales(activo, fecha_inicio, fecha_fin) 
WHERE activo = true;

-- ===============================================
-- VERIFICAR ÍNDICES CREADOS
-- ===============================================
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;
