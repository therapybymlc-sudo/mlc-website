'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, IconButton, Progress, Radio, RadioGroup, Checkbox, Stack, Input, Select, useToast, Divider, Icon, Tag, Wrap, Textarea, FormControl, FormLabel, Alert, AlertIcon, AlertTitle, AlertDescription, Badge, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiInfo, FiMapPin, FiHeart, FiStar, FiUser, FiActivity, FiShield, FiBriefcase, FiMail, FiPhone } from "react-icons/fi";
import { apiPost } from "../../../api.js";
import TherapistCard from "../../../components/TherapistCard";
import { useAuth } from "../../../context/AuthContext";
import NextLink from "next/link";

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

const LANGUAGES = ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "Kannada", "Bengali", "Marathi", "Punjabi", "Gujarati", "French", "Spanish"];
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
    location: { country: "India", city: "", timezone: "" },
    languages: ["English"],
    session_type_pref: "No preference",
    therapist_gender_pref: "No preference",
    religion_pref: "Secular / No preference",
    therapy_style_pref: "Balanced",
    urgency: "Within the next week",
    
    presenting_concerns: [],
    // New Dropdown-based Identity Fields
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
    
    email: user?.email || "",
    phone: "",
    whatsapp_marketing_consent: false,
    email_marketing_consent: false,
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

  const renderSection = () => {
    switch(currentSection) {
      case 0:
        return (
          <VStack spacing={10} align="center" textAlign="center" py={6}>
              <Icon as={FiShield} w={12} h={12} color="teal.500" />
              <VStack spacing={4}>
                 <Heading size="xl" color="teal.800" fontFamily="'Playfair Display', serif">Privacy & Purpose</Heading>
                 <Text color="gray.600" fontSize="lg" maxW="lg">We prioritize clinical compatibility. Your responses are stored securely and used only to pair you with the best specialist for your needs.</Text>
                 <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100" mt={4}>
                    <Checkbox isChecked={quizData.consent} onChange={(e) => setQuizData({...quizData, consent: e.target.checked})}>
                      <Text fontSize="sm" fontWeight="600">I consent to this screening and understand it is for therapist matching, not emergency intervention.</Text>
                    </Checkbox>
                 </Box>
              </VStack>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={8} align="stretch">
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired><FormLabel fontWeight="600">Age</FormLabel><Input type="number" value={quizData.age} onChange={(e) => setQuizData({...quizData, age: e.target.value})} borderRadius="xl" /></FormControl>
                <FormControl isRequired><FormLabel fontWeight="600">Gender</FormLabel><Select value={quizData.gender} onChange={(e) => setQuizData({...quizData, gender: e.target.value})} borderRadius="xl"><option value="">Select</option>{GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}</Select></FormControl>
             </SimpleGrid>
             <FormControl isRequired><FormLabel fontWeight="600">Location (Country)</FormLabel><Input value={quizData.location.country} onChange={(e) => setQuizData({...quizData, location: {...quizData.location, country: e.target.value}})} borderRadius="xl" /></FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="600">Languages for Therapy</FormLabel>
                <Wrap spacing={2}>
                   {LANGUAGES.map(lang => (
                     <Tag key={lang} cursor="pointer" borderRadius="full" px={4} py={2} variant={quizData.languages.includes(lang) ? "solid" : "outline"} colorScheme="teal" onClick={() => {
                          const current = quizData.languages;
                          setQuizData({...quizData, languages: current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang]});
                        }}>{lang}</Tag>
                   ))}
                </Wrap>
             </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} align="stretch">
              <Box><Heading size="md" color="teal.800" mb={2}>Life Context & Identity</Heading><Text fontSize="sm" color="gray.600">Tell us about any specific factors defining your identity or life stage.</Text></Box>
              <VStack spacing={6} align="stretch">
                 <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="teal.600">LIFE STAGE / ROLES</FormLabel>
                    <Select placeholder="Select your current phase" borderRadius="xl" value={quizData.life_stage_context} onChange={(e) => setQuizData({...quizData, life_stage_context: e.target.value})}>
                       {IDENTITY_OPTIONS.lifeStage.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                 </FormControl>
                 <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="teal.600">CULTURAL / SOCIAL CONTEXT</FormLabel>
                    <Select placeholder="Select cultural context" borderRadius="xl" value={quizData.cultural_social_context} onChange={(e) => setQuizData({...quizData, cultural_social_context: e.target.value})}>
                       {IDENTITY_OPTIONS.cultural.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                 </FormControl>
                 <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="teal.600">IDENTITY / LIVED EXPERIENCE</FormLabel>
                    <Select placeholder="Select lived experience" borderRadius="xl" value={quizData.identity_lived_experience} onChange={(e) => setQuizData({...quizData, identity_lived_experience: e.target.value})}>
                       {IDENTITY_OPTIONS.livedExperience.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                 </FormControl>
                 <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm" color="teal.600">OTHER CONTEXTS</FormLabel>
                    <Textarea placeholder="Feel free to share any other identity or life details here..." borderRadius="xl" value={quizData.other_identity_details} onChange={(e) => setQuizData({...quizData, other_identity_details: e.target.value})} />
                 </FormControl>
              </VStack>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired><FormLabel fontWeight="600">Session Type</FormLabel><RadioGroup value={quizData.session_type_pref} onChange={(v) => setQuizData({...quizData, session_type_pref: v})}><Stack spacing={3}>{SESSION_TYPES.map(s => <Radio key={s} value={s} colorScheme="teal">{s}</Radio>)}</Stack></RadioGroup></FormControl>
             {quizData.session_type_pref === "In-person (Select Locations)" && (
                <FormControl isRequired><FormLabel fontWeight="600">City</FormLabel><Select value={quizData.location_city} onChange={(e) => setQuizData({...quizData, location_city: e.target.value})} borderRadius="xl" placeholder="Select city">{MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</Select></FormControl>
             )}
             <FormControl><FormLabel fontWeight="600">Therapist Style Preference</FormLabel><RadioGroup value={quizData.therapy_style_pref} onChange={(v) => setQuizData({...quizData, therapy_style_pref: v})}><Stack direction="row" spacing={6}><Radio value="Structured" colorScheme="teal">Structured</Radio><Radio value="Reflective" colorScheme="teal">Reflective</Radio><Radio value="Balanced" colorScheme="teal">Balanced</Radio></Stack></RadioGroup></FormControl>
             <FormControl><FormLabel fontWeight="600">How soon do you want to start?</FormLabel><RadioGroup value={quizData.urgency} onChange={(v) => setQuizData({...quizData, urgency: v})}><Stack direction="column" spacing={2}><Radio value="ASAP" colorScheme="teal">As soon as possible</Radio><Radio value="1-2 weeks" colorScheme="teal">Within 1-2 weeks</Radio><Radio value="Exploring" colorScheme="teal">Just exploring</Radio></Stack></RadioGroup></FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={8} align="stretch">
              <FormControl isRequired><FormLabel fontWeight="bold">Areas of Support Needed (Multiple Choice)</FormLabel><SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>{CONCERNS.map(c => (<Checkbox key={c} isChecked={quizData.presenting_concerns.includes(c)} onChange={(e) => { const current = quizData.presenting_concerns; setQuizData({...quizData, presenting_concerns: e.target.checked ? [...current, c] : current.filter(i => i !== c)}); }} colorScheme="teal">{c}</Checkbox>))}</SimpleGrid></FormControl>
              <Divider />
              <FormControl isRequired><FormLabel fontWeight="bold">Primary Clinical Concern</FormLabel><Select value={quizData.primary_concern} onChange={(e) => setQuizData({...quizData, primary_concern: e.target.value})} borderRadius="xl" placeholder="Select primary">{quizData.presenting_concerns.map(c => <option key={c} value={c}>{c}</option>)}</Select></FormControl>
              <SimpleGrid columns={2} spacing={6}>
                 <FormControl><FormLabel fontSize="sm">Duration</FormLabel><Select value={quizData.duration} onChange={(e) => setQuizData({...quizData, duration: e.target.value})} borderRadius="xl"><option value="< 1 month">Less than 1 month</option><option value="1-6 months">1-6 months</option><option value="6+ months">Over 6 months</option><option value="Years">Years (on/off)</option></Select></FormControl>
                 <FormControl><FormLabel fontSize="sm">Daily Impact</FormLabel><Select value={quizData.impairment_level} onChange={(e) => setQuizData({...quizData, impairment_level: e.target.value})} borderRadius="xl"><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Significant">Significant</option><option value="Severe">Severe</option></Select></FormControl>
              </SimpleGrid>
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired><FormLabel fontWeight="600">Previous Therapy?</FormLabel><RadioGroup value={quizData.prior_therapy} onChange={(v) => setQuizData({...quizData, prior_therapy: v})}><Stack spacing={2}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
             <FormControl isRequired><FormLabel fontWeight="600">Seeing a Psychiatrist / On Medication?</FormLabel><RadioGroup value={quizData.on_medication} onChange={(v) => setQuizData({...quizData, on_medication: v})}><Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
             <FormControl isRequired><FormLabel fontWeight="600">Existing Diagnosis?</FormLabel><RadioGroup value={quizData.has_diagnosis} onChange={(v) => setQuizData({...quizData, has_diagnosis: v})}><Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
             <FormControl><FormLabel fontWeight="600">Physical Health Concerns?</FormLabel><RadioGroup value={quizData.health_factors} onChange={(v) => setQuizData({...quizData, health_factors: v})}><Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
             {quizData.health_factors === "Yes" && <Textarea placeholder="Details..." value={quizData.health_factors_details} onChange={(e) => setQuizData({...quizData, health_factors_details: e.target.value})} />}
          </VStack>
        );
      case 6:
        return (
          <VStack spacing={10} align="stretch">
             <FormControl isRequired><FormLabel fontWeight="600">Sleep Quality</FormLabel><RadioGroup value={quizData.sleep_quality} onChange={(v) => setQuizData({...quizData, sleep_quality: v})}><Stack spacing={2}><Radio value="Good" colorScheme="teal">Steady</Radio><Radio value="Troubled" colorScheme="teal">Interrupted / Troubled</Radio><Radio value="Poor" colorScheme="teal">Significant Lack of Sleep</Radio></Stack></RadioGroup></FormControl>
             <FormControl isRequired><FormLabel fontWeight="600">Energy Levels</FormLabel><RadioGroup value={quizData.energy_level} onChange={(v) => setQuizData({...quizData, energy_level: v})}><Stack spacing={2}><Radio value="Steady" colorScheme="teal">Steady</Radio><Radio value="Low" colorScheme="teal">Low Energy</Radio><Radio value="Fluctuating" colorScheme="teal">Wide fluctuations</Radio></Stack></RadioGroup></FormControl>
             <FormControl isRequired><FormLabel fontWeight="600">Appetite Changes</FormLabel><RadioGroup value={quizData.appetite_level} onChange={(v) => setQuizData({...quizData, appetite_level: v})}><Stack direction="row" spacing={6}><Radio value="Normal" colorScheme="teal">No Change</Radio><Radio value="Increased" colorScheme="teal">Increased</Radio><Radio value="Decreased" colorScheme="teal">Decreased</Radio></Stack></RadioGroup></FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="600">Social Support (Who can you talk to?)</FormLabel>
                <Wrap spacing={2}>
                   {["Family", "Friends", "Partner", "Work Colleagues", "No one currently"].map(s => (
                      <Tag key={s} cursor="pointer" borderRadius="full" px={4} py={2} variant={quizData.support_sources.includes(s) ? "solid" : "outline"} colorScheme="teal" onClick={() => {
                         const current = quizData.support_sources;
                         setQuizData({...quizData, support_sources: current.includes(s) ? current.filter(x => x !== s) : [...current, s]});
                      }}>{s}</Tag>
                   ))}
                </Wrap>
             </FormControl>
          </VStack>
        );
      case 7:
        return (
          <VStack spacing={8} align="stretch">
              <Alert status="error" borderRadius="xl" bg="red.50" color="red.800" border="1px solid" borderColor="red.100">
                <AlertIcon />
                <Box>
                   <AlertTitle>Safety Notice</AlertTitle>
                   <AlertDescription fontSize="sm" lineHeight="tall">
                      MLC does not currently have emergency services. In case of emergencies please visit your nearest Hospital's emergency unit or Contact your countries national helplines for support. We hope that we can soon build our emergency services to provide more individuals the support they need during times of crisis.
                   </AlertDescription>
                </Box>
              </Alert>
              <FormControl isRequired><FormLabel fontWeight="600">Thoughts of self-harm?</FormLabel><Select value={quizData.suicidal_thoughts} onChange={(e) => setQuizData({...quizData, suicidal_thoughts: e.target.value})} borderRadius="xl"><option value="No">No</option><option value="Passive">Passive thoughts</option><option value="Active">Active / I feel at risk</option></Select></FormControl>
              <FormControl isRequired><FormLabel fontWeight="600">Past history of self-harm?</FormLabel><RadioGroup value={quizData.past_self_harm} onChange={(v) => setQuizData({...quizData, past_self_harm: v})}><Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
              <FormControl isRequired><FormLabel fontWeight="600">Safe in your current environment?</FormLabel><RadioGroup value={quizData.feels_safe} onChange={(v) => setQuizData({...quizData, feels_safe: v})}><Stack direction="row" spacing={8}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></Stack></RadioGroup></FormControl>
          </VStack>
        );
      case 8:
        return (
          <VStack spacing={10} align="stretch">
              <Box>
                 <Heading size="md" color="teal.800" mb={4}>Mood Screening (DASS-21)</Heading>
                 <Text fontSize="sm" color="gray.600" mb={4}>Please select the most accurate response based on the past week:</Text>
                 <VStack align="start" fontSize="xs" color="gray.500" spacing={1} bg="gray.50" p={4} borderRadius="xl">
                    <Text>• <b>Never:</b> Did not apply to me at all</Text>
                    <Text>• <b>Sometimes:</b> Applied to some degree / some time</Text>
                    <Text>• <b>Often:</b> Applied considerably / good part of time</Text>
                    <Text>• <b>Almost Always:</b> Applied very much / most time</Text>
                 </VStack>
              </Box>
              {DASS_ITEMS.map((item, idx) => (
                 <FormControl key={idx} p={6} borderBottom="1px solid" borderColor="gray.100">
                    <FormLabel fontSize="md" fontWeight="bold" mb={4}>{idx + 1}. {item}</FormLabel>
                    <RadioGroup 
                      value={quizData.dass_answers[idx]?.toString() || ""} 
                      onChange={(v) => setQuizData({...quizData, dass_answers: {...quizData.dass_answers, [idx]: parseInt(v)}})}
                    >
                       <Stack direction={{ base: "column", md: "row" }} spacing={8}>{DASS_LABELS.map((label, score) => (<Radio key={score} value={score.toString()} colorScheme="teal"><Text fontSize="sm">{label}</Text></Radio>))}</Stack>
                    </RadioGroup>
                 </FormControl>
              ))}
          </VStack>
        );
      case 9:
        return (
          <VStack spacing={10} align="stretch" py={6}>
              <Box textAlign="center">
                 <Icon as={FiCheck} w={12} h={12} color="teal.500" mb={4}/>
                 <Heading size="lg">One Final Step</Heading>
                 <Text color="gray.600">Please provide your contact details so we can save your results and send you matches.</Text>
              </Box>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                 <FormControl isRequired>
                    <FormLabel fontWeight="600">Email Address</FormLabel>
                    <InputGroup>
                       <Input value={quizData.email} onChange={(e) => setQuizData({...quizData, email: e.target.value})} borderRadius="xl" placeholder="example@email.com" />
                    </InputGroup>
                 </FormControl>
                 <FormControl isRequired>
                    <FormLabel fontWeight="600">Phone Number (WhatsApp)</FormLabel>
                    <Input value={quizData.phone} onChange={(e) => setQuizData({...quizData, phone: e.target.value})} borderRadius="xl" placeholder="+91 00000 00000" />
                 </FormControl>
              </SimpleGrid>

              <VStack align="stretch" spacing={4} bg="teal.50" p={6} borderRadius="2xl">
                 <Checkbox isChecked={quizData.whatsapp_marketing_consent} onChange={(e) => setQuizData({...quizData, whatsapp_marketing_consent: e.target.checked})}>
                    <Text fontSize="sm">I'd like to receive mental health resources and updates via <b>WhatsApp</b>.</Text>
                 </Checkbox>
                 <Checkbox isChecked={quizData.email_marketing_consent} onChange={(e) => setQuizData({...quizData, email_marketing_consent: e.target.checked})}>
                    <Text fontSize="sm">I'd like to receive mental health resources and updates via <b>Email</b>.</Text>
                 </Checkbox>
              </VStack>

              <Button size="xl" bg="teal.800" color="white" borderRadius="full" px={16} h={16} onClick={submitQuiz} isLoading={isLoading}>View Recommendations</Button>
          </VStack>
        );
      default: return null;
    }
  };

  const renderResults = () => {
    const d = finalInterpretations?.depression || "Normal";
    const a = finalInterpretations?.anxiety || "Normal";
    const s = finalInterpretations?.stress || "Normal";
    
    return (
      <Container maxW="6xl" py={20}>
         <VStack spacing={12} align="stretch">
             {/* 🎖️ Clinical Feedback & Encouragement */}
             <Box p={10} bg="white" borderRadius="3rem" shadow="xl" border="1px solid" borderColor="teal.50">
                <VStack align="start" spacing={6} maxW="4xl">
                   <Badge bg="teal.50" color="teal.600" px={4} py={1} borderRadius="full">CLINICAL SUMMARY</Badge>
                   <Heading size="xl" color="teal.900" fontFamily="'Playfair Display', serif">Thank you for sharing your story.</Heading>
                   <Text fontSize="lg" color="gray.600" lineHeight="1.8">
                      It takes significant internal courage to vocalize these concerns. Your screening indicates{' '}
                      <Box as="span" fontWeight="800" color="teal.700">{d.toLowerCase()}</Box> levels of low mood,{' '}
                      <Box as="span" fontWeight="800" color="teal.700">{a.toLowerCase()}</Box> levels of worry, and{' '}
                      <Box as="span" fontWeight="800" color="teal.700">{s.toLowerCase()}</Box> levels of stress.
                   </Text>
                   <Text fontSize="md" color="gray.600" lineHeight="1.7">
                      At MLC, we view these not just as symptoms, but as <b>early markers of distress</b> that can affect our lives significantly. If left unaddressed, these feelings can grow over time to overwhelm different areas of our lives—from our relationships to our career and internal peace.
                   </Text>
                   <Text fontSize="md" color="gray.600" lineHeight="1.7">
                      Therapy offers a structured path to tackle these challenges on time. By developing the right tools and gaining deeper self-awareness, you can navigate these seasons with greater resilience before they become overwhelming.
                   </Text>
                   <HStack spacing={4} pt={2}>
                      <Icon as={FiHeart} color="red.400" w={5} h={5} />
                      <Text fontWeight="700" color="teal.800">At MLC, we strictly vet every clinician in our collective to ensure the highest quality of therapy that is deeply tailored to your specific needs.</Text>
                   </HStack>
                </VStack>
             </Box>

             <VStack align="start" spacing={6}>
                <Heading size="lg" color="teal.900">Your Recommended Specialists</Heading>
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
                <Button as={NextLink} href="/book-now" bg="teal.800" color="white" borderRadius="full" px={10} h={14} _hover={{ bg: "teal.900" }}>Book Intake Consultation</Button>
             </VStack>
         </VStack>
      </Container>
    );
  };

  if (view === "high_risk") return <Box py={20} textAlign="center"><Heading>Immediate Support Recommended</Heading><Text mt={4}>Please contact your countries national helplines or nearest hospital ER.</Text></Box>;
  if (view === "results") return renderResults();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={20}>
      <Container maxW={{ base: "xl", md: currentSection > 7 ? "4xl" : "3xl" }}>
        <VStack spacing={8} align="stretch">
          <Box bg="white" p={{ base: 8, md: 12 }} borderRadius="3rem" shadow="2xl" border="1px solid" borderColor="gray.50">
             <VStack spacing={8} align="stretch">
                <Box><HStack justify="space-between" mb={3}><Text fontSize="xs" fontWeight="900" color="teal.600">STEP {currentSection + 1} / {SECTIONS.length}</Text><Text fontSize="xs" fontWeight="900" color="gray.300">{Math.round(progress)}%</Text></HStack><Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" /></Box>
                <AnimatePresence mode="wait"><MotionBox key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>{renderSection()}</MotionBox></AnimatePresence>
                <HStack justify="space-between" pt={12}>
                  <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={prevStep} isDisabled={currentSection === 0}>Back</Button>
                  {currentSection < SECTIONS.length - 1 && <Button bg="teal.800" color="white" px={12} borderRadius="full" rightIcon={<FiArrowRight />} onClick={nextStep}>Continue</Button>}
                </HStack>
             </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
