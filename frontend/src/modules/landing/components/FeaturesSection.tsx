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
import type { IconType } from 'react-icons';
import { FaLeaf, FaChartBar, FaUsers } from 'react-icons/fa';

interface FeatureProps {
    title: string;
    text: string;
    icon: IconType;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    return (
        <Stack
            align={'center'}
            textAlign={'center'}
            p={8}
            bg="white"
            borderRadius="32px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
            border="1px solid rgba(0,0,0,0.03)"
            _hover={{ transform: 'translateY(-5px)', boxShadow: '0 20px 40px -10px rgba(31, 64, 55, 0.1)' }}
            transition="all 0.3s"
        >
            <Flex
                w={16}
                h={16}
                align={'center'}
                justify={'center'}
                color={'brand.primary'}
                rounded={'2xl'}
                bg={'brand.bgCardLight'}
                mb={4}
            >
                <Icon as={icon} boxSize={8} />
            </Flex>
            <Text fontWeight={900} fontSize="xl" color="brand.secondary" mb={2}>{title}</Text>
            <Text color={'brand.textMuted'} fontSize="sm" fontWeight="500" lineHeight="1.6">{text}</Text>
        </Stack>
    );
};

export const FeaturesSection = () => {
    return (
        <Box py={24} bg="brand.bgCardWhite" id="impact">
            <Container maxW={'container.xl'}>
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mb={16}>
                    <Heading fontSize={'3xl'} fontWeight="900" color="brand.secondary">
                        ¿Por qué elegir EcoTrack?
                    </Heading>
                    <Text color={'brand.textMuted'} fontSize={'lg'} fontWeight="500">
                        Herramientas diseñadas para que cada acción cuente en la lucha contra el cambio climático.
                    </Text>
                </Stack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <Feature
                        icon={FaLeaf}
                        title={'Retos Diarios'}
                        text={
                            'Acciones simples pero poderosas para tu rutina diaria. Cada reto completado te acerca a un futuro más verde.'
                        }
                    />
                    <Feature
                        icon={FaChartBar}
                        title={'Mide tu Impacto'}
                        text={
                            'Visualiza tu ahorro de CO2 en tiempo real. Entiende el impacto real de tus decisiones diarias.'
                        }
                    />
                    <Feature
                        icon={FaUsers}
                        title={'Comunidad Global'}
                        text={
                            'Conéctate con otros guardianes, comparte tips sostenibles y escala posiciones en el ranking de impacto.'
                        }
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
};
