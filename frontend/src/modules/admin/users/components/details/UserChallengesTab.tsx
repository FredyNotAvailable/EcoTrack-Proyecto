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
} from '@chakra-ui/react';
import { HiFlag, HiCheckCircle, HiClock } from 'react-icons/hi';

interface UserChallengesTabProps {
    retos: {
        semanales: any[];
        tareas_completadas: any[];
    };
}

export const UserChallengesTab = ({ retos }: UserChallengesTabProps) => {
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const cardBg = useColorModeValue('white', 'gray.800');

    console.log('UserChallengesTab retos:', retos);
    console.log('Retos semanales:', retos?.semanales);
    console.log('Retos filtrados (joined):', retos?.semanales?.filter((r: any) => r.estado === 'joined'));
    console.log('Retos filtrados (active/in_progress/joined):', retos?.semanales?.filter((r: any) => r.estado === 'active' || r.estado === 'in_progress' || r.estado === 'joined'));

    return (
        <VStack spacing={6} align="stretch">
            {/* Retos Activos - Accordion */}
            <Accordion allowToggle defaultIndex={[0]}>
                <AccordionItem border="none">
                    <AccordionButton
                        bg={useColorModeValue('green.50', 'green.900')}
                        _hover={{ bg: useColorModeValue('green.100', 'green.800') }}
                        borderRadius="xl"
                        p={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading size="sm" color={useColorModeValue('green.700', 'green.200')}>
                                <Icon as={HiFlag} mr={2} />
                                Retos en Curso ({retos.semanales.filter((r: any) => r.estado === 'active' || r.estado === 'in_progress' || r.estado === 'joined').length})
                            </Heading>
                        </Box>
                        <AccordionIcon color={useColorModeValue('green.600', 'green.300')} />
                    </AccordionButton>
                    <AccordionPanel pb={4} pt={6}>
                        {retos.semanales.filter((r: any) => r.estado === 'active' || r.estado === 'in_progress' || r.estado === 'joined').length > 0 ? (
                            <Accordion allowMultiple>
                                {retos.semanales.filter((r: any) => r.estado === 'active' || r.estado === 'in_progress' || r.estado === 'joined').map((r: any) => {
                                    const totalTasks = r.retos_semanales?.retos_semanales_tareas?.length || 0;
                                    const completedTaskIds = retos.tareas_completadas
                                        ?.filter((tc: any) => tc.user_reto_id === r.id)
                                        ?.map((tc: any) => tc.tarea_id) || [];
                                    const completedCount = completedTaskIds.length;
                                    const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

                                    return (
                                        <AccordionItem key={r.id} border="1px solid" borderColor={useColorModeValue('green.200', 'green.700')} borderRadius="2xl" mb={4}>
                                            <AccordionButton
                                                bg={useColorModeValue('green.50', 'green.900')}
                                                _hover={{ bg: useColorModeValue('green.100', 'green.800') }}
                                                borderRadius="2xl"
                                                p={6}
                                            >
                                                <Box flex="1" textAlign="left">
                                                    <Flex justify="space-between" align="start" width="100%">
                                                        <VStack align="start" spacing={1} flex={1}>
                                                            <HStack>
                                                                <Icon as={HiFlag} color={useColorModeValue('green.600', 'green.300')} boxSize={5} />
                                                                <Heading size="md" color={useColorModeValue('green.700', 'green.200')}>{r.retos_semanales?.nombre}</Heading>
                                                            </HStack>
                                                            <Text fontSize="sm" color="gray.600">{r.retos_semanales?.descripcion}</Text>
                                                        </VStack>
                                                        <VStack align="end" spacing={1} ml={4}>
                                                            <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="xs">
                                                                {completedCount} / {totalTasks} Tareas
                                                            </Badge>
                                                            <Text fontSize="xs" color="gray.500">{progress.toFixed(0)}% completado</Text>
                                                        </VStack>
                                                    </Flex>
                                                </Box>
                                                <AccordionIcon ml={4} color={useColorModeValue('green.600', 'green.300')} />
                                            </AccordionButton>
                                            <AccordionPanel pb={6} pt={4}>
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                    {r.retos_semanales?.retos_semanales_tareas?.sort((a: any, b: any) => a.dia_orden - b.dia_orden).map((tarea: any) => {
                                                        const isDone = completedTaskIds.includes(tarea.id);
                                                        return (
                                                            <Box
                                                                key={tarea.id}
                                                                p={4}
                                                                borderRadius="xl"
                                                                bg={isDone ? useColorModeValue("green.50", "green.900") : useColorModeValue("white", "gray.800")}
                                                                border="2px solid"
                                                                borderColor={isDone ? useColorModeValue("green.300", "green.600") : useColorModeValue("gray.200", "gray.600")}
                                                                transition="all 0.2s"
                                                            >
                                                                <HStack mb={2}>
                                                                    <Icon as={isDone ? HiCheckCircle : HiClock} color={isDone ? "green.500" : "gray.400"} boxSize={5} />
                                                                    <Text fontSize="sm" fontWeight={isDone ? "bold" : "medium"} color={isDone ? useColorModeValue("green.700", "green.300") : "gray.600"}>
                                                                        {tarea.nombre}
                                                                    </Text>
                                                                </HStack>
                                                                {tarea.descripcion && (
                                                                    <Text fontSize="xs" color="gray.500" noOfLines={2}>{tarea.descripcion}</Text>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        ) : (
                            <Center py={10}>
                                <Text color="gray.500">No hay retos en curso.</Text>
                            </Center>
                        )}
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            {/* Historial de Retos - Accordion */}
            <Accordion allowToggle>
                <AccordionItem border="none">
                    <AccordionButton
                        bg={useColorModeValue('gray.50', 'gray.800')}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                        borderRadius="xl"
                        p={4}
                    >
                        <Box flex="1" textAlign="left">
                            <Heading size="sm" color="gray.600">
                                <Icon as={HiCheckCircle} mr={2} />
                                Historial de Retos ({retos.semanales.filter((r: any) => r.estado === 'completed' || r.estado === 'failed' || r.estado === 'abandoned').length})
                            </Heading>
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pt={6}>
                        {retos.semanales.filter((r: any) => r.estado === 'completed' || r.estado === 'failed' || r.estado === 'abandoned').length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                {retos.semanales.filter((r: any) => r.estado === 'completed' || r.estado === 'failed' || r.estado === 'abandoned').map((r: any) => {
                                    const totalTasks = r.retos_semanales?.retos_semanales_tareas?.length || 0;
                                    const completedTaskIds = retos.tareas_completadas
                                        ?.filter((tc: any) => tc.user_reto_id === r.id)
                                        ?.map((tc: any) => tc.tarea_id) || [];
                                    const completedCount = completedTaskIds.length;

                                    return (
                                        <Box key={r.id} p={5} bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                                            <Flex justify="space-between" align="start" mb={3}>
                                                <VStack align="start" spacing={0} flex={1}>
                                                    <Text fontWeight="bold" fontSize="sm">{r.retos_semanales?.nombre}</Text>
                                                    <Text fontSize="xs" color="gray.500">{completedCount} / {totalTasks} tareas completadas</Text>
                                                </VStack>
                                                <Badge
                                                    colorScheme={r.estado === 'completed' ? 'green' : r.estado === 'failed' ? 'red' : 'gray'}
                                                    px={2}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="xs"
                                                >
                                                    {r.estado === 'completed' ? 'COMPLETADO' : r.estado === 'failed' ? 'FALLIDO' : 'ABANDONADO'}
                                                </Badge>
                                            </Flex>
                                            <Text fontSize="xs" color="gray.400">
                                                {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : r.started_at ? new Date(r.started_at).toLocaleDateString() : 'Fecha desconocida'}
                                            </Text>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        ) : (
                            <Center py={10}>
                                <Text color="gray.500">No hay historial de retos.</Text>
                            </Center>
                        )}
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </VStack>
    );
};
