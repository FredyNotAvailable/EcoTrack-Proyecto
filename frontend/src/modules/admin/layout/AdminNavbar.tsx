import {
    Box,
    Flex,
    Avatar,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    Text,
} from '@chakra-ui/react';
import { HiMenu, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminNavbar = ({ onSidebarToggle }: { onSidebarToggle: () => void }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <Flex
            px={{ base: 4, md: 6 }}
            height="20"
            alignItems="center"
            bg={bg}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
        >
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onSidebarToggle}
                variant="outline"
                aria-label="open menu"
                icon={<HiMenu />}
            />

            <HStack spacing={{ base: '0', md: '6' }}>
                <Flex alignItems={'center'}>
                    <Menu>
                        <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
                            <HStack>
                                <Avatar
                                    size={'sm'}
                                    src={'https://i.pravatar.cc/300'} // Placeholder or user.avatar_url
                                />
                                <Text display={{ base: 'none', md: 'flex' }} fontSize="sm" fontWeight="bold">
                                    {user?.email}
                                </Text>
                                <Box display={{ base: 'none', md: 'flex' }}>
                                    <HiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={bg}
                            borderColor={borderColor}
                        >
                            <MenuItem>Perfil Admin</MenuItem>
                            <MenuItem>Configuración</MenuItem>
                            <MenuDivider />
                            <MenuItem onClick={() => { signOut(); navigate('/login'); }}>
                                Cerrar Sesión
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};
