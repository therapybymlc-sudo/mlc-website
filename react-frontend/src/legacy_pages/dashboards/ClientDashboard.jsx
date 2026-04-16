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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { useMemo, useState, useEffect } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  HamburgerIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";
import RichTextEditor from "../../components/RichTextEditor";
import ClientBooking from "./scheduling/ClientBooking";
import ClientBookingRequests from "./scheduling/ClientBookingRequests";
import ClientAppointmentsBoard from "./scheduling/ClientAppointmentsBoard";
import ClientResources from "./resources/ClientResources";
import SchedulingNotifications from "./notifications/SchedulingNotifications";

const LOCAL_KEYS = {
  journal: "mlc_client_journal_entries",
  notes: "mlc_client_session_notes",
  mood: "mlc_client_mood",
  goals: "mlc_client_goals",
  profile: "mlc_client_profile",
  checkin: "mlc_client_checkin_last",
  checkinPrompt: "mlc_client_checkin_prompt_last",
  checkinData: "mlc_client_checkin_data",
  checkinHistory: "mlc_client_checkin_history",
  profileCompleted: "mlc_client_profile_completed",
  profileDraft: "mlc_client_profile_draft",
  journalDraft: "mlc_client_journal_draft",
  notesRich: "mlc_client_session_notes_rich",
  notesDraft: "mlc_client_notes_draft",
};

const getLocalDayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

const journalEmotions = [
  "Calm",
  "Hopeful",
  "Grateful",
  "Anxious",
  "Overwhelmed",
  "Tired",
  "Sad",
  "Angry",
  "Motivated",
];

const stripHtml = (value) =>
  value ? value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";

