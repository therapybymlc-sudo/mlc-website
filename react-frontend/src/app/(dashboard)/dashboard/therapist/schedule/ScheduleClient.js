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
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { apiGet } from "../../../../../api.js";

// Dynamic import for FullCalendar to avoid SSR hydration issues with heavy DOM manipulation components
const FullCalendarComponent = dynamic(() => import("./FullCalendarWrapper"), {
  ssr: false,
  loading: () => (
    <Box h="600px" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="xl" color="#56756D" />
    </Box>
  ),
});

export default function ScheduleClient() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await apiGet("schedule-events/");
        const data = Array.isArray(res) ? res : res.results || [];
        setEvents(data.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.start_time,
          end: ev.end_time,
          backgroundColor: ev.color || "#56756D",
          extendedProps: {
            client_name: ev.client_name,
          }
        })));
      } catch (err) {
        toast({ title: "Could not load schedule", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            Clinical Schedule
          </Heading>
          <Text color="gray.500">Manage your therapeutic sessions and availability.</Text>
        </VStack>
        <Button 
          leftIcon={<FiPlus />} 
          bg="#56756D" 
          color="white" 
          borderRadius="full" 
          px={6}
          _hover={{ bg: '#C9A960' }}
        >
          Add Session
        </Button>
      </HStack>

      <Box bg="white" p={4} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        <FullCalendarComponent events={events} />
      </Box>
    </Box>
  );
}
