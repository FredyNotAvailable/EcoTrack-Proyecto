import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    Icon,
    Box,
} from '@chakra-ui/react';
import { HiExclamation } from 'react-icons/hi';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
}: DeleteConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="2xl" shadow="2xl">
                <ModalHeader>Confirmar Eliminación</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="center" py={4}>
                        <Box
                            bg="red.50"
                            p={3}
                            borderRadius="full"
                        >
                            <Icon as={HiExclamation} color="red.500" boxSize={10} />
                        </Box>
                        <VStack spacing={2} textAlign="center">
                            <Text fontWeight="bold" fontSize="lg">
                                {title}
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                                {description}
                            </Text>
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter bg="gray.50" borderBottomRadius="2xl" py={4}>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        borderRadius="xl"
                        px={8}
                    >
                        Eliminar definitivamete
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
