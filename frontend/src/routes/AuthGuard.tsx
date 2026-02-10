import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

export const AuthGuard = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Center>
        );
    }

    if (!session) {
        return <Navigate to="/landing" replace />;
    }

    return <Outlet />;
};
