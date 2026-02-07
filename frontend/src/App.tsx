import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider } from './modules/auth';
import { AppRouter } from './routes';
import { PostUploadProvider } from './modules/community/context/PostUploadContext';
import { ScrollToTop } from './components/ScrollToTop';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { userStatsService } from './services/userStatsService';

const queryClient = new QueryClient();

const PrefetchRankingData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['leaderboard', 'global'],
      queryFn: () => userStatsService.getLeaderboard('global'),
    });
  }, [queryClient]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <PostUploadProvider>
            <Router>
              <PrefetchRankingData />
              <ScrollToTop />
              <AppRouter />
            </Router>
          </PostUploadProvider>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
