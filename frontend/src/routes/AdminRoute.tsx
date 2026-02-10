import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Flex, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const AdminRoute = () => {
    const { user, loading: authLoading, session } = useAuth();

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

    if (authLoading || (session && userLoading)) {
        return (
            <Flex h="100vh" w="100vw" align="center" justify="center" bg="gray.50">
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Flex>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Si el administrador no está activo o está suspendido
    if (userData && userData.status && userData.status !== 'active') {
        return <Navigate to="/status" replace />;
    }

    const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.app_metadata?.role === 'admin';

    if (!isAdmin) {
        return <Navigate to="/app/inicio" replace />;
    }

    return <Outlet />;
};
