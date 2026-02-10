import { useState } from 'react';
import {
    Container,
    VStack,
    useDisclosure,
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    HStack,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import { HiSearch } from 'react-icons/hi';
import { PostStats } from './components/PostStats';
import { PostTable } from './components/PostTable';
import { PostDetailModal } from './components/PostDetailModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';

export const AdminPostsPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Data Fetching
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['admin', 'posts'],
        queryFn: AdminAPIService.getPosts,
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: AdminAPIService.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
            toast({ title: 'Publicación eliminada', status: 'success', duration: 3000 });
            onClose();
        },
        onError: () => toast({ title: 'Error al eliminar', status: 'error' })
    });

    const dismissMutation = useMutation({
        mutationFn: AdminAPIService.dismissPostReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
            toast({ title: 'Reporte descartado', status: 'success', duration: 3000 });
        },
        onError: () => toast({ title: 'Error al descartar reporte', status: 'error' })
    });

    const handleViewDetail = (post: any) => {
        setSelectedPost(post);
        onOpen();
    };

    const handleDeletePost = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleDismissReport = (id: string) => {
        dismissMutation.mutate(id);
    };

    // Filter Logic
    const filteredPosts = posts.filter((post: any) => {
        const matchesSearch =
            post.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
            filterType === 'all' ||
            (filterType === 'reported' && post.is_reported) ||
            (filterType === 'image' && post.media) ||
            (filterType === 'text' && !post.media);

        return matchesSearch && matchesType;
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="full" py={4} px={{ base: 0, md: 4 }}>
            <VStack spacing={8} align="stretch">

                <PostStats posts={posts} />

                {/* Filtros */}
                <Box
                    p={4}
                    bg={bg}
                    borderRadius="2xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <HStack spacing={4}>
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none">
                                <HiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por contenido o usuario..."
                                borderRadius="xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            borderRadius="xl"
                            maxW="200px"
                        >
                            <option value="all">Ver todos</option>
                            <option value="reported">Reportados</option>
                            <option value="image">Con imágenes</option>
                            <option value="text">Solo texto</option>
                        </Select>
                    </HStack>
                </Box>

                <PostTable
                    posts={filteredPosts}
                    isLoading={isLoading}
                    onViewDetail={handleViewDetail}
                    onDelete={handleDeletePost}
                    onDismissReport={handleDismissReport}
                />
            </VStack>

            <PostDetailModal
                isOpen={isOpen}
                onClose={onClose}
                post={selectedPost}
                onDismissReport={handleDismissReport}
            />
        </Container>
    );
};
