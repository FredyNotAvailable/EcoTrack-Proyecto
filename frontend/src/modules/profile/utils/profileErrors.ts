/**
 * Mapeo de errores de perfil a mensajes amigables para el usuario
 */

interface ErrorDetails {
    title: string;
    description: string;
    action?: string;
}

/**
 * Extrae el mensaje de error de diferentes formatos de respuesta
 */
const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'Error desconocido';
};

/**
 * Extrae el código de error de Supabase/PostgreSQL
 */
const extractErrorCode = (error: any): string | null => {
    if (error?.response?.data?.code) return error.response.data.code;
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    return null;
};

/**
 * Convierte errores técnicos en mensajes amigables para el usuario
 */
export const getProfileErrorMessage = (error: any): ErrorDetails => {
    const errorMessage = extractErrorMessage(error);
    const errorCode = extractErrorCode(error);

    console.error('[ProfileError]', { errorMessage, errorCode, fullError: error });

    // Errores de validación de username
    if (errorMessage.includes('username') || errorMessage.includes('nombre de usuario')) {
        if (errorMessage.includes('ya está en uso') || errorCode === '23505') {
            return {
                title: 'Nombre de usuario no disponible',
                description: 'Este nombre ya está en uso. Intenta con otro.',
                action: 'Prueba agregando números o tu año favorito'
            };
        }

        if (errorMessage.includes('solo puede contener')) {
            return {
                title: 'Nombre de usuario inválido',
                description: 'Solo puedes usar letras, números y guiones bajos (_)',
                action: 'Elimina espacios y caracteres especiales'
            };
        }

        if (errorMessage.includes('al menos 3 caracteres')) {
            return {
                title: 'Nombre muy corto',
                description: 'Tu nombre de usuario debe tener al menos 3 caracteres',
            };
        }
    }

    // Errores de biografía
    if (errorMessage.includes('bio') || errorMessage.includes('biografía')) {
        if (errorMessage.includes('300 caracteres')) {
            return {
                title: 'Biografía muy larga',
                description: 'Tu biografía no puede exceder 300 caracteres',
                action: 'Acorta tu mensaje'
            };
        }
    }

    // Errores de avatar/imagen
    if (errorMessage.includes('avatar') || errorMessage.includes('imagen') || errorMessage.includes('storage')) {
        if (errorMessage.includes('size') || errorMessage.includes('tamaño')) {
            return {
                title: 'Imagen muy grande',
                description: 'La imagen es demasiado pesada',
                action: 'Intenta con una imagen más pequeña'
            };
        }

        if (errorMessage.includes('format') || errorMessage.includes('formato')) {
            return {
                title: 'Formato no soportado',
                description: 'El formato de imagen no es válido',
                action: 'Usa JPG, PNG o WebP'
            };
        }
    }

    // Errores de red
    if (errorMessage.includes('Network') || errorMessage.includes('network') ||
        errorMessage.includes('timeout') || errorCode === 'ECONNABORTED') {
        return {
            title: 'Problema de conexión',
            description: 'No pudimos conectar con el servidor',
            action: 'Verifica tu conexión a internet e intenta de nuevo'
        };
    }

    // Errores de autenticación
    if (errorMessage.includes('auth') || errorMessage.includes('token') ||
        errorMessage.includes('unauthorized') || errorCode === '401') {
        return {
            title: 'Sesión expirada',
            description: 'Tu sesión ha expirado',
            action: 'Por favor inicia sesión nuevamente'
        };
    }

    // Error de perfil ya existente
    if (errorMessage.includes('ya existe') || errorMessage.includes('already exists')) {
        return {
            title: 'Perfil ya creado',
            description: 'Ya tienes un perfil registrado',
            action: 'Intenta iniciar sesión en lugar de crear uno nuevo'
        };
    }

    // Errores de validación genéricos
    if (errorMessage.includes('VALIDATION_ERROR') || errorCode === 'VALIDATION_ERROR') {
        return {
            title: 'Datos inválidos',
            description: errorMessage,
            action: 'Revisa los campos e intenta de nuevo'
        };
    }

    // Error genérico del servidor
    if (errorCode === '500' || errorMessage.includes('500') ||
        errorMessage.includes('Internal Server Error')) {
        return {
            title: 'Error del servidor',
            description: 'Algo salió mal en nuestro servidor',
            action: 'Intenta de nuevo en unos momentos'
        };
    }

    // Error desconocido
    return {
        title: 'Error inesperado',
        description: 'Ocurrió un problema al crear tu perfil',
        action: 'Intenta de nuevo o contacta a soporte si persiste'
    };
};

/**
 * Determina si un error es recuperable (se puede reintentar)
 */
export const isRecoverableError = (error: any): boolean => {
    const errorMessage = extractErrorMessage(error);
    const errorCode = extractErrorCode(error);

    // Errores de red son recuperables
    if (errorMessage.includes('Network') || errorMessage.includes('timeout') ||
        errorCode === 'ECONNABORTED') {
        return true;
    }

    // Errores 5xx del servidor son recuperables
    if (errorCode === '500' || errorCode === '502' || errorCode === '503' || errorCode === '504') {
        return true;
    }

    // Otros errores no son recuperables (validación, duplicados, etc.)
    return false;
};

/**
 * Obtiene el tiempo de espera recomendado antes de reintentar (en ms)
 */
export const getRetryDelay = (attemptNumber: number): number => {
    // Backoff exponencial: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, attemptNumber - 1), 8000);
};
