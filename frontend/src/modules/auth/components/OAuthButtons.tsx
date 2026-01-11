import { Button, Icon } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../AuthContext";

export const OAuthButtons = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <Button
            w="full"
            variant="outline"
            size="lg"
            h="50px"
            leftIcon={<Icon as={FaGoogle} />}
            borderColor="gray.200"
            color="gray.600"
            _hover={{ bg: "gray.50", borderColor: "gray.300" }}
            onClick={() => signInWithGoogle()}
        >
            Google
        </Button>
    );
};
