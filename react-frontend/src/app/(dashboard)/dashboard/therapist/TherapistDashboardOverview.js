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
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
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
  FiCheckCircle,
  FiVideo,
  FiInbox,
  FiCompass,
  FiBriefcase,
  FiExternalLink,
  FiChevronRight,
  FiEdit3,
  FiDollarSign,
  FiArrowUpRight
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import NextLink from 'next/link';
import { apiGet } from "../../../../api.js";
import TherapistGatedGateway from "../../../../components/TherapistGatedGateway";
import { useTherapistSubscriptionGate } from "../../../../hooks/useTherapistSubscriptionGate";
import { motion } from "framer-motion";
import FeedbackWidget from "../../../../components/FeedbackWidget";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

/* 💎 Modern KPI Stat Card */
const StatCard = ({ label, value, help, icon, color = "#56756D", href, badge }) => (
  <MotionBox
    as={href ? NextLink : "div"}
    href={href}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    bg="white"
    p={5}
    borderRadius="2xl"
    border="1px solid"
    borderColor="rgba(86, 117, 109, 0.12)"
    boxShadow="0 2px 12px rgba(38, 58, 51, 0.03)"
    position="relative"
    overflow="hidden"
    cursor={href ? "pointer" : "default"}
    transition="all 0.25s ease"
    _hover={href ? { 
      borderColor: "rgba(86, 117, 109, 0.28)", 
      boxShadow: "0 8px 24px rgba(38, 58, 51, 0.08)",
      transform: "translateY(-3px)" 
    } : {}}
  >
    <Flex justify="space-between" align="start" mb={3}>
      <HStack spacing={2}>
        <Circle size="34px" bg="rgba(169, 203, 183, 0.12)" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
          <Icon as={icon} boxSize="16px" color={color} />
        </Circle>
        <Text 
          fontSize="11px" 
          fontWeight="700" 
          color="#56756D" 
          letterSpacing="0.1em" 
          textTransform="uppercase"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          {label}
        </Text>
      </HStack>
      {badge ? (
        <Badge 
          bg="rgba(169, 203, 183, 0.15)" 
          color="#263A33" 
          fontSize="10px" 
          fontWeight="700"
          px={2} 
          py={0.5} 
          borderRadius="full"
        >
          {badge}
        </Badge>
      ) : href ? (
        <Icon as={FiArrowUpRight} boxSize="14px" color="gray.400" />
      ) : null}
    </Flex>

    <Heading 
      fontSize="28px" 
      fontWeight="600" 
      color="#263A33" 
      fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
      mb={1}
      lineHeight="1.1"
    >
      {value}
    </Heading>
    
    <Text 
      fontSize="12.5px" 
      color="#5A6E65" 
      noOfLines={1}
      fontFamily="'Inter', var(--font-inter), sans-serif"
    >
      {help}
    </Text>
  </MotionBox>
);

/* 🛠️ Compact Action Tool Tile */
const ActionTile = ({ icon, label, sublabel, onClick, href, color = "#56756D", isSoon = false }) => {
  const content = (
    <HStack
      p={3.5}
      borderRadius="xl"
      bg="white"
      border="1px solid"
      borderColor="rgba(86, 117, 109, 0.1)"
      cursor={isSoon ? "default" : "pointer"}
      transition="all 0.2s ease"
      opacity={isSoon ? 0.75 : 1}
      _hover={isSoon ? {} : {
        bg: "rgba(169, 203, 183, 0.08)",
        borderColor: "rgba(86, 117, 109, 0.25)",
        transform: "translateX(3px)",
        boxShadow: "0 2px 8px rgba(38, 58, 51, 0.05)"
      }}
      spacing={3}
      w="full"
      justify="space-between"
    >
      <HStack spacing={3}>
        <Circle size="36px" bg="rgba(169, 203, 183, 0.12)" color={color}>
          <Icon as={icon} boxSize="17px" />
        </Circle>
        <VStack align="start" spacing={0}>
          <Text 
            fontSize="13px" 
            fontWeight="600" 
            color="#263A33"
            fontFamily="'Inter', var(--font-inter), sans-serif"
          >
            {label}
          </Text>
          {sublabel && (
            <Text fontSize="11px" color="#5A6E65" noOfLines={1}>
              {sublabel}
            </Text>
          )}
        </VStack>
      </HStack>
      {isSoon ? (
        <Badge fontSize="9px" fontWeight="700" colorScheme="gray" borderRadius="full" px={2}>
          SOON
        </Badge>
      ) : (
        <Icon as={FiChevronRight} color="gray.400" boxSize="14px" />
      )}
    </HStack>
  );

  if (href && !isSoon) {
    return <NextLink href={href} style={{ width: '100%' }}>{content}</NextLink>;
  }

  return (
    <Box onClick={isSoon ? null : onClick} w="full">
      {content}
    </Box>
  );
};

