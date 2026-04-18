'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
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
import { FiCalendar, FiClock, FiVideo } from "react-icons/fi";
import { apiGet } from "../../../../../api.js";
import NextLink from 'next/link';
import { useAuth } from "../../../../../context/AuthContext";

export default function AppointmentsClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
       <HStack justify="space-between" mb={8} align="flex-end">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
                Your Sessions
            </Heading>
            <Text color="gray.500">Manage your upcoming and past therapeutic appointments.</Text>
          </VStack>
          <Button 
            as={NextLink}
            href="/therapists/discovery"
            bg="#56756D" 
            color="white" 
            borderRadius="full" 
            px={8} 
            _hover={{ bg: '#C9A960' }}
          >
            Book New Session
          </Button>
        </HStack>

        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            {loading ? (
                <VStack py={20}><Spinner color="#56756D" /></VStack>
            ) : (
                <Box overflowX="auto" w="full">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Date & Time</Th>
                            <Th>Therapist</Th>
                            <Th>Format</Th>
                            <Th>Status</Th>
                            <Th textAlign="right">Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {appointments.map((appt) => (
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
                                    <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="10px">CONFIRMED</Badge>
                                </Td>
                                <Td textAlign="right">
                                    <Button size="sm" variant="outline" colorScheme="teal" borderRadius="full">Join Room</Button>
                                </Td>
                            </Tr>
                        ))}
                        {appointments.length === 0 && (
                            <Tr><Td colSpan={5} textAlign="center" py={12} color="gray.400">No appointments scheduled.</Td></Tr>
                        )}
                    </Tbody>
                </Table>
                </Box>
            )}
        </Box>
    </Box>
  );
}
