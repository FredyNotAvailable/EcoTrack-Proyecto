import {
    Box,
    Grid,
    GridItem,
    SimpleGrid,
    Heading,
    Text,
    Flex,
    Icon,
    Skeleton,
    SkeletonText,
    VStack,
    Button,

} from "@chakra-ui/react";
import {
    FaLeaf,
    FaArrowRight,
    FaLightbulb,
    FaCircleCheck,
    FaCloud
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { consejosService } from "./services/consejos.service";
import type { DailyTip } from "./services/consejos.service";
import { misionesService } from "./services/misiones.service";
import type { DailyMission } from "./services/misiones.service";
import { MissionModal } from "./components/MissionModal";
import { useDisclosure } from "@chakra-ui/react";
import { useUserStats } from "../../hooks/useUserStats";
import type { UserStats } from "../../services/userStatsService";
import { userRachasService } from "../../services/userRachasService";
import type { UserRacha } from "../../services/userRachasService";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRetos } from "../retos/hooks/useRetos";
import type { Reto } from "../retos/services/retos.service";

// --- Visual Components (Cloned from Dashboard) ---

const MotionBox = motion(Box);

const DashboardHeaderVisual = ({ username }: { username: string }) => {
    return (
        <Box mb={6} pt={2}>
            <Heading as="h1" fontSize={{ base: "2.5rem", md: "3.5rem" }} mb={2} lineHeight="1.2" color="brand.secondary">
                Hola, <Text as="span" bgGradient="linear(to-r, brand.primary, brand.accent)" bgClip="text" display="inline-block"> {username} </Text> 👋
            </Heading>
            <Text color="brand.textMuted" fontSize="1.1rem">Aquí tienes un resumen de tu impacto ecológico hoy.</Text>
        </Box>
    );
};

const StatsOverviewVisual = ({ stats, racha, loading }: { stats?: UserStats, racha?: UserRacha | null, loading: boolean }) => {
    if (loading) {
        return (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={5} mb={8} bg="white" p={6} borderRadius="16px" boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="80px" borderRadius="12px" />)}
            </SimpleGrid>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <SimpleGrid
                columns={{ base: 2, md: 3, lg: 5 }}
                spacing={5}
                mb={8}
                bg="white"
                p={6}
                borderRadius="16px"
                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            >
                {/* Stat 1 */}
                <Flex direction="column" pl={4} borderLeft="3px solid" borderColor="brand.primary">
                    <Text fontSize="0.85rem" fontWeight="600" color="brand.textMuted" textTransform="uppercase" mb={1}>Puntos Totales</Text>
                    <Text fontSize="1.5rem" fontWeight="800" color="brand.textMain">{stats?.puntos_totales || 0}</Text>
                    <Text fontSize="0.8rem" color="brand.textMuted" mt="3px">xp acumulados</Text>
                </Flex>

                {/* Stat 2 */}
                <Flex direction="column" pl={4} borderLeft="3px solid" borderColor="brand.secondary">
                    <Text fontSize="0.85rem" fontWeight="600" color="brand.textMuted" textTransform="uppercase" mb={1}>Nivel Actual</Text>
                    <Text fontSize="1.5rem" fontWeight="800" color="brand.textMain">Lvl. {stats?.nivel || 1}</Text>
                    <Text fontSize="0.8rem" color="brand.textMuted" mt="3px">Explorador Eco</Text>
                </Flex>

                {/* Stat 3: CO2 Impact */}
                <Flex direction="column" pl={4} borderLeft="3px solid" borderColor="green.400">
                    <Text fontSize="0.85rem" fontWeight="600" color="brand.textMuted" textTransform="uppercase" mb={1}>CO₂ Ahorrado</Text>
                    <Text fontSize="1.5rem" fontWeight="800" color="brand.textMain">{stats?.kg_co2_ahorrado || 0} kg</Text>
                    <Text fontSize="0.8rem" color="brand.textMuted" mt="3px">Impacto Real</Text>
                </Flex>

                {/* Stat 4: Eco Racha */}
                <Flex direction="column" pl={4} borderLeft="3px solid" borderColor="brand.accentYellow">
                    <Text fontSize="0.85rem" fontWeight="600" color="brand.textMuted" textTransform="uppercase" mb={1}>Eco Racha</Text>
                    <Flex align="center" gap={2}>
                        <Text fontSize="1.5rem" fontWeight="800" color="brand.textMain">
                            {/* We don't have racha in user_stats yet, maybe pass it separately or use misiones_diarias for now */}
                            {racha?.racha_actual || 0}
                        </Text>
                        <Text fontSize="1.2rem">🔥</Text>
                    </Flex>
                    <Text fontSize="0.8rem" color="brand.textMuted" mt="3px">
                        Días seguidos
                    </Text>
                </Flex>

                {/* Stat 5 */}
                <Flex direction="column" pl={4} borderLeft="3px solid" borderColor="brand.accentPurple">
                    <Text fontSize="0.85rem" fontWeight="600" color="brand.textMuted" textTransform="uppercase" mb={1}>Próximo Nivel</Text>
                    <Box mt="5px" h="8px" w="100%" bg="#f1f2f6" borderRadius="full" overflow="hidden">
                        <Box h="100%" w={`${stats?.progress?.progreso_porcentaje || 0}%`} bgGradient="linear(to-r, #9b59b6, #8e44ad)" />
                    </Box>
                    <Text fontSize="0.8rem" color="brand.textMuted" mt="3px">
                        {stats?.progress?.experiencia_relativa || 0} / {
                            stats?.progress?.puntos_siguiente_nivel
                                ? (stats.progress.puntos_siguiente_nivel - stats.progress.puntos_nivel_actual)
                                : 'Max'
                        } exp ({stats?.progress?.progreso_porcentaje || 0}%)
                    </Text>
                </Flex>
            </SimpleGrid>
        </MotionBox>
    );
};