export default function TherapistDashboardOverview() {
  const { user } = useUser();
  const toast = useToast();
  const [stats, setStats] = useState({ clients: 0, appointments: 0, requests: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
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
      
      const todayAppts = allAppts.filter(a => {
        if (!a.start_time) return false;
        return new Date(a.start_time).toDateString() === today;
      });

      setStats({
        clients: Array.isArray(clientData) ? clientData.length : (clientData?.results?.length || 0),
        appointments: todayAppts.length,
        requests: pendingRequests,
      });

      const sortedToday = [...todayAppts].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setUpcoming(sortedToday);
      
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
    <Box position="relative" pb={16} pt={2}>
      {/* 🌿 Gentle Sanctuary Ambient Glows */}
      <Box 
        position="absolute" 
        top="-60px" 
        right="-40px" 
        w="380px" 
        h="380px" 
        bg="rgba(169, 203, 183, 0.12)" 
        filter="blur(90px)" 
        borderRadius="full" 
        zIndex={-1} 
        pointerEvents="none"
      />
      <Box 
        position="absolute" 
        bottom="120px" 
        left="-40px" 
        w="280px" 
        h="280px" 
        bg="rgba(201, 169, 96, 0.08)" 
        filter="blur(80px)" 
        borderRadius="full" 
        zIndex={-1} 
        pointerEvents="none"
      />

      <Container maxW="container.xl" p={0}>
        
        {/* 🏛️ 1. Elevated Welcome Hero Banner */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={{ base: 5, md: 7 }}
          mb={6}
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.12)"
          boxShadow="0 4px 20px rgba(38, 58, 51, 0.03)"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle accent border line */}
          <Box position="absolute" top={0} left={0} right={0} h="3px" bgGradient="linear(to-r, #56756D, #A9CBB7, #C9A960)" />

          <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "center" }} gap={6}>
            <HStack spacing={{ base: 4, md: 5 }} align="center">
              <Box position="relative">
                <Avatar 
                  size="xl" 
                  name={displayName} 
                  src={user?.imageUrl} 
                  border="3px solid white" 
                  boxShadow="0 4px 14px rgba(38, 58, 51, 0.12)" 
                />
                <Box 
                  position="absolute" 
                  bottom={1} 
                  right={1} 
                  bg="#56756D" 
                  w="14px" 
                  h="14px" 
                  borderRadius="full" 
                  border="2px solid white" 
                  boxShadow="sm"
                />
              </Box>
              
              <VStack align="start" spacing={1}>
                <HStack spacing={2} wrap="wrap">
                  <Text 
                    fontSize="10.5px" 
                    fontWeight="700" 
                    letterSpacing="0.12em" 
                    color="#56756D" 
                    textTransform="uppercase"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                  >
                    CLINICAL COMMAND CENTER
                  </Text>
                  <Text color="gray.300">•</Text>
                  <Text fontSize="11px" color="#5A6E65" fontWeight="500">
                    {todayFormatted}
                  </Text>
                </HStack>

                <Heading 
                  as="h1" 
                  fontSize={{ base: "24px", sm: "28px", md: "32px" }} 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                  lineHeight="1.2"
                >
                  {greeting}, {displayName}
                </Heading>

                <Text 
                  fontSize="13.5px" 
                  fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                  fontStyle="italic"
                  color="#56756D"
                  lineHeight="1.4"
                >
                  {stats.appointments > 0 
                    ? `You have ${stats.appointments} session${stats.appointments === 1 ? '' : 's'} scheduled for today.`
                    : "Your clinical agenda is serene today. Caseload is in active standing."}
                </Text>

                {/* Badges strip */}
                <HStack spacing={2} pt={1} wrap="wrap">
                  <Badge 
                    bg="rgba(169, 203, 183, 0.18)" 
                    color="#263A33" 
                    fontSize="10.5px" 
                    fontWeight="600" 
                    px={2.5} 
                    py={0.5} 
                    borderRadius="full"
                    border="1px solid rgba(86, 117, 109, 0.12)"
                  >
                    {profile?.is_premium ? 'MLC PRO · ANNUAL' : hasBasicAccess ? 'MLC PRO ACTIVE' : 'PRACTITIONER'}
                  </Badge>

                  {hasSupervisorTier && (
                    <Badge 
                      bg="rgba(201, 169, 96, 0.15)" 
                      color="#856404" 
                      fontSize="10.5px" 
                      fontWeight="600" 
                      px={2.5} 
                      py={0.5} 
                      borderRadius="full"
                      border="1px solid rgba(201, 169, 96, 0.25)"
                    >
                      SUPERVISOR TIER
                    </Badge>
                  )}

                  {profile?.hourly_rate && (
                    <Badge 
                      bg="gray.100" 
                      color="#4A5568" 
                      fontSize="10.5px" 
                      fontWeight="500" 
                      px={2.5} 
                      py={0.5} 
                      borderRadius="full"
                    >
                      ₹{Number(profile.hourly_rate).toLocaleString()} / session
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            {/* Quick Action Header Buttons */}
            <HStack spacing={3} alignSelf={{ base: "start", sm: "center" }} wrap="wrap">
              <Button 
                as={NextLink} 
                href="/dashboard/therapist/schedule" 
                leftIcon={<FiCalendar />} 
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.2)"
                color="#263A33"
                borderRadius="full" 
                h="40px"
                px={5}
                fontSize="13px"
                fontWeight="500"
                _hover={{ bg: "rgba(169, 203, 183, 0.1)", borderColor: "#56756D" }}
                transition="all 0.2s"
              >
                My Schedule
              </Button>

              <Button 
                as={NextLink}
                href="/conference/lobby"
                leftIcon={<FiVideo />}
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                h="40px"
                px={6} 
                fontSize="13px"
                fontWeight="600"
                boxShadow="0 4px 12px rgba(86, 117, 109, 0.2)"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(38, 58, 51, 0.25)" }}
                transition="all 0.2s"
              >
                Launch Sanctuary Lounge
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* ⚠️ Application / Verification Notice if unverified */}
        {profileLoaded && profile?.is_verified === false && (
          <Box 
            mb={6} 
            p={4} 
            borderRadius="xl" 
            bg="#FFF8E7" 
            border="1px solid" 
            borderColor="#FFE0B2" 
            shadow="xs"
          >
            <Flex direction={{ base: "column", md: "row" }} gap={3} justify="space-between" align={{ base: "start", md: "center" }}>
              <HStack align="center" spacing={3}>
                <Circle size="30px" bg="#FFE0B2" color="#E65100">
                  <Icon as={FiAlertCircle} boxSize="16px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="13px" fontWeight="700" color="#B78103">Verification in Progress</Text>
                  <Text color="#5A6E65" fontSize="12.5px">
                    Submit your credentials to finalize verification and unlock your public directory listing.
                  </Text>
                </VStack>
              </HStack>
              <Button 
                as={NextLink} 
                href="/therapist-apply" 
                size="sm" 
                colorScheme="orange" 
                borderRadius="full" 
                px={5}
                h="34px"
                fontSize="12.5px"
              >
                Submit Application
              </Button>
            </Flex>
          </Box>
        )}

        {/* 📊 2. Key Practice Metrics Row */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
          <StatCard 
            label="Active Caseload" 
            value={stats.clients} 
            help="Active treatment relationships" 
            icon={FiUsers} 
            color="#56756D" 
            href="/dashboard/therapist/clients"
            badge={stats.clients > 0 ? `${stats.clients} Active` : null}
          />
          <StatCard 
            label="Today's Sessions" 
            value={stats.appointments} 
            help={stats.appointments > 0 ? "Care sessions scheduled" : "No sessions today"} 
            icon={FiCalendar} 
            color="#C9A960" 
            href="/dashboard/therapist/schedule" 
            badge={stats.appointments > 0 ? "Scheduled" : "Clear"}
          />
          <StatCard 
            label="Client Inquiries" 
            value={stats.requests} 
            help={stats.requests > 0 ? "Awaiting your response" : "Inbox up to date"} 
            icon={FiInbox} 
            color={stats.requests > 0 ? "#E07A5F" : "#56756D"} 
            href="/dashboard/therapist/booking-requests" 
            badge={stats.requests > 0 ? "Action required" : "Zero pending"}
          />
          <StatCard 
            label="Supervision Tier" 
            value={hasSupervisorTier ? "Supervisor" : "Supervisee"} 
            help={hasSupervisorTier ? "Mentorship & oversight" : "Professional growth track"} 
            icon={FiAward} 
            color="#56756D" 
            href={hasSupervisorTier ? "/dashboard/therapist/supervision" : "/dashboard/therapist/supervisee"} 
            badge={hasSupervisorTier ? "Senior Tier" : "Eligible"}
          />
        </SimpleGrid>

        {/* 🏛️ 3. Main Dashboard Workspace Grid */}
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6}>
          
          {/* 📅 LEFT COLUMN: Care Flow & Patient Management (8 Cols) */}
          <Box gridColumn={{ lg: "span 8" }}>
            <VStack align="stretch" spacing={6}>
              
              {/* Card 1: Today's Clinical Care Flow & Sessions */}
              <Box 
                bg="white" 
                p={{ base: 5, md: 6 }} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)" 
                boxShadow="0 2px 12px rgba(38, 58, 51, 0.03)"
              >
                <Flex justify="space-between" align="center" mb={5}>
                  <HStack spacing={3}>
                    <Circle size="34px" bg="rgba(169, 203, 183, 0.12)" color="#56756D">
                      <Icon as={FiCalendar} boxSize="16px" />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Heading 
                        fontSize="17px" 
                        fontWeight="600" 
                        color="#263A33" 
                        fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                      >
                        Today's Clinical Agenda
                      </Heading>
                      <Text fontSize="12px" color="#5A6E65">
                        Integrated video sessions and instant documentation.
                      </Text>
                    </VStack>
                  </HStack>

                  <Button
                    as={NextLink}
                    href="/dashboard/therapist/schedule"
                    variant="ghost"
                    size="sm"
                    fontSize="12.5px"
                    color="#56756D"
                    _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                    rightIcon={<FiChevronRight />}
                  >
                    Full Calendar
                  </Button>
                </Flex>

                <VStack align="stretch" spacing={3}>
                  {upcoming.length > 0 ? (
                    upcoming.map((appt) => {
                      const startTime = appt.start_time ? new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
                      const endTime = appt.end_time ? new Date(appt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      return (
                        <Flex 
                          key={appt.id} 
                          direction={{ base: "column", sm: "row" }}
                          align={{ base: "start", sm: "center" }} 
                          justify="space-between"
                          p={4} 
                          bg="#FBFDFC" 
                          borderRadius="xl" 
                          border="1px solid"
                          borderColor="rgba(86, 117, 109, 0.12)"
                          transition="all 0.2s ease" 
                          _hover={{ 
                            bg: "white", 
                            borderColor: "rgba(86, 117, 109, 0.3)", 
                            boxShadow: "0 4px 12px rgba(38, 58, 51, 0.05)" 
                          }}
                          gap={3}
                        >
                          <HStack spacing={3}>
                            <Avatar size="sm" name={appt.client_name || "Client"} bg="#56756D" color="white" />
                            <VStack align="start" spacing={0}>
                              <HStack spacing={2}>
                                <Text fontWeight="600" fontSize="14px" color="#263A33">
                                  {appt.client_name || "Client"}
                                </Text>
                                <Badge fontSize="10px" colorScheme="teal" borderRadius="full" px={2}>
                                  Confirmed
                                </Badge>
                              </HStack>
                              <HStack spacing={2} color="#5A6E65" fontSize="12px">
                                <Icon as={FiClock} boxSize="12px" />
                                <Text>{startTime}{endTime ? ` – ${endTime}` : ''}</Text>
                                <Text color="gray.300">•</Text>
                                <Text color="#56756D" fontWeight="500">Virtual Sanctuary</Text>
                              </HStack>
                            </VStack>
                          </HStack>

                          <HStack spacing={2} alignSelf={{ base: "stretch", sm: "auto" }}>
                            <Button 
                              as={NextLink} 
                              href="/dashboard/therapist/notes" 
                              variant="ghost" 
                              size="sm" 
                              h="34px"
                              fontSize="12.5px"
                              color="#56756D"
                              borderRadius="full"
                              _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                            >
                              Notes
                            </Button>
                            <Button 
                              as={NextLink} 
                              href={`/conference/MLC_${appt.id}`} 
                              size="sm" 
                              bg="#56756D" 
                              color="white" 
                              borderRadius="full" 
                              px={5}
                              h="34px"
                              fontSize="12.5px"
                              fontWeight="600"
                              leftIcon={<FiVideo />}
                              _hover={{ bg: "#263A33" }}
                              boxShadow="sm"
                            >
                              Enter Session
                            </Button>
                          </HStack>
                        </Flex>
                      );
                    })
                  ) : (
                    <Box 
                      py={8} 
                      px={4}
                      textAlign="center" 
                      borderRadius="xl" 
                      border="1px dashed" 
                      borderColor="rgba(86, 117, 109, 0.2)"
                      bg="#FAFBFB"
                    >
                      <Circle size="42px" bg="rgba(169, 203, 183, 0.15)" color="#56756D" mx="auto" mb={2.5}>
                        <Icon as={FiCompass} boxSize="20px" />
                      </Circle>
                      <Heading 
                        fontSize="15px" 
                        fontWeight="600" 
                        color="#263A33" 
                        fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                        mb={1}
                      >
                        Your clinical agenda is serene today
                      </Heading>
                      <Text fontSize="12.5px" color="#5A6E65" maxW="380px" mx="auto" mb={4}>
                        No scheduled client sessions today. Use this space for treatment formulation, reviewing notes, or self-care.
                      </Text>
                      <Button 
                        as={NextLink} 
                        href="/dashboard/therapist/schedule" 
                        size="sm" 
                        variant="outline" 
                        borderColor="rgba(86, 117, 109, 0.2)"
                        color="#263A33"
                        borderRadius="full" 
                        px={5}
                        h="34px"
                        fontSize="12px"
                        _hover={{ bg: "rgba(169, 203, 183, 0.08)" }}
                      >
                        Review Weekly Schedule
                      </Button>
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* Card 2: Clinical Blueprints & Care Suite */}
              <Box 
                bg="white" 
                p={{ base: 5, md: 6 }} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)" 
                boxShadow="0 2px 12px rgba(38, 58, 51, 0.03)"
              >
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={3}>
                    <Circle size="34px" bg="rgba(169, 203, 183, 0.12)" color="#56756D">
                      <Icon as={FiFileText} boxSize="16px" />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Heading 
                        fontSize="17px" 
                        fontWeight="600" 
                        color="#263A33" 
                        fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                      >
                        Clinical Blueprints & Care Flow
                      </Heading>
                      <Text fontSize="12px" color="#5A6E65">
                        Streamlined clinical documentation from first screening to discharge.
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge 
                    bg="rgba(169, 203, 183, 0.12)" 
                    color="#263A33" 
                    fontSize="10px" 
                    fontWeight="700" 
                    px={2.5} 
                    py={0.5} 
                    borderRadius="full"
                  >
                    HIPAA · DPDP COMPLIANT
                  </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={4}>
                  <Box 
                    p={4} 
                    borderRadius="xl" 
                    bg="#F7FAF8" 
                    border="1px solid" 
                    borderColor="rgba(169, 203, 183, 0.18)"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: "#56756D", transform: "translateY(-2px)" }}
                    onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/notes"))}
                  >
                    <HStack spacing={2.5} mb={1.5}>
                      <Icon as={FiEdit3} color="#56756D" boxSize="16px" />
                      <Text fontSize="13.5px" fontWeight="600" color="#263A33">Session Blueprints</Text>
                    </HStack>
                    <Text fontSize="12px" color="#5A6E65">
                      Fast, standardized clinical notes, SOAP formatting, and treatment tracking.
                    </Text>
                  </Box>

                  <Box 
                    p={4} 
                    borderRadius="xl" 
                    bg="#F7FAF8" 
                    border="1px solid" 
                    borderColor="rgba(169, 203, 183, 0.18)"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: "#56756D", transform: "translateY(-2px)" }}
                    onClick={() => requireBasicAccess(() => (window.location.href = "/dashboard/therapist/care"))}
                  >
                    <HStack spacing={2.5} mb={1.5}>
                      <Icon as={FiShield} color="#56756D" boxSize="16px" />
                      <Text fontSize="13.5px" fontWeight="600" color="#263A33">Care Space & Safety</Text>
                    </HStack>
                    <Text fontSize="12px" color="#5A6E65">
                      Collaborative safety planning, worksheets, and emergency escalation guides.
                    </Text>
                  </Box>
                </SimpleGrid>

                <HStack p={3} bg="rgba(169, 203, 183, 0.08)" borderRadius="lg" spacing={2.5}>
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" flexShrink={0} />
                  <Text fontSize="12px" color="#4A5568">
                    All client interactions and blueprints are isolated by relationship ID, ensuring strict confidentiality.
                  </Text>
                </HStack>
              </Box>

              {/* Card 3: Practitioner Sanctuary & Boundary Guard */}
              <Box 
                bgGradient="linear(to-br, #263A33, #355345)" 
                p={{ base: 5, md: 6 }} 
                borderRadius="2xl" 
                color="white" 
                boxShadow="0 8px 24px rgba(38, 58, 51, 0.15)"
                position="relative"
                overflow="hidden"
              >
                <Box position="absolute" top="-20px" right="-20px" opacity={0.06}>
                  <Icon as={FiShield} boxSize="160px" />
                </Box>
                
                <HStack spacing={2} mb={2}>
                  <Circle size="24px" bg="whiteAlpha.200">
                    <Icon as={FiHeart} boxSize="12px" color="#A9CBB7" />
                  </Circle>
                  <Text 
                    fontSize="10.5px" 
                    fontWeight="700" 
                    letterSpacing="0.12em" 
                    color="#A9CBB7" 
                    textTransform="uppercase"
                  >
                    PRACTITIONER WELLBEING & BOUNDARIES
                  </Text>
                </HStack>

                <Heading 
                  fontSize="20px" 
                  fontWeight="500" 
                  fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                  color="white"
                  mb={2}
                >
                  Protecting Your Time and Emotional Space
                </Heading>

                <Text fontSize="13px" color="whiteAlpha.800" maxW="540px" mb={5} lineHeight="1.6">
                  MLC protects your professional boundaries: in-portal encrypted communications mean you never have to exchange personal phone numbers, and built-in scheduling buffers prevent clinical burnout.
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} pt={1}>
                  <HStack p={2.5} bg="whiteAlpha.100" borderRadius="lg" spacing={2}>
                    <Icon as={FiCheckCircle} color="#A9CBB7" boxSize="13px" />
                    <Text fontSize="11.5px" fontWeight="500" color="whiteAlpha.900">Encrypted Messaging</Text>
                  </HStack>
                  <HStack p={2.5} bg="whiteAlpha.100" borderRadius="lg" spacing={2}>
                    <Icon as={FiCheckCircle} color="#A9CBB7" boxSize="13px" />
                    <Text fontSize="11.5px" fontWeight="500" color="whiteAlpha.900">Automated Buffers</Text>
                  </HStack>
                  <HStack p={2.5} bg="whiteAlpha.100" borderRadius="lg" spacing={2}>
                    <Icon as={FiCheckCircle} color="#A9CBB7" boxSize="13px" />
                    <Text fontSize="11.5px" fontWeight="500" color="whiteAlpha.900">Burnout Safeguards</Text>
                  </HStack>
                </SimpleGrid>
              </Box>

            </VStack>
          </Box>

          {/* 🛠️ RIGHT COLUMN: Quick Toolset & Professional Profile (4 Cols) */}
          <Box gridColumn={{ lg: "span 4" }}>
            <VStack align="stretch" spacing={6}>

              {/* Side Card 1: Clinical Ecosystem Shortcuts */}
              <Box 
                bg="white" 
                p={5} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)" 
                boxShadow="0 2px 12px rgba(38, 58, 51, 0.03)"
              >
                <HStack justify="space-between" mb={3}>
                  <Heading 
                    fontSize="16px" 
                    fontWeight="600" 
                    color="#263A33" 
                    fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                  >
                    Clinical Ecosystem
                  </Heading>
                  <Badge 
                    fontSize="9.5px" 
                    fontWeight="700" 
                    colorScheme="teal" 
                    variant="subtle" 
                    borderRadius="full"
                  >
                    SHORTCUTS
                  </Badge>
                </HStack>

                <VStack spacing={2} align="stretch">
                  <ActionTile 
                    icon={FiUsers} 
                    label="Client Caseload" 
                    sublabel="Active files, history & plans" 
                    href="/dashboard/therapist/clients" 
                  />
                  <ActionTile 
                    icon={FiFileText} 
                    label="Clinical Notes" 
                    sublabel="Create or edit SOAP entries" 
                    href="/dashboard/therapist/notes" 
                  />
                  <ActionTile 
                    icon={FiClock} 
                    label="Availability & Hours" 
                    sublabel="Manage buffers & weekly calendar" 
                    href="/dashboard/therapist/availability" 
                  />
                  <ActionTile 
                    icon={FiDollarSign} 
                    label="Practice Earnings" 
                    sublabel="Session revenue & payouts" 
                    href="/dashboard/therapist/earnings" 
                  />
                  <ActionTile 
                    icon={FiActivity} 
                    label="Billing Analytics" 
                    sublabel="Practice trends & forecasts" 
                    isSoon={true} 
                  />
                </VStack>
              </Box>

              {/* Side Card 2: Professional Profile Snapshot */}
              <Box 
                bg="#F7FAF8" 
                p={5} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="rgba(169, 203, 183, 0.25)"
              >
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FiAward} color="#C9A960" boxSize="17px" />
                    <Heading 
                      fontSize="14.5px" 
                      fontWeight="600" 
                      color="#263A33" 
                      fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                    >
                      Professional Profile
                    </Heading>
                  </HStack>
                  <Badge 
                    bg={profile?.is_verified ? "green.100" : "orange.100"} 
                    color={profile?.is_verified ? "green.800" : "orange.800"} 
                    fontSize="10px" 
                    fontWeight="700"
                    borderRadius="full"
                    px={2}
                  >
                    {profile?.is_verified ? "VERIFIED" : "PENDING"}
                  </Badge>
                </HStack>

                <VStack align="start" spacing={1.5} mb={3.5}>
                  <Text fontSize="13px" fontWeight="600" color="#263A33">
                    {profile?.name || displayName}
                  </Text>
                  <Text fontSize="12px" color="#5A6E65">
                    {profile?.highest_qualification || "Licensed Clinical Psychologist"}
                  </Text>
                  <Text fontSize="11.5px" color="#5A6E65">
                    📍 {profile?.city || "Mumbai"}, {profile?.state || "India"}
                  </Text>
                  {profile?.years_experience && (
                    <Text fontSize="11.5px" color="#56756D" fontWeight="500">
                      🌿 {profile.years_experience} Years Clinical Experience
                    </Text>
                  )}
                </VStack>

                <Button 
                  as={NextLink} 
                  href="/dashboard/therapist/profile" 
                  size="sm" 
                  variant="outline" 
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33" 
                  borderRadius="full" 
                  w="full" 
                  h="34px"
                  fontSize="12.5px"
                  _hover={{ bg: "white", borderColor: "#56756D" }}
                >
                  Edit Profile & Rates
                </Button>
              </Box>

              {/* Side Card 3: Supervision Hub / Community */}
              <Box 
                bg="white" 
                p={5} 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)" 
                boxShadow="0 2px 12px rgba(38, 58, 51, 0.03)"
              >
                <HStack spacing={2} mb={2}>
                  <Circle size="24px" bg="rgba(201, 169, 96, 0.15)">
                    <Icon as={FiAward} color="#C9A960" boxSize="13px" />
                  </Circle>
                  <Text 
                    fontSize="11px" 
                    fontWeight="700" 
                    color="#56756D" 
                    letterSpacing="0.1em" 
                    textTransform="uppercase"
                  >
                    SUPERVISION SUITE
                  </Text>
                </HStack>
                <Heading 
                  fontSize="15px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
                  mb={1.5}
                >
                  {hasSupervisorTier ? "Clinical Mentorship & Oversight" : "Supervisee Guidance"}
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" mb={4} lineHeight="1.5">
                  {hasSupervisorTier 
                    ? "Mentor the next generation of clinicians with structured session logs and peer reviews."
                    : "Access clinical supervision, case consultation, and accredited guidance."}
                </Text>
                <Button 
                  as={NextLink} 
                  href={hasSupervisorTier ? "/dashboard/therapist/supervision" : "/dashboard/therapist/supervisee"} 
                  size="sm" 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  w="full" 
                  h="36px"
                  fontSize="12.5px"
                  fontWeight="600"
                  _hover={{ bg: "#263A33" }}
                >
                  {hasSupervisorTier ? "Enter Supervision Hub" : "View Supervisee Suite"}
                </Button>
              </Box>

              {/* Side Card 4: Feedback & Help */}
              <Box 
                p={4} 
                bg="#F7FAF8" 
                borderRadius="xl" 
                border="1px dashed" 
                borderColor="rgba(86, 117, 109, 0.2)"
              >
                <HStack spacing={2} mb={1.5}>
                  <Icon as={FiMessageSquare} color="#56756D" boxSize="14px" />
                  <Text fontSize="12px" fontWeight="700" color="#263A33">
                    Shape the Workspace
                  </Text>
                </HStack>
                <Text fontSize="11.5px" color="#5A6E65" mb={3}>
                  Have an idea to streamline your clinical practice? Let us know.
                </Text>
                <FeedbackWidget variant="inline" />
              </Box>

            </VStack>
          </Box>

        </SimpleGrid>
      </Container>
      
      <TherapistGatedGateway 
        isOpen={gateModal.isOpen} 
        onClose={gateModal.onClose} 
        title="Activate MLC Pro"
        contextLabel="MLC Pro is live now. Subscribe to unlock scheduling, bookings, and your public therapist profile."
      />
    </Box>
  );
}
