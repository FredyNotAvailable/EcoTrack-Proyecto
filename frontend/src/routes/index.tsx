import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { AuthGuard } from './AuthGuard';

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
const AccountStatusPage = lazy(() => import('../modules/auth/pages/AccountStatusPage').then(m => ({ default: m.AccountStatusPage })));
const InicioPage = lazy(() => import('../modules/home/InicioPage'));
const RetosPage = lazy(() => import('../modules/retos/RetosPage'));
const CommunityPage = lazy(() => import('../modules/community/CommunityPage'));
const RankingPage = lazy(() => import('../modules/ranking/RankingPage'));
const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('../modules/notifications/pages/NotificationsPage'));

// Páginas legales e informativas
const TermsPage = lazy(() => import('../modules/landing/pages/TermsPage'));
const PrivacyPage = lazy(() => import('../modules/landing/pages/PrivacyPage'));
const AboutPage = lazy(() => import('../modules/landing/pages/AboutPage'));

// Admin Components
import { AdminRoute } from './AdminRoute'; // Admin Guard
import { AdminLayout } from '../modules/admin/layout/AdminLayout';
import { AdminDashboard } from '../modules/admin/pages/AdminDashboard';
import { AdminUsersPage } from '../modules/admin/users/AdminUsersPage';
import { AdminPostsPage } from '../modules/admin/posts/AdminPostsPage';
import { AdminMissionsPage } from '../modules/admin/missions/AdminMissionsPage';
import { AdminChallengesPage } from '../modules/admin/challenges/AdminChallengesPage';
import { AdminLevelsPage } from '../modules/admin/levels/AdminLevelsPage';
import { AdminTipsPage } from '../modules/admin/tips/AdminTipsPage';
import ReportsPage from '../modules/admin/pages/ReportsPage';

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

            {/* Rutas Autenticadas pero que no requieren estar activo (como la página de estado) */}
            <Route element={<AuthGuard />}>
                <Route path="/status" element={
                    <Suspense fallback={<PageSkeleton />}>
                        <AccountStatusPage />
                    </Suspense>
                } />
            </Route>

            {/* Rutas Privadas: Solo accesibles si ESTÁ autenticado Y ACTIVO */}
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
                    <Route path="notificaciones" element={
                        <Suspense fallback={<PageSkeleton />}>
                            <NotificationsPage />
                        </Suspense>
                    } />
                </Route>
            </Route>

            {/* Rutas de Administrador */}
            <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="usuarios" element={<AdminUsersPage />} />
                    <Route path="posts" element={<AdminPostsPage />} />
                    <Route path="misiones" element={<AdminMissionsPage />} />
                    <Route path="retos" element={<AdminChallengesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="niveles" element={<AdminLevelsPage />} />
                    <Route path="consejos" element={<AdminTipsPage />} />
                </Route>
            </Route>

            {/* Redirección global */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
