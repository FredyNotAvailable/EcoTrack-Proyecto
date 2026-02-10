import { Table, Thead, Tbody, Tr, Th, Td, Text, Badge, Icon, useColorModeValue, Box, Flex } from '@chakra-ui/react';
import { HiLightningBolt, HiCheckCircle } from 'react-icons/hi';
import { EmptyState } from '../../../shared/EmptyState';
import { AnimatePresence, motion } from 'framer-motion';

const MotionTr = motion(Tr);

interface UserMissionsTabProps {
    misiones: any[];
}

export const UserMissionsTab = ({ misiones }: UserMissionsTabProps) => {
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const headerBg = useColorModeValue('gray.50', 'gray.800');

    if (misiones.length === 0) {
        return (
            <EmptyState
                title="Sin Misiones Completadas"
                description="Este usuario aún no ha completado ninguna misión diaria."
                icon={HiLightningBolt}
            />
        );
    }

    return (
        <Box
            borderRadius="3xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            shadow="sm"
        >
            <Table variant="simple">
                <Thead bg={headerBg}>
                    <Tr>
                        <Th py={4} fontSize="xs" fontWeight="900" letterSpacing="widest" textTransform="uppercase">Misión</Th>
                        <Th py={4} fontSize="xs" fontWeight="900" letterSpacing="widest" textTransform="uppercase">Fecha</Th>
                        <Th py={4} isNumeric fontSize="xs" fontWeight="900" letterSpacing="widest" textTransform="uppercase">Recompensa</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <AnimatePresence>
                        {misiones.map((m: any, index: number) => (
                            <MotionTr
                                key={m.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                            >
                                <Td py={4}>
                                    <Flex align="center" gap={3}>
                                        <Icon as={HiCheckCircle} color="green.400" boxSize={5} />
                                        <Box>
                                            <Text fontWeight="800" fontSize="sm" color="gray.700">{m.misiones_diarias?.titulo}</Text>
                                            <Badge fontSize="10px" colorScheme="blue" variant="subtle" borderRadius="md" mt={1}>
                                                {m.misiones_diarias?.tipo || 'GENERAL'}
                                            </Badge>
                                        </Box>
                                    </Flex>
                                </Td>
                                <Td py={4} fontSize="sm" fontWeight="600" color="gray.500">
                                    {m.fecha ? new Date(m.fecha).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Fecha desconocida'}
                                </Td>
                                <Td py={4} isNumeric>
                                    <Badge
                                        colorScheme="orange"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="sm"
                                    >
                                        +{m.misiones_diarias?.puntos} pts
                                    </Badge>
                                </Td>
                            </MotionTr>
                        ))}
                    </AnimatePresence>
                </Tbody>
            </Table>
        </Box>
    );
};
