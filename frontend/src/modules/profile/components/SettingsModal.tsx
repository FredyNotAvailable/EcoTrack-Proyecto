import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Text,
    Box,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    Icon,
    Avatar,
    useDisclosure
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { FaUserGear, FaTriangleExclamation, FaCamera } from 'react-icons/fa6';
import { DeleteAccountModal } from './DeleteAccountModal';
import { ProfileAPIService } from '../services/profile.service';
import { StorageService } from '../../shared/services/storage.service';
import { convertToWebP } from '../../../utils/ImageConverter';
import { useAuth } from '../../auth/AuthContext';
import type { Profile } from '../services/profile.service'; // Assuming type exists or is inferred

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any; // Type should be Profile if available
    onUpdate: () => void;
}

export const SettingsModal = ({ isOpen, onClose, profile, onUpdate }: SettingsModalProps) => {
    const { user } = useAuth();
    const toast = useToast();

    // Edit Profile State
    const [formData, setFormData] = useState({
        username: profile?.username || '',
        bio: profile?.bio || ''
    });
    const [avatarFile, setAvatarFile] = useState<Blob | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Reset form when modal opens or profile changes
    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                username: profile.username || '',
                bio: profile.bio || ''
            });
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    }, [isOpen, profile]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const webpBlob = await convertToWebP(file);
                setAvatarFile(webpBlob);
                setAvatarPreview(URL.createObjectURL(webpBlob));
            } catch (error) {
                toast({
                    title: "Error al procesar imagen",
                    status: "error",
                    duration: 3000,
                });
            }
        }
    };

    const hasChanges = () => {
        if (!profile) return false;
        if (avatarFile) return true;
        return formData.username !== profile.username || formData.bio !== profile.bio;
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            let updatedData: any = { ...formData };

            if (avatarFile) {
                const url = await StorageService.uploadAvatar(user.id, avatarFile);
                updatedData.avatar_url = url;
            }

            await ProfileAPIService.updateMe(updatedData);

            toast({
                title: "Perfil actualizado",
                status: "success",
                duration: 3000,
            });
            onUpdate(); // Trigger refresh
            onClose();
        } catch (error: any) {
            toast({
                title: "Error al actualizar",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.400" />
                <ModalContent borderRadius="24px" overflow="hidden">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.100" py={4}>
                        <HStack>
                            <Icon as={FaUserGear} color="brand.primary" />
                            <Text color="brand.secondary" fontWeight="800">Cónfiguración</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton borderRadius="full" mt={2} />

                    <ModalBody p={0}>
                        <Tabs isFitted variant="line" colorScheme="green">
                            <TabList borderBottomWidth="1px" borderColor="gray.100">
                                <Tab _selected={{ color: 'brand.primary', borderColor: 'brand.primary', fontWeight: '700' }} color="gray.500" fontSize="sm" fontWeight="600" py={4}>
                                    Editar Perfil
                                </Tab>
                                <Tab _selected={{ color: 'red.500', borderColor: 'red.500', fontWeight: '700' }} color="gray.500" fontSize="sm" fontWeight="600" py={4}>
                                    Zona de Peligro
                                </Tab>
                            </TabList>

                            <TabPanels>
                                {/* Edit Profile Panel */}
                                <TabPanel p={6}>
                                    <VStack spacing={6}>
                                        {/* Avatar */}
                                        <Box position="relative">
                                            <Avatar
                                                size="2xl"
                                                src={avatarPreview || profile?.avatar_url}
                                                name={formData.username}
                                                border="4px solid white"
                                                boxShadow="md"
                                            />
                                            <Box
                                                position="absolute"
                                                bottom="0"
                                                right="0"
                                                bg="brand.primary"
                                                w="32px"
                                                h="32px"
                                                borderRadius="full"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                cursor="pointer"
                                                boxShadow="lg"
                                                onClick={() => fileInputRef.current?.click()}
                                                _hover={{ transform: "scale(1.1)", transition: "all 0.2s" }}
                                            >
                                                <Icon as={FaCamera} color="white" w={4} h={4} />
                                            </Box>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                display="none"
                                                onChange={handleFileChange}
                                            />
                                        </Box>

                                        <FormControl>
                                            <FormLabel fontWeight="700" color="gray.600" fontSize="sm">Nombre de usuario</FormLabel>
                                            <Input
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                borderRadius="12px"
                                                focusBorderColor="brand.primary"
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontWeight="700" color="gray.600" fontSize="sm">
                                                Biografía
                                            </FormLabel>
                                            <Textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                borderRadius="12px"
                                                focusBorderColor="brand.primary"
                                                rows={3}
                                                minH={"40px"}
                                                maxH={"180px"}
                                                maxLength={300}
                                            />
                                            <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                                                {formData.bio.length}/300
                                            </Text>
                                        </FormControl>

                                        <Button
                                            w="full"
                                            bg="brand.primary"
                                            color="white"
                                            _hover={{ bg: "brand.primaryHover" }}
                                            borderRadius="12px"
                                            isDisabled={!hasChanges()}
                                            isLoading={isSaving}
                                            onClick={handleSave}
                                            fontWeight="800"
                                            h="48px"
                                        >
                                            Guardar Cambios
                                        </Button>
                                    </VStack>
                                </TabPanel>

                                {/* Danger Zone Panel */}
                                <TabPanel p={6}>
                                    <VStack spacing={6} align="stretch">
                                        <Box bg="red.50" p={5} borderRadius="16px" border="1px solid" borderColor="red.100">
                                            <HStack mb={3} color="red.600">
                                                <Icon as={FaTriangleExclamation} />
                                                <Text fontWeight="800">Eliminar Cuenta</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="red.800" mb={4}>
                                                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten en cuenta que perderás todos tus datos, progreso y contribuciones a la comunidad.
                                            </Text>
                                            <Button
                                                colorScheme="red"
                                                variant="outline"
                                                size="sm"
                                                w="full"
                                                fontWeight="700"
                                                onClick={onDeleteOpen}
                                                _hover={{ bg: "red.500", color: "white" }}
                                            >
                                                Eliminar mi cuenta permanentemente
                                            </Button>
                                        </Box>
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <DeleteAccountModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
            />
        </>
    );
};
