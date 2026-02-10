import { Table, Thead, Tbody, Tr, Th, Td, Text, Badge, Icon, useColorModeValue } from '@chakra-ui/react';
import { HiLightningBolt } from 'react-icons/hi';

interface UserMissionsTabProps {
    misiones: any[];
}

export const UserMissionsTab = ({ misiones }: UserMissionsTabProps) => {
    return (
        <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                    <Th>Misión</Th>
                    <Th>Fecha</Th>
                    <Th isNumeric>Recompensa</Th>
                </Tr>
            </Thead>
            <Tbody>
                {misiones.length > 0 ? misiones.map((m: any) => (
                    <Tr key={m.id}>
                        <Td>
                            <Text fontWeight="bold" fontSize="sm">{m.misiones_diarias?.titulo}</Text>
                            <Text fontSize="xs" color="gray.500">{m.misiones_diarias?.tipo}</Text>
                        </Td>
                        <Td fontSize="sm">{m.fecha ? new Date(m.fecha).toLocaleDateString() : 'N/A'}</Td>
                        <Td isNumeric>
                            <Badge colorScheme="orange" px={2} borderRadius="full">+{m.misiones_diarias?.puntos} pts</Badge>
                        </Td>
                    </Tr>
                )) : (
                    <Tr><Td colSpan={3} textAlign="center" py={20} color="gray.500">
                        <Icon as={HiLightningBolt} boxSize={8} mb={3} />
                        <Text>No ha completado misiones diarias todavía.</Text>
                    </Td></Tr>
                )}
            </Tbody>
        </Table>
    );
};
