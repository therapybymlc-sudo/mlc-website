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
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { CalendarIcon, CheckCircleIcon, StarIcon } from "@chakra-ui/icons";

const LOCAL_KEYS = {
  journal: "mlc_client_journal_entries",
  notes: "mlc_client_session_notes",
  mood: "mlc_client_mood",
  goals: "mlc_client_goals",
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

  return (
    <Box px={{ base: 5, md: 10 }} py={{ base: 8, md: 12 }} bg="#F9F9F9" minH="100vh">
      <VStack align="start" spacing={6} maxW="6xl" mx="auto">
        <Box>
          <Heading fontFamily="Playfair Display">Welcome back</Heading>
          <Text color="gray.600" mt={2} maxW="xl">
            Your private space to reflect, prepare for therapy, and keep gentle track of
            your progress.
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
          </Box>

          <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
            <Heading size="md" mb={3}>
              My Goals
            </Heading>
            <VStack align="start" spacing={2}>
              {goals.map((g) => (
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
    </Box>
  );
}
