'use client'

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box, Flex, VStack, HStack, Heading, Text, Input, Button, FormControl, FormLabel, SimpleGrid, useToast, Icon, Avatar, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Stack, Select, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tag, TagLabel, TagCloseButton, Divider, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Wrap, WrapItem, Spinner,
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe, FiBriefcase, FiZap, FiX
} from "react-icons/fi";
import { apiGet, apiPut, apiPost } from "../../../../../api.js";
import TherapistSubscriptionGateway from "../../../../../components/TherapistSubscriptionGateway";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";

// ===========================
// 🔹 Constants & Presets
// ===========================

const CATEGORIES = {
  AGE_GROUPS: ["Children", "Pre-teens", "Adolescents", "Young adults", "Adults", "Older adults", "Couples", "Families", "Parents"],
  CLINICAL_ROLES: ["Counselling Psychologist", "Clinical Psychologist", "Psychotherapist", "Psychologist in training", "Marriage and Family Therapist", "Counsellor"],
  MODALITIES_GROUPS: {
    "Core Evidence-Based": ["CBT", "DBT (Full)", "ACT", "Cognitive Processing Therapy (CPT)", "Prolonged Exposure (PE)", "Behavioral Activation (BA)", "Compassion-Focused Therapy (CFT)", "Metacognitive Therapy (MCT)", "MBCT", "MBSR", "ERP (for OCD)"],
    "Trauma-Specific": ["TF-CBT", "EMDR", "Internal Family Systems (IFS)", "Somatic Experiencing (SE)", "Sensorimotor Psychotherapy", "Narrative Exposure Therapy (NET)", "Brainspotting", "Polyvagal-Informed"],
    "Humanistic / Experiential": ["Person-Centered", "Gestalt Therapy", "Emotion-Focused (Individual)", "Existential Therapy", "Logotherapy"],
    "Relationship & Family": ["Emotion-Focused (Couples)", "Gottman Method", "Imago Relationship Therapy", "Structural Family Therapy", "Bowen Family Systems", "Relational Therapy"],
    "Psychodynamic / Depth": ["Psychoanalytic Therapy", "Short-term Psychodynamic", "Object Relations", "Jungian Therapy", "Relational Psychoanalysis"],
    "Somatic / Body-Based": ["Somatic Therapy (General)", "Body Psychotherapy", "Hakomi Method", "Mind-Body Therapy", "Breathwork-Informed"],
    "Integrative / Holistic": ["Integrative Psychotherapy", "Eclectic Therapy", "Solution-Focused (SFBT)", "Narrative Therapy", "Motivational Interviewing (MI)", "Positive Psychology"],
    "Child & Adolescent": ["Play Therapy", "Sand Tray Therapy", "Art Therapy", "Expressive Arts Therapy", "DBT-A"]
  },
  ALL_LANGUAGES: ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "French", "Spanish", "Bengali", "Telugu", "Marathi", "Gujarati", "Kannada", "Punjabi", "Odia", "Assamese", "Maithili", "Sanskrit", "German", "Mandarin", "Japanese", "Russian", "Portuguese", "Italian", "Turkish", "Korean", "Vietnamese", "Greek", "Hebrew", "Persian", "Thai", "Dutch", "Swedish"],
  IDENTITY_CONTEXTS_GROUPS: {
    "Life Stages & Roles": ["New mothers / Postpartum", "Expecting parents", "Single parents", "Caregivers (elderly / disabled)", "Recently married", "Recently divorced / separated", "Blended families", "Only children / Sibling dynamics"],
    "Cultural & Identity": ["First-generation individuals", "Second-generation / Bicultural", "Migrants / Relocation adjustment", "Expats in foreign countries", "Joint family systems", "Intercaste / Intercultural relationships", "South Asian Diaspora", "LGBTQ+ / Queer Identity", "Neurodivergent (ADHD/Autism)"],
    "Work & Academic": ["Students (School-level)", "University / College students", "High-achieving / Perfectionistic", "Corporate professionals", "Healthcare professionals", "Entrepreneurs / Business owners", "Creatives / Artists", "Unemployed / Career transition"],
    "Emotional & Personality Patterns": ["High-functioning anxiety", "People-pleasing patterns", "Emotional avoidance", "Overthinking / Rumination", "Low self-worth patterns", "Burnout-prone", "Highly sensitive persons (HSP)"],
    "Relationship Contexts": ["Dating / Early relationship stage", "Premarital counselling", "Marital conflict", "Infidelity recovery", "Attachment-related concerns", "Boundary-setting difficulties", "Toxic relationship recovery"],
    "Health & Life Challenges": ["Chronic illness", "Chronic pain", "Fertility struggles", "Pregnancy-related concerns", "Body image concerns", "Loss / Grief"],
    "Trauma & Adversity": ["Childhood emotional neglect", "Abuse survivors (Emotional/Physical/Sexual)", "Family dysfunction", "Bullying history", "High-conflict households"],
    "Faith & Spirituality": ["Muslim clients", "Hindu clients", "Christian clients", "Spiritually inclined clients", "Faith crisis / Doubt", "Religion-related guilt or fear"]
  },
  CONCERNS: [
    "Anxiety (Generalized, Panic, Social)", 
    "Depression & Low Mood", 
    "Complex Trauma (CPTSD)", 
    "Childhood / Developmental Trauma",
    "Identity & Self-Esteem", 
    "Relationships & Attachment", 
    "Neurodivergence (ADHD/Autism Support)",
    "Workplace Burnout & High-Performance Stress",
    "Grief, Loss & Life Transitions",
    "Personality-related Difficulties (e.g. BPD traits)",
    "Body Image & Eating Concerns",
    "Sleep & Psychosomatic Symptoms",
    "Postpartum & Women's Mental Health",
    "Addiction & Substance Use Recovery",
    "Acute Stress & Crisis Intervention"
  ],
  SKILL_PRESETS: ["Trauma-Informed", "LGBTQ+ Affirming", "Neurodiversity-Affirming", "Crisis Intervention", "Goal-Oriented", "Deep Reflection"]
};

