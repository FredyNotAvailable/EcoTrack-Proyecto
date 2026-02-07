import {
  Box,
  Flex,
  Text,
  Icon,
  Skeleton,
  SkeletonText,
  Circle,
} from "@chakra-ui/react";
import { FaLightbulb } from "react-icons/fa6";
import { motion } from "framer-motion";
import type { DailyTip as DailyTipType } from "../services/consejos.service";

const MotionBox = motion(Box);

interface DailyTipProps {
  tip: DailyTipType | null;
  loading: boolean;
}

export const DailyTip = ({ tip, loading }: DailyTipProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      p={{ base: 5, md: 6 }}
      bgGradient="linear(135deg, #FFF9E6 0%, #FFF3CC 100%)"
      borderRadius="24px"
      boxShadow="0 2px 12px rgba(0,0,0,0.04)"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="orange.100"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        right="-20px"
        bottom="-20px"
        opacity={0.15}
      >
        <Icon as={FaLightbulb} fontSize="6rem" color="orange.400" />
      </Box>

      {/* Header */}
      <Flex align="center" gap={3} mb={3}>
        <Circle size="36px" bg="white" boxShadow="sm">
          <Icon as={FaLightbulb} color="orange.400" fontSize="md" />
        </Circle>
        <Text fontSize="sm" fontWeight="700" color="orange.600" letterSpacing="wide">
          CONSEJO DEL DÍA
        </Text>
      </Flex>

      {/* Content */}
      {loading ? (
        <>
          <Skeleton height="16px" width="70%" mb={2} borderRadius="md" />
          <SkeletonText mt="1" noOfLines={2} spacing="2" skeletonHeight="2" />
        </>
      ) : tip ? (
        <Box position="relative" zIndex={1}>
          <Text 
            fontSize={{ base: "md", md: "lg" }} 
            fontWeight="700" 
            mb={2} 
            color="brand.secondary"
            lineHeight="1.3"
          >
            {tip.titulo}
          </Text>
          <Text 
            color="gray.600" 
            fontSize={{ base: "sm", md: "md" }} 
            lineHeight="1.6" 
            fontWeight="500"
          >
            {tip.descripcion}
          </Text>
        </Box>
      ) : (
        <Text color="brand.textMuted" fontSize="sm" fontWeight="500">
          Hoy no hay consejo, ¡pero tú ya eres sabio! 🦉
        </Text>
      )}
    </MotionBox>
  );
};

export default DailyTip;
