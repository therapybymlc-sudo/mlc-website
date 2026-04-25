'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Image, Badge, Stack, Flex, Input, InputGroup, InputLeftElement,
  useToast, Spinner, Center, Divider, Avatar, AvatarGroup,
  Menu, MenuButton, MenuList, MenuItem, Tab, TabList, TabPanel, TabPanels, Tabs,
  Tag, TagLabel, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea,
  FormControl, FormLabel
} from "@chakra-ui/react";
import { 
  FiSearch, FiPlus, FiMessageSquare, FiTrendingUp, FiHash, FiClock,
  FiUser, FiUsers, FiMoreVertical, FiShare2, FiHeart, FiBookmark, FiFilter,
  FiChevronRight, FiCheckCircle, FiShield
} from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

// ===========================
// 🔹 Components
// ===========================

const DiscussionCard = ({ thread, mounted }) => (
  <NextLink href={`/dashboard/therapist/community/${thread.id}`} passHref>
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      bg="white"
      p={6}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "teal.100", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      cursor="pointer"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Badge colorScheme="teal" borderRadius="full" px={3} variant="subtle" fontSize="2xs" fontWeight="800">
              {thread.category_name}
            </Badge>
            {thread.is_pinned && <Icon as={FiHash} color="orange.400" />}
          </HStack>
          <Text fontSize="xs" color="gray.400">{mounted ? new Date(thread.created_at).toLocaleDateString() : ""}</Text>
        </HStack>

        <Heading size="md" color="teal.900" noOfLines={2}>{thread.title}</Heading>
        
        <Text fontSize="sm" color="gray.600" noOfLines={3}>
          {thread.content}
        </Text>

        <HStack justify="space-between" pt={2}>
          <HStack spacing={3}>
            <Avatar size="xs" name={thread.author_name} src={thread.author_image} />
            <Text fontSize="xs" fontWeight="700" color="gray.700">{thread.author_name}</Text>
          </HStack>
          <HStack spacing={4}>
            <HStack spacing={1} color="gray.400">
              <Icon as={FiMessageSquare} />
              <Text fontSize="xs" fontWeight="600">{thread.comment_count}</Text>
            </HStack>
            <HStack spacing={1} color="gray.400">
              <Icon as={FiClock} />
              <Text fontSize="xs" fontWeight="600">{thread.views_count}</Text>
            </HStack>
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  </NextLink>
);

