export const getAuthErrorMessage = (error: any): string => {
    if (!error) return "Ocurrió un error inesperado.";

    const message = error.message || "";

    if (message.includes("Invalid login credentials") || message.includes("Email not confirmed")) {
        return "Correo o contraseña incorrectos. Por favor, verifica tus datos.";
    }

    if (message.includes("User already registered") || message.includes("User already exists")) {
        return "Este correo ya está registrado. Intenta iniciar sesión.";
    }

    if (message.includes("Password should be at least 6 characters")) {
        return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (message.includes("rate limit exceeded")) {
        return "Demasiados intentos. Por favor, espera un momento antes de reintentar.";
    }

    if (message.includes("network error") || message.includes("Failed to fetch")) {
        return "Error de conexión. Revisa tu internet.";
    }

    return "Hubo un problema. Por favor intenta de nuevo.";
};
