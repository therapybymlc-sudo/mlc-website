// src/pages/dashboards/TherapistDashboard.jsx
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Divider,
  Icon,
  Input,
  useToast,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  useDisclosure,
  Image,
  SimpleGrid,
  Textarea,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, Link as RRLink, useNavigate } from "react-router-dom";
// Resilient Link for SSR/Next compatibility
const Link = ({ to, children, ...props }) => {
  const navigate = (() => { try { return useNavigate(); } catch (e) { return null; } })();
  return (
    <a href={to} onClick={(e) => { if (navigate) { e.preventDefault(); navigate(to); } }} {...props}>
      {children}
    </a>
  );
};
import {
  CalendarIcon,
  EditIcon,
  AttachmentIcon,
  ViewIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import { useAuth } from "../../context/AuthContext";
import Clients from "./Clients";
import ClientNotes from "./ClientNotes";
import ClientFiles from "./ClientFiles";
import TherapistScheduleOverview from "./scheduling/TherapistScheduleOverview";
import Schedule from "./Schedule";
import TherapistAvailability from "./scheduling/TherapistAvailability";
import TherapistBookingRequests from "./scheduling/TherapistBookingRequests";
import TherapistAppointments from "./scheduling/TherapistAppointments";
import TherapistResources from "./resources/TherapistResources";
import SchedulingNotifications from "./notifications/SchedulingNotifications";
import NoteTemplates from "./NoteTemplates"; // ✅ added
import TherapistProfileSettings from "./TherapistProfileSettings";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import RichTextEditor from "../../components/RichTextEditor";

export default function TherapistDashboard() {
  const {
    user,
    logout,
    isAdmin,
    isPremium,
    isTherapist,
    isTherapistPreview,
    isVerifiedTherapist,
    isTherapistPremium,
    therapistProfile,
  } =
    useAuth(); // ✅ now using isAdmin from AuthContext
  const toast = useToast();
  const navigate = (() => {
    try { return useNavigate(); } catch (e) { return () => {}; }
  })();
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState("overview");
  const [preselectClientId, setPreselectClientId] = useState("");
  const [sessionLinks, setSessionLinks] = useState([]);
  const [newSessionLink, setNewSessionLink] = useState({ name: "", url: "", is_default: false });
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [previewClients, setPreviewClients] = useState([]);
  const [previewNote, setPreviewNote] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewClientName, setPreviewClientName] = useState("");
  const [clientGoals, setClientGoals] = useState([]);
  const [goalDraft, setGoalDraft] = useState("");
  const [showCareCheckin, setShowCareCheckin] = useState(false);
  const [careStep, setCareStep] = useState(0);
  const [careCheckin, setCareCheckin] = useState(() => {
    if (typeof window === "undefined") return { mood: "", energy: "", gratitude: "", note: "" };
    const saved = localStorage.getItem("mlc_therapist_checkin_data");
    if (!saved) return { mood: "", energy: "", gratitude: "", note: "" };
    try {
      return JSON.parse(saved);
    } catch {
      return { mood: "", energy: "", gratitude: "", note: "" };
    }
  });
  const [careNote, setCareNote] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("mlc_therapist_care_note") || "";
  });
  const [careJournalContent, setCareJournalContent] = useState(() => {
    if (typeof window === "undefined") return { html: "", text: "" };
    const draft = localStorage.getItem("mlc_therapist_journal_draft");
    if (!draft) return { html: "", text: "" };
    try {
      return JSON.parse(draft);
    } catch {
      return { html: "", text: "" };
    }
  });
  const [careJournalEmotion, setCareJournalEmotion] = useState("Grounded");
  const [careJournalIntensity, setCareJournalIntensity] = useState(5);
  const location = (() => {
    try { return useLocation(); } catch (e) {
      return typeof window !== "undefined" ? window.location : { pathname: "", search: "" };
    }
  })();

  const moodOptions = useMemo(
    () => [
      { label: "Grounded", color: "green" },
      { label: "Open", color: "teal" },
      { label: "Neutral", color: "gray" },
      { label: "Tired", color: "orange" },
      { label: "Overloaded", color: "red" },
    ],
    []
  );

  const [therapistJournalEntries, setTherapistJournalEntries] = useState(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("mlc_therapist_journal_entries");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((entry) => ({
            ...entry,
            html:
              entry.html ||
              (entry.text ? `<p>${entry.text}</p>` : ""),
            text: entry.text || "",
            intensity: entry.intensity || 5,
          }))
        : [];
    } catch {
      return [];
    }
  });

  const careSteps = [
    {
      title: "A gentle check‑in for you",
      body: (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.600">How are you arriving today?</Text>
          <HStack spacing={2} flexWrap="wrap">
            {moodOptions.map((m) => (
              <Button
                key={m.label}
                size="sm"
                variant={careCheckin.mood === m.label ? "solid" : "outline"}
                colorScheme={m.color}
                onClick={() => setCareCheckin((p) => ({ ...p, mood: m.label }))}
              >
                {m.label}
              </Button>
            ))}
          </HStack>
        </VStack>
      ),
    },
    {
      title: "Energy check",
      body: (
        <VStack align="stretch" spacing={2}>
          <Text color="gray.600">What’s your energy level?</Text>
          <HStack spacing={2} flexWrap="wrap">
            {["Low", "Medium", "High"].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={careCheckin.energy === level ? "solid" : "outline"}
                colorScheme="purple"
                onClick={() => setCareCheckin((p) => ({ ...p, energy: level }))}
              >
                {level}
              </Button>
            ))}
          </HStack>
        </VStack>
      ),
    },
    {
      title: "One thing you’re grateful for",
      body: (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.600">
            It can feel hard sometimes, but gratitude often appears when we look just
            beyond the obvious.
          </Text>
          <Textarea
            placeholder="A small gratitude from today..."
            value={careCheckin.gratitude}
            onChange={(e) =>
              setCareCheckin((p) => ({ ...p, gratitude: e.target.value }))
            }
          />
        </VStack>
      ),
    },
    {
      title: "Anything you want to hold gently?",
      body: (
        <Textarea
          placeholder="Optional note for your own care..."
          value={careCheckin.note}
          onChange={(e) => setCareCheckin((p) => ({ ...p, note: e.target.value }))}
        />
      ),
    },
  ];

  const saveCareCheckin = () => {
    localStorage.setItem("mlc_therapist_checkin_data", JSON.stringify(careCheckin));
    localStorage.setItem(
      "mlc_therapist_checkin_last",
      new Date().toISOString().slice(0, 10)
    );
    setShowCareCheckin(false);
    setCareStep(0);
    toast({ title: "Check‑in saved", status: "success" });
  };

  const saveCareNote = () => {
    localStorage.setItem("mlc_therapist_care_note", careNote);
    toast({ title: "Saved", status: "success" });
  };

  const saveCareJournal = () => {
    if (!careJournalContent.text.trim()) return;
    const entry = {
      id: Date.now(),
      html: careJournalContent.html,
      text: careJournalContent.text,
      emotion: careJournalEmotion,
      intensity: careJournalIntensity,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...therapistJournalEntries].slice(0, 30);
    localStorage.setItem("mlc_therapist_journal_entries", JSON.stringify(updated));
    setTherapistJournalEntries(updated);
    setCareJournalContent({ html: "", text: "" });
    localStorage.removeItem("mlc_therapist_journal_draft");
    toast({ title: "Saved to your private journal", status: "success" });
  };

  const renderLocked = (title, message) => (
    <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600" mb={4}>
        {message}
      </Text>
      <Button as={Link} to="/therapist-apply" colorScheme="purple">
        Apply to unlock
      </Button>
    </Box>
  );

  const requiresVerification = !isAdmin && !isVerifiedTherapist;
  const requiresPremium = !isAdmin && !isTherapistPremium;

  const renderContent = () => {
    if (isTherapistPreview) {
      const allowedPreviewTabs = new Set([
        "overview",
        "clients",
        "notes",
        "files",
        "schedule",
      ]);
      if (!allowedPreviewTabs.has(activeTab)) {
        return renderLocked(
          "Apply to unlock",
          "This area opens after your application is approved. Apply now to unlock full access."
        );
      }
    }
    switch (activeTab) {
      case "clients":
        if (requiresVerification) {
          return <UnverifiedOverlay />;
        }
        if (isTherapistPreview) {
          return (
            <VStack align="start" spacing={6}>
              <Heading>Clients (Preview)</Heading>
              <Text color="gray.600">
                Add a client to preview the workflow. Saving is disabled in preview.
              </Text>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
                <HStack spacing={3} flexWrap="wrap">
                  <Input
                    placeholder="Client name"
                    value={previewClientName}
                    onChange={(e) => setPreviewClientName(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!previewClientName.trim()) return;
                      setPreviewClients((prev) => [
                        ...prev,
                        { id: Date.now(), name: previewClientName.trim() },
                      ]);
                      setPreviewClientName("");
                      toast({
                        status: "info",
                        title: "Preview only",
                        description: "Apply to unlock client saving.",
                      });
                    }}
                    colorScheme="teal"
                  >
                    Add client (preview)
                  </Button>
                </HStack>
                <Divider my={4} />
                {previewClients.length === 0 ? (
                  <Text color="gray.500">No preview clients yet.</Text>
                ) : (
                  <VStack align="start" spacing={2}>
                    {previewClients.map((client) => (
                      <HStack key={client.id} w="100%" justify="space-between">
                        <Text>{client.name}</Text>
                        <Tag colorScheme="purple" borderRadius="full">
                          Preview
                        </Tag>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          );
        }
        return <Clients />;
      case "notes":
        if (isTherapistPreview) {
          return (
            <VStack align="start" spacing={6}>
              <Heading>Notes (Preview)</Heading>
              <Text color="gray.600">
                Draft a single note to see the flow. Saving is disabled in preview.
              </Text>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
                <Textarea
                  placeholder="Session note draft..."
                  value={previewNote}
                  onChange={(e) => setPreviewNote(e.target.value)}
                  minH="160px"
                />
                <Button
                  mt={3}
                  colorScheme="purple"
                  onClick={() =>
                    toast({
                      status: "info",
                      title: "Preview only",
                      description: "Apply to unlock note saving.",
                    })
                  }
                >
                  Save note (locked)
                </Button>
              </Box>
            </VStack>
          );
        }
        return <ClientNotes />;
      case "files":
        if (isTherapistPreview) {
          return (
            <VStack align="start" spacing={6}>
              <Heading>Client Files (Preview)</Heading>
              <Text color="gray.600">
                Add files to preview the flow. Saving is disabled in preview.
              </Text>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPreviewFiles((prev) => [
                      ...prev,
                      { id: Date.now(), name: file.name },
                    ]);
                    toast({
                      status: "info",
                      title: "Preview only",
                      description: "Apply to unlock file uploads.",
                    });
                  }}
                />
                <Divider my={4} />
                {previewFiles.length === 0 ? (
                  <Text color="gray.500">No preview files yet.</Text>
                ) : (
                  <VStack align="start" spacing={2}>
                    {previewFiles.map((file) => (
                      <HStack key={file.id} w="100%" justify="space-between">
                        <Text>{file.name}</Text>
                        <Tag colorScheme="purple" borderRadius="full">
                          Preview
                        </Tag>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          );
        }
        return <ClientFiles />;
      case "schedule":
        if (isTherapistPreview) {
          return (
            <VStack align="start" spacing={6}>
              <Heading>Schedule (Preview)</Heading>
              <Text color="gray.600">
                View the scheduler layout. Editing is disabled in preview.
              </Text>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    { time: "9:00 AM", label: "Available" },
                    { time: "11:00 AM", label: "Client session" },
                    { time: "2:00 PM", label: "Available" },
                    { time: "4:30 PM", label: "Consultation" },
                  ].map((slot) => (
                    <Box key={slot.time} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                      <Text fontWeight="semibold">{slot.time}</Text>
                      <Text color="gray.500">{slot.label}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
                <Button
                  mt={4}
                  variant="outline"
                  onClick={() =>
                    toast({
                      status: "info",
                      title: "Preview only",
                      description: "Apply to unlock scheduling tools.",
                    })
                  }
                >
                  Open scheduler (locked)
                </Button>
              </Box>
            </VStack>
          );
        }
        return <Schedule />;
      case "scheduleOverview":
        if (isTherapistPreview) {
          return renderLocked(
            "Schedule Overview",
            "Schedule Overview unlocks after your application is approved."
          );
        }
        return (
          <TherapistScheduleOverview
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
          />
        );
      case "availability":
        if (isTherapistPreview) {
          return renderLocked(
            "Availability",
            "Availability tools unlock after your application is approved."
          );
        }
        return <TherapistAvailability />;
      case "bookingRequests":
        if (isTherapistPreview) {
          return renderLocked(
            "Booking requests",
            "Request management unlocks after your application is approved."
          );
        }
        return <TherapistBookingRequests />;
      case "appointments":
        if (isTherapistPreview) {
          return renderLocked(
            "Appointments",
            "Appointment management unlocks after your application is approved."
          );
        }
        return <TherapistAppointments />;
      case "resources":
        if (requiresVerification) {
          return <UnverifiedOverlay />;
        }
        if (requiresPremium) {
          return <PremiumOverlay />;
        }
        if (isTherapistPreview) {
          return renderLocked(
            "Resources",
            "Resource sharing unlocks after your application is approved."
          );
        }
        return <TherapistResources />;
      case "notifications":
        return <SchedulingNotifications />;
      case "care":
        if (isTherapistPreview) {
          return renderLocked(
            "Therapist care",
            "This space opens after approval so we can support verified therapists."
          );
        }
        return (
          <VStack align="start" spacing={6}>
            <Heading>Therapist Care</Heading>
            <Text color="gray.600" maxW="2xl">
              A gentle space just for you — check in, reflect, and nurture your own
              steadiness.
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">Daily check‑in</Heading>
                  <Tag colorScheme="purple" borderRadius="full">
                    <TagLabel>{careCheckin.mood || "Not set"}</TagLabel>
                  </Tag>
                </HStack>
                <Text color="gray.500" mb={4}>
                  Start your day with a small moment of care.
                </Text>
                <Button onClick={() => setShowCareCheckin(true)} colorScheme="teal">
                  Open check‑in
                </Button>
              </Box>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Notes to self
                </Heading>
                <Textarea
                  placeholder="A gentle reminder for yourself today..."
                  value={careNote}
                  onChange={(e) => setCareNote(e.target.value)}
                />
                <Button mt={3} onClick={saveCareNote} colorScheme="purple">
                  Save note
                </Button>
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Private journal
                </Heading>
                <RichTextEditor
                  value={careJournalContent.html}
                  onChange={setCareJournalContent}
                  placeholder="Reflections for you only..."
                  isPremium={true}
                  minHeight="160px"
                  allowImages
                />
                <HStack mt={3} spacing={4} flexWrap="wrap">
                  <FormControl maxW="220px">
                    <FormLabel fontSize="sm">Emotion</FormLabel>
                    <Select
                      value={careJournalEmotion}
                      onChange={(e) => setCareJournalEmotion(e.target.value)}
                    >
                      {["Grounded", "Open", "Neutral", "Tired", "Overloaded"].map(
                        (emotion) => (
                          <option key={emotion} value={emotion}>
                            {emotion}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <Box flex="1" minW="200px">
                    <FormLabel fontSize="sm">
                      Intensity: {careJournalIntensity}/10
                    </FormLabel>
                    <Slider
                      value={careJournalIntensity}
                      min={1}
                      max={10}
                      step={1}
                      onChange={(value) => setCareJournalIntensity(value)}
                    >
                      <SliderTrack bg="green.100">
                        <SliderFilledTrack bg="green.400" />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>
                </HStack>
                <Button mt={3} onClick={saveCareJournal} colorScheme="teal">
                  Save entry
                </Button>
                <Divider my={4} />
                <VStack align="start" spacing={2}>
                  {therapistJournalEntries.length === 0 ? (
                    <Text color="gray.500">No entries yet.</Text>
                  ) : (
                    therapistJournalEntries.slice(0, 3).map((entry) => (
                      <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                        <Text fontSize="sm" color="gray.500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {entry.emotion ? `${entry.emotion} • ` : ""}{entry.intensity || 5}/10
                        </Text>
                        <Text noOfLines={3}>{entry.text}</Text>
                      </Box>
                    ))
                  )}
                </VStack>
              </Box>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Reflection prompts
                </Heading>
                <VStack align="start" spacing={3}>
                  <Text>What felt steady in your work today?</Text>
                  <Text>Where did you feel most present?</Text>
                  <Text>What support do you need this week?</Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>
        );
      case "clientTools":
        if (requiresVerification) {
          return <UnverifiedOverlay />;
        }
        if (requiresPremium) {
          return <PremiumOverlay />;
        }
        if (isTherapistPreview) {
          return renderLocked(
            "Client tools & sharing",
            "Assigning goals and sharing resources unlocks after approval."
          );
        }
        return (
          <VStack align="start" spacing={6}>
            <Heading>Client Tools & Sharing</Heading>
            <Text color="gray.600" maxW="2xl">
              Assign goals, share resources, and keep client support in one place.
            </Text>
            {!isPremium && (
              <Box
                w="100%"
                p={4}
                borderRadius="xl"
                bg="#FBF8F3"
                border="1px solid #F0E5CF"
              >
                <Text color="gray.700">
                  You’re on the free tier. Client Tools work, but syncing client
                  journaling and check‑ins across devices is Premium.
                </Text>
              </Box>
            )}

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
              <Heading size="sm" mb={3}>
                Select a client
              </Heading>
              <Select
                placeholder="Select a client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                {clients.map((client) => (
                  <option key={client.id} value={String(client.id)}>
                    {client.name}
                  </option>
                ))}
              </Select>
              {!selectedClientId && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Select a client to assign goals or share resources.
                </Text>
              )}
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Assign goals
                </Heading>
                <HStack mb={3}>
                  <Input
                    placeholder="New client goal..."
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!selectedClientId) {
                        toast({ status: "warning", title: "Select a client first" });
                        return;
                      }
                      if (!goalDraft.trim()) return;
                      try {
                        const saved = await apiPost("client-goals/", {
                          client: selectedClientId,
                          title: goalDraft.trim(),
                          created_by: "therapist",
                          is_completed: false,
                        });
                        setClientGoals((prev) => [
                          ...prev,
                          { id: saved.id, title: saved.title, is_completed: saved.is_completed },
                        ]);
                        setGoalDraft("");
                        toast({ status: "success", title: "Goal assigned" });
                      } catch (error) {
                        console.error(error);
                        toast({ status: "error", title: "Could not assign goal" });
                      }
                    }}
                    colorScheme="green"
                  >
                    Add
                  </Button>
                </HStack>
                {clientGoals.length === 0 ? (
                  <Text color="gray.500">No goals yet.</Text>
                ) : (
                  <VStack align="start" spacing={2}>
                    {clientGoals.map((goal) => (
                      <HStack key={goal.id} w="100%" justify="space-between">
                        <Text>
                          {goal.is_completed ? "✅ " : ""}
                          {goal.title}
                        </Text>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const updated = await apiPut(`client-goals/${goal.id}/`, {
                                title: goal.title,
                                is_completed: !goal.is_completed,
                              });
                              setClientGoals((prev) =>
                                prev.map((g) =>
                                  g.id === goal.id ? { ...g, is_completed: updated.is_completed } : g
                                )
                              );
                            } catch (error) {
                              toast({ status: "error", title: "Update failed" });
                            }
                          }}
                        >
                          {goal.is_completed ? "Mark active" : "Mark done"}
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Resources
                </Heading>
                <Text color="gray.600" mb={4}>
                  Create reusable resources and assign them to clients from the
                  Resources workspace.
                </Text>
                <Button
                  borderRadius="full"
                  colorScheme="purple"
                  onClick={() => setActiveTab("resources")}
                >
                  Open resources
                </Button>
              </Box>
            </SimpleGrid>
          </VStack>
        );
      case "noteTemplates": // ✅ new tab for Note Templates
        if (isTherapistPreview) {
          return renderLocked(
            "Note templates",
            "Templates unlock after approval to protect clinical integrity."
          );
        }
        return <NoteTemplates />;
      case "profileSettings":
        return <TherapistProfileSettings />;
      case "premium":
        if (isTherapistPreview) {
          return renderLocked(
            "Therapist Premium",
            "Premium tools unlock after approval and activation."
          );
        }
        return (
          <Box
            bg="linear-gradient(135deg, #120F1B 0%, #2B223B 60%, #3A2C4A 100%)"
            color="white"
            p={{ base: 6, md: 10 }}
            borderRadius="3xl"
            boxShadow="2xl"
          >
            <VStack align="start" spacing={8}>
              <HStack justify="space-between" w="100%" flexWrap="wrap">
                <Box>
                  <Tag bg="#C9A960" color="black" borderRadius="full" mb={3}>
                    Therapist Premium
                  </Tag>
                  <Heading size="xl">
                    The MLC Therapist OS
                  </Heading>
                  <Text color="whiteAlpha.700" mt={3} maxW="2xl">
                    A premium workspace built for therapists who want everything
                    in one place — client support, shared tools, and a calm practice flow.
                  </Text>
                </Box>
                <Box textAlign={{ base: "left", md: "right" }}>
                  {isPremium ? (
                    <Button bg="white" color="black">
                      Premium Enabled
                    </Button>
                  ) : (
                    <Button bg="#C9A960" color="black">
                      Upgrade (coming soon)
                    </Button>
                  )}
                  <Text fontSize="sm" color="whiteAlpha.600" mt={2}>
                    Admin preview enabled for you.
                  </Text>
                </Box>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                {[
                  {
                    title: "Client Journey Hub",
                    text: "Goals, journal prompts, shared resources, and tracking in one view.",
                  },
                  {
                    title: "Assessments & Outcomes",
                    text: "Short assessments and progress snapshots you can assign anytime.",
                  },
                  {
                    title: "Reminders & Rituals",
                    text: "Gentle nudges for check‑ins, reflections, and session prep.",
                  },
                  {
                    title: "MLC Library",
                    text: "Built‑in worksheets, meditations, and therapist tools.",
                  },
                ].map((item) => (
                  <Box
                    key={item.title}
                    bg="rgba(255,255,255,0.08)"
                    p={6}
                    borderRadius="2xl"
                    border="1px solid rgba(255,255,255,0.12)"
                  >
                    <Heading size="md" mb={2}>
                      {item.title}
                    </Heading>
                    <Text color="whiteAlpha.700">{item.text}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>
        );
      default:
        if (isTherapistPreview) {
          return (
            <VStack align="start" spacing={6}>
              <Heading color="#2E2E2E">
                Therapist Preview
              </Heading>
              <Text color="gray.600" maxW="3xl">
                Explore the basics — add a client, draft a note, preview files, and
                view the scheduler layout. Apply to unlock full access.
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
                <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                  <Heading size="md" mb={2}>
                    Client preview
                  </Heading>
                  <Text color="gray.500" mb={4}>
                    Add clients locally to test the workflow.
                  </Text>
                  <Button onClick={() => setActiveTab("clients")} colorScheme="teal">
                    Go to Clients
                  </Button>
                </Box>
                <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                  <Heading size="md" mb={2}>
                    Note preview
                  </Heading>
                  <Text color="gray.500" mb={4}>
                    Draft one note and see how it feels.
                  </Text>
                  <Button onClick={() => setActiveTab("notes")} colorScheme="purple">
                    Go to Notes
                  </Button>
                </Box>
                <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                  <Heading size="md" mb={2}>
                    File preview
                  </Heading>
                  <Text color="gray.500" mb={4}>
                    Add a file in preview mode.
                  </Text>
                  <Button onClick={() => setActiveTab("files")} colorScheme="green">
                    Go to Files
                  </Button>
                </Box>
                <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                  <Heading size="md" mb={2}>
                    Schedule preview
                  </Heading>
                  <Text color="gray.500" mb={4}>
                    View the scheduler layout.
                  </Text>
                  <Button onClick={() => setActiveTab("schedule")} colorScheme="orange">
                    Go to Schedule
                  </Button>
                </Box>
              </SimpleGrid>
              <Button as={Link} to="/therapist-apply" colorScheme="purple">
                Apply to unlock full access
              </Button>
            </VStack>
          );
        }
        return (
          <VStack align="start" spacing={4}>
            <Heading color="#2E2E2E">
              Welcome, {user?.firstName || user?.username}
            </Heading>
            <Text color="gray.600" maxW="3xl">
              Manage your clients, write notes, track appointments, and organize files —
              all in one seamless space.
            </Text>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <HStack justify="space-between" mb={3}>
                  <Heading size="md">Today’s therapist check‑in</Heading>
                  <Tag colorScheme="purple" borderRadius="full">
                    <TagLabel>{careCheckin.mood || "Not set"}</TagLabel>
                  </Tag>
                </HStack>
                <Text color="gray.500" mb={4}>
                  A gentle pause before your day begins.
                </Text>
                <Button onClick={() => setShowCareCheckin(true)} colorScheme="teal">
                  Start check‑in
                </Button>
              </Box>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Care note to self
                </Heading>
                <Textarea
                  placeholder="A small reminder for yourself..."
                  value={careNote}
                  onChange={(e) => setCareNote(e.target.value)}
                  minH="120px"
                />
                <Button mt={3} onClick={saveCareNote} colorScheme="purple">
                  Save note
                </Button>
              </Box>
            </SimpleGrid>
            <Box w="100%" bg="white" p={4} borderRadius="lg" border="1px solid #E2E8F0">
              <Heading size="sm" mb={3}>
                My current session links
              </Heading>
              <VStack align="stretch" spacing={3}>
                {sessionLinks.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No links saved yet.
                  </Text>
                ) : (
                  sessionLinks.map((link) => (
                    <Box key={link.id} p={3} border="1px solid #E2E8F0" borderRadius="md">
                      <HStack spacing={3}>
                        <Input
                          placeholder="Link name"
                          value={link.name || ""}
                          onChange={(e) =>
                            setSessionLinks((prev) =>
                              prev.map((l) => (l.id === link.id ? { ...l, name: e.target.value } : l))
                            )
                          }
                        />
                        <Input
                          placeholder="https://doxy.me/yourlink"
                          value={link.url || ""}
                          onChange={(e) =>
                            setSessionLinks((prev) =>
                              prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l))
                            )
                          }
                        />
                      </HStack>
                      <HStack mt={2} spacing={3}>
                        <Button
                          size="xs"
                          variant={link.is_default ? "solid" : "outline"}
                          colorScheme="teal"
                          onClick={() =>
                            setSessionLinks((prev) =>
                              prev.map((l) =>
                                l.id === link.id ? { ...l, is_default: true } : { ...l, is_default: false }
                              )
                            )
                          }
                        >
                          {link.is_default ? "Default" : "Make default"}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={async () => {
                            await apiPut(`session-links/${link.id}/`, {
                              name: link.name,
                              url: link.url,
                              is_default: link.is_default,
                            });
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          onClick={async () => {
                            await apiDelete(`session-links/${link.id}/`);
                            setSessionLinks((prev) => prev.filter((l) => l.id !== link.id));
                          }}
                        >
                          Remove
                        </Button>
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
              <Divider my={4} />
              <HStack spacing={3}>
                <Input
                  placeholder="Link name (e.g., Doxy room)"
                  value={newSessionLink.name}
                  onChange={(e) => setNewSessionLink((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="https://doxy.me/yourlink"
                  value={newSessionLink.url}
                  onChange={(e) => setNewSessionLink((p) => ({ ...p, url: e.target.value }))}
                />
                <Button
                  onClick={async () => {
                    if (!newSessionLink.url) {
                      toast({ status: "warning", title: "Please enter a session link URL" });
                      return;
                    }
                    try {
                      const normalizedUrl = /^https?:\/\//i.test(newSessionLink.url)
                        ? newSessionLink.url
                        : `https://${newSessionLink.url}`;
                      const created = await apiPost("session-links/", {
                        name: newSessionLink.name?.trim() || "Session link",
                        url: normalizedUrl,
                        is_default: !!newSessionLink.is_default,
                      });
                      setSessionLinks((prev) => [...prev, created]);
                      setNewSessionLink({ name: "", url: "", is_default: false });
                      toast({ status: "success", title: "Session link added" });
                    } catch (err) {
                      console.error(err);
                      const detail = err?.response?.data
                        ? JSON.stringify(err.response.data)
                        : "Couldn't add session link";
                      toast({ status: "error", title: "Couldn't add session link", description: detail });
                    }
                  }}
                >
                  Add
                </Button>
              </HStack>
            </Box>
          </VStack>
        );
    }
  };

  useEffect(() => {
    localStorage.setItem(
      "mlc_therapist_journal_draft",
      JSON.stringify(careJournalContent)
    );
  }, [careJournalContent]);

  useEffect(() => {
    if (isTherapistPreview) return;
    async function testProtected() {
      try {
        const res = await apiGet("../protected/");
        console.log("✅ Protected response:", res);
      } catch (err) {
        console.error("❌ Protected error:", err);
      }
    }
    testProtected();
  }, []);

  useEffect(() => {
    if (isTherapistPreview) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem("mlc_therapist_checkin_last");
    if (last !== today) {
      setShowCareCheckin(true);
    }
  }, []);

  useEffect(() => {
    if (isTherapistPreview) return;
    (async () => {
      try {
        const res = await apiGet("session-links/");
        const data = res.results ?? res;
        setSessionLinks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Session links load failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isTherapistPreview) return;
    (async () => {
      try {
        const res = await apiGet("clients/");
        const data = res.results ?? res;
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Clients load failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isTherapistPreview) return;
    if (!selectedClientId) {
      setClientGoals([]);
      return;
    }
    (async () => {
      try {
        const goals = await apiGet(`client-goals/?client=${selectedClientId}`);
        setClientGoals(
          Array.isArray(goals)
            ? goals.map((g) => ({
                id: g.id,
                title: g.title,
                is_completed: g.is_completed,
              }))
            : []
        );
      } catch (err) {
        console.error("Client tools load failed", err);
      }
    })();
  }, [selectedClientId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const clientId = params.get("newAppointmentClientId");
    if (tab) setActiveTab(tab);
    if (clientId) {
      setPreselectClientId(String(clientId));
    }
  }, [location.search]);

  const exitPreview = () => {
    localStorage.removeItem("mlc_role_preview");
    navigate("/dashboard/client");
  };

  const sidebarContent = (
    <VStack align="start" spacing={5}>
      <Heading size="sm" color="#2E2E2E" mb={3} textTransform="uppercase">
        Dashboard
      </Heading>

      <SidebarButton
        label="Overview"
        active={activeTab === "overview"}
        onClick={() => {
          setActiveTab("overview");
          onSidebarClose();
        }}
        icon={<ViewIcon />}
      />
      <SidebarButton
        label="Clients"
        active={activeTab === "clients"}
        onClick={() => {
          setActiveTab("clients");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Notes"
        active={activeTab === "notes"}
        onClick={() => {
          setActiveTab("notes");
          onSidebarClose();
        }}
        icon={<EditIcon />}
      />
      <SidebarButton
        label="Files"
        active={activeTab === "files"}
        onClick={() => {
          setActiveTab("files");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Calendar"
        active={activeTab === "schedule"}
        onClick={() => {
          setActiveTab("schedule");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />
      <SidebarButton
        label="Schedule Overview"
        active={activeTab === "scheduleOverview"}
        onClick={() => {
          setActiveTab("scheduleOverview");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />
      <SidebarButton
        label="Availability"
        active={activeTab === "availability"}
        onClick={() => {
          setActiveTab("availability");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />
      <SidebarButton
        label="Booking Requests"
        active={activeTab === "bookingRequests"}
        onClick={() => {
          setActiveTab("bookingRequests");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />
      <SidebarButton
        label="Appointments"
        active={activeTab === "appointments"}
        onClick={() => {
          setActiveTab("appointments");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />
      <SidebarButton
        label="Resources"
        active={activeTab === "resources"}
        onClick={() => {
          setActiveTab("resources");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Notifications"
        active={activeTab === "notifications"}
        onClick={() => {
          setActiveTab("notifications");
          onSidebarClose();
        }}
        icon={<ViewIcon />}
      />
      <SidebarButton
        label="Therapist Care"
        active={activeTab === "care"}
        onClick={() => {
          setActiveTab("care");
          onSidebarClose();
        }}
        icon={<ViewIcon />}
      />
      <SidebarButton
        label="Premium Studio"
        active={activeTab === "premium"}
        onClick={() => {
          setActiveTab("premium");
          onSidebarClose();
        }}
        icon={<ViewIcon />}
      />
      <SidebarButton
        label="Client Tools"
        active={activeTab === "clientTools"}
        onClick={() => {
          setActiveTab("clientTools");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Profile Settings"
        active={activeTab === "profileSettings"}
        onClick={() => {
          setActiveTab("profileSettings");
          onSidebarClose();
        }}
        icon={<EditIcon />}
      />

      {/* ✅ Admin-only Note Templates tab */}
      {isAdmin && (
        <SidebarButton
          label="Note Templates"
          active={activeTab === "noteTemplates"}
          onClick={() => {
            setActiveTab("noteTemplates");
            onSidebarClose();
          }}
          icon={<EditIcon />}
        />
      )}

      <Divider my={4} />

      {isTherapistPreview && (
        <Button
          variant="outline"
          borderRadius="full"
          w="full"
          onClick={exitPreview}
        >
          Exit preview
        </Button>
      )}

      <Button
        bg="#A9CBB7"
        color="black"
        borderRadius="full"
        fontWeight="medium"
        _hover={{ bg: "#C9A960", color: "white" }}
        onClick={logout}
        w="full"
      >
        Logout
      </Button>
    </VStack>
  );

  return (
    <Flex minH="100vh" overflow="hidden" direction={{ base: "column", md: "row" }}>
      {/* Mobile Header */}
      <Flex
        display={{ base: "flex", md: "none" }}
        align="center"
        justify="space-between"
        px={4}
        py={3}
        bg="white"
        borderBottom="1px solid #E2E8F0"
      >
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open menu"
          variant="ghost"
          onClick={onSidebarOpen}
        />
        <HStack spacing={2}>
          <Link to="/">
            <Image src="/logo_tra.png" alt="MLC Logo" boxSize="28px" />
          </Link>
          <Text fontWeight="semibold">Therapist Portal</Text>
        </HStack>
        <Box w="40px" />
      </Flex>

      {/* Desktop Sidebar */}
      <Box
        w="240px"
        bg="linear-gradient(180deg, rgba(169,203,183,0.25), rgba(169,203,183,0.1))"
        p={6}
        borderRight="1px solid #E2E8F0"
        display={{ base: "none", md: "block" }}
      >
        <HStack mb={6} spacing={3}>
          <Link to="/">
            <Image src="/logo_tra.png" alt="MLC Logo" boxSize="36px" />
          </Link>
          <Text fontWeight="semibold" fontSize="sm">
            MLC Health
          </Text>
        </HStack>
        {sidebarContent}
      </Box>

      {/* Mobile Sidebar Drawer */}
      <Drawer placement="left" onClose={onSidebarClose} isOpen={isSidebarOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Dashboard</DrawerHeader>
          <DrawerBody>{sidebarContent}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex="1" p={{ base: 4, md: 10 }} overflowY="auto" bg="#F9F9F9">
        {isTherapistPreview && (
          <Box
            mb={6}
            p={4}
            borderRadius="2xl"
            bg="#FBF8F3"
            border="1px solid #F0E5CF"
          >
            <HStack justify="space-between" flexWrap="wrap" spacing={3}>
              <Text color="gray.700">
                You’re in Therapist Preview. Apply to unlock full access.
              </Text>
              <Button as={Link} to="/therapist-apply" colorScheme="purple" size="sm">
                Apply now
              </Button>
            </HStack>
          </Box>
        )}
        {!isTherapistPreview && therapistProfile && requiresVerification && (
          <Box
            mb={6}
            p={4}
            borderRadius="2xl"
            bg="#FFF7F7"
            border="1px solid #FED7D7"
          >
            <HStack justify="space-between" flexWrap="wrap" spacing={3}>
              <Text color="gray.700">
                Your therapist account is pending verification.
              </Text>
              <Button as={Link} to="/therapist-apply" colorScheme="red" size="sm">
                Complete verification
              </Button>
            </HStack>
          </Box>
        )}
        {renderContent()}
      </Box>

      <Modal isOpen={showCareCheckin} onClose={() => setShowCareCheckin(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{careSteps[careStep]?.title}</ModalHeader>
          <ModalBody>{careSteps[careStep]?.body}</ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {careStep > 0 && (
                <Button variant="ghost" onClick={() => setCareStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {careStep < careSteps.length - 1 ? (
                <Button colorScheme="teal" onClick={() => setCareStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button colorScheme="purple" onClick={saveCareCheckin}>
                  Save check‑in
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

function SidebarButton({ label, active, onClick, icon }) {
  return (
    <Button
      w="full"
      justifyContent="flex-start"
      leftIcon={<Icon as={() => icon} />}
      variant={active ? "solid" : "ghost"}
      bg={active ? "#A9CBB7" : "transparent"}
      color={active ? "#2E2E2E" : "#555"}
      _hover={{ bg: "#C9A960", color: "white" }}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function UnverifiedOverlay() {
  return (
    <Box bg="white" p={8} borderRadius="2xl" boxShadow="md" textAlign="center">
      <Heading size="md" mb={3}>
        Verification required
      </Heading>
      <Text color="gray.600" mb={5}>
        Unlock by becoming a verified provider with MLC.
      </Text>
      <Button as={Link} to="/therapist-apply" colorScheme="purple">
        Go to therapist application
      </Button>
    </Box>
  );
}

function PremiumOverlay() {
  return (
    <Box bg="white" p={8} borderRadius="2xl" boxShadow="md" textAlign="center">
      <Heading size="md" mb={3}>
        Premium required
      </Heading>
      <Text color="gray.600" mb={5}>
        This feature is available on premium therapist subscriptions.
      </Text>
      <Tooltip label="This feature requires an active premium subscription" hasArrow placement="top">
        <Button colorScheme="purple" isDisabled>
          Upgrade coming soon
        </Button>
      </Tooltip>
    </Box>
  );
}
