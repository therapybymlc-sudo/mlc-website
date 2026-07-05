'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Flex, Image, Badge, HStack, VStack, Divider, Circle, Spinner, Center, Icon } from '@chakra-ui/react';
import { format } from 'date-fns';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';

function normalizeImageUrl(raw) {
  const value = (raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  
  // Resolve API BASE path to prefix local uploads
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

export default function BlogPostClient({ post }) {
  const [isMounted, setIsMounted] = useState(false);
  const coverUrl = post.slug === 'why-supervision-is-essential-for-therapists'
    ? '/supervision_essay_cover.jpg'
    : normalizeImageUrl(post.cover_image_url);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Center minH="80vh" bg="#FDFBFA">
        <Spinner size="xl" color="teal.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#FDFBFA" py={{ base: 12, md: 24 }}>
      <Container maxW="4xl">
        
        {/* Main Unified Article Deck */}
        <Box 
          bg="white" 
          borderRadius="3xl" 
          border="1px solid" 
          borderColor="gray.100" 
          shadow="xl" 
          overflow="hidden"
          p={{ base: 6, md: 16 }}
        >
          {/* Header Metadata */}
          <VStack align="start" spacing={6} mb={10}>
            {post.category && (
              <Badge bg="teal.50" color="teal.800" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="1px">
                {post.category.name}
              </Badge>
            )}
            
            <Heading 
              as="h1" 
              fontSize={{ base: "3xl", md: "5xl" }} 
              fontFamily="'Playfair Display', serif" 
              color="teal.900" 
              lineHeight="1.25"
              fontWeight="600"
            >
              {post.title}
            </Heading>

            <Flex align="center" gap={6} color="gray.500" fontSize="sm" flexWrap="wrap" w="full" pt={2} borderTop="1px solid" borderColor="gray.100">
              <HStack spacing={3}>
                {post.author_avatar ? (
                  <Image
                    src={post.author_avatar}
                    boxSize="36px"
                    borderRadius="full"
                    fallbackSrc="/logo_tra.png"
                    referrerPolicy="no-referrer"
                    alt={post.author_name}
                  />
                ) : (
                  <Circle size="36px" bg="teal.50" color="teal.700">
                    <FiUser size={16} />
                  </Circle>
                )}
                <Text fontWeight="700" color="gray.700">{post.author_name || 'MLC Therapist'}</Text>
              </HStack>
              
              <Divider orientation="vertical" h="20px" borderColor="gray.200" />
              
              <HStack spacing={2}>
                <Icon as={FiClock} color="teal.600" />
                <Text fontWeight="600">
                  {post.published_at ? format(new Date(post.published_at), 'MMMM dd, yyyy') : 'Recently Published'}
                </Text>
              </HStack>
            </Flex>
          </VStack>

          {/* Cover Image */}
          {coverUrl && (
            <Box borderRadius="2xl" overflow="hidden" mb={12} shadow="md" maxH="500px" bg="gray.50" border="1px solid" borderColor="gray.100">
              <Image
                src={coverUrl}
                alt={post.title}
                w="full"
                h="auto"
                maxH="500px"
                objectFit="cover"
                fallback={<Box h="300px" bg="gray.50" display="flex" alignItems="center" justifyContent="center"><Text color="gray.400" fontSize="sm">Cover Image Unavailable</Text></Box>}
              />
            </Box>
          )}

          {/* Article Rich Text Content */}
          <Box
            color="gray.700"
            fontFamily="'Inter', sans-serif"
            sx={{
              'h2': { fontSize: { base: 'xl', md: '2xl' }, fontWeight: '700', color: 'teal.900', mt: 10, mb: 4, fontFamily: "'Playfair Display', serif", lineHeight: '1.3' },
              'h3': { fontSize: { base: 'lg', md: 'xl' }, fontWeight: '600', color: 'teal.800', mt: 8, mb: 4, fontFamily: "'Playfair Display', serif" },
              'p': { fontSize: { base: 'md', md: 'lg' }, color: 'gray.700', lineHeight: '1.85', mb: 6 },
              'ul, ol': { pl: 8, mb: 6, fontSize: { base: 'md', md: 'lg' }, color: 'gray.700', lineHeight: '1.85' },
              'li': { mb: 2 },
              'a': { color: 'teal.700', textDecoration: 'underline', fontWeight: '600', _hover: { color: 'mlc.gold' } },
              'img': { borderRadius: '2xl', my: 8, mx: 'auto', maxH: '500px', objectFit: 'contain', maxWidth: '100%', shadow: 'sm', border: '1px solid', borderColor: 'gray.100' },
              'blockquote': { borderLeft: '4px solid', borderColor: 'teal.500', pl: 6, py: 4, pr: 4, my: 8, fontStyle: 'italic', bg: 'teal.50', borderRadius: '0 2xl 2xl 0', color: 'teal.900', fontSize: 'lg' },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Flex gap={2} mt={12} pt={8} borderTop="1px solid" borderColor="gray.100" flexWrap="wrap">
              {post.tags.map(tag => (
                <Badge key={tag.id} bg="gray.50" color="gray.600" border="1px solid" borderColor="gray.100" px={3} py={1} borderRadius="full">
                  #{tag.name}
                </Badge>
              ))}
            </Flex>
          )}

        </Box>

      </Container>
    </Box>
  );
}
