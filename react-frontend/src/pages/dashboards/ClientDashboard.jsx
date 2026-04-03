import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Input,
  Textarea,
  Tag,
  TagLabel,
  Divider,
  useToast,
  Progress,
  Checkbox,
  IconButton,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import { useMemo, useState, useEffect } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  HamburgerIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LOCAL_KEYS = {
  journal: "mlc_client_journal_entries",
  notes: "mlc_client_session_notes",
  mood: "mlc_client_mood",
  goals: "mlc_client_goals",
  profile: "mlc_client_profile",
  checkin: "mlc_client_checkin_last",
  checkinData: "mlc_client_checkin_data",
};

const moodOptions = [
  { label: "Calm", color: "green" },
  { label: "Hopeful", color: "teal" },
  { label: "Okay", color: "gray" },
  { label: "Low", color: "orange" },
  { label: "Overwhelmed", color: "red" },
];

const defaultGoals = [
  { id: 1, label: "Practice grounding once a day", done: false },
  { id: 2, label: "Sleep by 11pm on weekdays", done: false },
  { id: 3, label: "Write one reflection per week", done: false },
];

const tools = [
  "5-4-3-2-1 grounding",
  "Box breathing (4-4-4-4)",
  "Body scan (3 minutes)",
  "Gentle movement break",
];

const prompts = [
  "What felt heavy today, and what felt light?",
  "One thing I need more of this week is…",
  "A moment I felt proud of myself was…",
];

