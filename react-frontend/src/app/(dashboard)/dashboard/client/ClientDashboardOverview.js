'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  useToast,
  Progress,
  Avatar,
  Icon,
  Tag,
  Divider,
  Flex,
  Skeleton,
  IconButton,
  Tooltip,
  Badge,
  Circle,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiEdit3, 
  FiActivity, 
  FiArrowRight, 
  FiHeart, 
  FiZap, 
  FiMoon, 
  FiSun, 
  FiUsers,
  FiVideo,
  FiClock,
  FiTarget,
  FiAward,
  FiBookOpen,
  FiCompass,
  FiMessageSquare,
  FiX
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { apiGet, apiPost } from "../../../../api.js";
import NextLink from 'next/link';
import { useClientData } from "./useClientData";
import { useAuth } from "../../../../context/AuthContext";
import OnboardingModal from "./OnboardingModal";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function ClientDashboardOverview() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const { clientProfile } = useAuth();
  const toast = useToast();
  const { goals, appointments, journals, checkins, relationships, loading, refreshData } = useClientData();

  const [stats, setStats] = useState({
    journalStreak: 0,
    checkinsThisWeek: 0,
    activeGoals: 0
  });

  const [mood, setMood] = useState("Balanced");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading) {
       if (checkins.length > 0) {
          const latestMood = checkins[0].mood;
          if (moodColors[latestMood]) setMood(latestMood);
       }

       const calculateStreak = () => {
         const allActivities = [
           ...journals.map(j => new Date(j.created_at)),
           ...checkins.map(c => new Date(c.created_at || c.checkin_date))
         ].sort((a, b) => b - a);

         if (allActivities.length === 0) return 0;

         const uniqueDates = [];
         const seen = new Set();
         allActivities.forEach(d => {
           const dateStr = d.toDateString();
           if (!seen.has(dateStr)) {
             seen.add(dateStr);
             uniqueDates.push(new Date(dateStr));
           }
         });

         let streak = 0;
         let today = new Date();
         today.setHours(0,0,0,0);
         
         let yesterday = new Date(today);
         yesterday.setDate(yesterday.getDate() - 1);

         if (uniqueDates[0] < yesterday) return 0;

         let currentCheck = uniqueDates[0];
         streak = 1;

         for (let i = 1; i < uniqueDates.length; i++) {
           const prevDate = new Date(currentCheck);
           prevDate.setDate(prevDate.getDate() - 1);
           
           if (uniqueDates[i].getTime() === prevDate.getTime()) {
             streak++;
             currentCheck = uniqueDates[i];
           } else {
             break;
           }
         }
         return streak;
       };

       setStats({
          journalStreak: calculateStreak(),
          checkinsThisWeek: checkins.filter(c => {
             const d = new Date(c.checkin_date);
             const now = new Date();
             return (now - d) < 7 * 24 * 60 * 60 * 1000;
          }).length,
          activeGoals: goals.filter(g => !g.is_completed).length
       });
    }
  }, [loading, goals, journals, checkins]);

  if (!isMounted) return null;

  const moodColors = {
    'Calm': { bg: '#EBF5F0', border: 'rgba(56, 161, 105, 0.3)', text: '#26543E', icon: FiHeart, emoji: '🌿' },
    'Balanced': { bg: '#EEF4FF', border: 'rgba(59, 130, 246, 0.3)', text: '#1E40AF', icon: FiActivity, emoji: '⚖️' },
    'Low': { bg: '#FFF7ED', border: 'rgba(245, 158, 11, 0.3)', text: '#C2410C', icon: FiMoon, emoji: '🌧️' },
    'Anxious': { bg: '#FEF2F2', border: 'rgba(239, 68, 68, 0.3)', text: '#B91C1C', icon: FiZap, emoji: '⚡' },
  };

  const progressValue = goals.length > 0 
    ? (goals.filter(g => g.is_completed).length / goals.length) * 100 
    : 0;

  const nextAppt = appointments.length > 0 ? appointments[0] : null;
  const primaryRelationship =
    relationships.find((rel) => rel?.is_primary) ||
    relationships[0] ||
    null;
  const preferredTherapistId =
    primaryRelationship?.therapist_id ||
    primaryRelationship?.therapist?.id ||
    null;

  const weeklyPrompts = [
    {
      quote: "Self-compassion is simply giving ourselves the same kindness we would give others.",
      author: "Christopher Germer",
      tip: "Notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste."
    },
    {
      quote: "You don't have to see the whole staircase, just take the first step.",
      author: "Martin Luther King Jr.",
      tip: "Identify one small, manageable intention you can fulfill today."
    },
    {
      quote: "The curious paradox is that when I accept myself just as I am, then I can change.",
      author: "Carl Rogers",
      tip: "Write down three things you appreciate about yourself today."
    },
    {
      quote: "Healing is not linear. It's a journey of layers, not a straight sprint.",
      author: "Anonymous",
      tip: "Take 60 seconds of gentle, unhurried box breathing to reset your nervous system."
    }
  ];

  const getWeeklyIndex = () => {
    if (typeof window === 'undefined') return 0;
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    return weekNumber % weeklyPrompts.length;
  };

  const currentPrompt = weeklyPrompts[getWeeklyIndex()];

  const handleMoodUpdate = async (newMood) => {
    setMood(newMood);
    try {
      await apiPost("client-checkins/", {
        mood: newMood,
        checkin_date: new Date().toISOString().split('T')[0],
        notes: `Mood updated from dashboard overview.`
      });
      refreshData();
      toast({
        duration: 3500,
        isClosable: true,
        position: "bottom-right",
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
            <Circle size="30px" bg="rgba(16, 185, 129, 0.22)" color="#047857" flexShrink={0}>
              <Icon as={FiCheckCircle} boxSize="16px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex="1">
              <Text 
                fontSize="13px" 
                fontWeight="700" 
                color="#064E3B" 
                lineHeight="1.3"
                fontFamily="'Plus Jakarta Sans', var(--font-plus-jakarta), 'Inter', sans-serif"
              >
                Mood recorded
              </Text>
              <Text fontSize="12px" color="#065F46" fontWeight="500" lineHeight="1.4">
                Feeling {newMood.toLowerCase()} today. Logged to your journey.
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
              _hover={{ color: '#064E3B', bg: 'rgba(16, 185, 129, 0.2)' }}
            />
          </HStack>
        )
      });
    } catch (err) {
      console.warn("Mood sync failed", err);
    }
  };

  const showOnboarding = isMounted && (
    clientProfile?.name === "New Client" || 
    clientProfile?.name?.startsWith("user_") || 
    clientProfile?.email?.includes("@example.invalid")
  );

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const hasLoggedToday = 
    journals.some(j => new Date(j.created_at).toDateString() === new Date().toDateString()) ||
    checkins.some(c => new Date(c.checkin_date).toDateString() === new Date().toDateString());

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => {}} 
        profileId={clientProfile?.id}
        currentEmail={clientProfile?.email}
      />

      {/* 🌿 1. UNIFIED, AIRY HERO SANCTUARY HEADER */}
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
          {/* Identity & Space Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative">
              <Avatar 
                size="md" 
                name={user?.fullName || "Client"} 
                src={user?.imageUrl} 
                border="2px solid white" 
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)" 
              />
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
              <HStack spacing={2}>
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
                  {timeGreeting}, {user?.firstName || 'Friend'} 🌿
                </Badge>
                {!hasLoggedToday && (
                  <Badge 
                    as={NextLink}
                    href="/dashboard/client/journal"
                    bg="#FEF3C7" 
                    color="#92400E" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    _hover={{ bg: "#FDE68A" }}
                    cursor="pointer"
                  >
                    ⚡ Protect {stats.journalStreak}d Streak
                  </Badge>
                )}
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
                Your Healing Space
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Take a gentle breath. You are in a safe, intentional space.
              </Text>
            </VStack>
          </HStack>

          {/* Compact Metric Strip */}
          <HStack 
            spacing={3} 
            p={1.5} 
            px={2.5}
            borderRadius="xl" 
            bg="rgba(250, 248, 245, 0.9)"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.1)"
            alignSelf={{ base: 'stretch', lg: 'auto' }}
            justify="space-between"
          >
            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706">
                <Icon as={FiZap} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  STREAK
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#263A33">
                  {stats.journalStreak}d
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                <Icon as={FiTarget} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  GOALS
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#263A33">
                  {stats.activeGoals} Active
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg={moodColors[mood]?.bg} color={moodColors[mood]?.text}>
                <Icon as={moodColors[mood]?.icon || FiActivity} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  PRESENCE
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#263A33">
                  {mood}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* 🏛️ 2. BALANCED TWO-COLUMN SANCTUARY ARCHITECTURE */}
      <Grid 
        templateColumns={{ base: "1fr", lg: "7fr 5fr" }} 
        gap={6} 
        alignItems="start"
      >
        {/* ================= LEFT COLUMN: Clinical Care & Journey (7fr) ================= */}
        <VStack align="stretch" spacing={5}>
          
          {/* Card 1: Next Session Spotlight (Unifies Session + Guide cleanly) */}
          <Box 
            bg="white" 
            p={5} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiCalendar} boxSize="14px" />
                </Circle>
                <Text fontSize="11px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  {nextAppt ? "UPCOMING THERAPY SESSION" : "THERAPEUTIC APPOINTMENT"}
                </Text>
              </HStack>
              {nextAppt && (
                <Badge bg="rgba(16, 185, 129, 0.15)" color="#047857" fontSize="10.5px" fontWeight="700" borderRadius="full" px={2.5}>
                  CONFIRMED
                </Badge>
              )}
            </Flex>

            {nextAppt ? (
              <VStack align="stretch" spacing={4}>
                {/* Session DateTime & Practitioner Identity */}
                <Flex 
                  direction={{ base: "column", sm: "row" }} 
                  justify="space-between" 
                  align={{ base: "start", sm: "center" }} 
                  gap={3.5}
                  p={3.5}
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.1)"
                >
                  <HStack spacing={3}>
                    <VStack 
                      align="center" 
                      justify="center"
                      bg="white" 
                      p={2} 
                      borderRadius="lg" 
                      minW="48px"
                      boxShadow="0 2px 6px rgba(0,0,0,0.04)"
                      border="1px solid"
                      borderColor="rgba(86, 117, 109, 0.1)"
                    >
                      <Text fontSize="18px" fontWeight="800" color="#263A33" lineHeight="1">
                        {new Date(nextAppt.start_time).getDate()}
                      </Text>
                      <Text fontSize="9.5px" fontWeight="700" color="#56756D" letterSpacing="0.05em">
                        {new Date(nextAppt.start_time).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={0}>
                      <HStack spacing={2}>
                        <Circle size="6px" bg="#10B981" />
                        <Text fontWeight="700" fontSize="14.5px" color="#263A33">
                          {new Date(nextAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </HStack>
                      <Text fontSize="12.5px" color="#5A6E65">
                        Virtual 1-on-1 Session
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Practitioner info inline */}
                  <HStack spacing={2.5} pt={{ base: 1, sm: 0 }}>
                    <Avatar 
                      size="sm" 
                      name={nextAppt.therapist_name || "Therapist"} 
                      src={primaryRelationship?.therapist_profile_image} 
                      border="1.5px solid white"
                      boxShadow="xs"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                        {nextAppt.therapist_name || "Your Practitioner"}
                      </Text>
                      <Text fontSize="11px" color="#718096">
                        {primaryRelationship?.therapist_title || "Clinical Associate"}
                      </Text>
                    </VStack>
                  </HStack>
                </Flex>

                {/* Session Actions Strip */}
                <HStack spacing={2.5}>
                  <Button 
                    as={NextLink}
                    href={`/conference/MLC_${nextAppt.id}`}
                    flex="1" 
                    bg="#263A33" 
                    color="white" 
                    borderRadius="full" 
                    fontSize="13px" 
                    fontWeight="600"
                    height="38px"
                    leftIcon={<Icon as={FiVideo} boxSize="14px" color="#A9CBB7" />}
                    _hover={{ bg: '#182722', transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                    boxShadow="0 4px 12px rgba(38, 58, 51, 0.12)"
                  >
                    Enter Video Room
                  </Button>
                  <Button
                    as={NextLink}
                    href="/dashboard/client/messages"
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    fontSize="12.5px"
                    fontWeight="600"
                    height="38px"
                    px={4}
                    leftIcon={<Icon as={FiMessageSquare} boxSize="13px" />}
                    _hover={{ bg: 'rgba(169, 203, 183, 0.1)' }}
                  >
                    Message
                  </Button>
                </HStack>
              </VStack>
            ) : primaryRelationship ? (
              <VStack align="stretch" spacing={3.5}>
                <HStack spacing={3}>
                  <Avatar 
                    size="md" 
                    name={primaryRelationship.therapist_name} 
                    src={primaryRelationship.therapist_profile_image} 
                    border="2px solid white" 
                    boxShadow="sm"
                  />
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Text fontSize="15px" fontWeight="700" color="#263A33">
                        {primaryRelationship.therapist_name}
                      </Text>
                      <Badge bg="rgba(16, 185, 129, 0.14)" color="#047857" fontSize="9.5px" fontWeight="700" borderRadius="full">
                        YOUR GUIDE
                      </Badge>
                    </HStack>
                    <Text fontSize="12.5px" color="#5A6E65">
                      {primaryRelationship.therapist_title || 'Clinical Associate'} • Ready for next booking
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={2.5}>
                  <Button 
                    as={NextLink}
                    href={`/therapists/${preferredTherapistId}#booking-calendar`}
                    flex="1" 
                    bg="#56756D" 
                    color="white" 
                    size="sm" 
                    height="38px"
                    borderRadius="full"
                    fontSize="13px"
                    fontWeight="600"
                    leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
                    _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                  >
                    Schedule Next Session
                  </Button>
                  <Button 
                    as={NextLink}
                    href="/dashboard/client/messages"
                    size="sm" 
                    height="38px"
                    variant="outline" 
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33" 
                    borderRadius="full"
                    fontSize="12.5px"
                    fontWeight="600"
                    px={4}
                    leftIcon={<Icon as={FiMessageSquare} boxSize="13px" />}
                    _hover={{ bg: 'rgba(169, 203, 183, 0.1)' }}
                  >
                    Message
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack align="start" spacing={2.5}>
                <Text fontSize="13px" color="#5A6E65">
                  You haven't been matched with a practitioner yet. Match based on personal alignment and safety.
                </Text>
                <Button 
                  as={NextLink}
                  href="/therapists/discovery"
                  bg="#56756D" 
                  color="white" 
                  size="sm" 
                  height="36px"
                  borderRadius="full"
                  px={5}
                  fontSize="12.5px"
                  fontWeight="600"
                  rightIcon={<FiArrowRight />}
                  _hover={{ bg: '#263A33' }}
                >
                  Meet Our Clinicians
                </Button>
              </VStack>
            )}
          </Box>

          {/* Card 2: Healing Intentions & Growth Progress */}
          <Box 
            bg="white" 
            p={5} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiCheckCircle} boxSize="14px" />
                </Circle>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Healing Intentions
                </Heading>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="12px" fontWeight="700" color="#059669">
                  {Math.round(progressValue)}% Complete
                </Text>
                <Button
                  as={NextLink}
                  href="/dashboard/client/goals"
                  variant="ghost"
                  size="xs"
                  color="#56756D"
                  fontSize="11.5px"
                  fontWeight="600"
                  _hover={{ color: '#263A33' }}
                >
                  View All ➔
                </Button>
              </HStack>
            </Flex>

            {/* Smooth Progress Bar */}
            <Box mb={3.5}>
              <Progress 
                value={progressValue} 
                bg="rgba(169, 203, 183, 0.2)" 
                borderRadius="full" 
                size="xs" 
                sx={{
                  '& > div': {
                    background: 'linear-gradient(90deg, #319795 0%, #38A169 100%)'
                  }
                }}
              />
            </Box>

            {/* Goals Checklist */}
            <VStack align="stretch" spacing={2}>
              {goals.slice(0, 3).map(goal => (
                <HStack 
                  key={goal.id} 
                  spacing={2.5} 
                  p={2.5} 
                  borderRadius="lg" 
                  bg="rgba(250, 248, 245, 0.75)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.08)"
                >
                  <Circle 
                    size="18px" 
                    bg={goal.is_completed ? "rgba(16, 185, 129, 0.15)" : "white"} 
                    color={goal.is_completed ? "#059669" : "#A0AEC0"}
                    border="1px solid"
                    borderColor={goal.is_completed ? "#059669" : "rgba(86, 117, 109, 0.2)"}
                    flexShrink={0}
                  >
                    <Icon as={goal.is_completed ? FiCheckCircle : FiArrowRight} boxSize="10px" />
                  </Circle>
                  <Text fontSize="13px" color="#334155" fontWeight="500" noOfLines={1} flex={1}>
                    {goal.title}
                  </Text>
                </HStack>
              ))}
              {goals.length === 0 && (
                <Text fontSize="12.5px" color="#718096" py={2} textAlign="center">
                  No active goals set yet. Add an intention in your roadmap.
                </Text>
              )}
            </VStack>
          </Box>

          {/* Card 3: Recent Reflections / Activity Timeline */}
          <Box 
            bg="white" 
            p={5} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(201, 169, 96, 0.15)" color="#C9A960">
                  <Icon as={FiEdit3} boxSize="14px" />
                </Circle>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Recent Reflections
                </Heading>
              </HStack>
              <Button 
                as={NextLink}
                href="/dashboard/client/journal"
                variant="ghost"
                size="xs"
                color="#56756D"
                fontSize="11.5px"
                fontWeight="600"
                rightIcon={<FiArrowRight />}
                _hover={{ color: '#263A33' }}
              >
                Journal
              </Button>
            </Flex>

            <VStack align="stretch" spacing={2.5}>
              {journals.slice(0, 2).map(j => (
                <ActivityItem 
                  key={`j-${j.id}`}
                  icon={FiEdit3} 
                  title="Reflection Captured" 
                  desc={j.entry} 
                  time={new Date(j.created_at).toLocaleDateString()} 
                />
              ))}
              {(journals.length === 0 && goals.filter(g => g.is_completed).length === 0) && (
                <Text color="#718096" fontSize="12.5px" py={2}>
                  No entries recorded yet. Write your first reflection today.
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>

        {/* ================= RIGHT COLUMN: Self-Care & Mindful Resonance (5fr) ================= */}
        <VStack align="stretch" spacing={5}>
          
          {/* Card 1: Daily Emotional Pulse */}
          <Box 
            bg="white" 
            p={5} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706">
                  <Icon as={FiSun} boxSize="14px" />
                </Circle>
                <Text fontSize="11px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  DAILY EMOTIONAL PULSE
                </Text>
              </HStack>
              <Badge 
                bg={moodColors[mood]?.bg} 
                color={moodColors[mood]?.text} 
                border="1px solid"
                borderColor={moodColors[mood]?.border}
                borderRadius="full"
                fontSize="10.5px"
                fontWeight="700"
                px={2.5}
                py={0.5}
              >
                {mood}
              </Badge>
            </Flex>

            <Heading 
              fontSize="15.5px" 
              fontWeight="600" 
              color="#263A33" 
              mb={3}
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              letterSpacing="-0.01em"
            >
              How are you arriving today?
            </Heading>

            <SimpleGrid columns={2} spacing={2.5}>
              {Object.keys(moodColors).map(m => {
                const isSelected = mood === m;
                const meta = moodColors[m];
                return (
                  <Button 
                    key={m} 
                    size="sm" 
                    height="40px"
                    variant="outline" 
                    bg={isSelected ? meta.bg : '#FAFAFA'}
                    borderColor={isSelected ? meta.border : 'rgba(86, 117, 109, 0.15)'}
                    color={isSelected ? meta.text : '#4A5568'}
                    fontWeight={isSelected ? "700" : "600"}
                    onClick={() => handleMoodUpdate(m)}
                    borderRadius="xl"
                    display="flex" 
                    gap={2}
                    justifyContent="center"
                    alignItems="center"
                    boxShadow={isSelected ? "0 2px 8px rgba(0,0,0,0.06)" : "none"}
                    _hover={{
                      borderColor: meta.border,
                      bg: meta.bg,
                      transform: 'translateY(-1px)'
                    }}
                    transition="all 0.18s"
                  >
                    <Text fontSize="13.5px">{meta.emoji}</Text>
                    <Text fontSize="12px">{m}</Text>
                  </Button>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Card 2: Mindful Practice & Care Space (Soothing Warm Light Card) */}
          <Box 
            bg="linear-gradient(135deg, #FAF8F5 0%, #F4F8F6 100%)" 
            p={5} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.16)"
          >
            <Flex justify="space-between" align="center" mb={3}>
              <Badge 
                bg="rgba(86, 117, 109, 0.12)" 
                color="#263A33" 
                fontSize="10px" 
                fontWeight="700" 
                borderRadius="full"
                px={2.5}
                py={0.5}
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                MINDFUL GROUNDING
              </Badge>
              <Icon as={FiHeart} boxSize="15px" color="#56756D" />
            </Flex>

            <Text 
              fontSize="14.5px" 
              fontWeight="600" 
              color="#263A33"
              lineHeight="1.45"
              mb={1}
            >
              "{currentPrompt.quote}"
            </Text>
            <Text 
              fontSize="12px" 
              color="#718096"
              fontWeight="500"
              mb={3.5}
            >
              — {currentPrompt.author}
            </Text>

            <Box 
              bg="white" 
              p={3.5} 
              borderRadius="xl" 
              mb={4} 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.12)"
              boxShadow="xs"
            >
              <Text fontSize="10.5px" fontWeight="700" color="#56756D" letterSpacing="0.05em" textTransform="uppercase" mb={1}>
                PRACTICE TODAY
              </Text>
              <Text fontSize="12.5px" color="#4A5568" lineHeight="1.45" fontWeight="400">
                {currentPrompt.tip}
              </Text>
            </Box>

            <HStack justify="space-between">
              <Button 
                as={NextLink}
                href="/dashboard/client/resources"
                bg="#56756D" 
                color="white" 
                size="sm" 
                height="34px"
                borderRadius="full" 
                px={4}
                fontSize="12px"
                fontWeight="600"
                _hover={{ bg: '#263A33' }}
              >
                Explore Care Tools
              </Button>
              <Button
                as={NextLink}
                href="/feelings-wheel"
                variant="link"
                color="#56756D"
                fontSize="12px"
                fontWeight="600"
                _hover={{ color: '#263A33', textDecoration: 'underline' }}
              >
                Feelings Wheel ➔
              </Button>
            </HStack>
          </Box>

          {/* Card 3: Clinical Baseline DASS-21 (if available) */}
          {clientProfile?.dass_scores && (
            <Box 
              bg="white" 
              p={5} 
              borderRadius="2xl" 
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.14)"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Clinical Baseline (DASS-21)
                </Heading>
                <Circle size="26px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiActivity} boxSize="13px" />
                </Circle>
              </Flex>

              <SimpleGrid columns={3} spacing={2.5}>
                {['depression', 'anxiety', 'stress'].map((type) => {
                  const score = clientProfile.dass_scores[type];
                  const level = clientProfile.dass_scores[`${type}_level`] || 'Normal';
                  const isNormal = level === 'Normal';
                  
                  return (
                    <VStack 
                      key={type} 
                      align="start" 
                      p={2.5} 
                      borderRadius="lg" 
                      bg={isNormal ? "rgba(16, 185, 129, 0.06)" : "rgba(245, 158, 11, 0.06)"} 
                      border="1px solid"
                      borderColor={isNormal ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}
                    >
                      <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase">
                        {type}
                      </Text>
                      <HStack justify="space-between" w="full" mt={0.5}>
                        <Text fontSize="16px" fontWeight="800" color="#263A33">
                          {score}
                        </Text>
                        <Badge 
                          fontSize="8.5px" 
                          fontWeight="700"
                          borderRadius="full"
                          bg={isNormal ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)'}
                          color={isNormal ? '#047857' : '#B45309'}
                        >
                          {level}
                        </Badge>
                      </HStack>
                    </VStack>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

        </VStack>
      </Grid>
    </Box>
  );
}

function ActivityItem({ icon, title, desc, time }) {
  const cleanDesc = desc?.replace(/<[^>]*>?/gm, '').substring(0, 90) + (desc?.length > 90 ? '...' : '');
  
  return (
    <HStack 
      spacing={3} 
      align="start" 
      p={2.5}
      borderRadius="xl"
      bg="rgba(250, 248, 245, 0.85)"
      border="1px solid"
      borderColor="rgba(86, 117, 109, 0.08)"
    >
      <Circle size="30px" bg="white" color="#56756D" boxShadow="0 1px 3px rgba(0,0,0,0.06)" flexShrink={0} mt={0.5}>
        <Icon as={icon} boxSize="13.5px" />
      </Circle>
      <VStack align="start" spacing={0} flex="1" overflow="hidden">
        <HStack justify="space-between" w="full">
          <Text fontWeight="600" color="#263A33" fontSize="12.5px">{title}</Text>
          <Text fontSize="10.5px" color="gray.400">{time}</Text>
        </HStack>
        <Text fontSize="12px" color="#5A6E65" noOfLines={1} title={cleanDesc} fontWeight="400">
          {cleanDesc}
        </Text>
      </VStack>
    </HStack>
  );
}
