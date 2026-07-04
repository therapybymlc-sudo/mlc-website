'use client';

import { Box, Container, Heading, Text, Flex, Image, Badge, HStack, Divider } from '@chakra-ui/react';
import { format } from 'date-fns';
import { FiClock } from 'react-icons/fi';

function normalizeImageUrl(raw) {
  const value = (raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export default function BlogPostClient({ post }) {
  const coverUrl = normalizeImageUrl(post.cover_image_url);

  return (
    <Box minH="100vh" bg="#f7f6f2" py={{ base: 12, md: 20 }}>
      <Container maxW="3xl">
        <Box mb={10} textAlign="center">
          {post.category && (
            <Badge colorScheme="teal" px={3} py={1} borderRadius="full" mb={6}>
              {post.category.name}
            </Badge>
          )}
          <Heading as="h1" size="2xl" fontFamily="Playfair Display, serif" color="teal.900" lineHeight="1.3" mb={6}>
            {post.title}
          </Heading>

          <Flex justify="center" align="center" gap={6} color="gray.600" fontSize="sm" flexWrap="wrap">
            <HStack>
              {post.author_avatar ? (
                <Image
                  src={post.author_avatar}
                  boxSize="32px"
                  borderRadius="full"
                  fallbackSrc="/logo_tra.png"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Box boxSize="32px" borderRadius="full" bg="teal.100" />
              )}
              <Text fontWeight="600" color="gray.800">{post.author_name || 'MLC Health'}</Text>
            </HStack>
            <Divider orientation="vertical" h="20px" borderColor="gray.300" display={{ base: 'none', sm: 'block' }} />
            <HStack>
              <FiClock />
              <Text suppressHydrationWarning>
                {post.published_at ? format(new Date(post.published_at), 'MMMM dd, yyyy') : ''}
              </Text>
            </HStack>
          </Flex>
        </Box>

        {coverUrl && (
          <Box borderRadius="2xl" overflow="hidden" mb={12} shadow="md" h={{ base: '300px', md: '500px' }} bg="gray.100">
            <Box
              as="img"
              src={coverUrl}
              alt={post.title}
              w="full"
              h="full"
              objectFit="cover"
              referrerPolicy="no-referrer"
              display="block"
            />
          </Box>
        )}

        <Box
          bg="white"
          p={{ base: 6, md: 12 }}
          borderRadius="2xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          sx={{
            'h2': { fontSize: '2xl', fontWeight: '700', color: 'teal.900', mt: 10, mb: 4, fontFamily: 'Playfair Display, serif' },
            'h3': { fontSize: 'xl', fontWeight: '600', color: 'teal.800', mt: 8, mb: 4 },
            'p': { fontSize: 'lg', color: 'gray.700', lineHeight: '1.8', mb: 6 },
            'ul, ol': { pl: 8, mb: 6, fontSize: 'lg', color: 'gray.700', lineHeight: '1.8' },
            'li': { mb: 2 },
            'a': { color: 'teal.600', textDecoration: 'underline' },
            'img': { borderRadius: 'xl', my: 8, mx: 'auto', maxH: '500px', objectFit: 'contain', maxWidth: '100%' },
            'blockquote': { borderLeft: '4px solid', borderColor: 'teal.500', pl: 6, py: 2, my: 8, fontStyle: 'italic', bg: 'teal.50', borderRadius: 'md' },
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <Flex gap={2} mt={8} flexWrap="wrap">
            {post.tags.map(tag => (
              <Badge key={tag.id} colorScheme="gray" variant="subtle" px={3} py={1} borderRadius="full">
                #{tag.name}
              </Badge>
            ))}
          </Flex>
        )}
      </Container>
    </Box>
  );
}
