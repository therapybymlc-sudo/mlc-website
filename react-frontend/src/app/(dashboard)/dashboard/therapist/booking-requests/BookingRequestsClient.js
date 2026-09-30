"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Heading,
  Badge,
  useToast,
  Spinner,
  Center,
  Flex,
  Icon,
  Circle,
  Avatar,
  Grid,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  FiInbox,
  FiClock,
  FiCheck,
  FiX,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { schedulingApi } from "../../../../../api/scheduling";
import { getSchedulingErrorMessage } from "../../../../../utils/schedulingErrors";
import SubscriptionWall from "../../../../../components/SubscriptionWall";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function BookingRequestsClient() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});
  const toast = useToast();
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listTherapistBookingRequests();
      setRequests(normalizeList(data));
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load booking requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleConfirm = async (id) => {
    if (!requireBasicAccess()) return;
    try {
      await schedulingApi.confirmBookingRequest(id);
      toast({ 
        title: "Request confirmed", 
        description: "The session is scheduled on your calendar.",
        status: "success" 
      });
      await loadRequests();
    } catch (err) {
      toast({
        title: "Could not confirm",
        description: getSchedulingErrorMessage(err, "Try again."),
        status: "error",
      });
    }
  };

  const handleDecline = async (id) => {
    if (!requireBasicAccess()) return;
    try {
      const note = noteDrafts[id] || "";
      await schedulingApi.declineBookingRequest(id, note);
      toast({ title: "Request declined", status: "info" });
      await loadRequests();
    } catch (err) {
      toast({
        title: "Could not decline",
        description: getSchedulingErrorMessage(err, "Try again."),
        status: "error",
      });
    }
  };

  const handleCancel = async (id) => {
    if (!requireBasicAccess()) return;
    if (!window.confirm("Cancel this booking request? The slot will be released for other clients.")) return;
    try {
      await schedulingApi.cancelTherapistBookingRequest(
        id,
        noteDrafts[id] || "Cancelled from booking requests"
      );
      toast({ title: "Request cancelled", status: "success" });
      await loadRequests();
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: getSchedulingErrorMessage(err, "Try again."),
        status: "error",
      });
    }
  };

  if (loading) {
    return (
      <Center minH="40vh">
        <Spinner size="lg" color="#56756D" />
      </Center>
    );
  }

  if (error) {
    return (
      <VStack spacing={4} align="stretch" py={8} fontFamily="'Inter', var(--font-inter), sans-serif">
        <Text color="red.600" fontSize="14px">{error}</Text>
        <Button 
          onClick={() => void loadRequests()}
          bg="#56756D"
          color="white"
          borderRadius="full"
          size="sm"
          w="fit-content"
          _hover={{ bg: "#263A33" }}
        >
          Retry
        </Button>
      </VStack>
    );
  }

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const otherRequests = requests.filter((req) => req.status !== "pending");

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
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiInbox} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg={pendingRequests.length > 0 ? "#F59E0B" : "#10B981"} 
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
                  Clinical Practice · Bookings
                </Badge>
                {pendingRequests.length > 0 && (
                  <Badge 
                    bg="#FEF3C7" 
                    color="#92400E" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    Action Needed
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
                Booking Requests
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Confirm, decline, or reschedule incoming client appointments with one click.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Manage Availability CTA */}
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
                <Circle size="28px" bg={pendingRequests.length > 0 ? "rgba(245, 158, 11, 0.14)" : "rgba(86, 117, 109, 0.1)"} color={pendingRequests.length > 0 ? "#D97706" : "#56756D"}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    PENDING
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {pendingRequests.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiCheckCircle} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    RESOLVED
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {otherRequests.length}
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
              px={6}
              whiteSpace="nowrap"
              leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              flexShrink={0}
            >
              Manage Availability
            </Button>
          </HStack>
        </Flex>
      </Box>

      {!hasBasicAccess && (
        <Box mb={6}>
          <SubscriptionWall
            tier="basic"
            featureName="Booking request management"
            hasAccess={false}
            onUpgrade={() => requireBasicAccess()}
            compact
          />
        </Box>
      )}

      {/* ⚖️ 2. 7:5 BALANCED BENTO GRID */}
      <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start">
        {/* Left Column (7fr): Pending Queue & Policy */}
        <VStack align="stretch" spacing={5}>
          {/* Card 1: Pending Queue */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <HStack justify="space-between" mb={4} align="center">
              <HStack spacing={2}>
                <Text 
                  fontWeight="600" 
                  color="#263A33" 
                  fontSize="15px" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Pending Requests
                </Text>
                <Badge
                  bg={pendingRequests.length > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(86, 117, 109, 0.1)"}
                  color={pendingRequests.length > 0 ? "#B45309" : "#56756D"}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10.5px"
                  fontWeight="700"
                >
                  {pendingRequests.length}
                </Badge>
              </HStack>
              <Text fontSize="12px" color="#718096">
                Requires action
              </Text>
            </HStack>

            {pendingRequests.length === 0 ? (
              <VStack spacing={3.5} py={{ base: 4, md: 5 }} maxW="420px" mx="auto" textAlign="center">
                <Circle size="48px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                  <Icon as={FiCheckCircle} boxSize="22px" />
                </Circle>
                <VStack spacing={1}>
                  <Text 
                    fontSize="15.5px" 
                    fontWeight="600" 
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    letterSpacing="-0.01em"
                  >
                    All Caught Up
                  </Text>
                  <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                    No pending booking requests right now. New requests will appear here for your one-click approval.
                  </Text>
                </VStack>

                <HStack spacing={2.5} pt={2} wrap="wrap" justify="center">
                  <Button
                    as={NextLink}
                    href="/dashboard/therapist/schedule"
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    height="34px"
                    fontSize="12px"
                    fontWeight="600"
                    px={4}
                    leftIcon={<Icon as={FiCalendar} boxSize="12px" color="#56756D" />}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    View Schedule
                  </Button>
                  <Button
                    as={NextLink}
                    href="/dashboard/therapist/availability"
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    height="34px"
                    fontSize="12px"
                    fontWeight="600"
                    px={4}
                    leftIcon={<Icon as={FiClock} boxSize="12px" color="#56756D" />}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Working Hours
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={3.5} align="stretch">
                {pendingRequests.map((req) => (
                  <Box
                    key={req.id}
                    p={{ base: 4, md: 4.5 }}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.12)"
                    bg="rgba(250, 248, 245, 0.7)"
                    transition="all 0.2s"
                    _hover={{ borderColor: "rgba(86, 117, 109, 0.25)", bg: "rgba(250, 248, 245, 0.95)" }}
                  >
                    <Flex 
                      direction={{ base: "column", sm: "row" }} 
                      justify="space-between" 
                      align={{ base: "start", sm: "center" }}
                      gap={3}
                      mb={3}
                    >
                      <HStack spacing={3}>
                        <Avatar 
                          size="sm" 
                          name={req.client_display_name || `Client #${req.client}`} 
                          bg="#E2ECE6"
                          color="#263A33"
                          fontWeight="600"
                        />
                        <VStack align="start" spacing={0}>
                          <Text 
                            fontSize="14px" 
                            fontWeight="600" 
                            color="#263A33"
                          >
                            {req.client_display_name || `Client #${req.client}`}
                          </Text>
                          <Text fontSize="11.5px" color="#718096">
                            Virtual 1-on-1 Session Request
                          </Text>
                        </VStack>
                      </HStack>

                      <Badge 
                        bg="rgba(245, 158, 11, 0.12)"
                        color="#B45309"
                        border="1px solid rgba(245, 158, 11, 0.25)"
                        borderRadius="full" 
                        px={2.5} 
                        py={0.5}
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="0.04em"
                      >
                        {(req.status_label || "Pending").toUpperCase()}
                      </Badge>
                    </Flex>

                    {req.slot_start_time && (
                      <HStack spacing={2} mb={3} color="#5A6E65">
                        <Icon as={FiClock} boxSize="13px" color="#56756D" />
                        <Text fontSize="12.5px" fontWeight="500">
                          {new Date(req.slot_start_time).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {req.slot_end_time
                            ? ` – ${new Date(req.slot_end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : null}
                        </Text>
                      </HStack>
                    )}

                    {req.message_from_client && (
                      <Box 
                        p={3} 
                        bg="rgba(250, 248, 245, 0.85)" 
                        borderRadius="xl" 
                        border="1px solid"
                        borderColor="rgba(86, 117, 109, 0.1)"
                        mb={3}
                      >
                        <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" mb={0.5}>
                          Client&apos;s Intake Note
                        </Text>
                        <Text fontSize="12.5px" color="#263A33" lineHeight="1.45">
                          {req.message_from_client}
                        </Text>
                      </Box>
                    )}

                    <Textarea
                      size="sm"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="rgba(86, 117, 109, 0.18)"
                      placeholder="Optional response note to the client (shared on decline or reschedule)…"
                      value={noteDrafts[req.id] || ""}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      fontSize="12.5px"
                      mb={3}
                      _focus={{
                        borderColor: "#56756D",
                        boxShadow: "0 0 0 1px #56756D",
                      }}
                    />

                    <HStack flexWrap="wrap" gap={2}>
                      <Button
                        size="sm"
                        height="34px"
                        bg="#263A33"
                        color="white"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        px={4}
                        leftIcon={<Icon as={FiCheck} boxSize="12px" />}
                        _hover={{ bg: "#182722" }}
                        onClick={() => void handleConfirm(req.id)}
                      >
                        Confirm Session
                      </Button>
                      <Button
                        size="sm"
                        height="34px"
                        variant="outline"
                        borderColor="rgba(239, 68, 68, 0.3)"
                        color="#B91C1C"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        px={4}
                        leftIcon={<Icon as={FiX} boxSize="12px" />}
                        _hover={{ bg: "rgba(239, 68, 68, 0.06)" }}
                        onClick={() => void handleDecline(req.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        height="34px"
                        variant="ghost"
                        color="#718096"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="500"
                        px={3}
                        _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                        onClick={() => void handleCancel(req.id)}
                      >
                        Cancel Request
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          {/* Card 2: Clinical Booking Guidelines & Practice Card */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <HStack spacing={2} mb={3.5}>
              <Circle size="24px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiShield} boxSize="12px" />
              </Circle>
              <Text 
                fontWeight="600" 
                color="#263A33" 
                fontSize="14.5px" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Booking Policy & Practice
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.75)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" fontWeight="600" color="#263A33">
                  Automatic Slot Release
                </Text>
                <Text fontSize="11.5px" color="#5A6E65" mt={1} lineHeight="1.5">
                  Declining or cancelling a booking immediately frees the calendar slot for other clients.
                </Text>
              </Box>

              <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.75)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" fontWeight="600" color="#263A33">
                  Real-Time Sync
                </Text>
                <Text fontSize="11.5px" color="#5A6E65" mt={1} lineHeight="1.5">
                  Confirmed sessions instantly generate video links and notify the client through their portal.
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>

        {/* Right Column (5fr): Recent Updates & Guidance */}
        <VStack align="stretch" spacing={5}>
          {/* Recent History Card */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <HStack justify="space-between" mb={4} align="center">
              <Text 
                fontWeight="600" 
                color="#263A33" 
                fontSize="15px" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Recent Updates & History
              </Text>
              <Badge
                bg="rgba(86, 117, 109, 0.08)"
                color="#56756D"
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="10px"
                fontWeight="700"
              >
                {otherRequests.length}
              </Badge>
            </HStack>

            {otherRequests.length === 0 ? (
              <Box 
                p={4.5} 
                borderRadius="xl" 
                bg="rgba(250, 248, 245, 0.85)" 
                border="1px solid rgba(86, 117, 109, 0.1)"
                textAlign="center"
              >
                <Text color="#5A6E65" fontSize="12.5px" fontWeight="500">
                  No past request history recorded yet.
                </Text>
                <Text color="#718096" fontSize="11.5px" mt={1}>
                  Confirmed, declined, and expired requests will be archived here.
                </Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch" maxH="380px" overflowY="auto" pr={1}>
                {otherRequests.map((req) => {
                  const isConfirmed = req.status === "confirmed";
                  const isDeclined = req.status === "declined";
                  const isPaymentFailed = req.status === "payment_failed";

                  return (
                    <Box
                      key={req.id}
                      p={3.5}
                      borderRadius="xl"
                      border="1px solid rgba(86, 117, 109, 0.1)"
                      bg="rgba(250, 248, 245, 0.85)"
                    >
                      <Flex justify="space-between" align="center" mb={1} flexWrap="wrap" gap={2}>
                        <Text fontWeight="600" fontSize="13px" color="#263A33">
                          {req.client_display_name || `Client #${req.client}`}
                        </Text>
                        <Badge 
                          bg={
                            isConfirmed 
                              ? "rgba(16, 185, 129, 0.12)" 
                              : isPaymentFailed || isDeclined 
                              ? "rgba(239, 68, 68, 0.1)" 
                              : "rgba(86, 117, 109, 0.1)"
                          }
                          color={
                            isConfirmed 
                              ? "#047857" 
                              : isPaymentFailed || isDeclined 
                              ? "#DC2626" 
                              : "#4A5568"
                          }
                          fontSize="9.5px" 
                          fontWeight="700"
                          borderRadius="full"
                          px={2}
                          py={0.5}
                        >
                          {(req.status_label || req.status || "History").toUpperCase()}
                        </Badge>
                      </Flex>

                      {req.slot_start_time && (
                        <Text fontSize="11.5px" color="#5A6E65" mb={1}>
                          {new Date(req.slot_start_time).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      )}

                      {req.therapist_response_note && (
                        <Text fontSize="11.5px" color="#5A6E65" bg="white" p={2} borderRadius="md" mb={1} border="1px solid rgba(86, 117, 109, 0.08)">
                          <Text as="span" fontWeight="600" color="#263A33">Your Note: </Text>
                          {req.therapist_response_note}
                        </Text>
                      )}

                      {isConfirmed && (
                        <HStack spacing={1.5} pt={0.5}>
                          <Text fontSize="11.5px" color="#047857" fontWeight="500">
                            Session booked.
                          </Text>
                          <Button 
                            as={NextLink} 
                            href="/dashboard/therapist/appointments" 
                            variant="link" 
                            size="xs" 
                            color="#56756D"
                            fontWeight="600"
                            fontSize="11.5px"
                          >
                            Appointments ➔
                          </Button>
                        </HStack>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </VStack>
      </Grid>

      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to confirm, decline, and manage client booking requests."
      />
    </Box>
  );
}
