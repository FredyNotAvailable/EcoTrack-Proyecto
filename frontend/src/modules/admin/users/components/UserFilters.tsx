import {
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Button,
    HStack,
    Icon,
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
    return (
        <Flex
            justify="space-between"
            align="center"
            mb={6}
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
                        bg="white"
                        focusBorderColor="brand.primary"
                        borderRadius="lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <Select
                    placeholder="Todos los roles"
                    bg="white"
                    maxW="200px"
                    focusBorderColor="brand.primary"
                    borderRadius="lg"
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
                bg="brand.primary"
                _hover={{ bg: 'brand.hover' }}
                borderRadius="lg"
                px={6}
                onClick={onCreateClick}
            >
                Crear Usuario
            </Button>
        </Flex>
    );
};
