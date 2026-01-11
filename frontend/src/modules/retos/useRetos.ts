import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RetoService } from './retos.service';
import { useToast } from '@chakra-ui/react';

export const useRetos = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: retos, isLoading, error } = useQuery({
        queryKey: ['retos'],
        queryFn: RetoService.getAll,
    });

    const joinMutation = useMutation({
        mutationFn: RetoService.join,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['retos'] });
            toast({
                title: '¡Te has unido al reto!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error al unirse',
                description: error.response?.data?.message || 'Algo salió mal',
                status: 'error',
            });
        }
    });

    return {
        retos,
        isLoading,
        error,
        joinReto: joinMutation.mutate,
        isJoining: joinMutation.isPending,
    };
};
