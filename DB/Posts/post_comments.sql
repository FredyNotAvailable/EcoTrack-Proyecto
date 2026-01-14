-- ===============================
-- TABLA: post_comments
-- ===============================

CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  post_id uuid NOT NULL
    REFERENCES public.posts(id) ON DELETE CASCADE,

  user_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,

  content text NOT NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===============================
-- RLS
-- ===============================

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Leer comentarios (usuarios autenticados)
CREATE POLICY "Read post comments"
ON public.post_comments
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Crear comentario (solo usuario autenticado)
CREATE POLICY "Create post comment"
ON public.post_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Editar su propio comentario
CREATE POLICY "Update own comment"
ON public.post_comments
FOR UPDATE
USING (
  auth.uid() = user_id
);

-- Eliminar su propio comentario
CREATE POLICY "Delete own comment"
ON public.post_comments
FOR DELETE
USING (
  auth.uid() = user_id
);
