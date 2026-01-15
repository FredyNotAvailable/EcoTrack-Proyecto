import {
    Box,
    Flex,
    HStack,
    Button,
    Container,
    Icon,
    Text,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../modules/auth/AuthContext';
import { FaLeaf, FaBars } from 'react-icons/fa';
import React from 'react';
import { Link } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ProfileAPIService } from '../../modules/profile/services/profile.service';

export const MainLayout: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bg = useColorModeValue('brand.bgBody', 'gray.800');

    // Fetch current user profile to get username
    const { data: profile } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: () => ProfileAPIService.getMe(),
        staleTime: 1000 * 60 * 10, // 10 minutes cache for session-like data
    });


    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
            onClose();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const NavItems = () => (
        <>
            <NavLink to="/app/inicio" onClick={onClose}>Inicio</NavLink>
            <NavLink to="/app/comunidad" onClick={onClose}>Comunidad</NavLink>
            <NavLink to="/app/retos" onClick={onClose}>Retos</NavLink>
            <NavLink to="/app/ranking" onClick={onClose}>Ranking</NavLink>
            <NavLink to={profile?.username ? `/app/perfil/${profile.username}` : "/app/perfil"} onClick={onClose}>Perfil</NavLink>
        </>
    );

    return (
        <Box minH="100vh" bg="brand.bgBody">
            {/* --- Navbar --- */}
            <Box
                as="nav"
                position="sticky"
                top="0"
                zIndex="sticky"
                bg={bg}
                boxShadow="sm"
                width="full"
                py={5}
            >
                <Container maxW="container.xl" px={5}>
                    <Flex alignItems="center" justifyContent="space-between" minH="48px">

                        {/* Mobile Menu Button */}
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onOpen}
                            variant="ghost"
                            aria-label="Abrir menú"
                            icon={<FaBars />}
                            mr={2}
                        />

                        {/* Logo */}
                        <HStack spacing={2} as={RouterLink} to="/app/inicio" _hover={{ textDecoration: 'none' }}>
                            <Icon as={FaLeaf} color="brand.primary" w={6} h={6} />
                            <Text fontSize="2xl" fontWeight="800" color="brand.textMain">
                                EcoTrack
                            </Text>
                        </HStack>

                        {/* Desktop Menu Items */}
                        <HStack as="nav" spacing={8} display={{ base: 'none', md: 'flex' }}>
                            <NavItems />
                        </HStack>

                        {/* Action Button */}
                        <Flex alignItems="center">
                            <HStack spacing={4}>
                                <Button
                                    variant="ghost"
                                    color="brand.textMain"
                                    size="sm"
                                    onClick={handleLogout}
                                    _hover={{
                                        color: "red.500",
                                        bg: "red.50"
                                    }}
                                    display={{ base: 'none', md: 'flex' }}
                                >
                                    Salir
                                </Button>
                            </HStack>
                        </Flex>

                    </Flex>
                </Container>

                {/* Mobile Drawer */}
                <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader borderBottomWidth="1px" color="brand.primary">Menú EcoTrack</DrawerHeader>
                        <DrawerBody>
                            <VStack align="stretch" spacing={6} mt={4}>
                                <NavItems />
                                <Button w="full" variant="outline" colorScheme="red" onClick={handleLogout} mt={4}>
                                    Cerrar Sesión
                                </Button>
                            </VStack>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Box>

            {/* --- Content Area --- */}
            <Box as="main" width="full">
                <Container maxW="container.xl" py={4}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

// Helper component for active links styling
const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            as={RouterLink}
            to={to}
            fontWeight="600"
            fontSize="md"
            color={isActive ? 'brand.primary' : 'brand.textMain'}
            _hover={{
                color: 'brand.primary',
                textDecoration: 'none'
            }}
            transition="color 0.3s"
            onClick={onClick}
            position="relative"
            _after={isActive ? {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: '0',
                width: '100%',
                height: '2px',
                bg: 'brand.primary',
                borderRadius: 'full'
            } : {}}
        >
            {children}
        </Link>
    );
}
