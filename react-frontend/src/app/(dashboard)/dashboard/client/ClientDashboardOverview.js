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
  TagLabel,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiCalendar, FiCheckCircle, FiEdit3, FiActivity } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { apiGet } from "../../../../api.js";

export default function ClientDashboardOverview() {
  const { user } = useUser();
  const toast = useToast();
  const [mood, setMood] = useState("Balanced");
  const [goals, setGoals] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [goalData, apptData] = await Promise.all([
          apiGet("client-goals/"),
          apiGet("client-appointments/"),
        ]);
        setGoals(goalData || []);
        setAppointments(apptData || []);
      } catch (err) {
        console.warn("Could not fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const progressValue = goals.length > 0 
    ? (goals.filter(g => g.is_completed).length / goals.length) * 100 
    : 0;

  return (
    <Box>
      <VStack align="start" spacing={6} mb={10}>
        <HStack spacing={4}>
          <Avatar size="xl" name={user?.fullName} src={user?.imageUrl} border="4px solid white" shadow="lg" />
          <VStack align="start" spacing={0}>
            <Heading as="h1" size="lg" color="#2E2E2E">Hello, {user?.firstName || 'there'}</Heading>
            <Text color="gray.500">Welcome to your healing space.</Text>
          </VStack>
        </HStack>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
        {/* Mood Card */}
        <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="#2E2E2E">Current Mood</Heading>
            <Icon as={FiActivity} color="#C9A960" />
          </HStack>
          <HStack spacing={2} mb={4}>
             {['Calm', 'Balanced', 'Low', 'Anxious'].map(m => (
               <Button 
                key={m} 
                size="xs" 
                variant={mood === m ? 'solid' : 'outline'} 
                colorScheme={mood === m ? 'teal' : 'gray'}
                onClick={() => setMood(m)}
               >
                 {m}
               </Button>
             ))}
          </HStack>
          <Text fontSize="xs" color="gray.500">Tracking your mood helps you and your therapist identify patterns.</Text>
        </Box>

        {/* Goals Progress */}
        <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="#2E2E2E">Goal Progress</Heading>
            <Icon as={FiCheckCircle} color="#56756C" />
          </HStack>
          <VStack align="stretch" spacing={2} mb={4}>
            <Progress value={progressValue} colorScheme="teal" borderRadius="full" size="sm" />
            <Text fontSize="xs" color="gray.500">{goals.filter(g => g.is_completed).length} of {goals.length} goals completed</Text>
          </VStack>
          <Button size="sm" variant="ghost" color="#56756D">View all goals</Button>
        </Box>

        {/* Next Appointment */}
        <Box bg="#56756D" p={6} borderRadius="3xl" shadow="lg" color="white">
            <HStack justify="space-between" mb={4}>
                <Heading size="sm">Next Session</Heading>
                <Icon as={FiCalendar} />
            </HStack>
            {appointments.length > 0 ? (
                <VStack align="start" spacing={1}>
                    <Text fontWeight="700" fontSize="lg">{new Date(appointments[0].start_time).toLocaleDateString()}</Text>
                    <Text fontSize="sm" opacity={0.9}>{new Date(appointments[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </VStack>
            ) : (
                <Text fontSize="sm">No upcoming sessions scheduled.</Text>
            )}
            <Button mt={4} size="sm" bg="white" color="#56756D" _hover={{ bg: 'gray.100' }}>Schedule Session</Button>
        </Box>
      </SimpleGrid>

      <Heading size="md" mb={6} color="#2E2E2E" fontFamily="'Playfair Display', serif">Your Recent Activity</Heading>
      <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
        <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
                <HStack>
                    <Icon as={FiEdit3} color="gray.400" />
                    <Text fontWeight="500">Journal Entry</Text>
                </HStack>
                <Text fontSize="xs" color="gray.400">2 days ago</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
                <HStack>
                    <Icon as={FiCheckCircle} color="gray.400" />
                    <Text fontWeight="500">Completed Goal: Daily Grounding</Text>
                </HStack>
                <Text fontSize="xs" color="gray.400">Yesterday</Text>
            </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
