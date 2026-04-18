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
  SimpleGrid,
  Center,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FiCalendar, FiPlus, FiClock, FiUser, FiFileText, FiTag, FiSettings } from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "../../../../../context/AuthContext";

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
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const typeModal = useDisclosure(); // New modal for creating event types
  const [mounted, setMounted] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState(null);
  const [currentTherapistId, setCurrentTherapistId] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    client: "",
    event_type: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const [newType, setNewType] = useState({ name: "", color: "#56756D" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, clientRes, therapistRes, typesRes] = await Promise.all([
        apiGet("schedule-events/"),
        apiGet("clients/"),
        apiGet("therapists/me/").catch(() => null),
        apiGet("event-types/").catch(() => [])
      ]);

      // Normalize event types
      const normalizedTypes = Array.isArray(typesRes) ? typesRes : typesRes.results || [];
      setEventTypes(normalizedTypes);
      const typeMap = {};
      normalizedTypes.forEach(t => { typeMap[t.id] = t; });

      // Process Schedule Events
      const eventData = Array.isArray(eventRes) ? eventRes : eventRes.results || [];
      const unifiedEvents = eventData.map(ev => {
        const typeInfo = typeMap[ev.event_type] || {};
        return {
          id: ev.id,
          originalId: ev.id,
          title: ev.title,
          start: ev.start_time,
          end: ev.end_time,
          backgroundColor: ev.color || typeInfo.color || "#56756D",
          borderColor: ev.color || typeInfo.color || "#56756D",
          extendedProps: {
              client_id: ev.client,
              client_name: ev.client_name,
              event_type: ev.event_type,
              notes: ev.notes,
          }
        };
      });

      setEvents(unifiedEvents);

      // Normalize clients
      setClients(Array.isArray(clientRes) ? clientRes : clientRes.results || []);

      // Normalize business hours
      if (therapistRes) {
        setCurrentTherapistId(therapistRes.id);
        if (therapistRes.business_hours) {
            const bh = [];
            Object.keys(therapistRes.business_hours).forEach(day => {
              const dayOfWeek = parseInt(day, 10);
              const daySlots = therapistRes.business_hours[day] || [];
              daySlots.forEach(slot => {
                // If the user upgraded to hourly toggles, slot might be a string "09:00"
                if (typeof slot === 'string') {
                    const h = parseInt(slot.split(":")[0], 10);
                    bh.push({
                      daysOfWeek: [dayOfWeek],
                      startTime: slot,
                      endTime: `${String(h + 1).padStart(2, '0')}:00`
                    });
                } else {
                    bh.push({
                      daysOfWeek: [dayOfWeek],
                      startTime: slot.startTime,
                      endTime: slot.endTime
                    });
                }
              });
            });
            setBusinessHours(bh);
        }
      }
    } catch (err) {
      console.warn("Could not fetch schedule data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

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
      mode: "session",
      title: "",
      client: "",
      event_type: "",
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

    if (event.extendedProps.type === "availability") {
        setForm({
            mode: "availability",
            title: "Public Availability Slot",
            client: "",
            event_type: "",
            start_time: toLocalISO(event.start),
            end_time: toLocalISO(event.end),
            notes: event.extendedProps.notes || "",
        });
    } else {
        setForm({
            mode: "session",
            title: event.title,
            client: event.extendedProps.client_id || "",
            event_type: event.extendedProps.event_type || "",
            start_time: toLocalISO(event.start),
            end_time: toLocalISO(event.end),
            notes: event.extendedProps.notes || "",
        });
    }
    onOpen();
  };

  const handleCreateType = async () => {
    if (!newType.name.trim()) return;
    try {
        await apiPost("event-types/", newType);
        toast({ title: "Event type created", status: "success" });
        setNewType({ name: "", color: "#56756D" });
        typeModal.onClose();
        fetchData();
    } catch (err) {
        toast({ title: "Failed to create type", status: "error" });
    }
  };

  const handleCreate = async () => {
    if (!form.start_time || !form.end_time || !currentTherapistId) return;
    try {
      if (form.mode === "availability") {
          const payload = {
              therapist: currentTherapistId,
              start_time: form.start_time,
              end_time: form.end_time,
              status: "open",
              visible_to_clients: true,
              notes: form.notes
          };
          await apiPost("availability-slots/", payload);
          toast({ title: "Availability slot published", status: "success" });
      } else {
          const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
          const selectedTypeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
          
          const payload = {
            title: form.title || (selectedClientObj ? `${selectedClientObj.name} — ${selectedTypeObj?.name || 'Session'}` : (selectedTypeObj?.name || "Clinical Session")),
            therapist: currentTherapistId,
            client: form.client ? Number(form.client) : null,
            event_type: form.event_type ? Number(form.event_type) : null,
            start_time: form.start_time,
            end_time: form.end_time,
            notes: form.notes,
            color: selectedTypeObj?.color || "#56756C",
          };
          await apiPost("schedule-events/", payload);
          toast({ title: "Appointment created", status: "success" });
      }
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Process failed", description: err.response?.data?.detail || "Check all fields.", status: "error" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !currentTherapistId) return;
    const isSlot = selectedEvent.id.startsWith("slot-");
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id.split("-")[1];

    try {
      if (isSlot) {
          const payload = {
              start_time: form.start_time,
              end_time: form.end_time,
              notes: form.notes
          };
          await apiPut(`availability-slots/${originalId}/`, payload);
          toast({ title: "Slot updated", status: "success" });
      } else {
          const selectedTypeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
          const payload = {
            title: form.title,
            therapist: currentTherapistId,
            client: form.client ? Number(form.client) : null,
            event_type: form.event_type ? Number(form.event_type) : null,
            start_time: form.start_time,
            end_time: form.end_time,
            notes: form.notes,
            color: selectedTypeObj?.color || selectedEvent.backgroundColor,
          };
          await apiPut(`schedule-events/${originalId}/`, payload);
          toast({ title: "Session updated", status: "success" });
      }
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const isSlot = selectedEvent.id.startsWith("slot-");
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id.split("-")[1];

    if (!window.confirm(`Are you sure you want to delete this ${isSlot ? 'slot' : 'appointment'}?`)) return;
    try {
      if (isSlot) {
          await apiDelete(`availability-slots/${originalId}/`);
      } else {
          await apiDelete(`schedule-events/${originalId}/`);
      }
      toast({ title: "Removed successfully", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Removal failed", status: "error" });
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
        <HStack spacing={4}>
            {isAdmin && (
                <Button 
                    leftIcon={<FiSettings />} 
                    variant="outline"
                    borderRadius="full" 
                    px={6}
                    onClick={typeModal.onOpen}
                >
                    Manage Types
                </Button>
            )}
            <Button 
              leftIcon={<FiPlus />} 
              bg="#56756D" 
              color="white" 
              borderRadius="full" 
              px={6}
              onClick={() => {
                  setIsEditMode(false);
                  setForm({ title: "", client: "", event_type: "", start_time: "", end_time: "", notes: "" });
                  onOpen();
              }}
              _hover={{ bg: '#C9A960' }}
            >
              Add Session
            </Button>
        </HStack>
      </HStack>

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
                    <FormLabel fontWeight="700" color="gray.600">Entry Type</FormLabel>
                    <HStack spacing={4}>
                        <Button 
                            flex={1} 
                            variant={form.mode === 'session' ? 'solid' : 'outline'}
                            bg={form.mode === 'session' ? '#56756D' : 'transparent'}
                            color={form.mode === 'session' ? 'white' : '#56756D'}
                            onClick={() => setForm({ ...form, mode: 'session' })}
                            borderRadius="xl"
                        >
                            Clinical Session
                        </Button>
                        <Button 
                            flex={1} 
                            variant={form.mode === 'availability' ? 'solid' : 'outline'}
                            bg={form.mode === 'availability' ? '#A9CBB7' : 'transparent'}
                            color={form.mode === 'availability' ? 'white' : '#A9CBB7'}
                            onClick={() => setForm({ ...form, mode: 'availability' })}
                            borderRadius="xl"
                        >
                            Public Availability
                        </Button>
                    </HStack>
                </FormControl>

                {form.mode === 'session' && (
                    <>
                        <FormControl isRequired>
                            <FormLabel fontWeight="700" color="gray.600">Event Type</FormLabel>
                            <Select 
                                placeholder="Select type" 
                                value={form.event_type}
                                onChange={(e) => {
                                    const typeId = e.target.value;
                                    const typeObj = eventTypes.find(t => String(t.id) === String(typeId));
                                    if (typeObj && form.start_time) {
                                        const start = new Date(form.start_time);
                                        const end = new Date(start.getTime() + (typeObj.default_duration || 50) * 60000);
                                        
                                        const toLocalISO = (date) => {
                                            const offset = date.getTimezoneOffset() * 60000;
                                            return new Date(date - offset).toISOString().slice(0, 16);
                                        };

                                        setForm({ 
                                            ...form, 
                                            event_type: typeId, 
                                            end_time: toLocalISO(end),
                                            notes: form.notes || typeObj.default_notes || ""
                                        });
                                    } else {
                                        setForm({ ...form, event_type: typeId });
                                    }
                                }}
                                borderRadius="xl"
                                h={12}
                            >
                                {eventTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </Select>
                        </FormControl>

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
                    </>
                )}

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

          <ModalFooter pb={8} px={10}>
            <HStack w="full" justify="space-between">
                {isEditMode ? (
                    <Button variant="ghost" colorScheme="red" onClick={handleDelete} borderRadius="full">
                        Cancel Appointment
                    </Button>
                ) : <Box />}
                <HStack spacing={4}>
                    <Button variant="ghost" onClick={onClose} borderRadius="full">Back</Button>
                    <Button 
                        bg="#56756C" 
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

      {/* Event Type Management Modal (Admin Only) */}
      <Modal isOpen={typeModal.isOpen} onClose={typeModal.onClose} size="2xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>Manage Event Types</ModalHeader>
          <ModalCloseButton mt={6} mr={6} />
          <ModalBody>
            <VStack spacing={6} align="stretch" maxH="80vh" overflowY="auto">
                <Box>
                    <Text fontWeight="700" mb={3} fontSize="sm" color="gray.500">EXISTING TYPES</Text>
                    <SimpleGrid columns={1} spacing={2} maxH="300px" overflowY="auto" pr={2}>
                        {eventTypes.map(t => (
                            <HStack key={t.id} justify="space-between" p={3} bg="gray.50" borderRadius="xl">
                                <HStack>
                                    <Box w={3} h={3} borderRadius="full" bg={t.color} />
                                    <Text fontWeight="600">{t.name}</Text>
                                    <Text fontSize="xs" color="gray.400">({t.default_duration}m)</Text>
                                </HStack>
                            </HStack>
                        ))}
                    </SimpleGrid>
                </Box>

                <Divider />

                <VStack spacing={4} align="stretch" bg="gray.50" p={6} borderRadius="2xl">
                    <Text fontWeight="700" fontSize="sm" color="gray.500">CREATE NEW TYPE</Text>
                    <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm">Type Name</FormLabel>
                            <Input 
                                placeholder="e.g. Lunch" 
                                value={newType.name}
                                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                bg="white"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Color</FormLabel>
                            <Input 
                                type="color" 
                                value={newType.color}
                                onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                                bg="white"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Default Duration (min)</FormLabel>
                            <Input 
                                type="number"
                                value={newType.default_duration || 50}
                                onChange={(e) => setNewType({ ...newType, default_duration: parseInt(e.target.value) })}
                                bg="white"
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center" mt={8}>
                            <FormLabel mb="0" fontSize="sm">Is Paid?</FormLabel>
                            <Checkbox 
                                colorScheme="teal"
                                isChecked={newType.is_paid !== false}
                                onChange={(e) => setNewType({ ...newType, is_paid: e.target.checked })}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0" fontSize="sm">Requires Patient?</FormLabel>
                            <Checkbox 
                                colorScheme="teal"
                                isChecked={newType.requires_client !== false}
                                onChange={(e) => setNewType({ ...newType, requires_client: e.target.checked })}
                            />
                        </FormControl>
                    </SimpleGrid>
                    
                    <FormControl>
                        <FormLabel fontSize="sm">Pre-filled Notes</FormLabel>
                        <Textarea 
                            placeholder="Standard notes for this session type..." 
                            value={newType.default_notes}
                            onChange={(e) => setNewType({ ...newType, default_notes: e.target.value })}
                            bg="white"
                        />
                    </FormControl>

                    <Button bg="#56756D" color="white" borderRadius="full" onClick={handleCreateType}>
                        Add New Event Type
                    </Button>
                </VStack>
            </VStack>
          </ModalBody>
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
