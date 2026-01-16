import {
    Box,
    Button,
    Container,
    Heading,
    Stack,
    Text,
    Flex,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaEnvira, FaGlobeAmericas } from 'react-icons/fa';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

export const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <Box width="100%" pt={{ base: 10, md: 24 }} pb={{ base: 16, md: 32 }}>
            <Container maxW="container.xl">
                <Stack direction={{ base: 'column', md: 'row' }} spacing={10} align="center">
                    <Stack flex={1} spacing={{ base: 5, md: 8 }} textAlign={{ base: 'center', md: 'left' }}>
                        <Badge
                            bg="brand.bgCardLight"
                            color="brand.primary"
                            px={4}
                            py={1.5}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="900"
                            textTransform="uppercase"
                            letterSpacing="1px"
                            w="fit-content"
                            mx={{ base: 'auto', md: '0' }}
                        >
                            Actúa Hoy Por El Mañana
                        </Badge>
                        <Heading
                            fontWeight={900}
                            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                            lineHeight="1.1"
                            color="brand.secondary"
                        >
                            Tu impacto cuenta: <br />
                            <Text
                                as="span"
                                bgGradient="linear(to-r, brand.primary, brand.accent)"
                                bgClip="text"
                            >
                                Transforma tus hábitos
                            </Text>
                        </Heading>
                        <Text color="brand.textMuted" fontSize="lg" maxW="lg" fontWeight="500" lineHeight="1.6" mx={{ base: 'auto', md: '0' }}>
                            EcoTrack es la plataforma que te ayuda a medir y reducir tu huella ambiental a través de retos divertidos y una comunidad activa.
                        </Text>
                        <Stack
                            direction={{ base: 'column', sm: 'row' }}
                            spacing={4}
                            justify={{ base: 'center', md: 'flex-start' }}
                        >
                            <Button
                                size="lg"
                                bg="brand.primary"
                                color="white"
                                px={10}
                                height="60px"
                                borderRadius="full"
                                fontSize="md"
                                fontWeight="800"
                                rightIcon={<Icon as={FaArrowRight} />}
                                onClick={() => navigate('/register')}
                                _hover={{
                                    bg: 'brand.primaryHover',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 20px 40px -10px rgba(53, 122, 98, 0.3)'
                                }}
                            >
                                Empezar ahora
                            </Button>
                            <Button
                                as="a"
                                href="#how-it-works"
                                size="lg"
                                variant="ghost"
                                color="brand.secondary"
                                px={8}
                                height="60px"
                                borderRadius="full"
                                fontSize="md"
                                fontWeight="800"
                            >
                                Saber más
                            </Button>
                        </Stack>
                    </Stack>

                    <Flex
                        flex={1}
                        justify="center"
                        position="relative"
                        display={{ base: 'none', lg: 'flex' }}
                    >
                        <Box
                            position="relative"
                            h="400px"
                            w="400px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                as={FaEnvira}
                                position="absolute"
                                fontSize="15rem"
                                color="brand.bgCardLight"
                                zIndex={0}
                            />
                            <Box
                                zIndex={2}
                                animation={`${float} 3s ease-in-out infinite`}
                            >
                                <Icon as={FaGlobeAmericas} fontSize="8rem" color="brand.primary" />
                            </Box>

                            {/* Floating Badges */}
                            <Box
                                position="absolute"
                                top="15%"
                                right="5%"
                                bg="white"
                                p={4}
                                borderRadius="24px"
                                boxShadow="xl"
                                animation={`${float} 4s ease-in-out infinite`}
                            >
                                <Text fontWeight="900" color="brand.primary">-12kg CO₂</Text>
                            </Box>
                            <Box
                                position="absolute"
                                bottom="20%"
                                left="5%"
                                bg="white"
                                p={4}
                                borderRadius="24px"
                                boxShadow="xl"
                                animation={`${float} 3.5s ease-in-out infinite 1s`}
                            >
                                <Text fontWeight="900" color="brand.secondary">🌟 Nivel 10</Text>
                            </Box>
                        </Box>
                    </Flex>
                </Stack>
            </Container>
        </Box>
    );
};
