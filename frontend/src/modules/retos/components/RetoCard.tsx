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
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    SimpleGrid,
} from '@chakra-ui/react';
import { FaTrophy, FaLeaf, FaClock, FaCircleCheck, FaCircleInfo, FaBolt, FaDroplet, FaTruck, FaTrash, FaListCheck } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reto, RetoTarea } from '../services/retos.service';
import { useState } from 'react';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: RetoTarea | null;
    getDayName: (day: number) => string;
    currentDayOrden: number;
    onComplete?: () => void;
    isCompleting?: boolean;
    isJoined?: boolean;
}

const TaskDetailModal = ({ isOpen, onClose, task, getDayName, currentDayOrden, onComplete, isCompleting, isJoined }: TaskDetailModalProps) => {
    if (!task) return null;

    const isPast = task.dia_orden < currentDayOrden;
    const isToday = task.dia_orden === currentDayOrden;
    const isFuture = task.dia_orden > currentDayOrden;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
            <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
            <ModalContent borderRadius="32px" p={4} boxShadow="2xl">
                <ModalHeader pb={0}>
                    <VStack align="start" spacing={1}>
                        <Badge bg={isToday ? "brand.primary" : "gray.900"} color="white" borderRadius="full" px={2} fontSize="10px">
                            {getDayName(task.dia_orden).toUpperCase()} {isToday && "• HOY"}
                        </Badge>
                        <Text fontSize="xl" fontWeight="900" color="brand.secondary">{task.titulo}</Text>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton borderRadius="full" m={2} />
                <ModalBody py={6}>
                    <VStack align="stretch" spacing={6}>
                        <Text color="gray.600" fontSize="md" lineHeight="1.6">
                            {task.descripcion}
                        </Text>

                        <SimpleGrid columns={2} spacing={4}>
                            <HStack bg="brand.bgCardLight" p={3} borderRadius="16px" justify="center">
                                <Icon as={FaTrophy} color="brand.primary" />
                                <Text fontWeight="800" fontSize="sm">+{Math.round(task.recompensa_puntos)} pts</Text>
                            </HStack>
                            <HStack bg="blue.50" p={3} borderRadius="16px" justify="center">
                                <Icon as={FaLeaf} color="blue.500" />
                                <Text fontWeight="800" fontSize="sm">{Math.round(task.recompensa_kg_co2)}kg CO₂</Text>
                            </HStack>
                        </SimpleGrid>

                        {task.completed ? (
                            <HStack bg="green.50" p={4} borderRadius="20px" justify="center" border="1px solid" borderColor="green.100">
                                <Icon as={FaCircleCheck} color="green.500" />
                                <Text fontWeight="900" color="green.600" fontSize="sm">TAREA COMPLETADA</Text>
                            </HStack>
                        ) : isPast ? (
                            <HStack bg="red.50" p={4} borderRadius="20px" justify="center" border="1px solid" borderColor="red.100">
                                <Icon as={FaClock} color="red.400" />
                                <Text fontWeight="900" color="red.500" fontSize="sm">TAREA VENCIDA</Text>
                            </HStack>
                        ) : isToday && isJoined ? (
                            <Button
                                size="lg"
                                bg="brand.secondary"
                                color="white"
                                _hover={{ bg: "brand.secondary", transform: "scale(1.02)" }}
                                borderRadius="20px"
                                fontWeight="900"
                                fontSize="md"
                                onClick={onComplete}
                                isLoading={isCompleting}
                                leftIcon={<Icon as={FaBolt} />}
                                boxShadow="0 10px 20px -5px rgba(0,0,0,0.2)"
                            >
                                Completar Tarea
                            </Button>
                        ) : isFuture ? (
                            <HStack bg="gray.50" p={4} borderRadius="20px" justify="center" border="1px dashed" borderColor="gray.200">
                                <Icon as={FaClock} color="gray.400" />
                                <Text fontWeight="800" color="gray.500" fontSize="sm">PRÓXIMAMENTE</Text>
                            </HStack>
                        ) : (
                            <HStack bg="gray.50" p={4} borderRadius="20px" justify="center" border="1px dashed" borderColor="gray.200">
                                <Icon as={FaClock} color="gray.400" />
                                <Text fontWeight="800" color="gray.500" fontSize="sm">PENDIENTE</Text>
                            </HStack>
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

interface WeeklyTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    reto: Reto;
    currentDayOrden: number;
    getDayName: (day: number) => string;
    onTaskClick: (task: RetoTarea) => void;
}

const WeeklyTasksModal = ({ isOpen, onClose, reto, currentDayOrden, getDayName, onTaskClick }: WeeklyTasksModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="30px" p={2} boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)">
                <ModalHeader>
                    <VStack align="start" spacing={1}>
                        <Text fontSize="2xl" fontWeight="900" color="brand.secondary">Plan Semanal</Text>
                        <Text fontSize="sm" color="gray.500" fontWeight="500">{reto.titulo}</Text>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton borderRadius="full" m={2} />
                <ModalBody pb={6}>
                    <VStack align="stretch" spacing={3}>
                        {reto.tasks.map((task: RetoTarea) => {
                            const isToday = task.dia_orden === currentDayOrden;
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
                                    p={4}
                                    bg={isToday ? "brand.bgCardLight" : "gray.50"}
                                    borderRadius="20px"
                                    border="1px solid"
                                    borderColor={task.completed ? "green.50" : (isToday ? "brand.primary" : "transparent")}
                                    opacity={task.completed ? 0.6 : (isPastTask ? 0.8 : 1)}
                                    transition="all 0.2s"
                                    cursor="pointer"
                                    _hover={{ transform: "scale(1.02)", bg: isToday ? "brand.bgCardLight" : "white", boxShadow: "md" }}
                                    onClick={() => onTaskClick(task)}
                                >
                                    <HStack spacing={4}>
                                        <Box
                                            w="40px"
                                            h="40px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize="xs"
                                            fontWeight="900"
                                            color={isToday && !task.completed ? "white" : (task.completed ? "green.500" : (isPastTask ? "red.400" : "gray.400"))}
                                            bg={isToday && !task.completed ? "brand.primary" : (task.completed ? "green.50" : (isPastTask ? "red.50" : "white"))}
                                            borderRadius="12px"
                                            boxShadow={isToday && !task.completed ? "0 4px 10px rgba(0,0,0,0.1)" : "none"}
                                        >
                                            <Text>{dayLabel}</Text>
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" fontWeight="800" color={task.completed ? "gray.400" : (isPastTask ? "gray.500" : "brand.secondary")} textDecoration={task.completed ? "line-through" : "none"}>
                                                {task.titulo}
                                            </Text>
                                            <Text fontSize="xs" color="gray.400" fontWeight="600">+{task.recompensa_puntos} XP • {getDayName(task.dia_orden)}</Text>
                                        </VStack>
                                    </HStack>
                                    {task.completed ? (
                                        <Icon as={FaCircleCheck} color="green.500" boxSize={5} />
                                    ) : (
                                        isToday ? (
                                            <Badge bg="gray.900" color="white" borderRadius="full" px={2}>HOY</Badge>
                                        ) : isPastTask ? (
                                            <Badge bg="red.50" color="red.500" border="1px solid" borderColor="red.100" borderRadius="full" px={2} fontSize="9px">VENCIDA</Badge>
                                        ) : (
                                            <Icon as={FaClock} color="gray.200" boxSize={4} />
                                        )
                                    )}
                                </Flex>
                            );
                        })}
                    </VStack>
                    <Text fontSize="xs" textAlign="center" color="gray.400" mt={4} fontWeight="600">Haz clic en una tarea para ver detalles</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

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
    const { isOpen: isTasksOpen, onOpen: onTasksOpen, onClose: onTasksClose } = useDisclosure();
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
    const [selectedTask, setSelectedTask] = useState<RetoTarea | null>(null);

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "";
        // Use UTC to avoid timezone shift (e.g., Jan 12 UTC becoming Jan 11 in local time)
        return new Date(dateStr).toLocaleDateString(undefined, { timeZone: 'UTC' });
    };

    const startDate = formatDisplayDate(reto.fecha_inicio);
    const endDate = formatDisplayDate(reto.fecha_fin);

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

    const handleTaskClick = (task: RetoTarea) => {
        setSelectedTask(task);
        onDetailOpen();
    };

    const handleCompleteFromModal = async () => {
        if (selectedTask) {
            await onCompleteTask(reto.id, selectedTask.id);
            onDetailClose();
        }
    };

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
                        {!isJoined && (
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
                        )}
                    </Flex>

                    <Text color="gray.500" fontSize="sm" noOfLines={2} lineHeight="1.6">
                        {reto.descripcion}
                    </Text>
                </Box>



                <VStack spacing={3} align="stretch" pt={2}>
                    <HStack spacing={3} color="brand.primary">
                        <HStack bg="brand.bgCardLight" px={3} py={1.5} borderRadius="10px" flex={1} justify="center">
                            <Icon as={FaTrophy} />
                            <Text fontSize="sm" fontWeight="800">{Math.round(reto.recompensa_puntos)} pts</Text>
                        </HStack>
                        <HStack bg="blue.50" color="blue.500" px={3} py={1.5} borderRadius="10px" flex={1} justify="center">
                            <Icon as={FaLeaf} />
                            <Text fontSize="sm" fontWeight="800">{Math.round(reto.recompensa_kg_co2)} kg</Text>
                        </HStack>
                    </HStack>

                    {!isJoined && !isCompleted && (
                        <Button
                            onClick={() => onJoin(reto.id)}
                            isLoading={isJoining}
                            loadingText="Uniéndome..."
                            bg="brand.secondary"
                            color="white"
                            _hover={{ bg: "brand.secondary", transform: "translateY(-2px)", boxShadow: "xl" }}
                            width="full"
                            height="50px"
                            borderRadius="full"
                            fontSize="md"
                            fontWeight="900"
                        >
                            Aceptar el Reto
                        </Button>
                    )}
                </VStack>

                {isJoined && (
                    <VStack align="stretch" spacing={5} mt={2}>
                        {/* Progress Section */}
                        <VStack align="stretch" spacing={2.5}>
                            <HStack justify="space-between">
                                <Text fontSize="xs" fontWeight="900" color="brand.secondary" textTransform="uppercase" letterSpacing="widest">Tu Progreso Semanal</Text>
                                <Text fontSize="sm" fontWeight="900" color="brand.primary">{Math.round(reto.progress)}%</Text>
                            </HStack>
                            <Progress value={reto.progress} h="10px" colorScheme="green" borderRadius="full" bg="gray.100" />
                        </VStack>

                        {/* TODAY'S ACTION SECTION - PROMINENT */}
                        {!isCompleted && (
                            <Box
                                p={4}
                                borderRadius="20px"
                                bg={(() => {
                                    const todayTask = reto.tasks.find(t => t.dia_orden === currentDayOrden);
                                    return todayTask?.completed ? "green.50" : "brand.bgCardLight";
                                })()}
                                border="1px solid"
                                borderColor={(() => {
                                    const todayTask = reto.tasks.find(t => t.dia_orden === currentDayOrden);
                                    return todayTask?.completed ? "green.100" : "brand.primary";
                                })()}
                                position="relative"
                                overflow="hidden"
                            >
                                {(() => {
                                    const todayTask = reto.tasks.find(t => t.dia_orden === currentDayOrden);
                                    if (!todayTask) return <Text fontSize="sm" color="gray.500" textAlign="center">No hay acción para hoy.</Text>;

                                    return (
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Badge bg="gray.900" color="white" borderRadius="full" px={2} fontSize="9px">HOY • {getDayName(currentDayOrden).toUpperCase()}</Badge>
                                                {todayTask.completed && <Icon as={FaCircleCheck} color="green.500" />}
                                            </HStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="800" color="brand.secondary" fontSize="sm">{todayTask.titulo}</Text>
                                                <Text fontSize="xs" color="gray.500" noOfLines={2}>{todayTask.descripcion}</Text>
                                            </VStack>

                                            {!todayTask.completed ? (
                                                <Button
                                                    size="md"
                                                    bg="brand.secondary"
                                                    color="white"
                                                    _hover={{ bg: "brand.secondary", transform: "scale(1.02)" }}
                                                    borderRadius="14px"
                                                    fontWeight="800"
                                                    fontSize="sm"
                                                    onClick={() => onCompleteTask(reto.id, todayTask.id)}
                                                    isLoading={completingTaskId === todayTask.id}
                                                    leftIcon={<Icon as={FaBolt} />}
                                                >
                                                    ¡Hecho por hoy!
                                                </Button>
                                            ) : (
                                                <HStack justify="center" p={2} bg="whiteAlpha.600" borderRadius="12px">
                                                    <Icon as={FaCircleCheck} color="green.500" />
                                                    <Text fontWeight="800" fontSize="xs" color="green.600">¡Reto de hoy cumplido!</Text>
                                                </HStack>
                                            )}
                                        </VStack>
                                    );
                                })()}
                            </Box>
                        )}

                        {/* Button for full week - Refined to not look like accordion */}
                        <Box pt={1}>
                            <Button
                                onClick={onTasksOpen}
                                width="full"
                                height="42px"
                                bg="gray.50"
                                color="brand.secondary"
                                variant="outline"
                                borderColor="gray.100"
                                borderStyle="dashed"
                                borderWidth="2px"
                                _hover={{ bg: "brand.bgCardLight", borderColor: "brand.primary", transform: "translateY(-1px)" }}
                                borderRadius="16px"
                                leftIcon={<Icon as={FaListCheck} boxSize={3.5} />}
                            >
                                <HStack spacing={2} justify="center" w="full">
                                    <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wider">
                                        Ver mi plan semanal
                                    </Text>
                                    <Badge bg="brand.primary" color="white" borderRadius="full" px={1.5} fontSize="10px">
                                        {reto.tasks.filter(t => t.completed).length}/{reto.tasks.length}
                                    </Badge>
                                </HStack>
                            </Button>
                        </Box>

                        <WeeklyTasksModal
                            isOpen={isTasksOpen}
                            onClose={onTasksClose}
                            reto={reto}
                            currentDayOrden={currentDayOrden}
                            getDayName={getDayName}
                            onTaskClick={handleTaskClick}
                        />

                        <TaskDetailModal
                            isOpen={isDetailOpen}
                            onClose={onDetailClose}
                            task={selectedTask}
                            getDayName={getDayName}
                            currentDayOrden={currentDayOrden}
                            onComplete={handleCompleteFromModal}
                            isCompleting={selectedTask ? completingTaskId === selectedTask.id : false}
                            isJoined={isJoined}
                        />
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};
