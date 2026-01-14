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
    useColorModeValue
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { FaGoogle, FaLeaf, FaCamera, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { convertToWebP, fileToBase64 } from "../../../utils/ImageConverter";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileAPIService } from "../../profile/services/profile.service";
import { StorageService } from "../../shared/services/storage.service";
import { supabase } from "../../../config/supabase";

const OnboardingPage = () => {
    const { signInWithGoogle, user, signUp } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const bg = useColorModeValue("gray.50", "gray.900");
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
                // Optimizar imagen
                const webpBlob = await convertToWebP(file);
                const previewUrl = URL.createObjectURL(webpBlob);

                setAvatarFile(webpBlob);
                setAvatarPreview(previewUrl);
            } catch (error) {
                toast({
                    title: "Error de imagen",
                    description: "No se pudo procesar la imagen seleccionada.",
                    status: "error",
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

            // CASO 1: Registro Diferido (Email/Pass vienen del RegisterForm)
            if (deferredCreds?.email && deferredCreds?.password) {
                // a) Crear usuario Auth
                await signUp({ email: deferredCreds.email, password: deferredCreds.password });

                // b) Obtener sesión refrescada
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // c) Subir avatar si existe
                    if (avatarFile) {
                        avatarUrl = await StorageService.uploadAvatar(session.user.id, avatarFile);
                    }
                    // d) Crear Profile
                    await ProfileAPIService.create({
                        username: formData.username,
                        bio: formData.bio,
                        avatar_url: avatarUrl
                    }); // createMe usa el token actual internamente vía axios interceptor

                    toast({ title: "Cuenta creada con éxito", status: "success", duration: 3000 });
                    navigate("/app/inicio");
                    return;
                }
            }

            // CASO 2: Usuario ya autenticado (ej: Google sin perfil)
            if (user) {
                if (avatarFile) {
                    avatarUrl = await StorageService.uploadAvatar(user.id, avatarFile);
                }
                await ProfileAPIService.create({
                    username: formData.username,
                    bio: formData.bio,
                    avatar_url: avatarUrl
                });
                toast({ title: "¡Bienvenido!", status: "success", duration: 3000 });
                navigate("/app/inicio");
                return;
            }

            // CASO 3: Guest (fallback a Google Auth)
            let avatarBase64 = "";
            if (avatarFile) {
                try {
                    avatarBase64 = await fileToBase64(avatarFile);
                } catch (e) {
                    console.error("Error convirtiendo avatar a base64", e);
                }
            }
            // Guardar para recuperar tras redirect
            localStorage.setItem("onboarding_data", JSON.stringify({
                username: formData.username,
                bio: formData.bio,
                avatar_base64: avatarBase64
            }));
            await signInWithGoogle();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Ocurrió un error.",
                status: "error",
                duration: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box minH="100vh" bg={bg} py={20} position="relative">
            <IconButton
                icon={<Icon as={FaArrowLeft} />}
                aria-label="Volver al login"
                position="absolute"
                top={4}
                left={4}
                onClick={() => navigate('/auth/login')}
                variant="ghost"
                color="gray.600"
            />
            <Container maxW="md">
                <VStack spacing={8}>
                    <Icon as={FaLeaf} w={12} h={12} color="brand.primary" />

                    <VStack spacing={2} textAlign="center">
                        <Heading size="xl" color="brand.secondary">Bienvenido a EcoTrack</Heading>
                        <Text color="brand.textMuted">Antes de empezar, cuéntanos un poco sobre ti.</Text>
                    </VStack>

                    <Box
                        bg={cardBg}
                        p={8}
                        borderRadius="24px"
                        boxShadow="lg"
                        w="full"
                        as="form"
                    >
                        <VStack spacing={5}>
                            {/* Avatar Upload */}
                            <Center position="relative" mb={4}>
                                <Avatar
                                    size="2xl"
                                    src={avatarPreview}
                                    name={formData.username}
                                    bg="brand.primary"
                                    color="white"
                                />
                                <IconButton
                                    aria-label="Subir foto de perfil"
                                    icon={<Icon as={FaCamera} />}
                                    size="sm"
                                    rounded="full"
                                    colorScheme="green"
                                    position="absolute"
                                    bottom="0"
                                    right="25%" // Centrado visual ajustado
                                    onClick={() => fileInputRef.current?.click()}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Center>

                            <FormControl isInvalid={errors.username} isRequired>
                                <FormLabel fontWeight="bold">Nombre de usuario</FormLabel>
                                <Input
                                    placeholder="@usuario"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    borderRadius="12px"
                                    focusBorderColor="brand.primary"
                                />
                                {errors.username && <FormErrorMessage>El usuario debe tener al menos 3 caracteres.</FormErrorMessage>}
                            </FormControl>

                            <FormControl isInvalid={errors.bio}>
                                <FormLabel fontWeight="bold">
                                    Biografía (Opcional) <Text as="span" fontSize="xs" color={formData.bio.length > 300 ? "red.500" : "gray.500"}>
                                        ({formData.bio.length}/300)
                                    </Text>
                                </FormLabel>
                                <Textarea
                                    placeholder="¿Qué te motiva a cuidar el planeta?"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    borderRadius="12px"
                                    focusBorderColor="brand.primary"
                                    maxLength={300}
                                />
                                {errors.bio && <FormErrorMessage>La biografía no puede exceder los 300 caracteres.</FormErrorMessage>}
                            </FormControl>

                            <FormControl isInvalid={errors.acceptedTerms} isRequired>
                                <Checkbox
                                    colorScheme="green"
                                    isChecked={formData.acceptedTerms}
                                    onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                >
                                    Acepto los <Text as="span" color="brand.primary" cursor="pointer">Términos y Condiciones</Text>
                                </Checkbox>
                                {errors.acceptedTerms && <FormErrorMessage>Debes aceptar los términos.</FormErrorMessage>}
                            </FormControl>

                            <Button
                                w="full"
                                size="lg"
                                bg="brand.primary"
                                color="white"
                                _hover={{ bg: "brand.primaryHover" }}
                                borderRadius="12px"
                                // leftIcon={user ? undefined : <Icon as={FaGoogle} />}
                                onClick={handleContinue}
                                mt={4}
                                isLoading={isSubmitting}
                            >
                                {user ? "Completar Registro" : "Crear cuenta"}
                            </Button>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default OnboardingPage;
