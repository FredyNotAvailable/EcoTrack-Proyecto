-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: Retos Semanales
CREATE TABLE IF NOT EXISTS retos_semanales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    recompensa_puntos INT DEFAULT 0,
    recompensa_kg_co2 DECIMAL(10, 2) DEFAULT 0,
    imagen_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: Tareas del Reto
CREATE TABLE IF NOT EXISTS retos_semanales_tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reto_id UUID REFERENCES retos_semanales(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    recompensa_puntos INT DEFAULT 0,
    recompensa_kg_co2 DECIMAL(10, 2) DEFAULT 0,
    tipo TEXT DEFAULT 'manual', -- 'manual', 'event', 'post', etc.
    cantidad_meta INT DEFAULT 1,
    can_upload_media BOOLEAN DEFAULT FALSE
);

-- 3. Table: Participación de Usuarios
CREATE TABLE IF NOT EXISTS usuarios_retos_semanales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Assuming 'profiles' or 'auth.users'
    reto_id UUID REFERENCES retos_semanales(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'joined', -- 'joined', 'completed'
    progreso DECIMAL(5, 2) DEFAULT 0, -- Percentage
    fecha_union TIMESTAMPTZ DEFAULT NOW(),
    fecha_completado TIMESTAMPTZ,
    UNIQUE(user_id, reto_id)
);

-- 4. Table: Progreso de Tareas de Usuarios
CREATE TABLE IF NOT EXISTS usuarios_retos_tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reto_id UUID REFERENCES retos_semanales(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES retos_semanales_tareas(id) ON DELETE CASCADE,
    completado BOOLEAN DEFAULT FALSE,
    progreso_actual INT DEFAULT 0,
    fecha_completado TIMESTAMPTZ,
    UNIQUE(user_id, tarea_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retos_fechas ON retos_semanales(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_usr_retos_user ON usuarios_retos_semanales(user_id);
CREATE INDEX IF NOT EXISTS idx_usr_retos_reto ON usuarios_retos_semanales(reto_id);
CREATE INDEX IF NOT EXISTS idx_usr_tareas_user ON usuarios_retos_tareas(user_id);
