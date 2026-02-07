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

const TermsPage = () => {
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
                            Términos y Condiciones
                        </Heading>
                        <Text color="brand.textMuted" fontWeight="500">
                            Última actualización: Febrero 2026
                        </Text>
                    </Box>

                    <Section title="1. Aceptación de los Términos">
                        <Text>
                            Al acceder y utilizar EcoTrack, aceptas estar vinculado por estos Términos y Condiciones. 
                            Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
                        </Text>
                    </Section>

                    <Section title="2. Descripción del Servicio">
                        <Text>
                            EcoTrack es una plataforma de gamificación ambiental que permite a los usuarios:
                        </Text>
                        <UnorderedList mt={3} spacing={2} pl={4}>
                            <ListItem>Registrar y monitorear acciones sostenibles</ListItem>
                            <ListItem>Participar en retos semanales ecológicos</ListItem>
                            <ListItem>Completar misiones diarias para reducir su huella de carbono</ListItem>
                            <ListItem>Conectar con una comunidad comprometida con el medio ambiente</ListItem>
                            <ListItem>Visualizar su impacto ambiental en kg de CO₂ ahorrados</ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="3. Registro de Cuenta">
                        <Text>
                            Para utilizar EcoTrack debes crear una cuenta proporcionando información veraz y actualizada. 
                            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de todas 
                            las actividades que ocurran bajo tu cuenta.
                        </Text>
                    </Section>

                    <Section title="4. Uso Aceptable">
                        <Text>Te comprometes a:</Text>
                        <UnorderedList mt={3} spacing={2} pl={4}>
                            <ListItem>No publicar contenido ofensivo, difamatorio o ilegal</ListItem>
                            <ListItem>No hacer spam ni publicidad no autorizada</ListItem>
                            <ListItem>Respetar a otros miembros de la comunidad</ListItem>
                            <ListItem>No intentar vulnerar la seguridad del sistema</ListItem>
                            <ListItem>Reportar información precisa sobre tus actividades ecológicas</ListItem>
                        </UnorderedList>
                    </Section>

                    <Section title="5. Contenido del Usuario">
                        <Text>
                            Al publicar contenido en EcoTrack (posts, comentarios, fotos), conservas tus derechos de 
                            propiedad intelectual pero nos otorgas una licencia para usar, mostrar y distribuir dicho 
                            contenido dentro de la plataforma.
                        </Text>
                    </Section>

                    <Section title="6. Sistema de Puntos y Niveles">
                        <Text>
                            Los puntos, niveles y logros obtenidos en EcoTrack son virtuales y no tienen valor monetario. 
                            Nos reservamos el derecho de modificar el sistema de recompensas en cualquier momento.
                        </Text>
                    </Section>

                    <Section title="7. Modificaciones">
                        <Text>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
                            entrarán en vigor inmediatamente después de su publicación. El uso continuado de EcoTrack 
                            después de dichos cambios constituye tu aceptación de los nuevos términos.
                        </Text>
                    </Section>

                    <Section title="8. Terminación">
                        <Text>
                            Podemos suspender o terminar tu cuenta si violas estos términos o por cualquier otra razón 
                            a nuestra discreción. Puedes eliminar tu cuenta en cualquier momento desde la configuración 
                            de tu perfil.
                        </Text>
                    </Section>

                    <Section title="9. Limitación de Responsabilidad">
                        <Text>
                            EcoTrack se proporciona "tal cual". No garantizamos que el servicio esté libre de errores 
                            o interrupciones. No somos responsables por daños indirectos derivados del uso de la plataforma.
                        </Text>
                    </Section>

                    <Section title="10. Contacto">
                        <Text>
                            Si tienes preguntas sobre estos términos, puedes contactarnos a través de la plataforma.
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

export default TermsPage;