export default function ClientDashboard({ initialSection }) {
  const toast = useToast();
  const { logout, isPremium } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = (() => {
    try { return useLocation(); } catch (e) {
      return typeof window !== "undefined" ? window.location : { pathname: "", search: "" };
    }
  })();
  const [activeSection, setActiveSection] = useState(initialSection || "overview");
  const [journalContent, setJournalContent] = useState(() => {
    if (typeof window === "undefined") return { html: "", text: "" };
    const draft = localStorage.getItem(LOCAL_KEYS.journalDraft);
    if (!draft) return { html: "", text: "" };
    try {
      return JSON.parse(draft);
    } catch {
      return { html: "", text: "" };
    }
  });
  const [journalEmotion, setJournalEmotion] = useState("Calm");
  const [journalIntensity, setJournalIntensity] = useState(5);
  const [timeZones, setTimeZones] = useState([]);
  const [notesContent, setNotesContent] = useState(() => {
    if (typeof window === "undefined") return { html: "", text: "" };
    const saved = localStorage.getItem(LOCAL_KEYS.notesRich);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { html: "", text: "" };
      }
    }
    const legacy = localStorage.getItem(LOCAL_KEYS.notes) || "";
    return { html: legacy ? `<p>${legacy}</p>` : "", text: legacy };
  });
  const [shareNotes, setShareNotes] = useState(false);
  const [mood, setMood] = useState(() => {
    if (typeof window === "undefined") return "Okay";
    return localStorage.getItem(LOCAL_KEYS.mood) || "Okay";
  });
  const [goals, setGoals] = useState(defaultGoals);
  const [newGoal, setNewGoal] = useState("");
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(LOCAL_KEYS.profile);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    pronouns: "",
    timezone: "",
    avatarUrl: "",
  });
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinStep, setCheckinStep] = useState(0);
  const [checkinData, setCheckinData] = useState(() => {
    if (typeof window === "undefined")
      return {
        mood: "", energy: "", stress: "", gratitude: "", note: "",
        sleepQuality: "", bodyFeel: "", worry: "", smallGoal: "",
        joy: "", learned: "", challenge: "", tomorrow: "",
      };
    const saved = localStorage.getItem(LOCAL_KEYS.checkinData);
    if (!saved)
      return {
        mood: "", energy: "", stress: "", gratitude: "", note: "",
        sleepQuality: "", bodyFeel: "", worry: "", smallGoal: "",
        joy: "", learned: "", challenge: "", tomorrow: "",
      };
    try {
      return JSON.parse(saved);
    } catch {
      return {
        mood: "", energy: "", stress: "", gratitude: "", note: "",
        sleepQuality: "", bodyFeel: "", worry: "", smallGoal: "",
        joy: "", learned: "", challenge: "", tomorrow: "",
      };
    }
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const hydrateLocal = () => {
    const rawJournal = localStorage.getItem(LOCAL_KEYS.journal);
    const rawGoals = localStorage.getItem(LOCAL_KEYS.goals);
    const rawCheckin = localStorage.getItem(LOCAL_KEYS.checkinData);
    const rawHistory = localStorage.getItem(LOCAL_KEYS.checkinHistory);
    if (rawJournal) {
      try {
        const parsed = JSON.parse(rawJournal);
        const normalized = Array.isArray(parsed)
          ? parsed.map((entry) => ({
              ...entry,
              html:
                entry.html ||
                (entry.text ? `<p>${entry.text}</p>` : ""),
              text: entry.text || stripHtml(entry.html || ""),
              intensity: entry.intensity || 5,
            }))
          : [];
        setJournalEntries(normalized);
      } catch {
        setJournalEntries([]);
      }
    }
    if (rawGoals) {
      try {
        setGoals(JSON.parse(rawGoals));
      } catch {
        setGoals(defaultGoals);
      }
    }
    if (rawCheckin) {
      try {
        setCheckinData(JSON.parse(rawCheckin));
      } catch {
        setCheckinData({
          mood: "",
          energy: "",
          stress: "",
          gratitude: "",
          note: "",
          sleepQuality: "",
          bodyFeel: "",
          worry: "",
          smallGoal: "",
          joy: "",
          learned: "",
          challenge: "",
          tomorrow: "",
        });
      }
    }
    if (rawHistory) {
      try {
        setCheckinHistory(JSON.parse(rawHistory));
      } catch {
        setCheckinHistory([]);
      }
    }
  };

  const syncFromApi = async () => {
    if (!isPremium) {
      hydrateLocal();
      try {
        const shares = await apiGet("client-resource-assignments/");
        setSharedItems(shares || []);
      } catch (error) {
        console.warn("Shared items fetch failed, using local cache.", error);
        hydrateLocal();
      }
      return;
    }

    setIsSyncing(true);
    try {
      const [journals, goalData, checkins, shares] = await Promise.all([
        apiGet("client-journals/"),
        apiGet("client-goals/"),
        apiGet("client-checkins/"),
        apiGet("client-resource-assignments/"),
      ]);

      const normalizedJournals = (journals || []).map((entry) => ({
        id: entry.id,
        html: entry.entry || "",
        text: stripHtml(entry.entry || ""),
        mood: entry.mood || "Okay",
        emotion: entry.emotion || "",
        intensity: entry.intensity || 5,
        createdAt: entry.created_at,
      }));
      setJournalEntries(normalizedJournals);
      localStorage.setItem(LOCAL_KEYS.journal, JSON.stringify(normalizedJournals));

      const normalizedGoals = (goalData || []).map((g) => ({
        id: g.id,
        label: g.title,
        done: g.is_completed,
      }));
      setGoals(normalizedGoals.length ? normalizedGoals : defaultGoals);
      localStorage.setItem(
        LOCAL_KEYS.goals,
        JSON.stringify(normalizedGoals.length ? normalizedGoals : defaultGoals)
      );

      if (Array.isArray(checkins) && checkins.length > 0) {
        const latest = checkins[0];
        const latestDate = latest.checkin_date;
        setCheckinData({
          mood: latest.mood || "",
          energy: latest.energy || "",
          stress: latest.stress || "",
          gratitude: latest.gratitude || "",
          note: latest.notes || "",
          sleepQuality: "",
          bodyFeel: "",
          worry: "",
          smallGoal: "",
          joy: "",
          learned: "",
          challenge: "",
          tomorrow: "",
        });
        localStorage.setItem(
          LOCAL_KEYS.checkinData,
          JSON.stringify({
            mood: latest.mood || "",
            energy: latest.energy || "",
            stress: latest.stress || "",
            gratitude: latest.gratitude || "",
            note: latest.notes || "",
            sleepQuality: "",
            bodyFeel: "",
            worry: "",
            smallGoal: "",
            joy: "",
            learned: "",
            challenge: "",
            tomorrow: "",
          })
        );
        if (latestDate) {
          localStorage.setItem(LOCAL_KEYS.checkin, latestDate);
          if (latestDate === getLocalDayKey()) {
            setShowCheckin(false);
          }
        }

        const history = checkins.map((item) => ({
          id: item.id || item.checkin_date,
          createdAt: item.created_at || item.checkin_date,
          dateKey: item.checkin_date,
          mood: item.mood || "",
          energy: item.energy || "",
          stress: item.stress || "",
          gratitude: item.gratitude || "",
          notes: item.notes || "",
        }));
        setCheckinHistory(history);
        localStorage.setItem(LOCAL_KEYS.checkinHistory, JSON.stringify(history));
      }

      setSharedItems(shares || []);
    } catch (error) {
      console.warn("Client dashboard API sync failed, using local cache.", error);
      hydrateLocal();
    } finally {
      setIsSyncing(false);
    }
  };

  const saveJournal = () => {
    if (!journalContent.text.trim()) return;
    const createdAt = new Date().toISOString();
    const entry = {
      entry: journalContent.html,
      mood,
      emotion: journalEmotion,
      intensity: journalIntensity,
      shared_with_therapist: false,
    };
    const fallbackEntry = {
      id: Date.now(),
      html: journalContent.html,
      text: journalContent.text,
      mood,
      emotion: journalEmotion,
      intensity: journalIntensity,
      createdAt,
    };
    const updatedLocal = [fallbackEntry, ...journalEntries].slice(0, 30);
    localStorage.setItem(LOCAL_KEYS.journal, JSON.stringify(updatedLocal));
    setJournalEntries(updatedLocal);
    setJournalContent({ html: "", text: "" });
    localStorage.removeItem(LOCAL_KEYS.journalDraft);
    if (isPremium) {
      apiPost("client-journals/", entry)
        .then((saved) => {
          const next = [
            {
              id: saved.id,
              html: saved.entry || "",
              text: stripHtml(saved.entry || ""),
              mood: saved.mood || mood,
              emotion: saved.emotion || journalEmotion,
              intensity: saved.intensity || journalIntensity,
              createdAt: saved.created_at || createdAt,
            },
            ...updatedLocal.filter((e) => e.id !== fallbackEntry.id),
          ];
          setJournalEntries(next);
          localStorage.setItem(LOCAL_KEYS.journal, JSON.stringify(next));
        })
        .catch((error) => {
          console.warn("Journal save failed, kept locally.", error);
        });
    }
    toast({ title: "Saved to your private journal", status: "success" });
  };

  const saveNotes = () => {
    localStorage.setItem(LOCAL_KEYS.notesRich, JSON.stringify(notesContent));
    localStorage.setItem(LOCAL_KEYS.notes, notesContent.text || "");
    localStorage.setItem(LOCAL_KEYS.notesDraft, JSON.stringify(notesContent));
    toast({ title: "Saved prep for next session", status: "success" });
  };

  const exportJournalEntry = (entry) => {
    if (!entry) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Journal Entry</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #2E2E2E; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
            img { max-width: 100%; border-radius: 12px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>Journal Entry</h1>
          <div class="meta">
            ${new Date(entry.createdAt).toLocaleString()} • ${entry.mood || "Okay"}
            ${entry.emotion ? ` • ${entry.emotion}` : ""} • ${entry.intensity || 5}/10
          </div>
          <div>${entry.html || `<p>${entry.text || ""}</p>`}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
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
    const goal = updated.find((g) => g.id === id);
    if (isPremium && goal && Number.isFinite(goal.id)) {
      apiPut(`client-goals/${goal.id}/`, {
        title: goal.label,
        is_completed: goal.done,
      }).catch((error) => {
        console.warn("Goal update failed, kept locally.", error);
      });
    }
  };

  const progressValue =
    goals.length > 0
      ? (goals.filter((g) => g.done).length / goals.length) * 100
      : 0;

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    const tempGoal = { id: Date.now(), label: trimmed, done: false };
    const updated = [tempGoal, ...goals];
    setGoals(updated);
    localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(updated));
    setNewGoal("");
    if (isPremium) {
      apiPost("client-goals/", {
        title: trimmed,
        is_completed: false,
        created_by: "client",
      })
        .then((saved) => {
          const next = [
            { id: saved.id, label: saved.title, done: saved.is_completed },
            ...updated.filter((g) => g.id !== tempGoal.id),
          ];
          setGoals(next);
          localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(next));
        })
        .catch((error) => {
          console.warn("Goal create failed, kept locally.", error);
        });
    }
  };

  const removeGoal = (id) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    localStorage.setItem(LOCAL_KEYS.goals, JSON.stringify(updated));
    if (isPremium && Number.isFinite(id)) {
      apiDelete(`client-goals/${id}/`).catch(() => {});
    }
  };

  const openProfileEditor = () => {
    const detectedTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    setProfileDraft(
      profile || {
        name: "",
        pronouns: "",
        timezone: detectedTimezone,
        avatarUrl: "",
      }
    );
    setProfileImagePreview(profile?.avatarUrl || "");
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    localStorage.setItem(LOCAL_KEYS.profileCompleted, "true");
    setShowProfileModal(false);
  };

  const saveProfile = () => {
    const nextProfile = {
      ...profileDraft,
      name: profileDraft.name || "You",
    };
    setProfile(nextProfile);
    localStorage.setItem(LOCAL_KEYS.profile, JSON.stringify(nextProfile));
    localStorage.setItem(LOCAL_KEYS.profileCompleted, "true");
    setShowProfileModal(false);
  };

  const handleProfileImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setProfileImagePreview(result);
      setProfileDraft((p) => ({ ...p, avatarUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const checkinSteps = [
    {
      title: "Morning check‑in",
      body: (
        <VStack align="stretch" spacing={3}>
          <Text color="gray.600">
            Start with how you’re arriving today.
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
          <Box>
            <Text fontWeight="medium" mt={3}>
              Sleep quality
            </Text>
            <Select
              mt={2}
              value={checkinData.sleepQuality}
              onChange={(e) =>
                setCheckinData((p) => ({ ...p, sleepQuality: e.target.value }))
              }
              placeholder="Select sleep quality"
            >
              <option value="Poor">Poor</option>
              <option value="Okay">Okay</option>
              <option value="Good">Good</option>
              <option value="Great">Great</option>
            </Select>
          </Box>
        </VStack>
      ),
    },
    {
      title: "Body & energy",
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
            <Text fontWeight="medium">How does your body feel?</Text>
            <Select
              mt={2}
              value={checkinData.bodyFeel}
              onChange={(e) => setCheckinData((p) => ({ ...p, bodyFeel: e.target.value }))}
              placeholder="Select a body feeling"
            >
              <option value="Tense">Tense</option>
              <option value="Neutral">Neutral</option>
              <option value="Relaxed">Relaxed</option>
              <option value="Heavy">Heavy</option>
              <option value="Light">Light</option>
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
          <Textarea
            placeholder="One worry to let go of (optional)"
            value={checkinData.worry}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, worry: e.target.value }))
            }
          />
          <Textarea
            placeholder="One small goal for today (optional)"
            value={checkinData.smallGoal}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, smallGoal: e.target.value }))
            }
          />
        </VStack>
      ),
    },
    {
      title: "Evening reflection",
      body: (
        <VStack align="stretch" spacing={3}>
          <Textarea
            placeholder="One thing that brought you joy today"
            value={checkinData.joy}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, joy: e.target.value }))
            }
          />
          <Textarea
            placeholder="One thing you learned today"
            value={checkinData.learned}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, learned: e.target.value }))
            }
          />
          <Textarea
            placeholder="One challenge you overcame today"
            value={checkinData.challenge}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, challenge: e.target.value }))
            }
          />
          <Textarea
            placeholder="A small to‑do for tomorrow"
            value={checkinData.tomorrow}
            onChange={(e) =>
              setCheckinData((p) => ({ ...p, tomorrow: e.target.value }))
            }
          />
          <Textarea
            placeholder="Anything else you want to capture?"
            value={checkinData.note}
            onChange={(e) => setCheckinData((p) => ({ ...p, note: e.target.value }))}
          />
        </VStack>
      ),
    },
  ];

  const saveCheckin = () => {
    const createdAt = new Date().toISOString();
    const historyEntry = {
      id: createdAt,
      createdAt,
      dateKey: getLocalDayKey(),
      mood: checkinData.mood,
      energy: checkinData.energy,
      stress: checkinData.stress,
      gratitude: checkinData.gratitude,
      notes: checkinData.note,
    };
    const nextHistory = [historyEntry, ...checkinHistory].slice(0, 60);
    setCheckinHistory(nextHistory);
    localStorage.setItem(
      LOCAL_KEYS.checkinHistory,
      JSON.stringify(nextHistory)
    );
    localStorage.setItem(LOCAL_KEYS.checkinData, JSON.stringify(checkinData));
    localStorage.setItem(LOCAL_KEYS.checkin, getLocalDayKey());
    setShowCheckin(false);
    setCheckinStep(0);
    if (isPremium) {
      apiPost("client-checkins/", {
        checkin_date: getLocalDayKey(),
        mood: checkinData.mood,
        energy: checkinData.energy,
        stress: checkinData.stress,
        gratitude: checkinData.gratitude,
        notes: [
          checkinData.note,
          checkinData.sleepQuality && `Sleep: ${checkinData.sleepQuality}`,
          checkinData.bodyFeel && `Body: ${checkinData.bodyFeel}`,
          checkinData.worry && `Worry: ${checkinData.worry}`,
          checkinData.smallGoal && `Goal: ${checkinData.smallGoal}`,
          checkinData.joy && `Joy: ${checkinData.joy}`,
          checkinData.learned && `Learned: ${checkinData.learned}`,
          checkinData.challenge && `Challenge: ${checkinData.challenge}`,
          checkinData.tomorrow && `Tomorrow: ${checkinData.tomorrow}`,
        ]
          .filter(Boolean)
          .join("\n"),
      }).catch((error) => {
        console.warn("Check-in save failed, stored locally.", error);
      });
    }
    toast({ title: "Daily check-in saved", status: "success" });
  };

  const skipCheckinForToday = () => {
    localStorage.setItem(LOCAL_KEYS.checkin, getLocalDayKey());
    setShowCheckin(false);
    setCheckinStep(0);
  };

  useEffect(() => {
    const detectedTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const storedCompleted = localStorage.getItem(LOCAL_KEYS.profileCompleted);
    const storedProfile = localStorage.getItem(LOCAL_KEYS.profile);
    const storedDraft = localStorage.getItem(LOCAL_KEYS.profileDraft);
    const storedNotesDraft = localStorage.getItem(LOCAL_KEYS.notesDraft);
    if (storedNotesDraft) {
      try {
        setNotesContent(JSON.parse(storedNotesDraft));
      } catch {
        localStorage.removeItem(LOCAL_KEYS.notesDraft);
      }
    }
    if (storedDraft) {
      try {
        setProfileDraft(JSON.parse(storedDraft));
      } catch {
        localStorage.removeItem(LOCAL_KEYS.profileDraft);
      }
    }
    if (!storedCompleted && !storedProfile) {
      setProfileDraft((prev) => ({
        ...prev,
        timezone: prev.timezone || detectedTimezone,
      }));
      setShowProfileModal(true);
    } else if (storedProfile && !storedCompleted) {
      localStorage.setItem(LOCAL_KEYS.profileCompleted, "true");
    }
    if (typeof Intl !== "undefined" && Intl.supportedValuesOf) {
      setTimeZones(Intl.supportedValuesOf("timeZone"));
    } else {
      setTimeZones([
        "Asia/Kolkata",
        "Asia/Dubai",
        "Europe/London",
        "America/New_York",
        "America/Los_Angeles",
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.profileDraft, JSON.stringify(profileDraft));
  }, [profileDraft]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.journalDraft, JSON.stringify(journalContent));
  }, [journalContent]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.notesDraft, JSON.stringify(notesContent));
  }, [notesContent]);

  useEffect(() => {
    const today = getLocalDayKey();
    const lastPrompt = localStorage.getItem(LOCAL_KEYS.checkinPrompt);
    if (lastPrompt !== today) {
      setShowCheckin(true);
      localStorage.setItem(LOCAL_KEYS.checkinPrompt, today);
    }
    syncFromApi();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section) {
      setActiveSection(section);
    }
  }, [location.search]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.checkinData, JSON.stringify(checkinData));
  }, [checkinData]);

  const navItems = [
    { id: "overview", label: "Dashboard" },
    { id: "book", label: "Book a Session" },
    { id: "bookingRequests", label: "Booking Requests" },
    { id: "sessions", label: "My Sessions" },
    { id: "notifications", label: "Notifications" },
    { id: "checkin", label: "Daily Check‑in" },
    { id: "journal", label: "Private Journal" },
    { id: "notes", label: "Session Prep" },
    { id: "goals", label: "My Goals" },
    { id: "resources", label: "Resources" },
    { id: "prompts", label: "Reflection Prompts" },
    { id: "premium", label: "Premium Studio" },
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
            <Heading>Welcome back</Heading>
            <Text color="gray.600" mt={2} maxW="xl">
              Your private space to reflect, prepare for therapy, and keep gentle track
              of your progress.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
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

            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
              <Heading size="md" mb={3}>
                My Goals
              </Heading>
              {!isPremium && (
                <Text fontSize="sm" color="purple.500" mb={2}>
                  Upgrade to Premium to sync goals across devices.
                </Text>
              )}
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
            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
              <Heading size="md" mb={3}>
                Private Journal
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={3}>
                Stored privately on this device unless you choose to share later.
              </Text>
              {!isPremium && (
                <Text fontSize="sm" color="purple.500" mb={2}>
                  Upgrade to Premium to sync your journal across devices.
                </Text>
              )}
              <RichTextEditor
                value={journalContent.html}
                onChange={setJournalContent}
                placeholder="Write what’s on your mind..."
                isPremium={isPremium}
                minHeight="140px"
                allowImages
              />
              <HStack mt={3} spacing={4} flexWrap="wrap">
                <FormControl maxW="220px">
                  <FormLabel fontSize="sm">Emotion</FormLabel>
                  <Select
                    value={journalEmotion}
                    onChange={(e) => setJournalEmotion(e.target.value)}
                  >
                    {journalEmotions.map((emotion) => (
                      <option key={emotion} value={emotion}>
                        {emotion}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <Box flex="1" minW="220px">
                  <FormLabel fontSize="sm">Intensity: {journalIntensity}/10</FormLabel>
                  <Slider
                    value={journalIntensity}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => setJournalIntensity(value)}
                  >
                    <SliderTrack bg="green.100">
                      <SliderFilledTrack bg="green.400" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              </HStack>
              <Button mt={3} onClick={saveJournal} colorScheme="teal">
                Save Entry
              </Button>
              <Divider my={4} />
              <VStack align="start" spacing={2}>
                {isSyncing && journalEntries.length === 0 ? (
                  <Text color="gray.500">Syncing journal…</Text>
                ) : journalEntries.length === 0 ? (
                  <Text color="gray.500">No journal entries yet.</Text>
                ) : (
                  journalEntries.slice(0, 3).map((entry) => (
                    <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                      <Text fontSize="sm" color="gray.500">
                        {new Date(entry.createdAt).toLocaleString()} • {entry.mood}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {entry.emotion ? `${entry.emotion} • ` : ""}{entry.intensity}/10
                      </Text>
                      <Text noOfLines={3}>{entry.text}</Text>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>

            <VStack spacing={6} align="stretch">
              <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Notes for Next Session
                </Heading>
                <RichTextEditor
                  value={notesContent.html}
                  onChange={setNotesContent}
                  placeholder="Things I want to talk about..."
                  isPremium={isPremium}
                  minHeight="140px"
                  allowImages
                />
                <Button mt={3} onClick={saveNotes} colorScheme="purple">
                  Save Notes
                </Button>
              </Box>

              <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
                <Heading size="md" mb={3}>
                  Grounding Toolkit
                </Heading>
                {isPremium ? (
                  <VStack align="start" spacing={2}>
                    {tools.map((tool) => (
                      <HStack key={tool}>
                        <CheckCircleIcon color="green.400" />
                        <Text>{tool}</Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Box p={4} bg="#FBF8F3" borderRadius="xl">
                    <Text fontWeight="semibold">Premium feature</Text>
                    <Text color="gray.600" mt={1}>
                      Unlock guided grounding tools, audio practices, and calming
                      routines with Premium.
                    </Text>
                    <Button mt={3} size="sm" colorScheme="purple">
                      Upgrade to unlock
                    </Button>
                  </Box>
                )}
              </Box>
            </VStack>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
              <HStack justify="space-between" mb={3}>
                <Heading size="md">Resources</Heading>
                <StarIcon color="yellow.400" />
              </HStack>
              <Text color="gray.500" mb={4}>
                Resources your therapist has shared with you.
              </Text>
              <Box p={4} bg="#FBF8F3" borderRadius="xl">
                {sharedItems.length === 0 ? (
                  <Text color="gray.500">Nothing shared yet.</Text>
                ) : (
                  <VStack align="start" spacing={2}>
                    {sharedItems.slice(0, 4).map((item) => (
                      <Text key={item.id}>
                        {item.resource_title || "Shared resource"}
                      </Text>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>

            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
              <HStack justify="space-between" mb={3}>
                <Heading size="md">My Sessions</Heading>
                <CalendarIcon color="purple.400" />
              </HStack>
              <Text color="gray.500" mb={4}>
                Your upcoming and past sessions will appear here. Invoices shared by
                your therapist will show up in your Sessions page.
              </Text>
              <Box p={4} bg="#F2F8F5" borderRadius="xl">
                <Text color="gray.500">No sessions to show yet.</Text>
              </Box>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
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

          <Box
            w="100%"
            p={{ base: 6, md: 8 }}
            borderRadius="3xl"
            bg="linear-gradient(135deg, #161222, #2B223B)"
            color="white"
            boxShadow="2xl"
          >
            <HStack justify="space-between" flexWrap="wrap" spacing={4}>
              <Box>
                <Tag bg="#C9A960" color="black" borderRadius="full" mb={3}>
                  Premium Studio
                </Tag>
                <Heading size="md">A calm, beautiful space that grows with you</Heading>
                <Text color="whiteAlpha.700" mt={2} maxW="xl">
                  Cloud‑synced journaling, daily rituals, and a private wellbeing
                  library — crafted to feel lush, simple, and supportive.
                </Text>
              </Box>
              <Button
                onClick={() => setActiveSection("premium")}
                bg="#C9A960"
                color="black"
                _hover={{ bg: "#E3C77B" }}
              >
                {isPremium ? "Open Premium" : "Explore Premium"}
              </Button>
            </HStack>
          </Box>
        </VStack>
      );
    }

    if (activeSection === "goals") {
      return (
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
          <Heading size="md" mb={3}>
            My Goals
          </Heading>
          {!isPremium && (
            <Text fontSize="sm" color="purple.500" mb={2}>
              Upgrade to Premium to sync goals across devices.
            </Text>
          )}
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
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Private Journal
          </Heading>
          {!isPremium && (
            <Text fontSize="sm" color="purple.500" mb={2}>
              Upgrade to Premium to sync your journal across devices.
            </Text>
          )}
          <RichTextEditor
            value={journalContent.html}
            onChange={setJournalContent}
            placeholder="Write what’s on your mind..."
            isPremium={isPremium}
            minHeight="200px"
            allowImages
          />
          <HStack mt={3} spacing={4} flexWrap="wrap">
            <FormControl maxW="240px">
              <FormLabel fontSize="sm">Emotion</FormLabel>
              <Select
                value={journalEmotion}
                onChange={(e) => setJournalEmotion(e.target.value)}
              >
                {journalEmotions.map((emotion) => (
                  <option key={emotion} value={emotion}>
                    {emotion}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Box flex="1" minW="220px">
              <FormLabel fontSize="sm">Intensity: {journalIntensity}/10</FormLabel>
              <Slider
                value={journalIntensity}
                min={1}
                max={10}
                step={1}
                onChange={(value) => setJournalIntensity(value)}
              >
                <SliderTrack bg="green.100">
                  <SliderFilledTrack bg="green.400" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </HStack>
          <Button mt={3} onClick={saveJournal} colorScheme="teal">
            Save Entry
          </Button>
          <Divider my={4} />
          <VStack align="start" spacing={2}>
            {journalEntries.length === 0 ? (
              <Text color="gray.500">No journal entries yet.</Text>
            ) : (
              journalEntries.map((entry) => (
                <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">
                      {new Date(entry.createdAt).toLocaleString()} • {entry.mood}
                    </Text>
                    <Button size="xs" variant="ghost" onClick={() => exportJournalEntry(entry)}>
                      Export PDF
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {entry.emotion ? `${entry.emotion} • ` : ""}{entry.intensity}/10
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
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Session Prep & Reflections
          </Heading>
          <RichTextEditor
            value={notesContent.html}
            onChange={setNotesContent}
            placeholder="Things I want to talk about..."
            isPremium={isPremium}
            minHeight="180px"
            allowImages
          />
          <HStack mt={3} spacing={3}>
            <Checkbox
              isChecked={shareNotes}
              onChange={(e) => setShareNotes(e.target.checked)}
              isDisabled={!isPremium}
            >
              Share with therapist (Premium)
            </Checkbox>
            {!isPremium && (
              <Text fontSize="sm" color="purple.500">
                Upgrade to share notes with your therapist.
              </Text>
            )}
          </HStack>
          <Button mt={3} onClick={saveNotes} colorScheme="purple">
            Save Notes
          </Button>
        </Box>
      );
    }

    if (activeSection === "checkin") {
      return (
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
          <Heading size="md" mb={3}>
            Daily Check‑in
          </Heading>
          <Text color="gray.600" mb={4}>
            Take a quiet moment to check in with yourself.
          </Text>
          {!isPremium && (
            <Text fontSize="sm" color="purple.500" mb={3}>
              Upgrade to Premium to sync check‑ins across devices.
            </Text>
          )}
          <Button onClick={() => setShowCheckin(true)} colorScheme="teal">
            Start check‑in
          </Button>
          <Divider my={6} />
          <Heading size="sm" mb={3}>
            Your recent check‑ins
          </Heading>
          <VStack align="start" spacing={3} mb={4}>
            {checkinHistory.length === 0 ? (
              <Text color="gray.500">No check‑ins saved yet.</Text>
            ) : (
              checkinHistory.slice(0, 7).map((entry) => (
                <Box key={entry.id} p={3} bg="#F2F8F5" borderRadius="xl" w="100%">
                  <Text fontSize="sm" color="gray.500">
                    {entry.createdAt
                      ? new Date(entry.createdAt).toLocaleString()
                      : entry.dateKey}
                  </Text>
                  <Text fontSize="sm">
                    {entry.mood && `Mood: ${entry.mood} · `}
                    {entry.energy && `Energy: ${entry.energy} · `}
                    {entry.stress && `Stress: ${entry.stress}`}
                  </Text>
                </Box>
              ))
            )}
          </VStack>
          <Divider my={6} />
          <Heading size="sm" mb={3}>
            How to use your daily check‑in
          </Heading>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Sleep & energy matter
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel color="gray.600">
                Noticing sleep quality and energy helps you understand how much
                capacity you have today and prevents over‑commitment or
                overwhelm.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Name what you’re feeling
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel color="gray.600">
                Pausing to notice your feelings and body sensations builds
                self‑awareness and makes it easier to respond with care.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Letting go & gratitude
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel color="gray.600">
                Writing down one worry to release and one thing you’re grateful
                for creates a gentle reset. Sometimes it’s hard to find one, but
                it’s there if we look beyond the obvious.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  End‑of‑day reflection
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel color="gray.600">
                A quick evening check‑in helps you notice wins, learnings, and
                what you want to carry into tomorrow.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Why this helps over time
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel color="gray.600">
                Regular check‑ins build emotional regulation, highlight
                patterns, and support small habit changes that improve your
                wellbeing.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      );
    }

    if (activeSection === "resources") {
      return <ClientResources />;
    }

    if (activeSection === "book") {
      return <ClientBooking />;
    }

    if (activeSection === "bookingRequests") {
      return <ClientBookingRequests />;
    }

    if (activeSection === "sessions") {
      return <ClientAppointmentsBoard />;
    }

    if (activeSection === "notifications") {
      return <SchedulingNotifications />;
    }

    if (activeSection === "prompts") {
      return (
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="md">
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
        <Box bg="white" p={6} borderRadius="3xl" boxShadow="lg">
          <HStack justify="space-between" mb={4}>
            <Heading size="md">My Profile</Heading>
            <Button size="sm" onClick={openProfileEditor}>
              Edit
            </Button>
          </HStack>
          <HStack align="start" spacing={4}>
            <Avatar
              size="lg"
              name={profile?.name || "Client"}
              src={profile?.avatarUrl}
            />
            <VStack align="start" spacing={2}>
              <Text><strong>Name:</strong> {profile?.name || "—"}</Text>
              <Text><strong>Pronouns:</strong> {profile?.pronouns || "—"}</Text>
              <Text><strong>Timezone:</strong> {profile?.timezone || "—"}</Text>
              <Text fontSize="sm" color="gray.500">
                Photo stays on this device unless you upgrade.
              </Text>
            </VStack>
          </HStack>
        </Box>
      );
    }

    if (activeSection === "premium") {
      return (
        <Box
          bg="linear-gradient(135deg, #130F1B 0%, #241C33 50%, #3A2C4A 100%)"
          color="white"
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          boxShadow="2xl"
        >
          <VStack align="start" spacing={8}>
            <HStack justify="space-between" w="100%" flexWrap="wrap">
              <Box>
                <Tag bg="#C9A960" color="black" borderRadius="full" mb={3}>
                  Premium Studio
                </Tag>
                <Heading size="xl">
                  The Lux Studio
                </Heading>
                <Text color="whiteAlpha.700" mt={3} maxW="2xl">
                  A refined, cloud‑synced experience for clients who want deeper
                  support, beautiful rituals, and continuity across devices.
                </Text>
              </Box>
              <Box textAlign={{ base: "left", md: "right" }}>
                {isPremium ? (
                  <Button bg="white" color="black">
                    Premium Preview Enabled
                  </Button>
                ) : (
                  <Button bg="#C9A960" color="black">
                    Upgrade (coming soon)
                  </Button>
                )}
                <Text fontSize="sm" color="whiteAlpha.600" mt={2}>
                  Admin preview is enabled for you.
                </Text>
              </Box>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
              {[
                { label: "Cloud Journal", value: "Sync across devices" },
                { label: "Daily Rituals", value: "Morning + evening flow" },
                { label: "Wellbeing Library", value: "Breathwork + meditations" },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  bg="rgba(255,255,255,0.08)"
                  p={4}
                  borderRadius="3xl"
                  border="1px solid rgba(255,255,255,0.12)"
                >
                  <Text fontSize="sm" color="whiteAlpha.600">
                    {stat.label}
                  </Text>
                  <Text fontWeight="semibold">{stat.value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
              <Box bg="rgba(255,255,255,0.08)" p={6} borderRadius="3xl">
                <Heading size="md" mb={2}>
                  Cloud Journal
                </Heading>
                <Text color="whiteAlpha.700">
                  Keep your journal encrypted, searchable, and available everywhere.
                </Text>
                <Button mt={4} variant="outline" colorScheme="yellow">
                  Start syncing
                </Button>
              </Box>
              <Box bg="rgba(255,255,255,0.08)" p={6} borderRadius="3xl">
                <Heading size="md" mb={2}>
                  Daily Rituals
                </Heading>
                <Text color="whiteAlpha.700">
                  Gentle reminders, morning grounding, and evening reflections.
                </Text>
                <Button mt={4} variant="outline" colorScheme="yellow">
                  Configure rituals
                </Button>
              </Box>
              <Box bg="rgba(255,255,255,0.08)" p={6} borderRadius="3xl">
                <Heading size="md" mb={2}>
                  Wellbeing Library
                </Heading>
                <Text color="whiteAlpha.700">
                  Breathwork, meditations, and therapy tools curated by MLC.
                </Text>
                <Button mt={4} variant="outline" colorScheme="yellow">
                  Explore library
                </Button>
              </Box>
              <Box bg="rgba(255,255,255,0.08)" p={6} borderRadius="3xl">
                <Heading size="md" mb={2}>
                  Progress Tracker
                </Heading>
                <Text color="whiteAlpha.700">
                  Visualize patterns and celebrate progress over time.
                </Text>
                <Button mt={4} variant="outline" colorScheme="yellow">
                  View insights
                </Button>
              </Box>
            </SimpleGrid>
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

      <Modal isOpen={showProfileModal} onClose={closeProfileModal} size="lg">
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
              <Select
                placeholder="Select your timezone"
                value={profileDraft.timezone}
                onChange={(e) =>
                  setProfileDraft((p) => ({ ...p, timezone: e.target.value }))
                }
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
              <HStack align="center" spacing={4}>
                <Avatar
                  size="lg"
                  name={profileDraft.name || "Client"}
                  src={profileImagePreview || profileDraft.avatarUrl}
                />
                <VStack align="start" spacing={2} w="100%">
                  <FormControl>
                    <FormLabel fontSize="sm">Profile photo (PNG or JPEG)</FormLabel>
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleProfileImage(e.target.files?.[0])}
                    />
                  </FormControl>
                  <Text fontSize="xs" color="gray.500">
                    PNG or JPEG only. Image stays on this device unless you upgrade.
                  </Text>
                  {profileDraft.avatarUrl ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProfileImagePreview("");
                        setProfileDraft((p) => ({ ...p, avatarUrl: "" }));
                      }}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={closeProfileModal}>
                Set up later
              </Button>
              <Button colorScheme="teal" onClick={saveProfile}>
                Save profile
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showCheckin} onClose={skipCheckinForToday} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{checkinSteps[checkinStep]?.title}</ModalHeader>
          <ModalBody>{checkinSteps[checkinStep]?.body}</ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={skipCheckinForToday}>
                Skip for today
              </Button>
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