const ActiveChallengesVisual = ({ challenges, loading }: { challenges: Reto[], loading: boolean }) => {
    const navigate = useNavigate();
    const joinedChallenges = challenges.filter(r => r.joined && r.status !== 'completed').slice(0, 2);

    return (
        <Box
            p={6}
            bg="white"
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            mb={8}
            border="1px solid rgba(0, 0, 0, 0.05)"
        >
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="1.2rem" fontWeight="700">Retos Activos</Text>
                <Button
                    variant="link"
                    color="brand.primary"
                    fontSize="0.9rem"
                    fontWeight="600"
                    rightIcon={<Icon as={FaArrowRight} />}
                    onClick={() => navigate('/app/retos')}
                >
                    Ver más
                </Button>
            </Flex>

            {loading ? (
                <VStack spacing={4} align="stretch">
                    <Skeleton height="70px" borderRadius="12px" />
                    <Skeleton height="70px" borderRadius="12px" />
                </VStack>
            ) : joinedChallenges.length > 0 ? (
                joinedChallenges.map((reto) => (
                    <Flex
                        key={reto.id}
                        align="center"
                        gap={4}
                        p={4}
                        border="1px solid #f1f2f6"
                        borderRadius="12px"
                        mb={3}
                        transition="all 0.2s"
                        cursor="pointer"
                        _hover={{ transform: "translateX(5px)", borderColor: "brand.primary", bg: "brand.bgCardLight" }}
                        onClick={() => navigate('/app/retos')}
                    >
                        <Flex w="40px" h="40px" borderRadius="full" bg="brand.bgCardLight" color="brand.primary" align="center" justify="center" shrink={0}>
                            <Icon as={FaLeaf} />
                        </Flex>
                        <Box flex={1}>
                            <Text fontSize="0.95rem" fontWeight="600" mb={1}>{reto.titulo}</Text>
                            <Box h="6px" w="100%" bg="#f1f2f6" borderRadius="full" mb={2} overflow="hidden">
                                <Box h="100%" w={`${reto.progress}%`} bg="brand.primary" borderRadius="full" />
                            </Box>
                            <Flex fontSize="0.8rem" color="brand.textMuted" gap={3}>
                                <Flex align="center" gap={1}><Icon as={FaLeaf} /> {reto.recompensa_kg_co2}kg CO₂</Flex>
                                <Text fontWeight="bold" color="brand.primary">{Math.round(reto.progress)}%</Text>
                            </Flex>
                        </Box>
                    </Flex>
                ))
            ) : (
                <VStack py={4} spacing={2} opacity={0.7}>
                    <Text fontSize="sm" color="gray.500">No tienes retos activos actualmente.</Text>
                    <Button
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        borderRadius="full"
                        onClick={() => navigate('/app/retos')}
                    >
                        Descubrir retos
                    </Button>
                </VStack>
            )}
        </Box>
    );
};

