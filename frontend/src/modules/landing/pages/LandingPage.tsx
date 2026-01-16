import {
    Box,
} from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { HowItWorks } from "../components/HowItWorks";
import { FeaturesSection } from "../components/FeaturesSection";
import { CallToAction } from "../components/CallToAction";
import { CommunitySection } from "../components/CommunitySection";
import { Footer } from "../components/Footer";
import { keyframes } from "@emotion/react";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LandingPage = () => {
    return (
        <Box width="100%" animation={`${fadeInUp} 0.8s ease-out`} bg="brand.bgBody">
            <Navbar />
            <HeroSection />
            <HowItWorks />
            <FeaturesSection />
            <CommunitySection />
            <CallToAction />
            <Footer />
        </Box>
    );
};

export default LandingPage;
