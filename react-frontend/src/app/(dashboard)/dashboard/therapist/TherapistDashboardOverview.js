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
  Flex,
  Center,
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
          apiGet("clients/"),
          apiGet("appointments/"),
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
      <Flex direction={{ base: "column", sm: "row" }} align="center" justify="space-between" mb={10} gap={6}>
        <HStack spacing={4} align={{ base: "center", sm: "center" }} direction={{ base: "column", sm: "row" }} textAlign={{ base: "center", sm: "left" }}>
          <Avatar size="xl" name={user?.fullName} src={user?.imageUrl} border="4px solid white" shadow="lg" />
          <VStack align={{ base: "center", sm: "start" }} spacing={0}>
            <Heading as="h1" size="lg" color="#2E2E2E" noOfLines={1}>Welcome, {user?.firstName || 'Practitioner'}</Heading>
            <Text color="gray.500">Your clinical space is ready.</Text>
          </VStack>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="700" fontSize="xs" letterSpacing="widest" whiteSpace="nowrap">ACTIVE CLIENTS</StatLabel>
          <StatNumber fontSize="3xl" color="#56756D">{stats.clients}</StatNumber>
          <StatHelpText noOfLines={1}>Clinician caseload</StatHelpText>
        </Stat>

        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="700" fontSize="xs" letterSpacing="widest" whiteSpace="nowrap">TODAY'S SESSIONS</StatLabel>
          <StatNumber fontSize="3xl" color="#C9A960">{stats.appointments}</StatNumber>
          <StatHelpText noOfLines={1}>Next session soon</StatHelpText>
        </Stat>

        <Stat bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <StatLabel color="gray.500" fontWeight="700" fontSize="xs" letterSpacing="widest" whiteSpace="nowrap">NEW REQUESTS</StatLabel>
          <StatNumber fontSize="3xl" color="orange.400">{stats.requests}</StatNumber>
          <StatHelpText noOfLines={1}>Pending review</StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Upcoming Sessions */}
        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={6}>
            <Heading size="md" color="#2E2E2E">Upcoming Sessions</Heading>
            <Icon as={FiCalendar} color="#56756D" />
          </HStack>
          <VStack align="stretch" spacing={4}>
            {upcoming.length > 0 ? upcoming.slice(0, 3).map((appt) => (
                <HStack key={appt.id} justify="space-between" p={3} borderRadius="xl" _hover={{ bg: 'gray.50' }} wrap="nowrap">
                    <HStack spacing={4} flex="1" overflow="hidden">
                        <Box boxSize={10} bg="rgba(86, 117, 109, 0.1)" borderRadius="lg" display={{ base: "none", sm: "flex" }} alignItems="center" justify="center" flexShrink={0}>
                            <Icon as={FiClock} color="#56756D" />
                        </Box>
                        <VStack align="start" spacing={0} overflow="hidden" flex="1">
                            <Text fontWeight="700" noOfLines={1} color="#2E2E2E">{appt.client_name}</Text>
                            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={2} wrap="nowrap">
                        <Button 
                            as={NextLink} 
                            href={`/dashboard/client/session?url=${encodeURIComponent(appt.meeting_link || `https://8x8.vc/vpaas-magic-cookie-0d29cfbee27644b2ad432cdd4f043406/${appt.id}`)}`}
                            size="xs" 
                            bg="#56756D" 
                            color="white" 
                            borderRadius="full" 
                            px={4} 
                            whiteSpace="nowrap"
                            _hover={{ bg: '#455c56' }}
                        >
                            Join Session
                        </Button>
                        <Button size="xs" variant="ghost" colorScheme="teal" borderRadius="full" px={4} whiteSpace="nowrap">View Note</Button>
                    </HStack>
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
