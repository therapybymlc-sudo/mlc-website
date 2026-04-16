import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  IconButton,
  Progress,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  Divider,
  Icon,
  Tag,
  Wrap,
  WrapItem,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiSearch, FiAlertCircle } from "react-icons/fi";
import { apiPost } from "../api";
import TherapistCard from "../components/TherapistCard";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink } from "react-router-dom";

const MotionBox = motion(Box);

// ===========================
// 🔹 Constants & Data
// ===========================

const SECTIONS = [
  "Identity",
  "Welcome",
  "Basics",
  "Preferences",
  "Concerns",
  "History",
  "Functioning",
  "Support",
  "Risk",
  "Assessment", // DASS-21
  "Marketing", // Final Marketing Step
];

const LANGUAGES = [
  "English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "Kannada", "Bengali", "Gujarati", "Marathi", "Punjabi", "French", "Spanish", "German"
];

const CONCERNS_OPTIONS = [
  "Persistent sadness or low mood",
  "Anxiety or excessive worry",
  "Stress or burnout",
  "Panic symptoms",
  "Trauma or difficult past experiences",
  "Relationship difficulties",
  "Family conflict",
  "Grief or loss",
  "Self-esteem or self-worth difficulties",
  "Identity-related concerns",
  "Anger or irritability",
  "Emotional overwhelm",
  "Loneliness or isolation",
  "Work-related distress",
  "Academic stress",
  "Life transitions",
  "Sleep difficulties",
  "Eating-related concerns",
  "Repetitive thoughts or compulsive behaviours",
  "Parenting-related distress",
  "I am not sure how to describe it",
];

const DASS_ITEMS = [
  "I found it hard to wind down", // 30
  "I was aware of dryness of my mouth", // 31
  "I could not seem to experience any positive feeling at all", // 32
  "I experienced breathing difficulty (e.g., excessively rapid breathing, or breathlessness in the absence of physical exertion)", // 33
  "I found it difficult to work up the initiative to do things", // 34
  "I tended to over-react to situations", // 35
  "I experienced trembling (e.g., in the hands)", // 36
  "I felt that I was using a lot of nervous energy", // 37
  "I was worried about situations in which I might panic and make a fool of myself", // 38
  "I felt that I had nothing to look forward to", // 39
  "I found myself getting agitated", // 40
  "I found it difficult to relax", // 41
  "I felt down-hearted and blue", // 42
  "I was intolerant of anything that kept me from getting on with what I was doing", // 43
  "I felt I was close to panic", // 44
  "I was unable to become enthusiastic about anything", // 45
  "I felt I was not worth much as a person", // 46
  "I felt that I was rather touchy", // 47
  "I was aware of the action of my heart in the absence of physical exertion", // 48
  "I felt scared without any good reason", // 49
  "I felt that life was meaningless", // 50
];

