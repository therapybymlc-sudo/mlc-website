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
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiUsers, FiCalendar, FiClock, FiFileText, FiSettings, FiAward } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import NextLink from 'next/link';
import { apiGet } from "../../../../api.js";
import TherapistSubscriptionGateway from "../../../../components/TherapistSubscriptionGateway";
import { useTherapistSubscriptionGate } from "../../../../hooks/useTherapistSubscriptionGate";

export default function TherapistDashboardOverview() {
  const { user } = useUser();
  const toast = useToast();
  const [stats, setStats] = useState({ clients: 0, appointments: 0, requests: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, apptData, profileData, relationData, bookingReqRes] = await Promise.all([
          apiGet("clients/"),
          apiGet("appointments/"),
          apiGet("therapists/me/"),
          apiGet("therapist-relationships/"),
          apiGet("therapist-booking-requests/").catch(() => []),
        ]);
        const brList = Array.isArray(bookingReqRes) ? bookingReqRes : (bookingReqRes?.results || []);
        const pendingRequests = brList.filter((r) => r.status === "pending").length;
        setStats({
          clients: clientData?.length || 0,
          appointments: apptData?.length || 0,
          requests: pendingRequests,
        });
        setUpcoming(apptData || []);
        setProfile(profileData);
        setRelationships(relationData || []);
      } catch (err) {
        console.warn("Dashboard sync failed", err);
      }
    };
    fetchData();
  }, []);

  const handleApplySupervision = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("https://api.mlchealth.in/api/therapists/me/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervision_status: "pending" }),
      });
      if (res.ok) {
        toast({ title: "Application Sent!", description: "MLC is reviewing your clinical seniority 🌿", status: "success" });
        setProfile(prev => ({ ...prev, supervision_status: "pending" }));
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit request", status: "error" });
    } finally {
      setIsApplying(false);
    }
  };

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

        <Stat
          as={NextLink}
          href="/dashboard/therapist/booking-requests"
          bg="white"
          p={6}
          borderRadius="3xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          cursor="pointer"
          transition="shadow 0.2s"
          _hover={{ shadow: "md", borderColor: "orange.200" }}
        >
          <StatLabel color="gray.500" fontWeight="700" fontSize="xs" letterSpacing="widest" whiteSpace="nowrap">NEW REQUESTS</StatLabel>
          <StatNumber fontSize="3xl" color="orange.400">{stats.requests}</StatNumber>
          <StatHelpText noOfLines={1}>Pending review — open to respond</StatHelpText>
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
                            href={`/conference/MLC_${appt.id}`}
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
                        {relationships.find(r => r.client === appt.client) && (
                            <Button 
                                as={NextLink} 
                                href={`/conference/MLC_Session_${relationships.find(r => r.client === appt.client).id}`}
                                size="xs" 
                                variant="outline" 
                                colorScheme="teal" 
                                borderRadius="full" 
                                px={4} 
                                whiteSpace="nowrap"
                            >
                                Lounge
                            </Button>
                        )}
                        <Button size="xs" variant="ghost" colorScheme="teal" borderRadius="full" px={4} whiteSpace="nowrap">Note</Button>
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
                onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/clients"))}
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
                onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/care"))}
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
                onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/schedule"))}
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
      <Divider my={10} />

      {/* 🏛️ Supervision Advancement Card */}
      <Box 
        bg="white" 
        p={{ base: 6, md: 10 }} 
        borderRadius="3xl" 
        shadow="xl" 
        border="2px solid" 
        borderColor={profile?.supervision_status === 'approved' ? "mlc.gold" : "gray.50"}
        position="relative"
        overflow="hidden"
      >
        {profile?.supervision_status === 'approved' && (
          <Box position="absolute" top="0" right="0" bg="mlc.gold" color="white" px={6} py={1} borderBottomLeftRadius="xl" fontSize="2xs" fontWeight="bold">CERTIFIED SUPERVISOR</Box>
        )}
        
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align={{ base: "stretch", lg: "center" }}>
          <Box flex="1">
            <HStack spacing={4} mb={4}>
              <Icon as={FiAward} boxSize={{ base: 6, md: 8 }} color="mlc.gold" />
              <VStack align="start" spacing={0}>
                <Heading size={{ base: "sm", md: "md" }} color="mlc.greenDark">Clinical Supervision Program</Heading>
                <Text fontSize="xs" color="gray.500">Mentoring the next generation of clinical excellence.</Text>
              </VStack>
            </HStack>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} lineHeight="relaxed">
              {profile?.years_experience < 5 
                ? `Continue your clinical journey with MLC. Once you reach 5 years of experience, you'll be eligible to apply for supervisory status.`
                : profile?.supervision_status === 'pending'
                ? `Your application for Clinical Supervision is under review by the MLC Clinical Board. We will notify you once your credentials are confirmed.`
                : profile?.supervision_status === 'approved'
                ? `You are an active MLC Clinical Supervisor. You can now list separate availability for supervisees and manage mentorship sessions here.`
                : `You are eligible to apply for Clinical Supervision status. This unlocks specialized tools and a dedicated supervisor profile tab.`
              }
            </Text>
          </Box>
          
          <VStack align={{ base: "stretch", lg: "end" }} spacing={4} minW={{ lg: "240px" }}>
            {profile?.years_experience < 5 ? (
              <Badge variant="subtle" colorScheme="gray" p={{ base: 3, md: 4 }} borderRadius="2xl" textAlign="center" whiteSpace="normal">
                Requires {5 - profile?.years_experience} more years experience
              </Badge>
            ) : profile?.supervision_status === 'none' ? (
              <Button 
                size="lg" bg="mlc.green" color="white" borderRadius="full" px={10} h={{ base: 14, md: 16 }}
                isLoading={isApplying}
                _hover={{ bg: 'mlc.greenDark' }}
                onClick={handleApplySupervision}
              >
                Apply for Supervisor Role
              </Button>
            ) : profile?.supervision_status === 'pending' ? (
              <Badge variant="solid" colorScheme="orange" p={{ base: 3, md: 4 }} borderRadius="2xl" textAlign="center">
                Credentialing in Progress
              </Badge>
            ) : (
              <Button variant="outline" borderColor="mlc.gold" color="mlc.gold" borderRadius="full" px={10} h={14} as={NextLink} href="/dashboard/therapist/supervision">
                Enter Supervision Suite
              </Button>
            )}
          </VStack>
        </Flex>
      </Box>
      {!hasBasicAccess && (
        <Box mt={8} p={4} borderRadius="xl" border="1px solid" borderColor="orange.200" bg="orange.50">
          <Text fontSize="sm" color="orange.800" fontWeight="600">
            You can explore features, but activation is required to use core therapist tools.
          </Text>
          <Button as={NextLink} href="/dashboard/therapist/subscription" mt={3} size="sm" colorScheme="orange" borderRadius="full">
            Activate Basic Plan
          </Button>
        </Box>
      )}

      <TherapistSubscriptionGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate Basic to add clients, schedule sessions, and unlock full therapist workflow."
      />

    </Box>
  );
}