const FLUENCY_LEVELS = ["Conversational", "Professional Working Proficiency", "Fluent / Native"];
const CURRENCIES = ["KD", "INR", "USD", "AED", "GBP"];

export default function ProfileClient() {
  const toast = useToast();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [profile, setProfile] = useState({
    // 1. Identity
    name: "",
    title: "",
    pronouns: "",
    headline: "",
    
    // 2. Credentials
    qualification_highest: "",
    qualification_title: "",
    university: "",
    year_completed: "",
    experience_years: 0,
    experience_post_qual: 0,
    license_details: "",
    
    // 3. Pro Role
    professional_role: "",
    scope_of_practice: "",
    not_treated: "",
    complexity_comfort: "Moderate",
    independence_level: "Independent",

    // 4. Populations & Languages
    age_groups: [],
    identity_contexts: [],
    languages_info: [], // [{ lang: string, fluency: string }]
    
    // 5. Clinical Scope
    concerns_levels: {}, 
    exclusions: "",
    
    // 6. Approach
    primary_orientation: "",
    secondary_modalities: [],
    modalities_info: [], // [{ name, training, supervision }]
    primary_lens: "",
    pacing: 50, structure: 50, action: 50,
    
    // 7. Availability & Fees
    is_accepting_new: true,
    currency: "KD",
    hourly_rate: 0,
    cancellation_policy: "24-hour notice required",
    session_modes: ["Online Video"],
    locations: "",

    // 8. Media & Bio
    bio: "",
    welcome_note: "",
    faqs: [{ q: "What happens in the first session?", a: "" }],
    keywords: [],

    // 9. Internal
    internal_risk_level: "Moderate",
    risk_protocols: { psychiatrist: "", hospital: "", location: "", contact: "", notes: "" },
    best_fit_notes: ""
  });

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!isMounted || !isUserLoaded) return;
    
    const fetchProfile = async () => {
      try {
        const data = await apiGet("therapists/me/");
        if (data && data.id) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet — will be created on first save
          const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";
          if (clerkEmail) setProfile(prev => ({ ...prev, email: clerkEmail }));
        } else {
          console.error("Profile sync error:", error);
        }
      }
    };
    fetchProfile();
  }, [isMounted, isUserLoaded]);

  const handleSave = async (showToast = true) => {
    setLoading(true);
    // Always ensure email from Clerk is in the payload — this is the linkage key
    const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";
    const payload = { ...profile, email: profile.email || clerkEmail };
    const name = payload.name || user?.fullName || user?.firstName || "Therapist";
    try {
      if (profile.id) {
        await apiPut(`therapists/${profile.id}/`, { ...payload, name });
        if (showToast) toast({ title: "Profile Synced ✓", status: "success", duration: 2000 });
      } else {
        const created = await apiPost("therapists/", { ...payload, name });
        setProfile(prev => ({ ...prev, ...created }));
        if (showToast) toast({ title: "Profile Initialized ✓", status: "success", duration: 2000 });
      }
      return true;
    } catch (error) {
      const detail = error?.response?.data?.email?.[0] || error?.response?.data?.detail || "Please try again.";
      toast({ title: "Sync failed", description: detail, status: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!requireBasicAccess()) return;
    const success = await handleSave(false);
    if (success) {
      setTabIndex((prev) => (prev + 1) % 8);
      toast({ title: "Progress Saved", status: "success", duration: 1500 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeywordAdd = () => {
    if (!keywordInput.trim() || profile.keywords?.length >= 6) return;
    const corrected = keywordInput.trim().charAt(0).toUpperCase() + keywordInput.trim().slice(1).toLowerCase();
    if (!profile.keywords.includes(corrected)) {
      setProfile({...profile, keywords: [...(profile.keywords || []), corrected]});
    }
    setKeywordInput("");
  };

  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('profile_image', file);
    
    setLoading(true);
    try {
      // For therapists, the field might be named differently or need a specific endpoint
      // Assuming apiPatch to therapists/me/ or similar
      await apiPatch(`therapists/${profile.id}/`, formDataUpload);
      toast({ title: "Photo updated", status: "success" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast({ title: "Upload failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleArray = (field, item) => {
    const current = profile[field] || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setProfile({...profile, [field]: updated});
  };

  if (!isMounted || !isUserLoaded) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#FAFAFA">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" color="#56756D" />
          <Text color="gray.500" fontFamily="'Playfair Display', serif">Loading Identity Hub...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" pb={20}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handlePhotoUpload} 
      />
      <VStack align="stretch" spacing={6} mb={10}>
        <Flex 
          direction={{ base: "column", md: "row" }}
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
           <Box>
              <Heading size={{ base: "lg", md: "xl" }} color="#2E2E2E" fontFamily="'Playfair Display', serif" whiteSpace="normal">Clinician Identity Hub</Heading>
              <Text color="gray.500" mt={1} fontSize={{ base: "sm", md: "md" }}>Define your professional scope, expertise, and public presence.</Text>
           </Box>
           <Button leftIcon={<FiSave />} bg="#56756D" color="white" px={10} borderRadius="full" onClick={() => requireBasicAccess(() => handleSave())} isLoading={loading} _hover={{ bg: '#C9A960' }} shadow="xl" w={{ base: "full", md: "auto" }} flexShrink={0}>Finalize & Sync</Button>
        </Flex>
        {!hasBasicAccess && (
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Subscription needed to publish profile</AlertTitle>
              <AlertDescription fontSize="sm">
                Activate Basic to sync your profile publicly and receive client matches.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>

      <Tabs index={tabIndex} onChange={(i) => setTabIndex(i)} variant="enclosed" colorScheme="teal" isLazy>
        <TabList 
          overflowX="auto" 
          border="none" 
          mb={8} 
          flexWrap="nowrap"
          sx={{ 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiUser} mr={2}/> Identity</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiAward} mr={2}/> Credentials</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiUsers} mr={2}/> Populations</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiTarget} mr={2}/> Clinical Scope</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiHeart} mr={2}/> Therapeutic Approach</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiClock} mr={2}/> Availability</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiBook} mr={2}/> Bio & Media</Tab>
          <Tab whiteSpace="nowrap" flexShrink={0} _selected={{ color: 'red.500', bg: 'red.50' }} borderRadius="xl" px={{ base: 4, md: 8 }} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiSettings} mr={2}/> Internal Matching</Tab>
        </TabList>

        <TabPanels bg="white" p={10} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          {/* 1. Identity */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
               <VStack align="stretch" spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">Full Name</FormLabel>
                    <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Professional Title</FormLabel>
                    <Input placeholder="e.g. Counselling Psychologist" value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Pronouns</FormLabel>
                    <Input placeholder="She / Her" value={profile.pronouns} onChange={(e) => setProfile({...profile, pronouns: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">Public Headline</FormLabel>
                    <Input placeholder="Focused on trauma and relationship wellness..." value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
               </VStack>
               <VStack align="center" justify="center">
                  <Avatar size="2xl" name={profile.name} src={profile.profile_image || profile.imageUrl} bg="#56756D" />
                  <Button mt={4} leftIcon={<FiCamera />} variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={loading}>Update Profile Picture</Button>
               </VStack>
            </SimpleGrid>
            <Divider my={10} />
            <Flex justify="flex-end">
              <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
            </Flex>
          </TabPanel>

          {/* 2. Credentials */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Highest Qualification</FormLabel>
                    <Input placeholder="e.g. Ph.D, M.Phil" value={profile.qualification_highest} onChange={(e) => setProfile({...profile, qualification_highest: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Degree Title</FormLabel>
                    <Input placeholder="Psychology" value={profile.qualification_title} onChange={(e) => setProfile({...profile, qualification_title: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">University / Institution</FormLabel>
                    <Input value={profile.university} onChange={(e) => setProfile({...profile, university: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Year Completed</FormLabel>
                    <Input type="number" value={profile.year_completed} onChange={(e) => setProfile({...profile, year_completed: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </SimpleGrid>
               <Divider />
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Total Years of Experience</FormLabel>
                    <Input type="number" value={profile.experience_years} onChange={(e) => setProfile({...profile, experience_years: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Post-Qualification Years</FormLabel>
                    <Input type="number" value={profile.experience_post_qual} onChange={(e) => setProfile({...profile, experience_post_qual: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </SimpleGrid>
               <FormControl>
                  <FormLabel fontWeight="700">License / Registration Details</FormLabel>
                  <Textarea value={profile.license_details} onChange={(e) => setProfile({...profile, license_details: e.target.value})} borderRadius="xl" />
               </FormControl>
               <Box p={8} border="2px dashed" borderColor="gray.200" borderRadius="3xl" textAlign="center">
                  <Icon as={FiBriefcase} boxSize={8} color="gray.300" mb={2} />
                  <Text fontWeight="600" color="gray.500">Professional Documents (Internal Only)</Text>
                  <Text fontSize="xs" color="gray.400" mb={4}>Degree Certificate, CV/Resume, License Proof</Text>
                  <Button size="sm" colorScheme="teal" variant="outline">Upload Files</Button>
               </Box>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 3. Populations & Languages */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Alert status="info" variant="subtle" borderRadius="2xl" bg="rgba(86, 117, 109, 0.05)">
                  <AlertIcon color="mlc.green" />
                  <Box>
                    <AlertTitle fontSize="sm">Specificity and Ideal Matching</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Make sure to choose only populations you are most experienced with, this helps our algorithm find your ideal clients. Profiles that claim to treat everyone often rank lower in specialized search results.
                    </AlertDescription>
                  </Box>
               </Alert>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Age Groups Served</FormLabel>
                  <Wrap spacing={3}>
                     {CATEGORIES.AGE_GROUPS.map(age => (
                       <Checkbox key={age} isChecked={profile.age_groups?.includes(age)} onChange={() => toggleArray('age_groups', age)}>{age}</Checkbox>
                     ))}
                  </Wrap>
               </Box>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Language Proficiency</FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={4}>Select languages you are comfortable conducting therapy in. Proficiency details help match client comprehension needs.</Text>
                  
                  <HStack mb={6}>
                    <Select 
                      placeholder="Add a language..." variant="filled" borderRadius="xl"
                      onChange={(e) => {
                        const lang = e.target.value;
                        if (!lang) return;
                        const exists = profile.languages_info?.find(l => l.lang === lang);
                        if (!exists) {
                          setProfile({...profile, languages_info: [...(profile.languages_info || []), { lang, fluency: "Fluent / Native" }]});
                        }
                        e.target.value = "";
                      }}
                    >
                      {CATEGORIES.ALL_LANGUAGES.map(l => (
                        <option key={l} value={l} disabled={profile.languages_info?.find(li => li.lang === l)}>{l}</option>
                      ))}
                    </Select>
                  </HStack>

                  <VStack align="stretch" spacing={3}>
                    {profile.languages_info?.map((info, idx) => (
                      <HStack key={info.lang} bg="gray.50" p={4} borderRadius="2rem" justify="space-between" border="1px solid" borderColor="gray.100">
                         <HStack spacing={3}>
                           <Icon as={FiGlobe} color="teal.500" />
                           <Text fontWeight="bold" fontSize="sm">{info.lang}</Text>
                         </HStack>
                         <HStack spacing={4}>
                           <Select size="sm" bg="white" w="220px" borderRadius="lg" value={info.fluency} onChange={(e) => {
                              const updated = [...profile.languages_info];
                              updated[idx].fluency = e.target.value;
                              setProfile({...profile, languages_info: updated});
                           }}>
                             {FLUENCY_LEVELS.map(f => <option key={f} value={f}>{f}</option>)}
                           </Select>
                           <IconButton 
                            icon={<FiX />} 
                            size="xs" variant="ghost" colorScheme="red"
                            onClick={() => setProfile({...profile, languages_info: profile.languages_info.filter(l => l.lang !== info.lang)})}
                           />
                         </HStack>
                      </HStack>
                    ))}
                  </VStack>
               </Box>

               <Divider />

               <Box>
                  <HStack justify="space-between" mb={4}>
                    <FormLabel fontWeight="800" mb={0}>Identity Contexts & Experiences (Max 10)</FormLabel>
                    <Badge colorScheme={profile.identity_contexts?.length > 10 ? "red" : "teal"} borderRadius="full" px={3}>
                       {profile.identity_contexts?.length || 0} / 10 Selected
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mb={8}>Choose the contexts you have deep clinical experience with. Avoid vague tags like "general population" to ensure high-quality matching.</Text>

                  <VStack align="stretch" spacing={8}>
                     {Object.entries(CATEGORIES.IDENTITY_CONTEXTS_GROUPS).map(([category, items]) => (
                       <Box key={category}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={4}>{category}</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                             {items.map(ctx => {
                               const isChecked = profile.identity_contexts?.includes(ctx);
                               return (
                                 <Checkbox 
                                   key={ctx} isChecked={isChecked} 
                                   onChange={(e) => {
                                      if (e.target.checked && (profile.identity_contexts?.length || 0) >= 10) {
                                         toast({ title: "Limit reached", description: "Please select maximum 10 identity contexts.", status: "warning" });
                                         return;
                                      }
                                      toggleArray('identity_contexts', ctx);
                                   }}
                                 >
                                   <Text fontSize="sm">{ctx}</Text>
                                 </Checkbox>
                               );
                             })}
                          </SimpleGrid>
                       </Box>
                     ))}
                  </VStack>
               </Box>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 4. Clinical Scope */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Alert status="warning" variant="subtle" borderRadius="2rem" border="1px solid" borderColor="orange.100" bg="orange.50">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Avoid Generic Profiles</AlertTitle>
                    <AlertDescription fontSize="xs">
                      We (and clients) value depth over breadth. Intentionality matters. Profiles that select too many specializations often rank lower in specific search results. Focus on your core expertise for maximum visibility.
                    </AlertDescription>
                  </Box>
               </Alert>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Professional Role & Practice</FormLabel>
                  <SimpleGrid columns={2} spacing={4} mb={6}>
                     <FormControl>
                        <FormLabel fontSize="xs">Primary Role</FormLabel>
                        <Select value={profile.professional_role} onChange={(e) => setProfile({...profile, professional_role: e.target.value})} borderRadius="xl">
                           <option>Select Role</option>
                           {CATEGORIES.CLINICAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                     </FormControl>
                     <FormControl>
                        <FormLabel fontSize="xs">Complexity Handling</FormLabel>
                        <Select value={profile.complexity_comfort} onChange={(e) => setProfile({...profile, complexity_comfort: e.target.value})} borderRadius="xl">
                           <option value="Mild">Mild presentations</option>
                           <option value="Moderate">Moderate distress</option>
                           <option value="High">High complexity (Clinical focus)</option>
                        </Select>
                     </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={1} spacing={6}>
                     <FormControl>
                        <FormLabel fontWeight="700">Scope of Practice</FormLabel>
                        <Textarea placeholder="Define your clinical boundaries..." value={profile.scope_of_practice} onChange={(e) => setProfile({...profile, scope_of_practice: e.target.value})} borderRadius="xl" />
                     </FormControl>
                     <FormControl>
                        <FormLabel fontWeight="700">Specific Presentations Not Treated</FormLabel>
                        <Textarea placeholder="e.g. Forensics, active dependence, etc." value={profile.not_treated} onChange={(e) => setProfile({...profile, not_treated: e.target.value})} borderRadius="xl" />
                     </FormControl>
                  </SimpleGrid>
               </Box>

               <Box>
                  <FormLabel fontWeight="800" mb={2}>Presenting Concerns Matrix</FormLabel>
                  <Box p={4} bg="gray.50" borderRadius="xl" mb={6} border="1px solid" borderColor="gray.100">
                    <Heading size="xs" mb={3} textTransform="uppercase" color="gray.500">Choosing the right level:</Heading>
                    <VStack align="stretch" spacing={2}>
                       <HStack fontSize="xs"><Badge colorScheme="teal" variant="solid" w="110px">Core Focus</Badge><Text color="gray.600">Primary expertise. You work with this daily and have advanced training.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="teal" variant="outline" w="110px">Experienced</Badge><Text color="gray.600">Substantial clinical experience and supervised follow-through.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="gray" variant="subtle" w="110px">Foundational</Badge><Text color="gray.600">Foundational knowledge; take occasionally but not a core focus.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="red" variant="ghost" w="110px">Refer Out</Badge><Text color="gray.600">Choose this if you <b>do not</b> treat this presentation.</Text></HStack>
                    </VStack>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                     {CATEGORIES.CONCERNS.map(topic => (
                       <HStack key={topic} justify="space-between" p={3} borderBottom="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }} transition="0.2s">
                          <Text fontWeight="600" fontSize="xs" color="gray.700">{topic}</Text>
                          <Select 
                            size="xs" bg="white" w="140px" borderRadius="md"
                            value={profile.concerns_levels?.[topic] || ""} 
                            onChange={(e) => setProfile({...profile, concerns_levels: {...profile.concerns_levels, [topic]: e.target.value}})}
                          >
                             <option value="">Choose Level</option>
                             <option value="Core Focus">Core Focus</option>
                             <option value="Experienced">Experienced</option>
                             <option value="Foundational">Foundational</option>
                             <option value="Refer Out">Refer Out</option>
                          </Select>
                       </HStack>
                     ))}
                  </SimpleGrid>
               </Box>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 5. Approach */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Box>
                  <Heading size="md" mb={4} color="mlc.greenDark">Therapeutic Orientation & Modalities</Heading>
                  
                  <Box p={6} bg="orange.50" borderRadius="2rem" border="1px solid" borderColor="orange.100" mb={8}>
                     <HStack color="orange.800" mb={3}><Icon as={FiAlertCircle}/><Text fontWeight="bold">Clinical Advisory & Ethics</Text></HStack>
                     <VStack align="stretch" spacing={3}>
                        <Text fontSize="xs" fontWeight="500">
                          1. Select only modalities you have been <b>practically trained and supervised in</b>. 
                        </Text>
                        <Text fontSize="xs" fontWeight="500">
                          2. <b>Limit your selection to 8 total.</b> Generic profiles with too many orientations dilute your clinical authority and are indexed lower by search engines.
                        </Text>
                        <Text fontSize="xs" color="orange.700" fontStyle="italic">
                          * Non-practical trainings with no supervised follow-through will be flagged to maintain MLC standards.
                        </Text>
                     </VStack>
                  </Box>

                  <VStack align="stretch" spacing={8} mb={10}>
                     <FormControl isRequired>
                        <FormLabel fontWeight="800">Primary Therapeutic Modality</FormLabel>
                        <Text fontSize="xs" color="gray.500" mb={2}>Your "Main Lens" – the modality that informs your case formulation most strongly.</Text>
                        <Select 
                          placeholder="Select Primary Modality" variant="filled" borderRadius="xl"
                          value={profile.primary_orientation}
                          onChange={(e) => setProfile({...profile, primary_orientation: e.target.value})}
                        >
                           {profile.modalities_info?.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                        </Select>
                     </FormControl>

                     <Box>
                        <HStack justify="space-between" mb={4}>
                           <FormLabel fontWeight="800" mb={0}>Clinical Modalities (Max 8 Total)</FormLabel>
                           <Badge colorScheme={profile.modalities_info?.length > 8 ? "red" : "teal"} borderRadius="full" px={3}>
                              {profile.modalities_info?.length || 0} / 8 Selected
                           </Badge>
                        </HStack>

                        <VStack align="stretch" spacing={6}>
                           {Object.entries(CATEGORIES.MODALITIES_GROUPS).map(([category, items]) => (
                             <Box key={category}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={3}>{category}</Text>
                                <Wrap spacing={2}>
                                   {items.map(m => {
                                      const isSelected = profile.modalities_info?.find(mi => mi.name === m);
                                      return (
                                        <Tag 
                                           key={m} cursor="pointer" borderRadius="full" px={4} py={2}
                                           variant={isSelected ? "solid" : "outline"}
                                           colorScheme={isSelected ? "teal" : "gray"}
                                           onClick={() => {
                                              if (!isSelected && (profile.modalities_info?.length || 0) >= 8) {
                                                 toast({ title: "Selection limit reached", description: "Please select a maximum of 8 modalities to maintain profile specificity.", status: "warning" });
                                                 return;
                                              }
                                              const updated = isSelected 
                                                ? profile.modalities_info.filter(mi => mi.name !== m) 
                                                : [...(profile.modalities_info || []), { name: m, training: "", supervision: "" }];
                                              setProfile({...profile, modalities_info: updated});
                                           }}
                                        >
                                           <TagLabel fontSize="xs">{m}</TagLabel>
                                        </Tag>
                                      );
                                   })}
                                </Wrap>
                             </Box>
                           ))}
                        </VStack>
                     </Box>
                  </VStack>

                  <Heading size="xs" mb={6} textTransform="uppercase" letterSpacing="widest" color="teal.700">Detailed Training & Supervision Logs</Heading>
                  <VStack align="stretch" spacing={6}>
                     {profile.modalities_info?.map((info, idx) => (
                       <Box key={info.name} p={8} bg="teal.50" border="1px solid" borderColor="teal.100" borderRadius="2.5rem" shadow="sm">
                          <HStack mb={4} justify="space-between">
                             <Heading size="sm" color="teal.800">{info.name}</Heading>
                             <Badge colorScheme="teal" variant="solid" borderRadius="full">Mandatory Log</Badge>
                          </HStack>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                             <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold">Training Institution & Year</FormLabel>
                                <Input bg="white" placeholder="Institution name, certification details..." value={info.training} onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].training = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }} borderRadius="xl" />
                             </FormControl>
                             <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold">Clinical Supervision Details</FormLabel>
                                <Textarea bg="white" placeholder="Supervisor Name, How long, Contact / Position" value={info.supervision} onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].supervision = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }} borderRadius="xl" />
                             </FormControl>
                          </SimpleGrid>
                       </Box>
                     ))}
                  </VStack>
               </Box>

               <Divider />

               <Box>
                  <FormLabel fontWeight="800">Therapy Dynamics (Matching Sliders)</FormLabel>
                  <SimpleGrid columns={1} spacing={8} p={10} bg="gray.50" borderRadius="3rem">
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">More Structured</Text><Text fontSize="xs">More Exploratory</Text></HStack>
                        <Slider value={profile.structure} onChange={(v) => setProfile({...profile, structure: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">Past-Focused</Text><Text fontSize="xs">Present-Focused</Text></HStack>
                        <Slider value={profile.orientation} onChange={(v) => setProfile({...profile, orientation: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">Gentle Pacing</Text><Text fontSize="xs">Direct / Challenging</Text></HStack>
                        <Slider value={profile.pacing} onChange={(v) => setProfile({...profile, pacing: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                  </SimpleGrid>
               </Box>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 6. Availability */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Currency</FormLabel>
                    <Select value={profile.currency} onChange={(e) => setProfile({...profile, currency: e.target.value})} borderRadius="xl">
                       {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Individual Fee</FormLabel>
                    <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Sliding Scale</FormLabel>
                    <Select bg="gray.100" isDisabled borderRadius="xl"><option>Coming Soon (In Development)</option></Select>
                  </FormControl>
               </SimpleGrid>
               <Divider />
               <VStack align="stretch" spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0" fontWeight="700">Accepting New Clients</FormLabel>
                    <Checkbox isChecked={profile.is_accepting_new} onChange={(e) => setProfile({...profile, is_accepting_new: e.target.checked})} />
                  </FormControl>
                  <FormControl>
                     <FormLabel fontWeight="700">In-Person Locations</FormLabel>
                     <Input placeholder="e.g. Banjara Hills, Hyderabad" value={profile.locations} onChange={(e) => setProfile({...profile, locations: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </VStack>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 7. Bio & Media */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <FormControl>
                  <FormLabel fontWeight="800">Professional Bio (150+ words recommended for visibility)</FormLabel>
                  <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} borderRadius="2xl" rows={10} placeholder="Talk about your journey, style, and approach..." />
               </FormControl>
               
               <Box bg="#F9FBFA" p={8} borderRadius="3xl">
                  <HStack justify="space-between" mb={4}>
                     <Heading size="xs" textTransform="uppercase">Skill Keywords (Max 6)</Heading>
                     <Badge colorScheme="teal">{profile.keywords?.length} / 6</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mb={6}>Type and press enter. Keywords are auto-corrected for uniform profile consistency.</Text>
                  
                  <HStack mb={6}>
                     <Input placeholder="e.g. Trauma-sensitive" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()} />
                     <Button colorScheme="teal" onClick={handleKeywordAdd} isDisabled={profile.keywords?.length >= 6}>Add</Button>
                  </HStack>

                  <Wrap spacing={2}>
                     {profile.keywords?.map(kw => (
                       <Tag key={kw} size="lg" borderRadius="full" colorScheme="teal">
                          <TagLabel>{kw}</TagLabel>
                          <TagCloseButton onClick={() => setProfile({...profile, keywords: profile.keywords.filter(k => k !== kw)})} />
                       </Tag>
                     ))}
                  </Wrap>
               </Box>

               <FormControl>
                  <FormLabel fontWeight="800">Welcome Note to First-Time Seekers</FormLabel>
                  <Textarea value={profile.welcome_note} onChange={(e) => setProfile({...profile, welcome_note: e.target.value})} borderRadius="xl" placeholder="A reassuring message for those new to therapy..." />
               </FormControl>
               <Divider my={6} />
                <Flex justify="flex-end">
                  <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 8. Internal Matching */}
          <TabPanel px={{ base: 2, md: 10 }}>
            <VStack align="stretch" spacing={8}>
               <Box bg="red.50" p={{ base: 6, md: 10 }} borderRadius={{ base: "2xl", md: "3rem" }} border="1px dashed" borderColor="red.200">
                  <Stack direction={{ base: "column", sm: "row" }} color="red.600" mb={6} align={{ base: "start", sm: "center" }} spacing={4}>
                    <Icon as={FiAlertCircle} boxSize={6} />
                    <Heading size={{ base: "sm", md: "md" }}>Clinical Governance & Ethics</Heading>
                  </Stack>
                  
                  <Text fontSize={{ base: "xs", md: "sm" }} color="red.700" mb={8} fontWeight="500" lineHeight="tall">
                     These details are periodically reviewed for maintaining ethical and standardised practices. False or incomplete information may be flagged and lead to therapist removal from the platform.
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }} mb={8}>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Collaborating Psychiatrist</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.psychiatrist} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, psychiatrist: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Primary Emergency Hospital</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.hospital} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, hospital: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Hospital Location</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.location} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, location: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Emergency Contact</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.contact} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, contact: e.target.value}})} />
                     </FormControl>
                  </SimpleGrid>

                  <FormControl>
                     <FormLabel fontWeight="700">Internal Matching Notes</FormLabel>
                     <Textarea bg="white" placeholder="Best fit cases, specific exclusion patterns, etc." value={profile.best_fit_notes} onChange={(e) => setProfile({...profile, best_fit_notes: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <Divider my={{ base: 6, md: 10 }} />
                  <Flex justify="center" pt={6}>
                    <Button 
                      leftIcon={<FiSave />} 
                      size="lg" 
                      bg="#56756D" 
                      color="white" 
                      borderRadius="full" 
                      px={{ base: 10, md: 16 }} 
                      py={{ base: 7, md: 8 }}
                      onClick={() => handleSave()} 
                      isLoading={loading} 
                      shadow="2xl" 
                      w={{ base: "full", md: "auto" }}
                      _hover={{ bg: '#455c56', transform: 'translateY(-2px)', shadow: 'xl' }}
                      _active={{ transform: 'translateY(0)' }}
                      transition="all 0.3s"
                      fontSize={{ base: "md", md: "lg" }}
                    >
                      Finalize & Sync Profile
                    </Button>
                  </Flex>
               </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Box p={{ base: 6, md: 8 }} mt={10} bg="#56756D" borderRadius="3xl" color="white" shadow="2xl">
         <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
            <VStack align="start" spacing={0}>
               <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>Commit Changes to Public Profile</Text>
               <Text fontSize="sm" opacity="0.8">This will immediately update your crawlable public page and matching score.</Text>
            </VStack>
            <Button size="lg" bg="white" color="mlc.greenDark" borderRadius="full" px={12} onClick={handleSave} isLoading={loading} w={{ base: "full", md: "auto" }} flexShrink={0}>Sync Now</Button>
         </Flex>
      </Box>
      <TherapistSubscriptionGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate Basic to make your profile visible, sync updates, and start receiving matched clients."
      />
    </Box>
  );
}
