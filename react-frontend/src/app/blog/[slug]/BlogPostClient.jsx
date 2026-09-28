'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex, 
  Image, 
  Badge, 
  HStack, 
  VStack, 
  Divider, 
  Circle, 
  Spinner, 
  Center, 
  Icon, 
  Button, 
  IconButton, 
  Tooltip, 
  useToast, 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  SimpleGrid
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiArrowLeft, 
  FiShare2, 
  FiCheck, 
  FiArrowRight, 
  FiShield,
  FiBookOpen
} from 'react-icons/fi';

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

function calculateReadingTime(htmlContent) {
  if (!htmlContent) return '3 min read';
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export default function BlogPostClient({ post }) {
  const [isMounted, setIsMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const toast = useToast();

  const coverUrl = post.slug === 'why-supervision-is-essential-for-therapists'
    ? '/supervision_essay_cover.jpg'
    : normalizeImageUrl(post.cover_image_url);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: 'Link Copied',
        description: 'Article link copied to your clipboard.',
        status: 'success',
        duration: 2500,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  if (!isMounted) {
    return (
      <Center minH="80vh" bg="#FDFBFA">
        <Spinner size="xl" color="#56756D" thickness="3px" />
      </Center>
    );
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <Box minH="100vh" bg="#FDFBFA" pb={{ base: 12, md: 16 }}>
      
      {/* 🧭 Top Navigation & Back Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="rgba(86,117,109,0.1)" py={3}>
        <Container maxW="5xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Button
                as={NextLink}
                href="/blog"
                size="xs"
                variant="ghost"
                color="#56756D"
                fontSize="12px"
                fontWeight="600"
                leftIcon={<FiArrowLeft />}
                _hover={{ bg: "rgba(169,203,183,0.12)", color: "#263A33" }}
              >
                Back to Journal
              </Button>
              <Divider orientation="vertical" h="16px" borderColor="gray.200" />
              <Breadcrumb fontSize="11.5px" color="gray.500" display={{ base: "none", sm: "block" }}>
                <BreadcrumbItem>
                  <BreadcrumbLink as={NextLink} href="/" _hover={{ color: "#263A33" }}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink as={NextLink} href="/blog" _hover={{ color: "#263A33" }}>Journal</BreadcrumbLink>
                </BreadcrumbItem>
                {post.category && (
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink fontWeight="600" color="#263A33">{post.category.name}</BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
            </HStack>

            <Tooltip label={copiedLink ? "Link Copied!" : "Share Article"} hasArrow placement="left">
              <Button
                size="xs"
                variant="outline"
                borderColor="rgba(86,117,109,0.25)"
                color="#263A33"
                borderRadius="full"
                fontSize="11.5px"
                fontWeight="600"
                leftIcon={copiedLink ? <FiCheck /> : <FiShare2 />}
                onClick={handleShare}
                _hover={{ bg: "rgba(86,117,109,0.06)", borderColor: "#56756D" }}
              >
                {copiedLink ? "Copied" : "Share"}
              </Button>
            </Tooltip>
          </Flex>
        </Container>
      </Box>

      {/* 📖 Main Editorial Article Container */}
      <Container maxW="5xl" px={{ base: 4, md: 6 }} pt={{ base: 6, md: 8 }}>
        
        <Box 
          bg="white" 
          borderRadius="24px" 
          border="1px solid" 
          borderColor="rgba(86,117,109,0.12)" 
          shadow="0 6px 24px -2px rgba(38,58,51,0.04)" 
          overflow="hidden"
          p={{ base: 5, sm: 8, md: 10 }}
        >
          {/* Constrained reading column for optimal line-length */}
          <Box maxW="740px" mx="auto">
            
            {/* Header Metadata */}
            <VStack align="start" spacing={3.5} mb={6}>
              <HStack spacing={2.5} flexWrap="wrap">
                {post.category && (
                  <Badge 
                    bg="rgba(86,117,109,0.08)" 
                    color="#56756D" 
                    px={3} 
                    py={0.5} 
                    borderRadius="full" 
                    fontSize="11px" 
                    fontWeight="700"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                  >
                    {post.category.name}
                  </Badge>
                )}
                <HStack spacing={1.5} fontSize="12px" color="gray.500">
                  <Icon as={FiClock} color="#56756D" boxSize="12px" />
                  <Text>{readingTime}</Text>
                </HStack>
              </HStack>
              
              <Heading 
                as="h1" 
                fontSize={{ base: "24px", sm: "28px", md: "34px" }} 
                fontFamily="'Playfair Display', serif" 
                color="#263A33" 
                lineHeight="1.26"
                fontWeight="600"
                letterSpacing="-0.01em"
              >
                {post.title}
              </Heading>

              {/* Author & Date Bar */}
              <Flex 
                align="center" 
                justify="space-between" 
                w="full" 
                pt={3} 
                pb={1}
                borderTop="1px solid" 
                borderColor="rgba(86,117,109,0.08)"
                flexWrap="wrap"
                gap={3}
              >
                <HStack spacing={2.5}>
                  {post.author_avatar ? (
                    <Image
                      src={post.author_avatar}
                      boxSize="34px"
                      borderRadius="full"
                      fallbackSrc="/logo_tra.png"
                      referrerPolicy="no-referrer"
                      alt={post.author_name}
                      border="1px solid rgba(86,117,109,0.2)"
                    />
                  ) : (
                    <Circle size="34px" bg="rgba(86,117,109,0.08)" color="#56756D">
                      <FiUser size={15} />
                    </Circle>
                  )}
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="13px" color="#263A33">
                      {post.author_name || 'MLC Clinical Editorial Team'}
                    </Text>
                    <Text fontSize="11.5px" color="gray.500">
                      Verified Clinical Contributor
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={1.5} fontSize="12px" color="gray.500">
                  <Icon as={FiCalendar} color="#56756D" boxSize="12px" />
                  <Text>
                    {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : 'Recently Published'}
                  </Text>
                </HStack>
              </Flex>
            </VStack>

            {/* Cover Image */}
            {coverUrl && (
              <Box 
                borderRadius="16px" 
                overflow="hidden" 
                mb={8} 
                shadow="xs" 
                maxH="420px" 
                bg="gray.50" 
                border="1px solid" 
                borderColor="rgba(86,117,109,0.12)"
              >
                <Image
                  src={coverUrl}
                  alt={post.title}
                  w="full"
                  h="auto"
                  maxH="420px"
                  objectFit="cover"
                  fallback={
                    <Box h="240px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                      <Text color="gray.400" fontSize="13px">Cover Image Unavailable</Text>
                    </Box>
                  }
                />
              </Box>
            )}

            {/* Article Content with Refined, Easy-to-Read Typography */}
            <Box
              color="rgba(38, 58, 51, 0.88)"
              fontFamily="'Inter', sans-serif"
              fontSize={{ base: '14.5px', md: '15px' }}
              lineHeight="1.75"
              sx={{
                'h2': { 
                  fontSize: { base: '20px', md: '22px' }, 
                  fontWeight: '600', 
                  color: '#263A33', 
                  mt: 7, 
                  mb: 3, 
                  fontFamily: "'Playfair Display', serif", 
                  lineHeight: '1.3',
                  letterSpacing: '-0.01em'
                },
                'h3': { 
                  fontSize: { base: '17px', md: '18px' }, 
                  fontWeight: '600', 
                  color: '#56756D', 
                  mt: 6, 
                  mb: 2.5, 
                  fontFamily: "'Playfair Display', serif" 
                },
                'p': { 
                  fontSize: { base: '14.5px', md: '15px' }, 
                  color: 'rgba(38, 58, 51, 0.88)', 
                  lineHeight: '1.75', 
                  mb: 4 
                },
                'ul, ol': { 
                  pl: 6, 
                  mb: 4, 
                  fontSize: { base: '14.5px', md: '15px' }, 
                  color: 'rgba(38, 58, 51, 0.88)', 
                  lineHeight: '1.75' 
                },
                'li': { 
                  mb: 1.5 
                },
                'a': { 
                  color: '#56756D', 
                  textDecoration: 'underline', 
                  fontWeight: '600', 
                  _hover: { color: '#263A33' } 
                },
                'img': { 
                  borderRadius: '14px', 
                  my: 6, 
                  mx: 'auto', 
                  maxH: '440px', 
                  objectFit: 'contain', 
                  maxWidth: '100%', 
                  border: '1px solid rgba(86,117,109,0.12)' 
                },
                'blockquote': { 
                  borderLeft: '3px solid', 
                  borderColor: '#56756D', 
                  pl: 5, 
                  py: 3, 
                  pr: 4, 
                  my: 6, 
                  fontStyle: 'italic', 
                  bg: 'rgba(86, 117, 109, 0.04)', 
                  borderRadius: '0 12px 12px 0', 
                  color: '#263A33', 
                  fontSize: '15px',
                  lineHeight: '1.7'
                },
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <Flex gap={2} mt={8} pt={6} borderTop="1px solid" borderColor="rgba(86,117,109,0.1)" flexWrap="wrap">
                {post.tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    bg="rgba(86,117,109,0.06)" 
                    color="#263A33" 
                    border="1px solid rgba(86,117,109,0.18)" 
                    px={3} 
                    py={0.5} 
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="600"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </Flex>
            )}

            {/* Clinical Callout & Discovery Box */}
            <Box 
              mt={10} 
              p={{ base: 5, md: 6 }} 
              bg="rgba(86,117,109,0.04)" 
              borderRadius="18px" 
              border="1px solid" 
              borderColor="rgba(86,117,109,0.15)"
            >
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Icon as={FiShield} color="#56756D" boxSize="16px" />
                  <Heading size="xs" color="#263A33" textTransform="uppercase" letterSpacing="0.06em" fontWeight="700">
                    Grounded Clinical Care with MLC Health
                  </Heading>
                </HStack>
                <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.6">
                  MLC Health is an integrated mental healthcare ecosystem connecting individuals and practitioners with licensed psychologists, counsellors, and board-approved clinical supervisors across India.
                </Text>
                <HStack spacing={3} pt={1} flexWrap="wrap">
                  <Button
                    as={NextLink}
                    href="/therapists/directory"
                    size="sm"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    fontSize="12px"
                    fontWeight="600"
                    rightIcon={<FiArrowRight />}
                    _hover={{ bg: "#425C55" }}
                  >
                    Find a Therapist
                  </Button>
                  <Button
                    as={NextLink}
                    href="/therapists/supervisors/directory"
                    size="sm"
                    variant="outline"
                    borderColor="rgba(86,117,109,0.3)"
                    color="#263A33"
                    borderRadius="full"
                    fontSize="12px"
                    fontWeight="600"
                    _hover={{ bg: "rgba(86,117,109,0.08)" }}
                  >
                    Clinical Supervision
                  </Button>
                </HStack>
              </VStack>
            </Box>

            {/* Return to Journal Button */}
            <Box textAlign="center" pt={8}>
              <Button
                as={NextLink}
                href="/blog"
                variant="ghost"
                color="#56756D"
                fontSize="12.5px"
                fontWeight="600"
                leftIcon={<FiArrowLeft />}
                _hover={{ bg: "rgba(169,203,183,0.12)", color: "#263A33" }}
              >
                Back to All Articles
              </Button>
            </Box>

          </Box>
        </Box>

      </Container>
    </Box>
  );
}
