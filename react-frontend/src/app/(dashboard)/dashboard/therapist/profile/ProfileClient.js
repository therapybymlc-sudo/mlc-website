'use client'

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box, Flex, VStack, HStack, Heading, Text, Input, Button, FormControl, FormLabel, SimpleGrid, useToast, Icon, Avatar, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Stack, Select, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tag, TagLabel, TagCloseButton, Divider, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Wrap, WrapItem, Spinner,
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe, FiBriefcase, FiZap, FiX
} from "react-icons/fi";
import { apiGet, apiPut, apiPost, apiPatch, apiPatchForm } from "../../../../../api.js";
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
    highest_qualification: "",
    qualification_title: "",
    highest_qualification_proof: null,
    resume_file: null,
    linkedin_url: "",
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
    clinical_judgment_answers: {
      first_10_min_response: "",
      stalled_therapy_case: "",
      scope_and_referral_judgment: "",
      suicidal_ideation_response: "",
      difficult_clients_self_management: "",
    },
    
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
    best_fit_notes: "",

    // 10. Supervisor Application
    supervision_bio: "",
    supervision_areas: [],
    supervision_modalities: [],
    supervision_years_experience: 0,
    supervision_application_answers: {
      current_supervisee_experience: "",
      supervision_modalities_experience: "",
      difficult_supervision_areas: "",
      scope_and_escalation_judgment: "",
      high_risk_case_supervision: "",
      feedback_and_rupture_repair: "",
      supervisor_self_reflection: "",
    },

    // 11. Vetting & Status
    profile_status: "draft",
    is_initially_published: false,
    admin_feedback: "",
    supervision_status: "none",
    supervisor_admin_feedback: "",
    
    // Physical Space Support
    has_physical_space: false,
    physical_space_images: [],
    physical_space_location: "",
    physical_space_notes: "",
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
      setTabIndex((prev) => (prev + 1) % 9);
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

  const handleSubmitSupervisionApplication = async () => {
    if (!requireBasicAccess()) return;
    const saved = await handleSave(false);
    if (!saved) return;
    setLoading(true);
    try {
      const response = await apiPost("therapists/submit-supervision-application/", {});
      toast({
        title: "Supervision application submitted",
        description: "Your existing therapist profile and supervision responses were sent together. Feel free to further edit your therapist profile to reflect your experience and growth.",
        status: "success",
        duration: 6000,
      });
    } catch (error) {
      const detail = error?.response?.data?.detail || "Could not submit supervision application.";
      const missing = error?.response?.data?.missing_fields;
      toast({
        title: "Submission blocked",
        description: Array.isArray(missing) && missing.length ? `${detail} Missing: ${missing.join(", ")}` : detail,
        status: "warning",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef(null);
  const qualificationProofRef = useRef(null);
  const resumeFileRef = useRef(null);

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

  const handleProfileFileUpload = async (fieldName, file) => {
    if (!profile.id || !file) return;
    const formDataUpload = new FormData();
    formDataUpload.append(fieldName, file);
    setLoading(true);
    try {
      const updated = await apiPatchForm(`therapists/${profile.id}/`, formDataUpload);
      setProfile((prev) => ({ ...prev, ...updated }));
      toast({ title: "File uploaded", status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Upload failed", description: "Please try again.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleArray = (field, item) => {
    const current = profile[field] || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setProfile({...profile, [field]: updated});
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      await apiPost("therapists/submit-for-review/", {});
      toast({ title: "Submitted", description: "Your profile is now under review.", status: "success" });
      // Refresh to get updated status
      const data = await apiGet("therapists/me/");
      setProfile(prev => ({ ...prev, ...data }));
    } catch (error) {
      const detail = error?.response?.data?.detail || "Could not submit.";
      const missing = error?.response?.data?.missing_fields;
      toast({
        title: "Submission failed",
        description: Array.isArray(missing) ? `${detail} Missing: ${missing.join(", ")}` : detail,
        status: "error"
      });
    } finally {
      setLoading(false);
    }
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
      <input
        type="file"
        ref={qualificationProofRef}
        style={{ display: "none" }}
        onChange={(e) => handleProfileFileUpload("highest_qualification_proof", e.target.files?.[0])}
      />
      <input
        type="file"
        ref={resumeFileRef}
        style={{ display: "none" }}
        onChange={(e) => handleProfileFileUpload("resume_file", e.target.files?.[0])}
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
           <HStack spacing={4} w={{ base: "full", md: "auto" }}>
              {/* Submit for Review Button - Shown when not approved */}
              {(profile.profile_status === 'draft' || profile.profile_status === 'changes_requested') && (
                <Button 
                  leftIcon={<FiZap />} 
                  bg="#C9A960" 
                  color="white" 
                  px={8} 
                  borderRadius="full" 
                  onClick={handleSubmitForReview} 
                  isLoading={loading}
                  _hover={{ bg: '#b39655' }}
                  shadow="lg"
                  w={{ base: "full", md: "auto" }}
                >
                  Submit for Review
                </Button>
              )}

              {/* Sync Button - Only active when approved */}
              <Button 
                leftIcon={<FiSave />} 
                bg={profile.profile_status === 'approved' ? "#56756D" : "gray.300"} 
                color="white" 
                px={10} 
                borderRadius="full" 
                onClick={() => requireBasicAccess(() => handleSave())} 
                isLoading={loading} 
                isDisabled={profile.profile_status !== 'approved'}
                _hover={{ bg: profile.profile_status === 'approved' ? '#C9A960' : "gray.300" }} 
                shadow="xl" 
                w={{ base: "full", md: "auto" }} 
                flexShrink={0}
                title={profile.profile_status !== 'approved' ? "Syncing is locked until your profile is approved by an administrator." : ""}
              >
                Finalize & Sync
              </Button>
           </HStack>
        </Flex>

        {/* 🔹 Vetting Status Banner */}
        {profile.profile_status === 'changes_requested' && (
          <Alert status="error" borderRadius="2xl" shadow="lg" border="1px solid" borderColor="red.200">
            <AlertIcon boxSize={5} />
            <Box flex="1">
              <AlertTitle fontWeight="bold">Action Required: Administrator Comments</AlertTitle>
              <AlertDescription display="block" mt={1} fontSize="sm" fontStyle="italic">
                "{profile.admin_feedback || "Please review your profile details and resubmit."}"
              </AlertDescription>
            </Box>
            <Button size="sm" bg="red.500" color="white" onClick={handleSubmitForReview} _hover={{ bg: 'red.600' }} ml={4}>Resubmit Now</Button>
          </Alert>
        )}

        {profile.profile_status === 'submitted' && (
          <Alert status="info" borderRadius="2xl" bg="blue.50" border="1px solid" borderColor="blue.100">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Profile Under Review</AlertTitle>
              <AlertDescription fontSize="sm">
                Our clinical team is reviewing your profile. You will receive an email once it is approved.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {profile.profile_status === 'awaiting_contract' && (
          <Alert status="success" borderRadius="2xl" bg="teal.50" border="1px solid" borderColor="teal.100">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Content Approved!</AlertTitle>
              <AlertDescription fontSize="sm">
                Your profile has passed review. Your contract to become a published therapist with MLC is waiting for you in your registered email. Once signed, your profile will go live.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {profile.profile_status === 'approved' && (
          <Alert status="success" borderRadius="2xl" bg="green.50" border="1px solid" borderColor="green.100">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Profile is Live & Published</AlertTitle>
              <AlertDescription fontSize="sm">
                Your profile is now public. You can sync updates any time using the button above.
              </AlertDescription>
            </Box>
          </Alert>
        )}

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
        <Alert status="info" borderRadius="xl" bg="blue.50">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Profile Completion Guide</AlertTitle>
            <AlertDescription fontSize="sm">
              Complete each tab in order. To submit for clinical review, you must add your highest qualification, LinkedIn, qualification proof, CV/resume, and all Clinical Judgment answers.
            </AlertDescription>
          </Box>
        </Alert>
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
          <Tab whiteSpace="nowrap" flexShrink={0} borderRadius="xl" px={{ base: 4, md: 8 }} mr={2} border="1px solid" borderColor="gray.100" fontSize={{ base: "xs", md: "sm" }}><Icon as={FiAlertCircle} mr={2}/> Clinical Judgment</Tab>
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
                    <Text fontSize="xs" color="gray.500" mt={2}>Keep this specific. 8-14 words works best for discoverability.</Text>
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
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">Highest Qualification</FormLabel>
                    <Input placeholder="e.g. Ph.D, M.Phil" value={profile.highest_qualification || profile.qualification_highest || ""} onChange={(e) => setProfile({...profile, highest_qualification: e.target.value, qualification_highest: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">LinkedIn Profile URL</FormLabel>
                    <Input placeholder="https://www.linkedin.com/in/your-profile" value={profile.linkedin_url || ""} onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})} borderRadius="xl" />
                    <Text fontSize="xs" color="gray.500" mt={2}>Use your full profile URL so admin can verify credentials faster.</Text>
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
                    <Input type="number" value={profile.years_experience ?? profile.experience_years ?? 0} onChange={(e) => setProfile({...profile, years_experience: e.target.value, experience_years: e.target.value})} borderRadius="xl" />
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
                  <Text fontSize="xs" color="gray.400" mb={4}>Highest qualification proof and CV/Resume are required before review.</Text>
                  <HStack justify="center" spacing={3}>
                    <Button size="sm" colorScheme="teal" variant="outline" onClick={() => qualificationProofRef.current?.click()}>
                      Upload Qualification Proof
                    </Button>
                    <Button size="sm" colorScheme="teal" variant="outline" onClick={() => resumeFileRef.current?.click()}>
                      Upload CV / Resume
                    </Button>
                  </HStack>
                  <VStack mt={4} spacing={1}>
                    <Text fontSize="xs" color={profile.highest_qualification_proof ? "green.600" : "red.500"}>
                      Qualification proof: {profile.highest_qualification_proof ? "uploaded" : "missing"}
                    </Text>
                    <Text fontSize="xs" color={profile.resume_file ? "green.600" : "red.500"}>
                      CV / Resume: {profile.resume_file ? "uploaded" : "missing"}
                    </Text>
                  </VStack>
                  <Text fontSize="xs" color="gray.500" mt={3}>
                    Accepted: PDF, DOC, DOCX, JPG, PNG. Upload clear and readable files.
                  </Text>
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
                  <Text fontSize="xs" color="gray.500" mb={3}>Select only groups you actively work with in current practice.</Text>
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
                 <Text fontSize="xs" color="gray.500" mb={3}>
                   Mark at least 5 concerns to help matching quality and reduce client mismatch.
                 </Text>
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
          {/* 5. Clinical Judgment (Internal Only) */}
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Alert status="warning" borderRadius="xl">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Internal Clinical Vetting Only</AlertTitle>
                  <AlertDescription fontSize="xs">
                    These answers are required for MLC internal review and are never shown on your public profile.
                  </AlertDescription>
                </Box>
              </Alert>
              <Text fontSize="xs" color="gray.500">
                Write concrete, real-case style answers. One-line answers are usually returned for revision.
              </Text>
              <FormControl isRequired>
                <FormLabel fontWeight="700">A client says: "I feel stuck and don’t know what’s wrong with me." How would you respond in the first 10 minutes?</FormLabel>
                <Textarea minH="140px" value={profile.clinical_judgment_answers?.first_10_min_response || ""} onChange={(e) => setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), first_10_min_response: e.target.value } })} borderRadius="xl" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="700">Describe a case where therapy was not progressing. What did you do?</FormLabel>
                <Textarea minH="140px" value={profile.clinical_judgment_answers?.stalled_therapy_case || ""} onChange={(e) => setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), stalled_therapy_case: e.target.value } })} borderRadius="xl" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="700">When would you decide a client is outside your scope and refer out?</FormLabel>
                <Textarea minH="140px" value={profile.clinical_judgment_answers?.scope_and_referral_judgment || ""} onChange={(e) => setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), scope_and_referral_judgment: e.target.value } })} borderRadius="xl" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="700">Briefly describe how you assess and respond to suicidal ideation in a client.</FormLabel>
                <Textarea minH="140px" value={profile.clinical_judgment_answers?.suicidal_ideation_response || ""} onChange={(e) => setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), suicidal_ideation_response: e.target.value } })} borderRadius="xl" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="700">What kind of clients do you find difficult to work with, and how do you manage that?</FormLabel>
                <Textarea minH="140px" value={profile.clinical_judgment_answers?.difficult_clients_self_management || ""} onChange={(e) => setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), difficult_clients_self_management: e.target.value } })} borderRadius="xl" />
              </FormControl>
              <Flex justify="flex-end">
                <Button rightIcon={<FiZap />} bg="#56756D" color="white" borderRadius="full" px={10} onClick={handleSaveAndNext} isLoading={loading}>Save & Continue</Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* 6. Approach */}
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
                     <Text fontSize="xs" color="gray.500" mt={2}>If you offer in-person sessions, add exact locality and city.</Text>
                  </FormControl>

                  <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100">
                    <VStack align="stretch" spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" fontWeight="700">I have a physical therapy room / clinic space</FormLabel>
                        <Checkbox isChecked={profile.has_physical_space} onChange={(e) => setProfile({...profile, has_physical_space: e.target.checked})} />
                      </FormControl>
                      
                      {profile.has_physical_space && (
                        <VStack align="stretch" spacing={4} pt={2}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Full Physical Address</FormLabel>
                            <Textarea 
                              bg="white" 
                              placeholder="Complete address for in-person clients..." 
                              value={profile.physical_space_location || ""} 
                              onChange={(e) => setProfile({...profile, physical_space_location: e.target.value})} 
                              borderRadius="xl"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Clinic / Room Images (URLs)</FormLabel>
                            <Textarea 
                              bg="white" 
                              placeholder="Add image URLs (comma separated) or describe the space..." 
                              value={Array.isArray(profile.physical_space_images) ? profile.physical_space_images.join(", ") : ""} 
                              onChange={(e) => setProfile({...profile, physical_space_images: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} 
                              borderRadius="xl"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>Visuals help clients feel safe before their first session.</Text>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Notes for In-Person Clients</FormLabel>
                            <Textarea 
                              bg="white" 
                              placeholder="Entry instructions, parking, waiting area info..." 
                              value={profile.physical_space_notes || ""} 
                              onChange={(e) => setProfile({...profile, physical_space_notes: e.target.value})} 
                              borderRadius="xl"
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>
                  </Box>
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
                  <Text fontSize="xs" color="gray.500" mt={2}>Include training background, populations served, and therapeutic style.</Text>
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

                  <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="orange.200">
                    <VStack align="stretch" spacing={5}>
                      <Heading size="sm" color="orange.700">Supervisor Licensing Application</Heading>
                      <Text fontSize="xs" color="gray.600">
                        Use this section only if you are applying to supervise other therapists. Minimum eligibility is 5+ years experience.
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Years Supervising (formal/informal)</FormLabel>
                          <Input
                            type="number"
                            bg="white"
                            value={profile.supervision_years_experience || 0}
                            onChange={(e) => setProfile({ ...profile, supervision_years_experience: e.target.value })}
                            borderRadius="xl"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Supervision Areas</FormLabel>
                          <Input
                            placeholder="e.g. Trauma cases, Case formulation, Ethics"
                            bg="white"
                            value={Array.isArray(profile.supervision_areas) ? profile.supervision_areas.join(", ") : ""}
                            onChange={(e) => setProfile({ ...profile, supervision_areas: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                            borderRadius="xl"
                          />
                        </FormControl>
                      </SimpleGrid>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Supervision Modalities You Can Supervise In</FormLabel>
                        <Input
                          placeholder="e.g. CBT, DBT, Psychodynamic, Couples therapy"
                          bg="white"
                          value={Array.isArray(profile.supervision_modalities) ? profile.supervision_modalities.join(", ") : ""}
                          onChange={(e) => setProfile({ ...profile, supervision_modalities: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                          borderRadius="xl"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Supervision Philosophy / Bio</FormLabel>
                        <Textarea
                          bg="white"
                          value={profile.supervision_bio || ""}
                          onChange={(e) => setProfile({ ...profile, supervision_bio: e.target.value })}
                          borderRadius="xl"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">What is your current supervisee experience (types of supervisees, stages, case complexity)?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.current_supervisee_experience || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), current_supervisee_experience: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">What modalities do you have direct experience supervising in, and how do you guide fidelity?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.supervision_modalities_experience || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), supervision_modalities_experience: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Which parts of supervision feel most difficult for you, and how do you work through them?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.difficult_supervision_areas || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), difficult_supervision_areas: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">When would you escalate, pause, or reassign a supervisee case due to scope/safety concerns?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.scope_and_escalation_judgment || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), scope_and_escalation_judgment: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Describe how you supervise high-risk situations (self-harm, suicidality, severe deterioration).</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.high_risk_case_supervision || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), high_risk_case_supervision: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">How do you give difficult feedback and repair rupture when supervisees become defensive or disengaged?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.feedback_and_rupture_repair || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), feedback_and_rupture_repair: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">What is your current growth edge as a supervisor, and how are you actively improving it?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.supervisor_self_reflection || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), supervisor_self_reflection: e.target.value } })} borderRadius="xl" />
                      </FormControl>

                      {profile.supervision_status === 'pending' && (
                        <Alert status="info" borderRadius="xl">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">Supervision Application Under Review</AlertTitle>
                            <AlertDescription fontSize="xs">We are reviewing your eligibility for supervisor licensing.</AlertDescription>
                          </Box>
                        </Alert>
                      )}

                      {profile.supervision_status === 'awaiting_contract' && (
                        <Alert status="success" borderRadius="xl">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">Supervision Approved (Awaiting Contract)</AlertTitle>
                            <AlertDescription fontSize="xs">Your supervision contract has been sent to your email. Please sign it to activate your supervisor license.</AlertDescription>
                          </Box>
                        </Alert>
                      )}

                      {profile.supervision_status === 'approved' && (
                        <Alert status="success" borderRadius="xl" bg="green.50">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">Licensed MLC Supervisor</AlertTitle>
                            <AlertDescription fontSize="xs">You are now authorized to supervise other clinicians on the platform.</AlertDescription>
                          </Box>
                        </Alert>
                      )}

                      {profile.supervisor_admin_feedback && (
                         <Alert status="warning" borderRadius="xl">
                            <AlertIcon />
                            <Box>
                               <AlertTitle fontSize="sm">Reviewer Feedback</AlertTitle>
                               <AlertDescription fontSize="xs">"{profile.supervisor_admin_feedback}"</AlertDescription>
                            </Box>
                         </Alert>
                      )}

                      <HStack justify="flex-end" w="full">
                        {Number(profile.experience_years) < 5 && (
                          <Text fontSize="xs" color="orange.600" fontWeight="bold">
                            Minimum 5 years post-qualification experience required for supervisor eligibility.
                          </Text>
                        )}
                        <Button 
                          colorScheme="orange" 
                          borderRadius="full" 
                          onClick={handleSubmitSupervisionApplication} 
                          isLoading={loading}
                          isDisabled={['pending', 'awaiting_contract', 'approved'].includes(profile.supervision_status) || Number(profile.experience_years) < 5}
                        >
                          {profile.supervision_status === 'approved' ? "Licensed Supervisor" : "Submit Supervision Application"}
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
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
