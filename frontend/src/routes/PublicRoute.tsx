import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

export const PublicRoute = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="eco.500" thickness="4px" />
            </Center>
        );
    }

    if (session) {
        return <Navigate to="/app/inicio" replace />;
    }

    return <Outlet />;
};
