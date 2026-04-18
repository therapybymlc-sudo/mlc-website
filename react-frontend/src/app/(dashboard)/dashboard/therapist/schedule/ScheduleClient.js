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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FiCalendar, FiPlus, FiClock, FiUser, FiFileText } from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useUser } from "@clerk/nextjs";

// Dynamic import for FullCalendar to avoid SSR hydration issues
const FullCalendarComponent = dynamic(() => import("./FullCalendarWrapper"), {
  ssr: false,
  loading: () => (
    <Box h="600px" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="xl" color="#56756C" />
    </Box>
  ),
});

export default function ScheduleClient() {
  const { user } = useUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    client: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, clientRes, therapistRes] = await Promise.all([
        apiGet("schedule-events/"),
        apiGet("clients/"),
        apiGet("therapists/me/") // Assuming this exists or we use user.id
      ]);

      // Normalize events
      const eventData = Array.isArray(eventRes) ? eventRes : eventRes.results || [];
      setEvents(eventData.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.start_time,
        end: ev.end_time,
        backgroundColor: ev.color || "#56756D",
        borderColor: ev.color || "#56756D",
        extendedProps: {
            client_id: ev.client,
            client_name: ev.client_name,
            notes: ev.notes,
        }
      })));

      // Normalize clients
      setClients(Array.isArray(clientRes) ? clientRes : clientRes.results || []);

      // Normalize business hours
      if (therapistRes && therapistRes.business_hours) {
        const bh = [];
        Object.keys(therapistRes.business_hours).forEach(day => {
          const dayOfWeek = parseInt(day, 10);
          therapistRes.business_hours[day].forEach(block => {
            bh.push({
              daysOfWeek: [dayOfWeek],
              startTime: block.startTime,
              endTime: block.endTime
            });
          });
        });
        setBusinessHours(bh);
      }
    } catch (err) {
      console.warn("Could not fetch full schedule data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (info) => {
    setIsEditMode(false);
    const start = new Date(info.start);
    const end = new Date(info.end);
    
    // Format to local date-time string for input
    const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    setForm({
      title: "",
      client: "",
      start_time: toLocalISO(start),
      end_time: toLocalISO(end),
      notes: "",
    });
    setSelectedEvent(null);
    onOpen();
  };

  const handleEventClick = (info) => {
    const { event } = info;
    setIsEditMode(true);
    setSelectedEvent(event);

    const toLocalISO = (date) => {
        if (!date) return "";
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    setForm({
      title: event.title,
      client: event.extendedProps.client_id || "",
      start_time: toLocalISO(event.start),
      end_time: toLocalISO(event.end),
      notes: event.extendedProps.notes || "",
    });
    onOpen();
  };

  const handleCreate = async () => {
    if (!form.start_time || !form.end_time) return;
    try {
      const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
      const payload = {
        title: form.title || (selectedClientObj ? `Session with ${selectedClientObj.name}` : "Clinical Session"),
        client: form.client ? Number(form.client) : null,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes,
      };
      await apiPost("schedule-events/", payload);
      toast({ title: "Appointment created", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Failed to create appointment", status: "error" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent) return;
    try {
      const payload = {
        title: form.title,
        client: form.client ? Number(form.client) : null,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes,
      };
      await apiPut(`schedule-events/${selectedEvent.id}/`, payload);
      toast({ title: "Appointment updated", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Failed to update appointment", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await apiDelete(`schedule-events/${selectedEvent.id}/`);
      toast({ title: "Appointment canceled", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Failed to cancel appointment", status: "error" });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
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
          onClick={() => {
              setIsEditMode(false);
              setForm({ title: "", client: "", start_time: "", end_time: "", notes: "" });
              onOpen();
          }}
          _hover={{ bg: '#C9A960' }}
        >
          Add Session
        </Button>
      </HStack>

      {loading && events.length === 0 ? (
          <Center h="400px">
              <Spinner size="xl" color="#56756D" />
          </Center>
      ) : (
        <Box 
            bg="white" 
            p={4} 
            borderRadius="4xl" 
            shadow="sm" 
            border="1px solid" 
            borderColor="gray.100" 
            overflow="hidden"
            sx={{
                ".fc-timegrid-slot": { height: "3rem" },
                ".fc-business-hour": { background: "transparent" },
                ".fc-nonbusiness": { background: "#F7FAFC" }
            }}
        >
            <FullCalendarComponent 
                events={events} 
                onSelect={handleSelect}
                onEventClick={handleEventClick}
                businessHours={businessHours}
            />
        </Box>
      )}

      {/* Appointment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <HStack spacing={3}>
                <Icon as={FiCalendar} color="#56756C" />
                <Text>{isEditMode ? "Session Details" : "New Appointment"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={6} mr={6} />
          <ModalBody>
            <VStack spacing={6}>
                <FormControl>
                    <FormLabel fontWeight="700" color="gray.600">Patient</FormLabel>
                    <Select 
                        placeholder="Select client (optional)" 
                        value={form.client}
                        onChange={(e) => setForm({ ...form, client: e.target.value })}
                        borderRadius="xl"
                        h={12}
                    >
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel fontWeight="700" color="gray.600">Session Name</FormLabel>
                    <Input 
                        placeholder="e.g. Psychotherapy Follow-up" 
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        borderRadius="xl"
                        h={12}
                    />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl>
                        <FormLabel fontWeight="700" color="gray.600">Start Time</FormLabel>
                        <Input 
                            type="datetime-local" 
                            value={form.start_time}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                            borderRadius="xl"
                            h={12}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel fontWeight="700" color="gray.600">End Time</FormLabel>
                        <Input 
                            type="datetime-local" 
                            value={form.end_time}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                            borderRadius="xl"
                            h={12}
                        />
                    </FormControl>
                </SimpleGrid>

                <FormControl>
                    <FormLabel fontWeight="700" color="gray.600">Clinical Notes</FormLabel>
                    <Textarea 
                        placeholder="Private notes for the session..." 
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        borderRadius="2xl"
                        minH="120px"
                    />
                </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter pt={8}>
            <HStack w="full" justify="space-between">
                {isEditMode ? (
                    <Button variant="ghost" colorScheme="red" onClick={handleDelete} borderRadius="full">
                        Cancel Appointment
                    </Button>
                ) : <Box />}
                <HStack spacing={4}>
                    <Button variant="ghost" onClick={onClose} borderRadius="full">Back</Button>
                    <Button 
                        bg="#56756D" 
                        color="white" 
                        borderRadius="full" 
                        px={8}
                        onClick={isEditMode ? handleUpdate : handleCreate}
                        _hover={{ bg: '#3E5B54' }}
                    >
                        {isEditMode ? "Save Changes" : "Confirm Appointment"}
                    </Button>
                </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box as="style">
          {`
            .fc-timegrid-col.fc-day-today { background-color: rgba(86, 117, 109, 0.02) !important; }
            .fc-event { border: none !important; border-radius: 8px !important; padding: 2px 4px !important; cursor: pointer !important; }
            .fc-v-event { background-color: #56756D !important; border-left: 4px solid #C9A960 !important; }
            .fc-timegrid-slot-label { font-size: 0.75rem; color: #718096; font-weight: 600; }
          `}
      </Box>
    </Box>
  );
}

function SimpleGrid({ columns, spacing, w, children }) {
    return (
        <Box display="grid" gridTemplateColumns={`repeat(${columns}, 1fr)`} gap={spacing} w={w}>
            {children}
        </Box>
    );
}

function Center({ h, children }) {
    return (
        <Box h={h} display="flex" alignItems="center" justifyContent="center">
            {children}
        </Box>
    );
}
