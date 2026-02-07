import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    UnorderedList,
    ListItem,
} from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const PrivacyPage = () => {
    return (
        <Box width="100%" bg="brand.bgBody" minH="100vh">
            <Navbar />
            <Container maxW="container.md" py={16}>
                <Stack spacing={8}>
                    <Box textAlign="center" mb={8}>
                        <Heading
                            fontSize={{ base: '2xl', md: '4xl' }}
                            fontWeight="900"
                            color="brand.secondary"
                            mb={4}
                        >
                            Política de Privacidad
                        </Heading>
                        <Text color="brand.textMuted" fontWeight="500">
                            Última actualización: Febrero 2026
                        </Text>
                    </Box>

                    <Section title="1. Información que Recopilamos">
                        <Text mb={3}>Recopilamos la siguiente información cuando usas EcoTrack:</Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem>
                                <strong>Información de cuenta:</strong> nombre de usuario, correo electrónico, 
                                foto de perfil y biografía
                            </ListItem>
                            <ListItem>
                                <strong>Datos de actividad:</strong> retos completados, misiones realizadas, 
                                puntos acumulados y kg de CO₂ ahorrados
                            </ListItem>
                            <ListItem>
                                <strong>Contenido generado:</strong> publicaciones, comentarios e interacciones 
                                dentro de la comunidad
                            </ListItem>
                            <ListItem>
                                <strong>Datos técnicos:</strong> tipo de dispositivo, navegador y datos de uso 
                                para mejorar la experiencia
                            </ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="2. Cómo Usamos tu Información">
                        <Text mb={3}>Utilizamos tu información para:</Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem>Proporcionar y mantener el servicio de EcoTrack</ListItem>
                            <ListItem>Calcular y mostrar tu impacto ambiental</ListItem>
                            <ListItem>Gestionar el sistema de puntos, niveles y rachas</ListItem>
                            <ListItem>Permitir la interacción con otros usuarios en la comunidad</ListItem>
                            <ListItem>Enviarte notificaciones sobre tus retos y misiones</ListItem>
                            <ListItem>Mejorar y personalizar tu experiencia en la plataforma</ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="3. Compartición de Datos">
                        <Text mb={3}>
                            Tu información personal no se vende a terceros. Compartimos datos solo en estos casos:
                        </Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem>
                                <strong>Perfil público:</strong> tu nombre de usuario, foto, nivel y estadísticas 
                                de impacto son visibles para otros usuarios
                            </ListItem>
                            <ListItem>
                                <strong>Ranking:</strong> tu posición y puntos se muestran en las tablas de clasificación
                            </ListItem>
                            <ListItem>
                                <strong>Publicaciones:</strong> el contenido que compartes es visible para la comunidad
                            </ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="4. Almacenamiento y Seguridad">
                        <Text>
                            Tus datos se almacenan de forma segura utilizando Supabase, una plataforma que cumple 
                            con estándares de seguridad de la industria. Implementamos medidas técnicas y 
                            organizativas para proteger tu información contra acceso no autorizado, alteración 
                            o destrucción.
                        </Text>
                    </Section>

                    <Section title="5. Tus Derechos">
                        <Text mb={3}>Tienes derecho a:</Text>
                        <UnorderedList spacing={2} pl={4}>
                            <ListItem>Acceder a tu información personal</ListItem>
                            <ListItem>Corregir datos inexactos en tu perfil</ListItem>
                            <ListItem>Eliminar tu cuenta y datos asociados</ListItem>
                            <ListItem>Exportar tus datos de actividad</ListItem>
                            <ListItem>Oponerte al procesamiento de tus datos</ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="6. Cookies y Tecnologías Similares">
                        <Text>
                            EcoTrack utiliza cookies esenciales para mantener tu sesión activa y recordar tus 
                            preferencias. No utilizamos cookies de seguimiento publicitario ni compartimos 
                            datos con redes publicitarias.
                        </Text>
                    </Section>

                    <Section title="7. Retención de Datos">
                        <Text>
                            Conservamos tu información mientras mantengas una cuenta activa en EcoTrack. 
                            Si eliminas tu cuenta, tus datos personales serán eliminados en un plazo de 30 días, 
                            aunque podemos conservar datos anónimos agregados para estadísticas.
                        </Text>
                    </Section>

                    <Section title="8. Menores de Edad">
                        <Text>
                            EcoTrack está diseñado para usuarios mayores de 13 años. No recopilamos 
                            intencionalmente información de menores de esta edad. Si descubrimos que hemos 
                            recopilado datos de un menor, los eliminaremos de inmediato.
                        </Text>
                    </Section>

                    <Section title="9. Cambios en esta Política">
                        <Text>
                            Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
                            sobre cambios significativos mediante un aviso visible en la plataforma. Te 
                            recomendamos revisar esta página periódicamente.
                        </Text>
                    </Section>

                    <Section title="10. Contacto">
                        <Text>
                            Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos 
                            tus datos, puedes contactarnos a través de la plataforma.
                        </Text>
                    </Section>
                </Stack>
            </Container>
            <Footer />
        </Box>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="0 4px 20px -5px rgba(31, 64, 55, 0.08)"
        border="1px solid rgba(0,0,0,0.03)"
    >
        <Heading as="h2" fontSize="xl" fontWeight="800" color="brand.secondary" mb={4}>
            {title}
        </Heading>
        <Box color="brand.textMuted" fontSize="sm" lineHeight="1.8" fontWeight="500">
            {children}
        </Box>
    </Box>
);

export default PrivacyPage;
