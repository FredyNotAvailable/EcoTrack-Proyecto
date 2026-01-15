import {
    Box,
    Flex,
    Text,
    Avatar,
    Image,
    IconButton,
    HStack,
    Icon,
    AvatarGroup,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaEllipsisH, FaRegHeart, FaRegComment, FaRegBookmark, FaHeart } from "react-icons/fa";
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
        image?: string;
        text: string;
        hashtags?: string[];
        timeAgo: string;
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

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/app/perfil/${user.username}`);
    };

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

            {/* Media */}
            {content.image && (
                <Box
                    position="relative"
                    w="100%"
                    borderRadius="2xl"
                    overflow="hidden"
                    mx="auto"
                    width="94%"
                    mb={3}
                    onClick={() => onComment && onComment(id)}
                    cursor="pointer"
                >
                    {/* Using 94% width + rounded corners to mimic the "floating" card look inside the container if desired,
                       or full width. The reference "Loop" usually has full width images or slightly inset.
                       Let's go with slightly inset for a modern "card inside card" feel or full width.
                       Let's try Full Width for maximum impact but with the outer container padding?
                       Actually, the reference shows the image filling the "content" area but the header is above.
                       Let's stick to full width of the card's inner content area, but maybe the card itself has padding?
                       Let's do full width image restricted by the parent card padding if we applied any?
                       No, let's make the image full width of the card.
                   */}
                    <Image
                        src={content.image}
                        alt="Post content"
                        objectFit="cover"
                        w="100%"
                        maxH="500px" // Reasonable max height
                    />
                    {/* Floating Tag or location if needed */}
                </Box>
            )}

            {/* Actions & Content */}
            <Box px={5} pb={5}>
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
                            color={isLiked ? "red.400" : "brand.textMain"}
                            onClick={() => onLike && onLike(id)}
                        />
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

                {/* Likes Stats */}
                <HStack spacing={2} mb={2}>
                    {stats.likedBy && stats.likedBy.length > 0 && (
                        <AvatarGroup size="xs" max={3} spacing={-1.5}>
                            {stats.likedBy.map((url, i) => (
                                <Avatar key={i} src={url} border="2px solid white" />
                            ))}
                        </AvatarGroup>
                    )}
                    <Text fontSize="sm" fontWeight="600" color="brand.textMain">
                        {stats.likes.toLocaleString()} Me gusta
                    </Text>
                </HStack>

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
