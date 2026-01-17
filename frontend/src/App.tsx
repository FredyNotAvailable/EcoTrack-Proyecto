import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider } from './modules/auth';
import { AppRouter } from './routes';
import { PostUploadProvider } from './modules/community/context/PostUploadContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <PostUploadProvider>
            <Router>
              <AppRouter />
            </Router>
          </PostUploadProvider>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
