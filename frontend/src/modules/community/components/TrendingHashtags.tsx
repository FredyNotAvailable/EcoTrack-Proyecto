import {
    Box,
    VStack,
    Text,
    HStack,
    Badge,
    Icon,
    Skeleton,
    Flex,
    useColorModeValue,
    Button
} from '@chakra-ui/react';
import { FaHashtag, FaFire } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import { PostsService } from '../../posts/services/posts.service';

interface TrendingHashtagsProps {
    onSelectHashtag: (hashtag: string) => void;
    selectedHashtag?: string | null;
}

export const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ onSelectHashtag, selectedHashtag }) => {
    const { data: trending, isLoading } = useQuery({
        queryKey: ['trendingHashtags'],
        queryFn: () => PostsService.getPopularHashtags(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const bgColor = useColorModeValue('white', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const activeBg = "linear-gradient(135deg, brand.primary, #48BB78)";

    if (isLoading) {
        return <Skeleton height="250px" borderRadius="32px" />;
    }

    if (!trending || trending.length === 0) return null;

    const topHashtags = trending.slice(0, 5);

    return (
        <Box
            bg={bgColor}
            p={5}
            borderRadius="32px"
            border="1px solid rgba(0,0,0,0.03)"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
            mb={6}
        >
            <Flex align="center" mb={4} gap={2}>
                <Icon as={FaFire} color="orange.400" fontSize="xl" />
                <Text fontWeight="800" fontSize="lg" color="brand.secondary">Tendencias Globales</Text>
            </Flex>

            <VStack align="stretch" spacing={2}>
                {topHashtags.map((item: { hashtag: string; count: number }) => {
                    const isActive = selectedHashtag === item.hashtag;
                    return (
                        <Flex
                            key={item.hashtag}
                            align="center"
                            justify="space-between"
                            p={3}
                            borderRadius="xl"
                            cursor="pointer"
                            bg={isActive ? activeBg : 'transparent'}
                            color={isActive ? "white" : 'inherit'}
                            _hover={{ 
                                bg: isActive ? activeBg : hoverBg,
                                transform: 'translateY(-2px)',
                                boxShadow: 'md'
                            }}
                            onClick={() => onSelectHashtag(item.hashtag)}
                            transition="all 0.2s ease-out"
                            boxShadow={isActive ? 'lg' : 'none'}
                        >
                            <HStack spacing={3}>
                                <Icon
                                    as={FaHashtag}
                                    fontSize="sm"
                                    color={isActive ? "white" : "brand.primary"}
                                    opacity={isActive ? 1 : 0.7}
                                />
                                <Text fontWeight={isActive ? "700" : "600"} fontSize="sm">
                                    {item.hashtag}
                                </Text>
                            </HStack>
                            <Badge
                                borderRadius="full"
                                colorScheme={isActive ? 'whiteAlpha' : 'green'}
                                variant={isActive ? 'solid' : 'subtle'}
                                fontSize="xs"
                                px={2.5}
                                py={0.5}
                            >
                                {item.count}
                            </Badge>
                        </Flex>
                    );
                })}
            </VStack>

            {selectedHashtag && (
                <Button
                    mt={4}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    width="100%"
                    onClick={() => onSelectHashtag('')}
                >
                    Limpiar filtro
                </Button>
            )}
        </Box>
    );
};
