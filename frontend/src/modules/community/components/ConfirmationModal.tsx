
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Button,
    Text,
    useColorModeValue,
    Icon,
    VStack
} from "@chakra-ui/react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onCloseComplete?: () => void;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    isLoading = false,
    onCloseComplete
}: ConfirmationModalProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    return (
        <Modal isOpen={isOpen} onClose={onClose} onCloseComplete={onCloseComplete} isCentered size="sm">
            <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
            <ModalContent
                bg={bg}
                borderRadius="24px"
                boxShadow="xl"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
            >
                {/* Decorative Header Bar */}
                {/* <Box h="6px" w="100%" bg="red.400" /> */}

                <ModalBody pt={10} pb={6} textAlign="center">
                    <VStack spacing={4}>
                        <Icon as={FaExclamationTriangle} w={12} h={12} color="red.400" />
                        <ModalHeader p={0} fontSize="xl" fontWeight="bold">
                            {title}
                        </ModalHeader>
                        <Text color="gray.500" fontSize="md">
                            {message}
                        </Text>
                    </VStack>
                </ModalBody>

                <ModalFooter pb={8} justifyContent="center" gap={3}>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="full"
                        color="gray.500"
                        fontWeight="medium"
                        _hover={{ bg: "gray.100" }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        borderRadius="full"
                        px={8}
                        bg="red.400"
                        _hover={{ bg: "red.500" }}
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
