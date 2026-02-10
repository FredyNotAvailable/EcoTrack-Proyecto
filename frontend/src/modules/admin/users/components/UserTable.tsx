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
    Button,
    Tooltip
} from '@chakra-ui/react';
import React from 'react';
import { HiDotsVertical, HiTrash, HiBan, HiCheckCircle, HiInformationCircle, HiUsers } from 'react-icons/hi';
import { useAuth } from '../../../auth/AuthContext';
import type { AdminUser } from '../../services/admin.service';
import { LiveStatus } from '../../shared/LiveStatus';
import { EmptyState } from '../../shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { tableRowVariants } from '../../shared/animations';

interface UserTableProps {
    users: AdminUser[];
    isLoading: boolean;
    onDelete: (id: string) => void;
    onChangeStatus: (id: string, status: string) => void;
    onViewDetails: (id: string) => void;
}

const MotionTr = motion(Tr);

export const UserTable = ({ users, isLoading, onDelete, onChangeStatus, onViewDetails }: UserTableProps) => {
    const { user: currentUser } = useAuth();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
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
            <Center py={20} bg={bg} borderRadius="3xl" border="1px" borderColor={borderColor}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                    <Text fontWeight="bold" color="gray.500">Cargando ciudadanos...</Text>
                </VStack>
            </Center>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <EmptyState
                title="Sin Ciudadanos"
                description="No se encontraron usuarios que coincidan con los filtros actuales."
                icon={HiUsers}
            />
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
            shadow="sm"
        >
            <Table variant="simple">
                <Thead bg={theadBg}>
                    <Tr>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Usuario</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Rol</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Puntos / Nivel</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Estado</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Fecha Registro</Th>
                        <Th isNumeric fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <AnimatePresence mode='popLayout'>
                        {filteredUsers.map((user, index) => (
                            <MotionTr
                                key={user.id}
                                _hover={{ bg: hoverBg }}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                custom={index}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Td py={4}>
                                    <HStack spacing={3}>
                                        <Avatar size="sm" name={user.username} src={user.avatar_url} border="2px solid white" shadow="sm" />
                                        <Box>
                                            <Text fontWeight="800" fontSize="sm" color="gray.700">@{user.username}</Text>
                                            <Text fontSize="xs" color="gray.400" fontWeight="600">{user.email}</Text>
                                        </Box>
                                    </HStack>
                                </Td>
                                <Td py={4}>
                                    <Badge
                                        colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                                        px={3}
                                        py={0.5}
                                        borderRadius="full"
                                        fontSize="10px"
                                        textTransform="uppercase"
                                    >
                                        {user.role}
                                    </Badge>
                                </Td>
                                <Td py={4}>
                                    <HStack spacing={2}>
                                        <VStack align="start" spacing={0}>
                                            <HStack spacing={1}>
                                                <Text fontWeight="900" fontSize="sm">{user.puntos}</Text>
                                                <Text fontSize="10px" fontWeight="800" color="gray.400">PTS</Text>
                                            </HStack>
                                            <Badge variant="subtle" colorScheme="orange" fontSize="9px" borderRadius="full" px={2}>
                                                NV. {user.nivel}
                                            </Badge>
                                        </VStack>
                                    </HStack>
                                </Td>
                                <Td py={4}>
                                    <LiveStatus
                                        isActive={user.status === 'active'}
                                        activeLabel="Activo"
                                        inactiveLabel="Suspendido"
                                    />
                                </Td>
                                <Td py={4} fontSize="xs" fontWeight="bold" color="gray.500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </Td>
                                <Td py={4} isNumeric>
                                    <Menu>
                                        <Tooltip label="Opciones de gestión" placement="top" hasArrow>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label="Options"
                                                icon={<HiDotsVertical />}
                                                variant="ghost"
                                                size="sm"
                                                borderRadius="lg"
                                            />
                                        </Tooltip>
                                        <MenuList shadow="2xl" borderRadius="xl" border="none" py={2}>
                                            <MenuItem
                                                icon={<HiInformationCircle size={18} />}
                                                onClick={() => onViewDetails(user.id)}
                                                fontWeight="800"
                                                fontSize="sm"
                                                py={3}
                                            >
                                                Ver Expediente
                                            </MenuItem>
                                            {user.status === 'suspended' ? (
                                                <MenuItem
                                                    icon={<HiCheckCircle size={18} />}
                                                    color="green.500"
                                                    onClick={() => handleReactivateClick(user)}
                                                    fontWeight="800"
                                                    fontSize="sm"
                                                    py={3}
                                                >
                                                    Levantar Suspensión
                                                </MenuItem>
                                            ) : (
                                                <MenuItem
                                                    icon={<HiBan size={18} />}
                                                    color="orange.500"
                                                    onClick={() => handleSuspendClick(user)}
                                                    fontWeight="800"
                                                    fontSize="sm"
                                                    py={3}
                                                >
                                                    Suspender Cuenta
                                                </MenuItem>
                                            )}

                                            <MenuItem
                                                icon={<HiTrash size={18} />}
                                                color="red.500"
                                                onClick={() => handleDeleteClick(user)}
                                                fontWeight="800"
                                                fontSize="sm"
                                                py={3}
                                            >
                                                Eliminar Ciudadano
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </MotionTr>
                        ))}
                    </AnimatePresence>
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
