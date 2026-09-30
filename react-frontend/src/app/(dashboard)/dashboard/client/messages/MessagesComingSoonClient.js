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
  Avatar,
  IconButton,
  Grid,
  Textarea
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiPaperclip,
  FiLock,
  FiShield,
  FiCheck,
  FiClock,
  FiCalendar,
  FiUser,
  FiArrowRight,
  FiFileText,
  FiPhoneCall,
  FiX,
  FiDownload,
  FiVideo,
  FiCheckCircle,
  FiHeart
} from "react-icons/fi";
import NextLink from "next/link";
import { useAuth } from "../../../../../context/AuthContext";
import { useClientData } from "../useClientData";

/* ========================================================
   Client-Facing Direct Messages with Therapist
======================================================== */
const INITIAL_CLIENT_MESSAGES = [
  {
    id: 'cm-1',
    sender: 'therapist',
    text: 'Hello, welcome to your protected MLC care space. How did the 5-4-3-2-1 grounding technique feel when the anxiety spiked during your commute this week?',
    time: 'Tuesday 10:30 AM'
  },
  {
    id: 'cm-2',
    sender: 'client',
    text: 'Hi Dr. Chen, it really brought my heart rate down. Here is the daily thought record I filled out over the weekend.',
    time: 'Tuesday 10:42 AM',
    attachment: { name: 'Thought-Record-Week-4.pdf', size: '1.2 MB' }
  },
  {
    id: 'cm-3',
    sender: 'therapist',
    text: "Excellent work on completing the worksheet. Let's review the cognitive reframing column together in our session on Thursday at 2:00 PM. Keep honoring your pace.",
    time: 'Tuesday 11:15 AM'
  }
];

const CLIENT_QUICK_CHIPS = [
  { label: 'Session Question', text: 'Hi Dr. Chen, I had a brief question regarding the mindfulness practice we discussed...' },
  { label: 'Worksheet Update', text: 'I completed the reflection exercise from our last appointment and have it ready for our review.' },
  { label: 'Reschedule Request', text: 'Hi Dr. Chen, is there an alternate slot available for our upcoming session this week?' },
  { label: 'Check-in Note', text: 'Just sharing a quick update: the grounding techniques have been feeling much more natural.' }
];

