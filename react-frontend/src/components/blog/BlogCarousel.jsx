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

function getPostCoverImage(post) {
    if (post.slug === 'why-supervision-is-essential-for-therapists') {
        return '/supervision_essay_cover.jpg';
    }
    const raw = post.cover_image_url || '';
    const value = raw.trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    
    const API_BASE = (
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) ||
      (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_API_BASE) ||
      "https://api.mlchealth.in/api"
    ).replace(/\/+$/, "");
    const backendHost = API_BASE.replace(/\/api$/, "");

    if (value.startsWith('/')) {
      return `${backendHost}${value}`;
    }
    return `${backendHost}/${value}`;
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
            const res = await api.get('blog/public/posts/');
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
        <Box py={{ base: 12, md: 16 }} bg="white" overflow="hidden">
            <Container maxW="6xl" mb={{ base: 6, md: 8 }}>
                <Flex justify="space-between" align="flex-end">
                    <Box>
                        <Heading
                            fontFamily="'Playfair Display', var(--font-playfair), serif"
                            fontSize={{ base: "26px", md: "34px" }}
                            fontWeight="600"
                            color="#263A33"
                            lineHeight="1.25"
                            mb={2}
                        >
                            Insights & Stories
                        </Heading>
                        <Text color="rgba(46,46,46,0.75)" fontSize={{ base: "14.5px", md: "15.5px" }} lineHeight="1.7">
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
                            colorScheme="green"
                            variant="outline"
                            size="sm"
                        />
                        <IconButton 
                            icon={<FiChevronRight />} 
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            borderRadius="full"
                            colorScheme="green"
                            size="sm"
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
                    gap={5} 
                    overflowX="auto" 
                    pb={6}
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
                            bg="rgba(169,203,183,0.1)"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="rgba(169,203,183,0.15)"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            p={6}
                            scrollSnapAlign="start"
                        >
                            <Heading fontSize="16px" fontWeight="600" color="#56756D" mb={2}>
                                Visit the blog
                            </Heading>
                            <Text color="#56756D" fontSize="12.5px" lineHeight="1.55" mb={3}>
                                New posts will appear here once they are published. You can always read the full blog.
                            </Text>
                            <LinkOverlay as={NextLink} href="/blog" color="#56756D" fontWeight="600" fontSize="13px">
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
                            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                            scrollSnapAlign="start"
                        >
                            <Box h="190px" bg="gray.100" position="relative" overflow="hidden">
                                {getPostCoverImage(post) && (
                                    <Image src={getPostCoverImage(post)} alt={post.title} w="full" h="full" objectFit="cover" transition="transform 0.5s" _hover={{ transform: 'scale(1.05)' }} />
                                )}
                                {post.category && (
                                    <Badge position="absolute" top={3.5} left={3.5} colorScheme="green" bg="white" px={2.5} py={0.5} fontSize="xs" borderRadius="full">
                                        {post.category.name}
                                    </Badge>
                                )}
                            </Box>
                            <Box p={5}>
                                <Heading fontSize="15.5px" fontWeight="600" mb={1.5} lineHeight="1.3" color="#263A33" fontFamily="'Playfair Display', serif" noOfLines={2}>
                                    <LinkOverlay as={NextLink} href={`/blog/${post.slug}/`}>
                                        {post.title}
                                    </LinkOverlay>
                                </Heading>
                                <Text color="rgba(46,46,46,0.65)" fontSize="12.5px" lineHeight="1.55" noOfLines={2}>
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
                        bg="rgba(169,203,183,0.1)"
                        borderRadius="2xl"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        p={6}
                        transition="all 0.3s"
                        _hover={{ bg: 'rgba(169,203,183,0.15)' }}
                        scrollSnapAlign="start"
                    >
                        <Heading fontSize="16px" fontWeight="600" color="#56756D" mb={2}>Want more?</Heading>
                        <Text textAlign="center" color="#56756D" fontSize="12.5px" lineHeight="1.55" mb={3}>Read all of our clinical insights and guides.</Text>
                        <LinkOverlay as={NextLink} href="/blog" color="#56756D" fontWeight="600" fontSize="13px" display="flex" alignItems="center" gap={1.5}>
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
