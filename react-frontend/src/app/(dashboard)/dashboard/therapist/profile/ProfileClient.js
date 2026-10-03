'use client'

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box, Flex, VStack, HStack, Heading, Text, Input, Button, FormControl, FormLabel, FormErrorMessage, SimpleGrid, useToast, Icon, Avatar, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Stack, Select, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tag, TagLabel, TagCloseButton, Divider, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Wrap, WrapItem, Spinner, Circle, Menu, MenuButton, MenuList, MenuItem
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe, FiBriefcase, FiZap, FiX, FiCheck, FiChevronDown, FiArrowRight, FiArrowLeft
} from "react-icons/fi";
import { apiGet, apiPut, apiPost, apiPatchForm } from "../../../../../api.js";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
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

const PROFILE_TABS = [
  { icon: FiUser, label: 'Identity' },
  { icon: FiAward, label: 'Credentials' },
  { icon: FiUsers, label: 'Populations' },
  { icon: FiTarget, label: 'Clinical Scope' },
  { icon: FiAlertCircle, label: 'Clinical Judgment' },
  { icon: FiHeart, label: 'Therapeutic Approach' },
  { icon: FiClock, label: 'Availability' },
  { icon: FiBook, label: 'Bio & Media' },
  { icon: FiSettings, label: 'Internal Matching' },
];

