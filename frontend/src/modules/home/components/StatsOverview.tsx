import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Icon,
  Skeleton,
  Tooltip,
  Stack,
} from "@chakra-ui/react";
import { FaFire, FaBolt, FaMedal, FaLeaf, FaChartLine } from "react-icons/fa6";
import { motion } from "framer-motion";
import type { UserStats } from "../../../services/userStatsService";
import type { UserRacha } from "../../../services/userRachasService";

const MotionBox = motion(Box);

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard = ({ icon, label, value, subtext, color, bgColor, delay = 0 }: StatCardProps) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    bg="white"
    p={{ base: 4, md: 5 }}
    borderRadius="32px"
    boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
    border="1px solid rgba(0,0,0,0.03)"
    _hover={{
      transform: "translateY(-5px)",
      boxShadow: "0 20px 40px -10px rgba(31, 64, 55, 0.1)"
    }}
    cursor="default"
  >
    <Stack align="center" textAlign="center" spacing={3}>
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        color={color}
        rounded="xl"
        bg={bgColor}
      >
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Box>
        <Text
          fontSize="xs"
          fontWeight="600"
          color="brand.textMuted"
          textTransform="uppercase"
          letterSpacing="wide"
          mb={0.5}
        >
          {label}
        </Text>
        <Text
          fontSize="xl"
          fontWeight="900"
          color="brand.secondary"
          lineHeight="1.2"
          mb={0.5}
        >
          {value}
        </Text>
        <Text
          fontSize="xs"
          color="brand.textMuted"
          fontWeight="500"
        >
          {subtext}
        </Text>
      </Box>
    </Stack>
  </MotionBox>
);

interface StatsOverviewProps {
  stats?: UserStats;
  racha?: UserRacha | null;
  loading: boolean;
}

export const StatsOverview = ({ stats, racha, loading }: StatsOverviewProps) => {
  if (loading) {
    return (
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height="80px" borderRadius="20px" />
        ))}
      </SimpleGrid>
    );
  }

  const isRachaActive = racha?.ultima_fecha && racha.ultima_fecha === new Date().toISOString().split('T')[0];
  const progressPercent = stats?.progress?.progreso_porcentaje || 0;

  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
      <StatCard
        icon={FaBolt}
        label="XP Total"
        value={stats?.puntos_totales?.toLocaleString() || "0"}
        subtext="Experiencia"
        color="brand.primary"
        bgColor="green.50"
        delay={0}
      />

      <StatCard
        icon={FaMedal}
        label="Nivel"
        value={`Nvl. ${stats?.nivel || 1}`}
        subtext="Explorador"
        color="purple.500"
        bgColor="purple.50"
        delay={0.05}
      />

      <Tooltip label="CO₂ evitado gracias a tus acciones ecológicas" hasArrow placement="top" bg="brand.secondary" color="white" borderRadius="xl" px={4} py={3} boxShadow="xl">
        <Box>
          <StatCard
            icon={FaLeaf}
            label="Impacto"
            value={`${stats?.kg_co2_ahorrado || 0} kg`}
            subtext="CO₂ evitado"
            color="green.500"
            bgColor="white"
            delay={0.1}
          />
        </Box>
      </Tooltip>

      <StatCard
        icon={FaFire}
        label="Racha"
        value={`${racha?.racha_actual || 0}${isRachaActive ? ' 🔥' : ''}`}
        subtext={isRachaActive ? "¡Activa!" : "Días seguidos"}
        color="orange.500"
        bgColor="orange.50"
        delay={0.15}
      />

      {/* Progress Card - Landing Page Style */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="32px"
        boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
        border="1px solid rgba(0,0,0,0.03)"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: "0 20px 40px -10px rgba(31, 64, 55, 0.1)"
        }}
      >
        <Stack align="center" textAlign="center" spacing={3}>
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            color="blue.500"
            rounded="xl"
            bg="blue.50"
          >
            <Icon as={FaChartLine} boxSize={6} />
          </Flex>

          <Box>
            <Text
              fontSize="xs"
              fontWeight="600"
              color="brand.textMuted"
              textTransform="uppercase"
              letterSpacing="wide"
              mb={1}
            >
              Progreso
            </Text>

            <Box w="full" maxW="150px">
              <Box
                h="6px"
                w="100%"
                bg="gray.100"
                borderRadius="full"
                overflow="hidden"
                mb={1}
              >
                <MotionBox
                  h="100%"
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  borderRadius="full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </Box>

              <Text fontSize="xs" color="brand.textMuted" fontWeight="500">
                {progressPercent}% → Nvl. {(stats?.nivel || 1) + 1}
              </Text>
            </Box>
          </Box>
        </Stack>
      </MotionBox>
    </SimpleGrid>
  );
};

export default StatsOverview;
