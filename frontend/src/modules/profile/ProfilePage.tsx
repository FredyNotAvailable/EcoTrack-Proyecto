import {
    Box,
    Heading,
    Text,
    Flex,
    Avatar,
    VStack,
    HStack,
    Icon,
    SimpleGrid,
    Progress,
    Card,
    Button,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    useToast,
    Spinner,
} from "@chakra-ui/react";
import {
    FaLeaf,
    FaTrophy,
    FaFire,
    FaSeedling,
    FaGlobeAmericas,
    FaMedal,
    FaCheckCircle,
    FaUserEdit,
} from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useAuth } from "../auth/AuthContext";
import { useRef, useState } from "react";
import { ProfileAPIService } from "./services/profile.service";
import { StorageService } from "../shared/services/storage.service";
import { convertToWebP } from "../../utils/ImageConverter";
import { FaCamera } from "react-icons/fa";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

import { useQuery, useQueryClient } from "@tanstack/react-query";
// React Query for fetching stats
import { userStatsService } from "../../services/userStatsService";
import { userRachasService } from "../../services/userRachasService";

const ProfilePage = () => {
    const { user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Form State
    const [editForm, setEditForm] = useState({ username: "", bio: "" });
    const [avatarFile, setAvatarFile] = useState<Blob | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const cardBg = useColorModeValue("white", "gray.800");

    // Replace manual fetch with useQuery
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: ProfileAPIService.getMe,
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const { data: stats } = useQuery({
        queryKey: ['userStats', user?.id],
        queryFn: () => userStatsService.getUserStats(),
        enabled: !!user?.id,
    });

    const { data: racha } = useQuery({
        queryKey: ['userRacha', user?.id],
        queryFn: () => userRachasService.getMyRacha(),
        enabled: !!user?.id,
    });

    const isMe = true;


    // Initialize form when opening modal
    const handleOpenEdit = () => {
        if (profile) {
            setEditForm({
                username: profile.username || "",
                bio: profile.bio || ""
            });
        }
        onOpen();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const webpBlob = await convertToWebP(file);
                setAvatarFile(webpBlob);
                setAvatarPreview(URL.createObjectURL(webpBlob));
            } catch (error) {
                toast({
                    title: "Error al procesar imagen",
                    status: "error",
                    duration: 3000,
                });
            }
        }
    };

    const handleSaveProfile = async () => {
        if (editForm.bio.length > 300) {
            toast({
                title: "Biografía demasiado larga",
                description: "Máximo 300 caracteres.",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        if (editForm.username.trim().length === 0) {
            toast({
                title: "Campo requerido",
                description: "El nombre de usuario no puede estar vacío.",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSaving(true);
        try {
            let updatedData: any = { ...editForm };

            // Si hay nueva imagen, subirla
            if (avatarFile && user?.id) {
                const url = await StorageService.uploadAvatar(user.id, avatarFile);
                updatedData.avatar_url = url;
            }

            // Update profile
            await ProfileAPIService.updateMe(updatedData);

            // Invalidate query to refetch data
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            toast({
                title: "Perfil actualizado",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            // Limpia estados temporales
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error: any) {
            toast({
                title: "Error al actualizar",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Flex h="60vh" align="center" justify="center">
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Flex>
        );
    }

    // Process Real Stats
    const currentPoints = stats?.puntos_totales || 0;
    const currentLevel = stats?.nivel || 1;
    const xpForNextLevel = 1000;
    // If stats don't provide precise XP, estimate:
    const currentLevelXp = currentPoints % 1000;
    const progressPercent = (currentLevelXp / xpForNextLevel) * 100;

    const profileData = {
        name: profile?.username || "Usuario",
        username: profile?.username ? `@${profile.username}` : "",
        avatar_url: profile?.avatar_url || "",
        bio: profile?.bio ?? "Sin biografía.",
        level: currentLevel,
        xp: currentLevelXp,
        nextLevelXp: xpForNextLevel,
        stats: [
            { label: "Puntos Totales", value: currentPoints.toLocaleString(), icon: FaTrophy, color: "brand.accentPurple" },
            { label: "CO₂ Ahorrado", value: `${(stats?.kg_co2_ahorrado || 0).toFixed(1)} kg`, icon: FaGlobeAmericas, color: "brand.primary" },
            { label: "Retos Completados", value: (stats?.retos_completados || 0).toString(), icon: FaLeaf, color: "brand.accent" },
            // Racha placeholdler
            { label: "Racha Actual", value: `${racha?.racha_actual || 0} días`, icon: FaFire, color: "orange.400" },
        ],
        badges: [
            { name: "Primer Paso", icon: FaSeedling, color: "green.400" },
        ]
    };

    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            {/* Header Section (Card-like) */}
            <Card
                borderRadius="24px"
                overflow="hidden"
                boxShadow="0 4px 20px rgba(0,0,0,0.05)"
                border="1px solid"
                borderColor="gray.100"
                mb={12}
                p={{ base: 6, md: 8 }}
            >
                <Flex direction={{ base: "column", md: "row" }} gap={8} align="start">
                    {/* Avatar */}
                    <Avatar
                        size="2xl"
                        src={profileData.avatar_url}
                        name={profileData.name}
                        border="4px solid"
                        borderColor="brand.primary"
                        boxShadow="lg"
                        bg="brand.primary"
                        color="white"
                    />

                    {/* Info Area */}
                    <VStack align="start" flex={1} spacing={4} w="full">
                        <Flex justify="space-between" align="start" w="full" wrap="wrap" gap={4}>
                            <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                    <Heading size="lg" color="brand.secondary">
                                        {profileData.name}
                                    </Heading>
                                    <Icon as={FaCheckCircle} color="blue.400" w={5} h={5} />
                                </HStack>
                                <Text color="brand.textMuted" fontSize="lg" fontWeight="medium">
                                    {profileData.username}
                                </Text>
                            </VStack>

                            {/* Action Button - Only if isMe */}
                            {isMe && (
                                <Button
                                    variant="outline"
                                    borderRadius="12px"
                                    px={6}
                                    fontWeight="600"
                                    borderColor="gray.200"
                                    _hover={{ bg: "gray.50" }}
                                    fontSize="sm"
                                    leftIcon={<Icon as={FaUserEdit} />}
                                    onClick={handleOpenEdit}
                                >
                                    Editar perfil
                                </Button>
                            )}
                        </Flex>

                        {/* Bio moved here */}
                        <Text color="brand.textMuted" lineHeight="tall" maxW="800px">
                            {profileData.bio}
                        </Text>

                        <HStack pt={2} spacing={2} color="gray.500" fontSize="sm">
                            <Icon as={FaSeedling} color="brand.primary" />
                            <Text fontWeight="medium">Miembro desde: Enero 2024</Text>
                        </HStack>
                    </VStack>
                </Flex>
            </Card>

            {/* Content Grid */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>

                {/* Left Column: Info & Bio */}
                <VStack spacing={6} align="stretch">
                    <Card p={6} borderRadius="24px" boxShadow="0 10px 30px rgba(0,0,0,0.05)">
                        <Heading size="md" mb={4} color="brand.secondary">Insignias</Heading>
                        <Flex flexWrap="wrap" gap={3}>
                            {profileData.badges.map((badge, idx) => (
                                <Box key={idx} textAlign="center">
                                    <Flex
                                        w="60px"
                                        h="60px"
                                        bg="brand.bgCardLight"
                                        borderRadius="full"
                                        align="center"
                                        justify="center"
                                        mb={1}
                                        _hover={{ transform: "scale(1.1)", bg: badge.color, color: "white" }}
                                        transition="all 0.2s"
                                    >
                                        <Icon as={badge.icon} fontSize="1.5rem" />
                                    </Flex>
                                    <Text fontSize="xs" fontWeight="bold">{badge.name}</Text>
                                </Box>
                            ))}
                        </Flex>
                    </Card>
                </VStack>

                {/* Right Column: Stats & Progress */}
                <VStack spacing={6} align="stretch" gridColumn={{ lg: "span 2" }}>

                    {/* Level Progress */}
                    <Card p={6} borderRadius="24px" boxShadow="0 10px 30px rgba(0,0,0,0.05)">
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack>
                                <Icon as={FaMedal} color="orange.300" fontSize="xl" />
                                <Heading size="md" color="brand.secondary">Nivel {profileData.level}</Heading>
                            </HStack>
                            <Text fontWeight="bold" color="brand.textMuted">
                                {profileData.xp} / {profileData.nextLevelXp} XP
                            </Text>
                        </Flex>
                        <Progress
                            value={progressPercent}
                            borderRadius="full"
                            size="lg"
                            colorScheme="green"
                            bg="brand.bgCardLight"
                        />
                        <Text mt={3} fontSize="sm" color="brand.textMuted">
                            {isMe
                                ? `¡Te faltan ${xpForNextLevel - currentLevelXp} XP para el Nivel ${profileData.level + 1}!`
                                : `Progreso: ${Math.round(progressPercent)}% hacia el siguiente nivel`}
                        </Text>
                    </Card>

                    {/* Stats Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {profileData.stats.map((stat, idx) => (
                            <Card
                                key={idx}
                                p={5}
                                borderRadius="20px"
                                bg={cardBg}
                                border="1px solid"
                                borderColor="gray.50"
                                transition="all 0.3s"
                                _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                            >
                                <HStack spacing={4}>
                                    <Flex
                                        p={3}
                                        bg={`${stat.color}15`}
                                        borderRadius="14px"
                                        color={stat.color}
                                    >
                                        <Icon as={stat.icon} fontSize="1.5rem" />
                                    </Flex>
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color="brand.secondary">
                                            {stat.value}
                                        </Text>
                                        <Text fontSize="sm" color="brand.textMuted">
                                            {stat.label}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </Card>
                        ))}
                    </SimpleGrid>

                </VStack>
            </SimpleGrid>

            {/* Modal de Edición */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="24px" p={2}>
                    <ModalHeader color="brand.secondary">Editar Perfil</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6}>
                            {/* Avatar Edit Section */}
                            <Box position="relative">
                                <Avatar
                                    size="2xl"
                                    src={avatarPreview || profile?.avatar_url}
                                    name={profile?.username}
                                    border="4px solid white"
                                    boxShadow="md"
                                    opacity={avatarPreview ? 1 : 0.8}
                                />
                                <Box
                                    position="absolute"
                                    bottom="0"
                                    right="0"
                                    bg="brand.primary"
                                    w="32px"
                                    h="32px"
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor="pointer"
                                    boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                                    onClick={() => fileInputRef.current?.click()}
                                    _hover={{ transform: "scale(1.1)", transition: "all 0.2s" }}
                                >
                                    <Icon as={FaCamera} color="white" w={4} h={4} />
                                </Box>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    display="none"
                                    onChange={handleFileChange}
                                />
                            </Box>

                            <FormControl>
                                <FormLabel fontWeight="bold">Nombre de usuario</FormLabel>
                                <Input
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    borderRadius="12px"
                                    focusBorderColor="brand.primary"
                                    placeholder="Ej: ecoguerrero"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="bold">
                                    Bio <Text as="span" fontSize="xs" color={editForm.bio.length > 300 ? "red.500" : "gray.500"}>
                                        ({editForm.bio.length}/300)
                                    </Text>
                                </FormLabel>
                                <Textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    borderRadius="12px"
                                    focusBorderColor={editForm.bio.length > 300 ? "red.500" : "brand.primary"}
                                    placeholder="Cuéntanos sobre tu compromiso con el medio ambiente..."
                                    rows={4}
                                    maxLength={300}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="12px">
                            Cancelar
                        </Button>
                        <Button
                            bg="brand.primary"
                            color="white"
                            _hover={{ bg: "brand.primaryHover" }}
                            borderRadius="12px"
                            onClick={handleSaveProfile}
                            isLoading={isSaving}
                            px={8}
                        >
                            Guardar cambios
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ProfilePage;
