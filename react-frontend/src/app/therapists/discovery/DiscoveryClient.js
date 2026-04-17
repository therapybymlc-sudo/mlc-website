'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, IconButton, Progress, Radio, RadioGroup, Checkbox, Stack, Input, Select, useToast, Divider, Icon, Tag, Wrap, Textarea, FormControl, FormLabel, Alert, AlertIcon, AlertTitle, AlertDescription, Badge,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiInfo, FiMapPin, FiHeart, FiStar } from "react-icons/fi";
import { apiPost } from "../../../api.js";
import TherapistCard from "../../../components/TherapistCard";
import { useAuth } from "../../../context/AuthContext";
import NextLink from "next/link";

const MotionBox = motion(Box);

// ===========================
// 🔹 Constants & Data
// ===========================

const SECTIONS = [
  "Consent",
  "Basics",
  "Preferences",
  "Current Focus",
  "Clinical History",
  "Safety",
  "Screening",
  "Finalize"
];

const LANGUAGES = ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "Kannada", "Bengali", "Marathi", "Punjabi", "Gujarati"];
const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Transgender", "Prefer not to say"];
const SESSION_TYPES = ["Online Video (Individual)", "In-person (Select Locations)", "Couples Therapy (Online)"];
const THERAPIST_GENDER_PREF = ["Woman", "Man", "No preference"];
const RELIGION_PREF = ["Secular / No preference", "Muslim", "Hindu", "Christian", "Spiritual (Non-religious)"];

const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad"
].sort();

const CONCERNS = [
  "Anxiety (Generalized, Panic, Social)", "Depression & Low Mood", "Complex Trauma (CPTSD)", "Childhood Trauma",
  "Identity & Self-Esteem", "Relationships & Attachment", "Neurodivergence (ADHD/Autism)", "Workplace Burnout",
  "Grief & Loss", "Personality-related Difficulties", "Body Image", "Sleep Issues", "Addiction & Recovery",
  "Obsessive Thoughts/Compulsions (OCD)", "Anger Management", "Phobias", "Postpartum Distress"
];

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

