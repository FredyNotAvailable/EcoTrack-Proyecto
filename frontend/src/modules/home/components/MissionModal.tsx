import {
    Modal,
    ModalOverlay,
    ModalContent,
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
                                Has ganado {mission.puntos} puntos {mission.kg_co2_ahorrado ? `y ahorrado ${mission.kg_co2_ahorrado}kg de CO₂` : ''}.
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
            <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.300" />
            <ModalContent 
                borderRadius="32px" 
                overflow="hidden" 
                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.1)" 
                bg="gray.50"
                border="none"
                maxW="500px"
            >
                {/* Hero Section - Similar to /INICIO */}
                <Box
                    bg="white"
                    p={{ base: 6, md: 8 }}
                    borderRadius="32px"
                    m={4}
                    boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
                    border="1px solid rgba(0,0,0,0.03)"
                    position="relative"
                >
                    <ModalCloseButton 
                        position="absolute"
                        top={4} 
                        right={4} 
                        borderRadius="full" 
                        size="sm" 
                        bg="gray.50" 
                        _hover={{ bg: "gray.100" }}
                        zIndex={2}
                    />

                    <VStack spacing={6} align="stretch">
                        {/* Compact Header */}
                        <HStack spacing={4} align="center">
                            <Flex
                                w={12}
                                h={12}
                                bg="brand.bgCardLight"
                                color="brand.primary"
                                borderRadius="xl"
                                align="center"
                                justify="center"
                                flexShrink={0}
                            >
                                <Icon as={FaLeaf} fontSize="lg" />
                            </Flex>
                            <Box flex={1}>
                                <HStack spacing={2} mb={1}>
                                    <Badge 
                                        colorScheme="green" 
                                        variant="subtle" 
                                        borderRadius="full" 
                                        px={2}
                                        py={0.5}
                                        fontSize="xs" 
                                        fontWeight="700"
                                    >
                                        {mission.categoria}
                                    </Badge>
                                </HStack>
                                <Heading 
                                    size="md"
                                    color="brand.secondary" 
                                    fontWeight="900" 
                                    lineHeight="1.2"
                                    noOfLines={2}
                                >
                                    {mission.titulo}
                                </Heading>
                            </Box>
                        </HStack>

                        {/* Description */}
                        <Text 
                            color="brand.textMuted" 
                            fontSize="md"
                            lineHeight="1.6" 
                            fontWeight="500"
                        >
                            {mission.descripcion}
                        </Text>

                        {/* Eco-Tip - Minimalist */}
                        {mission.eco_tip && (
                            <Box
                                bg="orange.50"
                                p={4}
                                borderRadius="20px"
                                borderLeft="4px solid"
                                borderColor="orange.400"
                            >
                                <HStack spacing={2} mb={2}>
                                    <Icon as={FaLightbulb} color="orange.500" fontSize="sm" />
                                    <Text 
                                        fontWeight="700" 
                                        color="orange.600" 
                                        fontSize="xs" 
                                        textTransform="uppercase" 
                                        letterSpacing="wide"
                                    >
                                        Eco-Tip
                                    </Text>
                                </HStack>
                                <Text 
                                    fontSize="sm"
                                    color="gray.700" 
                                    fontStyle="italic" 
                                    lineHeight="1.5"
                                >
                                    "{mission.eco_tip}"
                                </Text>
                            </Box>
                        )}

                        {/* Rewards - Inline Style */}
                        <HStack spacing={3} justify="flex-start">
                            <HStack spacing={2}>
                                <Icon as={FaTrophy} color="orange.500" fontSize="sm" />
                                <Text fontWeight="700" color="brand.secondary" fontSize="sm">
                                    +{mission.puntos} XP
                                </Text>
                            </HStack>
                            {mission.kg_co2_ahorrado && (
                                <HStack spacing={2}>
                                    <Icon as={FaLeaf} color="green.500" fontSize="sm" />
                                    <Text fontWeight="700" color="brand.secondary" fontSize="sm">
                                        -{mission.kg_co2_ahorrado}kg CO₂
                                    </Text>
                                </HStack>
                            )}
                        </HStack>
                        {/* Action Button */}
                        {mission.completed ? (
                            <Button
                                w="full"
                                h="50px"
                                borderRadius="32px"
                                bg="green.50"
                                color="green.600"
                                border="2px solid"
                                borderColor="green.200"
                                leftIcon={<FaCircleCheck />}
                                isDisabled
                                fontSize="md"
                                fontWeight="700"
                                _disabled={{ opacity: 1, cursor: "default" }}
                            >
                                ¡Misión Cumplida!
                            </Button>
                        ) : (
                            <Button
                                w="full"
                                h="50px"
                                borderRadius="32px"
                                bg="brand.secondary"
                                color="white"
                                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.2)"
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 20px 40px -10px rgba(31, 64, 55, 0.3)"
                                }}
                                _active={{ transform: "scale(0.98)" }}
                                transition="all 0.3s ease"
                                isLoading={isSubmitting}
                                isDisabled={!canComplete}
                                onClick={handleAction}
                                loadingText="Completando..."
                                leftIcon={!canComplete ? <FaClock /> : <FaLeaf />}
                                fontSize="md"
                                fontWeight="700"
                            >
                                {!canComplete ? (
                                    `Lee el consejo (${countdown}s)`
                                ) : (
                                    "¡Lo he logrado!"
                                )}
                            </Button>
                        )}
                    </VStack>
                </Box>
            </ModalContent>
        </Modal>
    );
};
