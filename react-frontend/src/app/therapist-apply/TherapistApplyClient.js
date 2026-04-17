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

const PROFICIENCIES = ["Native", "Fluent", "Conversational", "Basic"];
const POPULATIONS = ["Children (6-12)", "Adolescents (13-17)", "Adults (18-64)", "Older Adults (65+)", "Couples", "Families", "Groups", "LGBTQIA+", "Neurodivergent"];
const QUALIFICATIONS = [
  "PhD in Psychology", "PsyD", "M.Phil (Clinical Psychology)", 
  "MA/MSc in Clinical Psychology", "MA/MSc in Counseling Psychology", 
  "MSW (Psychiatric Social Work)", "Other"
];

const STEPS = [
  { title: "Identity", icon: FiUser },
  { title: "Experience", icon: FiBriefcase },
  { title: "Clinical Depth", icon: FiAward },
  { title: "Logistics", icon: FiMapPin },
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
    resume: null, bachelors: null, masters: null, license: null, qualification_doc: null, additional_docs: null
  });

  // Dynamic Lists...
  const [languages, setLanguages] = useState([{ name: "", level: "" }]);
  const [supervisions, setSupervisions] = useState([{ name: "", work: "", title: "", email: "", duration: "", focus: "" }]);
  const [trainings, setTrainings] = useState([{ name: "", has_supervision: "No", duration: "" }]);
  const [selectedPopulations, setSelectedPopulations] = useState([]);

  // Main Form
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", linkedin: "",
    highest_qualification: "", years_experience: "", home_country: "India",
    licenses_held: "", therapeutic_stance: "", clinical_philosophy: "", relevant_experience: "",
    has_private_online_space: "No", has_in_person_space: "No", in_person_city: "",
    opt_in_spaces: "No", interested_city: "",
    referral_source: "", whatsapp_community: "No", email_updates: "No"
  });

  const nextStep = () => {
    // Basic validation for mandatory sections
    if (activeStep === 1) {
       if (languages.length === 0 || !languages[0].name) {
          toast({ title: "Incomplete", description: "At least one language is mandatory.", status: "warning" });
          return;
       }
    }
    if (activeStep === 2) {
       if (supervisions.length === 0 || !supervisions[0].name) {
          toast({ title: "Clinical Grounding Required", description: "Please provide at least one supervision entry.", status: "warning" });
          return;
       }
    }
    setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };
  
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const togglePopulation = (p) => {
    setSelectedPopulations(curr => curr.includes(p) ? curr.filter(x => x !== p) : [...curr, p]);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (activeStep < STEPS.length - 1) {
      nextStep();
      return;
    }
    
    // Final check for mandatory docs
    if (!files.resume) {
      toast({ title: "CV Missing", description: "Your clinical resume is mandatory.", status: "error" });
      return;
    }
    if (!files.qualification_doc) {
      toast({ title: "Degree Document Missing", description: `Please upload proof of your ${form.highest_qualification}.`, status: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      Object.entries(files).forEach(([k, v]) => { if (v) {
        const fieldName = k === "license" ? "license_doc" : k;
        payload.append(fieldName, v);
      }});
      
      payload.append("languages", JSON.stringify(languages));
      payload.append("supervisions_detailed", JSON.stringify(supervisions));
      payload.append("trainings_detailed", JSON.stringify(trainings));
      payload.append("populations", JSON.stringify(selectedPopulations));
      
      payload.append("home_city", "N/A");
      payload.append("home_postal_code", "N/A");
      payload.append("licensed_countries", JSON.stringify([form.home_country]));

      await apiUpload("therapist-applications/", payload);
      toast({ title: "Application Submitted", status: "success" });
      setActiveStep(STEPS.length); 
    } catch (err) {
      toast({ title: "Submission Failed", status: "error" });
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
            <Text fontSize="xl" color="gray.600">Our clinical team will review your credentials and reach out within 7-10 days.</Text>
            <LinkButton href="/therapists" variant="ghost">Return to Ecosystem</LinkButton>
         </VStack>
      </Container>
    );
  }

  return (
    <Box bg="#FDFBFA" minH="100vh">
      <Box pt={32} pb={12} px={6} position="relative" overflow="hidden">
        <Box position="absolute" inset={0} zIndex={0}>
          <Image src="/serene_therapy_office_1776423989664.png" alt="" w="full" h="full" objectFit="cover" opacity="0.08" />
        </Box>
        <Container maxW="5xl" position="relative" zIndex={1} textAlign="center">
          <Badge bg="teal.800" color="white" px={4} py={1} borderRadius="full" mb={6}>RIGOROUS CLINICAL VETTING</Badge>
          <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} fontFamily="'Playfair Display', serif" color="teal.900" mb={4}>Join the Collective</Heading>
        </Container>
      </Box>

      <Container maxW="4xl" mb={10}>
         <HStack spacing={2}>
            {STEPS.map((s, i) => (
               <Box key={i} flex={1} h="3px" bg={i <= activeStep ? "teal.800" : "gray.200"} transition="0.5s" borderRadius="full" />
            ))}
         </HStack>
      </Container>

      <Container maxW="4xl" pb={32}>
        <form onSubmit={handleApply}>
          <Box bg="white" p={{ base: 8, md: 16 }} borderRadius="3rem" shadow="xl" border="1px solid" borderColor="teal.50">
            <AnimatePresence mode="wait">
              {/* identity */}
              {activeStep === 0 && (
                <MotionBox key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Box>
                        <Heading size="md" fontFamily="'Playfair Display', serif" mb={2}>01. Professional Identification</Heading>
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">Application Advisory: Please use your legal name as it appears on your clinical licenses.</Text>
                     </Box>
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
                     <Input borderRadius="xl" placeholder="https://..." value={form.linkedin} onChange={handleChange("linkedin")} /></FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">HIGHEST CLINICAL QUALIFICATION ATTAINED</FormLabel>
                        <Select borderRadius="xl" value={form.highest_qualification} onChange={handleChange("highest_qualification")}>
                           <option value="">Select Qualification</option>
                           {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                        </Select>
                        <Text fontSize="xs" color="gray.500" mt={2}>Advisory: Proof of this degree will be required in the final step.</Text>
                     </FormControl>
                  </VStack>
                </MotionBox>
              )}

              {/* experience */}
              {activeStep === 1 && (
                <MotionBox key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif" mb={2}>02. Experience & Language</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">YEARS OF PRACTICE</FormLabel>
                        <Select borderRadius="xl" value={form.years_experience} onChange={handleChange("years_experience")}>
                           <option value="">Select</option>
                           {["0-2", "3-5", "6-10", "11-15", "16+"].map(o => <option key={o} value={o}>{o}</option>)}
                        </Select></FormControl>
                        <FormControl isRequired><FormLabel fontSize="xs" fontWeight="900">HOME COUNTRY</FormLabel>
                        <Select borderRadius="xl" value={form.home_country} onChange={handleChange("home_country")}>
                           {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select></FormControl>
                     </SimpleGrid>
                     <FormControl><FormLabel fontSize="xs" fontWeight="900">LICENSES HELD</FormLabel>
                     <Input borderRadius="xl" value={form.licenses_held} onChange={handleChange("licenses_held")} /></FormControl>
                     
                     <VStack align="stretch" spacing={4}>
                        <Box>
                           <FormLabel fontSize="xs" fontWeight="900" mb={1}>LANGUAGES & PROFICIENCY *</FormLabel>
                           <Text fontSize="xs" color="gray.500" fontStyle="italic">Advisory: At least one language is required for client matching.</Text>
                        </Box>
                        {languages.map((l, i) => (
                           <HStack key={i} spacing={3}>
                              <Input placeholder="e.g. English" borderRadius="xl" value={l.name} onChange={(e) => updateListItem(languages, setLanguages, i, "name", e.target.value)} />
                              <Select borderRadius="xl" value={l.level} onChange={(e) => updateListItem(languages, setLanguages, i, "level", e.target.value)}>
                                 <option value="">Level</option>
                                 {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
                              </Select>
                              <IconButton icon={<FiTrash2 />} onClick={() => removeListItem(languages, setLanguages, i)} colorScheme="red" variant="ghost" />
                           </HStack>
                        ))}
                        <Button leftIcon={<FiPlus />} size="sm" variant="outline" alignSelf="start" onClick={() => addListItem(languages, setLanguages, { name: "", level: "" })}>Add Language</Button>
                     </VStack>

                     <FormControl>
                        <FormLabel fontSize="xs" fontWeight="900">POPULATIONS YOU WORK WITH</FormLabel>
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                           {POPULATIONS.map(p => (
                             <Button key={p} size="sm" variant={selectedPopulations.includes(p) ? "solid" : "outline"} colorScheme="teal" borderRadius="full" onClick={() => togglePopulation(p)}>{p}</Button>
                           ))}
                        </SimpleGrid>
                     </FormControl>
                  </VStack>
                </MotionBox>
              )}

              {/* Clinical Depth */}
              {activeStep === 2 && (
                <MotionBox key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif" mb={2}>03. Clinical Stance & Grounding</Heading>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">RELEVANT EXPERIENCE & JOURNEY</FormLabel>
                        <Textarea borderRadius="xl" rows={4} placeholder="Summarize your professional experience and key clinical milestones..." value={form.relevant_experience} onChange={handleChange("relevant_experience")} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">THERAPEUTIC STANCE & PHILOSOPHY</FormLabel>
                        <Textarea borderRadius="xl" rows={4} placeholder="Describe your philosophy on healing and growth..." value={form.therapeutic_stance} onChange={handleChange("therapeutic_stance")} />
                        <Text fontSize="xs" color="gray.500" mt={2}>Advisory: This helps us understand how you "show up" in the room with a client.</Text>
                     </FormControl>
                     
                     <VStack align="stretch" spacing={6}>
                        <Box>
                           <Badge colorScheme="teal" px={3} py={1} borderRadius="md" mb={2}>SUPERVISION HISTORY *</Badge>
                           <Text fontSize="xs" color="gray.500" fontStyle="italic">Advisory: At least one entry is mandatory. You can add all the supervisors you've had throughout your journey.</Text>
                        </Box>
                        {supervisions.map((s, i) => (
                           <Box key={i} p={6} border="1px solid" borderColor="gray.100" borderRadius="2xl">
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                                 <Input placeholder="Supervisor Name" borderRadius="xl" value={s.name} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "name", e.target.value)} />
                                 <Input placeholder="Worksite/Organization" borderRadius="xl" value={s.work} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "work", e.target.value)} />
                                 <Input placeholder="Title/Credentials" borderRadius="xl" value={s.title} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "title", e.target.value)} />
                                 <Input placeholder="Email Address" borderRadius="xl" value={s.email} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "email", e.target.value)} />
                                 <Input placeholder="Supervision Duration" borderRadius="xl" value={s.duration} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "duration", e.target.value)} />
                              </SimpleGrid>
                              <Textarea placeholder="Core area of focus during this supervision..." borderRadius="xl" value={s.focus} onChange={(e) => updateListItem(supervisions, setSupervisions, i, "focus", e.target.value)} />
                              <IconButton mt={4} icon={<FiTrash2 />} onClick={() => removeListItem(supervisions, setSupervisions, i)} size="sm" colorScheme="red" variant="ghost" />
                           </Box>
                        ))}
                        <Button leftIcon={<FiPlus />} variant="ghost" size="sm" color="teal.800" alignSelf="start" onClick={() => addListItem(supervisions, setSupervisions, { name: "", work: "", title: "", email: "", duration: "", focus: "" })}>Add Supervisor</Button>
                     </VStack>
                  </VStack>
                </MotionBox>
              )}

              {/* Logistics */}
              {activeStep === 3 && (
                <MotionBox key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif" mb={2}>04. Practice Logistics</Heading>
                     
                     <Box p={6} bg="gray.50" borderRadius="2xl">
                        <FormControl mb={8}>
                           <FormLabel fontWeight="700">Do you have a professional private space to conduct online therapy sessions?</FormLabel>
                           <RadioGroup onChange={(v) => setForm(p => ({ ...p, has_private_online_space: v }))} value={form.has_private_online_space}>
                              <HStack spacing={6}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack>
                           </RadioGroup>
                        </FormControl>
                        
                        <FormControl mb={6}>
                           <FormLabel fontWeight="700">Do you have a private therapy room for in-person therapy sessions?</FormLabel>
                           <RadioGroup onChange={(v) => setForm(p => ({ ...p, has_in_person_space: v }))} value={form.has_in_person_space}>
                              <HStack spacing={6}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack>
                           </RadioGroup>
                        </FormControl>
                        
                        {form.has_in_person_space === "Yes" && (
                           <FormControl mb={8} isRequired>
                              <FormLabel fontSize="xs" fontWeight="900">IN-PERSON LOCATION (CITY)</FormLabel>
                              <Input borderRadius="xl" bg="white" placeholder="e.g. Mumbai, London, etc." value={form.in_person_city} onChange={handleChange("in_person_city")} />
                           </FormControl>
                        )}

                        <FormControl>
                           <FormLabel fontWeight="700">Would you like to receive information about therapy spaces available in your area for in-person sessions?</FormLabel>
                           <RadioGroup onChange={(v) => setForm(p => ({ ...p, opt_in_spaces: v }))} value={form.opt_in_spaces}>
                              <HStack spacing={6}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack>
                           </RadioGroup>
                        </FormControl>

                        {form.opt_in_spaces === "Yes" && (
                           <FormControl mt={6} isRequired>
                              <FormLabel fontSize="xs" fontWeight="900">CITY OF INTEREST</FormLabel>
                              <Input borderRadius="xl" bg="white" placeholder="Where are you looking for a space?" value={form.interested_city} onChange={handleChange("interested_city")} />
                           </FormControl>
                        )}
                     </Box>
                  </VStack>
                </MotionBox>
              )}

              {/* docs */}
              {activeStep === 4 && (
                <MotionBox key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif" mb={2}>05. Clinical Verification Documents</Heading>
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                        <VStack align="stretch" spacing={2}>
                           <FormLabel fontSize="xs" fontWeight="900" mb={0}>CLINICAL CV / RESUME *</FormLabel>
                           <Box border="2px dashed" borderColor="teal.500" p={6} borderRadius="2xl" position="relative" textAlign="center" _hover={{ bg: "teal.50" }}>
                              <Input type="file" opacity={0} position="absolute" inset={0} cursor="pointer" isRequired onChange={handleFileChange("resume")} />
                              <Icon as={FiUpload} color="teal.600" mb={2} />
                              <Text fontSize="xs" fontWeight="700">{files.resume ? files.resume.name : "Upload Resume (Mandatory)"}</Text>
                           </Box>
                        </VStack>
                        <VStack align="stretch" spacing={2}>
                           <FormLabel fontSize="xs" fontWeight="900" mb={0}>{form.highest_qualification ? form.highest_qualification.toUpperCase() : "QUALIFICATION"} DOC *</FormLabel>
                           <Box border="2px dashed" borderColor="teal.500" p={6} borderRadius="2xl" position="relative" textAlign="center" _hover={{ bg: "teal.50" }}>
                              <Input type="file" opacity={0} position="absolute" inset={0} cursor="pointer" isRequired onChange={handleFileChange("qualification_doc")} />
                              <Icon as={FiUpload} color="teal.600" mb={2} />
                              <Text fontSize="xs" fontWeight="700">{files.qualification_doc ? files.qualification_doc.name : "Upload Degree Proof (Mandatory)"}</Text>
                           </Box>
                        </VStack>
                        <VStack align="stretch" spacing={2}>
                           <FormLabel fontSize="xs" fontWeight="900" mb={0}>ADDITIONAL CLINICAL DOCUMENTS</FormLabel>
                           <Box border="2px dashed" borderColor="teal.100" p={6} borderRadius="2xl" position="relative" textAlign="center" _hover={{ bg: "teal.50" }}>
                              <Input type="file" opacity={0} position="absolute" inset={0} cursor="pointer" onChange={handleFileChange("additional_docs")} />
                              <Icon as={FiUpload} color="teal.200" mb={2} />
                              <Text fontSize="xs" fontWeight="700">{files.additional_docs ? files.additional_docs.name : "Upload Other Docs"}</Text>
                           </Box>
                        </VStack>
                        <VStack align="stretch" spacing={2}>
                           <FormLabel fontSize="xs" fontWeight="900" mb={0}>LICENSE DOCUMENT (IF APPLICABLE)</FormLabel>
                           <Box border="2px dashed" borderColor="teal.100" p={6} borderRadius="2xl" position="relative" textAlign="center" _hover={{ bg: "teal.50" }}>
                              <Input type="file" opacity={0} position="absolute" inset={0} cursor="pointer" onChange={handleFileChange("license")} />
                              <Icon as={FiUpload} color="teal.200" mb={2} />
                              <Text fontSize="xs" fontWeight="700">{files.license ? files.license.name : "Upload License"}</Text>
                           </Box>
                        </VStack>
                     </SimpleGrid>
                  </VStack>
                </MotionBox>
              )}

              {/* final */}
              {activeStep === 5 && (
                <MotionBox key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VStack align="stretch" spacing={8}>
                     <Heading size="md" fontFamily="'Playfair Display', serif">06. Final Alignment</Heading>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="900">WHERE DID YOU HEAR ABOUT MLC?</FormLabel>
                        <Select borderRadius="xl" value={form.referral_source} onChange={handleChange("referral_source")}>
                           <option value="">Select Option</option>
                           <option value="Google">Google Search</option>
                           <option value="Colleague">Through a Colleague</option>
                           <option value="Event">Events/Webinars</option>
                           <option value="Other">Other</option>
                        </Select>
                     </FormControl>
                     <Stack spacing={4} bg="gray.50" p={8} borderRadius="2xl">
                        <HStack justify="space-between"><Text fontWeight="700">Join Therapist WhatsApp Community?</Text><RadioGroup onChange={(v) => setForm(p => ({ ...p, whatsapp_community: v }))} value={form.whatsapp_community}><HStack spacing={4}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack></RadioGroup></HStack>
                        <HStack justify="space-between"><Text fontWeight="700">Receive emails with clinical resources?</Text><RadioGroup onChange={(v) => setForm(p => ({ ...p, email_updates: v }))} value={form.email_updates}><HStack spacing={4}><Radio value="Yes" colorScheme="teal">Yes</Radio><Radio value="No" colorScheme="teal">No</Radio></HStack></RadioGroup></HStack>
                     </Stack>
                     <Checkbox colorScheme="teal" isRequired><Text fontSize="sm" fontWeight="500">I certify that all provided clinical documentation is accurate and verifiable.</Text></Checkbox>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>

            <HStack spacing={4} mt={16} pt={8} borderTop="1px solid" borderColor="teal.50">
               {activeStep > 0 && <Button variant="ghost" color="teal.800" h={14} px={10} borderRadius="full" onClick={prevStep}>Back</Button>}
               <Button type="submit" bg="teal.800" color="white" flex={1} h={14} borderRadius="full" isLoading={isSubmitting} _hover={{ bg: "teal.900" }} rightIcon={activeStep < STEPS.length - 1 ? <FiArrowRight /> : <FiCheck />}>
                  {activeStep === STEPS.length - 1 ? "Submit Rigorous Application" : "Continue to Next Section"}
               </Button>
            </HStack>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
