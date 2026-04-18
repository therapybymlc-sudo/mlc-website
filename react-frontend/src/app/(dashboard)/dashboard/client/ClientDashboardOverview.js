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
  FiUsers
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { apiGet, apiPost } from "../../../../api.js";
import NextLink from 'next/link';
import { useClientData } from "./useClientData";

export default function ClientDashboardOverview() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
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
       // Update mood from latest checkin if available
       if (checkins.length > 0) {
          const latestMood = checkins[0].mood;
          if (moodColors[latestMood]) setMood(latestMood);
       }

       // Real streak calculation
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

         // If latest activity is not today or yesterday, streak is broken
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
    'Calm': { bg: '#E9F2ED', text: '#56756D', icon: FiHeart },
    'Balanced': { bg: '#F2F1ED', text: '#2E2E2E', icon: FiActivity },
    'Low': { bg: '#F8F4F1', text: '#D68C45', icon: FiMoon },
    'Anxious': { bg: '#FDF2F2', text: '#E53E3E', icon: FiZap },
  };

  const progressValue = goals.length > 0 
    ? (goals.filter(g => g.is_completed).length / goals.length) * 100 
    : 0;

  const nextAppt = appointments.length > 0 ? appointments[0] : null;

  const weeklyPrompts = [
    {
      quote: "Self-compassion is simply giving ourselves the same kindness we would give others.",
      author: "Christopher Germer",
      tip: "Take 3 minutes to notice five things you see, four things you feel, three things you hear, two things you smell, and one thing you taste."
    },
    {
      quote: "You don't have to see the whole staircase, just take the first step.",
      author: "Martin Luther King Jr.",
      tip: "Identify one small, manageable task you can complete today that aligns with your healing goals."
    },
    {
      quote: "The curious paradox is that when I accept myself just as I am, then I can change.",
      author: "Carl Rogers",
      tip: "Write down three things you appreciate about yourself today, no matter how small they may seem."
    },
    {
      quote: "Healing is not linear. It's a journey of layers, not a straight path to the finish line.",
      author: "Anonymous",
      tip: "If you're feeling a setback today, remind yourself that it's a natural part of progress. Practice gentle breathing for 5 minutes."
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
        title: "Mood tracked",
        description: `Feeling ${newMood.toLowerCase()} today. We've noted that for your next session.`,
        status: "success",
        duration: 3000,
        variant: "subtle"
      });
    } catch (err) {
      // Fallback if no client profile or unverified
      console.warn("Mood sync failed", err);
    }
  };

  return (
    <Box maxW="1200px" mx="auto">
      {/* HEADER SECTION */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'start', md: 'flex-end' }}
        mb={10}
        gap={6}
      >
        <HStack spacing={5}>
          <Box position="relative">
            <Avatar 
              size="xl" 
              name={user?.fullName} 
              src={user?.imageUrl} 
              border="4px solid white" 
              shadow="xl" 
            />
            <Box 
              position="absolute" 
              bottom="2" 
              right="0" 
              bg={moodColors[mood]?.bg || '#F2F1ED'} 
              p={1.5} 
              borderRadius="full" 
              shadow="md"
              border="2px solid white"
            >
              <Icon as={moodColors[mood]?.icon || FiActivity} color={moodColors[mood]?.text || '#2E2E2E'} boxSize={3} />
            </Box>
          </Box>
          <VStack align="start" spacing={1}>
            <Tag size="sm" variant="subtle" colorScheme="teal" borderRadius="full">
              {new Date().getHours() < 12 ? 'Good Morning' : 'Good Evening'}, {user?.firstName} 🌿
            </Tag>
            <Heading as="h1" size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif" id="tour-welcome-heading">
                Welcome to Your Healing Space
            </Heading>
            <Text color="gray.500" fontSize="sm">Your journey is a process, not a destination. Take a breath.</Text>
          </VStack>
        </HStack>

        <HStack spacing={3}>
           <Box textAlign="right" display={{ base: 'none', md: 'block' }}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider">THERAPY STREAK</Text>
              <Text fontSize="lg" fontWeight="700" color="#56756D">{stats.journalStreak} Days</Text>
           </Box>
           <Divider orientation="vertical" h="40px" />
           <Box textAlign="right">
              <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider">GOALS ALIVE</Text>
              <Text fontSize="lg" fontWeight="700" color="#C9A960">{stats.activeGoals}</Text>
           </Box>
        </HStack>
      </Flex>

      {/* STREAK NUDGE IF NOT CHECKED IN TODAY */}
      {!loading && !journals.some(j => new Date(j.created_at).toDateString() === new Date().toDateString()) && !checkins.some(c => new Date(c.checkin_date).toDateString() === new Date().toDateString()) && (
        <Box 
          bgGradient="linear(to-r, #C9A960, #D68C45)" 
          p={6} 
          borderRadius="3xl" 
          mb={10} 
          color="white" 
          shadow="lg"
        >
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={6}>
              <Box bg="white" p={3} borderRadius="2xl">
                <Icon as={FiZap} color="#D68C45" boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm">Protect your {stats.journalStreak}-day streak!</Heading>
                <Text fontSize="sm" opacity={0.9}>You haven't checked in with your healing tools today. Take a moment for a quick reflection.</Text>
              </VStack>
            </HStack>
            <Button 
              as={NextLink}
              href="/dashboard/client/journal"
              bg="white" 
              color="#D68C45" 
              borderRadius="full" 
              px={8}
              _hover={{ bg: 'whiteAlpha.900' }}
            >
              Log Reflection
            </Button>
          </HStack>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mb={10}>
        {/* Mood Card - Enhanced */}
        <Box 
          id="tour-mood-card"
          bg="white" 
          p={8} 
          borderRadius="3xl" 
          shadow="sm" 
          border="1px solid" 
          borderColor="gray.100"
          transition="0.3s"
          _hover={{ shadow: 'md' }}
        >
          <HStack justify="space-between" mb={6}>
            <Heading size="sm" color="#2E2E2E" fontWeight="600">How are you arriving?</Heading>
            <Icon as={FiSun} color="#C9A960" />
          </HStack>
          <VStack spacing={3} align="stretch">
            <SimpleGrid columns={2} spacing={3}>
              {Object.keys(moodColors).map(m => (
                <Button 
                  key={m} 
                  size="md" 
                  h="60px"
                  variant="outline" 
                  bg={mood === m ? moodColors[m].bg : 'transparent'}
                  borderColor={mood === m ? moodColors[m].text : 'gray.100'}
                  color={mood === m ? moodColors[m].text : 'gray.600'}
                  _hover={{ bg: moodColors[m].bg, borderColor: moodColors[m].text }}
                  onClick={() => handleMoodUpdate(m)}
                  borderRadius="2xl"
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Icon as={moodColors[m].icon} boxSize={4} />
                  <Text fontSize="xs">{m}</Text>
                </Button>
              ))}
            </SimpleGrid>
            <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
              Synced with your therapist's dashboard.
            </Text>
          </VStack>
        </Box>

        {/* Goals Progress - Refined */}
        <Box 
          id="tour-goals-card"
          bg="white" 
          p={8} 
          borderRadius="3xl" 
          shadow="sm" 
          border="1px solid" 
          borderColor="gray.100"
          transition="0.3s"
          _hover={{ shadow: 'md' }}
        >
           <HStack justify="space-between" mb={6}>
            <Heading size="sm" color="#2E2E2E">Healing Journey</Heading>
            <Icon as={FiCheckCircle} color="#56756C" />
          </HStack>
          <VStack align="stretch" spacing={5}>
            <Box>
                <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="600" color="#2E2E2E">Overall Progress</Text>
                    <Text fontSize="sm" fontWeight="800" color="#56756D">{Math.round(progressValue)}%</Text>
                </HStack>
                <Progress 
                    value={progressValue} 
                    bg="#E9F2ED" 
                    colorScheme="teal" 
                    borderRadius="full" 
                    size="md" 
                />
            </Box>
            
            <VStack align="start" spacing={3}>
                {goals.slice(0, 2).map(goal => (
                    <HStack key={goal.id} spacing={3}>
                        <Icon as={FiArrowRight} color="#56756D" boxSize={3} />
                        <Text fontSize="sm" color="gray.600" noOfLines={1}>{goal.title}</Text>
                    </HStack>
                ))}
            </VStack>
            
            <Button 
                as={NextLink} 
                href="/dashboard/client/goals" 
                size="sm" 
                variant="ghost" 
                color="#56756D" 
                p={0} 
                _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                justifyContent="start"
            >
                View detailed path
            </Button>
          </VStack>
        </Box>

        {/* Next Appointment - Premium Look */}
        <Box 
          id="tour-appt-card"
          bg="#56756D" 
          p={8} 
          borderRadius="3xl" 
          shadow="xl" 
          color="white"
          position="relative"
          overflow="hidden"
        >
            <Box 
                position="absolute" 
                top="-20px" 
                right="-20px" 
                bg="white" 
                opacity={0.05} 
                w="150px" 
                h="150px" 
                borderRadius="full" 
            />
            
            <HStack justify="space-between" mb={8}>
                <VStack align="start" spacing={0}>
                   <Heading size="sm">Coming Up Next</Heading>
                   <Text fontSize="xs" opacity={0.8}>Standard Therapy Session</Text>
                </VStack>
                <Icon as={FiCalendar} boxSize={5} />
            </HStack>

            {nextAppt ? (
                <VStack align="start" spacing={4}>
                    <HStack spacing={4}>
                        <VStack align="start" spacing={0} bg="rgba(255,255,255,0.1)" p={3} borderRadius="2xl" border="1px solid rgba(255,255,255,0.2)">
                            <Text fontSize="2xl" fontWeight="800" lineHeight="1">
                                {new Date(nextAppt.start_time).getDate()}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" opacity={0.8}>
                                {new Date(nextAppt.start_time).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                            </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="700" fontSize="lg">
                                {new Date(nextAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text fontSize="xs" opacity={0.8}>With {nextAppt.therapist_name || 'Assigned Therapist'}</Text>
                        </VStack>
                    </HStack>
                    <HStack w="full" pt={2}>
                        <Button 
                            flex="1" 
                            size="md" 
                            bg="white" 
                            color="#56756D" 
                            borderRadius="2xl"
                            _hover={{ bg: '#F2F1ED' }}
                            fontSize="sm"
                            fontWeight="700"
                        >
                            Join Video Room
                        </Button>
                    </HStack>
                </VStack>
            ) : (
                <VStack align="start" spacing={6}>
                    <Text fontSize="sm" opacity={0.9}>You don't have any sessions scheduled currently.</Text>
                    <Button 
                        as={NextLink} 
                        href="/therapists/discovery" 
                        size="md" 
                        bg="white" 
                        color="#56756D" 
                        borderRadius="2xl"
                        w="full"
                    >
                        Schedule Session
                    </Button>
                </VStack>
            )}
        </Box>
      </SimpleGrid>

      {relationships.length === 0 && !loading && (
        <Box 
            bgGradient="linear(to-br, #F2F8F5, #FFFFFF)" 
            p={10} 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor="teal.100" 
            mb={10}
            textAlign="center"
        >
            <VStack spacing={6} maxW="600px" mx="auto">
                <Box bg="white" p={4} borderRadius="full" shadow="md">
                    <Icon as={FiUsers} color="#56756D" boxSize={8} />
                </Box>
                <VStack spacing={2}>
                    <Heading size="md" color="#2E2E2E">Find Your Therapeutic Guide</Heading>
                    <Text color="gray.600">
                        You haven't been matched with a therapist yet. Our matching process prioritizes relational safety and clinical alignment.
                    </Text>
                </VStack>
                <Button 
                    as={NextLink}
                    href="/therapists/discovery"
                    bg="#56756D" 
                    color="white" 
                    size="lg" 
                    px={10} 
                    borderRadius="2xl"
                    _hover={{ bg: '#C9A960' }}
                    rightIcon={<FiArrowRight />}
                >
                    Meet Our Clinicians
                </Button>
            </VStack>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Recent Activity */}
        <VStack align="stretch" spacing={6}>
            <Heading size="md" color="#2E2E2E" fontFamily="'Playfair Display', serif">Relational Activity</Heading>
            <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                <VStack align="stretch" spacing={6}>
                    {journals.slice(0, 2).map(j => (
                        <ActivityItem 
                            key={`j-${j.id}`}
                            icon={FiEdit3} 
                            title="Reflection Captured" 
                            desc={j.entry} 
                            time={new Date(j.created_at).toLocaleDateString()} 
                        />
                    ))}
                    {goals.filter(g => g.is_completed).slice(0, 1).map(g => (
                        <ActivityItem 
                            key={`g-${g.id}`}
                            icon={FiCheckCircle} 
                            title="Milestone Reached" 
                            desc={`Completed: ${g.title}`} 
                            time={new Date(g.updated_at).toLocaleDateString()} 
                        />
                    ))}
                    {(journals.length === 0 && goals.filter(g => g.is_completed).length === 0) && (
                        <Text color="gray.400" fontSize="sm" py={4}>No recent activity yet. Your healing journey starts here.</Text>
                    )}
                </VStack>
                <Button 
                    as={NextLink}
                    href="/dashboard/client/journal"
                    mt={8} 
                    w="full" 
                    variant="outline" 
                    borderRadius="2xl" 
                    color="gray.600"
                    rightIcon={<FiArrowRight />}
                >
                    View History
                </Button>
            </Box>
        </VStack>

        {/* Tip of the Day / Mindfulness */}
        <VStack align="stretch" spacing={6}>
            <Heading size="md" color="#2E2E2E" fontFamily="'Playfair Display', serif">The Care Space</Heading>
            <Box 
                bgGradient="linear(to-br, #56756D, #3E5B54)" 
                p={8} 
                borderRadius="3xl" 
                shadow="xl" 
                color="white"
            >
                <VStack align="start" spacing={6}>
                    <Icon as={FiHeart} boxSize={8} opacity={0.3} />
                    <VStack align="start" spacing={2}>
                        <Text fontSize="xl" fontWeight="700" lineHeight="1.4">
                            "{currentPrompt.quote}"
                        </Text>
                        <Text fontSize="sm" opacity={0.7}>— {currentPrompt.author}</Text>
                    </VStack>
                    <Box w="full" bg="rgba(255,255,255,0.1)" p={5} borderRadius="2xl">
                        <Text fontWeight="600" mb={2} fontSize="sm">Try this today:</Text>
                        <Text fontSize="sm" opacity={0.9}>
                            {currentPrompt.tip}
                        </Text>
                    </Box>
                    <Button 
                        bg="white" 
                        color="#56756D" 
                        size="sm" 
                        borderRadius="full" 
                        px={6}
                        as={NextLink}
                        href="/dashboard/client/resources"
                    >
                        Explore More Tools
                    </Button>
                </VStack>
            </Box>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

function ActivityItem({ icon, title, desc, time }) {
    // Basic HTML tag stripping for preview if it's too long
    const cleanDesc = desc?.replace(/<[^>]*>?/gm, '').substring(0, 100) + (desc?.length > 100 ? '...' : '');
    
    return (
        <HStack spacing={4} align="start" w="full">
            <Box bg="#F2F1ED" p={3} borderRadius="xl">
                <Icon as={icon} color="#56756D" />
            </Box>
            <VStack align="start" spacing={0} flex="1" overflow="hidden">
                <HStack justify="space-between" w="full">
                    <Text fontWeight="700" color="#2E2E2E" fontSize="sm">{title}</Text>
                    <Text fontSize="xs" color="gray.400">{time}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500" noOfLines={2} title={cleanDesc}>
                    {cleanDesc}
                </Text>
            </VStack>
        </HStack>
    );
}
