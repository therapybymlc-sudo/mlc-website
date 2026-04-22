import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Checkbox,
  SimpleGrid,
  Divider,
  Badge,
  IconButton,
  Switch,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiClock, FiCheck, FiX, FiList, FiCheckCircle } from "react-icons/fi";
import { schedulingApi } from "../../api/scheduling";
import { 
  AddIcon, 
  HamburgerIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SettingsIcon, 
  EditIcon, 
  AttachmentIcon 
} from "@chakra-ui/icons";
import "../../styles/CalendarStyles.css";

export default function Schedule({ preselectClientId, onPreselectConsumed }) {
  const toast = useToast();
  const eventTypeModal = useDisclosure();
  const calendarRef = useRef(null);
  const miniCalendarRef = useRef(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [events, setEvents] = useState([]);
  const [sessionLinks, setSessionLinks] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedTherapists, setSelectedTherapists] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [visibleTypes, setVisibleTypes] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("resourceTimeGridWeek");
  const [showNames, setShowNames] = useState(true);
  const [miniDate, setMiniDate] = useState(new Date());
  const [rangeTitle, setRangeTitle] = useState("");
  
  // New State for Consolidation
  const [bookingRequests, setBookingRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [activeSideTab, setActiveSideTab] = useState("filters"); // filters | requests
  const [showAgenda, setShowAgenda] = useState(false);

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [waitlistPractitioner, setWaitlistPractitioner] = useState("all");
  const [waitlistType, setWaitlistType] = useState("all");
  const [waitlistItems, setWaitlistItems] = useState([]);
  const [waitlistFormOpen, setWaitlistFormOpen] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const filtersDrawer = useDisclosure();
  const [waitlistForm, setWaitlistForm] = useState({
    client: "",
    therapist: "",
    event_type: "",
    notes: "",
  });
  const [prefillHandled, setPrefillHandled] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    therapist: "",
    client: "",
    event_type: "",
    start_time: "",
    end_time: "",
    notes: "",
    repeat: "None",
    repeat_every: 1,
    repeat_unit: "week",
    repeat_count: 1,
  });

  const [newType, setNewType] = useState({ name: "", color: "#A9CBB7" });
  const [clientSearch, setClientSearch] = useState("");
  const [showClientResults, setShowClientResults] = useState(false);

  const seedEventTypes = [
    { name: "Art Healing Group", color: "#F2994A" },
    { name: "Calling Client", color: "#56CCF2" },
    { name: "Cancellation Fees", color: "#EB5757" },
    { name: "Couple Follow Up Session", color: "#27AE60" },
    { name: "Couple Intake Session", color: "#9B51E0" },
    { name: "Couple Screening", color: "#EB5757" },
    { name: "Feedback Session (Comprehensive Testing Package)", color: "#2F80ED" },
    { name: "Feedback Session (Neurofeedback)", color: "#2F80ED" },
    { name: "Feedback Session (Short Testing Package)", color: "#2F80ED" },
    { name: "Follow-up Session (Neurofeedback)", color: "#27AE60" },
    { name: "Follow-up Session (Psychiatry)", color: "#27AE60" },
    { name: "Follow-up Session (Psychology / Psychotherapy)", color: "#27AE60" },
    { name: "Follow-up Session 30 mins (Psychology / Psychotherapy)", color: "#6FCF97" },
    { name: "Group Therapy (per person)", color: "#F2994A" },
    { name: "Home Care Visit", color: "#F2994A" },
    { name: "Intake Session (Comprehensive Testing Package)", color: "#9B51E0" },
    { name: "Intake Session (Psychiatry)", color: "#9B51E0" },
    { name: "Intake Session (Psychology / Psychotherapy)", color: "#9B51E0" },
    { name: "Intake Session (Selected Testing)", color: "#9B51E0" },
    { name: "Intake Session (Short Testing)", color: "#9B51E0" },
    { name: "Intake Session – 30 minutes (Psychology / Psychotherapy)", color: "#BB6BD9" },
    { name: "Mindfulness Group Session", color: "#F2C94C" },
    { name: "Mindfulness Meditation Check-in Session", color: "#F2C94C" },
    { name: "Mindfulness Session (One-on-One)", color: "#F2994A" },
    { name: "Non-Medical Revenue", color: "#BDBDBD" },
    { name: "School Visit / Observation", color: "#EB5757" },
    { name: "Screening", color: "#EB5757" },
    { name: "Selected Testing", color: "#2F80ED" },
    { name: "Testing Analysis (Neurofeedback)", color: "#2F80ED" },
    { name: "Testing Report (Comprehensive Testing Package)", color: "#2F80ED" },
    { name: "Testing Report (Short Testing Package)", color: "#2F80ED" },
    { name: "Testing Session (Comprehensive Testing Package)", color: "#2F80ED" },
    { name: "Testing Session (Neurofeedback)", color: "#2F80ED" },
    { name: "Testing Session (Short Testing Package)", color: "#2F80ED" },
    { name: "Workshop", color: "#F2994A" },
    { name: "Writing a Paid Report", color: "#9B51E0" },
  ];

  const toLocalInputValue = (dateObj) => {
    if (!dateObj) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const y = dateObj.getFullYear();
    const m = pad(dateObj.getMonth() + 1);
    const d = pad(dateObj.getDate());
    const h = pad(dateObj.getHours());
    const min = pad(dateObj.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const accentColor = event.backgroundColor || "#56756D";
    const startTime = event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return (
      <div className="custom-event-card" style={{ borderLeftColor: accentColor }}>
        <div className="event-title">{event.title}</div>
        {event.extendedProps.client_name && (
          <div className="event-client">{event.extendedProps.client_name}</div>
        )}
        <div className="event-time">{startTime}</div>
      </div>
    );
  };


  const brightenColor = (hex) => {
    if (!hex) return "#A9CBB7";
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const boost = (v) => Math.min(255, Math.round(v * 1.15 + 12));
    const toHex = (v) => v.toString(16).padStart(2, "0");
    return `#${toHex(boost(r))}${toHex(boost(g))}${toHex(boost(b))}`;
  };

  const getCalendarApi = () => calendarRef.current?.getApi();
  const gotoDate = (dateObj) => {
    const api = getCalendarApi();
    if (!api || !dateObj) return;
    api.gotoDate(dateObj);
  };

  const shiftByDays = (days) => {
    const api = getCalendarApi();
    if (!api) return;
    const base = api.getDate();
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    api.gotoDate(next);
  };

  const shiftByMonths = (months) => {
    const api = getCalendarApi();
    if (!api) return;
    const base = api.getDate();
    const next = new Date(base);
    next.setMonth(next.getMonth() + months);
    api.gotoDate(next);
  };

  const loadBookingRequests = async () => {
    try {
      const data = await schedulingApi.listTherapistBookingRequests();
      setBookingRequests(Array.isArray(data) ? data.filter(r => r.status === 'pending') : []);
    } catch (e) { console.error(e); }
  };

  const loadAppointmentsList = async () => {
    try {
      const data = await schedulingApi.listTherapistAppointments();
      setUpcomingAppointments(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleConfirmRequest = async (id) => {
    try {
      await schedulingApi.confirmBookingRequest(id);
      toast({ status: "success", title: "Appointment confirmed" });
      loadBookingRequests();
      fetchEvents();
      loadAppointmentsList();
    } catch (e) { toast({ status: "error", title: "Confirm failed" }); }
  };

  const handleDeclineRequest = async (id) => {
    try {
      await schedulingApi.declineBookingRequest(id, "Declined from Clinical Center");
      toast({ status: "info", title: "Request declined" });
      loadBookingRequests();
    } catch (e) { toast({ status: "error", title: "Decline failed" }); }
  };

  /* ===============================
     🔹 Fetchers
  =============================== */
  const fetchTherapists = async () => {
    try {
      const res = await apiGet("/therapists/");
      const data = res.results ?? res;
      setTherapists(data);
      setSelectedTherapists(data.map((t) => String(t.id)));
    } catch {
      toast({ status: "error", title: "Couldn't load therapists" });
    }
  };

  const fetchClients = async () => {
    try {
      const res = await apiGet("/clients/");
      setClients(res.results ?? res);
    } catch {
      toast({ status: "error", title: "Couldn't load clients" });
    }
  };

  const fetchEventTypes = async () => {
    try {
      const res = await apiGet("/event-types/");
      const types = res.results ?? res;
      const existingNames = new Set((types || []).map((t) => t.name?.toLowerCase()));
      const missing = seedEventTypes.filter(
        (t) => !existingNames.has(t.name.toLowerCase())
      );
      if (missing.length) {
        for (const t of missing) {
          // eslint-disable-next-line no-await-in-loop
          await apiPost("/event-types/", t);
        }
      }
      const refreshed = await apiGet("/event-types/");
      const refreshedTypes = refreshed.results ?? refreshed;
      setEventTypes(refreshedTypes);
      setVisibleTypes(new Set(refreshedTypes.map((t) => String(t.id))));
      return;
    } catch {
      toast({ status: "error", title: "Couldn't load event types" });
    }
  };

  const fetchEvents = async () => {
    try {
      const allEvents = [];
      for (const tid of selectedTherapists) {
        const res = await apiGet(`/schedule-events/?therapist=${tid}`);
        const data = res.results ?? res;
        allEvents.push(
          ...data.map((ev) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start_time,
            end: ev.end_time,
            resourceId: String(ev.therapist),
            backgroundColor: brightenColor(ev.color || "#A9CBB7"),
            borderColor: brightenColor(ev.color || "#A9CBB7"),
            extendedProps: {
              therapist: String(ev.therapist),
              therapist_name: ev.therapist_name,
              client_name: ev.client_name,
              client: ev.client ? String(ev.client) : null,
              notes: ev.notes,
              event_type: ev.event_type ? String(ev.event_type) : null,
              event_type_name: ev.event_type_name,
              attendance_status: ev.attendance_status || "",
            },
          }))
        );
      }
      setEvents(allEvents);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't load schedule" });
    }
  };

  const fetchWaitlist = async () => {
    try {
      const res = await apiGet("/waitlist/");
      const data = res.results ?? res;
      setWaitlistItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't load wait list" });
    }
  };

  const fetchSessionLinks = async () => {
    try {
      const res = await apiGet("/session-links/");
      const data = res.results ?? res;
      setSessionLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  /* ===============================
     🔹 Event CRUD
  =============================== */
  const handleSelect = async (info) => {
    const start = info.start ? new Date(info.start) : null;
    const end = info.end ? new Date(info.end) : null;
    const autoEnd = start ? new Date(start.getTime() + 60 * 60 * 1000) : null;

    if (isReschedulingEventId && reschedulingEventData) {
      if (window.confirm("Reschedule appointment to this time?")) {
        try {
          const fallbackTherapist = reschedulingEventData.extendedProps?.therapist || reschedulingEventData.getResources?.()?.[0]?.id || therapists[0]?.id;
          await apiPut(`/schedule-events/${isReschedulingEventId}/`, {
            title: reschedulingEventData.title || "Appointment",
            therapist: Number(fallbackTherapist),
            client: reschedulingEventData.extendedProps?.client ? Number(reschedulingEventData.extendedProps.client) : null,
            event_type: reschedulingEventData.extendedProps?.event_type ? Number(reschedulingEventData.extendedProps.event_type) : null,
            start_time: toLocalInputValue(start) || info.startStr,
            end_time: toLocalInputValue(end || autoEnd) || info.endStr,
            notes: reschedulingEventData.extendedProps?.notes || "",
            attendance_status: reschedulingEventData.extendedProps?.attendance_status || null,
          });
          toast({ status: "success", title: "Appointment rescheduled" });
          setIsReschedulingEventId(null);
          setReschedulingEventData(null);
          fetchEvents();
        } catch (e) {
          console.error(e);
          toast({ status: "error", title: "Couldn't reschedule appointment" });
        }
      } else {
        setIsReschedulingEventId(null);
        setReschedulingEventData(null);
      }
      return;
    }

    setNewEvent({
      title: "",
      therapist: String(
        info.resource?.id || selectedTherapists[0] || therapists[0]?.id || ""
      ),
      client: "",
      event_type: "",
      start_time: toLocalInputValue(start) || info.startStr || "",
      end_time: toLocalInputValue(end || autoEnd) || info.endStr || "",
      notes: "",
      repeat: "None",
      repeat_every: 1,
      repeat_unit: "week",
      repeat_count: 1,
    });
    setClientSearch("");
    setIsOpen(true);
  };

  const handleSave = async () => {
    const { title, therapist, event_type, start_time, end_time } = newEvent;
    if (!therapist || !event_type) {
      toast({ status: "warning", title: "Please select a practitioner and event type" });
      return;
    }

    try {
      const selectedType = eventTypes.find(
        (t) => String(t.id) === String(newEvent.event_type)
      );
      const selectedClient = clients.find(
        (c) => String(c.id) === String(newEvent.client)
      );
      const derivedTitle =
        title?.trim() ||
        (selectedClient && selectedType
          ? `${selectedClient.name} — ${selectedType.name}`
          : selectedType?.name || selectedClient?.name || "Appointment");

      await apiPost("/schedule-events/", {
        title: derivedTitle,
        therapist: Number(therapist),
        client: newEvent.client ? Number(newEvent.client) : null,
        event_type: Number(event_type),
        start_time,
        end_time,
        notes: newEvent.notes,
        color: selectedType?.color || "#A9CBB7",
      });

      toast({ status: "success", title: "Event added" });
      setIsOpen(false);
      fetchEvents();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't create event" });
    }
  };

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isReschedulingEventId, setIsReschedulingEventId] = useState(null);
  const [reschedulingEventData, setReschedulingEventData] = useState(null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [eventEditMode, setEventEditMode] = useState(false);
  const [eventDraft, setEventDraft] = useState({
    title: "",
    therapist: "",
    client: "",
    event_type: "",
    start_time: "",
    end_time: "",
    notes: "",
    attendance_status: "",
  });

  const openEventModal = (event) => {
    setSelectedEvent(event);
    const resourceId = event.getResources?.()?.[0]?.id;
    setEventDraft({
      title: event.title || "",
      therapist: event.extendedProps?.therapist || resourceId || "",
      client: event.extendedProps?.client || "",
      event_type: event.extendedProps?.event_type || "",
      start_time: event.startStr || "",
      end_time: event.endStr || "",
      notes: event.extendedProps?.notes || "",
      attendance_status: event.extendedProps?.attendance_status || "",
    });
    setEventEditMode(false);
    setIsEventOpen(true);
  };

  const handleEventClick = (info) => {
    openEventModal(info.event);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    try {
      const fallbackTherapist =
        selectedEvent.extendedProps?.therapist || selectedEvent.getResources?.()?.[0]?.id;
      const therapistId = eventDraft.therapist
        ? Number(eventDraft.therapist)
        : Number(fallbackTherapist);
      if (!therapistId) {
        toast({ status: "error", title: "Select a practitioner first" });
        return;
      }
      await apiPut(`/schedule-events/${selectedEvent.id}/`, {
        title: eventDraft.title?.trim() || selectedEvent.title,
        therapist: therapistId,
        client: eventDraft.client ? Number(eventDraft.client) : null,
        event_type: eventDraft.event_type ? Number(eventDraft.event_type) : null,
        start_time: eventDraft.start_time,
        end_time: eventDraft.end_time,
        notes: eventDraft.notes,
        attendance_status: eventDraft.attendance_status || null,
      });
      toast({ status: "success", title: "Appointment updated" });
      setIsEventOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't update appointment" });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const { apiDelete } = await import("../../api");
      await apiDelete(`/schedule-events/${selectedEvent.id}/`);
      toast({ status: "success", title: "Appointment canceled" });
      setIsEventOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't cancel appointment" });
    }
  };

  const toggleTypeVisibility = (id) => {
    setVisibleTypes((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const filteredEvents = events.filter((e) => {
    const typeId = e.extendedProps.event_type;
    if (!typeId) return true;
    return visibleTypes.has(typeId);
  });

  const resources = therapists
    .filter((t) => selectedTherapists.includes(String(t.id)))
    .map((t) => {
      let businessHours;
      if (t.business_hours && Object.keys(t.business_hours).length > 0) {
        businessHours = [];
        Object.keys(t.business_hours).forEach(day => {
          const dayOfWeek = parseInt(day, 10);
          t.business_hours[day].forEach(block => {
            businessHours.push({
              daysOfWeek: [dayOfWeek],
              startTime: block.startTime,
              endTime: block.endTime
            });
          });
        });
      }
      return { 
        id: String(t.id), 
        title: t.name,
        ...(businessHours && businessHours.length > 0 ? { businessHours } : {})
      };
    });
  const computedBusinessHours = resources.reduce((acc, r) => {
    if (r.businessHours) {
      return [...acc, ...r.businessHours];
    }
    return acc;
  }, []);

  const hasResources = resources.length > 0;

  /* ===============================
     🔹 Add Event Type (Modal)
  =============================== */
  const handleCreateEventType = async () => {
    if (!newType.name.trim()) {
      toast({ status: "warning", title: "Enter a name for the event type" });
      return;
    }
    try {
      await apiPost("/event-types/", newType);
      toast({ status: "success", title: "Event type created" });
      setNewType({ name: "", color: "#A9CBB7" });
      eventTypeModal.onClose();
      fetchEventTypes();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't create event type" });
    }
  };

  /* ===============================
     🔹 Lifecycle
  =============================== */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchTherapists(), 
        fetchClients(), 
        fetchEventTypes(),
        loadBookingRequests(),
        loadAppointmentsList()
      ]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedTherapists.length) fetchEvents();
  }, [selectedTherapists]);

  useEffect(() => {
    fetchSessionLinks();
  }, []);

  const getSessionLinkForTherapist = (therapistId) => {
    const linksForTherapist = sessionLinks.filter(
      (l) => String(l.therapist) === String(therapistId)
    );
    if (linksForTherapist.length === 0) return null;
    return (
      linksForTherapist.find((l) => l.is_default) ||
      linksForTherapist[0]
    );
  };

  useEffect(() => {
    if (!newEvent.therapist && therapists.length) {
      setNewEvent((prev) => ({ ...prev, therapist: String(therapists[0].id) }));
    }
  }, [therapists]);

  useEffect(() => {
    if (!preselectClientId || prefillHandled) return;
    if (!clients.length) return;
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    setNewEvent((prev) => ({
      ...prev,
      client: String(preselectClientId),
      therapist: prev.therapist || selectedTherapists[0] || therapists[0]?.id || "",
      start_time: prev.start_time || toLocalInputValue(now),
      end_time: prev.end_time || toLocalInputValue(end),
    }));
    setIsOpen(true);
    setPrefillHandled(true);
    if (onPreselectConsumed) onPreselectConsumed();
  }, [preselectClientId, clients, prefillHandled, selectedTherapists, therapists]);

  /* ===============================
     🔹 UI
  =============================== */
  useEffect(() => {
    const api = miniCalendarRef.current?.getApi();
    if (api && miniDate) api.gotoDate(miniDate);
  }, [miniDate]);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleAddWaitlist = async () => {
    if (!waitlistForm.client) {
      toast({ status: "warning", title: "Select a patient to add" });
      return;
    }
    try {
      await apiPost("/waitlist/", {
        client: Number(waitlistForm.client),
        therapist: waitlistForm.therapist ? Number(waitlistForm.therapist) : null,
        event_type: waitlistForm.event_type ? Number(waitlistForm.event_type) : null,
        notes: waitlistForm.notes || "",
      });
      setWaitlistForm({ client: "", therapist: "", event_type: "", notes: "" });
      setWaitlistFormOpen(false);
      fetchWaitlist();
      toast({ status: "success", title: "Added to wait list" });
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't add to wait list" });
    }
  };

  const filteredWaitlist = waitlistItems.filter((w) => {
    const name = w.client_name || "";
    const q = waitlistSearch.trim().toLowerCase();
    if (q && !name.toLowerCase().includes(q)) return false;
    if (waitlistPractitioner !== "all" && String(w.therapist) !== waitlistPractitioner) {
      return false;
    }
    if (waitlistType !== "all" && String(w.event_type) !== waitlistType) {
      return false;
    }
    return true;
  });

  const filteredClientsForSearch = clients.filter((c) => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  });

  const hasConflict = () => {
    if (!newEvent.start_time || !newEvent.end_time || !newEvent.therapist) return false;
    const start = new Date(newEvent.start_time).getTime();
    const end = new Date(newEvent.end_time).getTime();
    if (!start || !end || end <= start) return true;
    return events.some((ev) => {
      if (String(ev.resourceId) !== String(newEvent.therapist)) return false;
      const evStart = new Date(ev.start).getTime();
      const evEnd = new Date(ev.end).getTime();
      return start < evEnd && end > evStart;
    });
  };

  const sidePanelContent = (
    <Box w="100%" bg="white" p={4} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
      <HStack spacing={0} mb={6} bg="gray.50" p={1} borderRadius="2xl">
        <Button 
          flex={1} 
          size="sm" 
          variant={activeSideTab === 'filters' ? 'solid' : 'ghost'}
          colorScheme={activeSideTab === 'filters' ? 'teal' : 'gray'}
          borderRadius="xl"
          onClick={() => setActiveSideTab('filters')}
          leftIcon={<FiCalendar />}
        >
          Filters
        </Button>
        <Button 
          flex={1} 
          size="sm" 
          variant={activeSideTab === 'requests' ? 'solid' : 'ghost'}
          colorScheme={activeSideTab === 'requests' ? 'teal' : 'gray'}
          borderRadius="xl"
          onClick={() => setActiveSideTab('requests')}
          leftIcon={<FiList />}
        >
          {bookingRequests.length > 0 && (
            <Badge colorScheme="red" variant="solid" borderRadius="full" mr={1} fontSize="10px">
              {bookingRequests.length}
            </Badge>
          )}
          Requests
        </Button>
      </HStack>

      {activeSideTab === 'filters' ? (
        <VStack align="stretch" spacing={6}>
          <Box
            border="1px solid #F1F3F4"
            borderRadius="2xl"
            p={2}
            sx={{
              ".fc-header-toolbar": { marginBottom: "0.5rem" },
              ".fc-toolbar-title": { fontSize: "0.9rem", fontWeight: "700" },
            }}
          >
            <FullCalendar
              ref={miniCalendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: "prev", center: "title", right: "next" }}
              height="auto"
              fixedWeekCount={false}
              dateClick={(info) => {
                setMiniDate(info.date);
                gotoDate(info.date);
              }}
            />
          </Box>

          <Box>
            <Text fontWeight="700" fontSize="xs" color="gray.400" textTransform="uppercase" mb={3} letterSpacing="wider">
              Practitioners
            </Text>
            <VStack align="start" spacing={3}>
              {therapists.map((t) => (
                <Checkbox
                  key={t.id}
                  colorScheme="teal"
                  isChecked={selectedTherapists.includes(String(t.id))}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedTherapists([...selectedTherapists, String(t.id)]);
                    else
                      setSelectedTherapists(
                        selectedTherapists.filter((id) => id !== String(t.id))
                      );
                  }}
                >
                  <Text fontSize="sm" fontWeight="500">{t.name}</Text>
                </Checkbox>
              ))}
            </VStack>
          </Box>

          <Divider />
          
          <Box>
            <Text fontWeight="700" fontSize="xs" color="gray.400" textTransform="uppercase" mb={3} letterSpacing="wider">
              Quick Skip
            </Text>
            <SimpleGrid columns={3} spacing={2}>
              <Button size="xs" variant="outline" onClick={() => shiftByDays(14)}>+2w</Button>
              <Button size="xs" variant="outline" onClick={() => shiftByDays(28)}>+4w</Button>
              <Button size="xs" variant="outline" onClick={() => shiftByMonths(3)}>+3m</Button>
            </SimpleGrid>
          </Box>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={4}>
          <Text fontWeight="700" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
            Booking Requests
          </Text>
          {bookingRequests.length === 0 ? (
            <VStack py={10} spacing={2}>
              <Icon as={FiCheckCircle} color="green.300" boxSize={8} />
              <Text fontSize="xs" color="gray.500" textAlign="center">No pending requests. You're all caught up!</Text>
            </VStack>
          ) : (
            bookingRequests.map(req => (
              <Box key={req.id} p={3} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                <Text fontWeight="700" fontSize="sm">{req.client_display_name}</Text>
                <Text fontSize="xs" color="gray.500" mb={3}>
                  {new Date(req.slot_start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(req.slot_start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Text>
                <HStack spacing={2}>
                  <Button size="xs" colorScheme="teal" flex={1} borderRadius="full" leftIcon={<FiCheck />} onClick={() => handleConfirmRequest(req.id)}>
                    Confirm
                  </Button>
                  <Button size="xs" variant="ghost" colorScheme="red" flex={1} borderRadius="full" leftIcon={<FiX />} onClick={() => handleDeclineRequest(req.id)}>
                    Pass
                  </Button>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      )}
    </Box>
  );

  if (!mounted) return <Box p={10} textAlign="center"><Spinner size="xl" /></Box>;

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" borderRadius="xl">
      <HStack align="start" spacing={8} flexDir={{ base: "column", xl: "row" }}>
        {/* MAIN — Calendar */}
        <Box flex="1" w="100%">
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
            <Heading>Appointments</Heading>
            <HStack>
              <Button
                leftIcon={<AddIcon />}
                size="sm"
                variant="outline"
                borderColor="#A9CBB7"
                _hover={{ bg: "#A9CBB7", color: "white" }}
                onClick={eventTypeModal.onOpen}
              >
                New Event Type
              </Button>
              <IconButton
                aria-label="Open sidebar"
                icon={<HamburgerIcon />}
                size="sm"
                display={{ base: "inline-flex", xl: "none" }}
                onClick={filtersDrawer.onOpen}
              />
              <Button
                size="sm"
                variant="ghost"
                display={{ base: "none", xl: "inline-flex" }}
                onClick={() => setShowSidePanel((v) => !v)}
              >
                {showSidePanel ? "Hide sidebar" : "Show sidebar"}
              </Button>
            </HStack>
          </HStack>

          <HStack justify="space-between" mb={3} flexWrap="wrap" gap={3}>
            <HStack>
              <IconButton
                aria-label="Prev"
                icon={<ChevronLeftIcon />}
                size="sm"
                onClick={() => getCalendarApi()?.prev()}
              />
              <IconButton
                aria-label="Next"
                icon={<ChevronRightIcon />}
                size="sm"
                onClick={() => getCalendarApi()?.next()}
              />
              <Button size="sm" onClick={() => getCalendarApi()?.today()}>
                Today
              </Button>
            </HStack>
            <Heading size="md" minW="180px">{rangeTitle || "Schedule"}</Heading>
            <HStack spacing={3} flexWrap="wrap">
              <Select
                size="sm"
                value={currentView}
                onChange={(e) => {
                  const view = e.target.value;
                  setCurrentView(view);
                  getCalendarApi()?.changeView(view);
                }}
              >
                <option value="dayGridMonth">Month</option>
                <option value="resourceTimeGridThreeDay">3 Days</option>
                <option value="resourceTimeGridWeek">7 Days</option>
                <option value="resourceTimeGridDay">Day</option>
              </Select>
              <HStack>
                <Text fontSize="sm">Hide names</Text>
                <Switch
                  size="sm"
                  isChecked={!showNames}
                  onChange={(e) => setShowNames(!e.target.checked)}
                />
              </HStack>
              <IconButton aria-label="Settings" icon={<SettingsIcon />} size="sm" />
            </HStack>
          </HStack>

          {!loading && (
          <Box className="calendar-wrapper" h="calc(100vh - 220px)" position="relative">
            <FullCalendar
              ref={calendarRef}
              plugins={[
                resourceTimeGridPlugin,
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              initialView="resourceTimeGridWeek"
              resources={resources}
              events={filteredEvents}
              headerToolbar={false}
              height="100%"
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              expandRows={true}
              nowIndicator={true}
              businessHours={computedBusinessHours.length > 0 ? computedBusinessHours : undefined}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              select={handleSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: 'short'
              }}
              datesSet={(arg) => {
                setCurrentView(arg.view.type);
                setMiniDate(arg.start);
                setRangeTitle(arg.view.title);
              }}
              dayHeaderFormat={{ weekday: "short", day: "numeric" }}
            />
          </Box>
          )}
        </Box>

        {/* RIGHT — Controls sidebar */}
        {showSidePanel && (
          <Box w={{ base: "100%", xl: "260px" }} display={{ base: "none", xl: "block" }}>
            {sidePanelContent}
          </Box>
        )}
      </HStack>

      {/* Mobile Filters Drawer */}
      <Drawer placement="right" onClose={filtersDrawer.onClose} isOpen={filtersDrawer.isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
          <DrawerBody>{sidePanelContent}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ✨ Create Appointment Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxW="540px" maxH="85vh" overflow="hidden" borderRadius="xl">
          <ModalHeader bg="#A9CBB7" color="#2E2E2E" py={5}>
            New appointment
          </ModalHeader>
          <ModalCloseButton color="#2E2E2E" mt={2} />
          <ModalBody overflowY="auto" pt={6} pb={8}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Practitioner</FormLabel>
                <Select
                  placeholder="Select practitioner"
                  value={newEvent.therapist}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, therapist: e.target.value })
                  }
                >
                  {therapists.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  placeholder="Select type"
                  value={newEvent.event_type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_type: e.target.value })
                  }
                >
                  {eventTypes.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Client</FormLabel>
                <Input
                  placeholder="Start typing to search patients"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientResults(true);
                  }}
                  onFocus={() => setShowClientResults(true)}
                  onBlur={() => setTimeout(() => setShowClientResults(false), 150)}
                />
                {showClientResults && (
                  <Box
                    mt={2}
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                    maxH="160px"
                    overflowY="auto"
                    bg="white"
                  >
                    {filteredClients.map((c) => (
                      <Box
                        key={c.id}
                        px={3}
                        py={2}
                        _hover={{ bg: "gray.50" }}
                        cursor="pointer"
                        onClick={() => {
                          setNewEvent({ ...newEvent, client: String(c.id) });
                          setClientSearch(c.name);
                          setShowClientResults(false);
                        }}
                      >
                        <Text fontSize="sm" fontWeight="semibold">
                          {c.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {c.email}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
                <VStack align="start" spacing={1} mt={2}>
                  <Text color="red.500" fontSize="sm" cursor="pointer">
                    Create a new patient
                  </Text>
                  <Text color="red.500" fontSize="sm" cursor="pointer">
                    Select from wait list
                  </Text>
                  <Text color="red.500" fontSize="sm" cursor="pointer">
                    Add to wait list
                  </Text>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={newEvent.start_time ? newEvent.start_time.slice(0, 10) : ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (!date) return;
                    const start = `${date}T${newEvent.start_time?.slice(11, 16) || "09:00"}`;
                    const end = `${date}T${newEvent.end_time?.slice(11, 16) || "10:00"}`;
                    setNewEvent({ ...newEvent, start_time: start, end_time: end });
                  }}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Start time</FormLabel>
                  <Input
                    type="time"
                    value={newEvent.start_time ? newEvent.start_time.slice(11, 16) : ""}
                    onChange={(e) => {
                      const date = newEvent.start_time?.slice(0, 10) || "";
                      const start = `${date}T${e.target.value}`;
                      setNewEvent({ ...newEvent, start_time: start });
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End time</FormLabel>
                  <Input
                    type="time"
                    value={newEvent.end_time ? newEvent.end_time.slice(11, 16) : ""}
                    onChange={(e) => {
                      const date = newEvent.end_time?.slice(0, 10) || "";
                      const end = `${date}T${e.target.value}`;
                      setNewEvent({ ...newEvent, end_time: end });
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              {hasConflict() && (
                <Box bg="yellow.100" border="1px solid #F2C94C" p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold">
                    Unavailable warning
                  </Text>
                  <Text fontSize="sm">
                    {newEvent.therapist
                      ? "Selected practitioner is unavailable at this time."
                      : "Select a practitioner to validate availability."}
                  </Text>
                </Box>
              )}

              <FormControl>
                <FormLabel>Repeat</FormLabel>
                <Select
                  value={newEvent.repeat}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, repeat: e.target.value })
                  }
                >
                  <option>None</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </Select>
              </FormControl>

              {newEvent.repeat !== "None" && (
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel>Repeat every</FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={newEvent.repeat_every}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, repeat_every: Number(e.target.value) || 1 })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      value={newEvent.repeat_unit}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, repeat_unit: e.target.value })
                      }
                    >
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Ends after</FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={newEvent.repeat_count}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, repeat_count: Number(e.target.value) || 1 })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>&nbsp;</FormLabel>
                    <Text fontSize="sm" color="gray.600">
                      occurrences
                    </Text>
                  </FormControl>
                </SimpleGrid>
              )}

              <FormControl>
                <FormLabel>Note</FormLabel>
                <Textarea
                  placeholder="Add notes (optional)"
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notes: e.target.value })
                  }
                />
              </FormControl>

              <Text color="red.500" fontSize="sm" cursor="pointer">
                Add to wait list
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#C9A960"
              color="white"
              _hover={{ bg: "#B89B55" }}
              mr={3}
              onClick={handleSave}
            >
              Create appointment
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 📌 Appointment Details Modal */}
      <Modal isOpen={isEventOpen} onClose={() => setIsEventOpen(false)} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="720px" maxH="85vh" overflow="hidden" borderRadius="xl">
          <Box bg="#A9CBB7" color="#2E2E2E" p={{ base: 5, md: 8 }} position="relative">
            <ModalCloseButton color="#2E2E2E" mt={2} />
            <Heading size="lg" mb={2} pr={8} lineHeight="1.3">
              {selectedEvent?.extendedProps?.event_type_name || selectedEvent?.title || "Appointment"}
            </Heading>
            <Text fontWeight="semibold" fontSize="md" mb={1}>
              {selectedEvent?.extendedProps?.therapist_name || "Practitioner"}
            </Text>
            <Text fontSize="md" mb={5} color="blackAlpha.800">
              {selectedEvent ? new Date(selectedEvent.startStr).toLocaleString("en-US", {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              }) : ""} at {selectedEvent ? new Date(selectedEvent.startStr).toLocaleTimeString("en-US", {
                hour: 'numeric', minute: '2-digit'
              }) : ""} for {selectedEvent && selectedEvent.endStr ? Math.round((new Date(selectedEvent.endStr) - new Date(selectedEvent.startStr)) / 60000) : 60} minutes
            </Text>
            <Button
              leftIcon={<span style={{ fontWeight: 'bold' }}>🎥</span>}
              bg="#C9A960"
              color="white"
              _hover={{ bg: "#B89B55" }}
              size="md"
              borderRadius="md"
              px={6}
              onClick={() => {
                const link = getSessionLinkForTherapist(
                  selectedEvent?.extendedProps?.therapist || selectedEvent?.getResources?.()?.[0]?.id
                );
                if (!link?.url) {
                  toast({ status: "warning", title: "No session link set for this therapist" });
                  return;
                }
                window.open(link.url, "_blank");
              }}
            >
              Join video call
            </Button>
          </Box>
          <ModalBody overflowY="auto" px={{ base: 5, md: 8 }} py={6} bg="white">
            {selectedEvent && (
              <VStack align="stretch" spacing={6}>
                {!eventEditMode ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="start">
                    {/* LEFT COLUMN: Client Info */}
                    <VStack align="stretch" spacing={5}>
                      <Box>
                        <Text fontSize="sm" color="#2E2E2E" fontWeight="semibold" mb={1}>Client</Text>
                        <Text fontWeight="medium" color="gray.800">
                          {selectedEvent.extendedProps?.client_name || "Client"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="#2E2E2E" fontWeight="semibold" mb={1}>Case</Text>
                        <Text fontSize="sm" color="gray.600">None</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="#2E2E2E" fontWeight="semibold" mb={1}>Next appointment</Text>
                        <Text fontSize="sm" color="gray.600">Not scheduled</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="#2E2E2E" fontWeight="semibold" mb={1}>Forms</Text>
                        <Text fontSize="sm" color="gray.600">None</Text>
                      </Box>
                    </VStack>

                    {/* RIGHT COLUMN: Actions */}
                    <VStack align="stretch" spacing={3}>
                      <Button
                        size="md"
                        w="100%"
                        justifyContent="flex-start"
                        variant={eventDraft.attendance_status === "arrived" ? "solid" : "outline"}
                        borderColor="gray.300"
                        colorScheme={eventDraft.attendance_status === "arrived" ? "green" : "gray"}
                        onClick={() =>
                          setEventDraft((prev) => ({
                            ...prev,
                            attendance_status: prev.attendance_status === "arrived" ? "" : "arrived",
                          }))
                        }
                      >
                        Arrived
                      </Button>
                      <Button
                        size="md"
                        w="100%"
                        justifyContent="flex-start"
                        variant={eventDraft.attendance_status === "did_not_arrive" ? "solid" : "outline"}
                        borderColor="gray.300"
                        colorScheme={eventDraft.attendance_status === "did_not_arrive" ? "red" : "gray"}
                        onClick={() =>
                          setEventDraft((prev) => ({
                            ...prev,
                            attendance_status: prev.attendance_status === "did_not_arrive" ? "" : "did_not_arrive",
                          }))
                        }
                      >
                        Did not arrive
                      </Button>
                      <Button
                        size="md"
                        w="100%"
                        justifyContent="space-between"
                        variant="outline"
                        borderColor="gray.300"
                        rightIcon={<EditIcon color="#A9CBB7" />}
                        onClick={() =>
                          router.push(
                            selectedEvent.extendedProps?.client
                              ? `/dashboard/therapist?tab=notes&noteClientId=${selectedEvent.extendedProps.client}&newNote=1`
                              : "/dashboard/therapist?tab=notes&newNote=1"
                          )
                        }
                      >
                        Add treatment note
                      </Button>
                      <Button
                        size="md"
                        w="100%"
                        justifyContent="space-between"
                        variant="outline"
                        borderColor="gray.300"
                        rightIcon={<AttachmentIcon color="#A9CBB7" />}
                        onClick={() => {
                          const link = getSessionLinkForTherapist(
                            selectedEvent.extendedProps?.therapist || selectedEvent.getResources?.()?.[0]?.id
                          );
                          if (!link?.url) {
                            toast({ status: "warning", title: "No session link set for this therapist" });
                            return;
                          }
                          navigator.clipboard?.writeText(link.url);
                          toast({ status: "success", title: "Session link copied" });
                        }}
                      >
                        Copy video invite link
                      </Button>
                    </VStack>
                  </SimpleGrid>
                ) : (
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Title</FormLabel>
                      <Input
                        value={eventDraft.title}
                        onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Practitioner</FormLabel>
                      <Select
                        value={eventDraft.therapist}
                        onChange={(e) => setEventDraft({ ...eventDraft, therapist: e.target.value })}
                      >
                        {therapists.map((t) => (
                          <option key={t.id} value={String(t.id)}>
                            {t.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={eventDraft.event_type}
                        onChange={(e) => setEventDraft({ ...eventDraft, event_type: e.target.value })}
                      >
                        {eventTypes.map((t) => (
                          <option key={t.id} value={String(t.id)}>
                            {t.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Client</FormLabel>
                      <Select
                        value={eventDraft.client || ""}
                        onChange={(e) => setEventDraft({ ...eventDraft, client: e.target.value })}
                      >
                        <option value="">No client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <HStack spacing={3}>
                      <FormControl>
                        <FormLabel>Start</FormLabel>
                        <Input
                          type="datetime-local"
                          value={eventDraft.start_time?.slice(0, 16)}
                          onChange={(e) =>
                            setEventDraft({ ...eventDraft, start_time: e.target.value })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>End</FormLabel>
                        <Input
                          type="datetime-local"
                          value={eventDraft.end_time?.slice(0, 16)}
                          onChange={(e) =>
                            setEventDraft({ ...eventDraft, end_time: e.target.value })
                          }
                        />
                      </FormControl>
                    </HStack>
                    <FormControl>
                      <FormLabel>Notes</FormLabel>
                      <Textarea
                        value={eventDraft.notes || ""}
                        onChange={(e) => setEventDraft({ ...eventDraft, notes: e.target.value })}
                      />
                    </FormControl>
                  </VStack>
                )}
                {!eventEditMode && (
                  <Box border="1px solid #E2E8F0" borderRadius="md" p={3} minH="80px" mt={4}>
                     <HStack align="flex-start" spacing={3}>
                       <Text color="gray.400" fontSize="lg">⚬</Text>
                       <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                         {selectedEvent.extendedProps?.notes || "No notes"}
                       </Text>
                     </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="#2E2E2E" color="white" borderBottomRadius="xl" justifyContent="space-between">
            <HStack spacing={4}>
              {!eventEditMode && (
                <Button variant="link" color="white" fontWeight="medium" fontSize="sm" _hover={{ color: "gray.200" }} onClick={() => handleSave()}>
                  + Book another
                </Button>
              )}
              {!eventEditMode ? (
                <>
                  <Button variant="link" color="white" fontWeight="medium" fontSize="sm" _hover={{ color: "gray.200" }} onClick={() => {
                    setIsReschedulingEventId(selectedEvent.id);
                    setReschedulingEventData(selectedEvent);
                    setIsEventOpen(false);
                    toast({
                      title: "Reschedule mode",
                      description: "Click an empty slot on the calendar to reschedule this appointment.",
                      status: "info",
                      duration: 6000,
                      isClosable: true,
                    });
                  }}>
                    Reschedule
                  </Button>
                  <Button variant="link" color="white" fontWeight="medium" fontSize="sm" _hover={{ color: "gray.200" }} onClick={() => setEventEditMode(true)}>
                    Edit
                  </Button>
                  <Button variant="link" color="white" fontWeight="medium" fontSize="sm" _hover={{ color: "gray.200" }} onClick={handleDeleteEvent}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button colorScheme="teal" size="sm" onClick={handleUpdateEvent}>
                  Save changes
                </Button>
              )}
            </HStack>
            <HStack>
               <Button variant="link" color="whiteAlpha.800" fontWeight="medium" fontSize="sm" leftIcon={<AttachmentIcon />}>
                 Archive
               </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>


      {/* 🎨 Add Event Type Modal */}
      <Modal isOpen={eventTypeModal.isOpen} onClose={eventTypeModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Event Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="e.g., Team Meeting"
                  value={newType.name}
                  onChange={(e) =>
                    setNewType({ ...newType, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Color</FormLabel>
                <Input
                  type="color"
                  value={newType.color}
                  onChange={(e) =>
                    setNewType({ ...newType, color: e.target.value })
                  }
                  w="70px"
                  p={0}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              bg="#A9CBB7"
              _hover={{ bg: "#C9A960", color: "white" }}
              onClick={handleCreateEventType}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={eventTypeModal.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ⏳ Wait list Modal */}
      <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="760px" maxH="85vh" overflow="hidden">
          <ModalHeader bg="#A9CBB7" color="#2E2E2E">
            <HStack justify="space-between">
              <Text>Wait list</Text>
              <Button
                size="sm"
                bg="white"
                color="#A9CBB7"
                _hover={{ bg: "gray.100" }}
                onClick={() => setWaitlistFormOpen((prev) => !prev)}
              >
                + Add to wait list
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="#2E2E2E" />
          <ModalBody overflowY="auto">
            {waitlistFormOpen && (
              <Box border="1px solid #E2E8F0" borderRadius="md" p={4} mb={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Client</FormLabel>
                    <Select
                      placeholder="Select patient"
                      value={waitlistForm.client}
                      onChange={(e) =>
                        setWaitlistForm((prev) => ({ ...prev, client: e.target.value }))
                      }
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Practitioner</FormLabel>
                    <Select
                      placeholder="Assign practitioner"
                      value={waitlistForm.therapist}
                      onChange={(e) =>
                        setWaitlistForm((prev) => ({ ...prev, therapist: e.target.value }))
                      }
                    >
                      {therapists.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Appointment type</FormLabel>
                    <Select
                      placeholder="Select appointment type"
                      value={waitlistForm.event_type}
                      onChange={(e) =>
                        setWaitlistForm((prev) => ({ ...prev, event_type: e.target.value }))
                      }
                    >
                      {eventTypes.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      placeholder="Optional notes"
                      value={waitlistForm.notes}
                      onChange={(e) =>
                        setWaitlistForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack justify="flex-end" mt={4}>
                  <Button variant="ghost" onClick={() => setWaitlistFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button bg="#C9A960" color="white" _hover={{ bg: "#B89B55" }} onClick={handleAddWaitlist}>
                    Save to wait list
                  </Button>
                </HStack>
              </Box>
            )}

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <FormControl>
                <FormLabel>Client</FormLabel>
                <Input
                  placeholder="Search patients"
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Practitioner</FormLabel>
                <Select
                  value={waitlistPractitioner}
                  onChange={(e) => setWaitlistPractitioner(e.target.value)}
                >
                  <option value="all">All practitioners</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Appointment type</FormLabel>
                <Select
                  value={waitlistType}
                  onChange={(e) => setWaitlistType(e.target.value)}
                >
                  <option value="all">All appointment types</option>
                  {eventTypes.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            <VStack align="stretch" spacing={3}>
              {filteredWaitlist.length === 0 ? (
                <Text color="gray.500" fontStyle="italic">
                  No patients on the wait list yet.
                </Text>
              ) : (
                filteredWaitlist.map((entry) => (
                  <Box
                    key={entry.id}
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                    p={3}
                  >
                    <HStack justify="space-between" align="start">
                      <Box>
                        <Text fontWeight="600">{entry.client_name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {entry.event_type_name || "No appointment type"}
                        </Text>
                        {entry.therapist_name && (
                          <Text fontSize="sm" color="gray.600">
                            {entry.therapist_name}
                          </Text>
                        )}
                        {entry.notes && (
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {entry.notes}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
