import {
    Container,
    Stack,
    Box,
    Heading,
    Text,
    Button,
    Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaEnvira } from 'react-icons/fa';

export const CallToAction = () => {
    const navigate = useNavigate();

    return (
        <Container maxW={'container.xl'} py={20}>
            <Box
                bgGradient="linear(135deg, brand.primary 0%, brand.secondary 100%)"
                borderRadius="40px"
                p={{ base: 8, md: 20 }}
                position="relative"
                overflow="hidden"
                boxShadow="2xl"
            >
                {/* Decorative background icon */}
                <Icon
                    as={FaEnvira}
                    position="absolute"
                    right="-50px"
                    bottom="-50px"
                    fontSize="20rem"
                    color="whiteAlpha.100"
                    transform="rotate(-15deg)"
                />

                <Stack spacing={8} maxW="3xl" position="relative" zIndex={1}>
                    <Heading
                        lineHeight={1.1}
                        fontWeight={900}
                        fontSize={{ base: '3xl', md: '5xl' }}
                        color="white"
                    >
                        ¿Listo para liderar el cambio positivo?
                    </Heading>
                    <Text color={'whiteAlpha.900'} fontSize="lg" fontWeight="500" lineHeight="1.6">
                        No esperes más para ser parte de la solución. Cada pequeña acción
                        cuenta y en EcoTrack te ayudamos a visualizar el impacto real de tus
                        decisiones diarias.
                    </Text>
                    <Stack
                        spacing={4}
                        direction={{ base: 'column', sm: 'row' }}
                    >
                        <Button
                            size={'lg'}
                            bg={'white'}
                            color={'brand.primary'}
                            px={10}
                            height="60px"
                            borderRadius="full"
                            fontSize="md"
                            fontWeight="800"
                            rightIcon={<Icon as={FaArrowRight} />}
                            onClick={() => navigate('/login')}
                            _hover={{
                                bg: 'whiteAlpha.900',
                                transform: 'translateY(-3px)',
                                boxShadow: 'xl'
                            }}
                        >
                            Crear cuenta gratis
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Container>
    );
};
