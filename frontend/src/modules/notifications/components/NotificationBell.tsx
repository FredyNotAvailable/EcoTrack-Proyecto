import {
    Box,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    VStack,
    HStack,
    Text,
    Circle,
    Icon,
    Button,
    useColorModeValue,
    Divider,
    Badge,
    Flex,
    Spinner
} from '@chakra-ui/react';
import React from 'react';
import { FaBell, FaCheckCircle, FaTrophy, FaLayerGroup, FaExclamationTriangle, FaHeart } from 'react-icons/fa';
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

export const NotificationBell: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const bgHeader = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const unreadBg = useColorModeValue('brand.50', 'whiteAlpha.50');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

    // Fetch notifications
    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => NotificationsAPIService.getNotifications(10),
        staleTime: 1000 * 60, // 1 minute stale time
    });

    // Real-time subscription
    const { user } = useAuth();

    // Real-time subscription optimized
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new as Notification;

                    // Filter client-side to ensure we only process our own notifications
                    if (newNotification.user_id === user.id) {
                        // Optimistic update
                        queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => {
                            if (!oldData) return [newNotification];
                            // Check if already exists to prevent duplicates
                            if (oldData.some(n => n.id === newNotification.id)) return oldData;
                            return [newNotification, ...oldData].slice(0, 10);
                        });

                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, user]);

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    // Mutation: Mark all as read
    const markAllReadMutation = useMutation({
        mutationFn: NotificationsAPIService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Mutation: Mark individual as read
    const markReadMutation = useMutation({
        mutationFn: (id: string) => NotificationsAPIService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

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

    return (
        <Popover placement="bottom-end" isLazy gutter={15}>
            <PopoverTrigger>
                <Box position="relative">
                    <IconButton
                        aria-label="Notificaciones"
                        icon={<FaBell />}
                        variant="ghost"
                        borderRadius="full"
                        size="md"
                        _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.200') }}
                    />
                    {unreadCount > 0 && (
                        <Circle
                            size="18px"
                            bg="red.500"
                            color="white"
                            position="absolute"
                            top="1px"
                            right="1px"
                            fontSize="10px"
                            fontWeight="bold"
                            border="2px solid white"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Circle>
                    )}
                </Box>
            </PopoverTrigger>
            <PopoverContent
                width="350px"
                borderRadius="2xl"
                boxShadow="2xl"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                _focus={{ boxShadow: '2xl' }}
            >
                <PopoverArrow />
                <PopoverHeader bg={bgHeader} py={4} border="none">
                    <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                            <Text fontWeight="900" fontSize="md">Notificaciones</Text>
                            {unreadCount > 0 && (
                                <Badge colorScheme="red" borderRadius="full" px={2}>{unreadCount} nuevas</Badge>
                            )}
                        </HStack>
                        {unreadCount > 0 && (
                            <Button
                                size="xs"
                                variant="link"
                                colorScheme="green"
                                onClick={() => markAllReadMutation.mutate()}
                                isLoading={markAllReadMutation.isPending}
                            >
                                Marcar todo leído
                            </Button>
                        )}
                    </Flex>
                </PopoverHeader>
                <PopoverBody p={0}>
                    <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
                        {isLoading ? (
                            <Flex justify="center" py={10}>
                                <Spinner color="brand.primary" size="sm" />
                            </Flex>
                        ) : notifications && notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <Box
                                    key={notif.id}
                                    p={4}
                                    transition="all 0.2s"
                                    bg={notif.is_read ? 'transparent' : unreadBg}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleNotificationClick(notif)}
                                    position="relative"
                                >
                                    <HStack spacing={3} align="start">
                                        <Circle size="40px" bg={getBgColor(notif.type)}>
                                            {getIcon(notif.type)}
                                        </Circle>
                                        <VStack align="start" spacing={0} flex={1}>
                                            <Text fontSize="sm" fontWeight="bold" lineHeight="tall">{notif.title}</Text>
                                            <Text fontSize="xs" color="gray.500" noOfLines={2}>{notif.message}</Text>
                                            <Text fontSize="10px" color="brand.primary" mt={1} fontWeight="600">
                                                {timeAgo(notif.created_at)}
                                            </Text>
                                        </VStack>
                                        {!notif.is_read && (
                                            <Circle size="8px" bg="blue.500" mt={2} />
                                        )}
                                    </HStack>
                                </Box>
                            ))
                        ) : (
                            <VStack py={10} spacing={2} opacity={0.5}>
                                <Icon as={FaCheckCircle} boxSize={10} color="gray.300" />
                                <Text fontSize="sm" fontWeight="bold">Todo en orden</Text>
                                <Text fontSize="xs">No tienes notificaciones nuevas</Text>
                            </VStack>
                        )}
                    </VStack>
                </PopoverBody>
                <Divider />
                <Box p={2} bg={useColorModeValue('gray.50', 'gray.700/30')} textAlign="center">
                    <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        fontSize="xs"
                        fontWeight="bold"
                        onClick={() => navigate('/app/notificaciones')}
                    >
                        Ver todas las notificaciones
                    </Button>
                </Box>
            </PopoverContent>
        </Popover>
    );
};
