import {
    Box,
    chakra,
    Container,
    Stack,
    Text,
    VisuallyHidden,
    Icon,
    Heading,
    HStack,
    SimpleGrid,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FaInstagram, FaTwitter, FaYoutube, FaEnvira } from 'react-icons/fa';

const SocialButton = ({
    children,
    label,
    href,
}: {
    children: ReactNode;
    label: string;
    href: string;
}) => {
    return (
        <chakra.button
            bg="brand.bgCardLight"
            rounded={'full'}
            w={10}
            h={10}
            cursor={'pointer'}
            as={'a'}
            href={href}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            transition={'background 0.3s ease'}
            _hover={{
                bg: 'brand.primary',
                color: 'white',
                transform: 'translateY(-3px)'
            }}>
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </chakra.button>
    );
};

const ListHeader = ({ children }: { children: ReactNode }) => {
    return (
        <Text fontWeight={'900'} fontSize={'lg'} mb={4} color="brand.secondary">
            {children}
        </Text>
    );
};

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
                            <Icon as={FaEnvira} color="brand.primary" boxSize={6} />
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
                        <Stack direction={'row'} spacing={4}>
                            <SocialButton label={'Twitter'} href={'#'}>
                                <FaTwitter />
                            </SocialButton>
                            <SocialButton label={'YouTube'} href={'#'}>
                                <FaYoutube />
                            </SocialButton>
                            <SocialButton label={'Instagram'} href={'#'}>
                                <FaInstagram />
                            </SocialButton>
                        </Stack>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Producto</ListHeader>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Cómo funciona</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Retos semanales</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Comunidad</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Ranking global</Box>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Compañía</ListHeader>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Sobre nosotros</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Contacto</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Blog</Box>
                    </Stack>
                    <Stack align={'flex-start'}>
                        <ListHeader>Legal</ListHeader>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Términos y condiciones</Box>
                        <Box as="a" href={'#'} color="brand.textMuted" fontSize="sm" fontWeight="500" _hover={{ color: 'brand.primary' }}>Privacidad</Box>
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
