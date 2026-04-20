'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Progress,
  Radio, RadioGroup, Checkbox, Stack, Input, Select, useToast, Divider, Icon,
  Tag, Wrap, Textarea, FormControl, FormLabel, Alert, AlertIcon, AlertTitle,
  AlertDescription, Badge, InputGroup, Spinner, Center, Image, Flex,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiInfo, FiMapPin, FiHeart, FiStar,
  FiUser, FiActivity, FiShield, FiBriefcase, FiMail, FiPhone, FiRefreshCw,
  FiLock, FiLogIn,
} from "react-icons/fi";
import { apiPost, apiGet } from "../../../api.js";
import TherapistCard from "../../../components/TherapistCard";
import { useAuth } from "../../../context/AuthContext";
import NextLink from "next/link";
import { useUser } from "@clerk/nextjs";
import { Select as ChakraReactSelect } from "chakra-react-select";

const MotionBox = motion(Box);

// ===========================
// 🔹 Constants & Data
// ===========================

const SECTIONS = [
  "Privacy",
  "Basics",
  "Life Context",
  "Preferences",
  "Clinical Focus",
  "Medical History",
  "Functioning",
  "Safety",
  "Assessment",
  "Finalize"
];

// Comprehensive world languages list
const WORLD_LANGUAGES = [
  "Afrikaans","Albanian","Amharic","Arabic","Armenian","Assamese","Azerbaijani",
  "Bangla","Basque","Belarusian","Bengali","Bhojpuri","Bosnian","Bulgarian","Burmese",
  "Cantonese","Catalan","Cebuano","Chinese (Mandarin)","Chinese (Simplified)","Chinese (Traditional)",
  "Croatian","Czech","Danish","Dari","Dutch",
  "English","Esperanto","Estonian",
  "Farsi","Filipino","Finnish","French","Fula",
  "Galician","Georgian","German","Greek","Guarani","Gujarati",
  "Haitian Creole","Hausa","Hawaiian","Hebrew","Hindi","Hmong","Hungarian",
  "Icelandic","Igbo","Indonesian","Irish","Italian",
  "Japanese","Javanese",
  "Kannada","Kazakh","Khmer","Kinyarwanda","Korean","Kurdish","Kyrgyz",
  "Lao","Latin","Latvian","Lithuanian","Luxembourgish",
  "Macedonian","Malagasy","Malay","Malayalam","Maltese","Mandarin","Maori","Marathi","Mongolian",
  "Nepali","Norwegian",
  "Odia","Oromo",
  "Pashto","Persian","Polish","Portuguese","Punjabi",
  "Quechua",
  "Romanian","Russian","Rwandan",
  "Samoan","Sanskrit","Scottish Gaelic","Serbian","Sesotho","Shona","Sindhi","Sinhala","Slovak","Slovenian","Somali","Spanish","Sundanese","Swahili","Swedish",
  "Tagalog","Tajik","Tamil","Tatar","Telugu","Thai","Tibetan","Tigrinya","Tongan","Turkish","Turkmen",
  "Ukrainian","Urdu","Uyghur","Uzbek",
  "Vietnamese",
  "Welsh","Wolof",
  "Xhosa",
  "Yiddish","Yoruba",
  "Zulu"
].sort();

const LANGUAGE_OPTIONS = WORLD_LANGUAGES.map(lang => ({ label: lang, value: lang }));

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Transgender", "Prefer not to say"];
const SESSION_TYPES = ["Online Video (Individual)", "In-person (Select Locations)", "No preference"];

const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
].sort();

const CONCERNS = [
  "Anxiety (Generalized, Panic, Social)", "Depression & Low Mood", "Complex Trauma (CPTSD)", "Childhood Trauma",
  "Identity & Self-Esteem", "Relationships & Attachment", "Neurodivergence (ADHD/Autism)", "Workplace Burnout",
  "Grief & Loss", "Personality-related Difficulties", "Body Image", "Sleep Issues", "Addiction & Recovery",
  "Obsessive Thoughts/Compulsions (OCD)", "Anger Management", "Phobias", "Postpartum Distress", "Eating-related concerns"
];

const IDENTITY_OPTIONS = {
  lifeStage: [
    "Student (School/College)", "Early career professional", "Career growth/leadership phase", "Late career/Retirement navigation",
    "New parent / Expecting parent", "Single parent", "Empty nester", "Caregiver role", "Recently married / Living together",
    "Recently divorced / Separated", "Re-entering the workforce", "Navigating a major life loss"
  ],
  cultural: [
    "First-generation individual", "Second-generation / Bicultural", "Migrant / Expat adjustment", "Domestic relocation (New city)",
    "Interfaith / Intercaste background", "Socioeconomic transition", "Moving from Rural to Urban environment",
    "Navigating traditional vs. western values", "Cross-cultural relationship dynamics"
  ],
  livedExperience: [
    "LGBTQ+ identifying", "Neurodivergent (ADHD, Autism, etc.)", "Living with Chronic Illness / Disability",
    "Financial stress or anxiety", "Body image journey", "Religious or Spiritual deconstruction",
    "Lived experience of a marginalized identity", "Navigating neurodivergent relationships"
  ]
};

