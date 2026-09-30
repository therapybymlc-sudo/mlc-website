'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Icon,
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Center,
  Divider,
  Avatar,
  AvatarGroup,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Circle,
  Stack,
} from "@chakra-ui/react";
import { 
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiTrendingUp,
  FiHash,
  FiClock,
  FiUsers,
  FiShare2,
  FiChevronRight,
  FiCheckCircle,
  FiShield,
  FiCompass,
} from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

// ===========================
// 🔹 Components
// ===========================

const DiscussionCard = ({ thread, mounted }) => (
  <MotionBox
    as={NextLink}
    href={`/dashboard/therapist/community/${thread.id}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    bg="white"
    p={5}
    borderRadius="2xl"
    border="1px solid"
    borderColor="rgba(86, 117, 109, 0.14)"
    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
    _hover={{
      boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)",
      borderColor: "rgba(86, 117, 109, 0.28)",
      transform: "translateY(-2px)",
      textDecoration: "none"
    }}
    transition="all 0.2s"
    display="block"
  >
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <Badge 
            bg="rgba(86, 117, 109, 0.1)" 
            color="#56756D" 
            borderRadius="full" 
            px={2.5} 
            py={0.5} 
            fontSize="10px" 
            fontWeight="700"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            {thread.category_name}
          </Badge>
          {thread.is_pinned && (
            <Badge bg="#FEF3C7" color="#92400E" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="700">
              PINNED
            </Badge>
          )}
        </HStack>
        <Text fontSize="11.5px" color="#718096">
          {mounted && thread.created_at ? new Date(thread.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
        </Text>
      </HStack>

      <Heading 
        as="h3"
        fontSize="15px" 
        fontWeight="600" 
        color="#263A33" 
        fontFamily="'Outfit', var(--font-outfit), sans-serif"
        letterSpacing="-0.01em"
        noOfLines={2}
        lineHeight="1.35"
      >
        {thread.title}
      </Heading>
      
      <Text fontSize="13px" color="#5A6E65" noOfLines={3} lineHeight="1.5">
        {thread.content}
      </Text>

      <HStack justify="space-between" pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
        <HStack spacing={2.5}>
          <Avatar size="xs" name={thread.author_name} src={thread.author_image} />
          <Text fontSize="12px" fontWeight="600" color="#263A33">{thread.author_name}</Text>
        </HStack>
        <HStack spacing={3}>
          <HStack spacing={1} color="#718096">
            <Icon as={FiMessageSquare} boxSize="12px" />
            <Text fontSize="11.5px" fontWeight="600">{thread.comment_count || 0}</Text>
          </HStack>
          <HStack spacing={1} color="#718096">
            <Icon as={FiClock} boxSize="12px" />
            <Text fontSize="11.5px" fontWeight="600">{thread.views_count || 0}</Text>
          </HStack>
        </HStack>
      </HStack>
    </VStack>
  </MotionBox>
);

const CategoryPill = ({ category, isActive, onClick }) => (
  <Button
    size="sm"
    h="32px"
    borderRadius="full"
    fontSize="12px"
    fontWeight={isActive ? "700" : "500"}
    bg={isActive ? "#56756D" : "rgba(250, 248, 245, 0.85)"}
    color={isActive ? "white" : "#263A33"}
    border="1px solid"
    borderColor={isActive ? "#56756D" : "rgba(86, 117, 109, 0.16)"}
    boxShadow={isActive ? "0 2px 6px rgba(86, 117, 109, 0.25)" : "none"}
    leftIcon={<Icon as={FiHash} boxSize="11px" />}
    onClick={onClick}
    px={3.5}
    _hover={{
      bg: isActive ? "#46625B" : "rgba(86, 117, 109, 0.08)",
      borderColor: "#56756D",
    }}
    flexShrink={0}
  >
    {category.name}
  </Button>
);

// ===========================
// 🔹 Main Page
// ===========================

export default function CommunityClient() {
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("discussions");
  const [communityResources, setCommunityResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newThread, setNewThread] = useState({ title: "", content: "", category: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        setLoading(true);
        const [catsRes, threadsRes, resourcesRes] = await Promise.all([
          apiGet("community/categories/"),
          apiGet("community/threads/"),
          apiGet("resources/?community=true")
        ]);
        setCategories(catsRes || []);
        setThreads(threadsRes.results || threadsRes || []);
        setCommunityResources(resourcesRes.results || resourcesRes || []);
      } catch (err) {
        toast({ title: "Failed to load community data", status: "error" });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      if (activeCategory !== "all" && t.category_name !== activeCategory && t.category !== activeCategory) return false;
      if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [threads, activeCategory, searchTerm]);

  const handleSubmitThread = async () => {
    if (!newThread.title || !newThread.content || !newThread.category) {
      toast({ title: "Please fill all fields", status: "warning" });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await apiPost("community/threads/", newThread);
      setThreads([res, ...threads]);
      onClose();
      setNewThread({ title: "", content: "", category: "" });
      toast({ title: "Discussion started!", status: "success" });
    } catch (err) {
      toast({ title: "Failed to post discussion", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiUsers} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Therapist Collective · Community
                </Badge>
                <Badge 
                  bg="rgba(16, 185, 129, 0.12)" 
                  color="#047857" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Verified Clinicians Only
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
                Community Hub
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Your dedicated space for peer consultation, clinical support, and shared resources.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Action Buttons */}
          <HStack 
            spacing={3} 
            wrap={{ base: 'wrap', sm: 'nowrap' }} 
            w={{ base: 'full', lg: 'auto' }} 
            justify={{ base: 'flex-start', lg: 'flex-end' }}
          >
            <HStack 
              spacing={3} 
              p={1.5} 
              px={2.5}
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
            >
              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiMessageSquare} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    THREADS
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33">
                    {threads.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiUsers} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    ONLINE
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33">
                    84+ Peers
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button 
              as={NextLink}
              href="/dashboard/therapist/community/peers"
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              borderRadius="full"
              height="38px"
              fontSize="12.5px"
              fontWeight="600"
              px={4.5}
              leftIcon={<Icon as={FiUsers} boxSize="13px" color="#56756D" />}
              _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
              flexShrink={0}
            >
              Browse Peers
            </Button>

            <Button 
              bg="#263A33" 
              color="white" 
              borderRadius="full" 
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              leftIcon={<Icon as={FiPlus} boxSize="13px" />}
              _hover={{ bg: "#182722", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              onClick={onOpen}
              flexShrink={0}
            >
              Start Discussion
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* 🌿 2. CLINICAL PRIVACY ASSURANCE STRIP */}
      <HStack 
        justify="space-between" 
        bg="linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)" 
        p={3} 
        px={4} 
        borderRadius="xl" 
        border="1px solid rgba(16, 185, 129, 0.2)" 
        mb={6}
        wrap="wrap"
        gap={2}
      >
        <HStack spacing={2.5}>
          <Circle size="24px" bg="rgba(16, 185, 129, 0.15)" color="#047857">
            <Icon as={FiShield} boxSize="12px" />
          </Circle>
          <Text fontSize="12.5px" fontWeight="600" color="#064E3B">
            Confidential Clinical Space
          </Text>
          <Text fontSize="12px" color="#5A6E65" display={{ base: "none", md: "inline" }}>
            — Strictly verified practitioners only. Patient-identifying info is prohibited.
          </Text>
        </HStack>

        <HStack spacing={1.5}>
          <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.04em">
            TRENDING:
          </Text>
          <Tag size="sm" borderRadius="full" bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px">#ClinicalEthics</Tag>
          <Tag size="sm" borderRadius="full" bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px">#BurnoutPrevention</Tag>
        </HStack>
      </HStack>

      {/* 🌿 3. TABS & CONTENT STREAM */}
      <Tabs 
        variant="unstyled" 
        onChange={(index) => setActiveTab(index === 0 ? "discussions" : "resources")}
      >
        {/* Modern Pill TabList */}
        <Flex 
          bg="white" 
          p={1.5} 
          borderRadius="xl" 
          border="1px solid rgba(86, 117, 109, 0.12)" 
          boxShadow="0 2px 8px -2px rgba(38, 58, 51, 0.03)"
          mb={6}
          w="fit-content"
          gap={1.5}
        >
          <Tab
            borderRadius="lg"
            px={4}
            py={1.5}
            fontSize="13px"
            fontWeight="600"
            color="#5A6E65"
            _selected={{ bg: "#56756D", color: "white", boxShadow: "0 2px 6px rgba(86, 117, 109, 0.25)" }}
            _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
            transition="all 0.15s ease"
          >
            Discussions
          </Tab>
          <Tab
            borderRadius="lg"
            px={4}
            py={1.5}
            fontSize="13px"
            fontWeight="600"
            color="#5A6E65"
            _selected={{ bg: "#56756D", color: "white", boxShadow: "0 2px 6px rgba(86, 117, 109, 0.25)" }}
            _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
            transition="all 0.15s ease"
          >
            Resource Vault
          </Tab>
        </Flex>

        <TabPanels>
          <TabPanel p={0}>
            <VStack align="stretch" spacing={6}>
              {/* Category Filter Bar + Search */}
              <Flex 
                direction={{ base: "column", md: "row" }} 
                justify="space-between" 
                align={{ base: "stretch", md: "center" }}
                gap={3} 
                bg="white" 
                p={3.5} 
                borderRadius="2xl" 
                border="1px solid rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 16px -2px rgba(38, 58, 51, 0.03)"
              >
                <HStack spacing={2} overflowX="auto" pb={{ base: 2, md: 0 }}>
                  <CategoryPill 
                    category={{ name: "All Topics" }} 
                    isActive={activeCategory === "all"} 
                    onClick={() => setActiveCategory("all")} 
                  />
                  {categories.map(cat => (
                    <CategoryPill 
                      key={cat.id} 
                      category={cat} 
                      isActive={activeCategory === cat.name || activeCategory === cat.id} 
                      onClick={() => setActiveCategory(cat.name)} 
                    />
                  ))}
                </HStack>

                <InputGroup maxW={{ md: "260px" }}>
                  <InputLeftElement pointerEvents="none" h="36px">
                    <Icon as={FiSearch} color="#718096" boxSize="13px" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search discussions..." 
                    borderRadius="full" 
                    bg="rgba(250, 248, 245, 0.85)" 
                    border="1px solid rgba(86, 117, 109, 0.16)"
                    h="36px"
                    fontSize="12.5px"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    _focus={{ borderColor: "#56756D", bg: "white" }}
                  />
                </InputGroup>
              </Flex>

              {/* Discussions Stream */}
              {loading ? (
                <Center py={20}><Spinner color="#56756D" size="xl" /></Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <AnimatePresence>
                    {filteredThreads.map(thread => (
                      <DiscussionCard key={thread.id} thread={thread} mounted={mounted} />
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
              )}

              {!loading && filteredThreads.length === 0 && (
                <Box 
                  py={16} 
                  bg="white" 
                  borderRadius="2xl" 
                  border="1px solid rgba(86, 117, 109, 0.14)" 
                  boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                  textAlign="center"
                >
                  <VStack spacing={3} maxW="360px" mx="auto">
                    <Circle size="46px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiMessageSquare} boxSize="20px" />
                    </Circle>
                    <VStack spacing={1}>
                      <Text 
                        fontSize="15px" 
                        fontWeight="600" 
                        color="#263A33"
                        fontFamily="'Outfit', var(--font-outfit), sans-serif"
                      >
                        No Discussions Found
                      </Text>
                      <Text fontSize="12.5px" color="#5A6E65">
                        No active conversations match this category yet. Be the first to start a conversation.
                      </Text>
                    </VStack>
                    <Button 
                      onClick={onOpen} 
                      bg="#56756D"
                      color="white"
                      size="sm"
                      h="34px"
                      borderRadius="full"
                      px={4}
                      mt={1}
                      _hover={{ bg: "#263A33" }}
                    >
                      Start Discussion
                    </Button>
                  </VStack>
                </Box>
              )}
            </VStack>
          </TabPanel>

          <TabPanel p={0}>
            <VStack align="stretch" spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {communityResources.map((res) => (
                  <MotionBox
                    key={res.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    bg="white"
                    p={5}
                    borderRadius="2xl"
                    border="1px solid rgba(86, 117, 109, 0.14)"
                    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
                    _hover={{ boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" spacing={3}>
                      <Badge bg="rgba(86, 117, 109, 0.1)" color="#56756D" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="700">
                        {res.resource_type_label || "Resource"}
                      </Badge>
                      <VStack align="start" spacing={1}>
                        <Heading 
                          as="h4"
                          fontSize="15px" 
                          fontWeight="600" 
                          color="#263A33"
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        >
                          {res.title}
                        </Heading>
                        <Text fontSize="12.5px" color="#5A6E65" noOfLines={2}>
                          {res.description}
                        </Text>
                      </VStack>
                      <HStack w="full" justify="space-between" pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
                        <HStack spacing={2}>
                          <Avatar size="xs" name={res.therapist_name} />
                          <Text fontSize="11px" fontWeight="600" color="#263A33">{res.therapist_name}</Text>
                        </HStack>
                        <Button 
                          as="a" 
                          href={res.file || res.url} 
                          target="_blank" 
                          size="xs" 
                          variant="ghost" 
                          color="#56756D"
                          fontWeight="600"
                          rightIcon={<Icon as={FiChevronRight} />}
                          _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                        >
                          Access
                        </Button>
                      </HStack>
                    </VStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* New Thread Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(6px)" bg="rgba(38, 58, 51, 0.3)" />
        <ModalContent 
          borderRadius="2xl" 
          p={3}
          border="1px solid rgba(86, 117, 109, 0.16)"
          boxShadow="0 20px 40px -8px rgba(6, 78, 59, 0.2)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          <ModalHeader pb={2}>
            <Heading 
              fontSize="18px" 
              fontWeight="600" 
              color="#263A33" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              letterSpacing="-0.01em"
            >
              Start a Clinical Discussion
            </Heading>
            <Text fontSize="12.5px" color="#5A6E65" fontWeight="400" mt={0.5}>
              Share clinical thoughts, explore ethical dilemmas, or consult with peers.
            </Text>
          </ModalHeader>
          <ModalCloseButton mt={2} mr={2} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={2}>
                  Category
                </FormLabel>
                <Stack direction="row" wrap="wrap" spacing={2}>
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      size="xs"
                      h="28px"
                      variant={newThread.category === cat.id ? "solid" : "outline"}
                      bg={newThread.category === cat.id ? "#56756D" : "white"}
                      color={newThread.category === cat.id ? "white" : "#263A33"}
                      borderColor={newThread.category === cat.id ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
                      borderRadius="full"
                      px={3}
                      fontSize="11.5px"
                      fontWeight={newThread.category === cat.id ? "700" : "500"}
                      onClick={() => setNewThread({ ...newThread, category: cat.id })}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </Stack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                  Discussion Title
                </FormLabel>
                <Input 
                  placeholder="E.g., Handling complex transference in trauma work" 
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.6)"
                  border="1px solid rgba(86, 117, 109, 0.18)"
                  fontSize="13px"
                  h="38px"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  _focus={{ borderColor: "#56756D", bg: "white" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                  Clinical Context & Details
                </FormLabel>
                <Textarea 
                  placeholder="Describe your context, therapeutic query, or framework in detail (ensure client confidentiality is strictly maintained)..." 
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.6)"
                  border="1px solid rgba(86, 117, 109, 0.18)"
                  fontSize="13px"
                  minH="160px"
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  _focus={{ borderColor: "#56756D", bg: "white" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pt={3}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full" fontSize="12.5px">Cancel</Button>
            <Button 
              bg="#263A33" 
              color="white" 
              borderRadius="full" 
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={8}
              isLoading={isSubmitting}
              onClick={handleSubmitThread}
              _hover={{ bg: "#182722" }}
            >
              Post Discussion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
