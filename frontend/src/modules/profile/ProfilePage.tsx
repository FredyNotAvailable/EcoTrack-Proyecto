import {
    Box,
    Heading,
    Text,
    Flex,
    Avatar,
    VStack,
    HStack,
    Icon,
    SimpleGrid,
    Progress,
    Card,
    Button,
    useColorModeValue,
    useDisclosure,

    Spinner,
} from "@chakra-ui/react";
import {
    FaLeaf,
    FaTrophy,
    FaFire,
    FaSeedling,
    FaGlobeAmericas,
    FaMedal,
    FaCheckCircle,

} from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { ProfileAPIService } from "./services/profile.service";
import { FaImage, FaClone } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { SettingsModal } from "./components/SettingsModal";
import { useDeletePost, useUserPosts } from "../posts/hooks/usePosts";
import { PostsService } from "../posts/services/posts.service";
import { PostDetailModal } from "../community/components/PostDetailModal";
import { EditPostModal } from "../community/components/EditPostModal";
import { ConfirmationModal } from "../community/components/ConfirmationModal";
import { PostPlaceholder } from "../community/components/PostPlaceholder";
import type { Post } from "../posts/types";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

import { useQuery, useQueryClient } from "@tanstack/react-query";
// React Query for fetching stats
import { userStatsService } from "../../services/userStatsService";
import { userRachasService } from "../../services/userRachasService";

import { useParams } from "react-router-dom";