export default function MessagesComingSoonClient() {
  const { isDummyClient } = useAuth();
  const { appointments, relationships } = useClientData();
  const toast = useToast();

  const primaryRelationship = relationships?.[0] || null;
  const nextAppt = (appointments || []).find((a) => {
    const d = new Date(a.date || a.scheduled_time);
    return !isNaN(d.getTime()) && d >= new Date();
  }) || (appointments || [])[0];

  const hasRealTherapist = Boolean(primaryRelationship || nextAppt);

  const therapistName = isDummyClient
    ? "Dr. Sarah Chen, Psy.D"
    : (primaryRelationship?.therapist_name || nextAppt?.therapist_name || null);

  const therapistShortName = isDummyClient
    ? "Dr. Sarah Chen"
    : (therapistName || "Your Therapist");

  const therapistTitle = isDummyClient
    ? "Senior Clinical Psychologist · Licensed in Kuwait & UK"
    : (primaryRelationship?.therapist_title || (therapistName ? "Licensed MLC Clinical Associate" : "Care Matching Pending"));

  const therapistImage = isDummyClient
    ? "https://images.unsplash.com/photo-1594824813590-760773099955?w=150&auto=format&fit=crop&q=80"
    : (primaryRelationship?.therapist_profile_image || null);

  const nextSessionLabel = isDummyClient
    ? "Thu 2:00 PM"
    : (nextAppt
        ? (nextAppt.date || nextAppt.scheduled_time
            ? new Date(nextAppt.date || nextAppt.scheduled_time).toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
            : "Upcoming")
        : "None Scheduled");

  const [messages, setMessages] = useState(() => (isDummyClient ? INITIAL_CLIENT_MESSAGES : []));
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isDummyClient) {
      setMessages(INITIAL_CLIENT_MESSAGES);
    } else {
      setMessages([]);
    }
  }, [isDummyClient]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: `cm-${Date.now()}`,
      sender: 'client',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated empathetic therapist read receipt toast
    setTimeout(() => {
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
                Message Delivered
              </Text>
              <Text fontSize="12px" color="#065F46" fontWeight="500">
                {therapistShortName} will review your note during clinical hours.
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
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyChip = (text) => {
    setInputText(text);
  };

  const handleAttach = () => {
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
              Encrypted Attachment
            </Text>
            <Text fontSize="12px" color="#065F46" fontWeight="500">
              Files are stored securely in your clinical records vault.
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
            <Box position="relative" flexShrink={0}>
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
                  CARE CONTINUITY · THERAPIST SPACE
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
                Therapy Messages & Care Space
              </Heading>

              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Confidential direct communication with your licensed MLC therapist between sessions.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Compact Metric Strip (Rule 10) */}
          <HStack
            spacing={{ base: 1.5, sm: 3 }}
            p={1.5}
            px={{ base: 2, sm: 2.5 }}
            borderRadius="xl"
            bg="rgba(250, 248, 245, 0.9)"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.1)"
            w={{ base: 'full', md: 'auto' }}
            justify="space-between"
            flexShrink={0}
          >
            {/* Metric 1 */}
            <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
              <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                <Icon as={FiUser} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                  CLINICIAN
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  {hasRealTherapist || isDummyClient ? therapistShortName : "Not Assigned"}
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
                  PRIVACY
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  Protected & Encrypted
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            {/* Metric 3 */}
            <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
              <Circle size="28px" bg="rgba(59, 130, 246, 0.12)" color="#2563EB" flexShrink={0}>
                <Icon as={FiCalendar} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                  NEXT SESSION
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  {nextSessionLabel}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* 🌿 2. MAIN 7:5 BENTO MESSAGING WORKSPACE */}
      <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start">
        {/* LEFT COLUMN: SECURE CHAT THREAD WITH THERAPIST */}
        <VStack align="stretch" spacing={5}>
          <Box
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            minH="580px"
          >
            {/* Header: Clinician Profile Header */}
            <Flex
              p={4}
              align="center"
              justify="space-between"
              borderBottom="1px solid"
              borderColor="rgba(86, 117, 109, 0.12)"
              bg="white"
            >
              <HStack spacing={3}>
                <Box position="relative">
                  <Avatar
                    size="md"
                    name={therapistShortName}
                    src={therapistImage}
                    border="2px solid white"
                    boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
                  />
                  {(hasRealTherapist || isDummyClient) && (
                    <Circle
                      size="10px"
                      bg="#38A169"
                      border="2px solid white"
                      position="absolute"
                      bottom="0"
                      right="0"
                    />
                  )}
                </Box>

                <VStack align="start" spacing={0.5}>
                  <HStack spacing={2}>
                    <Text
                      fontSize="15px"
                      fontWeight="600"
                      color="#263A33"
                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    >
                      {therapistName || therapistShortName}
                    </Text>
                    {(hasRealTherapist || isDummyClient) && (
                      <Badge
                        bg="rgba(56, 161, 105, 0.12)"
                        color="#2F855A"
                        fontSize="9.5px"
                        borderRadius="full"
                        px={2}
                        py={0.2}
                      >
                        VERIFIED CLINICIAN
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="12px" color="#5A6E65">
                    {therapistTitle}
                  </Text>
                </VStack>
              </HStack>

              <Button
                as={NextLink}
                href="/dashboard/client/appointments"
                size="xs"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                px={3}
                h="28px"
                fontSize="11.5px"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                leftIcon={<Icon as={FiVideo} boxSize="11px" />}
              >
                Join Session Room
              </Button>
            </Flex>

            {/* Privacy Scrim */}
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
                  Messages are encrypted and confidential. Integrated into your private care record.
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
              {!hasRealTherapist && !isDummyClient ? (
                <VStack spacing={3} py={12} px={6} textAlign="center" my="auto">
                  <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                    <Icon as={FiMessageSquare} boxSize="22px" />
                  </Circle>
                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    Direct Messaging Activates With Your Therapist
                  </Text>
                  <Text fontSize="12.5px" color="#5A6E65" maxW="380px" lineHeight="1.5">
                    Once you schedule your initial consultation with a licensed MLC clinician, your secure messaging workspace will appear here.
                  </Text>
                  <Button
                    as={NextLink}
                    href="/therapists/discovery"
                    size="sm"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="36px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    _hover={{ bg: "#263A33" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Explore Therapist Directory
                  </Button>
                </VStack>
              ) : messages.length === 0 ? (
                <VStack spacing={2} py={12} px={6} textAlign="center" my="auto">
                  <Circle size="46px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                    <Icon as={FiMessageSquare} boxSize="20px" />
                  </Circle>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    No messages exchanged yet
                  </Text>
                  <Text fontSize="12px" color="#5A6E65" maxW="340px">
                    Send a note below to connect with {therapistShortName} between scheduled sessions.
                  </Text>
                </VStack>
              ) : (
                <>
                  {/* Date Marker */}
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
                      Clinical Care Conversation
                    </Text>
                    <Divider borderColor="rgba(86, 117, 109, 0.15)" />
                  </Flex>

                  {messages.map((msg) => {
                    const isClient = msg.sender === 'client';

                    return (
                      <Flex
                        key={msg.id}
                        justify={isClient ? "flex-end" : "flex-start"}
                        w="100%"
                      >
                        <Box maxW={{ base: "85%", md: "72%" }}>
                          <Box
                            p={3.5}
                            borderRadius="2xl"
                            borderBottomRightRadius={isClient ? "sm" : "2xl"}
                            borderBottomLeftRadius={!isClient ? "sm" : "2xl"}
                            bg={isClient ? "rgba(86, 117, 109, 0.1)" : "rgba(250, 248, 245, 0.95)"}
                            border="1px solid"
                            borderColor={isClient ? "rgba(86, 117, 109, 0.22)" : "rgba(86, 117, 109, 0.12)"}
                            color="#263A33"
                          >
                            <Text fontSize="13px" lineHeight="1.5">
                              {msg.text}
                            </Text>

                            {/* File Attachment */}
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
                                  onClick={handleAttach}
                                />
                              </HStack>
                            )}
                          </Box>

                          <HStack
                            justify={isClient ? "flex-end" : "flex-start"}
                            spacing={1}
                            mt={1}
                            px={1}
                          >
                            <Text fontSize="10.5px" color="#A0AEC0">
                              {msg.time}
                            </Text>
                            {isClient && (
                              <Icon as={FiCheck} color="#56756D" boxSize="11px" />
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Prompts Strip */}
            <Box px={4} py={2} bg="rgba(250, 248, 245, 0.6)" borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.08)">
              <HStack spacing={1.5} overflowX="auto" pb={1}>
                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" whiteSpace="nowrap">
                  Quick Note:
                </Text>
                {CLIENT_QUICK_CHIPS.map((chip, idx) => (
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
                    onClick={() => handleApplyChip(chip.text)}
                  >
                    {chip.label}
                  </Button>
                ))}
              </HStack>
            </Box>

            {/* Compose Box */}
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
                  onClick={handleAttach}
                  _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                />

                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={!hasRealTherapist && !isDummyClient ? "Select a therapist to initiate confidential messages..." : `Type a secure note to ${therapistShortName}... (Press Enter to send)`}
                  disabled={!hasRealTherapist && !isDummyClient}
                  resize="none"
                  rows={2}
                  fontSize="13px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  bg="rgba(250, 248, 245, 0.4)"
                />

                {/* Primary Button: Signature Brand Sage */}
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
          </Box>
        </VStack>

        {/* RIGHT COLUMN: THERAPIST PROFILE & CARE CONTINUITY */}
        <VStack align="stretch" spacing={5}>
          {/* Card 1: Assigned Therapist Spotlight Card */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                    <Icon as={FiUser} boxSize="14px" />
                  </Circle>
                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    Your Clinical Guide
                  </Text>
                </HStack>
                <Badge
                  bg="rgba(56, 161, 105, 0.12)"
                  color="#2F855A"
                  fontSize="10px"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontWeight="700"
                >
                  LICENSED
                </Badge>
              </HStack>

              {/* Therapist Details Block */}
              <Box
                p={3.5}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.85)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.1)"
              >
                {hasRealTherapist || isDummyClient ? (
                  <VStack align="start" spacing={2.5}>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={therapistShortName}
                        src={therapistImage}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="700" color="#263A33">
                          {therapistName || therapistShortName}
                        </Text>
                        <Text fontSize="11.5px" color="#5A6E65">
                          {therapistTitle}
                        </Text>
                      </VStack>
                    </HStack>

                    <Divider borderColor="rgba(86, 117, 109, 0.12)" />

                    <VStack align="start" spacing={1.5} w="100%">
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="12px" color="#718096">Therapy Modality:</Text>
                        <Text fontSize="12px" fontWeight="600" color="#56756D">CBT & Mindfulness</Text>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="12px" color="#718096">Next Consultation:</Text>
                        <Text fontSize="12px" fontWeight="600" color="#263A33">{nextSessionLabel}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                ) : (
                  <VStack align="start" spacing={2}>
                    <Text fontSize="13px" fontWeight="600" color="#263A33">
                      Care Matching Pending
                    </Text>
                    <Text fontSize="12px" color="#5A6E65" lineHeight="1.5">
                      Explore our licensed clinicians to find a therapist aligned with your schedule and care goals.
                    </Text>
                    <Button
                      as={NextLink}
                      href="/therapists/discovery"
                      size="xs"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      h="28px"
                      fontSize="11.5px"
                      mt={1}
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                    >
                      Browse Therapists
                    </Button>
                  </VStack>
                )}
              </Box>

              {/* Action Buttons */}
              <VStack align="stretch" spacing={2}>
                <Button
                  as={NextLink}
                  href="/dashboard/client/appointments"
                  size="sm"
                  h="38px"
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: "#263A33" }}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                >
                  Manage Appointments & Sessions
                </Button>

                <Button
                  as={NextLink}
                  href="/dashboard/client/journal"
                  size="sm"
                  h="38px"
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
                  Open Reflection Journal
                </Button>

                <Button
                  as={NextLink}
                  href="/dashboard/client/goals"
                  size="sm"
                  h="38px"
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
                  Review Care Goals
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Card 2: Crisis Helpline & Boundary Note */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="stretch" spacing={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiShield} boxSize="14px" />
                </Circle>
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Care Boundaries & Support
                </Text>
              </HStack>

              <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                Direct messaging is intended for non-urgent session follow-ups, worksheet sharing, and scheduling coordination. Therapists respond during active clinical hours.
              </Text>

              {/* Crisis Notice */}
              <Box
                p={3.5}
                borderRadius="xl"
                bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)"
                border="1px solid rgba(239, 68, 68, 0.25)"
              >
                <HStack align="start" spacing={2.5}>
                  <Icon as={FiPhoneCall} color="#DC2626" boxSize="14px" mt={0.5} />
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="11.5px" fontWeight="700" color="#991B1B">
                      Emergency Crisis Assistance
                    </Text>
                    <Text fontSize="11px" color="#B91C1C" lineHeight="1.4">
                      If you are experiencing immediate distress or a mental health crisis, please contact Kuwait Emergency Services at <strong>112</strong> or visit the nearest emergency medical facility.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
}
