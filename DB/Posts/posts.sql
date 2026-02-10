-- =====================================================
-- POSTS
-- =====================================================

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES public.profiles(id) ON DELETE CASCADE,

  descripcion text NOT NULL,

  ubicacion text,
  hashtags text[],

  is_public boolean NOT NULL DEFAULT true,
  is_reported boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'blocked', 'deleted')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();


-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Leer posts públicos (Solo los que están activos)
CREATE POLICY "Read public posts"
ON public.posts
FOR SELECT
USING (
  is_public = true AND status = 'active'
);

-- Admin puede ver todo (Opcional, pero útil)
CREATE POLICY "Admins can view all posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
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

