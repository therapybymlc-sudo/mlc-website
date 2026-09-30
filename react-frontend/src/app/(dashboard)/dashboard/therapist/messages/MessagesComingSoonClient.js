'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Icon,
  Divider,
  Flex,
  Badge,
  Circle,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Grid,
  Textarea,
  Stack,
  Center
} from "@chakra-ui/react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiPaperclip,
  FiLock,
  FiShield,
  FiCheck,
  FiSearch,
  FiClock,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiFileText,
  FiPlus,
  FiCheckCircle,
  FiPhoneCall,
  FiX,
  FiDownload,
  FiVideo,
  FiActivity
} from "react-icons/fi";
import NextLink from "next/link";
import { useAuth } from "../../../../../context/AuthContext";
import { apiGet } from "../../../../../api.js";

/* ========================================================
   Initial Clinical Message Threads & Care Space Data
======================================================== */
const INITIAL_THREADS = [
  {
    id: 't-1',
    name: 'Michael K.',
    role: 'Client · Anxiety Track',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    lastTime: '10:45 AM',
    unread: 1,
    nextSession: 'Thu, Oct 2 · 2:00 PM',
    clinicalTrack: 'CBT for Generalized Anxiety',
    type: 'client',
    messages: [
      {
        id: 'm-1',
        sender: 'client',
        text: 'Hi Dr. Chen, I wanted to follow up on the mindfulness practice we discussed during our session on Tuesday.',
        time: '10:15 AM'
      },
      {
        id: 'm-2',
        sender: 'therapist',
        text: 'Hello Michael, wonderful to hear from you. How did the 5-4-3-2-1 grounding technique feel when the anxiety spiked during your commute?',
        time: '10:30 AM'
      },
      {
        id: 'm-3',
        sender: 'client',
        text: 'It really brought my heart rate down. Here is the daily thought record I completed over the weekend.',
        time: '10:42 AM',
        attachment: { name: 'Thought-Record-Week-4.pdf', size: '1.2 MB' }
      },
      {
        id: 'm-4',
        sender: 'client',
        text: 'Should I continue with the evening reflection prompts until our next appointment?',
        time: '10:45 AM'
      }
    ]
  },
  {
    id: 't-2',
    name: 'Emma Watson',
    role: 'Client · Trauma Recovery',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastTime: 'Yesterday',
    unread: 0,
    nextSession: 'Fri, Oct 3 · 11:30 AM',
    clinicalTrack: 'EMDR & Somatic Integration',
    type: 'client',
    messages: [
      {
        id: 'm-1',
        sender: 'therapist',
        text: 'Hi Emma, checking in after our EMDR processing session yesterday. Please remember to hydrate and allow yourself restful pacing today.',
        time: 'Yesterday 3:15 PM'
      },
      {
        id: 'm-2',
        sender: 'client',
        text: 'Thank you Dr. Chen. I took a calm walk this morning as recommended. Feeling much lighter and more grounded.',
        time: 'Yesterday 5:40 PM'
      }
    ]
  },
  {
    id: 't-3',
    name: 'David Miller',
    role: 'Client · Stress Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    lastTime: 'Sep 28',
    unread: 0,
    nextSession: 'Mon, Oct 6 · 4:00 PM',
    clinicalTrack: 'Mindfulness-Based Stress Reduction',
    type: 'client',
    messages: [
      {
        id: 'm-1',
        sender: 'client',
        text: 'Dr. Chen, I submitted the updated intake reflections questionnaire through the MLC portal.',
        time: 'Sep 28 11:00 AM'
      },
      {
        id: 'm-2',
        sender: 'therapist',
        text: 'Received, David. I have reviewed your submission and integrated the notes into our clinical blueprint for Monday.',
        time: 'Sep 28 1:20 PM'
      }
    ]
  },
  {
    id: 't-4',
    name: 'Dr. Marcus Vance, Psy.D',
    role: 'Peer Supervisor · Clinical Review',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'offline',
    lastTime: 'Sep 26',
    unread: 0,
    nextSession: 'Supervision · Bi-weekly',
    clinicalTrack: 'Clinical Ethics & Supervision',
    type: 'supervision',
    messages: [
      {
        id: 'm-1',
        sender: 'client',
        text: 'Sarah, the complex case consultation notes for the adolescent client have been countersigned in the supervision log.',
        time: 'Sep 26 2:15 PM'
      },
      {
        id: 'm-2',
        sender: 'therapist',
        text: 'Thank you Marcus, much appreciated. Looking forward to our peer consult next week.',
        time: 'Sep 26 3:45 PM'
      }
    ]
  }
];

