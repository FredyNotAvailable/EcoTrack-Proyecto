import {
    VStack,
    Heading,
    Text,
    Box,
    HStack,
    Icon,
    Badge,
    SimpleGrid,
    Flex,
    Center,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Progress
} from '@chakra-ui/react';
import { HiFlag, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import { EmptyState } from '../../../shared/EmptyState';
import { AnimatePresence, motion } from 'framer-motion';

const MotionAccordionItem = motion(AccordionItem);
const MotionBox = motion(Box);

interface UserChallengesTabProps {
    retos: {
        semanales: any[];
        tareas_completadas: any[];
    };
}

export const UserChallengesTab = ({ retos }: UserChallengesTabProps) => {
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const cardBg = useColorModeValue('white', 'gray.800');

    const activeRetos = retos.semanales.filter((r: any) =>
        ['active', 'in_progress', 'joined'].includes(r.estado)
    );

    const pastRetos = retos.semanales.filter((r: any) =>
        ['completed', 'failed', 'abandoned'].includes(r.estado)
    );

    const getProgress = (reto: any) => {
        const totalTasks = reto.retos_semanales?.retos_semanales_tareas?.length || 0;
        const completedTaskIds = retos.tareas_completadas
            ?.filter((tc: any) => tc.user_reto_id === reto.id)
            ?.map((tc: any) => tc.tarea_id) || [];
        const completedCount = completedTaskIds.length;
        return {
            total: totalTasks,
            completed: completedCount,
            percent: totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0,
            completedIds: completedTaskIds
        };
    };

    return (
        <VStack spacing={8} align="stretch">
            {/* Retos Activos - Accordion */}
            <Box>
                <Heading size="xs" textTransform="uppercase" color="gray.500" mb={4} fontWeight="900" letterSpacing="widest">
                    Retos en Curso
                </Heading>

                {activeRetos.length > 0 ? (
                    <Accordion allowMultiple defaultIndex={[0]}>
                        <AnimatePresence>
                            {activeRetos.map((r: any, index: number) => {
                                const { total, completed, percent, completedIds } = getProgress(r);
                                return (
                                    <MotionAccordionItem
                                        key={r.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="3xl"
                                        mb={4}
                                        overflow="hidden"
                                        shadow="sm"
                                    >
                                        <h2>
                                            <AccordionButton
                                                bg={useColorModeValue('white', 'gray.800')}
                                                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                                p={6}
                                            >
                                                <Box flex="1" textAlign="left">
                                                    <Flex justify="space-between" align="center" width="100%" gap={4}>
                                                        <HStack spacing={4}>
                                                            <Center w="40px" h="40px" bg="green.50" color="green.500" borderRadius="xl">
                                                                <Icon as={HiFlag} boxSize={5} />
                                                            </Center>
                                                            <Box>
                                                                <Heading size="sm" fontWeight="800" color="gray.700">{r.retos_semanales?.nombre}</Heading>
                                                                <Text fontSize="xs" fontWeight="600" color="gray.400" mt={1}>
                                                                    {r.retos_semanales?.descripcion}
                                                                </Text>
                                                            </Box>
                                                        </HStack>
                                                        <VStack align="end" spacing={1} minW="120px">
                                                            <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="800">
                                                                {completed} / {total} Tareas
                                                            </Badge>
                                                            <Flex align="center" w="full" gap={2}>
                                                                <Progress value={percent} size="xs" colorScheme="green" borderRadius="full" flex={1} />
                                                                <Text fontSize="xs" fontWeight="bold" color="gray.500">{percent.toFixed(0)}%</Text>
                                                            </Flex>
                                                        </VStack>
                                                    </Flex>
                                                </Box>
                                                <AccordionIcon ml={4} color="gray.400" />
                                            </AccordionButton>
                                        </h2>
                                        <AccordionPanel pb={6} pt={2} bg={useColorModeValue('gray.50', 'gray.900')}>
                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                {r.retos_semanales?.retos_semanales_tareas?.sort((a: any, b: any) => a.dia_orden - b.dia_orden).map((tarea: any) => {
                                                    const isDone = completedIds.includes(tarea.id);
                                                    return (
                                                        <Box
                                                            key={tarea.id}
                                                            p={4}
                                                            borderRadius="2xl"
                                                            bg={isDone ? 'white' : 'transparent'}
                                                            border="2px solid"
                                                            borderColor={isDone ? 'green.400' : 'transparent'}
                                                            shadow={isDone ? 'sm' : 'none'}
                                                            opacity={isDone ? 1 : 0.7}
                                                        >
                                                            <HStack mb={2}>
                                                                <Icon as={isDone ? HiCheckCircle : HiClock} color={isDone ? "green.500" : "gray.400"} boxSize={5} />
                                                                <Text fontSize="sm" fontWeight={isDone ? "900" : "600"} color={isDone ? "gray.800" : "gray.500"}>
                                                                    {tarea.nombre}
                                                                </Text>
                                                            </HStack>
                                                            {tarea.descripcion && (
                                                                <Text fontSize="xs" color="gray.500" fontWeight="500" noOfLines={2} ml={7}>{tarea.descripcion}</Text>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </SimpleGrid>
                                        </AccordionPanel>
                                    </MotionAccordionItem>
                                );
                            })}
                        </AnimatePresence>
                    </Accordion>
                ) : (
                    <EmptyState
                        title="Sin Retos Activos"
                        description="El usuario no participa actualmente en ningún reto semanal."
                        icon={HiFlag}
                    />
                )}
            </Box>

            {/* Historial de Retos */}
            <Box>
                <Heading size="xs" textTransform="uppercase" color="gray.500" mb={4} fontWeight="900" letterSpacing="widest">
                    Historial de Retos
                </Heading>

                {pastRetos.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <AnimatePresence>
                            {pastRetos.map((r: any, index: number) => {
                                const { total, completed } = getProgress(r);
                                return (
                                    <MotionBox
                                        key={r.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        p={5}
                                        bg={cardBg}
                                        borderRadius="2xl"
                                        border="1px solid"
                                        borderColor={borderColor}
                                    >
                                        <Flex justify="space-between" align="start" mb={3}>
                                            <HStack spacing={3}>
                                                <Icon as={r.estado === 'completed' ? HiCheckCircle : HiExclamation} color={r.estado === 'completed' ? 'green.500' : 'red.500'} boxSize={5} />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="800" fontSize="sm">{r.retos_semanales?.nombre}</Text>
                                                    <Text fontSize="xs" fontWeight="600" color="gray.500">{completed} / {total} tareas completadas</Text>
                                                </VStack>
                                            </HStack>
                                            <Badge
                                                colorScheme={r.estado === 'completed' ? 'green' : r.estado === 'failed' ? 'red' : 'gray'}
                                                px={2} py={1} borderRadius="md" fontSize="10px" fontWeight="800"
                                            >
                                                {r.estado === 'completed' ? 'COMPLETADO' : r.estado === 'failed' ? 'FALLIDO' : 'ABANDONADO'}
                                            </Badge>
                                        </Flex>
                                        <Text fontSize="xs" fontWeight="600" color="gray.400" ml={8}>
                                            {r.completed_at ? `Finalizado el ${new Date(r.completed_at).toLocaleDateString()}` : r.started_at ? `Iniciado el ${new Date(r.started_at).toLocaleDateString()}` : 'Fecha desconocida'}
                                        </Text>
                                    </MotionBox>
                                );
                            })}
                        </AnimatePresence>
                    </SimpleGrid>
                ) : (
                    <EmptyState
                        title="Sin Historial"
                        description="No hay retos pasados registrados."
                        icon={HiClock}
                    />
                )}
            </Box>
        </VStack>
    );
};
