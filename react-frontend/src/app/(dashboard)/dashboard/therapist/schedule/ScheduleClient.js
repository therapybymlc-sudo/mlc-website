'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
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
  Avatar,
  SimpleGrid,
  Center,
  Divider,
  Checkbox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FiCalendar, FiPlus, FiClock, FiUser, FiFileText, FiTag, FiSettings, FiGlobe, FiAlertCircle, FiMaximize2, FiVideo, FiCopy } from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "../../../../../context/AuthContext";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const typeModal = useDisclosure(); 
  const oneOffModal = useDisclosure(); // New: Dedicated One-off Availability Modal

  const [mounted, setMounted] = useState(false);
  
  const [isFormView, setIsFormView] = useState(true);
  
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState(null);
  const [currentTherapistId, setCurrentTherapistId] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Clinical Session Form
  const [form, setForm] = useState({
    title: "",
    client: "",
    event_type: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "scheduled"
  });

  // One-off Availability Form
  const [oneOffForm, setOneOffForm] = useState({
      start_time: "",
      end_time: "",
      notes: ""
  });

  const [newType, setNewType] = useState({ 
    name: "", 
    color: "#D1E9FF",
    default_duration: 50,
    is_paid: true,
    requires_client: true,
    default_notes: "",
    group: "General",
    order: 0
  });

  const [editingType, setEditingType] = useState(null); 

  const SAFE_COLORS = [
    { name: "Sky Blue", hex: "#D1E9FF" },
    { name: "Mint Green", hex: "#D6F5D6" },
    { name: "Warm Gold", hex: "#FFF4D1" },
    { name: "Lavender", hex: "#FAD1FF" },
    { name: "Soft Peach", hex: "#FFE0D1" },
    { name: "Cool Grey", hex: "#E8E8E8" },
    { name: "Aqua", hex: "#D1FAF9" },
    { name: "Rose", hex: "#FFD1D1" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, clientRes, therapistRes, typesRes, appointmentRes] = await Promise.all([
        apiGet("schedule-events/"),
        apiGet("clients/"),
        apiGet("therapists/me/").catch(() => null),
        apiGet("event-types/").catch(() => []),
        apiGet("appointments/").catch(() => [])
      ]);

      const normalizedTypes = (Array.isArray(typesRes) ? typesRes : typesRes.results || [])
        .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

      setEventTypes(normalizedTypes);
      const typeMap = {};
      normalizedTypes.forEach(t => { typeMap[t.id] = t; });

      // Process Schedule Events
      const eventData = Array.isArray(eventRes) ? eventRes : eventRes.results || [];
      const scheduleEvents = eventData.map(ev => {
        const typeInfo = typeMap[ev.event_type] || {};
        return {
          id: `event-${ev.id}`,
          originalId: ev.id,
          model: 'schedule-event',
          title: ev.title,
          start: ev.start_time,
          end: ev.end_time,
          backgroundColor: ev.color || typeInfo.color || "#56756C",
          borderColor: ev.color || typeInfo.color || "#56756C",
          extendedProps: {
              client_id: ev.client,
              client_name: ev.client_name,
              event_type: ev.event_type,
              notes: ev.notes,
              status: ev.status,
          }
        };
      });

      // Process Booked Appointments
      const appointmentData = Array.isArray(appointmentRes) ? appointmentRes : appointmentRes.results || [];
      const bookedAppointments = appointmentData.map(apt => {
        return {
          id: `apt-${apt.id}`,
          originalId: apt.id,
          model: 'appointment',
          title: `[Booked] ${apt.client_name || 'Patient'}`,
          start: apt.start_time,
          end: apt.end_time,
          backgroundColor: "#2C8B9A", // Distinct color for booked appts
          borderColor: "#2C8B9A",
          extendedProps: {
              client_id: apt.client,
              client_name: apt.client_name,
              status: apt.status,
              notes: apt.notes,
              is_appointment: true
          }
        };
      });

      setEvents([...scheduleEvents, ...bookedAppointments]);
      setClients(Array.isArray(clientRes) ? clientRes : clientRes.results || []);

      if (therapistRes) {
        setCurrentTherapistId(therapistRes.id);
        if (therapistRes.business_hours) {
            const bh = [];
            Object.keys(therapistRes.business_hours).forEach(day => {
              const dayOfWeek = parseInt(day, 10);
              const daySlots = therapistRes.business_hours[day] || [];
              daySlots.forEach(slot => {
                if (typeof slot === 'string') {
                    const h = parseInt(slot.split(":")[0], 10);
                    bh.push({ daysOfWeek: [dayOfWeek], startTime: slot, endTime: `${String(h + 1).padStart(2, '0')}:00` });
                } else {
                    bh.push({ daysOfWeek: [dayOfWeek], startTime: slot.startTime, endTime: slot.endTime });
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

  const [slotHeight, setSlotHeight] = useState(2); 

  if (!mounted) {
      return (
          <Center minH="100vh" bg="#FDFDFD">
              <VStack spacing={4}>
                  <Spinner size="xl" color="#56756C" thickness="4px" />
                  <Text color="gray.500" fontWeight="600">Initializing Workspace...</Text>
              </VStack>
          </Center>
      );
  }

  const toLocalISO = (date) => {
      if (!date) return "";
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date - offset).toISOString().slice(0, 16);
  };

  const handleSelect = (info) => {
    setIsEditMode(false);
    setIsFormView(true);
    const start = new Date(info.start);
    const end = new Date(info.end);
    
    setForm({
      title: "",
      client: "",
      event_type: "",
      start_time: toLocalISO(start),
      end_time: toLocalISO(end),
      notes: "",
      status: "scheduled"
    });
    setSelectedEvent(null);
    onOpen();
  };

  const handleEventClick = (info) => {
    const { event } = info;
    setIsEditMode(true);
    setIsFormView(false);
    setSelectedEvent(event);

    setForm({
        title: event.title,
        client: event.extendedProps.client_id || "",
        event_type: event.extendedProps.event_type || "",
        start_time: toLocalISO(event.start),
        end_time: toLocalISO(event.end),
        notes: event.extendedProps.notes || "",
        status: event.extendedProps.status || "scheduled"
    });
    onOpen();
  };

  const SessionSummaryView = () => {
    const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
    const typeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
    
    // Defensive date string for hydration stability
    const [displayDate, setDisplayDate] = useState("");
    useEffect(() => {
        if (form.start_time) setDisplayDate(new Date(form.start_time).toLocaleString());
    }, [form.start_time]);

    return (
        <VStack spacing={0} align="stretch" bg="white" borderRadius="3xl" overflow="hidden">
            {/* Command Header */}
            <Box bg="#2C8B9A" p={10} color="white">
                <VStack align="start" spacing={1}>
                    <Heading size="md" fontWeight="800" letterSpacing="tight">{typeObj?.name || form.title || "Clinical Session"}</Heading>
                    <Divider borderColor="whiteAlpha.400" my={4} />
                    <HStack spacing={4}>
                        <Avatar size="md" name={selectedClientObj?.name} bg="whiteAlpha.200" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold">{selectedClientObj?.name || "Patient Unknown"}</Text>
                            <Text fontSize="sm" opacity={0.9}>{displayDate}</Text>
                        </VStack>
                    </HStack>
                    <Button 
                        mt={6} 
                        leftIcon={<FiVideo />} 
                        bg="#E74C3C" 
                        color="white" 
                        size="md" 
                        px={10} 
                        borderRadius="full"
                        onClick={() => {
                            const rawId = selectedEvent.extendedProps?.originalId || selectedEvent.id.replace(/^(apt|event)-/, "");
                            const room = `MLC_${rawId}`;
                            console.log("🌿 [Schedule] Joining video room:", room);
                            window.open(`/conference/${room}`, '_blank');
                        }}
                        _hover={{ bg: '#C0392B' }}
                    >
                        Join video call
                    </Button>
                </VStack>
            </Box>

            <ModalBody p={10}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    {/* Patient Details */}
                    <VStack align="start" spacing={4}>
                        <Box>
                            <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="widest" mb={2}>PATIENT CONTACT</Text>
                            <VStack align="start" spacing={2}>
                                <HStack color="#2C8B9A"><Icon as={FiUser} /><Text fontWeight="bold">{selectedClientObj?.name}</Text></HStack>
                                <HStack color="gray.600" fontSize="sm"><Icon as={FiClock} /><Text>{selectedClientObj?.phone_number || "No Phone Registered"}</Text></HStack>
                                <HStack color="gray.600" fontSize="sm"><Icon as={FiGlobe} /><Text>{selectedClientObj?.email || "No Email Registered"}</Text></HStack>
                            </VStack>
                        </Box>
                        
                        <Box pt={4}>
                            <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="widest" mb={2}>SESSION NOTES</Text>
                            <Text fontSize="sm" color="gray.700" fontStyle={!form.notes ? "italic" : "normal"}>
                                {form.notes || "No private notes for this session."}
                            </Text>
                        </Box>
                    </VStack>

                    {/* Operational Toggles */}
                    <VStack align="stretch" spacing={4}>
                        <Box bg="gray.50" p={5} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                             <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="widest" mb={4}>ATTENDANCE</Text>
                             <VStack align="stretch" spacing={2}>
                                <Button size="sm" colorScheme="teal" variant={form.status === 'arrived' ? 'solid' : 'outline'} borderRadius="xl" onClick={() => { setForm({...form, status: 'arrived'}); handleUpdate(); }}>Mark as Arrived</Button>
                                <Button size="sm" colorScheme="red" variant={form.status === 'no_show' ? 'solid' : 'outline'} borderRadius="xl" onClick={() => { setForm({...form, status: 'no_show'}); handleUpdate(); }}>No Show</Button>
                                <Button size="sm" colorScheme="green" variant={form.status === 'completed' ? 'solid' : 'outline'} borderRadius="xl" onClick={() => { setForm({...form, status: 'completed'}); handleUpdate(); }}>Session Completed</Button>
                             </VStack>
                        </Box>
                        
                        <Button 
                            leftIcon={<FiFileText />} 
                            variant="outline" 
                            borderColor="#2C8B9A" 
                            color="#2C8B9A"
                            borderRadius="xl"
                            onClick={() => {
                                const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;
                                router.push(`/dashboard/therapist/clients?id=${form.client}&section=notes&appointmentId=${originalId}&eventTypeId=${form.event_type}`);
                            }}
                        >
                            Treatment notes
                        </Button>
                        <Button 
                            leftIcon={<FiCopy />} 
                            variant="ghost" 
                            size="sm" 
                            color="gray.500"
                            onClick={() => {
                                const room = `https://mlchealth.in/conference/MLC_${selectedEvent.extendedProps.originalId || selectedEvent.id}`;
                                navigator.clipboard.writeText(room);
                                toast({ title: "Invite link copied", status: "success" });
                            }}
                        >
                            Copy video invite link
                        </Button>
                    </VStack>
                </SimpleGrid>
            </ModalBody>

            <ModalFooter bg="gray.100" p={6} borderBottomRadius="3xl">
                <HStack w="full" justify="space-between">
                    <HStack spacing={4}>
                       <Button size="sm" variant="ghost" color="gray.600" onClick={() => setIsFormView(true)}>Edit Details</Button>
                       <Button size="sm" variant="ghost" color="red.500" onClick={handleDelete}>Cancel Session</Button>
                    </HStack>
                    <Button px={8} borderRadius="full" bg="#56756C" color="white" onClick={onClose}>Close</Button>
                </HStack>
            </ModalFooter>
        </VStack>
    );
  };

  const SessionFormView = () => (
    <>
      <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={6}>
        <HStack spacing={4}>
            <Box p={3} bg="teal.50" borderRadius="xl"><Icon as={FiCalendar} color="teal.500" /></Box>
            <VStack align="start" spacing={0}>
                <Heading size="md" color="gray.700">{isEditMode ? "Edit Session Details" : "New Clinical Appointment"}</Heading>
                <Text fontSize="xs" color="gray.400" fontWeight="bold" letterSpacing="wider">SCHEDULING COCKPIT</Text>
            </VStack>
        </HStack>
      </ModalHeader>
      <ModalCloseButton borderRadius="full" m={2} />
      <ModalBody py={10} px={10}>
        <VStack spacing={8} align="stretch">
            <FormControl isRequired>
                <FormLabel fontWeight="700" color="gray.600">Event Type</FormLabel>
                <Select 
                    placeholder="Select clinical model..." 
                    value={form.event_type}
                    onChange={(e) => {
                        const typeId = e.target.value;
                        const typeObj = eventTypes.find(t => String(t.id) === String(typeId));
                        if (typeObj && !isEditMode) {
                            const start = new Date(form.start_time);
                            const end = new Date(start.getTime() + (typeObj.default_duration || 50) * 60000);
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
                    borderRadius="xl" h={12}
                >
                    {Object.entries(eventTypes.reduce((acc, t) => {
                        const g = t.group || "General";
                        if (!acc[g]) acc[g] = [];
                        acc[g].push(t);
                        return acc;
                    }, {})).map(([groupName, types]) => (
                        <optgroup label={groupName} key={groupName}>
                            {types.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel fontWeight="700" color="gray.600">Patient</FormLabel>
                <Select 
                    placeholder="Select client (optional)" 
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    borderRadius="xl" h={12}
                >
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel fontWeight="700" color="gray.600">Session Name (Optional overridden title)</FormLabel>
                <Input 
                    placeholder="e.g. Art Therapy Follow-up" 
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    borderRadius="xl" h={12}
                />
            </FormControl>

            <SimpleGrid columns={2} spacing={6}>
                <FormControl isRequired>
                    <FormLabel fontWeight="700" color="gray.600">Start Time</FormLabel>
                    <Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} borderRadius="xl" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel fontWeight="700" color="gray.600">End Time</FormLabel>
                    <Input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} borderRadius="xl" />
                </FormControl>
            </SimpleGrid>

            <FormControl>
                <FormLabel fontWeight="700" color="gray.600">Clinical Notes</FormLabel>
                <Textarea 
                    placeholder="Private notes for the session..." 
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    borderRadius="2xl" rows={4}
                />
            </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter pb={8} px={10}>
          <HStack w="full" justify="space-between">
              <Button variant="ghost" onClick={isEditMode ? () => setIsFormView(false) : onClose} borderRadius="full">Back</Button>
              <Button bg="#56756C" color="white" borderRadius="full" px={10} onClick={isEditMode ? handleUpdate : handleCreate} _hover={{ bg: '#3E5B54' }}>
                  {isEditMode ? "Save Changes" : "Confirm Booking"}
              </Button>
          </HStack>
      </ModalFooter>
    </>
  );

  const handleCreateType = async () => {
    if (!newType.name.trim()) return;
    try {
        if (editingType) {
            await apiPut(`event-types/${editingType.id}/`, newType);
            toast({ title: "Event type updated", status: "success" });
        } else {
            await apiPost("event-types/", newType);
            toast({ title: "Event type created", status: "success" });
        }
        setNewType({ name: "", color: "#D1E9FF", default_duration: 50, is_paid: true, requires_client: true, default_notes: "", group: "General", order: 0 });
        setEditingType(null);
        typeModal.onClose();
        fetchData();
    } catch (err) {
        toast({ title: "Failed to save type", status: "error" });
    }
  };

  const startEditType = (type) => {
      setEditingType(type);
      setNewType({
          name: type.name,
          color: type.color,
          default_duration: type.default_duration,
          is_paid: type.is_paid,
          requires_client: type.requires_client,
          default_notes: type.default_notes,
          group: type.group || "General",
          order: type.order || 0
      });
  };

  const handleCreate = async () => {
    if (!form.start_time || !form.end_time || !currentTherapistId) return;
    try {
        const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
        const selectedTypeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
        
        const payload = {
          title: form.title || (selectedClientObj ? selectedClientObj.name : (selectedTypeObj?.name || "Clinical Session")),
          therapist: currentTherapistId,
          client: form.client ? Number(form.client) : null,
          event_type: form.event_type ? Number(form.event_type) : null,
          start_time: form.start_time,
          end_time: form.end_time,
          notes: form.notes,
          status: form.status || "scheduled",
          color: selectedTypeObj?.color || "#E8E8E8",
        };
        await apiPost("schedule-events/", payload);
        toast({ title: "Appointment created", status: "success" });
        onClose();
        fetchData();
    } catch (err) {
      toast({ title: "Process failed", status: "error" });
    }
  };

  const handleCreateOneOff = async () => {
      if (!oneOffForm.start_time || !oneOffForm.end_time || !currentTherapistId) return;
      try {
          const payload = {
              therapist: currentTherapistId,
              start_time: oneOffForm.start_time,
              end_time: oneOffForm.end_time,
              status: "open",
              visible_to_clients: true,
              notes: oneOffForm.notes
          };
          await apiPost("availability-slots/", payload);
          toast({ title: "Availability slot published", status: "success" });
          oneOffModal.onClose();
          fetchData();
      } catch (err) {
          toast({ title: "Failed to publish slot", status: "error" });
      }
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !currentTherapistId) return;
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;

    try {
      const selectedTypeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
      const payload = {
        title: form.title,
        therapist: currentTherapistId,
        client: form.client ? Number(form.client) : null,
        event_type: form.event_type ? Number(form.event_type) : null,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes,
        status: form.status,
        color: selectedTypeObj?.color || selectedEvent.backgroundColor,
      };

      const endpoint = selectedEvent.extendedProps?.model === 'appointment' 
        ? 'appointments' 
        : 'schedule-events';

      await apiPut(`${endpoint}/${originalId}/`, payload);
      toast({ title: "Session updated", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const endpoint = selectedEvent.extendedProps?.model === 'appointment' 
        ? 'appointments' 
        : 'schedule-events';

      await apiDelete(`${endpoint}/${originalId}/`);
      toast({ title: "Deleted", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Delete failed", status: "error" });
    }
  };


  return (
    <VStack align="stretch" spacing={6} p={{ base: 4, md: 8 }} bg="#FDFDFD" minH="100vh">
      <VStack align="stretch" spacing={4} mb={4}>
        {/* Title - always on its own line */}
        <VStack align="start" spacing={0}>
            <Heading size="lg" color="#2E2E2E" fontWeight="800" whiteSpace="nowrap">Clinical Schedule</Heading>
            <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">Manage your therapeutic sessions and availability.</Text>
        </VStack>
        
        {/* Controls row */}
        <Flex 
            direction={{ base: "column", sm: "row" }}
            gap={4}
            w="full"
            align={{ base: "stretch", sm: "center" }}
            justify="space-between"
        >
            {/* Scalability Slider - Hidden on mobile */}
            <HStack 
                spacing={4} 
                bg="white" 
                p={2} 
                px={4} 
                borderRadius="full" 
                shadow="sm" 
                border="1px solid" 
                borderColor="gray.100"
                display={{ base: "none", md: "flex" }}
            >
                <Icon as={FiMaximize2} color="gray.400" />
                <Text fontSize="xs" fontWeight="700" color="gray.500" whiteSpace="nowrap">View Scale</Text>
                <Slider aria-label="Scale View" min={1.5} max={6} step={0.5} w="120px" defaultValue={2} onChange={(v) => setSlotHeight(v)}>
                    <SliderTrack bg="gray.100">
                        <SliderFilledTrack bg="#56756C" />
                    </SliderTrack>
                    <SliderThumb boxSize={4} border="2px solid" borderColor="#56756C" />
                </Slider>
            </HStack>

            <Flex 
                direction={{ base: "column", lg: "row" }}
                gap={3}
                w={{ base: "full", lg: "auto" }}
            >
                {isAdmin && (
                    <Button variant="ghost" leftIcon={<FiSettings />} borderRadius="full" onClick={typeModal.onOpen} size={{ base: "sm", md: "md" }}>Manage Types</Button>
                )}
                <Button variant="outline" borderRadius="full" leftIcon={<FiGlobe />} onClick={oneOffModal.onOpen} borderColor="#56756D" color="#56756D" _hover={{ bg: 'gray.50' }} size={{ base: "sm", md: "md" }}>
                    One-off Availability
                </Button>
                <Button leftIcon={<FiPlus />} bg="#56756D" color="white" borderRadius="full" px={6} onClick={() => { setIsEditMode(false); setForm({ title: "", client: "", event_type: "", start_time: "", end_time: "", notes: "" }); onOpen(); }} _hover={{ bg: '#C9A960' }} size={{ base: "sm", md: "md" }}>
                  Add Session
                </Button>
            </Flex>
        </Flex>
      </VStack>

      <Box 
          bg="white" 
          p={{ base: 2, md: 6 }} 
          borderRadius={{ base: "xl", md: "2xl" }} 
          shadow="xl" 
          border="1px solid" 
          borderColor="gray.100" 
          overflow="hidden"
          sx={{
              ".fc": { fontFamily: "inherit" },
              ".fc-timegrid-slot": { 
                  height: `${slotHeight}rem`,
                  borderColor: "gray.50"
              },
              ".fc-business-hour": { backgroundColor: "rgba(169, 203, 183, 0.12) !important" },
              ".fc-non-business": { backgroundColor: "#F8F9FA !important" },
              ".fc-event": {
                  borderRadius: "2px",
                  borderLeft: "4px solid rgba(0,0,0,0.1)",
                  boxShadow: "sm",
                  padding: "0",
                  color: "black !important",
                  overflow: "hidden"
              },
              ".fc-event-main": {
                  padding: "0",
                  color: "black !important"
              },
              ".fc-toolbar-title": { fontSize: { base: "0.8rem", sm: "0.9rem", md: "1.1rem" }, fontWeight: "800", color: "#2E2E2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
              ".fc-button": { padding: { base: "4px 6px", md: "8px 16px" }, fontSize: { base: "0.6rem", md: "0.85rem" }, whiteSpace: "nowrap" },
              ".fc-header-toolbar": { gap: { base: 1, md: 4 }, flexWrap: "nowrap !important", overflow: "hidden" },
              ".fc-col-header-cell-cushion": { 
                  whiteSpace: "nowrap !important", 
                  fontSize: { base: "0.6rem", sm: "0.75rem", md: "0.85rem" },
                  padding: "2px !important",
                  display: "block !important"
              },
              ".fc-timegrid-axis-cushion": { fontSize: { base: "0.6rem", md: "0.8rem" } }
          }}
      >
        {mounted ? (
          <Box 
            overflowX="auto" 
            w="full" 
            pb={4} 
            cursor="grab" 
            _active={{ cursor: 'grabbing' }}
            position="relative"
            css={{
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { background: '#F8F9FA' },
              '&::-webkit-scrollbar-thumb': { background: '#D1D5DB', borderRadius: '10px' },
            }}
          >
            <Box minW={{ base: "1000px", md: "100%" }} position="relative">
              <FullCalendarComponent 
                  events={events} 
                  onSelect={handleSelect}
                  onEventClick={handleEventClick}
                  businessHours={businessHours}
                  initialView="timeGridWeek"
                  dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
              eventContent={(arg) => {
                  const start = arg.event.startStr.split('T')[1]?.slice(0, 5) || "";
                  const end = arg.event.endStr.split('T')[1]?.slice(0, 5) || "";
                  
                  // Even more aggressive mobile scaling to prevent warping
                  const titleSize = { base: "0.6rem", md: `${Math.max(0.7, Math.min(0.9, 0.55 + (slotHeight * 0.1)))}rem` };
                  const timeSize = { base: "0.5rem", md: `${Math.max(0.6, Math.min(0.8, 0.45 + (slotHeight * 0.08)))}rem` };

                  return (
                      <VStack align="start" spacing={0} p={1} h="full" justify="flex-start" overflow="hidden" minW={0}>
                          <Text 
                            fontWeight="900 !important" 
                            fontSize={titleSize} 
                            color="black !important" 
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            w="full" 
                            lineHeight="1.1"
                            display="block"
                          >
                              {arg.event.title}
                          </Text>
                          <Text 
                            fontWeight="800 !important" 
                            fontSize={timeSize} 
                            color="black !important" 
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            opacity={0.9}
                            lineHeight="1"
                            w="full"
                            display="block"
                          >
                              {start} - {end}
                          </Text>
                      </VStack>
                  );
              }}
          />
            </Box>
          </Box>
        ) : (
          <Center h="400px"><Spinner /></Center>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
           {isFormView ? <SessionFormView /> : <SessionSummaryView />}
        </ModalContent>
      </Modal>

      <Modal isOpen={oneOffModal.isOpen} onClose={oneOffModal.onClose} size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <HStack>
                <Icon as={FiGlobe} color="#56756C" />
                <Text>One-off Availability</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={6} mr={6} />
          <ModalBody>
            <VStack spacing={6}>
                <Box bg="#F0F9F4" p={4} borderRadius="2xl" border="1px solid" borderColor="#A9CBB7">
                    <HStack align="start">
                        <Icon as={FiAlertCircle} color="#56756D" mt={1} />
                        <Text fontSize="sm" color="#2E2E2E">
                            <strong>Client-Facing Slot:</strong> Publishing this time will make it immediately visible and bookable for clients on the website discovery portal.
                        </Text>
                    </HStack>
                </Box>

                <SimpleGrid columns={2} spacing={4} w="full">
                    <FormControl isRequired>
                        <FormLabel fontWeight="700" color="gray.600">Start Time</FormLabel>
                        <Input type="datetime-local" value={oneOffForm.start_time} onChange={(e) => setOneOffForm({ ...oneOffForm, start_time: e.target.value })} borderRadius="xl" />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel fontWeight="700" color="gray.600">End Time</FormLabel>
                        <Input type="datetime-local" value={oneOffForm.end_time} onChange={(e) => setOneOffForm({ ...oneOffForm, end_time: e.target.value })} borderRadius="xl" />
                    </FormControl>
                </SimpleGrid>

                <FormControl>
                    <FormLabel fontWeight="700" color="gray.600">Internal Memo (Optional)</FormLabel>
                    <Textarea 
                        placeholder="Why is this slot being opened?" 
                        value={oneOffForm.notes}
                        onChange={(e) => setOneOffForm({ ...oneOffForm, notes: e.target.value })}
                        borderRadius="2xl"
                    />
                </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pb={8}>
            <Button variant="ghost" mr={3} onClick={oneOffModal.onClose} borderRadius="full">Cancel</Button>
            <Button bg="#56756C" color="white" borderRadius="full" px={10} onClick={handleCreateOneOff}>Publish Slot</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                            <HStack key={t.id} justify="space-between" p={3} bg="gray.50" borderRadius="xl" _hover={{ bg: 'gray.100' }}>
                                <HStack>
                                    <Box w={3} h={3} borderRadius="full" bg={t.color} />
                                    <Text fontWeight="600">{t.name}</Text>
                                    <Text fontSize="xs" color="gray.400">({t.default_duration}m)</Text>
                                </HStack>
                                <Button size="xs" variant="ghost" onClick={() => startEditType(t)}>Edit</Button>
                            </HStack>
                        ))}
                    </SimpleGrid>
                </Box>

                <Divider />

                <VStack spacing={4} align="stretch" bg="gray.50" p={6} borderRadius="2xl">
                    <Text fontWeight="700" fontSize="sm" color="gray.500">
                        {editingType ? `EDITING: ${editingType.name}` : "CREATE NEW TYPE"}
                    </Text>
                    <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm">Type Name</FormLabel>
                            <Input placeholder="e.g. Lunch" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} bg="white" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Section / Group</FormLabel>
                            <Input placeholder="e.g. Clinical" value={newType.group} onChange={(e) => setNewType({ ...newType, group: e.target.value })} bg="white" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Display Order</FormLabel>
                            <Input type="number" value={newType.order} onChange={(e) => setNewType({ ...newType, order: parseInt(e.target.value) })} bg="white" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Default Duration (min)</FormLabel>
                            <Input type="number" value={newType.default_duration} onChange={(e) => setNewType({ ...newType, default_duration: parseInt(e.target.value) })} bg="white" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Pick Theme Color</FormLabel>
                            <SimpleGrid columns={4} spacing={2}>
                                {SAFE_COLORS.map(c => (
                                    <Box 
                                        key={c.hex} 
                                        w="full" h={8} borderRadius="md" bg={c.hex} cursor="pointer" 
                                        border={newType.color === c.hex ? "2px solid" : "none"}
                                        borderColor="#56756C"
                                        onClick={() => setNewType({ ...newType, color: c.hex })}
                                        title={c.name}
                                    />
                                ))}
                            </SimpleGrid>
                        </FormControl>
                        <FormControl display="flex" alignItems="center" mt={8}>
                            <FormLabel mb="0" fontSize="sm">Is Paid?</FormLabel>
                            <Checkbox colorScheme="teal" isChecked={newType.is_paid} onChange={(e) => setNewType({ ...newType, is_paid: e.target.checked })} />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0" fontSize="sm">Requires Patient?</FormLabel>
                            <Checkbox colorScheme="teal" isChecked={newType.requires_client} onChange={(e) => setNewType({ ...newType, requires_client: e.target.checked })} />
                        </FormControl>
                    </SimpleGrid>
                    
                    <FormControl>
                        <FormLabel fontSize="sm">Pre-filled Notes</FormLabel>
                        <Textarea placeholder="Standard notes for this session type..." value={newType.default_notes} onChange={(e) => setNewType({ ...newType, default_notes: e.target.value })} bg="white" />
                    </FormControl>

                    <HStack>
                        {editingType && (
                            <Button variant="ghost" onClick={() => { setEditingType(null); setNewType({ name: "", color: "#D1E9FF", default_duration: 50, is_paid: true, requires_client: true, default_notes: "" }); }}>Cancel Edit</Button>
                        )}
                        <Button flex={1} bg="#56756D" color="white" borderRadius="full" onClick={handleCreateType}>
                            {editingType ? "Update Event Type" : "Add New Event Type"}
                        </Button>
                    </HStack>
                </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