const ProfilePage = () => {
    const { user } = useAuth();
    const { username: urlUsername } = useParams();
    const queryClient = useQueryClient();

    const cardBg = useColorModeValue("white", "gray.800");

    // Replace manual fetch with useQuery
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', urlUsername || 'me'],
        queryFn: () => urlUsername
            ? ProfileAPIService.getProfileByUsername(urlUsername)
            : ProfileAPIService.getMe(),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const targetUserId = profile?.id;
    // Strictly compare IDs and ensure both exist to show settings
    const isMe = !!user?.id && !!targetUserId && user.id === targetUserId;

    const { data: stats } = useQuery({
        queryKey: ['userStats', targetUserId],
        queryFn: () => userStatsService.getUserStatsById(targetUserId!),
        enabled: !!targetUserId,
    });

    const { data: racha } = useQuery({
        queryKey: ['userRacha', targetUserId],
        queryFn: () => userRachasService.getUserRacha(targetUserId!),
        enabled: !!targetUserId,
    });

    // Posts Hook
    const {
        data: userPostsData,
        isLoading: isLoadingPosts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useUserPosts(targetUserId);

    const deleteMutation = useDeletePost();

    // Modals State
    const [viewPostId, setViewPostId] = useState<string | null>(null);
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Settings Modal State
    const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

    const handlePostClick = (postId: string) => {
        setViewPostId(postId);
        onDetailOpen();
    };

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        onEditOpen();
    };

    const handleDeletePostClick = (postId: string) => {
        setDeletePostId(postId);
        onDeleteOpen();
    };

    const confirmDeletePost = () => {
        if (deletePostId) {
            deleteMutation.mutate(deletePostId, {
                onSuccess: () => {
                    if (viewPostId === deletePostId) {
                        onDetailClose();
                        // State cleared in onCloseComplete
                    }
                    onDeleteClose();
                    // State cleared in onCloseComplete
                }
            });
        }
    };

    const { data: detailPost } = useQuery({
        queryKey: ['post', viewPostId],
        queryFn: () => PostsService.getPostById(viewPostId!),
        enabled: !!viewPostId,
    });



    const allUserPosts = userPostsData?.pages.flatMap(page => page.data) || [];

    if (isLoading) {
        return (
            <Flex h="60vh" align="center" justify="center">
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Flex>
        );
    }

    // Process Real Stats
    const currentPoints = stats?.puntos_totales || 0;
    const currentLevel = stats?.nivel || 1;
    const xpForNextLevel = 1000;
    // If stats don't provide precise XP, estimate:
    const currentLevelXp = currentPoints % 1000;
    const progressPercent = (currentLevelXp / xpForNextLevel) * 100;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Cargando...";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
            .format(date)
            .replace(/^\w/, (c) => c.toUpperCase());
    };

    const profileData = {
        name: profile?.username || "Usuario",
        username: profile?.username ? `@${profile.username}` : "",
        avatar_url: profile?.avatar_url || "",
        bio: profile?.bio ?? "Sin biografía.",
        level: currentLevel,
        xp: currentLevelXp,
        nextLevelXp: xpForNextLevel,
        memberSince: formatDate(profile?.created_at),
        stats: [
            { label: "Puntos Totales", value: currentPoints.toLocaleString(), icon: FaTrophy, color: "brand.accentPurple" },
            { label: "CO₂ Ahorrado", value: `${(stats?.kg_co2_ahorrado || 0).toFixed(1)} kg`, icon: FaGlobeAmericas, color: "brand.primary" },
            { label: "Retos Completados", value: (stats?.retos_completados || 0).toString(), icon: FaLeaf, color: "brand.accent" },
            // Racha placeholdler
            { label: "Racha Actual", value: `${racha?.racha_actual || 0} días`, icon: FaFire, color: "orange.400" },
        ],
    };

    // ... existing logic ...

    // Replace handleOpenEdit logic if needed, but SettingsModal handles form state now.

    // ... existing hooks/queries ...

    const handleUpdateProfile = () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['userStats', targetUserId] });
        queryClient.invalidateQueries({ queryKey: ['userRacha', targetUserId] });
        // Also invalidate current user if needed, as some global UI might depend on it
        queryClient.invalidateQueries({ queryKey: ['user'] });
    };

    // ... loading checks ...

    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            {/* Header Section (Card-like) */}
            <Card
                borderRadius="24px"
                overflow="hidden"
                boxShadow="0 4px 20px rgba(0,0,0,0.05)"
                border="1px solid"
                borderColor="gray.100"
                mb={12}
                p={{ base: 6, md: 8 }}
            >
                <Flex direction={{ base: "column", md: "row" }} gap={8} align="start">
                    {/* Avatar */}
                    <Avatar
                        size="2xl"
                        src={profileData.avatar_url}
                        name={profileData.name}
                        border="4px solid"
                        borderColor="brand.primary"
                        boxShadow="lg"
                        bg="brand.primary"
                        color="white"
                    />

                    {/* Info Area */}
                    <VStack align="start" flex={1} spacing={4} w="full">
                        <Flex justify="space-between" align="start" w="full" wrap="wrap" gap={4}>
                            <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                    <Heading size="lg" color="brand.secondary">
                                        {profileData.username}
                                    </Heading>
                                    <Icon as={FaCheckCircle} color="blue.400" w={5} h={5} />
                                </HStack>
                            </VStack>

                            {/* Action Button - Only if isMe */}
                            {isMe && (
                                <Button
                                    variant="ghost"
                                    borderRadius="full"
                                    w="48px"
                                    h="48px"
                                    bg="gray.50"
                                    color="gray.400"
                                    _hover={{ bg: "gray.100", color: "brand.primary", transform: "rotate(90deg)" }}
                                    transition="all 0.4s ease"
                                    onClick={onSettingsOpen}
                                    aria-label="Configuración"
                                >
                                    <Icon as={FaGear} fontSize="xl" />
                                </Button>
                            )}
                        </Flex>

                        {/* Bio moved here */}
                        <Text color="brand.textMuted" lineHeight="tall" maxW="800px">
                            {profileData.bio}
                        </Text>

                        <HStack pt={2} spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaSeedling} color="brand.primary" />
                            <Text fontWeight="medium">Miembro desde: {profileData.memberSince}</Text>
                        </HStack>
                    </VStack>
                </Flex>
            </Card>

            {/* Content Section */}
            {/* ... (existing content: stats, posts, etc) ... */}
            <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={10} w="full" alignItems="start">

                {/* Left Column: Stats & Progress (occupies 4/12 columns) */}
                <VStack spacing={6} align="stretch" gridColumn={{ lg: "span 4" }}>


                    {/* Stats & Progress Section */}
                    <Card p={6} borderRadius="24px" boxShadow="0 10px 30px rgba(0,0,0,0.05)">
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack>
                                <Icon as={FaMedal} color="orange.300" fontSize="xl" />
                                <Heading size="md" color="brand.secondary">Nivel {profileData.level}</Heading>
                            </HStack>
                            <Text fontWeight="bold" color="brand.textMuted">
                                {profileData.xp} / {profileData.nextLevelXp} XP
                            </Text>
                        </Flex>
                        <Progress
                            value={progressPercent}
                            borderRadius="full"
                            size="lg"
                            colorScheme="green"
                            bg="brand.bgCardLight"
                        />
                        <Text mt={3} fontSize="sm" color="brand.textMuted">
                            {isMe
                                ? `¡Te faltan ${xpForNextLevel - currentLevelXp} XP para el Nivel ${profileData.level + 1}!`
                                : `Progreso: ${Math.round(progressPercent)}% hacia el siguiente nivel`}
                        </Text>
                    </Card>

                    {/* Stats Grid */}
                    <SimpleGrid columns={{ base: 2, md: 2 }} gap={3}>
                        {profileData.stats.map((stat, idx) => (
                            <Card
                                key={idx}
                                p={4}
                                borderRadius="24px"
                                bg={cardBg}
                                border="1px solid"
                                borderColor="gray.100"
                                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                _hover={{ transform: "translateY(-5px)", boxShadow: "2xl", borderColor: "brand.primary" }}
                                boxShadow="sm"
                            >
                                <VStack spacing={2} align="center">
                                    <Flex
                                        p={3}
                                        bg={`${stat.color}10`}
                                        borderRadius="18px"
                                        color={stat.color}
                                    >
                                        <Icon as={stat.icon} fontSize="1.3rem" />
                                    </Flex>
                                    <VStack align="center" spacing={0}>
                                        <Text fontSize="xl" fontWeight="800" color="brand.secondary">
                                            {stat.value}
                                        </Text>
                                        <Text fontSize="xs" color="brand.textMuted" fontWeight="semibold" textAlign="center" textTransform="uppercase" letterSpacing="tight">
                                            {stat.label}
                                        </Text>
                                    </VStack>
                                </VStack>
                            </Card>
                        ))}
                    </SimpleGrid>
                </VStack>

                {/* Right Column: Posts (occupies 8/12 columns) */}
                <Box gridColumn={{ lg: "span 8" }}>
                    <VStack align="start" spacing={6} w="full">
                        <HStack w="full" justify="space-between" bg="white" p={4} borderRadius="20px" boxShadow="sm" border="1px solid" borderColor="gray.50">
                            <Heading size="sm" color="brand.secondary" display="flex" alignItems="center">
                                <Icon as={FaImage} mr={2} color="brand.primary" />
                                {isMe ? "Mis Publicaciones" : "Publicaciones"}
                            </Heading>
                            <HStack spacing={1}>
                                <Text fontWeight="bold" color="brand.primary" fontSize="lg">
                                    {allUserPosts.length}
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">
                                    publicaciones
                                </Text>
                            </HStack>
                        </HStack>

                        {isLoadingPosts ? (
                            <Flex w="full" py={10} justify="center">
                                <Spinner color="brand.primary" />
                            </Flex>
                        ) : allUserPosts.length > 0 ? (
                            <SimpleGrid columns={{ base: 3 }} spacing={1} w="full">
                                {allUserPosts.map((post: Post) => (
                                    <Box
                                        key={post.id}
                                        position="relative"
                                        pb="100%"
                                        cursor="pointer"
                                        onClick={() => handlePostClick(post.id)}
                                        overflow="hidden"
                                        _hover={{ opacity: 0.9 }}
                                        bg="gray.100"
                                    >
                                        {post.media && post.media.length > 0 ? (
                                            <Box
                                                position="absolute"
                                                top={0}
                                                left={0}
                                                right={0}
                                                bottom={0}
                                                bgImage={`url(${post.media[0].media_url})`}
                                                bgSize="cover"
                                                bgPosition="center"
                                                transition="transform 0.5s ease"
                                                _hover={{ transform: "scale(1.05)" }}
                                            />
                                        ) : (
                                            <Box
                                                position="absolute"
                                                top={0}
                                                left={0}
                                                right={0}
                                                bottom={0}
                                            >
                                                <PostPlaceholder minH="100%" fontSize="6px" iconSize={5} />
                                            </Box>
                                        )}
                                        {(post.media && (post.media.length > 1 || post.media[0]?.media_type === 'video')) && (
                                            <Box position="absolute" top={2} right={2} color="white">
                                                <Icon as={FaClone} dropShadow="0 2px 4px rgba(0,0,0,0.5)" />
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Card p={10} w="full" textAlign="center" borderRadius="24px" border="2px dashed" borderColor="gray.100" bg="transparent" boxShadow="none">
                                <VStack spacing={4}>
                                    <Icon as={FaImage} fontSize="4xl" color="gray.200" />
                                    <Text color="gray.400" fontWeight="medium">
                                        {isMe
                                            ? "Aún no has compartido ninguna publicación."
                                            : "Este usuario aún no tiene publicaciones."}
                                    </Text>
                                </VStack>
                            </Card>
                        )}

                        {hasNextPage && (
                            <Button
                                variant="ghost"
                                w="full"
                                isLoading={isFetchingNextPage}
                                onClick={() => fetchNextPage()}
                                color="brand.primary"
                                fontSize="sm"
                            >
                                Ver más publicaciones
                            </Button>
                        )}
                    </VStack>
                </Box>
            </SimpleGrid>

            {/* ... Modals (Post Detail, Edit, Delete) ... */}
            {detailPost && (
                <PostDetailModal
                    isOpen={isDetailOpen}
                    onClose={onDetailClose}
                    onCloseComplete={() => setViewPostId(null)}
                    post={detailPost}
                    onEdit={() => handleEditPost(detailPost)}
                    onDelete={() => handleDeletePostClick(detailPost.id)}
                />
            )}

            {editingPost && (
                <EditPostModal
                    isOpen={isEditOpen}
                    onClose={onEditClose}
                    onCloseComplete={() => setEditingPost(null)}
                    post={editingPost}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onCloseComplete={() => setDeletePostId(null)}
                onConfirm={confirmDeletePost}
                title="Eliminar publicación"
                message="¿Estás seguro de que deseas eliminar esta publicación permanentemente?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />

            {/* NEW Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={onSettingsClose}
                profile={profile}
                onUpdate={handleUpdateProfile}
            />
        </Box >
    );
};

export default ProfilePage;


