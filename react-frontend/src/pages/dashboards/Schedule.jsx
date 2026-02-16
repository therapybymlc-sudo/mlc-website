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
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, SettingsIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../api";

export default function Schedule({ preselectClientId, onPreselectConsumed }) {
  const toast = useToast();
  const eventTypeModal = useDisclosure();
  const calendarRef = useRef(null);
  const miniCalendarRef = useRef(null);
  const navigate = useNavigate();

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
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);

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
  const handleSelect = (info) => {
    const start = info.start ? new Date(info.start) : null;
    const end = info.end ? new Date(info.end) : null;
    const autoEnd = start ? new Date(start.getTime() + 60 * 60 * 1000) : null;
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
    setPatientSearch("");
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
    .map((t) => ({ id: String(t.id), title: t.name }));
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
      await Promise.all([fetchTherapists(), fetchClients(), fetchEventTypes()]);
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

  const filteredPatients = clients.filter((c) => {
    const q = patientSearch.trim().toLowerCase();
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
    <Box w="100%" bg="white" p={4} borderRadius="lg" boxShadow="sm">
      <Heading size="sm" mb={3}>Calendar</Heading>

      <Box
        border="1px solid #E2E8F0"
        borderRadius="md"
        p={2}
        mb={4}
        sx={{
          ".fc-header-toolbar": { marginBottom: "0.5rem" },
          ".fc-toolbar": { alignItems: "center" },
          ".fc-toolbar-title": {
            fontSize: "0.95rem",
            fontWeight: "600",
            lineHeight: "1.2",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          ".fc-col-header-cell": {
            padding: "2px 4px",
          },
          ".fc-col-header-cell-cushion": {
            display: "block",
            fontSize: "0.7rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          ".fc-daygrid-day-number": {
            fontSize: "0.75rem",
            padding: "2px",
          },
        }}
      >
        <FullCalendar
          ref={miniCalendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev", center: "title", right: "next" }}
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          dateClick={(info) => {
            setMiniDate(info.date);
            gotoDate(info.date);
          }}
        />
      </Box>

      <Button
        w="100%"
        mb={4}
        leftIcon={
          <Badge bg="white" color="black" borderRadius="full" px={2}>
            {waitlistItems.length}
          </Badge>
        }
        bg="#0A7BA1"
        color="white"
        _hover={{ bg: "#096A8B" }}
        onClick={() => setIsWaitlistOpen(true)}
      >
        Wait list
      </Button>

      <Text fontWeight="medium" mb={2}>Skip ahead</Text>
      <SimpleGrid columns={3} spacing={2} mb={4}>
        <Button size="xs" variant="outline" onClick={() => shiftByDays(14)}>+2w</Button>
        <Button size="xs" variant="outline" onClick={() => shiftByDays(28)}>+4w</Button>
        <Button size="xs" variant="outline" onClick={() => shiftByDays(42)}>+6w</Button>
        <Button size="xs" variant="outline" onClick={() => shiftByMonths(3)}>+3m</Button>
        <Button size="xs" variant="outline" onClick={() => shiftByMonths(6)}>+6m</Button>
        <Button size="xs" variant="outline" onClick={() => shiftByMonths(12)}>+12m</Button>
      </SimpleGrid>

      <Divider my={3} />

      <Text fontWeight="medium" mb={2}>Practitioners</Text>
      <VStack align="start" spacing={2} mb={4}>
        {therapists.map((t) => (
          <Checkbox
            key={t.id}
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
            {t.name}
          </Checkbox>
        ))}
      </VStack>

      <Divider my={3} />
    </Box>
  );

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" borderRadius="xl">
      <HStack align="start" spacing={8} flexDir={{ base: "column", xl: "row" }}>
        {/* MAIN — Calendar */}
        <Box flex="1" w="100%">
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
            <Heading fontFamily="Playfair Display">Appointments</Heading>
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
            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow="sm"
              overflowX="auto"
              sx={{
                ".fc-col-header-cell-cushion": {
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                },
                ".fc-col-header-cell": {
                  padding: "4px 6px",
                },
                ".fc-col-header-cell-cushion, .fc-resource": {
                  fontSize: "0.8rem",
                },
                ".fc-event-title, .fc-event-title-container": {
                  whiteSpace: "normal",
                },
                ".fc-event": {
                  overflow: "hidden",
                },
                ".fc-event-main": {
                  overflow: "hidden",
                },
                ".fc-event-time, .fc-event-title": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "@media (max-width: 768px)": {
                  ".fc": {
                    minWidth: "720px",
                  },
                  ".fc-col-header-cell-cushion, .fc-resource": {
                    fontSize: "0.7rem",
                  },
                  ".fc-timegrid-slot-label": {
                    fontSize: "0.7rem",
                  },
                },
              }}
            >
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, interactionPlugin]}
                initialView={hasResources ? "resourceTimeGridWeek" : "timeGridWeek"}
                schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                resources={resources}
                resourceAreaWidth={showNames ? "140px" : "0px"}
                resourceAreaHeaderContent={showNames ? "Practitioner" : ""}
                views={{
                  resourceTimeGridThreeDay: { type: "resourceTimeGridWeek", duration: { days: 3 } },
                  resourceTimeGridWeek: { type: "resourceTimeGridWeek" },
                  resourceTimeGridDay: { type: "resourceTimeGridDay" },
                }}
                selectable
                select={handleSelect}
                events={filteredEvents}
                eventClick={handleEventClick}
                datesSet={(arg) => {
                  setCurrentView(arg.view.type);
                  setMiniDate(arg.start);
                  setRangeTitle(arg.view.title);
                }}
                height="78vh"
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                headerToolbar={false}
                eventContent={(arg) => {
                  const clientName = arg.event.extendedProps.client_name;
                  const typeName = arg.event.extendedProps.event_type_name;
                  return (
                    <Box>
                      <Text fontSize="xs" fontWeight="bold">
                        {arg.timeText}
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {clientName || arg.event.title}
                      </Text>
                      <Text fontSize="xs">{typeName || "Session"}</Text>
                    </Box>
                  );
                }}
                eventTextColor="#1F2A2E"
                dayHeaderFormat={{ weekday: "short", day: "numeric" }}
                slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent maxW="520px" maxH="85vh" overflow="hidden">
          <ModalHeader bg="#0A7BA1" color="white">
            New appointment
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
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
                <FormLabel>Patient</FormLabel>
                <Input
                  placeholder="Start typing to search patients"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientResults(true);
                  }}
                  onFocus={() => setShowPatientResults(true)}
                  onBlur={() => setTimeout(() => setShowPatientResults(false), 150)}
                />
                {showPatientResults && (
                  <Box
                    mt={2}
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                    maxH="160px"
                    overflowY="auto"
                    bg="white"
                  >
                    {filteredPatients.map((c) => (
                      <Box
                        key={c.id}
                        px={3}
                        py={2}
                        _hover={{ bg: "gray.50" }}
                        cursor="pointer"
                        onClick={() => {
                          setNewEvent({ ...newEvent, client: String(c.id) });
                          setPatientSearch(c.name);
                          setShowPatientResults(false);
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
              bg="#D14D72"
              color="white"
              _hover={{ bg: "#B83D60" }}
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
      <Modal isOpen={isEventOpen} onClose={() => setIsEventOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxW="720px" maxH="85vh" overflow="hidden">
          <ModalHeader bg="#0A7BA1" color="white">
            {selectedEvent?.extendedProps?.event_type_name || selectedEvent?.title || "Appointment"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" px={6} py={5}>
            {selectedEvent && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="semibold">{selectedEvent.extendedProps?.therapist_name || "Practitioner"}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(selectedEvent.startStr).toLocaleString()} — {new Date(selectedEvent.endStr).toLocaleTimeString()}
                  </Text>
                </Box>

                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant={eventDraft.attendance_status === "arrived" ? "solid" : "outline"}
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
                    size="sm"
                    variant={eventDraft.attendance_status === "did_not_arrive" ? "solid" : "outline"}
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
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        selectedEvent.extendedProps?.client
                          ? `/dashboard/therapist?tab=notes&noteClientId=${selectedEvent.extendedProps.client}&newNote=1`
                          : "/dashboard/therapist?tab=notes&newNote=1"
                      )
                    }
                  >
                    Add treatment note
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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
                </HStack>

                {!eventEditMode ? (
                  <>
                    <Box bg="gray.50" borderRadius="md" p={3}>
                      <Text fontWeight="semibold">{selectedEvent.extendedProps?.client_name || "Client"}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedEvent.extendedProps?.event_type_name || "Session"}
                      </Text>
                      {selectedEvent.extendedProps?.notes && (
                        <Text mt={2} fontSize="sm">{selectedEvent.extendedProps.notes}</Text>
                      )}
                    </Box>
                  </>
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
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50">
            <HStack spacing={3}>
              <Button variant="outline" onClick={() => setIsEventOpen(false)}>
                Close
              </Button>
              {!eventEditMode ? (
                <>
                  <Button variant="outline" onClick={() => setEventEditMode(true)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => setEventEditMode(true)}>
                    Reschedule
                  </Button>
                </>
              ) : (
                <Button colorScheme="teal" onClick={handleUpdateEvent}>
                  Save changes
                </Button>
              )}
              <Button variant="outline" colorScheme="red">
                Cancel
              </Button>
              <Button variant="ghost" color="gray.500">
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
          <ModalHeader bg="#0A7BA1" color="white">
            <HStack justify="space-between">
              <Text>Wait list</Text>
              <Button
                size="sm"
                bg="white"
                color="#0A7BA1"
                _hover={{ bg: "gray.100" }}
                onClick={() => setWaitlistFormOpen((prev) => !prev)}
              >
                + Add to wait list
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody overflowY="auto">
            {waitlistFormOpen && (
              <Box border="1px solid #E2E8F0" borderRadius="md" p={4} mb={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Patient</FormLabel>
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
                  <Button bg="#0A7BA1" color="white" _hover={{ bg: "#096A8B" }} onClick={handleAddWaitlist}>
                    Save to wait list
                  </Button>
                </HStack>
              </Box>
            )}

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <FormControl>
                <FormLabel>Patient</FormLabel>
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
