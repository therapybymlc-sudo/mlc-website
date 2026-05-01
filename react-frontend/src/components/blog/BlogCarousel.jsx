'use client';
import { useState, useEffect, useRef } from 'react';
import { Box, Container, Heading, Text, Flex, IconButton, Image, LinkBox, LinkOverlay, Badge } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import NextLink from 'next/link';
import api from '../../api';

function normalizePostList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
}

export default function BlogCarousel() {
    const [posts, setPosts] = useState([]);
    const [fetchDone, setFetchDone] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchTopPosts();
    }, []);

    const fetchTopPosts = async () => {
        try {
            const res = await api.get('/blog/public/posts/');
            const list = normalizePostList(res.data);
            setPosts(list.slice(0, 7));
        } catch (error) {
            console.error("Failed to load blog carousel", error);
            setPosts([]);
        } finally {
            setFetchDone(true);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 320 + 24; // card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!fetchDone) return null;

    return (
        <Box py={20} bg="white" overflow="hidden">
            <Container maxW="7xl" mb={10}>
                <Flex justify="space-between" align="flex-end">
                    <Box>
                        <Heading fontFamily="Playfair Display, serif" size="2xl" color="teal.900" mb={4}>
                            Insights & Stories
                        </Heading>
                        <Text color="gray.600" fontSize="lg">
                            Explore the latest thoughts from the MLC clinical team.
                        </Text>
                    </Box>
                    {posts.length > 0 && (
                    <Flex gap={2} display={{ base: 'none', md: 'flex' }}>
                        <IconButton 
                            icon={<FiChevronLeft />} 
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                            borderRadius="full"
                            colorScheme="teal"
                            variant="outline"
                        />
                        <IconButton 
                            icon={<FiChevronRight />} 
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            borderRadius="full"
                            colorScheme="teal"
                        />
                    </Flex>
                    )}
                </Flex>
            </Container>

            {/* The Rolodex Carousel Container */}
            <Box position="relative">
                <Box 
                    ref={scrollRef}
                    display="flex" 
                    gap={6} 
                    overflowX="auto" 
                    pb={10}
                    px={{ base: 4, md: 'max(2rem, calc((100vw - 1280px) / 2))' }}
                    css={{
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        scrollSnapType: 'x mandatory'
                    }}
                >
                    {posts.length === 0 ? (
                        <LinkBox
                            w={{ base: '100%', md: '400px' }}
                            flexShrink={0}
                            bg="teal.50"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="teal.100"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            p={8}
                            scrollSnapAlign="start"
                        >
                            <Heading size="md" color="teal.800" mb={3}>
                                Visit the blog
                            </Heading>
                            <Text color="teal.700" fontSize="sm" mb={4}>
                                New posts will appear here once they are published. You can always read the full blog.
                            </Text>
                            <LinkOverlay as={NextLink} href="/blog" color="teal.700" fontWeight="bold">
                                View all posts →
                            </LinkOverlay>
                        </LinkBox>
                    ) : (
                    posts.map((post) => (
                        <LinkBox 
                            key={post.id}
                            w={{ base: '280px', md: '320px' }}
                            flexShrink={0}
                            bg="white"
                            borderRadius="2xl"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="gray.100"
                            shadow="sm"
                            transition="all 0.3s"
                            _hover={{ shadow: 'lg', transform: 'translateY(-5px)' }}
                            scrollSnapAlign="start"
                        >
                            <Box h="200px" bg="gray.100" position="relative" overflow="hidden">
                                {post.cover_image_url && (
                                    <Image src={post.cover_image_url} alt={post.title} w="full" h="full" objectFit="cover" transition="transform 0.5s" _hover={{ transform: 'scale(1.05)' }} />
                                )}
                                {post.category && (
                                    <Badge position="absolute" top={4} left={4} colorScheme="teal" bg="white" px={3} py={1} borderRadius="full">
                                        {post.category.name}
                                    </Badge>
                                )}
                            </Box>
                            <Box p={6}>
                                <Heading size="md" mb={3} lineHeight="1.4" color="teal.900" fontFamily="Playfair Display, serif" noOfLines={2}>
                                    <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </LinkOverlay>
                                </Heading>
                                <Text color="gray.500" fontSize="sm" noOfLines={2}>
                                    {post.meta_description}
                                </Text>
                            </Box>
                        </LinkBox>
                    ))
                    )}
                    
                    {/* View All Card */}
                    {posts.length > 0 && (
                    <LinkBox 
                        w={{ base: '280px', md: '320px' }}
                        flexShrink={0}
                        bg="teal.50"
                        borderRadius="2xl"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        p={8}
                        transition="all 0.3s"
                        _hover={{ bg: 'teal.100' }}
                        scrollSnapAlign="start"
                    >
                        <Heading size="md" color="teal.800" mb={4}>Want more?</Heading>
                        <Text textAlign="center" color="teal.600" mb={6}>Read all of our clinical insights and guides.</Text>
                        <LinkOverlay as={NextLink} href="/blog" color="teal.700" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                            View All Posts <FiChevronRight />
                        </LinkOverlay>
                    </LinkBox>
                    )}
                </Box>
                
                {/* Fade effect on the right side */}
                <Box 
                    position="absolute" 
                    top={0} 
                    right={0} 
                    bottom="40px" 
                    w="150px" 
                    pointerEvents="none"
                    bgGradient="linear(to-l, white 0%, transparent 100%)"
                    display={{ base: 'none', xl: 'block' }}
                />
            </Box>
        </Box>
    );
}
