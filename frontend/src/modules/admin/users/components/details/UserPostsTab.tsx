import { SimpleGrid, Box, Center, Icon, Text, Image, HStack, Badge, useColorModeValue, Flex, AspectRatio } from '@chakra-ui/react';
import { HiClock, HiHeart, HiChat, HiPhotograph } from 'react-icons/hi';
import { EmptyState } from '../../../shared/EmptyState';
import { motion } from 'framer-motion';

interface UserPostsTabProps {
    posts: any[];
    onPostClick: (post: any) => void;
}

const MotionBox = motion(Box);

export const UserPostsTab = ({ posts, onPostClick }: UserPostsTabProps) => {
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const cardBg = useColorModeValue('white', 'gray.800');

    if (posts.length === 0) {
        return (
            <EmptyState
                title="Sin Publicaciones"
                description="El usuario aún no ha compartido contenido en la comunidad."
                icon={HiPhotograph}
            />
        );
    }

    return (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
            {posts.map((post: any, index: number) => (
                <MotionBox
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    cursor="pointer"
                    onClick={() => onPostClick(post)}
                    borderRadius="2xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={borderColor}
                    bg={cardBg}
                    position="relative"
                    whileHover={{ y: -4, shadow: 'xl' }}
                >
                    <AspectRatio ratio={4 / 3}>
                        <Box bg="gray.100" position="relative">
                            {post.media?.[0]?.media_url ? (
                                <Image
                                    src={post.media[0].media_url}
                                    w="full"
                                    h="full"
                                    objectFit="cover"
                                    fallback={<Center h="full" bg="gray.100"><Icon as={HiPhotograph} color="gray.300" boxSize={8} /></Center>}
                                />
                            ) : (
                                <Center h="full" color="gray.300" bg="gray.50">
                                    <Icon as={HiPhotograph} boxSize={10} />
                                </Center>
                            )}
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                bg="blackAlpha.300"
                                opacity={0}
                                transition="opacity 0.2s"
                                _groupHover={{ opacity: 1 }}
                            />
                            {post.is_reported && (
                                <Badge
                                    position="absolute"
                                    top={3}
                                    right={3}
                                    colorScheme="red"
                                    variant="solid"
                                    borderRadius="full"
                                    px={3}
                                    boxShadow="md"
                                >
                                    Reportado
                                </Badge>
                            )}
                        </Box>
                    </AspectRatio>

                    <Box p={5}>
                        <Text fontWeight="600" noOfLines={2} fontSize="sm" mb={4} color="gray.700" lineHeight="tall">
                            {post.descripcion || <Text as="span" color="gray.400" fontStyle="italic">Sin descripción...</Text>}
                        </Text>

                        <Flex justify="space-between" align="center" fontSize="xs" color="gray.500">
                            <HStack spacing={1}>
                                <Icon as={HiClock} />
                                <Text fontWeight="500">{new Date(post.created_at).toLocaleDateString()}</Text>
                            </HStack>

                            <HStack spacing={3}>
                                <HStack spacing={1} color="pink.500">
                                    <Icon as={HiHeart} />
                                    <Text fontWeight="bold">{post.likes || 0}</Text>
                                </HStack>
                                <HStack spacing={1} color="blue.500">
                                    <Icon as={HiChat} />
                                    <Text fontWeight="bold">{post.comments || 0}</Text>
                                </HStack>
                            </HStack>
                        </Flex>
                    </Box>
                </MotionBox>
            ))}
        </SimpleGrid>
    );
};
