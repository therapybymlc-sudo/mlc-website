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
} from "@chakra-ui/react";
import NextLink from "next/link";
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
      toast({ title: "Request confirmed", status: "success" });
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

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const otherRequests = requests.filter((req) => req.status !== "pending");

  return (
    <VStack align="stretch" spacing={8} w="100%" p={{ base: 4, md: 0 }}>
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="#2E2E2E" fontWeight="800">
          Booking requests
        </Heading>
        <Text color="gray.500" fontSize="sm">
          Confirm, decline, or cancel incoming session requests. Expired and completed requests
          appear under recent updates.
        </Text>
      </VStack>

      {!hasBasicAccess && (
        <SubscriptionWall
          tier="basic"
          featureName="Booking request management"
          hasAccess={false}
          onUpgrade={() => requireBasicAccess()}
          compact
        />
      )}

      <Box>
        <Text fontWeight="700" color="gray.600" fontSize="sm" mb={3} textTransform="uppercase" letterSpacing="wider">
          Pending
        </Text>
        {pendingRequests.length === 0 ? (
          <Text color="gray.500" fontSize="sm" py={6}>
            No pending requests. You&apos;re all caught up.
          </Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {pendingRequests.map((req) => (
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
                  <Text fontWeight="700" color="#2E2E2E">
                    {req.client_display_name || `Client #${req.client}`}
                  </Text>
                  {req.status_label && (
                    <Badge colorScheme="orange" borderRadius="full" px={2}>
                      {req.status_label}
                    </Badge>
                  )}
                </HStack>
                {req.slot_start_time && (
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {new Date(req.slot_start_time).toLocaleString()}
                    {req.slot_end_time
                      ? ` – ${new Date(req.slot_end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : null}
                  </Text>
                )}
                {req.message_from_client ? (
                  <Text fontSize="sm" color="gray.600" mb={3} fontStyle="italic">
                    “{req.message_from_client}”
                  </Text>
                ) : null}
                <Textarea
                  size="sm"
                  borderRadius="xl"
                  placeholder="Optional note to the client (used for decline, optional for cancel)…"
                  value={noteDrafts[req.id] || ""}
                  onChange={(e) =>
                    setNoteDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                  mb={3}
                />
                <HStack flexWrap="wrap" gap={2}>
                  <Button
                    size="sm"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "#3E5B54" }}
                    onClick={() => void handleConfirm(req.id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    borderRadius="full"
                    onClick={() => void handleDecline(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    borderRadius="full"
                    onClick={() => void handleCancel(req.id)}
                  >
                    Cancel request
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <Box>
        <Text fontWeight="700" color="gray.600" fontSize="sm" mb={3} textTransform="uppercase" letterSpacing="wider">
          Recent updates
        </Text>
        <Text fontSize="xs" color="gray.500" mb={3}>
          Includes confirmed, declined, cancelled, and{" "}
          <strong>expired</strong> (when the hold timer ran out before you responded).
        </Text>
        {otherRequests.length === 0 ? (
          <Text color="gray.500" fontSize="sm" py={4}>
            No history yet.
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {otherRequests.map((req) => (
              <Box
                key={req.id}
                p={3}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <HStack justify="space-between" mb={1} flexWrap="wrap">
                  <Text fontWeight="600" fontSize="sm">
                    {req.client_display_name || `Client #${req.client}`}
                  </Text>
                  {req.status_label && (
                    <Badge colorScheme="gray" fontSize="xs" borderRadius="full">
                      {req.status_label}
                    </Badge>
                  )}
                </HStack>
                {req.slot_start_time && (
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    {new Date(req.slot_start_time).toLocaleString()}
                  </Text>
                )}
                {req.therapist_response_note ? (
                  <Text fontSize="xs" color="gray.600">
                    Note: {req.therapist_response_note}
                  </Text>
                ) : null}
                {req.status === "confirmed" && (
                  <Text fontSize="xs" color="teal.700" mt={1}>
                    Session booked — manage the session in{" "}
                    <Button as={NextLink} href="/dashboard/therapist/appointments" variant="link" size="xs" color="teal.600">
                      Appointments
                    </Button>{" "}
                    if you need to cancel.
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to confirm, decline, and manage client booking requests."
      />
    </VStack>
  );
}
