'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Progress,
  Radio, RadioGroup, Stack, Input, Select, useToast, Icon,
  Textarea, FormControl, FormLabel, Badge, Center, Image, Flex,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield, FiBriefcase, FiAward, FiBookOpen, FiActivity, FiUsers, FiStar
} from "react-icons/fi";
import { apiPost } from "../../../api.js";
import NextLink from "next/link";
import { useUser } from "@clerk/nextjs";

const MotionBox = motion(Box);

const SECTIONS = [
  "Privacy",
  "Professional Context",
  "Clinical Mastery",
  "Supervisory Goals",
  "Preferences",
  "Finalize"
];

const MODALITIES = [
  "CBT (Cognitive Behavioral Therapy)", "Psychodynamic / Psychoanalytic", "Integrative Therapy", 
  "Humanistic / Person-Centered", "Systemic / Family Therapy", "DBT", "ACT", "EMDR / Trauma-Focused",
  "Gestalt", "Somatic Experiencing", "Existential Therapy", "Eclectic"
];

const WORK_CONTEXTS = [
  "Private Practice (Solo)", "Group Practice", "Hospital / Mental Health Centre", 
  "Corporate EAP", "Academic / University Setting", "Public Health / NGO", "Other"
];

export default function SupervisionDiscoveryClient() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("quiz"); // quiz, success
  const toast = useToast();
  const { user: clerkUser } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const [formData, setFormData] = useState({
    consent: false,
    years_licensed: "",
    current_context: "",
    primary_modality: "",
    other_modalities: [],
    focus_areas: "", // e.g. "Trauma, Grief, Personality Disorders"
    
    supervision_format_pref: "1:1 Sessions", // "1:1 Sessions", "Peer Cohorts", "Specialized Labs"
    supervision_reason: "", // "Licensing", "Clinical Growth", "Case Review", "Burnout Support"
    
    supervisor_seniority_pref: "10+ Years",
    frequency_pref: "Weekly",
    
    additional_notes: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      setFormData(prev => ({ ...prev, email: clerkUser.primaryEmailAddress.emailAddress }));
    }
  }, [clerkUser]);

  const nextStep = () => {
    if (currentSection === 0 && !formData.consent) {
      toast({ title: "Consent required", description: "Please acknowledge the clinical professional consent.", status: "warning" });
      return;
    }
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  const submitForm = async () => {
    setIsLoading(true);
    try {
      // Logic for supervisory matching
      const payload = {
        ...formData,
        role: 'supervisee_prospect',
        discovery_type: 'supervision'
      };
      await apiPost("therapists/match/", payload);
      setView("success");
    } catch (err) {
      toast({ title: "Submission Error", description: "We encountered a clinical link error. Please try again.", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (view === "success") {
    return (
      <Box p={4} bg="#FDFBFA" minH="100vh">
        <Container maxW="2xl" pt={24} pb={40}>
           <VStack spacing={8} bg="white" p={12} borderRadius="3xl" shadow="2xl" textAlign="center" border="1px solid" borderColor="teal.50">
              <Circle size="100px" bg="teal.50" color="teal.500"><Icon as={FiCheck} w={12} h={12} /></Circle>
              <VStack spacing={4}>
                 <Heading size="xl" fontFamily="'Playfair Display', serif" color="teal.900">Application Received</Heading>
                 <Text color="gray.600" fontSize="lg">Your professional clinical profile has been logged in our supervisory suite. A senior mentor will review your mastery requirements and reach out to align your growth path.</Text>
              </VStack>
              <Button as={NextLink} href="/dashboard" bg="teal.800" color="white" px={10} borderRadius="full" height="60px" _hover={{ bg: 'teal.900' }}>Enter Dashboard</Button>
           </VStack>
        </Container>
      </Box>
    );
  }

  const progress = (currentSection / (SECTIONS.length - 1)) * 100;

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <VStack spacing={10} align="center" textAlign="center" py={6}>
            <Icon as={FiAward} w={16} h={16} color="teal.600" />
            <VStack spacing={4}>
              <Heading size="xl" color="teal.800" fontFamily="'Playfair Display', serif">Supervisory Stewardship</Heading>
              <Text color="gray.600" fontSize="lg" maxW="lg">
                Mentorship at MLC is designed for the holistic evolution of your therapeutic identity. 
                Your clinical context helps us match you with a supervisor whose seniority and modality orientation 
                aligns with your growth journey.
              </Text>
              <Box p={8} bg="teal.50" borderRadius="3xl" border="1px solid" borderColor="teal.100" mt={6}>
                <HStack align="start" spacing={4}>
                  <Radio isChecked={formData.consent} onClick={() => setFormData({...formData, consent: !formData.consent})} />
                  <Text fontSize="sm" fontWeight="600" textAlign="left" color="teal.900">
                    I consent to sharing my clinical background and professional goals for the purpose of supervisory matching within the MLC ecosystem.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={8} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="700">Years of Clinical Experience (Licensed)</FormLabel>
              <Input type="number" placeholder="e.g., 5" value={formData.years_licensed} onChange={(e) => setFormData({...formData, years_licensed: e.target.value})} borderRadius="xl" size="lg" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="700">Current Work Context</FormLabel>
              <Select value={formData.current_context} onChange={(e) => setFormData({...formData, current_context: e.target.value})} borderRadius="xl" size="lg">
                <option value="">Select context</option>
                {WORK_CONTEXTS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
                <FormLabel fontWeight="700">Modality / Theoretical Orientation</FormLabel>
                <Select value={formData.primary_modality} onChange={(e) => setFormData({...formData, primary_modality: e.target.value})} borderRadius="xl" size="lg">
                    <option value="">Select primary modality</option>
                    {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
            </FormControl>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="700">Clinical Focus Areas</FormLabel>
              <Textarea placeholder="e.g., Trauma recovery, Couples therapy, Adolescent anxiety..." value={formData.focus_areas} onChange={(e) => setFormData({...formData, focus_areas: e.target.value})} borderRadius="xl" h="150px" />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="700">Other Training & Certifications</FormLabel>
              <Textarea placeholder="List significant certifications or advanced clinical training..." value={formData.other_training} onChange={(e) => setFormData({...formData, other_training: e.target.value})} borderRadius="xl" />
            </FormControl>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={8} align="stretch">
            <FormControl isRequired>
               <FormLabel fontWeight="700">Supervisory Need & Reason</FormLabel>
               <Box p={6} bg="gray.50" borderRadius="2rem">
                  <RadioGroup value={formData.supervision_reason} onChange={(v) => setFormData({...formData, supervision_reason: v})}>
                    <VStack align="start" spacing={4}>
                       {["Clinical Growth (Skills/Identity)", "Licensing/Certification Requirement", "Case-by-Case Review", "Support for High-Burnout Context"].map(r => (
                         <Radio key={r} value={r} colorScheme="teal" size="lg">{r}</Radio>
                       ))}
                    </VStack>
                  </RadioGroup>
               </Box>
            </FormControl>
            <FormControl isRequired>
               <FormLabel fontWeight="700">Preferred Format</FormLabel>
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {[
                    { val: "1:1 Sessions", icon: FiUser },
                    { val: "Peer Cohorts", icon: FiUsers },
                    { val: "Growth Labs", icon: FiStar }
                  ].map(f => (
                    <VStack 
                      key={f.val} 
                      p={6} bg={formData.supervision_format_pref === f.val ? "teal.50" : "white"} 
                      border="1px solid" borderColor={formData.supervision_format_pref === f.val ? "teal.200" : "gray.100"}
                      borderRadius="2xl" cursor="pointer" onClick={() => setFormData({...formData, supervision_format_pref: f.val})}
                      _hover={{ bg: 'teal.50' }}
                    >
                       <Icon as={f.icon} boxSize={6} color={formData.supervision_format_pref === f.val ? "teal.500" : "gray.400"} />
                       <Text fontSize="xs" fontWeight="800" color="teal.900">{f.val}</Text>
                    </VStack>
                  ))}
               </SimpleGrid>
            </FormControl>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={8} align="stretch">
             <FormControl isRequired>
                <FormLabel fontWeight="700">Preferred Frequency</FormLabel>
                <Select value={formData.frequency_pref} onChange={(e) => setFormData({...formData, frequency_pref: e.target.value})} borderRadius="xl" size="lg">
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="As-needed">As-needed / Ad-hoc</option>
                </Select>
             </FormControl>
             <FormControl isRequired>
                <FormLabel fontWeight="700">Supervisor Experience Level Requirement</FormLabel>
                <Select value={formData.supervisor_seniority_pref} onChange={(e) => setFormData({...formData, supervisor_seniority_pref: e.target.value})} borderRadius="xl" size="lg">
                    <option value="5+ Years">5+ Years Mastery</option>
                    <option value="10+ Years">10+ Years Mastery (Institutional)</option>
                    <option value="Senior Board Certified">Senior Board Certified</option>
                </Select>
             </FormControl>
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={10} align="center" textAlign="center" py={6}>
            <Circle size="100px" bg="teal.50" color="teal.500"><Icon as={FiArrowRight} w={10} h={10} /></Circle>
            <VStack spacing={4}>
              <Heading size="xl" color="teal.800" fontFamily="'Playfair Display', serif">Finalize Clinical Path</Heading>
              <Text color="gray.600" fontSize="lg">
                Ready to align your clinical mastery? Once submitted, our team will review your professional profile against our senior supervisor network.
              </Text>
            </VStack>
            <VStack spacing={6} w="full" bg="#FDFBFA" p={8} borderRadius="3rem" border="1px dashed" borderColor="teal.200">
               <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="xs" color="gray.400" textTransform="uppercase">Contact Email</FormLabel>
                  <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} borderRadius="xl" bg="white" h={14} />
               </FormControl>
               <FormControl>
                  <FormLabel fontWeight="bold" fontSize="xs" color="gray.400" textTransform="uppercase">Phone / WhatsApp</FormLabel>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91" borderRadius="xl" bg="white" h={14} />
               </FormControl>
            </VStack>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 12, md: 24 }}>
      <Container maxW="4xl">
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
               <Icon as={FiAward} w={8} h={8} color="teal.600" />
               <VStack align="start" spacing={0}>
                 <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">Supervision Discovery</Heading>
                 <Text fontSize="xs" color="gray.500">Aligning Clinical Growth & Mastery</Text>
               </VStack>
            </HStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="2xs" fontWeight="900" color="teal.800">STEP {currentSection + 1} OF {SECTIONS.length}</Text>
              <Text fontSize="sm" fontWeight="700" color="gray.400">{SECTIONS[currentSection]}</Text>
            </VStack>
          </HStack>

          <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" bg="teal.50" />

          {/* Form Content */}
          <MotionBox
            key={currentSection}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            bg="white"
            p={{ base: 8, md: 16 }}
            borderRadius="4rem"
            shadow="xl"
            minH="600px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            position="relative"
            overflow="hidden"
          >
             {/* Abstract BG elements */}
             <Box position="absolute" top="-5%" right="-5%" w="200px" h="200px" bg="teal.50" borderRadius="full" filter="blur(60px)" opacity="0.4" />
             <Box position="absolute" bottom="-5%" left="-5%" w="200px" h="200px" bg="#F9F6EE" borderRadius="full" filter="blur(60px)" opacity="0.4" />
             
             {renderSection()}
          </MotionBox>

          {/* Navigation */}
          <HStack justify="space-between" pt={6}>
            <Button
              leftIcon={<FiArrowLeft />}
              onClick={prevStep}
              visibility={currentSection === 0 ? "hidden" : "visible"}
              variant="ghost"
              color="gray.400"
              borderRadius="full"
              px={8}
            >
              Back
            </Button>
            <Button
              rightIcon={currentSection === SECTIONS.length - 1 ? <FiCheck /> : <FiArrowRight />}
              onClick={nextStep}
              bg="teal.800"
              color="white"
              borderRadius="full"
              px={12}
              py={7}
              shadow="lg"
              isLoading={isLoading}
              _hover={{ bg: "teal.900", transform: "translateY(-2px)" }}
            >
              {currentSection === SECTIONS.length - 1 ? "Submit Clinical Profile" : "Continue Path"}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}

