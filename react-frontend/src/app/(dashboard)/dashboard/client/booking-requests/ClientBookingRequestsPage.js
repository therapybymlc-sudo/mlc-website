"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  useToast,
  Spinner,
  Center,
  Flex,
  Icon,
  Circle,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiCalendar, FiClock, FiInbox, FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { schedulingApi } from "../../../../../api/scheduling";
import { getSchedulingErrorMessage } from "../../../../../utils/schedulingErrors";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function ClientBookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listClientBookingRequests();
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

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await schedulingApi.cancelClientBookingRequest(id, "Cancelled from my dashboard");
      toast({ title: "Request cancelled", status: "success" });
      await loadRequests();
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: getSchedulingErrorMessage(err, "Only pending requests can be cancelled here. For confirmed sessions, use Appointments."),
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

  const pending = requests.filter((r) => r.status === "pending");

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
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiInbox} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg={pending.length > 0 ? "#F59E0B" : "#10B981"} 
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
                  Client Portal · Appointments
                </Badge>
                {pending.length > 0 && (
                  <Badge 
                    bg="#FEF3C7" 
                    color="#92400E" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    Awaiting Confirmation
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
                Track pending session requests and therapist confirmations in real time.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Book Action */}
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
                <Circle size="28px" bg={pending.length > 0 ? "rgba(245, 158, 11, 0.14)" : "rgba(86, 117, 109, 0.1)"} color={pending.length > 0 ? "#D97706" : "#56756D"}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    PENDING
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {pending.length}
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
                    TOTAL
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {requests.length}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button 
              as={NextLink}
              href="/therapists/discovery"
              bg="#56756D" 
              color="white" 
              borderRadius="full" 
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5} 
              leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
              _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
              flexShrink={0}
              boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
            >
              Book New Session
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* 🏛️ Main Content Area */}
      {requests.length === 0 ? (
        /* Empty State Card */
        <Box 
          bg="white" 
          p={{ base: 8, md: 12 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          textAlign="center"
        >
          <VStack spacing={4} maxW="420px" mx="auto">
            <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiInbox} boxSize="22px" />
            </Circle>
            
            <VStack spacing={1}>
              <Heading 
                fontSize="17px" 
                fontWeight="600" 
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                No Active Booking Requests
              </Heading>
              <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                When you schedule a session with a therapist, your pending confirmation and therapist response notes will appear here.
              </Text>
            </VStack>

            <Button
              as={NextLink}
              href="/therapists/discovery"
              bg="#263A33"
              color="white"
              borderRadius="full"
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={6}
              rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
              _hover={{ bg: "#182722", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 4px 12px rgba(38, 58, 51, 0.12)"
              mt={2}
            >
              Meet Our Clinicians
            </Button>
          </VStack>
        </Box>
      ) : (
        /* Requests List */
        <VStack spacing={4} align="stretch">
          {requests.map((req) => {
            const isPending = req.status === "pending";
            const isConfirmed = req.status === "confirmed";
            const isPaymentFailed = req.status === "payment_failed";
            const isPaymentPending = req.status === "payment_pending";
            const isCancelled = req.status === "cancelled" || req.status === "expired" || req.status === "cancelled_by_client" || req.status === "cancelled_by_therapist";

            return (
              <Box
                key={req.id}
                p={{ base: 4, md: 5 }}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.14)"
                bg="white"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                transition="all 0.2s"
                _hover={{ borderColor: "rgba(86, 117, 109, 0.25)" }}
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
                      name={req.therapist_display_name || "Therapist"} 
                      src={req.therapist_profile_image}
                      border="1.5px solid white"
                      boxShadow="xs"
                    />
                    <VStack align="start" spacing={0}>
                      <Text 
                        fontSize="14px" 
                        fontWeight="600" 
                        color="#263A33"
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                      >
                        {req.therapist_display_name || `Therapist #${req.therapist}`}
                      </Text>
                      <Text fontSize="11.5px" color="#718096">
                        Virtual 1-on-1 Consultation
                      </Text>
                    </VStack>
                  </HStack>

                  <Badge 
                    bg={
                      isConfirmed 
                        ? "rgba(16, 185, 129, 0.12)" 
                        : isPaymentFailed
                        ? "rgba(239, 68, 68, 0.12)"
                        : isPending || isPaymentPending
                        ? "rgba(245, 158, 11, 0.12)" 
                        : "rgba(86, 117, 109, 0.1)"
                    }
                    color={
                      isConfirmed 
                        ? "#047857" 
                        : isPaymentFailed
                        ? "#DC2626"
                        : isPending || isPaymentPending
                        ? "#B45309" 
                        : "#4A5568"
                    }
                    border="1px solid"
                    borderColor={
                      isConfirmed 
                        ? "rgba(16, 185, 129, 0.25)" 
                        : isPaymentFailed
                        ? "rgba(239, 68, 68, 0.25)"
                        : isPending || isPaymentPending
                        ? "rgba(245, 158, 11, 0.25)" 
                        : "rgba(86, 117, 109, 0.18)"
                    }
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.04em"
                  >
                    {(req.status_label || req.status || "Pending").toUpperCase()}
                  </Badge>
                </Flex>

                {req.slot_start_time && (
                  <HStack spacing={2} mb={2.5} color="#5A6E65">
                    <Icon as={FiClock} boxSize="13px" color="#56756D" />
                    <Text fontSize="12.5px" fontWeight="500">
                      {new Date(req.slot_start_time).toLocaleString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </HStack>
                )}

                {req.message_from_client && (
                  <Box 
                    p={3} 
                    bg="rgba(250, 248, 245, 0.75)" 
                    borderRadius="xl" 
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.08)"
                    mb={2.5}
                  >
                    <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" mb={0.5}>
                      Your Note
                    </Text>
                    <Text fontSize="12.5px" color="#263A33" lineHeight="1.4">
                      {req.message_from_client}
                    </Text>
                  </Box>
                )}

                {req.therapist_response_note && (
                  <Box 
                    p={3} 
                    bg="rgba(169, 203, 183, 0.12)" 
                    borderRadius="xl" 
                    border="1px solid"
                    borderColor="rgba(16, 185, 129, 0.15)"
                    mb={2.5}
                  >
                    <Text fontSize="11px" fontWeight="700" color="#047857" textTransform="uppercase" mb={0.5}>
                      From Therapist
                    </Text>
                    <Text fontSize="12.5px" color="#263A33" lineHeight="1.4">
                      {req.therapist_response_note}
                    </Text>
                  </Box>
                )}

                <HStack justify="space-between" pt={1} flexWrap="wrap" gap={2}>
                  {isPending && (
                    <Button
                      size="sm"
                      height="32px"
                      variant="outline"
                      borderColor="rgba(239, 68, 68, 0.3)"
                      color="#B91C1C"
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="600"
                      px={4}
                      onClick={() => void handleCancel(req.id)}
                      _hover={{ bg: "rgba(239, 68, 68, 0.06)" }}
                    >
                      Cancel Request
                    </Button>
                  )}

                  {isConfirmed && (
                    <Button 
                      as={NextLink} 
                      href="/dashboard/client/appointments" 
                      size="sm"
                      height="32px"
                      bg="#263A33"
                      color="white"
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="600"
                      px={4}
                      _hover={{ bg: "#182722" }}
                    >
                      View in Appointments ➔
                    </Button>
                  )}

                  {isPaymentFailed && (
                    <Button
                      as={NextLink}
                      href="/therapists/discovery"
                      size="sm"
                      height="32px"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      fontSize="12px"
                      fontWeight="600"
                      px={4}
                      _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                    >
                      Re-book Session ➔
                    </Button>
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>
      )}

      {pending.length > 0 && (
        <Text fontSize="12px" color="#718096" mt={4} textAlign="center">
          You can cancel a pending request anytime before the therapist accepts.
        </Text>
      )}
    </Box>
  );
}
