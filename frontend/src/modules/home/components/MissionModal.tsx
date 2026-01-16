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
    Box,
    Badge,
    useToast,
    CloseButton,
    Heading,
    Flex
} from "@chakra-ui/react";
import { FaLeaf, FaClock, FaCircleCheck, FaTrophy, FaLightbulb } from "react-icons/fa6";
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

    const handleAction = async () => {
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
                render: ({ onClose }) => (
                    <Box color="white" p={4} bg="brand.secondary" borderRadius="16px" boxShadow="xl" position="relative" pr={8}>
                        <CloseButton position="absolute" right="2" top="2" onClick={onClose} color="white" />
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
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size="md">
            <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.400" />
            <ModalContent borderRadius="40px" overflow="hidden" boxShadow="0 30px 60px -12px rgba(0, 0, 0, 0.15)" bg="white" border="1px solid" borderColor="gray.50">
                <ModalBody p={10}>
                    <ModalCloseButton top={6} right={6} borderRadius="full" size="sm" bg="gray.50" _hover={{ bg: "gray.100" }} />

                    <VStack align="stretch" spacing={8}>
                        {/* Header: Clean & Airy */}
                        <VStack align="center" spacing={4} textAlign="center">
                            <Flex
                                w="80px"
                                h="80px"
                                bg="brand.bgCardLight"
                                color="brand.primary"
                                borderRadius="28px"
                                align="center"
                                justify="center"
                                boxShadow="sm"
                            >
                                <Icon as={FaLeaf} fontSize="2.2rem" />
                            </Flex>
                            <VStack spacing={1}>
                                <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} fontSize="10px" letterSpacing="widest" textTransform="uppercase">
                                    {mission.categoria}
                                </Badge>
                                <Heading size="lg" color="brand.secondary" fontWeight="900" letterSpacing="tight">
                                    {mission.titulo}
                                </Heading>
                            </VStack>
                        </VStack>

                        {/* Description Section */}
                        <Box>
                            <Text color="gray.600" fontSize="1.05rem" lineHeight="tall" fontWeight="400" textAlign="center" px={2}>
                                {mission.descripcion}
                            </Text>
                        </Box>

                        {/* Minimalist Eco-Tip */}
                        {mission.eco_tip && (
                            <Box
                                bg="gray.50"
                                p={5}
                                borderRadius="28px"
                                border="1px solid"
                                borderColor="gray.100"
                            >
                                <HStack mb={3} spacing={2}>
                                    <Icon as={FaLightbulb} color="brand.accentYellow" fontSize="sm" />
                                    <Text fontWeight="800" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Eco-Tip del Experto</Text>
                                </HStack>
                                <Text fontSize="sm" color="brand.secondary" fontStyle="italic" lineHeight="relaxed" fontWeight="500">
                                    "{mission.eco_tip}"
                                </Text>
                            </Box>
                        )}

                        {/* Stats Row: Simplified */}
                        <HStack spacing={4} justify="center">
                            <HStack bg="gray.50" py={2} px={4} borderRadius="full" border="1px solid" borderColor="gray.100">
                                <Icon as={FaTrophy} color="brand.accentYellow" fontSize="sm" />
                                <Text fontWeight="800" color="brand.primary" fontSize="sm">+{mission.puntos} XP</Text>
                            </HStack>
                            {mission.kg_co2_ahorrado && (
                                <HStack bg="blue.50" py={2} px={4} borderRadius="full" border="1px solid" borderColor="blue.100">
                                    <Icon as={FaLeaf} color="blue.400" fontSize="sm" />
                                    <Text fontWeight="800" color="blue.700" fontSize="sm">-{mission.kg_co2_ahorrado}kg CO₂</Text>
                                </HStack>
                            )}
                        </HStack>
                    </VStack>
                </ModalBody>

                <ModalFooter p={10} pt={0}>
                    {mission.completed ? (
                        <Button
                            w="full"
                            h="65px"
                            borderRadius="24px"
                            variant="link"
                            color="green.500"
                            leftIcon={<FaCircleCheck size={24} />}
                            isDisabled
                            fontSize="lg"
                            fontWeight="800"
                            opacity={1}
                            _disabled={{ opacity: 1, cursor: "default" }}
                        >
                            ¡Misión Cumplida!
                        </Button>
                    ) : (
                        <Button
                            w="full"
                            h="65px"
                            borderRadius="24px"
                            bg="brand.secondary"
                            color="white"
                            _hover={{
                                bg: "brand.secondary",
                                transform: "translateY(-2px)",
                                boxShadow: "0 15px 30px -5px rgba(31, 64, 55, 0.4)"
                            }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            isLoading={isSubmitting}
                            isDisabled={!canComplete}
                            onClick={handleAction}
                            loadingText="Marcando impacto..."
                            leftIcon={!canComplete ? <FaClock /> : <FaLeaf />}
                            fontSize="lg"
                            fontWeight="800"
                        >
                            {!canComplete ? (
                                `Lee el consejo (${countdown}s)`
                            ) : (
                                "¡Lo he logrado!"
                            )}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
