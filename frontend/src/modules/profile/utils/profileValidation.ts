/**
 * Utilidades de validación para perfiles de usuario
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Valida un username según las reglas del sistema
 * - Mínimo 3 caracteres
 * - Máximo 30 caracteres
 * - Solo letras, números y guiones bajos
 */
export const validateUsername = (username: string): ValidationResult => {
    const trimmed = username.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'El nombre de usuario es requerido' };
    }

    if (trimmed.length < 3) {
        return { valid: false, error: 'Mínimo 3 caracteres' };
    }

    if (trimmed.length > 30) {
        return { valid: false, error: 'Máximo 30 caracteres' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return { valid: false, error: 'Solo letras, números y guiones bajos (_)' };
    }

    return { valid: true };
};

/**
 * Normaliza un username eliminando espacios y caracteres inválidos
 */
export const normalizeUsername = (username: string): string => {
    return username
        .trim()
        .replace(/[^a-zA-Z0-9_]/g, '') // Eliminar caracteres no permitidos
        .substring(0, 30); // Limitar a 30 caracteres
};

/**
 * Valida una biografía
 * - Máximo 300 caracteres
 */
export const validateBio = (bio: string): ValidationResult => {
    if (bio.length > 300) {
        return { valid: false, error: 'La biografía no puede exceder 300 caracteres' };
    }

    return { valid: true };
};

/**
 * Genera sugerencias de username basadas en un nombre
 */
export const generateUsernameSuggestions = (baseName: string): string[] => {
    const normalized = normalizeUsername(baseName);
    const suggestions: string[] = [];

    if (normalized.length >= 3) {
        suggestions.push(normalized);
        suggestions.push(`${normalized}${Math.floor(Math.random() * 100)}`);
        suggestions.push(`${normalized}_eco`);
        suggestions.push(`eco_${normalized}`);
        suggestions.push(`${normalized}${new Date().getFullYear()}`);
    }

    return suggestions.slice(0, 3); // Retornar máximo 3 sugerencias
};
