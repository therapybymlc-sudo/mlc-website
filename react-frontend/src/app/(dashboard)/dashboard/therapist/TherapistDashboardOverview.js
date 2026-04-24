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
  Divider,
  Flex,
  Badge,
  Container,
  Circle,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiFileText, 
  FiSettings, 
  FiAward, 
  FiAlertCircle,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiPlus,
  FiMessageSquare,
  FiShield,
  FiHeart,
  FiCheckCircle
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import NextLink from 'next/link';
import { apiGet } from "../../../../api.js";
import TherapistSubscriptionGateway from "../../../../components/TherapistSubscriptionGateway";
import { useTherapistSubscriptionGate } from "../../../../hooks/useTherapistSubscriptionGate";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const StatCard = ({ label, value, help, icon, color, href }) => (
  <MotionBox
    as={href ? NextLink : "div"}
    href={href}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    bg="rgba(255, 255, 255, 0.7)"
    backdropFilter="blur(10px)"
    p={6}
    borderRadius="3xl"
    border="1px solid"
    borderColor="whiteAlpha.400"
    shadow="sm"
    position="relative"
    overflow="hidden"
    cursor={href ? "pointer" : "default"}
    flex="1"
  >
    <Box position="absolute" top="-10px" right="-10px" opacity={0.05}>
      <Icon as={icon} boxSize={32} color={color} />
    </Box>
    <VStack align="start" spacing={1}>
      <HStack spacing={2} mb={2}>
        <Icon as={icon} color={color} />
        <Text fontSize="xs" fontWeight="800" color="gray.500" letterSpacing="widest" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Heading size="xl" color="#2E2E2E">{value}</Heading>
      <Text fontSize="xs" color="gray.500" noOfLines={1}>{help}</Text>
    </VStack>
  </MotionBox>
);

const ActionItem = ({ icon, label, onClick, color, isComingSoon }) => (
  <VStack 
    p={4} 
    borderRadius="2xl" 
    bg="white" 
    cursor={isComingSoon ? "default" : "pointer"}
    transition="all 0.2s"
    _hover={isComingSoon ? {} : { bg: 'rgba(86, 117, 109, 0.05)', transform: 'scale(1.02)', shadow: 'md' }}
    shadow="xs"
    onClick={isComingSoon ? null : onClick}
    flex="1"
    minW="100px"
    position="relative"
  >
    {isComingSoon && <Badge position="absolute" top={1} right={1} fontSize="2xs" colorScheme="gray">SOON</Badge>}
    <Box p={3} borderRadius="xl" bg={`${color}.50`}>
      <Icon as={icon} boxSize={5} color={`${color}.500`} />
    </Box>
    <Text fontSize="xs" fontWeight="700" color="gray.700" mt={1} textAlign="center">{label}</Text>
  </VStack>
);

