import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const PrivateRoute = () => {
    const { session, loading, isRegistered } = useAuth();
    const location = useLocation();

    // Verificación de rol para evitar que admins entren a rutas de usuario
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const res = await apiClient.get('/auth/me');
            return res.data;
        },
        enabled: !!session,
        staleTime: 0,
        retry: false
    });

    if (loading || (session && userLoading)) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="eco.500" thickness="4px" />
            </Center>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario no está activo o está suspendido
    if (userData && userData.status && userData.status !== 'active') {
        return <Navigate to="/status" replace />;
    }

    // Si es administrador, lo enviamos a su panel y no permitimos ver /app
    const isAdmin = userData?.isAdmin || userData?.role === 'admin';
    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Si no tiene perfil y no está ya en /onboarding, forzar onboarding
    // Nota: Los admins saltan esto porque ya fueron redirigidos arriba
    if (!isRegistered && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};
