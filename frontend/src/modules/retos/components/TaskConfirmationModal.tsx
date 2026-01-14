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
        // We don't close here, the parent will close it on success if desired, 
        // but usually we close it after the mutation succeeds.
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent borderRadius="24px" p={2}>
                <ModalHeader>
                    <VStack align="start" spacing={1}>
                        <Badge colorScheme="green" borderRadius="full" px={3}>Tarea Seleccionada</Badge>
                        <Text fontSize="1.5rem" fontWeight="800" color="brand.secondary">
                            {task.titulo}
                        </Text>
                    </VStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack align="stretch" spacing={6}>
                        <Box>
                            <Text fontWeight="600" color="gray.500" mb={1} textTransform="uppercase" fontSize="xs" letterSpacing="widest">
                                Descripción de la Tarea
                            </Text>
                            <Text color="brand.textMain" fontSize="1.05rem" lineHeight="1.6">
                                {task.descripcion}
                            </Text>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fontWeight="600" color="gray.500" mb={3} textTransform="uppercase" fontSize="xs" letterSpacing="widest">
                                Recompensas por Completar
                            </Text>
                            <HStack spacing={6}>
                                <HStack bg="brand.bgCardLight" p={3} borderRadius="16px" flex={1} justify="center">
                                    <Icon as={FaTrophy} color="brand.primary" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="800" color="brand.secondary">{task.recompensa_puntos}</Text>
                                        <Text fontSize="xs" color="gray.500">Puntos</Text>
                                    </VStack>
                                </HStack>

                                <HStack bg="brand.bgCardLight" p={3} borderRadius="16px" flex={1} justify="center">
                                    <Icon as={FaLeaf} color="brand.primary" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="800" color="brand.secondary">{task.recompensa_kg_co2}</Text>
                                        <Text fontSize="xs" color="gray.500">Kg CO₂</Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        </Box>

                        <Box p={4} bg="green.50" borderRadius="16px" border="1px solid" borderColor="green.100">
                            <HStack spacing={3}>
                                <Icon as={FaCircleCheck} color="green.500" boxSize={5} />
                                <Text fontSize="sm" color="green.700" fontWeight="500">
                                    Al confirmar, esta tarea se marcará como completada y recibirás tus recompensas.
                                </Text>
                            </HStack>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={onClose} borderRadius="full">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="green"
                        bg="brand.primary"
                        _hover={{ bg: "brand.primaryHover" }}
                        borderRadius="full"
                        px={8}
                        onClick={handleConfirm}
                        isLoading={isLoading}
                        loadingText="Completando..."
                    >
                        Confirmar Completado
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
