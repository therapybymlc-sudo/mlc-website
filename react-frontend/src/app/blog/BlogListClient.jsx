'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Badge,
  Button,
  Center,
  Container,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tag,
  TagLabel,
  Image,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Divider,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton
} from '@chakra-ui/react';
import {
  FiSearch,
  FiX,
  FiClock,
  FiUser,
  FiArrowRight,
  FiCalendar,
  FiImage,
  FiBookOpen,
  FiTag,
  FiFeather,
  FiCheck
} from 'react-icons/fi';
import NextLink from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

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

function getReadingTime(content, metaDescription) {
  const text = (content || metaDescription || '').replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 180));
  return `${minutes} min read`;
}

export default function BlogListClient({ initialPosts, categories, tags }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 280);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedTags]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      selectedTags.forEach(tag => params.append('tags', tag));

      const res = await api.get(`/blog/public/posts/?${params.toString()}`);
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedCategory || selectedTags.length > 0);

  // Divide into featured spotlight and secondary grid if no search/filter active
  const { featuredPost, regularPosts } = useMemo(() => {
    if (!hasActiveFilters && posts.length > 0) {
      return {
        featuredPost: posts[0],
        regularPosts: posts.slice(1)
      };
    }
    return {
      featuredPost: null,
      regularPosts: posts
    };
  }, [posts, hasActiveFilters]);

  return (
    <Box bg="#FDFBFA" minH="100vh" color="#263A33">

      {/* ═══════════════ EDITORIAL MASTHEAD HERO ═══════════════ */}
      <Box
        position="relative"
        bg="linear-gradient(180deg, #1A2924 0%, #233730 65%, #1D2E28 100%)"
        color="white"
        pt={{ base: 10, md: 16 }}
        pb={{ base: 12, md: 16 }}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
      >
        {/* Ambient background glows */}
        <Box
          position="absolute"
          top="-20%"
          left="50%"
          transform="translateX(-50%)"
          w={{ base: "320px", md: "650px" }}
          h="300px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201, 169, 96, 0.14) 0%, transparent 70%)"
          filter="blur(50px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="10%"
          w="340px"
          h="340px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169, 203, 183, 0.1) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="5xl" position="relative" zIndex={2}>
          <VStack spacing={{ base: 4, md: 5 }} textAlign="center" align="center">
            
            {/* Breadcrumb Navigation */}
            <Breadcrumb
              fontSize="11px"
              fontWeight="600"
              color="whiteAlpha.600"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              <BreadcrumbItem>
                <BreadcrumbLink as={NextLink} href="/" _hover={{ color: '#C9A960' }}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <Text color="whiteAlpha.400">Resources</Text>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="#C9A960">The MLC Journal</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Editorial Kicker Badge */}
            <HStack spacing={2} justify="center" flexWrap="wrap">
              <Badge
                bg="rgba(201, 169, 96, 0.16)"
                color="#F0D591"
                border="1px solid rgba(201, 169, 96, 0.35)"
                px={3.5}
                py={1}
                borderRadius="full"
                fontSize="10.5px"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                backdropFilter="blur(8px)"
              >
                Clinical Perspectives & Essays
              </Badge>
              <Text fontSize="12px" color="whiteAlpha.700" fontWeight="500">
                • Curated by Verified Clinicians
              </Text>
            </HStack>

            {/* Journal Masthead Title */}
            <Heading
              as="h1"
              fontSize={{ base: "30px", sm: "36px", md: "46px" }}
              fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
              fontWeight="600"
              color="white"
              lineHeight="1.15"
              letterSpacing="-0.02em"
              maxW="3xl"
            >
              The MLC Collective Journal
            </Heading>

            {/* Subtitle */}
            <Text
              fontSize={{ base: "13.5px", md: "15px" }}
              color="rgba(253, 251, 250, 0.82)"
              lineHeight="1.75"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              maxW="2xl"
            >
              Explore evidence-informed frameworks, clinical supervision dialogues, therapist reflections,
              and grounded psychological resources from India&apos;s integrated therapy ecosystem.
            </Text>

            {/* Centered Editorial Search Bar */}
            <Box w="full" maxW="520px" pt={2}>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none" color="#56756D" pl={2} h="46px">
                  <FiSearch size={17} />
                </InputLeftElement>
                <Input
                  placeholder="Search clinical topics, supervision, essays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                  color="#263A33"
                  borderRadius="full"
                  h="46px"
                  fontSize="13.5px"
                  fontWeight="500"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  boxShadow="0 8px 30px rgba(0, 0, 0, 0.18)"
                  border="1.5px solid"
                  borderColor="rgba(201, 169, 96, 0.4)"
                  _placeholder={{ color: 'gray.400', fontSize: '13px' }}
                  _focus={{
                    borderColor: '#C9A960',
                    boxShadow: '0 0 0 3px rgba(201, 169, 96, 0.3)',
                  }}
                />
                {searchQuery && (
                  <InputRightElement pr={2} h="46px">
                    <IconButton
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: '#263A33', bg: 'gray.100' }}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      borderRadius="full"
                    />
                  </InputRightElement>
                )}
              </InputGroup>
            </Box>

          </VStack>
        </Container>
      </Box>

      {/* ═══════════════ CATEGORY TABS & FILTER BAR ═══════════════ */}
      <Box
        bg="rgba(253, 251, 250, 0.94)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(86, 117, 109, 0.12)"
        py={3.5}
        position="sticky"
        top="74px"
        zIndex={100}
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
      >
        <Container maxW="6xl">
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: 'column', md: 'row' }}
            gap={3}
          >
            {/* Category Navigation Pills */}
            <HStack
              spacing={2}
              overflowX="auto"
              w={{ base: '100%', md: 'auto' }}
              py={0.5}
              sx={{
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}
            >
              <Button
                size="sm"
                borderRadius="full"
                px={4}
                height="34px"
                fontSize="12.5px"
                fontWeight="600"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                bg={selectedCategory === null ? '#263A33' : 'white'}
                color={selectedCategory === null ? '#FDFBFA' : '#263A33'}
                border="1px solid"
                borderColor={selectedCategory === null ? '#263A33' : 'rgba(86, 117, 109, 0.2)'}
                boxShadow={selectedCategory === null ? '0 2px 8px rgba(38, 58, 51, 0.18)' : '0 1px 3px rgba(0,0,0,0.02)'}
                _hover={{
                  bg: selectedCategory === null ? '#1F302A' : 'rgba(169, 203, 183, 0.15)',
                  borderColor: '#56756D',
                }}
                onClick={() => setSelectedCategory(null)}
                whiteSpace="nowrap"
              >
                All Stories ({posts.length})
              </Button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <Button
                    key={cat.id}
                    size="sm"
                    borderRadius="full"
                    px={4}
                    height="34px"
                    fontSize="12.5px"
                    fontWeight="600"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    bg={isSelected ? '#263A33' : 'white'}
                    color={isSelected ? '#FDFBFA' : '#263A33'}
                    border="1px solid"
                    borderColor={isSelected ? '#263A33' : 'rgba(86, 117, 109, 0.2)'}
                    boxShadow={isSelected ? '0 2px 8px rgba(38, 58, 51, 0.18)' : '0 1px 3px rgba(0,0,0,0.02)'}
                    _hover={{
                      bg: isSelected ? '#1F302A' : 'rgba(169, 203, 183, 0.15)',
                      borderColor: '#56756D',
                    }}
                    onClick={() => setSelectedCategory(cat.slug)}
                    whiteSpace="nowrap"
                  >
                    {cat.name}
                  </Button>
                );
              })}
            </HStack>

            {/* Filter Clear Trigger */}
            {hasActiveFilters && (
              <Button
                size="xs"
                variant="outline"
                color="#56756D"
                borderColor="rgba(86, 117, 109, 0.3)"
                borderRadius="full"
                px={3}
                py={1}
                leftIcon={<FiX />}
                onClick={clearAllFilters}
                fontWeight="600"
                fontSize="11.5px"
                _hover={{ bg: 'rgba(86, 117, 109, 0.08)', borderColor: '#56756D' }}
              >
                Clear Filters
              </Button>
            )}
          </Flex>

          {/* Curated Topic Chips (Refined, no tacky hashtags) */}
          {tags.length > 0 && (
            <HStack
              spacing={2}
              pt={2.5}
              overflowX="auto"
              w="full"
              align="center"
              sx={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
            >
              <HStack spacing={1} flexShrink={0} pr={1} color="#56756D">
                <Icon as={FiTag} boxSize="11px" />
                <Text
                  fontSize="10.5px"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  Topics:
                </Text>
              </HStack>
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.slug);
                return (
                  <Tag
                    key={tag.id}
                    size="sm"
                    borderRadius="full"
                    cursor="pointer"
                    px={3}
                    py={1}
                    bg={isSelected ? '#56756D' : 'rgba(86, 117, 109, 0.06)'}
                    color={isSelected ? 'white' : '#263A33'}
                    border="1px solid"
                    borderColor={isSelected ? '#56756D' : 'rgba(86, 117, 109, 0.12)'}
                    transition="all 0.2s ease"
                    _hover={{
                      bg: isSelected ? '#425C55' : 'rgba(169, 203, 183, 0.2)',
                      borderColor: '#56756D',
                      transform: 'translateY(-1px)',
                    }}
                    onClick={() => toggleTag(tag.slug)}
                    flexShrink={0}
                  >
                    <TagLabel fontSize="11.5px" fontWeight={isSelected ? '600' : '500'}>
                      {tag.name}
                    </TagLabel>
                  </Tag>
                );
              })}
            </HStack>
          )}
        </Container>
      </Box>

      {/* ═══════════════ MAIN CONTENT SECTION ═══════════════ */}
      <Container maxW="6xl" py={{ base: 10, md: 14 }}>
        {loading ? (
          <VStack spacing={8} align="stretch">
            <Skeleton height="360px" borderRadius="3xl" />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {[1, 2, 3].map((i) => (
                <Box key={i} p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100" bg="white">
                  <Skeleton height="200px" borderRadius="xl" mb={4} />
                  <Skeleton height="24px" width="75%" mb={2} />
                  <Skeleton height="16px" width="100%" mb={2} />
                  <Skeleton height="16px" width="60%" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        ) : (
          <AnimatePresence>
            {posts.length > 0 ? (
              <Box>
                {/* 🌟 FEATURED SPOTLIGHT ARTICLE (When no filters active) */}
                {featuredPost && (
                  <LinkBox
                    as={motion.div}
                    role="group"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    bg="linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)"
                    borderRadius={{ base: "24px", md: "28px" }}
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.16)"
                    boxShadow="0 10px 36px -6px rgba(38, 58, 51, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02)"
                    p={{ base: 5, md: 7, lg: 8 }}
                    mb={{ base: 10, md: 14 }}
                    transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    _hover={{
                      borderColor: "rgba(201, 169, 96, 0.45)",
                      boxShadow: "0 22px 50px -10px rgba(38, 58, 51, 0.12)",
                      transform: "translateY(-3px)",
                    }}
                  >
                    <Flex
                      direction={{ base: "column", lg: "row" }}
                      align="center"
                      gap={{ base: 6, lg: 10 }}
                    >
                      {/* Editorial Story Column */}
                      <VStack
                        order={{ base: 2, lg: 1 }}
                        flex={{ lg: "1.25" }}
                        align="start"
                        justify="center"
                        spacing={4.5}
                        w="full"
                      >
                        {/* Eyebrow & Badges */}
                        <HStack spacing={2.5} flexWrap="wrap" align="center">
                          <HStack
                            spacing={1.5}
                            bg="rgba(201, 169, 96, 0.12)"
                            color="#9E7D2E"
                            border="1px solid rgba(201, 169, 96, 0.3)"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            <Icon as={FiFeather} boxSize={3} />
                            <Text
                              fontSize="11px"
                              fontWeight="700"
                              letterSpacing="0.08em"
                              textTransform="uppercase"
                              fontFamily="'Inter', var(--font-inter), sans-serif"
                            >
                              Featured Essay
                            </Text>
                          </HStack>

                          {featuredPost.category && (
                            <Badge
                              bg="#EBF2EE"
                              color="#446A5E"
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="11px"
                              fontWeight="600"
                              fontFamily="'Inter', var(--font-inter), sans-serif"
                            >
                              {featuredPost.category.name}
                            </Badge>
                          )}

                          <HStack
                            spacing={1.5}
                            color="rgba(46, 46, 46, 0.55)"
                            fontSize="12px"
                            fontWeight="500"
                            fontFamily="'Inter', var(--font-inter), sans-serif"
                          >
                            <Icon as={FiClock} boxSize={3} color="#56756D" />
                            <Text>{getReadingTime(featuredPost.content, featuredPost.meta_description)}</Text>
                          </HStack>
                        </HStack>

                        {/* Article Headline */}
                        <Heading
                          as="h2"
                          fontSize={{ base: "22px", md: "28px", lg: "32px" }}
                          fontFamily="'Playfair Display', var(--font-playfair), serif"
                          color="#263A33"
                          lineHeight="1.25"
                          fontWeight="600"
                          _groupHover={{ color: "#56756D" }}
                          transition="color 0.25s ease"
                        >
                          <LinkOverlay as={NextLink} href={`/blog/${featuredPost.slug}/`}>
                            {featuredPost.title}
                          </LinkOverlay>
                        </Heading>

                        {/* Excerpt */}
                        <Text
                          color="rgba(46, 46, 46, 0.72)"
                          fontSize={{ base: "14px", md: "14.5px" }}
                          lineHeight="1.75"
                          fontFamily="'Inter', var(--font-inter), sans-serif"
                          noOfLines={3}
                        >
                          {featuredPost.meta_description || 'Explore clinical dimensions, ethical perspectives, and grounded strategies in this comprehensive essay.'}
                        </Text>

                        {/* Subtle Divider */}
                        <Box w="full" h="1px" bg="rgba(86, 117, 109, 0.12)" my={1} />

                        {/* Author & Read Action Row */}
                        <Flex
                          justify="space-between"
                          align="center"
                          w="full"
                          direction={{ base: "column", sm: "row" }}
                          gap={3.5}
                        >
                          <HStack spacing={3} align="center">
                            {featuredPost.author_avatar ? (
                              <Image
                                src={featuredPost.author_avatar}
                                boxSize="40px"
                                borderRadius="full"
                                border="2px solid #56756D"
                                p="1px"
                                fallbackSrc="/logo_tra.png"
                                referrerPolicy="no-referrer"
                                alt={featuredPost.author_name}
                              />
                            ) : (
                              <Box
                                boxSize="40px"
                                borderRadius="full"
                                bg="#EAF2EE"
                                color="#56756D"
                                border="1.5px solid rgba(86, 117, 109, 0.25)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon as={FiUser} boxSize={4.5} />
                              </Box>
                            )}
                            <VStack align="start" spacing={0.5}>
                              <Text
                                fontSize="13.5px"
                                fontWeight="600"
                                color="#263A33"
                                fontFamily="'Inter', var(--font-inter), sans-serif"
                              >
                                {featuredPost.author_name || 'MLC Clinician'}
                              </Text>
                              <Text
                                fontSize="11px"
                                color="rgba(46, 46, 46, 0.55)"
                                fontFamily="'Inter', var(--font-inter), sans-serif"
                              >
                                {featuredPost.published_at 
                                  ? format(new Date(featuredPost.published_at), 'MMMM dd, yyyy')
                                  : 'Clinical Contributor'}
                              </Text>
                            </VStack>
                          </HStack>

                          <Button
                            as={NextLink}
                            href={`/blog/${featuredPost.slug}/`}
                            size="md"
                            bg="#263A33"
                            color="white"
                            h="42px"
                            px={6}
                            borderRadius="full"
                            fontSize="13px"
                            fontWeight="600"
                            fontFamily="'Inter', var(--font-inter), sans-serif"
                            rightIcon={<FiArrowRight />}
                            _hover={{
                              bg: "#C9A960",
                              color: "#263A33",
                              transform: "translateX(2px)",
                              boxShadow: "0 4px 14px rgba(201, 169, 96, 0.35)",
                            }}
                            transition="all 0.25s ease"
                            zIndex={2}
                          >
                            Read Full Story
                          </Button>
                        </Flex>
                      </VStack>

                      {/* Visual Framed Image Column */}
                      <Box
                        order={{ base: 1, lg: 2 }}
                        flex={{ lg: "1" }}
                        w="full"
                        position="relative"
                        h={{ base: "240px", sm: "300px", md: "340px", lg: "370px" }}
                        borderRadius="22px"
                        overflow="hidden"
                        bg="#EAF2EE"
                        boxShadow="0 8px 24px rgba(0, 0, 0, 0.06)"
                      >
                        {getPostCoverImage(featuredPost) ? (
                          <Image
                            src={getPostCoverImage(featuredPost)}
                            alt={featuredPost.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                            transition="transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                            _groupHover={{ transform: "scale(1.04)" }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Center h="full" bg="#EAF2EE" color="#56756D">
                            <FiBookOpen size={64} />
                          </Center>
                        )}
                        {/* Subtle atmospheric vignette at bottom of image */}
                        <Box
                          position="absolute"
                          inset={0}
                          bg="linear-gradient(to top, rgba(20, 35, 30, 0.4) 0%, transparent 45%)"
                          pointerEvents="none"
                        />
                        {/* Peer-reviewed badge at bottom corner */}
                        <HStack
                          position="absolute"
                          bottom={3.5}
                          left={3.5}
                          bg="rgba(18, 33, 28, 0.78)"
                          backdropFilter="blur(10px)"
                          px={3}
                          py={1.5}
                          borderRadius="full"
                          border="1px solid rgba(255, 255, 255, 0.18)"
                          color="white"
                          spacing={1.5}
                        >
                          <Icon as={FiCheck} color="#C9A960" boxSize={3} />
                          <Text
                            fontSize="11px"
                            fontWeight="600"
                            letterSpacing="0.03em"
                            fontFamily="'Inter', var(--font-inter), sans-serif"
                          >
                            Clinical Perspective
                          </Text>
                        </HStack>
                      </Box>
                    </Flex>
                  </LinkBox>
                )}

                {/* Section Header if regular posts exist */}
                {regularPosts.length > 0 && (
                  <HStack justify="space-between" align="center" mb={6}>
                    <Heading
                      as="h3"
                      fontSize={{ base: '18px', md: '22px' }}
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      color="#263A33"
                      fontWeight="600"
                    >
                      {hasActiveFilters ? `Filtered Articles (${regularPosts.length})` : 'More Clinical Articles'}
                    </Heading>
                    <Text fontSize="13px" color="rgba(46, 46, 46, 0.6)">
                      Showing {regularPosts.length} {regularPosts.length === 1 ? 'perspective' : 'perspectives'}
                    </Text>
                  </HStack>
                )}

                {/* 📚 SECONDARY ARTICLES GRID */}
                {regularPosts.length > 0 && (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {regularPosts.map((post, index) => (
                      <LinkBox
                        as={motion.div}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={post.id}
                        bg="white"
                        borderRadius="24px"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="rgba(86, 117, 109, 0.12)"
                        boxShadow="0 4px 20px rgba(38, 58, 51, 0.03)"
                        display="flex"
                        flexDirection="column"
                        transition="all 0.3s ease"
                        _hover={{
                          transform: 'translateY(-4px)',
                          borderColor: 'rgba(86, 117, 109, 0.28)',
                          boxShadow: '0 12px 30px rgba(38, 58, 51, 0.08)',
                        }}
                      >
                        {/* Post Cover Image */}
                        <Box h="210px" overflow="hidden" bg="#EAF2EE" position="relative">
                          {getPostCoverImage(post) ? (
                            <Image
                              src={getPostCoverImage(post)}
                              alt={post.title}
                              w="full"
                              h="full"
                              objectFit="cover"
                              transition="transform 0.5s ease"
                              _hover={{ transform: 'scale(1.05)' }}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Center h="full" bg="#EAF2EE" color="#56756D">
                              <FiBookOpen size={48} />
                            </Center>
                          )}
                          {post.category && (
                            <Badge
                              position="absolute"
                              top={3.5}
                              left={3.5}
                              bg="white"
                              color="#56756D"
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="11px"
                              fontWeight="700"
                              boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                            >
                              {post.category.name}
                            </Badge>
                          )}
                          <HStack
                            position="absolute"
                            bottom={3}
                            right={3}
                            bg="rgba(20, 25, 24, 0.75)"
                            backdropFilter="blur(8px)"
                            color="white"
                            px={2.5}
                            py={0.5}
                            borderRadius="full"
                            fontSize="11px"
                            fontWeight="600"
                            spacing={1.5}
                          >
                            <Icon as={FiClock} boxSize={3} />
                            <Text>{getReadingTime(post.content, post.meta_description)}</Text>
                          </HStack>
                        </Box>

                        {/* Card Body */}
                        <VStack p={6} align="start" spacing={3} flex="1" justify="space-between">
                          <VStack align="start" spacing={2.5} w="full">
                            <Heading
                              as="h4"
                              fontSize="17.5px"
                              fontFamily="'Playfair Display', var(--font-playfair), serif"
                              color="#263A33"
                              lineHeight="1.35"
                              fontWeight="600"
                              noOfLines={2}
                              _hover={{ color: '#56756D' }}
                              transition="color 0.2s ease"
                            >
                              <LinkOverlay as={NextLink} href={`/blog/${post.slug}/`}>
                                {post.title}
                              </LinkOverlay>
                            </Heading>

                            <Text
                              color="rgba(46, 46, 46, 0.72)"
                              fontSize="13.5px"
                              lineHeight="1.65"
                              noOfLines={3}
                            >
                              {post.meta_description || 'Read more about this clinical exploration and therapeutic practice...'}
                            </Text>
                          </VStack>

                          {/* Footer Info */}
                          <Box w="full" pt={3} borderTop="1px solid" borderColor="gray.100">
                            <HStack justify="space-between" align="center">
                              <HStack spacing={2.5}>
                                {post.author_avatar ? (
                                  <Image
                                    src={post.author_avatar}
                                    boxSize="28px"
                                    borderRadius="full"
                                    fallbackSrc="/logo_tra.png"
                                    referrerPolicy="no-referrer"
                                    alt={post.author_name}
                                  />
                                ) : (
                                  <Box
                                    boxSize="28px"
                                    borderRadius="full"
                                    bg="#EAF2EE"
                                    color="#56756D"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Icon as={FiUser} boxSize={3.5} />
                                  </Box>
                                )}
                                <Text fontSize="12.5px" fontWeight="600" color="#263A33" noOfLines={1}>
                                  {post.author_name || 'MLC'}
                                </Text>
                              </HStack>

                              <Text fontSize="12px" color="gray.400" suppressHydrationWarning>
                                {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : ''}
                              </Text>
                            </HStack>
                          </Box>
                        </VStack>
                      </LinkBox>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            ) : (
              /* Empty Filter State */
              <Center
                py={16}
                px={6}
                flexDirection="column"
                bg="white"
                borderRadius="3xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.02)"
                maxW="600px"
                mx="auto"
                textAlign="center"
              >
                <Box
                  w="56px"
                  h="56px"
                  borderRadius="full"
                  bg="#EAF2EE"
                  color="#56756D"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                >
                  <Icon as={FiSearch} boxSize={6} />
                </Box>
                <Heading as="h3" size="md" fontFamily="'Playfair Display', serif" color="#263A33" mb={2}>
                  No Articles Found
                </Heading>
                <Text color="rgba(46, 46, 46, 0.7)" fontSize="14px" maxW="400px" mb={6}>
                  We could not find any clinical perspectives matching your current filter criteria.
                </Text>
                <Button
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: '#425C55' }}
                  onClick={clearAllFilters}
                >
                  Reset All Filters
                </Button>
              </Center>
            )}
          </AnimatePresence>
        )}

        {/* ═══════════════ CLINICIAN CONTRIBUTION CTA ═══════════════ */}
        <Box
          mt={{ base: 14, md: 20 }}
          p={{ base: 8, md: 10 }}
          borderRadius="3xl"
          bg="linear-gradient(135deg, rgba(86, 117, 109, 0.12) 0%, rgba(20, 36, 32, 0.04) 100%)"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.2)"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <VStack maxW="640px" mx="auto" spacing={4}>
            <Badge
              bg="#263A33"
              color="#F0D591"
              px={3.5}
              py={1}
              borderRadius="full"
              fontSize="11px"
              fontWeight="800"
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              For Practitioners & Clinicians
            </Badge>
            <Heading
              as="h3"
              fontSize={{ base: '22px', md: '28px' }}
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#263A33"
              fontWeight="600"
            >
              Share Your Clinical Perspective
            </Heading>
            <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.78)" lineHeight="1.7">
              Are you a licensed therapist, psychologist, or supervisor with insights on ethical practice, modality nuances, or psychological care? We invite our verified network to publish with the MLC Collective.
            </Text>
            <HStack spacing={4} pt={2} flexWrap="wrap" justify="center">
              <Button
                as={NextLink}
                href="/therapist-apply"
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={6}
                height="42px"
                fontSize="13.5px"
                fontWeight="600"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: '#425C55', transform: 'translateY(-1px)' }}
                transition="all 0.2s ease"
              >
                Join Practitioner Network
              </Button>
              <Button
                as={NextLink}
                href="/contactus"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.3)"
                color="#263A33"
                borderRadius="full"
                px={6}
                height="42px"
                fontSize="13.5px"
                fontWeight="600"
                _hover={{ bg: 'white', borderColor: '#56756D' }}
              >
                Submit Editorial Pitch
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
