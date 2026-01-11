import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    Card,
    Icon,
    Flex,
    Divider,
    Button,
} from "@chakra-ui/react";
import { FaHeart, FaComment, FaShare, FaLeaf } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const mockPosts = [
    {
        id: 1,
        user: "María S.",
        avatar: "",
        content: "¡Acabo de completar el reto 'Semana sin Plásticos'! 🌿 Se siente genial reducir mi huella de carbono.",
        time: "Hace 2 horas",
        likes: 24,
        comments: 5,
    },
    {
        id: 2,
        user: "Carlos R.",
        avatar: "",
        content: "Hoy fui al trabajo en bicicleta. 🚲 ¡3km recorridos y 0 emisiones!",
        time: "Hace 4 horas",
        likes: 18,
        comments: 2,
    },
    {
        id: 3,
        user: "EcoTrack",
        avatar: "",
        content: "¡Bienvenida a la comunidad, Elena! 🎉 Sigue así y pronto alcanzarás el nivel 2.",
        time: "Hace 6 horas",
        likes: 10,
        comments: 1,
    }
];

const CommunityPage = () => {
    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            <VStack align="start" spacing={2} mb={10}>
                <Heading size="xl" color="brand.secondary">Comunidad EcoTrack</Heading>
                <Text color="brand.textMuted" fontSize="lg">
                    Comparte tus logros y motiva a otros guerreros ambientales. 🌍
                </Text>
            </VStack>

            <VStack spacing={6} maxW="800px" align="stretch">
                {mockPosts.map((post) => (
                    <Card
                        key={post.id}
                        borderRadius="24px"
                        p={6}
                        boxShadow="0 4px 20px rgba(0,0,0,0.05)"
                        border="1px solid"
                        borderColor="gray.100"
                    >
                        <HStack spacing={4} mb={4}>
                            <Avatar name={post.user} size="md" bg="brand.primary" />
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" color="brand.secondary">{post.user}</Text>
                                <Text fontSize="xs" color="brand.textMuted">{post.time}</Text>
                            </VStack>
                        </HStack>

                        <Text color="brand.secondary" mb={6}>
                            {post.content}
                        </Text>

                        <Divider mb={4} />

                        <Flex justify="space-between">
                            <HStack spacing={6}>
                                <Button variant="ghost" size="sm" leftIcon={<Icon as={FaHeart} />} _hover={{ color: "red.400" }}>
                                    {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" leftIcon={<Icon as={FaComment} />} _hover={{ color: "blue.400" }}>
                                    {post.comments}
                                </Button>
                            </HStack>
                            <Button variant="ghost" size="sm" leftIcon={<Icon as={FaShare} />}>
                                Compartir
                            </Button>
                        </Flex>
                    </Card>
                ))}

                <Box textAlign="center" py={10}>
                    <Icon as={FaLeaf} color="brand.primary" fontSize="4xl" mb={4} opacity={0.5} />
                    <Text color="brand.textMuted">No hay más publicaciones por hoy...</Text>
                </Box>
            </VStack>
        </Box>
    );
};

export default CommunityPage;
