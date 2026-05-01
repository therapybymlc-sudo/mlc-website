'use client';
import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, LinkBox, LinkOverlay, Image, HStack, Skeleton } from '@chakra-ui/react';
import NextLink from 'next/link';
import api from '../../api';

export default function RelatedBlogs({ keywords = [] }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (keywords.length > 0) {
            fetchRelated();
        } else {
            setLoading(false);
        }
    }, [keywords]);

    const fetchRelated = async () => {
        try {
            const params = new URLSearchParams();
            keywords.forEach(kw => params.append('search', kw));
            const res = await api.get(`/api/blog/public/posts/?${params.toString()}`);
            setPosts(res.data.slice(0, 3)); // Show top 3
        } catch (error) {
            console.error("Failed to load related blogs", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box p={6} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Skeleton height="20px" width="50%" mb={6} />
                <VStack spacing={4}>
                    <Skeleton height="80px" w="full" borderRadius="lg" />
                    <Skeleton height="80px" w="full" borderRadius="lg" />
                </VStack>
            </Box>
        );
    }

    if (posts.length === 0) return null;

    return (
        <Box p={6} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm">
            <Heading size="md" color="teal.900" mb={2} fontFamily="Playfair Display, serif">
                Recommended Reading
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={6}>
                Clinical insights related to your current focus.
            </Text>

            <VStack spacing={4} align="stretch">
                {posts.map(post => (
                    <LinkBox 
                        key={post.id} 
                        display="flex" 
                        gap={4} 
                        p={3} 
                        borderRadius="lg" 
                        _hover={{ bg: 'teal.50' }} 
                        transition="background 0.2s"
                    >
                        <Box w="80px" h="80px" flexShrink={0} borderRadius="md" overflow="hidden" bg="gray.100">
                            {post.cover_image_url && (
                                <Image src={post.cover_image_url} alt={post.title} w="full" h="full" objectFit="cover" />
                            )}
                        </Box>
                        <Box flex="1">
                            <Heading size="sm" color="teal.800" mb={1} noOfLines={2} lineHeight="1.3">
                                <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                                    {post.title}
                                </LinkOverlay>
                            </Heading>
                            <HStack fontSize="xs" color="gray.500">
                                <Text fontWeight="600">{post.author_name}</Text>
                                <Text>•</Text>
                                <Text>{post.category?.name || 'Article'}</Text>
                            </HStack>
                        </Box>
                    </LinkBox>
                ))}
            </VStack>
        </Box>
    );
}
