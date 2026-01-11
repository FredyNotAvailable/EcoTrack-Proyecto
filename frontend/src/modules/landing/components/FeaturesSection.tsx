import {
    Box,
    SimpleGrid,
    Icon,
    Text,
    Stack,
    Flex,
    Container,
    Heading,
} from '@chakra-ui/react';
import { FaLeaf, FaChartBar, FaUsers } from 'react-icons/fa';

interface FeatureProps {
    title: string;
    text: string;
    icon: React.ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    return (
        <Stack align={'center'} textAlign={'center'}>
            <Flex
                w={16}
                h={16}
                align={'center'}
                justify={'center'}
                color={'white'}
                rounded={'full'}
                bg={'eco.500'}
                mb={1}
            >
                {icon}
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            <Text color={'gray.600'}>{text}</Text>
        </Stack>
    );
};

export const FeaturesSection = () => {
    return (
        <Box p={4} bg="gray.50">
            <Container maxW={'6xl'} py={16}>
                <Heading textAlign="center" mb={10} color="eco.700"> ¿Por qué EcoTrack? </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <Feature
                        icon={<Icon as={FaLeaf} w={10} h={10} />}
                        title={'Retos Diarios'}
                        text={
                            'Acciones simples que generan un gran cambio. Desde reciclar hasta reducir el consumo de plástico.'
                        }
                    />
                    <Feature
                        icon={<Icon as={FaChartBar} w={10} h={10} />}
                        title={'Mide tu Impacto'}
                        text={
                            'Visualiza cuántos kg de CO2 has evitado emitir a través de tus acciones sostenibles.'
                        }
                    />
                    <Feature
                        icon={<Icon as={FaUsers} w={10} h={10} />}
                        title={'Comunidad'}
                        text={
                            'Conéctate con otros guardines del planeta, comparte tus logros y escala en el ranking.'
                        }
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
};
