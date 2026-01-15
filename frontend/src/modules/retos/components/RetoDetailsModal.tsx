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
    SimpleGrid
} from "@chakra-ui/react";
import { FaTrophy, FaLeaf, FaClock, FaCircleCheck, FaCircleInfo } from "react-icons/fa6";
import type { Reto, RetoTarea } from "../services/retos.service";

interface RetoDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reto: Reto | null;
    onJoin: (id: string) => Promise<void>;
    isJoining: boolean;
}

export const RetoDetailsModal = ({ isOpen, onClose, reto, onJoin, isJoining }: RetoDetailsModalProps) => {
    if (!reto) return null;

    const endDate = new Date(reto.fecha_fin).toLocaleDateString();

    const handleJoin = async () => {
        if (reto) {
            await onJoin(reto.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="slideInBottom">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="24px" overflow="hidden">
                <ModalHeader bg="white" borderBottom="1px solid" borderColor="gray.50" py={5}>
                    <HStack justify="space-between" pr={10}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="0.8rem" fontWeight="800" color="brand.primary" textTransform="uppercase" letterSpacing="wider" mb={1}>Reto Semanal</Text>
                            <Text fontSize="1.3rem" fontWeight="800" color="brand.secondary" lineHeight="1.2">{reto.titulo}</Text>
                        </VStack>
                        <Badge variant="subtle" colorScheme="blue" borderRadius="full" px={3} py={1}>
                            Disponible
                        </Badge>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton mt={2} borderRadius="full" />

                <ModalBody py={6} px={8}>
                    <VStack align="stretch" spacing={7}>
                        {/* Description */}
                        <Box bg="gray.50" p={5} borderRadius="20px">
                            <Text color="gray.600" fontSize="1rem" lineHeight="1.7">
                                {reto.descripcion}
                            </Text>
                        </Box>

                        {/* Stats Row */}
                        <SimpleGrid columns={2} spacing={5}>
                            <Box bg="brand.bgCardLight" px={5} py={4} borderRadius="20px" border="1px solid" borderColor="green.50">
                                <HStack color="brand.primary" mb={2} spacing={2}>
                                    <Icon as={FaTrophy} boxSize={4} />
                                    <Text fontWeight="800" fontSize="xs" textTransform="uppercase">Puntos</Text>
                                </HStack>
                                <Text fontSize="2rem" fontWeight="800" color="brand.secondary">{reto.recompensa_puntos}</Text>
                                <Text fontSize="xs" color="gray.500" mt={-1}>puntos de experiencia</Text>
                            </Box>
                            <Box bg="blue.50" px={5} py={4} borderRadius="20px" border="1px solid" borderColor="blue.100">
                                <HStack color="blue.500" mb={2} spacing={2}>
                                    <Icon as={FaLeaf} boxSize={4} />
                                    <Text fontWeight="800" fontSize="xs" textTransform="uppercase">Ahorro CO₂</Text>
                                </HStack>
                                <Text fontSize="2rem" fontWeight="800" color="brand.secondary">{reto.recompensa_kg_co2} kg</Text>
                                <Text fontSize="xs" color="gray.500" mt={-1}>impacto ambiental</Text>
                            </Box>
                        </SimpleGrid>

                        {/* Tasks Preview */}
                        <Box>
                            <HStack mb={4}>
                                <Icon as={FaCircleInfo} color="brand.primary" />
                                <Text fontWeight="800" color="brand.secondary" fontSize="md">Tareas del Desafío</Text>
                            </HStack>
                            <VStack align="stretch" spacing={3} maxH="280px" overflowY="auto" pr={2} css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                                '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '4px' },
                            }}>
                                {reto.tasks.map((task: RetoTarea) => {
                                    const dayLabels: Record<number, string> = {
                                        1: "Lun", 2: "Mar", 3: "Mie", 4: "Jue", 5: "Vie", 6: "Sab", 7: "Dom"
                                    };
                                    const dayLabel = dayLabels[task.dia_orden] || "Día";

                                    return (
                                        <HStack key={task.id} p={4} bg="white" borderRadius="16px" border="1px solid" borderColor="gray.100" transition="background 0.2s" _hover={{ bg: "gray.50" }}>
                                            <Icon as={FaCircleCheck} color="gray.200" boxSize={5} />
                                            <VStack align="start" spacing={1} flex={1}>
                                                <HStack spacing={2}>
                                                    <Badge variant="subtle" colorScheme="gray" fontSize="9px" borderRadius="4px" px={1}>
                                                        {dayLabel}
                                                    </Badge>
                                                    <Text fontWeight="700" fontSize="sm" color="brand.secondary">{task.titulo}</Text>
                                                </HStack>
                                                <HStack spacing={2}>
                                                    <Badge variant="subtle" colorScheme="orange" fontSize="10px">+{task.recompensa_puntos} pts</Badge>
                                                    <Badge variant="subtle" colorScheme="green" fontSize="10px">{task.recompensa_kg_co2}kg CO₂</Badge>
                                                </HStack>
                                            </VStack>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </Box>

                        <HStack justify="center" pt={2} color="brand.textMuted" fontSize="xs" fontWeight="700" opacity={0.8}>
                            <Icon as={FaClock} />
                            <Text textTransform="uppercase" letterSpacing="widest">Válido hasta el {endDate}</Text>
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.50" py={6} px={8}>
                    <Button variant="ghost" mr={4} onClick={onClose} borderRadius="full" px={6} fontSize="sm">
                        Cerrar
                    </Button>
                    <Button
                        colorScheme="brand"
                        onClick={handleJoin}
                        isLoading={isJoining}
                        loadingText="Uniéndome..."
                        borderRadius="full"
                        px={10}
                        height="45px"
                        fontSize="sm"
                        fontWeight="800"
                        boxShadow="0 4px 15px -5px var(--chakra-colors-brand-primary)"
                    >
                        Unirse al Reto
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
