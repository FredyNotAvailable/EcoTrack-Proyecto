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
    Divider
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
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const activeBg = useColorModeValue('brand.primary', 'brand.primary');
    const activeColor = 'white';

    if (isLoading) {
        return <Skeleton height="250px" borderRadius="16px" />;
    }

    if (!trending || trending.length === 0) return null;

    // Limit to top 5 as requested
    const topHashtags = trending.slice(0, 5);

    return (
        <Box
            bg={bgColor}
            p={5}
            borderRadius="16px"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            mb={6}
        >
            <Flex align="center" mb={4} gap={2}>
                <Icon as={FaFire} color="orange.400" />
                <Text fontWeight="bold" fontSize="lg">Trending #EcoTags</Text>
            </Flex>

            <Divider mb={4} />

            <VStack align="stretch" spacing={2}>
                {topHashtags.map((item: { hashtag: string; count: number }) => {
                    const isActive = selectedHashtag === item.hashtag;
                    return (
                        <Flex
                            key={item.hashtag}
                            align="center"
                            justify="space-between"
                            p={2}
                            borderRadius="lg"
                            cursor="pointer"
                            bg={isActive ? activeBg : 'transparent'}
                            color={isActive ? activeColor : 'inherit'}
                            _hover={{ bg: isActive ? activeBg : hoverBg }}
                            onClick={() => onSelectHashtag(item.hashtag)}
                            transition="all 0.2s"
                        >
                            <HStack spacing={3}>
                                <Icon
                                    as={FaHashtag}
                                    fontSize="xs"
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
                                px={2}
                            >
                                {item.count}
                            </Badge>
                        </Flex>
                    );
                })}
            </VStack>

            {selectedHashtag && (
                <Text
                    mt={4}
                    fontSize="xs"
                    color="brand.primary"
                    fontWeight="600"
                    cursor="pointer"
                    textAlign="center"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => onSelectHashtag('')}
                >
                    Limpiar filtro
                </Text>
            )}
        </Box>
    );
};
