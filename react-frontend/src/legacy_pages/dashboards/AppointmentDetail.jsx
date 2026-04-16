import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Heading, Text, Button, VStack, HStack, Spinner, Badge, Divider } from "@chakra-ui/react";
import { apiGet } from "../../api.js";

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiGet(`/schedule-events/${id}/`);
        if (mounted) {
          setAppt(data);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box py={20} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (!appt) {
    return (
      <Box py={20} textAlign="center">
        <Text>Appointment not found.</Text>
        <Button mt={4} onClick={() => navigate(-1)}>Back</Button>
      </Box>
    );
  }

  const start = appt.start_time ? new Date(appt.start_time) : null;
  const end = appt.end_time ? new Date(appt.end_time) : null;

  return (
    <Box p={8} bg="gray.50" minH="100%">
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Appointment</Heading>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </HStack>

      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Heading size="sm">{appt.title || "Appointment"}</Heading>
            {appt.event_type_name && <Badge colorScheme="blue">{appt.event_type_name}</Badge>}
          </HStack>

          <Divider />

          <Text fontSize="sm" color="gray.700">
            Therapist: {appt.therapist_name || "—"}
          </Text>
          <Text fontSize="sm" color="gray.700">
            Client: {appt.client_name || "—"}
          </Text>
          <Text fontSize="sm" color="gray.700">
            Date: {start ? start.toLocaleDateString() : "—"}
          </Text>
          <Text fontSize="sm" color="gray.700">
            Time: {start ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            {end ? ` – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
          </Text>

          {appt.notes && (
            <>
              <Divider />
              <Text fontWeight="semibold">Notes</Text>
              <Text fontSize="sm" color="gray.700">{appt.notes}</Text>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
