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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiVideo } from "react-icons/fi";
import { apiGet } from "../../../../../api.js";
import NextLink from 'next/link';
import { useAuth } from "../../../../../context/AuthContext";

export default function AppointmentsClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPaymentMeta = (appt) => {
    const paid = appt.payment_status === "paid";
    if (paid) {
      return {
        label: "Completed",
        colorScheme: "green",
        actionLabel: "View Invoice",
        actionHref: `/dashboard/client/invoice/${appt.id}`,
        actionDisabled: false,
      };
    }

    return {
      label: "Pending",
      colorScheme: "orange",
      actionLabel: "Awaiting Payment Link",
      actionHref: "/dashboard/client/booking-requests",
      actionDisabled: true,
    };
  };

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await apiGet("client-appointments/");
      setAppointments(Array.isArray(res) ? res : res.results || []);
    } catch (err) {
      toast({ title: "Could not load appointments", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        fetchAppointments();
    } else if (!authLoading && !isAuthenticated) {
        setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  if (!isMounted) return null;

  return (
    <Box maxW="1200px" mx="auto">
       <Flex 
          direction={{ base: "column", md: "row" }}
          justify="space-between" 
          align={{ base: "stretch", md: "flex-end" }}
          mb={8}
          gap={4}
        >
          <VStack align={{ base: "center", md: "start" }} spacing={1} textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
                Your Sessions
            </Heading>
            <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>Manage your upcoming and past therapeutic appointments.</Text>
          </VStack>
          <Button 
            as={NextLink}
            href="/therapists/discovery"
            bg="#56756D" 
            color="white" 
            borderRadius="full" 
            px={8} 
            _hover={{ bg: '#C9A960' }}
            w={{ base: "full", md: "auto" }}
            flexShrink={0}
          >
            Book New Session
          </Button>
        </Flex>

        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            {loading ? (
                <VStack py={20}><Spinner color="#56756D" /></VStack>
            ) : (
                <>
                <Box display={{ base: "none", md: "block" }} overflowX="auto" w="full" minW="0">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead>
                        <Tr>
                            <Th whiteSpace="nowrap">Date & Time</Th>
                            <Th whiteSpace="nowrap">Therapist</Th>
                            <Th whiteSpace="nowrap">Format</Th>
                            <Th whiteSpace="nowrap">Status</Th>
                            <Th whiteSpace="nowrap">Payment Status</Th>
                            <Th whiteSpace="nowrap" textAlign="right">Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {appointments.map((appt) => {
                            const paymentMeta = getPaymentMeta(appt);
                            return (
                            <Tr key={appt.id} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="700" whiteSpace="nowrap">{new Date(appt.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </VStack>
                                </Td>
                                <Td>
                                    <Text fontWeight="600" noOfLines={1}>{appt.therapist_name || "Assigned Therapist"}</Text>
                                </Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <Icon as={FiVideo} color="#56756D" />
                                        <Text fontSize="sm">Online</Text>
                                    </HStack>
                                </Td>
                                <Td>
                                    <Badge colorScheme={appt.status === "cancelled" ? "red" : "teal"} borderRadius="full" px={3} py={1} fontSize="10px">
                                      {(appt.status_label || appt.status || "Scheduled").toUpperCase()}
                                    </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={paymentMeta.colorScheme} borderRadius="full" px={3} py={1} fontSize="10px">
                                    {paymentMeta.label.toUpperCase()}
                                  </Badge>
                                </Td>
                                <Td textAlign="right">
                                    <HStack justify="flex-end" spacing={2}>
                                      <Button
                                          as={NextLink}
                                          href={paymentMeta.actionHref}
                                          size="sm"
                                          variant={paymentMeta.label === "Completed" ? "outline" : "solid"}
                                          colorScheme={paymentMeta.label === "Completed" ? "gray" : "orange"}
                                          borderRadius="full"
                                          isDisabled={paymentMeta.actionDisabled}
                                      >
                                          {paymentMeta.actionLabel}
                                      </Button>
                                      <Button 
                                          as={NextLink}
                                          href={`/conference/MLC_${appt.id}`}
                                          size="sm" 
                                          variant="solid" 
                                          bg="teal.800" 
                                          color="white" 
                                          borderRadius="full"
                                          _hover={{ bg: 'teal.900' }}
                                      >
                                          Join Room
                                      </Button>
                                    </HStack>
                                </Td>
                            </Tr>
                            );
                        })}
                        {appointments.length === 0 && (
                            <Tr><Td colSpan={6} textAlign="center" py={12} color="gray.400">No appointments scheduled.</Td></Tr>
                        )}
                    </Tbody>
                </Table>
                </Box>
                <VStack display={{ base: "flex", md: "none" }} align="stretch" spacing={4}>
                  {appointments.map((appt) => {
                    const paymentMeta = getPaymentMeta(appt);
                    return (
                      <Box key={appt.id} border="1px solid" borderColor="gray.100" borderRadius="2xl" p={4}>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="700">
                                {new Date(appt.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </VStack>
                            <Badge colorScheme={appt.status === "cancelled" ? "red" : "teal"} borderRadius="full" px={3} py={1} fontSize="10px">
                              {(appt.status_label || appt.status || "Scheduled").toUpperCase()}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" fontWeight="600" noOfLines={1}>{appt.therapist_name || "Assigned Therapist"}</Text>
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Icon as={FiVideo} color="#56756D" />
                              <Text fontSize="sm">Online</Text>
                            </HStack>
                            <Badge colorScheme={paymentMeta.colorScheme} borderRadius="full" px={3} py={1} fontSize="10px">
                              {paymentMeta.label.toUpperCase()}
                            </Badge>
                          </HStack>
                          <Stack direction={{ base: "column", sm: "row" }} spacing={3} pt={2}>
                            <Button
                              as={NextLink}
                              href={paymentMeta.actionHref}
                              size="sm"
                              w="full"
                              variant={paymentMeta.label === "Completed" ? "outline" : "solid"}
                              colorScheme={paymentMeta.label === "Completed" ? "gray" : "orange"}
                              borderRadius="full"
                              isDisabled={paymentMeta.actionDisabled}
                              fontSize="xs"
                              py={5}
                            >
                              {paymentMeta.actionLabel}
                            </Button>
                            <Button
                              as={NextLink}
                              href={`/conference/MLC_${appt.id}`}
                              size="sm"
                              w="full"
                              variant="solid"
                              bg="teal.800"
                              color="white"
                              borderRadius="full"
                              _hover={{ bg: 'teal.900' }}
                              leftIcon={<Icon as={FiVideo} />}
                              fontSize="xs"
                              py={5}
                            >
                              Join Room
                            </Button>
                          </Stack>
                        </VStack>
                      </Box>
                    );
                  })}
                  {appointments.length === 0 && (
                    <Box textAlign="center" py={10} color="gray.400">No appointments scheduled.</Box>
                  )}
                </VStack>
                </>
            )}
        </Box>
    </Box>
  );
}
