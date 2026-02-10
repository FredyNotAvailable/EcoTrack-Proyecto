import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    VStack,
    HStack,
    Text,
    Box,
    Avatar,
    Badge,
    SimpleGrid,
    Spinner,
    Center,
    Icon,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import {
    HiUser,
    HiLightningBolt,
    HiFlag,
    HiGlobe,
    HiCollection,
    HiTrendingUp,
    HiCalendar
} from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { AdminAPIService } from '../../services/admin.service';
import { UserStatsGrid } from './details/UserStatsGrid';
import { UserMissionsTab } from './details/UserMissionsTab';
import { UserChallengesTab } from './details/UserChallengesTab';
import { UserImpactTab } from './details/UserImpactTab';
import { UserPostsTab } from './details/UserPostsTab';
import { PostDetailModal } from './details/PostDetailModal';
import { EmptyState } from '../../shared/EmptyState';
import { LiveStatus } from '../../shared/LiveStatus';
import { motion } from 'framer-motion';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

const MotionBox = motion(Box);

export const UserDetailsModal = ({ isOpen, onClose, userId }: UserDetailsModalProps) => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState(0);
    const { isOpen: isPostOpen, onOpen: onPostOpen, onClose: onPostClose } = useDisclosure();

    // Color mode values - ALL hooks must be at the top level
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const tabSelectedColor = useColorModeValue('green.600', 'green.300');
    const tabSelectedBorder = useColorModeValue('green.500', 'green.300');
    const headerBg = useColorModeValue('white', 'gray.800');
    const bodyBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    const { data: details, isLoading } = useQuery({
        queryKey: ['admin', 'user-details', userId],
        queryFn: () => userId ? AdminAPIService.getUserDetails(userId) : null,
        enabled: !!userId && isOpen
    });

    const handlePostClick = (post: any) => {
        setSelectedPost(post);
        onPostOpen();
    };

    if (!userId) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" motionPreset='slideInBottom'>
                <ModalOverlay backdropFilter="blur(16px)" bg="blackAlpha.400" />
                <ModalContent borderRadius="3xl" minH="85vh" shadow="2xl" overflow="hidden">
                    <ModalCloseButton borderRadius="full" mt={4} mr={4} zIndex={10} />
                    <ModalHeader borderBottom="1px solid" borderColor={borderColor} py={6} px={8} bg={headerBg}>
                        <HStack spacing={4}>
                            <Box p={3} bg="brand.50" borderRadius="2xl" color="brand.500">
                                <Icon as={HiUser} boxSize={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontSize="2xl" fontWeight="900">Perfil del Eco-Ciudadano</Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Expediente Administrativo Completo</Text>
                            </VStack>
                        </HStack>
                    </ModalHeader>
                    <ModalBody p={0} bg={bodyBg}>
                        {isLoading ? (
                            <Center h="60vh">
                                <VStack spacing={4}>
                                    <Spinner size="xl" color="brand.500" thickness="4px" />
                                    <Text fontWeight="bold" color="gray.500">Recuperando expediente...</Text>
                                </VStack>
                            </Center>
                        ) : details ? (
                            <Tabs colorScheme="brand" variant="line" index={tabIndex} onChange={setTabIndex} isLazy>
                                <TabList px={8} pt={2} bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
                                    {[
                                        { label: 'Resumen', icon: HiUser },
                                        { label: 'Misiones', icon: HiLightningBolt },
                                        { label: 'Retos', icon: HiFlag },
                                        { label: 'Impacto', icon: HiGlobe },
                                        { label: 'Posts', icon: HiCollection },
                                    ].map((tab, index) => (
                                        <Tab
                                            key={index}
                                            fontWeight="800"
                                            fontSize="sm"
                                            py={4}
                                            px={6}
                                            _selected={{
                                                color: tabSelectedColor,
                                                borderColor: tabSelectedBorder,
                                                borderBottomWidth: '3px',
                                            }}
                                        >
                                            <Icon as={tab.icon} mr={2} boxSize={5} /> {tab.label}
                                        </Tab>
                                    ))}
                                </TabList>

                                <TabPanels>
                                    {/* TAB 1: RESUMEN */}
                                    <TabPanel p={8}>
                                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="start">
                                            <VStack spacing={6} align="stretch">
                                                <MotionBox
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    textAlign="center"
                                                    p={8}
                                                    borderRadius="3xl"
                                                    bgGradient="linear(to-br, brand.400, brand.600)"
                                                    color="white"
                                                    position="relative"
                                                    overflow="hidden"
                                                    shadow="lg"
                                                >
                                                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgImage="url('/patterns/noise.png')" opacity={0.1} />
                                                    <VStack spacing={4} position="relative" zIndex={1}>
                                                        <Avatar size="2xl" src={details.profile?.avatar_url} name={details.profile?.username} border="4px solid white" shadow="2xl" />
                                                        <Box>
                                                            <Text fontSize="lg" fontWeight="900">
                                                                @{details.profile?.username}
                                                            </Text>
                                                            <Text fontSize="sm" opacity={0.9} fontWeight="500">
                                                                {details.profile?.email}
                                                            </Text>
                                                        </Box>
                                                        <HStack spacing={3}>
                                                            <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full" fontSize="xs" textTransform="uppercase" backdropFilter="blur(10px)">
                                                                {details.profile?.rol}
                                                            </Badge>
                                                            <LiveStatus
                                                                isActive={details.profile?.activo}
                                                                showLabel={false}
                                                            />
                                                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                                                                {details.profile?.activo ? 'Activo' : 'Inactivo'}
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                </MotionBox>

                                                <Box p={6} borderRadius="3xl" bg={cardBg} border="1px solid" borderColor={borderColor} shadow="sm">
                                                    <VStack align="stretch" spacing={5}>
                                                        <HStack justify="space-between">
                                                            <HStack color="gray.500"><Icon as={HiCalendar} /><Text fontSize="sm" fontWeight="700">Miembro desde</Text></HStack>
                                                            <Text fontSize="sm" fontWeight="800">{new Date(details.profile?.created_at).toLocaleDateString()}</Text>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <HStack color="gray.500"><Icon as={HiTrendingUp} /><Text fontSize="sm" fontWeight="700">Última actividad</Text></HStack>
                                                            <Text fontSize="sm" fontWeight="800">{new Date(details.profile?.updated_at || details.profile?.created_at).toLocaleDateString()}</Text>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <Box gridColumn={{ lg: 'span 2' }}>
                                                <UserStatsGrid stats={details.stats} racha={details.racha} />
                                            </Box>
                                        </SimpleGrid>
                                    </TabPanel>

                                    {/* TAB 2: MISIONES */}
                                    <TabPanel p={8}>
                                        <UserMissionsTab misiones={details.misiones} />
                                    </TabPanel>

                                    {/* TAB 3: RETOS */}
                                    <TabPanel p={8}>
                                        <UserChallengesTab retos={details.retos} />
                                    </TabPanel>

                                    {/* TAB 4: IMPACTO */}
                                    <TabPanel p={8}>
                                        <UserImpactTab logs={details.logs} />
                                    </TabPanel>

                                    {/* TAB 5: POSTS */}
                                    <TabPanel p={8}>
                                        <UserPostsTab posts={details.posts} onPostClick={handlePostClick} />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        ) : (
                            <Center py={40}>
                                <EmptyState
                                    title="Error de Carga"
                                    description="No se pudo recuperar la información del expediente."
                                    icon={HiUser}
                                />
                            </Center>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <PostDetailModal isOpen={isPostOpen} onClose={onPostClose} post={selectedPost} />
        </>
    );
};
