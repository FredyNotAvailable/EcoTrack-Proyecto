import {
    Box,
    Heading,
    Text,
    VStack,
    Container,
    Icon,
    Spinner,
    Center,
    useToast,
    useDisclosure
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaLeaf } from "react-icons/fa";
import { useState } from "react";
import { PostCard } from "./components/PostCard";
import { CreatePostForm } from "./components/CreatePostForm";
import { EditPostModal } from "./components/EditPostModal";
import { PostDetailModal } from "./components/PostDetailModal";
import { usePostsFeed, useLikePost, useDeletePost } from "../posts/hooks/usePosts";
import { useAuth } from "../auth/AuthContext";
import type { Post } from "../posts/types";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CommunityPage = () => {
    const { user } = useAuth();
    const { data: feedData, isLoading, error } = usePostsFeed();
    const likeMutation = useLikePost();
    const deleteMutation = useDeletePost();
    const toast = useToast();

    // Edit State
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    // Detail/Comments State
    const [viewPostId, setViewPostId] = useState<string | null>(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    // Derived state for reactive updates
    const detailPost = feedData?.data.find((p: Post) => p.id === viewPostId) || null;

    const handleLike = (postId: string, isLiked: boolean) => {
        likeMutation.mutate({ postId, liked: isLiked }, {
            onError: () => {
                toast({
                    title: 'Error al actualizar me gusta',
                    status: 'error',
                    duration: 3000,
                });
            }
        });
    };

    const handleEdit = (postId: string) => {
        const post = feedData?.data.find((p: Post) => p.id === postId);
        if (post) {
            setEditingPost(post);
            onEditOpen();
        }
    };

    const handleCommentClick = (postId: string) => {
        setViewPostId(postId);
        onDetailOpen();
    };

    const handleDelete = (postId: string) => {
        if (confirm("¿Estás seguro de eliminar esta publicación?")) {
            deleteMutation.mutate(postId, {
                onSuccess: () => {
                    toast({
                        title: 'Publicación eliminada',
                        status: 'success',
                        duration: 3000,
                    });
                    if (viewPostId === postId) {
                        onDetailClose();
                        setViewPostId(null);
                    }
                },
                onError: () => {
                    toast({
                        title: 'Error al eliminar publicación',
                        status: 'error',
                        duration: 3000,
                    });
                }
            });
        }
    };

    if (isLoading) {
        return (
            <Center minH="100vh" bg="brand.bgBody">
                <Spinner size="xl" color="brand.primary" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center minH="100vh" bg="brand.bgBody">
                <Text color="red.500">Error al cargar el feed.</Text>
            </Center>
        );
    }

    const posts = feedData?.data || [];

    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={20} bg="brand.bgBody" minH="100vh">
            {/* Header Section */}
            <Container maxW="container.sm" px={{ base: 4, md: 0 }}>
                <CreatePostForm />

                <VStack spacing={8} align="stretch">
                    {posts.map((post: Post) => (
                        <PostCard
                            key={post.id}
                            id={post.id}
                            user={{
                                name: post.user?.username || 'Usuario',
                                avatar: post.user?.avatar_url || '',
                                verified: post.user?.is_verified,
                                location: post.ubicacion
                            }}
                            content={{
                                image: post.media_url,
                                text: post.descripcion,
                                hashtags: post.hashtags,
                                timeAgo: new Date(post.created_at).toLocaleDateString()
                            }}
                            stats={{
                                likes: post._count?.likes || 0,
                                comments: post._count?.comments || 0,
                                likedBy: []
                            }}
                            isLiked={post.liked_by_me}
                            isOwner={user?.id === post.user_id}
                            onLike={(id) => handleLike(id, post.liked_by_me)}
                            onComment={() => handleCommentClick(post.id)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    {posts.length === 0 && (
                        <Box textAlign="center" py={10}>
                            <Icon as={FaLeaf} color="brand.primary" fontSize="3xl" mb={4} opacity={0.3} />
                            <Text color="gray.400" fontSize="sm">No hay publicaciones aún</Text>
                        </Box>
                    )}
                </VStack>
            </Container>

            {/* Edit Modal */}
            {editingPost && (
                <EditPostModal
                    isOpen={isEditOpen}
                    onClose={() => {
                        onEditClose();
                        setEditingPost(null);
                    }}
                    post={editingPost}
                />
            )}

            {/* Detail/Comments Modal */}
            {detailPost && (
                <PostDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => {
                        onDetailClose();
                        setViewPostId(null);
                    }}
                    post={detailPost}
                    onEdit={() => handleEdit(detailPost.id)}
                    onDelete={() => handleDelete(detailPost.id)}
                />
            )}
        </Box>
    );
};

export default CommunityPage;
