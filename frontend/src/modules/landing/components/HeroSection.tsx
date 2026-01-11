import {
    Box,
    Button,
    Container,
    Heading,
    Stack,
    Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export const HeroSection = () => {
    return (
        <Container maxW={'3xl'}>
            <Stack
                as={Box}
                textAlign={'center'}
                spacing={{ base: 8, md: 14 }}
                py={{ base: 20, md: 36 }}
            >
                <Heading
                    fontWeight={600}
                    fontSize={{ base: '4xl', md: '6xl' }}
                    lineHeight={'110%'}
                >
                    Salva el planeta <br />
                    <Text as={'span'} color={'eco.500'}>
                        mientras juegas
                    </Text>
                </Heading>
                <Text color={'gray.500'}>
                    EcoTrack es la plataforma que gamifica tu impacto ecológico.
                    Completa retos diarios, reduce tu huella de carbono y compite
                    en una comunidad dedicada a un futuro más verde.
                </Text>
                <Stack
                    direction={'column'}
                    spacing={3}
                    align={'center'}
                    alignSelf={'center'}
                    position={'relative'}
                >
                    <Button
                        as={RouterLink}
                        to="/login"
                        colorScheme={'eco'}
                        bg={'eco.500'}
                        rounded={'full'}
                        px={10}
                        size="lg"
                        _hover={{
                            bg: 'eco.600',
                        }}
                    >
                        Empezar ahora
                    </Button>
                    <Button variant={'link'} colorScheme={'blue'} size={'sm'}>
                        Saber más
                    </Button>
                </Stack>
            </Stack>
        </Container>
    );
};
