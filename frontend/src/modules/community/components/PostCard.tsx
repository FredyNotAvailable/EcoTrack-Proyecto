import { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Avatar,
    Image,
    IconButton,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Skeleton,
    useDisclosure
} from "@chakra-ui/react";
import { FaEllipsisH, FaRegHeart, FaRegComment, FaHeart, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LocationViewModal } from './LocationViewModal';

const MotionBox = motion(Box);

export interface PostCardProps {
    id: string;
    user: {
        id: string;
        username: string; // Added username for profile routing
        name: string;
        avatar: string;
        verified?: boolean;
        location?: string;
    };
    content: {
        text: string;
        hashtags?: string[];
        timeAgo: string;
        location?: string;
        media?: {
            id: string;
            media_url: string;
            media_type: 'image' | 'video';
            position: number;
        }[];
    };
    stats: {
        likes: number;
        comments: number;
        likedBy?: string[];
    };
    isLiked?: boolean;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
    onShare?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onReport?: (id: string) => void;
    onHashtagClick?: (hashtag: string) => void;
    isOwner?: boolean;
    isReported?: boolean;
}

export const PostCard = ({ id, user, content, stats, isLiked, isReported, onLike, onComment, onEdit, onDelete, onReport, onHashtagClick, isOwner }: PostCardProps) => {
    const navigate = useNavigate();
    const cardBg = useColorModeValue("white", "gray.800");
    const verifiedColor = "blue.400";
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);
    const { isOpen: isLocationOpen, onOpen: onLocationOpen, onClose: onLocationClose } = useDisclosure();

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/perfil/${user.username}`);
    };

    const handleNextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (content.media && content.media.length > 0) {
            setIsMediaLoaded(false);
            setCurrentMediaIndex((prev) => (prev + 1) % content.media!.length);
        }
    };

    const handlePrevMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (content.media && content.media.length > 0) {
            setIsMediaLoaded(false);
            setCurrentMediaIndex((prev) => (prev - 1 + content.media!.length) % content.media!.length);
        }
    };

    const handleDotClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        e.preventDefault();
        setIsMediaLoaded(false);
        setCurrentMediaIndex(index);
    };

    const currentMedia = content.media && content.media.length > 0 ? content.media[currentMediaIndex] : null;

    useEffect(() => {
        // Reset index when post id changes or media list changes
        setCurrentMediaIndex(0);
        setIsMediaLoaded(false);
    }, [id, content.media?.length]);

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            bg={cardBg}
            borderRadius="24px"
            border="1px solid rgba(0,0,0,0.03)"
            overflow="hidden"
            boxShadow="0 4px 12px -4px rgba(31, 64, 55, 0.05)"
            className="post-card"
        >
            {/* Header */}
            <Flex justify="space-between" align="flex-start" p={5} pb={3}>
                <HStack spacing={3} flex={1}>
                    <Avatar
                        name={user.name}
                        src={user.avatar}
                        size="md"
                        cursor="pointer"
                        onClick={handleUserClick}
                    />
                    <Box flex={1}>
                        <HStack spacing={2} cursor="pointer" onClick={handleUserClick}>
                            <Text fontWeight="700" fontSize="sm" color="brand.secondary">
                                {user.username}
                            </Text>
                            {user.verified && (
                                <Icon as={MdVerified} color={verifiedColor} boxSize={4} />
                            )}
                        </HStack>
                        <HStack spacing={2} fontSize="xs" color="brand.textMuted" fontWeight="500">
                            {user.location && (
                                <>
                                    <Text>{user.location}</Text>
                                    <Text>•</Text>
                                </>
                            )}
                            <Text>{content.timeAgo}</Text>
                        </HStack>
                    </Box>
                </HStack>

                {isOwner && (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<Icon as={FaEllipsisH} />}
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                        />
                        <MenuList>
                            <MenuItem onClick={() => onEdit && onEdit(id)}>Editar</MenuItem>
                            <MenuItem onClick={() => onDelete && onDelete(id)} color="red.500">Eliminar</MenuItem>
                        </MenuList>
                    </Menu>
                )}
                {!isOwner && (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<Icon as={FaEllipsisH} />}
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                        />
                        <MenuList>
                            <MenuItem
                                onClick={() => onReport && onReport(id)}
                                color={isReported ? "gray.400" : "red.500"}
                                isDisabled={isReported}
                            >
                                {isReported ? 'Ya reportado' : 'Reportar'}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                )}
            </Flex>

            {/* Media Carousel */}
            {currentMedia && (
                <Box
                    position="relative"
                    w="100%"
                    width="94%"
                    mx="auto"
                    mb={3}
                    aspectRatio="1/1" // Reduced height (was 4/5)
                    borderRadius="2xl"
                    overflow="hidden"
                    bg="black" // Background for any letterboxing if we switched back to contain, but cover fills it
                >
                    {/* Media Item */}
                    <Box
                        key={currentMedia.id}
                        onClick={currentMedia.media_type !== 'video' ? (() => onComment && onComment(id)) : undefined}
                        cursor="pointer"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h="100%"
                    >
                        {/* Skeleton Loader */}
                        {!isMediaLoaded && (
                            <Skeleton height="100%" width="100%" position="absolute" top={0} left={0} />
                        )}

                        {currentMedia.media_type === 'video' ? (
                            <Box
                                as="video"
                                src={currentMedia.media_url}
                                controls
                                objectFit="contain" // Fit within constraints without cropping
                                w="100%"
                                h="100%"
                                preload="metadata"
                                onLoadedData={() => setIsMediaLoaded(true)}
                                display={isMediaLoaded ? 'block' : 'none'}
                            />
                        ) : (
                            <Image
                                src={currentMedia.media_url}
                                alt="Post content"
                                objectFit="contain" // Fit within constraints without cropping
                                w="100%"
                                h="100%"
                                onLoad={() => setIsMediaLoaded(true)}
                                display={isMediaLoaded ? 'block' : 'none'}
                            />
                        )}
                    </Box>

                    {/* Navigation Arrows */}
                    {content.media && content.media.length > 1 && (
                        <>
                            <IconButton
                                aria-label="Previous image"
                                icon={<FaChevronLeft />}
                                position="absolute"
                                left={2}
                                top="50%"
                                transform="translateY(-50%)"
                                isRound
                                size="md"
                                bg="blackAlpha.600"
                                color="white"
                                _hover={{ bg: "blackAlpha.800" }}
                                _active={{ bg: "blackAlpha.900" }}
                                onClick={handlePrevMedia}
                                zIndex={2}
                            />
                            <IconButton
                                aria-label="Next image"
                                icon={<FaChevronRight />}
                                position="absolute"
                                right={2}
                                top="50%"
                                transform="translateY(-50%)"
                                isRound
                                size="md"
                                bg="blackAlpha.600"
                                color="white"
                                _hover={{ bg: "blackAlpha.800" }}
                                _active={{ bg: "blackAlpha.900" }}
                                onClick={handleNextMedia}
                                zIndex={2}
                            />
                            <Flex justify="center" position="absolute" bottom={2} w="100%">
                                <HStack spacing={1}>
                                    {content.media.map((_, idx) => (
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
                </Box>
            )}

            {/* Content */}
            <Box px={5} pb={2}>
                <Text fontSize="sm" color="brand.text" mb={2}>
                    {content.text}
                </Text>
                {content.hashtags && content.hashtags.length > 0 && (
                    <HStack spacing={2} wrap="wrap" mb={3}>
                        {content.hashtags.map((tag, index) => (
                            <Text
                                key={index}
                                fontSize="sm"
                                color="brand.primary"
                                fontWeight="600"
                                cursor="pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onHashtagClick && onHashtagClick(tag);
                                }}
                            >
                                #{tag}
                            </Text>
                        ))}
                    </HStack>
                )}
                {content.location && (
                    <HStack
                        cursor="pointer"
                        onClick={onLocationOpen}
                        spacing={1.5}
                        align="center"
                        mb={3}
                        color="gray.500"
                        _hover={{ color: 'brand.primary' }}
                        transition="color 0.2s"
                    >
                        <Icon as={FaMapMarkerAlt} boxSize={3} />
                        <Text fontSize="xs" fontWeight="500">
                            {content.location}
                        </Text>
                    </HStack>
                )}
            </Box>

            {/* Actions */}
            <Flex justify="space-between" align="center" px={5} pb={4}>
                <HStack spacing={4}>
                    <HStack spacing={2}>
                        <IconButton
                            aria-label="Like"
                            icon={isLiked ? <FaHeart /> : <FaRegHeart />}
                            variant="ghost"
                            size="sm"
                            color={isLiked ? "red.500" : "gray.500"}
                            onClick={() => onLike && onLike(id)}
                        />
                        {stats.likes > 0 && (
                            <Text fontSize="sm" fontWeight="600" color="brand.secondary">
                                {stats.likes}
                            </Text>
                        )}
                    </HStack>

                    <HStack spacing={2}>
                        <IconButton
                            aria-label="Comment"
                            icon={<FaRegComment />}
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            onClick={() => onComment && onComment(id)}
                        />
                        {stats.comments > 0 && (
                            <Text fontSize="sm" fontWeight="600" color="brand.secondary">
                                {stats.comments}
                            </Text>
                        )}
                    </HStack>
                </HStack>
            </Flex>

            {/* Modal de visualización de ubicación */}
            {content.location && (
                <LocationViewModal
                    isOpen={isLocationOpen}
                    onClose={onLocationClose}
                    locationName={content.location}
                />
            )}
        </MotionBox>
    );
};
