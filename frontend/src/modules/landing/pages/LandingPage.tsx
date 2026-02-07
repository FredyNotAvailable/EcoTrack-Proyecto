import { lazy, Suspense } from "react";
import { Box, Skeleton, Stack } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { keyframes } from "@emotion/react";

// Lazy load de secciones below the fold para mejor rendimiento inicial
const HowItWorks = lazy(() => import("../components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const FeaturesSection = lazy(() => import("../components/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const CommunitySection = lazy(() => import("../components/CommunitySection").then(m => ({ default: m.CommunitySection })));
const CallToAction = lazy(() => import("../components/CallToAction").then(m => ({ default: m.CallToAction })));
const Footer = lazy(() => import("../components/Footer").then(m => ({ default: m.Footer })));

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Skeleton de carga para secciones lazy
const SectionSkeleton = () => (
    <Stack spacing={4} p={8} maxW="container.xl" mx="auto">
        <Skeleton height="40px" width="200px" borderRadius="md" />
        <Skeleton height="20px" width="100%" borderRadius="md" />
        <Skeleton height="200px" width="100%" borderRadius="xl" />
    </Stack>
);

const LandingPage = () => {
    return (
        <Box width="100%" animation={`${fadeInUp} 0.8s ease-out`} bg="brand.bgBody">
            <Navbar />
            <HeroSection />
            <Suspense fallback={<SectionSkeleton />}>
                <HowItWorks />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
                <FeaturesSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
                <CommunitySection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
                <CallToAction />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
                <Footer />
            </Suspense>
        </Box>
    );
};

export default LandingPage;
