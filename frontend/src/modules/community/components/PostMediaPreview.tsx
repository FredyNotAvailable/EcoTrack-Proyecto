
import {
    Box,
    Button,
    HStack,
    IconButton,
    Image as ChakraImage,
    Icon
} from '@chakra-ui/react';
import { FaImage, FaVideo, FaTimes, FaMagic, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Reorder } from 'framer-motion';

interface PostMediaPreviewProps {
    mediaFiles: File[];
    mediaPreviews: string[];
    mediaType: 'image' | 'video' | 'text';
    previewIndex: number;
    setPreviewIndex: React.Dispatch<React.SetStateAction<number>>;
    videoAspectRatio: number;
    setVideoAspectRatio: React.Dispatch<React.SetStateAction<number>>;
    onReorder: (newOrder: string[]) => void;
    onRemove: (index: number) => void;
    onEditImage: () => void;
}

export const PostMediaPreview = ({
    mediaFiles,
    mediaPreviews,
    mediaType,
    previewIndex,
    setPreviewIndex,
    videoAspectRatio,
    setVideoAspectRatio,
    onReorder,
    onRemove,
    onEditImage
}: PostMediaPreviewProps) => {

    if (mediaPreviews.length === 0) return null;

    return (
        <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="sm" mb={4} bg="black">
            <HStack position="absolute" top={2} right={2} spacing={2} zIndex={10}>
                {/* Show Crop (Magic) only if current item is Image */}
                {((mediaFiles[previewIndex]?.type.startsWith('image/') || (!mediaFiles[previewIndex] && mediaType === 'image'))) && (
                    <IconButton
                        aria-label="Edit image"
                        icon={<FaMagic />}
                        size="xs"
                        onClick={onEditImage}
                        borderRadius="full"
                        bg="whiteAlpha.800"
                        color="black"
                        _hover={{ bg: "white" }}
                    />
                )}
                <IconButton
                    aria-label="Remove media"
                    icon={<FaTimes />}
                    size="xs"
                    onClick={() => onRemove(previewIndex)}
                    borderRadius="full"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: "blackAlpha.800" }}
                />
            </HStack>

            {(() => {
                const currentFile = mediaFiles[previewIndex];
                const isCurrentItemVideo = currentFile ? currentFile.type.startsWith('video/') : mediaType === 'video';

                return (
                    <Box position="relative" w="100%" bg="black" borderRadius="md" overflow="hidden">
                        {isCurrentItemVideo ? (
                            <Box position="relative" width="100%" pb={videoAspectRatio === 1 ? "100%" : "125%"}>
                                <video
                                    src={mediaPreviews[previewIndex]}
                                    controls
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                                <Box position="absolute" bottom={2} left={2} zIndex={10}>
                                    <Button
                                        size="xs"
                                        onClick={() => setVideoAspectRatio(prev => prev === 1 ? 4 / 5 : 1)}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        leftIcon={<FaImage />}
                                        opacity={0.8}
                                        _hover={{ opacity: 1 }}
                                    >
                                        {videoAspectRatio === 1 ? "1:1" : "4:5"}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box position="relative" w="100%" h="400px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                                <ChakraImage
                                    src={mediaPreviews[previewIndex]}
                                    w="100%"
                                    h="100%"
                                    objectFit="contain"
                                />
                            </Box>
                        )}

                        {/* Shared Navigation Arrows */}
                        {mediaPreviews.length > 1 && (
                            <>
                                <IconButton
                                    aria-label="Prev"
                                    icon={<FaChevronLeft />}
                                    position="absolute" left={2} top="50%" transform="translateY(-50%)"
                                    zIndex={3} size="sm" isRound
                                    onClick={() => setPreviewIndex(i => Math.max(0, i - 1))}
                                    isDisabled={previewIndex === 0}
                                    bg="blackAlpha.300" color="white" _hover={{ bg: "blackAlpha.500" }}
                                />
                                <IconButton
                                    aria-label="Next"
                                    icon={<FaChevronRight />}
                                    position="absolute" right={2} top="50%" transform="translateY(-50%)"
                                    zIndex={3} size="sm" isRound
                                    onClick={() => setPreviewIndex(i => Math.min(mediaPreviews.length - 1, i + 1))}
                                    isDisabled={previewIndex === mediaPreviews.length - 1}
                                    bg="blackAlpha.300" color="white" _hover={{ bg: "blackAlpha.500" }}
                                />
                            </>
                        )}
                    </Box>
                );
            })()}

            {/* Draggable Thumbnails Strip */}
            {mediaPreviews.length > 1 && (
                <Box w="100%" overflowX="auto" px={2} pb={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }} bg="white">
                    <Reorder.Group axis="x" values={mediaPreviews} onReorder={onReorder} style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: 'fit-content', paddingRight: '8px' }}>
                        {mediaPreviews.map((src, idx) => {
                            const currentFile = mediaFiles[idx];
                            // Robust check: if file exists use type, else fallback to mediaType (or guess)
                            const isVideo = currentFile ? currentFile.type.startsWith('video/') : mediaType === 'video';

                            return (
                                <Reorder.Item key={src} value={src} style={{ listStyle: 'none', flexShrink: 0 }}>
                                    <Box
                                        w="50px" h="50px"
                                        borderRadius="md"
                                        overflow="hidden"
                                        border={idx === previewIndex ? "2px solid #38A169" : "1px solid gray"}
                                        cursor="grab"
                                        onClick={() => setPreviewIndex(idx)}
                                        _active={{ cursor: 'grabbing' }}
                                        position="relative"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        bg="gray.100"
                                    >
                                        {isVideo ? (
                                            <Box
                                                as="video"
                                                src={`${src}#t=0.1`}
                                                w="100%"
                                                h="100%"
                                                objectFit="cover"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <ChakraImage
                                                src={src}
                                                w="100%"
                                                h="100%"
                                                objectFit="cover"
                                                draggable={false} // CRITICAL for framer-motion drag
                                            />
                                        )}
                                    </Box>
                                </Reorder.Item>
                            );
                        })}
                    </Reorder.Group>
                </Box>
            )}
        </Box>
    );
};
