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
} from "@chakra-ui/react";
import NextLink from "next/link";
import { schedulingApi } from "../../../../../../api/scheduling";
import { getSchedulingErrorMessage } from "../../../../../../utils/schedulingErrors";

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
        <Spinner size="lg" color="#56756C" />
      </Center>
    );
  }

  if (error) {
    return (
      <VStack spacing={4} align="stretch" py={8}>
        <Text color="red.600">{error}</Text>
        <Button onClick={() => void loadRequests()}>Retry</Button>
      </VStack>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <VStack align="stretch" spacing={8} w="100%" p={{ base: 4, md: 0 }}>
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="#2E2E2E" fontWeight="800">
          Your booking requests
        </Heading>
        <Text color="gray.500" fontSize="sm">
          Track pending requests and past outcomes. If a request{" "}
          <strong>expires</strong> before your therapist responds, it will show as expired below.
        </Text>
      </VStack>

      {requests.length === 0 ? (
        <Text color="gray.500" py={6}>
          No requests yet. When you book a session, it will show here.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {requests.map((req) => (
            <Box
              key={req.id}
              p={4}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.100"
              bg="white"
              shadow="sm"
            >
              <HStack justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                <Text fontWeight="700">{req.therapist_display_name || `Therapist #${req.therapist}`}</Text>
                {req.status_label && (
                  <Badge colorScheme={req.status === "pending" ? "orange" : "gray"} borderRadius="full" px={2}>
                    {req.status_label}
                  </Badge>
                )}
              </HStack>
              {req.slot_start_time && (
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {new Date(req.slot_start_time).toLocaleString()}
                </Text>
                )}
              {req.message_from_client ? (
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Your message: {req.message_from_client}
                </Text>
              ) : null}
              {req.therapist_response_note ? (
                <Text fontSize="sm" color="gray.600" mb={2}>
                  From therapist: {req.therapist_response_note}
                </Text>
              ) : null}
              {req.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => void handleCancel(req.id)}
                >
                  Cancel request
                </Button>
              )}
              {req.status === "confirmed" && (
                <Text fontSize="xs" color="teal.700" mt={1}>
                  Open{" "}
                  <Button as={NextLink} href="/dashboard/client/appointments" variant="link" size="xs" color="teal.600">
                    Appointments
                  </Button>{" "}
                  for session details. To cancel the session, use options there (if enabled).
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}

      {pending.length > 0 && (
        <Text fontSize="xs" color="gray.500">
          You can cancel a <strong>pending</strong> request here. If it expired or was processed, use the status above.
        </Text>
      )}
    </VStack>
  );
}
