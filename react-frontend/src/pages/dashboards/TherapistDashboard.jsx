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
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
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
import Schedule from "./Schedule";
import NoteTemplates from "./NoteTemplates"; // ✅ added
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

export default function TherapistDashboard() {
  const { user, logout, isAdmin } = useAuth(); // ✅ now using isAdmin from AuthContext
  const toast = useToast();
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState("overview");
  const [preselectClientId, setPreselectClientId] = useState("");
  const [sessionLinks, setSessionLinks] = useState([]);
  const [newSessionLink, setNewSessionLink] = useState({ name: "", url: "", is_default: false });
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [materialDraft, setMaterialDraft] = useState({
    title: "",
    description: "",
    file_url: "",
  });
  const [clientGoals, setClientGoals] = useState([]);
  const [goalDraft, setGoalDraft] = useState("");
  const [clientShares, setClientShares] = useState([]);
  const [showCareCheckin, setShowCareCheckin] = useState(false);
  const [careStep, setCareStep] = useState(0);
  const [careCheckin, setCareCheckin] = useState(() => {
    const saved = localStorage.getItem("mlc_therapist_checkin_data");
    if (!saved) return { mood: "", energy: "", gratitude: "", note: "" };
    try {
      return JSON.parse(saved);
    } catch {
      return { mood: "", energy: "", gratitude: "", note: "" };
    }
  });
  const [careNote, setCareNote] = useState(
    localStorage.getItem("mlc_therapist_care_note") || ""
  );
  const [careJournal, setCareJournal] = useState("");
  const location = useLocation();

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
    const raw = localStorage.getItem("mlc_therapist_journal_entries");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
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
    if (!careJournal.trim()) return;
    const entry = {
      id: Date.now(),
      text: careJournal.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...therapistJournalEntries].slice(0, 30);
    localStorage.setItem("mlc_therapist_journal_entries", JSON.stringify(updated));
    setTherapistJournalEntries(updated);
    setCareJournal("");
    toast({ title: "Saved to your private journal", status: "success" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return <Clients />;
      case "notes":
        return <ClientNotes />;
      case "files":
        return <ClientFiles />;
      case "schedule":
        return (
          <Schedule
            preselectClientId={preselectClientId}
            onPreselectConsumed={() => setPreselectClientId("")}
          />
        );
      case "care":
        return (
          <VStack align="start" spacing={6}>
            <Heading fontFamily="Playfair Display">Therapist Care</Heading>
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
                <Textarea
                  placeholder="Reflections for you only..."
                  value={careJournal}
                  onChange={(e) => setCareJournal(e.target.value)}
                  minH="140px"
                  mb={3}
                />
                <Button onClick={saveCareJournal} colorScheme="teal">
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
                          {new Date(entry.createdAt).toLocaleDateString()}
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
        return (
          <VStack align="start" spacing={6}>
            <Heading fontFamily="Playfair Display">Client Tools & Sharing</Heading>
            <Text color="gray.600" maxW="2xl">
              Assign goals, share materials, and keep client support in one place.
            </Text>

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
              <Heading size="sm" mb={3}>
                Select a client
              </Heading>
              <Input
                list="client-list"
                placeholder="Start typing a client name..."
                value={
                  selectedClientId
                    ? clients.find((c) => String(c.id) === String(selectedClientId))?.name || ""
                    : ""
                }
                onChange={(e) => {
                  const match = clients.find(
                    (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setSelectedClientId(match ? String(match.id) : "");
                }}
              />
              <datalist id="client-list">
                {clients.map((client) => (
                  <option key={client.id} value={client.name} />
                ))}
              </datalist>
              {!selectedClientId && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Select a client to assign goals or share materials.
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
                  Share materials
                </Heading>
                <VStack align="stretch" spacing={2} mb={4}>
                  <Input
                    placeholder="Material title"
                    value={materialDraft.title}
                    onChange={(e) =>
                      setMaterialDraft((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="File URL (optional)"
                    value={materialDraft.file_url}
                    onChange={(e) =>
                      setMaterialDraft((p) => ({ ...p, file_url: e.target.value }))
                    }
                  />
                  <Textarea
                    placeholder="Short description"
                    value={materialDraft.description}
                    onChange={(e) =>
                      setMaterialDraft((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                  <Button
                    onClick={async () => {
                      if (!materialDraft.title.trim()) return;
                      try {
                        const saved = await apiPost("materials/", {
                          title: materialDraft.title.trim(),
                          description: materialDraft.description,
                          file_url: materialDraft.file_url,
                        });
                        setMaterials((prev) => [saved, ...prev]);
                        setMaterialDraft({ title: "", description: "", file_url: "" });
                        toast({ status: "success", title: "Material added" });
                      } catch (error) {
                        toast({ status: "error", title: "Could not add material" });
                      }
                    }}
                    colorScheme="purple"
                  >
                    Add material
                  </Button>
                </VStack>

                {materials.length === 0 ? (
                  <Text color="gray.500">No materials yet.</Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {materials.map((material) => (
                      <Box key={material.id} p={3} border="1px solid #E2E8F0" borderRadius="xl">
                        <Text fontWeight="semibold">{material.title}</Text>
                        {material.description && (
                          <Text fontSize="sm" color="gray.600">
                            {material.description}
                          </Text>
                        )}
                        <HStack mt={2} spacing={2}>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={async () => {
                              if (!selectedClientId) {
                                toast({ status: "warning", title: "Select a client first" });
                                return;
                              }
                              try {
                                await apiPost("material-shares/", {
                                  material: material.id,
                                  client: selectedClientId,
                                  note: "Shared from therapist dashboard",
                                });
                                const shares = await apiGet(`material-shares/?client=${selectedClientId}`);
                                setClientShares(shares || []);
                                toast({ status: "success", title: "Shared with client" });
                              } catch (error) {
                                toast({ status: "error", title: "Share failed" });
                              }
                            }}
                          >
                            Share to client
                          </Button>
                          {material.file_url && (
                            <Button
                              as="a"
                              href={material.file_url}
                              target="_blank"
                              size="xs"
                              variant="ghost"
                            >
                              Open file
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </SimpleGrid>

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
              <Heading size="md" mb={3}>
                Shared with this client
              </Heading>
              {clientShares.length === 0 ? (
                <Text color="gray.500">No materials shared yet.</Text>
              ) : (
                <VStack align="start" spacing={2}>
                  {clientShares.map((share) => (
                    <HStack key={share.id} w="100%" justify="space-between">
                      <Text>{share.material_title || "Material"}</Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        color="red.500"
                        onClick={async () => {
                          try {
                            await apiDelete(`material-shares/${share.id}/`);
                            setClientShares((prev) => prev.filter((s) => s.id !== share.id));
                          } catch (error) {
                            toast({ status: "error", title: "Remove failed" });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        );
      case "noteTemplates": // ✅ new tab for Note Templates
        return <NoteTemplates />;
      default:
        return (
          <VStack align="start" spacing={4}>
            <Heading fontFamily="Playfair Display" color="#2E2E2E">
              Welcome, {user?.firstName || user?.username}
            </Heading>
            <Text color="gray.600" fontFamily="Lato" maxW="3xl">
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
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem("mlc_therapist_checkin_last");
    if (last !== today) {
      setShowCareCheckin(true);
    }
  }, []);

  useEffect(() => {
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
    (async () => {
      try {
        const res = await apiGet("materials/");
        const data = res.results ?? res;
        setMaterials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Materials load failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setClientGoals([]);
      setClientShares([]);
      return;
    }
    (async () => {
      try {
        const [goals, shares] = await Promise.all([
          apiGet(`client-goals/?client=${selectedClientId}`),
          apiGet(`material-shares/?client=${selectedClientId}`),
        ]);
        setClientGoals(
          Array.isArray(goals)
            ? goals.map((g) => ({
                id: g.id,
                title: g.title,
                is_completed: g.is_completed,
              }))
            : []
        );
        setClientShares(Array.isArray(shares) ? shares : []);
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
        label="Schedule"
        active={activeTab === "schedule"}
        onClick={() => {
          setActiveTab("schedule");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
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
        label="Client Tools"
        active={activeTab === "clientTools"}
        onClick={() => {
          setActiveTab("clientTools");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
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
      fontFamily="Lato"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
