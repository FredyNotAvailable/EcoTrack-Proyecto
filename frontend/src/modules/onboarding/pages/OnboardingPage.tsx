import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    Heading,
    Text,
    Checkbox,
    useToast,
    FormErrorMessage,
    Icon,
    Avatar,
    IconButton,
    Center,
    useColorModeValue,
    Stack,
    Badge,
    Flex
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { convertToWebP, fileToBase64 } from "../../../utils/ImageConverter";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileAPIService } from "../../profile/services/profile.service";
import { StorageService } from "../../shared/services/storage.service";
import { supabase } from "../../../config/supabase";
import { FaArrowLeft, FaCamera, FaLeaf, FaUserAstronaut } from "react-icons/fa";

const OnboardingPage = () => {
    const { signInWithGoogle, user, signUp } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const bg = useColorModeValue("brand.bgBody", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");

    const [formData, setFormData] = useState({
        username: "",
        bio: "",
        acceptedTerms: false
    });

    const [avatarFile, setAvatarFile] = useState<Blob | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        username: false,
        acceptedTerms: false,
        bio: false
    });

    // Validar en tiempo real para mejor UX
    const isFormValid = formData.username.trim().length >= 3 && formData.acceptedTerms;

    const validate = () => {
        const newErrors = {
            username: formData.username.trim().length < 3,
            acceptedTerms: !formData.acceptedTerms,
            bio: formData.bio.length > 300
        };
        setErrors(newErrors);
        return !newErrors.username && !newErrors.acceptedTerms;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const webpBlob = await convertToWebP(file);
                const previewUrl = URL.createObjectURL(webpBlob);
                setAvatarFile(webpBlob);
                setAvatarPreview(previewUrl);
            } catch (error) {
                toast({
                    title: "Ups, algo salió mal con la imagen",
                    description: "Intenta con otra imagen más ligera.",
                    status: "warning",
                    duration: 3000,
                });
            }
        }
    };

    const handleContinue = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            let avatarUrl = "";
            const deferredCreds = location.state as { email?: string; password?: string } | null;

            // 1. Manejo de Registro Diferido y Creación de Sesión
            if (deferredCreds?.email && deferredCreds?.password) {
                await signUp({ email: deferredCreds.email, password: deferredCreds.password });
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // Upload Avatar if needed
                    if (avatarFile) {
                        avatarUrl = await StorageService.uploadAvatar(session.user.id, avatarFile);
                    }
                    await ProfileAPIService.create({
                        username: formData.username,
                        bio: formData.bio,
                        avatar_url: avatarUrl
                    });
                    toast({ title: "¡Bienvenido a bordo!", description: "Tu perfil ha sido creado.", status: "success", duration: 3000 });
                    navigate("/app/inicio");
                    return;
                }
            }

            // 2. Usuario ya autenticado (Google)
            if (user) {
                if (avatarFile) {
                    avatarUrl = await StorageService.uploadAvatar(user.id, avatarFile);
                }
                await ProfileAPIService.create({
                    username: formData.username,
                    bio: formData.bio,
                    avatar_url: avatarUrl
                });
                toast({ title: "¡Perfil listo!", description: "Es hora de empezar a hacer el cambio.", status: "success", duration: 3000 });
                navigate("/app/inicio");
                return;
            }

            // 3. Fallback (Guest -> Google)
            let avatarBase64 = "";
            if (avatarFile) {
                avatarBase64 = await fileToBase64(avatarFile);
            }
            localStorage.setItem("onboarding_data", JSON.stringify({
                username: formData.username,
                bio: formData.bio,
                avatar_base64: avatarBase64
            }));
            await signInWithGoogle();

        } catch (error: any) {
            toast({
                title: "Error al crear perfil",
                description: "Parece que hubo un pequeño problema. Inténtalo de nuevo.", // getAuthErrorMessage(error) puede ser muy técnico
                status: "error",
                duration: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box minH="100vh" bg={bg} py={20} position="relative" overflow="hidden">
            {/* Decorative Background Elements */}
            <Box position="absolute" top="-10%" right="-10%" w="400px" h="400px" bg="brand.primary" opacity="0.05" rounded="full" blur="3xl" />
            <Box position="absolute" bottom="-10%" left="-10%" w="300px" h="300px" bg="brand.secondary" opacity="0.05" rounded="full" blur="2xl" />

            <IconButton
                icon={<Icon as={FaArrowLeft} />}
                aria-label="Volver"
                position="absolute"
                top={6}
                left={6}
                onClick={() => navigate('/login')}
                variant="ghost"
                color="brand.textMuted"
                _hover={{ bg: 'whiteAlpha.500' }}
            />

            <Container maxW="lg">
                <VStack spacing={10}>
                    <VStack spacing={3} textAlign="center">
                        <Icon as={FaLeaf} w={12} h={12} color="brand.primary" mb={2} />
                        <Heading size="xl" fontWeight="900" color="brand.secondary" lineHeight="1.2">
                            Configura tu <br />
                            <Text as="span" color="brand.primary">Perfil de Guardián</Text>
                        </Heading>
                        <Text color="brand.textMuted" fontSize="lg">
                            Solo unos pasos más para unirte a la comunidad que está transformando el mundo.
                        </Text>
                    </VStack>

                    <Box
                        bg={cardBg}
                        p={{ base: 6, md: 10 }}
                        borderRadius="3xl"
                        boxShadow="2xl"
                        w="full"
                        as="form"
                        position="relative"
                        zIndex={1}
                    >
                        <VStack spacing={6}>
                            {/* Avatar Section */}
                            <Center position="relative" mb={2}>
                                <Box position="relative">
                                    <Avatar
                                        size="2xl"
                                        src={avatarPreview}
                                        name={formData.username || "G"}
                                        bg="brand.bgCardLight"
                                        color="brand.primary"
                                        border="4px solid white"
                                        boxShadow="xl"
                                        icon={<Icon as={FaUserAstronaut} fontSize="3rem" />}
                                    />
                                    <IconButton
                                        aria-label="Subir foto"
                                        icon={<Icon as={FaCamera} />}
                                        size="sm"
                                        isRound
                                        bg="brand.primary"
                                        color="white"
                                        _hover={{ bg: "brand.primaryHover", transform: "scale(1.1)" }}
                                        position="absolute"
                                        bottom="2"
                                        right="0"
                                        boxShadow="md"
                                        onClick={() => fileInputRef.current?.click()}
                                    />
                                </Box>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Center>

                            <Text fontSize="sm" color="brand.textMuted" textAlign="center" mt={-4}>
                                Sube una foto para que la comunidad te reconozca
                            </Text>

                            <FormControl isInvalid={errors.username} isRequired>
                                <FormLabel fontWeight="700" color="brand.secondary" pl={1}>
                                    ¿Cómo quieres llamarte?
                                </FormLabel>
                                <Input
                                    placeholder="Ej: @EcoGuerrero2025"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    borderRadius="xl"
                                    height="50px"
                                    focusBorderColor="brand.primary"
                                    bg="brand.bgBody"
                                    border="none"
                                    _focus={{ bg: "white", boxShadow: "0 0 0 2px var(--chakra-colors-brand-primary)" }}
                                />
                                {errors.username && (
                                    <FormErrorMessage>El nombre es muy corto (mínimo 3 letras).</FormErrorMessage>
                                )}
                            </FormControl>

                            <FormControl isInvalid={errors.bio}>
                                <FormLabel fontWeight="700" color="brand.secondary" pl={1}>
                                    Tu Manifiesto Personal <Badge colorScheme="green" ml={2} rounded="full" fontSize="0.6em">Opcional</Badge>
                                </FormLabel>
                                <Textarea
                                    placeholder="Cuéntanos qué te inspira a cuidar el planeta..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    borderRadius="xl"
                                    focusBorderColor="brand.primary"
                                    bg="brand.bgBody"
                                    border="none"
                                    _focus={{ bg: "white", boxShadow: "0 0 0 2px var(--chakra-colors-brand-primary)" }}
                                    rows={3}
                                    maxLength={300}
                                />
                                <Flex justify="flex-end" mt={1}>
                                    <Text fontSize="xs" color={formData.bio.length > 250 ? "orange.400" : "gray.400"}>
                                        {formData.bio.length}/300
                                    </Text>
                                </Flex>
                            </FormControl>

                            <FormControl isInvalid={errors.acceptedTerms} isRequired>
                                <Stack direction="row" align="start" bg="brand.bgBody" p={4} borderRadius="xl" cursor="pointer" onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}>
                                    <Checkbox
                                        colorScheme="green"
                                        isChecked={formData.acceptedTerms}
                                        onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                        mt={1}
                                    />
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="brand.secondary">
                                            Compromiso de Honor
                                        </Text>
                                        <Text fontSize="xs" color="brand.textMuted">
                                            Acepto los <Text as="span" color="brand.primary" fontWeight="bold">Términos del Servicio</Text> y me comprometo a ser un miembro respetuoso de la comunidad EcoTrack.
                                        </Text>
                                    </Box>
                                </Stack>
                                {errors.acceptedTerms && <FormErrorMessage>Necesitamos tu compromiso para continuar.</FormErrorMessage>}
                            </FormControl>

                            <Button
                                w="full"
                                size="lg"
                                bgGradient="linear(to-r, brand.primary, brand.secondary)"
                                color="white"
                                _hover={{ opacity: 0.9, transform: "translateY(-2px)", boxShadow: "lg" }}
                                _active={{ transform: "translateY(0)" }}
                                borderRadius="2xl"
                                h="56px"
                                fontSize="lg"
                                fontWeight="800"
                                onClick={handleContinue}
                                isLoading={isSubmitting}
                                loadingText="Creando tu espacio..."
                                isDisabled={!isFormValid}
                                transition="all 0.2s"
                            >
                                ¡Comenzar mi Aventura!
                            </Button>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default OnboardingPage;
