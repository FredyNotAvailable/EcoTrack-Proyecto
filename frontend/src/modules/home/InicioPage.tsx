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
    HStack,
    Button,
    Badge,
    Tooltip
} from "@chakra-ui/react";
import {
    FaLeaf,
    FaArrowRight,
    FaLightbulb,
    FaCircleCheck,
    FaFire,
    FaTrophy,
    FaTree
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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
        <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "start", md: "flex-end" }}
            justify="space-between"
            mb={6}
            mt={-2}
            pt={2}
            gap={2}
        >
            <Box>
                <Heading as="h1" fontSize={{ base: "2rem", md: "2.5rem" }} lineHeight="1.1" color="brand.secondary" mb={1}>
                    ¡Hola, <Text as="span" bgGradient="linear(to-r, brand.primary, brand.accent)" bgClip="text" fontWeight="900"> {username} </Text>! 🌿
                </Heading>
                <Text color="brand.textMuted" fontSize="lg" fontWeight="500">
                    Tu impacto positivo está transformando el mundo, un hábito a la vez.
                </Text>
            </Box>
        </Flex>
    );
};

const StatsOverviewVisual = ({ stats, racha, loading }: { stats?: UserStats, racha?: UserRacha | null, loading: boolean }) => {
    if (loading) {
        return (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={5} mb={4} bg="white" p={6} borderRadius="24px" boxShadow="lg">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="80px" borderRadius="16px" />)}
            </SimpleGrid>
        );
    }

    const isRachaActive = racha?.ultima_fecha && racha.ultima_fecha === new Date().toISOString().split('T')[0];

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <SimpleGrid
                columns={{ base: 2, md: 3, lg: 5 }}
                spacing={5}
                mb={6}
                bg="white"
                p={6}
                borderRadius="30px"
                boxShadow="xl"
                border="1px solid"
                borderColor="gray.50"
            >
                {/* Stat 1 */}
                <Flex direction="column" pl={5} py={2} borderLeft="4px solid" borderColor="brand.primary">
                    <Text fontSize="xs" fontWeight="700" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>Experiencia</Text>
                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{stats?.puntos_totales || 0}</Text>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="600">Puntos XP</Text>
                </Flex>

                {/* Stat 2 */}
                <Flex direction="column" pl={5} py={2} borderLeft="4px solid" borderColor="brand.secondary">
                    <Text fontSize="xs" fontWeight="700" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>Nivel</Text>
                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">Nvl. {stats?.nivel || 1}</Text>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="600">Explorador</Text>
                </Flex>

                {/* Stat 3: CO2 Impact */}
                <Flex direction="column" pl={5} py={2} borderLeft="4px solid" borderColor="green.400">
                    <Text fontSize="xs" fontWeight="700" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>Impacto</Text>
                    <Tooltip label="Kilogramos de CO2 ahorrados gracias a tus acciones." hasArrow>
                        <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{stats?.kg_co2_ahorrado || 0} kg</Text>
                    </Tooltip>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="600">CO₂ Evitado</Text>
                </Flex>

                {/* Stat 4: Eco Racha */}
                <Flex direction="column" pl={5} py={2} borderLeft="4px solid" borderColor="orange.400">
                    <Text fontSize="xs" fontWeight="700" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>Racha</Text>
                    <Flex align="center" gap={2}>
                        <Text fontSize="2xl" fontWeight="900" color="brand.secondary">
                            {racha?.racha_actual || 0}
                        </Text>
                        <Icon
                            as={FaFire}
                            fontSize="1.2rem"
                            color={isRachaActive ? "orange.400" : "gray.300"}
                            title={isRachaActive ? "¡Racha activa!" : "Completa una misión para activar"}
                        />
                    </Flex>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="600">Días seguidos</Text>
                </Flex>

                {/* Stat 5 */}
                <Flex direction="column" pl={5} py={2} borderLeft="4px solid" borderColor="purple.400">
                    <Text fontSize="xs" fontWeight="700" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>Progreso</Text>
                    <Box mt={2} h="6px" w="100%" bg="gray.100" borderRadius="full" overflow="hidden">
                        <Box h="100%" w={`${stats?.progress?.progreso_porcentaje || 0}% `} bgGradient="linear(to-r, purple.400, purple.600)" />
                    </Box>
                    <Text fontSize="xs" color="brand.textMuted" mt={1} fontWeight="600">
                        {stats?.progress?.progreso_porcentaje || 0}% para Nvl. {(stats?.nivel || 1) + 1}
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
            borderRadius="24px"
            boxShadow="lg"
            mb={8}
            border="1px solid"
            borderColor="gray.100"
        >
            <Flex justify="space-between" align="center" mb={5}>
                <Flex align="center" gap={2}>
                    <Icon as={FaTrophy} color="brand.primary" />
                    <Text fontSize="lg" fontWeight="800" color="brand.secondary">Retos en Curso</Text>
                </Flex>
                <Button
                    variant="ghost"
                    color="brand.primary"
                    size="sm"
                    fontSize="sm"
                    fontWeight="700"
                    rightIcon={<Icon as={FaArrowRight} />}
                    onClick={() => navigate('/app/retos')}
                    _hover={{ bg: 'brand.bgCardLight' }}
                >
                    Ver todos
                </Button>
            </Flex>

            {loading ? (
                <VStack spacing={4} align="stretch">
                    <Skeleton height="70px" borderRadius="16px" />
                    <Skeleton height="70px" borderRadius="16px" />
                </VStack>
            ) : joinedChallenges.length > 0 ? (
                joinedChallenges.map((reto) => (
                    <Flex
                        key={reto.id}
                        align="center"
                        gap={4}
                        p={4}
                        border="1px solid"
                        borderColor="gray.100"
                        borderRadius="20px"
                        mb={3}
                        transition="all 0.2s"
                        cursor="pointer"
                        _hover={{ transform: "translateX(4px)", borderColor: "brand.primary", bg: "brand.bgCardLight" }}
                        onClick={() => navigate('/app/retos')}
                    >
                        <Flex w="48px" h="48px" borderRadius="2xl" bg="brand.bgCardLight" color="brand.primary" align="center" justify="center" shrink={0}>
                            <Icon as={FaLeaf} fontSize="1.2rem" />
                        </Flex>
                        <Box flex={1}>
                            <Text fontSize="sm" fontWeight="700" mb={1} color="brand.secondary">{reto.titulo}</Text>
                            <Box h="6px" w="100%" bg="gray.100" borderRadius="full" mb={2} overflow="hidden">
                                <Box h="100%" w={`${reto.progress}% `} bg="brand.primary" borderRadius="full" />
                            </Box>
                            <Flex fontSize="xs" color="brand.textMuted" gap={3} fontWeight="600">
                                <Flex align="center" gap={1}><Icon as={FaTree} color="green.500" /> {reto.recompensa_kg_co2}kg Ahorrados</Flex>
                                <Text color="brand.primary">{Math.round(reto.progress)}% Completado</Text>
                            </Flex>
                        </Box>
                    </Flex>
                ))
            ) : (
                <VStack py={8} spacing={3} bg="gray.50" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                    <Icon as={FaLeaf} color="gray.400" boxSize={8} />
                    <Text fontSize="sm" color="gray.500" fontWeight="500">¿Listo para un desafío?</Text>
                    <Button
                        size="sm"
                        bg="brand.primary"
                        color="white"
                        borderRadius="full"
                        _hover={{ bg: "brand.primaryHover" }}
                        onClick={() => navigate('/app/retos')}
                    >
                        Explorar Retos
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
            bg="brand.accentLight" // Un color suave para destacar
            borderRadius="24px"
            boxShadow="lg"
            mb={8}
            position="relative"
            overflow="hidden"
        >
            <Icon as={FaLightbulb} position="absolute" right="-20px" bottom="-20px" fontSize="10rem" color="white" opacity="0.5" transform="rotate(20deg)" />

            <Flex align="center" gap={3} mb={3} color="brand.accent" fontSize="lg" fontWeight="800">
                <Box bg="white" p={2} borderRadius="full" boxShadow="sm">
                    <Icon as={FaLightbulb} />
                </Box>
                <Text>Sabías que...</Text>
            </Flex>

            {loading ? (
                <>
                    <Skeleton height="20px" width="60%" mb={3} />
                    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
                </>
            ) : tip ? (
                <Box position="relative" zIndex={1}>
                    <Text fontSize="lg" fontWeight="800" mb={2} color="brand.secondary">{tip.titulo}</Text>
                    <Text color="brand.secondary" fontSize="md" lineHeight="1.6" fontWeight="500">
                        {tip.descripcion}
                    </Text>
                </Box>
            ) : (
                <Text color="brand.textMuted" fontSize="sm">
                    Hoy no hay consejo, ¡pero tú ya eres sabio! 🦉
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
            borderColor={mission.completed ? "green.100" : "gray.100"}
            borderRadius="20px"
            cursor="pointer"
            transition="all 0.3s ease"
            opacity={mission.completed ? 0.7 : 1}
            position="relative"
            _hover={{
                borderColor: mission.completed ? "green.300" : "brand.primary",
                transform: "translateY(-3px)",
                boxShadow: "md"
            }}
            onClick={onClick}
        >
            <Flex justify="space-between" align="center">
                <HStack spacing={4} flex={1}>
                    <Flex
                        w="50px"
                        h="50px"
                        borderRadius="16px"
                        bg={mission.completed ? "green.100" : "brand.bgCardLight"}
                        color={mission.completed ? "green.600" : "brand.primary"}
                        align="center"
                        justify="center"
                        boxShadow="sm"
                    >
                        {mission.completed ? <Icon as={FaCircleCheck} fontSize="1.4rem" /> : <Icon as={FaLeaf} fontSize="1.2rem" />}
                    </Flex>
                    <Box>
                        <Text
                            fontWeight="700"
                            fontSize="md"
                            color={mission.completed ? "gray.500" : "brand.secondary"}
                            mb={1}
                            textDecoration={mission.completed ? "line-through" : "none"}
                        >
                            {mission.titulo}
                        </Text>
                        <HStack spacing={2}>
                            <Badge
                                variant="subtle"
                                colorScheme={
                                    mission.categoria === 'energia' ? 'orange' :
                                        mission.categoria === 'agua' ? 'cyan' :
                                            mission.categoria === 'transporte' ? 'purple' :
                                                'green'
                                }
                                borderRadius="full"
                                px={2}
                                fontSize="0.65rem"
                                textTransform="capitalize"
                            >
                                {mission.categoria}
                            </Badge>
                            <Text fontSize="xs" fontWeight="700" color="brand.primary">+{mission.puntos} XP</Text>
                        </HStack>
                    </Box>
                </HStack>
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
    const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

    return (
        <Box
            p={6}
            bg="white"
            borderRadius="24px"
            boxShadow="lg"
            mb={8}
            border="1px solid"
            borderColor="gray.100"
        >
            <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="lg" fontWeight="800" color="brand.secondary">Misiones de Hoy</Text>
                <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                    {completedCount}/{missions.length}
                </Badge>
            </Flex>

            <Box h="6px" w="100%" bg="gray.100" borderRadius="full" mb={6} overflow="hidden">
                <Box h="100%" w={`${progress}%`} bg="brand.primary" borderRadius="full" transition="width 0.5s ease" />
            </Box>

            <VStack spacing={4} align="stretch">
                {loading ? (
                    <>
                        <Skeleton height="80px" borderRadius="20px" />
                        <Skeleton height="80px" borderRadius="20px" />
                        <Skeleton height="80px" borderRadius="20px" />
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
                    <Flex direction="column" align="center" py={8} textAlign="center">
                        <Icon as={FaLeaf} color="green.300" boxSize={10} mb={3} />
                        <Text color="gray.500" fontWeight="500">¡Todo despejado por hoy!</Text>
                        <Text fontSize="xs" color="gray.400">Vuelve mañana para más misiones.</Text>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};

// --- Component ---
import { ProfileAPIService } from "../profile/services/profile.service";

export const InicioPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);

    const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
    const [loadingTip, setLoadingTip] = useState(true);

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

    // Missions State
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [loadingMissions, setLoadingMissions] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tipPromise = consejosService.getDailyTip();
                const missionsPromise = misionesService.getDailyMissions();
                const completedPromise = misionesService.getCompletedMissions();

                const [tip, rawMissions, completedIds] = await Promise.all([
                    tipPromise,
                    missionsPromise,
                    completedPromise,
                ]);

                setDailyTip(tip);

                const mergedMissions = rawMissions.map((m: any) => ({
                    ...m,
                    completed: completedIds.includes(m.id)
                }));

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

    const handleCompleteMission = async (missionId: string) => {
        await misionesService.completeMission(missionId);

        setMissions(prev => {
            const updated = prev.map(m =>
                m.id === missionId ? { ...m, completed: true } : m
            );
            return [...updated].sort((a, b) => Number(a.completed) - Number(b.completed));
        });

        // Refresh stats and racha
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
    };



    return (
        <Box
            maxW="1200px"
            mx="auto"
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
            >
                {/* Header */}
                <Box mb={3}>
                    {/* Safe fallback for display name */}
                    <DashboardHeaderVisual username={profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Guardián'} />
                </Box>

                {/* Stats */}
                <Box mb={6}>
                    <StatsOverviewVisual stats={stats} racha={racha} loading={loadingStats} />
                </Box>

                {/* Main Grid */}
                <Grid
                    templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                    gap={8}
                >
                    {/* Main Content */}
                    <GridItem>
                        <Box mb={6}>
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
