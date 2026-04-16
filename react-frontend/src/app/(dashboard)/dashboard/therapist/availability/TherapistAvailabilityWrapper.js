'use client'

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  Box,
  Heading,
  SimpleGrid,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { FiClock, FiPlus } from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { schedulingApi } from "../../../../../api/scheduling";

export default function TherapistAvailabilityWrapper() {
  const toast = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await schedulingApi.listAvailabilitySlots();
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Could not load slots");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calendarEvents = useMemo(() => {
    return slots.map(slot => ({
      id: slot.id,
      title: slot.status || "Available",
      start: slot.start_time,
      end: slot.end_time,
      backgroundColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
      borderColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
    }));
  }, [slots]);

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
       <VStack align="stretch" spacing={8}>
          <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack mb={6}>
              <Icon as={FiClock} color="#56756D" />
              <Heading size="md" color="#2E2E2E">Weekly Standard Hours</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={4}>Set your recurring availability for the week.</Text>
            {/* BusinessHoursForm could be added here if migrated */}
            <Button variant="outline" borderRadius="full" size="sm">Configure Weekly Pattern</Button>
          </Box>
       </VStack>

       <Box bg="white" p={4} borderRadius="3xl" shadow="xl" overflow="hidden" border="1px solid" borderColor="gray.100" h="640px">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
            height="100%"
            allDaySlot={false}
            events={calendarEvents}
            nowIndicator={true}
          />
       </Box>
    </SimpleGrid>
  );
}
