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
  Avatar,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiUsers, FiCalendar, FiClock, FiFileText, FiSettings } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import NextLink from 'next/link';
import { apiGet } from "../../../../api.js";

export default function TherapistDashboardOverview() {
  const { user } = useUser();
  const toast = useToast();
  const [stats, setStats] = useState({ clients: 0, appointments: 0, requests: 0 });
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, apptData] = await Promise.all([
          apiGet("therapists/clients/"),
          apiGet("therapist-appointments/"),
        ]);
        setStats({
          clients: clientData?.length || 0,
          appointments: apptData?.length || 0,
          requests: 0 // Fetch from dedicated endpoint later
        });
        setUpcoming(apptData || []);
      } catch (err) {
        console.warn("Dashboard sync failed", err);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <VStack align="start" spacing={6} mb={10}>
        <HStack spacing={4}>
          <Avatar size="xl" name={user?.fullName} src={user?.imageUrl} border="4px solid white" shadow="lg" />
          <VStack align="start" spacing={0}>
            <Heading as="h1" size="lg" color="#2E2E2E">Welcome, {user?.firstName || 'Practitioner'}</Heading>
            <Text color="gray.500">Your clinical space is ready.</Text>
          </VStack>
        </HStack>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="600">Active Clients</StatLabel>
          <StatNumber fontSize="3xl" color="#56756D">{stats.clients}</StatNumber>
          <StatHelpText>Total clinicians caseload</StatHelpText>
        </Stat>

        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="600">Today's Sessions</StatLabel>
          <StatNumber fontSize="3xl" color="#C9A960">{stats.appointments}</StatNumber>
          <StatHelpText>Next session in 2 hours</StatHelpText>
        </Stat>

        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="600">New Requests</StatLabel>
          <StatNumber fontSize="3xl" color="orange.400">{stats.requests}</StatNumber>
          <StatHelpText>Pending review</StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Upcoming Sessions */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={6}>
            <Heading size="md" color="#2E2E2E">Upcoming Sessions</Heading>
            <Icon as={FiCalendar} color="#56756D" />
          </HStack>
          <VStack align="stretch" spacing={4}>
            {upcoming.length > 0 ? upcoming.slice(0, 3).map((appt) => (
                <HStack key={appt.id} justify="space-between" p={3} borderRadius="xl" _hover={{ bg: 'gray.50' }}>
                    <HStack spacing={4}>
                        <Box boxSize={10} bg="rgba(86, 117, 109, 0.1)" borderRadius="lg" display="flex" alignItems="center" justify="center">
                            <Icon as={FiClock} color="#56756D" />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="600">{appt.client_name}</Text>
                            <Text fontSize="xs" color="gray.500">{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </VStack>
                    </HStack>
                    <Button size="sm" variant="ghost" colorScheme="teal">View Note</Button>
                </HStack>
            )) : (
                <Text color="gray.500" fontSize="sm">No sessions scheduled for today.</Text>
            )}
          </VStack>
          <Button mt={6} w="100%" borderRadius="full" colorScheme="teal" variant="outline" as={NextLink} href="/dashboard/therapist/schedule">
            View Full Schedule
          </Button>
        </Box>

        {/* Quick Actions */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Heading size="md" color="#2E2E2E" mb={6}>Clinical Actions</Heading>
          <SimpleGrid columns={2} spacing={4}>
            <VStack 
                p={4} 
                borderRadius="2xl" 
                bg="#F9FAFB" 
                cursor="pointer" 
                _hover={{ bg: 'rgba(86, 117, 109, 0.05)' }}
                transition="all 0.2s"
                as={NextLink}
                href="/dashboard/therapist/clients"
            >
                <Icon as={FiUsers} boxSize={6} color="#56756D" />
                <Text fontSize="sm" fontWeight="600">Add Client</Text>
            </VStack>
            <VStack 
                p={4} 
                borderRadius="2xl" 
                bg="#F9FAFB" 
                cursor="pointer" 
                _hover={{ bg: 'rgba(86, 117, 109, 0.05)' }}
                as={NextLink}
                href="/dashboard/therapist/care"
            >
                <Icon as={FiFileText} boxSize={6} color="#C9A960" />
                <Text fontSize="sm" fontWeight="600">Session Note</Text>
            </VStack>
            <VStack 
                p={4} 
                borderRadius="2xl" 
                bg="#F9FAFB" 
                cursor="pointer" 
                _hover={{ bg: 'rgba(86, 117, 109, 0.05)' }}
                as={NextLink}
                href="/dashboard/therapist/schedule"
            >
                <Icon as={FiCalendar} boxSize={6} color="#56756D" />
                <Text fontSize="sm" fontWeight="600">Availability</Text>
            </VStack>
             <VStack 
                p={4} 
                borderRadius="2xl" 
                bg="#F9FAFB" 
                cursor="pointer" 
                _hover={{ bg: 'rgba(86, 117, 109, 0.05)' }}
            >
                <Icon as={FiSettings} boxSize={6} color="gray.400" />
                <Text fontSize="sm" fontWeight="600">Settings</Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
