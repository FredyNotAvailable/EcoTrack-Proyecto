import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retosService } from '../services/retos.service';
import { useToast } from '@chakra-ui/react';

export const useRetos = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    const { data: challenges = [], isLoading, error } = useQuery({
        queryKey: ['retos'],
        queryFn: retosService.getMyChallenges,
    });

    const joinChallengeMutation = useMutation({
        mutationFn: retosService.joinChallenge,
        onSuccess: () => {
            toast({
                title: '¡Te has unido al reto!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ['retos'] });
        },
        onError: (error: any) => {
            toast({
                title: 'Error al unirse al reto',
                description: error.response?.data?.message || 'Inténtalo de nuevo',
                status: 'error',
                duration: 3000,
            });
        }
    });

    const completeTaskMutation = useMutation({
        mutationFn: ({ retoId, taskId }: { retoId: string, taskId: string }) =>
            retosService.completeTask(retoId, taskId),
        onSuccess: () => {
            toast({
                title: '¡Tarea completada!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ['retos'] });
            queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Refresh points
        },
        onError: (error: any) => {
            toast({
                title: 'Error al completar tarea',
                description: error.response?.data?.message || 'Inténtalo de nuevo',
                status: 'error',
                duration: 3000,
            });
        }
    });

    return {
        challenges,
        isLoading,
        error,
        joinChallenge: joinChallengeMutation.mutate,
        joinChallengeAsync: joinChallengeMutation.mutateAsync,
        isJoining: joinChallengeMutation.isPending,
        completeTask: completeTaskMutation.mutate,
        completeTaskAsync: completeTaskMutation.mutateAsync,
        isCompletingTask: completeTaskMutation.isPending
    };
};
