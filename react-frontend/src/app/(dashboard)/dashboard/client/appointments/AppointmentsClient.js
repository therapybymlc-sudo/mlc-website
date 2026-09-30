'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Button,
  useToast,
  Spinner,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stack,
  Avatar,
  Circle,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiVideo, FiCalendar, FiClock, FiCheckCircle, FiFileText, FiXCircle } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import NextLink from 'next/link';
import { useAuth } from "../../../../../context/AuthContext";

export default function AppointmentsClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated, isClient, clientProfile } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();

  const getPaymentMeta = (appt) => {
    const paid = appt.payment_status === "paid";
    if (paid) {
      return {
        label: "Paid",
        color: "#047857",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.25)",
        actionLabel: "View Invoice",
        actionHref: `/dashboard/client/invoice/${appt.id}`,
        actionDisabled: false,
      };
    }

    return {
      label: "Pending",
      color: "#B45309",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.25)",
      actionLabel: "Awaiting Payment Link",
      actionHref: "/dashboard/client/booking-requests",
      actionDisabled: true,
    };
  };

  const getStatusMeta = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "cancelled") {
      return {
        label: "Cancelled",
        bg: "rgba(239, 68, 68, 0.1)",
        color: "#B91C1C",
        border: "rgba(239, 68, 68, 0.25)",
      };
    }
    if (s === "completed") {
      return {
        label: "Completed",
        bg: "rgba(86, 117, 109, 0.12)",
        color: "#263A33",
        border: "rgba(86, 117, 109, 0.2)",
      };
    }
    return {
      label: "Confirmed",
      bg: "rgba(16, 185, 129, 0.12)",
      color: "#047857",
      border: "rgba(16, 185, 129, 0.25)",
    };
  };

  async function fetchAppointments() {
    if (!isAuthenticated || !isClient || !clientProfile) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiGet("client-appointments/");
      setAppointments(Array.isArray(res) ? res : res.results || []);
    } catch (err) {
      if (err.response?.status !== 403 && err.response?.status !== 404) {
        toast({ title: "Could not load appointments", status: "error" });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCancelAppointment = async () => {
    if (!cancellingAppt) return;
    try {
      setIsCancelling(true);
      await apiPost(`client-appointments/${cancellingAppt.id}/cancel/`, {
        cancellation_reason: "Cancelled by client",
        reopen_slot: true,
      });
      toast({
        title: "Session Cancelled",
        description: "Your session has been cancelled and the slot released.",
        status: "success",
      });
      onCancelClose();
      fetchAppointments();
    } catch (err) {
      toast({
        title: "Cancellation Failed",
        description: err.response?.data?.detail || "Could not cancel appointment.",
        status: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated && isClient && clientProfile) {
      fetchAppointments();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isClient, clientProfile]);

  if (!isMounted) return null;

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 Framed Header Card */}
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
          direction={{ base: "column", md: "row" }}
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCalendar} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(86, 117, 109, 0.12)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  textTransform="uppercase" 
                  letterSpacing="0.08em"
                >
                  Care Schedule
                </Badge>
              </HStack>
              <Heading 
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }} 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                lineHeight="1.25"
              >
                Your Sessions
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Manage your upcoming and past therapeutic appointments.
              </Text>
            </VStack>
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
            w={{ base: "full", md: "auto" }}
            flexShrink={0}
            whiteSpace="nowrap"
            boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
          >
            Book New Session
          </Button>
        </Flex>
      </Box>

        <Box 
          bg="white" 
          p={{ base: 4, md: 5 }} 
          borderRadius="2xl" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)"
        >
            {loading ? (
                <VStack py={16}><Spinner color="#56756D" /></VStack>
            ) : (
                <>
                {/* 💻 Desktop Table */}
                <Box display={{ base: "none", md: "block" }} overflowX="auto" w="full" minW="0">
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>Date & Time</Th>
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>Therapist</Th>
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>Format</Th>
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>Status</Th>
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>Payment</Th>
                            <Th fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5} textAlign="right">Session Access</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {appointments.map((appt) => {
                            const paymentMeta = getPaymentMeta(appt);
                            const statusMeta = getStatusMeta(appt.status_label || appt.status);
                            return (
                            <Tr key={appt.id} _hover={{ bg: 'rgba(250, 248, 245, 0.65)' }} transition="background 0.15s">
                                <Td py={3.5}>
                                    <VStack align="start" spacing={0.5}>
                                        <Text 
                                          fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                                          fontWeight="600" 
                                          fontSize="13.5px" 
                                          color="#263A33" 
                                          whiteSpace="nowrap"
                                        >
                                          {new Date(appt.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </Text>
                                        <HStack spacing={1.5}>
                                          <Circle size="6px" bg="#10B981" />
                                          <Text fontSize="12px" color="#5A6E65" fontWeight="400" whiteSpace="nowrap">
                                            {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </Text>
                                        </HStack>
                                    </VStack>
                                </Td>
                                <Td py={3.5}>
                                    <HStack spacing={2.5}>
                                      <Avatar 
                                        size="sm" 
                                        name={appt.therapist_name || "Therapist"} 
                                        src={appt.therapist_profile_image}
                                        border="1.5px solid white"
                                        boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                                      />
                                      <VStack align="start" spacing={0}>
                                        <Text 
                                          fontSize="13.5px" 
                                          fontWeight="600" 
                                          color="#263A33" 
                                          noOfLines={1}
                                          fontFamily="'Inter', var(--font-inter), sans-serif"
                                        >
                                          {appt.therapist_name || "Assigned Therapist"}
                                        </Text>
                                        <Text fontSize="11px" color="#718096">
                                          {appt.therapist_title || "Clinical Associate"}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                </Td>
                                <Td py={3.5}>
                                    <HStack spacing={1.5} px={2.5} py={1} bg="rgba(86, 117, 109, 0.08)" borderRadius="full" display="inline-flex">
                                        <Icon as={FiVideo} color="#56756D" boxSize="12px" />
                                        <Text fontSize="12px" fontWeight="600" color="#263A33">Virtual 1-on-1</Text>
                                    </HStack>
                                </Td>
                                <Td py={3.5}>
                                    <Badge 
                                      bg={statusMeta.bg}
                                      color={statusMeta.color}
                                      border="1px solid"
                                      borderColor={statusMeta.border}
                                      borderRadius="full" 
                                      px={2.5} 
                                      py={0.5} 
                                      fontSize="10px"
                                      fontWeight="700"
                                      letterSpacing="0.04em"
                                    >
                                      {statusMeta.label.toUpperCase()}
                                    </Badge>
                                </Td>
                                <Td py={3.5}>
                                  <Badge 
                                    bg={paymentMeta.bg}
                                    color={paymentMeta.color}
                                    border="1px solid"
                                    borderColor={paymentMeta.border}
                                    borderRadius="full" 
                                    px={2.5} 
                                    py={0.5} 
                                    fontSize="10px"
                                    fontWeight="700"
                                    letterSpacing="0.04em"
                                  >
                                    {paymentMeta.label.toUpperCase()}
                                  </Badge>
                                </Td>
                                <Td textAlign="right" py={3.5}>
                                    <HStack justify="flex-end" spacing={2.5}>
                                      {paymentMeta.actionDisabled ? (
                                        <Text fontSize="11.5px" color="#92400E" fontWeight="500" whiteSpace="nowrap">
                                          Awaiting Link
                                        </Text>
                                      ) : (
                                        <Button
                                            as={NextLink}
                                            href={paymentMeta.actionHref}
                                            size="sm"
                                            height="32px"
                                            variant="outline"
                                            borderColor="rgba(86, 117, 109, 0.25)"
                                            color="#263A33"
                                            borderRadius="full"
                                            fontSize="12px"
                                            fontWeight="600"
                                            px={3.5}
                                            leftIcon={<Icon as={FiFileText} boxSize="11px" />}
                                            _hover={{ bg: 'rgba(169, 203, 183, 0.1)' }}
                                        >
                                            View Invoice
                                        </Button>
                                      )}
                                      {appt.status !== "cancelled" && (
                                        <>
                                          <Button
                                            size="sm"
                                            height="34px"
                                            variant="ghost"
                                            color="#DC2626"
                                            borderRadius="full"
                                            fontSize="12px"
                                            fontWeight="600"
                                            px={3}
                                            _hover={{ bg: "rgba(239, 68, 68, 0.08)" }}
                                            onClick={() => {
                                              setCancellingAppt(appt);
                                              onCancelOpen();
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button 
                                              as={NextLink}
                                              href={`/conference/MLC_${appt.id}`}
                                              size="sm" 
                                              height="34px"
                                              bg="#263A33" 
                                              color="white" 
                                              borderRadius="full"
                                              fontSize="12.5px"
                                              fontWeight="600"
                                              px={4}
                                              leftIcon={<Icon as={FiVideo} color="#A9CBB7" boxSize="13px" />}
                                              _hover={{ bg: '#182722', transform: 'translateY(-1px)' }}
                                              transition="all 0.2s"
                                              boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
                                          >
                                              Join Room
                                          </Button>
                                        </>
                                      )}
                                    </HStack>
                                </Td>
                            </Tr>
                            );
                        })}
                        {appointments.length === 0 && (
                            <Tr><Td colSpan={6} textAlign="center" py={12} color="#718096" fontSize="13px">No appointments scheduled.</Td></Tr>
                        )}
                    </Tbody>
                </Table>
                </Box>

                {/* 📱 Mobile Card List */}
                <VStack display={{ base: "flex", md: "none" }} align="stretch" spacing={3}>
                  {appointments.map((appt) => {
                    const paymentMeta = getPaymentMeta(appt);
                    const statusMeta = getStatusMeta(appt.status_label || appt.status);
                    return (
                      <Box 
                        key={appt.id} 
                        border="1px solid" 
                        borderColor="rgba(86, 117, 109, 0.14)" 
                        borderRadius="2xl" 
                        p={4}
                        bg="rgba(250, 248, 245, 0.5)"
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={0.5}>
                              <Text 
                                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                                fontWeight="600"
                                fontSize="14px"
                                color="#263A33"
                              >
                                {new Date(appt.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </Text>
                              <HStack spacing={1.5}>
                                <Circle size="6px" bg="#10B981" />
                                <Text fontSize="12px" color="#5A6E65">
                                  {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </HStack>
                            </VStack>
                            <Badge 
                              bg={statusMeta.bg}
                              color={statusMeta.color}
                              border="1px solid"
                              borderColor={statusMeta.border}
                              borderRadius="full" 
                              px={2.5} 
                              py={0.5} 
                              fontSize="9.5px"
                              fontWeight="700"
                            >
                              {statusMeta.label.toUpperCase()}
                            </Badge>
                          </HStack>

                          <HStack spacing={2.5}>
                            <Avatar 
                              size="sm" 
                              name={appt.therapist_name || "Therapist"} 
                              src={appt.therapist_profile_image}
                              border="1.5px solid white"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                                {appt.therapist_name || "Assigned Therapist"}
                              </Text>
                              <Text fontSize="11px" color="#718096">
                                {appt.therapist_title || "Clinical Associate"}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack justify="space-between" pt={1}>
                            <HStack spacing={1.5} px={2.5} py={0.5} bg="rgba(86, 117, 109, 0.08)" borderRadius="full">
                              <Icon as={FiVideo} color="#56756D" boxSize="11px" />
                              <Text fontSize="11.5px" fontWeight="600" color="#263A33">Virtual 1-on-1</Text>
                            </HStack>
                            <Badge 
                              bg={paymentMeta.bg}
                              color={paymentMeta.color}
                              border="1px solid"
                              borderColor={paymentMeta.border}
                              borderRadius="full" 
                              px={2.5} 
                              py={0.5} 
                              fontSize="9.5px"
                              fontWeight="700"
                            >
                              {paymentMeta.label.toUpperCase()}
                            </Badge>
                          </HStack>

                          <HStack spacing={2} pt={2}>
                            {!paymentMeta.actionDisabled && (
                              <Button
                                as={NextLink}
                                href={paymentMeta.actionHref}
                                size="sm"
                                height="36px"
                                flex="1"
                                variant="outline"
                                borderColor="rgba(86, 117, 109, 0.25)"
                                color="#263A33"
                                borderRadius="full"
                                fontSize="12px"
                                fontWeight="600"
                              >
                                Invoice
                              </Button>
                            )}
                            {appt.status !== "cancelled" && (
                              <>
                                <Button
                                  size="sm"
                                  height="36px"
                                  flex="1"
                                  variant="ghost"
                                  color="#DC2626"
                                  borderRadius="full"
                                  fontSize="12px"
                                  fontWeight="600"
                                  _hover={{ bg: "rgba(239, 68, 68, 0.08)" }}
                                  onClick={() => {
                                    setCancellingAppt(appt);
                                    onCancelOpen();
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  as={NextLink}
                                  href={`/conference/MLC_${appt.id}`}
                                  size="sm"
                                  height="36px"
                                  flex="1"
                                  bg="#263A33"
                                  color="white"
                                  borderRadius="full"
                                  _hover={{ bg: '#182722' }}
                                  leftIcon={<Icon as={FiVideo} color="#A9CBB7" boxSize="13px" />}
                                  fontSize="12.5px"
                                  fontWeight="600"
                                >
                                  Join Room
                                </Button>
                              </>
                            )}
                          </HStack>
                        </VStack>
                      </Box>
                    );
                  })}
                  {appointments.length === 0 && (
                    <Box textAlign="center" py={8} color="#718096" fontSize="13px">No appointments scheduled.</Box>
                  )}
                </VStack>
                </>
            )}
        </Box>

        {/* 🌿 Session Cancellation Confirmation Modal */}
        <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered size="md">
          <ModalOverlay bg="rgba(38, 58, 51, 0.4)" backdropFilter="blur(8px)" />
          <ModalContent borderRadius="2xl" p={2} border="1px solid rgba(86, 117, 109, 0.14)" bg="white">
            <ModalHeader fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="18px" color="#263A33" pb={1}>
              Cancel Session
            </ModalHeader>
            <ModalBody>
              <Text fontSize="13px" color="#5A6E65" lineHeight="1.6">
                Are you sure you want to cancel your session scheduled for{" "}
                <Text as="span" fontWeight="600" color="#263A33">
                  {cancellingAppt && new Date(cancellingAppt.start_time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </Text>
                ? The slot will be released back to the calendar.
              </Text>
            </ModalBody>
            <ModalFooter pt={4}>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  height="38px"
                  fontSize="12.5px"
                  fontWeight="600"
                  px={5}
                  onClick={onCancelClose}
                  isDisabled={isCancelling}
                >
                  Keep Session
                </Button>
                <Button
                  bg="#DC2626"
                  color="white"
                  borderRadius="full"
                  height="38px"
                  fontSize="13px"
                  fontWeight="600"
                  px={5}
                  _hover={{ bg: "#B91C1C" }}
                  isLoading={isCancelling}
                  onClick={handleCancelAppointment}
                >
                  Confirm Cancellation
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
  );
}
