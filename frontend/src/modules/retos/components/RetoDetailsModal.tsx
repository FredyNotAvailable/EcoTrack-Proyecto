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
import { FaTrophy, FaLeaf, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
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
                <ModalHeader bg="gray.50" borderBottom="1px solid" borderColor="gray.100" py={4}>
                    <HStack justify="space-between" pr={8}>
                        <Text fontSize="xl" fontWeight="bold" color="brand.secondary">{reto.titulo}</Text>
                        <Badge colorScheme="blue" borderRadius="full" px={3}>
                            Disponible
                        </Badge>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton mt={1} />

                <ModalBody py={6} px={6}>
                    <VStack align="stretch" spacing={6}>
                        {/* Description */}
                        <Text color="gray.600" fontSize="md">
                            {reto.descripcion}
                        </Text>

                        {/* Stats Row */}
                        <SimpleGrid columns={2} spacing={4}>
                            <Box bg="orange.50" p={4} borderRadius="xl" border="1px dashed" borderColor="orange.200">
                                <HStack color="orange.600" mb={1}>
                                    <Icon as={FaTrophy} />
                                    <Text fontWeight="bold" fontSize="sm">Puntos</Text>
                                </HStack>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reto.recompensa_puntos}</Text>
                            </Box>
                            <Box bg="green.50" p={4} borderRadius="xl" border="1px dashed" borderColor="green.200">
                                <HStack color="green.600" mb={1}>
                                    <Icon as={FaLeaf} />
                                    <Text fontWeight="bold" fontSize="sm">Impacto CO₂</Text>
                                </HStack>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.800">{reto.recompensa_kg_co2} kg</Text>
                            </Box>
                        </SimpleGrid>

                        {/* Tasks Preview */}
                        <Box>
                            <HStack mb={3}>
                                <Icon as={FaExclamationCircle} color="brand.primary" />
                                <Text fontWeight="bold" color="gray.700">Tareas a completar:</Text>
                            </HStack>
                            <VStack align="stretch" spacing={3} maxH="300px" overflowY="auto" pr={1} css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                                '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
                            }}>
                                {reto.tasks.map((task: RetoTarea) => (
                                    <HStack key={task.id} p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
                                        <Icon as={FaCheckCircle} color="gray.300" boxSize={5} />
                                        <VStack align="start" spacing={0} flex={1}>
                                            <Text fontWeight="medium" fontSize="sm" color="gray.800">{task.titulo}</Text>
                                            <HStack spacing={2} mt={1}>
                                                <Badge size="sm" colorScheme="orange" variant="subtle">+{task.recompensa_puntos} pts</Badge>
                                                <Badge size="sm" colorScheme="green" variant="subtle">-{task.recompensa_kg_co2}kg CO₂</Badge>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>

                        <HStack justify="center" pt={2} color="gray.500" fontSize="sm">
                            <Icon as={FaClock} />
                            <Text>Finaliza el: {endDate}</Text>
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={4}>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="green"
                        bg="brand.primary"
                        _hover={{ bg: "brand.primaryHover" }}
                        onClick={handleJoin}
                        isLoading={isJoining}
                        loadingText="Uniéndome..."
                        borderRadius="xl"
                        px={8}
                        boxShadow="lg"
                    >
                        Unirse al Reto
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
