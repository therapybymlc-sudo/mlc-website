'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, IconButton, Progress, Radio, RadioGroup, Checkbox, Stack, Input, Select, useToast, Divider, Icon, Tag, Wrap, Textarea, FormControl, FormLabel, Alert, AlertIcon, AlertTitle, AlertDescription,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiInfo } from "react-icons/fi";
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

const LANGUAGES = ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "Kannada", "Bengali"];
const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Transgender", "Prefer not to say"];
const SESSION_TYPES = ["Online Video (Individual)", "Couples Therapy", "In-person (Select Locations)"];
const THERAPIST_GENDER_PREF = ["Woman", "Man", "No preference"];
const RELIGION_PREF = ["Muslim", "Hindu", "Christian", "Spiritual (Non-religious)", "Secular / No preference"];

const CONCERNS = [
  "Anxiety (Generalized, Panic, Social)", "Depression & Low Mood", "Complex Trauma (CPTSD)", "Childhood Trauma",
  "Identity & Self-Esteem", "Relationships & Attachment", "Neurodivergence (ADHD/Autism)", "Workplace Burnout",
  "Grief & Loss", "Personality-related Difficulties", "Body Image", "Sleep Issues", "Addiction & Recovery"
];

const DASS_ITEMS = [
  "I found it hard to wind down",
  "I was aware of dryness of my mouth",
  "I could not seem to experience any positive feeling at all",
  "I experienced breathing difficulty",
  "I found it difficult to work up the initiative to do things",
  "I tended to over-react to situations",
  "I experienced trembling (e.g., in the hands)",
  "I felt that I was using a lot of nervous energy",
  "I was worried about situations in which I might panic",
  "I felt that I had nothing to look forward to",
  "I found myself getting agitated",
  "I found it difficult to relax",
  "I felt down-hearted and blue",
  "I was intolerant of anything that kept me from getting on with my work",
  "I felt I was close to panic",
  "I was unable to become enthusiastic about anything",
  "I felt I was not worth much as a person",
  "I felt that I was rather touchy",
  "I was aware of the action of my heart (unrelated to physical exertion)",
  "I felt scared without any good reason",
  "I felt that life was meaningless"
];

