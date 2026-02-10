import {
    Box,
    Text,
    Textarea,
    HStack,
    Button,
    IconButton,
    Image as ChakraImage,
    useColorModeValue,
    Input,
    Flex,
    useToast,
    Avatar,
    Tag,
    TagLabel,
    TagCloseButton,
    Skeleton
} from '@chakra-ui/react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaHashtag, FaPhotoVideo } from 'react-icons/fa';
import { Reorder } from 'framer-motion';
import { LocationPickerModal } from './LocationPickerModal';
import { useAuth } from '../../auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ProfileAPIService } from '../../profile/services/profile.service';

import type { Post } from '../../posts/types';

// Internal type for managing media state
export interface EditorMediaItem {
    id: string; // For existing media, use its UUID. For new, use a temp ID.
    url: string; // Display URL (blob or remote)
    file?: File; // Only for new files
    type: 'image' | 'video';
    isNew: boolean;
}

interface PostEditorProps {
    onSubmit: (data: {
        descripcion: string;
        mediaItems: EditorMediaItem[];
        ubicacion?: string;
        hashtags?: string[];
    }) => void;
    initialData?: Partial<Post>;
    isSubmitting?: boolean;
}

export const PostEditor = ({ onSubmit, isSubmitting = false, initialData }: PostEditorProps) => {
    const [description, setDescription] = useState(initialData?.descripcion || '');

    // Unified Media State
    const [mediaItems, setMediaItems] = useState<EditorMediaItem[]>(() => {
        if (initialData?.media && initialData.media.length > 0) {
            return initialData.media.sort((a, b) => a.position - b.position).map(m => ({
                id: m.id,
                url: m.media_url,
                type: m.media_type,
                isNew: false
            }));
        }
        return [];
    });

    // Restored State
    const [location, setLocation] = useState(initialData?.ubicacion || '');
    const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || []);
    const [newHashtag, setNewHashtag] = useState('');
    const [showHashtagInput, setShowHashtagInput] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Carousel State
    // Carousel State
    const [previewIndex, setPreviewIndex] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const { user } = useAuth();

    // Fetch profile data to get username/avatar correctly
    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: ProfileAPIService.getMe,
        enabled: !!user,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Ref to keep track of current media items for cleanup on unmount
    const mediaItemsRef = useRef(mediaItems);
    useEffect(() => {
        mediaItemsRef.current = mediaItems;
    }, [mediaItems]);

    // Cleanup blob URLs ONLY on unmount
    useEffect(() => {
        return () => {
            mediaItemsRef.current.forEach(item => {
                if (item.isNew && item.url.startsWith('blob:')) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, []); // Run ONLY once on mount, cleanup on unmount

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*,video/*";
            fileInputRef.current.multiple = true;
            fileInputRef.current.click();
        }
    };

    const processFiles = (files: FileList | File[]) => {
        const newItems: EditorMediaItem[] = [];

        Array.from(files).forEach(file => {
            if (file.size > 50 * 1024 * 1024) {
                toast({ title: 'Archivo muy grande', description: `${file.name} excede 50MB.`, status: 'error' });
                return;
            }
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                newItems.push({
                    id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    url: URL.createObjectURL(file), // Create object URL only for new files
                    file: file,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    isNew: true
                });
            }
        });

        if (newItems.length > 0) {
            setMediaItems(prev => [...prev, ...newItems]);
            // If adding first items, reset index
            if (mediaItems.length === 0) setPreviewIndex(0);
        }
    };

    const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            processFiles(event.target.files);
        }
        event.target.value = '';
    };



    const removeMedia = (index: number) => {
        setMediaItems(prev => {
            const newItems = [...prev];
            const removedItem = newItems[index];

            // Revoke blob URL if it's a new file
            if (removedItem.isNew && removedItem.url.startsWith('blob:')) {
                URL.revokeObjectURL(removedItem.url);
            }

            newItems.splice(index, 1);
            return newItems;
        });

        // Adjust preview index if needed
        if (previewIndex >= mediaItems.length - 1) {
            setPreviewIndex(Math.max(0, mediaItems.length - 2));
        }
    };

    const addHashtagToList = (tag: string) => {
        const cleanTag = tag.trim().replace(/^#/, '');
        if (cleanTag && !hashtags.includes(cleanTag)) {
            setHashtags([...hashtags, cleanTag]);
        }
    };

    const handleHashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Si hay un espacio, significa que el usuario terminó un hashtag
        if (value.includes(' ')) {
            const parts = value.split(' ');
            // Agregar todos los hashtags completos
            parts.slice(0, -1).forEach(tag => {
                if (tag.trim()) {
                    addHashtagToList(tag);
                }
            });
            // Mantener la última parte (que está después del último espacio)
            const lastPart = parts[parts.length - 1];
            setNewHashtag(lastPart.startsWith('#') ? lastPart : lastPart ? `#${lastPart}` : '#');
        } else {
            // Asegurar que siempre comience con #
            if (value && !value.startsWith('#')) {
                setNewHashtag(`#${value}`);
            } else {
                setNewHashtag(value);
            }
        }
    };

    const handleAddHashtag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newHashtag.trim() && newHashtag !== '#') {
            e.preventDefault();
            addHashtagToList(newHashtag);
            setNewHashtag('#');
        } else if (e.key === 'Backspace' && newHashtag === '#') {
            e.preventDefault();
            setNewHashtag('');
        }
    };

    const removeHashtag = (tagToRemove: string) => {
        setHashtags(hashtags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = () => {
        if (mediaItems.length === 0) {
            toast({
                title: "Multimedia requerido",
                description: "Debes subir al menos una foto o video para poder publicar.",
                status: "warning"
            });
            return;
        }

        // Asegurarse de incluir el hashtag que se está escribiendo actualmente si no se presionó Enter/Espacio
        let finalHashtags = [...hashtags];
        const pendingTag = newHashtag.trim().replace(/^#/, '');
        if (pendingTag && pendingTag !== '' && !finalHashtags.includes(pendingTag)) {
            finalHashtags.push(pendingTag);
        }

        console.log('PostEditor - Submitting with hashtags:', finalHashtags);
        onSubmit({
            descripcion: description,
            mediaItems: mediaItems,
            ubicacion: location,
            hashtags: finalHashtags
        });
    };

    const handleReorder = (newOrder: EditorMediaItem[]) => {
        setMediaItems(newOrder);
        setPreviewIndex(0);
    };

    const hasChanges = useMemo(() => {
        // If creating new post
        if (!initialData?.id) {
            // Requiere al menos una imagen/video para ser considerado un cambio válido de creación
            return mediaItems.length > 0;
        }

        const initialHashtags = initialData.hashtags || [];
        const hashtagsChanged = JSON.stringify(hashtags.sort()) !== JSON.stringify(initialHashtags.sort());

        // Compare media: order, IDs, and if any is new
        const initialMedia = initialData.media ? initialData.media.sort((a, b) => a.position - b.position) : [];

        let mediaChanged = false;
        if (mediaItems.length !== initialMedia.length) {
            mediaChanged = true;
        } else {
            // Check if order changed or any item replaced
            for (let i = 0; i < mediaItems.length; i++) {
                if (mediaItems[i].isNew) {
                    mediaChanged = true; // New/Edited file
                    break;
                }
                if (mediaItems[i].id !== initialMedia[i].id) {
                    mediaChanged = true; // Reordered
                    break;
                }
            }
        }

        return (
            description !== (initialData.descripcion || '') ||
            location !== (initialData.ubicacion || '') ||
            hashtagsChanged ||
            mediaChanged
        );
    }, [description, location, hashtags, mediaItems, initialData]);

    const isSubmitDisabled = !hasChanges || mediaItems.length === 0;

    return (
        <Box
            bg={bg}
            w="100%"
            display="flex"
            flexDirection="column"
            position="relative"
            borderRadius="lg"
            overflow="hidden"
            maxH="85vh" // Limit max height to viewport but allow auto otherwise
        >
            {/* Header */}
            <Flex
                align="center"
                justify="center"
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                position="relative"
            >
                <Text fontWeight="bold" fontSize="xl" color="gray.700">Crear publicación</Text>
            </Flex>

            {/* Scrollable Content */}
            <Box flex="1" overflowY="auto" p={4}>
                {/* User Row */}
                <Flex align="center" mb={4}>
                    {isLoadingProfile ? (
                        <Skeleton borderRadius="full" boxSize="48px" mr={3} />
                    ) : (
                        <Avatar
                            src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                            name={profile?.username || 'Usuario'}
                            size="md"
                            mr={3}
                        />
                    )}
                    <Box>
                        {isLoadingProfile ? (
                            <Skeleton height="20px" width="150px" mb={1} />
                        ) : (
                            <Text fontWeight="semibold" fontSize="md" color="gray.700">
                                {profile?.username ? `@${profile.username}` : 'Usuario'}
                                {location && (
                                    <Text as="span" fontWeight="normal" color="gray.600">
                                        {' '}está en <Text as="span" fontWeight="bold" color="gray.800">{location}</Text>
                                    </Text>
                                )}
                            </Text>
                        )}
                    </Box>
                </Flex>

                {/* Text Input */}
                <Textarea
                    placeholder={!profile?.username ? "¿Qué estás pensando?" : `¿Qué estás pensando, @${profile.username}?`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="unstyled"
                    fontSize="2xl"
                    minH="100px"
                    resize="none"
                    mb={4}
                    _placeholder={{ color: 'gray.400' }}
                />

                {/* Hashtags Inline Display */}
                {hashtags.length > 0 && (
                    <Flex flexWrap="wrap" gap={2} mb={4}>
                        {hashtags.map(tag => (
                            <Tag key={tag} size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                                <TagLabel>#{tag}</TagLabel>
                                <TagCloseButton onClick={() => removeHashtag(tag)} />
                            </Tag>
                        ))}
                    </Flex>
                )}

                {/* Media Preview Box */}
                {mediaItems.length > 0 && (
                    <Box
                        borderRadius="xl"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.200"
                        position="relative"
                        mb={4}
                    >
                        {/* Close Button specific to Media Container */}
                        <IconButton
                            aria-label="Remove all media"
                            icon={<FaTimes />}
                            size="sm"
                            position="absolute"
                            top={2}
                            right={2}
                            zIndex={10}
                            bg="white"
                            color="gray.600"
                            isRound
                            onClick={() => setMediaItems([])} // Clear all logic or just hide? The edit logic was removing specific.
                            _hover={{ bg: "gray.100" }}
                        />

                        {/* Current Preview */}
                        <Box position="relative" bg="black" minH="200px" display="flex" alignItems="center" justifyContent="center">
                            {mediaItems[previewIndex] && (
                                mediaItems[previewIndex].type === 'video' ? (
                                    <video
                                        key={mediaItems[previewIndex].id}
                                        src={mediaItems[previewIndex].url}
                                        controls
                                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <ChakraImage
                                        key={mediaItems[previewIndex].id}
                                        src={mediaItems[previewIndex].url}
                                        maxW="100%"
                                        maxH="600px"
                                        objectFit="contain"
                                    />
                                )
                            )}
                        </Box>

                        {/* Reorder strip if multiple */}
                        {mediaItems.length > 1 && (
                            <Box p={2} bg="white" borderTop="1px solid" borderColor="gray.100">
                                <Reorder.Group
                                    axis="x"
                                    values={mediaItems}
                                    onReorder={handleReorder}
                                    style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
                                >
                                    {mediaItems.map((item, idx) => (
                                        <Reorder.Item key={item.id} value={item} style={{ listStyle: 'none', flexShrink: 0 }}>
                                            <Box
                                                position="relative"
                                                w="60px" h="60px"
                                                borderRadius="md" overflow="hidden"
                                                border="2px solid" borderColor={idx === previewIndex ? "blue.500" : "transparent"}
                                                cursor="pointer"
                                                onClick={() => setPreviewIndex(idx)}
                                            >
                                                <IconButton
                                                    aria-label="Remove" icon={<FaTimes />} size="xs"
                                                    onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                                                    position="absolute" top={0} right={0} zIndex={10}
                                                    colorScheme="red" h="18px" w="18px" minW="unset" borderRadius="none" borderBottomLeftRadius="md"
                                                />
                                                {item.type === 'video' ? (
                                                    <Box
                                                        as="video"
                                                        src={`${item.url}#t=0.1`}
                                                        w="100%"
                                                        h="100%"
                                                        objectFit="cover"
                                                        muted
                                                        playsInline
                                                    />
                                                ) : (
                                                    <ChakraImage src={item.url} w="100%" h="100%" objectFit="cover" draggable={false} />
                                                )}
                                            </Box>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Footer / Actions */}
            <Box p={4} maxW="100%">
                {/* Box "Añadir a tu publicación" */}
                <Flex
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={3}
                    align="center"
                    justify="space-between"
                    mb={4}
                    boxShadow="sm"
                >
                    <Text fontWeight="semibold" fontSize="sm" color="gray.700">Añadir a tu publicación</Text>
                    <HStack spacing={1}>
                        <IconButton
                            icon={<FaPhotoVideo size={24} color="#45bd62" />}
                            aria-label="Photo/Video"
                            variant="ghost"
                            onClick={handleFileSelect}
                            borderRadius="full"
                            _hover={{ bg: "gray.100" }}
                        />
                        <IconButton
                            icon={<FaHashtag size={24} color="#1877f2" />}
                            aria-label="Tag"
                            variant="ghost"
                            onClick={() => setShowHashtagInput(!showHashtagInput)}
                            borderRadius="full"
                            _hover={{ bg: "gray.100" }}
                        />
                        <IconButton
                            icon={<FaMapMarkerAlt size={24} color="#f5533d" />}
                            aria-label="Location"
                            variant="ghost"
                            onClick={() => setIsLocationModalOpen(true)}
                            borderRadius="full"
                            _hover={{ bg: "gray.100" }}
                        />
                    </HStack>
                </Flex>

                {/* Hashtag Input Float */}
                {showHashtagInput && (
                    <Input
                        placeholder="Escribe #hashtag y presiona Enter..."
                        value={newHashtag}
                        onChange={handleHashtagChange}
                        onKeyDown={handleAddHashtag}
                        mb={4}
                        onFocus={() => { if (!newHashtag) setNewHashtag('#'); }}
                    />
                )}

                <Button
                    w="full"
                    colorScheme="blue"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitDisabled}
                    fontSize="md"
                    fontWeight="semibold"
                >
                    Publicar
                </Button>
            </Box>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaSelect}
                style={{ display: 'none' }}
            />

            {/* Location Picker Modal */}
            <LocationPickerModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelectLocation={(locationName) => setLocation(locationName)}
                initialLocation={location}
            />
        </Box>
    );
};
