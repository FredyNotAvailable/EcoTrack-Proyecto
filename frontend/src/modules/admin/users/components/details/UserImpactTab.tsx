import { Box, Heading, VStack, Text, Center, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { HiGift, HiGlobe, HiLightningBolt } from 'react-icons/hi';

interface UserImpactTabProps {
    logs: {
        puntos: any[];
        co2: any[];
    };
}

const TimelineItem = ({ log, type, isLast }: any) => {
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const dotColor = type === 'puntos' ? 'orange.400' : 'green.400';
    const lineColor = useColorModeValue('gray.100', 'gray.700');
    const bg = useColorModeValue('white', 'gray.800');

    return (
        <Flex gap={4} position="relative">
            {/* Timeline Line */}
            <Flex direction="column" align="center" width="24px">
                <Box
                    width="12px"
                    height="12px"
                    borderRadius="full"
                    bg={dotColor}
                    border="2px solid white"
                    boxShadow={`0 0 0 2px ${useColorModeValue('#EDF2F7', '#2D3748')}`}
                    zIndex={1}
                />
                {!isLast && <Box width="2px" flex={1} bg={lineColor} my={1} />}
            </Flex>

            {/* Content Card */}
            <Box
                flex={1}
                pb={type === 'puntos' ? 6 : 4} // Spacing between items
                opacity={0.9}
                _hover={{ opacity: 1, transform: 'translateY(-1px)' }}
                transition="all 0.2s"
            >
                <Box
                    p={4}
                    bg={bg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                            <Flex align="center" gap={2}>
                                <Icon as={type === 'puntos' ? HiGift : HiGlobe} color={type === 'puntos' ? 'orange.500' : 'green.500'} />
                                <Text fontSize="sm" fontWeight="800" color="gray.700">
                                    {log.origen || (type === 'puntos' ? 'Puntos Ganados' : 'Reducción de CO2')}
                                </Text>
                            </Flex>
                            <Text fontSize="xs" fontWeight="600" color="gray.400">
                                {new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </Text>
                        </VStack>
                        <Text
                            fontWeight="900"
                            fontSize="md"
                            color={type === 'puntos' ? 'orange.500' : 'green.500'}
                        >
                            {type === 'puntos' ? `+${log.puntos}` : `-${log.kg_co2}kg`}
                        </Text>
                    </Flex>
                </Box>
            </Box>
        </Flex>
    );
};

export const UserImpactTab = ({ logs }: UserImpactTabProps) => {
    // Combinar logs y ordenar por fecha descendente
    const allLogs = [
        ...(logs.puntos || []).map((l: any) => ({ ...l, type: 'puntos', date: new Date(l.created_at) })),
        ...(logs.co2 || []).map((l: any) => ({ ...l, type: 'co2', date: new Date(l.created_at) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <Box px={2}>
            <Heading size="xs" textTransform="uppercase" color="gray.400" mb={8} fontWeight="900" letterSpacing="widest">
                Línea de Tiempo de Actividad
            </Heading>

            <VStack
                align="stretch"
                spacing={0}
                maxH="600px"
                overflowY="auto"
                pr={4}
                sx={{
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { bg: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bg: 'gray.200', borderRadius: 'full' },
                }}
            >
                {allLogs.length > 0 ? (
                    allLogs.map((log, index) => (
                        <TimelineItem
                            key={`${log.type}-${log.id}`}
                            log={log}
                            type={log.type}
                            isLast={index === allLogs.length - 1}
                        />
                    ))
                ) : (
                    <Center py={20} flexDirection="column">
                        <Icon as={HiLightningBolt} boxSize={10} color="gray.300" mb={4} />
                        <Text color="gray.400" fontWeight="bold">Sin actividad registrada aún.</Text>
                    </Center>
                )}
            </VStack>
        </Box>
    );
};
