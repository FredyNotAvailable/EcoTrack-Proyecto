import {
    Box,
    Flex,
    HStack,
    VStack,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Text,
    Badge,
} from '@chakra-ui/react';
import { HiMenu, HiChevronDown, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Mapeo de rutas a títulos y descripciones
const routeConfig: Record<string, { title: string; description: string }> = {
    '/admin/dashboard': {
        title: 'Panel de Control',
        description: 'Visualiza el impacto ecológico y actividad global de EcoTrack.'
    },
    '/admin/usuarios': {
        title: 'Gestión de Usuarios',
        description: 'Administra cuentas, roles y estados de los eco-ciudadanos.'
    },
    '/admin/posts': {
        title: 'Moderación de Comunidad',
        description: 'Supervisa las publicaciones y reportes de la red social.'
    },
    '/admin/misiones': {
        title: 'Misiones Diarias',
        description: 'Configura las tareas diarias para fomentar hábitos sostenibles.'
    },
    '/admin/retos': {
        title: 'Retos Semanales',
        description: 'Gestiona los desafíos grupales de mayor impacto ambiental.'
    },
    '/admin/niveles': {
        title: 'Sistema de Niveles',
        description: 'Define la progresión y gamificación de la experiencia de usuario.'
    },
    '/admin/consejos': {
        title: 'Eco-Consejos',
        description: 'Publica pequeñas píldoras de sabiduría ecológica diaria.'
    },
    '/admin/reports': {
        title: 'Reportes de Comunidad',
        description: 'Supervisa y resuelve incidentes reportados por los usuarios.'
    }
};

export const AdminNavbar = ({ onSidebarToggle }: { onSidebarToggle: () => void }) => {
    const bg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(23, 25, 35, 0.8)');
    const borderColor = useColorModeValue('gray.100', 'gray.800');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener config según la ruta actual
    const currentRoute = routeConfig[location.pathname] || {
        title: 'EcoTrack Admin',
        description: 'Bienvenido al panel de administración personalizada.'
    };

    return (
        <Flex
            px={{ base: 4, md: 10 }}
            height="24" // Un poco más alto para los títulos
            alignItems="center"
            bg={bg}
            backdropFilter="blur(10px)"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent="space-between"
            position="sticky"
            top="0"
            zIndex="900"
            transition="all 0.3s"
        >
            {/* Izquierda: Título Dinámico y Toggle Mobile */}
            <HStack spacing={6}>
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onSidebarToggle}
                    variant="ghost"
                    aria-label="open menu"
                    icon={<HiMenu fontSize="20" />}
                    _hover={{ bg: 'green.50', color: 'green.600' }}
                />

                <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}>
                    <Text fontSize="lg" fontWeight="900" color="gray.800" letterSpacing="tight">
                        {currentRoute.title}
                    </Text>
                    <Text fontSize="xs" color="gray.400" fontWeight="500">
                        {currentRoute.description}
                    </Text>
                </VStack>
            </HStack>

            {/* Derecha: Usuario */}
            <HStack spacing={{ base: '3', md: '8' }}>
                <Flex alignItems={'center'}>
                    <Menu placement="bottom-end">
                        <MenuButton
                            py={2}
                            px={3}
                            transition="all 0.3s"
                            borderRadius="xl"
                            _hover={{ bg: 'gray.50' }}
                            _active={{ bg: 'gray.100' }}
                        >
                            <HStack spacing={3}>
                                <VStack
                                    display={{ base: 'none', md: 'flex' }}
                                    alignItems="flex-end"
                                    spacing="0px"
                                    mr={1}
                                >
                                    <Text fontSize="sm" fontWeight="800" color="gray.700">
                                        {user?.email?.split('@')[0]}
                                    </Text>
                                    <Badge
                                        colorScheme="green"
                                        variant="subtle"
                                        fontSize="9px"
                                        px={2}
                                        borderRadius="full"
                                        textTransform="uppercase"
                                    >
                                        Administrador
                                    </Badge>
                                </VStack>
                                <Box color="gray.400">
                                    <HiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg="white"
                            shadow="2xl"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="gray.100"
                            p={2}
                            minW="200px"
                        >
                            <Box px={4} py={3} mb={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                    Cuenta
                                </Text>
                                <Text fontSize="sm" fontWeight="600" color="gray.700" isTruncated>
                                    {user?.email}
                                </Text>
                            </Box>

                            <MenuItem
                                borderRadius="xl"
                                py={3}
                                color="red.500"
                                fontWeight="bold"
                                icon={<HiLogout fontSize="18" />}
                                _hover={{ bg: 'red.50' }}
                                onClick={() => { signOut(); navigate('/login'); }}
                            >
                                Cerrar Sesión
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};
