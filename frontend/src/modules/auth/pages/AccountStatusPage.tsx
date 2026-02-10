import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Icon,
    Container,
    Flex,
    useColorModeValue,
    Spinner,
} from '@chakra-ui/react';
import { HiLockClosed, HiLogout } from 'react-icons/hi';
import { useAuth } from '../AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Navigate } from 'react-router-dom';

export const AccountStatusPage = () => {
    const { signOut, session } = useAuth();

    const { data: userData, isLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const res = await apiClient.get('/auth/me');
            return res.data;
        },
        enabled: !!session,
    });

    if (isLoading) {
        return (
            <Flex h="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'brand.bgDark')}>
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Flex>
        );
    }

    if (userData?.status === 'active') {
        const isAdmin = userData?.isAdmin || userData?.role === 'admin';
        return <Navigate to={isAdmin ? "/admin/dashboard" : "/app/inicio"} replace />;
    }

    const bg = useColorModeValue('white', 'gray.800');

    const getStatusContent = () => {
        return {
            title: 'Cuenta Suspendida',
            message: 'Lo sentimos, tu cuenta ha sido suspendida por incumplimiento de nuestras normas de comunidad. Si crees que esto es un error, contacta a soporte.',
            icon: HiLockClosed,
            color: 'red.500',
        };
    };

    const content = getStatusContent();

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={useColorModeValue('gray.50', 'brand.bgDark')}
            p={4}
        >
            <Container maxW="md">
                <Box
                    bg={bg}
                    p={8}
                    borderRadius="2xl"
                    shadow="xl"
                    textAlign="center"
                    border="1px"
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                >
                    <VStack spacing={6}>
                        <Icon as={content.icon} boxSize={16} color={content.color} />

                        <VStack spacing={2}>
                            <Heading size="lg" fontWeight="800">
                                {content.title}
                            </Heading>
                            <Text color="gray.500" fontSize="md">
                                {content.message}
                            </Text>
                        </VStack>

                        <Button
                            leftIcon={<HiLogout />}
                            variant="outline"
                            w="full"
                            onClick={signOut}
                            borderRadius="xl"
                        >
                            Cerrar Sesión
                        </Button>

                        <Text fontSize="xs" color="gray.400">
                            ID de usuario: {userData?.id}
                        </Text>
                    </VStack>
                </Box>
            </Container>
        </Flex>
    );
};
