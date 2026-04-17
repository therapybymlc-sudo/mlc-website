'use client'

import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, 
  FormControl, FormLabel, Input, Select, Checkbox, Textarea, useToast, Circle, Stack,
  Divider, Text as ChakraText, IconButton, Tooltip, Radio, RadioGroup
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiShield, FiCheck, FiUpload, FiArrowRight, FiAward, FiBookOpen, FiGlobe, 
  FiBriefcase, FiPlus, FiTrash2, FiMail, FiMapPin, FiLinkedin
} from "react-icons/fi";
import { apiUpload } from "../../api.js";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const COUNTRIES = ["India", "United Kingdom", "United States", "Canada", "Australia", "Singapore", "United Arab Emirates", "Other"];
const PROFICIENCIES = ["Native", "Fluent", "Conversational", "Basic"];
const QUALIFICATIONS = [
  "PhD in Psychology", "PsyD", "M.Phil (Clinical Psychology)", 
  "MA/MSc in Clinical Psychology", "MA/MSc in Counseling Psychology", 
  "MSW (Psychiatric Social Work)", "Other"
];

const STEPS = [
  { title: "Identity", icon: FiUser },
  { title: "Experience", icon: FiBriefcase },
  { title: "Clinical Depth", icon: FiAward },
  { title: "Docs", icon: FiUpload },
  { title: "Final", icon: FiCheck }
];