export default function TherapistDashboardOverview() {
  const { user } = useUser();
  const toast = useToast();
  const [stats, setStats] = useState({ clients: 0, appointments: 0, requests: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  const glassBg = "rgba(255, 255, 255, 0.4)";
  const borderColor = "whiteAlpha.800";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, apptData, profileData, bookingReqRes] = await Promise.all([
          apiGet("clients/"),
          apiGet("appointments/"),
          apiGet("therapists/me/"),
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
        toast({ title: "Application Sent!", description: "MLC is reviewing your credentials 🌿", status: "success" });
        setProfile(prev => ({ ...prev, supervision_status: "pending" }));
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit request", status: "error" });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Box position="relative" pb={20}>
      {/* 🏔️ Decorative Background Elements */}
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px" bg="rgba(86, 117, 109, 0.15)" filter="blur(100px)" borderRadius="full" zIndex={-1} />
      <Box position="absolute" bottom="100px" left="-50px" w="300px" h="300px" bg="rgba(201, 169, 96, 0.1)" filter="blur(80px)" borderRadius="full" zIndex={-1} />

      <Container maxW="container.xl" p={0}>
        {/* 👋 Header Section */}
        <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mb={8} gap={4}>
          <HStack spacing={6}>
            <Box position="relative">
              <Avatar size="2xl" name={user?.fullName} src={user?.imageUrl} border="4px solid white" shadow="2xl" />
              <Box position="absolute" bottom={1} right={1} bg="green.400" w={5} h={5} borderRadius="full" border="3px solid white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Badge variant="subtle" colorScheme="teal" borderRadius="full" px={3} mb={2} fontSize="2xs" fontWeight="800">
                {profile?.is_premium ? "PREMIUM CLINICIAN" : "BASIC PORTAL"}
              </Badge>
              <Heading as="h1" size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">
                Hello, {user?.firstName || 'Practitioner'}
              </Heading>
              <Text color="gray.500" fontSize="md">Ready for today? {stats.appointments} sessions ahead.</Text>
            </VStack>
          </HStack>
          
          <HStack spacing={3}>
             <Button 
                as={NextLink} 
                href="/dashboard/therapist/schedule" 
                leftIcon={<FiCalendar />} 
                bg="white" 
                borderRadius="full" 
                shadow="sm" 
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
              >
                Schedule
              </Button>
             <Button 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                px={8} 
                shadow="lg"
                _hover={{ bg: '#455c56', transform: 'translateY(-2px)', shadow: 'xl' }}
                as={NextLink}
                href="/conference/lobby"
              >
                Join Session
              </Button>
          </HStack>
        </Flex>

        {/* ⚠️ Verification Alert */}
        {profile?.is_verified === false && (
          <Box mb={8} p={6} borderRadius="3xl" bg="orange.50" border="1px solid" borderColor="orange.200" shadow="sm">
            <Flex direction={{ base: "column", md: "row" }} gap={4} justify="space-between" align="center">
              <HStack align="flex-start" spacing={4}>
                <Icon as={FiAlertCircle} boxSize={6} color="orange.500" mt={1} />
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color="orange.800">Application Pending</Heading>
                  <Text color="orange.800" fontSize="sm">Submit your therapist application to finalize your professional profile.</Text>
                </VStack>
              </HStack>
              <Button as={NextLink} href="/therapist-apply" colorScheme="orange" borderRadius="full" px={8}>Submit Application</Button>
            </Flex>
          </Box>
        )}

        {/* 📊 Quick Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          <StatCard label="Caseload" value={stats.clients} help="Active treatment journeys" icon={FiUsers} color="#56756D" href="/dashboard/therapist/clients" />
          <StatCard label="Agenda" value={stats.appointments} help="Sessions booked today" icon={FiCalendar} color="#C9A960" href="/dashboard/therapist/schedule" />
          <StatCard label="New Requests" value={stats.requests} help="Awaiting your response" icon={FiActivity} color="orange.400" href="/dashboard/therapist/booking-requests" />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={8}>
          {/* 📅 Ecosystem Agenda (Col 1-3) */}
          <Box gridColumn={{ lg: "span 3" }}>
            <VStack align="stretch" spacing={6}>
              {/* Agenda Box */}
              <Box bg={glassBg} backdropFilter="blur(10px)" p={8} borderRadius="3xl" border="1px solid" borderColor={borderColor} shadow="sm">
                <HStack justify="space-between" mb={6}>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color="#2E2E2E">In-built Care Flow</Heading>
                    <Text fontSize="xs" color="gray.500">Screening, sessions, and notes—all in one place.</Text>
                  </VStack>
                  <Icon as={FiCalendar} color="#56756D" boxSize={5} />
                </HStack>
                <VStack align="stretch" spacing={3}>
                  {upcoming.length > 0 ? upcoming.slice(0, 3).map((appt) => (
                    <Flex key={appt.id} align="center" p={4} bg="white" borderRadius="2xl" shadow="xs" transition="0.2s" _hover={{ shadow: 'md', border: '1px solid', borderColor: 'mlc.greenHighlight' }}>
                      <VStack align="start" flex="1" spacing={0}>
                        <Text fontWeight="700" color="#2E2E2E">{appt.client_name}</Text>
                        <HStack spacing={2} color="gray.500" fontSize="xs">
                           <Icon as={FiClock} />
                           <Text>{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                           <Divider orientation="vertical" h="10px" />
                           <Text color="teal.600" fontWeight="600">Video Portal</Text>
                        </HStack>
                      </VStack>
                      <Button as={NextLink} href={`/conference/MLC_${appt.id}`} size="sm" bg="#56756D" color="white" borderRadius="full" px={6}>Enter Session</Button>
                    </Flex>
                  )) : (
                    <Box py={10} textAlign="center" borderRadius="2xl" border="2px dashed" borderColor="gray.100">
                      <Text color="gray.500">Your clinical agenda is clear for today.</Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* 🛡️ Secure Chat & Privacy Highlight */}
              <Box 
                bgGradient="linear(to-br, #56756D, #2D3D39)" 
                p={8} 
                borderRadius="3xl" 
                color="white" 
                shadow="xl" 
                position="relative" 
                overflow="hidden"
              >
                <Box position="absolute" top="-20px" right="-20px" opacity={0.1}>
                  <Icon as={FiShield} boxSize={40} />
                </Box>
                <VStack align="start" spacing={4}>
                  <HStack spacing={2}>
                    <Icon as={FiMessageSquare} color="mlc.gold" />
                    <Badge colorScheme="yellow" fontSize="2xs" borderRadius="full">COMING SOON</Badge>
                  </HStack>
                  <Heading size="md" fontFamily="'Playfair Display', serif">Secure & Private Communications</Heading>
                  <Text fontSize="sm" color="whiteAlpha.800" maxW="450px">
                    We are building a secure space where you can chat with clients without ever exchanging personal phone numbers. Protect your boundaries and your personal life.
                  </Text>
                  <HStack spacing={4}>
                    <Button bg="whiteAlpha.200" color="white" borderRadius="full" px={6} isDisabled>
                      Opening Soon
                    </Button>
                    <Text fontSize="xs" color="whiteAlpha.600">Part of the complete ethical follow-through.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* 🌿 Wellbeing & Balance Highlight */}
              <Box bg="white" p={8} borderRadius="3xl" border="1px solid" borderColor="teal.50" shadow="sm">
                <HStack spacing={4} mb={4}>
                  <Circle size="40px" bg="teal.50">
                    <Icon as={FiHeart} color="teal.500" />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Heading size="sm" color="#2E2E2E">Practitioner Wellbeing</Heading>
                    <Text fontSize="xs" color="gray.500">Because your health is the foundation of your care.</Text>
                  </VStack>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={6} lineHeight="relaxed">
                  The MLC ecosystem doesn’t just help you track your clients; it helps you track and care for your own wellbeing too. Work-life balance just got a lot easier with tools designed to prevent burnout and ensure you stay at your best.
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <HStack spacing={2}><Icon as={FiCheckCircle} color="teal.500" fontSize="xs" /><Text fontSize="xs" fontWeight="600">Burnout Tracking</Text></HStack>
                  <HStack spacing={2}><Icon as={FiCheckCircle} color="teal.500" fontSize="xs" /><Text fontSize="xs" fontWeight="600">Balance Metrics</Text></HStack>
                </SimpleGrid>
              </Box>
            </VStack>
          </Box>

          {/* 🛠️ Side Panel (Col 4-5) */}
          <Box gridColumn={{ lg: "span 2" }}>
            <VStack align="stretch" spacing={8}>
              {/* Clinical Ecosystem Toolbox */}
              <Box bg={glassBg} backdropFilter="blur(10px)" p={8} borderRadius="3xl" border="1px solid" borderColor={borderColor} shadow="sm">
                <Heading size="sm" color="#2E2E2E" mb={6}>Clinical Ecosystem</Heading>
                <SimpleGrid columns={2} spacing={3}>
                  <ActionItem icon={FiPlus} label="New Screening" color="teal" onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/clients"))} />
                  <ActionItem icon={FiFileText} label="Session Note" color="orange" onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/care"))} />
                  <ActionItem icon={FiCalendar} label="Scheduling" color="teal" onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/schedule"))} />
                  <ActionItem icon={FiTrendingUp} label="Billing Trends" color="gold" isComingSoon />
                </SimpleGrid>
                <Text mt={6} fontSize="xs" color="gray.500" fontStyle="italic">
                  From screening to billing—never leave the platform.
                </Text>
              </Box>

              {/* 🏛️ Career Growth / Supervision */}
              <Box 
                bgGradient="linear(to-br, white, teal.50)" 
                p={8} 
                borderRadius="3xl" 
                shadow="md" 
                border="1px solid" 
                borderColor={profile?.supervision_status === 'approved' ? "mlc.gold" : "gray.100"}
                position="relative"
              >
                {profile?.supervision_status === 'approved' && (
                   <Badge position="absolute" top={4} right={4} colorScheme="yellow">SUPERVISOR</Badge>
                )}
                <HStack spacing={4} mb={4}>
                  <Icon as={FiAward} boxSize={8} color="mlc.gold" />
                  <Heading size="xs" color="mlc.greenDark" textTransform="uppercase" letterSpacing="0.1em">Supervision Suite</Heading>
                </HStack>
                <Text fontSize="xs" color="gray.600" mb={6} lineHeight="relaxed">
                  Help grow the clinical community. Access specialized tools for mentorship and supervisee tracking.
                </Text>
                <Button 
                  size="sm" 
                  w="full" 
                  borderRadius="full" 
                  bg={profile?.supervision_status === 'approved' ? "transparent" : "mlc.green"}
                  color={profile?.supervision_status === 'approved' ? "mlc.gold" : "white"}
                  variant={profile?.supervision_status === 'approved' ? "outline" : "solid"}
                  borderColor="mlc.gold"
                  as={NextLink} 
                  href="/dashboard/therapist/supervision"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  {profile?.supervision_status === 'approved' ? "Enter Supervision" : "Apply for Status"}
                </Button>
              </Box>

              {/* 🚀 Pro Upgrade Upsell */}
              <Box p={6} bg="gray.900" borderRadius="3xl" shadow="xl" color="white">
                <HStack spacing={3} mb={4}>
                  <Icon as={FiStar} color="mlc.gold" />
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.1em">THE THERAPIST OS</Text>
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.800" mb={4}>
                  Unlock the full power of the ecosystem: Note Templates, Advanced Billing, and more.
                </Text>
                <Button size="xs" w="full" colorScheme="yellow" borderRadius="full" as={NextLink} href="/dashboard/therapist/subscription">
                  Upgrade to Pro
                </Button>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
      
      <TherapistSubscriptionGateway 
        isOpen={gateModal.isOpen} 
        onClose={gateModal.onClose} 
        contextLabel="Unlock the full clinical ecosystem for your practice."
      />
    </Box>
  );
}
