import { VStack, Icon, Text, Box, useColorModeValue, Button } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { HiOutlineInbox } from 'react-icons/hi';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: IconType;
    actionLabel?: string;
    onAction?: () => void;
}

const MotionVStack = motion(VStack);

export const EmptyState = ({
    title,
    description,
    icon = HiOutlineInbox,
    actionLabel,
    onAction
}: EmptyStateProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const iconColor = useColorModeValue('brand.500', 'brand.300');
    const textColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <MotionVStack
            spacing={6}
            py={20}
            px={8}
            bg={bg}
            borderRadius="3xl"
            border="2px dashed"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box
                p={6}
                bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
                borderRadius="full"
                color={iconColor}
            >
                <Icon as={icon} boxSize={12} />
            </Box>

            <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="900" color={useColorModeValue('gray.700', 'white')}>
                    {title}
                </Text>
                <Text fontSize="sm" color={textColor} maxW="400px" fontWeight="600">
                    {description}
                </Text>
            </VStack>

            {actionLabel && onAction && (
                <Button
                    colorScheme="brand"
                    onClick={onAction}
                    borderRadius="xl"
                    px={8}
                    shadow="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                >
                    {actionLabel}
                </Button>
            )}
        </MotionVStack>
    );
};
