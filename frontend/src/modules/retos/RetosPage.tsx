import { SimpleGrid, Box, Text, Heading, Button, Badge, VStack, Skeleton } from '@chakra-ui/react';
import { useRetos } from './useRetos';

const RetosPage = () => {
    const { retos, isLoading, joinReto, isJoining } = useRetos();

    if (isLoading) {
        return (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {[1, 2, 3].map((i) => <Skeleton key={i} height="200px" borderRadius="lg" />)}
            </SimpleGrid>
        );
    }

    return (
        <VStack align="stretch" spacing={6}>
            <Heading size="lg" color="eco.700">Explora Retos Ecológicos</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {retos?.map((reto) => (
                    <Box
                        key={reto.id}
                        p={6}
                        bg="white"
                        shadow="md"
                        borderRadius="lg"
                        borderLeft="4px solid"
                        borderLeftColor="eco.500"
                    >
                        <Heading size="md" mb={2}>{reto.titulo}</Heading>
                        <Text color="gray.600" mb={4}>{reto.descripcion}</Text>
                        <Badge colorScheme="green" mb={4}>{reto.puntos} Puntos</Badge>
                        <Button
                            w="full"
                            colorScheme="eco"
                            onClick={() => joinReto(reto.id)}
                            isLoading={isJoining}
                        >
                            Unirse al Reto
                        </Button>
                    </Box>
                ))}
            </SimpleGrid>
        </VStack>
    );
};

export default RetosPage;
