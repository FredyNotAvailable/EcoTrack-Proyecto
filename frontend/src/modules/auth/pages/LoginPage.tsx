import {
    Box,
    Container,
    Flex,
} from '@chakra-ui/react';
import { AuthForm } from '../components/AuthForm';

const LoginPage = () => {
    return (
        <Box
            minH="100vh"
            bg="brand.bgBody"
            py={{ base: 10, md: 20 }}
            display="flex"
            alignItems="center"
        >
            <Container maxW="container.xl">
                <Flex justify="center" align="center" w="100%">
                    <AuthForm />
                </Flex>
            </Container>
        </Box>
    );
};

export default LoginPage;
