import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    SimpleGrid,
    Icon,
    Flex,
    useColorModeValue,
} from '@chakra-ui/react';
import { FaUsers, FaGlobeAmericas, FaHandsHelping } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface CommunityFeatureProps {
    title: string;
    text: string;
    icon: IconType;
}

const CommunityFeature = ({ title, text, icon }: CommunityFeatureProps) => {
    return (
        <Stack
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            rounded={'3xl'}
            align={'center'}
            textAlign={'center'}
            boxShadow={'xl'}
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.3s ease"
            _hover={{
                transform: 'translateY(-5px)',
                boxShadow: '2xl',
            }}
        >
            <Flex
                w={16}
                h={16}
                align={'center'}
                justify={'center'}
                color={'white'}
                rounded={'2xl'}
                bgGradient="linear(to-br, brand.primary, brand.secondary)"
                mb={4}
                boxShadow="lg"
            >
                <Icon as={icon} boxSize={8} />
            </Flex>
            <Heading as="h4" size="md" fontWeight="800" mb={2} color="brand.secondary">
                {title}
            </Heading>
            <Text color={'brand.textMuted'} fontSize="sm">
                {text}
            </Text>
        </Stack>
    );
};

export const CommunitySection = () => {
    return (
        <Box bg="brand.bgBody" py={24} id="community" position="relative" overflow="hidden">
            {/* Decorative blob */}
            <Box
                position="absolute"
                top="10%"
                right="-5%"
                width="300px"
                height="300px"
                bg="eco.100"
                opacity="0.5"
                filter="blur(80px)"
                borderRadius="full"
                zIndex="0"
            />

            <Container maxW={'container.xl'} position="relative" zIndex="1">
                <Stack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'} mb={16}>
                    <Text
                        color={'brand.primary'}
                        fontWeight={800}
                        fontSize={'sm'}
                        letterSpacing={1.1}
                        textTransform={'uppercase'}
                    >
                        Únete al movimiento
                    </Text>
                    <Heading fontSize={'4xl'} fontWeight="900" color="brand.secondary" lineHeight="1.2">
                        Más que una app, <br />
                        <Text as="span" color="brand.primary">una comunidad global</Text>
                    </Heading>
                    <Text color={'brand.textMuted'} fontSize={'lg'} fontWeight="500" pt={4}>
                        Encuentra inspiración, comparte tus logros y conecta con personas que comparten tu pasión por un planeta más verde.
                    </Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <CommunityFeature
                        icon={FaUsers}
                        title="Conexión Real"
                        text="Interactúa con otros usuarios, comenta sus progresos y encuentra motivación diaria para mantener tus hábitos sostenibles."
                    />
                    <CommunityFeature
                        icon={FaGlobeAmericas}
                        title="Impacto Colectivo"
                        text="Visualiza cómo tus acciones individuales se suman a un esfuerzo global masivo para reducir las emisiones de CO2."
                    />
                    <CommunityFeature
                        icon={FaHandsHelping}
                        title="Inspiración Constante"
                        text="Descubre nuevas formas de cuidar el medio ambiente a través de las experiencias y consejos compartidos por la comunidad."
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
};