const DailyTipVisual = ({ tip, loading }: { tip: DailyTip | null, loading: boolean }) => {
    return (
        <Box
            p={6}
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            mb={8}
            border="1px solid rgba(0, 0, 0, 0.05)"
            bgGradient="linear(135deg, #e0f2f1 0%, #ffffff 100%)"
            borderLeft="5px solid"
            borderLeftColor="brand.primary"
        >
            <Flex align="center" gap={2} mb={3} color="brand.primary" fontSize="1.2rem" fontWeight="700">
                <Icon as={FaLightbulb} />
                <Text>Consejo del Día</Text>
            </Flex>

            {loading ? (
                <>
                    <Skeleton height="20px" width="60%" mb={3} />
                    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
                </>
            ) : tip ? (
                <>
                    <Text fontSize="1.1rem" fontWeight="bold" mb={2}>{tip.titulo}</Text>
                    <Text color="brand.textMuted" fontSize="0.95rem" lineHeight="1.6">
                        {tip.descripcion}
                    </Text>
                </>
            ) : (
                <Text color="brand.textMuted" fontSize="0.95rem">
                    No hay consejo disponible para hoy. ¡Vuelve mañana!
                </Text>
            )}
        </Box>
    );
};

const MissionCardVisual = ({ mission, onClick }: { mission: DailyMission, onClick: () => void }) => {
    return (
        <Box
            p={4}
            bg={mission.completed ? "gray.50" : "white"}
            border="1px solid"
            borderColor={mission.completed ? "gray.100" : "gray.100"}
            borderRadius="12px"
            cursor="pointer"
            transition="all 0.2s"
            opacity={mission.completed ? 0.7 : 1}
            _hover={{
                borderColor: mission.completed ? "gray.200" : "brand.primary",
                transform: "translateY(-2px)",
                shadow: "sm"
            }}
            onClick={onClick}
        >
            <Flex justify="space-between" align="center">
                <Box>
                    <Text
                        fontWeight="600"
                        fontSize="0.95rem"
                        textDecoration={mission.completed ? "line-through" : "none"}
                        color={mission.completed ? "gray.500" : "gray.700"}
                        mb={1}
                    >
                        {mission.titulo}
                    </Text>
                    <Flex gap={3} fontSize="0.8rem" color="gray.500" align="center">
                        <Flex align="center" gap={1}>
                            <Icon as={FaLeaf} color="brand.primary" />
                            <Text>+{mission.puntos} pts</Text>
                        </Flex>
                        {mission.kg_co2_ahorrado && (
                            <Flex align="center" gap={1}>
                                <Icon as={FaCloud} color="blue.400" />
                                <Text>{mission.kg_co2_ahorrado}kg CO₂</Text>
                            </Flex>
                        )}
                    </Flex>
                </Box>
                {mission.completed && (
                    <Icon as={FaCircleCheck} color="green.400" boxSize={5} />
                )}
            </Flex>
        </Box>
    );
};

const DailyMissionsWidgetVisual = ({
    missions,
    loading,
    onMissionClick
}: {
    missions: DailyMission[],
    loading: boolean,
    onMissionClick: (m: DailyMission) => void
}) => {
    const completedCount = missions.filter(m => m.completed).length;

    return (
        <Box
            p={6}
            bg="white"
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            mb={8}
            border="1px solid rgba(0, 0, 0, 0.05)"
        >
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="1.2rem" fontWeight="700">Misiones Diarias</Text>
                <Text fontSize="0.9rem" color="brand.textMuted">
                    {completedCount}/{missions.length} completadas
                </Text>
            </Flex>

            <VStack spacing="15px" align="stretch">
                {loading ? (
                    <>
                        <Skeleton height="60px" borderRadius="12px" />
                        <Skeleton height="60px" borderRadius="12px" />
                        <Skeleton height="60px" borderRadius="12px" />
                    </>
                ) : missions.length > 0 ? (
                    missions.map((mission) => (
                        <MissionCardVisual
                            key={mission.id}
                            mission={mission}
                            onClick={() => onMissionClick(mission)}
                        />
                    ))
                ) : (
                    <Text color="gray.500" fontSize="sm">No hay misiones disponibles hoy.</Text>
                )}
            </VStack>
        </Box>
    );
};

