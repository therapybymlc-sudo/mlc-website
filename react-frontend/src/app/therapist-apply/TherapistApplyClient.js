'use client'

import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, 
  FormControl, FormLabel, Input, Select, Checkbox, Textarea, useToast, Circle, Stack,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, Divider, Progress
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiShield, FiCheck, FiUpload, FiArrowRight, FiAward, FiBookOpen, FiGlobe, FiBriefcase } from "react-icons/fi";
import { apiGet, apiUpload } from "../../api.js";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const COUNTRIES = ["India", "United Kingdom", "United States", "Canada", "Australia", "Singapore", "United Arab Emirates", "Other"];
const QUALIFICATIONS = [
  "PhD in Psychology", "PsyD", "M.Phil (Clinical Psychology)", 
  "MA/MSc in Clinical Psychology", "MA/MSc in Counseling Psychology", 
  "MSW (Psychiatric Social Work)", "Other"
];
const EXPERIENCE_OPTIONS = ["0-1", "2-4", "5-9", "10-14", "15+"];

const STEPS = [
  { title: "Personal", icon: FiUser },
  { title: "Identity", icon: FiAward },
  { title: "Admin", icon: FiBriefcase },
  { title: "Legal", icon: FiShield }
];

export default function TherapistApplyClient() {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", linkedin: "",
    highest_qualification: "", years_experience: "", home_country: "India",
    therapeutic_stance: "", clinical_philosophy: "", 
    supervised_experience: "", 
    languages: [], interested_in_spaces: "No",
  });

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (activeStep < STEPS.length - 1) {
      nextStep();
      return;
    }
    
    if (!resumeFile) {
      toast({ title: "Resume Required", description: "Please upload your CV before submitting.", status: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (resumeFile) payload.append("resume", resumeFile);
      
      await apiUpload("therapist-applications/", payload);
      toast({ title: "Success", description: "Your application is under review. Welcome to the journey.", status: "success" });
      setActiveStep(STEPS.length); // Success state
    } catch (err) {
      toast({ title: "Submission Failed", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeStep === STEPS.length) {
    return (
      <Container maxW="4xl" py={40} textAlign="center">
         <VStack spacing={8}>
            <Circle size="100px" bg="teal.50" color="teal.500"><Icon as={FiCheck} w={10} h={10} /></Circle>
            <Heading fontFamily="'Playfair Display', serif" size="2xl">Application Received.</Heading>
            <Text fontSize="xl" color="gray.600">We appreciate your alignment with MLC. Our clinical tea will review your profile and reach out within 5-7 business days.</Text>
            <LinkButton href="/therapists" variant="ghost">Return to Ecosystem</LinkButton>
         </VStack>
      </Container>
    );
  }

  return (
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌟 HERO */}
      <Box pt={32} pb={20} px={6} position="relative" overflow="hidden">
        <Box position="absolute" inset={0} zIndex={0}>
          <Image src="/serene_therapy_office_1776423989664.png" alt="" w="full" h="full" objectFit="cover" opacity="0.1" />
        </Box>
        <Container maxW="5xl" position="relative" zIndex={1} textAlign="center">
          <Badge bg="teal.800" color="white" px={4} py={1} borderRadius="full" mb={6}>JOIN THE COLLECTIVE</Badge>
          <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} fontFamily="'Playfair Display', serif" color="teal.900" mb={6}>
            Therapist Application
          </Heading>
          <Text fontSize="lg" maxW="2xl" mx="auto" color="gray.600">
            Join a strictly vetted collective of therapists. We look for clinicians who value clinical integrity, reflective practice, and the ethical responsibility of holding space.
          </Text>
        </Container>
      </Box>

      {/* 📋 STEPPER VIEW */}
      <Container maxW="4xl" pb={32}>
        <VStack spacing={12} align="stretch">
          
          {/* Stepper Header */}
          <HStack spacing={4} justify="space-between" px={4}>
            {STEPS.map((s, i) => (
              <VStack key={i} spacing={2} flex={1}>
                <Circle size="40px" bg={i <= activeStep ? "teal.800" : "gray.100"} color={i <= activeStep ? "white" : "gray.400"} transition="0.3s">
                   <Icon as={s.icon} />
                </Circle>
                <Text fontSize="xs" fontWeight="800" opacity={i === activeStep ? 1 : 0.5} display={{ base: "none", md: "block" }}>{s.title.toUpperCase()}</Text>
              </VStack>
            ))}
          </HStack>

          {/* Form Card */}
          <Box bg="white" p={{ base: 8, md: 16 }} borderRadius="3rem" shadow="xl" border="1px solid" borderColor="teal.50">
             <form onSubmit={handleApply}>
                <AnimatePresence mode="wait">
                   {activeStep === 0 && (
                     <MotionBox key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <VStack align="stretch" spacing={6}>
                           <Heading size="md" fontFamily="'Playfair Display', serif">Professional Identity</Heading>
                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">First Name</FormLabel>
                                 <Input borderRadius="xl" placeholder="Asma" value={form.first_name} onChange={handleChange("first_name")} />
                              </FormControl>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">Last Name</FormLabel>
                                 <Input borderRadius="xl" placeholder="Mohamed" value={form.last_name} onChange={handleChange("last_name")} />
                              </FormControl>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">Clinical Email</FormLabel>
                                 <Input borderRadius="xl" type="email" placeholder="asma@example.com" value={form.email} onChange={handleChange("email")} />
                              </FormControl>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">Phone (WhatsApp Linkage)</FormLabel>
                                 <Input borderRadius="xl" placeholder="+91..." value={form.phone} onChange={handleChange("phone")} />
                              </FormControl>
                           </SimpleGrid>
                           <FormControl>
                              <FormLabel fontSize="sm" fontWeight="700">LinkedIn Profile</FormLabel>
                              <Input borderRadius="xl" placeholder="https://..." value={form.linkedin} onChange={handleChange("linkedin")} />
                           </FormControl>
                        </VStack>
                     </MotionBox>
                   )}

                   {activeStep === 1 && (
                     <MotionBox key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <VStack align="stretch" spacing={6}>
                           <Heading size="md" fontFamily="'Playfair Display', serif">Clinical Orientation</Heading>
                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">Highest Qualification</FormLabel>
                                 <Select borderRadius="xl" value={form.highest_qualification} onChange={handleChange("highest_qualification")}>
                                    <option value="">Select</option>
                                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                 </Select>
                              </FormControl>
                              <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="700">Years of Experience</FormLabel>
                                 <Select borderRadius="xl" value={form.years_experience} onChange={handleChange("years_experience")}>
                                    <option value="">Select</option>
                                    {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                 </Select>
                              </FormControl>
                           </SimpleGrid>
                           <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="700">Clinical Stance & Philosophy</FormLabel>
                              <Textarea borderRadius="xl" rows={4} placeholder="Briefly describe your therapeutic approach and how you conceptualize the healing process..." value={form.therapeutic_stance} onChange={handleChange("therapeutic_stance")} />
                           </FormControl>
                           <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="700">How do you hold space for complex emotional distress?</FormLabel>
                              <Textarea borderRadius="xl" rows={4} placeholder="Your philosophy on clinical containment and presence..." value={form.clinical_philosophy} onChange={handleChange("clinical_philosophy")} />
                           </FormControl>
                        </VStack>
                     </MotionBox>
                   )}

                   {activeStep === 2 && (
                     <MotionBox key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <VStack align="stretch" spacing={6}>
                           <Heading size="md" fontFamily="'Playfair Display', serif">Practice Context</Heading>
                           <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="700">Home Country/Base of Practice</FormLabel>
                              <Select borderRadius="xl" value={form.home_country} onChange={handleChange("home_country")}>
                                 {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </Select>
                           </FormControl>
                           <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="700">Reflective Supervision History</FormLabel>
                              <Textarea borderRadius="xl" placeholder="Describe your current or past engagement with clinical supervision..." value={form.supervised_experience} onChange={handleChange("supervised_experience")} />
                           </FormControl>
                           <FormControl>
                              <FormLabel fontSize="sm" fontWeight="700">CV / Clinical Resume</FormLabel>
                              <VStack align="center" p={10} border="2px dashed" borderColor="teal.100" borderRadius="2xl" spacing={4} cursor="pointer" position="relative" _hover={{ bg: "teal.50" }}>
                                 <Input type="file" opacity={0} position="absolute" inset={0} onChange={(e) => setResumeFile(e.target.files?.[0])} />
                                 <Icon as={FiUpload} w={8} h={8} color="teal.500" />
                                 <Text fontWeight="800" color="teal.800">{resumeFile ? resumeFile.name : "Click to upload Resume"}</Text>
                                 <Text fontSize="xs" color="gray.400">PDF or DOCX preferred (Max 5MB)</Text>
                              </VStack>
                           </FormControl>
                        </VStack>
                     </MotionBox>
                   )}

                   {activeStep === 3 && (
                     <MotionBox key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <VStack align="stretch" spacing={8}>
                           <Heading size="md" fontFamily="'Playfair Display', serif">MLC Integrity Standards</Heading>
                           <VStack align="start" spacing={4} bg="gray.50" p={8} borderRadius="2xl">
                              <Checkbox colorScheme="teal" isRequired>
                                 <Text fontSize="sm">I certify that all provided credentials and experience details are accurate and verifiable.</Text>
                              </Checkbox>
                              <Checkbox colorScheme="teal" isRequired>
                                 <Text fontSize="sm">I agree to align with MLC’s clinical ethics and professional standards of care.</Text>
                              </Checkbox>
                              <Checkbox colorScheme="teal" isRequired>
                                 <Text fontSize="sm">I understand that joining the collective involves a clinical screening and alignment interview.</Text>
                              </Checkbox>
                           </VStack>
                           <Text fontSize="xs" color="gray.500">By submitting this application, you authorize MLC to perform credential verification as part of our vetting process.</Text>
                        </VStack>
                     </MotionBox>
                   )}
                </AnimatePresence>

                <HStack spacing={4} mt={12} pt={8} borderTop="1px solid" borderColor="teal.50">
                   {activeStep > 0 && (
                     <Button variant="ghost" color="teal.800" onClick={prevStep} borderRadius="full" px={10} py={6}>Back</Button>
                   )}
                   <Button 
                     type="submit" 
                     bg="teal.800" 
                     color="white" 
                     flex={1} 
                     borderRadius="full" 
                     px={10} 
                     py={6} 
                     isLoading={isSubmitting}
                     _hover={{ bg: "teal.900" }} 
                     rightIcon={activeStep < STEPS.length - 1 ? <FiArrowRight /> : <FiCheck />}
                   >
                     {activeStep === STEPS.length - 1 ? "Submit Application" : "Next Step"}
                   </Button>
                </HStack>
             </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
