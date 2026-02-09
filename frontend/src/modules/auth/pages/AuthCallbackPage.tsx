import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Spinner, useToast, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../AuthContext';
import { supabase } from '../../../config/supabase';
import { AuthService } from '../services/auth.service';
import { ProfileAPIService } from '../../profile/services/profile.service';
import { StorageService } from '../../shared/services/storage.service';
import { base64ToBlob } from '../../../utils/ImageConverter';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { session, loading: isLoading } = useAuth();
    const toast = useToast();
    const processed = useRef(false);

    useEffect(() => {
        const processAuth = async () => {
            if (isLoading || !session || processed.current) return;
            processed.current = true;

            try {
                // Verificar si venimos del proceso de Onboarding
                const onboardingDataStr = localStorage.getItem('onboarding_data');
                console.log("AuthCallbackPage: Checking onboarding_data:", onboardingDataStr);

                if (onboardingDataStr) {
                    // --- FLUJO DE REGISTRO ---
                    console.log("AuthCallbackPage: Starting registration flow");
                    const onboardingData = JSON.parse(onboardingDataStr);

                    // Validar que los datos no sean muy antiguos (máximo 10 minutos)
                    const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutos
                    const dataAge = Date.now() - (onboardingData.timestamp || 0);

                    if (dataAge > MAX_AGE_MS) {
                        console.warn('AuthCallbackPage: Onboarding data expired');
                        localStorage.removeItem('onboarding_data');
                        toast({
                            title: "Sesión expirada",
                            description: "Los datos del formulario expiraron. Por favor completa el registro nuevamente.",
                            status: "warning",
                            duration: 5000,
                            isClosable: true,
                        });
                        navigate('/onboarding');
                        return;
                    }

                    let avatarUrl = '';

                    // Si hay avatar en base64, subirlo primero
                    if (onboardingData.avatar_base64) {
                        try {
                            console.log("AuthCallbackPage: Uploading avatar...");
                            const blob = await base64ToBlob(onboardingData.avatar_base64);
                            const userId = session.user.id;
                            avatarUrl = await StorageService.uploadAvatar(userId, blob);
                            console.log("AuthCallbackPage: Avatar uploaded to:", avatarUrl);
                        } catch (uploadError) {
                            console.error("Error subiendo avatar:", uploadError);
                            // Continuamos sin avatar si falla
                            toast({
                                title: "Avatar no subido",
                                description: "No pudimos subir tu foto de perfil, pero tu cuenta fue creada.",
                                status: "warning",
                                duration: 3000,
                            });
                        }
                    }

                    // Preparar datos finales del perfil (limpiar y normalizar)
                    const profileData = {
                        username: onboardingData.username?.trim(),
                        bio: onboardingData.bio?.trim() || undefined,
                        avatar_url: avatarUrl || undefined
                    };

                    // Crear el perfil explícitamente
                    console.log("AuthCallbackPage: Calling ProfileAPIService.create with:", {
                        username: profileData.username,
                        hasBio: !!profileData.bio,
                        hasAvatar: !!profileData.avatar_url
                    });

                    await ProfileAPIService.create(profileData);
                    console.log("AuthCallbackPage: Profile created successfully");

                    // Limpiar datos y notificar
                    localStorage.removeItem('onboarding_data');
                    toast({
                        title: "¡Bienvenido a EcoTrack!",
                        description: "Tu cuenta ha sido creada exitosamente.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate('/app/inicio');

                } else {
                    // --- FLUJO DE LOGIN / CALLBACK GOOGLE ---
                    console.log("AuthCallbackPage: Callback Google / Login flow");

                    // 1. Obtener el ID del usuario
                    const userId = session.user.id;

                    // 2. Consultar Supabase directamente para ver si tiene perfil
                    console.log("AuthCallbackPage: Checking profile for userId:", userId);
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', userId)
                        .single();

                    const registered = !!profile && !profileError;
                    console.log("AuthCallbackPage: Registered status from Supabase:", registered);

                    // 3. Verificar origen
                    const authOrigin = localStorage.getItem('auth_origin');
                    localStorage.removeItem('auth_origin'); // Limpiar

                    if (registered) {
                        if (authOrigin === 'register') {
                            console.log("AuthCallbackPage: Account exists but origin was register. Signing out and warning.");
                            await AuthService.signOut();
                            toast({
                                title: "Cuenta ya registrada",
                                description: "Este correo ya tiene una cuenta. Por favor, inicia sesión.",
                                status: "warning",
                                duration: 5000,
                                isClosable: true,
                                position: "top"
                            });
                            navigate('/login');
                        } else {
                            toast({ title: "Sesión iniciada", status: "success", duration: 3000, position: "top" });
                            navigate('/app/inicio');
                        }
                    } else {
                        console.log("Usuario sin perfil. Redirigiendo a onboarding.");
                        toast({
                            title: "¡Ya casi estás!",
                            description: "Completa tu información para empezar.",
                            status: "info",
                            duration: 5000,
                            isClosable: true,
                            position: "top"
                        });
                        navigate('/onboarding');
                    }
                }
            } catch (error: any) {
                console.error("Error en auth callback:", error);
                toast({
                    title: "Error de autenticación",
                    description: error.message || "Ocurrió un problema inesperado.",
                    status: "error",
                    duration: 5000,
                    position: "top"
                });
                navigate('/login');
            }
        };

        if (!isLoading) {
            processAuth();
        }
    }, [session, isLoading, navigate, toast]);

    return (
        <Flex minH="100vh" align="center" justify="center" direction="column" bg="gray.50">
            <VStack spacing={6}>
                <Spinner size="xl" color="brand.primary" thickness="4px" />
                <VStack spacing={2}>
                    <Heading size="md" color="brand.secondary">Procesando tu cuenta...</Heading>
                    <Text color="gray.500">Estamos preparando todo para ti.</Text>
                </VStack>
            </VStack>
        </Flex>
    );
};

export default AuthCallbackPage;
