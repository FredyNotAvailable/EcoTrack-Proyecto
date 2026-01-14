import {
    Box,
    Button,
    Textarea,
    IconButton,
    Text,
    HStack,
    Image as ChakraImage,
    Input,
    useColorModeValue,
    Icon,
    Flex,
    VStack,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import {
    FaTimes,
    FaPlus,
    FaMagic,
    FaArrowUp,
    FaRegImage
} from "react-icons/fa";
// Removed Microphone icon as requested

interface PostEditorProps {
    onSubmit: (data: {
        descripcion: string;
        media?: File;
        mediaType?: 'image' | 'video';
        ubicacion?: string;
        hashtags?: string[];
    }) => void;
    isSubmitting?: boolean;
    onClose?: () => void; // Kept for consistency if needed by modal
    initialData?: {
        descripcion: string;
        ubicacion?: string;
        hashtags?: string[];
        media_url?: string;
        media_type?: 'image' | 'video';
    };
}

export const PostEditor = ({ onSubmit, isSubmitting = false, onClose, initialData }: PostEditorProps) => {
    const [description, setDescription] = useState(initialData?.descripcion || '');
    const [media, setMedia] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'text'>(initialData?.media_type || 'image');
    const [mediaPreview, setMediaPreview] = useState<string | null>(initialData?.media_url || null);

    // We'll keep these in state but maybe hide them in this specific UI if not in the reference?
    // The reference doesn't show location/hashtags explicitly, but we should probably keep ability to add them.
    // For now, I'll focus on the visual match of the reference.
    const [hashtags, setHashtags] = useState(initialData?.hashtags?.join(' ') || '');
    const [location, setLocation] = useState(initialData?.ubicacion || '');
    const [showOptions, setShowOptions] = useState(!!(initialData?.ubicacion || initialData?.hashtags?.length));

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Colors & Styles matching the clean aesthetic
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    const placeholderColor = "gray.400";
    const btnRawBg = useColorModeValue("gray.50", "whiteAlpha.200");

    const handleFileSelect = (type: 'image' | 'video') => {
        setMediaType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? "image/*" : "video/*";
            fileInputRef.current.click();
        }
    };

    const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) return; // 10MB limit
            setMedia(file);
            setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
        }
    };

    const handleRemoveMedia = () => {
        setMedia(null);
        // Don't reset mediaType fully, just clear the file
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = () => {
        onSubmit({
            descripcion: description,
            media: media || undefined,
            mediaType: mediaType === 'text' ? undefined : (mediaType as 'image' | 'video'),
            ubicacion: location,
            hashtags: hashtags.split(' ').filter(tag => tag.length > 0)
        });

        // Auto-close is handled by parent on success, but we can clear local state if needed.
        // If the parent unmounts this component (which it does via Modal), we don't strictly need to clear.
    };

    return (
        <Box
            bg={bg}
            w="100%"
            borderRadius="3xl"
            boxShadow="xl"
            p={6}
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            fontFamily="'Inter', sans-serif"
            // Ensure interaction doesn't close modal if clicking inside
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <Flex justify="space-between" align="center" mb={4}>
                <IconButton
                    icon={<FaTimes />}
                    aria-label="Cerrar"
                    variant="ghost"
                    size="sm"
                    borderRadius="full"
                    onClick={onClose}
                    color="gray.500"
                />
                <Text fontWeight="600" fontSize="sm" color="gray.500">
                    Borrador
                </Text>
            </Flex>

            {/* Content Preview (Images) */}
            {mediaPreview && (
                <Box mb={4} borderRadius="xl" overflow="hidden" position="relative" maxH="200px">
                    <ChakraImage src={mediaPreview} w="100%" h="200px" objectFit="cover" />
                    <IconButton
                        icon={<FaTimes />}
                        aria-label="Eliminar imagen"
                        size="xs"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={handleRemoveMedia}
                        borderRadius="full"
                        bg="rgba(0,0,0,0.5)"
                        color="white"
                        _hover={{ bg: "rgba(0,0,0,0.7)" }}
                    />
                </Box>
            )}

            {/* Text Input */}
            <Textarea
                placeholder="¿Qué estás pensando? comparte tu progreso..."
                variant="unstyled"
                fontSize="lg"
                minH="120px"
                resize="none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                _placeholder={{ color: placeholderColor }}
                mb={4}
            />

            {/* Extra Options (Location & Hashtags) - Toggled by + Button */}
            {showOptions && (
                <VStack spacing={3} mb={4} align="stretch">
                    <Input
                        placeholder="Ubicación"
                        variant="filled"
                        size="sm"
                        borderRadius="lg"
                        bg={btnRawBg}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <Input
                        placeholder="Etiquetas (separadas por espacio)"
                        variant="filled"
                        size="sm"
                        borderRadius="lg"
                        bg={btnRawBg}
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                    />
                </VStack>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleMediaSelect}
            />

            {/* Bottom Toolbar */}
            <Flex justify="space-between" align="center" mt={2}>
                <HStack spacing={3}>
                    {/* Plus Button - Toggles Options */}
                    <IconButton
                        icon={<FaPlus />}
                        aria-label="Opciones"
                        size="lg"
                        borderRadius="2xl"
                        bg={showOptions ? "gray.200" : btnRawBg}
                        color="gray.600"
                        _hover={{ bg: "gray.100" }}
                        onClick={() => setShowOptions(!showOptions)}
                    />

                    {/* AI Magic Button (Optional, keeping as decoration or future feature) */}
                    <IconButton
                        icon={<FaMagic />}
                        aria-label="AI Magic"
                        size="lg"
                        borderRadius="2xl"
                        bg={btnRawBg}
                        color="gray.600"
                        _hover={{ bg: "gray.100" }}
                    />

                    {/* Image Button Only (No Video) */}
                    <Button
                        size="md"
                        borderRadius="2xl"
                        variant="ghost"
                        bg={btnRawBg}
                        leftIcon={<Icon as={FaRegImage} />}
                        onClick={() => handleFileSelect('image')}
                        px={4}
                        color="gray.600"
                        _hover={{ bg: "gray.100" }}
                    >
                        Imagen
                    </Button>
                </HStack>

                <HStack spacing={3}>
                    {/* Removed Microphone as requested */}

                    {/* Submit Arrow Button */}
                    <IconButton
                        icon={<FaArrowUp />}
                        aria-label="Submit"
                        bg="black"
                        color="white"
                        borderRadius="xl" // Rounded square as in design
                        size="lg" // Slightly larger
                        _hover={{ bg: "gray.800", transform: "scale(1.05)" }}
                        _active={{ transform: "scale(0.95)" }}
                        isLoading={isSubmitting}
                        onClick={handleSubmit}
                        isDisabled={!description.trim() && !media}
                    />
                </HStack>
            </Flex>
        </Box>
    );
};