export default function TherapistApplyClient() {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Files
  const [files, setFiles] = useState({
    resume: null, bachelors: null, masters: null, license: null
  });

  // Dynamic Lists...
  const [languages, setLanguages] = useState([{ name: "", level: "" }]);
  const [supervisions, setSupervisions] = useState([{ name: "", work: "", title: "", email: "", duration: "", focus: "" }]);
  const [trainings, setTrainings] = useState([{ name: "", has_supervision: "No", duration: "" }]);

  // Main Form
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", linkedin: "",
    highest_qualification: "", years_experience: "", home_country: "India",
    licenses_held: "", therapeutic_stance: "", clinical_philosophy: "", 
    referral_source: "", whatsapp_community: "No", email_updates: "No"
  });

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key) => (e) => {
    setFiles(prev => ({ ...prev, [key]: e.target.files?.[0] || null }));
  };

  const updateListItem = (list, setList, index, field, value) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  const addListItem = (list, setList, emptyObj) => setList([...list, { ...emptyObj }]);
  const removeListItem = (list, setList, index) => setList(list.filter((_, i) => i !== index));

  const handleApply = async (e) => {
    e.preventDefault();
    if (activeStep < STEPS.length - 1) {
      nextStep();
      if (typeof window !== "undefined") window.scrollTo(0, 0);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      
      // Append files
      Object.entries(files).forEach(([k, v]) => { if (v) {
        // Map frontend license to backend license_doc
        const fieldName = k === "license" ? "license_doc" : k;
        payload.append(fieldName, v);
      } });
      
      // Append lists
      payload.append("languages", JSON.stringify(languages));
      payload.append("supervisions_detailed", JSON.stringify(supervisions));
      payload.append("trainings_detailed", JSON.stringify(trainings));
      
      // Mock required hidden fields to satisfy backend validation (temp)
      payload.append("home_city", "N/A");
      payload.append("home_postal_code", "N/A");
      payload.append("licensed_countries", JSON.stringify([form.home_country]));

      await apiUpload("therapist-applications/", payload);
      toast({ title: "Application Submitted", description: "Your clinical identity is now under review.", status: "success" });
      setActiveStep(STEPS.length); 
    } catch (err) {
      toast({ title: "Submission Failed", description: "Verification error. Please check your data.", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (activeStep === STEPS.length) {
    return (
      <Container maxW="4xl" py={40} textAlign="center">
         <VStack spacing={8}>
            <Circle size="100px" bg="teal.50" color="teal.500"><Icon as={FiCheck} w={10} h={10} /></Circle>
            <Heading fontFamily="'Playfair Display', serif" size="2xl">Verification Pending.</Heading>
            <Text fontSize="xl" color="gray.600">We have received your detailed application. Given our rigorous vetting process, our clinical board will review your credentials and reach out within 7-10 days.</Text>
            <LinkButton href="/therapists" variant="ghost">Return to Ecosystem</LinkButton>
         </VStack>
      </Container>
    );
  }

  return (
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌟 HERO */}
      <Box pt={32} pb={12} px={6} position="relative" overflow="hidden">
        <Box position="absolute" inset={0} zIndex={0}>
          <Image src="/serene_therapy_office_1776423989664.png" alt="" w="full" h="full" objectFit="cover" opacity="0.08" />
        </Box>
        <Container maxW="5xl" position="relative" zIndex={1} textAlign="center">
          <Badge bg="teal.800" color="white" px={4} py={1} borderRadius="full" mb={6}>RIGOROUS CLINICAL VETTING</Badge>
          <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} fontFamily="'Playfair Display', serif" color="teal.900" mb={4}>
            Apply to the Collective
          </Heading>
          <Text fontSize="lg" maxW="3xl" mx="auto" color="gray.600">
            MLC is a vetted home for clinicians. Please provide comprehensive details regarding your clinical journey, supervision history, and professional orientation.
          </Text>
        </Container>
      </Box>

      {/* 📋 PROGRESS BAR */}
      <Container maxW="4xl" mb={10}>
         <HStack spacing={4}>
            {STEPS.map((s, i) => (
               <Box key={i} flex={1} h="2px" bg={i <= activeStep ? "teal.800" : "gray.200"} transition="0.5s" />
            ))}
         </HStack>
      </Container>

      {/* 📋 STEPPER VIEW */}
      <Container maxW="4xl" pb={32}>
        <form onSubmit={handleApply}>
          <Box bg="white" p={{ base: 8, md: 16 }} borderRadius="3rem" shadow="xl" border="1px solid" borderColor="teal.50">
            <AnimatePresence mode="wait">
              {/* STEP 0: IDENTITY & BASICS */}
              {activeStep === 0 && (
                <MotionBox key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">01. Professional Identification</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">FIRST NAME</FormLabel>
                        <Input borderRadius="xl" value={form.first_name} onChange={handleChange("first_name")} /></FormControl>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">LAST NAME</FormLabel>
                        <Input borderRadius="xl" value={form.last_name} onChange={handleChange("last_name")} /></FormControl>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">CLINICAL EMAIL</FormLabel>
                        <Input borderRadius="xl" type="email" value={form.email} onChange={handleChange("email")} /></FormControl>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">WHATSAPP NUMBER</FormLabel>
                        <Input borderRadius="xl" value={form.phone} onChange={handleChange("phone")} /></FormControl>
                     </SimpleGrid>
                     <FormControl><FormLabel fontSize="xs" fontWeight="900">LINKEDIN PROFILE URL</FormLabel>
                     <Input borderRadius="xl" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={handleChange("linkedin")} /></FormControl>
                     <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">HIGHEST CLINICAL QUALIFICATION</FormLabel>
                     <Select borderRadius="xl" value={form.highest_qualification} onChange={handleChange("highest_qualification")}>
                        <option value="">Select</option>
                        {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                     </Select></FormControl>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 1: EXPERIENCE & LANGUAGES */}
              {activeStep === 1 && (
                <MotionBox key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">02. Experience & Logistics</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">YEARS OF PROFESSIONAL PRACTICE</FormLabel>
                        <Select borderRadius="xl" value={form.years_experience} onChange={handleChange("years_experience")}>
                           <option value="">Select</option>
                           {["0-2", "3-5", "6-10", "11-15", "16+"].map(o => <option key={o} value={o}>{o}</option>)}
                        </Select></FormControl>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">HOME COUNTRY (BASE OF PRACTICE)</FormLabel>
                        <Select borderRadius="xl" value={form.home_country} onChange={handleChange("home_country")}>
                           {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select></FormControl>
                     </SimpleGrid>
                     <FormControl><FormLabel fontSize="xs" fontWeight="900">LICENSES HELD IN HOME COUNTRY</FormLabel>
                     <Input borderRadius="xl" placeholder="e.g. RCI Registration, BACP, etc." value={form.licenses_held} onChange={handleChange("licenses_held")} /></FormControl>
                     
                     {/* LANGUAGES LIST */}
                     <VStack align="stretch" spacing={4}>
                        <FormLabel fontSize="xs" fontWeight="900">LANGUAGES & PROFICIENCY</FormLabel>
                        {languages.map((l, i) => (
                           <HStack key={i} spacing={3}>
                              <Input placeholder="Language" borderRadius="xl" value={l.name} onChange={(e) => updateListItem(languages, setLanguages, i, "name", e.target.value)} />
                              <Select borderRadius="xl" value={l.level} onChange={(e) => updateListItem(languages, setLanguages, i, "level", e.target.value)}>
                                 <option value="">Level</option>
                                 {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
                              </Select>
                              {languages.length > 1 && <IconButton icon={<FiTrash2 />} onClick={() => removeListItem(languages, setLanguages, i)} colorScheme="red" variant="ghost" />}
                           </HStack>
                        ))}
                        <Button leftIcon={<FiPlus />} size="sm" variant="outline" alignSelf="start" onClick={() => addListItem(languages, setLanguages, { name: "", level: "" })}>Add Language</Button>
                     </VStack>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 2: CLINICAL DEPTH (VETTING) */}
              {activeStep === 2 && (
                <MotionBox key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">03. Clinical Identity</Heading>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">THERAPEUTIC STANCE & PHILOSOPHY</FormLabel>
                        <Textarea borderRadius="xl" rows={4} placeholder="Describe your stance as a therapist..." value={form.therapeutic_stance} onChange={handleChange("therapeutic_stance")} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">HOLDING SPACE FOR COMPLEXITY</FormLabel>
                        <Textarea borderRadius="xl" rows={4} placeholder="How do you conceptually hold space for your clients?" value={form.clinical_philosophy} onChange={handleChange("clinical_philosophy")} />
                     </FormControl>
                     
                     {/* SUPERVISION HISTORY */}
                     <VStack align="stretch" spacing={6}>
                        <Badge colorScheme="teal" alignSelf="start">SUPERVISION HISTORY</Badge>
                        {supervisions.map((s, i) => (
                           <Box key={i} p={6} border="1px solid" borderColor="gray.100" borderRadius="2xl">
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                                 <Input placeholder="Supervisor Name" borderRadius="xl" value={s.name} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "name", e.target.value)} />
                                 <Input placeholder="Place of Work" borderRadius="xl" value={s.work} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "work", e.target.value)} />
                                 <Input placeholder="Title/Role" borderRadius="xl" value={s.title} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "title", e.target.value)} />
                                 <Input placeholder="Supervisor Email" borderRadius="xl" value={s.email} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "email", e.target.value)} />
                                 <Input placeholder="Duration (e.g. 2 years)" borderRadius="xl" value={s.duration} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "duration", e.target.value)} />
                              </SimpleGrid>
                              <Textarea placeholder="What was the focus of this supervision?" borderRadius="xl" value={s.focus} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "focus", e.target.value)} />
                              {supervisions.length > 1 && <Button mt={4} size="xs" colorScheme="red" variant="ghost" onClick={() => removeListItem(supervisions, setSupervisions, i)}>Remove Supervisor</Button>}
                           </Box>
                        ))}
                        <Button leftIcon={<FiPlus />} variant="ghost" size="sm" color="teal.800" alignSelf="start" onClick={() => addListItem(supervisions, setSupervisions, { name: "", work: "", title: "", email: "", duration: "", focus: "" })}>Add Supervision</Button>
                     </VStack>

                     {/* LONG-TERM TRAININGS */}
                     <VStack align="stretch" spacing={6}>
                        <Badge colorScheme="gold" alignSelf="start">LONG-TERM TRAININGS</Badge>
                        {trainings.map((t, i) => (
                           <HStack key={i} spacing={4} align="end">
                              <FormControl flex={2}><Input placeholder="Training Name" borderRadius="xl" value={t.name} onChange={(e) => updateListItem(trainings, setTrainings, i, "name", e.target.value)} /></FormControl>
                              <FormControl flex={1}><Select borderRadius="xl" value={t.has_supervision} onChange={(e) => updateListItem(trainings, setTrainings, i, "has_supervision", e.target.value)}>
                                 <option value="No">No Supervision</option>
                                 <option value="Yes">In-built Supervision</option>
                              </Select></FormControl>
                              <IconButton icon={<FiTrash2 />} onClick={() => removeListItem(trainings, setTrainings, i)} colorScheme="red" variant="ghost" />
                           </HStack>
                        ))}
                        <Button leftIcon={<FiPlus />} variant="ghost" size="sm" color="teal.800" alignSelf="start" onClick={() => addListItem(trainings, setTrainings, { name: "", has_supervision: "No", duration: "" })}>Add Training</Button>
                     </VStack>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 3: DOCUMENT UPLOAD */}
              {activeStep === 3 && (
                <MotionBox key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">04. Documentation & Verification</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                        {[
                          { id: "resume", label: "Updated CV/Resume" },
                          { id: "bachelors", label: "Bachelor's Degree" },
                          { id: "masters", label: "Master's Degree" },
                          { id: "license", label: "Professional License" }
                        ].map(doc => (
                          <VStack key={doc.id} align="stretch" spacing={2}>
                             <FormLabel fontSize="xs" fontWeight="900" mb={0}>{doc.label.toUpperCase()}</FormLabel>
                             <Box border="2px dashed" borderColor="teal.100" p={6} borderRadius="2xl" position="relative" textAlign="center" _hover={{ bg: "teal.50" }}>
                                <Input type="file" opacity={0} position="absolute" inset={0} cursor="pointer" onChange={handleFileChange(doc.id)} />
                                <Icon as={FiUpload} color="teal.500" mb={2} />
                                <Text fontSize="xs" fontWeight="700">{files[doc.id] ? files[doc.id].name : "Upload File"}</Text>
                             </Box>
                          </VStack>
                        ))}
                     </SimpleGrid>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 4: FINAL CONSENT & COMMUNITY */}
              {activeStep === 4 && (
                <MotionBox key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">05. Final Alignment</Heading>
                     
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">WHERE DID YOU HEAR ABOUT MLC?</FormLabel>
                        <Select borderRadius="xl" value={form.referral_source} onChange={handleChange("referral_source")}>
                           <option value="">Select Option</option>
                           <option value="Google">Google Search</option>
                           <option value="Social">Social Media</option>
                           <option value="Colleague">Through a Colleague</option>
                           <option value="Event">Events/Webinars</option>
                           <option value="Other">Other</option>
                        </Select>
                     </FormControl>

                     <Stack spacing={4} bg="gray.50" p={8} borderRadius="2xl">
                        <HStack justify="space-between">
                           <Text fontWeight="700">Join our Therapist WhatsApp Community?</Text>
                           <RadioGroup onChange={(v) => setForm(p => ({ ...p, whatsapp_community: v }))} value={form.whatsapp_community}>
                              <HStack spacing={4}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack>
                           </RadioGroup>
                        </HStack>
                        <HStack justify="space-between">
                           <Text fontWeight="700">Receive emails with updates, offers and clinical resources?</Text>
                           <RadioGroup onChange={(v) => setForm(p => ({ ...p, email_updates: v }))} value={form.email_updates}>
                              <HStack spacing={4}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack>
                           </RadioGroup>
                        </HStack>
                     </Stack>

                     <Checkbox colorScheme="teal" isRequired>
                        <Text fontSize="sm" fontWeight="500">I certify that all provided clinical documentation and supervision history is accurate and verifiable.</Text>
                     </Checkbox>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <HStack spacing={4} mt={16} pt={8} borderTop="1px solid" borderColor="teal.50">
               {activeStep > 0 && (
                 <Button variant="ghost" color="teal.800" h={14} px={10} borderRadius="full" onClick={prevStep}>Back</Button>
               )}
               <Button 
                  type="submit" 
                  bg="teal.800" 
                  color="white" 
                  flex={1} 
                  h={14}
                  borderRadius="full" 
                  isLoading={isSubmitting}
                  _hover={{ bg: "teal.900" }} 
                  rightIcon={activeStep < STEPS.length - 1 ? <FiArrowRight /> : <FiCheck />}
               >
                  {activeStep === STEPS.length - 1 ? "Submit Rigorous Application" : "Continue to Next Section"}
               </Button>
            </HStack>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
