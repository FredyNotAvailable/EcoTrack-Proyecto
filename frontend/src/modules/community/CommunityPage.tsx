import {
    Box,
    Text,
    VStack,
    Container,
    Icon,
    Spinner,
    Center,
    useToast,
    useDisclosure,
    Grid,
    GridItem,
    Button
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaLeaf } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PostsService } from "../posts/services/posts.service";
import { PostCard } from "./components/PostCard";
import { CreatePostForm } from "./components/CreatePostForm";
import { EditPostModal } from "./components/EditPostModal";
import { PostDetailModal } from "./components/PostDetailModal";
import { usePostsFeed, useLikePost, useDeletePost, useReportPost } from "../posts/hooks/usePosts";
import { useAuth } from "../auth/AuthContext";
import type { Post } from "../posts/types";
import { GlobalImpactWidget } from "./components/GlobalImpactWidget";
import { LeaderboardWidget } from "./components/LeaderboardWidget";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { ReportPostModal } from "./components/ReportPostModal";
import { TrendingHashtags } from "./components/TrendingHashtags";
import { CommunitySearch } from "./components/CommunitySearch";
import { PostUploadProgress } from "./components/PostUploadProgress";
import { usePostUpload } from "./context/PostUploadContext";
import { getTimeAgo } from "../../utils/dateUtils";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MotionBox = motion(Box);

const CommunityPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    // Hashtag State
    const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

    const {
        data: feedData,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = usePostsFeed(selectedHashtag || undefined);
    const likeMutation = useLikePost();
    const deleteMutation = useDeletePost();
    const toast = useToast();

    // Edit State
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    // Detail/Comments State
    const [viewPostId, setViewPostId] = useState<string | null>(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    // Delete Confirmation State
    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Global Background Upload State (rendered locally)
    const { uploadState, handleBackgroundSubmit } = usePostUpload();

    // Report State
    const [reportPostId, setReportPostId] = useState<string | null>(null);
    const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
    const reportMutation = useReportPost();


    const handleReportClick = (postId: string) => {
        setReportPostId(postId);
        onReportOpen();
    };

    const handleConfirmReport = (reason: string, details?: string) => {
        if (!reportPostId) return;

        reportMutation.mutate({ postId: reportPostId, reason, details }, {
            onSuccess: () => {
                toast({
                    title: 'Publicación reportada',
                    description: 'Gracias por ayudarnos a mantener segura la comunidad.',
                    status: 'success',
                    duration: 3000,
                });
                onReportClose();
                setReportPostId(null);
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || 'Error al reportar';
                toast({
                    title: message.includes('Ya has reportado') ? 'Información' : 'Error al reportar',
                    description: message,
                    status: message.includes('Ya has reportado') ? 'info' : 'error',
                    duration: 4000,
                });
            }
        });
    };

    // Flatten pages to get all posts
    const allPosts = feedData?.pages.flatMap((page: { data: Post[] }) => page.data) || [];

    // Fetched Post State (for deep links if not in feed)
    const { data: fetchedPost } = useQuery({
        queryKey: ['post', searchParams.get('post')],
        queryFn: () => PostsService.getPostById(searchParams.get('post')!),
        enabled: !!searchParams.get('post') && !allPosts.some(p => p.id === searchParams.get('post')),
    });

    // Derived state for reactive updates
    const detailPost = allPosts.find((p: Post) => p.id === viewPostId) || (fetchedPost as Post) || null;

    // Deep Linking Effect
    useEffect(() => {
        const postId = searchParams.get('post');
        if (postId) {
            const postInFeed = allPosts.find(p => p.id === postId);
            if (postInFeed || fetchedPost) {
                setViewPostId(postId);
                onDetailOpen();
                // Limpiar param para no reabrir al recargar
                setSearchParams({}, { replace: true });
            }
        }
    }, [searchParams, allPosts, fetchedPost, onDetailOpen, setSearchParams]);

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
        const post = allPosts.find((p: Post) => p.id === postId);
        if (post) {
            setEditingPost(post);
            onEditOpen();
        }
    };

    const handleCommentClick = (postId: string) => {
        setViewPostId(postId);
        onDetailOpen();
    };

    const handleDeleteClick = (postId: string) => {
        setDeletePostId(postId);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (!deletePostId) return;

        deleteMutation.mutate(deletePostId, {
            onSuccess: () => {
                toast({
                    title: 'Publicación eliminada',
                    status: 'success',
                    duration: 3000,
                });
                if (viewPostId === deletePostId) {
                    onDetailClose();
                }
                onDeleteClose();
            },
            onError: () => {
                toast({
                    title: 'Error al eliminar publicación',
                    status: 'error',
                    duration: 3000,
                });
            }
        });
    };


    if (error) {
        return (
            <Center minH="100vh" bg="brand.bgBody">
                <Text color="red.500">Error al cargar el feed.</Text>
            </Center>
        );
    }

    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={20} bg="brand.bgBody" minH="100vh">
            <Container maxW="container.xl" pt={4} px={{ base: 4, md: 8 }}>
                <Grid
                    templateColumns={{ base: "1fr", lg: "280px 1fr 320px" }}
                    gap={8}
                >
                    {/* Left Sidebar */}
                    <GridItem order={{ base: 1, lg: 1 }} display={{ base: "none", lg: "block" }}>
                        <Box position="sticky" top="120px" maxH="calc(100vh - 120px)" overflowY="auto" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                            <Box mb={6}>
                                <CommunitySearch onHashtagClick={(h) => setSelectedHashtag(h)} />
                            </Box>
                            <Box mb={6}>
                                <TrendingHashtags
                                    onSelectHashtag={(h) => setSelectedHashtag(h || null)}
                                    selectedHashtag={selectedHashtag}
                                />
                            </Box>
                        </Box>
                    </GridItem>

                    {/* Main Feed */}
                    <GridItem order={{ base: 2, lg: 2 }} minW={0}>
                        <Container maxW="container.sm" px={0}>
                            <Box display={{ base: "block", lg: "none" }} mb={6}>
                                <CommunitySearch onHashtagClick={(h) => setSelectedHashtag(h)} />
                            </Box>

                            <CreatePostForm onBackgroundSubmit={handleBackgroundSubmit} />

                            <PostUploadProgress upload={uploadState} />


                            <VStack spacing={4} align="stretch" mt={6}>
                                {isLoading ? (
                                    <Center py={10}>
                                        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="brand.primary" />
                                    </Center>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {allPosts.map((post: Post) => (
                                            <MotionBox
                                                key={post.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30,
                                                    opacity: { duration: 0.2 }
                                                } as any}
                                            >
                                                <PostCard
                                                    id={post.id}
                                                    user={{
                                                        id: post.user_id,
                                                        username: post.user?.username || 'usuario',
                                                        name: post.user?.full_name || post.user?.username || 'Usuario',
                                                        avatar: post.user?.avatar_url || '',
                                                        verified: post.user?.is_verified
                                                    }}
                                                    content={{
                                                        text: post.descripcion,
                                                        hashtags: post.hashtags,
                                                        timeAgo: getTimeAgo(post.created_at),
                                                        location: post.ubicacion,
                                                        media: post.media
                                                    }}
                                                    stats={{
                                                        likes: post._count?.likes || 0,
                                                        comments: post._count?.comments || 0,
                                                        likedBy: []
                                                    }}
                                                    isLiked={post.liked_by_me}
                                                    isReported={post.reported_by_me}
                                                    isOwner={user?.id === post.user_id}
                                                    onLike={(id) => handleLike(id, post.liked_by_me)}
                                                    onComment={() => handleCommentClick(post.id)}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDeleteClick}
                                                    onReport={handleReportClick}
                                                    onHashtagClick={(h) => setSelectedHashtag(h)}
                                                />
                                            </MotionBox>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </VStack>

                            {hasNextPage && (
                                <Center py={6}>
                                    <Button
                                        onClick={() => fetchNextPage()}
                                        isLoading={isFetchingNextPage}
                                        loadingText="Cargando..."
                                        variant="solid"
                                        colorScheme="green"
                                        borderRadius="full"
                                        size="lg"
                                        px={10}
                                        py={6}
                                        fontWeight="700"
                                        boxShadow="md"
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            boxShadow: "lg"
                                        }}
                                        transition="all 0.2s"
                                    >
                                        Ver más publicaciones
                                    </Button>
                                </Center>
                            )}

                            {allPosts.length === 0 && (
                                <Box textAlign="center" py={10}>
                                    <Icon as={FaLeaf} color="brand.primary" fontSize="3xl" mb={4} opacity={0.3} />
                                    <Text color="gray.400" fontSize="sm">No hay publicaciones aún</Text>
                                </Box>
                            )}
                        </Container>
                    </GridItem>

                    {/* Right Sidebar */}
                    <GridItem order={{ base: 3, lg: 3 }} display={{ base: "none", lg: "block" }}>
                        <Box position="sticky" top="120px" maxH="calc(100vh - 120px)" overflowY="auto" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                            <GlobalImpactWidget />
                            <Box mt={6}>
                                <LeaderboardWidget />
                            </Box>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>

            {editingPost && (
                <EditPostModal
                    isOpen={isEditOpen}
                    onClose={onEditClose}
                    onCloseComplete={() => setEditingPost(null)}
                    post={editingPost}
                />
            )}

            {detailPost && (
                <PostDetailModal
                    isOpen={isDetailOpen}
                    onClose={onDetailClose}
                    onCloseComplete={() => setViewPostId(null)}
                    post={detailPost}
                    onEdit={() => handleEdit(detailPost.id)}
                    onDelete={() => handleDeleteClick(detailPost.id)}
                    onReport={handleReportClick}
                    onHashtagClick={(h) => {
                        setSelectedHashtag(h);
                        onDetailClose();
                    }}
                />
            )}

            <ReportPostModal
                isOpen={isReportOpen}
                onClose={() => {
                    onReportClose();
                    setReportPostId(null);
                }}
                onSubmit={handleConfirmReport}
                isLoading={reportMutation.isPending}
            />

            <ConfirmationModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onCloseComplete={() => setDeletePostId(null)}
                onConfirm={confirmDelete}
                title="Eliminar publicación"
                message="¿Estás seguro de que deseas eliminar esta publicación?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
};

export default CommunityPage;
