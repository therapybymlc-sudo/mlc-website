"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "../../../../../../api.js";

export default function InvoicePageClient() {
  const params = useParams();
  const appointmentId = params?.appointmentId;
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!appointmentId) return;
      try {
        setLoading(true);
        const appt = await apiGet(`client-appointments/${appointmentId}/`);
        setAppointment(appt);
        if (appt?.therapist) {
          const t = await apiGet(`therapists/${appt.therapist}/`);
          setTherapist(t);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [appointmentId]);

  const issueDate = useMemo(() => new Date(), []);
  const amount = Number(therapist?.hourly_rate || 0);
  const invoiceNo = `MLC-INV-${appointmentId}`;

  if (loading) {
    return (
      <VStack py={20}>
        <Spinner color="#56756D" />
      </VStack>
    );
  }

  if (!appointment) {
    return (
      <VStack py={20} spacing={4}>
        <Text color="gray.500">Invoice not available.</Text>
        <Button as={NextLink} href="/dashboard/client/appointments">
          Back to sessions
        </Button>
      </VStack>
    );
  }

  return (
    <Box maxW="900px" mx="auto" bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" p={8}>
      <HStack justify="space-between" align="start" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="md">Invoice</Heading>
          <Text color="gray.500" fontSize="sm">{invoiceNo}</Text>
        </VStack>
        <VStack align="end" spacing={1}>
          <Text fontWeight="700">MLC Health</Text>
          <Text fontSize="sm" color="gray.500">Date: {issueDate.toLocaleDateString()}</Text>
        </VStack>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={8}>
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight="700" mb={2}>BILLED TO</Text>
          <Text>{appointment.client_name || "Client"}</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.400" fontWeight="700" mb={2}>THERAPIST</Text>
          <Text>{appointment.therapist_name || therapist?.name || "Assigned Therapist"}</Text>
        </Box>
      </Grid>

      <Divider mb={4} />
      <Grid templateColumns="2fr 1fr 1fr" gap={4} mb={3}>
        <Text fontWeight="700" fontSize="sm">Description</Text>
        <Text fontWeight="700" fontSize="sm">Session Date</Text>
        <Text fontWeight="700" fontSize="sm" textAlign="right">Amount</Text>
      </Grid>
      <Grid templateColumns="2fr 1fr 1fr" gap={4} py={3}>
        <Text>Therapy Session</Text>
        <Text>{appointment.start_time ? new Date(appointment.start_time).toLocaleDateString() : "-"}</Text>
        <Text textAlign="right">INR {amount.toFixed(2)}</Text>
      </Grid>
      <Divider my={4} />
      <HStack justify="space-between">
        <Text fontWeight="700">Payment status</Text>
        <Text fontWeight="700" color="green.600">Completed</Text>
      </HStack>
      <HStack justify="space-between" mt={2}>
        <Text fontWeight="700">Total</Text>
        <Text fontWeight="700">INR {amount.toFixed(2)}</Text>
      </HStack>

      <HStack mt={8} justify="space-between">
        <Button as={NextLink} href="/dashboard/client/appointments" variant="ghost">
          Back
        </Button>
        <Button onClick={() => window.print()} bg="#56756D" color="white" _hover={{ bg: "#3E5B54" }}>
          Download / Print
        </Button>
      </HStack>
    </Box>
  );
}
