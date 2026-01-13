-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.consejos_diarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.consejos_diarios ENABLE ROW LEVEL SECURITY;

-- Create policy for reading active tips
DROP POLICY IF EXISTS "Authenticated users can read active tips" ON public.consejos_diarios;
CREATE POLICY "Authenticated users can read active tips" ON public.consejos_diarios
    FOR SELECT
    TO authenticated
    USING (activo = true);

-- Insert sample data
INSERT INTO public.consejos_diarios (titulo, descripcion, activo) VALUES
('Apaga las luces', 'Apagar las luces cuando no las necesitas puede ahorrar hasta un 15% en tu consumo eléctrico.', true),
('Ducha corta', 'Limitar tu ducha a 5 minutos ahorra hasta 100 litros de agua por vez.', true),
('Usa bolsas reutilizables', 'Llevar tu propia bolsa evita el uso de cientos de bolsas plásticas al año.', true),
('Desconecta cargadores', 'Los cargadores enchufados sin usar siguen consumiendo energía (consumo vampiro).', true),
('Come menos carne', 'Reducir el consumo de carne un día a la semana ayuda significativamente a reducir tu huella de carbono.', true),
('Recicla correctamente', 'Asegúrate de limpiar los envases antes de reciclarlos para evitar contaminación.', true),
('Usa transporte público', 'Un autobús lleno saca más de 40 coches de la carretera.', true);
