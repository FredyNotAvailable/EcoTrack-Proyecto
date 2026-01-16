import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Button,
    HStack,
    VStack,
    Icon,
    Center,
    Spinner,
    useToast,
    Badge,
    CloseButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Circle,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { FaFlag, FaTrophy, FaListCheck, FaClock, FaCircleCheck, FaChevronRight } from 'react-icons/fa6';
import { useRetos } from './hooks/useRetos';
import { RetoCard } from './components/RetoCard';

import { RetoDetailsModal } from './components/RetoDetailsModal';
import { TaskConfirmationModal } from './components/TaskConfirmationModal';
import { ChallengeCompletionModal } from './components/ChallengeCompletionModal';
import type { Reto, RetoTarea } from './services/retos.service';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- READ-ONLY MODALS FOR HISTORY ---


// --- READ-ONLY MODALS FOR HISTORY ---

const HistoryTaskDetailModal = ({ isOpen, onClose, task }: { isOpen: boolean; onClose: () => void; task: RetoTarea | null }) => {
    if (!task) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.400" />
            <ModalContent borderRadius="24px" p={2} boxShadow="xl">
                <ModalHeader pb={0}>
                    <Text fontSize="lg" fontWeight="900" color="brand.secondary">{task.titulo}</Text>
                </ModalHeader>
                <ModalCloseButton borderRadius="full" m={2} />
                <ModalBody py={4}>
                    <VStack align="stretch" spacing={4}>
                        <Text color="gray.600" fontSize="sm">{task.descripcion}</Text>

                        <HStack spacing={2}>
                            <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>
                                +{task.recompensa_puntos} pts
                            </Badge>
                            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
                                {task.recompensa_kg_co2} kg CO₂
                            </Badge>
                        </HStack>

                        {task.completed ? (
                            <HStack bg="green.50" p={3} borderRadius="12px" justify="center">
                                <Icon as={FaCircleCheck} color="green.500" />
                                <Text fontWeight="700" color="green.600" fontSize="xs">COMPLETADA</Text>
                            </HStack>
                        ) : (
                            <HStack bg="gray.50" p={3} borderRadius="12px" justify="center">
                                <Icon as={FaClock} color="gray.400" />
                                <Text fontWeight="700" color="gray.500" fontSize="xs">NO COMPLETADA</Text>
                            </HStack>
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const HistoryTasksModal = ({ isOpen, onClose, reto, onTaskClick }: { isOpen: boolean; onClose: () => void; reto: Reto | null; onTaskClick: (task: RetoTarea) => void }) => {
    if (!reto) return null;

    const isCompleted = reto.status === 'completed';
    const earnedPoints = Math.round((reto.tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.recompensa_puntos || 0), 0)) + (isCompleted ? (reto.recompensa_puntos || 0) : 0));
    const earnedCo2 = Number((reto.tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.recompensa_kg_co2 || 0), 0) + (isCompleted ? (reto.recompensa_kg_co2 || 0) : 0)).toFixed(2));

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.500" />
            <ModalContent borderRadius="32px" overflow="hidden">
                <ModalHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.100" py={6}>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="md" fontWeight="800" color="brand.secondary">Resumen del Reto</Text>
                        <Text fontSize="xs" fontWeight="normal" color="gray.500">{reto.titulo}</Text>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton borderRadius="full" top="5" right="3" />
                <ModalBody p={0}>
                    {/* Results Section */}
                    <Box p={6} borderBottomWidth="1px" borderColor="gray.100" bg="white">
                        <VStack align="stretch" spacing={4}>
                            <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Resultado Final</Text>
                            <SimpleGrid columns={2} spacing={3}>
                                <Box p={4} bg="brand.bgCardLight" borderRadius="20px">
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xs" fontWeight="700" color="brand.primary">Puntos Ganados</Text>
                                        <Text fontSize="xl" fontWeight="900" color="brand.primary">+{earnedPoints}</Text>
                                    </VStack>
                                </Box>
                                <Box p={4} bg="blue.50" borderRadius="20px">
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xs" fontWeight="700" color="blue.500">CO₂ Ahorrado</Text>
                                        <Text fontSize="xl" fontWeight="900" color="blue.500">{earnedCo2}kg</Text>
                                    </VStack>
                                </Box>
                            </SimpleGrid>
                        </VStack>
                    </Box>

                    <Box py={2} bg="gray.50">
                        <Text px={6} py={2} fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Desglose de Tareas</Text>
                    </Box>

                    <VStack align="stretch" spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.50" />}>
                        {reto.tasks.map((task, index) => (
                            <HStack
                                key={task.id}
                                p={5}
                                _hover={{ bg: "gray.50" }}
                                cursor="pointer"
                                transition="all 0.2s"
                                onClick={() => onTaskClick(task)}
                                justify="space-between"
                            >
                                <HStack spacing={4}>
                                    <Circle size="36px" bg={task.completed ? "green.100" : "gray.100"} color={task.completed ? "green.500" : "gray.400"}>
                                        <Icon as={task.completed ? FaCircleCheck : FaClock} boxSize="16px" />
                                    </Circle>
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="700" color={task.completed ? "gray.700" : "gray.500"}>{task.titulo}</Text>
                                        <Text fontSize="xs" color="gray.400">Día {task.dia_orden} • {task.recompensa_puntos} pts</Text>
                                    </VStack>
                                </HStack>
                                <Icon as={FaChevronRight} color="gray.300" boxSize="12px" />
                            </HStack>
                        ))}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

