import { useState } from 'react';
import { Container, VStack, useToast, useDisclosure } from '@chakra-ui/react';
import { UserStats } from './components/UserStats';
import { UserFilters } from './components/UserFilters';
import { UserTable } from './components/UserTable';
import { UserModal } from './components/UserModal';
import { UserDetailsModal } from './components/UserDetailsModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';
import type { AdminUser } from '../services/admin.service';

export const AdminUsersPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // User Modal State
    const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();

    // Details Modal State
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

    const { data: users = [], isLoading } = useQuery<AdminUser[]>({
        queryKey: ['admin', 'users'],
        queryFn: AdminAPIService.getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: AdminAPIService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            toast({
                title: 'Usuario eliminado',
                status: 'success',
                duration: 3000,
            });
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            AdminAPIService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            toast({
                title: 'Estado actualizado',
                status: 'success',
                duration: 3000,
            });
        }
    });

    const filteredUsers = (users as AdminUser[]).filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === '' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleCreateClick = () => {
        onUserModalOpen();
    };

    return (
        <Container maxW="full" py={4} px={{ base: 0, md: 4 }}>
            <VStack spacing={8} align="stretch">

                <UserStats users={users as AdminUser[]} />

                <UserFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    onCreateClick={handleCreateClick}
                />

                <UserTable
                    users={filteredUsers}
                    isLoading={isLoading}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onChangeStatus={(id, status) => statusMutation.mutate({ id, status })}
                    onViewDetails={(id) => {
                        setSelectedUserId(id);
                        onDetailsOpen();
                    }}
                />
            </VStack>

            <UserModal
                isOpen={isUserModalOpen}
                onClose={onUserModalClose}
            />

            <UserDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    onDetailsClose();
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
            />
        </Container>
    );
};
