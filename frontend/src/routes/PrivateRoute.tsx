
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';


export const PrivateRoute = () => {
    const { session, loading, isRegistered } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="eco.500" thickness="4px" />
            </Center>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Si no tiene perfil y no está ya en /onboarding, forzar onboarding
    if (!isRegistered && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};