export default function ClientDashboard() {
  const toast = useToast();
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeSection, setActiveSection] = useState("overview");
  const [journalText, setJournalText] = useState("");
  const [noteText, setNoteText] = useState(
    localStorage.getItem(LOCAL_KEYS.notes) || ""
  );
  const [mood, setMood] = useState(
    localStorage.getItem(LOCAL_KEYS.mood) || "Okay"
  );
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEYS.goals);
    if (!saved) return defaultGoals;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultGoals;
    }
  });
  const [newGoal, setNewGoal] = useState("");
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEYS.profile);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    pronouns: "",
    timezone: "",
    avatarUrl: "",
  });
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinStep, setCheckinStep] = useState(0);
  const [checkinData, setCheckinData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEYS.checkinData);
    if (!saved) return { mood: "", energy: "", stress: "", gratitude: "", note: "" };
    try {
      return JSON.parse(saved);
    } catch {
      return { mood: "", energy: "", stress: "", gratitude: "", note: "" };
    }
  });

  const journalEntries = useMemo(() => {
    const raw = localStorage.getItem(LOCAL_KEYS.journal);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, []);

  const saveJournal = () => {
    if (!journalText.trim()) return;
    const entry = {
      id: Date.now(),
      text: journalText.trim(),
      mood,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...journalEntries].slice(0, 30);
    localStorage.setItem(LOCAL_KEYS.journal, JSON.stringify(updated));
    setJournalText("");
    toast({ title: "Saved to your private journal", status: "success" });
  };

  const saveNotes = () => {
    localStorage.setItem(LOCAL_KEYS.notes, noteText);
    toast({ title: "Saved notes for next session", status: "success" });
  };

  const updateMood = (label) => {
    setMood(label);
    localStorage.setItem(LOCAL_KEYS.mood, label);
  };

  const toggleGoal = (id) => {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, done: !g.done } : g
    );
    setGoals(updated);
    localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(updated));
  };

  const progressValue =
    (goals.filter((g) => g.done).length / goals.length) * 100;

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    const updated = [
      { id: Date.now(), label: trimmed, done: false },
      ...goals,
    ];
    setGoals(updated);
    localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(updated));
    setNewGoal("");
  };

  const removeGoal = (id) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(updated));
  };

  const openProfileEditor = () => {
    setProfileDraft(
      profile || { name: "", pronouns: "", timezone: "", avatarUrl: "" }
    );
    setShowProfileModal(true);
  };

  const saveProfile = () => {
    const nextProfile = {
      ...profileDraft,
      name: profileDraft.name || "You",
    };
    setProfile(nextProfile);
    localStorage.setItem(LOCAL_KEYS.profile, JSON.stringify(nextProfile));
    setShowProfileModal(false);
  };

  const checkinSteps = [
    {
      title: "How are you feeling today?",
      body: (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.600">
            Choose the word that feels most true right now.
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {moodOptions.map((m) => (
              <Button
                key={m.label}
                size="sm"
                variant={checkinData.mood === m.label ? "solid" : "outline"}
                colorScheme={m.color}
                onClick={() => setCheckinData((p) => ({ ...p, mood: m.label }))}
              >
                {m.label}
              </Button>
            ))}
          </HStack>
        </VStack>
      ),
    },
    {
      title: "Energy & stress check",
      body: (
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text fontWeight="medium">Energy level</Text>
            <Select
              mt={2}
              value={checkinData.energy}
              onChange={(e) => setCheckinData((p) => ({ ...p, energy: e.target.value }))}
              placeholder="Select energy level"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </Box>
          <Box>
            <Text fontWeight="medium">Stress level</Text>
            <Select
              mt={2}
              value={checkinData.stress}
              onChange={(e) => setCheckinData((p) => ({ ...p, stress: e.target.value }))}
              placeholder="Select stress level"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </Box>
        </VStack>
      ),
    },
    {
      title: "Gratitude moment",
      body: (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.600">
            It can feel hard sometimes, but gratitude often shows up when we look
            just beyond the obvious.
          </Text>
          <Textarea
            placeholder="One thing I’m grateful for today..."
            value={checkinData.gratitude}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, gratitude: e.target.value }))
            }
          />
        </VStack>
      ),
    },
    {
      title: "Anything else you want to capture?",
      body: (
        <Textarea
          placeholder="Optional note for yourself..."
          value={checkinData.note}
          onChange={(e) => setCheckinData((p) => ({ ...p, note: e.target.value }))}
        />
      ),
    },
  ];

  const saveCheckin = () => {
    localStorage.setItem(LOCAL_KEYS.checkinData, JSON.stringify(checkinData));
    localStorage.setItem(LOCAL_KEYS.checkin, new Date().toISOString().slice(0, 10));
    setShowCheckin(false);
    setCheckinStep(0);
    toast({ title: "Daily check-in saved", status: "success" });
  };

  useEffect(() => {
    if (!profile) {
      setShowProfileModal(true);
    }
  }, [profile]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem(LOCAL_KEYS.checkin);
    if (last !== today) {
      setShowCheckin(true);
    }
  }, []);

  const navItems = [
    { id: "overview", label: "Dashboard" },
    { id: "checkin", label: "Daily Check‑in" },
    { id: "journal", label: "Private Journal" },
    { id: "notes", label: "Notes for Session" },
    { id: "goals", label: "My Goals" },
    { id: "shared", label: "Shared With Me" },
    { id: "materials", label: "Therapist Materials" },
    { id: "sessions", label: "My Sessions" },
    { id: "prompts", label: "Reflection Prompts" },
    { id: "profile", label: "My Profile" },
  ];

  const Sidebar = ({ onSelect }) => (
    <VStack align="stretch" spacing={2}>
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? "solid" : "ghost"}
          justifyContent="flex-start"
          borderRadius="full"
          bg={activeSection === item.id ? "#A9CBB7" : "transparent"}
          color={activeSection === item.id ? "black" : "gray.700"}
          onClick={() => {
            setActiveSection(item.id);
            onSelect?.();
          }}
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  );

  const renderSection = () => {
    if (activeSection === "overview") {
      return (
        <VStack align="start" spacing={6} w="100%">
          <Box>
            <Heading fontFamily="Playfair Display">Welcome back</Heading>
            <Text color="gray.600" mt={2} maxW="xl">
              Your private space to reflect, prepare for therapy, and keep gentle track
              of your progress.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <HStack justify="space-between" mb={3}>
                <Heading size="md">Today’s Mood Check‑in</Heading>
                <Tag colorScheme="green" borderRadius="full">
                  <TagLabel>{mood}</TagLabel>
                </Tag>
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                {moodOptions.map((m) => (
                  <Button
                    key={m.label}
                    size="sm"
                    variant={mood === m.label ? "solid" : "outline"}
                    colorScheme={m.color}
                    onClick={() => updateMood(m.label)}
                  >
                    {m.label}
                  </Button>
                ))}
              </HStack>
              <Button mt={4} variant="outline" onClick={() => setShowCheckin(true)}>
                Open daily check‑in
              </Button>
            </Box>

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <Heading size="md" mb={3}>
                My Goals
              </Heading>
              <VStack align="start" spacing={2}>
                {goals.slice(0, 4).map((g) => (
                  <Checkbox
                    key={g.id}
                    isChecked={g.done}
                    onChange={() => toggleGoal(g.id)}
                  >
                    {g.label}
                  </Checkbox>
                ))}
              </VStack>
              <Progress
                mt={4}
                value={progressValue}
                colorScheme="green"
                borderRadius="full"
              />
              <Button mt={3} variant="ghost" onClick={() => setActiveSection("goals")}>
                Edit goals
              </Button>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <Heading size="md" mb={3}>
                Private Journal
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={3}>
                Stored privately on this device unless you choose to share later.
              </Text>
              <Textarea
                placeholder="Write what’s on your mind..."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                mb={3}
                minH="140px"
              />
              <Button onClick={saveJournal} colorScheme="teal">
                Save Entry
              </Button>
              <Divider my={4} />
              <VStack align="start" spacing={2}>
                {journalEntries.length === 0 ? (
                  <Text color="gray.500">No journal entries yet.</Text>
                ) : (
                  journalEntries.slice(0, 3).map((entry) => (
                    <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                      <Text fontSize="sm" color="gray.500">
                        {new Date(entry.createdAt).toLocaleDateString()} • {entry.mood}
                      </Text>
                      <Text noOfLines={3}>{entry.text}</Text>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>

            <VStack spacing={6} align="stretch">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Notes for Next Session
                </Heading>
                <Textarea
                  placeholder="Things I want to talk about..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  minH="120px"
                />
                <Button mt={3} onClick={saveNotes} colorScheme="purple">
                  Save Notes
                </Button>
              </Box>

              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Grounding Toolkit
                </Heading>
                <VStack align="start" spacing={2}>
                  {tools.map((tool) => (
                    <HStack key={tool}>
                      <CheckCircleIcon color="green.400" />
                      <Text>{tool}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <HStack justify="space-between" mb={3}>
                <Heading size="md">Shared With Me</Heading>
                <StarIcon color="yellow.400" />
              </HStack>
              <Text color="gray.500" mb={4}>
                Files, worksheets, or resources your therapist shares with you.
              </Text>
              <Box p={4} bg="#FBF8F3" borderRadius="xl">
                <Text color="gray.500">Nothing shared yet.</Text>
              </Box>
            </Box>

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <HStack justify="space-between" mb={3}>
                <Heading size="md">My Sessions</Heading>
                <CalendarIcon color="purple.400" />
              </HStack>
              <Text color="gray.500" mb={4}>
                Your upcoming and past sessions will appear here.
              </Text>
              <Box p={4} bg="#F2F8F5" borderRadius="xl">
                <Text color="gray.500">No sessions to show yet.</Text>
              </Box>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <Heading size="md" mb={3}>
                Therapist Materials
              </Heading>
              <Text color="gray.500" mb={4}>
                Homework, worksheets, and exercises shared by your therapist.
              </Text>
              <Box p={4} bg="#FBF8F3" borderRadius="xl">
                <Text color="gray.500">No materials yet.</Text>
              </Box>
            </Box>

            <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
              <Heading size="md" mb={3}>
                Reflection Prompts
              </Heading>
              <VStack align="start" spacing={2}>
                {prompts.map((prompt) => (
                  <HStack key={prompt}>
                    <StarIcon color="purple.400" />
                    <Text>{prompt}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      );
    }

    if (activeSection === "goals") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            My Goals
          </Heading>
          <HStack mb={3}>
            <Input
              placeholder="Add a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <Button onClick={addGoal} colorScheme="green">
              Add
            </Button>
          </HStack>
          <VStack align="start" spacing={2}>
            {goals.length === 0 ? (
              <Text color="gray.500">No goals yet.</Text>
            ) : (
              goals.map((g) => (
                <HStack key={g.id} w="100%" justify="space-between">
                  <Checkbox isChecked={g.done} onChange={() => toggleGoal(g.id)}>
                    {g.label}
                  </Checkbox>
                  <IconButton
                    aria-label="Remove goal"
                    size="sm"
                    icon={<EditIcon />}
                    onClick={() => removeGoal(g.id)}
                  />
                </HStack>
              ))
            )}
          </VStack>
        </Box>
      );
    }

    if (activeSection === "journal") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Private Journal
          </Heading>
          <Textarea
            placeholder="Write what’s on your mind..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            mb={3}
            minH="180px"
          />
          <Button onClick={saveJournal} colorScheme="teal">
            Save Entry
          </Button>
          <Divider my={4} />
          <VStack align="start" spacing={2}>
            {journalEntries.length === 0 ? (
              <Text color="gray.500">No journal entries yet.</Text>
            ) : (
              journalEntries.map((entry) => (
                <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                  <Text fontSize="sm" color="gray.500">
                    {new Date(entry.createdAt).toLocaleDateString()} • {entry.mood}
                  </Text>
                  <Text>{entry.text}</Text>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      );
    }

    if (activeSection === "notes") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Notes for Next Session
          </Heading>
          <Textarea
            placeholder="Things I want to talk about..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            minH="160px"
          />
          <Button mt={3} onClick={saveNotes} colorScheme="purple">
            Save Notes
          </Button>
        </Box>
      );
    }

    if (activeSection === "checkin") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Daily Check‑in
          </Heading>
          <Text color="gray.600" mb={4}>
            Take a quiet moment to check in with yourself.
          </Text>
          <Button onClick={() => setShowCheckin(true)} colorScheme="teal">
            Start check‑in
          </Button>
        </Box>
      );
    }

    if (activeSection === "shared") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Shared With Me
          </Heading>
          <Text color="gray.500" mb={4}>
            Files, worksheets, or resources your therapist shares with you.
          </Text>
          <Box p={4} bg="#FBF8F3" borderRadius="xl">
            <Text color="gray.500">Nothing shared yet.</Text>
          </Box>
        </Box>
      );
    }

    if (activeSection === "materials") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Therapist Materials
          </Heading>
          <Text color="gray.500">No materials yet.</Text>
        </Box>
      );
    }

    if (activeSection === "sessions") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            My Sessions
          </Heading>
          <Text color="gray.500">No sessions to show yet.</Text>
        </Box>
      );
    }

    if (activeSection === "prompts") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Reflection Prompts
          </Heading>
          <VStack align="start" spacing={3}>
            {prompts.map((prompt) => (
              <HStack key={prompt}>
                <StarIcon color="purple.400" />
                <Text>{prompt}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      );
    }

    if (activeSection === "profile") {
      return (
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <HStack justify="space-between" mb={4}>
            <Heading size="md">My Profile</Heading>
            <Button size="sm" onClick={openProfileEditor}>
              Edit
            </Button>
          </HStack>
          <VStack align="start" spacing={2}>
            <Text><strong>Name:</strong> {profile?.name || "—"}</Text>
            <Text><strong>Pronouns:</strong> {profile?.pronouns || "—"}</Text>
            <Text><strong>Timezone:</strong> {profile?.timezone || "—"}</Text>
            <Text><strong>Avatar URL:</strong> {profile?.avatarUrl || "—"}</Text>
          </VStack>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box minH="100vh" bg="#F9F9F9">
      <HStack
        px={{ base: 4, md: 8 }}
        py={4}
        bg="white"
        borderBottom="1px solid #E2E8F0"
        justify="space-between"
      >
        <HStack spacing={3}>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            display={{ base: "inline-flex", lg: "none" }}
            onClick={onOpen}
          />
          <HStack as={Link} to="/" spacing={3}>
            <Avatar size="sm" name="MLC Therapy" src="/logo_tra.png" />
            <Text fontWeight="bold">MLC Therapy</Text>
          </HStack>
        </HStack>
        <HStack spacing={3}>
          <Button variant="ghost" onClick={() => setActiveSection("profile")}>
            {profile?.name || "Your Dashboard"}
          </Button>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </HStack>
      </HStack>

      <HStack align="start" spacing={6} px={{ base: 4, md: 8 }} py={8}>
        <Box
          w={{ base: "0", lg: "260px" }}
          display={{ base: "none", lg: "block" }}
        >
          <Sidebar />
        </Box>
        <Box flex="1">{renderSection()}</Box>
      </HStack>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Dashboard</DrawerHeader>
          <DrawerBody>
            <Sidebar onSelect={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set up your profile</ModalHeader>
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Input
                placeholder="Your name"
                value={profileDraft.name}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, name: e.target.value }))
                }
              />
              <Input
                placeholder="Pronouns (optional)"
                value={profileDraft.pronouns}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, pronouns: e.target.value }))
                }
              />
              <Input
                placeholder="Timezone (optional)"
                value={profileDraft.timezone}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, timezone: e.target.value }))
                }
              />
              <Input
                placeholder="Profile photo URL (optional)"
                value={profileDraft.avatarUrl}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, avatarUrl: e.target.value }))
                }
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={saveProfile}>
              Save profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showCheckin} onClose={() => setShowCheckin(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{checkinSteps[checkinStep]?.title}</ModalHeader>
          <ModalBody>{checkinSteps[checkinStep]?.body}</ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {checkinStep > 0 && (
                <Button variant="ghost" onClick={() => setCheckinStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {checkinStep < checkinSteps.length - 1 ? (
                <Button colorScheme="teal" onClick={() => setCheckinStep((s) => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button colorScheme="purple" onClick={saveCheckin}>
                  Save check‑in
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
