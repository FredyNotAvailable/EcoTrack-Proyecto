import { ChakraProvider, Heading, Text, VStack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import RetosPage from './modules/retos/RetosPage';

const queryClient = new QueryClient();

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" />;

  return <MainLayout>{children}</MainLayout>;
};

const Dashboard = () => (
  <VStack align="start" spacing={4}>
    <Heading color="eco.600">Bienvenido a EcoTrack</Heading>
    <Text fontSize="lg">Tu camino hacia un planeta más sostenible empieza aquí.</Text>
  </VStack>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/login" element={<div>Pagina de Login (Simulada)</div>} />

              {/* Rutas Protegidas */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/retos" element={<ProtectedRoute><RetosPage /></ProtectedRoute>} />
              <Route path="/comunidad" element={<ProtectedRoute><div>Módulo de Comunidad (Próximamente)</div></ProtectedRoute>} />
              <Route path="/ranking" element={<ProtectedRoute><div>Módulo de Ranking (Próximamente)</div></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
