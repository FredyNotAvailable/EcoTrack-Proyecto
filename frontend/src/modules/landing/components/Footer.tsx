import {
    Box,
    Container,
    Stack,
    Text,
    Heading,
    HStack,
    SimpleGrid,
    Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const ListHeader = ({ children }: { children: ReactNode }) => {
    return (
        <Text fontWeight={'900'} fontSize={'lg'} mb={4} color="brand.secondary">
            {children}
        </Text>
    );
};

const FooterLink = ({ to, children }: { to: string; children: ReactNode }) => (
    <Box
        as={RouterLink}
        to={to}
        color="brand.textMuted"
        fontSize="sm"
        fontWeight="500"
        _hover={{ color: 'brand.primary' }}
    >
        {children}
    </Box>
);

export const Footer = () => {
    return (
        <Box
            bg="brand.bgCardLight"
            color="brand.textMain"
            borderTop="1px solid"
            borderColor="rgba(0,0,0,0.05)"
        >
            <Container as={Stack} maxW={'container.xl'} py={10}>
                <SimpleGrid
                    templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
                    spacing={8}>
                    <Stack spacing={6}>
                        <HStack spacing={2}>
                            <Image src="/logo.png" alt="EcoTrack" boxSize="24px" objectFit="contain" />
                            <Heading
                                fontSize="1.5rem"
                                fontWeight="900"
                                bgGradient="linear(to-r, brand.primary, brand.accent)"
                                bgClip="text"
                                letterSpacing="-0.5px"
                            >
                                EcoTrack
                            </Heading>
                        </HStack>
                        <Text fontSize={'sm'} color="brand.textMuted" maxW="300px" fontWeight="500" lineHeight="1.6">
                            Liderando la transición hacia un estilo de vida más consciente y sostenible a través de la gamificación y la comunidad.
                        </Text>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Producto</ListHeader>
                        <FooterLink to="/landing#how-it-works">Cómo funciona</FooterLink>
                        <FooterLink to="/landing#impact">Características</FooterLink>
                        <FooterLink to="/landing#community">Comunidad</FooterLink>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Compañía</ListHeader>
                        <FooterLink to="/sobre-nosotros">Sobre nosotros</FooterLink>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Legal</ListHeader>
                        <FooterLink to="/terminos">Términos y condiciones</FooterLink>
                        <FooterLink to="/privacidad">Privacidad</FooterLink>
                    </Stack>
                </SimpleGrid>
            </Container>
            <Box py={6} borderTop="1px solid" borderColor="rgba(0,0,0,0.05)">
                <Container maxW="container.xl">
                    <Text textAlign="center" fontSize={'sm'} color="brand.textMuted" fontWeight="600">
                        © {new Date().getFullYear()} EcoTrack. Hecho con 💚 por el planeta.
                    </Text>
                </Container>
            </Box>
        </Box>
    );
};
