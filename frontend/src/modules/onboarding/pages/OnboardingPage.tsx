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
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { convertToWebP, fileToBase64 } from "../../../utils/ImageConverter";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileAPIService } from "../../profile/services/profile.service";
import { StorageService } from "../../shared/services/storage.service";
import { supabase } from "../../../config/supabase";
import { FaArrowLeft, FaCamera, FaLeaf, FaUserAstronaut } from "react-icons/fa";
import { validateUsername, validateBio } from "../../profile/utils/profileValidation";
import { getProfileErrorMessage, isRecoverableError, getRetryDelay } from "../../profile/utils/profileErrors";

const OnboardingPage = () => {
    const { signInWithGoogle, user, signUp, isRegistered } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const bg = useColorModeValue("brand.bgBody", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");

    // Redirigir si ya está registrado (por ejemplo, si la verificación falló inicialmente pero luego tuvo éxito)
    useEffect(() => {
        if (isRegistered) {
            navigate('/app/inicio', { replace: true });
        }
    }, [isRegistered, navigate]);

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
        usernameMessage: '',
        acceptedTerms: false,
        bio: false,
        bioMessage: ''
    });

    const [retryCount, setRetryCount] = useState(0);

    // Validar en tiempo real para mejor UX
    const isFormValid = formData.username.trim().length >= 3 &&
        formData.acceptedTerms &&
        validateUsername(formData.username).valid &&
        validateBio(formData.bio).valid;

    const validate = () => {
        const usernameValidation = validateUsername(formData.username);
        const bioValidation = validateBio(formData.bio);

        const newErrors = {
            username: !usernameValidation.valid,
            usernameMessage: usernameValidation.error || '',
            acceptedTerms: !formData.acceptedTerms,
            bio: !bioValidation.valid,
            bioMessage: bioValidation.error || ''
        };

        setErrors(newErrors);
        return usernameValidation.valid && bioValidation.valid && formData.acceptedTerms;
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
                console.log('[Onboarding] Processing deferred registration');
                await signUp({ email: deferredCreds.email, password: deferredCreds.password });
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // Upload Avatar if needed
                    if (avatarFile) {
                        console.log('[Onboarding] Uploading avatar');
                        avatarUrl = await StorageService.uploadAvatar(session.user.id, avatarFile);
                    }

                    console.log('[Onboarding] Creating profile with data:', {
                        username: formData.username,
                        hasBio: !!formData.bio,
                        hasAvatar: !!avatarUrl
                    });

                    await ProfileAPIService.create({
                        username: formData.username.trim(),
                        bio: formData.bio.trim() || undefined,
                        avatar_url: avatarUrl || undefined
                    });

                    toast({
                        title: "¡Bienvenido a bordo!",
                        description: "Tu perfil ha sido creado exitosamente.",
                        status: "success",
                        duration: 3000
                    });
                    navigate("/app/inicio");
                    return;
                }
            }

            // 2. Usuario ya autenticado (Google)
            if (user) {
                console.log('[Onboarding] User already authenticated, creating profile');
                if (avatarFile) {
                    console.log('[Onboarding] Uploading avatar');
                    avatarUrl = await StorageService.uploadAvatar(user.id, avatarFile);
                }

                console.log('[Onboarding] Creating profile with data:', {
                    username: formData.username,
                    hasBio: !!formData.bio,
                    hasAvatar: !!avatarUrl
                });

                await ProfileAPIService.create({
                    username: formData.username.trim(),
                    bio: formData.bio.trim() || undefined,
                    avatar_url: avatarUrl || undefined
                });

                toast({
                    title: "¡Perfil listo!",
                    description: "Es hora de empezar a hacer el cambio.",
                    status: "success",
                    duration: 3000
                });
                navigate("/app/inicio");
                return;
            }

            // 3. Fallback (Guest -> Google)
            console.log('[Onboarding] Guest user, saving data for OAuth callback');
            let avatarBase64 = "";
            if (avatarFile) {
                avatarBase64 = await fileToBase64(avatarFile);
            }

            // Agregar timestamp para validar frescura de datos
            localStorage.setItem("onboarding_data", JSON.stringify({
                username: formData.username.trim(),
                bio: formData.bio.trim(),
                avatar_base64: avatarBase64,
                timestamp: Date.now()
            }));

            await signInWithGoogle();

        } catch (error: any) {
            console.error('[Onboarding] Error creating profile:', error);

            // Si el perfil ya existe (409), redirigir al dashboard
            if (error?.response?.status === 409 || error?.message?.includes('ya existe') || error?.code === 'DUPLICATE_USERNAME') {
                toast({
                    title: "¡Ya estás registrado!",
                    description: "Tu perfil ya existe. Redirigiendo a tu inicio...",
                    status: "success",
                    duration: 3000,
                });
                navigate("/app/inicio");
                return;
            }

            // Limpiar localStorage si hay error
            localStorage.removeItem('onboarding_data');

            // Obtener mensaje de error específico
            const errorDetails = getProfileErrorMessage(error);

            // Verificar si es un error recuperable
            if (isRecoverableError(error) && retryCount < 3) {
                const delay = getRetryDelay(retryCount + 1);

                toast({
                    title: errorDetails.title,
                    description: `${errorDetails.description}. Reintentando en ${delay / 1000}s...`,
                    status: "warning",
                    duration: delay,
                });

                // Reintentar después del delay
                setTimeout(() => {
                    setRetryCount(retryCount + 1);
                    handleContinue();
                }, delay);

                return;
            }

            // Mostrar error específico
            toast({
                title: errorDetails.title,
                description: errorDetails.description,
                status: "error",
                duration: 5000,
                isClosable: true
            });

            // Si hay una acción sugerida, mostrarla
            if (errorDetails.action) {
                toast({
                    title: "💡 Sugerencia",
                    description: errorDetails.action,
                    status: "info",
                    duration: 4000,
                    isClosable: true
                });
            }

            // Resetear contador de reintentos
            setRetryCount(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box minH="100vh" h="100vh" bg={bg} py={4} position="relative" overflow="hidden" display="flex" alignItems="center">
            {/* Decorative Background Elements */}
            <Box position="absolute" top="-10%" right="-10%" w="400px" h="400px" bg="brand.primary" opacity="0.05" rounded="full" blur="3xl" />
            <Box position="absolute" bottom="-10%" left="-10%" w="300px" h="300px" bg="brand.secondary" opacity="0.05" rounded="full" blur="2xl" />

            <IconButton
                icon={<Icon as={FaArrowLeft} />}
                aria-label="Volver"
                position="absolute"
                top={4}
                left={4}
                onClick={() => navigate('/login')}
                variant="ghost"
                color="brand.textMuted"
                _hover={{ bg: 'whiteAlpha.500' }}
                size="sm"
            />

            <Container maxW="lg">
                <VStack spacing={4}>
                    <VStack spacing={1} textAlign="center">
                        <Icon as={FaLeaf} w={8} h={8} color="brand.primary" />
                        <Heading size="lg" fontWeight="900" color="brand.secondary" lineHeight="1.2">
                            Configura tu <Text as="span" color="brand.primary">Perfil de Guardián</Text>
                        </Heading>
                        <Text color="brand.textMuted" fontSize="sm">
                            Solo unos pasos más para unirte a la comunidad.
                        </Text>
                    </VStack>

                    <Box
                        bg={cardBg}
                        p={{ base: 5, md: 6 }}
                        borderRadius="3xl"
                        boxShadow="2xl"
                        w="full"
                        as="form"
                        position="relative"
                        zIndex={1}
                    >
                        <VStack spacing={4}>
                            {/* Avatar Section */}
                            <Center position="relative">
                                <Box position="relative">
                                    <Avatar
                                        size="xl"
                                        src={avatarPreview}
                                        name={formData.username || "G"}
                                        bg="brand.bgCardLight"
                                        color="brand.primary"
                                        border="3px solid white"
                                        boxShadow="lg"
                                        icon={<Icon as={FaUserAstronaut} fontSize="2rem" />}
                                    />
                                    <IconButton
                                        aria-label="Subir foto"
                                        icon={<Icon as={FaCamera} />}
                                        size="xs"
                                        isRound
                                        bg="brand.primary"
                                        color="white"
                                        _hover={{ bg: "brand.primaryHover", transform: "scale(1.1)" }}
                                        position="absolute"
                                        bottom="0"
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

                            <Text fontSize="xs" color="brand.textMuted" textAlign="center" mt={-2}>
                                Sube una foto para que la comunidad te reconozca
                            </Text>

                            <FormControl isInvalid={errors.username} isRequired>
                                <FormLabel fontWeight="700" color="brand.secondary" pl={1} fontSize="sm" mb={1}>
                                    ¿Cómo quieres llamarte?
                                </FormLabel>
                                <Input
                                    placeholder="Ej: @EcoGuerrero2025"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    borderRadius="xl"
                                    height="44px"
                                    focusBorderColor="brand.primary"
                                    bg="brand.bgBody"
                                    border="none"
                                    _focus={{ bg: "white", boxShadow: "0 0 0 2px var(--chakra-colors-brand-primary)" }}
                                />
                                {errors.username && (
                                    <FormErrorMessage fontSize="xs">{errors.usernameMessage || 'El nombre es muy corto (mínimo 3 letras).'}</FormErrorMessage>
                                )}
                            </FormControl>

                            <FormControl isInvalid={errors.bio}>
                                <FormLabel fontWeight="700" color="brand.secondary" pl={1} fontSize="sm" mb={1}>
                                    Tu Manifiesto <Badge colorScheme="green" ml={1} rounded="full" fontSize="0.55em">Opcional</Badge>
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
                                    rows={2}
                                    maxLength={300}
                                    fontSize="sm"
                                />
                                <Flex justify="flex-end" mt={1}>
                                    <Text fontSize="xs" color={formData.bio.length > 250 ? "orange.400" : "gray.400"}>
                                        {formData.bio.length}/300
                                    </Text>
                                </Flex>
                            </FormControl>

                            <FormControl isInvalid={errors.acceptedTerms} isRequired>
                                <Stack direction="row" align="start" bg="brand.bgBody" p={3} borderRadius="xl" cursor="pointer" onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}>
                                    <Checkbox
                                        colorScheme="green"
                                        isChecked={formData.acceptedTerms}
                                        onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                        mt={0.5}
                                    />
                                    <Box>
                                        <Text fontSize="xs" fontWeight="600" color="brand.secondary">
                                            Compromiso de Honor
                                        </Text>
                                        <Text fontSize="xs" color="brand.textMuted">
                                            Acepto los <Text as="span" color="brand.primary" fontWeight="bold">Términos del Servicio</Text> y me comprometo a ser un miembro respetuoso.
                                        </Text>
                                    </Box>
                                </Stack>
                                {errors.acceptedTerms && <FormErrorMessage fontSize="xs">Necesitamos tu compromiso para continuar.</FormErrorMessage>}
                            </FormControl>

                            <Button
                                w="full"
                                size="md"
                                bgGradient="linear(to-r, brand.primary, brand.secondary)"
                                color="white"
                                _hover={{ opacity: 0.9, transform: "translateY(-2px)", boxShadow: "lg" }}
                                _active={{ transform: "translateY(0)" }}
                                borderRadius="2xl"
                                h="48px"
                                fontSize="md"
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
