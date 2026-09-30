'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  HStack, 
  VStack,
  Stack,
  IconButton, 
  useToast, 
  Spinner, 
  Flex, 
  Link as ChakraLink,
  Circle,
  Icon,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus, FiFileText, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';
import api from '../../../api';
import NextLink from 'next/link';
import { format } from 'date-fns';

export default function AdminBlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/blog/admin/posts/');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast({ title: 'Failed to load posts', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await api.delete(`/blog/admin/posts/${slug}/`);
      toast({ title: 'Post deleted', status: 'success' });
      setPosts(posts.filter(p => p.slug !== slug));
    } catch (error) {
      toast({ title: 'Failed to delete post', status: 'error' });
    }
  };

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status !== 'published').length;

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack spacing={3}>
          <Spinner size="xl" thickness="3px" color="#56756D" />
          <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', sans-serif">Loading blog publications...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 UNIFIED HERO BANNER (Rule 8 & 10) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Identity & Space Title */}
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(201, 169, 96, 0.15)" color="#C9A960" flexShrink={0}>
              <Icon as={FiFileText} boxSize="22px" />
            </Circle>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(201, 169, 96, 0.15)" 
                  color="#926D28" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  Content Suite • Blog CMS
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600" 
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Blog Articles Management
              </Heading>
              <Text 
                fontSize="13px" 
                color="#5A6E65" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.4"
              >
                Curate mental health guides, clinical blueprints, and psychoeducation articles.
              </Text>
            </VStack>
          </HStack>

          {/* Metric Strip & Action Button Cluster */}
          <Stack direction={{ base: "column", md: "row" }} spacing={3} align={{ base: "stretch", md: "center" }} w={{ base: "full", lg: "auto" }}>
            <HStack 
              spacing={{ base: 1.5, sm: 3 }} 
              p={1.5} 
              px={{ base: 2, sm: 2.5 }} 
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)" 
              border="1px solid rgba(86, 117, 109, 0.1)" 
              w={{ base: "full", md: "auto" }} 
              justify="space-between"
            >
              {/* Node 1: Total */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiFileText} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Articles
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {posts.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 2: Published */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiCheckCircle} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Published
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {publishedCount}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 3: Drafts */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706" flexShrink={0}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Drafts
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {draftCount}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button 
              as={NextLink} 
              href="/admin/blog/create" 
              bg="#56756D" 
              color="white" 
              borderRadius="full"
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              leftIcon={<Icon as={FiPlus} boxSize="14px" />}
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              whiteSpace="nowrap"
            >
              New Article
            </Button>
          </Stack>
        </Flex>
      </Box>

      {/* 📊 DATA TABLE (Rule 12) */}
      <Box 
        bg="white" 
        p={6} 
        borderRadius="2xl" 
        border="1px solid rgba(86, 117, 109, 0.14)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">ARTICLE TITLE</Th>
                <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">STATUS</Th>
                <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">CATEGORY</Th>
                <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">DATE</Th>
                <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" isNumeric>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {posts.map(post => {
                const isPublished = post.status === 'published';
                return (
                  <Tr 
                    key={post.id} 
                    borderBottom="1px solid rgba(86, 117, 109, 0.08)"
                    _hover={{ bg: "rgba(250, 248, 245, 0.6)" }} 
                    transition="background-color 0.15s ease"
                  >
                    <Td py={4}>
                      <ChakraLink 
                        as={NextLink} 
                        href={`/admin/blog/${post.slug}`} 
                        fontWeight="600" 
                        color="#263A33"
                        fontSize="13.5px"
                        _hover={{ color: "#56756D", textDecoration: "underline" }}
                      >
                        {post.title}
                      </ChakraLink>
                    </Td>
                    <Td py={4}>
                      <Badge 
                        bg={isPublished ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"} 
                        color={isPublished ? "#059669" : "#D97706"}
                        fontSize="10px"
                        fontWeight="700"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        textTransform="uppercase"
                      >
                        {post.status || 'Draft'}
                      </Badge>
                    </Td>
                    <Td py={4} fontSize="13px" color="#5A6E65">
                      {post.category?.name || 'Uncategorized'}
                    </Td>
                    <Td py={4} fontSize="12.5px" color="#718096">
                      {post.created_at ? format(new Date(post.created_at), 'MMM dd, yyyy') : 'Recently'}
                    </Td>
                    <Td py={4} isNumeric>
                      <HStack spacing={1.5} justify="flex-end">
                        <IconButton 
                          as={NextLink} 
                          href={`/admin/blog/${post.slug}`}
                          icon={<FiEdit2 />} 
                          size="sm" 
                          variant="ghost" 
                          color="#56756D"
                          borderRadius="full"
                          aria-label="Edit Article"
                          _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                        />
                        <IconButton 
                          icon={<FiTrash2 />} 
                          size="sm" 
                          variant="ghost" 
                          color="#DC2626" 
                          borderRadius="full"
                          aria-label="Delete Article"
                          onClick={() => handleDelete(post.slug)}
                          _hover={{ bg: "rgba(239, 68, 68, 0.1)" }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
              {posts.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={16} color="#718096">
                    <VStack spacing={3}>
                      <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                        <Icon as={FiFileText} boxSize="18px" />
                      </Circle>
                      <Text fontSize="13.5px" color="#263A33" fontWeight="600">No blog articles yet</Text>
                      <Text fontSize="12px" color="#5A6E65">Click "New Article" above to draft your first article.</Text>
                    </VStack>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
