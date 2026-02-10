import {
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Button,
    HStack,
    Icon,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';
import { HiSearch, HiPlus } from 'react-icons/hi';

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    onCreateClick: () => void;
}

export const UserFilters = ({ searchTerm, setSearchTerm, roleFilter, setRoleFilter, onCreateClick }: UserFiltersProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box
            p={4}
            bg={bg}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            shadow="sm"
        >
            <Flex
                justify="space-between"
                align="center"
                direction={{ base: 'column', md: 'row' }}
                gap={4}
            >
                <HStack w={{ base: 'full', md: 'auto' }} flex="1" spacing={4}>
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none" color="gray.400">
                            <Icon as={HiSearch} />
                        </InputLeftElement>
                        <Input
                            placeholder="Buscar usuarios por nombre o email..."
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            border="none"
                            focusBorderColor="brand.primary"
                            borderRadius="xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <Select
                        placeholder="Todos los roles"
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        border="none"
                        maxW="200px"
                        focusBorderColor="brand.primary"
                        borderRadius="xl"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="user">Usuarios</option>
                        <option value="admin">Administradores</option>
                    </Select>
                </HStack>

                <Button
                    leftIcon={<Icon as={HiPlus} />}
                    colorScheme="brand"
                    borderRadius="xl"
                    px={8}
                    onClick={onCreateClick}
                    shadow="md"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                >
                    Crear Usuario
                </Button>
            </Flex>
        </Box>
    );
};
