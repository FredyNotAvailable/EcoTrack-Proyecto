import { useQuery } from '@tanstack/react-query';
import { userStatsService } from '../services/userStatsService';

export const useUserStats = () => {
    return useQuery({
        queryKey: ['userStats'],
        queryFn: userStatsService.getUserStats,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        refetchOnWindowFocus: false
    });
};
