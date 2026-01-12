-- =====================================================
-- POSTS
-- =====================================================

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,

  descripcion text NOT NULL,

  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),

  ubicacion text,
  hashtags text[],

  is_public boolean NOT NULL DEFAULT true,
  is_reported boolean NOT NULL DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Leer posts públicos
CREATE POLICY "Read public posts"
ON public.posts
FOR SELECT
USING (
  is_public = true
);

-- Crear post (solo el dueño)
CREATE POLICY "Create post"
ON public.posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Actualizar su propio post
CREATE POLICY "Update own post"
ON public.posts
FOR UPDATE
USING (
  auth.uid() = user_id
);

-- Eliminar su propio post
CREATE POLICY "Delete own post"
ON public.posts
FOR DELETE
USING (
  auth.uid() = user_id
);