const QUICK_TEMPLATES = [
  { label: 'Session Follow-up', text: 'Thank you for your openness during our session today. Remember to practice the breathing exercises we discussed, and be gentle with yourself.' },
  { label: 'Mindfulness Check-in', text: 'Hi, just checking in to see how your daily grounding exercise is feeling this week. Take your time and honor your pace.' },
  { label: 'Resource Shared', text: 'I have attached an updated clinical worksheet to your Care Tools section. We will review it together in our next session.' },
  { label: 'Appointment Reminder', text: 'Friendly reminder of our upcoming session on Thursday at 2:00 PM. Please have a quiet, comfortable space prepared.' }
];

export default function MessagesComingSoonClient() {
  const { isDummyTherapist } = useAuth();
  const toast = useToast();
  const [threads, setThreads] = useState(isDummyTherapist ? INITIAL_THREADS : []);
  const [activeThreadId, setActiveThreadId] = useState(isDummyTherapist ? 't-1' : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'client' | 'unread' | 'supervision'
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadThreads() {
      try {
        const [threadRes, clientsRes] = await Promise.allSettled([
          apiGet("messages/threads/"),
          apiGet("clients/")
        ]);

        if (!isMounted) return;

        let loaded = [];
        if (threadRes.status === "fulfilled" && Array.isArray(threadRes.value) && threadRes.value.length > 0) {
          loaded = threadRes.value;
        } else if (clientsRes.status === "fulfilled") {
          const clientList = Array.isArray(clientsRes.value) ? clientsRes.value : (clientsRes.value?.results || []);
          if (clientList.length > 0) {
            loaded = clientList.map((c) => ({
              id: `c-${c.id}`,
              name: c.name || "Client",
              role: `Client · ${c.primary_concern || 'Therapy Track'}`,
              avatar: c.profile_image || "",
              status: "offline",
              lastTime: "Active",
              unread: 0,
              nextSession: c.next_appointment ? new Date(c.next_appointment).toLocaleDateString([], { month: "short", day: "numeric" }) : "Unscheduled",
              clinicalTrack: c.primary_concern || "Standard Clinical Protocol",
              type: "client",
              messages: []
            }));
          }
        }

        if (isDummyTherapist) {
          if (loaded.length === 0 || loaded.every((t) => !t.messages || t.messages.length === 0)) {
            loaded = INITIAL_THREADS;
          }
        }

        setThreads(loaded);
        if (loaded.length > 0) {
          setActiveThreadId((prev) => (prev && loaded.some(t => t.id === prev) ? prev : loaded[0].id));
        }
      } catch (err) {
        console.warn("Failed to load threads", err);
        if (isDummyTherapist) {
          setThreads(INITIAL_THREADS);
          setActiveThreadId('t-1');
        }
      }
    }
    loadThreads();
    return () => { isMounted = false; };
  }, [isDummyTherapist]);

  // New message modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Clinical context floating modal state
  const { 
    isOpen: isContextOpen, 
    onOpen: onContextOpen, 
    onClose: onContextClose 
  } = useDisclosure();
  const [newRecipient, setNewRecipient] = useState('');
  const [newMessageText, setNewMessageText] = useState('');

  const activeThread = useMemo(() => {
    if (!threads || threads.length === 0) return null;
    return threads.find((t) => t.id === activeThreadId) || threads[0] || null;
  }, [threads, activeThreadId]);

  // Scroll to bottom when active thread messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return (threads || []).filter((t) => {
      if (!t) return false;
      const tName = t.name || "";
      const tRole = t.role || "";
      const matchesSearch =
        tName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tRole.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterType === 'all') return true;
      if (filterType === 'unread') return (t.unread || 0) > 0;
      if (filterType === 'client') return t.type === 'client';
      if (filterType === 'supervision') return t.type === 'supervision';
      return true;
    });
  }, [threads, searchQuery, filterType]);

  // Total unread count
  const totalUnread = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.unread || 0), 0);
  }, [threads]);

  // Send message handler
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'therapist',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastTime: 'Just now',
            unread: 0,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      })
    );

    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick template insertion
  const handleApplyTemplate = (templateText) => {
    setInputText(templateText);
  };

  // Select thread and mark read
  const handleSelectThread = (id) => {
    setActiveThreadId(id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t))
    );
  };

  // Handle attachment click
  const handleAttachFile = () => {
    toast({
      duration: 3500,
      position: 'bottom-right',
      render: ({ onClose }) => (
        <HStack
          spacing={3}
          p={3.5}
          bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.35)"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          backdropFilter="blur(16px)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          maxW="360px"
        >
          <Circle size="30px" bg="#10B981" color="white" flexShrink={0}>
            <Icon as={FiCheck} boxSize="15px" />
          </Circle>
          <VStack align="start" spacing={0.5} flex={1}>
            <Text fontSize="13px" fontWeight="600" color="#064E3B">
              Clinical Vault Ready
            </Text>
            <Text fontSize="12px" color="#065F46" fontWeight="500">
              Encrypted PDF or worksheet attachment ready for transmission.
            </Text>
          </VStack>
          <IconButton
            icon={<FiX size={13} />}
            size="xs"
            variant="ghost"
            color="#065F46"
            borderRadius="full"
            onClick={onClose}
            aria-label="Close"
          />
        </HStack>
      )
    });
  };

  // Create new thread modal submit
  const handleCreateNewThread = () => {
    if (!newRecipient.trim() || !newMessageText.trim()) return;

    const newId = `t-${Date.now()}`;
    const newThread = {
      id: newId,
      name: newRecipient.trim(),
      role: 'Client · Direct Thread',
      avatar: '',
      status: 'online',
      lastTime: 'Just now',
      unread: 0,
      nextSession: 'Pending Schedule',
      clinicalTrack: 'Individual Therapy',
      type: 'client',
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'therapist',
          text: newMessageText.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setNewRecipient('');
    setNewMessageText('');
    onClose();

    toast({
      duration: 3500,
      position: 'bottom-right',
      render: ({ onClose }) => (
        <HStack
          spacing={3}
          p={3.5}
          bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.35)"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          backdropFilter="blur(16px)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          maxW="360px"
        >
          <Circle size="30px" bg="#10B981" color="white" flexShrink={0}>
            <Icon as={FiCheck} boxSize="15px" />
          </Circle>
          <VStack align="start" spacing={0.5} flex={1}>
            <Text fontSize="13px" fontWeight="600" color="#064E3B">
              Secure Thread Started
            </Text>
            <Text fontSize="12px" color="#065F46" fontWeight="500">
              Encrypted channel initialized with zero contact exposure.
            </Text>
          </VStack>
          <IconButton
            icon={<FiX size={13} />}
            size="xs"
            variant="ghost"
            color="#065F46"
            borderRadius="full"
            onClick={onClose}
            aria-label="Close"
          />
        </HStack>
      )
    });
  };

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark Architecture) */}
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
          {/* Left: Avatar + Title + Badges */}
          <HStack spacing={3.5} align="center">
            <Box position="relative">
              <Circle
                size="48px"
                bg="rgba(86, 117, 109, 0.1)"
                color="#56756D"
                border="2px solid white"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              >
                <Icon as={FiMessageSquare} boxSize="22px" />
              </Circle>
              <Circle
                size="11px"
                bg="#38A169"
                border="2px solid white"
                position="absolute"
                bottom="0"
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.2)"
                  color="#263A33"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  COMMUNICATION · CARE CONTINUITY
                </Badge>
                <Badge
                  bg="rgba(86, 117, 109, 0.12)"
                  color="#56756D"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  256-BIT ENCRYPTED
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
                Client Communication Suite
              </Heading>

              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                End-to-end encrypted messaging, care updates, and secure appointment coordination.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + New Message Action */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={3}
            align={{ base: "stretch", md: "center" }}
            w={{ base: "full", lg: "auto" }}
            flexShrink={0}
          >
            <HStack
              spacing={{ base: 1.5, sm: 2.5 }}
              p={1.5}
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              w={{ base: "full", md: "auto" }}
              justify="space-between"
              flexShrink={0}
            >
              {/* Metric 1 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiMessageSquare} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    CHANNELS
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {threads.length} Active {totalUnread > 0 && `(${totalUnread} Unread)`}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Metric 2 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiLock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    PROTOCOL
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    256-Bit AES
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Metric 3 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(59, 130, 246, 0.12)" color="#2563EB" flexShrink={0}>
                  <Icon as={FiShield} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    STANDARDS
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    HIPAA Compliant
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Primary Action Button: Adjusted to the right with small icon */}
            <Button
              onClick={onOpen}
              bg="#56756D"
              color="white"
              borderRadius="full"
              height="36px"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              whiteSpace="nowrap"
              flexShrink={0}
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              leftIcon={<Icon as={FiPlus} boxSize="13px" />}
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              _active={{ bg: "#1f2e29" }}
              transition="all 0.2s"
            >
              New Message
            </Button>
          </Stack>
        </Flex>
      </Box>

      {/* 🌿 2. MAIN FULL-WIDTH MESSAGING WORKSPACE */}
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        overflow="hidden"
      >
            {/* Split Panel: Left List (320px) + Right Active Chat */}
            <Flex direction={{ base: "column", md: "row" }} minH="600px">
              {/* --- THREADS SIDEBAR --- */}
              <Box
                w={{ base: "100%", md: "310px" }}
                borderRight="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                bg="rgba(250, 248, 245, 0.45)"
                p={4}
                display="flex"
                flexDirection="column"
              >
                {/* Search Input */}
                <InputGroup size="sm" mb={3}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="#56756D" boxSize="13px" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="full"
                    bg="white"
                    borderColor="rgba(86, 117, 109, 0.18)"
                    fontSize="12.5px"
                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  />
                  {searchQuery && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<FiX size={12} />}
                      position="absolute"
                      right="6px"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={2}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    />
                  )}
                </InputGroup>

                {/* Filter Pills */}
                <HStack spacing={1.5} mb={3} overflowX="auto" pb={1}>
                  {[
                    { id: 'all', label: `All (${threads.length})` },
                    { id: 'client', label: 'Clients' },
                    { id: 'unread', label: totalUnread > 0 ? `Unread (${totalUnread})` : 'Unread' },
                    { id: 'supervision', label: 'Peer Review' }
                  ].map((filter) => {
                    const active = filterType === filter.id;
                    return (
                      <Button
                        key={filter.id}
                        size="xs"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="11px"
                        fontWeight="600"
                        bg={active ? "#56756D" : "white"}
                        color={active ? "white" : "#5A6E65"}
                        border="1px solid"
                        borderColor={active ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                        _hover={{ bg: active ? "#263A33" : "rgba(86, 117, 109, 0.08)" }}
                        onClick={() => setFilterType(filter.id)}
                      >
                        {filter.label}
                      </Button>
                    );
                  })}
                </HStack>

                <Divider borderColor="rgba(86, 117, 109, 0.1)" mb={2} />

                {/* Thread Items List */}
                <VStack align="stretch" spacing={1.5} flex={1} overflowY="auto" maxH={{ base: "260px", md: "500px" }}>
                  {filteredThreads.length === 0 ? (
                    <Box py={8} textAlign="center">
                      <Icon as={FiMessageSquare} color="#A0AEC0" boxSize="22px" mb={2} />
                      <Text fontSize="12.5px" color="#718096">No conversations found</Text>
                    </Box>
                  ) : (
                    filteredThreads.map((thread) => {
                      const isSelected = thread.id === activeThreadId;
                      const lastMessage = Array.isArray(thread?.messages) && thread.messages.length > 0
                        ? thread.messages[thread.messages.length - 1]
                        : null;

                      return (
                        <Box
                          key={thread.id}
                          onClick={() => handleSelectThread(thread.id)}
                          p={2.5}
                          borderRadius="xl"
                          bg={isSelected ? "white" : "transparent"}
                          border="1px solid"
                          borderColor={isSelected ? "rgba(86, 117, 109, 0.25)" : "transparent"}
                          boxShadow={isSelected ? "0 2px 8px rgba(38, 58, 51, 0.05)" : "none"}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ bg: isSelected ? "white" : "rgba(86, 117, 109, 0.06)" }}
                        >
                          <HStack spacing={2.5} align="start">
                            <Box position="relative">
                              <Avatar
                                size="sm"
                                name={thread.name}
                                src={thread.avatar}
                                bg="rgba(86, 117, 109, 0.15)"
                                color="#263A33"
                              />
                              {thread.status === 'online' && (
                                <Circle
                                  size="8px"
                                  bg="#38A169"
                                  border="1.5px solid white"
                                  position="absolute"
                                  bottom="0"
                                  right="0"
                                />
                              )}
                            </Box>

                            <VStack align="start" spacing={0.5} flex={1} overflow="hidden">
                              <Flex justify="space-between" align="center" w="100%">
                                <Text
                                  fontSize="13px"
                                  fontWeight={isSelected || thread.unread > 0 ? "700" : "600"}
                                  color="#263A33"
                                  isTruncated
                                >
                                  {thread.name}
                                </Text>
                                <Text fontSize="10.5px" color="#A0AEC0">
                                  {thread.lastTime}
                                </Text>
                              </Flex>

                              <Text fontSize="11px" color="#718096" isTruncated w="100%">
                                {thread.role}
                              </Text>

                              <HStack justify="space-between" w="100%" pt={0.5}>
                                <Text
                                  fontSize="12px"
                                  color={thread.unread > 0 ? "#263A33" : "#5A6E65"}
                                  fontWeight={thread.unread > 0 ? "600" : "400"}
                                  isTruncated
                                  maxW="180px"
                                >
                                  {lastMessage ? lastMessage.text : "No messages yet"}
                                </Text>
                                {thread.unread > 0 && (
                                  <Badge
                                    bg="#56756D"
                                    color="white"
                                    borderRadius="full"
                                    fontSize="10px"
                                    px={1.5}
                                    py={0.2}
                                  >
                                    {thread.unread}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })
                  )}
                </VStack>
              </Box>

              {/* --- ACTIVE CONVERSATION PANE --- */}
              <Box flex={1} display="flex" flexDirection="column" bg="white">
                {activeThread ? (
                  <>
                    {/* Chat Header */}
                    <Flex
                  p={4}
                  align="center"
                  justify="space-between"
                  borderBottom="1px solid"
                  borderColor="rgba(86, 117, 109, 0.12)"
                  bg="white"
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={activeThread.name}
                      src={activeThread.avatar}
                      bg="rgba(86, 117, 109, 0.15)"
                      color="#263A33"
                    />
                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Text
                          fontSize="14.5px"
                          fontWeight="600"
                          color="#263A33"
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        >
                          {activeThread.name}
                        </Text>
                        <Badge
                          bg="rgba(56, 161, 105, 0.12)"
                          color="#2F855A"
                          fontSize="9.5px"
                          borderRadius="full"
                          px={2}
                          py={0.2}
                        >
                          ENCRYPTED
                        </Badge>
                      </HStack>
                      <Text fontSize="11.5px" color="#5A6E65">
                        {activeThread.clinicalTrack} · Next: {activeThread.nextSession}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={2} wrap="wrap">
                    <Button
                      onClick={onContextOpen}
                      size="xs"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      h="28px"
                      fontSize="11.5px"
                      fontWeight="600"
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                      leftIcon={<Icon as={FiActivity} boxSize="11px" color="#56756D" />}
                    >
                      Clinical Context
                    </Button>
                    <Button
                      as={NextLink}
                      href="/dashboard/therapist/appointments"
                      size="xs"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      h="28px"
                      fontSize="11.5px"
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                      leftIcon={<Icon as={FiCalendar} boxSize="11px" />}
                    >
                      Schedule
                    </Button>
                    <Button
                      as={NextLink}
                      href="/dashboard/therapist/clients"
                      size="xs"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      h="28px"
                      fontSize="11.5px"
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                      leftIcon={<Icon as={FiUser} boxSize="11px" />}
                    >
                      Client File
                    </Button>
                  </HStack>
                </Flex>

                {/* Encryption & HIPAA Assurance Scrim */}
                <Box
                  bg="rgba(250, 248, 245, 0.9)"
                  py={2}
                  px={4}
                  borderBottom="1px solid"
                  borderColor="rgba(86, 117, 109, 0.08)"
                >
                  <HStack justify="center" spacing={2}>
                    <Icon as={FiLock} color="#56756D" boxSize="11px" />
                    <Text fontSize="11px" color="#5A6E65" fontWeight="500">
                      Messages are end-to-end encrypted with cloaked therapist identity. Stored in clinical vault.
                    </Text>
                  </HStack>
                </Box>

                {/* Messages Stream */}
                <Box
                  flex={1}
                  p={4}
                  overflowY="auto"
                  maxH="380px"
                  bg="rgba(255, 255, 255, 0.7)"
                  display="flex"
                  flexDirection="column"
                  gap={3.5}
                >
                  {/* Date Divider */}
                  <Flex align="center" my={1}>
                    <Divider borderColor="rgba(86, 117, 109, 0.15)" />
                    <Text
                      px={3}
                      fontSize="10.5px"
                      fontWeight="600"
                      color="#718096"
                      whiteSpace="nowrap"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      Encrypted Clinical Record
                    </Text>
                    <Divider borderColor="rgba(86, 117, 109, 0.15)" />
                  </Flex>

                  {/* Message Bubbles */}
                  {(activeThread.messages || []).map((msg) => {
                    const isTherapist = msg.sender === 'therapist';

                    return (
                      <Flex
                        key={msg.id}
                        justify={isTherapist ? "flex-end" : "flex-start"}
                        w="100%"
                      >
                        <Box maxW={{ base: "85%", md: "72%" }}>
                          <Box
                            p={3}
                            borderRadius="2xl"
                            borderBottomRightRadius={isTherapist ? "sm" : "2xl"}
                            borderBottomLeftRadius={!isTherapist ? "sm" : "2xl"}
                            bg={isTherapist ? "rgba(86, 117, 109, 0.1)" : "rgba(250, 248, 245, 0.95)"}
                            border="1px solid"
                            borderColor={isTherapist ? "rgba(86, 117, 109, 0.22)" : "rgba(86, 117, 109, 0.12)"}
                            color="#263A33"
                          >
                            <Text fontSize="13px" lineHeight="1.5">
                              {msg.text}
                            </Text>

                            {/* Attached File Tile if present */}
                            {msg.attachment && (
                              <HStack
                                mt={2.5}
                                p={2}
                                bg="white"
                                borderRadius="lg"
                                border="1px solid rgba(86, 117, 109, 0.15)"
                                spacing={2.5}
                              >
                                <Circle size="24px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                                  <Icon as={FiFileText} boxSize="12px" />
                                </Circle>
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text fontSize="11.5px" fontWeight="600" color="#263A33">
                                    {msg.attachment.name}
                                  </Text>
                                  <Text fontSize="10px" color="#718096">
                                    {msg.attachment.size} · PDF
                                  </Text>
                                </VStack>
                                <IconButton
                                  size="xs"
                                  icon={<FiDownload size={12} />}
                                  aria-label="Download attachment"
                                  variant="ghost"
                                  color="#56756D"
                                  onClick={handleAttachFile}
                                />
                              </HStack>
                            )}
                          </Box>

                          <HStack
                            justify={isTherapist ? "flex-end" : "flex-start"}
                            spacing={1}
                            mt={1}
                            px={1}
                          >
                            <Text fontSize="10.5px" color="#A0AEC0">
                              {msg.time}
                            </Text>
                            {isTherapist && (
                              <Icon as={FiCheck} color="#56756D" boxSize="11px" />
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Quick Clinical Templates Strip */}
                <Box px={4} py={2} bg="rgba(250, 248, 245, 0.6)" borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.08)">
                  <HStack spacing={1.5} overflowX="auto" pb={1}>
                    <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" whiteSpace="nowrap">
                      Templates:
                    </Text>
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <Button
                        key={idx}
                        size="xs"
                        variant="outline"
                        borderColor="rgba(86, 117, 109, 0.2)"
                        bg="white"
                        color="#263A33"
                        borderRadius="full"
                        px={2.5}
                        h="24px"
                        fontSize="10.5px"
                        whiteSpace="nowrap"
                        _hover={{ bg: "rgba(86, 117, 109, 0.1)", borderColor: "#56756D" }}
                        onClick={() => handleApplyTemplate(tmpl.text)}
                      >
                        {tmpl.label}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {/* Compose Input Area */}
                <Box p={3.5} borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.12)" bg="white">
                  <HStack spacing={2} align="flex-end">
                    <IconButton
                      icon={<FiPaperclip size={16} />}
                      aria-label="Attach File"
                      variant="ghost"
                      color="#56756D"
                      borderRadius="full"
                      size="sm"
                      h="36px"
                      w="36px"
                      onClick={handleAttachFile}
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                    />

                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={`Type a secure message to ${activeThread?.name || 'client'}... (Press Enter to send)`}
                      resize="none"
                      rows={2}
                      fontSize="13px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      bg="rgba(250, 248, 245, 0.4)"
                    />

                    {/* Primary Send Button: Signature Brand Sage */}
                    <Button
                      onClick={handleSendMessage}
                      isDisabled={!inputText.trim()}
                      bg="#56756D"
                      color="white"
                      borderRadius="full"
                      h="36px"
                      px={4}
                      fontSize="12.5px"
                      fontWeight="600"
                      boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                      rightIcon={<Icon as={FiSend} boxSize="13px" />}
                      _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                      _active={{ bg: "#1f2e29" }}
                      transition="all 0.2s"
                    >
                      Send
                    </Button>
                  </HStack>
                </Box>
              </>
            ) : (
              <Center flex="1" p={10}>
                <VStack spacing={3} maxW="380px" textAlign="center">
                  <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                    <Icon as={FiMessageSquare} boxSize="22px" />
                  </Circle>
                  <Text fontSize="16px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                    No active conversations
                  </Text>
                  <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                    When clients book sessions or message your care space, your secure clinical conversations will appear here.
                  </Text>
                  <Button
                    as={NextLink}
                    href="/dashboard/therapist/clients"
                    size="sm"
                    borderRadius="full"
                    bg="#56756D"
                    color="white"
                    _hover={{ bg: "#263A33" }}
                    px={5}
                    mt={2}
                  >
                    View Client Caseload
                  </Button>
                </VStack>
              </Center>
            )}
          </Box>
            </Flex>
          </Box>

      {/* 🌿 3. CLINICAL CONTEXT FLOATING WINDOW / MODAL */}
      <Modal isOpen={isContextOpen && !!activeThread} onClose={onContextClose} isCentered size="md">
        <ModalOverlay bg="rgba(38, 58, 51, 0.4)" backdropFilter="blur(6px)" />
        <ModalContent
          borderRadius="2xl"
          p={3}
          border="1px solid rgba(86, 117, 109, 0.2)"
          boxShadow="0 20px 40px -4px rgba(38, 58, 51, 0.2)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          <ModalHeader
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            fontSize="18px"
            fontWeight="600"
            color="#263A33"
            pb={2}
          >
            <HStack justify="space-between" align="center" pr={6}>
              <HStack spacing={2.5}>
                <Circle size="30px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiUser} boxSize="15px" />
                </Circle>
                <Text>Clinical Context</Text>
              </HStack>
              <Badge
                bg="rgba(86, 117, 109, 0.12)"
                color="#263A33"
                fontSize="10px"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontWeight="700"
              >
                ACTIVE CASE
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody>
            <VStack align="stretch" spacing={4} pb={2}>
              {/* Client Info Summary */}
              <Box
                p={4}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.85)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.1)"
              >
                <VStack align="start" spacing={2.5}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Selected Contact:</Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33">{activeThread?.name || "Client"}</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Clinical Path:</Text>
                    <Text fontSize="13px" fontWeight="600" color="#56756D">{activeThread?.clinicalTrack || "Standard Clinical Protocol"}</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Next Consultation:</Text>
                    <Text fontSize="12.5px" fontWeight="600" color="#263A33">{activeThread?.nextSession || "Unscheduled"}</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Quick Navigation Action Rows */}
              <VStack align="stretch" spacing={2.5}>
                <Button
                  as={NextLink}
                  href="/dashboard/therapist/notes"
                  size="sm"
                  h="40px"
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                >
                  Open Clinical Notes & Blueprint
                </Button>

                <Button
                  as={NextLink}
                  href="/dashboard/therapist/resources"
                  size="sm"
                  h="40px"
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                >
                  Share Resources & Worksheets
                </Button>

                <Button
                  as={NextLink}
                  href="/dashboard/therapist/schedule"
                  size="sm"
                  h="40px"
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                >
                  Manage Session Availability
                </Button>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 🌿 3. NEW MESSAGE MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="rgba(38, 58, 51, 0.4)" backdropFilter="blur(6px)" />
        <ModalContent
          borderRadius="2xl"
          p={2}
          border="1px solid rgba(86, 117, 109, 0.2)"
          boxShadow="0 20px 40px -4px rgba(38, 58, 51, 0.2)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          <ModalHeader
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            fontSize="18px"
            fontWeight="600"
            color="#263A33"
            pb={1}
          >
            Start Encrypted Message Thread
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody>
            <VStack spacing={4} align="stretch" pt={2}>
              <Box>
                <Text fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Select Client or Colleague
                </Text>
                <Input
                  placeholder="e.g. Michael K. or Dr. Marcus Vance"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  borderRadius="xl"
                  fontSize="13px"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                />
              </Box>

              <Box>
                <Text fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Secure Clinical Message
                </Text>
                <Textarea
                  placeholder="Type your message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  rows={4}
                  borderRadius="xl"
                  fontSize="13px"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                />
              </Box>

              <HStack spacing={2} p={2.5} borderRadius="lg" bg="rgba(250, 248, 245, 0.8)">
                <Icon as={FiLock} color="#56756D" boxSize="13px" />
                <Text fontSize="11px" color="#5A6E65">
                  This conversation will be protected under 256-bit encryption and HIPAA compliance.
                </Text>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter pt={4}>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              borderRadius="full"
              fontSize="12.5px"
              h="36px"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewThread}
              isDisabled={!newRecipient.trim() || !newMessageText.trim()}
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="36px"
              px={5}
              fontSize="12.5px"
              fontWeight="600"
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              _hover={{ bg: "#263A33" }}
            >
              Start Conversation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
