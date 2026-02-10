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

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export const UserDetailsModal = ({ isOpen, onClose, userId }: UserDetailsModalProps) => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState(0);
    const { isOpen: isPostOpen, onOpen: onPostOpen, onClose: onPostClose } = useDisclosure();

    // Color mode values - MUST be at the top level
    const borderColor = useColorModeValue('gray.200', 'gray.700');

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
            <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="3xl" minH="80vh">
                    <ModalCloseButton borderRadius="full" />
                    <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                        <HStack spacing={4}>
                            <Icon as={HiUser} boxSize={6} color="brand.500" />
                            <Text>Expediente Completo del Usuario</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalBody p={0}>
                        {isLoading ? (
                            <Center py={40}>
                                <VStack>
                                    <Spinner size="xl" color="brand.500" thickness="4px" />
                                    <Text color="gray.500" mt={4}>Cargando información del usuario...</Text>
                                </VStack>
                            </Center>
                        ) : details ? (
                            <Tabs colorScheme="brand" variant="enclosed" index={tabIndex} onChange={setTabIndex}>
                                <TabList px={8} pt={6} borderBottom="2px solid" borderColor={borderColor}>
                                    <Tab
                                        fontWeight="bold"
                                        _selected={{
                                            color: useColorModeValue('green.600', 'green.300'),
                                            borderColor: useColorModeValue('green.500', 'green.300'),
                                            borderBottomWidth: '3px',
                                            bg: useColorModeValue('green.50', 'green.900'),
                                            borderTopRadius: 'lg'
                                        }}
                                    >
                                        <Icon as={HiUser} mr={2} /> Resumen
                                    </Tab>
                                    <Tab
                                        fontWeight="bold"
                                        _selected={{
                                            color: useColorModeValue('green.600', 'green.300'),
                                            borderColor: useColorModeValue('green.500', 'green.300'),
                                            borderBottomWidth: '3px',
                                            bg: useColorModeValue('green.50', 'green.900'),
                                            borderTopRadius: 'lg'
                                        }}
                                    >
                                        <Icon as={HiLightningBolt} mr={2} /> Misiones
                                    </Tab>
                                    <Tab
                                        fontWeight="bold"
                                        _selected={{
                                            color: useColorModeValue('green.600', 'green.300'),
                                            borderColor: useColorModeValue('green.500', 'green.300'),
                                            borderBottomWidth: '3px',
                                            bg: useColorModeValue('green.50', 'green.900'),
                                            borderTopRadius: 'lg'
                                        }}
                                    >
                                        <Icon as={HiFlag} mr={2} /> Retos
                                    </Tab>
                                    <Tab
                                        fontWeight="bold"
                                        _selected={{
                                            color: useColorModeValue('green.600', 'green.300'),
                                            borderColor: useColorModeValue('green.500', 'green.300'),
                                            borderBottomWidth: '3px',
                                            bg: useColorModeValue('green.50', 'green.900'),
                                            borderTopRadius: 'lg'
                                        }}
                                    >
                                        <Icon as={HiGlobe} mr={2} /> Impacto
                                    </Tab>
                                    <Tab
                                        fontWeight="bold"
                                        _selected={{
                                            color: useColorModeValue('green.600', 'green.300'),
                                            borderColor: useColorModeValue('green.500', 'green.300'),
                                            borderBottomWidth: '3px',
                                            bg: useColorModeValue('green.50', 'green.900'),
                                            borderTopRadius: 'lg'
                                        }}
                                    >
                                        <Icon as={HiCollection} mr={2} /> Posts
                                    </Tab>
                                </TabList>

                                <TabPanels>
                                    {/* TAB 1: RESUMEN */}
                                    <TabPanel p={8}>
                                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="start">
                                            <VStack spacing={6} align="stretch">
                                                <Box textAlign="center" p={8} borderRadius="3xl" bg={useColorModeValue('gradient.primary', 'gray.800')} color="white" position="relative" overflow="hidden">
                                                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-br, brand.400, brand.600)" opacity={0.9} />
                                                    <VStack spacing={4} position="relative" zIndex={1}>
                                                        <Avatar size="2xl" src={details.profile?.avatar_url} name={details.profile?.username} border="4px solid white" shadow="2xl" />
                                                        <Box>
                                                            <Text fontSize="sm" opacity={0.9} color="gray.900">
                                                                @{details.profile?.username}
                                                            </Text>
                                                        </Box>
                                                        <HStack>
                                                            <Badge colorScheme="whiteAlpha" px={3} py={1} borderRadius="full" fontSize="xs" textTransform="uppercase">
                                                                {details.profile?.rol}
                                                            </Badge>
                                                            <Badge colorScheme={details.profile?.activo ? 'green' : 'red'} px={3} py={1} borderRadius="full" fontSize="xs">
                                                                {details.profile?.activo ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </HStack>
                                                    </VStack>
                                                </Box>

                                                <Box p={6} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                                                    <VStack align="stretch" spacing={4}>
                                                        <HStack justify="space-between">
                                                            <HStack><Icon as={HiCalendar} color="gray.400" /><Text fontSize="sm" fontWeight="medium">Miembro desde</Text></HStack>
                                                            <Text fontSize="sm" fontWeight="bold">{new Date(details.profile?.created_at).toLocaleDateString()}</Text>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <HStack><Icon as={HiTrendingUp} color="gray.400" /><Text fontSize="sm" fontWeight="medium">Última actividad</Text></HStack>
                                                            <Text fontSize="sm" fontWeight="bold">{new Date(details.profile?.updated_at).toLocaleDateString()}</Text>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            </VStack>

                                            <UserStatsGrid stats={details.stats} racha={details.racha} />
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
                                <Text color="gray.500">No se pudo cargar la información del usuario.</Text>
                            </Center>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <PostDetailModal isOpen={isPostOpen} onClose={onPostClose} post={selectedPost} />
        </>
    );
};
