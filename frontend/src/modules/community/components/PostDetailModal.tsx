import {
    Modal,
    ModalOverlay,
    ModalContent,
    Box,
    Flex,
    Image as ChakraImage,
    Text,
    Avatar,
    IconButton,
    Input,
    VStack,
    HStack,
    Divider,
    useColorModeValue,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    useDisclosure,
    Skeleton
} from '@chakra-ui/react';
import { keyframes } from "@emotion/react";
import { FaHeart, FaRegHeart, FaEllipsisH, FaTrash, FaPen, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import type { Post, Comment } from '../../posts/types';
import { usePostComments, useCreateComment, useLikePost, useDeleteComment } from '../../posts/hooks/usePosts';
import { useAuth } from '../../auth/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import { useNavigate } from "react-router-dom";
import { getTimeAgo } from "../../../utils/dateUtils";

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onEdit?: () => void;
    onDelete?: () => void;
    onHashtagClick?: (hashtag: string) => void;
    onCloseComplete?: () => void;
}

export const PostDetailModal = ({ isOpen, onClose, post, onEdit, onDelete, onHashtagClick, onCloseComplete }: PostDetailModalProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const toast = useToast();
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);

    const heartBeat = keyframes`
      0% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    `;

    // User Navigation
    const handleUserClick = (username?: string) => {
        if (!username) return;
        onClose();
        navigate(`/app/perfil/${username}`);
    };

    // Comments Logic
    const { data: commentsData } = usePostComments(post.id);
    const createComment = useCreateComment();
    const deleteComment = useDeleteComment();
    const [newComment, setNewComment] = useState('');

    // Comment Deletion Logic
    const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const handleDeleteClick = (commentId: string) => {
        setDeleteCommentId(commentId);
        onDeleteOpen();
    };

    const confirmDeleteComment = () => {
        if (!deleteCommentId) return;

        deleteComment.mutate({ postId: post.id, commentId: deleteCommentId }, {
            onSuccess: () => {
                toast({ title: "Comentario eliminado", status: "success", duration: 2000 });
                onDeleteClose();
                setDeleteCommentId(null);
            },
            onError: () => {
                toast({ title: "Error al eliminar", status: "error" });
            }
        });
    };

    // Like Logic (Local state for optimistic UI or reusing hook data)
    // We should ideally sync this state or rely on parent invalidation. 
    // For specific UI like "Instagram", we need the button within this modal.
    const likeMutation = useLikePost();
    const isLiked = post.liked_by_me; // Note: this might be stale if we don't refetch post detail separately

    const handleLike = () => {
        likeMutation.mutate({ postId: post.id, liked: isLiked });
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        createComment.mutate(
            { postId: post.id, content: newComment },
            {
                onSuccess: () => setNewComment('')
            }
        );
    };

    const comments = commentsData || [];
    const isOwner = user?.id === post.user_id;

    const handleNextMedia = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (post.media && post.media.length > 0) {
            setIsMediaLoaded(false);
            setCurrentMediaIndex((prev) => (prev + 1) % post.media!.length);
        }
    };

    const handlePrevMedia = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (post.media && post.media.length > 0) {
            setIsMediaLoaded(false);
            setCurrentMediaIndex((prev) => (prev - 1 + post.media!.length) % post.media!.length);
        }
    };

    const handleDotClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMediaLoaded(false);
        setCurrentMediaIndex(index);
    };

    useEffect(() => {
        setCurrentMediaIndex(0);
        setIsMediaLoaded(false);
    }, [post.id]);

    const currentMedia = post.media && post.media.length > 0 ? post.media[currentMediaIndex] : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} onCloseComplete={onCloseComplete} size="4xl" isCentered>
            <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
            <ModalContent
                bg={bg}
                overflow="hidden"
                borderRadius="xl"
                h={{ base: 'auto', md: '700px' }}
                maxH="90vh"
                display="flex"
                flexDirection={{ base: 'column', md: 'row' }}
                m={4}
            >

                {/* LEFT SIDE: MEDIA */}
                <Box
                    flex="1.5"
                    bg="black"
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h={{ base: "300px", md: "100%" }}
                >
                    {/* Skeleton Loader */}
                    {!isMediaLoaded && (
                        <Skeleton height="100%" width="100%" position="absolute" top={0} left={0} />
                    )}

                    {currentMedia ? (
                        <>
                            {currentMedia.media_type === 'video' ? (
                                <video
                                    src={currentMedia.media_url}
                                    controls
                                    style={{ maxWidth: '100%', maxHeight: '100%', display: isMediaLoaded ? 'block' : 'none' }}
                                    onLoadedData={() => setIsMediaLoaded(true)}
                                />
                            ) : (
                                <ChakraImage
                                    src={currentMedia.media_url}
                                    objectFit="contain"
                                    maxH="100%"
                                    maxW="100%"
                                    onLoad={() => setIsMediaLoaded(true)}
                                    display={isMediaLoaded ? 'block' : 'none'}
                                />
                            )}

                            {/* Navigation Arrows */}
                            {post.media && post.media.length > 1 && (
                                <>
                                    <IconButton
                                        aria-label="Previous image"
                                        icon={<FaChevronLeft />}
                                        position="absolute"
                                        left={4}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        isRound
                                        size="md"
                                        bg="blackAlpha.600"
                                        color="white"
                                        _hover={{ bg: "blackAlpha.800" }}
                                        _active={{ bg: "blackAlpha.900" }}
                                        onClick={(e) => handlePrevMedia(e)}
                                        zIndex={2}
                                    />
                                    <IconButton
                                        aria-label="Next image"
                                        icon={<FaChevronRight />}
                                        position="absolute"
                                        right={4}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        isRound
                                        size="md"
                                        bg="blackAlpha.600"
                                        color="white"
                                        _hover={{ bg: "blackAlpha.800" }}
                                        _active={{ bg: "blackAlpha.900" }}
                                        onClick={(e) => handleNextMedia(e)}
                                        zIndex={2}
                                    />
                                    {/* Dots Indicator for Modal too */}
                                    <Flex justify="center" position="absolute" bottom={4} w="100%">
                                        <HStack spacing={1}>
                                            {post.media.map((_, idx) => (
                                                <Box
                                                    key={idx}
                                                    w={idx === currentMediaIndex ? 2 : 1.5}
                                                    h={idx === currentMediaIndex ? 2 : 1.5}
                                                    borderRadius="full"
                                                    bg={idx === currentMediaIndex ? "white" : "whiteAlpha.500"}
                                                    cursor="pointer"
                                                    onClick={(e) => handleDotClick(e, idx)}
                                                    transition="all 0.2s"
                                                    _hover={{ transform: 'scale(1.2)', bg: 'white' }}
                                                />
                                            ))}
                                        </HStack>
                                    </Flex>
                                </>
                            )}
                        </>
                    ) : (
                        <ChakraImage
                            src={'https://via.placeholder.com/600'}
                            objectFit="contain"
                            maxH="100%"
                            maxW="100%"
                        />
                    )}
                </Box>

                {/* RIGHT SIDE: INTERACTION */}
                <Flex flex="1" direction="column" minW="350px" h="100%">
                    {/* Header */}
                    <Flex p={4} align="center" justify="space-between" borderBottom="1px solid" borderColor={borderColor}>
                        <HStack cursor="pointer" onClick={() => handleUserClick(post.user?.username)}>
                            <Avatar size="sm" src={post.user?.avatar_url} name={post.user?.username} />
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="sm">
                                    {post.user?.username || 'usuario'}
                                </Text>
                                {post.ubicacion && (
                                    <Text fontSize="xs" color="gray.500">
                                        {post.ubicacion}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>

                        {isOwner && (
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<FaEllipsisH />}
                                    variant="ghost"
                                    size="sm"
                                />
                                <MenuList>
                                    <MenuItem icon={<FaPen />} onClick={onEdit}>Editar</MenuItem>
                                    <MenuItem icon={<FaTrash />} color="red.500" onClick={onDelete}>Eliminar</MenuItem>
                                </MenuList>
                            </Menu>
                        )}
                    </Flex>

                    {/* Comments List */}
                    <VStack flex="1" overflowY="auto" p={4} align="stretch" spacing={4}>
                        {/* Caption as first comment */}
                        <HStack align="start" spacing={3}>
                            <Avatar size="xs" src={post.user?.avatar_url} name={post.user?.username} cursor="pointer" onClick={() => handleUserClick(post.user?.username)} />
                            <Box>
                                <Text fontSize="sm">
                                    <Text as="span" fontWeight="bold" mr={2} cursor="pointer" onClick={() => handleUserClick(post.user?.username)}>{post.user?.username}</Text>
                                    {post.descripcion}
                                    {post.hashtags && post.hashtags.length > 0 && (
                                        <Text as="span" ml={2}>
                                            {post.hashtags.map((tag, idx) => (
                                                <Text
                                                    key={`${tag}-${idx}`}
                                                    as="span"
                                                    color="blue.500"
                                                    cursor="pointer"
                                                    _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                                    onClick={() => onHashtagClick && onHashtagClick(tag)}
                                                    mr={1}
                                                >
                                                    #{tag}
                                                </Text>
                                            ))}
                                        </Text>
                                    )}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>{getTimeAgo(post.created_at)}</Text>
                            </Box>
                        </HStack>

                        <Divider />

                        {/* Real Comments */}
                        {comments.map((comment: Comment) => (
                            <HStack key={comment.id} align="start" spacing={3}>
                                <Avatar
                                    size="xs"
                                    src={comment.user?.avatar_url}
                                    name={comment.user?.username}
                                />
                                <Box>
                                    <Text fontSize="sm">
                                        <Text
                                            as="span"
                                            fontWeight="bold"
                                            mr={2}
                                            cursor="pointer"
                                            onClick={() => handleUserClick(comment.user?.username)}
                                        >
                                            {comment.user?.username}
                                        </Text>
                                        {comment.content}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" mt={1}>{getTimeAgo(comment.created_at)}</Text>
                                </Box>

                                {(user?.id === comment.user_id) && (
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<FaEllipsisH />}
                                            variant="ghost"
                                            size="xs"
                                            color="gray.400"
                                            ml="auto"
                                        />
                                        <MenuList minW="100px">
                                            <MenuItem
                                                color="red.500"
                                                fontSize="sm"
                                                onClick={() => handleDeleteClick(comment.id)}
                                            >
                                                Eliminar
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                )}
                            </HStack>
                        ))}
                    </VStack>

                    {/* Actions Footer - Matching PostCard Style */}
                    <Box p={4} borderTop="1px solid" borderColor={borderColor}>
                        {/* Action Row */}
                        <Flex justify="space-between" align="center" mb={3}>
                            <HStack spacing={5}>
                                <IconButton
                                    aria-label="Like"
                                    icon={isLiked ? <FaHeart size={22} color="#E53E3E" /> : <FaRegHeart size={22} />}
                                    variant="unstyled"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    _hover={{ color: "red.400" }}
                                    color={isLiked ? "red.400" : "inherit"}
                                    onClick={handleLike}
                                    animation={isLiked ? `${heartBeat} 0.45s ease-in-out` : undefined}
                                />
                            </HStack>
                            {/* <IconButton
                                aria-label="Save"
                                icon={<FaRegBookmark size={20} />}
                                variant="unstyled"
                                color="gray.400"
                            /> */}
                        </Flex>

                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                            {post._count?.likes?.toLocaleString() || 0} Me gusta
                        </Text>
                        <Text fontSize="xs" color="gray.500" mb={3}>
                            {new Date(post.created_at).toLocaleDateString()}
                        </Text>

                        {/* Add Comment Input */}
                        <HStack>
                            <Input
                                variant="unstyled"
                                placeholder="Añadir un comentario..."
                                fontSize="sm"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                            />
                            <Button
                                variant="ghost"
                                colorScheme="blue"
                                size="sm"
                                fontSize="sm"
                                isDisabled={!newComment.trim()}
                                onClick={handleSendComment}
                                isLoading={createComment.isPending}
                            >
                                Publicar
                            </Button>
                        </HStack>
                    </Box>
                </Flex>
            </ModalContent>

            <ConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    onDeleteClose();
                    setDeleteCommentId(null);
                }}
                onConfirm={confirmDeleteComment}
                title="Eliminar comentario"
                message="¿Estás seguro de eliminar este comentario?"
                confirmText="Eliminar"
                cancelText="Cancelar"
                isLoading={deleteComment.isPending}
            />
        </Modal >
    );
};
