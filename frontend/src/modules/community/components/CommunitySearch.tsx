import React, { useState, useEffect, useRef } from 'react';
import {
    Input,
    InputGroup,
    InputLeftElement,
    Box,
    VStack,
    Text,
    Flex,
    Avatar,
    Icon,
    Spinner,
    useColorModeValue,
    Divider,
} from '@chakra-ui/react';
import { FaSearch, FaHashtag, FaUser } from 'react-icons/fa';
import { PostsService } from '../../posts/services/posts.service';
import { ProfileAPIService } from '../../profile/services/profile.service';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
    type: 'user' | 'hashtag';
    id?: string;
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    count?: number;
}

interface CommunitySearchProps {
    onHashtagClick: (hashtag: string) => void;
}

export const CommunitySearch: React.FC<CommunitySearchProps> = ({ onHashtagClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverColor = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);

            try {
                if (query.startsWith('#')) {
                    const tagQuery = query.slice(1);
                    if (!tagQuery) {
                        setResults([]);
                        setIsLoading(false);
                        return;
                    }
                    const tags = await PostsService.searchHashtags(tagQuery);
                    setResults(tags.map(t => ({
                        type: 'hashtag',
                        title: t.hashtag,
                        count: Number(t.count)
                    })));
                } else {
                    const profiles = await ProfileAPIService.searchProfiles(query);
                    setResults(profiles.map((p: any) => ({
                        type: 'user',
                        id: p.id,
                        title: p.full_name || p.username,
                        subtitle: `@${p.username}`,
                        avatarUrl: p.avatar_url
                    })));
                }
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        if (result.type === 'hashtag') {
            onHashtagClick(result.title);
        } else {
            navigate(`/app/perfil/${result.subtitle?.replace('@', '')}`);
        }
        setIsOpen(false);
        setQuery('');
    };

    return (
        <Box position="relative" w="full" ref={containerRef} zIndex={10}>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search users or #hashtags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    bg={bgColor}
                    borderRadius="full"
                    _focus={{
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                        borderColor: 'brand.500',
                    }}
                />
            </InputGroup>

            {isOpen && (query.trim() || isLoading) && (
                <Box
                    position="absolute"
                    top="full"
                    mt={2}
                    w="full"
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    boxShadow="xl"
                    overflowY="auto"
                    maxH="280px" // Limitar para mostrar 5ish y hacer scroll
                >
                    {isLoading ? (
                        <Flex p={4} justify="center" align="center">
                            <Spinner size="sm" color="brand.500" mr={2} />
                            <Text fontSize="sm" color="gray.500">Searching...</Text>
                        </Flex>
                    ) : results.length > 0 ? (
                        <VStack align="stretch" spacing={0}>
                            {results.map((result, idx) => (
                                <React.Fragment key={idx}>
                                    <Flex
                                        p={3}
                                        align="center"
                                        cursor="pointer"
                                        _hover={{ bg: hoverColor }}
                                        onClick={() => handleSelect(result)}
                                        gap={3}
                                    >
                                        {result.type === 'user' ? (
                                            <>
                                                <Avatar size="sm" name={result.title} src={result.avatarUrl} />
                                                <Box flex={1}>
                                                    <Text fontWeight="semibold" fontSize="sm">{result.title}</Text>
                                                    <Text fontSize="xs" color="gray.500">{result.subtitle}</Text>
                                                </Box>
                                                <Icon as={FaUser} color="gray.300" boxSize={3} />
                                            </>
                                        ) : (
                                            <>
                                                <Flex
                                                    w={8} h={8}
                                                    bg="brand.50"
                                                    color="brand.600"
                                                    borderRadius="full"
                                                    align="center"
                                                    justify="center"
                                                >
                                                    <Icon as={FaHashtag} />
                                                </Flex>
                                                <Box flex={1}>
                                                    <Text fontWeight="semibold" fontSize="sm">#{result.title}</Text>
                                                    <Text fontSize="xs" color="gray.500">{result.count} posts</Text>
                                                </Box>
                                            </>
                                        )}
                                    </Flex>
                                    {idx < results.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </VStack>
                    ) : (
                        <Box p={4}>
                            <Text fontSize="sm" color="gray.500" textAlign="center">
                                No results found for "{query}"
                            </Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};
