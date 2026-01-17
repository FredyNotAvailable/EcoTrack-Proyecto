import { useState, useRef, useEffect } from 'react';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
    Box,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    HStack,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    Flex,
    IconButton,
    VStack,
    Icon,
    Tooltip
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes } from 'react-icons/fa';
import { MdCropFree, MdCropOriginal, MdCropSquare, MdCropPortrait, MdCropLandscape, MdRotateLeft, MdFlip } from 'react-icons/md';

interface ImageCropperProps {
    images: string[];
    onCropComplete: (croppedBlobs: Blob[]) => void;
    onCancel: () => void;
    isOpen: boolean;
    initialIndex?: number;
}

const ASPECT_RATIOS = [
    { label: 'Libre', value: NaN, icon: MdCropFree },
    { label: 'Original', value: -1, icon: MdCropOriginal },
    { label: '1:1', value: 1, icon: MdCropSquare },
    { label: '4:5', value: 4 / 5, icon: MdCropPortrait },
    { label: '16:9', value: 16 / 9, icon: MdCropLandscape },
];

export const ImageCropper = ({ images, onCropComplete, onCancel, isOpen, initialIndex = 0 }: ImageCropperProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const cropperRef = useRef<ReactCropperElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // UI State
    const [rotation, setRotation] = useState(0);
    const [scaleX, setScaleX] = useState(1); // 1 or -1 for flip
    const [activeAspect, setActiveAspect] = useState<number>(NaN);

    // Store edits
    const [edits, setEdits] = useState<Record<number, {
        data: any;
        canvasData: any;
        rotation: number;
        scaleX: number;
        aspect: number;
    }>>({});

    const fg = 'black';
    const secondary = 'gray.500';

    const saveCurrentEdit = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            setEdits(prev => ({
                ...prev,
                [currentIndex]: {
                    data: cropper.getData(),
                    canvasData: cropper.getCanvasData(),
                    rotation: rotation,
                    scaleX: scaleX,
                    aspect: activeAspect
                }
            }));
        }
    };

    const restoreEdit = (index: number) => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const edit = edits[index];
        if (edit) {
            // Restore cropper state
            cropper.setAspectRatio(edit.aspect === -1 ? NaN : edit.aspect);
            // @ts-ignore - viewMode exists on Cropper instance but types might be strict
            cropper.setViewMode(1); // Ensure viewMode is set for proper data application
            cropper.setData(edit.data);
            cropper.setCanvasData(edit.canvasData);

            // Restore UI state
            setRotation(edit.rotation);
            setScaleX(edit.scaleX);
            setActiveAspect(edit.aspect);
        } else {
            // Defaults
            cropper.setAspectRatio(NaN);
            cropper.reset();
            setRotation(0);
            setScaleX(1);
            setActiveAspect(NaN);
        }
    };

    // Effect to restore when index changes or modal opens
    // We use a small timeout or `ready` callback to ensure cropper is loaded.
    // Ideally `ready` handles the initial load, and `currentIndex` change handles the switch.

    // BUT: `ready` fires only on mount/src change.
    // If we switch src, ready fires.

    const onImageReady = () => {
        restoreEdit(currentIndex);
    };

    // Restore when opening
    useEffect(() => {
        if (isOpen) {
            // We relying on onImageReady mostly, but initial state reset might be good?
            // Actually, if we open fresh, edits are empty.
        }
    }, [isOpen]);

    const handleNext = () => {
        saveCurrentEdit();
        if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        saveCurrentEdit();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const onRotateChange = (val: number) => {
        setRotation(val);
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotateTo(val);
        }
    };

    const toggleFlip = () => {
        const newScale = scaleX === 1 ? -1 : 1;
        setScaleX(newScale);
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.scaleX(newScale);
        }
    };

    const handleSetAspect = (val: number) => {
        setActiveAspect(val);
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            if (val === -1) { // Original aspect ratio
                const imgData = cropper.getImageData();
                cropper.setAspectRatio(imgData.naturalWidth / imgData.naturalHeight);
            } else {
                cropper.setAspectRatio(val);
            }
        }
    };

    const showCroppedImage = async () => {
        saveCurrentEdit();
        setIsProcessing(true);
        try {
            const blobs: Blob[] = [];

            // We'll use the current cropper to process all images differently?
            // No, strictly speaking we can only easily process the *current* image with the *current* cropper instance.
            // For the others, we would need to load them.
            // BUT: If the user didn't edit them, we can just send the original file?
            // "Preloading" logic in PostEditor sends files.
            // If we are "Refining", we want to return NEW blobs for EDITED images.
            // If image is untouched, we ideally shouldn't re-compress it.

            // HOWEVER: Simplicity suggests we return blobs for everything to keep `mediaItems` consistent.
            // BUT: Loading invisible images into canvas is slow.
            // Compromise:
            // If `edits[i]` exists, we MUST process it.
            // If `edits[i]` does not exist, we return the original blob/file?
            // `onCropComplete` expects `Blob[]`.

            // Problem: We can't use `cropper.getCroppedCanvas()` for an image that isn't loaded.
            // We need a utility that takes `Data` (x,y,w,h,rotate,scaleX) and processes the image.

            // We will use our `import('../../../utils/cropUtils')` dynamic import,
            // BUT we need to update `cropUtils` to handle standard CropperJS data AND Flip.
            // Currently `cropUtils` handles `rotate`. It does NOT handle `scaleX` (flip).
            // I should assume for now `scaleX` isn't supported by the util, or I stick to "Only current image processing"
            // OR I update the util.

            // Given I cannot easily update the util in this single tool call,
            // I will use a Client-side approach:
            // We already have `scale` in `cropUtils`?
            // Let's check `cropUtils`: `ctx.scale(flip.horizontal ? -1 : 1, ...)`
            // YES! It supports `flip`.

            // So we just need to map CropperJS data to `cropUtils` params.
            // CropperJS `getData()`: x, y, width, height, rotate, scaleX, scaleY.
            // `cropUtils` params: src, pixelCrop, rotation, flip.

            // We can do this!

            const getCroppedImg = (await import('../../../utils/cropUtils')).default;

            for (let i = 0; i < images.length; i++) {
                let data = edits[i]?.data; // Saved data

                // If this is the CURRENT image, use the live cropper data to be 100% sure
                if (i === currentIndex && cropperRef.current?.cropper) {
                    data = cropperRef.current.cropper.getData();
                }

                if (data) {
                    // Extract params
                    const pixelCrop = { x: data.x, y: data.y, width: data.width, height: data.height };
                    const rotation = data.rotate;
                    const flip = { horizontal: data.scaleX === -1, vertical: data.scaleY === -1 };

                    const blob = await getCroppedImg(images[i], pixelCrop, rotation, flip);
                    if (blob) blobs.push(blob);
                } else {
                    // Fetch original
                    const res = await fetch(images[i]);
                    const blob = await res.blob();
                    blobs.push(blob);
                }
            }

            onCropComplete(blobs);

        } catch (e) {
            console.error("Error formatting crop", e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} size="full" isCentered closeOnOverlayClick={false}>
            <ModalOverlay bg="white" />
            <ModalContent bg="white" m={0} borderRadius={0} h="100vh" overflow="hidden">

                {/* Header - Minimalist */}
                <Flex justify="space-between" align="center" px={6} py={4} bg="white" zIndex={20}>
                    <IconButton
                        aria-label="Back"
                        icon={<FaTimes />}
                        variant="ghost"
                        color={fg}
                        onClick={onCancel}
                        fontSize="lg"
                        _hover={{ bg: "gray.100" }}
                    />
                    {/* Centered Title or Logo? User didn't specify, giraffe has 'Back' ... 'Adjust' ... 'Check' */}
                    {/* Giraffe image shows 'Back' top left. */}

                    <Text fontWeight="600" fontSize="md" color={fg}>Editar</Text>

                    <IconButton
                        aria-label="Save"
                        icon={<FaCheck />} // Or text "Listo"
                        variant="ghost"
                        color={fg}
                        onClick={showCroppedImage}
                        isLoading={isProcessing}
                        fontSize="lg"
                        _hover={{ bg: "gray.100" }}
                    />
                </Flex>

                {/* Cropper Canvas */}
                {/* Background should be light/white to match theme? Or neutral gray standard? */}
                {/* If image is white and bg is white, limits are invisible. */}
                {/* Usually minimalist editors use a very light gray #F7F7F7 for the canvas. */}
                <Box flex="1" position="relative" bg="#F9F9F9" w="100%" h="calc(100vh - 250px)">
                    <Cropper
                        src={images[currentIndex]}
                        style={{ height: '100%', width: '100%' }}
                        initialAspectRatio={NaN}
                        aspectRatio={isNaN(activeAspect) ? NaN : activeAspect}
                        guides={true} // Grid
                        ref={cropperRef}
                        viewMode={1}
                        dragMode="move"
                        background={false} // Transparent/CSS bg
                        autoCropArea={0.9}
                        ready={onImageReady}
                        checkOrientation={false}
                    />

                    {/* Navigation Arrows - Minimalist Black Circles or just Icons */}
                    {images.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <IconButton
                                    aria-label="Prev"
                                    icon={<FaChevronLeft />}
                                    position="absolute"
                                    left={4}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    isRound
                                    bg="white"
                                    shadow="md"
                                    color="black"
                                    onClick={handlePrev}
                                    zIndex={10}
                                    size="sm"
                                    _hover={{ bg: "gray.50" }}
                                />
                            )}
                            {currentIndex < images.length - 1 && (
                                <IconButton
                                    aria-label="Next"
                                    icon={<FaChevronRight />}
                                    position="absolute"
                                    right={4}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    isRound
                                    bg="white"
                                    shadow="md"
                                    color="black"
                                    onClick={handleNext}
                                    zIndex={10}
                                    size="sm"
                                    _hover={{ bg: "gray.50" }}
                                />
                            )}

                            {/* Dots */}
                            <HStack position="absolute" bottom={4} left="50%" transform="translateX(-50%)" spacing={2} zIndex={10}>
                                {images.map((_, idx) => (
                                    <Box
                                        key={idx}
                                        w={idx === currentIndex ? 2 : 1.5}
                                        h={idx === currentIndex ? 2 : 1.5}
                                        borderRadius="full"
                                        bg={idx === currentIndex ? "black" : "gray.300"}
                                    />
                                ))}
                            </HStack>
                        </>
                    )}
                </Box>

                {/* Bottom Controls - White */}
                <Box bg="white" pb={10} pt={2} zIndex={20}>

                    {/* Rotation & Flip */}
                    <Flex justify="center" align="center" px={8} mb={6} gap={6}>
                        <Tooltip label="Rotar -90°">
                            <IconButton
                                aria-label="Rotate Left"
                                icon={<MdRotateLeft size={22} />}
                                variant="ghost"
                                color={secondary}
                                onClick={() => onRotateChange(rotation - 90)}
                                size="sm"
                                _hover={{ color: fg, bg: 'transparent' }}
                            />
                        </Tooltip>

                        {/* Slider */}
                        <Slider
                            aria-label="rotation"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            onChange={onRotateChange}
                            width="160px"
                            focusThumbOnChange={false}
                        >
                            <SliderTrack bg="gray.200" h="2px">
                                <SliderFilledTrack bg="black" />
                            </SliderTrack>
                            <SliderThumb boxSize={3} bg="black" borderWidth={2} borderColor="white" shadow="sm" />
                        </Slider>

                        {/* Flip Button */}
                        <Tooltip label="Voltear Horizontal">
                            <IconButton
                                aria-label="Flip"
                                icon={<MdFlip size={22} />}
                                variant="ghost"
                                color={scaleX === -1 ? 'black' : secondary}
                                bg={scaleX === -1 ? 'gray.100' : 'transparent'}
                                onClick={toggleFlip}
                                size="sm"
                                _hover={{ color: fg, bg: 'gray.50' }}
                            />
                        </Tooltip>
                    </Flex>

                    {/* Aspect Ratios - Minimalist Text/Icon */}
                    <Flex
                        justify="center"
                        align="center"
                        w="100%"
                        overflowX="auto"
                        px={4}
                        gap={8}
                        css={{
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {ASPECT_RATIOS.map((ratio) => {
                            const isActive = (isNaN(ratio.value) && isNaN(activeAspect)) || ratio.value === activeAspect;
                            return (
                                <VStack
                                    key={ratio.label}
                                    spacing={3}
                                    cursor="pointer"
                                    onClick={() => handleSetAspect(ratio.value)}
                                    align="center"
                                >
                                    <Box
                                        p={2}
                                        borderRadius="full"
                                        bg={isActive ? "black" : "transparent"}
                                        color={isActive ? "white" : "black"}
                                        border="1px solid"
                                        borderColor={isActive ? "black" : "gray.300"}
                                        transition="all 0.2s"
                                    >
                                        <Icon as={ratio.icon} boxSize={5} />
                                    </Box>
                                    <Text
                                        color={isActive ? "black" : "gray.500"}
                                        fontSize="xs"
                                        fontWeight={isActive ? "bold" : "medium"}
                                    >
                                        {ratio.label}
                                    </Text>
                                </VStack>
                            );
                        })}
                    </Flex>
                </Box>
            </ModalContent>
        </Modal>
    );
};
