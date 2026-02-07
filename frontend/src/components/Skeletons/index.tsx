import { Box, Skeleton, SkeletonText, VStack, HStack, SkeletonCircle } from '@chakra-ui/react';

/**
 * Skeleton genérico para páginas durante lazy loading
 */
export const PageSkeleton = () => (
  <Box p={4}>
    <Skeleton height="40px" width="200px" mb={6} borderRadius="md" />
    <VStack spacing={4} align="stretch">
      <Skeleton height="120px" borderRadius="lg" />
      <HStack spacing={4}>
        <Skeleton height="80px" flex={1} borderRadius="lg" />
        <Skeleton height="80px" flex={1} borderRadius="lg" />
      </HStack>
      <SkeletonText noOfLines={4} spacing={4} skeletonHeight={3} />
    </VStack>
  </Box>
);

/**
 * Skeleton para tarjetas individuales
 */
export const CardSkeleton = () => (
  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
    <HStack spacing={3} mb={3}>
      <SkeletonCircle size="10" />
      <VStack align="start" spacing={1} flex={1}>
        <Skeleton height="14px" width="120px" />
        <Skeleton height="10px" width="80px" />
      </VStack>
    </HStack>
    <SkeletonText noOfLines={3} spacing={2} skeletonHeight={2} />
  </Box>
);

/**
 * Skeleton para feed/lista de posts
 */
export const FeedSkeleton = () => (
  <VStack spacing={4} align="stretch">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </VStack>
);

/**
 * Skeleton específico para InicioPage
 */
export const InicioPageSkeleton = () => (
  <Box p={4}>
    {/* Header con saludo */}
    <HStack mb={6}>
      <SkeletonCircle size="12" />
      <VStack align="start" spacing={1}>
        <Skeleton height="20px" width="180px" />
        <Skeleton height="14px" width="120px" />
      </VStack>
    </HStack>
    
    {/* Stats cards */}
    <HStack spacing={4} mb={6}>
      {[1, 2, 3].map((i) => (
        <Box key={i} flex={1} p={4} borderRadius="lg" borderWidth="1px">
          <Skeleton height="16px" width="60px" mb={2} />
          <Skeleton height="32px" width="80px" />
        </Box>
      ))}
    </HStack>
    
    {/* Retos del día */}
    <Skeleton height="24px" width="150px" mb={4} />
    <VStack spacing={3} align="stretch">
      {[1, 2].map((i) => (
        <Box key={i} p={4} borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={2}>
            <Skeleton height="18px" width="200px" />
            <Skeleton height="24px" width="80px" borderRadius="full" />
          </HStack>
          <Skeleton height="8px" borderRadius="full" />
        </Box>
      ))}
    </VStack>
  </Box>
);

/**
 * Skeleton específico para RetosPage
 */
export const RetosPageSkeleton = () => (
  <Box p={4}>
    {/* Header */}
    <HStack justify="space-between" mb={6}>
      <Skeleton height="32px" width="200px" />
      <Skeleton height="40px" width="120px" borderRadius="md" />
    </HStack>
    
    {/* Tabs */}
    <HStack spacing={4} mb={6}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} height="36px" width="100px" borderRadius="md" />
      ))}
    </HStack>
    
    {/* Reto cards */}
    <VStack spacing={4} align="stretch">
      {[1, 2, 3].map((i) => (
        <Box key={i} p={5} borderRadius="xl" borderWidth="1px">
          <HStack mb={3}>
            <SkeletonCircle size="12" />
            <VStack align="start" spacing={1} flex={1}>
              <Skeleton height="18px" width="70%" />
              <Skeleton height="12px" width="40%" />
            </VStack>
          </HStack>
          <Skeleton height="10px" borderRadius="full" mb={3} />
          <HStack justify="space-between">
            <Skeleton height="14px" width="100px" />
            <Skeleton height="32px" width="100px" borderRadius="md" />
          </HStack>
        </Box>
      ))}
    </VStack>
  </Box>
);

/**
 * Skeleton específico para CommunityPage
 */
export const CommunityPageSkeleton = () => (
  <Box p={4}>
    {/* Header */}
    <Skeleton height="32px" width="180px" mb={6} />
    
    {/* Create post box */}
    <Box p={4} borderRadius="lg" borderWidth="1px" mb={6}>
      <HStack spacing={3}>
        <SkeletonCircle size="10" />
        <Skeleton height="40px" flex={1} borderRadius="full" />
      </HStack>
    </Box>
    
    {/* Posts feed */}
    <FeedSkeleton />
  </Box>
);

/**
 * Skeleton específico para RankingPage
 */
export const RankingPageSkeleton = () => (
  <Box p={4}>
    {/* Header */}
    <Skeleton height="32px" width="160px" mb={6} />
    
    {/* Top 3 podium */}
    <HStack justify="center" spacing={4} mb={8}>
      {[1, 2, 3].map((i) => (
        <VStack key={i} spacing={2}>
          <SkeletonCircle size={i === 2 ? "20" : "16"} />
          <Skeleton height="14px" width="80px" />
          <Skeleton height="20px" width="60px" />
        </VStack>
      ))}
    </HStack>
    
    {/* Ranking list */}
    <VStack spacing={3} align="stretch">
      {[4, 5, 6, 7, 8].map((i) => (
        <HStack key={i} p={3} borderRadius="lg" borderWidth="1px">
          <Skeleton height="24px" width="24px" />
          <SkeletonCircle size="10" />
          <Skeleton height="16px" width="120px" flex={1} />
          <Skeleton height="16px" width="60px" />
        </HStack>
      ))}
    </VStack>
  </Box>
);

/**
 * Skeleton específico para ProfilePage
 */
export const ProfilePageSkeleton = () => (
  <Box p={4}>
    {/* Profile header */}
    <VStack spacing={4} mb={8}>
      <SkeletonCircle size="24" />
      <Skeleton height="24px" width="150px" />
      <Skeleton height="14px" width="100px" />
      <HStack spacing={8}>
        {[1, 2, 3].map((i) => (
          <VStack key={i} spacing={1}>
            <Skeleton height="20px" width="40px" />
            <Skeleton height="12px" width="60px" />
          </VStack>
        ))}
      </HStack>
    </VStack>
    
    {/* Stats/badges */}
    <Skeleton height="24px" width="120px" mb={4} />
    <HStack spacing={4} mb={6}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height="60px" width="60px" borderRadius="lg" />
      ))}
    </HStack>
    
    {/* Recent activity */}
    <Skeleton height="24px" width="160px" mb={4} />
    <VStack spacing={3} align="stretch">
      {[1, 2].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </VStack>
  </Box>
);