export default function DiscoveryClient() {
  const [view, setView] = useState("quiz"); // quiz, results, high_risk
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();

  const [quizData, setQuizData] = useState({
    consent: false,
    age: "",
    gender: "",
    location: "",
    languages: ["English"],
    session_type_pref: "",
    therapist_gender_pref: "No preference",
    religion_pref: "No preference",
    presenting_concerns: [],
    primary_concern: "",
    duration: "",
    prior_therapy: "",
    has_diagnosis: "",
    suicidal_thoughts: "No",
    feels_safe: "Yes",
    immediate_safety_concern: "No",
    dass_answers: {}, // { index: score 0-3 }
  });

  const progress = (currentSection / (SECTIONS.length - 1)) * 100;

  const nextStep = () => {
    // Branching & Safety
    if (currentSection === 0 && !quizData.consent) {
       toast({ title: "Consent required", description: "Please acknowledge the consent form to proceed.", status: "warning" });
       return;
    }
    
    if (currentSection === 5) { // Risk
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
    try {
      const res = await apiPost("therapists/match/", quizData);
      setResults(res);
      setView("results");
      window.scrollTo(0, 0);
    } catch (err) {
      toast({ title: "Matching failed", description: "Try again in a moment.", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch(currentSection) {
      case 0: // Consent
        return (
          <VStack spacing={8} align="start">
              <Heading size="lg" color="teal.800">Welcome to MLC Wellness</Heading>
              <Text color="gray.600">This screening takes about 10 minutes. Your responses help us identify the best therapist for your unique situation. This is not a formal diagnosis.</Text>
              <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100">
                 <Checkbox isChecked={quizData.consent} onChange={(e) => setQuizData({...quizData, consent: e.target.checked})}>
                   <Text fontSize="sm" fontWeight="bold">I understand that this screening is used for therapist matching purposes only and is not an emergency psychiatric service.</Text>
                 </Checkbox>
              </Box>
          </VStack>
        );
      case 1: // Basics
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel>How old are you?</FormLabel>
                <Input type="number" value={quizData.age} onChange={(e) => setQuizData({...quizData, age: e.target.value})} placeholder="Years" />
             </FormControl>
             <FormControl isRequired>
                <FormLabel>What is your gender identity?</FormLabel>
                <Select value={quizData.gender} onChange={(e) => setQuizData({...quizData, gender: e.target.value})}>
                   <option value="">Select Gender</option>
                   {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
             </FormControl>
             <FormControl isRequired>
                <FormLabel>Preferred Languages for Therapy</FormLabel>
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
      case 2: // Preferences
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel>Type of Therapy Needed</FormLabel>
                <RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({...quizData, session_type_pref: v})}>
                   <Stack direction="column" spacing={4}>
                      {SESSION_TYPES.map(s => <Radio key={s} value={s} colorScheme="teal">{s}</Radio>)}
                   </Stack>
                </RadioGroup>
             </FormControl>
             <FormControl>
                <FormLabel>Therapist Gender Preference</FormLabel>
                <RadioGroup value={quizData.therapist_gender_pref} onChange={(v) => setQuizData({...quizData, therapist_gender_pref: v})}>
                   <Stack direction="row" spacing={6}>
                      {THERAPIST_GENDER_PREF.map(g => <Radio key={g} value={g} colorScheme="teal">{g}</Radio>)}
                   </Stack>
                </RadioGroup>
             </FormControl>
             <FormControl>
                <FormLabel>Do you have a religious preference for your therapist?</FormLabel>
                <Select value={quizData.religion_pref} onChange={(e) => setQuizData({...quizData, religion_pref: e.target.value})}>
                   {RELIGION_PREF.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
             </FormControl>
          </VStack>
        );
      case 3: // Concerns
        return (
          <VStack spacing={8} align="stretch">
              <FormControl isRequired>
                  <FormLabel fontWeight="bold">What brings you here today? (Select all that apply)</FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={4}>This helps our matching algorithm filter specialists in these specific areas.</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                     {CONCERNS.map(c => (
                        <Checkbox key={c} isChecked={quizData.presenting_concerns.includes(c)} onChange={(e) => {
                           const current = quizData.presenting_concerns;
                           const updated = e.target.checked ? [...current, c] : current.filter(i => i !== c);
                           setQuizData({...quizData, presenting_concerns: updated});
                        }}>{c}</Checkbox>
                     ))}
                  </SimpleGrid>
              </FormControl>
              <Divider />
              <FormControl isRequired>
                  <FormLabel>Which of these is your *primary* concern right now?</FormLabel>
                  <Select value={quizData.primary_concern} onChange={(e) => setQuizData({...quizData, primary_concern: e.target.value})}>
                     <option value="">Select Primary Concern</option>
                     {quizData.presenting_concerns.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
              </FormControl>
          </VStack>
        );
      case 4: // Clinical History
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel>Have you ever been in therapy before?</FormLabel>
                <RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({...quizData, prior_therapy: v})}>
                   <Stack direction="row" spacing={8}>
                      <Radio value="Yes" colorScheme="teal">Yes</Radio>
                      <Radio value="No" colorScheme="teal">No</Radio>
                   </Stack>
                </RadioGroup>
             </FormControl>
             <FormControl isRequired>
                <FormLabel>Do you have any existing mental health diagnoses?</FormLabel>
                <RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({...quizData, has_diagnosis: v})}>
                   <Stack direction="row" spacing={8}>
                      <Radio value="Yes" colorScheme="teal">Yes</Radio>
                      <Radio value="No" colorScheme="teal">No</Radio>
                   </Stack>
                </RadioGroup>
             </FormControl>
             {quizData.has_diagnosis === "Yes" && (
                <FormControl>
                   <FormLabel fontSize="xs">Please specify if comfortable</FormLabel>
                   <Input placeholder="e.g. Major Depressive Disorder, ADHD" value={quizData.diagnosis_details} onChange={(e) => setQuizData({...quizData, diagnosis_details: e.target.value})} />
                </FormControl>
             )}
          </VStack>
        );
      case 5: // Risk
        return (
          <VStack spacing={8} align="stretch">
              <Alert status="info" borderRadius="xl">
                <AlertIcon /> <Text fontSize="xs">Clinical safety is our priority. Please answer these questions honestly so we can provide appropriate resources.</Text>
              </Alert>
              <FormControl isRequired>
                <FormLabel>Are you currently having thoughts of harming yourself?</FormLabel>
                <Select value={quizData.suicidal_thoughts} onChange={(e) => setQuizData({...quizData, suicidal_thoughts: e.target.value})}>
                   <option value="No">No</option>
                   <option value="Yes, but I don't feel at risk of acting">Yes, passive thoughts</option>
                   <option value="Yes, and I feel at risk">Yes, I feel at risk of acting</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Do you currently feel safe in your immediate environment?</FormLabel>
                <RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({...quizData, feels_safe: v})}>
                   <Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack>
                </RadioGroup>
              </FormControl>
          </VStack>
        );
      case 6: // Assessment (DASS-21)
        return (
          <VStack spacing={10} align="stretch">
              <Box mb={4}>
                 <Heading size="sm">DASS-21 Mood Screening</Heading>
                 <Text fontSize="xs" color="gray.500">Please select how much each statement applied to you over the past week.</Text>
                 <Text fontSize="xs" mt={2}>0: Did not apply | 3: Applied very much / most of time</Text>
              </Box>
              {DASS_ITEMS.slice(0, 10).map((item, idx) => (
                 <FormControl key={idx}>
                    <FormLabel fontSize="sm" fontWeight="bold">{item}</FormLabel>
                    <RadioGroup 
                      value={quizData.dass_answers[idx]?.toString() || ""} 
                      onChange={(v) => setQuizData({...quizData, dass_answers: {...quizData.dass_answers, [idx]: parseInt(v)}})}
                    >
                       <HStack spacing={6}>
                          {[0, 1, 2, 3].map(score => <Radio key={score} value={score.toString()} colorScheme="teal">{score}</Radio>)}
                       </HStack>
                    </RadioGroup>
                 </FormControl>
              ))}
          </VStack>
        );
      case 7: // Finalize
        return (
          <VStack spacing={10} align="center" textAlign="center" py={10}>
              <Icon as={FiInfo} w={12} h={12} color="teal.500" />
              <Heading size="lg">Ready to find your match?</Heading>
              <Text color="gray.600">Our algorithm is ready to process your screening results and suggest the top 3 specialists suited to your clinical profile.</Text>
              <Button size="lg" bg="teal.800" color="white" borderRadius="full" px={16} onClick={submitQuiz} isLoading={isLoading}>Submit Screening</Button>
          </VStack>
        );
      default:
        return null;
    }
  };

  if (view === "high_risk") {
     return (
        <Container maxW="4xl" py={20}>
           <VStack spacing={10} align="center" textAlign="center">
              <Icon as={FiAlertCircle} w={16} h={16} color="red.500" />
              <Heading color="red.700">Immediate Support Recommended</Heading>
              <Text fontSize="lg">Based on your shared safety concerns, we recommend seeking immediate clinical or emergency support before beginning standard online therapy.</Text>
              <Box p={8} bg="red.50" borderRadius="3xl" w="full" border="1px solid" borderColor="red.100">
                 <Heading size="sm" mb={4}>Emergency Resources (India)</Heading>
                 <VStack align="start" spacing={2}>
                    <Text><b>KIRAN helpline:</b> 1800-599-0019</Text>
                    <Text><b>Vandrevala Foundation:</b> 1860-2662-345</Text>
                    <Text><b>iCall (TISS):</b> 9152987821</Text>
                 </VStack>
              </Box>
              <Button as={NextLink} href="/" variant="link">Return to Home</Button>
           </VStack>
        </Container>
     );
  }

  if (view === "results") {
      return (
        <Container maxW="6xl" py={20}>
           <VStack spacing={12} align="stretch">
               <Box>
                  <Heading size="xl" color="teal.800">Your Recommended Specialists</Heading>
                  <Text mt={2} color="gray.600">Based on your specific clinical profile and preferences.</Text>
               </Box>
               <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                  {results?.matches?.map(t => <TherapistCard key={t.id} therapist={t} />)}
               </SimpleGrid>
               {!results?.matches?.length && (
                  <VStack py={20} bg="gray.50" borderRadius="3xl">
                     <Text color="gray.500">No immediate matches found. Our intake team will review your profile manually.</Text>
                  </VStack>
               )}
           </VStack>
        </Container>
      );
  }

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 10, md: 20 }}>
      <Container maxW="3xl">
        <VStack spacing={8} align="stretch">
          <Box bg="white" p={{ base: 8, md: 12 }} borderRadius="3rem" shadow="xl" border="1px solid" borderColor="gray.100">
             <VStack spacing={8} align="stretch">
                <Box>
                   <HStack justify="space-between" mb={2}>
                      <Text fontSize="xs" fontWeight="800" color="teal.600" textTransform="uppercase">Step {currentSection + 1} / {SECTIONS.length}</Text>
                      <Text fontSize="xs" fontWeight="800" color="gray.400">{Math.round(progress)}%</Text>
                   </HStack>
                   <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" />
                </Box>

                <AnimatePresence mode="wait">
                   <MotionBox
                     key={currentSection}
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     transition={{ duration: 0.3 }}
                   >
                     {renderSection()}
                   </MotionBox>
                </AnimatePresence>

                <HStack justify="space-between" pt={10}>
                  {currentSection > 0 ? (
                    <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={prevStep} isDisabled={isLoading}>Back</Button>
                  ) : <Box />}
                  {currentSection < SECTIONS.length - 1 && (
                    <Button bg="teal.800" color="white" px={10} borderRadius="full" rightIcon={<FiArrowRight />} onClick={nextStep} isDisabled={isLoading}>Continue</Button>
                  )}
                </HStack>
             </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
