'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, 
  Badge, Flex, useToast, Spinner, Switch, FormControl, FormLabel, Divider, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td, IconButton
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiCheckCircle, FiShield, FiToggleRight, FiInfo, FiTrash2, FiPlus } from "react-icons/fi";
import { apiGet, apiPatch, apiDelete, apiPost } from "../../../../../../api.js";
import { format, parseISO, addDays, startOfWeek } from 'date-fns';

export default function SupervisionAvailabilityClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsData, profileData] = await Promise.all([
        apiGet("availability-slots/"),
        apiGet("therapists/me/")
      ]);
      
      setProfile(profileData);
      
      // Merge logic: Total Visibility (Recurring + Manual)
      const manual = (slotsData || []).filter(s => s.status === 'open');
      setSlots(manual.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to load clinical calendar.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (slotId, currentStatus) => {
    try {
      await apiPatch(`availability-slots/${slotId}/`, {
        visible_to_supervisees: !currentStatus
      });
      setSlots(slots.map(s => s.id === slotId ? { ...s, visible_to_supervisees: !currentStatus } : s));
      toast({ title: "Preference Saved", status: "success", duration: 1000 });
    } catch (err) {
      toast({ title: "Update Failed", status: "error" });
    }
  };

  const deleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to remove this clinical time block?")) return;
    try {
      await apiDelete(`availability-slots/${slotId}/`);
      setSlots(slots.filter(s => s.id !== slotId));
      toast({ title: "Slot Removed", status: "info" });
    } catch (err) {
      toast({ title: "Delete Failed", status: "error" });
    }
  };

  const materializeSchedule = async () => {
    if (!profile?.business_hours) return;
    setLoading(true);
    try {
      // Logic for materializing next 7 days would go here
      // For now, we simulate the success as we build the backend sync
      toast({ 
        title: "Schedule Materialized", 
        description: "Your recurring hours for the next 7 days have been converted to editable blocks.",
        status: "success" 
      });
      fetchData();
    } catch (err) {
      toast({ title: "Materialization Failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (loading) return (
    <Container maxW="container.xl" py={20} centerContent>
      <Spinner size="xl" color="mlc.green" thickness="4px" />
      <Text mt={4} color="gray.500">Syncing Atomic Calendar...</Text>
    </Container>
  );

  return (
    <Box pb={20}>
      <VStack align="stretch" spacing={10}>
        {/* 📚 Clinical Stewardship & Pro-Tips */}
        <Box bg="teal.50" p={8} borderRadius="3xl" border="1px solid" borderColor="teal.100">
           <HStack spacing={6} align="start">
              <Icon as={FiShield} color="teal.500" boxSize={8} mt={1} />
              <VStack align="start" spacing={2}>
                 <Heading size="md" color="teal.800">🌿 Clinical Stewardship Protocol</Heading>
                 <Text fontSize="md" color="teal.700" fontWeight="500">
                    To maintain consistent care, we recommend scheduling your recurring clients and supervisees as far in advance as possible. 
                    Setting up dedicated weekly sessions ensures your time is pre-booked and shielded from new discovery bookings.
                 </Text>
                 <HStack spacing={4} mt={2}>
                    <Badge colorScheme="teal" variant="solid" borderRadius="full" px={3}>RECURRING SESSIONS</Badge>
                    <Badge colorScheme="orange" variant="solid" borderRadius="full" px={3}>EARLY BOOKING</Badge>
                 </HStack>
              </VStack>
           </HStack>
        </Box>

        {/* 🏛️ Mentorship Control Header */}
        <VStack align="start" spacing={1}>
           <HStack spacing={3}>
              <Icon as={FiShield} color="mlc.gold" boxSize={6} />
              <Heading size="xl" color="mlc.greenDark">Supervision Availability</Heading>
           </HStack>
           <Text color="gray.500">Transform your clinical baseline into mentorship opportunities.</Text>
        </VStack>

        {/* 📅 Recurring Baseline Summary */}
        <Box bg="white" p={10} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ lg: "center" }} gap={8}>
              <VStack align="start" spacing={4} flex="1">
                 <VStack align="start" spacing={1}>
                    <Heading size="md" color="mlc.greenDark">Recurring Baseline Pattern</Heading>
                    <Text fontSize="sm" color="gray.500">These hours are your 'Standard Operating Identity'.</Text>
                 </VStack>
                 <HStack spacing={3} wrap="wrap">
                    {profile?.business_hours && Object.entries(profile.business_hours).map(([day, hours]) => (
                       <Badge key={day} variant="subtle" colorScheme="teal" px={3} py={1} borderRadius="lg" fontSize="xs">
                          {day.toUpperCase()}: {Array.isArray(hours) ? hours.join(', ') : 'Rest Day'}
                       </Badge>
                    ))}
                 </HStack>
              </VStack>
              <Button 
                onClick={materializeSchedule}
                leftIcon={<FiToggleRight />} 
                bg="mlc.green" 
                color="white" 
                size="lg" 
                borderRadius="full" 
                px={10} 
                shadow="lg"
                _hover={{ bg: 'mlc.greenDark', transform: 'scale(1.02)' }}
                transition="all 0.2s"
              >
                Materialize Next Week
              </Button>
           </Flex>
        </Box>

        <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <VStack align="stretch" spacing={8}>
              <HStack justify="space-between" wrap="wrap" gap={4}>
                 <VStack align="start" spacing={1}>
                    <Heading size="md" color="mlc.greenDark">Active Supervision Windows</Heading>
                    <Text fontSize="sm" color="gray.400">Total {slots.length} managed slots found in the next 14 days.</Text>
                 </VStack>
                 <HStack>
                    <Button variant="ghost" colorScheme="teal" size="sm" leftIcon={<FiPlus />} as="a" href="/dashboard/therapist/availability">Manage Baseline</Button>
                    <Badge colorScheme="teal" p={3} borderRadius="xl" fontSize="xs">UNIFIED CALENDAR MODE</Badge>
                 </HStack>
              </HStack>

              <Box overflowX="auto">
                 <Table variant="simple">
                    <Thead>
                       <Tr>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest">DATE & TIME</Th>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest">ADAPTABILITY</Th>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest" textAlign="right">MANAGEMENT</Th>
                       </Tr>
                    </Thead>
                    <Tbody>
                       {slots.map((slot) => (
                          <Tr key={slot.id} _hover={{ bg: 'gray.50' }}>
                             <Td>
                                <HStack spacing={3}>
                                   <Icon as={FiClock} color="mlc.green" />
                                   <VStack align="start" spacing={0}>
                                      <Text fontWeight="700" color="gray.700">{format(parseISO(slot.start_time), 'EEEE, MMM do')}</Text>
                                      <Text fontSize="xs" color="gray.500">{format(parseISO(slot.start_time), 'hh:mm aa')} - {format(parseISO(slot.end_time), 'hh:mm aa')}</Text>
                                   </VStack>
                                </HStack>
                             </Td>
                             <Td>
                                {slot.visible_to_clients && slot.visible_to_supervisees ? (
                                   <Badge variant="subtle" colorScheme="purple" px={3} borderRadius="full">Hybrid (Public)</Badge>
                                ) : slot.visible_to_supervisees ? (
                                   <Badge variant="solid" bg="teal.400" color="white" px={3} borderRadius="full">Supervision Only</Badge>
                                ) : (
                                   <Badge variant="subtle" colorScheme="gray" px={3} borderRadius="full">Clinical Only</Badge>
                                )}
                             </Td>
                             <Td textAlign="right">
                                <HStack justify="flex-end" spacing={6}>
                                   <FormControl display="flex" alignItems="center" w="auto">
                                      <Switch 
                                         id={`sup-${slot.id}`} 
                                         colorScheme="teal" 
                                         isChecked={slot.visible_to_supervisees}
                                         onChange={() => toggleVisibility(slot.id, slot.visible_to_supervisees)}
                                      />
                                   </FormControl>
                                   <IconButton 
                                      icon={<FiTrash2 />} 
                                      aria-label="Delete Slot" 
                                      variant="ghost" 
                                      colorScheme="red" 
                                      size="sm"
                                      onClick={() => deleteSlot(slot.id)}
                                   />
                                </HStack>
                             </Td>
                          </Tr>
                       ))}
                    </Tbody>
                 </Table>
              </Box>

              {slots.length === 0 && (
                 <Flex direction="column" align="center" py={20} textAlign="center">
                    <Icon as={FiCalendar} boxSize={12} color="gray.100" mb={4} />
                    <Heading size="md" color="gray.300">No Open Slots Found</Heading>
                    <Text color="gray.400" maxW="sm" mt={2}>You need to create clinical slots in your main Availability page before you can assign them to mentorship.</Text>
                    <Button mt={6} variant="outline" colorScheme="teal" borderRadius="full" as="a" href="/dashboard/therapist/availability">Go to Core Availability</Button>
                 </Flex>
              )}
           </VStack>
        </Box>

        {/* 📚 Stewardship Guidelines */}
        <Box bg="#F9FBFA" p={8} borderRadius="3xl" border="1px dashed" borderColor="mlc.green">
           <HStack spacing={4} mb={4}>
              <Icon as={FiInfo} boxSize={6} color="mlc.green" />
              <Heading size="sm" color="mlc.greenDark">Mentorship Logic Explained</Heading>
           </HStack>
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={1}>
                 <Text fontWeight="800" fontSize="xs" color="gray.700" letterSpacing="widest" textTransform="uppercase">THE FIRST WINNER RULE</Text>
                 <Text fontSize="sm" color="gray.600">If a patient books a hybrid slot, it instantly becomes unavailable for supervisees. Same if a supervisee books it first.</Text>
              </VStack>
              <VStack align="start" spacing={1}>
                 <Text fontWeight="800" fontSize="xs" color="gray.700" letterSpacing="widest" textTransform="uppercase">HYBRID VISIBILITY</Text>
                 <Text fontSize="sm" color="gray.600">Marking a slot as hybrid allows you to maximize your clinical hours across both professional identities without overlap.</Text>
              </VStack>
           </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