/* =========================================
   Modern Select Dropdown Component
========================================= */
function ModernSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  isDisabled = false,
  w = "full",
  minW = "160px",
  size = "md"
}) {
  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
  const selectedOption = formattedOptions.find((o) => String(o.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasValue = !!selectedOption && selectedOption.value !== "";
  const isSm = size === "sm";

  return (
    <Menu placement="bottom-start" matchWidth autoSelect={false}>
      {({ isOpen }) => (
        <Box w={w}>
          <MenuButton
            as={Button}
            isDisabled={isDisabled}
            w="full"
            h={isSm ? "34px" : "40px"}
            px={isSm ? 2.5 : 3.5}
            borderRadius="xl"
            bg={isOpen ? "white" : "rgba(250, 248, 245, 0.85)"}
            border="1px solid"
            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
            boxShadow={isOpen ? "0 0 0 1px #56756D" : "none"}
            _hover={!isDisabled ? { bg: "white", borderColor: "#56756D" } : {}}
            _active={!isDisabled ? { bg: "white" } : {}}
            textAlign="left"
            rightIcon={
              <Icon
                as={FiChevronDown}
                transition="transform 0.2s"
                transform={isOpen ? "rotate(180deg)" : "none"}
                color={isDisabled ? "#A0AEC0" : "#56756D"}
                boxSize={isSm ? "12px" : "14px"}
              />
            }
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text
              as="span"
              fontSize={isSm ? "12px" : "13px"}
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontWeight={hasValue ? "500" : "400"}
              color={isDisabled ? "#A0AEC0" : hasValue ? "#263A33" : "#718096"}
              isTruncated
            >
              {displayText}
            </Text>
          </MenuButton>
          <MenuList
            bg="white"
            borderRadius="xl"
            p={1.5}
            border="1px solid rgba(86, 117, 109, 0.15)"
            boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
            zIndex={1500}
            minW={minW}
            maxH="240px"
            overflowY="auto"
          >
            {formattedOptions.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <MenuItem
                  key={opt.value || opt.label}
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="13px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight={active ? "600" : "500"}
                  color={active ? "#263A33" : "#5A6E65"}
                  bg={active ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                  _hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}
                  onClick={() => onChange && onChange(opt.value)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="span" isTruncated>{opt.label}</Text>
                  {active && <Icon as={FiCheck} color="#56756D" boxSize="13px" />}
                </MenuItem>
              );
            })}
          </MenuList>
        </Box>
      )}
    </Menu>
  );
}

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
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";
  const clerkName = user?.fullName || user?.firstName || "Therapist";

  const THERAPIST_FILE_FIELDS = new Set([
    "resume_file",
    "highest_qualification_proof",
    "profile_image",
  ]);

  const buildProfilePayload = (sourceProfile) => {
    const payload = { ...sourceProfile, email: sourceProfile.email || clerkEmail, name: sourceProfile.name || clerkName };
    for (const key of THERAPIST_FILE_FIELDS) {
      delete payload[key];
    }
    delete payload.user;
    // Retain profile_image and profile_image_url so direct PostgreSQL route persists them
    const img = sourceProfile.profile_image || sourceProfile.profile_image_url || sourceProfile.imageUrl;
    if (img) {
      payload.profile_image = img;
      payload.profile_image_url = img;
    }
    return payload;
  };

  const syncTherapistProfile = async () => {
    // 1. Try fetching full extended profile directly from PostgreSQL database route
    try {
      const q = clerkEmail ? `email=${encodeURIComponent(clerkEmail)}` : (profile?.id ? `id=${profile.id}` : '');
      if (q) {
        const res = await fetch(`/api/profile/therapist?${q}`);
        if (res.ok) {
          const dbData = await res.json();
          if (dbData?.id) {
            setProfile((prev) => ({ ...prev, ...dbData }));
            return dbData;
          }
        }
      }
    } catch (dbErr) {
      console.warn("Direct DB fetch notice:", dbErr);
    }

    // 2. Fallback to Django API
    try {
      const data = await apiGet("therapists/me/");
      if (data?.id) {
        setProfile((prev) => ({ ...prev, ...data }));
        return data;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    if (!clerkEmail) {
      throw new Error("Add your primary email in Clerk account settings, then refresh.");
    }

    try {
      await apiPost("onboard/", { role: "therapist" });
    } catch (onboardErr) {
      const status = onboardErr?.response?.status;
      if (status !== 400 && status !== 403) {
        throw onboardErr;
      }
    }

    try {
      const created = await apiGet("therapists/me/");
      if (created?.id) {
        setProfile((prev) => ({ ...prev, ...created }));
        return created;
      }
    } catch (_) {
      /* fall through to explicit create */
    }

    const created = await apiPost("therapists/", buildProfilePayload(profile));
    setProfile((prev) => ({ ...prev, ...created }));
    return created;
  };

  useEffect(() => {
    if (!isMounted || !isUserLoaded) return;
    
    const fetchProfile = async () => {
      try {
        await syncTherapistProfile();
      } catch (error) {
        if (error.response?.status === 404) {
          if (clerkEmail) setProfile((prev) => ({ ...prev, email: clerkEmail }));
        } else {
          console.error("Profile sync error:", error);
        }
      }
    };
    fetchProfile();
  }, [isMounted, isUserLoaded, clerkEmail]);

  const handleSave = async (showToast = true) => {
    setLoading(true);
    try {
      let activeProfile = profile;
      if (!activeProfile.id && clerkEmail) {
        activeProfile = await syncTherapistProfile();
      }
      const payload = buildProfilePayload(activeProfile);

      // 1. Direct PostgreSQL Persistence: Immediately updates all 89 fields in database
      let dbUpdated = null;
      try {
        const dbRes = await fetch("/api/profile/therapist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            id: activeProfile.id,
            email: activeProfile.email || clerkEmail,
          }),
        });
        if (dbRes.ok) {
          dbUpdated = await dbRes.json();
        }
      } catch (dbErr) {
        console.warn("Direct DB save notice:", dbErr);
      }

      // 2. Background sync to Django API (resilient)
      try {
        if (activeProfile.id) {
          await apiPut(`therapists/${activeProfile.id}/`, payload);
        }
      } catch (djangoErr) {
        console.warn("Django background sync notice:", djangoErr);
      }

      const merged = dbUpdated || activeProfile;
      setProfile((prev) => ({ ...prev, ...merged }));
      if (showToast) toast({ title: "Profile Synced & Saved ✓", status: "success", duration: 2500 });
      return true;
    } catch (error) {
      const detail = error?.response?.data?.email?.[0] || error?.response?.data?.detail || error?.message || "Please try again.";
      toast({ title: "Sync failed", description: detail, status: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateTab = (idx) => {
    const newErrors = {};

    if (idx === 0) {
      // 1. Identity
      if (!profile.name?.trim()) {
        newErrors.name = "Full name is required.";
      }
      if (!profile.headline?.trim()) {
        newErrors.headline = "Public headline is required.";
      }
    } else if (idx === 1) {
      // 2. Credentials (all fields are strictly mandatory)
      const qual = (profile.highest_qualification || profile.qualification_highest || "").trim();
      if (!qual) {
        newErrors.highest_qualification = "Highest qualification is required.";
      }
      if (!profile.linkedin_url?.trim()) {
        newErrors.linkedin_url = "LinkedIn profile URL is required.";
      }
      if (!profile.qualification_title?.trim()) {
        newErrors.qualification_title = "Degree title is required.";
      }
      if (!profile.university?.trim()) {
        newErrors.university = "University / Institution is required.";
      }
      const year = profile.year_completed;
      if (year === null || year === undefined || String(year).trim() === "") {
        newErrors.year_completed = "Year completed is required.";
      }
      const expYears = profile.years_experience ?? profile.experience_years;
      if (expYears === null || expYears === undefined || String(expYears).trim() === "") {
        newErrors.years_experience = "Total years of experience is required.";
      }
      const postQual = profile.experience_post_qual;
      if (postQual === null || postQual === undefined || String(postQual).trim() === "") {
        newErrors.experience_post_qual = "Post-qualification years is required.";
      }
      if (!profile.license_details?.trim()) {
        newErrors.license_details = "License / registration details are required.";
      }
    } else if (idx === 4) {
      // 5. Clinical Judgment (all 5 questions are strictly mandatory)
      const answers = profile.clinical_judgment_answers || {};
      if (!answers.first_10_min_response?.trim()) {
        newErrors.first_10_min_response = "Please answer how you respond in the first 10 minutes.";
      }
      if (!answers.stalled_therapy_case?.trim()) {
        newErrors.stalled_therapy_case = "Please describe a case where therapy was not progressing.";
      }
      if (!answers.scope_and_referral_judgment?.trim()) {
        newErrors.scope_and_referral_judgment = "Please explain when you decide a client is outside your scope.";
      }
      if (!answers.suicidal_ideation_response?.trim()) {
        newErrors.suicidal_ideation_response = "Please outline how you assess and respond to suicidal ideation.";
      }
      if (!answers.difficult_clients_self_management?.trim()) {
        newErrors.difficult_clients_self_management = "Please describe how you manage difficult client dynamics.";
      }
    } else if (idx === 5) {
      // 6. Therapeutic Approach
      if (!profile.primary_orientation?.trim()) {
        newErrors.primary_orientation = "Primary therapeutic modality is required.";
      }
    } else if (idx === 6) {
      // 7. Availability
      if (profile.has_physical_space && !profile.physical_space_location?.trim()) {
        newErrors.physical_space_location = "Physical space address is required when clinic space is enabled.";
      }
    } else if (idx === 7) {
      // 8. Bio & Media
      if (!profile.bio?.trim()) {
        newErrors.bio = "Professional bio is required.";
      }
    } else if (idx === 8) {
      // 9. Internal Matching
      const protocols = profile.risk_protocols || {};
      if (!protocols.psychiatrist?.trim()) {
        newErrors.psychiatrist = "Collaborating psychiatrist details are required.";
      }
      if (!protocols.hospital?.trim()) {
        newErrors.hospital = "Primary emergency hospital is required.";
      }
      if (!protocols.location?.trim()) {
        newErrors.location = "Hospital location is required.";
      }
      if (!protocols.contact?.trim()) {
        newErrors.contact = "Emergency contact is required.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const handleTabChange = (newIndex) => {
    if (newIndex > tabIndex) {
      const isValid = validateTab(tabIndex);
      if (!isValid) {
        toast({
          title: "Required Fields Missing",
          description: "Please complete all fields marked with an asterisk (*) before continuing.",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
        setTimeout(() => {
          const firstErrorEl = document.querySelector('[aria-invalid="true"]');
          if (firstErrorEl) {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorEl.focus?.();
          }
        }, 80);
        return;
      }
    }
    setTabIndex(newIndex);
  };

  const handlePrevTab = () => {
    setTabIndex((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndNext = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const isValid = validateTab(tabIndex);
    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete all fields marked with an asterisk (*) before continuing.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[aria-invalid="true"]');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus?.();
        }
      }, 80);
      return;
    }

    // Auto-save draft in the background so inputs are persisted to database
    handleSave(false).catch((err) => {
      console.warn("Draft auto-save notice:", err);
    });

    // Advance smoothly to next section without full page refresh
    setTabIndex((prev) => Math.min(8, prev + 1));
    toast({ title: "Progress Saved", status: "success", duration: 1200 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload via Next.js API route (saves to Clerk CDN & PostgreSQL database)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      if (clerkEmail || profile?.email) {
        uploadFormData.append("email", profile?.email || clerkEmail);
      }
      if (profile?.id) {
        uploadFormData.append("therapistId", String(profile.id));
      }
      if (user?.id) {
        uploadFormData.append("userId", String(user.id));
      }

      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: uploadFormData,
      });

      const resData = await res.json().catch(() => ({}));
      if (resData?.imageUrl) {
        const newImgUrl = resData.imageUrl;
        setProfile((prev) => ({
          ...prev,
          profile_image: newImgUrl,
          profile_image_url: newImgUrl,
          imageUrl: newImgUrl,
        }));

        // Immediately persist directly to PostgreSQL database
        try {
          await fetch("/api/profile/therapist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: profile?.id,
              email: profile?.email || clerkEmail,
              profile_image: newImgUrl,
              profile_image_url: newImgUrl,
            }),
          });
        } catch (dbErr) {
          console.warn("Direct DB avatar sync notice:", dbErr);
        }
      }

      // 2. Also update Clerk client user object directly if available
      if (user && typeof user.setProfileImage === "function") {
        try {
          await user.setProfileImage({ file });
        } catch (clerkErr) {
          console.warn("Clerk user.setProfileImage notice:", clerkErr);
        }
      }

      // 3. Fallback sync to Django backend
      try {
        await syncTherapistProfile();
        const formDataUpload = new FormData();
        formDataUpload.append("profile_image", file);
        const updated = await apiPatchForm("therapists/me/", formDataUpload);
        setProfile((prev) => ({ ...prev, ...updated }));
      } catch (djangoErr) {
        console.warn("Django therapist photo patch notice (handled by DB route):", djangoErr);
      }

      toast({
        title: "Photo updated",
        description: "Your profile picture has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Profile image updated reactively in state — no window reload needed
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || "Upload failed";
      toast({ title: "Upload failed", description: detail, status: "error", duration: 6000, isClosable: true });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfileFileUpload = async (fieldName, file) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append(fieldName, file);
    setLoading(true);
    try {
      await syncTherapistProfile();
      const updated = await apiPatchForm("therapists/me/", formDataUpload);
      setProfile((prev) => ({ ...prev, ...updated }));
      toast({ title: "File uploaded", status: "success", duration: 2000 });
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || "Please try again.";
      toast({ title: "Upload failed", description: detail, status: "error" });
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
    if (!requireBasicAccess()) return;
    const isValid = validateTab(tabIndex);
    if (!isValid) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete all fields marked with an asterisk (*) before submitting.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[aria-invalid="true"]');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus?.();
        }
      }, 80);
      return;
    }

    setLoading(true);
    try {
      const saved = await handleSave(false);
      if (!saved) {
        setLoading(false);
        return;
      }
      await apiPost("therapists/submit-for-review/", {});
      toast({
        title: "Submitted for Review",
        description: "Your profile has been submitted to the clinical team for vetting.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      // Update status in PostgreSQL DB directly
      try {
        await fetch("/api/profile/therapist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: profile.id,
            email: profile.email || clerkEmail,
            profile_status: "submitted",
          }),
        });
      } catch (e) {
        console.warn("Direct DB status update notice:", e);
      }

      // Refresh to get updated status
      await syncTherapistProfile();
    } catch (error) {
      const detail = error?.response?.data?.detail || "Could not submit.";
      const missing = error?.response?.data?.missing_fields;
      toast({
        title: "Submission failed",
        description: Array.isArray(missing) ? `${detail} Missing: ${missing.join(", ")}` : detail,
        status: "error",
        duration: 6000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !isUserLoaded) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" thickness="3px" color="#56756D" />
          <Text color="#5A6E65" fontSize="13px" fontWeight="500">Loading Clinical Identity Hub...</Text>
        </VStack>
      </Box>
    );
  }

  const statusLabel = 
    profile.profile_status === 'approved'
      ? 'LIVE & PUBLISHED'
      : profile.profile_status === 'submitted'
      ? 'UNDER CLINICAL REVIEW'
      : profile.profile_status === 'awaiting_contract'
      ? 'AWAITING CONTRACT'
      : profile.profile_status === 'changes_requested'
      ? 'ACTION REQUIRED'
      : 'DRAFT IN PROGRESS';

  const statusBadgeBg =
    profile.profile_status === 'approved'
      ? 'rgba(56, 161, 105, 0.12)'
      : profile.profile_status === 'changes_requested'
      ? 'rgba(239, 68, 68, 0.12)'
      : 'rgba(86, 117, 109, 0.12)';

  const statusBadgeColor =
    profile.profile_status === 'approved'
      ? '#2F855A'
      : profile.profile_status === 'changes_requested'
      ? '#DC2626'
      : '#56756D';

  return (
    <Box 
      maxW="1240px" 
      mx="auto" 
      fontFamily="'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      pb={12}
      sx={{
        "input, textarea, select, option, button, .chakra-input, .chakra-select, .chakra-textarea": {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
        },
        "input, textarea, select": {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontSize: "13px !important",
          fontWeight: "500 !important",
          color: "#263A33 !important",
          bg: "#FAF8F5 !important",
          borderColor: "rgba(86, 117, 109, 0.2) !important",
          borderRadius: "12px !important",
          transition: "all 0.2s ease",
        },
        "input::placeholder, textarea::placeholder": {
          color: "#8C9E96 !important",
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontSize: "13px !important",
          fontWeight: "400 !important",
        },
        "input:hover, textarea:hover, select:hover": {
          borderColor: "#56756D !important",
        },
        "input:focus, textarea:focus, select:focus": {
          bg: "white !important",
          borderColor: "#56756D !important",
          boxShadow: "0 0 0 1px #56756D !important",
        },
        "input[aria-invalid=true], textarea[aria-invalid=true], select[aria-invalid=true]": {
          borderColor: "#DC2626 !important",
          boxShadow: "0 0 0 1px #DC2626 !important",
          bg: "#FEF2F2 !important",
        },
        ".chakra-form__label, label": {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontSize: "13px !important",
          fontWeight: "600 !important",
          color: "#263A33 !important",
          marginBottom: "6px !important",
        },
        ".chakra-form__required-indicator": {
          color: "#DC2626 !important",
          marginLeft: "3px !important",
          fontWeight: "700 !important",
        },
        ".chakra-form__error-message": {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontSize: "12px !important",
          color: "#DC2626 !important",
          marginTop: "5px !important",
          fontWeight: "500 !important",
        },
        "option": {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontSize: "13px !important",
          color: "#263A33 !important",
          backgroundColor: "#FFFFFF !important",
        }
      }}
    >
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

      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark Architecture) */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Avatar + Title + Badges */}
          <HStack spacing={3.5} align="center">
            <Box position="relative">
              <Avatar
                size="md"
                name={profile.name || user?.fullName || 'Therapist'}
                src={profile.profile_image || profile.profile_image_url || profile.imageUrl || user?.imageUrl}
                border="2px solid white"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              />
              <Circle
                size="11px"
                bg={profile.profile_status === 'approved' ? '#38A169' : '#D69E2E'}
                border="2px solid white"
                position="absolute"
                bottom="0"
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.2)"
                  color="#263A33"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  PRACTITIONER PORTAL · CLINICAL PROFILE
                </Badge>
                <Badge
                  bg={statusBadgeBg}
                  color={statusBadgeColor}
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  {statusLabel}
                </Badge>
              </HStack>

              <Heading
                as="h1"
                fontSize={{ base: '21px', sm: '25px' }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Clinician Profile & Identity
              </Heading>

              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Define your professional scope, therapeutic modalities, credentials, and directory listing.
              </Text>
            </VStack>
          </HStack>

          {/* Right Section: Metric Strip + Action Buttons */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={3}
            align={{ base: "stretch", md: "center" }}
            w={{ base: "full", lg: "auto" }}
          >
            {/* Metric Strip */}
            <HStack
              spacing={{ base: 1.5, sm: 3 }}
              p={1.5}
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              w={{ base: "full", md: "auto" }}
              justify="space-between"
            >
              {/* Metric 1 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiAward} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    CREDENTIALS
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {profile.highest_qualification || profile.qualification_highest ? 'Documented' : 'Pending'}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Metric 2 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiTarget} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    ROLE
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {profile.professional_role ? profile.professional_role.split(' ')[0] : 'Clinician'}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Metric 3 */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(59, 130, 246, 0.12)" color="#2563EB" flexShrink={0}>
                  <Icon as={FiGlobe} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    DIRECTORY
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {profile.profile_status === 'approved' ? 'Published' : 'Unlisted'}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Master Action Button */}
            <HStack
              spacing={2.5}
              w={{ base: "full", md: "auto" }}
              justify={{ base: "flex-start", md: "flex-end" }}
              flexShrink={0}
            >
              {profile.profile_status === 'approved' ? (
                <Button
                  leftIcon={<Icon as={FiSave} boxSize="13px" />}
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  height="38px"
                  fontSize="13px"
                  fontWeight="600"
                  px={6}
                  onClick={() => requireBasicAccess(() => handleSave(true))}
                  isLoading={loading}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                  whiteSpace="nowrap"
                >
                  Save & Publish Updates
                </Button>
              ) : ['submitted', 'pending_review', 'awaiting_contract'].includes(profile.profile_status) ? (
                <HStack
                  spacing={2}
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg="rgba(245, 158, 11, 0.12)"
                  border="1px solid rgba(245, 158, 11, 0.3)"
                  color="#D97706"
                  whiteSpace="nowrap"
                >
                  <Icon as={FiClock} boxSize="13px" />
                  <Text fontSize="12.5px" fontWeight="600">
                    {profile.profile_status === 'awaiting_contract' ? 'Awaiting Contract' : 'Under Review'}
                  </Text>
                </HStack>
              ) : (
                <Button
                  leftIcon={<Icon as={FiZap} boxSize="13px" />}
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  height="38px"
                  fontSize="13px"
                  fontWeight="600"
                  px={6}
                  onClick={handleSubmitForReview}
                  isLoading={loading}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                  whiteSpace="nowrap"
                >
                  {profile.profile_status === 'changes_requested' ? "Resubmit for Review" : "Submit for Review"}
                </Button>
              )}
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* 🔹 Vetting Status Banners (Soft Wash Design) */}
      <VStack align="stretch" spacing={3} mb={6}>
        {profile.profile_status === 'changes_requested' && (
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)"
            border="1px solid rgba(239, 68, 68, 0.3)"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.02)"
          >
            <Flex justify="space-between" align={{ base: "start", sm: "center" }} wrap="wrap" gap={3}>
              <HStack spacing={3} align="start">
                <Circle size="28px" bg="#EF4444" color="white" flexShrink={0} mt={0.5}>
                  <Icon as={FiAlertCircle} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0.5}>
                  <Text fontSize="13px" fontWeight="600" color="#991B1B">
                    Action Required: Administrator Comments
                  </Text>
                  <Text fontSize="12.5px" color="#B91C1C">
                    "{profile.admin_feedback || "Please review your profile details and resubmit."}"
                  </Text>
                </VStack>
              </HStack>
              <Button
                size="sm"
                bg="#EF4444"
                color="white"
                borderRadius="full"
                h="32px"
                px={4}
                fontSize="12px"
                fontWeight="600"
                onClick={handleSubmitForReview}
                _hover={{ bg: "#DC2626" }}
              >
                Resubmit Now
              </Button>
            </Flex>
          </Box>
        )}

        {profile.profile_status === 'submitted' && (
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)"
            border="1px solid rgba(59, 130, 246, 0.25)"
          >
            <HStack spacing={3}>
              <Circle size="28px" bg="#3B82F6" color="white" flexShrink={0}>
                <Icon as={FiClock} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="13px" fontWeight="600" color="#1E40AF">
                  Profile Under Clinical Review
                </Text>
                <Text fontSize="12.5px" color="#2563EB">
                  Our clinical team is currently reviewing your credentials and scope of practice. You will be notified via email once approved.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {profile.profile_status === 'awaiting_contract' && (
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            border="1px solid rgba(16, 185, 129, 0.35)"
          >
            <HStack spacing={3}>
              <Circle size="28px" bg="#10B981" color="white" flexShrink={0}>
                <Icon as={FiAward} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="13px" fontWeight="600" color="#064E3B">
                  Content Approved · Contract Pending
                </Text>
                <Text fontSize="12.5px" color="#065F46">
                  Your profile has passed clinical review. Your practitioner agreement is waiting in your email. Once signed, your profile goes live.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {profile.profile_status === 'approved' && (
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            border="1px solid rgba(16, 185, 129, 0.35)"
          >
            <HStack spacing={3}>
              <Circle size="28px" bg="#10B981" color="white" flexShrink={0}>
                <Icon as={FiCheck} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="13px" fontWeight="600" color="#064E3B">
                  Profile is Live & Published
                </Text>
                <Text fontSize="12.5px" color="#065F46">
                  Your professional bio is active in the therapist directory. You can sync profile updates any time using the Finalize button above.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {!hasBasicAccess && (
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
            border="1px solid rgba(245, 158, 11, 0.3)"
          >
            <HStack spacing={3}>
              <Circle size="28px" bg="#F59E0B" color="white" flexShrink={0}>
                <Icon as={FiAlertCircle} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="13px" fontWeight="600" color="#78350F">
                  Subscription Required for Public Discovery
                </Text>
                <Text fontSize="12.5px" color="#92400E">
                  Activate MLC Pro on the Subscription page to publish your profile to client matching and unlock live session bookings.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </VStack>

      {/* 🌿 2. SLEEK PILL TABS NAVIGATION */}
      <Tabs index={tabIndex} onChange={handleTabChange} variant="unstyled" isLazy>
        <TabList 
          overflowX="auto" 
          border="none" 
          mb={6} 
          pb={1}
          flexWrap="nowrap"
          gap={2}
          sx={{ 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          {PROFILE_TABS.map((tab, idx) => (
            <Tab
              key={idx}
              whiteSpace="nowrap"
              flexShrink={0}
              borderRadius="full"
              px={4}
              py={2}
              fontSize="12.5px"
              fontWeight="600"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.16)"
              color="#5A6E65"
              bg="white"
              transition="all 0.2s"
              _selected={{
                bg: '#56756D',
                color: 'white',
                borderColor: '#56756D',
                boxShadow: '0 2px 6px rgba(86, 117, 109, 0.22)'
              }}
              _hover={{
                bg: 'rgba(86, 117, 109, 0.08)',
                color: '#263A33'
              }}
            >
              <HStack spacing={1.5}>
                <Icon as={tab.icon} boxSize="13px" />
                <Text>{tab.label}</Text>
              </HStack>
            </Tab>
          ))}
        </TabList>

        <TabPanels
          bg="white"
          p={{ base: 5, md: 8 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          {/* 1. Identity */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
              <VStack align="stretch" spacing={6}>
                  <FormControl isRequired isInvalid={Boolean(errors.name)}>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Full Name</FormLabel>
                    <Input value={profile.name || ""} onChange={(e) => { setProfile({...profile, name: e.target.value}); clearError("name"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                    {errors.name && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.name}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Professional Title</FormLabel>
                    <Input placeholder="e.g. Counselling Psychologist" value={profile.title || ""} onChange={(e) => setProfile({...profile, title: e.target.value})} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Pronouns</FormLabel>
                    <Input placeholder="She / Her" value={profile.pronouns || ""} onChange={(e) => setProfile({...profile, pronouns: e.target.value})} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                  </FormControl>
                  <FormControl isRequired isInvalid={Boolean(errors.headline)}>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Public Headline</FormLabel>
                    <Input placeholder="Focused on trauma and relationship wellness..." value={profile.headline || ""} onChange={(e) => { setProfile({...profile, headline: e.target.value}); clearError("headline"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                    <Text fontSize="12px" color="#5A6E65" mt={1.5}>Keep this specific. 8-14 words works best for discoverability.</Text>
                    {errors.headline && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.headline}</FormErrorMessage>}
                  </FormControl>
                </VStack>
                <VStack align="center" justify="center">
                   <Avatar size="2xl" name={profile.name} src={profile.profile_image || profile.profile_image_url || profile.imageUrl || user?.imageUrl} bg="#56756D" />
                   <Button mt={4} leftIcon={<FiCamera />} variant="outline" borderColor="rgba(86, 117, 109, 0.25)" color="#263A33" borderRadius="full" h="34px" fontSize="12.5px" fontWeight="600" onClick={() => fileInputRef.current?.click()} isLoading={loading} _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}>Update Profile Picture</Button>
                </VStack>
             </SimpleGrid>
             <Divider my={8} borderColor="rgba(86, 117, 109, 0.12)" />
             <Flex justify="flex-end" align="center" pt={2}>
               <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                 bg="#56756D"
                 color="white"
                 borderRadius="full"
                 h="38px"
                 px={6}
                 fontSize="13px"
                 fontWeight="600"
                 onClick={handleSaveAndNext}
                 isLoading={loading}
                 _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                 boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
               >
                 Continue: Credentials
               </Button>
             </Flex>
           </TabPanel>

           {/* 2. Credentials */}
           <TabPanel>
             <VStack align="stretch" spacing={7}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                   <FormControl isRequired isInvalid={Boolean(errors.highest_qualification)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Highest Qualification</FormLabel>
                     <Input placeholder="e.g. Ph.D, M.Phil, M.Sc." value={profile.highest_qualification || profile.qualification_highest || ""} onChange={(e) => { setProfile({...profile, highest_qualification: e.target.value, qualification_highest: e.target.value}); clearError("highest_qualification"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.highest_qualification && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.highest_qualification}</FormErrorMessage>}
                   </FormControl>
                   <FormControl isRequired isInvalid={Boolean(errors.linkedin_url)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">LinkedIn Profile URL</FormLabel>
                     <Input placeholder="https://www.linkedin.com/in/your-profile" value={profile.linkedin_url || ""} onChange={(e) => { setProfile({...profile, linkedin_url: e.target.value}); clearError("linkedin_url"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     <Text fontSize="12px" color="#5A6E65" mt={1.5}>Use your full profile URL so admin can verify credentials faster.</Text>
                     {errors.linkedin_url && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.linkedin_url}</FormErrorMessage>}
                   </FormControl>
                   <FormControl isRequired isInvalid={Boolean(errors.qualification_title)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Degree Title</FormLabel>
                     <Input placeholder="Psychology" value={profile.qualification_title || ""} onChange={(e) => { setProfile({...profile, qualification_title: e.target.value}); clearError("qualification_title"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.qualification_title && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.qualification_title}</FormErrorMessage>}
                   </FormControl>
                   <FormControl isRequired isInvalid={Boolean(errors.university)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">University / Institution</FormLabel>
                     <Input placeholder="e.g. University of Delhi, NIMHANS" value={profile.university || ""} onChange={(e) => { setProfile({...profile, university: e.target.value}); clearError("university"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.university && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.university}</FormErrorMessage>}
                   </FormControl>
                   <FormControl isRequired isInvalid={Boolean(errors.year_completed)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Year Completed</FormLabel>
                     <Input type="number" placeholder="e.g. 2020" value={profile.year_completed || ""} onChange={(e) => { setProfile({...profile, year_completed: e.target.value}); clearError("year_completed"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.year_completed && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.year_completed}</FormErrorMessage>}
                   </FormControl>
                </SimpleGrid>
                <Divider borderColor="rgba(86, 117, 109, 0.12)" />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                   <FormControl isRequired isInvalid={Boolean(errors.years_experience)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Total Years of Experience</FormLabel>
                     <Input type="number" min="0" placeholder="0" value={profile.years_experience ?? profile.experience_years ?? ""} onChange={(e) => { setProfile({...profile, years_experience: e.target.value, experience_years: e.target.value}); clearError("years_experience"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.years_experience && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.years_experience}</FormErrorMessage>}
                   </FormControl>
                   <FormControl isRequired isInvalid={Boolean(errors.experience_post_qual)}>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Post-Qualification Years</FormLabel>
                     <Input type="number" min="0" placeholder="0" value={profile.experience_post_qual ?? ""} onChange={(e) => { setProfile({...profile, experience_post_qual: e.target.value}); clearError("experience_post_qual"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                     {errors.experience_post_qual && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.experience_post_qual}</FormErrorMessage>}
                   </FormControl>
                </SimpleGrid>
                <FormControl isRequired isInvalid={Boolean(errors.license_details)}>
                   <FormLabel fontWeight="600" fontSize="13px" color="#263A33">License / Registration Details</FormLabel>
                   <Textarea placeholder="e.g. RCI CRR No., State Board Registration, or Professional Practicing ID" value={profile.license_details || ""} onChange={(e) => { setProfile({...profile, license_details: e.target.value}); clearError("license_details"); }} borderRadius="xl" borderColor="rgba(86, 117, 109, 0.2)" _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }} />
                   {errors.license_details && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.license_details}</FormErrorMessage>}
                </FormControl>
                <Box p={6} border="1px dashed" borderColor="rgba(86, 117, 109, 0.25)" borderRadius="2xl" bg="rgba(250, 248, 245, 0.6)" textAlign="center">
                   <Icon as={FiBriefcase} boxSize={6} color="#56756D" mb={2} />
                   <HStack justify="center" spacing={1.5} mb={1}>
                     <Text fontWeight="600" fontSize="13.5px" color="#263A33">Professional Documents (Internal Only)</Text>
                     <Text as="span" color="#DC2626" fontWeight="700">*</Text>
                   </HStack>
                   <Text fontSize="12px" color="#5A6E65" mb={4}>Highest qualification proof and CV/Resume are required before review.</Text>
                   <HStack justify="center" spacing={3} wrap="wrap">
                     <Button size="sm" variant="outline" borderColor="rgba(86, 117, 109, 0.3)" color="#263A33" borderRadius="full" h="34px" fontSize="12.5px" fontWeight="600" onClick={() => qualificationProofRef.current?.click()} _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}>
                       Upload Qualification Proof
                     </Button>
                     <Button size="sm" variant="outline" borderColor="rgba(86, 117, 109, 0.3)" color="#263A33" borderRadius="full" h="34px" fontSize="12.5px" fontWeight="600" onClick={() => resumeFileRef.current?.click()} _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}>
                       Upload CV / Resume
                     </Button>
                   </HStack>
                   <HStack mt={3} spacing={4} justify="center">
                     <Text fontSize="12px" color={profile.highest_qualification_proof ? "#059669" : "#DC2626"} fontWeight="500">
                       Qualification: {profile.highest_qualification_proof ? "Uploaded" : "Missing"}
                     </Text>
                     <Text fontSize="12px" color={profile.resume_file ? "#059669" : "#DC2626"} fontWeight="500">
                       CV / Resume: {profile.resume_file ? "Uploaded" : "Missing"}
                     </Text>
                   </HStack>
                   <Text fontSize="11px" color="#718096" mt={2}>
                     Accepted: PDF, DOC, DOCX, JPG, PNG. Clear and readable files.
                   </Text>
                </Box>
                <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Populations
                  </Button>
                </Flex>
             </VStack>
           </TabPanel>

          {/* 3. Populations & Languages */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Box p={4} borderRadius="xl" bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.25)">
               <HStack spacing={3} align="start">
                 <Circle size="24px" bg="rgba(16, 185, 129, 0.15)" color="#059669" flexShrink={0} mt={0.5}>
                   <Icon as={FiTarget} boxSize="13px" />
                 </Circle>
                 <VStack align="start" spacing={0.5}>
                   <Text fontSize="13px" fontWeight="600" color="#064E3B">Specificity and Ideal Matching</Text>
                   <Text fontSize="12.5px" color="#065F46">
                     Make sure to choose only populations you are most experienced with, this helps our algorithm find your ideal clients. Profiles that claim to treat everyone often rank lower in specialized search results.
                   </Text>
                 </VStack>
               </HStack>
            </Box>

               <Box>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={3}>Age Groups Served</FormLabel>
                  <Text fontSize="12.5px" color="#5A6E65" mb={4}>Select only groups you actively work with in current practice.</Text>
                  <Wrap spacing={3}>
                     {CATEGORIES.AGE_GROUPS.map(age => (
                       <Checkbox key={age} isChecked={profile.age_groups?.includes(age)} onChange={() => toggleArray('age_groups', age)} colorScheme="teal" size="md">
                         <Text fontSize="13px" color="#263A33" fontWeight="500">{age}</Text>
                       </Checkbox>
                     ))}
                  </Wrap>
               </Box>

               <Box>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={3}>Language Proficiency</FormLabel>
                  <Text fontSize="12.5px" color="#5A6E65" mb={4}>Select languages you are comfortable conducting therapy in. Proficiency details help match client comprehension needs.</Text>
                  
                  <HStack mb={6}>
                    <ModernSelect 
                      placeholder="Add a language..."
                      value=""
                      options={CATEGORIES.ALL_LANGUAGES.filter(l => !profile.languages_info?.find(li => li.lang === l))}
                      onChange={(lang) => {
                        if (!lang) return;
                        const exists = profile.languages_info?.find(l => l.lang === lang);
                        if (!exists) {
                          setProfile({...profile, languages_info: [...(profile.languages_info || []), { lang, fluency: "Fluent / Native" }]});
                        }
                      }}
                    />
                  </HStack>

                  <VStack align="stretch" spacing={3}>
                    {profile.languages_info?.map((info, idx) => (
                      <HStack key={info.lang} bg="rgba(250, 248, 245, 0.85)" p={3.5} borderRadius="xl" justify="space-between" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)" transition="all 0.2s" _hover={{ borderColor: 'rgba(86, 117, 109, 0.25)', boxShadow: '0 2px 8px rgba(38, 58, 51, 0.04)' }}>
                         <HStack spacing={3}>
                           <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                             <Icon as={FiGlobe} boxSize="13px" />
                           </Circle>
                           <Text fontWeight="600" fontSize="13px" color="#263A33">{info.lang}</Text>
                         </HStack>
                         <HStack spacing={3}>
                           <ModernSelect
                            size="sm"
                            w="200px"
                            minW="180px"
                            value={info.fluency}
                            options={FLUENCY_LEVELS}
                            onChange={(val) => {
                              const updated = [...profile.languages_info];
                              updated[idx].fluency = val;
                              setProfile({...profile, languages_info: updated});
                            }}
                          />
                           <IconButton 
                            icon={<FiX />} 
                            size="xs" variant="ghost" color="#DC2626" 
                            _hover={{ bg: 'rgba(239, 68, 68, 0.08)' }}
                            onClick={() => setProfile({...profile, languages_info: profile.languages_info.filter(l => l.lang !== info.lang)})}
                           />
                         </HStack>
                      </HStack>
                    ))}
                  </VStack>
               </Box>

               <Divider borderColor="rgba(86, 117, 109, 0.12)" />

               <Box>
                  <HStack justify="space-between" mb={4}>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={0}>Identity Contexts & Experiences (Max 10)</FormLabel>
                    <Badge bg={profile.identity_contexts?.length > 10 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(86, 117, 109, 0.12)'} color={profile.identity_contexts?.length > 10 ? '#DC2626' : '#56756D'} borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="700" letterSpacing="0.04em">
                       {profile.identity_contexts?.length || 0} / 10 Selected
                    </Badge>
                  </HStack>
                  <Text fontSize="12.5px" color="#5A6E65" mb={6}>Choose the contexts you have deep clinical experience with. Avoid vague tags like "general population" to ensure high-quality matching.</Text>

                  <VStack align="stretch" spacing={8}>
                     {Object.entries(CATEGORIES.IDENTITY_CONTEXTS_GROUPS).map(([category, items]) => (
                       <Box key={category}>
                          <Text fontSize="10px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={3}>{category}</Text>
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
                                   colorScheme="teal" size="md"
                                 >
                                   <Text fontSize="13px" color="#263A33" fontWeight="500">{ctx}</Text>
                                 </Checkbox>
                               );
                             })}
                          </SimpleGrid>
                       </Box>
                     ))}
                  </VStack>
               </Box>
               <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Clinical Scope
                  </Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 4. Clinical Scope */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Box p={4} borderRadius="xl" bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" border="1px solid rgba(245, 158, 11, 0.3)">
               <HStack spacing={3} align="start">
                 <Circle size="24px" bg="rgba(245, 158, 11, 0.2)" color="#D97706" flexShrink={0} mt={0.5}>
                   <Icon as={FiAlertCircle} boxSize="13px" />
                 </Circle>
                 <VStack align="start" spacing={0.5}>
                   <Text fontSize="13px" fontWeight="600" color="#92400E">Avoid Generic Profiles</Text>
                   <Text fontSize="12.5px" color="#B45309">
                     We (and clients) value depth over breadth. Intentionality matters. Profiles that select too many specializations often rank lower in specific search results.
                   </Text>
                 </VStack>
               </HStack>
            </Box>

               <Box>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={4}>Professional Role & Practice</FormLabel>
                  <SimpleGrid columns={2} spacing={4} mb={6}>
                     <FormControl>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Primary Role</FormLabel>
                        <ModernSelect
                         placeholder="Select Role"
                         value={profile.professional_role}
                         options={CATEGORIES.CLINICAL_ROLES}
                         onChange={(val) => setProfile({...profile, professional_role: val})}
                      />
                     </FormControl>
                     <FormControl>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Complexity Handling</FormLabel>
                        <ModernSelect
                         placeholder="Select Complexity"
                         value={profile.complexity_comfort}
                         options={[
                           { label: "Mild presentations", value: "Mild" },
                           { label: "Moderate distress", value: "Moderate" },
                           { label: "High complexity (Clinical focus)", value: "High" }
                         ]}
                         onChange={(val) => setProfile({...profile, complexity_comfort: val})}
                      />
                     </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={1} spacing={6}>
                     <FormControl>
                        <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Scope of Practice</FormLabel>
                        <Textarea placeholder="Define your clinical boundaries..." value={profile.scope_of_practice} onChange={(e) => setProfile({...profile, scope_of_practice: e.target.value})} borderRadius="xl" />
                     </FormControl>
                     <FormControl>
                        <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Specific Presentations Not Treated</FormLabel>
                        <Textarea placeholder="e.g. Forensics, active dependence, etc." value={profile.not_treated} onChange={(e) => setProfile({...profile, not_treated: e.target.value})} borderRadius="xl" />
                     </FormControl>
                  </SimpleGrid>
               </Box>

               <Box>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={2}>Presenting Concerns Matrix</FormLabel>
                 <Text fontSize="12.5px" color="#5A6E65" mb={3}>
                   Mark at least 5 concerns to help matching quality and reduce client mismatch.
                 </Text>
                  <Box p={4} bg="rgba(250, 248, 245, 0.85)" borderRadius="xl" mb={6} border="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
                    <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={3}>Choosing the right level:</Text>
                    <VStack align="stretch" spacing={2}>
                       <HStack fontSize="xs"><Badge bg="#56756D" color="white" w="110px" borderRadius="full" textAlign="center" py={0.5} fontSize="10px">Core Focus</Badge><Text color="#5A6E65" fontSize="12.5px">Primary expertise. You work with this daily and have advanced training.</Text></HStack>
                       <HStack fontSize="xs"><Badge bg="rgba(86, 117, 109, 0.12)" color="#56756D" w="110px" borderRadius="full" textAlign="center" py={0.5} fontSize="10px">Experienced</Badge><Text color="#5A6E65" fontSize="12.5px">Substantial clinical experience and supervised follow-through.</Text></HStack>
                       <HStack fontSize="xs"><Badge bg="rgba(86, 117, 109, 0.06)" color="#718096" w="110px" borderRadius="full" textAlign="center" py={0.5} fontSize="10px">Foundational</Badge><Text color="#5A6E65" fontSize="12.5px">Foundational knowledge; take occasionally but not a core focus.</Text></HStack>
                       <HStack fontSize="xs"><Badge bg="rgba(239, 68, 68, 0.1)" color="#DC2626" w="110px" borderRadius="full" textAlign="center" py={0.5} fontSize="10px">Refer Out</Badge><Text color="#5A6E65" fontSize="12.5px">Choose this if you <b>do not</b> treat this presentation.</Text></HStack>
                    </VStack>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                     {CATEGORIES.CONCERNS.map(topic => (
                       <HStack key={topic} justify="space-between" p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)" _hover={{ borderColor: 'rgba(86, 117, 109, 0.25)', boxShadow: '0 2px 8px rgba(38, 58, 51, 0.04)' }} transition="all 0.2s">
                          <Text fontWeight="600" fontSize="12.5px" color="#263A33">{topic}</Text>
                          <ModernSelect 
                           size="sm"
                           w="145px"
                           minW="145px"
                           placeholder="Choose Level"
                           value={profile.concerns_levels?.[topic] || ""} 
                           options={["Core Focus", "Experienced", "Foundational", "Refer Out"]}
                           onChange={(val) => setProfile({...profile, concerns_levels: {...profile.concerns_levels, [topic]: val}})}
                        />
                       </HStack>
                     ))}
                  </SimpleGrid>
               </Box>
               <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Clinical Judgment
                  </Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 5. Approach */}
          {/* 5. Clinical Judgment (Internal Only) */}
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Box p={4} borderRadius="xl" bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" border="1px solid rgba(245, 158, 11, 0.3)">
                <HStack spacing={3} align="start">
                  <Circle size="24px" bg="rgba(245, 158, 11, 0.2)" color="#D97706" flexShrink={0} mt={0.5}>
                    <Icon as={FiAlertCircle} boxSize="13px" />
                  </Circle>
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="13px" fontWeight="600" color="#92400E">Internal Clinical Vetting Only</Text>
                    <Text fontSize="12.5px" color="#B45309">
                      These answers are required for MLC internal review and are never shown on your public profile.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
              <Text fontSize="xs" color="gray.500">
                Write concrete, real-case style answers. One-line answers are usually returned for revision.
              </Text>
              <FormControl isRequired isInvalid={Boolean(errors.first_10_min_response)}>
                <FormLabel fontWeight="600" fontSize="13px" color="#263A33">A client says: "I feel stuck and don’t know what’s wrong with me." How would you respond in the first 10 minutes?</FormLabel>
                <Textarea minH="140px" placeholder="Write your clinical formulation and first response here..." value={profile.clinical_judgment_answers?.first_10_min_response || ""} onChange={(e) => { setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), first_10_min_response: e.target.value } }); clearError("first_10_min_response"); }} borderRadius="xl" />
                {errors.first_10_min_response && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.first_10_min_response}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired isInvalid={Boolean(errors.stalled_therapy_case)}>
                <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Describe a case where therapy was not progressing. What did you do?</FormLabel>
                <Textarea minH="140px" placeholder="Describe the therapeutic impasse, clinical hypothesis, and adjustment..." value={profile.clinical_judgment_answers?.stalled_therapy_case || ""} onChange={(e) => { setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), stalled_therapy_case: e.target.value } }); clearError("stalled_therapy_case"); }} borderRadius="xl" />
                {errors.stalled_therapy_case && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.stalled_therapy_case}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired isInvalid={Boolean(errors.scope_and_referral_judgment)}>
                <FormLabel fontWeight="600" fontSize="13px" color="#263A33">When would you decide a client is outside your scope and refer out?</FormLabel>
                <Textarea minH="140px" placeholder="Outline clinical red flags, competencies, and ethical referral criteria..." value={profile.clinical_judgment_answers?.scope_and_referral_judgment || ""} onChange={(e) => { setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), scope_and_referral_judgment: e.target.value } }); clearError("scope_and_referral_judgment"); }} borderRadius="xl" />
                {errors.scope_and_referral_judgment && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.scope_and_referral_judgment}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired isInvalid={Boolean(errors.suicidal_ideation_response)}>
                <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Briefly describe how you assess and respond to suicidal ideation in a client.</FormLabel>
                <Textarea minH="140px" placeholder="Describe risk stratification, safety protocols, and follow-through steps..." value={profile.clinical_judgment_answers?.suicidal_ideation_response || ""} onChange={(e) => { setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), suicidal_ideation_response: e.target.value } }); clearError("suicidal_ideation_response"); }} borderRadius="xl" />
                {errors.suicidal_ideation_response && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.suicidal_ideation_response}</FormErrorMessage>}
              </FormControl>
              <FormControl isRequired isInvalid={Boolean(errors.difficult_clients_self_management)}>
                <FormLabel fontWeight="600" fontSize="13px" color="#263A33">What kind of clients do you find difficult to work with, and how do you manage that?</FormLabel>
                <Textarea minH="140px" placeholder="Reflect on countertransference, difficult dynamics, and supervision support..." value={profile.clinical_judgment_answers?.difficult_clients_self_management || ""} onChange={(e) => { setProfile({ ...profile, clinical_judgment_answers: { ...(profile.clinical_judgment_answers || {}), difficult_clients_self_management: e.target.value } }); clearError("difficult_clients_self_management"); }} borderRadius="xl" />
                {errors.difficult_clients_self_management && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.difficult_clients_self_management}</FormErrorMessage>}
              </FormControl>
              <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
              <Flex justify="space-between" align="center" pt={2}>
                <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  h="38px"
                  px={5}
                  fontSize="12.5px"
                  fontWeight="600"
                  onClick={handlePrevTab}
                  _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                >
                  Previous
                </Button>
                <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  h="38px"
                  px={6}
                  fontSize="13px"
                  fontWeight="600"
                  onClick={handleSaveAndNext}
                  isLoading={loading}
                  _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                >
                  Continue: Therapeutic Approach
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* 6. Approach */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Box>
                  <Text fontSize="16px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" mb={4}>Therapeutic Orientation & Modalities</Text>
                  
                  <Box p={5} bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" borderRadius="2xl" border="1px solid rgba(245, 158, 11, 0.3)" mb={8}>
                     <HStack color="#92400E" mb={3} spacing={2}><Icon as={FiAlertCircle} boxSize="14px" /><Text fontWeight="600" fontSize="13px">Clinical Advisory & Ethics</Text></HStack>
                     <VStack align="stretch" spacing={2}>
                        <Text fontSize="12.5px" fontWeight="500" color="#B45309">
                          1. Select only modalities you have been <b>practically trained and supervised in</b>. 
                        </Text>
                        <Text fontSize="12.5px" fontWeight="500" color="#B45309">
                          2. <b>Limit your selection to 8 total.</b> Generic profiles with too many orientations dilute your clinical authority and are indexed lower by search engines.
                        </Text>
                        <Text fontSize="12px" color="#D97706">
                          * Non-practical trainings with no supervised follow-through will be flagged to maintain MLC standards.
                        </Text>
                     </VStack>
                  </Box>

                  <VStack align="stretch" spacing={8} mb={10}>
                     <FormControl isRequired isInvalid={Boolean(errors.primary_orientation)}>
                        <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Primary Therapeutic Modality</FormLabel>
                        <Text fontSize="12.5px" color="#5A6E65" mb={2}>Your "Main Lens" – the modality that informs your case formulation most strongly.</Text>
                        <ModernSelect 
                        placeholder="Select Primary Modality"
                        value={profile.primary_orientation}
                        options={(profile.modalities_info || []).map(m => m.name)}
                        onChange={(val) => { setProfile({...profile, primary_orientation: val}); clearError("primary_orientation"); }}
                      />
                      {errors.primary_orientation && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.primary_orientation}</FormErrorMessage>}
                     </FormControl>

                     <Box>
                        <HStack justify="space-between" mb={4}>
                           <FormLabel fontWeight="600" fontSize="13px" color="#263A33" mb={0}>Clinical Modalities (Max 8 Total)</FormLabel>
                           <Badge bg={profile.modalities_info?.length > 8 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(86, 117, 109, 0.12)'} color={profile.modalities_info?.length > 8 ? '#DC2626' : '#56756D'} borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="700" letterSpacing="0.04em">
                              {profile.modalities_info?.length || 0} / 8 Selected
                           </Badge>
                        </HStack>

                        <VStack align="stretch" spacing={6}>
                           {Object.entries(CATEGORIES.MODALITIES_GROUPS).map(([category, items]) => (
                             <Box key={category}>
                                <Text fontSize="10px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={3}>{category}</Text>
                                <Wrap spacing={2}>
                                   {items.map(m => {
                                      const isSelected = profile.modalities_info?.find(mi => mi.name === m);
                                      return (
                                        <Tag 
                                           key={m} cursor="pointer" borderRadius="full" px={4} py={2}
                                           bg={isSelected ? '#56756D' : 'transparent'}
                                           color={isSelected ? 'white' : '#5A6E65'}
                                           border="1px solid"
                                           borderColor={isSelected ? '#56756D' : 'rgba(86, 117, 109, 0.2)'}
                                           transition="all 0.2s"
                                           _hover={{ borderColor: '#56756D', bg: isSelected ? '#263A33' : 'rgba(86, 117, 109, 0.06)' }}
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
                                           <TagLabel fontSize="12px" fontWeight="500">{m}</TagLabel>
                                        </Tag>
                                      );
                                   })}
                                </Wrap>
                             </Box>
                           ))}
                        </VStack>
                     </Box>
                  </VStack>

                  <Text fontSize="11px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase" mb={4}>Detailed Training & Supervision Logs</Text>
                  <VStack align="stretch" spacing={6}>
                     {profile.modalities_info?.map((info, idx) => (
                       <Box key={info.name} p={6} bg="rgba(250, 248, 245, 0.85)" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" borderRadius="2xl" boxShadow="0 2px 8px rgba(38, 58, 51, 0.03)">
                          <HStack mb={4} justify="space-between">
                             <Text fontSize="14px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">{info.name}</Text>
                             <Badge bg="#56756D" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="700">Mandatory Log</Badge>
                          </HStack>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                             <FormControl isRequired>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Training Institution & Year</FormLabel>
                                <Input bg="white" placeholder="Institution name, certification details..." value={info.training} onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].training = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }} borderRadius="xl" />
                             </FormControl>
                             <FormControl isRequired>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Clinical Supervision Details</FormLabel>
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

               <Divider borderColor="rgba(86, 117, 109, 0.12)" />

               <Box>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Therapy Dynamics (Matching Sliders)</FormLabel>
                  <SimpleGrid columns={1} spacing={8} p={{ base: 6, md: 8 }} bg="rgba(250, 248, 245, 0.85)" borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">More Structured</Text><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">More Exploratory</Text></HStack>
                        <Slider value={profile.structure} onChange={(v) => setProfile({...profile, structure: v})}><SliderTrack bg="rgba(86, 117, 109, 0.2)"><SliderFilledTrack bg="#56756D"/></SliderTrack><SliderThumb borderColor="#56756D" boxShadow="0 2px 4px rgba(38, 58, 51, 0.2)" /></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">Past-Focused</Text><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">Present-Focused</Text></HStack>
                        <Slider value={profile.orientation} onChange={(v) => setProfile({...profile, orientation: v})}><SliderTrack bg="rgba(86, 117, 109, 0.2)"><SliderFilledTrack bg="#56756D"/></SliderTrack><SliderThumb borderColor="#56756D" boxShadow="0 2px 4px rgba(38, 58, 51, 0.2)" /></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">Gentle Pacing</Text><Text fontSize="12.5px" color="#5A6E65" fontWeight="500">Direct / Challenging</Text></HStack>
                        <Slider value={profile.pacing} onChange={(v) => setProfile({...profile, pacing: v})}><SliderTrack bg="rgba(86, 117, 109, 0.2)"><SliderFilledTrack bg="#56756D"/></SliderTrack><SliderThumb borderColor="#56756D" boxShadow="0 2px 4px rgba(38, 58, 51, 0.2)" /></Slider>
                     </Box>
                  </SimpleGrid>
               </Box>
               <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Availability
                  </Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 6. Availability */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Currency</FormLabel>
                    <ModernSelect
                     placeholder="Select Currency"
                     value={profile.currency || "INR"}
                     options={CURRENCIES}
                     onChange={(val) => setProfile({...profile, currency: val})}
                  />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Individual Fee</FormLabel>
                    <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Sliding Scale</FormLabel>
                    <ModernSelect
                    placeholder="Coming Soon (In Development)"
                    isDisabled={true}
                  />
                  </FormControl>
               </SimpleGrid>
               <Divider borderColor="rgba(86, 117, 109, 0.12)" />
               <VStack align="stretch" spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0" fontWeight="600" fontSize="13px" color="#263A33">Accepting New Clients</FormLabel>
                    <Checkbox isChecked={profile.is_accepting_new} onChange={(e) => setProfile({...profile, is_accepting_new: e.target.checked})} />
                  </FormControl>
                  <FormControl>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">In-Person Locations</FormLabel>
                     <Input placeholder="e.g. Banjara Hills, Hyderabad" value={profile.locations} onChange={(e) => setProfile({...profile, locations: e.target.value})} borderRadius="xl" />
                     <Text fontSize="12px" color="#5A6E65" mt={2}>If you offer in-person sessions, add exact locality and city.</Text>
                  </FormControl>

                  <Box p={5} bg="rgba(250, 248, 245, 0.85)" borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
                    <VStack align="stretch" spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" fontWeight="600" fontSize="13px" color="#263A33">I have a physical therapy room / clinic space</FormLabel>
                        <Checkbox isChecked={profile.has_physical_space} onChange={(e) => setProfile({...profile, has_physical_space: e.target.checked})} />
                      </FormControl>
                      
                      {profile.has_physical_space && (
                        <VStack align="stretch" spacing={4} pt={2}>
                          <FormControl isRequired isInvalid={Boolean(errors.physical_space_location)}>
                            <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Full Physical Address</FormLabel>
                            <Textarea 
                              bg="white" 
                              placeholder="Complete address for in-person clients..." 
                              value={profile.physical_space_location || ""} 
                              onChange={(e) => { setProfile({...profile, physical_space_location: e.target.value}); clearError("physical_space_location"); }} 
                              borderRadius="xl"
                            />
                            {errors.physical_space_location && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.physical_space_location}</FormErrorMessage>}
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Clinic / Room Images (URLs)</FormLabel>
                            <Textarea 
                              bg="white" 
                              placeholder="Add image URLs (comma separated) or describe the space..." 
                              value={Array.isArray(profile.physical_space_images) ? profile.physical_space_images.join(", ") : ""} 
                              onChange={(e) => setProfile({...profile, physical_space_images: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} 
                              borderRadius="xl"
                            />
                            <Text fontSize="12px" color="#5A6E65" mt={1}>Visuals help clients feel safe before their first session.</Text>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Notes for In-Person Clients</FormLabel>
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
               <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Bio & Media
                  </Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 7. Bio & Media */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <FormControl isRequired isInvalid={Boolean(errors.bio)}>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Professional Bio (150+ words recommended for visibility)</FormLabel>
                  <Textarea value={profile.bio || ""} onChange={(e) => { setProfile({...profile, bio: e.target.value}); clearError("bio"); }} borderRadius="2xl" rows={10} placeholder="Talk about your journey, style, and approach..." />
                  <Text fontSize="12px" color="#5A6E65" mt={2}>Include training background, populations served, and therapeutic style.</Text>
                  {errors.bio && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.bio}</FormErrorMessage>}
               </FormControl>
               
               <Box bg="rgba(250, 248, 245, 0.85)" p={6} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
                  <HStack justify="space-between" mb={4}>
                     <Text fontSize="11px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">Skill Keywords (Max 6)</Text>
                     <Badge bg="rgba(86, 117, 109, 0.12)" color="#56756D" borderRadius="full" px={3} py={0.5} fontSize="10px" fontWeight="700">{profile.keywords?.length} / 6</Badge>
                  </HStack>
                  <Text fontSize="12.5px" color="#5A6E65" mb={5}>Type and press enter. Keywords are auto-corrected for uniform profile consistency.</Text>
                  
                  <HStack mb={5}>
                     <Input placeholder="e.g. Trauma-sensitive" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()} />
                     <Button bg="#56756D" color="white" borderRadius="full" h="38px" px={5} fontSize="13px" fontWeight="600" onClick={handleKeywordAdd} isDisabled={profile.keywords?.length >= 6} _hover={{ bg: '#263A33' }}>Add</Button>
                  </HStack>

                  <Wrap spacing={2}>
                     {profile.keywords?.map(kw => (
                       <Tag key={kw} size="lg" borderRadius="full" bg="#56756D" color="white" px={4} py={1.5}>
                          <TagLabel fontSize="12.5px" fontWeight="500">{kw}</TagLabel>
                          <TagCloseButton onClick={() => setProfile({...profile, keywords: profile.keywords.filter(k => k !== kw)})} />
                       </Tag>
                     ))}
                  </Wrap>
               </Box>

               <FormControl>
                  <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Welcome Note to First-Time Seekers</FormLabel>
                  <Textarea value={profile.welcome_note} onChange={(e) => setProfile({...profile, welcome_note: e.target.value})} borderRadius="xl" placeholder="A reassuring message for those new to therapy..." />
               </FormControl>
               <Divider my={6} borderColor="rgba(86, 117, 109, 0.12)" />
                <Flex justify="space-between" align="center" pt={2}>
                  <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                    variant="outline"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    borderRadius="full"
                    h="38px"
                    px={5}
                    fontSize="12.5px"
                    fontWeight="600"
                    onClick={handlePrevTab}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    Previous
                  </Button>
                  <Button type="button" rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="38px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleSaveAndNext}
                    isLoading={loading}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                  >
                    Continue: Internal Matching
                  </Button>
                </Flex>
            </VStack>
          </TabPanel>

          {/* 8. Internal Matching */}
          <TabPanel px={{ base: 2, md: 10 }}>
            <VStack align="stretch" spacing={8}>
               <Box bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)" p={{ base: 5, md: 8 }} borderRadius="2xl" border="1px solid rgba(239, 68, 68, 0.2)">
                  <Stack direction={{ base: "column", sm: "row" }} color="#991B1B" mb={5} align={{ base: "start", sm: "center" }} spacing={3}>
                    <Circle size="28px" bg="rgba(239, 68, 68, 0.12)" color="#DC2626" flexShrink={0}>
                      <Icon as={FiAlertCircle} boxSize="14px" />
                    </Circle>
                    <Text fontSize="16px" fontWeight="600" color="#991B1B" fontFamily="'Outfit', var(--font-outfit), sans-serif">Clinical Governance & Ethics</Text>
                  </Stack>
                  
                  <Text fontSize="12.5px" color="#B91C1C" mb={6} fontWeight="500" lineHeight="tall">
                     These details are periodically reviewed for maintaining ethical and standardised practices. False or incomplete information may be flagged and lead to therapist removal from the platform.
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }} mb={8}>
                     <FormControl isRequired isInvalid={Boolean(errors.psychiatrist)}>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Collaborating Psychiatrist</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.psychiatrist || ""} onChange={(e) => { setProfile({...profile, risk_protocols: {...profile.risk_protocols, psychiatrist: e.target.value}}); clearError("psychiatrist"); }} />
                        {errors.psychiatrist && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.psychiatrist}</FormErrorMessage>}
                     </FormControl>
                     <FormControl isRequired isInvalid={Boolean(errors.hospital)}>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Primary Emergency Hospital</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.hospital || ""} onChange={(e) => { setProfile({...profile, risk_protocols: {...profile.risk_protocols, hospital: e.target.value}}); clearError("hospital"); }} />
                        {errors.hospital && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.hospital}</FormErrorMessage>}
                     </FormControl>
                     <FormControl isRequired isInvalid={Boolean(errors.location)}>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Hospital Location</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.location || ""} onChange={(e) => { setProfile({...profile, risk_protocols: {...profile.risk_protocols, location: e.target.value}}); clearError("location"); }} />
                        {errors.location && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.location}</FormErrorMessage>}
                     </FormControl>
                     <FormControl isRequired isInvalid={Boolean(errors.contact)}>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Emergency Contact</FormLabel>
                        <Input bg="white" borderRadius="xl" value={profile.risk_protocols?.contact || ""} onChange={(e) => { setProfile({...profile, risk_protocols: {...profile.risk_protocols, contact: e.target.value}}); clearError("contact"); }} />
                        {errors.contact && <FormErrorMessage fontSize="12px" color="#DC2626">{errors.contact}</FormErrorMessage>}
                     </FormControl>
                  </SimpleGrid>

                  <FormControl>
                     <FormLabel fontWeight="600" fontSize="13px" color="#263A33">Internal Matching Notes</FormLabel>
                     <Textarea bg="white" placeholder="Best fit cases, specific exclusion patterns, etc." value={profile.best_fit_notes} onChange={(e) => setProfile({...profile, best_fit_notes: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <Divider my={{ base: 6, md: 8 }} borderColor="rgba(86, 117, 109, 0.12)" />

                  <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid" borderColor="rgba(245, 158, 11, 0.25)">
                    <VStack align="stretch" spacing={5}>
                      <Text fontSize="15px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">Supervisor Licensing Application</Text>
                      <Text fontSize="12.5px" color="#5A6E65">
                        Use this section only if you are applying to supervise other therapists. Minimum eligibility is 5+ years experience.
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Years Supervising (formal/informal)</FormLabel>
                          <Input
                            type="number"
                            bg="white"
                            value={profile.supervision_years_experience || 0}
                            onChange={(e) => setProfile({ ...profile, supervision_years_experience: e.target.value })}
                            borderRadius="xl"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Supervision Areas</FormLabel>
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
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Supervision Modalities You Can Supervise In</FormLabel>
                        <Input
                          placeholder="e.g. CBT, DBT, Psychodynamic, Couples therapy"
                          bg="white"
                          value={Array.isArray(profile.supervision_modalities) ? profile.supervision_modalities.join(", ") : ""}
                          onChange={(e) => setProfile({ ...profile, supervision_modalities: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                          borderRadius="xl"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Supervision Philosophy / Bio</FormLabel>
                        <Textarea
                          bg="white"
                          value={profile.supervision_bio || ""}
                          onChange={(e) => setProfile({ ...profile, supervision_bio: e.target.value })}
                          borderRadius="xl"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">What is your current supervisee experience (types of supervisees, stages, case complexity)?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.current_supervisee_experience || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), current_supervisee_experience: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">What modalities do you have direct experience supervising in, and how do you guide fidelity?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.supervision_modalities_experience || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), supervision_modalities_experience: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Which parts of supervision feel most difficult for you, and how do you work through them?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.difficult_supervision_areas || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), difficult_supervision_areas: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">When would you escalate, pause, or reassign a supervisee case due to scope/safety concerns?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.scope_and_escalation_judgment || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), scope_and_escalation_judgment: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Describe how you supervise high-risk situations (self-harm, suicidality, severe deterioration).</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.high_risk_case_supervision || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), high_risk_case_supervision: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">How do you give difficult feedback and repair rupture when supervisees become defensive or disengaged?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.feedback_and_rupture_repair || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), feedback_and_rupture_repair: e.target.value } })} borderRadius="xl" />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">What is your current growth edge as a supervisor, and how are you actively improving it?</FormLabel>
                        <Textarea bg="white" minH="110px" value={profile.supervision_application_answers?.supervisor_self_reflection || ""} onChange={(e) => setProfile({ ...profile, supervision_application_answers: { ...(profile.supervision_application_answers || {}), supervisor_self_reflection: e.target.value } })} borderRadius="xl" />
                      </FormControl>

                      {profile.supervision_status === 'pending' && (
                        <Box bg="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" border="1px solid rgba(59, 130, 246, 0.25)" borderRadius="xl" p={4}>
                          <HStack spacing={3}>
                            <Circle size="28px" bg="rgba(59, 130, 246, 0.12)" color="#2563EB" flexShrink={0}><Icon as={FiAlertCircle} boxSize="13px" /></Circle>
                            <Box>
                              <Text fontSize="13px" fontWeight="600" color="#1E40AF">Supervision Application Under Review</Text>
                              <Text fontSize="12px" color="#3B82F6">We are reviewing your eligibility for supervisor licensing.</Text>
                            </Box>
                          </HStack>
                        </Box>
                      )}

                      {profile.supervision_status === 'awaiting_contract' && (
                        <Box bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="xl" p={4}>
                          <HStack spacing={3}>
                            <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}><Icon as={FiCheck} boxSize="13px" /></Circle>
                            <Box>
                              <Text fontSize="13px" fontWeight="600" color="#065F46">Supervision Approved (Awaiting Contract)</Text>
                              <Text fontSize="12px" color="#10B981">Your supervision contract has been sent to your email. Please sign it to activate your supervisor license.</Text>
                            </Box>
                          </HStack>
                        </Box>
                      )}

                      {profile.supervision_status === 'approved' && (
                        <Box bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="xl" p={4}>
                          <HStack spacing={3}>
                            <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}><Icon as={FiCheck} boxSize="13px" /></Circle>
                            <Box>
                              <Text fontSize="13px" fontWeight="600" color="#065F46">Licensed MLC Supervisor</Text>
                              <Text fontSize="12px" color="#10B981">You are now authorized to supervise other clinicians on the platform.</Text>
                            </Box>
                          </HStack>
                        </Box>
                      )}

                      {profile.supervisor_admin_feedback && (
                         <Box bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" border="1px solid rgba(245, 158, 11, 0.3)" borderRadius="xl" p={4}>
                           <HStack spacing={3}>
                             <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706" flexShrink={0}><Icon as={FiAlertCircle} boxSize="13px" /></Circle>
                             <Box>
                               <Text fontSize="13px" fontWeight="600" color="#92400E">Reviewer Feedback</Text>
                               <Text fontSize="12px" color="#D97706">"{profile.supervisor_admin_feedback}"</Text>
                             </Box>
                           </HStack>
                         </Box>
                      )}

                      <HStack justify="flex-end" w="full">
                        {Number(profile.experience_years) < 5 && (
                          <Text fontSize="12px" color="#D97706" fontWeight="600">
                            Minimum 5 years post-qualification experience required for supervisor eligibility.
                          </Text>
                        )}
                        <Button 
                          bg="#D97706" 
                          color="white"
                          borderRadius="full" 
                          h="38px"
                          px={6}
                          fontSize="13px"
                          fontWeight="600"
                          onClick={handleSubmitSupervisionApplication} 
                          isLoading={loading}
                          isDisabled={['pending', 'awaiting_contract', 'approved'].includes(profile.supervision_status) || Number(profile.experience_years) < 5}
                          _hover={{ bg: '#B45309', transform: 'translateY(-1px)' }}
                          boxShadow="0 2px 6px rgba(217, 119, 6, 0.22)"
                        >
                          {profile.supervision_status === 'approved' ? "Licensed Supervisor" : "Submit Supervision Application"}
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                  <Divider my={{ base: 6, md: 8 }} borderColor="rgba(86, 117, 109, 0.12)" />
                  <Flex justify="space-between" align="center" pt={4}>
                    <Button type="button" leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      h="38px"
                      px={5}
                      fontSize="12.5px"
                      fontWeight="600"
                      onClick={handlePrevTab}
                      _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                    >
                      Previous
                    </Button>

                    {profile.profile_status === 'approved' ? (
                      <Button 
                        leftIcon={<Icon as={FiSave} boxSize="13px" />} 
                        bg="#56756D" 
                        color="white" 
                        borderRadius="full" 
                        h="38px"
                        px={7}
                        fontSize="13px"
                        fontWeight="600"
                        onClick={() => requireBasicAccess(() => handleSave(true))} 
                        isLoading={loading} 
                        _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                      >
                        Save & Publish Updates
                      </Button>
                    ) : ['submitted', 'pending_review', 'awaiting_contract'].includes(profile.profile_status) ? (
                      <HStack
                        spacing={2}
                        px={4}
                        py={2}
                        borderRadius="full"
                        bg="rgba(245, 158, 11, 0.12)"
                        border="1px solid rgba(245, 158, 11, 0.3)"
                        color="#D97706"
                      >
                        <Icon as={FiClock} boxSize="13px" />
                        <Text fontSize="12.5px" fontWeight="600">Profile Under Review</Text>
                      </HStack>
                    ) : (
                      <Button
                        leftIcon={<Icon as={FiZap} boxSize="13px" />}
                        bg="#56756D"
                        color="white"
                        borderRadius="full"
                        h="38px"
                        px={7}
                        fontSize="13px"
                        fontWeight="600"
                        onClick={handleSubmitForReview}
                        isLoading={loading}
                        _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                      >
                        {profile.profile_status === 'changes_requested' ? "Resubmit for Review" : "Submit Profile for Review"}
                      </Button>
                    )}
                  </Flex>
               </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to make your profile visible, sync updates, and start receiving matched clients."
      />
    </Box>
  );
}
