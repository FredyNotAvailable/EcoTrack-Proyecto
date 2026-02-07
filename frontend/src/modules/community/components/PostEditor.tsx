import {
    Box,
    Text,
    Textarea,
    HStack,
    VStack,
    IconButton,
    Image as ChakraImage,
    Icon,
    useColorModeValue,
    Input,
    Flex,
    Tooltip,
    useToast
} from '@chakra-ui/react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaMapMarkerAlt, FaHashtag, FaPhotoVideo, FaArrowUp } from 'react-icons/fa';
import { Reorder } from 'framer-motion';
import { LocationPickerModal } from './LocationPickerModal';

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
    const [previewIndex, setPreviewIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const btnRawBg = useColorModeValue("gray.50", "whiteAlpha.200");

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.isNew && item.url.startsWith('blob:')) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [mediaItems]);

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

    const handleFileDrop = (files: FileList) => {
        if (files && files.length > 0) {
            processFiles(files);
        }
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
        console.log('PostEditor - Submitting with hashtags:', hashtags);
        onSubmit({
            descripcion: description,
            mediaItems: mediaItems,
            ubicacion: location,
            hashtags
        });
    };

    const handleReorder = (newOrder: EditorMediaItem[]) => {
        setMediaItems(newOrder);
        setPreviewIndex(0);
    };

    const handlePrev = () => setPreviewIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    const handleNext = () => setPreviewIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));

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
        <Box bg={bg} borderRadius="3xl" boxShadow="lg" border="1px" borderColor={borderColor} w="100%" maxW="720px" display="flex" flexDirection="column" maxH="85vh">
            <Box overflowY="auto" px={6} pt={6} pb={2} maxH="calc(85vh - 80px)" css={{
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#A0AEC0',
                },
            }}>
                <VStack spacing={3} align="stretch" pb={2}>

                {/* Media Section */}
                <Box>
                    <Text fontWeight="semibold" mb={2}>Multimedia</Text>

                    {/* 1. Dropzone - Visible ONLY if no media */}
                    {mediaItems.length === 0 ? (
                        <Box
                            border="2px dashed"
                            borderColor={isDragging ? "green.500" : "gray.300"}
                            bg={isDragging ? "green.50" : "gray.50"}
                            py={16}
                            px={8}
                            textAlign="center"
                            cursor="pointer"
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleFileDrop(e.dataTransfer.files);
                            }}
                            onClick={handleFileSelect}
                            transition="all 0.2s"
                            _hover={{ borderColor: "green.500", bg: "green.50" }}
                        >
                            <VStack spacing={2}>
                                <Text fontSize="sm" color="gray.600">
                                    Elige imagenes/videos or arrastra & suelta.
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                    JPG, PNG, MP4, WEBP. Max 5 MB.
                                </Text>
                            </VStack>
                        </Box>
                    ) : (
                        /* 2. Main Carousel - Visible if media exists */
                        <Box position="relative" w="100%" bg="black" borderRadius="xl" overflow="hidden" mb={4}>
                            <Box position="relative" pb="75%" h="300px"> {/* Altura fija reducida */}
                                {mediaItems[previewIndex] && (
                                    mediaItems[previewIndex].type === 'video' ? (
                                        <video
                                            src={mediaItems[previewIndex].url}
                                            controls
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <ChakraImage
                                            src={mediaItems[previewIndex].url}
                                            position="absolute" top={0} left={0} w="100%" h="100%"
                                            objectFit="contain"
                                        />
                                    )
                                )}
                            </Box>

                            {/* Navigation Arrows */}
                            {mediaItems.length > 1 && (
                                <>
                                    <IconButton
                                        aria-label="Previous"
                                        icon={<FaChevronLeft />}
                                        position="absolute"
                                        left={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        isRound
                                        bg="blackAlpha.600"
                                        color="white"
                                        size="sm"
                                        onClick={handlePrev}
                                        _hover={{ bg: "blackAlpha.800" }}
                                    />
                                    <IconButton
                                        aria-label="Next"
                                        icon={<FaChevronRight />}
                                        position="absolute"
                                        right={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        isRound
                                        bg="blackAlpha.600"
                                        color="white"
                                        size="sm"
                                        onClick={handleNext}
                                        _hover={{ bg: "blackAlpha.800" }}
                                    />
                                </>
                            )}

                            {/* Index Indicator */}
                            <Box position="absolute" top={2} right={2} bg="blackAlpha.600" px={2} py={1} borderRadius="md" zIndex={10}>
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                    {previewIndex + 1} / {mediaItems.length}
                                </Text>
                            </Box>
                        </Box>
                    )}

                    {/* 3. Reorderable Thumbnails Strip - Always visible if media exists */}
                    {mediaItems.length > 0 && (
                        <Reorder.Group
                            axis="x"
                            values={mediaItems}
                            onReorder={handleReorder}
                            style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}
                        >
                            {mediaItems.map((item, idx) => (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    style={{ listStyle: 'none', flexShrink: 0 }}
                                    whileDrag={{ scale: 1.1 }}
                                >
                                    <Box
                                        position="relative"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        border="2px solid"
                                        borderColor={idx === previewIndex ? "green.500" : "transparent"} // Highlight selected
                                        w="60px"
                                        h="60px"
                                        cursor="pointer"
                                        onClick={() => setPreviewIndex(idx)}
                                    >
                                        <IconButton
                                            aria-label="Remove media"
                                            icon={<FaTimes />}
                                            size="xs"
                                            onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                                            position="absolute"
                                            top={0}
                                            right={0}
                                            zIndex={10}
                                            borderRadius="none"
                                            borderBottomLeftRadius="md"
                                            colorScheme="red"
                                            h="24px"
                                            w="24px"
                                            minW="unset"
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
                                            <ChakraImage
                                                src={item.url}
                                                w="100%"
                                                h="100%"
                                                objectFit="cover"
                                                draggable={false}
                                            />
                                        )}
                                    </Box>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </Box>

                <Textarea
                    placeholder="¿Qué estás pensando, cultivando o celebrando? 🌱"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minH="80px"
                    resize="vertical"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    borderRadius="xl"
                    focusBorderColor="green.500"
                    _focus={{ boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
                    fontSize="md"
                    p={3}
                    bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                />

                {/* Hashtags Display */}
                {hashtags.length > 0 && (
                    <Flex flexWrap="wrap" gap={2}>
                        {hashtags.map(tag => (
                            <HStack key={tag} bg="blue.50" color="blue.600" px={2} py={1} borderRadius="full" fontSize="sm">
                                <Text>#{tag}</Text>
                                <Icon as={FaTimes} cursor="pointer" onClick={() => removeHashtag(tag)} />
                            </HStack>
                        ))}
                    </Flex>
                )}

                {/* Ubicación seleccionada */}
                {location && (
                    <Flex 
                        align="center" 
                        justify="space-between"
                        p={3} 
                        bg="green.50" 
                        borderRadius="lg"
                    >
                        <HStack spacing={2}>
                            <Icon as={FaMapMarkerAlt} color="green.600" />
                            <Text fontSize="sm" fontWeight="600" color="green.700">
                                {location}
                            </Text>
                        </HStack>
                        <Icon 
                            as={FaTimes} 
                            cursor="pointer" 
                            color="green.600"
                            onClick={() => setLocation('')}
                            _hover={{ color: 'green.800' }}
                        />
                    </Flex>
                )}

                {/* Inputs Extras */}
                {showHashtagInput && (
                    <Input
                        placeholder="Escribe #hashtag y separa con espacio"
                        value={newHashtag}
                        onChange={handleHashtagChange}
                        onKeyDown={handleAddHashtag}
                        onFocus={() => {
                            if (!newHashtag) setNewHashtag('#');
                        }}
                        _hover={{ bg: "gray.100" }}
                    />
                )}
            </VStack>
            </Box>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaSelect}
                style={{ display: 'none' }}
            />

            <Flex px={6} py={4} justify="space-between" align="center" borderTop="1px solid" borderColor={borderColor} flexShrink={0} bg={bg}>
                <HStack spacing={3}>
                    <Tooltip label="Fotos o Videos" hasArrow>
                        <IconButton
                            icon={<FaPhotoVideo />}
                            aria-label="Add media"
                            variant="ghost"
                            size="md"
                            borderRadius="2xl"
                            bg={btnRawBg}
                            onClick={handleFileSelect}
                            color="gray.600"
                            _hover={{ bg: "gray.100" }}
                        />
                    </Tooltip>
                    <Tooltip label="Añadir ubicación" hasArrow>
                        <IconButton
                            icon={<FaMapMarkerAlt />}
                            aria-label="Add location"
                            variant="ghost"
                            size="md"
                            borderRadius="2xl"
                            bg={location ? "green.50" : btnRawBg}
                            onClick={() => setIsLocationModalOpen(true)}
                            color={location ? "green.600" : "gray.600"}
                            _hover={{ bg: location ? "green.100" : "gray.100" }}
                        />
                    </Tooltip>
                    <Tooltip label="Añadir hashtag" hasArrow>
                        <IconButton
                            icon={<FaHashtag />}
                            aria-label="Add hashtag"
                            variant="ghost"
                            size="md"
                            borderRadius="2xl"
                            bg={btnRawBg}
                            onClick={() => setShowHashtagInput(!showHashtagInput)}
                            color="gray.600"
                            _hover={{ bg: "gray.100" }}
                        />
                    </Tooltip>
                </HStack>

                <HStack spacing={3}>
                    <IconButton
                        icon={<FaArrowUp />}
                        aria-label="Submit"
                        bg="black"
                        color="white"
                        borderRadius="xl"
                        size="lg"
                        _hover={{ bg: "gray.800", transform: "scale(1.05)" }}
                        _active={{ transform: "scale(0.95)" }}
                        isLoading={isSubmitting}
                        onClick={handleSubmit}
                        isDisabled={isSubmitDisabled}
                    />
                </HStack>
            </Flex>

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
