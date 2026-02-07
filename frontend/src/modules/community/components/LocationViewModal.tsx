import { useState, useCallback, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Text,
    Box,
    Icon,
    Spinner,
    Center
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Map, { NavigationControl, Marker, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationName: string;
}

export const LocationViewModal = ({ 
    isOpen, 
    onClose, 
    locationName 
}: LocationViewModalProps) => {
    const [viewport, setViewport] = useState({
        latitude: -3.9910,
        longitude: -79.2050,
        zoom: 12
    });
    const [isLoading, setIsLoading] = useState(true);

    // Geocodificar el nombre de ubicación para obtener coordenadas
    const geocodeLocation = useCallback(async (location: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&language=es&country=EC&limit=1`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                setViewport({
                    latitude: lat,
                    longitude: lng,
                    zoom: 14
                });
            }
        } catch (error) {
            console.error('Error al geocodificar ubicación:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && locationName) {
            geocodeLocation(locationName);
        }
    }, [isOpen, locationName, geocodeLocation]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent maxH="90vh">
                <ModalHeader>Ubicación</ModalHeader>
                <ModalCloseButton />
                
                <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                        {/* Mapa */}
                        <Box 
                            position="relative" 
                            h="450px" 
                            borderRadius="xl" 
                            overflow="hidden"
                            border="2px solid"
                            borderColor="gray.200"
                        >
                            {isLoading ? (
                                <Center h="100%" bg="gray.50">
                                    <Spinner size="xl" color="green.500" thickness="4px" />
                                </Center>
                            ) : (
                                <>
                                    <Map
                                        {...viewport}
                                        onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
                                        style={{ width: '100%', height: '100%' }}
                                        mapStyle="mapbox://styles/mapbox/light-v11"
                                        mapboxAccessToken={MAPBOX_TOKEN}
                                        interactive={true}
                                    >
                                        <NavigationControl position="top-right" />
                                        <Marker 
                                            longitude={viewport.longitude} 
                                            latitude={viewport.latitude} 
                                            anchor="bottom"
                                        >
                                            <Icon 
                                                as={FaMapMarkerAlt} 
                                                fontSize="3xl" 
                                                color="red.500"
                                                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                                            />
                                        </Marker>
                                    </Map>

                                    {/* Marcador fijo en el centro */}
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="50%"
                                        transform="translate(-50%, -100%)"
                                        zIndex={1}
                                        pointerEvents="none"
                                    >
                                        <Icon 
                                            as={FaMapMarkerAlt} 
                                            fontSize="4xl" 
                                            color="red.500"
                                            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>

                        {/* Nombre de ubicación */}
                        <Box 
                            p={4} 
                            bg="gray.50" 
                            borderRadius="lg"
                            textAlign="center"
                        >
                            <Text 
                                fontSize="sm" 
                                fontWeight="600" 
                                color="brand.secondary"
                            >
                                {locationName}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
