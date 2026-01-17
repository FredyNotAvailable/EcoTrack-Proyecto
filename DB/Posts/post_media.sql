/* =========================================================
   TABLE: post_media
   Media (imágenes / videos) asociados a un post
   Soporta múltiples archivos y orden tipo carrusel
   ========================================================= */

-- 1️⃣ Crear tabla post_media
CREATE TABLE public.post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  post_id uuid NOT NULL
    REFERENCES public.posts(id) ON DELETE CASCADE,

  media_url text NOT NULL,

  media_type text NOT NULL
    CHECK (media_type IN ('image', 'video')),

  position integer NOT NULL, -- orden definido por el usuario

  created_at timestamptz DEFAULT now(),

  UNIQUE (post_id, position)
);

------------------------------------------------------------
-- 2️⃣ Activar Row Level Security (RLS)
------------------------------------------------------------
ALTER TABLE public.post_media
ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- 3️⃣ SELECT
-- Ver media si:
-- - el post es público
-- - o el usuario es dueño del post
------------------------------------------------------------
CREATE POLICY "select_post_media"
ON public.post_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_media.post_id
      AND (
        p.is_public = true
        OR p.user_id = auth.uid()
      )
  )
);

------------------------------------------------------------
-- 4️⃣ INSERT
-- Subir media solo si el usuario es dueño del post
------------------------------------------------------------
CREATE POLICY "insert_post_media"
ON public.post_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_media.post_id
      AND p.user_id = auth.uid()
  )
);

------------------------------------------------------------
-- 5️⃣ UPDATE
-- Editar o reordenar media solo si es dueño del post
------------------------------------------------------------
CREATE POLICY "update_post_media"
ON public.post_media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_media.post_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_media.post_id
      AND p.user_id = auth.uid()
  )
);

------------------------------------------------------------
-- 6️⃣ DELETE
-- Eliminar media solo si es dueño del post
------------------------------------------------------------
CREATE POLICY "delete_post_media"
ON public.post_media
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_media.post_id
      AND p.user_id = auth.uid()
  )
);
