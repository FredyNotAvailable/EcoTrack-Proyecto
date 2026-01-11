import { Box, Container, Flex, Heading, Button, HStack, Spacer } from '@chakra-ui/react';
import { useAuth } from '../../modules/auth/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, signOut } = useAuth();

    return (
        <Box minH="100vh">
            <Box as="nav" bg="eco.500" color="white" py={4} shadow="md">
                <Container maxW="container.xl">
                    <Flex align="center">
                        <RouterLink to="/">
                            <Heading size="md" color="white">EcoTrack</Heading>
                        </RouterLink>
                        <HStack ml={8} spacing={4}>
                            <Button as={RouterLink} to="/retos" variant="ghost" _hover={{ bg: 'eco.600' }}>Retos</Button>
                            <Button as={RouterLink} to="/comunidad" variant="ghost" _hover={{ bg: 'eco.600' }}>Comunidad</Button>
                            <Button as={RouterLink} to="/ranking" variant="ghost" _hover={{ bg: 'eco.600' }}>Ranking</Button>
                        </HStack>
                        <Spacer />
                        <HStack>
                            <Heading size="sm">{user?.email}</Heading>
                            <Button onClick={() => signOut()} colorScheme="whiteAlpha" variant="outline">Salir</Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={8}>
                {children}
            </Container>
        </Box>
    );
};
