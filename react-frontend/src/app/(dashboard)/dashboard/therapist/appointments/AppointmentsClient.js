'use client'

import { useEffect, useMemo, useState } from "react";
import { 
  Button, 
  Text, 
  VStack, 
  Box, 
  Heading, 
  HStack, 
  Badge, 
  Spinner,
  SimpleGrid,
  Icon
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiTrash2 } from "react-icons/fi";
import { schedulingApi } from "../../../../../api/scheduling";

export default function TherapistAppointmentsClient() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listTherapistAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load appointments. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const isUpcoming = (appt) => new Date(appt.start_time) > new Date();

  const upcomingAppointments = useMemo(
    () => appointments.filter(appt => isUpcoming(appt) && appt.status !== 'cancelled'),
    [appointments]
  );

  const pastAppointments = useMemo(
    () => appointments.filter(appt => !isUpcoming(appt) || appt.status === 'cancelled'),
    [appointments]
  );

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await schedulingApi.cancelTherapistAppointment(appointmentId, "Cancelled by therapist via dashboard");
      await loadAppointments();
    } catch (err) {
      alert("Unable to cancel appointment.");
    }
  };

  if (loading) {
    return (
      <Box h="400px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#56756D" />
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Session Appointments
        </Heading>
        <Text color="gray.500">Manage your upcoming therapy sessions and clinical history.</Text>
      </VStack>

      {error && <Text color="red.500" mb={4}>{error}</Text>}

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        {/* Upcoming */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <HStack justify="space-between" mb={6}>
              <Heading size="md" color="#2E2E2E">Upcoming Sessions</Heading>
              <Badge colorScheme="teal" borderRadius="full" px={3}>NEXT {upcomingAppointments.length}</Badge>
           </HStack>
           
           <VStack align="stretch" spacing={4}>
              {upcomingAppointments.length === 0 ? (
                <Text color="gray.500" fontStyle="italic">No upcoming sessions scheduled.</Text>
              ) : upcomingAppointments.map(appt => (
                <Box key={appt.id} p={5} borderRadius="2xl" border="1px solid" borderColor="gray.50" bg="#FDFBFA" _hover={{ shadow: 'md' }} transition="0.3s">
                   <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                         <Text fontWeight="700" color="#56756D" fontSize="lg">{appt.client_display_name || 'Anonymous Client'}</Text>
                         <HStack color="gray.600" fontSize="sm">
                            <Icon as={FiClock} />
                            <Text>{new Date(appt.start_time).toLocaleDateString()} • {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                         </HStack>
                      </VStack>
                      <Button size="sm" colorScheme="red" variant="ghost" leftIcon={<FiTrash2 />} onClick={() => handleCancel(appt.id)}>Cancel</Button>
                   </HStack>
                </Box>
              ))}
           </VStack>
        </Box>

        {/* History */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <Heading size="md" color="#2E2E2E" mb={6}>Session History</Heading>
           <VStack align="stretch" spacing={4}>
              {pastAppointments.length === 0 ? (
                <Text color="gray.500" fontStyle="italic">No past sessions found.</Text>
              ) : pastAppointments.slice(0, 10).map(appt => (
                <HStack key={appt.id} justify="space-between" p={3} borderBottom="1px solid" borderColor="gray.50">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600" fontSize="sm">{appt.client_display_name || 'Anonymous Client'}</Text>
                      <Text fontSize="xs" color="gray.400">{new Date(appt.start_time).toLocaleDateString()}</Text>
                    </VStack>
                    <Badge variant="subtle" colorScheme={appt.status === 'cancelled' ? 'red' : 'gray'}>
                      {appt.status?.toUpperCase() || 'PAST'}
                    </Badge>
                </HStack>
              ))}
           </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
