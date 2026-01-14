import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Button,
    HStack,
    Icon,
    Center,
    Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaFlag, FaTrophy, FaListCheck } from 'react-icons/fa6';
import { useRetos } from './hooks/useRetos';
import { RetoCard } from './components/RetoCard';

import { RetoDetailsModal } from './components/RetoDetailsModal';
import type { Reto } from './services/retos.service';

export const RetosPage = () => {
    const { challenges, isLoading, joinChallengeAsync, completeTask, isCompletingTask } = useRetos();
    const [activeTab, setActiveTab] = useState(0); // 0: Available, 1: Joined, 2: Completed
    const [selectedReto, setSelectedReto] = useState<Reto | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const availableChallenges = challenges.filter(r => !r.joined && r.status !== 'completed');
    const joinedChallenges = challenges.filter(r => r.joined && r.status !== 'completed');
    const completedChallenges = challenges.filter(r => r.status === 'completed');

    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    const handleCompleteTask = (retoId: string, taskId: string) => {
        completeTask({ retoId, taskId });
    };

    const handleViewDetails = (reto: Reto) => {
        setSelectedReto(reto);
        setIsDetailsOpen(true);
    };

    const handleJoinChallenge = async (id: string) => {
        setJoiningId(id);
        try {
            await joinChallengeAsync(id);
        } finally {
            setJoiningId(null);
        }
    };

    const EmptyState = ({ message }: { message: string }) => (
        <Center flexDir="column" py={10} opacity={0.6}>
            <Icon as={FaFlag} boxSize={10} mb={4} color="gray.300" />
            <Text color="gray.500">{message}</Text>
        </Center>
    );

    return (
        <Box animation="fadeIn 0.5s ease-out" pb={20} bg="brand.bgBody" minH="100vh">
            {/* ... Header and Tabs (kept same, just ensuring context) ... */}
            <Box mb={8} pt={4}>
                <Heading as="h1" fontSize={{ base: "2rem", md: "3rem" }} mb={2} lineHeight="1.2" color="brand.secondary">
                    Retos <Text as="span" bgGradient="linear(to-r, brand.primary, brand.accent)" bgClip="text">Semanales</Text> 🏁
                </Heading>
                <Text color="brand.textMuted" fontSize="1.1rem">
                    Completa desafíos, reduce tu huella y sube de nivel.
                </Text>
            </Box>

            {/* Navigation Sections */}
            <HStack spacing={4} mb={8} overflowX="auto" py={2}>
                {[
                    { label: "Disponibles", icon: FaFlag, count: availableChallenges.length },
                    { label: "Mis Retos", icon: FaListCheck, count: joinedChallenges.length },
                    { label: "Completados", icon: FaTrophy, count: completedChallenges.length },
                ].map((tab, index) => {
                    const isActive = activeTab === index;
                    return (
                        <Button
                            key={index}
                            onClick={() => handleTabChange(index)}
                            variant={isActive ? "solid" : "ghost"}
                            bg={isActive ? "brand.accent" : "transparent"} // Lighter Green Active
                            color={isActive ? "white" : "gray.500"}
                            _hover={{ bg: isActive ? "brand.accent" : "gray.100" }}
                            borderRadius="full"
                            px={6}
                            leftIcon={<Icon as={tab.icon} />}
                            boxShadow={isActive ? "0 4px 12px rgba(106, 176, 76, 0.4)" : "none"}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <Box
                                    ml={2}
                                    bg={isActive ? "white" : "gray.200"}
                                    color={isActive ? "brand.accent" : "gray.600"}
                                    fontSize="xs"
                                    borderRadius="full"
                                    px={2}
                                >
                                    {tab.count}
                                </Box>
                            )}
                        </Button>
                    );
                })}
            </HStack>

            {/* Content */}
            {isLoading ? (
                <Center py={20}>
                    <Spinner size="xl" color="brand.primary" />
                </Center>
            ) : (
                <Box>
                    {activeTab === 0 && (
                        availableChallenges.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {availableChallenges.map(reto => (
                                    <RetoCard
                                        key={reto.id}
                                        reto={reto}
                                        onJoin={handleJoinChallenge}
                                        onViewDetails={() => handleViewDetails(reto)}
                                        onCompleteTask={handleCompleteTask}
                                        isJoining={joiningId === reto.id}
                                        isCompletingTask={isCompletingTask} // Task completion is usually fast, global loading is mostly fine, or we can improve later
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <EmptyState message="No hay nuevos retos disponibles por ahora." />
                        )
                    )}

                    {activeTab === 1 && (
                        joinedChallenges.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {joinedChallenges.map(reto => (
                                    <RetoCard
                                        key={reto.id}
                                        reto={reto}
                                        onJoin={handleJoinChallenge}
                                        onViewDetails={() => handleViewDetails(reto)} // Should not be needed for joined, but harmless
                                        onCompleteTask={handleCompleteTask}
                                        isJoining={joiningId === reto.id}
                                        isCompletingTask={isCompletingTask}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <EmptyState message="No te has unido a ningún reto activo." />
                        )
                    )}

                    {activeTab === 2 && (
                        completedChallenges.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {completedChallenges.map(reto => (
                                    <RetoCard
                                        key={reto.id}
                                        reto={reto}
                                        onJoin={handleJoinChallenge}
                                        onViewDetails={() => handleViewDetails(reto)}
                                        onCompleteTask={handleCompleteTask}
                                        isJoining={joiningId === reto.id}
                                        isCompletingTask={isCompletingTask}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <EmptyState message="Aún no has completado retos." />
                        )
                    )}
                </Box>
            )}

            <RetoDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                reto={selectedReto}
                onJoin={handleJoinChallenge}
                isJoining={joiningId === (selectedReto?.id || '')}
            />
        </Box>
    );
};

export default RetosPage;
