import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { AuthService } from '../services/auth.service';
import type { LoginCredentials } from '../types';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            await AuthService.signIn(credentials);

            toast({
                title: '¡Bienvenido de nuevo!',
                description: 'Has iniciado sesión correctamente.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Redirigir al dashboard protegido
            navigate('/app');
        } catch (error: any) {
            toast({
                title: 'Error al iniciar sesión',
                description: error.message || 'Verifica tus credenciales e intenta de nuevo.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
    };
};