// --- History Card Component ---
const HistoryCard = ({ reto, onViewTasks }: { reto: Reto; onViewTasks: (reto: Reto) => void }) => {
    const isCompleted = reto.status === 'completed';
    const statusColor = isCompleted ? "green" : "gray";
    const statusBg = isCompleted ? "green.50" : "gray.50";
    const statusIcon = isCompleted ? FaTrophy : FaClock;
    const statusText = isCompleted ? "Reto Completado" : "Reto Finalizado";

    // Reward Calculation
    const earnedPoints = Math.round((reto.tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.recompensa_puntos || 0), 0)) + (isCompleted ? (reto.recompensa_puntos || 0) : 0));
    const earnedCo2 = Math.round((reto.tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.recompensa_kg_co2 || 0), 0)) + (isCompleted ? (reto.recompensa_kg_co2 || 0) : 0));

    return (
        <Box
            p={6}
            borderRadius="32px"
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: "xl",
                borderColor: "brand.primaryAlpha.200"
            }}
            position="relative"
            overflow="hidden"
            cursor="pointer"
            onClick={() => onViewTasks(reto)}
        >
            {/* Background Accent */}
            <Box
                position="absolute"
                top="-20px"
                right="-20px"
                boxSize="100px"
                bg={isCompleted ? "green.50" : "gray.50"}
                borderRadius="full"
                opacity={0.5}
                zIndex={0}
            />

            <VStack align="stretch" spacing={5} position="relative" zIndex={1}>
                {/* Header */}
                <HStack justify="space-between">
                    <Badge
                        bg={statusBg}
                        color={`${statusColor}.600`}
                        borderRadius="full"
                        px={4}
                        py={1.5}
                        fontSize="10px"
                        fontWeight="800"
                        letterSpacing="0.05em"
                        textTransform="uppercase"
                    >
                        <HStack spacing={2}>
                            <Icon as={statusIcon} boxSize="12px" />
                            <Text>{statusText}</Text>
                        </HStack>
                    </Badge>
                    <Text fontSize="xs" fontWeight="700" color="gray.400" letterSpacing="tight">
                        {new Date(reto.fecha_fin).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </Text>
                </HStack>

                {/* Content */}
                <VStack align="start" spacing={2}>
                    <Text fontSize="xl" fontWeight="900" color="brand.secondary" lineHeight="1.2" letterSpacing="-0.5px">
                        {reto.titulo}
                    </Text>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="10px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">Total Ganado</Text>
                        <HStack spacing={2}>
                            <Badge bg="brand.bgCardLight" color="brand.primary" borderRadius="full" px={3} py={0.5} fontSize="11px" fontWeight="800">
                                +{earnedPoints} pts
                            </Badge>
                            <Badge bg="blue.50" color="blue.500" borderRadius="full" px={3} py={0.5} fontSize="11px" fontWeight="800">
                                {earnedCo2}kg CO₂
                            </Badge>
                        </HStack>
                    </VStack>
                </VStack>

                {/* Progress Visual */}
                <Box
                    bg="gray.50"
                    p={4}
                    borderRadius="20px"
                    role="group"
                    borderWidth="1px"
                    borderColor="transparent"
                    _hover={{ borderColor: "brand.primaryAlpha.300", bg: "white", boxShadow: "md" }}
                    transition="all 0.2s"
                >
                    <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                                    Resultado Final
                                </Text>
                                <Text fontSize="md" fontWeight="900" color={`${statusColor}.500`}>
                                    {reto.completed_tasks || 0} de {reto.total_tasks || 0} tareas
                                </Text>
                            </VStack>
                            <Circle size="32px" bg="white" color="gray.300" border="1px solid" borderColor="gray.100" _groupHover={{ color: "brand.primary", borderColor: "brand.primaryAlpha.200", transform: "scale(1.1)" }} transition="all 0.2s">
                                <Icon as={FaChevronRight} boxSize="12px" />
                            </Circle>
                        </HStack>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export const RetosPage = () => {
    const { challenges, isLoading, joinChallengeAsync, completeTaskAsync, isCompletingTask } = useRetos();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(0); // 0: Available, 1: Joined, 2: History

    const [selectedReto, setSelectedReto] = useState<Reto | null>(null);
    const [selectedTask, setSelectedTask] = useState<RetoTarea | null>(null);
    const [taskRetoId, setTaskRetoId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [justJoinedId, setJustJoinedId] = useState<string | null>(null);

    // Completion Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedRetoData, setCompletedRetoData] = useState<{ reto: Reto, isPerfect: boolean } | null>(null);

    const toast = useToast();

    const queryClient = useQueryClient();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(parseInt(tab));
        }
    }, [searchParams]);

    // FILTER LOGIC - UPDATED
    const availableChallenges = challenges.filter(r => !r.joined); // Available = Not joined yet
    const joinedChallenges = challenges.filter(r => r.joined && (r.status === 'joined' || r.status === undefined)); // Joined = Joined AND Active/Joined status
    const historyChallenges = challenges.filter(r => r.joined && (r.status === 'completed' || r.status === 'expired')); // History = Joined AND Finished

    const [historyReto, setHistoryReto] = useState<Reto | null>(null);
    const [historyRetoOpen, setHistoryRetoOpen] = useState(false);
    const [historyTask, setHistoryTask] = useState<RetoTarea | null>(null);
    const [historyTaskOpen, setHistoryTaskOpen] = useState(false);

    // Handlers for History
    const handleViewHistoryTasks = (reto: Reto) => {
        setHistoryReto(reto);
        setHistoryRetoOpen(true);
    };

    const handleViewHistoryTaskDetail = (task: RetoTarea) => {
        setHistoryTask(task);
        setHistoryTaskOpen(true);
    };

    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    const handleCompleteTask = async (retoId: string, taskId: string) => {
        // Find the task object to show in modal first
        const reto = challenges.find(r => r.id === retoId);
        const task = reto?.tasks.find(t => t.id === taskId);

        if (task) {
            setSelectedTask(task);
            setTaskRetoId(retoId);
            setIsTaskModalOpen(true);
        }
    };

    const handleConfirmTask = async (retoId: string, taskId: string) => {
        setCompletingTaskId(taskId);
        try {
            await completeTaskAsync({ retoId, taskId });

            // Refresh Global Stats & Racha
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
            queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            // Find current reto info to check for completion
            const reto = challenges.find(r => r.id === retoId);
            if (reto) {
                const totalTasks = reto.total_tasks || 0;
                const completedCount = (reto.completed_tasks || 0) + 1; // +1 because the current one is now done

                // Check if ALL tasks are done (Perfect Completion)
                const isPerfect = completedCount === totalTasks;

                // Check if it was one of the LAST day's tasks
                const maxDay = Math.max(...reto.tasks.map(t => t.dia_orden));
                const task = reto.tasks.find(t => t.id === taskId);
                const isLastDay = task?.dia_orden === maxDay;

                if (isLastDay || isPerfect) {
                    // Challenge Finished or Completed!
                    setCompletedRetoData({
                        reto: { ...reto, completed_tasks: completedCount }, // Optimistic update for modal
                        isPerfect: isPerfect
                    });
                    setShowCompletionModal(true);
                } else {
                    // Regular Task Completion Celebration
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#2E7D32', '#4CAF50', '#81C784', '#FFD700']
                    });

                    if (selectedTask) {
                        toast({
                            position: 'top',
                            render: ({ onClose }) => (
                                <Box color="white" p={4} bg="brand.secondary" borderRadius="16px" boxShadow="xl" position="relative" pr={8}>
                                    <CloseButton position="absolute" right="2" top="2" onClick={onClose} color="white" />
                                    <VStack align="start" spacing={1}>
                                        <HStack>
                                            <Icon as={FaTrophy} color="brand.primary" />
                                            <Text fontWeight="bold">¡Tarea completada!</Text>
                                        </HStack>
                                        <Text fontSize="sm">
                                            +{selectedTask.recompensa_puntos} pts | -{selectedTask.recompensa_kg_co2}kg CO₂
                                        </Text>
                                    </VStack>
                                </Box>
                            ),
                            duration: 3000,
                            isClosable: true,
                        });
                    }
                }
            }

            setIsTaskModalOpen(false);
            setSelectedTask(null);
            setTaskRetoId(null);
        } catch (error) {
            // Error is handled by toast in hook
        } finally {
            setCompletingTaskId(null);
        }
    };

    const handleViewDetails = (reto: Reto) => {
        setSelectedReto(reto);
        setIsDetailsOpen(true);
    };

    const handleJoinChallenge = async (id: string) => {
        setJoiningId(id);
        try {
            await joinChallengeAsync(id);

            // Refresh Global Stats & Racha
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
            queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            // Show success overlay
            setJustJoinedId(id);

            // Celebration!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4CAF50', '#81C784', '#FFFFFF']
            });

            // Wait 1.5s to show the "Joined" state before card removal
            await new Promise(resolve => setTimeout(resolve, 1500));

        } finally {
            setJoiningId(null);
            setJustJoinedId(null);
        }
    };

    // --- Dynamic Hero Header Component ---
    const HeroHeader = () => {
        const headers = [
            {
                badge: "Nuevas Aventuras",
                title: "Retos Disponibles",
                desc: "Explora desafíos diseñados para reducir tu huella y transformar tus hábitos positivamente.",
                color: "green"
            },
            {
                badge: "Misión Activa",
                title: "Mis Retos Actuales",
                desc: "Mantén la constancia y completa tus tareas diarias para ganar impacto y recompensas exclusivas.",
                color: "brand"
            },
            {
                badge: "Trayectoria Eco",
                title: "Historial de Retos",
                desc: "Cada desafío completado es un paso firme hacia un mundo más sostenible. Mira lo que has logrado.",
                color: "gray"
            }
        ];

        const { badge, title, desc, color } = headers[activeTab];

        return (
            <VStack mb={8} textAlign="center" spacing={2} pt={4} animation={`${fadeInUp} 0.5s ease-out`} key={activeTab}>
                <Badge colorScheme={color} variant="subtle" borderRadius="full" px={4} py={1} fontSize="10px" fontWeight="800" mb={1} textTransform="uppercase" letterSpacing="0.05em">
                    {badge}
                </Badge>
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" color="brand.secondary" letterSpacing="-1px">
                    {title}
                </Heading>
                <Text fontSize="md" color="gray.500" maxW="500px" fontWeight="500" px={4}>
                    {desc}
                </Text>
            </VStack>
        );
    };

    const EmptyState = ({ message, icon = FaFlag }: { message: string, icon?: any }) => (
        <Center flexDir="column" py={20} px={6} textAlign="center">
            <Box position="relative" mb={8}>
                <Circle size="100px" bg="brand.bgCardLight" opacity={0.5} />
                <Center position="absolute" top="0" left="0" right="0" bottom="0">
                    <Icon as={icon} boxSize={10} color="brand.primary" opacity={0.6} />
                </Center>
            </Box>
            <VStack spacing={2} maxW="400px">
                <Text fontSize="xl" fontWeight="800" color="brand.secondary" letterSpacing="-0.5px">
                    Nada por aquí todavía
                </Text>
                <Text color="gray.500" fontSize="md" fontWeight="500" lineHeight="1.5">
                    {message}
                </Text>
            </VStack>
        </Center>
    );

    return (
        <Box animation={`${fadeInUp} 0.5s ease-out`} pb={8} bg="brand.bgBody">
            {/* Header Hero Dynamic */}
            <HeroHeader />

            {/* Navigation Sections */}
            <HStack justify="center" spacing={3} mb={10} overflowX="auto" py={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {[
                    { label: "Disponibles", icon: FaFlag, count: availableChallenges.length, color: "brand" },
                    { label: "Mis Retos", icon: FaListCheck, count: joinedChallenges.length, color: "brand" },
                    { label: "Historial", icon: FaClock, count: historyChallenges.length, color: "gray" },
                ].map((tab, index) => {
                    const isActive = activeTab === index;
                    return (
                        <Button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            variant={isActive ? "solid" : "outline"}
                            colorScheme={isActive ? tab.color : "gray"}
                            bg={isActive ? (tab.color === 'brand' ? 'brand.primary' : `${tab.color}.500`) : "white"}
                            color={isActive ? "white" : "gray.500"}
                            borderColor={isActive ? "transparent" : "gray.200"}
                            _hover={{
                                bg: isActive ? (tab.color === 'brand' ? 'brand.primaryHover' : `${tab.color}.600`) : "gray.50",
                                transform: "translateY(-1px)"
                            }}
                            borderRadius="full"
                            px={6}
                            height="45px"
                            transition="all 0.2s"
                            leftIcon={<Icon as={tab.icon} />}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <Badge
                                    ml={2}
                                    bg={isActive ? "white" : "gray.100"}
                                    color={isActive ? (tab.color === 'brand' ? 'brand.primary' : `${tab.color}.500`) : "gray.600"}
                                    fontSize="xs"
                                    borderRadius="full"
                                    px={2}
                                >
                                    {tab.count}
                                </Badge>
                            )}
                        </Button>
                    );
                })}
            </HStack>

            {/* Content */}
            {isLoading ? (
                <Center py={20}>
                    <Spinner size="xl" color="brand.primary" />
                </Center>
            ) : (
                <Box>
                    {activeTab === 0 && (
                        <Box animation={`${fadeInUp} 0.5s ease-out`}>
                            {availableChallenges.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {availableChallenges.map(reto => (
                                        <RetoCard
                                            key={reto.id}
                                            reto={reto}
                                            onJoin={handleJoinChallenge}
                                            onViewDetails={() => handleViewDetails(reto)}
                                            onCompleteTask={handleCompleteTask}
                                            isJoining={joiningId === reto.id}
                                            completingTaskId={completingTaskId}
                                            isJoinedSuccess={justJoinedId === reto.id}
                                        />
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <EmptyState message="No hay nuevos retos disponibles por ahora." />
                            )}
                        </Box>
                    )}

                    {activeTab === 1 && (
                        <Box animation={`${fadeInUp} 0.5s ease-out`}>
                            {joinedChallenges.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {joinedChallenges.map(reto => (
                                        <RetoCard
                                            key={reto.id}
                                            reto={reto}
                                            onJoin={handleJoinChallenge}
                                            onViewDetails={() => handleViewDetails(reto)} // Should not be needed for joined, but harmless
                                            onCompleteTask={handleCompleteTask}
                                            isJoining={joiningId === reto.id}
                                            completingTaskId={completingTaskId}
                                            isJoinedSuccess={justJoinedId === reto.id}
                                        />
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <EmptyState message="No te has unido a ningún reto activo." />
                            )}
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <Box animation={`${fadeInUp} 0.5s ease-out`}>
                            {historyChallenges.length > 0 ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                                    {historyChallenges.map(reto => (
                                        <HistoryCard key={reto.id} reto={reto} onViewTasks={handleViewHistoryTasks} />
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <EmptyState
                                    message="Aún no tienes retos en tu historial. Completa cualquier reto activo para comenzar a construir tu legado."
                                    icon={FaClock}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            )}

            <RetoDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                reto={selectedReto}
                onJoin={handleJoinChallenge}
                isJoining={joiningId === (selectedReto?.id || '')}
            />

            <TaskConfirmationModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTask}
                retoId={taskRetoId}
                onConfirm={handleConfirmTask}
                isLoading={isCompletingTask}
            />

            <HistoryTasksModal
                isOpen={historyRetoOpen}
                onClose={() => setHistoryRetoOpen(false)}
                reto={historyReto}
                onTaskClick={handleViewHistoryTaskDetail}
            />

            <HistoryTaskDetailModal
                isOpen={historyTaskOpen}
                onClose={() => setHistoryTaskOpen(false)}
                task={historyTask}
            />

            <ChallengeCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                reto={completedRetoData?.reto || null}
                isPerfect={completedRetoData?.isPerfect || false}
            />
        </Box>
    );
};

export default RetosPage;