export default function TherapistDiscovery() {
  const [view, setView] = useState("quiz"); // quiz, results, high_risk
  const [currentSection, setCurrentSection] = useState(0);
  const [quizData, setQuizData] = useState({
    // Basics
    consent: null,
    age: "",
    gender: "",
    gender_other: "",
    location: { country: "", city: "", timezone: "" },
    languages: ["English"],
    language_other: "",
    
    // Preferences
    session_type_pref: "",
    service_type: "",
    therapist_gender_pref: "No preference",
    religion_pref: "No preference",
    therapy_style_pref: "",
    urgency: "",
    
    // Concerns
    presenting_concerns: [],
    primary_concern: "",
    duration: "",
    impairment_level: "",
    presenting_other: "",

    // History
    prior_therapy: "",
    psychiatry_history: "",
    on_medication: "",
    has_diagnosis: "",
    diagnosis_details: "",
    health_factors: "",
    health_factors_details: "",

    // Functioning
    daily_functioning: "",
    sleep_quality: "",
    energy_level: "",
    appetite_level: "",

    // Support
    support_level: "",
    support_sources: [],
    support_other: "",

    // Risk
    suicidal_thoughts: "",
    past_self_harm: "",
    feels_safe: "",
    immediate_safety_concern: "",
    safety_details: "",

    // Marketing
    marketing_email_consent: false,
    marketing_whatsapp_consent: false,
    
    // Assessment (DASS-21)
    dass_answers: {}, // { '30': 0, ... }
  });

  const { isAuthenticated, user } = useAuth();

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLang, setSearchLang] = useState("");
  const toast = useToast();

  const progress = (currentSection / (SECTIONS.length - 1)) * 100;

  // ===========================
  // 🔹 Logic
  // ===========================

  const nextStep = () => {
    // Branching & Safety Overrides
    if (currentSection === 1 && quizData.consent === "No, I do not wish to continue") {
      window.location.href = "/";
      return;
    }

    if (currentSection === 8) { // Risk Section
      const { suicidal_thoughts, feels_safe, immediate_safety_concern } = quizData;
      if (
        suicidal_thoughts === "Yes, and I feel at risk of acting on these thoughts" ||
        feels_safe === "No" ||
        immediate_safety_concern === "Yes"
      ) {
        setView("high_risk");
        submitQuiz(); // Still submit for triage
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
    try {
      // 1. Get Matching Results (Backend handles logic)
      const res = await apiPost("therapists/match/", quizData);
      setResults(res);

      // 2. Clinical Integration (If Authenticated Client)
      if (isAuthenticated && clientProfile?.id) {
          try {
            // A. Save Detailed Quiz Responses as a Clinical Note
            const clinicalNoteBody = `
--- INITIAL CLINICAL SCREENING (MATCHING QUIZ) ---
DATE: ${new Date().toLocaleString()}

CONCERNS & INTENSITY:
- Primary: ${quizData.primary_concern}
- Duration: ${quizData.duration}
- Daily Impact: ${quizData.impairment_level}
- Stress Level self-score: ${quizData.stress_level}/10

ALL CONCERNS: ${quizData.presenting_concerns.join(', ')}

THERAPY PREFERENCES:
- Type: ${quizData.service_type}
- Format: ${quizData.session_type_pref}
- Gender Pref: ${quizData.therapist_gender_pref}
- Style: ${quizData.therapy_style_pref}
- Languages: ${quizData.languages.join(', ')} ${quizData.language_other}

CLINICAL HISTORY:
- Prev Therapy: ${quizData.previous_therapy}
- Medications: Current(${quizData.medication_current}), Past(${quizData.medication_past})
- Functioning: Sleep(${quizData.sleep_quality}), Appetite(${quizData.appetite_change})

RISK ASSESSMENT:
- Immediate Concern: ${quizData.immediate_safety_concern}
- Safe right now: ${quizData.feels_safe}
- Detailed notes: ${quizData.safety_details}
            `;

            await apiPost("notes/", {
                client: clientProfile.id,
                title: "Screening: Therapist Discovery Quiz",
                body: clinicalNoteBody,
                is_private: true
            });

            // B. Save DASS-21 Results as a Secure File Attachment
            if (res.dass_summary) {
                const reportContent = `
MLC CLINICAL ASSESSMENT REPORT: DASS-21
Generated: ${new Date().toLocaleString()}

INTERPRETATION:
${res.dass_summary}

CLINICAL SCORES:
- Depression Score: ${res.dass_scores?.depression}
- Anxiety Score: ${res.dass_scores?.anxiety}
- Stress Score: ${res.dass_scores?.stress}

DASS Interpretation based on Lovibond & Lovibond (1995).
                `;

                const blob = new Blob([reportContent], { type: "text/plain" });
                const formData = new FormData();
                formData.append("file", blob, `DASS21_Assessment_${new Date().toISOString().slice(0,10)}.txt`);
                formData.append("client", clientProfile.id);
                formData.append("title", "Clinical Assessment (DASS-21)");
                formData.append("is_private", "true");

                const { apiUpload } = await import("../../api");
                await apiUpload("files/", formData);
            }
          } catch (syncErr) {
            console.error("Clinical sync background failure", syncErr);
          }
      }

      if (view !== "high_risk") setView("results");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Submit quiz yield", err);
      toast({ 
        title: "Something went wrong", 
        description: "We couldn't process your request. Please try again.", 
        status: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // 🔹 Render Sections
  // ===========================

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Identity
         return (
           <VStack spacing={10} align="center" textAlign="center" py={10}>
             <Icon as={FiCheck} w={12} h={12} color="mlc.green" />
             <VStack spacing={4}>
               <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                 Before we begin...
               </Heading>
               {isAuthenticated ? (
                 <Box>
                    <Text fontSize="lg" color="gray.600">
                      Welcome back, <b>{user?.first_name || "there"}</b>! We've linked this screening to your account.
                    </Text>
                    <Button mt={8} bg="mlc.green" color="white" borderRadius="full" px={10} onClick={nextStep}>
                       Start the Screening
                    </Button>
                 </Box>
               ) : (
                 <Box>
                    <Text fontSize="lg" color="gray.600" mb={8}>
                      To give you a seamless experience and save your results, please take a moment to create your MLC account.
                    </Text>
                    <Stack direction={{ base: "column", md: "row" }} spacing={4} justify="center">
                       <Button as={RouterLink} to="/signup/client" bg="mlc.gold" color="white" borderRadius="full" px={8}>
                          Create my MLC Account
                       </Button>
                       <Button as={RouterLink} to="/login" variant="outline" borderColor="mlc.green" color="mlc.greenDark" borderRadius="full" px={8}>
                          Log In
                       </Button>
                    </Stack>
                    <Text mt={6} fontSize="sm" color="gray.400">
                      Already have an account? Log in above to continue.
                    </Text>
                 </Box>
               )}
             </VStack>
           </VStack>
         );

      case 1: // Welcome
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={4}>
              <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                Find the therapist best suited to support you
              </Heading>
              <Text fontSize="lg" color="gray.600" lineHeight="tall">
                Thank you for being here. This guide is designed to help us understand your journey, what matters most to you right now, and which member of our team might be the best companion for your path.
              </Text>
              <Alert status="info" variant="subtle" borderRadius="xl" bg="mlc.peachHighlight" color="mlc.greenDark">
                <AlertIcon color="mlc.green" />
                <Box>
                  <AlertTitle>This is a matching tool, not a diagnosis.</AlertTitle>
                  <AlertDescription fontSize="sm">
                    If you indicate that you're in immediate danger, we'll guide you toward urgent help instead of routine matching.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
            
            <Divider />

            <VStack align="stretch" spacing={4}>
              <Text fontWeight="600">Do you understand and agree to continue?</Text>
              <RadioGroup value={quizData.consent} onChange={(v) => setQuizData({...quizData, consent: v})}>
                <Stack direction="column" spacing={4}>
                  <MotionBox whileHover={{ x: 5 }}>
                    <Radio value="Yes, I understand and would like to continue" colorScheme="teal">
                      Yes, I understand and would like to continue
                    </Radio>
                  </MotionBox>
                  <MotionBox whileHover={{ x: 5 }}>
                    <Radio value="No, I do not wish to continue" colorScheme="teal">
                      No, I don't wish to continue right now
                    </Radio>
                  </MotionBox>
                </Stack>
              </RadioGroup>
            </VStack>
          </VStack>
        );

      case 2: // Basics
        return (
          <VStack spacing={8} align="stretch">
             <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Tell us a bit about yourself</Heading>
              <Text color="gray.600">This helps us ensure we're matching you with someone who has the right expertise for your age and background.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel>How old are you?</FormLabel>
                <Input type="number" value={quizData.age} onChange={(e) => setQuizData({...quizData, age: e.target.value})} placeholder="e.g. 25" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Gender Identification</FormLabel>
                <Select value={quizData.gender} onChange={(e) => setQuizData({...quizData, gender: e.target.value})} placeholder="Select gender">
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            {quizData.gender === "Other" && (
              <Input placeholder="How would you describe your gender?" value={quizData.gender_other} onChange={(e) => setQuizData({...quizData, gender_other: e.target.value})} />
            )}

            <VStack align="stretch" spacing={4}>
              <Text fontWeight="600">Where are you based?</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Input placeholder="Country" value={quizData.location.country} onChange={(e) => setQuizData({...quizData, location: {...quizData.location, country: e.target.value}})} />
                <Input placeholder="City" value={quizData.location.city} onChange={(e) => setQuizData({...quizData, location: {...quizData.location, city: e.target.value}})} />
                <Input placeholder="Time zone" value={quizData.location.timezone} onChange={(e) => setQuizData({...quizData, location: {...quizData.location, timezone: e.target.value}})} />
              </SimpleGrid>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Text fontWeight="600">Which languages would you be comfortable in for therapy? (Select all that apply)</Text>
               <InputGroup size="md" mb={4}>
                <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.300" />} />
                <Input 
                  placeholder="Type to find a language..." 
                  value={searchLang} 
                  onChange={(e) => setSearchLang(e.target.value)}
                />
              </InputGroup>
              <Wrap spacing={3}>
                {LANGUAGES.filter(lang => lang.toLowerCase().includes(searchLang.toLowerCase())).map(lang => (
                  <WrapItem key={lang}>
                    <Tag 
                      size="lg" 
                      variant={quizData.languages.includes(lang) ? "solid" : "outline"} 
                      colorScheme="teal"
                      cursor="pointer"
                      onClick={() => {
                        const current = quizData.languages;
                        if (current.includes(lang)) setQuizData({...quizData, languages: current.filter(l => l !== lang)});
                        else setQuizData({...quizData, languages: [...current, lang]});
                      }}
                    >
                      {lang}
                    </Tag>
                  </WrapItem>
                ))}
                <WrapItem>
                  <Tag 
                    size="lg" 
                    variant={quizData.languages.includes("Other") ? "solid" : "outline"} 
                    colorScheme="teal"
                    cursor="pointer"
                    onClick={() => {
                        const current = quizData.languages;
                        if (current.includes("Other")) setQuizData({...quizData, languages: current.filter(l => l !== "Other")});
                        else setQuizData({...quizData, languages: [...current, "Other"]});
                    }}
                  >
                    Other
                  </Tag>
                </WrapItem>
              </Wrap>
              {quizData.languages.includes("Other") && (
                <Input mt={2} placeholder="Which other language(s)?" value={quizData.language_other} onChange={(e) => setQuizData({...quizData, language_other: e.target.value})} />
              )}
            </VStack>
          </VStack>
        );

      case 3: // Preferences
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Your therapy preferences</Heading>
              <Text color="gray.600">Let's find a setup that fits your lifestyle and comfort.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <VStack align="stretch">
                <Text fontWeight="600">Session format</Text>
                <RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({...quizData, session_type_pref: v})}>
                  <Stack spacing={3}>
                    <Radio value="Online only">Online only</Radio>
                    <Radio value="In-person only">In-person only</Radio>
                    <Radio value="Either online or in-person">Either online or in-person</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>

              <VStack align="stretch">
                 <Text fontWeight="600">Who is this for?</Text>
                <RadioGroup value={quizData.service_type} onChange={(v) => setQuizData({...quizData, service_type: v})}>
                  <Stack spacing={3}>
                    <Radio value="Individual therapy">For myself</Radio>
                    <Radio value="Couples therapy">For my relationship</Radio>
                    <Radio value="Family-related support">For my family</Radio>
                    <Radio value="I am not sure yet">I'm not sure yet</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>

              <VStack align="stretch">
                 <Text fontWeight="600">Therapist gender preference</Text>
                <RadioGroup value={quizData.therapist_gender_pref} onChange={(v) => setQuizData({...quizData, therapist_gender_pref: v})}>
                  <Stack spacing={3}>
                    <Radio value="No preference">No preference</Radio>
                    <Radio value="Woman therapist">A woman therapist</Radio>
                    <Radio value="Man therapist">A man therapist</Radio>
                    <Radio value="Non-binary therapist">A non-binary therapist</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>

              <VStack align="stretch">
                 <Text fontWeight="600">Preferred style</Text>
                <RadioGroup value={quizData.therapy_style_pref} onChange={(v) => setQuizData({...quizData, therapy_style_pref: v})}>
                  <Stack spacing={3}>
                    <Radio value="Structured">Structured / Tool-based</Radio>
                    <Radio value="Reflective">Reflective / Exploratory</Radio>
                    <Radio value="Balanced">A mix of both</Radio>
                    <Radio value="I am not sure">I'm not sure yet</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>

              <VStack align="stretch">
                 <Text fontWeight="600">Religious orientation preference</Text>
                <Select value={quizData.religion_pref} onChange={(e) => setQuizData({...quizData, religion_pref: e.target.value})} placeholder="Select preference">
                  <option value="No preference">No preference</option>
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Atheist/Secular">Atheist/Secular</option>
                  <option value="Other">Other</option>
                </Select>
              </VStack>
            </SimpleGrid>

            <VStack align="stretch">
                <Text fontWeight="600">When are you looking to start?</Text>
                <RadioGroup value={quizData.urgency} onChange={(v) => setQuizData({...quizData, urgency: v})}>
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    <Radio value="As soon as possible">Asap</Radio>
                    <Radio value="Within the next 1–2 weeks">Next 1-2 weeks</Radio>
                    <Radio value="Within the next month">This month</Radio>
                    <Radio value="I am just exploring">Just exploring</Radio>
                  </Stack>
                </RadioGroup>
              </VStack>
          </VStack>
        );

      case 4: // Concerns
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">What's going on for you?</Heading>
              <Text color="gray.600">Select everything that feels relevant right now.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
               {CONCERNS_OPTIONS.map(c => (
                 <Box 
                  key={c} 
                  p={4} 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor={quizData.presenting_concerns.includes(c) ? "mlc.green" : "gray.200"}
                  bg={quizData.presenting_concerns.includes(c) ? "#E9F2ED" : "white"}
                  cursor="pointer"
                  onClick={() => {
                    const current = quizData.presenting_concerns;
                    if (current.includes(c)) setQuizData({...quizData, presenting_concerns: current.filter(x => x !== c)});
                    else setQuizData({...quizData, presenting_concerns: [...current, c]});
                  }}
                  whileHover={{ borderColor: "#56756D" }}
                  as={motion.div}
                 >
                   <HStack>
                     <Checkbox isChecked={quizData.presenting_concerns.includes(c)} colorScheme="teal" pointerEvents="none" />
                     <Text fontSize="sm">{c}</Text>
                   </HStack>
                 </Box>
               ))}
               <Box 
                  p={4} 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor={quizData.presenting_concerns.includes("Other") ? "mlc.green" : "gray.200"}
                  bg={quizData.presenting_concerns.includes("Other") ? "#E9F2ED" : "white"}
                  cursor="pointer"
                  onClick={() => {
                        const current = quizData.presenting_concerns;
                        if (current.includes("Other")) setQuizData({...quizData, presenting_concerns: current.filter(x => x !== "Other")});
                        else setQuizData({...quizData, presenting_concerns: [...current, "Other"]});
                  }}
                  as={motion.div}
               >
                  <HStack>
                    <Checkbox isChecked={quizData.presenting_concerns.includes("Other")} colorScheme="teal" pointerEvents="none" />
                    <Text fontSize="sm">Something else...</Text>
                  </HStack>
               </Box>
            </SimpleGrid>

            {quizData.presenting_concerns.includes("Other") && (
              <Input placeholder="Tell us more about it..." value={quizData.presenting_other} onChange={(e) => setQuizData({...quizData, presenting_other: e.target.value})} />
            )}

            {quizData.presenting_concerns.length > 0 && (
              <VStack align="stretch" spacing={6} mt={6}>
                 <FormControl>
                  <FormLabel fontWeight="600">Which of these feels most important to address first?</FormLabel>
                   <Select placeholder="Choose primary concern" value={quizData.primary_concern} onChange={(e) => setQuizData({...quizData, primary_concern: e.target.value})}>
                      {quizData.presenting_concerns.map(c => <option key={c} value={c}>{c}</option>)}
                   </Select>
                 </FormControl>

                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel fontWeight="600">How long has this been affecting you?</FormLabel>
                      <Select placeholder="Select duration" value={quizData.duration} onChange={(e) => setQuizData({...quizData, duration: e.target.value})}>
                        <option value="Less than 2 weeks">Less than 2 weeks</option>
                        <option value="2 to 4 weeks">2 to 4 weeks</option>
                        <option value="1 to 3 months">1 to 3 months</option>
                        <option value="3 to 6 months">3 to 6 months</option>
                        <option value="More than 6 months">More than 6 months</option>
                        <option value="More than 1 year">More than 1 year</option>
                        <option value="On and off for years">On and off for years</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="600">How much is this impacting your daily life?</FormLabel>
                      <Select placeholder="Select impact level" value={quizData.impairment_level} onChange={(e) => setQuizData({...quizData, impairment_level: e.target.value})}>
                        <option value="A little">A little</option>
                        <option value="Moderately">Moderately</option>
                        <option value="Significantly">Significantly</option>
                        <option value="Severely">Severely</option>
                      </Select>
                    </FormControl>
                 </SimpleGrid>
              </VStack>
            )}
          </VStack>
        );

      case 5: // History
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">A bit about your history</Heading>
              <Text color="gray.600">Understanding your past experiences helps us tailor your matching.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
               <VStack align="stretch">
                 <Text fontWeight="600">Have you tried therapy before?</Text>
                 <RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({...quizData, prior_therapy: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No, this is my first time</Radio>
                      <Radio value="Yes, helpful">Yes, and it was helpful</Radio>
                      <Radio value="Yes, mixed">Yes, and it was a mixed experience</Radio>
                      <Radio value="Yes, not helpful">Yes, but it wasn't helpful</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">Have you seen a psychiatrist recently?</Text>
                 <RadioGroup value={quizData.psychiatry_history} onChange={(v) => setQuizData({...quizData, psychiatry_history: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No</Radio>
                      <Radio value="Yes, past">Yes, in the past</Radio>
                      <Radio value="Yes, currently">Yes, I am currently</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">Are you taking psychiatric medication?</Text>
                 <RadioGroup value={quizData.on_medication} onChange={(v) => setQuizData({...quizData, on_medication: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No</Radio>
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="Prefer not to say">Prefer not to say</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">Have you received a diagnosis before?</Text>
                 <RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({...quizData, has_diagnosis: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No</Radio>
                      <Radio value="Yes">Yes</Radio>
                      <Radio value="Not sure">I'm not sure</Radio>
                      <Radio value="Prefer not to say">Prefer not to say</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>
            </SimpleGrid>

            {quizData.has_diagnosis === "Yes" && (
              <Input placeholder="Feel free to share the diagnosis (optional)" value={quizData.diagnosis_details} onChange={(e) => setQuizData({...quizData, diagnosis_details: e.target.value})} />
            )}

            <VStack align="stretch">
               <Text fontWeight="600">Any long-term physical health concerns we should know about?</Text>
               <RadioGroup value={quizData.health_factors} onChange={(v) => setQuizData({...quizData, health_factors: v})}>
                  <Stack direction="row" spacing={6}>
                    <Radio value="No">No</Radio>
                    <Radio value="Yes">Yes</Radio>
                  </Stack>
               </RadioGroup>
               {quizData.health_factors === "Yes" && (
                 <Textarea placeholder="Share details here..." value={quizData.health_factors_details} onChange={(e) => setQuizData({...quizData, health_factors_details: e.target.value})} />
               )}
            </VStack>
          </VStack>
        );

      case 6: // Functioning
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">How are you functioning daily?</Heading>
              <Text color="gray.600">These help us understand your energy levels and current capacity.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
               <VStack align="stretch">
                 <Text fontWeight="600">Managing responsibilities</Text>
                 <RadioGroup value={quizData.daily_functioning} onChange={(v) => setQuizData({...quizData, daily_functioning: v})}>
                    <Stack spacing={2}>
                      <Radio value="Managing well">Managing well</Radio>
                      <Radio value="Noticeable difficulty">I'm finding it noticeably difficult</Radio>
                      <Radio value="Struggling most days">I struggle most days</Radio>
                      <Radio value="Very difficult">It's very difficult to function</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">How's your sleep lately?</Text>
                 <RadioGroup value={quizData.sleep_quality} onChange={(v) => setQuizData({...quizData, sleep_quality: v})}>
                    <Stack spacing={2}>
                      <Radio value="No significant difficulty">Sleeping okay</Radio>
                      <Radio value="Some difficulty">Some trouble sleeping</Radio>
                      <Radio value="Significant difficulty">Significant difficulty</Radio>
                      <Radio value="Very poor">Very poor / severely disrupted</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">Daily energy levels</Text>
                 <RadioGroup value={quizData.energy_level} onChange={(v) => setQuizData({...quizData, energy_level: v})}>
                    <Stack spacing={2}>
                      <Radio value="Mostly stable">Mostly stable</Radio>
                      <Radio value="A little lower than usual">A little lower than usual</Radio>
                      <Radio value="Quite low">Quite low</Radio>
                      <Radio value="Extremely low">Extremely low</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>

               <VStack align="stretch">
                 <Text fontWeight="600">Relationship with food/appetite</Text>
                 <RadioGroup value={quizData.appetite_level} onChange={(v) => setQuizData({...quizData, appetite_level: v})}>
                    <Stack spacing={2}>
                      <Radio value="No significant change">No real change</Radio>
                      <Radio value="Slightly changed">Changed slightly</Radio>
                      <Radio value="Noticeably changed">Noticeably changed</Radio>
                      <Radio value="Severely affected">Severely affected</Radio>
                    </Stack>
                 </RadioGroup>
               </VStack>
            </SimpleGrid>
          </VStack>
        );

      case 7: // Support
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Your support system</Heading>
              <Text color="gray.600">Do you have people you can lean on right now?</Text>
            </VStack>

            <VStack align="stretch">
                <Text fontWeight="600">Do you feel you have emotional support?</Text>
                <RadioGroup value={quizData.support_level} onChange={(v) => setQuizData({...quizData, support_level: v})}>
                  <Stack spacing={2}>
                    <Radio value="Strong support">Yes, I have strong support</Radio>
                    <Radio value="Some support">I have some support</Radio>
                    <Radio value="Very little support">I have very little support</Radio>
                    <Radio value="Not supported">I don't currently feel supported</Radio>
                  </Stack>
                </RadioGroup>
            </VStack>

            <VStack align="stretch">
                <Text fontWeight="600">Who do you turn to when things get tough?</Text>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                   {["Partner/Spouse", "Family", "Friends", "Community", "Professional", "No one"].map(s => (
                     <Checkbox 
                        key={s} 
                        colorScheme="teal"
                        isChecked={quizData.support_sources.includes(s)}
                        onChange={(e) => {
                          const current = quizData.support_sources;
                          if (e.target.checked) setQuizData({...quizData, support_sources: [...current, s]});
                          else setQuizData({...quizData, support_sources: current.filter(x => x !== s)});
                        }}
                     >
                       {s}
                     </Checkbox>
                   ))}
                   <Checkbox 
                        colorScheme="teal"
                        isChecked={quizData.support_sources.includes("Other")}
                        onChange={(e) => {
                          const current = quizData.support_sources;
                          if (e.target.checked) setQuizData({...quizData, support_sources: [...current, "Other"]});
                          else setQuizData({...quizData, support_sources: current.filter(x => x !== "Other")});
                        }}
                   >
                     Other
                   </Checkbox>
                </SimpleGrid>
                {quizData.support_sources.includes("Other") && (
                  <Input placeholder="Tell us who..." value={quizData.support_other} onChange={(e) => setQuizData({...quizData, support_other: e.target.value})} />
                )}
            </VStack>
          </VStack>
        );

      case 8: // Risk
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">One more safe check</Heading>
              <Text color="gray.600">These questions help us understand the urgency of the care you need.</Text>
            </VStack>

            <VStack align="stretch" spacing={6}>
               <FormControl isRequired>
                 <FormLabel fontWeight="600">Have you recently had thoughts about self-harm or not wanting to be alive?</FormLabel>
                 <RadioGroup value={quizData.suicidal_thoughts} onChange={(v) => setQuizData({...quizData, suicidal_thoughts: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No</Radio>
                      <Radio value="Yes, occasionally">Yes, occasionally</Radio>
                      <Radio value="Yes, fairly often">Yes, fairly often</Radio>
                      <Radio value="Yes, and I feel at risk of acting on these thoughts">Yes, and I feel at risk of acting on them</Radio>
                    </Stack>
                 </RadioGroup>
               </FormControl>

               <FormControl isRequired>
                 <FormLabel fontWeight="600">Have you ever harmed yourself intentionally in the past?</FormLabel>
                 <RadioGroup value={quizData.past_self_harm} onChange={(v) => setQuizData({...quizData, past_self_harm: v})}>
                    <Stack spacing={2}>
                      <Radio value="No">No</Radio>
                      <Radio value="Yes, past">Yes, in the past</Radio>
                      <Radio value="Yes, recently">Yes, recently</Radio>
                    </Stack>
                 </RadioGroup>
               </FormControl>

               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Do you feel safe right now?</FormLabel>
                    <RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({...quizData, feels_safe: v})}>
                      <Stack spacing={2}>
                        <Radio value="Yes">Yes</Radio>
                        <Radio value="I am not completely sure">I'm not completely sure</Radio>
                        <Radio value="No">No</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="600">Is there any immediate safety concern?</FormLabel>
                    <RadioGroup value={quizData.immediate_safety_concern} onChange={(v) => setQuizData({...quizData, immediate_safety_concern: v})}>
                      <Stack direction="row" spacing={6}>
                        <Radio value="No">No</Radio>
                        <Radio value="Yes">Yes</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
               </SimpleGrid>

               {quizData.immediate_safety_concern === "Yes" && (
                 <Textarea placeholder="If you're comfortable, please share more detail..." value={quizData.safety_details} onChange={(e) => setQuizData({...quizData, safety_details: e.target.value})} />
               )}
            </VStack>
          </VStack>
        );

      case 9: // Assessment (DASS-21)
        return (
          <VStack spacing={8} align="stretch">
             <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">The Final Check (DASS-21)</Heading>
              <Text color="gray.600">Please read each statement and select how much it applied to you <b>over the past week</b>.</Text>
            </VStack>

            <Alert status="info" borderRadius="xl">
               <AlertDescription fontSize="sm">
                 0 = Not at all | 1 = Some of the time | 2 = Good part of time | 3 = Most of the time
               </AlertDescription>
            </Alert>

            <VStack spacing={10} align="stretch" py={6}>
               {DASS_ITEMS.map((text, idx) => {
                 const qNum = 30 + idx;
                 return (
                   <VStack key={qNum} align="stretch" spacing={4}>
                     <Text fontWeight="500">{idx + 1}. {text}</Text>
                     <RadioGroup 
                        value={quizData.dass_answers[qNum]?.toString() || ""} 
                        onChange={(v) => setQuizData({...quizData, dass_answers: {...quizData.dass_answers, [qNum]: parseInt(v)}})}
                     >
                        <Stack direction="row" spacing={8} justify="center">
                           {[0, 1, 2, 3].map(val => (
                             <VStack key={val} spacing={1}>
                               <Radio value={val.toString()} colorScheme="teal" size="lg" />
                               <Text fontSize="xs" color="gray.500">{val}</Text>
                             </VStack>
                           ))}
                        </Stack>
                     </RadioGroup>
                   </VStack>
                 )
               })}
            </VStack>
          </VStack>
        );

      case 10: // Marketing
         return (
           <VStack spacing={10} align="stretch">
              <VStack align="flex-start" spacing={3}>
                <Heading size="lg" color="mlc.greenDark">Stay Connected</Heading>
                <Text color="gray.600">We’d love to share more resources for your mental health journey with you.</Text>
              </VStack>
              
              <VStack align="stretch" spacing={6} p={8} bg="#FBF8F3" borderRadius="2xl" border="1px solid" borderColor="mlc.gold">
                  <Checkbox 
                    size="lg" 
                    colorScheme="teal"
                    isChecked={quizData.marketing_email_consent}
                    onChange={(e) => setQuizData({...quizData, marketing_email_consent: e.target.checked})}
                  >
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="600">Keep me inspired</Text>
                      <Text fontSize="sm" color="gray.500">I’d like to receive mental health insights, expert advice, and MLC community news via email.</Text>
                    </VStack>
                  </Checkbox>

                  <Divider borderColor="gray.200" />

                  <Checkbox 
                    size="lg" 
                    colorScheme="teal"
                    isChecked={quizData.marketing_whatsapp_consent}
                    onChange={(e) => setQuizData({...quizData, marketing_whatsapp_consent: e.target.checked})}
                  >
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="600">Join our community on WhatsApp</Text>
                      <Text fontSize="sm" color="gray.500">I’d like to receive occasional updates, quick tips, and special offers directly on WhatsApp.</Text>
                    </VStack>
                  </Checkbox>
              </VStack>

              <Box textAlign="center" py={6}>
                 <Button 
                    size="xl" 
                    bg="mlc.green" 
                    color="white" 
                    px={16} 
                    borderRadius="full" 
                    isLoading={isLoading}
                    onClick={submitQuiz}
                    _hover={{ bg: "#56756D" }}
                 >
                   Reveal My Matches
                 </Button>
              </Box>
           </VStack>
         );
      default:
        return null;
    }
  };

  // ===========================
  // 🔹 High Risk View
  // ===========================

  if (view === "high_risk") {
    return (
      <Box minH="100vh" bg="#FFF5F5" pt={32} pb={20}>
         <Container maxW="3xl">
           <VStack spacing={10} bg="white" p={12} borderRadius="3xl" shadow="2xl" textAlign="center">
             <Icon as={FiAlertCircle} w={20} h={20} color="red.500" />
             <VStack spacing={4}>
               <Heading size="xl" color="red.700">Your safety is our priority</Heading>
               <Text fontSize="lg" color="gray.700">
                 Based on your responses, we want to ensure you have the immediate support you deserve. 
                 MLC regular therapy sessions are not suitable for crisis intervention.
               </Text>
             </VStack>

             <VStack spacing={6} w="full">
               <Box w="full" p={6} bg="red.50" borderRadius="2xl" border="1px solid" borderColor="red.100">
                  <Heading size="md" color="red.700" mb={4}>Crisis Resources</Heading>
                  <VStack align="flex-start" spacing={3}>
                    <Text fontWeight="600">• Call your local emergency services (999, 911, etc.)</Text>
                    <Text fontWeight="600">• Reach out to a 24/7 Crisis Hotline</Text>
                    <Text fontWeight="600">• Go to the nearest hospital emergency room</Text>
                  </VStack>
               </Box>
               <Button as={RouterLink} to="/" colorScheme="red" size="lg" borderRadius="full" px={10}>
                 Back to Home
               </Button>
             </VStack>
           </VStack>
         </Container>
      </Box>
    );
  }

  // ===========================
  // 🔹 Results View
  // ===========================

  if (view === "results") {
    return (
      <Box minH="100vh" bg="#F7F9F8" pt={32} pb={20}>
        <Container maxW="6xl">
          <VStack spacing={12} align="stretch">
            {/* Summary Card */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              bg="white"
              p={10}
              borderRadius="3xl"
              shadow="xl"
              borderTop="8px solid"
              borderTopColor="mlc.green"
            >
              <VStack align="flex-start" spacing={6}>
                <Heading color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                  Your Personalized Insights
                </Heading>
                <Text fontSize="lg" color="gray.700" lineHeight="tall">
                  {results?.dass_summary || "We've analyzed your responses to find the best support path for you."}
                </Text>
              </VStack>
            </MotionBox>

            {/* Matches Section */}
            <VStack align="stretch" spacing={8}>
              <Heading size="lg" color="mlc.greenDark">Best Matches for You</Heading>
              {results?.matches?.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {results.matches.map(therapist => (
                    <TherapistCard key={therapist.id} therapist={therapist} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box p={10} bg="mlc.peachHighlight" borderRadius="2xl" textAlign="center">
                  <Text fontSize="lg" color="mlc.greenDark" fontWeight="500">
                    We are working to onboard more therapists that fit your exact needs, and we will reach out to you as soon as we have someone who does.
                  </Text>
                </Box>
              )}
            </VStack>

            {/* Others Section */}
            <VStack align="stretch" spacing={8}>
              <Heading size="lg" color="mlc.greenDark">Other Available Specialists</Heading>
              <Text color="gray.600">While they may not be an exact match for your primary preference, these specialists are highly recommended members of our team.</Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {results?.others?.map(therapist => (
                  <TherapistCard key={therapist.id} therapist={therapist} />
                ))}
              </SimpleGrid>
            </VStack>

            <Box textAlign="center" pt={10}>
              <Button as={RouterLink} to="/therapists" variant="outline" colorScheme="teal" borderRadius="full" px={10}>
                View All Therapists
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // ===========================
  // 🔹 Quiz View (Main)
  // ===========================

  return (
    <Box minH="100vh" bg="#FDFBFA" pt={24} pb={20}>
      <Container maxW="3xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack align="flex-start" spacing={4}>
             <HStack w="full" justify="space-between">
                <Heading size="md" color="mlc.greenDark">Discovery Quiz</Heading>
                <Text fontSize="sm" color="gray.500">Section {currentSection + 1} of {SECTIONS.length}</Text>
             </HStack>
             <Progress value={progress} w="full" colorScheme="teal" borderRadius="full" size="sm" bg="gray.100" />
          </VStack>

          {/* Card */}
          <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100">
            <AnimatePresence mode="wait">
              <MotionBox
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSection()}
              </MotionBox>
            </AnimatePresence>

            {/* Navigation */}
            <HStack justify="space-between" mt={12} pt={8} borderTop="1px solid" borderColor="gray.100">
              <Button 
                variant="ghost" 
                leftIcon={<FiArrowLeft />} 
                onClick={prevStep}
                isDisabled={currentSection === 0}
              >
                Back
              </Button>
              {currentSection < SECTIONS.length - 1 && (
                <Button 
                  bg="mlc.green" 
                  color="white" 
                  rightIcon={<FiArrowRight />}
                  px={8}
                  borderRadius="full"
                  onClick={nextStep}
                  isLoading={isLoading}
                  _hover={{ bg: "#56756D" }}
                >
                  Continue
                </Button>
              )}
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
