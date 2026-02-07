import {
  Box,
  Flex,
  Text,
  Icon,
  Skeleton,
  VStack,
  Button,
  Circle,
  Badge,
} from "@chakra-ui/react";
import { FaLeaf, FaArrowRight, FaFire, FaBolt } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Reto } from "../../retos/services/retos.service";

const MotionBox = motion(Box);

// Categoría a color e icono
const getCategoryStyle = (categoria: string) => {
  const styles: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    energia: { color: "orange.500", bg: "orange.50", icon: FaBolt },
    agua: { color: "cyan.500", bg: "cyan.50", icon: FaLeaf },
    transporte: { color: "purple.500", bg: "purple.50", icon: FaLeaf },
    residuos: { color: "green.500", bg: "green.50", icon: FaLeaf },
  };
  return styles[categoria] || styles.residuos;
};

interface ActiveChallengesProps {
  challenges: Reto[];
  loading: boolean;
}

export const ActiveChallenges = ({ challenges, loading }: ActiveChallengesProps) => {
  const navigate = useNavigate();
  const joinedChallenges = challenges.filter(r => r.joined && r.status !== 'completed').slice(0, 2);

  return (
    <Box
      p={{ base: 6, md: 8 }}
      bg="white"
      borderRadius="32px"
      boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
      border="1px solid rgba(0,0,0,0.03)"
      _hover={{ 
        transform: 'translateY(-5px)', 
        boxShadow: '0 20px 40px -10px rgba(31, 64, 55, 0.1)' 
      }}
      transition="all 0.3s"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            color="orange.500"
            rounded="xl"
            bg="orange.50"
          >
            <Icon as={FaFire} boxSize={6} />
          </Flex>
          <Box>
            <Text fontSize="lg" fontWeight="900" color="brand.secondary">
              Retos Activos
            </Text>
            <Text fontSize="xs" color="brand.textMuted" fontWeight="500">
              {joinedChallenges.length} en progreso
            </Text>
          </Box>
        </Flex>
        <Button
          variant="ghost"
          color="brand.primary"
          size="sm"
          fontSize="sm"
          fontWeight="700"
          rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
          onClick={() => navigate('/app/retos?tab=mis-retos&filter=active')}
          _hover={{ bg: 'green.50', transform: 'translateX(2px)' }}
          borderRadius="full"
          px={6}
          transition="all 0.2s"
        >
          Ver todos
        </Button>
      </Flex>

      {/* Content */}
      {loading ? (
        <VStack spacing={2} align="stretch">
          <Skeleton height="60px" borderRadius="16px" />
          <Skeleton height="60px" borderRadius="16px" />
        </VStack>
      ) : joinedChallenges.length > 0 ? (
        <VStack spacing={2} align="stretch">
          {joinedChallenges.map((reto, index) => {
            const style = getCategoryStyle(reto.categoria);
            return (
              <MotionBox
                key={reto.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                p={4}
                bg="gray.50"
                borderRadius="16px"
                cursor="pointer"
                position="relative"
                overflow="hidden"
                _hover={{ 
                  bg: "white", 
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)"
                }}
                onClick={() => navigate('/app/retos')}
              >
                <Flex align="center" gap={3}>
                  <Circle size="42px" bg={style.bg}>
                    <Icon as={style.icon} color={style.color} fontSize="md" />
                  </Circle>
                  <Box flex={1}>
                    <Flex align="center" gap={2} mb={1}>
                      <Text fontSize="sm" fontWeight="700" color="brand.secondary" noOfLines={1}>
                        {reto.titulo}
                      </Text>
                      <Badge 
                        colorScheme={reto.categoria === 'energia' ? 'orange' : reto.categoria === 'agua' ? 'cyan' : 'green'}
                        fontSize="0.6rem"
                        borderRadius="full"
                        px={2}
                        textTransform="capitalize"
                      >
                        {reto.categoria}
                      </Badge>
                    </Flex>
                    
                    {/* Progress Bar */}
                    <Box h="6px" w="100%" bg="gray.200" borderRadius="full" overflow="hidden" mb={1.5}>
                      <Box 
                        h="100%" 
                        w={`${reto.progress}%`} 
                        bg={style.color}
                        borderRadius="full" 
                        transition="width 0.3s ease"
                      />
                    </Box>
                    
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="brand.textMuted" fontWeight="500">
                        <Text as="span" color={style.color} fontWeight="700">{Math.round(reto.progress)}%</Text> completado
                      </Text>
                      <Text fontSize="xs" color="green.500" fontWeight="600">
                        +{reto.recompensa_kg_co2} kg CO₂
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </MotionBox>
            );
          })}
        </VStack>
      ) : (
        <Flex 
          direction="column" 
          align="center" 
          py={8} 
          bg="gray.50" 
          borderRadius="16px"
          border="2px dashed"
          borderColor="gray.200"
        >
          <Circle size="48px" bg="green.50" mb={3}>
            <Icon as={FaLeaf} color="brand.primary" fontSize="lg" />
          </Circle>
          <Text fontSize="sm" color="brand.secondary" fontWeight="600" mb={1}>
            ¿Listo para un desafío?
          </Text>
          <Text fontSize="xs" color="brand.textMuted" mb={3}>
            Únete a un reto y gana recompensas
          </Text>
          <Button
            size="sm"
            bg="brand.primary"
            color="white"
            borderRadius="full"
            fontWeight="700"
            px={5}
            _hover={{ bg: "brand.primaryHover", transform: "scale(1.02)" }}
            onClick={() => navigate('/app/retos')}
          >
            Explorar Retos
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default ActiveChallenges;