// --- Component ---
import { ProfileAPIService } from "../profile/services/profile.service";

export const InicioPage = () => {
    const { user } = useAuth();
    const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
    const [loadingTip, setLoadingTip] = useState(true);

    const [racha, setRacha] = useState<UserRacha | null>(null);
    const [profile, setProfile] = useState<any>(null);

    // Missions State
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [loadingMissions, setLoadingMissions] = useState(true);
    const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Use User Stats Hook
    const { data: stats, isLoading: loadingStats } = useUserStats();
    // Use Retos Hook
    const { challenges, isLoading: loadingRetos } = useRetos();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Tip
                const tipPromise = consejosService.getDailyTip();

                // Fetch Missions & Completed IDs
                const missionsPromise = misionesService.getDailyMissions();
                const completedPromise = misionesService.getCompletedMissions();
                const rachaPromise = userRachasService.getMyRacha();
                const profilePromise = ProfileAPIService.getMe();

                const [tip, rawMissions, completedIds, rachaData, profileData] = await Promise.all([
                    tipPromise,
                    missionsPromise,
                    completedPromise,
                    rachaPromise,
                    profilePromise
                ]);

                setDailyTip(tip);
                setRacha(rachaData);
                setProfile(profileData);

                // Merge completed state
                const mergedMissions = rawMissions.map((m: any) => ({
                    ...m,
                    completed: completedIds.includes(m.id)
                }));

                // Sort: Active first, Completed last
                const sortedMissions = mergedMissions.sort((a: any, b: any) => {
                    return Number(a.completed) - Number(b.completed);
                });

                setMissions(sortedMissions);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoadingTip(false);
                setLoadingMissions(false);
            }
        };
        fetchData();
    }, []);

    const handleMissionClick = (mission: DailyMission) => {
        setSelectedMission(mission);
        onOpen();
    };

    const queryClient = useQueryClient();

    const handleCompleteMission = async (missionId: string) => {
        await misionesService.completeMission(missionId);

        // Update local state and re-sort
        setMissions(prev => {
            const updated = prev.map(m =>
                m.id === missionId ? { ...m, completed: true } : m
            );
            return updated.sort((a, b) => Number(a.completed) - Number(b.completed));
        });

        // Invalidate stats to refresh points/level immediately
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        queryClient.invalidateQueries({ queryKey: ['communityPosts'] }); // Just in case
    };

    return (
        <Box
            maxW="1200px"
            mx="auto"
            px={0}
            py={0}
        >
            <MissionModal
                mission={selectedMission}
                isOpen={isOpen}
                onClose={onClose}
                onComplete={handleCompleteMission}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ margin: 0, padding: 0 }}
            >
                {/* Header */}
                <Box mb={3}>
                    <DashboardHeaderVisual username={profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'} />
                </Box>

                {/* Stats */}
                {/* Stats */}
                <Box mb={4}>
                    <StatsOverviewVisual stats={stats} racha={racha} loading={loadingStats} />
                </Box>

                {/* Main Grid */}
                <Grid
                    templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                    gap={4}
                >
                    {/* Main Content */}
                    <GridItem>
                        <Box mb={3}>
                            <ActiveChallengesVisual challenges={challenges} loading={loadingRetos} />
                        </Box>
                        <DailyTipVisual tip={dailyTip} loading={loadingTip} />
                    </GridItem>

                    {/* Sidebar */}
                    <GridItem>
                        <DailyMissionsWidgetVisual
                            missions={missions}
                            loading={loadingMissions}
                            onMissionClick={handleMissionClick}
                        />
                    </GridItem>
                </Grid>
            </motion.div>

        </Box>
    );
};

export default InicioPage;
