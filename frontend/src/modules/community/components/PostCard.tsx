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
    Skeleton
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaEllipsisH, FaRegHeart, FaRegComment, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";

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
    onHashtagClick?: (hashtag: string) => void;
    isOwner?: boolean;
}

export const PostCard = ({ id, user, content, stats, isLiked, onLike, onComment, onEdit, onDelete, onHashtagClick, isOwner }: PostCardProps) => {
    const navigate = useNavigate();
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    const verifiedColor = "blue.400";
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);

    const heartBeat = keyframes`
      0% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    `;

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
        <Box
            bg={cardBg}
            borderRadius="3xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            boxShadow="sm"
            className="post-card"
        >
            {/* Header */}
            <Flex align="center" justify="space-between" p={4}>
                <HStack spacing={3}>
                    <Box position="relative" cursor="pointer" onClick={handleUserClick}>
                        <Avatar
                            size="md"
                            name={user.name}
                            src={user.avatar}
                            border="2px solid"
                            borderColor="brand.primary"
                        />
                    </Box>
                    <Box>
                        <HStack spacing={1} cursor="pointer" onClick={handleUserClick}>
                            <Text fontWeight="700" fontSize="sm" color="brand.textMain">
                                {user.username}
                            </Text>
                            {user.verified && (
                                <Icon as={MdVerified} color={verifiedColor} boxSize={3.5} />
                            )}
                        </HStack>
                        <HStack spacing={1} fontSize="xs" color="gray.400" fontWeight="500">
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

            {/* Actions & Content */}
            <Box px={5} pb={5}>
                {/* Action Row */}
                <Flex justify="space-between" align="center" mb={3}>
                    <HStack spacing={4}>
                        <HStack spacing={1}>
                            <IconButton
                                aria-label="Like"
                                icon={isLiked ? <FaHeart size={22} color="#E53E3E" /> : <FaRegHeart size={22} />}
                                variant="unstyled"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                _hover={{ color: "red.400" }}
                                color={isLiked ? "red.400" : "brand.textMain"}
                                onClick={() => onLike && onLike(id)}
                                animation={isLiked ? `${heartBeat} 0.45s ease-in-out` : undefined}
                            />
                            {stats.likes > 0 && (
                                <Text fontSize="sm" fontWeight="600" color="brand.textMain">
                                    {stats.likes}
                                </Text>
                            )}
                        </HStack>

                        <IconButton
                            aria-label="Comment"
                            icon={<FaRegComment size={22} />}
                            variant="unstyled"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{ color: "brand.primary" }}
                            color="brand.textMain"
                            onClick={() => onComment && onComment(id)}
                        />
                    </HStack>
                    {/* <IconButton
                        aria-label="Save"
                        icon={<FaRegBookmark size={20} />}
                        variant="unstyled"
                        color="brand.textMuted"
                    /> */}
                </Flex>

                {/* Caption */}
                <Text fontSize="sm" color="brand.textMuted" noOfLines={2} lineHeight="1.5">
                    <Text as="span" fontWeight="700" color="brand.textMain" mr={2}>
                        {user.username}
                    </Text>
                    <Text as="span" fontSize="sm" color="brand.textMain">
                        {content.text}
                        {content.hashtags && content.hashtags.length > 0 && (
                            <Text as="span" ml={2}>
                                {content.hashtags.map((tag, idx) => (
                                    <Text
                                        key={`${tag}-${idx}`}
                                        as="span"
                                        color="blue.500"
                                        cursor="pointer"
                                        _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onHashtagClick && onHashtagClick(tag);
                                        }}
                                        mr={1}
                                    >
                                        #{tag}
                                    </Text>
                                ))}
                            </Text>
                        )}
                    </Text>
                </Text>

                {/* Timestamp */}

            </Box>
        </Box>
    );
};
