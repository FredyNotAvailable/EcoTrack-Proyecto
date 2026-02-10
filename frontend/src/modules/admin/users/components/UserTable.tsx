import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
    Text,
    Badge,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Box,
    Spinner,
    Center,
    VStack,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Button
} from '@chakra-ui/react';
import React from 'react';
import { HiDotsVertical, HiTrash, HiBan, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';
import { useAuth } from '../../../auth/AuthContext';
import type { AdminUser } from '../../services/admin.service';

interface UserTableProps {
    users: AdminUser[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    onChangeStatus: (id: string, status: string) => void;
    onViewDetails: (id: string) => void;
}

export const UserTable = ({ users, isLoading, onDelete, onChangeStatus, onViewDetails }: UserTableProps) => {
    const { user: currentUser } = useAuth();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const theadBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    // Alert Dialogs state
    const deleteDisc = useDisclosure();
    const suspendDisc = useDisclosure();
    const reactivateDisc = useDisclosure();

    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);

    // Filter out current admin user if present in list
    const filteredUsers = users.filter(u => u.id !== currentUser?.id);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'suspended': return 'red';
            default: return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'suspended': return 'Suspendido';
            default: return status;
        }
    };

    const handleDeleteClick = (user: AdminUser) => {
        setSelectedUser(user);
        deleteDisc.onOpen();
    };

    const handleSuspendClick = (user: AdminUser) => {
        setSelectedUser(user);
        suspendDisc.onOpen();
    };

    const handleReactivateClick = (user: AdminUser) => {
        setSelectedUser(user);
        reactivateDisc.onOpen();
    };

    const confirmDelete = () => {
        if (selectedUser) {
            onDelete(selectedUser.id);
            deleteDisc.onClose();
        }
    };

    const confirmSuspend = () => {
        if (selectedUser) {
            onChangeStatus(selectedUser.id, 'suspended');
            suspendDisc.onClose();
        }
    };

    const confirmReactivate = () => {
        if (selectedUser) {
            onChangeStatus(selectedUser.id, 'active');
            reactivateDisc.onClose();
        }
    };

    if (isLoading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Center>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <Center py={20} bg={bg} borderRadius="xl" border="1px" borderColor={borderColor}>
                <VStack>
                    <Text color="gray.500">No se encontraron usuarios.</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
            shadow="sm"
        >
            <Table variant="simple">
                <Thead bg={theadBg}>
                    <Tr>
                        <Th>Usuario</Th>
                        <Th>Rol</Th>
                        <Th>Puntos / Nivel</Th>
                        <Th>Estado</Th>
                        <Th>Fecha Registro</Th>
                        <Th isNumeric>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredUsers.map((user) => (
                        <Tr key={user.id} _hover={{ bg: hoverBg }}>
                            <Td>
                                <HStack spacing={3}>
                                    <Avatar size="sm" name={user.username} src={user.avatar_url} />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">{user.username}</Text>
                                        <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                    </Box>
                                </HStack>
                            </Td>
                            <Td>
                                <Badge colorScheme={user.role === 'admin' ? 'purple' : 'blue'}>
                                    {user.role}
                                </Badge>
                            </Td>
                            <Td>
                                <HStack spacing={1}>
                                    <Text fontWeight="bold" fontSize="sm">{user.puntos}</Text>
                                    <Text fontSize="xs" color="gray.400">pts</Text>
                                    <Badge variant="subtle" colorScheme="orange" ml={2}>
                                        Nv. {user.nivel}
                                    </Badge>
                                </HStack>
                            </Td>
                            <Td>
                                <Badge colorScheme={getStatusColor(user.status)}>
                                    {getStatusLabel(user.status)}
                                </Badge>
                            </Td>
                            <Td fontSize="sm" color="gray.500">
                                {new Date(user.created_at).toLocaleDateString()}
                            </Td>
                            <Td isNumeric>
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        aria-label="Options"
                                        icon={<HiDotsVertical />}
                                        variant="ghost"
                                        size="sm"
                                    />
                                    <MenuList shadow="xl" borderRadius="xl">
                                        <MenuItem
                                            icon={<HiInformationCircle />}
                                            onClick={() => onViewDetails(user.id)}
                                            fontWeight="bold"
                                        >
                                            Ver Detalles
                                        </MenuItem>
                                        {user.status === 'suspended' ? (
                                            <MenuItem
                                                icon={<HiCheckCircle />}
                                                color="green.500"
                                                onClick={() => handleReactivateClick(user)}
                                            >
                                                Levantar Suspensión
                                            </MenuItem>
                                        ) : (
                                            <MenuItem
                                                icon={<HiBan />}
                                                color="orange.500"
                                                onClick={() => handleSuspendClick(user)}
                                            >
                                                Suspender Cuenta
                                            </MenuItem>
                                        )}

                                        <MenuItem
                                            icon={<HiTrash />}
                                            color="red.500"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            Eliminar Permanentemente
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={deleteDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={deleteDisc.onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(2px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Eliminar Usuario
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Estás seguro de eliminar a <b>{selectedUser?.username}</b>?
                            <Text mt={2} color="red.500" fontSize="sm">
                                Esta acción es irreversible y borrará todos sus puntos, retos y progreso en EcoTrack.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={deleteDisc.onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="xl">
                                Confirmar Eliminación
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Suspend Confirmation Dialog */}
            <AlertDialog
                isOpen={suspendDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={suspendDisc.onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(2px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Suspender Cuenta
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Confirmas la suspensión de <b>{selectedUser?.username}</b>?
                            <Text mt={2} fontSize="sm" color="gray.500">
                                El usuario no podrá acceder a su cuenta ni participar en retos hasta que la suspensión sea removida.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={suspendDisc.onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="orange" onClick={confirmSuspend} ml={3} borderRadius="xl">
                                Confirmar Suspensión
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Reactivate Confirmation Dialog */}
            <AlertDialog
                isOpen={reactivateDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={reactivateDisc.onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(2px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Levantar Suspensión
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Deseas reactivar la cuenta de <b>{selectedUser?.username}</b>?
                            <Text mt={2} fontSize="sm" color="gray.500">
                                El usuario recuperará el acceso completo a la aplicación inmediatamente.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={reactivateDisc.onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="green" onClick={confirmReactivate} ml={3} borderRadius="xl">
                                Confirmar Reactivación
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};
