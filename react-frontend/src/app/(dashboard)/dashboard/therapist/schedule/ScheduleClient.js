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
import { FiCalendar, FiPlus, FiClock, FiUser, FiFileText, FiTag, FiSettings, FiGlobe, FiAlertCircle, FiMaximize2, FiVideo, FiCopy, FiChevronUp, FiChevronDown, FiTrash2 } from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../../../../../api.js";
import { schedulingApi } from "../../../../../api/scheduling";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "../../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
import SubscriptionWall from "../../../../../components/SubscriptionWall";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";

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
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();
  
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
    status: "scheduled",
    repeat_enabled: false,
    repeat_interval: "weekly",
    repeat_count: 1,
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
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

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
      const [eventRes, clientRes, therapistRes, typesRes, appointmentRes, bookingReqRes] = await Promise.all([
        apiGet("schedule-events/"),
        apiGet("clients/"),
        apiGet("therapists/me/").catch(() => null),
        apiGet("event-types/").catch(() => []),
        apiGet("appointments/").catch(() => []),
        apiGet("therapist-booking-requests/").catch(() => []),
      ]);
      const brList = Array.isArray(bookingReqRes) ? bookingReqRes : (bookingReqRes?.results || []);
      setPendingBookingCount(brList.filter((r) => r.status === "pending").length);

      const normalizedTypes = (Array.isArray(typesRes) ? typesRes : typesRes.results || [])
        .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

      setEventTypes(normalizedTypes);
      const typeMap = {};
      normalizedTypes.forEach(t => { typeMap[t.id] = t; });

      // Process Schedule Events
      const eventData = Array.isArray(eventRes) ? eventRes : eventRes.results || [];
      const appointmentData = Array.isArray(appointmentRes) ? appointmentRes : appointmentRes.results || [];
      const linkedAppointmentByScheduleEvent = {};
      appointmentData.forEach((apt) => {
        if (apt.schedule_event) {
          linkedAppointmentByScheduleEvent[String(apt.schedule_event)] = apt;
        }
      });
      const scheduleEvents = eventData.map(ev => {
        const typeInfo = typeMap[ev.event_type] || {};
        const linkedAppointment = linkedAppointmentByScheduleEvent[String(ev.id)];
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
              attendance_status: ev.attendance_status,
              appointment_id: linkedAppointment?.id || null,
              appointment_status: linkedAppointment?.status || null,
          }
        };
      });

      // Process Booked Appointments (skip rows mirrored from schedule events — those render as schedule-events)
      const bookedAppointments = appointmentData
        .filter((apt) => !apt.schedule_event && !!apt.booking_request)
        .map((apt) => {
        return {
          id: `apt-${apt.id}`,
          originalId: apt.id,
          model: 'appointment',
          title: `[Booked] ${apt.client_name || apt.client_display_name || 'Patient'}`,
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
    if (!requireBasicAccess()) return;
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
      status: "scheduled",
      repeat_enabled: false,
      repeat_interval: "weekly",
      repeat_count: 1,
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
        status: event.extendedProps.appointment_status || event.extendedProps.status || "scheduled",
        attendance_status: event.extendedProps.attendance_status || "",
        repeat_enabled: false,
        repeat_interval: "weekly",
        repeat_count: 1,
    });
    onOpen();
  };

  const SessionSummaryView = () => {
    const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
    const typeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
    const displayDate = form.start_time ? new Date(form.start_time).toLocaleString() : "";

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
                                <Button
                                  size="sm"
                                  colorScheme="teal"
                                  variant={selectedEvent?.extendedProps?.attendance_status === 'arrived' ? 'solid' : 'outline'}
                                  borderRadius="xl"
                                  onClick={() => handleUpdate({ attendance_status: "arrived" }, { closeAfterSave: false })}
                                >
                                  Mark as Arrived
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant={selectedEvent?.extendedProps?.attendance_status === 'did_not_arrive' ? 'solid' : 'outline'}
                                  borderRadius="xl"
                                  onClick={() => handleUpdate({ attendance_status: "did_not_arrive" }, { closeAfterSave: false })}
                                >
                                  No Show
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  variant={form.status === 'completed' ? 'solid' : 'outline'}
                                  borderRadius="xl"
                                  onClick={async () => {
                                    const linkedAppointmentId = selectedEvent?.extendedProps?.appointment_id;
                                    if (!linkedAppointmentId) {
                                      toast({ title: "No linked appointment to complete", status: "warning" });
                                      return;
                                    }
                                    try {
                                      await apiPost(`appointments/${linkedAppointmentId}/mark_completed/`, {});
                                      setForm((prev) => ({ ...prev, status: "completed" }));
                                      setEvents((prev) =>
                                        prev.map((ev) =>
                                          ev.id === selectedEvent.id
                                            ? {
                                                ...ev,
                                                extendedProps: {
                                                  ...ev.extendedProps,
                                                  appointment_status: "completed",
                                                },
                                              }
                                            : ev
                                        )
                                      );
                                      toast({ title: "Session marked completed", status: "success" });
                                    } catch (_e) {
                                      toast({ title: "Could not mark completed", status: "error" });
                                    }
                                  }}
                                >
                                  Session Completed
                                </Button>
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

            {!isEditMode && (
              <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                <VStack align="stretch" spacing={3}>
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontWeight="700" color="gray.600">Repeat this event</FormLabel>
                    <Checkbox
                      colorScheme="teal"
                      isChecked={Boolean(form.repeat_enabled)}
                      onChange={(e) => setForm({ ...form, repeat_enabled: e.target.checked })}
                    />
                  </FormControl>
                  {form.repeat_enabled && (
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.600">Repeat every</FormLabel>
                        <Select
                          value={form.repeat_interval || "weekly"}
                          onChange={(e) => setForm({ ...form, repeat_interval: e.target.value })}
                          borderRadius="lg"
                          bg="white"
                        >
                          <option value="daily">Day</option>
                          <option value="weekly">Week</option>
                          <option value="monthly">Month</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.600">Total occurrences</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          max={52}
                          value={form.repeat_count ?? 1}
                          onChange={(e) => setForm({ ...form, repeat_count: e.target.value })}
                          borderRadius="lg"
                          bg="white"
                        />
                      </FormControl>
                    </SimpleGrid>
                  )}
                </VStack>
              </Box>
            )}

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

  const handleDeleteType = async (type) => {
    if (!type?.id) return;
    if (!window.confirm(`Delete "${type.name}" event type? Existing sessions will keep running.`)) return;
    try {
      await apiDelete(`event-types/${type.id}/`);
      if (editingType?.id === type.id) {
        setEditingType(null);
      }
      toast({ title: "Event type deleted", status: "success" });
      fetchData();
    } catch (err) {
      toast({ title: "Failed to delete type", status: "error" });
    }
  };

  const handleMoveType = async (typeId, direction) => {
    const sorted = [...eventTypes].sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
    const currentIndex = sorted.findIndex((t) => t.id === typeId);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      const updates = reordered
        .map((t, idx) => ({ id: t.id, order: idx + 1 }))
        .filter((entry) => {
          const prev = sorted.find((s) => s.id === entry.id);
          return (prev?.order ?? 0) !== entry.order;
        });
      await Promise.all(updates.map((entry) => apiPatch(`event-types/${entry.id}/`, { order: entry.order })));
      toast({ title: "Event type order updated", status: "success" });
      fetchData();
    } catch (err) {
      toast({ title: "Failed to reorder event types", status: "error" });
    }
  };

  const handleCreate = async () => {
    if (!requireBasicAccess()) return;
    if (!form.start_time || !form.end_time || !currentTherapistId) return;
    try {
        const selectedClientObj = clients.find(c => String(c.id) === String(form.client));
        const selectedTypeObj = eventTypes.find(t => String(t.id) === String(form.event_type));
        const baseStart = new Date(form.start_time);
        const baseEnd = new Date(form.end_time);
        const repeatCount = form.repeat_enabled ? Math.max(1, parseInt(form.repeat_count, 10) || 1) : 1;

        const shiftDate = (dateObj, interval, step) => {
          const next = new Date(dateObj);
          if (interval === "daily") next.setDate(next.getDate() + step);
          else if (interval === "monthly") next.setMonth(next.getMonth() + step);
          else next.setDate(next.getDate() + (7 * step)); // weekly default
          return next;
        };

        for (let i = 0; i < repeatCount; i += 1) {
          const startAt = i === 0 ? baseStart : shiftDate(baseStart, form.repeat_interval, i);
          const endAt = i === 0 ? baseEnd : shiftDate(baseEnd, form.repeat_interval, i);
          const payload = {
            title: form.title || (selectedClientObj ? selectedClientObj.name : (selectedTypeObj?.name || "Clinical Session")),
            therapist: currentTherapistId,
            client: form.client ? Number(form.client) : null,
            event_type: form.event_type ? Number(form.event_type) : null,
            start_time: toLocalISO(startAt),
            end_time: toLocalISO(endAt),
            notes: form.notes,
            status: form.status || "scheduled",
            color: selectedTypeObj?.color || "#E8E8E8",
          };
          // eslint-disable-next-line no-await-in-loop
          await apiPost("schedule-events/", payload);
        }
        toast({ title: repeatCount > 1 ? `${repeatCount} repeating sessions created` : "Appointment created", status: "success" });
        onClose();
        fetchData();
    } catch (err) {
      toast({ title: "Process failed", status: "error" });
    }
  };

  const handleCreateOneOff = async () => {
      if (!requireBasicAccess()) return;
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

  const handleUpdate = async (overrides = {}, options = {}) => {
    const { closeAfterSave = true } = options;
    if (!requireBasicAccess()) return;
    if (!selectedEvent || !currentTherapistId) return;
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;
    const nextForm = { ...form, ...overrides };

    try {
      const selectedTypeObj = eventTypes.find(t => String(t.id) === String(nextForm.event_type));
      const payload = {
        title: nextForm.title,
        therapist: currentTherapistId,
        client: nextForm.client ? Number(nextForm.client) : null,
        event_type: nextForm.event_type ? Number(nextForm.event_type) : null,
        start_time: nextForm.start_time,
        end_time: nextForm.end_time,
        notes: nextForm.notes,
        status: nextForm.status,
        color: selectedTypeObj?.color || selectedEvent.backgroundColor,
      };

      const endpoint = selectedEvent.extendedProps?.model === 'appointment' 
        ? 'appointments' 
        : 'schedule-events';
      if (endpoint === "schedule-events") {
        payload.attendance_status = nextForm.attendance_status ?? selectedEvent.extendedProps?.attendance_status ?? null;
      }

      await apiPut(`${endpoint}/${originalId}/`, payload);
      setForm(nextForm);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id
            ? {
                ...ev,
                extendedProps: {
                  ...ev.extendedProps,
                  attendance_status:
                    endpoint === "schedule-events"
                      ? payload.attendance_status
                      : ev.extendedProps.attendance_status,
                  appointment_status:
                    endpoint === "appointments"
                      ? payload.status
                      : (ev.extendedProps.appointment_status || payload.status),
                  notes: payload.notes,
                },
              }
            : ev
        )
      );
      if (selectedEvent?.setExtendedProp) {
        if (endpoint === "schedule-events") {
          selectedEvent.setExtendedProp("attendance_status", payload.attendance_status);
        }
        if (endpoint === "appointments") {
          selectedEvent.setExtendedProp("appointment_status", payload.status);
        }
      }
      toast({ title: "Session updated", status: "success" });
      if (closeAfterSave) {
        onClose();
        fetchData();
      }
    } catch (err) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!requireBasicAccess()) return;
    if (!selectedEvent) return;
    const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const isAppointment = selectedEvent.extendedProps?.model === "appointment";
      if (isAppointment) {
        await schedulingApi.cancelTherapistAppointment(originalId, "Cancelled by therapist from calendar");
      } else {
        await apiDelete(`schedule-events/${originalId}/`);
      }
      toast({ title: "Deleted", status: "success" });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  const handleEventResize = async (info) => {
    if (!requireBasicAccess()) {
      info.revert();
      return;
    }
    const { event, revert } = info;
    const model = event.extendedProps?.model || (String(event.id).startsWith("apt-") ? "appointment" : "schedule-event");
    const originalId = event.extendedProps?.originalId || String(event.id).replace(/^(apt|event)-/, "");
    const endpoint = model === "appointment" ? "appointments" : "schedule-events";

    try {
      const payload = {
        title: event.title,
        therapist: currentTherapistId,
        client: event.extendedProps?.client_id ? Number(event.extendedProps.client_id) : null,
        event_type: event.extendedProps?.event_type ? Number(event.extendedProps.event_type) : null,
        start_time: event.start ? toLocalISO(event.start) : null,
        end_time: event.end ? toLocalISO(event.end) : null,
        notes: event.extendedProps?.notes || "",
        status: event.extendedProps?.status || "scheduled",
      };
      await apiPut(`${endpoint}/${originalId}/`, payload);
      toast({ title: "Session duration updated", status: "success" });
      fetchData();
    } catch (err) {
      revert();
      toast({ title: "Could not resize session", status: "error" });
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

        {pendingBookingCount > 0 && (
          <Box
            as={NextLink}
            href="/dashboard/therapist/booking-requests"
            w="full"
            py={3}
            px={4}
            borderRadius="xl"
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            _hover={{ bg: "orange.100" }}
            display="block"
          >
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack>
                <Icon as={FiAlertCircle} color="orange.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  {pendingBookingCount} pending booking request{pendingBookingCount === 1 ? "" : "s"} need your response
                </Text>
              </HStack>
              <Text fontSize="sm" color="teal.700" fontWeight="600">
                Review & respond →
              </Text>
            </HStack>
          </Box>
        )}
        
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
                    <Button variant="ghost" leftIcon={<FiSettings />} borderRadius="full" onClick={() => requireBasicAccess(typeModal.onOpen)} size={{ base: "sm", md: "md" }}>Manage Types</Button>
                )}
                <Button variant="outline" borderRadius="full" leftIcon={<FiGlobe />} onClick={() => requireBasicAccess(oneOffModal.onOpen)} borderColor="#56756D" color="#56756D" _hover={{ bg: 'gray.50' }} size={{ base: "sm", md: "md" }}>
                    One-off Availability
                </Button>
                <Button leftIcon={<FiPlus />} bg="#56756D" color="white" borderRadius="full" px={6} onClick={() => requireBasicAccess(() => { setIsEditMode(false); setForm({ title: "", client: "", event_type: "", start_time: "", end_time: "", notes: "", status: "scheduled", repeat_enabled: false, repeat_interval: "weekly", repeat_count: 1 }); onOpen(); })} _hover={{ bg: '#C9A960' }} size={{ base: "sm", md: "md" }}>
                  Add Session
                </Button>
            </Flex>
        </Flex>
      </VStack>

      {!hasBasicAccess && (
        <SubscriptionWall
          tier="basic"
          featureName="Calendar & scheduling"
          hasAccess={false}
          onUpgrade={() => requireBasicAccess()}
          compact
        />
      )}

      <Box 
          bg="white" 
          p={{ base: 2, md: 6 }} 
          borderRadius={{ base: "xl", md: "2xl" }} 
          shadow="xl" 
          border="1px solid" 
          borderColor="gray.100" 
          overflow="hidden"
          sx={{
              ".fc": { fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif", color: "#1F2937" },
              ".fc-timegrid-slot": { 
                  height: `${slotHeight}rem`,
                  borderColor: "#EEF2F7"
              },
              ".fc-business-hour": { backgroundColor: "rgba(86, 117, 109, 0.08) !important" },
              ".fc-non-business": { backgroundColor: "#FAFBFC !important" },
              ".fc-col-header": { background: "#F8FAFC" },
              ".fc-col-header-cell": { borderColor: "#EEF2F7" },
              ".fc-event": {
                  borderRadius: "8px",
                  borderLeft: "4px solid rgba(17,24,39,0.18)",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
                  padding: "0",
                  color: "#0F172A !important",
                  overflow: "hidden"
              },
              ".fc-event-main": {
                  padding: "0",
                  color: "#0F172A !important"
              },
              ".fc-toolbar-title": { fontSize: { base: "0.9rem", sm: "1rem", md: "1.15rem" }, fontWeight: "700", color: "#1F2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
              ".fc-button": { padding: { base: "5px 8px", md: "8px 14px" }, fontSize: { base: "0.7rem", md: "0.85rem" }, whiteSpace: "nowrap", borderRadius: "10px" },
              ".fc-header-toolbar": { gap: { base: 1, md: 4 }, flexWrap: "nowrap !important", overflow: "hidden" },
              ".fc-col-header-cell-cushion": { 
                  whiteSpace: "nowrap !important", 
                  fontSize: { base: "0.67rem", sm: "0.78rem", md: "0.9rem" },
                  fontWeight: 600,
                  padding: "2px !important",
                  display: "block !important"
              },
              ".fc-timegrid-axis-cushion": { fontSize: { base: "0.65rem", md: "0.82rem" }, color: "#64748B" }
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
                  onEventResize={handleEventResize}
                  businessHours={businessHours}
                  initialView="timeGridWeek"
                  dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
              eventContent={(arg) => {
                  const start = arg.event.startStr.split('T')[1]?.slice(0, 5) || "";
                  const end = arg.event.endStr.split('T')[1]?.slice(0, 5) || "";
                  const attendance = arg.event.extendedProps?.attendance_status;
                  const appointmentStatus = arg.event.extendedProps?.appointment_status;
                  const statusIcon =
                    appointmentStatus === "completed"
                      ? "📝"
                      : attendance === "arrived"
                        ? "🟦"
                        : attendance === "did_not_arrive"
                          ? "🟥"
                          : "";
                  
                  // Even more aggressive mobile scaling to prevent warping
                  const titleSize = { base: "0.8rem", md: `${Math.max(0.9, Math.min(1.08, 0.68 + (slotHeight * 0.12)))}rem` };
                  const timeSize = { base: "0.7rem", md: `${Math.max(0.78, Math.min(0.96, 0.58 + (slotHeight * 0.1)))}rem` };

                  return (
                      <VStack align="start" spacing={0} p={1} h="full" justify="flex-start" overflow="hidden" minW={0}>
                          <Text 
                            fontWeight="700 !important" 
                            fontSize={titleSize} 
                            color="#0F172A !important" 
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            w="full" 
                            lineHeight="1.1"
                            display="block"
                          >
                              {arg.event.title} {statusIcon}
                          </Text>
                          <Text 
                            fontWeight="600 !important" 
                            fontSize={timeSize} 
                            color="#334155 !important" 
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
        <ModalContent
          borderRadius="3xl"
          overflow="hidden"
          onKeyDown={(e) => {
            // Prevent underlying calendar keyboard handlers from stealing focus/closing.
            e.stopPropagation();
          }}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
        >
           {isFormView ? SessionFormView() : SessionSummaryView()}
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
                        {eventTypes.map((t, idx) => (
                            <HStack key={t.id} justify="space-between" p={3} bg="gray.50" borderRadius="xl" _hover={{ bg: 'gray.100' }}>
                                <HStack>
                                    <Box w={3} h={3} borderRadius="full" bg={t.color} />
                                    <Text fontWeight="600">{t.name}</Text>
                                    <Text fontSize="xs" color="gray.400">({t.default_duration}m)</Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleMoveType(t.id, -1)}
                                    isDisabled={idx === 0}
                                    title="Move up"
                                    px={2}
                                  >
                                    <Icon as={FiChevronUp} />
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleMoveType(t.id, 1)}
                                    isDisabled={idx === eventTypes.length - 1}
                                    title="Move down"
                                    px={2}
                                  >
                                    <Icon as={FiChevronDown} />
                                  </Button>
                                  <Button size="xs" variant="ghost" onClick={() => startEditType(t)}>Edit</Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteType(t)}
                                    title="Delete type"
                                    px={2}
                                  >
                                    <Icon as={FiTrash2} />
                                  </Button>
                                </HStack>
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
      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to create events, manage availability, and run your calendar on MLC."
      />
    </VStack>
  );
}
