import {
    Box,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Progress,
    Icon,
    Flex,
    useColorModeValue,
    Tooltip,
    Spinner,
    IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaTrophy, FaLeaf, FaClock, FaCircleCheck, FaCircleInfo, FaBolt, FaDroplet, FaTruck, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reto, RetoTarea } from '../services/retos.service';

interface RetoCardProps {
    reto: Reto;
    onJoin: (id: string) => void;
    onCompleteTask: (retoId: string, taskId: string) => void;
    onViewDetails: () => void;
    isJoining: boolean;
    completingTaskId: string | null;
    isJoinedSuccess?: boolean;
}

export const RetoCard = ({
    reto,
    onJoin,
    onCompleteTask,
    onViewDetails,
    isJoining,
    completingTaskId,
    isJoinedSuccess = false
}: RetoCardProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const isJoined = reto.joined;
    const isCompleted = reto.status === 'completed';

    const startDate = new Date(reto.fecha_inicio).toLocaleDateString();
    const endDate = new Date(reto.fecha_fin).toLocaleDateString();

    const today = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const currentDayOrden = today === 0 ? 7 : today; // Map Sun to 7

    const getDayName = (day: number) => {
        const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        return days[day - 1] || "Día";
    };

    const getCategoryConfig = (categoria: string) => {
        switch (categoria) {
            case 'energia': return { icon: FaBolt, color: "orange", label: "Energía" };
            case 'agua': return { icon: FaDroplet, color: "blue", label: "Agua" };
            case 'transporte': return { icon: FaTruck, color: "purple", label: "Transporte" };
            case 'residuos': return { icon: FaTrash, color: "green", label: "Residuos" };
            default: return { icon: FaLeaf, color: "brand", label: "Eco" };
        }
    };

    const catConfig = getCategoryConfig(reto.categoria);
    const [showTasks, setShowTasks] = useState(false);

    return (
        <Box
            bg={bg}
            p={6}
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            border="1px solid rgba(0, 0, 0, 0.05)"
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)", boxShadow: "0 20px 40px -15px rgba(31, 64, 55, 0.2)" }}
            display="flex"
            flexDirection="column"
            opacity={isJoined && !isCompleted ? 0.95 : 1}
        >
            <AnimatePresence>
                {isJoinedSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            borderRadius: '16px',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <VStack spacing={3}>
                                <Icon as={FaCircleCheck} boxSize={14} color="brand.primary" />
                                <Text fontSize="xl" fontWeight="800" color="brand.secondary">¡Te has unido!</Text>
                                <Text fontSize="sm" color="gray.500">Iniciando tu desafío...</Text>
                            </VStack>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isCompleted && (
                <Box position="absolute" top={0} right={0} bg="green.50" color="green.600" px={4} py={1} borderBottomLeftRadius="16px" fontSize="xs" fontWeight="bold">
                    <HStack spacing={1}>
                        <Icon as={FaCircleCheck} />
                        <Text>COMPLETADO</Text>
                    </HStack>
                </Box>
            )}

            <VStack align="stretch" spacing={5}>
                <Box>
                    <HStack justify="space-between" mb={3}>
                        <HStack spacing={2}>
                            <Badge
                                variant="outline"
                                colorScheme={catConfig.color}
                                borderRadius="full"
                                px={3}
                                py={0.5}
                                fontSize="10px"
                                display="flex"
                                alignItems="center"
                            >
                                <Icon as={catConfig.icon} mr={1} boxSize={2.5} />
                                {catConfig.label}
                            </Badge>
                        </HStack>
                        <HStack fontSize="xs" color="brand.textMuted" bg="gray.50" px={2} py={1} borderRadius="full">
                            <Icon as={FaClock} />
                            <Text fontWeight="600">{isJoined ? `Fin: ${endDate}` : `Desde: ${startDate}`}</Text>
                        </HStack>
                    </HStack>

                    <Flex justify="space-between" align="start" mb={2}>
                        <Heading size="md" color="brand.secondary" lineHeight="1.3" flex={1} pr={2}>{reto.titulo}</Heading>
                        <Tooltip label="Ver detalles del reto" hasArrow>
                            <IconButton
                                aria-label="Ver detalles"
                                icon={<FaCircleInfo />}
                                size="sm"
                                variant="ghost"
                                color="gray.400"
                                _hover={{ color: "brand.primary", bg: "brand.bgCardLight" }}
                                onClick={onViewDetails}
                                borderRadius="full"
                            />
                        </Tooltip>
                    </Flex>

                    <Text color="gray.500" fontSize="sm" noOfLines={2} lineHeight="1.6">
                        {reto.descripcion}
                    </Text>
                </Box>



                <VStack spacing={3} align="stretch" pt={2}>
                    <HStack spacing={3} color="brand.primary">
                        <HStack bg="brand.bgCardLight" px={3} py={1.5} borderRadius="10px" flex={1} justify="center">
                            <Icon as={FaTrophy} />
                            <Text fontSize="sm" fontWeight="800">{reto.recompensa_puntos} pts</Text>
                        </HStack>
                        <HStack bg="blue.50" color="blue.500" px={3} py={1.5} borderRadius="10px" flex={1} justify="center">
                            <Icon as={FaLeaf} />
                            <Text fontSize="sm" fontWeight="800">{reto.recompensa_kg_co2} kg</Text>
                        </HStack>
                    </HStack>

                    {!isJoined && !isCompleted && (
                        <Button
                            onClick={() => onJoin(reto.id)}
                            isLoading={isJoining}
                            loadingText="Uniéndome..."
                            colorScheme="brand"
                            width="full"
                            height="45px"
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="800"
                            boxShadow="0 4px 15px -5px var(--chakra-colors-brand-primary)"
                        >
                            Unirse al Reto
                        </Button>
                    )}
                </VStack>

                {isJoined && (
                    <VStack align="stretch" spacing={4} mt={1} bg="gray.50" p={4} borderRadius="16px" border="1px solid" borderColor="gray.100">
                        <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                                <Text fontSize="xs" fontWeight="800" color="brand.secondary" textTransform="uppercase" letterSpacing="wider">Tu Progreso</Text>
                                <Text fontSize="sm" fontWeight="800" color="brand.primary">{Math.round(reto.progress)}%</Text>
                            </HStack>
                            <Progress value={reto.progress} h="8px" colorScheme="green" borderRadius="full" bg="white" />
                        </VStack>

                        <Box>
                            <Button
                                onClick={() => setShowTasks(!showTasks)}
                                variant="ghost"
                                width="full"
                                justifyContent="space-between"
                                px={0}
                                py={2}
                                _hover={{ bg: 'transparent' }}
                                rightIcon={<Icon as={showTasks ? FaChevronUp : FaChevronDown} />}
                            >
                                <HStack spacing={2}>
                                    <Icon as={FaLeaf} boxSize={3} color="brand.primary" />
                                    <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                        TAREAS ({reto.tasks.filter(t => t.completed).length}/{reto.tasks.length})
                                    </Text>
                                </HStack>
                            </Button>

                            {showTasks && (
                                <Box pt={2} animation="fade-in 0.2s">
                                    <VStack align="stretch" spacing={2.5}>
                                        {reto.tasks.map((task: RetoTarea) => {
                                            const isAvailableToday = task.dia_orden === currentDayOrden;
                                            const isPastTask = task.dia_orden < currentDayOrden;
                                            const dayLabels: Record<number, string> = {
                                                1: "Lun", 2: "Mar", 3: "Mie", 4: "Jue", 5: "Vie", 6: "Sab", 7: "Dom"
                                            };
                                            const dayLabel = dayLabels[task.dia_orden] || "Día";

                                            return (
                                                <Flex
                                                    key={task.id}
                                                    justify="space-between"
                                                    align="center"
                                                    p={3}
                                                    bg="white"
                                                    borderRadius="12px"
                                                    border="1px solid"
                                                    borderColor={task.completed ? "green.100" : (isAvailableToday ? "brand.primary" : "gray.100")}
                                                    opacity={task.completed ? 0.7 : 1}
                                                    transition="all 0.2s"
                                                >
                                                    <VStack align="start" spacing={0} flex={1}>
                                                        <HStack spacing={2}>
                                                            <Badge
                                                                variant="subtle"
                                                                colorScheme={task.completed ? "green" : (isAvailableToday ? "brand" : isPastTask ? "red" : "gray")}
                                                                fontSize="9px"
                                                                borderRadius="4px"
                                                                px={1}
                                                            >
                                                                {dayLabel}
                                                            </Badge>
                                                            <Text
                                                                fontSize="xs"
                                                                fontWeight="600"
                                                                textDecoration={task.completed ? "line-through" : "none"}
                                                                color={task.completed ? "gray.400" : "brand.secondary"}
                                                                noOfLines={1}
                                                            >
                                                                {task.titulo}
                                                            </Text>
                                                        </HStack>
                                                        <Text fontSize="10px" color="gray.400" mt={0.5}>+ {task.recompensa_puntos} pts</Text>
                                                    </VStack>

                                                    {task.completed ? (
                                                        <Icon as={FaCircleCheck} color="green.400" boxSize={4} />
                                                    ) : completingTaskId === task.id ? (
                                                        <Spinner size="xs" color="brand.primary" />
                                                    ) : (
                                                        <Tooltip label={isAvailableToday ? "Haz clic para completar" : isPastTask ? "Esta tarea ya expiró" : `Estará disponible el ${getDayName(task.dia_orden)}`} hasArrow>
                                                            <Box>
                                                                <Button
                                                                    size="xs"
                                                                    fontSize="10px"
                                                                    colorScheme={isAvailableToday ? "brand" : "gray"}
                                                                    variant={isAvailableToday ? "solid" : "ghost"}
                                                                    onClick={() => isAvailableToday && onCompleteTask(reto.id, task.id)}
                                                                    isDisabled={!isAvailableToday}
                                                                    borderRadius="full"
                                                                    px={3}
                                                                >
                                                                    {isAvailableToday ? "Completar" : isPastTask ? "Expiró" : "Pronto"}
                                                                </Button>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </Flex>
                                            );
                                        })}
                                    </VStack>
                                </Box>
                            )}
                        </Box>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};
