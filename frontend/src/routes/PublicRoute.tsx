import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const PublicRoute = () => {
    const { session, loading } = useAuth();

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const res = await apiClient.get('/auth/me');
            return res.data;
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 5,
        retry: false
    });

    if (loading || (session && userLoading)) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="eco.500" thickness="4px" />
            </Center>
        );
    }

    if (session) {
        const isAdmin = userData?.isAdmin || userData?.role === 'admin';
        return <Navigate to={isAdmin ? "/admin/dashboard" : "/app/inicio"} replace />;
    }

    return <Outlet />;
};
