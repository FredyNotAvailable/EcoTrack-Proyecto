import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Spinner, useToast, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../AuthContext';
import { supabase } from '../../../config/supabase';
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
                    let avatarUrl = '';

                    // Si hay avatar en base64, subirlo primero
                    if (onboardingData.avatar_base64) {
                        try {
                            console.log("AuthCallbackPage: Uploading avatar...");
                            const blob = await base64ToBlob(onboardingData.avatar_base64);
                            // Usar StorageService para subir
                            const userId = session.user.id;
                            avatarUrl = await StorageService.uploadAvatar(userId, blob);
                            console.log("AuthCallbackPage: Avatar uploaded to:", avatarUrl);
                        } catch (uploadError) {
                            console.error("Error subiendo avatar:", uploadError);
                            // Continuamos sin avatar si falla, notificando al log
                        }
                    }

                    // Preparar datos finales del perfil
                    const profileData = {
                        username: onboardingData.username,
                        bio: onboardingData.bio,
                        avatar_url: avatarUrl // Añadimos la URL si existe
                    };

                    // Crear el perfil explícitamente
                    console.log("AuthCallbackPage: Calling ProfileAPIService.create with:", profileData);
                    await ProfileAPIService.create(profileData);
                    console.log("AuthCallbackPage: Create successful");

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
                    // --- FLUJO DE LOGIN ---
                    console.log("AuthCallbackPage: Login flow (no onboarding data)");
                    // Verificar si el usuario ya tiene perfil
                    try {
                        const profile = await ProfileAPIService.getMe();
                        console.log("AuthCallbackPage: Profile found", profile);

                        // Si no lanza error, el perfil existe
                        toast({
                            title: "Sesión iniciada",
                            status: "success",
                            duration: 3000,
                        });
                        navigate('/app/inicio');

                    } catch (error) {
                        // Si falla (404), es un usuario de Google sin perfil (Cuenta Fantasma)
                        // REGLA DE NEGOCIO ACTUALIZADA: Redirigir a Onboarding para completar perfil
                        console.log("Usuario autenticado sin perfil. Redirigiendo a onboarding.");

                        toast({
                            title: "Casi listo",
                            description: "Por favor completa tu información de perfil para continuar.",
                            status: "info",
                            duration: 5000,
                            isClosable: true,
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
