import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    HStack,
    Icon,
    Badge,
    Box,
    useDisclosure
} from "@chakra-ui/react";
import { FaTrophy, FaLeaf, FaCircleCheck, FaCircleInfo } from "react-icons/fa6";
import type { Reto, RetoTarea } from "../services/retos.service";
import { useState } from "react";

interface RetoDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reto: Reto | null;
    onJoin: (id: string) => Promise<void>;
    isJoining: boolean;
}

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: RetoTarea | null;
    getDayName: (day: number) => string;
}

const TaskDetailModal = ({ isOpen, onClose, task, getDayName }: TaskDetailModalProps) => {
    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="32px" p={4} boxShadow="2xl">
                <ModalHeader pb={0}>
                    <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="900" color="brand.secondary" lineHeight="1.2">{task.titulo}</Text>
                            <Badge bg="gray.100" color="gray.500" borderRadius="full" px={2} fontSize="9px" mt={1}>
                                {getDayName(task.dia_orden).toUpperCase()}
                            </Badge>
                        </VStack>
                        <ModalCloseButton position="relative" top="-4px" right="-4px" borderRadius="full" />
                    </HStack>
                </ModalHeader>
                <ModalBody py={6}>
                    <VStack align="stretch" spacing={6}>
                        <Text color="gray.500" fontSize="sm" lineHeight="1.6">
                            {task.descripcion}
                        </Text>

                        <HStack spacing={3}>
                            <Badge bg="green.50" color="green.600" borderRadius="12px" px={3} py={1.5} textTransform="none">
                                <HStack spacing={1}><Icon as={FaTrophy} /><Text fontWeight="800">+{Math.round(task.recompensa_puntos)} pts</Text></HStack>
                            </Badge>
                            <Badge bg="blue.50" color="blue.600" borderRadius="12px" px={3} py={1.5} textTransform="none">
                                <HStack spacing={1}><Icon as={FaCircleCheck} /><Text fontWeight="800">{Math.round(task.recompensa_kg_co2)} kg CO₂</Text></HStack>
                            </Badge>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export const RetoDetailsModal = ({ isOpen, onClose, reto, onJoin, isJoining }: RetoDetailsModalProps) => {
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
    const [selectedTask, setSelectedTask] = useState<RetoTarea | null>(null);


    if (!reto) return null;


    const handleJoin = async () => {
        if (reto) {
            await onJoin(reto.id);
            onClose();
        }
    };

    const getDayName = (day: number) => {
        const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        return days[day - 1] || "Día";
    };

    const handleTaskClick = (task: RetoTarea) => {
        setSelectedTask(task);
        onDetailOpen();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.500" />
                <ModalContent borderRadius="32px" overflow="hidden" boxShadow="2xl" bg="white">
                    {/* Header Minimalista */}
                    <ModalHeader pt={8} px={8} pb={2}>
                        <VStack align="start" spacing={2}>
                            <Badge bg="brand.primary" color="white" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="800" letterSpacing="0.5px">
                                NUEVO DESAFÍO
                            </Badge>
                            <Text fontSize="2xl" fontWeight="900" color="brand.secondary" lineHeight="1.1">
                                {reto.titulo}
                            </Text>
                        </VStack>
                        <ModalCloseButton top="24px" right="24px" borderRadius="full" bg="gray.50" _hover={{ bg: "gray.100" }} />
                    </ModalHeader>

                    <ModalBody px={8} py={4}>
                        <VStack align="stretch" spacing={6}>
                            <Text color="gray.500" fontSize="sm" lineHeight="1.6" fontWeight="500">
                                {reto.descripcion}
                            </Text>

                            {/* Stats Cards - Clean */}
                            <HStack spacing={4} align="stretch">
                                <VStack flex={1} bg="gray.50" p={4} borderRadius="24px" align="start" spacing={1}>
                                    <HStack color="brand.primary" spacing={2}>
                                        <Icon as={FaTrophy} />
                                        <Text fontSize="xs" fontWeight="800" textTransform="uppercase">Recompensa</Text>
                                    </HStack>
                                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{Math.round(reto.recompensa_puntos)}</Text>
                                    <Text fontSize="xs" color="gray.400" fontWeight="600">puntos XP</Text>
                                </VStack>
                                <VStack flex={1} bg="gray.50" p={4} borderRadius="24px" align="start" spacing={1}>
                                    <HStack color="blue.400" spacing={2}>
                                        <Icon as={FaLeaf} />
                                        <Text fontSize="xs" fontWeight="800" textTransform="uppercase">Impacto</Text>
                                    </HStack>
                                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{Math.round(reto.recompensa_kg_co2)}kg</Text>
                                    <Text fontSize="xs" color="gray.400" fontWeight="600">CO₂ ahorrado</Text>
                                </VStack>
                            </HStack>

                            {/* Task List Preview */}
                            <VStack align="stretch" spacing={3}>
                                <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                    Tu Ruta de Impacto
                                </Text>
                                <VStack align="stretch" spacing={2}>
                                    {reto.tasks.map((task, index) => (
                                        <HStack
                                            key={task.id}
                                            p={3}
                                            borderRadius="16px"
                                            bg="white"
                                            border="1px solid"
                                            borderColor="gray.100"
                                            _hover={{ borderColor: "brand.primary", bg: "brand.bgCardLight" }}
                                            cursor="pointer"
                                            onClick={() => handleTaskClick(task)}
                                            transition="all 0.2s"
                                        >
                                            <Box bg="gray.100" borderRadius="10px" w="32px" h="32px" display="flex" alignItems="center" justifyContent="center">
                                                <Text fontSize="xs" fontWeight="800" color="gray.500">{index + 1}</Text>
                                            </Box>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" flex={1} noOfLines={1}>{task.titulo}</Text>
                                            <Icon as={FaCircleInfo} color="gray.300" boxSize={3} />
                                        </HStack>
                                    ))}
                                </VStack>
                            </VStack>
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={8} pb={8} pt={2}>
                        <Button
                            w="full"
                            size="lg"
                            bg="brand.secondary"
                            color="white"
                            borderRadius="24px"
                            fontWeight="800"
                            fontSize="md"
                            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                            onClick={handleJoin}
                            isLoading={isJoining}
                            loadingText="Iniciando..."
                            height="56px"
                        >
                            ¡Me apunto!
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <TaskDetailModal
                isOpen={isDetailOpen}
                onClose={onDetailClose}
                task={selectedTask}
                getDayName={getDayName}
            />
        </>
    );
};
