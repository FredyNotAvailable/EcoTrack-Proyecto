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
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
// Remove unused import 'useState' if no longer used, or keep if needed for other things (it was added for details)
import { FaTrophy, FaLeaf, FaClock, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import type { Reto, RetoTarea } from '../services/retos.service';

interface RetoCardProps {
    reto: Reto;
    onJoin: (id: string) => void;
    onCompleteTask: (retoId: string, taskId: string) => void;
    onViewDetails: () => void; // New prop
    isJoining: boolean;
    isCompletingTask: boolean;
}

export const RetoCard = ({ reto, onJoin, onCompleteTask, onViewDetails, isJoining, isCompletingTask }: RetoCardProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    const isJoined = reto.joined;
    const isCompleted = reto.status === 'completed';

    const endDate = new Date(reto.fecha_fin).toLocaleDateString();

    return (
        <Box
            bg={bg}
            p={6}
            borderRadius="16px"
            boxShadow="0 4px 20px -2px rgba(0, 0, 0, 0.05)"
            border="1px solid"
            borderColor={isCompleted ? "green.200" : borderColor}
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)", boxShadow: "0 12px 30px -5px rgba(0, 0, 0, 0.1)" }}
        >
            {isCompleted && (
                <Box position="absolute" top={0} right={0} bg="green.100" color="green.700" px={4} py={1} borderBottomLeftRadius="16px" fontSize="xs" fontWeight="bold">
                    <Icon as={FaCheckCircle} mr={1} /> COMPLETADO
                </Box>
            )}

            <VStack align="stretch" spacing={4}>
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Badge colorScheme={isJoined ? "green" : "blue"} borderRadius="full" px={3} py={1}>
                            {isJoined ? (isCompleted ? "Completado" : "En Progreso") : "Disponible"}
                        </Badge>
                        <HStack fontSize="xs" color="gray.500">
                            <Icon as={FaClock} />
                            <Text>{endDate}</Text>
                        </HStack>
                    </HStack>

                    <Heading size="md" mb={2} color="brand.secondary">{reto.titulo}</Heading>
                    <Text color="gray.600" fontSize="sm" noOfLines={3}>
                        {reto.descripcion}
                    </Text>
                </Box>

                <HStack spacing={4} color="brand.primary">
                    <HStack>
                        <Icon as={FaTrophy} />
                        <Text fontSize="sm" fontWeight="bold">{reto.recompensa_puntos} pts</Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaLeaf} />
                        <Text fontSize="sm" fontWeight="bold">{reto.recompensa_kg_co2} kg CO₂</Text>
                    </HStack>
                </HStack>

                {!isJoined && !isCompleted && (
                    <VStack spacing={2}>
                        <Button
                            onClick={() => onJoin(reto.id)}
                            isLoading={isJoining}
                            loadingText="Uniéndome..."
                            colorScheme="green"
                            variant="solid"
                            bg="brand.primary"
                            _hover={{ bg: "brand.primaryHover" }}
                            width="full"
                            borderRadius="full"
                            boxShadow="md"
                        >
                            Unirse al Reto
                        </Button>
                        <Button
                            onClick={onViewDetails}
                            variant="ghost"
                            colorScheme="gray"
                            size="sm"
                            width="full"
                            borderRadius="full"
                            leftIcon={<Icon as={FaInfoCircle} />}
                        >
                            Ver Detalles
                        </Button>
                    </VStack>
                )}

                {/* Removed inline task list, now handled by modal. Joined view remains same. */}


                {isJoined && (
                    <VStack align="stretch" spacing={3} mt={2} bg="brand.bgCardLight" p={4} borderRadius="12px">
                        <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="bold" color="brand.secondary">Tu Progreso</Text>
                            <Text fontSize="sm" fontWeight="bold" color="brand.primary">{Math.round(reto.progress)}%</Text>
                        </HStack>
                        <Progress value={reto.progress} size="sm" colorScheme="green" borderRadius="full" />

                        <Accordion allowToggle mt={2}>
                            <AccordionItem border="none">
                                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                                    <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
                                        Ver Tareas ({reto.tasks.filter(t => t.completed).length}/{reto.tasks.length})
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={0} px={0}>
                                    <VStack align="stretch" spacing={2} mt={2}>
                                        {reto.tasks.map((task: RetoTarea) => (
                                            <Flex
                                                key={task.id}
                                                justify="space-between"
                                                align="center"
                                                p={3}
                                                bg="white"
                                                borderRadius="8px"
                                                border="1px solid"
                                                borderColor={task.completed ? "green.200" : "gray.100"}
                                                opacity={task.completed ? 0.8 : 1}
                                            >
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" fontWeight={task.completed ? "normal" : "medium"} textDecoration={task.completed ? "line-through" : "none"}>
                                                        {task.titulo}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">+ {task.recompensa_puntos} pts</Text>
                                                </VStack>

                                                {task.completed ? (
                                                    <Icon as={FaCheckCircle} color="green.500" />
                                                ) : (
                                                    <Button
                                                        size="xs"
                                                        colorScheme="green"
                                                        variant="outline"
                                                        onClick={() => onCompleteTask(reto.id, task.id)}
                                                        isLoading={isCompletingTask}
                                                    >
                                                        Completar
                                                    </Button>
                                                )}
                                            </Flex>
                                        ))}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};
