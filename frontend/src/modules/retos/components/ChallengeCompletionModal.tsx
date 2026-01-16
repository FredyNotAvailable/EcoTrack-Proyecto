import {
    Modal,
    ModalOverlay,
    ModalContent,
    VStack,
    Text,
    Button,
    Icon,
    HStack,
    Box
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaTrophy, FaLeaf, FaStar } from 'react-icons/fa6';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import type { Reto } from '../services/retos.service';

interface ChallengeCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    reto: Reto | null;
    isPerfect: boolean; // True if all tasks joined
}

const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

export const ChallengeCompletionModal = ({ isOpen, onClose, reto, isPerfect }: ChallengeCompletionModalProps) => {

    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#4CAF50', '#81C784', '#FFD700'],
                    zIndex: 10000
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#4CAF50', '#81C784', '#FFD700'],
                    zIndex: 10000
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    if (!reto) return null;

    // Calculate Earned (Simple approximation based on perfect)
    // If perfect, full reward. If not, proportional (assuming simple logic for display)
    const earnedPoints = Math.round(isPerfect ? reto.recompensa_puntos : (reto.recompensa_puntos * ((reto.completed_tasks || 0) + 1) / (reto.total_tasks || 1)));
    const earnedCo2 = Math.round(isPerfect ? reto.recompensa_kg_co2 : (reto.recompensa_kg_co2 * ((reto.completed_tasks || 0) + 1) / (reto.total_tasks || 1)));

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" closeOnOverlayClick={false}>
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
            <ModalContent
                borderRadius="32px"
                p={0}
                bg="transparent"
                boxShadow="none"
            >
                <Box
                    bg="white"
                    borderRadius="32px"
                    p={8}
                    textAlign="center"
                    animation={`${popIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)`}
                    position="relative"
                >
                    {/* Icon Header */}
                    <Box
                        position="absolute"
                        top="-36px"
                        left="50%"
                        transform="translateX(-50%)"
                        bg={isPerfect ? "brand.primary" : "blue.500"}
                        p={4}
                        borderRadius="full"
                        boxShadow="0 8px 20px rgba(0,0,0,0.15)"
                        border="4px solid white"
                        zIndex={10}
                    >
                        <Icon as={isPerfect ? FaTrophy : FaStar} boxSize={8} color="white" />
                    </Box>

                    <VStack spacing={6} mt={8}>
                        <VStack spacing={1}>
                            <Text fontSize="2xl" fontWeight="900" color="brand.secondary" lineHeight="1.2">
                                {isPerfect ? "¡Reto Completado!" : "¡Reto Finalizado!"}
                            </Text>
                            <Text fontSize="md" color="gray.500" fontWeight="500">
                                {reto.titulo}
                            </Text>
                        </VStack>

                        <Text color="gray.600" fontSize="sm" lineHeight="1.6">
                            {isPerfect
                                ? "¡Increíble! Has completado todas las tareas del desafío. Tu compromiso con el planeta es inspirador."
                                : "Has llegado al final del desafío. Cada acción cuenta, ¡sigue así para el próximo!"
                            }
                        </Text>

                        {/* Stats Box */}
                        <HStack spacing={4} w="full">
                            <VStack flex={1} bg="brand.bgCardLight" p={4} borderRadius="20px" spacing={0}>
                                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="brand.primary" mb={1}>Has ganado</Text>
                                <HStack>
                                    <Icon as={FaTrophy} color="brand.primary" boxSize={4} />
                                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{earnedPoints}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.400" fontWeight="600">puntos XP</Text>
                            </VStack>

                            <VStack flex={1} bg="blue.50" p={4} borderRadius="20px" spacing={0}>
                                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="blue.500" mb={1}>Has ahorrado</Text>
                                <HStack>
                                    <Icon as={FaLeaf} color="blue.500" boxSize={4} />
                                    <Text fontSize="2xl" fontWeight="900" color="brand.secondary">{earnedCo2}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.400" fontWeight="600">kg CO₂</Text>
                            </VStack>
                        </HStack>

                        <Button
                            w="full"
                            size="lg"
                            bg={isPerfect ? "brand.primary" : "brand.secondary"}
                            color="white"
                            borderRadius="20px"
                            fontWeight="800"
                            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                            onClick={onClose}
                            h="56px"
                        >
                            ¡Continuar así!
                        </Button>
                    </VStack>
                </Box>
            </ModalContent>
        </Modal>
    );
};
