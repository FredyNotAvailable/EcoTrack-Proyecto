
import { Box, VStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FaLeaf } from "react-icons/fa";

interface PostPlaceholderProps {
    minH?: string | object;
    fontSize?: string;
    iconSize?: number;
}

export const PostPlaceholder = ({ minH = "300px", fontSize = "sm", iconSize = 10 }: PostPlaceholderProps) => {
    const bg = useColorModeValue("gray.50", "whiteAlpha.50");
    const iconColor = useColorModeValue("brand.primary", "brand.primary");
    const textColor = useColorModeValue("gray.400", "gray.500");

    return (
        <Box
            w="100%"
            h="100%"
            minH={minH}
            bg={bg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="inherit"
            position="relative"
            overflow="hidden"
        >
            {/* Subtle Decorative Background Element */}
            <Box
                position="absolute"
                top="-10%"
                right="-10%"
                w="40%"
                h="40%"
                bg="brand.primary"
                opacity={0.05}
                borderRadius="full"
                filter="blur(40px)"
            />
            <Box
                position="absolute"
                bottom="-10%"
                left="-10%"
                w="40%"
                h="40%"
                bg="brand.accent"
                opacity={0.05}
                borderRadius="full"
                filter="blur(40px)"
            />

            <VStack spacing={3}>
                <Icon
                    as={FaLeaf}
                    w={iconSize}
                    h={iconSize}
                    color={iconColor}
                    opacity={0.6}
                />
                <Text
                    fontSize={fontSize}
                    color={textColor}
                    fontWeight="medium"
                    letterSpacing="wider"
                    textTransform="uppercase"
                >
                    Sin multimedia
                </Text>
            </VStack>
        </Box>
    );
};
