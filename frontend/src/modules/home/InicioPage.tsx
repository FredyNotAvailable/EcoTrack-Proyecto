import { lazy, Suspense, useState } from "react";
import {
    Box,
    Grid,
    GridItem,
    Skeleton,
    useDisclosure,
    HStack,
    VStack,
    Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { consejosService } from "./services/consejos.service";
import { misionesService } from "./services/misiones.service";
import type { DailyMission } from "./services/misiones.service";
import { useUserStats } from "../../hooks/useUserStats";
import { userRachasService } from "../../services/userRachasService";
import { useAuth } from "../auth/AuthContext";
import { useRetos } from "../retos/hooks/useRetos";
import { ProfileAPIService } from "../profile/services/profile.service";

// Above-the-fold components - carga inmediata
import { DashboardHeader, StatsOverview, MissionModal } from "./components";

/**
 * Dado un fecha_fin, retorna el viernes de esa semana a las 23:59:59.999.
 * Los retos expiran el viernes a medianoche hora Ecuador.
 */
function getFridayExpiry(fechaFin: string): Date {
    const datePart = fechaFin.substring(0, 10);
    const [y, m, d] = datePart.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay(); // 0=Dom, 5=Vie, 6=Sab

    let friday: Date;
    if (dayOfWeek === 5) {
        friday = date;
    } else if (dayOfWeek === 6) {
        friday = new Date(y, m - 1, d - 1);
    } else if (dayOfWeek === 0) {
        friday = new Date(y, m - 1, d - 2);
    } else {
        friday = new Date(y, m - 1, d + (5 - dayOfWeek));
    }
    friday.setHours(23, 59, 59, 999);
    return friday;
}

// Below-the-fold components - lazy loading
const ActiveChallenges = lazy(() => import('./components/ActiveChallenges'));
const DailyTip = lazy(() => import('./components/DailyTip'));
const DailyMissionsWidget = lazy(() => import('./components/DailyMissionsWidget'));

// Skeleton optimizado
const SectionSkeleton = () => (
    <Box
        p={{ base: 6, md: 8 }}
        bg="white"
        borderRadius="32px"
        boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
        border="1px solid rgba(0,0,0,0.03)"
    >
        <HStack mb={4} justify="space-between">
            <Skeleton height="24px" width="140px" borderRadius="xl" />
            <Skeleton height="20px" width="60px" borderRadius="full" />
        </HStack>
        <VStack spacing={4} align="stretch">
            <Skeleton height="80px" borderRadius="20px" />
            <Skeleton height="80px" borderRadius="20px" />
            <HStack spacing={3}>
                <Skeleton height="40px" width="40px" borderRadius="full" />
                <Box flex={1}>
                    <Skeleton height="16px" width="80%" mb={2} borderRadius="lg" />
                    <Skeleton height="14px" width="60%" borderRadius="lg" />
                </Box>
            </HStack>
        </VStack>
    </Box>
);

export const InicioPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);

    // Stats, Racha and Profile with React Query
    const { data: stats, isLoading: loadingStats } = useUserStats();

    const { data: racha } = useQuery({
        queryKey: ['racha', 'me'],
        queryFn: () => userRachasService.getMyRacha(),
        staleTime: 1000 * 60 * 5,
    });

    const { data: profile } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: () => ProfileAPIService.getMe(),
        staleTime: 1000 * 60 * 10,
    });

    // Use Retos Hook
    const { challenges, isLoading: loadingRetos } = useRetos();

    const activeChallenges = challenges.filter(challenge => {
        const now = new Date();
        const fridayEnd = getFridayExpiry(challenge.fecha_fin);
        return challenge.joined && fridayEnd >= now && challenge.status !== 'completed' && challenge.status !== 'expired';
    });

    // Daily Tip Query
    const { data: dailyTip, isLoading: loadingTip } = useQuery({
        queryKey: ['dailyTip'],
        queryFn: () => consejosService.getDailyTip(),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    // Missions Query
    const { data: missions = [], isLoading: loadingMissions } = useQuery({
        queryKey: ['dailyMissions'],
        queryFn: async () => {
            const [rawMissions, completedIds] = await Promise.all([
                misionesService.getDailyMissions(),
                misionesService.getCompletedMissions(),
            ]);

            return rawMissions.map((m: DailyMission) => ({
                ...m,
                completed: completedIds.includes(m.id)
            })).sort((a: DailyMission, b: DailyMission) => {
                return Number(a.completed) - Number(b.completed);
            });
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });

    const handleMissionClick = (mission: DailyMission) => {
        setSelectedMission(mission);
        onOpen();
    };

    const handleCompleteMission = async (missionId: string) => {
        await misionesService.completeMission(missionId);

        // Refresh missions, stats and racha
        queryClient.invalidateQueries({ queryKey: ['dailyMissions'] });
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
    };

    return (
        <Box minH="calc(100vh - 120px)" w="full" bg="brand.bgBody">
            <MissionModal
                mission={selectedMission}
                isOpen={isOpen}
                onClose={onClose}
                onComplete={handleCompleteMission}
            />

            <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
                style={{ minHeight: "calc(100vh - 120px)" }}
            >
                {/* Hero Section - Optimizado */}
                <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
                    <Box
                        bg="white"
                        borderRadius="32px"
                        p={{ base: 6, md: 8 }}
                        mb={{ base: 6, md: 8 }}
                        boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
                        border="1px solid rgba(0,0,0,0.03)"
                    >
                        {/* Header */}
                        <Box mb={6}>
                            <DashboardHeader
                                username={profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Guardián'}
                            />
                        </Box>

                        {/* Stats Overview */}
                        <StatsOverview stats={stats} racha={racha} loading={loadingStats} />
                    </Box>

                    {/* Main Content Grid */}
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            lg: "2fr 1fr"
                        }}
                        gap={{ base: 6, md: 8 }}
                        minH="300px"
                    >
                        {/* Contenido Principal */}
                        <GridItem>
                            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                                {/* Retos Activos */}
                                <Suspense fallback={<SectionSkeleton />}>
                                    <ActiveChallenges challenges={activeChallenges} loading={loadingRetos} />
                                </Suspense>

                                {/* Consejo Diario */}
                                <Suspense fallback={<SectionSkeleton />}>
                                    <DailyTip tip={dailyTip || null} loading={loadingTip} />
                                </Suspense>
                            </VStack>
                        </GridItem>

                        {/* Sidebar - Misiones */}
                        <GridItem>
                            <Suspense fallback={<SectionSkeleton />}>
                                <DailyMissionsWidget
                                    missions={missions}
                                    loading={loadingMissions}
                                    onMissionClick={handleMissionClick}
                                />
                            </Suspense>
                        </GridItem>
                    </Grid>
                </Container>
            </motion.div>
        </Box>
    );
};

export default InicioPage;