export default function DiscoveryClient() {
  const [view, setView] = useState("quiz"); 
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [finalInterpretations, setFinalInterpretations] = useState(null);
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();

  const [quizData, setQuizData] = useState({
    consent: false,
    age: "",
    gender: "",
    location_city: "",
    languages: ["English"],
    session_type_pref: "Online Video (Individual)",
    therapist_gender_pref: "No preference",
    religion_pref: "Secular / No preference",
    presenting_concerns: [],
    primary_concern: "",
    duration: "",
    prior_therapy: "",
    has_diagnosis: "",
    suicidal_thoughts: "No",
    feels_safe: "Yes",
    immediate_safety_concern: "No",
    dass_answers: {}, 
  });

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

    if (currentSection === 5) { 
       if (quizData.suicidal_thoughts === "Yes, and I feel at risk" || quizData.immediate_safety_concern === "Yes") {
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

    const interpretations = { 
        depression: interpret(d_score, "D"), 
        anxiety: interpret(a_score, "A"), 
        stress: interpret(s_score, "S") 
    };
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
      setResults({ matches: [] }); // Fallback
      setView("results");
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch(currentSection) {
      case 0:
        return (
          <VStack spacing={8} align="start">
              <Heading size="lg" color="teal.800" fontFamily="'Playfair Display', serif">A Space for Your Journey</Heading>
              <Text color="gray.600">This screening helps us pair you with a therapist who truly aligns with your needs, history, and life context. This takes about 10 minutes.</Text>
              <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100">
                 <Checkbox isChecked={quizData.consent} onChange={(e) => setQuizData({...quizData, consent: e.target.checked})}>
                   <Text fontSize="sm" fontWeight="600">I consent to sharing this information for therapist matching. I understand this is not an emergency psychiatric service.</Text>
                 </Checkbox>
              </Box>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel fontWeight="600">Age</FormLabel>
                <Input type="number" value={quizData.age} onChange={(e) => setQuizData({...quizData, age: e.target.value})} placeholder="e.g. 25" borderRadius="xl" />
             </FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="600">Gender Identity</FormLabel>
                <Select value={quizData.gender} onChange={(e) => setQuizData({...quizData, gender: e.target.value})} borderRadius="xl">
                   <option value="">Select Option</option>
                   {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
             </FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="600">Languages for Therapy</FormLabel>
                <Wrap spacing={2}>
                   {LANGUAGES.map(lang => (
                     <Tag 
                        key={lang} cursor="pointer" borderRadius="full" px={4} py={2}
                        variant={quizData.languages.includes(lang) ? "solid" : "outline"}
                        colorScheme="teal" onClick={() => {
                          const current = quizData.languages;
                          const updated = current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang];
                          setQuizData({...quizData, languages: updated});
                        }}
                     >{lang}</Tag>
                   ))}
                </Wrap>
             </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel fontWeight="600">Preferred Session Type</FormLabel>
                <RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({...quizData, session_type_pref: v})}>
                   <Stack direction="column" spacing={4}>
                      {SESSION_TYPES.map(s => <Radio key={s} value={s} colorScheme="teal">{s}</Radio>)}
                   </Stack>
                </RadioGroup>
             </FormControl>

             {quizData.session_type_pref === "In-person (Select Locations)" && (
                <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                   <FormControl isRequired mt={4}>
                      <FormLabel fontWeight="600">Which city are you in?</FormLabel>
                      <Select value={quizData.location_city} onChange={(e) => setQuizData({...quizData, location_city: e.target.value})} borderRadius="xl" placeholder="Select your city">
                         {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                      <Text fontSize="xs" color="gray.500" mt={2}>*Local therapists are currently limited. We will prioritize matching you with online specialists if in-person is unavailable in your city.</Text>
                   </FormControl>
                </MotionBox>
             )}

             <FormControl>
                <FormLabel fontWeight="600">Therapist Gender Preference</FormLabel>
                <RadioGroup value={quizData.therapist_gender_pref} onChange={(v) => setQuizData({...quizData, therapist_gender_pref: v})}>
                   <Stack direction="row" spacing={6}>
                      {THERAPIST_GENDER_PREF.map(g => <Radio key={g} value={g} colorScheme="teal">{g}</Radio>)}
                   </Stack>
                </RadioGroup>
             </FormControl>
             <FormControl>
                <FormLabel fontWeight="600">Religious / Spiritual Preference</FormLabel>
                <Select value={quizData.religion_pref} onChange={(e) => setQuizData({...quizData, religion_pref: e.target.value})} borderRadius="xl">
                   {RELIGION_PREF.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
             </FormControl>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={8} align="stretch">
              <FormControl isRequired>
                  <FormLabel fontWeight="bold">What brings you to MLC today? (Select all that apply)</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mt={4}>
                     {CONCERNS.map(c => (
                        <Checkbox key={c} isChecked={quizData.presenting_concerns.includes(c)} onChange={(e) => {
                           const current = quizData.presenting_concerns;
                           const updated = e.target.checked ? [...current, c] : current.filter(i => i !== c);
                           setQuizData({...quizData, presenting_concerns: updated});
                        }} colorScheme="teal">{c}</Checkbox>
                     ))}
                  </SimpleGrid>
              </FormControl>
              <Divider />
              <FormControl isRequired>
                  <FormLabel fontWeight="bold">Primary Clinical Focus</FormLabel>
                  <Select value={quizData.primary_concern} onChange={(e) => setQuizData({...quizData, primary_concern: e.target.value})} borderRadius="xl" placeholder="Select main concern">
                     {quizData.presenting_concerns.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
              </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel fontWeight="600">Have you been in therapy before?</FormLabel>
                <RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({...quizData, prior_therapy: v})}>
                   <Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack>
                </RadioGroup>
             </FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="600">Existing Clinical Diagnoses?</FormLabel>
                <RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({...quizData, has_diagnosis: v})}>
                   <Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack>
                </RadioGroup>
             </FormControl>
             {quizData.has_diagnosis === "Yes" && (
                <FormControl>
                   <FormLabel fontSize="sm" color="gray.500">Please provide details if comfortable</FormLabel>
                   <Input placeholder="e.g. Clinical Depression, ADHD, Gad" value={quizData.diagnosis_details} onChange={(e) => setQuizData({...quizData, diagnosis_details: e.target.value})} borderRadius="xl" />
                </FormControl>
             )}
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={8} align="stretch">
              <Alert status="error" borderRadius="xl" variant="subtle" py={4}>
                <AlertIcon /> <Text fontSize="sm" fontWeight="600">Your safety is our priority. If you are in crisis, please visit the emergency room immediately.</Text>
              </Alert>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Are you currently having thoughts of harming yourself?</FormLabel>
                <Select value={quizData.suicidal_thoughts} onChange={(e) => setQuizData({...quizData, suicidal_thoughts: e.target.value})} borderRadius="xl">
                   <option value="No">No</option>
                   <option value="Yes, but I don't feel at risk of acting">Yes, passive thoughts only</option>
                   <option value="Yes, and I feel at risk">Yes, and I feel at risk of acting</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Do you currently feel safe at home / in your environment?</FormLabel>
                <RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({...quizData, feels_safe: v})}>
                   <Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack>
                </RadioGroup>
             </FormControl>
          </VStack>
        );
      case 6:
        return (
          <VStack spacing={10} align="stretch">
              <Box>
                 <Heading size="md" color="teal.800" mb={2}>Clinical Screening (DASS-21)</Heading>
                 <Text fontSize="sm" color="gray.600" mb={4}>
                    Please select the most accurate response based on how much the statement applied to you over the past week:
                 </Text>
                 <VStack align="start" fontSize="xs" color="gray.500" spacing={1} bg="gray.50" p={4} borderRadius="xl">
                    <Text>• <b>Never:</b> Did not apply to me at all</Text>
                    <Text>• <b>Sometimes:</b> Applied to me to some degree, or some of the time</Text>
                    <Text>• <b>Often:</b> Applied to me to a considerable degree or a good part of time</Text>
                    <Text>• <b>Almost Always:</b> Applied to me very much or most of the time</Text>
                 </VStack>
              </Box>
              {DASS_ITEMS.map((item, idx) => (
                 <FormControl key={idx} p={6} borderBottom="1px solid" borderColor="gray.100">
                    <FormLabel fontSize="md" fontWeight="bold" mb={4}>{idx + 1}. {item}</FormLabel>
                    <RadioGroup 
                      value={quizData.dass_answers[idx]?.toString() || ""} 
                      onChange={(v) => setQuizData({...quizData, dass_answers: {...quizData.dass_answers, [idx]: parseInt(v)}})}
                    >
                       <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 8 }}>
                          {DASS_LABELS.map((label, score) => (
                            <Radio key={score} value={score.toString()} colorScheme="teal">
                               <Text fontSize="sm">{label}</Text>
                            </Radio>
                          ))}
                       </Stack>
                    </RadioGroup>
                 </FormControl>
              ))}
          </VStack>
        );
      case 7:
        return (
          <VStack spacing={10} align="center" textAlign="center" py={12}>
              <Box p={8} borderRadius="full" bg="teal.50" color="teal.500">
                 <Icon as={FiCheck} w={16} h={16} />
              </Box>
              <VStack spacing={4}>
                 <Heading size="lg">All set for matching!</Heading>
                 <Text color="gray.600" maxW="lg">Our algorithm will now analyze your clinical profile to find the most compatible specialists in our collective.</Text>
              </VStack>
              <Button size="xl" bg="teal.800" color="white" borderRadius="full" px={16} h={16} onClick={submitQuiz} isLoading={isLoading} _hover={{ bg: "teal.700", transform: "scale(1.02)" }}>Complete Screening</Button>
          </VStack>
        );
      default: return null;
    }
  };

  const renderResults = () => {
    const depression = finalInterpretations?.depression || "unknown";
    const anxiety = finalInterpretations?.anxiety || "unknown";
    const hasInPersonRequest = quizData.session_type_pref === "In-person (Select Locations)";
    
    return (
      <Container maxW="6xl" py={20}>
         <VStack spacing={12} align="stretch">
             {/* 🎖️ Clinical Feedback & Encouragement */}
             <Box p={10} bg="white" borderRadius="3rem" shadow="xl" border="1px solid" borderColor="teal.50">
                <VStack align="start" spacing={6} maxW="3xl">
                   <Badge bg="teal.50" color="teal.600" px={4} py={1} borderRadius="full">CLINICAL SUMMARY</Badge>
                   <Heading size="xl" color="teal.900" fontFamily="'Playfair Display', serif">Thank you for sharing your story.</Heading>
                   <Text fontSize="lg" color="gray.600" lineHeight="1.8">
                      It takes significant internal courage to vocalize these concerns. Your screening indicates **{depression.toLowerCase()}** levels of low mood and **{anxiety.toLowerCase()}** levels of worry. 
                      At MLC, we view these not just as symptoms, but as adaptive responses to your current life context.
                   </Text>
                   <HStack spacing={4}>
                      <Icon as={FiHeart} color="red.400" w={5} h={5} />
                      <Text fontWeight="600" color="gray.700">You are in a safe, professional environment.</Text>
                   </HStack>
                </VStack>
             </Box>

             {/* 📍 Location Fallback Messaging */}
             {hasInPersonRequest && (results?.matches?.length < 3 || !results?.matches?.some(t => t.is_local)) && (
                <Alert status="info" variant="subtle" borderRadius="2xl" py={6} bg="blue.50" borderColor="blue.100" border="1px solid">
                   <AlertIcon />
                   <Box flex={1}>
                      <AlertTitle>Availability in {quizData.location_city}</AlertTitle>
                      <AlertDescription>
                         We currently have limited in-person specialists in {quizData.location_city}. To ensure you receive care immediately, we have included our top-tier <b>Online Specialists</b> who specialize in {quizData.primary_concern} and are available to support you right away.
                      </AlertDescription>
                   </Box>
                </Alert>
             )}

             {/* 👤 Therapist Grid */}
             <VStack align="start" spacing={6}>
                <Heading size="lg" color="teal.900">Your Recommended Matches</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
                   {results?.matches?.map(t => <TherapistCard key={t.id} therapist={t} />)}
                </SimpleGrid>
                {(!results || !results.matches || results.matches.length === 0) && (
                   <VStack py={20} bg="gray.50" borderRadius="3xl" w="full" textAlign="center">
                      <Icon as={FiStar} w={10} h={10} color="gray.300" />
                      <Text color="gray.500">No immediate matches found for these specific criteria. Our intake team will review your application manually and contact you within 24 hours.</Text>
                   </VStack>
                )}
             </VStack>

             <VStack py={12} borderTop="1px solid" borderColor="gray.100" spacing={6}>
                <Text color="gray.500" fontSize="sm">Not sure who to choose? Book a consultation with our Intake Coordinator.</Text>
                <Button variant="outline" colorScheme="teal" borderRadius="full" px={8}>Book Intake Consultation</Button>
             </VStack>
         </VStack>
      </Container>
    );
  };

  if (view === "high_risk") {
     return (
        <Container maxW="4xl" py={20}>
           <VStack spacing={10} align="center" textAlign="center">
              <Icon as={FiMapPin} w={16} h={16} color="red.500" />
              <Heading color="red.800" size="2xl" fontFamily="'Playfair Display', serif">Immediate Support Recommended</Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl">Based on your screening, we recommend immediate support from an emergency or crisis-intervention service before beginning outpatient therapy.</Text>
              <Box p={10} bg="white" borderRadius="3rem" shadow="2xl" w="full" border="2px solid" borderColor="red.100">
                 <VStack align="start" spacing={6}>
                    <Heading size="md" color="red.700">24/7 Crisis Helplines (India)</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                       <VStack align="start" p={6} bg="red.50" borderRadius="2xl" w="full">
                          <Text fontWeight="800">Kiran Mental Health</Text>
                          <Text color="red.700" fontSize="lg">1800-599-0019</Text>
                       </VStack>
                       <VStack align="start" p={6} bg="red.50" borderRadius="2xl" w="full">
                          <Text fontWeight="800">Vandrevala Foundation</Text>
                          <Text color="red.700" fontSize="lg">1860-2662-345</Text>
                       </VStack>
                    </SimpleGrid>
                 </VStack>
              </Box>
              <Button as={NextLink} href="/" variant="link" color="gray.500">Return to Homepage</Button>
           </VStack>
        </Container>
     );
  }

  if (view === "results") return renderResults();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 10, md: 20 }}>
      <Container maxW={currentSection === 6 ? "4xl" : "3xl"}>
        <VStack spacing={8} align="stretch">
          <Box bg="white" p={{ base: 8, md: 12 }} borderRadius={{ base: "2rem", md: "3.5rem" }} shadow="2xl" border="1px solid" borderColor="gray.50">
             <VStack spacing={8} align="stretch">
                <Box>
                   <HStack justify="space-between" mb={3}>
                      <Text fontSize="xs" fontWeight="900" color="teal.600" textTransform="uppercase" letterSpacing="widest">Step {currentSection + 1} / {SECTIONS.length}</Text>
                      <Text fontSize="xs" fontWeight="900" color="gray.300">{Math.round(progress)}%</Text>
                   </HStack>
                   <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" bg="gray.50" />
                </Box>

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

                <HStack justify="space-between" pt={12}>
                  <Button 
                    variant="ghost" 
                    leftIcon={<FiArrowLeft />} 
                    onClick={prevStep} 
                    isDisabled={isLoading || currentSection === 0}
                    borderRadius="full"
                  >Back</Button>
                  
                  {currentSection < SECTIONS.length - 1 && (
                    <Button 
                      bg="teal.800" 
                      color="white" 
                      px={12} 
                      h={14}
                      borderRadius="full" 
                      rightIcon={<FiArrowRight />} 
                      onClick={nextStep} 
                      isDisabled={isLoading}
                      _hover={{ bg: "teal.900", transform: "translateY(-1px)" }}
                    >Continue</Button>
                  )}
                </HStack>
             </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
