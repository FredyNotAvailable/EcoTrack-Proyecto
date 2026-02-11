import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Container,
    Circle,
    Icon,
    Button,
    useColorModeValue,
    Badge,
    Flex,
    Spinner,
    Divider,
    IconButton
} from '@chakra-ui/react';
import React from 'react';
import { FaBell, FaChevronRight, FaTrophy, FaLayerGroup, FaExclamationTriangle, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { NotificationsAPIService, type Notification } from '../services/notifications.service';
import { useAuth } from '../../auth/AuthContext';

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' años';
    interval = seconds / 2592000;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' meses';
    interval = seconds / 86400;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' días';
    interval = seconds / 3600;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' horas';
    interval = seconds / 60;
    if (interval > 1) return 'hace ' + Math.floor(interval) + ' minutos';
    return 'hace unos segundos';
};

const NotificationsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const bgCard = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const unreadBg = useColorModeValue('brand.50', 'whiteAlpha.50');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications-all'],
        queryFn: () => NotificationsAPIService.getNotifications(50),
    });

    // Real-time subscription
    const { user } = useAuth();

    // Real-time subscription optimized
    // Real-time subscription optimized
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:notifications-full')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new as Notification;

                    // Filter client-side
                    if (newNotification.user_id === user.id) {
                        // Optimistic update for the full list
                        queryClient.setQueryData(['notifications-all'], (oldData: Notification[] | undefined) => {
                            if (!oldData) return [newNotification];
                            if (oldData.some(n => n.id === newNotification.id)) return oldData;
                            return [newNotification, ...oldData].slice(0, 50);
                        });

                        // Also update the bell cache to keep them in sync
                        queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                            if (!oldData) return [newNotification];
                            if (oldData.some(n => n.id === newNotification.id)) return oldData;
                            return [newNotification, ...oldData].slice(0, 10);
                        });

                        queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, user]);

    const markAllReadMutation = useMutation({
        mutationFn: NotificationsAPIService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
        }
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => NotificationsAPIService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'moderation': return <Icon as={FaExclamationTriangle} color="red.500" />;
            case 'social': return <Icon as={FaHeart} color="pink.500" />;
            case 'achievement': return <Icon as={FaTrophy} color="orange.400" />;
            case 'system': return <Icon as={FaLayerGroup} color="blue.400" />;
            default: return <Icon as={FaBell} color="gray.400" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'moderation': return 'red.50';
            case 'social': return 'pink.50';
            case 'achievement': return 'orange.50';
            case 'system': return 'blue.50';
            default: return 'gray.50';
        }
    };

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.is_read) {
            markReadMutation.mutate(notif.id);
        }

        // Solo redirigir si es reporte (moderation) o like/comentario (social) vinculado a un post
        const isReport = notif.type === 'moderation' && notif.reference_type === 'post';
        const isSocial = notif.type === 'social' && notif.reference_type === 'post';

        if ((isReport || isSocial) && notif.reference_id) {
            navigate(`/app/comunidad?post=${notif.reference_id}`);
        }
    };

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={4}>
                            <IconButton
                                aria-label="Volver"
                                icon={<FaArrowLeft />}
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                borderRadius="full"
                            />
                            <Heading size="lg" fontWeight="900">Notificaciones</Heading>
                        </HStack>
                    </VStack>
                    {unreadCount > 0 && (
                        <Button
                            colorScheme="green"
                            size="sm"
                            variant="ghost"
                            fontWeight="bold"
                            onClick={() => markAllReadMutation.mutate()}
                            isLoading={markAllReadMutation.isPending}
                        >
                            Marcar todo como leído
                        </Button>
                    )}
                </Flex>

                <Box
                    bg={bgCard}
                    borderRadius="3xl"
                    border="1px solid"
                    borderColor={borderColor}
                    shadow="sm"
                    overflow="hidden"
                >
                    <VStack spacing={0} align="stretch">
                        {isLoading ? (
                            <Flex justify="center" py={20}>
                                <Spinner color="brand.primary" size="lg" thickness="4px" />
                            </Flex>
                        ) : notifications && notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <Box key={notif.id}>
                                    <Box
                                        p={6}
                                        transition="all 0.2s"
                                        bg={notif.is_read ? 'transparent' : unreadBg}
                                        cursor="pointer"
                                        _hover={{ bg: hoverBg }}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <HStack spacing={4} align="start">
                                            <Circle size="50px" bg={getBgColor(notif.type)} shadow="sm">
                                                {getIcon(notif.type)}
                                            </Circle>
                                            <VStack align="start" spacing={1} flex={1}>
                                                <HStack justify="space-between" w="full" align="start">
                                                    <Text fontSize="md" fontWeight="800" color={notif.is_read ? 'gray.700' : 'brand.textMain'} pr={2}>
                                                        {notif.title}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.400" fontWeight="600" minW="max-content">
                                                        {timeAgo(notif.created_at)}
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                                                    {notif.message}
                                                </Text>
                                                <HStack spacing={2} mt={1}>
                                                    <Badge
                                                        variant="subtle"
                                                        colorScheme={notif.type === 'moderation' ? 'red' : 'green'}
                                                        fontSize="10px"
                                                        borderRadius="full"
                                                        px={2}
                                                    >
                                                        {notif.type.toUpperCase()}
                                                    </Badge>
                                                    {!notif.is_read && <Circle size="6px" bg="blue.500" />}
                                                </HStack>
                                            </VStack>
                                            <Icon as={FaChevronRight} color="gray.300" mt={1} />
                                        </HStack>
                                    </Box>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            ))
                        ) : (
                            <VStack py={24} spacing={4}>
                                <Circle size="100px" bg="gray.50" color="gray.200">
                                    <FaBell size="40px" />
                                </Circle>
                                <VStack spacing={1}>
                                    <Text fontSize="xl" fontWeight="900" color="gray.400">Sin notificaciones</Text>
                                    <Text color="gray.400">Te avisaremos cuando pase algo importante.</Text>
                                </VStack>
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default NotificationsPage;
