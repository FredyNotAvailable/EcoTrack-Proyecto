import {
    Box,
    Flex,
    Icon,
    Text,
    VStack,
    HStack,
    useColorModeValue,
    Image,
    Link,
    Divider,
} from '@chakra-ui/react';
import { NavLink as RouterLink, useNavigate } from 'react-router-dom';
import { HiHome, HiUsers, HiDocumentReport, HiCog, HiLogout, HiCollection, HiLightningBolt, HiFlag, HiTrendingUp } from 'react-icons/hi';
import { useAuth } from '../../auth/AuthContext';

interface SidebarItemProps {
    icon: any;
    children: React.ReactNode;
    to: string;
}

const SidebarItem = ({ icon, children, to }: SidebarItemProps) => {
    const activeBg = useColorModeValue('brand.primary', 'brand.primary');
    const activeColor = 'white';
    const inactiveColor = useColorModeValue('gray.600', 'gray.400');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');

    return (
        <Link
            as={RouterLink}
            to={to}
            style={{ textDecoration: 'none', width: '100%' }}
            _activeLink={{
                bg: activeBg,
                color: activeColor,
                borderRadius: 'lg',
                fontWeight: 'bold',
            }}
        >
            <HStack
                align="center"
                p={3}
                mx={2}
                borderRadius="lg"
                role="group"
                cursor="pointer"
                color={inactiveColor}
                _hover={{
                    bg: hoverBg,
                    color: 'brand.primary',
                }}
                transition="all 0.2s"
            >
                <Icon
                    mr="4"
                    fontSize="18"
                    _groupHover={{
                        color: 'brand.primary',
                    }}
                    as={icon}
                />
                <Text fontSize="sm">{children}</Text>
            </HStack>
        </Link>
    );
};

export const AdminSidebar = ({ isOpen }: { isOpen: boolean; onClose: () => void }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <Box
            w={{ base: 'full', md: 64 }}
            h="full"
            bg={bg}
            borderRight="1px"
            borderColor={borderColor}
            display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
            position={{ base: 'fixed', md: 'relative' }}
            zIndex="1000"
            transition="width 0.3s"
        >
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <HStack spacing={2}>
                    <Image src="/logo.png" boxSize="32px" />
                    <Text fontSize="xl" fontWeight="bold" color="brand.primary">
                        EcoTrack
                    </Text>
                </HStack>
            </Flex>

            <VStack align="start" spacing={1} mt={4} width="100%">
                {/* Dashboard */}
                <SidebarItem to="/admin/dashboard" icon={HiHome}>
                    Dashboard
                </SidebarItem>

                {/* Modules */}
                <Text px={6} pt={4} pb={2} fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                    Gestión
                </Text>
                <SidebarItem to="/admin/usuarios" icon={HiUsers}>
                    Usuarios
                </SidebarItem>
                <SidebarItem to="/admin/posts" icon={HiCollection}>
                    Comunidad
                </SidebarItem>
                <SidebarItem to="/admin/misiones" icon={HiLightningBolt}>
                    Misiones
                </SidebarItem>
                <SidebarItem to="/admin/retos" icon={HiFlag}>
                    Retos
                </SidebarItem>
                <SidebarItem to="/admin/niveles" icon={HiTrendingUp}>
                    Niveles
                </SidebarItem>
                <SidebarItem to="/admin/reportes" icon={HiDocumentReport}>
                    Reportes
                </SidebarItem>

                <Divider my={4} mx={4} w="auto" />

                <SidebarItem to="/admin/configuracion" icon={HiCog}>
                    Configuración
                </SidebarItem>
            </VStack>

            {/* Footer / Logout */}
            <Box position="absolute" bottom={0} w="full" p={4}>
                <HStack
                    as="button"
                    onClick={handleLogout}
                    w="full"
                    p={3}
                    borderRadius="lg"
                    _hover={{ bg: 'red.50', color: 'red.500' }}
                    color="gray.500"
                    transition="all 0.2s"
                >
                    <Icon as={HiLogout} mr={4} fontSize="18" />
                    <Text fontSize="sm" fontWeight="medium">Cerrar Sesión</Text>
                </HStack>
            </Box>
        </Box>
    );
};
