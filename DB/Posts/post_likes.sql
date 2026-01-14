-- ===============================
-- TABLA: post_likes
-- ===============================

CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  post_id uuid NOT NULL
    REFERENCES public.posts(id) ON DELETE CASCADE,

  user_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,

  created_at timestamptz DEFAULT now(),

  UNIQUE (post_id, user_id)
);

-- ===============================
-- RLS
-- ===============================

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Leer likes (usuarios autenticados)
CREATE POLICY "Read post likes"
ON public.post_likes
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Dar like (solo el usuario autenticado)
CREATE POLICY "Create post like"
ON public.post_likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Quitar like (solo el dueño)
CREATE POLICY "Delete own like"
ON public.post_likes
FOR DELETE
USING (
  auth.uid() = user_id
);
