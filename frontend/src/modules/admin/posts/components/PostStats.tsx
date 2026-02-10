import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Box,
    useColorModeValue,
    Icon,
    Flex,
} from '@chakra-ui/react';
import { HiOutlinePhotograph, HiOutlineHeart, HiOutlineAnnotation } from 'react-icons/hi';

interface PostStatsProps {
    posts: any[];
}

export const PostStats = ({ posts }: PostStatsProps) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    const totalPosts = posts.length;
    const reportedPosts = posts.filter(p => p.is_reported).length;
    const mediaPosts = posts.filter(p => p.media).length;
    const totalInteractions = posts.reduce((acc, p) => acc + (p.likes || 0) + (p.comments || 0), 0);

    const stats = [
        {
            label: 'Total Publicaciones',
            value: totalPosts.toLocaleString(),
            help: 'Posts activos',
            icon: HiOutlineAnnotation,
            color: 'blue.500',
            trend: 'increase'
        },
        {
            label: 'Reportados',
            value: reportedPosts.toLocaleString(),
            help: 'Requieren revisión',
            icon: HiOutlineAnnotation,
            color: 'orange.500',
            trend: reportedPosts > 0 ? 'increase' : 'decrease'
        },
        {
            label: 'Contenido Media',
            value: mediaPosts.toLocaleString(),
            help: 'Imágenes y videos',
            icon: HiOutlinePhotograph,
            color: 'green.500',
            trend: 'increase'
        },
        {
            label: 'Interacciones',
            value: totalInteractions > 1000 ? `${(totalInteractions / 1000).toFixed(1)}k` : totalInteractions.toString(),
            help: 'Likes y comentarios',
            icon: HiOutlineHeart,
            color: 'red.500',
            trend: 'increase'
        }
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
                <Box
                    key={index}
                    p={5}
                    bg={cardBg}
                    borderRadius="2xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="sm"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
                >
                    <Stat>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <StatLabel color="gray.500" fontWeight="medium" fontSize="sm">
                                    {stat.label}
                                </StatLabel>
                                <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>
                                    {stat.value}
                                </StatNumber>
                            </Box>
                            <Flex
                                p={2}
                                bg={`${stat.color.split('.')[0]}.50`}
                                borderRadius="xl"
                                color={stat.color}
                            >
                                <Icon as={stat.icon} boxSize={6} />
                            </Flex>
                        </Flex>
                        <StatHelpText mb={0} mt={2} fontSize="xs">
                            <StatArrow type={stat.trend as 'increase' | 'decrease'} />
                            {stat.help}
                        </StatHelpText>
                    </Stat>
                </Box>
            ))}
        </SimpleGrid>
    );
};
