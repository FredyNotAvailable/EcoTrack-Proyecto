import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Input,
    VStack,
    Text,
    Box,
    InputGroup,
    InputLeftElement,
    Icon,
    List,
    ListItem,
    useToast,
    Spinner,
    Center
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import Map, { NavigationControl, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (locationName: string) => void;
    initialLocation?: string;
}

interface SearchResult {
    place_name: string;
    center: [number, number];
}

export const LocationPickerModal = ({ 
    isOpen, 
    onClose, 
    onSelectLocation,
    initialLocation 
}: LocationPickerModalProps) => {
    const [viewport, setViewport] = useState({
        latitude: -3.9910,
        longitude: -79.2050, // Loja, Ecuador
        zoom: 12
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<string>('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    
    const mapRef = useRef<any>(null);
    const debounceTimerRef = useRef<number | null>(null);
    const toast = useToast();

    // Reverse geocoding para obtener el nombre del lugar
    const reverseGeocode = useCallback(async (lng: number, lat: number) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es&types=place,locality,neighborhood,address`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                // Obtener el nombre más relevante
                const placeName = data.features[0].place_name;
                setCurrentLocation(placeName);
            }
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            toast({
                title: 'Error al obtener ubicación',
                status: 'error',
                duration: 3000
            });
        }
    }, [toast]);

    // Buscar lugares
    const searchPlaces = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&language=es&country=EC&limit=5`
            );
            const data = await response.json();
            setSearchResults(data.features || []);
        } catch (error) {
            console.error('Error en búsqueda:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchPlaces(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, searchPlaces]);

    // Actualizar ubicación cuando el mapa se mueve (con debounce)
    const handleMoveEnd = useCallback(() => {
        // Cancelar el timer anterior si existe
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Crear nuevo timer con debounce de 300ms
        debounceTimerRef.current = setTimeout(() => {
            const map = mapRef.current?.getMap();
            if (map) {
                const center = map.getCenter();
                reverseGeocode(center.lng, center.lat);
            }
        }, 300);
    }, [reverseGeocode]);

    // Limpiar timer al desmontar
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Inicializar ubicación actual
    useEffect(() => {
        if (isOpen && !initialLocation) {
            setIsLoadingLocation(true);
            reverseGeocode(viewport.longitude, viewport.latitude);
            // Dar tiempo para la solicitud inicial
            setTimeout(() => setIsLoadingLocation(false), 1000);
        }
    }, [isOpen, initialLocation, reverseGeocode, viewport.longitude, viewport.latitude]);

    const handleSelectSearchResult = (result: SearchResult) => {
        setViewport({
            latitude: result.center[1],
            longitude: result.center[0],
            zoom: 14
        });
        setCurrentLocation(result.place_name);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleConfirm = () => {
        if (currentLocation) {
            onSelectLocation(currentLocation);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent maxH="90vh">
                <ModalHeader>Seleccionar Ubicación</ModalHeader>
                <ModalCloseButton />
                
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Buscador */}
                        <Box position="relative">
                            <InputGroup>
                                <InputLeftElement>
                                    <Icon as={FaSearch} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Buscar lugar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                            
                            {/* Resultados de búsqueda */}
                            {searchResults.length > 0 && (
                                <List
                                    position="absolute"
                                    top="100%"
                                    left={0}
                                    right={0}
                                    bg="white"
                                    boxShadow="lg"
                                    borderRadius="md"
                                    mt={1}
                                    maxH="200px"
                                    overflowY="auto"
                                    zIndex={1000}
                                >
                                    {searchResults.map((result, index) => (
                                        <ListItem
                                            key={index}
                                            p={3}
                                            cursor="pointer"
                                            _hover={{ bg: 'gray.50' }}
                                            onClick={() => handleSelectSearchResult(result)}
                                            borderBottomWidth={index < searchResults.length - 1 ? '1px' : 0}
                                        >
                                            <Text fontSize="sm">{result.place_name}</Text>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            
                            {isSearching && (
                                <Box position="absolute" right={3} top={3}>
                                    <Spinner size="sm" color="green.500" />
                                </Box>
                            )}
                        </Box>

                        {/* Mapa */}
                        <Box 
                            position="relative" 
                            h="400px" 
                            borderRadius="xl" 
                            overflow="hidden"
                            border="2px solid"
                            borderColor="gray.200"
                        >
                            <Map
                                ref={mapRef}
                                {...viewport}
                                onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
                                onMoveEnd={handleMoveEnd}
                                style={{ width: '100%', height: '100%' }}
                                mapStyle="mapbox://styles/mapbox/light-v11"
                                mapboxAccessToken={MAPBOX_TOKEN}
                            >
                                <NavigationControl position="top-right" />
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
                                    fontSize="3xl" 
                                    color="red.500"
                                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                                />
                            </Box>
                        </Box>

                        {/* Ubicación actual */}
                        <Box 
                            p={3} 
                            bg="gray.50" 
                            borderRadius="lg"
                            h="80px"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                        >
                            {isLoadingLocation ? (
                                <Center h="100%">
                                    <Spinner size="sm" color="green.500" />
                                </Center>
                            ) : (
                                <>
                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                        Ubicación seleccionada:
                                    </Text>
                                    <Text 
                                        fontSize="sm" 
                                        fontWeight="600" 
                                        color="brand.secondary"
                                        transition="opacity 0.2s"
                                        opacity={currentLocation ? 1 : 0.5}
                                    >
                                        {currentLocation || 'Moviendo mapa...'}
                                    </Text>
                                </>
                            )}
                        </Box>

                        <Text fontSize="xs" color="gray.500" textAlign="center">
                            Mueve el mapa para seleccionar la ubicación exacta
                        </Text>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button 
                        colorScheme="green" 
                        onClick={handleConfirm}
                        isDisabled={!currentLocation}
                    >
                        Confirmar Ubicación
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
