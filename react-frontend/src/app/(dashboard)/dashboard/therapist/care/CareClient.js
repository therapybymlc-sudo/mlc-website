'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Button,
  Textarea,
  Divider,
  Circle,
  Flex,
  Badge,
  useToast,
  Grid,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  FiHeart,
  FiSmile,
  FiAnchor,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";

const MOODS = [
  { label: "Grounded", desc: "Centered and present" },
  { label: "Open", desc: "Receptive and empathetic" },
  { label: "Steady", desc: "Calm and balanced" },
  { label: "Tired", desc: "Low energy, gentle pace" },
  { label: "Overloaded", desc: "Needs boundary protection" },
  { label: "Resilient", desc: "Able to adapt and guide" },
];

export default function TherapistCareClient() {
  const { isDummyTherapist, user } = useAuth();
  const [selectedMood, setSelectedMood] = useState("Grounded");
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const storageKey = `mlc_therapist_care_${user?.id || 'current'}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mood) setSelectedMood(parsed.mood);
        if (parsed.reflection) setReflection(parsed.reflection);
        return;
      }
    } catch {
      // ignore parse error
    }
    if (isDummyTherapist) {
      setReflection("Holding calm space for my afternoon clients; remembering to take a 5-minute breather between sessions.");
    }
  }, [isDummyTherapist, user?.id]);

  const handleSaveReflection = () => {
    setIsSaving(true);
    const storageKey = `mlc_therapist_care_${user?.id || 'current'}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        mood: selectedMood,
        reflection,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("Could not save reflection", e);
    }

    setTimeout(() => {
      setIsSaving(false);
      toast({
        position: "bottom-right",
        duration: 3500,
        render: () => (
          <HStack
            spacing={3}
            p={3.5}
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            borderRadius="2xl"
            border="1px solid rgba(16, 185, 129, 0.35)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(16px)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            maxW="360px"
          >
            <Circle size="30px" bg="rgba(16, 185, 129, 0.22)" color="#047857" flexShrink={0}>
              <Icon as={FiCheckCircle} boxSize="16px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex="1">
              <Text 
                fontSize="13px" 
                fontWeight="700" 
                color="#064E3B"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                Reflection Recorded
              </Text>
              <Text fontSize="12px" color="#065F46" fontWeight="500">
                You checked in as {selectedMood.toLowerCase()}. Take a gentle breath.
              </Text>
            </VStack>
          </HStack>
        ),
      });
    }, 400);
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
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiHeart} boxSize="22px" />
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
                  Clinical Well-Being · Sanctuary
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
                  Daily Pause
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
                Therapist Care Space
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                A dedicated environment for your personal grounding, intention-setting, and clinical self-care.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Schedule CTA */}
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
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiCompass} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    MIND STATE
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33">
                    {selectedMood}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    CADENCE
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33">
                    Daily
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button
              as={NextLink}
              href="/dashboard/therapist/schedule"
              bg="#56756D"
              color="white"
              borderRadius="full"
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              flexShrink={0}
            >
              My Schedule
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* ⚖️ 2. 7:5 BALANCED BENTO GRID */}
      <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start">
        {/* Left Column (7fr): Quick Check-in Card */}
        <Box 
          bg="white" 
          p={{ base: 5, md: 6 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <HStack spacing={3} mb={1.5} align="center">
            <Circle size="34px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiSmile} boxSize="17px" />
            </Circle>
            <VStack align="start" spacing={0}>
              <Heading 
                as="h2"
                fontSize="16px" 
                fontWeight="600" 
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Mindful Check-in
              </Heading>
              <Text fontSize="12.5px" color="#718096">
                Take 30 seconds to center yourself before your next session.
              </Text>
            </VStack>
          </HStack>

          <Text fontSize="13px" color="#5A6E65" mt={4} mb={3} fontWeight="500">
            How are you feeling as you step into your practice today?
          </Text>

          {/* Mood Pills */}
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2.5} mb={5}>
            {MOODS.map((m) => {
              const isActive = selectedMood === m.label;
              return (
                <Button
                  key={m.label}
                  size="sm"
                  h="38px"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontFamily="'Inter', sans-serif"
                  fontWeight={isActive ? "700" : "500"}
                  bg={isActive ? "#56756D" : "rgba(250, 248, 245, 0.85)"}
                  color={isActive ? "white" : "#263A33"}
                  border="1px solid"
                  borderColor={isActive ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                  boxShadow={isActive ? "0 2px 8px rgba(86, 117, 109, 0.28)" : "none"}
                  onClick={() => setSelectedMood(m.label)}
                  _hover={{
                    bg: isActive ? "#46625B" : "rgba(86, 117, 109, 0.08)",
                    borderColor: "#56756D",
                  }}
                  transition="all 0.15s ease"
                  leftIcon={isActive ? <Icon as={FiCheck} boxSize="12px" /> : undefined}
                >
                  {m.label}
                </Button>
              );
            })}
          </SimpleGrid>

          {/* Reflection Field */}
          <Box mb={5}>
            <Text 
              fontSize="10.5px" 
              fontWeight="700" 
              color="#718096" 
              textTransform="uppercase" 
              letterSpacing="0.06em" 
              mb={2}
            >
              One Intentional Focus for Today
            </Text>
            <Textarea 
              placeholder="What is one thing you want to hold gently today? (e.g. maintaining boundary between clients, pausing for fresh air, letting silence do the work...)" 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              borderRadius="xl" 
              rows={3} 
              fontSize="13px"
              bg="rgba(250, 248, 245, 0.6)"
              border="1px solid rgba(86, 117, 109, 0.18)"
              _focus={{
                borderColor: "#56756D",
                bg: "white",
                boxShadow: "0 0 0 1px #56756D",
              }}
            />
          </Box>

          <Button 
            bg="#263A33" 
            color="white" 
            borderRadius="full" 
            height="38px"
            fontSize="13px"
            fontWeight="600"
            w="100%"
            onClick={handleSaveReflection}
            isLoading={isSaving}
            _hover={{ bg: "#182722", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
          >
            Save Reflection
          </Button>
        </Box>

        {/* Right Column (5fr): Anchor Points & Well-Being Reminders */}
        <Box 
          bg="white" 
          p={{ base: 5, md: 6 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <HStack spacing={3} mb={5} align="center">
            <Circle size="34px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiAnchor} boxSize="17px" />
            </Circle>
            <VStack align="start" spacing={0}>
              <Heading 
                as="h2"
                fontSize="16px" 
                fontWeight="600" 
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Anchor Points
              </Heading>
              <Text fontSize="12.5px" color="#718096">
                Grounding reminders for sustainable practice.
              </Text>
            </VStack>
          </HStack>

          <VStack align="stretch" spacing={3.5}>
            {/* Reflection Prompt */}
            <Box 
              p={4} 
              bg="rgba(250, 248, 245, 0.85)" 
              borderRadius="xl" 
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.12)"
            >
              <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
                Reflection Prompt
              </Text>
              <Text fontSize="13px" color="#263A33" fontWeight="500" lineHeight="1.5">
                &ldquo;What part of your therapeutic work today felt most meaningful and grounding?&rdquo;
              </Text>
            </Box>

            {/* Well-being Reminder */}
            <Box 
              p={4} 
              bg="linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)" 
              borderRadius="xl" 
              border="1px solid"
              borderColor="rgba(16, 185, 129, 0.2)"
            >
              <Text fontSize="10.5px" fontWeight="700" color="#047857" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
                Well-Being Reminder
              </Text>
              <Text fontSize="13px" color="#064E3B" fontWeight="500" lineHeight="1.5">
                Remember to take a full 5-minute transition break between clients to step away from the screen and unhook.
              </Text>
            </Box>
          </VStack>

          <Divider borderColor="rgba(86, 117, 109, 0.12)" my={5} />

          <Button 
            as={NextLink}
            href="/dashboard/therapist/schedule"
            variant="outline" 
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            borderRadius="full"
            height="36px"
            fontSize="12.5px"
            fontWeight="600"
            w="full"
            leftIcon={<Icon as={FiCalendar} boxSize="13px" color="#56756D" />}
            _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
          >
            View Calendar Schedule
          </Button>
        </Box>
      </Grid>
    </Box>
  );
}
