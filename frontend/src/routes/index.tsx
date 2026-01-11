import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LandingPage } from '../modules/landing';
import { LoginPage } from '../modules/auth';
import AuthCallbackPage from '../modules/auth/pages/AuthCallbackPage';
import OnboardingPage from '../modules/onboarding/pages/OnboardingPage';
import { MainLayout } from '../components/Layout/MainLayout';
import RetosPage from '../modules/retos/RetosPage';
import ProfilePage from '../modules/profile/ProfilePage';
import InicioPage from '../modules/home/InicioPage';
import CommunityPage from '../modules/community/CommunityPage';
import RankingPage from '../modules/ranking/RankingPage';

export const AppRouter = () => {
    return (
        <Routes>
            {/* Rutas Públicas: Solo accesibles si NO está autenticado */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                {/* Onboarding movido a privado */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/" element={<Navigate to="/landing" replace />} />
            </Route>

            {/* Callback de Auth (Sin guard, maneja su propia redirección) */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Onboarding: Pública porque recibe usuarios diferidos (sin auth) y usuarios auth sin perfil */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Rutas Privadas: Solo accesibles si ESTÁ autenticado */}
            <Route element={<PrivateRoute />}>
                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<Navigate to="inicio" replace />} />
                    <Route path="inicio" element={<InicioPage />} />
                    <Route path="comunidad" element={<CommunityPage />} />
                    <Route path="retos" element={<RetosPage />} />
                    <Route path="ranking" element={<RankingPage />} />
                    <Route path="perfil" element={<ProfilePage />} />
                </Route>
            </Route>

            {/* Redirección global */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
