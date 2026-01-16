import {
    Modal,
    ModalOverlay,
    ModalContent,
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
    Divider,
} from '@chakra-ui/react';
import { FaTrophy, FaLeaf, FaCircleCheck } from 'react-icons/fa6';
import type { RetoTarea } from '../services/retos.service';

interface TaskConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: RetoTarea | null;
    retoId: string | null;
    onConfirm: (retoId: string, taskId: string) => void;
    isLoading: boolean;
}

export const TaskConfirmationModal = ({
    isOpen,
    onClose,
    task,
    retoId,
    onConfirm,
    isLoading
}: TaskConfirmationModalProps) => {
    if (!task || !retoId) return null;

    const handleConfirm = () => {
        onConfirm(retoId, task.id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered motionPreset="slideInBottom">
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
            <ModalContent borderRadius="32px" p={4} boxShadow="2xl">
                <ModalCloseButton position="absolute" right={6} top={6} borderRadius="full" zIndex={2} />

                <ModalBody pt={8} pb={2} px={6}>
                    <VStack align="stretch" spacing={7}>
                        {/* Header Section */}
                        <VStack align="start" spacing={3}>
                            <Badge
                                bg="green.50"
                                color="green.700"
                                borderRadius="full"
                                px={4}
                                py={1}
                                fontSize="xs"
                                fontWeight="800"
                                letterSpacing="wider"
                                border="1px solid"
                                borderColor="green.100"
                            >
                                TAREA DE HOY
                            </Badge>
                            <Text fontSize="2rem" fontWeight="900" color="brand.secondary" lineHeight="1.1">
                                {task.titulo}
                            </Text>
                        </VStack>

                        {/* Description Section */}
                        <Box>
                            <Text
                                fontWeight="800"
                                color="gray.400"
                                mb={3}
                                textTransform="uppercase"
                                fontSize="10px"
                                letterSpacing="widest"
                            >
                                Tu Misión
                            </Text>
                            <Text color="gray.600" fontSize="1rem" lineHeight="1.6" fontWeight="500">
                                {task.descripcion}
                            </Text>
                        </Box>

                        <Divider borderColor="gray.100" />

                        {/* Rewards Section */}
                        <Box>
                            <Text
                                fontWeight="800"
                                color="gray.400"
                                mb={4}
                                textTransform="uppercase"
                                fontSize="10px"
                                letterSpacing="widest"
                            >
                                Recompensas
                            </Text>
                            <HStack spacing={4}>
                                <HStack
                                    bg="brand.bgCardLight"
                                    p={4}
                                    borderRadius="24px"
                                    flex={1}
                                    spacing={4}
                                    border="1px solid"
                                    borderColor="transparent"
                                    _hover={{ borderColor: "brand.primary" }}
                                    transition="all 0.2s"
                                >
                                    <Icon as={FaTrophy} color="brand.primary" boxSize={6} />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xl" fontWeight="900" color="brand.secondary">{task.recompensa_puntos}</Text>
                                        <Text fontSize="xs" color="gray.500" fontWeight="600">XP</Text>
                                    </VStack>
                                </HStack>

                                <HStack
                                    bg="blue.50"
                                    p={4}
                                    borderRadius="24px"
                                    flex={1}
                                    spacing={4}
                                    border="1px solid"
                                    borderColor="transparent"
                                    _hover={{ borderColor: "blue.400" }}
                                    transition="all 0.2s"
                                >
                                    <Icon as={FaLeaf} color="blue.500" boxSize={6} />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xl" fontWeight="900" color="brand.secondary">{task.recompensa_kg_co2}</Text>
                                        <Text fontSize="xs" color="gray.500" fontWeight="600">Ahorro CO₂</Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </Box>


                    </VStack>
                </ModalBody>

                <ModalFooter px={6} pb={8} pt={4} gap={4}>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="700"
                        color="gray.500"
                        _hover={{ bg: "gray.50", color: "gray.700" }}
                    >
                        Volver
                    </Button>
                    <Button
                        flex={1}
                        bg="brand.secondary"
                        color="white"
                        _hover={{ bg: "brand.secondary", transform: "translateY(-2px)", boxShadow: "lg" }}
                        borderRadius="full"
                        px={8}
                        h="50px"
                        onClick={handleConfirm}
                        isLoading={isLoading}
                        loadingText="Completando..."
                        fontSize="sm"
                        fontWeight="800"
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                    >
                        ¡Completar ahora!
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
