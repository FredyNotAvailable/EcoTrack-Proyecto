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
import {
    HiHome,
    HiUsers,
    HiLogout,
    HiCollection,
    HiLightningBolt,
    HiFlag,
    HiTrendingUp,
    HiLightBulb,
    HiExclamationCircle
} from 'react-icons/hi';
import { useAuth } from '../../auth/AuthContext';

interface SidebarItemProps {
    icon: any;
    children: React.ReactNode;
    to: string;
}

const SidebarItem = ({ icon, children, to }: SidebarItemProps) => {
    const activeBg = useColorModeValue('green.50', 'rgba(72, 187, 120, 0.1)');
    const activeColor = useColorModeValue('green.700', 'green.300');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    return (
        <Link
            as={RouterLink}
            to={to}
            style={{ textDecoration: 'none', width: '90%' }}
            mx="5%"
            mb={1}
            _activeLink={{
                '& > div': {
                    bg: activeBg,
                    color: activeColor,
                    fontWeight: '700',
                    boxShadow: 'sm',
                    borderLeft: '4px solid',
                    borderColor: 'green.500',
                    borderRadius: '0 12px 12px 0',
                }
            }}
        >
            <HStack
                align="center"
                py={3.5}
                px={4}
                borderRadius="12px"
                role="group"
                cursor="pointer"
                color={inactiveColor}
                _hover={{
                    bg: hoverBg,
                    color: activeColor,
                    transform: 'translateX(4px)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
                <Icon
                    fontSize="20"
                    as={icon}
                    transition="all 0.3s"
                />
                <Text fontSize="sm" fontWeight="600" ml={1}>
                    {children}
                </Text>
            </HStack>
        </Link>
    );
};

export const AdminSidebar = ({ isOpen }: { isOpen: boolean; onClose: () => void }) => {
    const bg = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.100', 'gray.800');
    const shadow = useColorModeValue('xl', 'none');
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <Box
            w={{ base: 'full', md: 72 }}
            h="full"
            bg={bg}
            borderRight="1px"
            borderColor={borderColor}
            display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
            position={{ base: 'fixed', md: 'sticky' }}
            top="0"
            zIndex="1000"
            transition="all 0.3s"
            boxShadow={shadow}
        >
            <Flex h="24" alignItems="center" px="8">
                <HStack spacing={3}>
                    <Box
                        p={2}
                        bg="green.50"
                        borderRadius="xl"
                        boxShadow="inner"
                    >
                        <Image src="/logo.png" boxSize="32px" />
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Text fontSize="xl" fontWeight="900" color="green.600" letterSpacing="tight">
                            EcoTrack
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                            Admin Portal
                        </Text>
                    </VStack>
                </HStack>
            </Flex>

            <Box px={8} mb={6}>
                <Divider opacity={0.6} borderColor={useColorModeValue('gray.200', 'gray.700')} />
            </Box>

            <VStack align="start" spacing={0} width="100%">
                {/* Section Header */}
                <Text
                    px={10}
                    pb={4}
                    fontSize="xs"
                    fontWeight="800"
                    color="gray.300"
                    textTransform="uppercase"
                    letterSpacing="widest"
                >
                    Overview
                </Text>

                <SidebarItem to="/admin/dashboard" icon={HiHome}>
                    Dashboard
                </SidebarItem>

                {/* Section Header */}
                <Text
                    px={10}
                    pt={6}
                    pb={4}
                    fontSize="xs"
                    fontWeight="800"
                    color="gray.300"
                    textTransform="uppercase"
                    letterSpacing="widest"
                >
                    Gestión
                </Text>

                <SidebarItem to="/admin/usuarios" icon={HiUsers}>
                    Usuarios
                </SidebarItem>
                <SidebarItem to="/admin/posts" icon={HiCollection}>
                    Comunidad
                </SidebarItem>
                <SidebarItem to="/admin/reports" icon={HiExclamationCircle}>
                    Reportes
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
                <SidebarItem to="/admin/consejos" icon={HiLightBulb}>
                    Consejos Diarios
                </SidebarItem>
            </VStack>

            {/* Logout section at the bottom */}
            <Box position="absolute" bottom={8} w="full" px={10}>
                <Divider mb={6} opacity={0.6} />
                <HStack
                    as="button"
                    onClick={handleLogout}
                    w="full"
                    py={3.5}
                    px={4}
                    borderRadius="14px"
                    _hover={{
                        bg: 'red.50',
                        color: 'red.600',
                        transform: 'translateY(-2px)'
                    }}
                    color="gray.400"
                    transition="all 0.3s"
                    fontWeight="700"
                    fontSize="sm"
                    justify="center"
                    border="1px solid"
                    borderColor="transparent"
                >
                    <Icon as={HiLogout} mr={3} fontSize="18" />
                    <Text>Cerrar Sesión</Text>
                </HStack>
            </Box>
        </Box>
    );
};
