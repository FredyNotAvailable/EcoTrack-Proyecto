import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

// Carga inmediata - críticas para primera interacción
import { LandingPage } from '../modules/landing';
import { LoginPage } from '../modules/auth';
import { MainLayout } from '../components/Layout/MainLayout';

// Skeletons para loading states
import {
  PageSkeleton,
  InicioPageSkeleton,
  RetosPageSkeleton,
  CommunityPageSkeleton,
  RankingPageSkeleton,
  ProfilePageSkeleton,
} from '../components/Skeletons';

// Lazy loading - se cargan bajo demanda
const AuthCallbackPage = lazy(() => import('../modules/auth/pages/AuthCallbackPage'));
const ResetPasswordPage = lazy(() => import('../modules/auth/pages/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('../modules/onboarding/pages/OnboardingPage'));
const InicioPage = lazy(() => import('../modules/home/InicioPage'));
const RetosPage = lazy(() => import('../modules/retos/RetosPage'));
const CommunityPage = lazy(() => import('../modules/community/CommunityPage'));
const RankingPage = lazy(() => import('../modules/ranking/RankingPage'));
const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'));

// Páginas legales e informativas
const TermsPage = lazy(() => import('../modules/landing/pages/TermsPage'));
const PrivacyPage = lazy(() => import('../modules/landing/pages/PrivacyPage'));
const AboutPage = lazy(() => import('../modules/landing/pages/AboutPage'));

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

            {/* Páginas públicas informativas (accesibles por todos) */}
            <Route path="/terminos" element={
                <Suspense fallback={<PageSkeleton />}>
                    <TermsPage />
                </Suspense>
            } />
            <Route path="/privacidad" element={
                <Suspense fallback={<PageSkeleton />}>
                    <PrivacyPage />
                </Suspense>
            } />
            <Route path="/sobre-nosotros" element={
                <Suspense fallback={<PageSkeleton />}>
                    <AboutPage />
                </Suspense>
            } />

            {/* Callback de Auth (Sin guard, maneja su propia redirección) */}
            <Route path="/auth/callback" element={
                <Suspense fallback={<PageSkeleton />}>
                    <AuthCallbackPage />
                </Suspense>
            } />

            {/* Reset Password (Sin guard, maneja su propia validación) */}
            <Route path="/reset-password" element={
                <Suspense fallback={<PageSkeleton />}>
                    <ResetPasswordPage />
                </Suspense>
            } />


            {/* Rutas Privadas: Solo accesibles si ESTÁ autenticado */}
            <Route element={<PrivateRoute />}>
                <Route path="/onboarding" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <OnboardingPage />
                    </Suspense>
                } />
                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<Navigate to="inicio" replace />} />
                    <Route path="inicio" element={
                        <Suspense fallback={<InicioPageSkeleton />}>
                            <InicioPage />
                        </Suspense>
                    } />
                    <Route path="comunidad" element={
                        <Suspense fallback={<CommunityPageSkeleton />}>
                            <CommunityPage />
                        </Suspense>
                    } />
                    <Route path="retos" element={
                        <Suspense fallback={<RetosPageSkeleton />}>
                            <RetosPage />
                        </Suspense>
                    } />
                    <Route path="ranking" element={
                        <Suspense fallback={<RankingPageSkeleton />}>
                            <RankingPage />
                        </Suspense>
                    } />
                    <Route path="perfil/:username?" element={
                        <Suspense fallback={<ProfilePageSkeleton />}>
                            <ProfilePage />
                        </Suspense>
                    } />
                </Route>
            </Route>

            {/* Redirección global */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
