'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, 
  Badge, Flex, useToast, Spinner, Switch, FormControl, FormLabel, Divider, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td, IconButton
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiCheckCircle, FiShield, FiToggleRight, FiInfo } from "react-icons/fi";
import { apiGet, apiPatch } from "../../../../api.js";
import { format, parseISO, addDays, startOfWeek } from 'date-fns';

export default function SupervisionAvailabilityClient() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const data = await apiGet("availability-slots/");
      // Only show upcoming open slots for management
      const upcoming = data
        .filter(s => s.status === 'open')
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setSlots(upcoming);
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

  if (loading) return (
    <Container maxW="container.xl" py={20} centerContent>
      <Spinner size="xl" color="mlc.green" thickness="4px" />
      <Text mt={4} color="gray.500">Syncing Atomic Calendar...</Text>
    </Container>
  );

  return (
    <Box pb={20}>
      <VStack align="stretch" spacing={10}>
        {/* 🏛️ Mentorship Control Header */}
        <VStack align="start" spacing={1}>
           <HStack spacing={3}>
              <Icon as={FiShield} color="mlc.gold" boxSize={6} />
              <Heading size="xl" color="mlc.greenDark">Mentorship Availability Hub</Heading>
           </HStack>
           <Text color="gray.500">Manage which parts of your clinical calendar are visible to potential supervisees.</Text>
        </VStack>

        <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <VStack align="stretch" spacing={8}>
              <HStack justify="space-between" wrap="wrap" gap={4}>
                 <VStack align="start" spacing={1}>
                    <Heading size="md" color="mlc.greenDark">Upcoming Clinical Slots</Heading>
                    <Text fontSize="sm" color="gray.400">Total {slots.length} slots found in the next 14 days.</Text>
                 </VStack>
                 <Badge colorScheme="teal" p={3} borderRadius="xl" fontSize="xs">UNIFIED CALENDAR MODE</Badge>
              </HStack>

              <Box overflowX="auto">
                 <Table variant="simple">
                    <Thead>
                       <Tr>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest">DATE & TIME</Th>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest">ADAPTABILITY</Th>
                          <Th color="gray.400" fontSize="2xs" letterSpacing="widest" textAlign="right">SUPERVISION VISIBILITY</Th>
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
                                <FormControl display="flex" alignItems="center" justifyContent="flex-end">
                                   <FormLabel htmlFor={`sup-${slot.id}`} mb="0" fontSize="xs" color="gray.500">
                                      Visible to Supervisees?
                                   </FormLabel>
                                   <Switch 
                                      id={`sup-${slot.id}`} 
                                      colorScheme="teal" 
                                      isChecked={slot.visible_to_supervisees}
                                      onChange={() => toggleVisibility(slot.id, slot.visible_to_supervisees)}
                                   />
                                </FormControl>
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
