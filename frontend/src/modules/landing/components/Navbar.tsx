import {
    Box,
    Flex,
    Button,
    Stack,
    Container,
    Icon,
    Heading,
    HStack,
    Link as ChakraLink
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaEnvira } from 'react-icons/fa';

export const Navbar = () => {

    return (
        <Box
            position="sticky"
            top={0}
            zIndex={100}
            w="100%"
            bg="rgba(253, 252, 248, 0.8)"
            backdropFilter="blur(10px)"
            borderBottom="1px solid"
            borderColor="rgba(0,0,0,0.05)"
        >
            <Container maxW="container.xl">
                <Flex
                    h="80px"
                    py={{ base: 2 }}
                    px={{ base: 4 }}
                    align={'center'}
                    justify={'space-between'}
                >
                    <HStack
                        as={RouterLink}
                        to="/"
                        spacing={2}
                        _hover={{ transform: 'scale(1.02)' }}
                        transition="all 0.2s"
                    >
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

                    <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                        <DesktopNav />
                    </Flex>

                    <Stack
                        flex={{ base: 1, md: 0 }}
                        justify={'flex-end'}
                        direction={'row'}
                        spacing={6}
                        align="center"
                    >
                        <Button
                            as={RouterLink}
                            to="/login"
                            fontSize={'sm'}
                            fontWeight={600}
                            variant={'ghost'}
                            color="brand.textMain"
                            _hover={{
                                bg: 'brand.bgCardLight',
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                        <Button
                            as={RouterLink}
                            to="/login"
                            display={{ base: 'none', md: 'inline-flex' }}
                            fontSize={'sm'}
                            fontWeight={700}
                            bg={'brand.primary'}
                            color={'white'}
                            px={6}
                            borderRadius="full"
                            _hover={{
                                bg: 'brand.primaryHover',
                                transform: 'translateY(-2px)',
                                boxShadow: 'lg',
                            }}
                        >
                            Unirme ahora
                        </Button>
                    </Stack>
                </Flex>
            </Container>
        </Box>
    );
};

const DesktopNav = () => {
    const navItems = [
        { label: 'Cómo funciona', href: '#how-it-works' },
        { label: 'Impacto', href: '#impact' },
        { label: 'Comunidad', href: '#community' },
    ];

    return (
        <Stack direction={'row'} spacing={8}>
            {navItems.map((navItem) => (
                <ChakraLink
                    key={navItem.label}
                    href={navItem.href}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'brand.textMuted'}
                    _hover={{
                        textDecoration: 'none',
                        color: 'brand.primary',
                    }}
                    transition="all 0.2s"
                >
                    {navItem.label}
                </ChakraLink>
            ))}
        </Stack>
    );
};