const DASS_ITEMS = [
  "I found it hard to wind down",
  "I was aware of dryness of my mouth",
  "I could not seem to experience any positive feeling at all",
  "I experienced breathing difficulty (e.g. excessively rapid breathing)",
  "I found it difficult to work up the initiative to do things",
  "I tended to over-react to situations",
  "I experienced trembling (e.g. in the hands)",
  "I felt that I was using a lot of nervous energy",
  "I was worried about situations in which I might panic and make a fool of myself",
  "I felt that I had nothing to look forward to",
  "I found myself getting agitated",
  "I found it difficult to relax",
  "I felt down-hearted and blue",
  "I was intolerant of anything that kept me from getting on with what I was doing",
  "I felt I was close to panic",
  "I was unable to become enthusiastic about anything",
  "I felt I was not worth much as a person",
  "I felt that I was rather touchy",
  "I was aware of the action of my heart in the absence of physical exertion",
  "I felt scared without any good reason",
  "I felt that life was meaningless"
];

const DASS_LABELS = ["Never", "Sometimes", "Often", "Almost Always"];

// ===========================
// 🔹 Auth Gate Component
// ===========================

function AuthGate() {
  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 12, md: 20 }}>
      <Container maxW="lg">
        <VStack
          spacing={8}
          p={{ base: 8, md: 12 }}
          bg="white"
          borderRadius="3xl"
          shadow="2xl"
          border="1px solid"
          borderColor="gray.50"
          textAlign="center"
        >
          <Center
            w="80px" h="80px"
            borderRadius="full"
            bg="teal.50"
          >
            <Icon as={FiLock} w={8} h={8} color="teal.600" />
          </Center>

          <VStack spacing={3}>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="teal.800"
              fontFamily="'Playfair Display', serif"
            >
              Sign In to Begin
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} maxW="sm">
              To protect your privacy and save your screening results, please sign in or create an account first.
            </Text>
          </VStack>

          <VStack spacing={3} w="full" maxW="xs">
            <Button
              as={NextLink}
              href="/login/client"
              bg="teal.800"
              color="white"
              borderRadius="full"
              w="full"
              h="54px"
              fontSize="md"
              fontWeight="700"
              leftIcon={<FiLogIn />}
              _hover={{ bg: "teal.900" }}
            >
              Sign In
            </Button>
            <Button
              as={NextLink}
              href="/signup/client"
              variant="outline"
              borderColor="teal.800"
              color="teal.800"
              borderRadius="full"
              w="full"
              h="54px"
              fontSize="md"
              fontWeight="700"
              _hover={{ bg: "teal.50" }}
            >
              Create Account
            </Button>
          </VStack>

          <Text fontSize="xs" color="gray.400" maxW="sm">
            Your screening data is kept confidential and only shared with your matched therapist.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

// ===========================
// 🔹 Main Component
// ===========================

