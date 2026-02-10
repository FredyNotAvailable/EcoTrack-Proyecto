import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { useState } from 'react';

export const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const bg = useColorModeValue('gray.50', 'gray.900');

    return (
        <Flex h="100vh" overflow="hidden" bg={bg}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <Flex direction="column" flex="1" overflow="hidden">
                <AdminNavbar onSidebarToggle={() => setSidebarOpen(!isSidebarOpen)} />
                <Box as="main" flex="1" overflowY="auto" p={{ base: 4, md: 8 }} bg={bg}>
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
};
