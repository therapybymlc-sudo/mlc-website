'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Avatar,
  Icon,
  Flex,
  Badge,
  Circle,
  Grid,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiFileText, 
  FiAward, 
  FiAlertCircle,
  FiShield,
  FiHeart,
  FiCheckCircle,
  FiVideo,
  FiInbox,
  FiChevronRight,
  FiEdit3,
  FiDollarSign,
  FiLock,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import NextLink from 'next/link';
import { openInvoiceModal } from "../../../../components/InvoiceModal";
import { apiGet } from "../../../../api.js";
import TherapistGatedGateway from "../../../../components/TherapistGatedGateway";
import { useTherapistSubscriptionGate } from "../../../../hooks/useTherapistSubscriptionGate";

/* 🛠️ Action Tool Tile for Ecosystem (Matching Client Dashboard Interactive Items) */
const ActionTile = ({ icon, label, sublabel, href, color = "#56756D" }) => (
  <HStack
    as={NextLink}
    href={href}
    py={3.5}
    px={4}
    borderRadius="xl"
    bg="rgba(250, 248, 245, 0.85)"
    border="1px solid"
    borderColor="rgba(86, 117, 109, 0.1)"
    cursor="pointer"
    transition="all 0.18s ease"
    _hover={{
      bg: "white",
      borderColor: "rgba(86, 117, 109, 0.28)",
      transform: "translateX(3px)",
      boxShadow: "0 2px 8px rgba(38, 58, 51, 0.05)"
    }}
    spacing={3}
    w="full"
    justify="space-between"
  >
    <HStack spacing={3} minW={0}>
      <Circle size="34px" bg="rgba(86, 117, 109, 0.1)" color={color} flexShrink={0}>
        <Icon as={icon} boxSize="15px" />
      </Circle>
      <VStack align="start" spacing={0} minW={0}>
        <Text 
          fontSize="13.5px" 
          fontWeight="600" 
          color="#263A33"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          noOfLines={1}
        >
          {label}
        </Text>
        {sublabel && (
          <Text fontSize="12px" color="#5A6E65" noOfLines={1} fontFamily="'Inter', var(--font-inter), sans-serif">
            {sublabel}
          </Text>
        )}
      </VStack>
    </HStack>
    <Icon as={FiChevronRight} color="#8EA99F" boxSize="14px" flexShrink={0} />
  </HStack>
);