export default function DiscoveryClient() {
  const [view, setView] = useState("checking"); // checking, auth_gate, welcome_back, quiz, results, high_risk
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [finalInterpretations, setFinalInterpretations] = useState(null);
  const toast = useToast();
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { isAuthenticated, user: authUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [quizData, setQuizData] = useState({
    consent: false,
    age: "",
    gender: "",
    location: { country: "India", city: "", timezone: "" },
    languages: ["English"],
    session_type_pref: "No preference",
    therapist_gender_pref: "No preference",
    religion_pref: "Secular / No preference",
    therapy_style_pref: "Balanced",
    urgency: "Within the next week",

    presenting_concerns: [],
    life_stage_context: "",
    cultural_social_context: "",
    identity_lived_experience: "",
    other_identity_details: "",

    primary_concern: "",
    duration: "",
    impairment_level: "Moderately",

    prior_therapy: "",
    psychiatry_history: "No",
    on_medication: "No",
    has_diagnosis: "No",
    diagnosis_details: "",
    health_factors: "No",
    health_factors_details: "",

    sleep_quality: "Good",
    energy_level: "Steady",
    appetite_level: "Normal",
    support_level: "I have some support",
    support_sources: [],

    suicidal_thoughts: "No",
    past_self_harm: "No",
    feels_safe: "Yes",
    immediate_safety_concern: "No",
    dass_answers: {},

    email: authUser?.email || "",
    phone: "",
    whatsapp_marketing_consent: false,
    email_marketing_consent: false,
  });

  // 1. Initial Draft & Server Check
  useEffect(() => {
    if (!clerkLoaded || !isMounted) return;

    if (!isSignedIn) {
      setView("auth_gate");
      return;
    }

    async function initialize() {
      // Priority 1: Check server for finished results
      try {
        const res = await apiGet("therapists/match/");
        if (res && res.matches && res.matches.length > 0) {
          setResults(res);
          setFinalInterpretations(res.dass_interpretations || null);
          setView("welcome_back");
          return;
        }
      } catch (err) {
        console.warn("Server check failed, falling back to local draft", err);
      }

      // Priority 2: Check local storage for mid-quiz draft
      const savedQuiz = localStorage.getItem("mlc_discovery_draft");
      const savedStep = localStorage.getItem("mlc_discovery_step");
      
      if (savedQuiz) {
        try {
          const parsed = JSON.parse(savedQuiz);
          setQuizData(prev => ({ ...prev, ...parsed }));
          if (savedStep) setCurrentSection(parseInt(savedStep));
        } catch (e) {
          console.error("Failed to parse local draft", e);
        }
      }
      setView("quiz");
    }

    initialize();
  }, [clerkLoaded, isSignedIn, isMounted]);

  // 2. Draft Autosave
  useEffect(() => {
    if (view === "quiz" && isMounted) {
      localStorage.setItem("mlc_discovery_draft", JSON.stringify(quizData));
      localStorage.setItem("mlc_discovery_step", currentSection.toString());
    }
  }, [quizData, currentSection, view, isMounted]);

  // 3. Auto-fill email from Clerk
  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress && !quizData.email) {
      setQuizData(prev => ({ ...prev, email: clerkUser.primaryEmailAddress.emailAddress }));
    }
  }, [clerkUser]);

  const handleStartOver = () => {
    localStorage.removeItem("mlc_discovery_draft");
    localStorage.removeItem("mlc_discovery_step");
    window.location.reload();
  };

  const progress = (currentSection / (SECTIONS.length - 1)) * 100;

  const nextStep = () => {
    if (currentSection === 0 && !quizData.consent) {
      toast({ title: "Consent required", description: "Please acknowledge the consent form to proceed.", status: "warning" });
      return;
    }
    if (currentSection === 1 && (!quizData.age || !quizData.gender)) {
      toast({ title: "Missing information", description: "Please provide your age and gender.", status: "warning" });
      return;
    }
    if (currentSection === 7) {
      if (quizData.suicidal_thoughts === "Active" || quizData.immediate_safety_concern === "Yes") {
        setView("high_risk");
        return;
      }
    }

    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    } else {
      submitQuiz();
    }
  };

  const prevStep = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  const submitQuiz = async () => {
    setIsLoading(true);
    const D_IDX = [2, 4, 9, 12, 15, 16, 20];
    const A_IDX = [1, 3, 6, 8, 14, 18, 19];
    const S_IDX = [0, 5, 7, 10, 11, 13, 17];
    const calculateScore = (indices) => {
      let total = 0;
      indices.forEach(idx => { total += quizData.dass_answers[idx] || 0; });
      return total * 2;
    };
    const d_score = calculateScore(D_IDX);
    const a_score = calculateScore(A_IDX);
    const s_score = calculateScore(S_IDX);

    const interpret = (score, scale) => {
      if (scale === "D") {
        if (score <= 9) return "Normal";
        if (score <= 13) return "Mild";
        if (score <= 20) return "Moderate";
        if (score <= 27) return "Severe";
        return "Extremely Severe";
      }
      if (scale === "A") {
        if (score <= 7) return "Normal";
        if (score <= 9) return "Mild";
        if (score <= 14) return "Moderate";
        if (score <= 19) return "Severe";
        return "Extremely Severe";
      }
      if (scale === "S") {
        if (score <= 14) return "Normal";
        if (score <= 18) return "Mild";
        if (score <= 25) return "Moderate";
        if (score <= 33) return "Severe";
        return "Extremely Severe";
      }
    };

    const interpretations = { depression: interpret(d_score, "D"), anxiety: interpret(a_score, "A"), stress: interpret(s_score, "S") };
    setFinalInterpretations(interpretations);

    const payload = {
      ...quizData,
      dass_scores: { depression: d_score, anxiety: a_score, stress: s_score },
      dass_interpretations: interpretations,
      summary: `DASS Results: D:${d_score}, A:${a_score}, S:${s_score}`
    };

    try {
      const res = await apiPost("therapists/match/", payload);
      setResults(res);
      setView("results");
      window.scrollTo(0, 0);
    } catch (err) {
      setResults({ matches: [] });
      setView("results");
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // 🔹 Section Renderers
  // ===========================

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <VStack spacing={{ base: 6, md: 10 }} align="center" textAlign="center" py={{ base: 4, md: 6 }}>
            <Icon as={FiShield} w={{ base: 10, md: 12 }} h={{ base: 10, md: 12 }} color="teal.500" />
            <VStack spacing={4}>
              <Heading size={{ base: "lg", md: "xl" }} color="teal.800" fontFamily="'Playfair Display', serif">Privacy & Purpose</Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "lg" }} maxW="lg">We prioritize clinical compatibility. Your responses are stored securely and used only to pair you with the best specialist for your needs.</Text>
              <Box p={{ base: 4, md: 6 }} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100" mt={4}>
                <Checkbox isChecked={quizData.consent} onChange={(e) => setQuizData({ ...quizData, consent: e.target.checked })}>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600">I consent to this screening and understand it is for therapist matching, not emergency intervention.</Text>
                </Checkbox>
              </Box>
            </VStack>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Age</FormLabel>
                <Input type="number" value={quizData.age} onChange={(e) => setQuizData({ ...quizData, age: e.target.value })} borderRadius="xl" size={{ base: "md", md: "lg" }} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Gender</FormLabel>
                <Select value={quizData.gender} onChange={(e) => setQuizData({ ...quizData, gender: e.target.value })} borderRadius="xl" size={{ base: "md", md: "lg" }}>
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Location (Country)</FormLabel>
              <Input value={quizData.location.country} onChange={(e) => setQuizData({ ...quizData, location: { ...quizData.location, country: e.target.value } })} borderRadius="xl" size={{ base: "md", md: "lg" }} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Languages for Therapy</FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>Type to search, select multiple languages</Text>
              <ChakraReactSelect
                isMulti
                name="languages"
                options={LANGUAGE_OPTIONS}
                placeholder="Search and select languages..."
                closeMenuOnSelect={false}
                value={quizData.languages.map(l => ({ label: l, value: l }))}
                onChange={(selected) => {
                  setQuizData({ ...quizData, languages: selected ? selected.map(s => s.value) : [] });
                }}
                chakraStyles={{
                  container: (provided) => ({ ...provided, borderRadius: "xl" }),
                  control: (provided) => ({ ...provided, borderRadius: "xl", minH: "45px" }),
                  multiValue: (provided) => ({ ...provided, bg: "teal.100", borderRadius: "full" }),
                  multiValueLabel: (provided) => ({ ...provided, color: "teal.800", fontWeight: "600", fontSize: "sm" }),
                  multiValueRemove: (provided) => ({ ...provided, color: "teal.600", _hover: { bg: "teal.200", color: "teal.900" } }),
                  dropdownIndicator: (provided) => ({ ...provided, bg: "transparent" }),
                  option: (provided, state) => ({
                    ...provided,
                    bg: state.isSelected ? "teal.500" : state.isFocused ? "teal.50" : "white",
                    color: state.isSelected ? "white" : "gray.800",
                  }),
                }}
                menuPlacement="auto"
              />
            </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <Box>
              <Heading size={{ base: "sm", md: "md" }} color="teal.800" mb={2}>Life Context & Identity</Heading>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Tell us about any specific factors defining your identity or life stage.</Text>
            </Box>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              <FormControl>
                <FormLabel fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="teal.600">LIFE STAGE / ROLES</FormLabel>
                <Select placeholder="Select your current phase" borderRadius="xl" size={{ base: "md", md: "lg" }} value={quizData.life_stage_context} onChange={(e) => setQuizData({ ...quizData, life_stage_context: e.target.value })}>
                  {IDENTITY_OPTIONS.lifeStage.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="teal.600">CULTURAL / SOCIAL CONTEXT</FormLabel>
                <Select placeholder="Select cultural context" borderRadius="xl" size={{ base: "md", md: "lg" }} value={quizData.cultural_social_context} onChange={(e) => setQuizData({ ...quizData, cultural_social_context: e.target.value })}>
                  {IDENTITY_OPTIONS.cultural.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="teal.600">IDENTITY / LIVED EXPERIENCE</FormLabel>
                <Select placeholder="Select lived experience" borderRadius="xl" size={{ base: "md", md: "lg" }} value={quizData.identity_lived_experience} onChange={(e) => setQuizData({ ...quizData, identity_lived_experience: e.target.value })}>
                  {IDENTITY_OPTIONS.livedExperience.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="teal.600">OTHER CONTEXTS</FormLabel>
                <Textarea placeholder="Feel free to share any other identity or life details here..." borderRadius="xl" value={quizData.other_identity_details} onChange={(e) => setQuizData({ ...quizData, other_identity_details: e.target.value })} />
              </FormControl>
            </VStack>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Session Type</FormLabel>
              <RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({ ...quizData, session_type_pref: v })}>
                <Stack spacing={3}>
                  {SESSION_TYPES.map(s => <Radio key={s} value={s} colorScheme="teal" size={{ base: "md", md: "lg" }}>{s}</Radio>)}
                </Stack>
              </RadioGroup>
            </FormControl>
            {quizData.session_type_pref === "In-person (Select Locations)" && (
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>City</FormLabel>
                <Select value={quizData.location_city} onChange={(e) => setQuizData({ ...quizData, location_city: e.target.value })} borderRadius="xl" placeholder="Select city" size={{ base: "md", md: "lg" }}>
                  {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Therapist Style Preference</FormLabel>
              <RadioGroup value={quizData.therapy_style_pref} onChange={(v) => setQuizData({ ...quizData, therapy_style_pref: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Structured" colorScheme="teal">Structured</Radio>
                  <Radio value="Reflective" colorScheme="teal">Reflective</Radio>
                  <Radio value="Balanced" colorScheme="teal">Balanced</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>How soon do you want to start?</FormLabel>
              <RadioGroup value={quizData.urgency} onChange={(v) => setQuizData({ ...quizData, urgency: v })}>
                <Stack direction="column" spacing={2}>
                  <Radio value="ASAP" colorScheme="teal">As soon as possible</Radio>
                  <Radio value="1-2 weeks" colorScheme="teal">Within 1-2 weeks</Radio>
                  <Radio value="Exploring" colorScheme="teal">Just exploring</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Areas of Support Needed (Multiple Choice)</FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 2, md: 3 }}>
                {CONCERNS.map(c => (
                  <Checkbox
                    key={c}
                    isChecked={quizData.presenting_concerns.includes(c)}
                    onChange={(e) => {
                      const current = quizData.presenting_concerns;
                      setQuizData({ ...quizData, presenting_concerns: e.target.checked ? [...current, c] : current.filter(i => i !== c) });
                    }}
                    colorScheme="teal"
                    size={{ base: "sm", md: "md" }}
                  >
                    <Text fontSize={{ base: "xs", md: "sm" }}>{c}</Text>
                  </Checkbox>
                ))}
              </SimpleGrid>
            </FormControl>
            <Divider />
            <FormControl isRequired>
              <FormLabel fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Primary Clinical Concern</FormLabel>
              <Select value={quizData.primary_concern} onChange={(e) => setQuizData({ ...quizData, primary_concern: e.target.value })} borderRadius="xl" placeholder="Select primary" size={{ base: "md", md: "lg" }}>
                {quizData.presenting_concerns.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
              <FormControl>
                <FormLabel fontSize={{ base: "xs", md: "sm" }}>Duration</FormLabel>
                <Select value={quizData.duration} onChange={(e) => setQuizData({ ...quizData, duration: e.target.value })} borderRadius="xl" size={{ base: "md", md: "lg" }}>
                  <option value="< 1 month">Less than 1 month</option>
                  <option value="1-6 months">1-6 months</option>
                  <option value="6+ months">Over 6 months</option>
                  <option value="Years">Years (on/off)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize={{ base: "xs", md: "sm" }}>Daily Impact</FormLabel>
                <Select value={quizData.impairment_level} onChange={(e) => setQuizData({ ...quizData, impairment_level: e.target.value })} borderRadius="xl" size={{ base: "md", md: "lg" }}>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Significant">Significant</option>
                  <option value="Severe">Severe</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Previous Therapy?</FormLabel>
              <RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({ ...quizData, prior_therapy: v })}>
                <Stack spacing={2}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Seeing a Psychiatrist / On Medication?</FormLabel>
              <RadioGroup value={quizData.on_medication} onChange={(v) => setQuizData({ ...quizData, on_medication: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Existing Diagnosis?</FormLabel>
              <RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({ ...quizData, has_diagnosis: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Physical Health Concerns?</FormLabel>
              <RadioGroup value={quizData.health_factors} onChange={(v) => setQuizData({ ...quizData, health_factors: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            {quizData.health_factors === "Yes" && <Textarea placeholder="Details..." value={quizData.health_factors_details} onChange={(e) => setQuizData({ ...quizData, health_factors_details: e.target.value })} borderRadius="xl" />}
          </VStack>
        );
      case 6:
        return (
          <VStack spacing={{ base: 6, md: 10 }} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Sleep Quality</FormLabel>
              <RadioGroup value={quizData.sleep_quality} onChange={(v) => setQuizData({ ...quizData, sleep_quality: v })}>
                <Stack spacing={2}>
                  <Radio value="Good" colorScheme="teal">Steady</Radio>
                  <Radio value="Troubled" colorScheme="teal">Interrupted / Troubled</Radio>
                  <Radio value="Poor" colorScheme="teal">Significant Lack of Sleep</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Energy Levels</FormLabel>
              <RadioGroup value={quizData.energy_level} onChange={(v) => setQuizData({ ...quizData, energy_level: v })}>
                <Stack spacing={2}>
                  <Radio value="Steady" colorScheme="teal">Steady</Radio>
                  <Radio value="Low" colorScheme="teal">Low Energy</Radio>
                  <Radio value="Fluctuating" colorScheme="teal">Wide fluctuations</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Appetite Changes</FormLabel>
              <RadioGroup value={quizData.appetite_level} onChange={(v) => setQuizData({ ...quizData, appetite_level: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Normal" colorScheme="teal">No Change</Radio>
                  <Radio value="Increased" colorScheme="teal">Increased</Radio>
                  <Radio value="Decreased" colorScheme="teal">Decreased</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Social Support (Who can you talk to?)</FormLabel>
              <Wrap spacing={2}>
                {["Family", "Friends", "Partner", "Work Colleagues", "No one currently"].map(s => (
                  <Tag
                    key={s}
                    cursor="pointer"
                    borderRadius="full"
                    px={{ base: 3, md: 4 }}
                    py={2}
                    fontSize={{ base: "xs", md: "sm" }}
                    variant={quizData.support_sources.includes(s) ? "solid" : "outline"}
                    colorScheme="teal"
                    onClick={() => {
                      const current = quizData.support_sources;
                      setQuizData({ ...quizData, support_sources: current.includes(s) ? current.filter(x => x !== s) : [...current, s] });
                    }}
                  >
                    {s}
                  </Tag>
                ))}
              </Wrap>
            </FormControl>
          </VStack>
        );
      case 7:
        return (
          <VStack spacing={{ base: 5, md: 8 }} align="stretch">
            <Alert status="error" borderRadius="xl" bg="red.50" color="red.800" border="1px solid" borderColor="red.100" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "flex-start", md: "center" }}>
              <AlertIcon />
              <Box>
                <AlertTitle fontSize={{ base: "sm", md: "md" }}>Safety Notice</AlertTitle>
                <AlertDescription fontSize={{ base: "xs", md: "sm" }} lineHeight="tall">
                  MLC does not currently have emergency services. In case of emergencies please visit your nearest Hospital's emergency unit or Contact your countries national helplines for support. We hope that we can soon build our emergency services to provide more individuals the support they need during times of crisis.
                </AlertDescription>
              </Box>
            </Alert>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Thoughts of self-harm?</FormLabel>
              <Select value={quizData.suicidal_thoughts} onChange={(e) => setQuizData({ ...quizData, suicidal_thoughts: e.target.value })} borderRadius="xl" size={{ base: "md", md: "lg" }}>
                <option value="No">No</option>
                <option value="Passive">Passive thoughts</option>
                <option value="Active">Active / I feel at risk</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Past history of self-harm?</FormLabel>
              <RadioGroup value={quizData.past_self_harm} onChange={(v) => setQuizData({ ...quizData, past_self_harm: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Safe in your current environment?</FormLabel>
              <RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({ ...quizData, feels_safe: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                  <Radio value="Yes" colorScheme="teal">Yes</Radio>
                  <Radio value="No" colorScheme="teal">No</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </VStack>
        );
      case 8:
        return (
          <VStack spacing={{ base: 6, md: 10 }} align="stretch">
            <Box>
              <Heading size={{ base: "sm", md: "md" }} color="teal.800" mb={4}>Mood Screening (DASS-21)</Heading>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={4}>Please select the most accurate response based on the past week:</Text>
              <VStack align="start" fontSize="xs" color="gray.500" spacing={1} bg="gray.50" p={{ base: 3, md: 4 }} borderRadius="xl">
                <Text>• <b>Never:</b> Did not apply to me at all</Text>
                <Text>• <b>Sometimes:</b> Applied to some degree / some time</Text>
                <Text>• <b>Often:</b> Applied considerably / good part of time</Text>
                <Text>• <b>Almost Always:</b> Applied very much / most time</Text>
              </VStack>
            </Box>
            {DASS_ITEMS.map((item, idx) => (
              <FormControl key={idx} p={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.100">
                <FormLabel fontSize={{ base: "sm", md: "md" }} fontWeight="bold" mb={{ base: 3, md: 4 }}>{idx + 1}. {item}</FormLabel>
                <RadioGroup
                  value={quizData.dass_answers[idx]?.toString() || ""}
                  onChange={(v) => setQuizData({ ...quizData, dass_answers: { ...quizData.dass_answers, [idx]: parseInt(v) } })}
                >
                  <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                    {DASS_LABELS.map((label, score) => (
                      <Radio key={score} value={score.toString()} colorScheme="teal" size={{ base: "sm", md: "md" }}>
                        <Text fontSize={{ base: "xs", md: "sm" }} whiteSpace="nowrap">{label}</Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            ))}
          </VStack>
        );
      case 9:
        return (
          <VStack spacing={{ base: 6, md: 10 }} align="stretch" py={{ base: 4, md: 6 }}>
            <Box textAlign="center">
              <Icon as={FiCheck} w={{ base: 10, md: 12 }} h={{ base: 10, md: 12 }} color="teal.500" mb={4} />
              <Heading size={{ base: "md", md: "lg" }}>One Final Step</Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>Please provide your contact details so we can save your results and send you matches.</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Email Address</FormLabel>
                <InputGroup>
                  <Input value={quizData.email} onChange={(e) => setQuizData({ ...quizData, email: e.target.value })} borderRadius="xl" placeholder="example@email.com" size={{ base: "md", md: "lg" }} />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize={{ base: "sm", md: "md" }}>Phone Number (WhatsApp)</FormLabel>
                <Input value={quizData.phone} onChange={(e) => setQuizData({ ...quizData, phone: e.target.value })} borderRadius="xl" placeholder="+91 00000 00000" size={{ base: "md", md: "lg" }} />
              </FormControl>
            </SimpleGrid>

            <VStack align="stretch" spacing={4} bg="teal.50" p={{ base: 4, md: 6 }} borderRadius="2xl">
              <Checkbox isChecked={quizData.whatsapp_marketing_consent} onChange={(e) => setQuizData({ ...quizData, whatsapp_marketing_consent: e.target.checked })}>
                <Text fontSize={{ base: "xs", md: "sm" }}>I'd like to receive mental health resources and updates via <b>WhatsApp</b>.</Text>
              </Checkbox>
              <Checkbox isChecked={quizData.email_marketing_consent} onChange={(e) => setQuizData({ ...quizData, email_marketing_consent: e.target.checked })}>
                <Text fontSize={{ base: "xs", md: "sm" }}>I'd like to receive mental health resources and updates via <b>Email</b>.</Text>
              </Checkbox>
            </VStack>

            <Button
              size="lg"
              bg="teal.800"
              color="white"
              borderRadius="full"
              px={{ base: 8, md: 16 }}
              h={{ base: 14, md: 16 }}
              fontSize={{ base: "sm", md: "md" }}
              onClick={submitQuiz}
              isLoading={isLoading}
              w={{ base: "full", md: "auto" }}
              alignSelf="center"
            >
              View Recommendations
            </Button>
          </VStack>
        );
      default: return null;
    }
  };

  // ===========================
  // 🔹 Results View
  // ===========================

  const renderResults = () => {
    const d = finalInterpretations?.depression || "Normal";
    const a = finalInterpretations?.anxiety || "Normal";
    const s = finalInterpretations?.stress || "Normal";

    return (
      <Container maxW="6xl" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 8, md: 12 }} align="stretch">
          {/* 🎖️ Clinical Feedback & Encouragement */}
          <Box p={{ base: 6, md: 10 }} bg="white" borderRadius={{ base: "2xl", md: "3rem" }} shadow="xl" border="1px solid" borderColor="teal.50">
            <VStack align="start" spacing={{ base: 4, md: 6 }} maxW="4xl">
              <Badge bg="teal.50" color="teal.600" px={4} py={1} borderRadius="full" fontSize={{ base: "2xs", md: "xs" }}>CLINICAL SUMMARY</Badge>
              <Heading size={{ base: "md", md: "xl" }} color="teal.900" fontFamily="'Playfair Display', serif">Thank you for sharing your story.</Heading>
              <Text fontSize={{ base: "sm", md: "lg" }} color="gray.600" lineHeight="1.8">
                It takes significant internal courage to vocalize these concerns. Your screening indicates{' '}
                <Box as="span" fontWeight="800" color="teal.700">{d.toLowerCase()}</Box> levels of low mood,{' '}
                <Box as="span" fontWeight="800" color="teal.700">{a.toLowerCase()}</Box> levels of worry, and{' '}
                <Box as="span" fontWeight="800" color="teal.700">{s.toLowerCase()}</Box> levels of stress.
              </Text>
              <Text fontSize={{ base: "xs", md: "md" }} color="gray.600" lineHeight="1.7">
                At MLC, we view these not just as symptoms, but as <b>early markers of distress</b> that can affect our lives significantly. If left unaddressed, these feelings can grow over time to overwhelm different areas of our lives—from our relationships to our career and internal peace.
              </Text>
              <Text fontSize={{ base: "xs", md: "md" }} color="gray.600" lineHeight="1.7">
                Therapy offers a structured path to tackle these challenges on time. By developing the right tools and gaining deeper self-awareness, you can navigate these seasons with greater resilience before they become overwhelming.
              </Text>
              <HStack spacing={4} pt={2}>
                <Icon as={FiHeart} color="red.400" w={5} h={5} flexShrink={0} />
                <Text fontWeight="700" color="teal.800" fontSize={{ base: "xs", md: "sm" }}>At MLC, we strictly vet every clinician in our collective to ensure the highest quality of therapy that is deeply tailored to your specific needs.</Text>
              </HStack>
            </VStack>
          </Box>

          <VStack align="start" spacing={6}>
            <Heading size={{ base: "md", md: "lg" }} color="teal.900">Your Recommended Specialists</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 10 }} w="full">
              {(results?.matches?.length > 0 ? results.matches : (results?.others || [])).map(t => (
                <TherapistCard key={t.id} therapist={t} />
              ))}
            </SimpleGrid>
            {(!results || ((!results.matches || results.matches.length === 0) && (!results.others || results.others.length === 0))) && (
              <VStack py={{ base: 10, md: 20 }} bg="gray.50" borderRadius="3xl" w="full" textAlign="center">
                <Icon as={FiStar} w={10} h={10} color="gray.300" />
                <Text color="gray.500" fontSize={{ base: "sm", md: "md" }} px={4}>No immediate matches found for these specific criteria. Our intake team will review your application manually and contact you within 24 hours.</Text>
              </VStack>
            )}
          </VStack>

          <VStack py={{ base: 8, md: 12 }} borderTop="1px solid" borderColor="gray.100" spacing={6}>
            <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>Not sure who to choose? Book a consultation with our Intake Coordinator.</Text>
            <Button as={NextLink} href="/book" bg="teal.800" color="white" borderRadius="full" px={10} h={14} fontSize={{ base: "sm", md: "md" }} _hover={{ bg: "teal.900" }}>Book Intake Consultation</Button>
            <Button variant="link" color="teal.600" leftIcon={<FiRefreshCw />} onClick={() => setView("quiz")} fontSize={{ base: "sm", md: "md" }}>Update my needs / Retake Screening</Button>
          </VStack>
        </VStack>
      </Container>
    );
  };

  const renderWelcomeBack = () => {
    return (
      <Container maxW="3xl" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="center" textAlign="center" p={{ base: 8, md: 12 }} bg="white" borderRadius={{ base: "2xl", md: "3rem" }} shadow="2xl">
          <Icon as={FiCheck} w={{ base: 12, md: 16 }} h={{ base: 12, md: 16 }} color="teal.500" />
          <VStack spacing={4}>
            <Heading size={{ base: "lg", md: "xl" }} color="teal.900">Welcome Back</Heading>
            <Text fontSize={{ base: "sm", md: "lg" }} color="gray.600">You have already completed your clinical screening. How would you like to proceed?</Text>
          </VStack>
          <Stack direction={{ base: "column", md: "row" }} spacing={4} w="full">
            <Button flex={1} bg="teal.800" color="white" borderRadius="full" height="14" fontSize={{ base: "sm", md: "md" }} onClick={() => setView("results")}>View My Recommended Matches</Button>
            <Button flex={1} variant="outline" borderColor="teal.800" color="teal.800" borderRadius="full" height="14" fontSize={{ base: "sm", md: "md" }} leftIcon={<FiRefreshCw />} onClick={() => setView("quiz")}>Update My Needs</Button>
          </Stack>
        </VStack>
      </Container>
    );
  };

  // ===========================
  // 🔹 View Router
  // ===========================

  if (view === "checking" || !isMounted) return <Box py={40} textAlign="center"><Spinner size="xl" color="teal.500" /><Text mt={4} color="gray.500">Retrieving your profile...</Text></Box>;
  if (view === "auth_gate") return <AuthGate />;
  if (view === "welcome_back") return renderWelcomeBack();
  if (view === "high_risk") return (
    <Box py={{ base: 12, md: 20 }} textAlign="center" px={4}>
      <Heading size={{ base: "md", md: "lg" }}>Immediate Support Recommended</Heading>
      <Text mt={4} fontSize={{ base: "sm", md: "md" }}>Please contact your countries national helplines or nearest hospital ER.</Text>
    </Box>
  );
  if (view === "results") return renderResults();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 10, md: 20 }} px={{ base: 3, md: 0 }}>
      <Container maxW={{ base: "full", md: currentSection > 7 ? "4xl" : "3xl" }}>
        <VStack spacing={{ base: 5, md: 8 }} align="stretch">
          <Box bg="white" p={{ base: 5, md: 12 }} borderRadius={{ base: "2xl", md: "3rem" }} shadow="2xl" border="1px solid" borderColor="gray.50">
            <VStack spacing={{ base: 5, md: 8 }} align="stretch">
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="xs" fontWeight="900" color="teal.600">STEP {currentSection + 1} / {SECTIONS.length}</Text>
                  <Text fontSize="xs" fontWeight="900" color="gray.300">{Math.round(progress)}%</Text>
                </HStack>
                <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" />
              </Box>
              <AnimatePresence mode="wait">
                <MotionBox key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  {renderSection()}
                </MotionBox>
              </AnimatePresence>
              <Flex justify="space-between" pt={{ base: 6, md: 12 }} gap={3} direction={{ base: "row" }} flexWrap="nowrap">
                <Button
                  variant="ghost"
                  leftIcon={<FiArrowLeft />}
                  onClick={prevStep}
                  isDisabled={currentSection === 0}
                  fontSize={{ base: "sm", md: "md" }}
                  flexShrink={0}
                >
                  Back
                </Button>
                {currentSection < SECTIONS.length - 1 && (
                  <Button
                    bg="teal.800"
                    color="white"
                    px={{ base: 6, md: 12 }}
                    borderRadius="full"
                    rightIcon={<FiArrowRight />}
                    onClick={nextStep}
                    fontSize={{ base: "sm", md: "md" }}
                    flexShrink={0}
                  >
                    Continue
                  </Button>
                )}
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
