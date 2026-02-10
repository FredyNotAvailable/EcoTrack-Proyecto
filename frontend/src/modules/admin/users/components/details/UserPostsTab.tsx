import { SimpleGrid, Box, Center, VStack, Icon, Text, Image, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import { HiCollection, HiClock } from 'react-icons/hi';

interface UserPostsTabProps {
    posts: any[];
    onPostClick: (post: any) => void;
}

export const UserPostsTab = ({ posts, onPostClick }: UserPostsTabProps) => {
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            {posts.length > 0 ? posts.map((post: any) => (
                <Box
                    key={post.id}
                    cursor="pointer"
                    onClick={() => onPostClick(post)}
                    borderRadius="2xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={borderColor}
                    bg={cardBg}
                    transition="all 0.3s"
                    _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
                >
                    <Box h="200px" bg="gray.100" position="relative">
                        {post.media?.[0]?.media_url ? (
                            <Image
                                src={post.media[0].media_url}
                                w="full"
                                h="full"
                                objectFit="cover"
                            />
                        ) : (
                            <Center h="full" color="gray.300">
                                <Icon as={HiCollection} boxSize={10} />
                            </Center>
                        )}
                        {post.is_reported && (
                            <Badge position="absolute" top={2} left={2} colorScheme="red" variant="solid">Reportado</Badge>
                        )}
                    </Box>
                    <Box p={4}>
                        <Text fontWeight="bold" noOfLines={2} fontSize="sm" mb={3}>
                            {post.descripcion || 'Imagen sin descripción'}
                        </Text>
                        <HStack justify="space-between" color="gray.500" fontSize="xs">
                            <HStack><Icon as={HiClock} /><Text>{new Date(post.created_at).toLocaleDateString()}</Text></HStack>
                            <HStack spacing={3}>
                                <Text fontWeight="bold" color="brand.500">{post.likes || 0} <span style={{ fontWeight: 'normal', color: 'gray' }}>Likes</span></Text>
                                <Text fontWeight="bold" color="blue.500">{post.comments || 0} <span style={{ fontWeight: 'normal', color: 'gray' }}>Coment.</span></Text>
                            </HStack>
                        </HStack>
                    </Box>
                </Box>
            )) : (
                <Center py={20} gridColumn="span 3" color="gray.500">
                    <VStack>
                        <Icon as={HiCollection} boxSize={10} />
                        <Text>El usuario no ha publicado nada todavía.</Text>
                    </VStack>
                </Center>
            )}
        </SimpleGrid>
    );
};
