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
    Box,
    Badge,
    useToast
} from "@chakra-ui/react";
import { FaLeaf, FaBolt, FaClock, FaCircleCheck, FaTrophy, FaDroplet, FaBus, FaTrashCan } from "react-icons/fa6";
import { useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import type { DailyMission } from "../services/misiones.service";

interface MissionModalProps {
    mission: DailyMission | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (missionId: string) => Promise<void>;
}

export const MissionModal = ({ mission, isOpen, onClose, onComplete }: MissionModalProps) => {
    const [canComplete, setCanComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const toast = useToast();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && mission && !mission.completed) {
            setCanComplete(false);
            setCountdown(3);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanComplete(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else if (isOpen && mission?.completed) {
            setCanComplete(true);
            setCountdown(0);
        }
    }, [isOpen, mission]);

    const handleComplete = async () => {
        if (!mission) return;
        setIsSubmitting(true);
        try {
            await onComplete(mission.id);

            // Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2E7D32', '#4CAF50', '#81C784', '#FFD700']
            });

            // Rewards Notification
            toast({
                position: 'top',
                render: () => (
                    <Box color="white" p={4} bg="brand.secondary" borderRadius="16px" boxShadow="xl">
                        <VStack align="start" spacing={1}>
                            <HStack>
                                <Icon as={FaTrophy} color="brand.primary" />
                                <Text fontWeight="bold">¡Misión Cumplida!</Text>
                            </HStack>
                            <Text fontSize="sm">
                                Has ganado **{mission.puntos} puntos** {mission.kg_co2_ahorrado ? `y ahorrado **${mission.kg_co2_ahorrado}kg de CO₂**` : ''}.
                            </Text>
                        </VStack>
                    </Box>
                ),
                duration: 5000,
                isClosable: true,
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo completar la misión.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mission) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size="lg">
            <ModalOverlay backdropFilter="blur(3px)" />
            <ModalContent borderRadius="20px" overflow="hidden">
                <ModalHeader bg="brand.primary" color="white" borderBottomRadius="0">
                    <HStack>
                        <Icon as={FaLeaf} />
                        <Text>{mission.titulo}</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" />

                <ModalBody p={6}>
                    <VStack align="start" spacing={5}>
                        <Box>
                            <Text fontSize="lg" fontWeight="bold" color="brand.secondary" mb={2}>Descripción</Text>
                            <Text color="gray.600" fontSize="md">{mission.descripcion}</Text>
                        </Box>

                        {mission.eco_tip && (
                            <Box w="100%" bg="green.50" p={4} borderRadius="12px" borderLeft="4px solid" borderColor="green.400">
                                <HStack mb={1}>
                                    <Icon as={FaBolt} color="green.500" />
                                    <Text fontWeight="bold" color="green.700" fontSize="sm">Eco Tip</Text>
                                </HStack>
                                <Text fontSize="sm" color="green.800" fontStyle="italic">"{mission.eco_tip}"</Text>
                            </Box>
                        )}

                        <HStack spacing={4} w="100%" pt={2}>
                            <VStack align="start" flex={1} bg="gray.50" p={3} borderRadius="10px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Categoría</Text>
                                <HStack spacing={1}>
                                    <Icon
                                        as={
                                            mission.categoria === 'energia' ? FaBolt :
                                                mission.categoria === 'agua' ? FaDroplet :
                                                    mission.categoria === 'transporte' ? FaBus :
                                                        FaTrashCan
                                        }
                                        color={
                                            mission.categoria === 'energia' ? 'orange.400' :
                                                mission.categoria === 'agua' ? 'blue.400' :
                                                    mission.categoria === 'transporte' ? 'purple.400' :
                                                        'green.400'
                                        }
                                    />
                                    <Text fontSize="sm" fontWeight="600" textTransform="capitalize">{mission.categoria}</Text>
                                </HStack>
                            </VStack>
                            <VStack align="start" flex={1} bg="gray.50" p={3} borderRadius="10px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Impacto</Text>
                                <Text fontSize="sm" fontWeight="600">{mission.impacto || "Positivo"}</Text>
                            </VStack>
                            <VStack align="start" flex={1} bg="gray.50" p={3} borderRadius="10px">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Recompensa</Text>
                                <Badge colorScheme="green" fontSize="0.9rem" borderRadius="full" px={2}>+{mission.puntos} pts</Badge>
                            </VStack>
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter bg="gray.50" p={4}>
                    {mission.completed ? (
                        <Button w="100%" colorScheme="green" leftIcon={<FaCircleCheck />} isDisabled variant="outline">
                            Misión Completada
                        </Button>
                    ) : (
                        <Button
                            w="100%"
                            colorScheme="brand"
                            size="lg"
                            isLoading={isSubmitting}
                            isDisabled={!canComplete}
                            onClick={handleComplete}
                            loadingText="Completando..."
                            _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                        >
                            {!canComplete ? (
                                <HStack>
                                    <Icon as={FaClock} />
                                    <Text>Lee la misión ({countdown}s)...</Text>
                                </HStack>
                            ) : (
                                "Completar Misión"
                            )}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
