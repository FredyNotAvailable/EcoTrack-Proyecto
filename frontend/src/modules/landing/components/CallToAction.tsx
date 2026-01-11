import {
    Container,
    Stack,
    Flex,
    Box,
    Heading,
    Text,
    Button,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export const CallToAction = () => {
    return (
        <Container maxW={'5xl'} py={12}>
            <Stack
                align={'center'}
                spacing={{ base: 8, md: 10 }}
                py={{ base: 20, md: 28 }}
                direction={{ base: 'column', md: 'row' }}
            >
                <Stack flex={1} spacing={{ base: 5, md: 10 }}>
                    <Heading
                        lineHeight={1.1}
                        fontWeight={600}
                        fontSize={{ base: '3xl', md: '5xl' }}
                    >
                        <Text
                            as={'span'}
                            position={'relative'}
                            _after={{
                                content: "''",
                                width: 'full',
                                height: '30%',
                                position: 'absolute',
                                bottom: 1,
                                left: 0,
                                bg: 'eco.100',
                                zIndex: -1,
                            }}
                        >
                            ¿Listo para el cambio?
                        </Text>
                        <br />
                        <Text as={'span'} color={'eco.500'}>
                            ¡Únete hoy mismo!
                        </Text>
                    </Heading>
                    <Text color={'gray.500'}>
                        No esperes más para ser parte de la solución. Cada pequeña acción
                        cuenta y en EcoTrack te ayudamos a ver el impacto real de tus
                        decisiones diarias.
                    </Text>
                    <Stack
                        spacing={{ base: 4, sm: 6 }}
                        direction={{ base: 'column', sm: 'row' }}
                    >
                        <Button
                            as={RouterLink}
                            to="/login"
                            rounded={'full'}
                            size={'lg'}
                            fontWeight={'normal'}
                            px={6}
                            colorScheme={'eco'}
                            bg={'eco.500'}
                            _hover={{ bg: 'eco.600' }}
                        >
                            Registrarme / Iniciar Sesión
                        </Button>
                    </Stack>
                </Stack>
                <Flex
                    flex={1}
                    justify={'center'}
                    align={'center'}
                    position={'relative'}
                    w={'full'}
                >
                    <Box
                        position={'relative'}
                        height={'300px'}
                        rounded={'2xl'}
                        boxShadow={'2xl'}
                        width={'full'}
                        overflow={'hidden'}
                        bg="eco.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text color="eco.600" fontWeight="bold"> [Imagen Ilustrativa Eco] </Text>
                    </Box>
                </Flex>
            </Stack>
        </Container>
    );
};
