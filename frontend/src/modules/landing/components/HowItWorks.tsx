import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Icon,
    Text,
    Stack,
    Flex,
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FaUserPlus, FaTrophy, FaLeaf } from 'react-icons/fa';

interface FeatureProps {
    title: string;
    text: string;
    icon: IconType;
    step: string;
}

const Feature = ({ title, text, icon, step }: FeatureProps) => {
    return (
        <Stack
            align={'center'}
            textAlign="center"
            px={8}
            py={10}
            bg="white"
            borderRadius="32px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.08)"
            border="1px solid rgba(0,0,0,0.03)"
            _hover={{ transform: 'translateY(-10px)', boxShadow: '0 20px 40px -10px rgba(31, 64, 55, 0.12)' }}
            transition="all 0.3s"
            position="relative"
        >
            <Box
                position="absolute"
                top="-15px"
                left="50%"
                transform="translateX(-50%)"
                bg="brand.primary"
                color="white"
                px={4}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="900"
            >
                PASO {step}
            </Box>
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
            <Text fontWeight={900} fontSize="xl" color="brand.secondary" mb={2}>
                {title}
            </Text>
            <Text color={'brand.textMuted'} fontSize="sm" lineHeight="1.6" fontWeight="500">
                {text}
            </Text>
        </Stack>
    );
};

export const HowItWorks = () => {
    return (
        <Box py={24} id="how-it-works">
            <Container maxW={'container.xl'}>
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mb={16}>
                    <Text
                        color={'brand.primary'}
                        fontWeight={800}
                        fontSize={'sm'}
                        letterSpacing={1.1}
                        textTransform={'uppercase'}
                    >
                        El proceso
                    </Text>
                    <Heading fontSize={'3xl'} fontWeight="900" color="brand.secondary">
                        Cómo funciona EcoTrack
                    </Heading>
                    <Text color={'brand.textMuted'} fontSize={'lg'} fontWeight="500">
                        Transformar tus hábitos es más fácil de lo que parece. Sigue estos 3 pasos para empezar tu viaje sostenible.
                    </Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <Feature
                        step="01"
                        icon={FaUserPlus}
                        title={'Únete Gratis'}
                        text={
                            'Crea tu cuenta en segundos y comparte tu nombre, foto y una breve biografía para empezar a formar parte de la comunidad'
                        }
                    />
                    <Feature
                        step="02"
                        icon={FaTrophy}
                        title={'Acepta Retos'}
                        text={
                            'Elige entre docenas de desafíos semanales diseñados para reducir tu huella de carbono de forma divertida.'
                        }
                    />
                    <Feature
                        step="03"
                        icon={FaLeaf}
                        title={'Mide tu Impacto'}
                        text={
                            'Observa cómo cada paso pequeño se traduce en kilos de CO2 ahorrados y puntos de experiencia para tu perfil.'
                        }
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
};
