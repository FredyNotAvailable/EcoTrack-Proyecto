import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulseRing = keyframes`
  0% { transform: scale(0.33); }
  80%, 100% { opacity: 0; }
`;

const pulseDot = keyframes`
  0% { transform: scale(0.8); }
  50% { transform: scale(1); }
  100% { transform: scale(0.8); }
`;

interface LiveStatusProps {
    isActive: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
    showLabel?: boolean;
}

export const LiveStatus = ({
    isActive,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    showLabel = true
}: LiveStatusProps) => {
    const activeColor = 'green.500';
    const inactiveColor = 'red.500';
    const color = isActive ? activeColor : inactiveColor;

    return (
        <HStack spacing={3}>
            <Box
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="12px"
                h="12px"
            >
                {isActive && (
                    <Box
                        content='""'
                        position="absolute"
                        width="200%"
                        height="200%"
                        borderRadius="full"
                        bg={color}
                        animation={`${pulseRing} 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite`}
                    />
                )}
                <Box
                    width="100%"
                    height="100%"
                    borderRadius="full"
                    bg={color}
                    animation={isActive ? `${pulseDot} 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite` : undefined}
                />
            </Box>
            {showLabel && (
                <Text
                    fontSize="xs"
                    fontWeight="800"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={useColorModeValue('gray.600', 'gray.400')}
                >
                    {isActive ? activeLabel : inactiveLabel}
                </Text>
            )}
        </HStack>
    );
};
