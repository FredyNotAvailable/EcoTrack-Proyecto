import { Box, SimpleGrid, Heading, VStack, HStack, Text, Center, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { HiGift, HiGlobe } from 'react-icons/hi';

interface UserImpactTabProps {
    logs: {
        puntos: any[];
        co2: any[];
    };
}

export const UserImpactTab = ({ logs }: UserImpactTabProps) => {
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const cardBg = useColorModeValue('white', 'gray.800');

    console.log('UserImpactTab logs:', logs);
    console.log('CO2 logs:', logs?.co2);
    console.log('Puntos logs:', logs?.puntos);


    return (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            <Box>
                <Heading size="xs" textTransform="uppercase" color="orange.500" mb={4} ml={2}>Historial de Puntos</Heading>
                <VStack spacing={3} align="stretch" maxH="500px" overflowY="auto" pr={2} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: 'full' } }}>
                    {logs.puntos && logs.puntos.length > 0 ? logs.puntos.slice(0, 50).map((log: any) => (
                        <Box key={log.id} p={4} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                            <Flex justify="space-between" align="start">
                                <HStack spacing={3} align="start" flex={1}>
                                    <Center w="36px" h="36px" bg="orange.50" color="orange.500" borderRadius="xl" flexShrink={0}>
                                        <Icon as={HiGift} />
                                    </Center>
                                    <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="sm" fontWeight="bold">{log.origen || 'Actividad general'}</Text>
                                        {log.referencia_id && (
                                            <Text fontSize="xs" color="gray.400">ID: {log.referencia_id.substring(0, 8)}...</Text>
                                        )}
                                        <Text fontSize="xs" color="gray.400" mt={1}>{new Date(log.created_at).toLocaleString()}</Text>
                                    </VStack>
                                </HStack>
                                <Text fontWeight="extrabold" color="orange.500" fontSize="lg" flexShrink={0}>+{log.puntos}</Text>
                            </Flex>
                        </Box>
                    )) : (
                        <Center py={10} color="gray.500">
                            <Text fontSize="sm">No hay historial de puntos.</Text>
                        </Center>
                    )}
                </VStack>
            </Box>
            <Box>
                <Heading size="xs" textTransform="uppercase" color="green.500" mb={4} ml={2}>Contribución Climática</Heading>
                <VStack spacing={3} align="stretch" maxH="500px" overflowY="auto" pr={2} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: 'full' } }}>
                    {logs.co2 && logs.co2.length > 0 ? logs.co2.slice(0, 50).map((log: any) => (
                        <Box key={log.id} p={4} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
                            <Flex justify="space-between">
                                <HStack spacing={3}>
                                    <Center w="36px" h="36px" bg="green.50" color="green.500" borderRadius="xl">
                                        <Icon as={HiGlobe} />
                                    </Center>
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="bold">{log.origen}</Text>
                                        <Text fontSize="xs" color="gray.400">{new Date(log.created_at).toLocaleString()}</Text>
                                    </VStack>
                                </HStack>
                                <Text fontWeight="extrabold" color="green.500">-{log.kg_co2} kg</Text>
                            </Flex>
                        </Box>
                    )) : (
                        <Center py={10} color="gray.500">
                            <Text fontSize="sm">No hay historial de CO2.</Text>
                        </Center>
                    )}
                </VStack>
            </Box>
        </SimpleGrid>
    );
};