const CategoryPill = ({ category, isActive, onClick }) => (
  <Button
    size="sm"
    variant={isActive ? "solid" : "ghost"}
    colorScheme={isActive ? "teal" : "gray"}
    borderRadius="full"
    leftIcon={<Icon as={FiHash} />}
    onClick={onClick}
    px={4}
    fontSize="xs"
    fontWeight="800"
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
    <Box maxW="7xl" mx="auto">
      <VStack align="stretch" spacing={8}>
        {/* Header Section */}
        <Flex justify="space-between" align="end" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <HStack color="teal.600">
               <Icon as={FiShare2} />
               <Text fontWeight="800" fontSize="xs" letterSpacing="widest">THERAPIST COLLECTIVE</Text>
            </HStack>
            <Heading size="xl" color="teal.900" fontFamily="'Playfair Display', serif">Community Hub</Heading>
            <Text color="gray.500">Your dedicated space for clinical peer support and professional growth.</Text>
          </VStack>
          <HStack spacing={4}>
            <Button 
                as={NextLink}
                href="/dashboard/therapist/community/peers"
                leftIcon={<FiUsers />} 
                variant="outline"
                colorScheme="teal"
                borderRadius="full" 
                px={8}
            >
                Browse Peers
            </Button>
            <Button 
                leftIcon={<FiPlus />} 
                bg="teal.800" 
                color="white" 
                borderRadius="full" 
                px={8}
                _hover={{ bg: "teal.900" }}
                onClick={onOpen}
            >
                Start Discussion
            </Button>
          </HStack>
        </Flex>

        {/* Stats & Banner */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box bgGradient="linear(to-br, teal.800, teal.900)" p={6} borderRadius="3xl" color="white">
                <VStack align="start" spacing={4}>
                    <Icon as={FiShield} boxSize={8} opacity={0.6} />
                    <Box>
                        <Heading size="md" mb={1}>Clinical Circle</Heading>
                        <Text fontSize="xs" opacity={0.8}>Strictly verified clinicians only. All discussions are privileged.</Text>
                    </Box>
                </VStack>
            </Box>
            <Box bg="white" p={6} borderRadius="3xl" border="1px solid" borderColor="teal.50">
                <VStack align="start" spacing={4}>
                    <HStack w="full" justify="space-between">
                        <Heading size="sm" color="gray.700">Active Peers</Heading>
                        <Badge colorScheme="green" borderRadius="full">+12 Today</Badge>
                    </HStack>
                    <AvatarGroup size="sm" max={5}>
                        <Avatar name="Dr. Asma" />
                        <Avatar name="Sarah J." />
                        <Avatar name="Kevin M." />
                        <Avatar name="Priya R." />
                        <Avatar name="John D." />
                        <Avatar name="Extra" />
                    </AvatarGroup>
                    <Text fontSize="xs" color="gray.500">Join 84+ clinical specialists online now.</Text>
                </VStack>
            </Box>
            <Box bg="white" p={6} borderRadius="3xl" border="1px solid" borderColor="teal.50">
                <VStack align="start" spacing={4}>
                    <Heading size="sm" color="gray.700">Trending Topics</Heading>
                    <HStack wrap="wrap" spacing={2}>
                        <Tag size="sm" variant="subtle" colorScheme="orange">#ClinicalEthics</Tag>
                        <Tag size="sm" variant="subtle" colorScheme="blue">#BurnoutPrevention</Tag>
                        <Tag size="sm" variant="subtle" colorScheme="purple">#InsuranceBilling</Tag>
                    </HStack>
                </VStack>
            </Box>
        </SimpleGrid>

        {/* Filter Bar & Tabs */}
        <Tabs variant="soft-rounded" colorScheme="teal" onChange={(index) => setActiveTab(index === 0 ? "discussions" : "resources")}>
          <TabList bg="white" p={2} borderRadius="2xl" shadow="sm" mb={6}>
            <Tab fontWeight="800" fontSize="sm">Discussions</Tab>
            <Tab fontWeight="800" fontSize="sm">Resource Vault</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
                <VStack align="stretch" spacing={8}>
                    <Stack direction={{ base: "column", md: "row" }} justify="space-between" spacing={4} bg="white" p={4} borderRadius="2xl" shadow="sm">
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
                        <InputGroup maxW={{ md: "300px" }}>
                            <InputLeftElement><FiSearch color="gray.400" /></InputLeftElement>
                            <Input 
                                placeholder="Search discussions..." 
                                borderRadius="full" 
                                bg="gray.50" 
                                border="none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Stack>

                    {/* Discussions Grid */}
                    {loading ? (
                      <Center py={20}><Spinner color="teal.500" size="xl" /></Center>
                    ) : (
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        <AnimatePresence>
                            {filteredThreads.map(thread => (
                                <DiscussionCard key={thread.id} thread={thread} mounted={mounted} />
                            ))}
                        </AnimatePresence>
                      </SimpleGrid>
                    )}

                    {!loading && filteredThreads.length === 0 && (
                        <Center py={20} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                            <VStack spacing={4}>
                                <Icon as={FiMessageSquare} boxSize={10} color="gray.200" />
                                <Text fontWeight="700" color="gray.500">No discussions found in this category.</Text>
                                <Button onClick={onOpen} variant="link" color="teal.600">Start the first conversation</Button>
                            </VStack>
                        </Center>
                    )}
                </VStack>
            </TabPanel>

            <TabPanel p={0}>
                <VStack align="stretch" spacing={8}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {communityResources.map((res) => (
                            <MotionBox
                                key={res.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                bg="white"
                                p={6}
                                borderRadius="3xl"
                                border="1px solid"
                                borderColor="gray.100"
                                shadow="sm"
                                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                            >
                                <VStack align="start" spacing={4}>
                                    <Badge colorScheme="teal" borderRadius="full" px={3}>{res.resource_type_label}</Badge>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="sm" color="teal.900">{res.title}</Heading>
                                        <Text fontSize="xs" color="gray.500" noOfLines={2}>{res.description}</Text>
                                    </VStack>
                                    <HStack w="full" justify="space-between" pt={2}>
                                        <HStack spacing={2}>
                                            <Avatar size="xs" name={res.therapist_name} />
                                            <Text fontSize="2xs" fontWeight="700" color="gray.600">{res.therapist_name}</Text>
                                        </HStack>
                                        <Button 
                                            as="a" 
                                            href={res.file || res.url} 
                                            target="_blank" 
                                            size="xs" 
                                            colorScheme="teal" 
                                            variant="ghost" 
                                            rightIcon={<FiChevronRight />}
                                        >
                                            Access
                                        </Button>
                                    </HStack>
                                </VStack>
                            </MotionBox>
                        ))}
                        <Center 
                            p={6} 
                            borderRadius="3xl" 
                            border="2px dashed" 
                            borderColor="gray.200" 
                            cursor="pointer"
                            _hover={{ bg: "teal.50", borderColor: "teal.200" }}
                            onClick={() => toast({ title: "Upload Coming Soon", status: "info" })}
                        >
                            <VStack spacing={2}>
                                <Icon as={FiPlus} boxSize={8} color="gray.300" />
                                <Text fontWeight="700" color="gray.400" fontSize="sm">Share Resource</Text>
                            </VStack>
                        </Center>
                    </SimpleGrid>
                </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* New Thread Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">Start a Discussion</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="400">Share your thoughts, ask a question, or seek peer support.</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="700" fontSize="sm">Category</FormLabel>
                <Stack direction="row" wrap="wrap" spacing={2}>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            size="sm"
                            variant={newThread.category === cat.id ? "solid" : "outline"}
                            colorScheme="teal"
                            borderRadius="full"
                            onClick={() => setNewThread({ ...newThread, category: cat.id })}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </Stack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="700" fontSize="sm">Title</FormLabel>
                <Input 
                    placeholder="E.g., Handling complex transference in trauma work" 
                    borderRadius="xl"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="700" fontSize="sm">Discussion Content</FormLabel>
                <Textarea 
                    placeholder="Describe your context or question in detail..." 
                    borderRadius="xl"
                    minH="200px"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">Cancel</Button>
            <Button 
                bg="teal.800" 
                color="white" 
                borderRadius="full" 
                px={10}
                isLoading={isSubmitting}
                onClick={handleSubmitThread}
                _hover={{ bg: "teal.900" }}
            >
                Post Discussion
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
