'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Progress,
  Radio, RadioGroup, Checkbox, Stack, Input, useToast, Divider, Icon,
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
import ModernSelect from "../../../components/ModernSelect";

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
            bg="rgba(169,203,183,0.1)"
          >
            <Icon as={FiLock} w={8} h={8} color="#56756D" />
          </Center>

          <VStack spacing={3}>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              letterSpacing="-0.015em"
            >
              Sign In to Begin
            </Heading>
            <Text color="rgba(46,46,46,0.75)" fontSize={{ base: "sm", md: "md" }} maxW="sm">
              To protect your privacy and save your screening results, please sign in or create an account first.
            </Text>
          </VStack>

          <VStack spacing={3} w="full" maxW="xs">
            <Button
              as={NextLink}
              href="/login/client"
              bg="#56756D"
              color="white"
              borderRadius="full"
              w="full"
              h="46px"
              fontSize="14px"
              fontWeight="700"
              leftIcon={<FiLogIn />}
              _hover={{ bg: "#263A33" }}
            >
              Sign In
            </Button>
            <Button
              as={NextLink}
              href="/signup/client"
              variant="outline"
              borderColor="#56756D"
              color="#56756D"
              borderRadius="full"
              w="full"
              h="46px"
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: "rgba(169,203,183,0.1)" }}
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
  const [view, setView] = useState("quiz"); // quiz, auth_gate, welcome_back, results, high_risk
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [fallbackTherapists, setFallbackTherapists] = useState([]);
  const [loadingFallbackTherapists, setLoadingFallbackTherapists] = useState(false);
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
    first_name: authUser?.firstName || "",
    last_name: authUser?.lastName || "",
    whatsapp_marketing_consent: false,
    email_marketing_consent: false,
  });

  // 1. Initial Draft & Server Check (Non-blocking)
  useEffect(() => {
    if (!isMounted) return;

    async function initialize() {
      if (clerkLoaded && isSignedIn) {
        // Priority 1: Check server for finished results
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 4000)
          );
          const res = await Promise.race([apiGet("therapists/match/"), timeoutPromise]);
          if (res && res.matches && res.matches.length > 0) {
            setResults(res);
            setFinalInterpretations(res.dass_interpretations || null);
            setView("welcome_back");
            return;
          }
        } catch (err) {
          console.warn("Server check skipped, falling back to local draft", err);
        }
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

  useEffect(() => {
    if (view !== "results") return;
    const hasPrimaryMatches = (results?.matches?.length || 0) > 0;
    const hasSecondaryMatches = (results?.others?.length || 0) > 0;
    if (hasPrimaryMatches || hasSecondaryMatches) return;

    let cancelled = false;
    const fetchFallbackTherapists = async () => {
      try {
        setLoadingFallbackTherapists(true);
        const res = await apiGet("therapists/public/");
        const allPublic = Array.isArray(res) ? res : res?.results || [];
        if (!cancelled) {
          setFallbackTherapists(allPublic);
        }
      } catch (err) {
        if (!cancelled) {
          setFallbackTherapists([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingFallbackTherapists(false);
        }
      }
    };
    fetchFallbackTherapists();
    return () => {
      cancelled = true;
    };
  }, [view, results]);

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
    if (currentSection === 1 && (!quizData.age || !quizData.gender || !quizData.first_name || !quizData.last_name)) {
      toast({ title: "Missing information", description: "Please provide your name, age and gender.", status: "warning" });
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
      name: `${quizData.first_name} ${quizData.last_name}`.trim(),
      dass_scores: { depression: d_score, anxiety: a_score, stress: s_score },
      dass_interpretations: interpretations,
      summary: `DASS Results: D:${d_score}, A:${a_score}, S:${s_score}`,
      force_auto_match: typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/therapist-matching'),
      intake_mode: typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/therapist-matching') ? 'auto' : undefined,
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
          <VStack spacing={5} align="center" textAlign="center" py={{ base: 3, md: 5 }}>
            <Center w="52px" h="52px" borderRadius="full" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiShield} boxSize="24px" />
            </Center>
            <VStack spacing={2} maxW="md">
              <Heading 
                fontSize={{ base: "20px", md: "22px" }} 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                fontWeight="600"
                letterSpacing="-0.015em"
              >
                Privacy & Purpose
              </Heading>
              <Text 
                color="#5A6E65" 
                fontSize="13px" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.5"
              >
                We prioritize clinical compatibility. Your responses are stored securely and used only to pair you with the best specialist for your needs.
              </Text>
            </VStack>

            <Box 
              p={3.5} 
              bg="rgba(86, 117, 109, 0.06)" 
              borderRadius="xl" 
              border="1px solid rgba(86, 117, 109, 0.16)" 
              w="full"
              maxW="md"
              textAlign="left"
            >
              <Checkbox 
                colorScheme="teal"
                isChecked={quizData.consent} 
                onChange={(e) => setQuizData({ ...quizData, consent: e.target.checked })}
              >
                <Text fontSize="12.5px" fontWeight="500" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif" lineHeight="1.5">
                  I consent to this screening and understand it is for therapist matching, not emergency intervention.
                </Text>
              </Checkbox>
            </Box>

            <HStack spacing={1.5} pt={2}>
              <Text fontSize="12px" color="#718096" fontFamily="'Inter', var(--font-inter), sans-serif">
                Already know who you're looking for?
              </Text>
              <Button 
                as={NextLink} 
                href="/therapists/directory" 
                variant="link" 
                color="#56756D" 
                fontSize="12px" 
                fontWeight="600"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                textDecoration="underline"
                _hover={{ color: "#263A33" }}
              >
                Browse Directory
              </Button>
            </HStack>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">First Name</FormLabel>
                <Input 
                  value={quizData.first_name} 
                  onChange={(e) => setQuizData({ ...quizData, first_name: e.target.value })} 
                  h="40px"
                  borderRadius="xl" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  placeholder="Your first name" 
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Last Name</FormLabel>
                <Input 
                  value={quizData.last_name} 
                  onChange={(e) => setQuizData({ ...quizData, last_name: e.target.value })} 
                  h="40px"
                  borderRadius="xl" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  placeholder="Your last name" 
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Age</FormLabel>
                <Input 
                  type="number" 
                  value={quizData.age} 
                  onChange={(e) => setQuizData({ ...quizData, age: e.target.value })} 
                  h="40px"
                  borderRadius="xl" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  placeholder="e.g. 28"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Gender</FormLabel>
                <ModernSelect 
                  value={quizData.gender} 
                  onChange={(val) => setQuizData({ ...quizData, gender: val })} 
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                  h="40px"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Location (Country)</FormLabel>
              <Input 
                value={quizData.location.country} 
                onChange={(e) => setQuizData({ ...quizData, location: { ...quizData.location, country: e.target.value } })} 
                h="40px"
                borderRadius="xl" 
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="white"
                fontSize="13px"
                color="#263A33"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={0.5} fontFamily="'Inter', var(--font-inter), sans-serif">Languages for Therapy</FormLabel>
              <Text fontSize="11.5px" color="#5A6E65" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Type to search, select multiple languages</Text>
              <ChakraReactSelect
                isMulti
                controlShouldRenderValue={true}
                name="languages"
                options={LANGUAGE_OPTIONS}
                placeholder="Search and select languages..."
                closeMenuOnSelect={false}
                value={quizData.languages.map(l => ({ label: l, value: l }))}
                onChange={(selected) => {
                  setQuizData({ ...quizData, languages: selected ? selected.map(s => s.value) : [] });
                }}
                chakraStyles={{
                  container: (provided) => ({ ...provided, borderRadius: "12px", width: "100%" }),
                  control: (provided, { isFocused }) => ({
                    ...provided,
                    borderRadius: "12px",
                    borderColor: isFocused ? "#56756D" : "rgba(86, 117, 109, 0.2)",
                    boxShadow: isFocused ? "0 0 0 1px #56756D" : "none",
                    bg: isFocused ? "white" : "rgba(250, 248, 245, 0.85)",
                    minHeight: "40px",
                    fontSize: "13px",
                    fontFamily: "'Inter', var(--font-inter), sans-serif",
                    transition: "all 0.18s ease",
                    _hover: { borderColor: "#56756D", bg: "white" },
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    display: "flex !important",
                    flexDirection: "row !important",
                    flexWrap: "wrap !important",
                    alignItems: "center !important",
                    padding: "3px 8px !important",
                    gap: "5px !important",
                    fontFamily: "'Inter', var(--font-inter), sans-serif !important",
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    display: "inline-flex !important",
                    alignItems: "center !important",
                    bg: "rgba(86, 117, 109, 0.1) !important",
                    border: "1px solid rgba(86, 117, 109, 0.22) !important",
                    borderRadius: "full !important",
                    my: "2px !important",
                    px: "5px !important",
                    py: "1px !important",
                    maxWidth: "none !important",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    fontFamily: "'Inter', var(--font-inter), sans-serif !important",
                    fontSize: "12px !important",
                    fontWeight: "600 !important",
                    color: "#263A33 !important",
                    px: "4px !important",
                    maxWidth: "none !important",
                    overflow: "visible !important",
                    textOverflow: "clip !important",
                    whiteSpace: "nowrap !important",
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    color: "#56756D !important",
                    borderRadius: "full !important",
                    px: "4px !important",
                    _hover: { bg: "rgba(239, 68, 68, 0.15) !important", color: "#DC2626 !important" },
                  }),
                  dropdownIndicator: (provided) => ({ ...provided, color: "#56756D", px: "8px" }),
                  clearIndicator: (provided) => ({ ...provided, color: "#718096", px: "6px" }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 1600,
                    borderRadius: "14px",
                    boxShadow: "0 12px 28px -4px rgba(38, 58, 51, 0.14)",
                    border: "1px solid rgba(86, 117, 109, 0.15)",
                    bg: "white",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    p: "6px",
                    borderRadius: "14px",
                    maxHeight: "220px",
                    fontFamily: "'Inter', var(--font-inter), sans-serif",
                  }),
                  option: (provided, { isFocused, isSelected }) => ({
                    ...provided,
                    borderRadius: "8px",
                    px: "10px",
                    py: "6px",
                    fontSize: "13px",
                    fontFamily: "'Inter', var(--font-inter), sans-serif",
                    fontWeight: isSelected ? "600" : "500",
                    color: isSelected ? "#263A33" : "#3D544C",
                    bg: isSelected ? "rgba(86, 117, 109, 0.12)" : isFocused ? "rgba(86, 117, 109, 0.08)" : "transparent",
                  }),
                }}
                menuPlacement="auto"
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading 
                fontSize={{ base: "17px", md: "19px" }}
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                fontWeight="600"
                letterSpacing="-0.015em"
                mb={1}
              >
                Life Context & Identity
              </Heading>
              <Text fontSize="12.5px" color="#5A6E65" fontFamily="'Inter', var(--font-inter), sans-serif">
                Tell us about any specific factors defining your identity or life stage.
              </Text>
            </Box>

            <VStack spacing={3.5} align="stretch">
              <FormControl>
                <FormLabel fontSize="11.5px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">LIFE STAGE / ROLES</FormLabel>
                <ModernSelect 
                  placeholder="Select your current phase" 
                  h="40px"
                  value={quizData.life_stage_context} 
                  onChange={(val) => setQuizData({ ...quizData, life_stage_context: val })}
                  options={IDENTITY_OPTIONS.lifeStage}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="11.5px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">CULTURAL / SOCIAL CONTEXT</FormLabel>
                <ModernSelect 
                  placeholder="Select cultural context" 
                  h="40px"
                  value={quizData.cultural_social_context} 
                  onChange={(val) => setQuizData({ ...quizData, cultural_social_context: val })}
                  options={IDENTITY_OPTIONS.cultural}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="11.5px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">IDENTITY / LIVED EXPERIENCE</FormLabel>
                <ModernSelect 
                  placeholder="Select lived experience" 
                  h="40px"
                  value={quizData.identity_lived_experience} 
                  onChange={(val) => setQuizData({ ...quizData, identity_lived_experience: val })}
                  options={IDENTITY_OPTIONS.livedExperience}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="11.5px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">OTHER CONTEXTS</FormLabel>
                <Textarea 
                  placeholder="Feel free to share any other identity or life details here..." 
                  borderRadius="xl" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  rows={3}
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={quizData.other_identity_details} 
                  onChange={(e) => setQuizData({ ...quizData, other_identity_details: e.target.value })} 
                />
              </FormControl>
            </VStack>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Session Type</FormLabel>
              <RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({ ...quizData, session_type_pref: v })}>
                <Stack spacing={2}>
                  {SESSION_TYPES.map(s => (
                    <Radio key={s} value={s} colorScheme="teal" size="md">
                      <Text fontSize="13px" color="#263A33" fontWeight="500">{s}</Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </FormControl>

            {quizData.session_type_pref === "In-person (Select Locations)" && (
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">City</FormLabel>
                <ModernSelect 
                  value={quizData.location_city} 
                  onChange={(val) => setQuizData({ ...quizData, location_city: val })} 
                  placeholder="Select city" 
                  h="40px"
                  options={MAJOR_CITIES}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Therapist Style Preference</FormLabel>
              <RadioGroup value={quizData.therapy_style_pref} onChange={(v) => setQuizData({ ...quizData, therapy_style_pref: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 5 }}>
                  <Radio value="Structured" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Structured</Text></Radio>
                  <Radio value="Reflective" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Reflective</Text></Radio>
                  <Radio value="Balanced" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Balanced</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">How soon do you want to start?</FormLabel>
              <RadioGroup value={quizData.urgency} onChange={(v) => setQuizData({ ...quizData, urgency: v })}>
                <Stack direction="column" spacing={2}>
                  <Radio value="ASAP" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">As soon as possible</Text></Radio>
                  <Radio value="1-2 weeks" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Within 1-2 weeks</Text></Radio>
                  <Radio value="Exploring" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Just exploring</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Areas of Support Needed (Multiple Choice)</FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2.5}>
                {CONCERNS.map(c => (
                  <Checkbox
                    key={c}
                    isChecked={quizData.presenting_concerns.includes(c)}
                    onChange={(e) => {
                      const current = quizData.presenting_concerns;
                      setQuizData({ ...quizData, presenting_concerns: e.target.checked ? [...current, c] : current.filter(i => i !== c) });
                    }}
                    colorScheme="teal"
                    size="md"
                  >
                    <Text fontSize="12.5px" color="#263A33" fontWeight="500">{c}</Text>
                  </Checkbox>
                ))}
              </SimpleGrid>
            </FormControl>

            <Divider borderColor="rgba(86, 117, 109, 0.12)" />

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Primary Clinical Concern</FormLabel>
              <ModernSelect 
                value={quizData.primary_concern} 
                onChange={(val) => setQuizData({ ...quizData, primary_concern: val })} 
                placeholder="Select primary concern" 
                h="40px"
                options={quizData.presenting_concerns.length > 0 ? quizData.presenting_concerns : CONCERNS}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Duration</FormLabel>
                <ModernSelect 
                  value={quizData.duration} 
                  onChange={(val) => setQuizData({ ...quizData, duration: val })} 
                  placeholder="Select duration"
                  h="40px"
                  options={[
                    { value: "< 1 month", label: "Less than 1 month" },
                    { value: "1-6 months", label: "1-6 months" },
                    { value: "6+ months", label: "Over 6 months" },
                    { value: "Years", label: "Years (on/off)" },
                  ]}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Daily Impact</FormLabel>
                <ModernSelect 
                  value={quizData.impairment_level} 
                  onChange={(val) => setQuizData({ ...quizData, impairment_level: val })} 
                  placeholder="Select daily impact"
                  h="40px"
                  options={["Mild", "Moderate", "Significant", "Severe"]}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        );

      case 5:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Previous Therapy?</FormLabel>
              <RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({ ...quizData, prior_therapy: v })}>
                <Stack spacing={2}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Seeing a Psychiatrist / On Medication?</FormLabel>
              <RadioGroup value={quizData.on_medication} onChange={(v) => setQuizData({ ...quizData, on_medication: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Existing Diagnosis?</FormLabel>
              <RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({ ...quizData, has_diagnosis: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Physical Health Concerns?</FormLabel>
              <RadioGroup value={quizData.health_factors} onChange={(v) => setQuizData({ ...quizData, health_factors: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {quizData.health_factors === "Yes" && (
              <Textarea 
                placeholder="Please share details..." 
                value={quizData.health_factors_details} 
                onChange={(e) => setQuizData({ ...quizData, health_factors_details: e.target.value })} 
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                fontSize="13px"
                color="#263A33"
                rows={3}
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
              />
            )}
          </VStack>
        );

      case 6:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Sleep Quality</FormLabel>
              <RadioGroup value={quizData.sleep_quality} onChange={(v) => setQuizData({ ...quizData, sleep_quality: v })}>
                <Stack spacing={2}>
                  <Radio value="Good" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Steady / Restful</Text></Radio>
                  <Radio value="Troubled" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Interrupted / Troubled</Text></Radio>
                  <Radio value="Poor" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Significant Lack of Sleep</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Energy Levels</FormLabel>
              <RadioGroup value={quizData.energy_level} onChange={(v) => setQuizData({ ...quizData, energy_level: v })}>
                <Stack spacing={2}>
                  <Radio value="Steady" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Steady</Text></Radio>
                  <Radio value="Low" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Low Energy</Text></Radio>
                  <Radio value="Fluctuating" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Wide Fluctuations</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Appetite Changes</FormLabel>
              <RadioGroup value={quizData.appetite_level} onChange={(v) => setQuizData({ ...quizData, appetite_level: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 5 }}>
                  <Radio value="Normal" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No Change</Text></Radio>
                  <Radio value="Increased" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Increased</Text></Radio>
                  <Radio value="Decreased" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Decreased</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={2} fontFamily="'Inter', var(--font-inter), sans-serif">Social Support (Who can you talk to?)</FormLabel>
              <Wrap spacing={2}>
                {["Family", "Friends", "Partner", "Work Colleagues", "No one currently"].map(s => {
                  const isSelected = quizData.support_sources.includes(s);
                  return (
                    <Tag
                      key={s}
                      cursor="pointer"
                      borderRadius="full"
                      px={3.5}
                      py={1.5}
                      fontSize="12px"
                      fontWeight="600"
                      bg={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.08)"}
                      color={isSelected ? "white" : "#263A33"}
                      border="1px solid"
                      borderColor={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: "#56756D" }}
                      onClick={() => {
                        const current = quizData.support_sources;
                        setQuizData({ ...quizData, support_sources: current.includes(s) ? current.filter(x => x !== s) : [...current, s] });
                      }}
                    >
                      {s}
                    </Tag>
                  );
                })}
              </Wrap>
            </FormControl>
          </VStack>
        );

      case 7:
        return (
          <VStack spacing={4} align="stretch">
            <Box 
              p={4} 
              borderRadius="xl" 
              bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)" 
              border="1px solid rgba(239, 68, 68, 0.25)"
            >
              <HStack spacing={3} align="flex-start">
                <Icon as={FiShield} boxSize="18px" color="#DC2626" mt={0.5} flexShrink={0} />
                <VStack align="start" spacing={1}>
                  <Text fontSize="13px" fontWeight="700" color="#991B1B" fontFamily="'Inter', var(--font-inter), sans-serif">
                    Safety Notice
                  </Text>
                  <Text fontSize="12px" color="#B91C1C" lineHeight="1.5" fontFamily="'Inter', var(--font-inter), sans-serif">
                    MLC provides scheduled outpatient care and does not have emergency crisis intervention. In immediate emergencies, please visit your nearest hospital emergency department or dial your local national emergency helpline.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Thoughts of self-harm?</FormLabel>
              <ModernSelect 
                value={quizData.suicidal_thoughts} 
                onChange={(val) => setQuizData({ ...quizData, suicidal_thoughts: val })} 
                placeholder="Select frequency"
                h="40px"
                options={[
                  { value: "No", label: "No" },
                  { value: "Passive", label: "Passive thoughts" },
                  { value: "Active", label: "Active / I feel at risk" },
                ]}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Past history of self-harm?</FormLabel>
              <RadioGroup value={quizData.past_self_harm} onChange={(v) => setQuizData({ ...quizData, past_self_harm: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Safe in your current environment?</FormLabel>
              <RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({ ...quizData, feels_safe: v })}>
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                  <Radio value="Yes" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">Yes</Text></Radio>
                  <Radio value="No" colorScheme="teal" size="md"><Text fontSize="13px" color="#263A33" fontWeight="500">No</Text></Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </VStack>
        );

      case 8:
        return (
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading 
                fontSize={{ base: "17px", md: "19px" }}
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                fontWeight="600"
                letterSpacing="-0.015em"
                mb={1}
              >
                Mood Screening (DASS-21)
              </Heading>
              <Text fontSize="12.5px" color="#5A6E65" mb={3} fontFamily="'Inter', var(--font-inter), sans-serif">
                Please select the most accurate response based on your experience over the past week:
              </Text>
              <VStack align="start" fontSize="12px" color="#5A6E65" spacing={1} bg="rgba(250, 248, 245, 0.85)" p={3} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.12)">
                <Text>• <b>Never:</b> Did not apply to me at all</Text>
                <Text>• <b>Sometimes:</b> Applied to some degree / occasionally</Text>
                <Text>• <b>Often:</b> Applied considerably / good part of time</Text>
                <Text>• <b>Almost Always:</b> Applied very much / most of the time</Text>
              </VStack>
            </Box>

            {DASS_ITEMS.map((item, idx) => (
              <FormControl key={idx} py={3} px={1} borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                <FormLabel fontSize="13px" fontWeight="600" color="#263A33" mb={2} fontFamily="'Inter', var(--font-inter), sans-serif">
                  {idx + 1}. {item}
                </FormLabel>
                <RadioGroup
                  value={quizData.dass_answers[idx]?.toString() || ""}
                  onChange={(v) => setQuizData({ ...quizData, dass_answers: { ...quizData.dass_answers, [idx]: parseInt(v) } })}
                >
                  <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 6 }}>
                    {DASS_LABELS.map((label, score) => (
                      <Radio key={score} value={score.toString()} colorScheme="teal" size="md">
                        <Text fontSize="12.5px" color="#263A33" fontWeight="500" whiteSpace="nowrap">{label}</Text>
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
          <VStack spacing={5} align="stretch" py={{ base: 2, md: 4 }}>
            <VStack spacing={2} textAlign="center">
              <Center w="48px" h="48px" borderRadius="full" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCheck} boxSize="22px" />
              </Center>
              <Heading 
                fontSize={{ base: "19px", md: "21px" }}
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                fontWeight="600"
                letterSpacing="-0.015em"
              >
                One Final Step
              </Heading>
              <Text color="#5A6E65" fontSize="13px" maxW="md">
                Please provide your contact details so we can save your results and send you matches.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Email Address</FormLabel>
                <InputGroup>
                  <Input 
                    value={quizData.email} 
                    onChange={(e) => setQuizData({ ...quizData, email: e.target.value })} 
                    h="40px"
                    borderRadius="xl" 
                    borderColor="rgba(86, 117, 109, 0.2)"
                    bg="white"
                    fontSize="13px"
                    color="#263A33"
                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                    placeholder="example@email.com" 
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Phone Number (WhatsApp)</FormLabel>
                <Input 
                  value={quizData.phone} 
                  onChange={(e) => setQuizData({ ...quizData, phone: e.target.value })} 
                  h="40px"
                  borderRadius="xl" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  placeholder="+91 00000 00000" 
                />
              </FormControl>
            </SimpleGrid>

            <VStack align="stretch" spacing={3} bg="rgba(86, 117, 109, 0.06)" p={4} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.14)">
              <Checkbox colorScheme="teal" isChecked={quizData.whatsapp_marketing_consent} onChange={(e) => setQuizData({ ...quizData, whatsapp_marketing_consent: e.target.checked })}>
                <Text fontSize="12.5px" color="#263A33">I'd like to receive mental health resources and updates via <b>WhatsApp</b>.</Text>
              </Checkbox>
              <Checkbox colorScheme="teal" isChecked={quizData.email_marketing_consent} onChange={(e) => setQuizData({ ...quizData, email_marketing_consent: e.target.checked })}>
                <Text fontSize="12.5px" color="#263A33">I'd like to receive mental health resources and updates via <b>Email</b>.</Text>
              </Checkbox>
            </VStack>

            <Button
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={8}
              h="40px"
              fontSize="13px"
              fontWeight="600"
              onClick={submitQuiz}
              isLoading={isLoading}
              w={{ base: "full", md: "auto" }}
              alignSelf="center"
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
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

    const matchedTherapists = results?.matches || [];
    const otherMatchedTherapists = results?.others || [];
    const hasAnyMatchResults = matchedTherapists.length > 0 || otherMatchedTherapists.length > 0;
    const therapistsToRender = hasAnyMatchResults ? (matchedTherapists.length > 0 ? matchedTherapists : otherMatchedTherapists) : fallbackTherapists;

    return (
      <Container maxW="6xl" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 8, md: 12 }} align="stretch">
          {/* 🎖️ Clinical Feedback & Encouragement */}
          <Box p={{ base: 6, md: 10 }} bg="white" borderRadius={{ base: "2xl", md: "3rem" }} shadow="xl" border="1px solid" borderColor="rgba(169,203,183,0.1)">
            <VStack align="start" spacing={{ base: 4, md: 6 }} maxW="4xl">
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1} borderRadius="full" fontSize={{ base: "2xs", md: "xs" }}>CLINICAL SUMMARY</Badge>
              <Heading 
                size={{ base: "md", md: "xl" }} 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                fontWeight="600"
                letterSpacing="-0.015em"
              >
                Thank you for sharing your story
              </Heading>
              <Text fontSize={{ base: "sm", md: "lg" }} color="rgba(46,46,46,0.75)" lineHeight="1.8">
                It takes significant internal courage to vocalize these concerns. Your screening indicates{' '}
                <Box as="span" fontWeight="800" color="#56756D">{d.toLowerCase()}</Box> levels of low mood,{' '}
                <Box as="span" fontWeight="800" color="#56756D">{a.toLowerCase()}</Box> levels of worry, and{' '}
                <Box as="span" fontWeight="800" color="#56756D">{s.toLowerCase()}</Box> levels of stress.
              </Text>
              <Text fontSize={{ base: "xs", md: "md" }} color="rgba(46,46,46,0.75)" lineHeight="1.7">
                At MLC, we view these not just as symptoms, but as <b>early markers of distress</b> that can affect our lives significantly. If left unaddressed, these feelings can grow over time to overwhelm different areas of our lives, from our relationships to our career and internal peace.
              </Text>
              <Text fontSize={{ base: "xs", md: "md" }} color="rgba(46,46,46,0.75)" lineHeight="1.7">
                Therapy offers a structured path to tackle these challenges on time. By developing the right tools and gaining deeper self-awareness, you can navigate these seasons with greater resilience before they become overwhelming.
              </Text>
              <HStack spacing={4} pt={2}>
                <Icon as={FiHeart} color="red.400" w={5} h={5} flexShrink={0} />
                <Text fontWeight="700" color="#56756D" fontSize={{ base: "xs", md: "sm" }}>At MLC, we strictly vet every clinician in our collective to ensure the highest quality of therapy that is deeply tailored to your specific needs.</Text>
              </HStack>
            </VStack>
          </Box>

          <VStack align="start" spacing={6}>
            <Heading 
              size={{ base: "md", md: "lg" }} 
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              letterSpacing="-0.015em"
            >
              Your Recommended Specialists
            </Heading>
            {!hasAnyMatchResults && (
              <Box p={{ base: 5, md: 6 }} bg="rgba(169,203,183,0.1)" borderRadius="2xl" border="1px solid" borderColor="rgba(169,203,183,0.15)" w="full">
                <VStack align="start" spacing={2}>
                  <Text fontWeight="800" color="#56756D" fontSize={{ base: "sm", md: "md" }}>
                    No immediate matches found from this screening.
                  </Text>
                  <Text color="#56756D" fontSize={{ base: "sm", md: "md" }}>
                    But we have other incredible professionals you can explore right away.
                  </Text>
                </VStack>
              </Box>
            )}
            {loadingFallbackTherapists && !hasAnyMatchResults ? (
              <Center py={{ base: 10, md: 14 }} w="full">
                <VStack spacing={3}>
                  <Spinner color="#6B8B7B" />
                  <Text color="rgba(46,46,46,0.6)" fontSize={{ base: "sm", md: "md" }}>
                    Finding verified public clinicians for you...
                  </Text>
                </VStack>
              </Center>
            ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 10 }} w="full">
              {therapistsToRender.map(t => (
                <TherapistCard key={t.id} therapist={t} />
              ))}
            </SimpleGrid>
            )}
            {(!results || therapistsToRender.length === 0) && !loadingFallbackTherapists && (
              <VStack py={{ base: 10, md: 20 }} bg="gray.50" borderRadius="3xl" w="full" textAlign="center">
                <Icon as={FiStar} w={10} h={10} color="gray.300" />
                <Text color="rgba(46,46,46,0.6)" fontSize={{ base: "sm", md: "md" }} px={4}>
                  We could not find immediate matches yet. Our intake team will still review your profile and connect you with the right support shortly.
                </Text>
              </VStack>
            )}
          </VStack>

          <VStack py={{ base: 8, md: 12 }} borderTop="1px solid" borderColor="gray.100" spacing={6}>
            <Text color="rgba(46,46,46,0.6)" fontSize={{ base: "xs", md: "sm" }}>Not sure who to choose? Book a consultation with our Intake Coordinator.</Text>
            <Button as={NextLink} href="/book" bg="#56756D" color="white" borderRadius="full" px={10} h={14} fontSize={{ base: "sm", md: "md" }} _hover={{ bg: "#263A33" }}>Book Intake Consultation</Button>
            <Button variant="link" color="#56756D" leftIcon={<FiRefreshCw />} onClick={() => setView("quiz")} fontSize={{ base: "sm", md: "md" }}>Update my needs / Retake Screening</Button>
          </VStack>
        </VStack>
      </Container>
    );
  };

  const renderWelcomeBack = () => {
    return (
      <Container maxW="3xl" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="center" textAlign="center" p={{ base: 8, md: 12 }} bg="white" borderRadius={{ base: "2xl", md: "3rem" }} shadow="2xl">
          <Icon as={FiCheck} w={{ base: 12, md: 16 }} h={{ base: 12, md: 16 }} color="#6B8B7B" />
          <VStack spacing={4}>
            <Heading 
              size={{ base: "lg", md: "xl" }} 
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              letterSpacing="-0.015em"
            >
              Welcome Back
            </Heading>
            <Text fontSize={{ base: "sm", md: "lg" }} color="rgba(46,46,46,0.75)" fontFamily="'Inter', var(--font-inter), sans-serif">You have already completed your clinical screening. How would you like to proceed?</Text>
          </VStack>
          <Stack direction={{ base: "column", md: "row" }} spacing={4} w="full">
            <Button flex={1} bg="#56756D" color="white" borderRadius="full" height="14" fontSize={{ base: "sm", md: "md" }} fontFamily="'Inter', var(--font-inter), sans-serif" onClick={() => setView("results")}>View My Recommended Matches</Button>
            <Button flex={1} variant="outline" borderColor="#56756D" color="#56756D" borderRadius="full" height="14" fontSize={{ base: "sm", md: "md" }} fontFamily="'Inter', var(--font-inter), sans-serif" leftIcon={<FiRefreshCw />} onClick={() => setView("quiz")}>Update My Needs</Button>
          </Stack>
        </VStack>
      </Container>
    );
  };

  // ===========================
  // 🔹 View Router
  // ===========================

  if (view === "checking" || !isMounted) return <Box py={40} textAlign="center" fontFamily="'Inter', var(--font-inter), sans-serif"><Spinner size="xl" color="#56756D" /><Text mt={4} color="#718096">Retrieving your profile...</Text></Box>;
  if (view === "auth_gate") return <AuthGate />;
  if (view === "welcome_back") return renderWelcomeBack();
  if (view === "high_risk") return (
    <Box py={{ base: 12, md: 20 }} textAlign="center" px={4} fontFamily="'Inter', var(--font-inter), sans-serif">
      <Heading 
        size={{ base: "md", md: "lg" }}
        color="#263A33"
        fontFamily="'Outfit', var(--font-outfit), sans-serif"
        fontWeight="600"
        letterSpacing="-0.015em"
      >
        Immediate Support Recommended
      </Heading>
      <Text mt={4} fontSize={{ base: "sm", md: "md" }} color="#5A6E65">Please contact your countries national helplines or nearest hospital ER.</Text>
    </Box>
  );
  if (view === "results") return renderResults();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 8, md: 12 }} px={{ base: 3, md: 0 }} fontFamily="'Inter', var(--font-inter), sans-serif">
      <Container maxW={{ base: "full", md: currentSection > 7 ? "4xl" : "3xl" }}>
        <VStack spacing={{ base: 5, md: 8 }} align="stretch">
          <Box 
            bg="white" 
            p={{ base: 5, md: 10 }} 
            borderRadius="2xl" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
            border="1px solid rgba(86, 117, 109, 0.14)"
          >
            <VStack spacing={{ base: 5, md: 8 }} align="stretch">
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="11px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase" fontFamily="'Inter', var(--font-inter), sans-serif">
                    STEP {currentSection + 1} / {SECTIONS.length}
                  </Text>
                  <Text fontSize="11px" fontWeight="700" color="#718096" fontFamily="'Inter', var(--font-inter), sans-serif">
                    {Math.round(progress)}%
                  </Text>
                </HStack>
                <Progress value={progress} size="xs" borderRadius="full" sx={{ '& > div': { bg: '#56756D' } }} />
              </Box>
              <AnimatePresence mode="wait">
                <MotionBox key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  {renderSection()}
                </MotionBox>
              </AnimatePresence>
              <Flex justify="space-between" pt={{ base: 5, md: 7 }} gap={3} direction={{ base: "row" }} flexWrap="nowrap" align="center">
                <Button
                  variant="ghost"
                  leftIcon={<FiArrowLeft />}
                  onClick={prevStep}
                  isDisabled={currentSection === 0}
                  h="38px"
                  fontSize="13px"
                  fontWeight="600"
                  color="#5A6E65"
                  borderRadius="full"
                  px={4}
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                  flexShrink={0}
                >
                  Back
                </Button>
                {currentSection < SECTIONS.length - 1 && (
                  <Button
                    bg="#56756D"
                    color="white"
                    px={{ base: 5, md: 7 }}
                    h="38px"
                    fontSize="13px"
                    fontWeight="600"
                    borderRadius="full"
                    rightIcon={<FiArrowRight />}
                    onClick={nextStep}
                    flexShrink={0}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
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
