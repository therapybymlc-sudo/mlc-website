'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Stack,
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
  Circle,
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
import ModernSelect from "../../../../../components/ModernSelect";
import MiniCalendarPicker from "../../../../../components/scheduling/MiniCalendarPicker";

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

  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      const start = new Date(e.start || e.start_time);
      return !isNaN(start.getTime()) && start >= now;
    }).length;
  }, [events]);

  const eventTypeOptions = useMemo(() => {
    return eventTypes.map(t => ({
      value: String(t.id),
      label: t.name,
      colorDot: t.color || "#56756D",
      badge: `${t.default_duration || 50}m`,
      subtext: t.group && t.group !== "General" ? `Group: ${t.group}` : undefined,
    }));
  }, [eventTypes]);

  const clientOptions = useMemo(() => {
    return [
      { value: "", label: "No Patient (Internal block / Private time)", icon: FiUser },
      ...clients.map(c => ({
        value: String(c.id),
        label: c.name,
        icon: FiUser,
        subtext: c.email || c.phone_number || undefined,
      }))
    ];
  }, [clients]);

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
    const displayDate = form.start_time ? new Date(form.start_time).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "";

    return (
      <VStack spacing={0} align="stretch" bg="white" borderRadius="3xl" overflow="hidden">
        {/* Command Header */}
        <Box bg="linear-gradient(135deg, #263A33 0%, #1E2E28 100%)" p={{ base: 6, md: 8 }} color="white">
          <VStack align="start" spacing={3}>
            <HStack spacing={2} wrap="wrap">
              <Badge
                bg="rgba(255, 255, 255, 0.14)"
                color="#A9CBB7"
                fontSize="10px"
                fontWeight="700"
                borderRadius="full"
                px={2.5}
                py={0.5}
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                {typeObj?.name || "CLINICAL SESSION"}
              </Badge>
              {form.status === "completed" && (
                <Badge bg="rgba(16, 185, 129, 0.2)" color="#6EE7B7" fontSize="10px" fontWeight="700" borderRadius="full" px={2.5} py={0.5}>
                  COMPLETED
                </Badge>
              )}
            </HStack>

            <Heading
              as="h2"
              fontSize={{ base: "19px", sm: "22px" }}
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              color="white"
              letterSpacing="-0.015em"
              lineHeight="1.3"
            >
              {form.title || typeObj?.name || "Clinical Session"}
            </Heading>

            <Divider borderColor="rgba(255, 255, 255, 0.15)" />

            <HStack spacing={3.5} pt={1} align="center">
              <Avatar size="md" name={selectedClientObj?.name} bg="rgba(255, 255, 255, 0.16)" color="white" />
              <VStack align="start" spacing={0.5}>
                <Text fontSize="15px" fontWeight="600" fontFamily="'Outfit', sans-serif" color="white">
                  {selectedClientObj?.name || "Patient Unknown"}
                </Text>
                <HStack spacing={1.5} color="rgba(255, 255, 255, 0.75)" fontSize="12.5px" fontWeight="500">
                  <Icon as={FiClock} boxSize="12px" />
                  <Text>{displayDate}</Text>
                </HStack>
              </VStack>
            </HStack>

            <Button
              mt={3}
              leftIcon={<FiVideo />}
              bg="#56756D"
              color="white"
              h="38px"
              px={6}
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              boxShadow="0 4px 14px rgba(0, 0, 0, 0.2)"
              _hover={{ bg: "#46625B" }}
              onClick={() => {
                const rawId = selectedEvent.extendedProps?.originalId || selectedEvent.id.replace(/^(apt|event)-/, "");
                const room = `MLC_${rawId}`;
                console.log("🌿 [Schedule] Joining video room:", room);
                window.open(`/conference/${room}`, '_blank');
              }}
            >
              Join Video Room
            </Button>
          </VStack>
        </Box>

        <ModalBody p={{ base: 6, md: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Patient Details & Notes */}
            <VStack align="start" spacing={5}>
              <Box w="full" bg="rgba(250, 248, 245, 0.85)" p={4} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.12)">
                <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" mb={3}>
                  PATIENT CONTACT
                </Text>
                <VStack align="start" spacing={2.5}>
                  <HStack color="#263A33" fontSize="13.5px">
                    <Circle size="24px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiUser} boxSize="12px" />
                    </Circle>
                    <Text fontWeight="600">{selectedClientObj?.name || "Client"}</Text>
                  </HStack>
                  <HStack color="#5A6E65" fontSize="13px">
                    <Circle size="24px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                      <Icon as={FiClock} boxSize="12px" />
                    </Circle>
                    <Text>{selectedClientObj?.phone_number || "No Phone Registered"}</Text>
                  </HStack>
                  <HStack color="#5A6E65" fontSize="13px">
                    <Circle size="24px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                      <Icon as={FiGlobe} boxSize="12px" />
                    </Circle>
                    <Text>{selectedClientObj?.email || "No Email Registered"}</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box w="full" bg="rgba(250, 248, 245, 0.85)" p={4} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.12)">
                <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" mb={2}>
                  SESSION NOTES
                </Text>
                <Text fontSize="13px" color="#263A33" lineHeight="1.5">
                  {form.notes || "No private notes recorded for this session."}
                </Text>
              </Box>
            </VStack>

            {/* Operational Toggles */}
            <VStack align="stretch" spacing={4}>
              <Box bg="rgba(250, 248, 245, 0.85)" p={5} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.12)">
                <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" mb={3}>
                  ATTENDANCE & STATUS
                </Text>
                <VStack align="stretch" spacing={2.5}>
                  <Button
                    size="sm"
                    h="36px"
                    fontSize="12.5px"
                    fontWeight="600"
                    variant={selectedEvent?.extendedProps?.attendance_status === 'arrived' ? 'solid' : 'outline'}
                    bg={selectedEvent?.extendedProps?.attendance_status === 'arrived' ? '#2B6CB0' : 'white'}
                    color={selectedEvent?.extendedProps?.attendance_status === 'arrived' ? 'white' : '#2B6CB0'}
                    borderColor="rgba(43, 108, 176, 0.35)"
                    borderRadius="full"
                    _hover={{ bg: selectedEvent?.extendedProps?.attendance_status === 'arrived' ? '#2B6CB0' : 'rgba(43, 108, 176, 0.08)' }}
                    onClick={() => handleUpdate({ attendance_status: "arrived" }, { closeAfterSave: false })}
                  >
                    ✓ Mark as Arrived
                  </Button>
                  <Button
                    size="sm"
                    h="36px"
                    fontSize="12.5px"
                    fontWeight="600"
                    variant={selectedEvent?.extendedProps?.attendance_status === 'did_not_arrive' ? 'solid' : 'outline'}
                    bg={selectedEvent?.extendedProps?.attendance_status === 'did_not_arrive' ? '#E53E3E' : 'white'}
                    color={selectedEvent?.extendedProps?.attendance_status === 'did_not_arrive' ? 'white' : '#E53E3E'}
                    borderColor="rgba(229, 62, 62, 0.35)"
                    borderRadius="full"
                    _hover={{ bg: selectedEvent?.extendedProps?.attendance_status === 'did_not_arrive' ? '#E53E3E' : 'rgba(229, 62, 62, 0.08)' }}
                    onClick={() => handleUpdate({ attendance_status: "did_not_arrive" }, { closeAfterSave: false })}
                  >
                    ✕ No Show
                  </Button>
                  <Button
                    size="sm"
                    h="36px"
                    fontSize="12.5px"
                    fontWeight="600"
                    variant={form.status === 'completed' ? 'solid' : 'outline'}
                    bg={form.status === 'completed' ? '#059669' : 'white'}
                    color={form.status === 'completed' ? 'white' : '#059669'}
                    borderColor="rgba(5, 150, 105, 0.35)"
                    borderRadius="full"
                    _hover={{ bg: form.status === 'completed' ? '#059669' : 'rgba(5, 150, 105, 0.08)' }}
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
                    ★ Session Completed
                  </Button>
                </VStack>
              </Box>

              <Button
                leftIcon={<FiFileText />}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                onClick={() => {
                  const originalId = selectedEvent.extendedProps.originalId || selectedEvent.id;
                  router.push(`/dashboard/therapist/clients?id=${form.client}&section=notes&appointmentId=${originalId}&eventTypeId=${form.event_type}`);
                }}
              >
                View Treatment Notes
              </Button>
              <Button
                leftIcon={<FiCopy />}
                variant="ghost"
                size="sm"
                color="#56756D"
                borderRadius="full"
                fontWeight="600"
                fontSize="12px"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                onClick={() => {
                  const room = `https://mlchealth.in/conference/MLC_${selectedEvent.extendedProps.originalId || selectedEvent.id}`;
                  navigator.clipboard.writeText(room);
                  toast({ title: "Invite link copied to clipboard", status: "success" });
                }}
              >
                Copy Video Invite Link
              </Button>
            </VStack>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter bg="#FAF8F5" p={4} px={{ base: 6, md: 8 }} borderTop="1px solid rgba(86, 117, 109, 0.12)" borderBottomRadius="3xl">
          <HStack w="full" justify="space-between">
            <HStack spacing={3}>
              <Button
                size="sm"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="36px"
                px={4}
                fontSize="12.5px"
                fontWeight="600"
                _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                onClick={() => setIsFormView(true)}
              >
                Edit Details
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="#E53E3E"
                borderRadius="full"
                h="36px"
                fontSize="12.5px"
                fontWeight="600"
                _hover={{ bg: "rgba(229, 62, 62, 0.08)" }}
                onClick={handleDelete}
              >
                Cancel Session
              </Button>
            </HStack>
            <Button
              px={7}
              borderRadius="full"
              h="36px"
              bg="#263A33"
              color="white"
              fontSize="13px"
              fontWeight="600"
              _hover={{ bg: "#56756D" }}
              onClick={onClose}
            >
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </VStack>
    );
  };

  const SessionFormView = () => (
    <>
      <ModalHeader borderBottom="1px solid rgba(86, 117, 109, 0.12)" p={6} px={{ base: 6, md: 8 }}>
        <HStack spacing={3.5} align="center">
          <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
            <Icon as={FiCalendar} boxSize="18px" />
          </Circle>
          <VStack align="start" spacing={0.5}>
            <Text fontSize="10.5px" color="#718096" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase">
              CLINICAL SCHEDULING
            </Text>
            <Heading
              as="h2"
              fontSize="19px"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              color="#263A33"
              letterSpacing="-0.015em"
            >
              {isEditMode ? "Edit Session Details" : "New Clinical Appointment"}
            </Heading>
          </VStack>
        </HStack>
      </ModalHeader>
      <ModalCloseButton borderRadius="full" m={4} />
      <ModalBody py={6} px={{ base: 6, md: 8 }}>
        <VStack spacing={5} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase">
              Event Type
            </FormLabel>
            <ModernSelect
              placeholder="Select clinical model..."
              value={form.event_type}
              options={eventTypeOptions}
              h="42px"
              onChange={(typeId) => {
                const typeObj = eventTypes.find(t => String(t.id) === String(typeId));
                if (typeObj && !isEditMode && form.start_time) {
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
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase">
              Patient
            </FormLabel>
            <ModernSelect
              placeholder="Select client (optional)"
              value={form.client}
              options={clientOptions}
              h="42px"
              onChange={(clientId) => setForm({ ...form, client: clientId })}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase">
              Session Title (Optional override)
            </FormLabel>
            <Input
              placeholder="e.g. Art Therapy Follow-up"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              borderRadius="xl"
              h="42px"
              fontSize="13px"
              fontFamily="'Inter', sans-serif"
              borderColor="rgba(86, 117, 109, 0.2)"
              _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase" mb={2}>
              Date & Session Time
            </FormLabel>
            <MiniCalendarPicker
              startTime={form.start_time}
              endTime={form.end_time}
              defaultDuration={50}
              onChange={({ startTime, endTime }) => {
                setForm(prev => ({
                  ...prev,
                  start_time: startTime,
                  end_time: endTime,
                }));
              }}
            />
          </FormControl>

          {!isEditMode && (
            <Box bg="rgba(250, 248, 245, 0.85)" p={4} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.12)">
              <VStack align="stretch" spacing={3}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0" fontSize="12.5px" fontWeight="600" color="#263A33">
                    Repeat this session
                  </FormLabel>
                  <Checkbox
                    colorScheme="teal"
                    isChecked={Boolean(form.repeat_enabled)}
                    onChange={(e) => setForm({ ...form, repeat_enabled: e.target.checked })}
                  />
                </FormControl>
                {form.repeat_enabled && (
                  <SimpleGrid columns={2} spacing={3} pt={1}>
                    <FormControl>
                      <FormLabel fontSize="11px" fontWeight="600" color="#5A6E65">Interval</FormLabel>
                      <Select
                        value={form.repeat_interval || "weekly"}
                        onChange={(e) => setForm({ ...form, repeat_interval: e.target.value })}
                        borderRadius="lg"
                        h="38px"
                        fontSize="12.5px"
                        bg="white"
                        borderColor="rgba(86, 117, 109, 0.2)"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="11px" fontWeight="600" color="#5A6E65">Occurrences</FormLabel>
                      <Input
                        type="number"
                        min={1}
                        max={52}
                        value={form.repeat_count ?? 1}
                        onChange={(e) => setForm({ ...form, repeat_count: e.target.value })}
                        borderRadius="lg"
                        h="38px"
                        fontSize="12.5px"
                        bg="white"
                        borderColor="rgba(86, 117, 109, 0.2)"
                      />
                    </FormControl>
                  </SimpleGrid>
                )}
              </VStack>
            </Box>
          )}

          <FormControl>
            <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase">
              Clinical Notes
            </FormLabel>
            <Textarea
              placeholder="Private therapeutic notes for this session..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              borderRadius="xl"
              rows={3}
              fontSize="13px"
              fontFamily="'Inter', sans-serif"
              borderColor="rgba(86, 117, 109, 0.2)"
              _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
            />
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter bg="#FAF8F5" p={4} px={{ base: 6, md: 8 }} borderTop="1px solid rgba(86, 117, 109, 0.12)" borderBottomRadius="3xl">
        <HStack w="full" justify="space-between">
          <Button
            variant="ghost"
            color="#5A6E65"
            borderRadius="full"
            h="38px"
            fontSize="13px"
            fontWeight="600"
            onClick={isEditMode ? () => setIsFormView(false) : onClose}
          >
            Back
          </Button>
          <Button
            bg="#56756D"
            color="white"
            borderRadius="full"
            h="38px"
            px={7}
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: "#263A33" }}
            _active={{ bg: "#263A33" }}
            boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
            onClick={isEditMode ? handleUpdate : handleCreate}
          >
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
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* Golden Benchmark Hero Banner */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "stretch", lg: "center" }}
          gap={4}
        >
          {/* Left: Icon Badge + Eyebrows + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
              <Icon as={FiCalendar} boxSize="22px" />
            </Circle>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.2)"
                  color="#263A33"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  CLINICAL PRACTICE 🌿
                </Badge>
                <Badge
                  bg="rgba(86, 117, 109, 0.08)"
                  color="#56756D"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                >
                  {events.length} TOTAL SESSIONS
                </Badge>
              </HStack>
              <Heading
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Clinical Schedule
              </Heading>
              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Manage your therapeutic sessions, calendar bookings, and clinical availability.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Action Buttons */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={3}
            align={{ base: "stretch", md: "center" }}
            w={{ base: "full", lg: "auto" }}
          >
            <HStack
              spacing={{ base: 1.5, sm: 3 }}
              p={1.5}
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              w={{ base: "full", md: "auto" }}
              justify="space-between"
            >
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiCalendar} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    SESSIONS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {events.length} Booked
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiClock} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    UPCOMING
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {upcomingEventsCount} Active
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(113, 128, 150, 0.12)" color="#718096" flexShrink={0}>
                  <Icon as={FiUser} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    PATIENTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {clients.length} in Care
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <HStack spacing={2.5} w={{ base: "full", md: "auto" }}>
              {isAdmin && (
                <Button
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  h="38px"
                  fontSize="12.5px"
                  fontWeight="600"
                  px={3.5}
                  leftIcon={<FiSettings />}
                  onClick={() => requireBasicAccess(typeModal.onOpen)}
                  _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                >
                  Types
                </Button>
              )}
              <Button
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                leftIcon={<FiGlobe />}
                onClick={() => requireBasicAccess(oneOffModal.onOpen)}
                _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                whiteSpace="nowrap"
              >
                One-off Availability
              </Button>
              <Button
                leftIcon={<FiPlus />}
                bg="#56756D"
                color="white"
                borderRadius="full"
                h="38px"
                fontSize="13px"
                fontWeight="600"
                px={5}
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                _active={{ bg: "#263A33" }}
                transition="all 0.2s"
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                whiteSpace="nowrap"
                onClick={() =>
                  requireBasicAccess(() => {
                    setIsEditMode(false);
                    setForm({
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
                    onOpen();
                  })
                }
              >
                Add Session
              </Button>
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* Alert for Pending Bookings if any */}
      {pendingBookingCount > 0 && (
        <Box
          as={NextLink}
          href="/dashboard/therapist/booking-requests"
          w="full"
          p={3.5}
          px={4}
          borderRadius="xl"
          bg="rgba(254, 243, 199, 0.7)"
          border="1px solid rgba(245, 158, 11, 0.3)"
          _hover={{ bg: "rgba(254, 243, 199, 0.95)" }}
          mb={4}
          display="block"
          transition="0.15s ease"
        >
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <HStack spacing={2.5}>
              <Circle size="28px" bg="rgba(245, 158, 11, 0.2)" color="#B45309">
                <Icon as={FiAlertCircle} boxSize="15px" />
              </Circle>
              <Text fontSize="13px" fontWeight="600" color="#92400E">
                {pendingBookingCount} pending booking request{pendingBookingCount === 1 ? "" : "s"} awaiting your confirmation
              </Text>
            </HStack>
            <Text fontSize="12.5px" color="#92400E" fontWeight="700">
              Review & Respond →
            </Text>
          </HStack>
        </Box>
      )}

      {/* Calendar Toolbar Strip (Scale + Legends) */}
      <Flex
        justify="space-between"
        align="center"
        mb={3}
        wrap="wrap"
        gap={3}
      >
        <HStack
          spacing={3}
          bg="white"
          py={1.5}
          px={3.5}
          borderRadius="full"
          border="1px solid rgba(86, 117, 109, 0.14)"
          boxShadow="0 2px 6px -1px rgba(38, 58, 51, 0.04)"
          display={{ base: "none", md: "flex" }}
        >
          <Icon as={FiMaximize2} color="#56756D" boxSize="13px" />
          <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" whiteSpace="nowrap">
            View Scale
          </Text>
          <Slider
            aria-label="Scale View"
            min={1.5}
            max={6}
            step={0.5}
            w="110px"
            defaultValue={2}
            onChange={(v) => setSlotHeight(v)}
          >
            <SliderTrack bg="rgba(86, 117, 109, 0.12)" h="4px" borderRadius="full">
              <SliderFilledTrack bg="#56756D" />
            </SliderTrack>
            <SliderThumb boxSize="14px" bg="white" border="2px solid #56756D" boxShadow="sm" />
          </Slider>
        </HStack>

        {/* Legend */}
        <HStack spacing={3} wrap="wrap">
          <HStack spacing={1.5}>
            <Circle size="7px" bg="#56756D" />
            <Text fontSize="11px" fontWeight="600" color="#5A6E65">Scheduled</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Circle size="7px" bg="#059669" />
            <Text fontSize="11px" fontWeight="600" color="#5A6E65">Documented</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Circle size="7px" bg="#3182CE" />
            <Text fontSize="11px" fontWeight="600" color="#5A6E65">Arrived</Text>
          </HStack>
        </HStack>
      </Flex>

      {!hasBasicAccess && (
        <SubscriptionWall
          tier="basic"
          featureName="Calendar & scheduling"
          hasAccess={false}
          onUpgrade={() => requireBasicAccess()}
          compact
        />
      )}

      {/* Main Calendar Card */}
      <Box 
        bg="white" 
        borderRadius="2xl" 
        border="1px solid rgba(86, 117, 109, 0.14)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
        overflow="hidden"
      >
        {mounted ? (
          <Box 
            overflowX="auto" 
            w="full" 
            cursor="grab" 
            _active={{ cursor: 'grabbing' }}
            position="relative"
            css={{
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { background: '#F8F9FA' },
              '&::-webkit-scrollbar-thumb': { background: '#D1D5DB', borderRadius: '10px' },
            }}
          >
            <Box minW={{ base: "800px", md: "100%" }} position="relative">
              <FullCalendarComponent 
                events={events} 
                onSelect={handleSelect}
                onEventClick={handleEventClick}
                onEventResize={handleEventResize}
                businessHours={businessHours}
                initialView="timeGridWeek"
                slotHeight={slotHeight}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
                eventContent={(arg) => {
                  const start = arg.event.startStr.split('T')[1]?.slice(0, 5) || "";
                  const end = arg.event.endStr.split('T')[1]?.slice(0, 5) || "";
                  const attendance = arg.event.extendedProps?.attendance_status;
                  const appointmentStatus = arg.event.extendedProps?.appointment_status;

                  return (
                    <Box p={1.5} h="full" w="full" overflow="hidden" position="relative">
                      <HStack justify="space-between" align="center" spacing={1} mb={0.5}>
                        <Text 
                          fontWeight="600" 
                          fontSize="12px" 
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                          color="#263A33" 
                          isTruncated
                          lineHeight="1.2"
                        >
                          {arg.event.title}
                        </Text>
                        {appointmentStatus === "completed" ? (
                          <Badge bg="rgba(16, 185, 129, 0.15)" color="#059669" fontSize="8.5px" px={1} borderRadius="full">Done</Badge>
                        ) : attendance === "arrived" ? (
                          <Badge bg="rgba(49, 130, 206, 0.15)" color="#2B6CB0" fontSize="8.5px" px={1} borderRadius="full">Arrived</Badge>
                        ) : null}
                      </HStack>
                      <HStack spacing={1} color="#5A6E65" fontSize="10.5px" fontWeight="500">
                        <Icon as={FiClock} boxSize="10px" color="#56756D" />
                        <Text isTruncated>{start} - {end}</Text>
                      </HStack>
                    </Box>
                  );
                }}
              />
            </Box>
          </Box>
        ) : (
          <Center h="400px"><Spinner color="#56756D" /></Center>
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

      <Modal isOpen={oneOffModal.isOpen} onClose={oneOffModal.onClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader borderBottom="1px solid rgba(86, 117, 109, 0.12)" p={6}>
            <HStack spacing={3}>
              <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiGlobe} boxSize="18px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  DISCOVERY PORTAL
                </Text>
                <Heading as="h3" fontSize="18px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33" letterSpacing="-0.015em">
                  One-off Availability
                </Heading>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton borderRadius="full" m={4} />
          <ModalBody py={6} px={6}>
            <VStack spacing={5}>
              <Box bg="rgba(236, 253, 245, 0.8)" p={4} borderRadius="2xl" border="1px solid rgba(16, 185, 129, 0.25)" w="full">
                <HStack align="start" spacing={3}>
                  <Icon as={FiAlertCircle} color="#059669" boxSize="18px" mt={0.5} />
                  <Text fontSize="12.5px" color="#065F46" lineHeight="1.5">
                    <strong>Client-Facing Slot:</strong> Publishing this window will make it immediately visible and bookable for clients on your public therapist booking profile.
                  </Text>
                </HStack>
              </Box>

              <FormControl isRequired w="full">
                <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase" mb={2}>
                  Slot Date & Window
                </FormLabel>
                <MiniCalendarPicker
                  startTime={oneOffForm.start_time}
                  endTime={oneOffForm.end_time}
                  defaultDuration={60}
                  onChange={({ startTime, endTime }) => {
                    setOneOffForm(prev => ({
                      ...prev,
                      start_time: startTime,
                      end_time: endTime,
                    }));
                  }}
                />
              </FormControl>

              <FormControl w="full">
                <FormLabel fontSize="11.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em" textTransform="uppercase">Internal Memo (Optional)</FormLabel>
                <Textarea 
                  placeholder="Why is this slot being opened? e.g. Weekend morning overflow..." 
                  value={oneOffForm.notes}
                  onChange={(e) => setOneOffForm({ ...oneOffForm, notes: e.target.value })}
                  borderRadius="xl"
                  rows={3}
                  fontSize="13px"
                  fontFamily="'Inter', sans-serif"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="#FAF8F5" p={4} px={6} borderTop="1px solid rgba(86, 117, 109, 0.12)" borderBottomRadius="3xl">
            <HStack w="full" justify="space-between">
              <Button variant="ghost" color="#5A6E65" borderRadius="full" h="38px" fontSize="13px" fontWeight="600" onClick={oneOffModal.onClose}>Cancel</Button>
              <Button bg="#56756D" color="white" borderRadius="full" h="38px" px={7} fontSize="13px" fontWeight="600" _hover={{ bg: "#263A33" }} _active={{ bg: "#263A33" }} boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)" onClick={handleCreateOneOff}>Publish Slot</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={typeModal.isOpen} onClose={typeModal.onClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader borderBottom="1px solid rgba(86, 117, 109, 0.12)" p={6}>
            <HStack spacing={3}>
              <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiSettings} boxSize="18px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  CLINICAL CONFIGURATION
                </Text>
                <Heading as="h3" fontSize="18px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33" letterSpacing="-0.015em">
                  Manage Event Types
                </Heading>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton borderRadius="full" m={4} />
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch" maxH="75vh" overflowY="auto">
              <Box>
                <Text fontWeight="700" mb={3} fontSize="11px" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  EXISTING TYPES
                </Text>
                <SimpleGrid columns={1} spacing={2} maxH="250px" overflowY="auto" pr={1}>
                  {eventTypes.map((t, idx) => (
                    <HStack key={t.id} justify="space-between" p={3} bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)" borderRadius="xl">
                      <HStack spacing={2.5}>
                        <Box w={3} h={3} borderRadius="full" bg={t.color} />
                        <Text fontWeight="600" fontSize="13px" color="#263A33">{t.name}</Text>
                        <Text fontSize="11.5px" color="#718096">({t.default_duration}m)</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleMoveType(t.id, -1)}
                          isDisabled={idx === 0}
                          title="Move up"
                          px={2}
                          borderRadius="md"
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
                          borderRadius="md"
                        >
                          <Icon as={FiChevronDown} />
                        </Button>
                        <Button size="xs" variant="ghost" color="#56756D" fontWeight="600" borderRadius="md" onClick={() => startEditType(t)}>Edit</Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteType(t)}
                          title="Delete type"
                          px={2}
                          borderRadius="md"
                        >
                          <Icon as={FiTrash2} />
                        </Button>
                      </HStack>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>

              <Divider borderColor="rgba(86, 117, 109, 0.14)" />

              <VStack spacing={4} align="stretch" bg="rgba(250, 248, 245, 0.85)" p={5} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.12)">
                <Text fontWeight="700" fontSize="11px" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                  {editingType ? `EDITING: ${editingType.name}` : "CREATE NEW TYPE"}
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5}>
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Type Name</FormLabel>
                    <Input placeholder="e.g. Couples Initial" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} bg="white" borderRadius="xl" h="38px" fontSize="13px" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Section / Group</FormLabel>
                    <Input placeholder="e.g. Clinical" value={newType.group} onChange={(e) => setNewType({ ...newType, group: e.target.value })} bg="white" borderRadius="xl" h="38px" fontSize="13px" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Display Order</FormLabel>
                    <Input type="number" value={newType.order} onChange={(e) => setNewType({ ...newType, order: parseInt(e.target.value) })} bg="white" borderRadius="xl" h="38px" fontSize="13px" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Default Duration (min)</FormLabel>
                    <Input type="number" value={newType.default_duration} onChange={(e) => setNewType({ ...newType, default_duration: parseInt(e.target.value) })} bg="white" borderRadius="xl" h="38px" fontSize="13px" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D" }} />
                  </FormControl>
                  <FormControl gridColumn={{ base: "1", sm: "1 / -1" }}>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Pick Theme Color</FormLabel>
                    <SimpleGrid columns={8} spacing={2}>
                      {SAFE_COLORS.map(c => (
                        <Box 
                          key={c.hex} 
                          h="26px" 
                          borderRadius="md" 
                          bg={c.hex} 
                          cursor="pointer" 
                          border={newType.color === c.hex ? "2px solid #263A33" : "1px solid rgba(0,0,0,0.08)"}
                          boxShadow={newType.color === c.hex ? "0 2px 6px rgba(0,0,0,0.15)" : "none"}
                          onClick={() => setNewType({ ...newType, color: c.hex })}
                          title={c.name}
                        />
                      ))}
                    </SimpleGrid>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Checkbox colorScheme="teal" isChecked={newType.is_paid} onChange={(e) => setNewType({ ...newType, is_paid: e.target.checked })}>
                      <Text fontSize="12.5px" fontWeight="600" color="#263A33">Is Paid Session</Text>
                    </Checkbox>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Checkbox colorScheme="teal" isChecked={newType.requires_client} onChange={(e) => setNewType({ ...newType, requires_client: e.target.checked })}>
                      <Text fontSize="12.5px" fontWeight="600" color="#263A33">Requires Patient</Text>
                    </Checkbox>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Pre-filled Notes</FormLabel>
                  <Textarea placeholder="Standard notes for this session type..." value={newType.default_notes} onChange={(e) => setNewType({ ...newType, default_notes: e.target.value })} bg="white" borderRadius="xl" rows={2} fontSize="13px" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D" }} />
                </FormControl>

                <HStack justify="flex-end" pt={2} spacing={3}>
                  {editingType && (
                    <Button variant="ghost" color="#5A6E65" borderRadius="full" h="36px" fontSize="12.5px" onClick={() => { setEditingType(null); setNewType({ name: "", color: "#D1E9FF", default_duration: 50, is_paid: true, requires_client: true, default_notes: "" }); }}>Cancel Edit</Button>
                  )}
                  <Button bg="#56756D" color="white" borderRadius="full" h="36px" px={6} fontSize="13px" fontWeight="600" _hover={{ bg: "#263A33" }} _active={{ bg: "#263A33" }} boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)" onClick={handleCreateType}>
                    {editingType ? "Update Event Type" : "Add Event Type"}
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
    </Box>
  );
}
