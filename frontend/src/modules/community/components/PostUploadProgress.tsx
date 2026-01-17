
import { Box, HStack, Text, Progress, useColorModeValue, Image as ChakraImage, Icon, Flex } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaCloudUploadAlt } from "react-icons/fa";

export interface UploadState {
    previewUrl: string | null;
    progress: number;
    status: 'uploading' | 'creating' | 'success' | 'error';
    message: string;
}

interface PostUploadProgressProps {
    upload: UploadState | null;
}

export const PostUploadProgress = ({ upload }: PostUploadProgressProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    if (!upload) return null;

    return (
        <AnimatePresence>
            <Box
                as={motion.div}
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: "1.5rem" }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                overflow="hidden"
                w="100%"
            >
                <Box
                    p={3}
                    bg={bg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow="sm"
                >
                    <HStack spacing={4} align="center">
                        {/* Thumbnail */}
                        <Box
                            w="48px"
                            h="48px"
                            borderRadius="lg"
                            overflow="hidden"
                            bg="gray.100"
                            flexShrink={0}
                        >
                            {upload.previewUrl ? (
                                <ChakraImage
                                    src={upload.previewUrl}
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                />
                            ) : (
                                <Flex w="100%" h="100%" align="center" justifyContent="center">
                                    <Icon as={FaCloudUploadAlt} color="gray.400" />
                                </Flex>
                            )}
                        </Box>

                        {/* Progress Details */}
                        <Box flex={1}>
                            <HStack justify="space-between" mb={1}>
                                <Text fontSize="sm" fontWeight="bold" color={upload.status === 'success' ? 'brand.primary' : 'gray.600'}>
                                    {upload.message}
                                </Text>
                                {upload.status === 'success' && (
                                    <Icon as={FaCheckCircle} color="brand.primary" />
                                )}
                            </HStack>
                            <Progress
                                value={upload.progress}
                                size="xs"
                                colorScheme={upload.status === 'success' ? 'green' : 'green'}
                                borderRadius="full"
                                bg="gray.100"
                                transition="all 0.3s"
                                isIndeterminate={upload.status === 'creating'}
                            />
                        </Box>
                    </HStack>
                </Box>
            </Box>
        </AnimatePresence>
    );
};
