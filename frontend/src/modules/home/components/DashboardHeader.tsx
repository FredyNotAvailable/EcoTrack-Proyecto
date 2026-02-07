import {
  Heading,
  Text,
  Stack,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionText = motion(Text);

interface DashboardHeaderProps {
  username: string;
}

export const DashboardHeader = ({ username }: DashboardHeaderProps) => {
  // Saludo basado en hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <Stack 
      direction={{ base: 'column', md: 'row' }} 
      spacing={{ base: 3, md: 4 }} 
      align="center"
      justify={{ base: 'center', md: 'flex-start' }}
      textAlign="center"
    >
      <Badge
        bg="brand.bgCardLight"
        color="brand.primary"
        px={4}
        py={2}
        borderRadius="full"
        fontSize="sm"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="wide"
        w="fit-content"
        flexShrink={0}
      >
        {getGreeting()}
      </Badge>
      
      <Heading 
        as="h1" 
        fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
        lineHeight="1.2" 
        color="brand.secondary" 
        fontWeight="800"
        flexShrink={0}
      >
        ¡Hola, {username}!
        <MotionText 
          as="span"
          display="inline-block"
          ml={2}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ 
            duration: 0.5,
            delay: 0.5,
            repeat: Infinity,
            repeatDelay: 4
          }}
        >
          👋
        </MotionText>
      </Heading>
      
      <Text 
        color="brand.textMuted" 
        fontSize={{ base: "sm", md: "md" }}
        fontWeight="600"
        lineHeight="1.4"
        flexShrink={1}
        minW={0}
      >
        Tu impacto positivo está transformando el mundo 🌍
      </Text>
    </Stack>
  );
};

export default DashboardHeader;
