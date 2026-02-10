import {
  Box,
  Flex,
  Text,
  Icon,
  Skeleton,
  VStack,
  Circle,
} from "@chakra-ui/react";
import { FaLeaf, FaCheck, FaBolt, FaDroplet, FaCar, FaRecycle, FaStar } from "react-icons/fa6";
import { motion } from "framer-motion";
import type { DailyMission } from "../services/misiones.service";

const MotionBox = motion(Box);

// Categoría a icono y color
const getCategoryStyle = (categoria: string) => {
  const styles: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    energia: { color: "orange.500", bg: "orange.50", icon: FaBolt },
    agua: { color: "cyan.500", bg: "cyan.50", icon: FaDroplet },
    transporte: { color: "purple.500", bg: "purple.50", icon: FaCar },
    residuos: { color: "green.500", bg: "green.50", icon: FaRecycle },
  };
  return styles[categoria] || { color: "brand.primary", bg: "green.50", icon: FaLeaf };
};

interface MissionCardProps {
  mission: DailyMission;
  onClick: () => void;
  index: number;
}

const MissionCard = ({ mission, onClick }: Omit<MissionCardProps, 'index'>) => {
  const style = getCategoryStyle(mission.categoria);

  return (
    <MotionBox
      p={3}
      bg={mission.completed ? "green.50" : "gray.50"}
      borderRadius="16px"
      cursor="pointer"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={mission.completed ? "green.200" : "transparent"}
      _hover={{
        bg: mission.completed ? "green.100" : "white",
        boxShadow: mission.completed ? "0 2px 8px rgba(34, 197, 94, 0.15)" : "0 6px 20px rgba(0,0,0,0.1)",
        transform: mission.completed ? "scale(1.02)" : "translateY(-4px)",
        borderColor: mission.completed ? "green.300" : style.color
      }}
      onClick={onClick}
      opacity={mission.completed ? 0.95 : 1}
    >
      <Flex align="center" gap={2}>
        <Circle
          size="36px"
          bg={mission.completed ? "green.100" : style.bg}
          border="2px solid"
          borderColor={mission.completed ? "green.300" : style.color}
          flexShrink={0}
          position="relative"
          _before={mission.completed ? {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: 'full',
            bg: 'linear-gradient(45deg, green.300, green.500)',
            zIndex: -1,
            opacity: 0.3
          } : {}}
        >
          {mission.completed ? (
            <Icon as={FaCheck} color="green.600" fontSize="md" />
          ) : (
            <Icon as={style.icon} color={style.color} fontSize="md" />
          )}
        </Circle>

        <Box flex={1} minW={0}>
          <Text
            fontSize="sm"
            fontWeight="700"
            color={mission.completed ? "gray.500" : "brand.secondary"}
            noOfLines={2}
            textDecoration={mission.completed ? "line-through" : "none"}
            lineHeight="1.3"
          >
            {mission.titulo}
          </Text>
          <Flex align="center" gap={3} mt={1}>
            <Text
              fontSize="xs"
              fontWeight="800"
              color={mission.completed ? "green.600" : "brand.primary"}
              bg={mission.completed ? "green.100" : "blue.50"}
              px={2}
              py={0.5}
              borderRadius="full"
            >
              +{mission.puntos} XP
            </Text>
            <Text
              fontSize="xs"
              color="brand.textMuted"
              textTransform="capitalize"
              fontWeight="600"
            >
              {mission.categoria}
            </Text>
          </Flex>
        </Box>
      </Flex>
    </MotionBox>
  );
};

interface DailyMissionsWidgetProps {
  missions: DailyMission[];
  loading: boolean;
  onMissionClick: (mission: DailyMission) => void;
}

export const DailyMissionsWidget = ({
  missions,
  loading,
  onMissionClick
}: DailyMissionsWidgetProps) => {
  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      h="full"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'md'
      }}
      transition="all 0.3s"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center" gap={3}>
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            color="purple.500"
            rounded="xl"
            bg="purple.50"
          >
            <Icon as={FaStar} boxSize={6} />
          </Flex>
          <Box>
            <Text fontSize="lg" fontWeight="900" color="brand.secondary">
              Misiones Diarias
            </Text>
            <Text fontSize="xs" color="brand.textMuted" fontWeight="500">
              Completa para ganar XP
            </Text>
          </Box>
        </Flex>
        <Flex
          align="center"
          bg={allCompleted ? "green.50" : "gray.50"}
          px={4}
          py={2}
          borderRadius="full"
          border="1px solid"
          borderColor={allCompleted ? "green.200" : "gray.200"}
        >
          <Text
            fontSize="sm"
            fontWeight="800"
            color={allCompleted ? "green.700" : "brand.secondary"}
          >
            {completedCount}/{totalCount}
          </Text>
        </Flex>
      </Flex>

      {/* Progress Bar */}
      <Box mb={5}>
        <Box
          h="10px"
          w="100%"
          bg="gray.100"
          borderRadius="full"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box
            h="100%"
            w={`${progress}%`}
            bgGradient={allCompleted ? "linear(to-r, green.400, green.600)" : "linear(to-r, purple.400, purple.600, brand.primary)"}
            borderRadius="full"
            transition="width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            position="relative"
            _after={!allCompleted ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient: "linear(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: progress > 0 ? "shimmer 2s infinite" : "none"
            } : {}}
          />
        </Box>
        {allCompleted && (
          <Text fontSize="sm" color="green.600" fontWeight="700" mt={2} textAlign="center">
            🎉 ¡Todas las misiones completadas!
          </Text>
        )}
      </Box>

      {/* Missions List */}
      <VStack spacing={2} align="stretch">
        {loading ? (
          <>
            <Skeleton height="60px" borderRadius="14px" />
            <Skeleton height="60px" borderRadius="14px" />
            <Skeleton height="60px" borderRadius="14px" />
          </>
        ) : missions.length > 0 ? (
          missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => onMissionClick(mission)}
            />
          ))
        ) : (
          <Flex direction="column" align="center" py={6} textAlign="center">
            <Circle size="48px" bg="green.50" mb={3}>
              <Icon as={FaLeaf} color="brand.primary" fontSize="lg" />
            </Circle>
            <Text color="brand.secondary" fontWeight="600" fontSize="sm">
              ¡Todo listo por hoy!
            </Text>
            <Text fontSize="xs" color="brand.textMuted">
              Vuelve mañana para más misiones
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default DailyMissionsWidget;