export default function TherapistDashboardOverview() {
  const { user } = useUser();
  const [stats, setStats] = useState({ clients: 0, appointments: 0, requests: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  useEffect(() => {
    const fetchData = async () => {
      const [clientRes, apptRes, profileRes, bookingRes] = await Promise.allSettled([
        apiGet("clients/"),
        apiGet("appointments/"),
        apiGet("therapists/me/"),
        apiGet("therapist-booking-requests/"),
      ]);

      const clientData = clientRes.status === "fulfilled" ? clientRes.value : [];
      const apptData = apptRes.status === "fulfilled" ? apptRes.value : [];
      const profileData = profileRes.status === "fulfilled" ? profileRes.value : null;
      const bookingReqRes = bookingRes.status === "fulfilled" ? bookingRes.value : [];

      const brList = Array.isArray(bookingReqRes) ? bookingReqRes : (bookingReqRes?.results || []);
      const pendingRequests = brList.filter((r) => r.status === "pending").length;

      const allAppts = Array.isArray(apptData) ? apptData : (apptData?.results || []);
      const now = new Date();
      const today = now.toDateString();
      
      const activeAppts = allAppts.filter(a => a.start_time && a.status !== "cancelled");
      const todayAppts = activeAppts.filter(a => new Date(a.start_time).toDateString() === today);
      const futureOrToday = activeAppts.filter(a => new Date(a.start_time) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

      setStats({
        clients: Array.isArray(clientData) ? clientData.length : (clientData?.results?.length || 0),
        appointments: todayAppts.length,
        requests: pendingRequests,
      });

      setUpcoming(futureOrToday.slice(0, 5));
      
      setProfile(profileData);
      setProfileLoaded(true);
    };
    fetchData();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const displayName = profile?.name || user?.fullName || user?.firstName || 'Practitioner';
  const hasSupervisorTier = profile?.supervision_status === 'approved' || (profile?.years_experience >= 5);

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 Gentle Ambient Glow */}
      <Box 
        position="absolute" 
        top="-60px" 
        right="-40px" 
        w="380px" 
        h="380px" 
        bg="rgba(169, 203, 183, 0.08)" 
        filter="blur(90px)" 
        borderRadius="full" 
        zIndex={-1} 
        pointerEvents="none"
      />

      {/* 🏛️ 1. UNIFIED, AIRY HERO SANCTUARY HEADER (Strict Client Dashboard Architecture) */}
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
                name={displayName} 
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
                  {greeting}, {displayName} 🌿
                </Badge>
                <Badge 
                  bg="rgba(86, 117, 109, 0.08)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  {todayFormatted}
                </Badge>
                <Badge 
                  bg={hasSupervisorTier ? "rgba(201, 169, 96, 0.16)" : "rgba(86, 117, 109, 0.12)"} 
                  color={hasSupervisorTier ? "#856404" : "#263A33"} 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  {hasSupervisorTier ? "Supervisor Tier" : "Practitioner Tier"}
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
                Clinical Practice Space
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Your clinical practice is in active standing. Welcome to your care workspace.
              </Text>
            </VStack>
          </HStack>

          {/* Compact Metric Strip (Strictly matching Client: 3 Balanced Metric Nodes) */}
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
            <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
              <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                <Icon as={FiUsers} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0} minW="max-content">
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                  CASELOAD
                </Text>
                <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  {stats.clients} Active
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
              <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706" flexShrink={0}>
                <Icon as={FiCalendar} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0} minW="max-content">
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                  TODAY
                </Text>
                <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  {stats.appointments} Sessions
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
              <Circle size="28px" bg="rgba(224, 122, 95, 0.12)" color="#E07A5F" flexShrink={0}>
                <Icon as={FiInbox} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0} minW="max-content">
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                  INBOX
                </Text>
                <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                  {stats.requests} Pending
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* ⚠️ Verification Notice if unverified (Soft Wash Alert) */}
      {profileLoaded && profile?.is_verified === false && (
        <Box 
          mb={6} 
          p={4} 
          borderRadius="2xl" 
          bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" 
          border="1px solid rgba(245, 158, 11, 0.3)" 
          boxShadow="0 4px 18px -2px rgba(38, 58, 51, 0.04)"
        >
          <Flex direction={{ base: "column", md: "row" }} gap={3} justify="space-between" align={{ base: "start", md: "center" }}>
            <HStack align="center" spacing={3}>
              <Circle size="28px" bg="rgba(245, 158, 11, 0.2)" color="#B45309">
                <Icon as={FiAlertCircle} boxSize="15px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="13px" fontWeight="600" color="#92400E" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                  Verification in Progress
                </Text>
                <Text color="#78350F" fontSize="12px" fontFamily="'Inter', var(--font-inter), sans-serif">
                  Submit your credentials to finalize verification and unlock your public directory listing.
                </Text>
              </VStack>
            </HStack>
            <Button 
              as={NextLink} 
              href="/therapist-apply" 
              size="sm" 
              bg="#D97706"
              color="white"
              _hover={{ bg: "#B45309" }}
              borderRadius="full" 
              px={4.5}
              h="34px"
              fontSize="12px"
              fontWeight="600"
            >
              Submit Application
            </Button>
          </Flex>
        </Box>
      )}

      {/* 🏛️ 2. BALANCED TWO-COLUMN SANCTUARY ARCHITECTURE (gap={6}, spacing={5}) */}
      <Grid 
        templateColumns={{ base: "1fr", lg: "7fr 5fr" }} 
        gap={6} 
        alignItems="stretch"
      >
        {/* ================= LEFT COLUMN: Clinical Care & Journey (7fr) ================= */}
        <VStack align="stretch" spacing={5} h="full">
          
          {/* Card 1: Today's Clinical Care Flow & Sessions (Spotlight Card) */}
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
                  CLINICAL AGENDA & SESSIONS
                </Text>
              </HStack>
              <Button
                as={NextLink}
                href="/dashboard/therapist/schedule"
                variant="ghost"
                size="xs"
                fontSize="12px"
                fontWeight="600"
                color="#56756D"
                _hover={{ color: "#263A33", bg: "rgba(86, 117, 109, 0.08)" }}
                rightIcon={<Icon as={FiChevronRight} boxSize="13px" />}
              >
                Full Calendar
              </Button>
            </Flex>

            <VStack align="stretch" spacing={4}>
              {upcoming.length > 0 ? (
                upcoming.map((appt) => {
                  const startTime = appt.start_time ? new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
                  const endTime = appt.end_time ? new Date(appt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <VStack key={appt.id} align="stretch" spacing={3}>
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
                              {new Date(appt.start_time).getDate()}
                            </Text>
                            <Text fontSize="9.5px" fontWeight="700" color="#56756D" letterSpacing="0.05em">
                              {new Date(appt.start_time).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                            </Text>
                          </VStack>

                          <VStack align="start" spacing={0}>
                            <HStack spacing={2}>
                              <Circle size="6px" bg="#10B981" />
                              <Text fontWeight="700" fontSize="14.5px" color="#263A33">
                                {startTime}{endTime ? ` – ${endTime}` : ''}
                              </Text>
                              <Badge bg="rgba(16, 185, 129, 0.15)" color="#047857" fontSize="10px" fontWeight="700" borderRadius="full" px={2}>
                                CONFIRMED
                              </Badge>
                            </HStack>
                            <Text fontSize="12.5px" color="#5A6E65">
                              Virtual 1-on-1 Session
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={2.5}>
                          <Avatar size="sm" name={appt.client_name || "Client"} bg="#56756D" color="white" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="13px" fontWeight="600" color="#263A33">
                              {appt.client_name || "Client"}
                            </Text>
                            <Text fontSize="11px" color="#718096">
                              Individual Therapy
                            </Text>
                          </VStack>
                        </HStack>
                      </Flex>

                      {/* Session Actions Strip */}
                      <HStack spacing={2.5}>
                        <Button 
                          as={NextLink}
                          href={`/conference/MLC_${appt.id}`}
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
                          href="/dashboard/therapist/notes"
                          variant="outline"
                          borderColor="rgba(86, 117, 109, 0.25)"
                          color="#263A33"
                          borderRadius="full"
                          fontSize="12.5px"
                          fontWeight="600"
                          height="38px"
                          px={4}
                          leftIcon={<Icon as={FiEdit3} boxSize="13px" />}
                          _hover={{ bg: 'rgba(169, 203, 183, 0.1)' }}
                        >
                          SOAP Notes
                        </Button>
                        <Button
                          onClick={() => openInvoiceModal(appt.id)}
                          variant="outline"
                          borderColor="rgba(86, 117, 109, 0.25)"
                          color="#263A33"
                          borderRadius="full"
                          fontSize="12.5px"
                          fontWeight="600"
                          height="38px"
                          px={3.5}
                          leftIcon={<Icon as={FiFileText} boxSize="13px" color="#56756D" />}
                          _hover={{ bg: 'rgba(86, 117, 109, 0.08)', borderColor: '#56756D' }}
                        >
                          Invoice
                        </Button>
                      </HStack>
                    </VStack>
                  );
                })
              ) : (
                <VStack align="stretch" spacing={4} py={1}>
                  <HStack spacing={3.5} align="flex-start">
                    <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0} mt={0.5}>
                      <Icon as={FiCompass} boxSize="19px" />
                    </Circle>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="15px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                        Your clinical agenda is serene today
                      </Text>
                      <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                        No client sessions scheduled for today. Dedicated time for case formulation, clinical documentation, and mindful self-care.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} pt={1}>
                    <Button 
                      as={NextLink}
                      href="/dashboard/therapist/schedule"
                      bg="#56756D" 
                      color="white" 
                      size="sm" 
                      height="38px"
                      borderRadius="full"
                      fontSize="13px"
                      fontWeight="600"
                      px={5}
                      leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
                      _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                      transition="all 0.2s"
                    >
                      View Weekly Calendar
                    </Button>
                    <Button 
                      as={NextLink}
                      href="/dashboard/therapist/availability"
                      size="sm" 
                      height="38px"
                      variant="outline" 
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33" 
                      borderRadius="full"
                      fontSize="12.5px"
                      fontWeight="600"
                      px={4}
                      leftIcon={<Icon as={FiClock} boxSize="13px" />}
                      _hover={{ bg: 'rgba(169, 203, 183, 0.1)' }}
                      transition="all 0.2s"
                    >
                      Adjust Availability
                    </Button>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Card 2: Clinical Documentation Suite (Matching Client Card 2) */}
          <Box 
            bg="white" 
            p={{ base: 5, md: 6 }} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiFileText} boxSize="14px" />
                </Circle>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Clinical Documentation Suite
                </Heading>
              </HStack>
              <Badge 
                bg="rgba(86, 117, 109, 0.08)" 
                color="#56756D" 
                fontSize="9.5px" 
                fontWeight="700" 
                px={2.5} 
                py="1.5px" 
                borderRadius="full"
              >
                HIPAA · DPDP COMPLIANT
              </Badge>
            </Flex>

            <Text fontSize="13px" color="#5A6E65" mb={4} lineHeight="1.5">
              Standardized clinical records, SOAP assessments, and collaborative crisis safety planning for active caseloads.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} mb={4}>
              <Box 
                as={NextLink}
                href="/dashboard/therapist/notes"
                p={4} 
                borderRadius="xl" 
                bg="rgba(250, 248, 245, 0.85)" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)"
                cursor="pointer"
                transition="all 0.18s"
                _hover={{ borderColor: "#56756D", bg: "white", transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(38,58,51,0.05)" }}
              >
                <Flex justify="space-between" align="center" mb={1.5}>
                  <HStack spacing={2}>
                    <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiEdit3} boxSize="14px" />
                    </Circle>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                      Session Blueprints
                    </Text>
                  </HStack>
                  <Icon as={FiArrowRight} color="#8EA99F" boxSize="13px" />
                </Flex>
                <Text fontSize="12px" color="#5A6E65" lineHeight="1.45" mb={2.5}>
                  Structured SOAP formatting, intake formulations, and clinical treatment milestones.
                </Text>
                <Badge bg="rgba(86, 117, 109, 0.08)" color="#56756D" fontSize="9.5px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                  SOAP PROTOCOL
                </Badge>
              </Box>

              <Box 
                as={NextLink}
                href="/dashboard/therapist/care"
                p={4} 
                borderRadius="xl" 
                bg="rgba(250, 248, 245, 0.85)" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)"
                cursor="pointer"
                transition="all 0.18s"
                _hover={{ borderColor: "#56756D", bg: "white", transform: "translateY(-1px)", boxShadow: "0 4px 14px rgba(38,58,51,0.05)" }}
              >
                <Flex justify="space-between" align="center" mb={1.5}>
                  <HStack spacing={2}>
                    <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiShield} boxSize="14px" />
                    </Circle>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                      Care Space & Safety
                    </Text>
                  </HStack>
                  <Icon as={FiArrowRight} color="#8EA99F" boxSize="13px" />
                </Flex>
                <Text fontSize="12px" color="#5A6E65" lineHeight="1.45" mb={2.5}>
                  Collaborative safety planning, worksheets, and crisis escalation protocols.
                </Text>
                <Badge bg="rgba(86, 117, 109, 0.08)" color="#56756D" fontSize="9.5px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                  CRISIS PROTOCOL
                </Badge>
              </Box>
            </SimpleGrid>

            <HStack 
              p={3} 
              px={3.5} 
              bg="rgba(86, 117, 109, 0.05)" 
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)" 
              borderRadius="xl" 
              spacing={3}
              justify="space-between"
              align="center"
            >
              <HStack spacing={2.5}>
                <Circle size="24px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiLock} boxSize="12px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="12px" fontWeight="600" color="#263A33">
                    End-to-End Clinical Records Isolation
                  </Text>
                  <Text fontSize="11px" color="#5A6E65">
                    Zero cross-practitioner access. Strictly compliant with HIPAA & DPDP standards.
                  </Text>
                </VStack>
              </HStack>
              <Badge 
                bg="white" 
                color="#56756D" 
                fontSize="9px" 
                fontWeight="700" 
                px={2.5} 
                py={0.5} 
                borderRadius="full" 
                border="1px solid rgba(86, 117, 109, 0.15)"
                display={{ base: "none", sm: "inline-flex" }}
              >
                VERIFIED ENCRYPTED
              </Badge>
            </HStack>
          </Box>

          {/* Card 3: Practitioner Care & Boundaries (Matching Client Card 3) */}
          <Box 
            bg="white" 
            p={{ base: 5, md: 6 }} 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <Flex justify="space-between" align="center" mb={2.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiHeart} boxSize="14px" />
                </Circle>
                <Text fontSize="11px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  PRACTITIONER WELLBEING & BOUNDARIES
                </Text>
              </HStack>
              <Badge 
                bg="rgba(16, 185, 129, 0.12)" 
                color="#047857" 
                fontSize="10px" 
                fontWeight="700" 
                borderRadius="full" 
                px={2.5} 
                py={0.5}
              >
                ACTIVE SAFEGUARDS
              </Badge>
            </Flex>

            <Heading 
              fontSize="15.5px" 
              fontWeight="600" 
              color="#263A33" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              letterSpacing="-0.01em"
              mb={1.5}
            >
              Protecting Your Presence and Emotional Reserve
            </Heading>

            <Text fontSize="12.5px" color="#5A6E65" mb={3.5} lineHeight="1.5">
              MLC actively shields clinicians from burnout: in-portal encrypted communications preserve personal privacy, and automated 15-minute buffers ensure decompression.
            </Text>

            {/* Mindful Grounding Quote Box (Strictly mirroring Client Dashboard Mindful card) */}
            <Box 
              bg="rgba(250, 248, 245, 0.85)" 
              p={3.5} 
              borderRadius="xl" 
              mb={3.5} 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.12)"
            >
              <Text fontSize="10.5px" fontWeight="700" color="#56756D" letterSpacing="0.06em" textTransform="uppercase" mb={1}>
                BETWEEN-SESSION GROUNDING
              </Text>
              <Text fontSize="12.5px" color="#4A5568" lineHeight="1.5" fontWeight="400">
                "Take 90 seconds of gentle unhurried breathing between sessions. Soften your shoulders away from your ears and reset your nervous system before opening your next clinical file."
              </Text>
            </Box>

            {/* 3 Safeguard Badges */}
            <Flex wrap="wrap" gap={2} mb={4}>
              <HStack py={1.5} px={3} bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="full" spacing={2}>
                <Icon as={FiCheckCircle} color="#56756D" boxSize="12.5px" />
                <Text fontSize="11.5px" fontWeight="500" color="#263A33">
                  Encrypted In-Portal Messaging
                </Text>
              </HStack>
              <HStack py={1.5} px={3} bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="full" spacing={2}>
                <Icon as={FiCheckCircle} color="#56756D" boxSize="12.5px" />
                <Text fontSize="11.5px" fontWeight="500" color="#263A33">
                  Automated 15m Buffer Gaps
                </Text>
              </HStack>
              <HStack py={1.5} px={3} bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="full" spacing={2}>
                <Icon as={FiCheckCircle} color="#56756D" boxSize="12.5px" />
                <Text fontSize="11.5px" fontWeight="500" color="#263A33">
                  Caseload Fatigue Safeguards
                </Text>
              </HStack>
            </Flex>

            {/* Action Footer (Strictly mirroring Client Dashboard Mindful card line 950) */}
            <HStack justify="space-between" pt={1}>
              <Button 
                as={NextLink}
                href="/dashboard/therapist/availability"
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
                Configure Buffers
              </Button>
              <Button
                as={NextLink}
                href="/dashboard/therapist/care"
                variant="link"
                color="#56756D"
                fontSize="12px"
                fontWeight="600"
                _hover={{ color: '#263A33', textDecoration: 'underline' }}
              >
                Care Space Tools ➔
              </Button>
            </HStack>
          </Box>
        </VStack>

        {/* ================= RIGHT COLUMN: Practice Tools & Standing (5fr) ================= */}
        <VStack align="stretch" spacing={5} h="full">
          
          {/* Card 1: Practice Ecosystem (Direct Access Shortcuts) */}
          <Box 
            bg="white" 
            p={{ base: 5, md: 6 }} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiClock} boxSize="14px" />
                </Circle>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Practice Ecosystem
                </Heading>
              </HStack>
              <Badge 
                fontSize="9.5px" 
                fontWeight="700" 
                bg="rgba(86, 117, 109, 0.08)"
                color="#56756D" 
                borderRadius="full"
                px={2.5}
                py="1.5px"
              >
                DIRECT ACCESS
              </Badge>
            </Flex>

            <VStack spacing={2.5} align="stretch">
              <ActionTile 
                icon={FiUsers} 
                label="Client Caseload" 
                sublabel="Active files, history & treatment plans" 
                href="/dashboard/therapist/clients" 
              />
              <ActionTile 
                icon={FiFileText} 
                label="Clinical Notes" 
                sublabel="Create or review SOAP entries" 
                href="/dashboard/therapist/notes" 
              />
              <ActionTile 
                icon={FiClock} 
                label="Availability & Buffers" 
                sublabel="Weekly calendar slots & buffer settings" 
                href="/dashboard/therapist/availability" 
              />
              <ActionTile 
                icon={FiDollarSign} 
                label="Practice Earnings" 
                sublabel="Session revenue, invoices & payouts" 
                href="/dashboard/therapist/earnings" 
              />
            </VStack>
          </Box>

          {/* Card 2: Verified Clinical Profile */}
          <Box 
            bg="white" 
            p={{ base: 5, md: 6 }} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(201, 169, 96, 0.15)" color="#C9A960">
                  <Icon as={FiAward} boxSize="14px" />
                </Circle>
                <Heading 
                  fontSize="15.5px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Verified Clinical Profile
                </Heading>
              </HStack>
              <Badge 
                bg={profile?.is_verified ? "rgba(16, 185, 129, 0.12)" : "#FEF3C7"} 
                color={profile?.is_verified ? "#047857" : "#92400E"} 
                fontSize="9.5px" 
                fontWeight="700" 
                borderRadius="full" 
                px={2.5} 
                py="1.5px"
              >
                {profile?.is_verified ? "VERIFIED PRACTITIONER" : "PENDING REVIEW"}
              </Badge>
            </Flex>

            <HStack spacing={3.5} align="center" mb={3.5}>
              <Box position="relative">
                <Avatar 
                  size="md" 
                  name={profile?.name || displayName} 
                  src={user?.imageUrl} 
                  border="2px solid white" 
                  boxShadow="0 2px 6px rgba(38, 58, 51, 0.08)"
                />
                <Circle 
                  size="10px" 
                  bg="#10B981" 
                  border="2px solid white" 
                  position="absolute" 
                  bottom="0" 
                  right="0"
                />
              </Box>
              <VStack align="start" spacing={0.5} minW={0}>
                <Text fontSize="14.5px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" noOfLines={1}>
                  {profile?.name || displayName}
                </Text>
                <Text fontSize="12.5px" color="#5A6E65" noOfLines={1}>
                  {profile?.highest_qualification || "Licensed Clinical Psychologist"}
                </Text>
                <HStack spacing={1.5} fontSize="11.5px" color="#718096" pt={0.5} wrap="wrap">
                  <Text noOfLines={1}>{profile?.city || "Mumbai"}, {profile?.state || "India"}</Text>
                  {profile?.years_experience && (
                    <>
                      <Text color="gray.300">•</Text>
                      <Text color="#56756D" fontWeight="500">{profile.years_experience} yrs exp</Text>
                    </>
                  )}
                </HStack>
              </VStack>
            </HStack>

            {/* Clinical Credentials & Rates Strip */}
            <HStack 
              spacing={3} 
              p={3} 
              px={3.5} 
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.85)" 
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              justify="space-between"
              mb={3.5}
            >
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  SESSION RATE
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33">
                  {profile?.hourly_rate ? `₹${profile.hourly_rate} / hr` : '₹2,500 / hr'}
                </Text>
              </VStack>
              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  DIRECTORY STATUS
                </Text>
                <HStack spacing={1}>
                  <Circle size="6px" bg="#10B981" />
                  <Text fontSize="12px" fontWeight="600" color="#047857">
                    Public & Active
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Button 
              as={NextLink} 
              href="/dashboard/therapist/profile" 
              size="sm" 
              variant="outline" 
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33" 
              borderRadius="full" 
              w="full" 
              h="38px"
              fontSize="13px"
              fontWeight="600"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
            >
              Edit Profile & Rates
            </Button>
          </Box>

          {/* Card 3: Supervision Suite */}
          <Box 
            bg="white" 
            p={{ base: 5, md: 6 }} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)"
          >
            <Flex justify="space-between" align="center" mb={2.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(201, 169, 96, 0.15)">
                  <Icon as={FiAward} color="#C9A960" boxSize="14px" />
                </Circle>
                <Text 
                  fontSize="11px" 
                  fontWeight="700" 
                  color="#718096" 
                  letterSpacing="0.08em" 
                  textTransform="uppercase"
                >
                  SUPERVISION HUB
                </Text>
              </HStack>
              <Badge 
                bg="rgba(201, 169, 96, 0.15)" 
                color="#856404" 
                fontSize="9.5px" 
                fontWeight="700" 
                borderRadius="full" 
                px={2.5} 
                py="1px"
              >
                {hasSupervisorTier ? "SUPERVISOR TIER" : "SUPERVISEE TIER"}
              </Badge>
            </Flex>

            <Heading 
              fontSize="15.5px" 
              fontWeight="600" 
              color="#263A33" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              letterSpacing="-0.01em"
              mb={1.5}
            >
              {hasSupervisorTier ? "Clinical Mentorship & Case Oversight" : "Supervisee Guidance & Consultations"}
            </Heading>
            
            <Text fontSize="12.5px" color="#5A6E65" mb={4} lineHeight="1.5">
              {hasSupervisorTier 
                ? "Mentor clinicians, review accredited case logs, and oversee clinical treatment plans across the network."
                : "Access accredited clinical supervisors, case consultation sessions, and peer feedback."}
            </Text>

            <Button 
              as={NextLink} 
              href={hasSupervisorTier ? "/dashboard/therapist/supervision" : "/dashboard/therapist/supervisee"} 
              size="sm" 
              bg="#56756D" 
              color="white" 
              borderRadius="full" 
              w="full" 
              h="38px" 
              fontSize="13px" 
              fontWeight="600" 
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.2)" 
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              {hasSupervisorTier ? "Enter Supervision Hub" : "View Supervisee Suite"}
            </Button>
          </Box>

        </VStack>

      </Grid>
      
      <TherapistGatedGateway 
        isOpen={gateModal.isOpen} 
        onClose={gateModal.onClose} 
        title="Activate MLC Pro"
        contextLabel="MLC Pro is live now. Subscribe to unlock scheduling, bookings, and your public therapist profile."
      />
    </Box>
  );
}
