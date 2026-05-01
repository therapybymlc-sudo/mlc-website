'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Badge,
    Button,
    Center,
    Container,
    Grid,
    Flex,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    Tag,
    TagLabel,
    Image,
    LinkBox,
    LinkOverlay,
    Skeleton,
    Divider,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiImage } from 'react-icons/fi';
import NextLink from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

export default function BlogListClient({ initialPosts, categories, tags }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchPosts();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCategory, selectedTags]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            selectedTags.forEach(tag => params.append('tags', tag));

            const res = await api.get(`/api/blog/public/posts/?${params.toString()}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (slug) => {
        setSelectedTags(prev => 
            prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
        );
    };

    return (
        <Container maxW="7xl" py={12}>
            <VStack spacing={4} align="center" mb={12} textAlign="center">
                <Heading as="h1" size="2xl" fontFamily="Playfair Display, serif" color="teal.900">
                    The MLC Collective Blog
                </Heading>
                <Text color="gray.600" maxW="2xl" fontSize="lg">
                    Explore clinical insights, mental health resources, and stories from our verified practitioners.
                </Text>
            </VStack>

            <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
                {/* Sidebar Filter */}
                <Box w={{ base: '100%', lg: '280px' }} flexShrink={0}>
                    <Box position={{ lg: 'sticky' }} top="100px" bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                        <InputGroup mb={6}>
                            <InputLeftElement pointerEvents="none" color="gray.400">
                                <FiSearch />
                            </InputLeftElement>
                            <Input 
                                placeholder="Search keywords..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                borderRadius="full"
                                bg="gray.50"
                            />
                        </InputGroup>

                        <VStack align="stretch" spacing={6}>
                            <Box>
                                <HStack mb={4} color="teal.800"><FiFilter /><Text fontWeight="bold">Categories</Text></HStack>
                                <VStack align="start" spacing={2}>
                                    <Text 
                                        cursor="pointer" 
                                        color={selectedCategory === null ? 'teal.600' : 'gray.500'}
                                        fontWeight={selectedCategory === null ? 'bold' : 'normal'}
                                        onClick={() => setSelectedCategory(null)}
                                    >
                                        All Categories
                                    </Text>
                                    {categories.map(cat => (
                                        <Text 
                                            key={cat.id} 
                                            cursor="pointer" 
                                            color={selectedCategory === cat.slug ? 'teal.600' : 'gray.500'}
                                            fontWeight={selectedCategory === cat.slug ? 'bold' : 'normal'}
                                            onClick={() => setSelectedCategory(cat.slug)}
                                        >
                                            {cat.name}
                                        </Text>
                                    ))}
                                </VStack>
                            </Box>

                            <Divider />

                            <Box>
                                <Text fontWeight="bold" color="teal.800" mb={4}>Popular Tags</Text>
                                <Flex wrap="wrap" gap={2}>
                                    {tags.map(tag => (
                                        <Tag 
                                            key={tag.id} 
                                            size="md" 
                                            borderRadius="full" 
                                            cursor="pointer"
                                            colorScheme={selectedTags.includes(tag.slug) ? 'teal' : 'gray'}
                                            variant={selectedTags.includes(tag.slug) ? 'solid' : 'subtle'}
                                            onClick={() => toggleTag(tag.slug)}
                                        >
                                            <TagLabel>{tag.name}</TagLabel>
                                        </Tag>
                                    ))}
                                </Flex>
                            </Box>
                        </VStack>
                    </Box>
                </Box>

                {/* Main Grid */}
                <Box flex="1">
                    {loading ? (
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
                            {[1,2,3,4].map(i => (
                                <Box key={i} p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                                    <Skeleton height="200px" borderRadius="lg" mb={4} />
                                    <Skeleton height="20px" width="70%" mb={2} />
                                    <Skeleton height="16px" width="100%" />
                                </Box>
                            ))}
                        </Grid>
                    ) : (
                        <AnimatePresence>
                            {posts.length > 0 ? (
                                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }} gap={8}>
                                    {posts.map((post, index) => (
                                        <LinkBox 
                                            as={motion.div} 
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={post.id} 
                                            bg="white" 
                                            borderRadius="xl" 
                                            overflow="hidden" 
                                            shadow="sm" 
                                            border="1px solid" 
                                            borderColor="gray.100"
                                            _hover={{ shadow: 'md', transform: 'translateY(-4px)' }}
                                            transition="all 0.3s"
                                        >
                                            <Box h="200px" overflow="hidden" bg="gray.100" position="relative">
                                                {post.cover_image_url ? (
                                                    <Image src={post.cover_image_url} alt={post.title} w="full" h="full" objectFit="cover" />
                                                ) : (
                                                    <Center h="full" bg="teal.50" color="teal.200">
                                                        <FiImage size="48px" />
                                                    </Center>
                                                )}
                                                {post.category && (
                                                    <Badge position="absolute" top={4} left={4} colorScheme="teal" bg="white" color="teal.700" px={3} py={1} borderRadius="full">
                                                        {post.category.name}
                                                    </Badge>
                                                )}
                                            </Box>
                                            <Box p={6}>
                                                <Heading size="md" mb={3} lineHeight="1.4" color="gray.800" fontFamily="Playfair Display, serif">
                                                    <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                                                        {post.title}
                                                    </LinkOverlay>
                                                </Heading>
                                                <Text color="gray.500" fontSize="sm" mb={4} noOfLines={2}>
                                                    {post.meta_description || 'Read more about this topic...'}
                                                </Text>
                                                <HStack justify="space-between" align="center" mt="auto">
                                                    <HStack>
                                                        <Image src={post.author_avatar} boxSize="24px" borderRadius="full" fallbackSrc="https://via.placeholder.com/24" />
                                                        <Text fontSize="xs" fontWeight="600" color="gray.700">{post.author_name}</Text>
                                                    </HStack>
                                                    <Text fontSize="xs" color="gray.400">
                                                        {format(new Date(post.published_at), 'MMM dd')}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        </LinkBox>
                                    ))}
                                </Grid>
                            ) : (
                                <Center py={20} flexDirection="column">
                                    <Text color="gray.500" fontSize="lg" mb={4}>No articles found matching your criteria.</Text>
                                    <Button variant="outline" colorScheme="teal" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTags([]); }}>
                                        Clear Filters
                                    </Button>
                                </Center>
                            )}
                        </AnimatePresence>
                    )}
                </Box>
            </Flex>
        </Container>
    );
}
