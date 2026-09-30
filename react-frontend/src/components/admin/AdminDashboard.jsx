import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Switch,
  Text,
  Textarea,
  Image,
  Select,
  VStack,
  HStack,
  Divider,
  useToast,
  FormHelperText,
  Tag,
  Wrap,
  Flex,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  Tab,
  Badge,
  Circle,
  Grid,
  GridItem,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Spinner,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { 
  FiZap, 
  FiCheckCircle, 
  FiUserCheck, 
  FiHelpCircle, 
  FiInbox, 
  FiMail, 
  FiTrendingUp, 
  FiArrowRight, 
  FiFileText, 
  FiCompass, 
  FiVideo, 
  FiExternalLink, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiAlertCircle, 
  FiCalendar, 
  FiShield,
  FiSearch,
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiRotateCcw,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiRefreshCw,
  FiHome,
  FiBriefcase,
  FiLayers,
  FiLayout,
} from "react-icons/fi";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Users, 
  Home as HomeIcon, 
  Globe, 
  UserCheck, 
  FileCheck, 
  LayoutDashboard,
  Settings,
  Mail,
  GraduationCap,
  Briefcase,
  Layers,
  HelpCircle,
  Video,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiGetBlob, apiPost, apiPut, apiPatch, apiDelete } from "../../api.js";
import { 
  HomeEditor, 
  AboutEditor, 
  ContactEditor 
} from "./AdminEditors";
import ModernSelect from "../ModernSelect.jsx";

const apiErrorDetail = (error, fallback = "Please try again.") => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
};

const emptyMember = {
  name: "",
  title: "",
  email: "",
  photo_url: "",
  specialties: "",
  bio: "",
  sort_order: 0,
  is_active: true,
};

const emptyService = {
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  cta_label: "",
  cta_link: "",
  sort_order: 0,
  is_active: true,
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api").replace(/\/+$/, "");
const API_ORIGIN = API_BASE.replace(/\/api$/, "");

const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const defaultHomeDraft = {
  hero: {
    title: "MLC Therapy",
    tagline: "A space to feel, to heal, to become.",
    paragraph_one:
      "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through.",
    paragraph_two:
      "At MLC Therapy, we offer thoughtful online therapy across India in spaces designed to help you feel heard, supported, and respected.",
    primary_label: "I'm Looking for Therapy",
    primary_link: "/client-checkin",
    secondary_label: "I'm a Therapist",
    secondary_link: "/therapists",
    background_image: "/hero-bg.jpg",
    logo_url: "/logo_tra.png",
  },
  portal: {
    title: "Your MLC Portal",
    body:
      "A gentle, private space for clients — and a structured workspace for therapists. Choose your path below to get started.",
    client_title: "Client Dashboard",
    client_body:
      "Daily check‑ins, private journaling, session notes, shared materials, and premium tools when you’re ready.",
    client_primary_label: "Sign up as a client",
    client_primary_link: "/signup/client",
    client_secondary_label: "Take a quick check‑in",
    client_secondary_link: "/client-checkin",
    therapist_title: "Therapist Workspace",
    therapist_body:
      "Apply to join MLC and access therapist tools, client collaboration, and a calm workspace designed for your practice.",
    therapist_primary_label: "Apply as a therapist",
    therapist_primary_link: "/therapist-apply",
    therapist_secondary_label: "Sign in",
    therapist_secondary_link: "/login/therapist",
  },
  bubbles: [
    {
      icon: "users",
      title: "A Space Where You Can Speak Freely",
      body:
        "Therapy here is a place where you can talk about what’s on your mind without feeling judged.",
    },
    {
      icon: "compass",
      title: "Thoughtful Guidance",
      body:
        "Your therapist works with you to understand what you're experiencing and how to move forward.",
    },
    {
      icon: "check",
      title: "Finding the Right Fit",
      body:
        "Your first few sessions help you decide whether the therapist feels like the right fit for you. You are always free to choose what feels best for you.",
    },
    {
      icon: "feather",
      title: "Move at Your Own Pace",
      body:
        "There is no pressure to rush therapy. The process always respects your comfort and readiness.",
    },
  ],
};

const defaultAboutDraft = {
  hero: {
    title: "Our Approach to Care",
    body:
      "<p>At MLC Therapy, we believe that sustainable systems create deeper healing. Our philosophy is rooted in three pillars: clinical clarity, relational depth, and ethical accountability. When care is structured and therapists are supported, clients receive consistent, high-quality therapy they can trust.</p>",
    cta_label: "Meet the Team",
    cta_link: "/meettheteam",
    image_url: "/approach_new.jpg",
  },
  why: {
    title: "Why We Started MLC Therapy",
    body:
      "<p>MLC Therapy was born from witnessing systemic gaps in mental health care. Talented therapists were burning out, and clients were receiving inconsistent support. We envisioned a model that protects both clinical integrity and therapist sustainability, ensuring that client care never suffers.</p>",
  },
  pillars: [
    {
      title: "Clinical Clarity",
      body:
        "<p>Every therapist at MLC works from a defined therapeutic orientation. We do not blend methods without intention. Your work is guided by formulation, not improvisation.</p>",
    },
    {
      title: "Relational Depth",
      body:
        "<p>We prioritise attuned presence. Therapy is not mechanical. It is relational, safe, and human.</p>",
    },
    {
      title: "Ethical &amp; Professional Standards",
      body:
        "<p>Supervision, documentation, and structured review processes ensure that your care remains aligned with international standards of mental health practice.</p>",
    },
  ],
  message: {
    title: "The Message Behind MLC",
    body:
      "<p><strong>MLC</strong> stands for <strong>Mentis, Lumine et Corpus</strong>, Latin for Mind, Light, and Body. This name captures our belief that healing is holistic, integrating mental, emotional, and physical well-being.</p><p>Every service we offer, from therapy and supervision to education, reflects that interconnected philosophy. We stand for integrity in care, safety in practice, and growth that holds space for both clients and clinicians.</p>",
    image_url: "/about_illustration_new.jpg",
  },
};

const defaultTherapistsDraft = {
  hero: {
    title: "For Therapists",
    body_one:
      "MLC Therapy is building a space for therapists who want to practice with clarity, ethical grounding, and professional support.",
    body_two:
      "Whether you are an early-career clinician, a therapist building your practice, or someone looking for reflective supervision, we are creating spaces where therapists can grow thoughtfully.",
    primary_label: "Explore Supervision",
    primary_link: "/supervision",
    secondary_label: "Join the MLC Community",
    secondary_link: "/careers",
  },
  why: {
    title: "Why We Built MLC",
    body:
      "Many therapists in India enter the field with deep passion for helping others but quickly encounter burnout, isolation, and lack of clinical support. MLC Therapy was created to address these gaps by building a space where therapists can practice ethically, sustainably, and with community.",
    cards: [
      {
        icon: "users",
        title: "Supervision & Reflective Practice",
        body:
          "Regular supervision spaces designed to help therapists deepen their clinical thinking and develop confidence in their work.",
        cta_label: "Learn More",
        cta_link: "/supervision",
      },
      {
        icon: "layers",
        title: "Therapist Community",
        body: "A growing network of therapists who value reflective practice and professional dialogue.",
        cta_label: "",
        cta_link: "",
      },
      {
        icon: "compass",
        title: "Sustainable Practice",
        body: "MLC aims to support therapists in building meaningful and sustainable careers in mental health.",
        cta_label: "",
        cta_link: "",
      },
    ],
  },
  supervision: {
    title: "MLC Supervision Cohorts",
    body:
      "Our supervision cohorts provide structured spaces for therapists to reflect on their clinical work, explore their therapeutic identity, and strengthen their practice.",
    cards: [
      {
        icon: "users",
        title: "Group Supervision",
        body:
          "Small group supervision cohorts designed to encourage reflective dialogue and clinical growth.",
        cta_label: "Learn About Supervision",
        cta_link: "/supervision",
      },
      {
        icon: "usercheck",
        title: "Individual Supervision",
        body:
          "One-on-one supervision sessions for therapists seeking deeper clinical reflection.",
        cta_label: "Explore Supervision Options",
        cta_link: "/supervision",
      },
    ],
  },
  learning: {
    title: "Learning and Development",
    cards: [
      {
        icon: "book",
        title: "Internships",
        body:
          "Structured internship programs for psychology students interested in reflective clinical practice.",
        cta_label: "View Internship Program",
        cta_link: "/training-programs",
      },
      {
        icon: "award",
        title: "Professional Workshops",
        body: "Workshops designed to deepen therapeutic thinking and professional growth.",
        cta_label: "View Workshops",
        cta_link: "/workshops",
      },
    ],
  },
  work: {
    title: "Work With MLC",
    body:
      "We are always interested in connecting with therapists who value reflective practice and ethical care.",
    cards: [
      {
        icon: "briefcase",
        title: "Join Our Therapist Network",
        body: "Opportunities to collaborate with MLC as a therapist.",
        cta_label: "View Opportunities",
        cta_link: "/careers",
      },
      {
        icon: "message",
        title: "Clinical Collaboration",
        body:
          "MLC aims to build partnerships with therapists and professionals who share our values.",
        cta_label: "Contact Us",
        cta_link: "/contactus",
      },
    ],
  },
  values: {
    title: "Our Approach to Practice",
    bubbles: [
      {
        title: "Ethical Practice",
        body:
          "Our work is grounded in clear ethical frameworks and professional responsibility.",
      },
      {
        title: "Reflective Therapists",
        body:
          "We encourage therapists to continually reflect on their work and their growth.",
      },
      {
        title: "Thoughtful Care",
        body:
          "We believe good therapy requires depth, attention, and care.",
      },
    ],
  },
  cta: {
    title: "Interested in being part of MLC?",
    button_label: "Connect With Us",
    button_link: "/careers",
  },
};

const defaultServicesDraft = {
  hero: {
    title: "Holistic Therapy for Every Stage of Your Journey",
    body_one:
      "<p>At MLC Health & Wellness Centre, we understand that healing is not linear, and that every individual, couple, and family experiences growth differently. Our online therapy services across India are designed to meet you where you are, blending empathy, structure, and internationally aligned standards of care.</p>",
    body_two:
      "<p>Whether you seek therapy for personal growth, relational healing, adolescent support, or professional supervision, our approach remains grounded in compassion, collaboration, and evidence‑informed clinical practice.</p>",
    coverage_line:
      "<p>We provide secure online therapy across Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad and other major cities in India.</p>",
  },
  portal: {
    title: "Access your MLC portal",
    body:
      "<p>Clients can sign up for a private dashboard with check‑ins and tools. Therapists can apply to join our workspace for collaboration and growth.</p>",
    client_label: "Sign up as a client",
    client_link: "/signup/client",
    therapist_label: "Apply as a therapist",
    therapist_link: "/therapist-apply",
  },
  services: {
    title: "Our Core Services",
  },
  programs: {
    title: "Specialized Programs & Initiatives",
    cards: [
      {
        title: "Therapist Supervision & Mentorship",
        body:
          "Structured guidance for early-career therapists and interns to strengthen ethical decision-making, case formulation, and self-awareness in practice.",
        link: "/supervision",
      },
      {
        title: "Mindfulness & Relaxation Sessions",
        body:
          "Guided mindfulness, grounding, and relaxation programs to help individuals manage stress, anxiety, and restore calm.",
        link: "/mindfulness-relaxation",
      },
      {
        title: "Workshops & Training Programs",
        body:
          "Skill-based programs such as Therapist 101, Anxiety & Stress Management, and Anger Regulation — for both therapists and the community.",
        link: "/training-programs",
      },
    ],
  },
  approach: {
    title: "Our Therapeutic Approach",
    body:
      "<p>Our therapists combine evidence‑informed frameworks with a humanistic and relational perspective. We tailor every session to your needs, using approaches such as Cognitive Behavioral Therapy (CBT), Mindfulness‑Based Interventions, Relational Therapy, and Emotion‑Focused methods. We value clarity, emotional depth, relational safety, high clinical standards, and ethical integrity in every interaction.</p>",
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "How long does therapy usually last?",
        a: "Therapy duration varies depending on your goals and circumstances. Some clients find clarity in a few sessions, while others benefit from ongoing support. Your therapist will collaborate with you to decide what feels right.",
      },
      {
        q: "What can I expect in my first session?",
        a: "The first session focuses on understanding your background, goals, and what brings you to therapy. It’s a space for conversation and trust-building, helping your therapist tailor future sessions to your comfort and needs.",
      },
      {
        q: "Are online sessions available?",
        a: "Yes, we offer secure, HIPAA-compliant online sessions so you can access therapy from wherever you are, with the same privacy and care as in-person sessions.",
      },
    ],
  },
  cta: {
    title: "Ready to Begin Your Journey?",
    button_label: "Book a Session",
    button_link: "/book",
  },
};

const defaultContactDraft = {
  hero: {
    title: "We’d Love to Hear from You",
    body:
      "<p>Whether you’re reaching out about online therapy, professional collaborations, therapist supervision, or joining our team, we’re here to listen. Every message is reviewed and responded to personally by our coordination team.</p>",
    email_label: "Email",
    email: "therapy@mlchealth.in",
    subtext:
      "<p>Operating remotely across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata and other major cities.</p><p>Virtual therapy sessions available internationally via secure platforms.</p>",
    image_url: "/contact-illustration.jpg",
  },
  form: {
    title: "Contact Us",
    button_label: "Send Message",
    message_placeholder: "How can we help you?",
  },
  quote: {
    text: "“Every connection begins with a conversation. We’re listening.”",
  },
  hours: {
    title: "Our Office Hours & Response Policy",
    items: [
      "Monday to Friday — 10:00 AM to 9:00 PM IST",
      "Responses within 2 to 4 business days.",
      "Virtual consultations available worldwide.",
    ],
  },
  closing: {
    title: "Your Message is Safe with Us",
    body:
      "<p>All communications are received securely and handled with strict confidentiality. We respond personally to every inquiry because at MLC Health & Wellness Centre, healing begins with being heard.</p>",
  },
};

const defaultTrainingDraft = {
  hero: {
    title: "Training & Programs",
    body:
      "<p>Our professional training programs and structured therapeutic courses are designed to empower both therapists and clients. Each offering integrates evidence-based practices with real-world applications.</p>",
    image_url: "/training-programs.jpg",
  },
  programs: {
    title: "Programs & Courses",
    cards: [
      {
        title: "Therapist 101",
        body:
          "<p>A foundational course for early-career therapists covering essential counselling skills, self-awareness, and ethics. Learn to build strong therapeutic alliances and grow with guidance.</p>",
      },
      {
        title: "Enhance Your Therapy Management Skills",
        body:
          "<p>A specialized program focusing on therapist organization — from session documentation and scheduling to reflective journaling and maintaining a paperless practice. Ideal for professionals managing multiple clients.</p>",
      },
      {
        title: "Anxiety & Stress Management (21–28 Day Program)",
        body:
          "<p>A structured, guided course designed to teach you anxiety regulation and stress reduction through practical tools, journaling, and therapist-led check-ins. Built to encourage consistent, mindful practice.</p>",
      },
      {
        title: "Anger Management Program",
        body:
          "<p>A short-term evidence-based program designed to help individuals understand triggers, regulate emotional reactions, and channel energy constructively for long-term balance.</p>",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "Do I need prior experience to join?",
        a: "<p>No. Our trainings and programs are designed to accommodate all experience levels — from new therapists to individuals exploring personal growth.</p>",
      },
      {
        q: "Are the programs online or in-person?",
        a: "<p>Most programs are available in both formats to make participation flexible and accessible.</p>",
      },
      {
        q: "Do you provide certification after completion?",
        a: "<p>Yes. Participants who complete structured programs or therapist trainings receive an MLC certificate of completion.</p>",
      },
      {
        q: "Can organizations enroll their staff?",
        a: "<p>Yes. We offer group registrations and corporate training partnerships upon request.</p>",
      },
    ],
  },
  cta: {
    text: "Didn’t find your question? Reach out to us anytime.",
    button_label: "Contact Us",
    button_link: "/contactus",
  },
};

const defaultCareersDraft = {
  hero: {
    title: "Join Our Team of Dedicated Therapists",
    body:
      "<p>At MLC Health & Wellness Centre, we are building a space that values both clients and clinicians. We seek professionals who believe in collaboration, ethical standards, structured care, and sustainable growth. Healing that holds the healer is not a slogan. It is our foundation.</p>",
    image_url: "/careers1.jpg",
  },
  why: {
    title: "Why Work With MLC Health & Wellness Centre",
    body:
      "<p>We invest in therapist wellbeing, ethical practice, and community. Our systems are designed to support clinicians so they can do their best work.</p>",
    items: [
      {
        title: "Therapist-First Model",
        body:
          "<p>A structured system that protects boundaries and ensures sustainable caseloads. Ethical care begins with supported clinicians.</p>",
      },
      {
        title: "Clinical Supervision & Mentorship",
        body:
          "<p>Guided spaces for case reflection, ethical consultation, and professional development. Growth through structured mentorship, not micromanagement.</p>",
      },
      {
        title: "Flexible Work Options",
        body:
          "<p>Remote and hybrid opportunities across India that respect your time, geography, and lifestyle while maintaining high clinical standards.</p>",
      },
      {
        title: "Meaningful Collaboration",
        body:
          "<p>Join a growing network of professionals committed to raising the standards of therapy in India through clarity, ethics, and relational depth.</p>",
      },
    ],
  },
  openings: {
    title: "Current Openings",
    subtitle:
      "<p>We’re growing carefully and intentionally. Explore our active roles and see if one feels aligned with your practice.</p>",
    apply_label: "Apply to this role",
    cards: [
      {
        title: "Clinical Therapist (Online)",
        location: "Remote · India",
        type: "Contract",
        summary:
          "<p>Provide online therapy within our structured and supportive system.</p>",
        details:
          "<p><strong>Responsibilities:</strong></p><ul><li>Deliver client‑centered sessions</li><li>Maintain timely documentation</li><li>Participate in supervision</li></ul><p><strong>Requirements:</strong> Licensed clinician with experience in individual therapy.</p>",
      },
    ],
  },
  opportunities: {
    title: "Opportunities at MLC",
    cards: [
      {
        title: "Therapist Positions",
        body:
          "<p>Flexible, structured, and ethically aligned roles for professionals who value balance and meaningful client work.</p>",
      },
      {
        title: "Supervisor Network",
        body:
          "<p>Mentor and guide therapists through reflective supervision and structured case consultation.</p>",
      },
      {
        title: "Internships",
        body:
          "<p>Hands-on exposure, guided mentorship, and meaningful learning within a structured clinical framework.</p>",
      },
    ],
  },
  form: {
    title: "Apply Now",
    subtitle:
      "<p>Share your details and we’ll reach out with next steps. We review every application with care.</p>",
    name_label: "Full name",
    email_label: "Email address",
    phone_label: "Phone number",
    role_label: "Role of interest",
    resume_label: "Resume (PDF)",
    resume_hint: "Attach a PDF or share a link if needed.",
    message_label: "Tell us about yourself",
    submit_label: "Submit Application",
    success_title: "Application Sent!",
    success_body: "Thank you for applying, we’ll get back to you soon 🌿",
  },
  footer: {
    title: "Not sure yet?",
    body:
      "<p>Write to us at <strong>therapy@mlchealth.in</strong> and we’ll help you decide if MLC is the right fit.</p>",
    cta_label: "Contact Us",
    cta_link: "/contactus",
  },
};

const defaultTherapistApplyDraft = {
  hero: {
    title: "Therapist Application",
    body:
      "<p>Completing this application will give you access to your own therapist dashboard, where you can streamline your practice — from caring for clients to supporting yourself within a connected therapy ecosystem.</p><p>If you align with our values and are eligible to practice in India or internationally, we would love to review your application.</p>",
    note:
      "<p>Please reference the “Mental Health Therapist” posting on our careers page if applicable.</p>",
  },
  sections: {
    personal_title: "Personal Info",
    licensure_title: "Licensure & Practice",
    experience_title: "Experience & Languages",
    documents_title: "Documents & Consent",
  },
  form: {
    submit_label: "Submit application",
    required_note: "* required",
    subscribe_label:
      "Subscribe for mental health insights, practice growth tips, resources, and webinar invites.",
    resume_label: "Resume",
    resume_hint: "PDF or DOC/DOCX preferred.",
  },
};

const therapistIconOptions = [
  { value: "users", label: "Users" },
  { value: "layers", label: "Layers" },
  { value: "compass", label: "Compass" },
  { value: "briefcase", label: "Briefcase" },
  { value: "message", label: "Message" },
  { value: "award", label: "Award" },
  { value: "book", label: "Book" },
  { value: "usercheck", label: "User Check" },
];

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const applyCommand = (command, arg = null) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  };

  const toolbarBtnStyle = {
    size: "xs",
    h: "28px",
    px: 2.5,
    borderRadius: "lg",
    fontSize: "12px",
    fontWeight: "500",
    fontFamily: "'Inter', var(--font-inter), sans-serif",
    color: "#263A33",
    bg: "white",
    border: "1px solid rgba(86, 117, 109, 0.18)",
    boxShadow: "0 1px 2px rgba(38, 58, 51, 0.04)",
    _hover: {
      bg: "rgba(86, 117, 109, 0.08)",
      borderColor: "#56756D",
    },
    _active: {
      bg: "#56756D",
      color: "white",
    },
    transition: "all 0.15s ease",
  };

  return (
    <VStack align="stretch" spacing={2.5} fontFamily="'Inter', var(--font-inter), sans-serif">
      <HStack
        spacing={1.5}
        wrap="wrap"
        p={1.5}
        bg="rgba(250, 248, 245, 0.85)"
        borderRadius="xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
      >
        <Button {...toolbarBtnStyle} leftIcon={<Icon as={FiBold} boxSize="12px" />} onClick={() => applyCommand("bold")}>
          Bold
        </Button>
        <Button {...toolbarBtnStyle} leftIcon={<Icon as={FiItalic} boxSize="12px" />} onClick={() => applyCommand("italic")}>
          Italic
        </Button>
        <Button {...toolbarBtnStyle} leftIcon={<Icon as={FiUnderline} boxSize="12px" />} onClick={() => applyCommand("underline")}>
          Underline
        </Button>
        <Button {...toolbarBtnStyle} leftIcon={<Icon as={FiList} boxSize="12px" />} onClick={() => applyCommand("insertUnorderedList")}>
          Bullets
        </Button>
        <Button {...toolbarBtnStyle} onClick={() => applyCommand("insertOrderedList")}>
          1. Numbers
        </Button>
        <Button {...toolbarBtnStyle} leftIcon={<Icon as={FiRotateCcw} boxSize="12px" />} onClick={() => applyCommand("removeFormat")}>
          Clear
        </Button>
      </HStack>
      <Box
        border="1px solid rgba(86, 117, 109, 0.2)"
        borderRadius="xl"
        px={4}
        py={3.5}
        bg="white"
        minH="140px"
        transition="all 0.18s ease"
        _hover={{ borderColor: "rgba(86, 117, 109, 0.35)" }}
        _focusWithin={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
      >
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          minH="100px"
          fontSize="13.5px"
          lineHeight="1.6"
          color="#263A33"
          fontFamily="'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          outline="none"
          sx={{
            "ul": { listStyleType: "disc !important", paddingLeft: "26px !important", margin: "12px 0 !important" },
            "ol": { listStyleType: "decimal !important", paddingLeft: "26px !important", margin: "12px 0 !important" },
            "li": { margin: "6px 0 !important", lineHeight: "1.75 !important", paddingLeft: "4px !important" },
          }}
        />
      </Box>
      <Text fontSize="12px" color="#5A6E65" fontFamily="'Inter', var(--font-inter), sans-serif">
        Basic formatting supported (bold, italic, underline, bullets).
      </Text>
    </VStack>
  );
}

const NavItem = ({ icon: Icon, label, id, isSub = false, activeTab, setActiveTab }) => (
    <HStack
      spacing={3}
      px={isSub ? 8 : 4}
      py={3}
      cursor="pointer"
      bg={activeTab === id ? "rgba(95, 160, 147, 0.1)" : "transparent"}
      color={activeTab === id ? "mlc.greenDark" : "gray.600"}
      borderRadius="xl"
      transition="all 0.2s"
      _hover={{ bg: "rgba(95, 160, 147, 0.05)", color: "mlc.green" }}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={isSub ? 16 : 18} />
      <Text fontWeight={activeTab === id ? "700" : "500"} fontSize={isSub ? "sm" : "md"}>
        {label}
      </Text>
    </HStack>
  );

const MetricCard = ({ label, value }) => (
  <Box 
    p={4} 
    borderRadius="xl" 
    border="1px solid rgba(86, 117, 109, 0.12)" 
    bg="rgba(250, 248, 245, 0.6)"
    boxShadow="0 2px 8px -2px rgba(38, 58, 51, 0.03)"
  >
    <Text fontSize="10.5px" color="#718096" textTransform="uppercase" letterSpacing="0.08em" fontWeight="700">
      {label}
    </Text>
    <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mt={1.5}>
      {value ?? 0}
    </Heading>
  </Box>
);

const downloadCsv = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const MiniBarChart = ({ title, data = [], valueKey, unit = "" }) => {
  const max = Math.max(...data.map((d) => Number(d?.[valueKey] || 0)), 1);
  return (
    <Box border="1px solid rgba(86, 117, 109, 0.14)" borderRadius="2xl" p={5} bg="white" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
      <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">{title}</Heading>
      <VStack align="stretch" spacing={3}>
        {data.length === 0 ? (
          <Text fontSize="12.5px" color="#5A6E65">No trend data available.</Text>
        ) : data.map((d) => {
          const value = Number(d?.[valueKey] || 0);
          const pct = Math.max(4, Math.round((value / max) * 100));
          return (
            <Box key={`${title}-${d.month}`}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="11.5px" color="#5A6E65">{d.month}</Text>
                <Text fontSize="12px" fontWeight="700" color="#263A33">{value.toLocaleString()}{unit}</Text>
              </HStack>
              <Box h="7px" bg="rgba(86, 117, 109, 0.1)" borderRadius="full" overflow="hidden">
                <Box h="100%" w={`${pct}%`} bg="#56756D" borderRadius="full" />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

const ReportSectionCard = ({ title, description, children, headerRight }) => (
  <Box border="1px solid rgba(86, 117, 109, 0.14)" borderRadius="2xl" p={5} bg="white" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
    <HStack justify="space-between" align="flex-start" mb={description ? 2 : 4} flexWrap="wrap" gap={2}>
      <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">{title}</Heading>
      {headerRight}
    </HStack>
    {description ? (
      <Text fontSize="13px" color="#5A6E65" mb={4} lineHeight="1.5">
        {description}
      </Text>
    ) : null}
    {children}
  </Box>
);

const CountGrid = ({ data = {} }) => (
  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
    {Object.entries(data).map(([k, v]) => (
      <MetricCard
        key={k}
        label={k.replace(/_/g, " ")}
        value={typeof v === "number" ? v : String(v)}
      />
    ))}
  </SimpleGrid>
);

const downloadJson = (filename, obj) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const formatDelta = (v) => {
  if (v == null || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  if (n > 0) return `+${n.toLocaleString()}`;
  return n.toLocaleString();
};

const FALLBACK_ADMIN_REPORT_CATALOG = [
  { key: "executive", title: "Executive summary", description: "Headline KPIs vs prior period." },
  { key: "growth", title: "Growth & pipeline", description: "Applications, signups, relationships." },
  { key: "revenue", title: "Revenue & subscriptions", description: "Checkout, subscribers, trends." },
  { key: "operations", title: "Clinical operations", description: "Appointments and booking funnel." },
  { key: "therapist_practice", title: "Therapist practice", description: "Per-therapist scorecard." },
  { key: "supervision", title: "Supervision network", description: "Supervisors and documentation." },
  { key: "platform", title: "Platform & support", description: "Tickets and inbound leads." },
];

const growthSectionBody = (sec) => {
  if (sec.counts) return <CountGrid data={sec.counts} />;
  const skip = new Set(["title", "description", "counts", "rows"]);
  const pairs = Object.entries(sec).filter(
    ([k, v]) => !skip.has(k) && v != null && typeof v !== "object"
  );
  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
      {pairs.map(([k, v]) => (
        <MetricCard key={k} label={k.replace(/_/g, " ")} value={v} />
      ))}
    </SimpleGrid>
  );
};

  const Sidebar = ({ activeTab, setActiveTab, isTherapist, onLogout }) => {
    const { logout } = useAuth();
    const handleLogout = onLogout || logout;

    return (
      <VStack 
      w="280px" 
      bg="white" 
      h="100vh" 
      position="sticky" 
      top="0" 
      borderRight="1px solid" 
      borderColor="gray.100" 
      p={6} 
      align="stretch" 
      spacing={8}
      overflowY="auto"
      display={{ base: "none", lg: "flex" }}
    >
      <VStack align="flex-start" spacing={1}>
        <HStack spacing={2} mb={4}>
          <Box bg="mlc.green" p={2} borderRadius="lg">
            <LayoutDashboard color="white" size={20} />
          </Box>
          <Heading size="md" tracking="tight">MLC Admin</Heading>
        </HStack>
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>LEADS & INQUIRIES</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Mail} label="Contact Inquiries" id="messages" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={FileCheck} label="Booking Leads" id="bookings" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={HelpCircle} label="Support Tickets" id="support_tickets" />
        
        <Link href="/admin/feedback">
          <HStack
            spacing={3}
            px={4}
            py={3}
            cursor="pointer"
            color="gray.600"
            borderRadius="xl"
            transition="all 0.2s"
            _hover={{ bg: "rgba(95, 160, 147, 0.05)", color: "mlc.green" }}
          >
            <Icon as={FiZap} size={18} />
            <Text fontWeight="500">Improvement Architect</Text>
            <Badge colorScheme="orange" variant="solid" fontSize="2xs" borderRadius="full">NEW</Badge>
          </HStack>
        </Link>
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>VERIFICATION</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Users} label="Therapist Directory" id="vetting" />
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>REPORTING</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={BarChart3} label="Business Reports" id="reports" />
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>WEBSITE CONTENT</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={HomeIcon} label="Home Page" id="home" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Briefcase} label="Services Cards" id="services_list" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Users} label="Team Members" id="team" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Globe} label="Other Pages" id="other_pages" />
        <Link href="/admin/blog" passHref style={{ textDecoration: 'none' }}>
          <HStack
            spacing={3}
            px={4}
            py={3}
            cursor="pointer"
            bg="transparent"
            color="gray.600"
            borderRadius="xl"
            transition="all 0.2s"
            _hover={{ bg: "rgba(95, 160, 147, 0.05)", color: "mlc.green" }}
          >
            <Box as={FileCheck} size={18} />
            <Text fontWeight="500" fontSize="md">
              Blog CMS
            </Text>
          </HStack>
        </Link>
        <Link href="/admin/therapist-matching" passHref style={{ textDecoration: 'none' }}>
          <HStack
            spacing={3}
            px={4}
            py={3}
            cursor="pointer"
            bg="transparent"
            color="gray.600"
            borderRadius="xl"
            transition="all 0.2s"
            _hover={{ bg: "rgba(95, 160, 147, 0.05)", color: "mlc.green" }}
          >
            <Box as={HelpCircle} size={18} />
            <Text fontWeight="500" fontSize="md">
              Therapist Matching (Full Quiz)
            </Text>
          </HStack>
        </Link>
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>COMMUNITY</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={GraduationCap} label="Training Content" id="training" />
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Layers} label="Careers Content" id="careers" />
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>SYSTEM TESTING</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Video} label="Video Test Lab" id="video_test" />
      </VStack>

      <Box pt={8} pb={4} px={2}>
        <VStack spacing={2} align="stretch">
          {isTherapist && (
            <Button 
              as={Link}
              href="/dashboard/therapist"
              variant="solid" 
              bg="#263A33"
              color="white"
              w="full" 
              size="sm" 
              borderRadius="xl"
              leftIcon={<Briefcase size={14} />}
              _hover={{ bg: "#182722" }}
              justifyContent="flex-start"
            >
              Therapist Workspace
            </Button>
          )}
          <Button 
            variant="ghost" 
            w="full" 
            size="sm" 
            color="gray.500"
            borderRadius="xl"
            leftIcon={<Globe size={14} />}
            onClick={() => window.open("/", "_blank")}
            justifyContent="flex-start"
          >
            View Live Site
          </Button>
          <Button 
            variant="ghost" 
            w="full" 
            size="sm" 
            color="red.600"
            borderRadius="xl"
            leftIcon={<LogOut size={14} />}
            onClick={() => handleLogout()}
            justifyContent="flex-start"
            _hover={{ bg: "red.50", color: "red.700" }}
          >
            Sign Out
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
};

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    router.push(`/admin?tab=${tabKey}`, { scroll: false });
  };
  const [supportTickets, setSupportTickets] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const { isAuthenticated, isAdmin, isTherapist, login, logout, loading: authLoading } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceDraft, setServiceDraft] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [homeDraft, setHomeDraft] = useState(defaultHomeDraft);
  const [homeId, setHomeId] = useState(null);
  const [aboutDraft, setAboutDraft] = useState(defaultAboutDraft);
  const [aboutId, setAboutId] = useState(null);
  const [therapistsDraft, setTherapistsDraft] = useState(defaultTherapistsDraft);
  const [therapistsId, setTherapistsId] = useState(null);
  const [servicesContentDraft, setServicesContentDraft] = useState(defaultServicesDraft);
  const [servicesContentId, setServicesContentId] = useState(null);
  const [contactDraft, setContactDraft] = useState(defaultContactDraft);
  const [contactId, setContactId] = useState(null);
  const [trainingDraft, setTrainingDraft] = useState(defaultTrainingDraft);
  const [trainingId, setTrainingId] = useState(null);
  const [careersDraft, setCareersDraft] = useState(defaultCareersDraft);
  const [careersId, setCareersId] = useState(null);
  const [therapistApplyDraft, setTherapistApplyDraft] = useState(defaultTherapistApplyDraft);
  const [therapistApplyId, setTherapistApplyId] = useState(null);

  const [unverifiedTherapists, setUnverifiedTherapists] = useState([]);
  const [allTherapists, setAllTherapists] = useState([]);
  const [therapistApplications, setTherapistApplications] = useState([]);
  const [vettingSubTab, setVettingSubTab] = useState("queue"); // "queue" | "published" | "all"
  const [publishedSearchQuery, setPublishedSearchQuery] = useState("");
  const [unpublishTarget, setUnpublishTarget] = useState(null);
  const [unpublishing, setUnpublishing] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);

  const [contactMessages, setContactMessages] = useState([]);
  const [quickBookings, setQuickBookings] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [bookingSubTab, setBookingSubTab] = useState("appointments");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportQuarter, setReportQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportCatalog, setReportCatalog] = useState([]);
  const [activeReportKey, setActiveReportKey] = useState("executive");
  const [reportByKey, setReportByKey] = useState({});
  const [reportWorkspaceTab, setReportWorkspaceTab] = useState("live");
  const [reportSnapshots, setReportSnapshots] = useState([]);
  const [reportSchedules, setReportSchedules] = useState([]);
  const [snapshotTitle, setSnapshotTitle] = useState("");
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [schedName, setSchedName] = useState("");
  const [schedReportKey, setSchedReportKey] = useState("executive");
  const [schedPreset, setSchedPreset] = useState("previous_month");
  const [schedFreq, setSchedFreq] = useState("monthly");
  const [schedWeekday, setSchedWeekday] = useState(0);
  const [schedDayOfMonth, setSchedDayOfMonth] = useState(1);
  const [schedRecipients, setSchedRecipients] = useState("");

  const fetchContactMessages = async () => {
    try {
      const data = await apiGet("contact-messages/");
      setContactMessages(Array.isArray(data) ? data : (data.results || []));
    } catch (err) { console.error(err); }
  };

  const fetchQuickBookings = async () => {
    try {
      const data = await apiGet("quick-bookings/");
      setQuickBookings(Array.isArray(data) ? data : (data.results || []));
    } catch (err) { console.error(err); }
  };

  const fetchAllAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const data = await apiGet("appointments/");
      setAllAppointments(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const reportQueryString = () =>
    new URLSearchParams({
      period: reportPeriod,
      year: String(reportYear),
      month: String(reportMonth),
      quarter: String(reportQuarter),
    }).toString();

  const fetchReportCatalog = async () => {
    try {
      const data = await apiGet("admin/reports/catalog/");
      const list = Array.isArray(data?.reports) ? data.reports : [];
      setReportCatalog(list);
      if (list.length && !list.some((r) => r.key === activeReportKey)) {
        setActiveReportKey(list[0].key);
      }
    } catch (err) {
      console.error(err);
      toast({
        status: "warning",
        title: "Report catalog unavailable",
        description: "Using default report tabs.",
      });
    }
  };

  const fetchAdminReport = async (key) => {
    const reportKey = key || activeReportKey;
    try {
      setReportsLoading(true);
      setReportError(null);
      const data = await apiGet(`admin/reports/${reportKey}/?${reportQueryString()}`);
      setReportByKey((prev) => ({ ...prev, [reportKey]: data }));
    } catch (err) {
      const errMsg = err?.response?.data?.detail || err?.message || "Could not load report.";
      setReportError(errMsg);
      toast({
        status: "warning",
        title: "Report unavailable",
        description: errMsg,
      });
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchReportSnapshots = async () => {
    try {
      const data = await apiGet("admin/report-snapshots/");
      setReportSnapshots(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Could not load snapshots" });
    }
  };

  const fetchReportSchedules = async () => {
    try {
      const data = await apiGet("admin/report-email-schedules/");
      setReportSchedules(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Could not load schedules" });
    }
  };

  const saveCurrentReportSnapshot = async () => {
    try {
      setSavingSnapshot(true);
      await apiPost("admin/report-snapshots/", {
        report_key: activeReportKey,
        period: reportPeriod,
        year: reportYear,
        month: reportMonth,
        quarter: reportQuarter,
        title:
          snapshotTitle.trim() ||
          `${activeReportKey} ${reportByKey[activeReportKey]?.period?.label || ""}`,
      });
      toast({
        status: "success",
        title: "Snapshot saved",
        description: "Stored with PDF when generation succeeds.",
      });
      setSnapshotTitle("");
      if (reportWorkspaceTab === "snapshots") fetchReportSnapshots();
    } catch (err) {
      toast({
        status: "error",
        title: "Snapshot failed",
        description: err?.response?.data?.detail || "Try again.",
      });
    } finally {
      setSavingSnapshot(false);
    }
  };

  const downloadSnapshotPdfFile = async (snap) => {
    try {
      const blob = await apiGetBlob(`admin/report-snapshots/${snap.id}/pdf/`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mlc-snapshot-${snap.report_key}-${snap.period_label || snap.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ status: "error", title: "PDF download failed" });
    }
  };

  const deleteSnapshot = async (id) => {
    try {
      await apiDelete(`admin/report-snapshots/${id}/`);
      fetchReportSnapshots();
      toast({ status: "success", title: "Snapshot deleted" });
    } catch {
      toast({ status: "error", title: "Delete failed" });
    }
  };

  const createEmailSchedule = async () => {
    const emails = schedRecipients.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    try {
      await apiPost("admin/report-email-schedules/", {
        name: schedName,
        report_key: schedReportKey,
        period_preset: schedPreset,
        frequency: schedFreq,
        weekday: schedFreq === "weekly" ? Number(schedWeekday) : null,
        day_of_month: schedFreq === "monthly" ? Number(schedDayOfMonth) : null,
        recipient_emails: emails,
        is_active: true,
      });
      toast({ status: "success", title: "Schedule created" });
      setSchedName("");
      setSchedRecipients("");
      fetchReportSchedules();
    } catch (err) {
      toast({
        status: "error",
        title: "Could not create schedule",
        description:
          typeof err?.response?.data === "object"
            ? JSON.stringify(err.response.data)
            : err?.response?.data?.detail || "",
      });
    }
  };

  const sendScheduleNow = async (id) => {
    try {
      await apiPost(`admin/report-email-schedules/${id}/send-now/`, {});
      toast({ status: "success", title: "Report emailed" });
      fetchReportSchedules();
      fetchReportSnapshots();
    } catch (err) {
      toast({
        status: "error",
        title: "Send failed",
        description: err?.response?.data?.detail || "",
      });
    }
  };

  const patchScheduleActive = async (row, active) => {
    try {
      await apiPatch(`admin/report-email-schedules/${row.id}/`, { is_active: active });
      fetchReportSchedules();
    } catch {
      toast({ status: "error", title: "Update failed" });
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await apiDelete(`admin/report-email-schedules/${id}/`);
      fetchReportSchedules();
    } catch {
      toast({ status: "error", title: "Delete failed" });
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await apiGet("team-members/");
      const data = res.results ?? res;
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Failed to load team members" });
    }
  };

  const fetchServices = async () => {
    try {
      const res = await apiGet("services/");
      const data = res.results ?? res;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Failed to load services" });
    }
  };

  const fetchHomeContent = async () => {
    try {
      const res = await apiGet("home-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setHomeId(data[0].id);
        setHomeDraft({
          hero: { ...defaultHomeDraft.hero, ...(data[0].hero || {}) },
          portal: { ...defaultHomeDraft.portal, ...(data[0].portal || {}) },
          bubbles: Array.isArray(data[0].bubbles) ? data[0].bubbles : defaultHomeDraft.bubbles,
        });
      }
    } catch {
      setHomeDraft(defaultHomeDraft);
      setHomeId(null);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const res = await apiGet("about-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setAboutId(data[0].id);
        setAboutDraft({
          hero: { ...defaultAboutDraft.hero, ...(data[0].hero || {}) },
          why: { ...defaultAboutDraft.why, ...(data[0].why || {}) },
          pillars: Array.isArray(data[0].pillars) ? data[0].pillars : defaultAboutDraft.pillars,
          message: { ...defaultAboutDraft.message, ...(data[0].message || {}) },
        });
      }
    } catch {
      setAboutDraft(defaultAboutDraft);
      setAboutId(null);
    }
  };

  const fetchTherapistsContent = async () => {
    try {
      const res = await apiGet("therapists-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setTherapistsId(data[0].id);
        const mergedWhy = { ...defaultTherapistsDraft.why, ...(data[0].why || {}) };
        const mergedSupervision = {
          ...defaultTherapistsDraft.supervision,
          ...(data[0].supervision || {}),
        };
        const mergedLearning = {
          ...defaultTherapistsDraft.learning,
          ...(data[0].learning || {}),
        };
        const mergedWork = { ...defaultTherapistsDraft.work, ...(data[0].work || {}) };
        const mergedValues = {
          ...defaultTherapistsDraft.values,
          ...(data[0].values || {}),
        };
        if (!Array.isArray(mergedWhy.cards)) mergedWhy.cards = defaultTherapistsDraft.why.cards;
        if (!Array.isArray(mergedSupervision.cards)) mergedSupervision.cards = defaultTherapistsDraft.supervision.cards;
        if (!Array.isArray(mergedLearning.cards)) mergedLearning.cards = defaultTherapistsDraft.learning.cards;
        if (!Array.isArray(mergedWork.cards)) mergedWork.cards = defaultTherapistsDraft.work.cards;
        if (!Array.isArray(mergedValues.bubbles)) mergedValues.bubbles = defaultTherapistsDraft.values.bubbles;
        setTherapistsDraft({
          hero: { ...defaultTherapistsDraft.hero, ...(data[0].hero || {}) },
          why: mergedWhy,
          supervision: mergedSupervision,
          learning: mergedLearning,
          work: mergedWork,
          values: mergedValues,
          cta: { ...defaultTherapistsDraft.cta, ...(data[0].cta || {}) },
        });
      }
    } catch {
      setTherapistsDraft(defaultTherapistsDraft);
      setTherapistsId(null);
    }
  };

  const fetchServicesContent = async () => {
    try {
      const res = await apiGet("services-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setServicesContentId(data[0].id);
        const mergedPrograms = {
          ...defaultServicesDraft.programs,
          ...(data[0].programs || {}),
        };
        if (!Array.isArray(mergedPrograms.cards)) mergedPrograms.cards = defaultServicesDraft.programs.cards;
        const mergedFaq = {
          ...defaultServicesDraft.faq,
          ...(data[0].faq || {}),
        };
        if (!Array.isArray(mergedFaq.items)) mergedFaq.items = defaultServicesDraft.faq.items;
        setServicesContentDraft({
          hero: { ...defaultServicesDraft.hero, ...(data[0].hero || {}) },
          portal: { ...defaultServicesDraft.portal, ...(data[0].portal || {}) },
          services: { ...defaultServicesDraft.services, ...(data[0].services || {}) },
          programs: mergedPrograms,
          approach: { ...defaultServicesDraft.approach, ...(data[0].approach || {}) },
          faq: mergedFaq,
          cta: { ...defaultServicesDraft.cta, ...(data[0].cta || {}) },
        });
      }
    } catch {
      setServicesContentDraft(defaultServicesDraft);
      setServicesContentId(null);
    }
  };

  const fetchContactContent = async () => {
    try {
      const data = await apiGet("contact-content/");
      if (Array.isArray(data) && data.length > 0) {
        setContactId(data[0].id);
        const mergedHours = { ...defaultContactDraft.hours, ...(data[0].hours || {}) };
        if (!Array.isArray(mergedHours.items)) mergedHours.items = defaultContactDraft.hours.items;
        setContactDraft({
          hero: { ...defaultContactDraft.hero, ...(data[0].hero || {}) },
          form: { ...defaultContactDraft.form, ...(data[0].form || {}) },
          quote: { ...defaultContactDraft.quote, ...(data[0].quote || {}) },
          hours: mergedHours,
          closing: { ...defaultContactDraft.closing, ...(data[0].closing || {}) },
        });
      }
    } catch {
      setContactDraft(defaultContactDraft);
      setContactId(null);
    }
  };

  const fetchTrainingContent = async () => {
    try {
      const data = await apiGet("training-programs-content/");
      if (Array.isArray(data) && data.length > 0) {
        setTrainingId(data[0].id);
        const mergedPrograms = { ...defaultTrainingDraft.programs, ...(data[0].programs || {}) };
        if (!Array.isArray(mergedPrograms.cards)) mergedPrograms.cards = defaultTrainingDraft.programs.cards;
        const mergedFaq = { ...defaultTrainingDraft.faq, ...(data[0].faq || {}) };
        if (!Array.isArray(mergedFaq.items)) mergedFaq.items = defaultTrainingDraft.faq.items;
        setTrainingDraft({
          hero: { ...defaultTrainingDraft.hero, ...(data[0].hero || {}) },
          programs: mergedPrograms,
          faq: mergedFaq,
          cta: { ...defaultTrainingDraft.cta, ...(data[0].cta || {}) },
        });
      }
    } catch {
      setTrainingDraft(defaultTrainingDraft);
      setTrainingId(null);
    }
  };

  const fetchCareersContent = async () => {
    try {
       const data = await apiGet("careers-content/");
       if (Array.isArray(data) && data.length > 0) {
         setCareersId(data[0].id);
         const mergedWhy = { ...defaultCareersDraft.why, ...(data[0].why || {}) };
         if (!Array.isArray(mergedWhy.items)) mergedWhy.items = defaultCareersDraft.why.items;
         const mergedOpenings = { ...defaultCareersDraft.openings, ...(data[0].openings || {}) };
         if (!Array.isArray(mergedOpenings.cards)) mergedOpenings.cards = defaultCareersDraft.openings.cards;
         const mergedOpportunities = { ...defaultCareersDraft.opportunities, ...(data[0].opportunities || {}) };
         if (!Array.isArray(mergedOpportunities.cards)) mergedOpportunities.cards = defaultCareersDraft.opportunities.cards;
         setCareersDraft({
           hero: { ...defaultCareersDraft.hero, ...(data[0].hero || {}) },
           why: mergedWhy,
           openings: mergedOpenings,
           opportunities: mergedOpportunities,
           form: { ...defaultCareersDraft.form, ...(data[0].form || {}) },
           footer: { ...defaultCareersDraft.footer, ...(data[0].footer || {}) },
         });
       }
    } catch {
      setCareersDraft(defaultCareersDraft);
      setCareersId(null);
    }
  };

  const fetchTherapistApplyContent = async () => {
    try {
      const data = await apiGet("therapist-apply-content/");
      if (Array.isArray(data) && data.length > 0) {
        setTherapistApplyId(data[0].id);
        setTherapistApplyDraft({
          hero: { ...defaultTherapistApplyDraft.hero, ...(data[0].hero || {}) },
          sections: { ...defaultTherapistApplyDraft.sections, ...(data[0].sections || {}) },
          form: { ...defaultTherapistApplyDraft.form, ...(data[0].form || {}) },
        });
      }
    } catch {
      setTherapistApplyDraft(defaultTherapistApplyDraft);
      setTherapistApplyId(null);
    }
  };

  const fetchUnverifiedTherapists = async () => {
    try {
      const data = await apiGet("therapists/?is_verified=false");
      setUnverifiedTherapists(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error("Failed to fetch unverified therapists", err);
    }
  };

  const fetchAllTherapists = async () => {
    try {
      const data = await apiGet("therapists/");
      setAllTherapists(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error("Failed to fetch therapists", err);
    }
  };

  const getTherapistByEmail = (email) => {
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) return null;
    return allTherapists.find((t) => (t.email || "").trim().toLowerCase() === normalized) || null;
  };

  const getVettingStage = (app) => {
    const profile = getTherapistByEmail(app.email);
    if (profile?.profile_status === "approved" && profile?.is_verified) return "published";
    if (profile?.profile_status === "awaiting_contract") return "awaiting_contract";
    if (profile?.profile_status === "changes_requested") return "changes_requested";
    if (app.status === "rejected") return "rejected";
    return "review";
  };

  const VETTING_STAGE_META = {
    review: { label: "PENDING REVIEW", color: "orange" },
    awaiting_contract: { label: "AWAITING CONTRACT", color: "purple" },
    changes_requested: { label: "CHANGES REQUESTED", color: "red" },
    published: { label: "PUBLISHED", color: "green" },
    rejected: { label: "REJECTED", color: "red" },
  };

  const fetchTherapistApplications = async () => {
    try {
      const data = await apiGet("manage-therapist-applications/");
      setTherapistApplications(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const publishedTherapists = useMemo(() => {
    return allTherapists.filter(t => t.is_verified || t.profile_status === "approved");
  }, [allTherapists]);

  const filteredPublishedTherapists = useMemo(() => {
    const q = publishedSearchQuery.trim().toLowerCase();
    if (!q) return publishedTherapists;
    return publishedTherapists.filter(t => 
      (t.name || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.title || "").toLowerCase().includes(q) ||
      (Array.isArray(t.specializations) && t.specializations.some(s => String(s).toLowerCase().includes(q)))
    );
  }, [publishedTherapists, publishedSearchQuery]);

  const duplicateTherapistNames = useMemo(() => {
    const counts = {};
    allTherapists.forEach(t => {
      const n = (t.name || "").trim().toLowerCase();
      if (n && !n.startsWith("user_")) {
        counts[n] = (counts[n] || 0) + 1;
      }
    });
    return counts;
  }, [allTherapists]);

  const handleVerifyTherapist = async (therapistId, name = "Clinician") => {
    try {
      await apiPost(`therapists/verify/${therapistId}/`, {});
      toast({
        status: "success",
        title: "Therapist Verified & Published",
        description: `${name} is now verified and live on the public directory.`,
      });
      await Promise.all([
        fetchUnverifiedTherapists(),
        fetchAllTherapists(),
        fetchTherapistApplications(),
      ]);
    } catch (err) {
      console.error("Verification failed", err);
      toast({
        status: "error",
        title: "Verification failed",
        description: apiErrorDetail(err),
      });
    }
  };

  const handleConfirmUnpublish = async () => {
    if (!unpublishTarget?.id) return;
    setUnpublishing(true);
    try {
      try {
        await apiPatch(`therapists/${unpublishTarget.id}/`, {
          is_verified: false,
          profile_status: "draft",
        });
      } catch (patchErr) {
        console.warn("Direct PATCH unpublish failed, attempting request-profile-changes fallback", patchErr);
        await apiPost(`therapists/${unpublishTarget.id}/request-profile-changes/`, {
          feedback: "Unpublished from directory by administrator.",
        });
      }

      toast({
        status: "info",
        title: "Clinician Unpublished",
        description: `${unpublishTarget.name || unpublishTarget.email} has been removed from live directory.`,
      });
      setUnpublishTarget(null);
      await Promise.all([
        fetchAllTherapists(),
        fetchUnverifiedTherapists(),
        fetchTherapistApplications(),
      ]);
    } catch (err) {
      console.error("Unpublish failed", err);
      toast({
        status: "error",
        title: "Unpublish failed",
        description: apiErrorDetail(err, "Could not unpublish clinician profile. Please try again."),
      });
    } finally {
      setUnpublishing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchMembers();
      fetchServices();
      fetchHomeContent();
      fetchAboutContent();
      fetchTherapistsContent();
      fetchServicesContent();
      fetchContactContent();
      fetchTrainingContent();
      fetchCareersContent();
      fetchTherapistApplyContent();
      fetchUnverifiedTherapists();
      fetchAllTherapists();
      fetchTherapistApplications();
      fetchContactMessages();
      fetchQuickBookings();
      fetchSupportTickets();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchSupportTickets = async () => {
    try {
      const data = await apiGet("support-tickets/");
      setSupportTickets(data);
    } catch (err) {
      console.error("Failed to fetch support tickets", err);
    }
  };

  const resolveTicket = async (id, adminNotes) => {
    try {
      await apiPost(`support-tickets/${id}/resolve/`, { admin_notes: adminNotes });
      toast({ status: "success", title: "Ticket Resolved" });
      fetchSupportTickets();
    } catch (err) {
      toast({ status: "error", title: "Failed to resolve ticket" });
    }
  };

  useEffect(() => {
    if (activeTab === "messages") fetchContactMessages();
    if (activeTab === "bookings") {
      fetchQuickBookings();
      fetchAllAppointments();
    }
    if (activeTab === "support_tickets") fetchSupportTickets();
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab !== "reports") return;
    fetchReportCatalog();
  }, [isAuthenticated, isAdmin, activeTab]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab !== "reports") return;
    if (!activeReportKey) return;
    fetchAdminReport(activeReportKey);
  }, [isAuthenticated, isAdmin, activeTab, activeReportKey, reportPeriod, reportYear, reportMonth, reportQuarter]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab !== "reports") return;
    if (reportWorkspaceTab !== "snapshots") return;
    fetchReportSnapshots();
  }, [isAuthenticated, isAdmin, activeTab, reportWorkspaceTab]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab !== "reports") return;
    if (reportWorkspaceTab !== "schedules") return;
    fetchReportSchedules();
  }, [isAuthenticated, isAdmin, activeTab, reportWorkspaceTab]);

  if (!isMounted) return null;

  if (authLoading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="#F9FAFB">
        <Text>Loading…</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box py={20} textAlign="center">
        <Heading size="lg" mb={4}>
          Admin login required
        </Heading>
        <Text mb={6}>Sign in with your admin account to edit the website.</Text>
          <Button as={Link} href="/login/admin" colorScheme="teal" mt={4}>
            Sign in
          </Button>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box py={20} textAlign="center">
        <Heading size="lg" mb={4}>
          Access denied
        </Heading>
        <Text>You’re signed in but don’t have admin privileges.</Text>
      </Box>
    );
  }

  const pendingVettingCount =
    therapistApplications.filter(a => ["review", "awaiting_contract"].includes(getVettingStage(a))).length +
    unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_")).length;
  const openTicketsCount = supportTickets.filter(
    (t) => t.status !== "resolved" && t.status !== "closed"
  ).length;

  const tabTitles = {
    overview: "Executive Overview",
    messages: "Contact Inquiries",
    bookings: "Bookings & Sessions",
    support_tickets: "Support Tickets",
    vetting: "Therapist Directory",
    reports: "Business Reports & Intelligence",
    home: "Home Page CMS",
    services_list: "Services Catalog",
    team: "Clinical Team Directory",
    other_pages: "Static Pages Editor",
    video_test: "Video Test Lab",
    training: "Training Content Editor",
    careers: "Careers Content Editor",
    therapists: "Therapists Page Editor",
    services_content: "Services Content Editor",
    therapist_apply: "Therapist Apply Page Editor",
  };

  const tabSubtitles = {
    overview: "Real-time command center, operational metrics, and urgent review.",
    messages: "Public user messages and direct client contact submissions.",
    bookings: "Live clinical appointments, scheduled tele-therapy sessions, and inbound booking leads.",
    support_tickets: "Therapist and client platform support inquiries and resolutions.",
    vetting: "Candidate applications, clinical qualifications, and live discovery directory management.",
    reports: "Platform health, financial performance, and executive analytics.",
    home: "Curate hero sections, value propositions, and interactive portal copy.",
    services_list: "Manage clinical offerings, therapy modalities, and direct booking links.",
    team: "Maintain therapist and practitioner roster, photos, and credentials.",
    other_pages: "Update about, contact, training, careers, and legal policies.",
    video_test: "Diagnostics sandbox for WebRTC tokens and 1-on-1 session video feeds.",
  };

  const tabHeroIcons = {
    overview: null,
    vetting: FiUsers,
    reports: FiTrendingUp,
    messages: FiMail,
    bookings: FiCalendar,
    support_tickets: FiHelpCircle,
    home: FiHome,
    services_list: FiBriefcase,
    team: FiUsers,
    other_pages: FiLayers,
    video_test: FiVideo,
  };

  const currentTabTitle = tabTitles[activeTab] || (activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("_", " "));
  const currentTabSubtitle = tabSubtitles[activeTab] || "Management and operational settings.";

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED GOLDEN BENCHMARK HERO CARD (Rule 8 & 10) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Identity & Space Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              {activeTab === "overview" || !tabHeroIcons[activeTab] ? (
                <Avatar 
                  size="md" 
                  name={user?.fullName || "Administrator"} 
                  src={user?.imageUrl} 
                  border="2px solid white" 
                  boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)" 
                />
              ) : (
                <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={tabHeroIcons[activeTab]} boxSize="22px" />
                </Circle>
              )}
              <Circle 
                size="11px" 
                bg="#38A169" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
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
                  {activeTab === "vetting" ? "Command Center · Directory 🌿" : "Command Center • Live 🌿"}
                </Badge>
                {pendingVettingCount > 0 ? (
                  <Badge 
                    as="button"
                    onClick={() => handleTabChange("vetting")}
                    bg="#FFFBEB" 
                    color="#D97706" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    _hover={{ bg: "#FEF3C7" }}
                    cursor="pointer"
                  >
                    ⚡ {pendingVettingCount} Pending Review
                  </Badge>
                ) : activeTab === "vetting" ? (
                  <Badge 
                    bg="#ECFDF5" 
                    color="#065F46" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full" 
                    px={2.5} 
                    py={0.5}
                  >
                    ✓ All Reviewed
                  </Badge>
                ) : null}
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600" 
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                {currentTabTitle}
              </Heading>
              <Text 
                fontSize="13px" 
                color="#5A6E65" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.4"
              >
                {currentTabSubtitle}
              </Text>
            </VStack>
          </HStack>

          {/* Right cluster: Segmented Rail if on Vetting tab, or standard metric strip for other tabs */}
          {activeTab === "vetting" ? (
            <HStack 
              bg="rgba(250, 248, 245, 0.95)" 
              p={1} 
              borderRadius="full" 
              border="1px solid rgba(86, 117, 109, 0.14)" 
              spacing={1}
              boxShadow="inset 0 1px 2px rgba(38, 58, 51, 0.03)"
              flexShrink={0}
              w={{ base: "full", sm: "auto" }}
              overflowX="auto"
            >
              <Button
                size="sm"
                h="34px"
                borderRadius="full"
                fontSize="12.5px"
                fontWeight="600"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                px={3.5}
                whiteSpace="nowrap"
                bg={vettingSubTab === "queue" ? "#56756D" : "transparent"}
                color={vettingSubTab === "queue" ? "white" : "#5A6E65"}
                boxShadow={vettingSubTab === "queue" ? "0 2px 6px rgba(86, 117, 109, 0.25)" : "none"}
                _hover={{ bg: vettingSubTab === "queue" ? "#263A33" : "rgba(86, 117, 109, 0.08)", color: vettingSubTab === "queue" ? "white" : "#263A33" }}
                onClick={() => setVettingSubTab("queue")}
              >
                Directory Queue
                <Box 
                  as="span" 
                  ml={2} 
                  px={1.5} 
                  py={0.2} 
                  borderRadius="full" 
                  fontSize="10px" 
                  fontWeight="700" 
                  bg={vettingSubTab === "queue" ? "rgba(255, 255, 255, 0.25)" : (pendingVettingCount > 0 ? "rgba(245, 158, 11, 0.16)" : "rgba(86, 117, 109, 0.12)")}
                  color={vettingSubTab === "queue" ? "white" : (pendingVettingCount > 0 ? "#D97706" : "#56756D")}
                >
                  {pendingVettingCount}
                </Box>
              </Button>

              <Button
                size="sm"
                h="34px"
                borderRadius="full"
                fontSize="12.5px"
                fontWeight="600"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                px={3.5}
                whiteSpace="nowrap"
                bg={vettingSubTab === "published" ? "#56756D" : "transparent"}
                color={vettingSubTab === "published" ? "white" : "#5A6E65"}
                boxShadow={vettingSubTab === "published" ? "0 2px 6px rgba(86, 117, 109, 0.25)" : "none"}
                _hover={{ bg: vettingSubTab === "published" ? "#263A33" : "rgba(86, 117, 109, 0.08)", color: vettingSubTab === "published" ? "white" : "#263A33" }}
                onClick={() => setVettingSubTab("published")}
              >
                Published Live
                <Box 
                  as="span" 
                  ml={2} 
                  px={1.5} 
                  py={0.2} 
                  borderRadius="full" 
                  fontSize="10px" 
                  fontWeight="700" 
                  bg={vettingSubTab === "published" ? "rgba(255, 255, 255, 0.25)" : "rgba(16, 185, 129, 0.15)"}
                  color={vettingSubTab === "published" ? "white" : "#059669"}
                >
                  {publishedTherapists.length}
                </Box>
              </Button>

              <Button
                size="sm"
                h="34px"
                borderRadius="full"
                fontSize="12.5px"
                fontWeight="600"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                px={3.5}
                whiteSpace="nowrap"
                bg={vettingSubTab === "all" ? "#56756D" : "transparent"}
                color={vettingSubTab === "all" ? "white" : "#5A6E65"}
                boxShadow={vettingSubTab === "all" ? "0 2px 6px rgba(86, 117, 109, 0.25)" : "none"}
                _hover={{ bg: vettingSubTab === "all" ? "#263A33" : "rgba(86, 117, 109, 0.08)", color: vettingSubTab === "all" ? "white" : "#263A33" }}
                onClick={() => setVettingSubTab("all")}
              >
                All Profiles
                <Box 
                  as="span" 
                  ml={2} 
                  px={1.5} 
                  py={0.2} 
                  borderRadius="full" 
                  fontSize="10px" 
                  fontWeight="700" 
                  bg={vettingSubTab === "all" ? "rgba(255, 255, 255, 0.25)" : "rgba(86, 117, 109, 0.12)"}
                  color={vettingSubTab === "all" ? "white" : "#56756D"}
                >
                  {allTherapists.length}
                </Box>
              </Button>
            </HStack>
          ) : (
            <Stack direction={{ base: "column", md: "row" }} spacing={3} align={{ base: "stretch", md: "center" }} w={{ base: "full", lg: "auto" }}>
              <HStack 
                spacing={{ base: 1.5, sm: 3 }} 
                p={1.5} 
                px={{ base: 2, sm: 2.5 }} 
                borderRadius="xl" 
                bg="rgba(250, 248, 245, 0.9)" 
                border="1px solid rgba(86, 117, 109, 0.1)" 
                w={{ base: "full", md: "auto" }} 
                justify="space-between"
              >
                {/* Node 1: Pending Directory */}
                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                    <Icon as={FiUsers} boxSize="13px" />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                      Pending Directory
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {pendingVettingCount}
                    </Text>
                  </VStack>
                </HStack>

                <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

                {/* Node 2: Open Tickets */}
                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(229, 62, 62, 0.12)" color="#E53E3E" flexShrink={0}>
                    <Icon as={FiHelpCircle} boxSize="13px" />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                      Open Tickets
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {openTicketsCount}
                    </Text>
                  </VStack>
                </HStack>

                <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

                {/* Node 3: Inbound Leads */}
                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(214, 158, 46, 0.12)" color="#D69E2E" flexShrink={0}>
                    <Icon as={FiInbox} boxSize="13px" />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                      Active Leads
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {quickBookings.length}
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
            </Stack>
          )}
        </Flex>

        {/* Dynamic bottom triage breakdown when on vetting tab */}
        {activeTab === "vetting" && (
          <>
            <Divider my={4} borderColor="rgba(86, 117, 109, 0.12)" />
            <Flex 
              direction={{ base: "column", sm: "row" }} 
              justify="space-between" 
              align={{ base: "flex-start", sm: "center" }}
              gap={3}
              px={1}
            >
              <HStack spacing={4} wrap="wrap">
                <HStack spacing={2}>
                  <Circle size="8px" bg="#D97706" />
                  <Text fontSize="12px" color="#5A6E65">
                    Review Applications: <Text as="span" fontWeight="700" color="#263A33">{therapistApplications.filter(a => ["review", "awaiting_contract"].includes(getVettingStage(a))).length}</Text>
                  </Text>
                </HStack>
                <Divider orientation="vertical" h="14px" borderColor="rgba(86, 117, 109, 0.2)" display={{ base: "none", sm: "block" }} />
                <HStack spacing={2}>
                  <Circle size="8px" bg="#4F46E5" />
                  <Text fontSize="12px" color="#5A6E65">
                    Pending Direct Verification: <Text as="span" fontWeight="700" color="#263A33">{unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_")).length}</Text>
                  </Text>
                </HStack>
                <Divider orientation="vertical" h="14px" borderColor="rgba(86, 117, 109, 0.2)" display={{ base: "none", sm: "block" }} />
                <HStack spacing={2}>
                  <Circle size="8px" bg="#10B981" />
                  <Text fontSize="12px" color="#5A6E65">
                    Live on Directory: <Text as="span" fontWeight="700" color="#263A33">{publishedTherapists.length}</Text>
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={2} alignSelf={{ base: "flex-end", sm: "center" }}>
                {unverifiedTherapists.filter(t => t.name.toLowerCase().startsWith("user_")).length > 0 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#DC2626"
                    fontSize="11px"
                    fontWeight="600"
                    _hover={{ bg: "#FEF2F2" }}
                    onClick={async () => {
                      const ghosts = unverifiedTherapists.filter(t => t.name.toLowerCase().startsWith("user_"));
                      if (!confirm(`Purge ${ghosts.length} placeholder ghost profiles (named user_...)?`)) return;
                      try {
                        for (const g of ghosts) {
                          await apiDelete('therapists/' + g.id + '/');
                        }
                        toast({ status: "info", title: "Ghosts Purged", description: `Removed ${ghosts.length} placeholder accounts.` });
                        fetchUnverifiedTherapists();
                        fetchAllTherapists();
                      } catch {
                        toast({ status: "error", title: "Purge failed" });
                      }
                    }}
                  >
                    Purge {unverifiedTherapists.filter(t => t.name.toLowerCase().startsWith("user_")).length} Ghosts
                  </Button>
                )}
                <IconButton 
                  size="xs" 
                  variant="outline" 
                  borderRadius="full" 
                  borderColor="rgba(86, 117, 109, 0.2)"
                  icon={<Icon as={FiRefreshCw} boxSize="11px" />} 
                  aria-label="Refresh directory list"
                  title="Refresh clinician databases"
                  onClick={() => {
                    fetchUnverifiedTherapists();
                    fetchAllTherapists();
                    fetchTherapistApplications();
                  }}
                />
              </HStack>
            </Flex>
          </>
        )}
      </Box>

      {/* 🏛️ 2. EXECUTIVE COMMAND CENTER OVERVIEW (When activeTab === 'overview') */}
      {activeTab === "overview" && (
        <VStack align="stretch" spacing={6}>
          {/* 4 Executive KPI Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            {/* Card 1: Directory */}
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)" }}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">
                  Therapist Directory
                </Text>
                <Circle size="30px" bg="rgba(47, 133, 90, 0.12)" color="#2F855A">
                  <Icon as={FiUsers} boxSize="15px" />
                </Circle>
              </HStack>
              <Heading size="lg" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                {pendingVettingCount}
              </Heading>
              <HStack justify="space-between" mt={3} pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" color="#5A6E65">
                  {unverifiedTherapists.length} awaiting review
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#56756D"
                  fontWeight="600"
                  rightIcon={<FiArrowRight size={11} />}
                  onClick={() => handleTabChange("vetting")}
                  _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                >
                  Open
                </Button>
              </HStack>
            </Box>

            {/* Card 2: Support Tickets */}
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)" }}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">
                  Support Tickets
                </Text>
                <Circle size="30px" bg="rgba(229, 62, 62, 0.12)" color="#E53E3E">
                  <Icon as={FiHelpCircle} boxSize="15px" />
                </Circle>
              </HStack>
              <Heading size="lg" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                {openTicketsCount}
              </Heading>
              <HStack justify="space-between" mt={3} pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" color="#5A6E65">
                  {supportTickets.length} total tickets
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#56756D"
                  fontWeight="600"
                  rightIcon={<FiArrowRight size={11} />}
                  onClick={() => handleTabChange("support_tickets")}
                  _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                >
                  Review
                </Button>
              </HStack>
            </Box>

            {/* Card 3: Inbound Leads */}
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)" }}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">
                  Inbound Leads
                </Text>
                <Circle size="30px" bg="rgba(214, 158, 46, 0.12)" color="#D69E2E">
                  <Icon as={FiInbox} boxSize="15px" />
                </Circle>
              </HStack>
              <Heading size="lg" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                {quickBookings.length + contactMessages.length}
              </Heading>
              <HStack justify="space-between" mt={3} pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" color="#5A6E65">
                  {quickBookings.length} booking / {contactMessages.length} inquiry
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#56756D"
                  fontWeight="600"
                  rightIcon={<FiArrowRight size={11} />}
                  onClick={() => handleTabChange("bookings")}
                  _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                >
                  View
                </Button>
              </HStack>
            </Box>

            {/* Card 4: Quality & Feedback */}
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              border="1px solid rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 24px -4px rgba(38, 58, 51, 0.08)" }}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">
                  Quality Architect
                </Text>
                <Circle size="30px" bg="rgba(99, 102, 241, 0.12)" color="#6366F1">
                  <Icon as={FiZap} boxSize="15px" />
                </Circle>
              </HStack>
              <Heading size="lg" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                Signals
              </Heading>
              <HStack justify="space-between" mt={3} pt={2} borderTop="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="12px" color="#5A6E65">
                  Platform alerts & review
                </Text>
                <Button
                  as={Link}
                  href="/admin/feedback"
                  size="xs"
                  variant="ghost"
                  color="#56756D"
                  fontWeight="600"
                  rightIcon={<FiArrowRight size={11} />}
                  _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                >
                  Analyze
                </Button>
              </HStack>
            </Box>
          </SimpleGrid>

          {/* 7:5 Bento Grid (Rule 5 & 8) */}
          <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start">
            {/* Left Column (7 cols): Operational Reviews */}
            <VStack align="stretch" spacing={5}>
              {/* Priority Directory Card */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              >
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={0.5}>
                    <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                      Priority Directory Queue
                    </Heading>
                    <Text fontSize="12.5px" color="#5A6E65">
                      Therapists awaiting document verification and license review
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    fontSize="12px"
                    fontWeight="600"
                    onClick={() => handleTabChange("vetting")}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    View All ({unverifiedTherapists.length})
                  </Button>
                </HStack>

                {unverifiedTherapists.length === 0 ? (
                  <VStack py={8} spacing={3} textAlign="center">
                    <Circle size="42px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                      <Icon as={FiCheckCircle} boxSize="20px" />
                    </Circle>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                      All clear! No pending therapist verifications
                    </Text>
                    <Text fontSize="12px" color="#5A6E65">
                      New applications will appear here automatically when submitted.
                    </Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {unverifiedTherapists.slice(0, 3).map((item, idx) => (
                      <HStack
                        key={item.id || idx}
                        p={3.5}
                        borderRadius="xl"
                        bg="rgba(250, 248, 245, 0.85)"
                        border="1px solid rgba(86, 117, 109, 0.1)"
                        justify="space-between"
                        align="center"
                      >
                        <HStack spacing={3}>
                          <Avatar size="sm" name={item.name || item.email} src={item.photo_url} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="13px" fontWeight="600" color="#263A33">
                              {item.name || "Practitioner Applicant"}
                            </Text>
                            <Text fontSize="11.5px" color="#5A6E65">
                              {item.specialties || item.email || "Clinical Psychologist"} • {item.years_experience || 0}y exp
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          <Badge
                            bg="rgba(245, 158, 11, 0.12)"
                            color="#D97706"
                            fontSize="10px"
                            fontWeight="700"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            Pending Review
                          </Badge>
                          <Button
                            size="xs"
                            bg="#56756D"
                            color="white"
                            borderRadius="full"
                            fontSize="11.5px"
                            fontWeight="600"
                            px={3}
                            onClick={() => handleTabChange("vetting")}
                            _hover={{ bg: "#263A33" }}
                          >
                            Review
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Recent Booking Leads */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              >
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={0.5}>
                    <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                      Inbound Booking Leads
                    </Heading>
                    <Text fontSize="12.5px" color="#5A6E65">
                      Prospective clients submitting quick consultation requests
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    borderColor="rgba(86, 117, 109, 0.25)"
                    color="#263A33"
                    fontSize="12px"
                    fontWeight="600"
                    onClick={() => handleTabChange("bookings")}
                    _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                  >
                    View All ({quickBookings.length})
                  </Button>
                </HStack>

                {quickBookings.length === 0 ? (
                  <VStack py={8} spacing={3} textAlign="center">
                    <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiInbox} boxSize="20px" />
                    </Circle>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                      No new booking leads
                    </Text>
                    <Text fontSize="12px" color="#5A6E65">
                      New consultation requests from the homepage will appear here.
                    </Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {quickBookings.slice(0, 3).map((lead, idx) => (
                      <HStack
                        key={lead.id || idx}
                        p={3.5}
                        borderRadius="xl"
                        bg="rgba(250, 248, 245, 0.85)"
                        border="1px solid rgba(86, 117, 109, 0.1)"
                        justify="space-between"
                        align="center"
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="600" color="#263A33">
                            {lead.name || "Client Prospect"}
                          </Text>
                          <Text fontSize="11.5px" color="#5A6E65">
                            {lead.phone || lead.email || "No direct phone provided"}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Badge
                            bg="rgba(16, 185, 129, 0.12)"
                            color="#059669"
                            fontSize="10px"
                            fontWeight="700"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            New Lead
                          </Badge>
                          <Button
                            size="xs"
                            variant="outline"
                            borderRadius="full"
                            borderColor="rgba(86, 117, 109, 0.25)"
                            color="#263A33"
                            fontSize="11.5px"
                            fontWeight="600"
                            px={3}
                            onClick={() => handleTabChange("bookings")}
                            _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                          >
                            View
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>

            {/* Right Column (5 cols): Shortcuts & Infrastructure */}
            <VStack align="stretch" spacing={5}>
              {/* Operations & CMS Shortcuts */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              >
                <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={1}>
                  Console Workspaces
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" mb={4}>
                  Quick access to CMS suites and analytics
                </Text>

                <VStack align="stretch" spacing={2.5}>
                  {/* Blog CMS */}
                  <HStack
                    as={Link}
                    href="/admin/blog"
                    p={3}
                    borderRadius="xl"
                    bg="rgba(250, 248, 245, 0.85)"
                    border="1px solid rgba(86, 117, 109, 0.1)"
                    justify="space-between"
                    transition="all 0.15s"
                    _hover={{ bg: "white", borderColor: "#56756D", transform: "translateX(2px)" }}
                  >
                    <HStack spacing={3}>
                      <Circle size="30px" bg="rgba(201, 169, 96, 0.14)" color="#C9A960">
                        <Icon as={FiFileText} boxSize="14px" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="600" color="#263A33">
                          Blog CMS Suite
                        </Text>
                        <Text fontSize="11px" color="#5A6E65">
                          Manage articles, categories, and SEO
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="#56756D" boxSize="14px" />
                  </HStack>

                  {/* Business Reports */}
                  <HStack
                    as="button"
                    onClick={() => handleTabChange("reports")}
                    p={3}
                    borderRadius="xl"
                    bg="rgba(250, 248, 245, 0.85)"
                    border="1px solid rgba(86, 117, 109, 0.1)"
                    justify="space-between"
                    textAlign="left"
                    transition="all 0.15s"
                    _hover={{ bg: "white", borderColor: "#56756D", transform: "translateX(2px)" }}
                  >
                    <HStack spacing={3}>
                      <Circle size="30px" bg="rgba(49, 130, 206, 0.12)" color="#3182CE">
                        <Icon as={FiTrendingUp} boxSize="14px" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="600" color="#263A33">
                          Business Reports
                        </Text>
                        <Text fontSize="11px" color="#5A6E65">
                          Financial intelligence & trends
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="#56756D" boxSize="14px" />
                  </HStack>

                  {/* Improvement Architect */}
                  <HStack
                    as={Link}
                    href="/admin/feedback"
                    p={3}
                    borderRadius="xl"
                    bg="rgba(250, 248, 245, 0.85)"
                    border="1px solid rgba(86, 117, 109, 0.1)"
                    justify="space-between"
                    transition="all 0.15s"
                    _hover={{ bg: "white", borderColor: "#56756D", transform: "translateX(2px)" }}
                  >
                    <HStack spacing={3}>
                      <Circle size="30px" bg="rgba(99, 102, 241, 0.12)" color="#6366F1">
                        <Icon as={FiZap} boxSize="14px" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="600" color="#263A33">
                          Improvement Architect
                        </Text>
                        <Text fontSize="11px" color="#5A6E65">
                          User feedback, resolutions & UX insights
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="#56756D" boxSize="14px" />
                  </HStack>

                  {/* Assessment QA Panel */}
                  <HStack
                    as={Link}
                    href="/admin/assessments"
                    p={3}
                    borderRadius="xl"
                    bg="rgba(250, 248, 245, 0.85)"
                    border="1px solid rgba(86, 117, 109, 0.1)"
                    justify="space-between"
                    transition="all 0.15s"
                    _hover={{ bg: "white", borderColor: "#56756D", transform: "translateX(2px)" }}
                  >
                    <HStack spacing={3}>
                      <Circle size="30px" bg="rgba(128, 90, 213, 0.12)" color="#805AD5">
                        <Icon as={FiCompass} boxSize="14px" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="600" color="#263A33">
                          Assessment QA
                        </Text>
                        <Text fontSize="11px" color="#5A6E65">
                          Scoring simulation & catalog
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={FiArrowRight} color="#56756D" boxSize="14px" />
                  </HStack>
                </VStack>
              </Box>

              {/* System & Services Gate */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              >
                <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={1}>
                  Platform Connectivity
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" mb={3}>
                  Core services telemetry
                </Text>

                <VStack align="stretch" spacing={2.5}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Circle size="8px" bg="#10B981" />
                      <Text fontSize="12.5px" color="#263A33" fontWeight="500">
                        Database API
                      </Text>
                    </HStack>
                    <Badge bg="rgba(16, 185, 129, 0.12)" color="#059669" fontSize="10px" borderRadius="full">
                      Online
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Circle size="8px" bg="#10B981" />
                      <Text fontSize="12.5px" color="#263A33" fontWeight="500">
                        Auth Engine (Clerk)
                      </Text>
                    </HStack>
                    <Badge bg="rgba(16, 185, 129, 0.12)" color="#059669" fontSize="10px" borderRadius="full">
                      Active
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Circle size="8px" bg="#10B981" />
                      <Text fontSize="12.5px" color="#263A33" fontWeight="500">
                        Video Service
                      </Text>
                    </HStack>
                    <Badge bg="rgba(16, 185, 129, 0.12)" color="#059669" fontSize="10px" borderRadius="full">
                      Ready
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Grid>
        </VStack>
      )}

      {/* Legacy Tabs Container */}
{activeTab === "reports" && (() => {
          const catalogTabs =
            reportCatalog.length > 0 ? reportCatalog : FALLBACK_ADMIN_REPORT_CATALOG;
          const tabIndex = Math.max(
            0,
            catalogTabs.findIndex((t) => t.key === activeReportKey)
          );
          const reportData = reportByKey[activeReportKey];
          const activeMeta = catalogTabs.find((t) => t.key === activeReportKey);

          return (
            <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
              <VStack align="stretch" spacing={6}>
                <HStack spacing={2} flexWrap="wrap" pb={3} borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                  {[
                    { id: "live", label: "Live Reports" },
                    { id: "snapshots", label: "Saved Snapshots" },
                    { id: "schedules", label: "Email Schedules" },
                  ].map((tab) => {
                    const isSelected = reportWorkspaceTab === tab.id;
                    return (
                      <Button
                        key={tab.id}
                        size="sm"
                        variant="unstyled"
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="full"
                        px={4}
                        py={1.5}
                        h="34px"
                        fontSize="12.5px"
                        fontWeight="600"
                        border="1px solid"
                        borderColor={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                        bg={isSelected ? "#56756D" : "white"}
                        color={isSelected ? "white" : "#5A6E65"}
                        boxShadow={isSelected ? "0 2px 6px rgba(86, 117, 109, 0.22)" : "none"}
                        _hover={{
                          bg: isSelected ? "#263A33" : "rgba(86, 117, 109, 0.08)",
                          color: isSelected ? "white" : "#263A33",
                        }}
                        onClick={() => setReportWorkspaceTab(tab.id)}
                      >
                        {tab.label}
                      </Button>
                    );
                  })}
                </HStack>

                {reportWorkspaceTab === "live" && (
                <>
                <HStack justify="space-between" flexWrap="wrap" gap={4} align="flex-start">
                  <VStack align="flex-start" spacing={1}>
                    <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                      Business Intelligence & Audits
                    </Heading>
                    <Text fontSize="13px" color="#5A6E65" maxW="lg">
                      Each stream maintains dedicated analytical matrices and audit exports. Select an audit interval to compute real-time calculations.
                    </Text>
                  </VStack>
                  <HStack flexWrap="wrap" spacing={2.5}>
                    <Box w="140px">
                      <ModernSelect
                        h="36px"
                        value={reportPeriod}
                        onChange={(val) => setReportPeriod(val)}
                        options={[
                          { value: "monthly", label: "Monthly" },
                          { value: "quarterly", label: "Quarterly" },
                          { value: "yearly", label: "Yearly" },
                        ]}
                      />
                    </Box>
                    <Input
                      h="36px"
                      type="number"
                      value={reportYear}
                      onChange={(e) =>
                        setReportYear(Number(e.target.value || new Date().getFullYear()))
                      }
                      w="95px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                    />
                    {reportPeriod === "monthly" && (
                      <Box w="110px">
                        <ModernSelect
                          h="36px"
                          value={reportMonth}
                          onChange={(val) => setReportMonth(Number(val))}
                          options={Array.from({ length: 12 }).map((_, i) => ({
                            value: i + 1,
                            label: `Month ${i + 1}`,
                          }))}
                        />
                      </Box>
                    )}
                    {reportPeriod === "quarterly" && (
                      <Box w="105px">
                        <ModernSelect
                          h="36px"
                          value={reportQuarter}
                          onChange={(val) => setReportQuarter(Number(val))}
                          options={[
                            { value: 1, label: "Q1" },
                            { value: 2, label: "Q2" },
                            { value: 3, label: "Q3" },
                            { value: 4, label: "Q4" },
                          ]}
                        />
                      </Box>
                    )}
                    <Button
                      h="36px"
                      bg="#56756D"
                      color="white"
                      borderRadius="full"
                      fontSize="12.5px"
                      fontWeight="600"
                      px={4}
                      _hover={{ bg: "#263A33" }}
                      boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                      onClick={() => fetchAdminReport(activeReportKey)}
                      isLoading={reportsLoading}
                    >
                      Refresh
                    </Button>
                    {reportData && (
                      <Button
                        h="36px"
                        variant="outline"
                        borderColor="rgba(86, 117, 109, 0.25)"
                        color="#263A33"
                        borderRadius="full"
                        fontSize="12.5px"
                        fontWeight="600"
                        px={3.5}
                        _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                        onClick={() =>
                          downloadJson(
                            `mlc-report-${activeReportKey}-${reportData?.period?.label || "export"}.json`,
                            reportData
                          )
                        }
                      >
                        Export JSON
                      </Button>
                    )}
                  </HStack>
                </HStack>

                <HStack flexWrap="wrap" spacing={3} align="center" bg="rgba(250, 248, 245, 0.7)" p={3} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.1)">
                  <Input
                    h="36px"
                    placeholder="Snapshot title / reference tag (optional)"
                    value={snapshotTitle}
                    onChange={(e) => setSnapshotTitle(e.target.value)}
                    maxW="300px"
                    borderRadius="xl"
                    borderColor="rgba(86, 117, 109, 0.2)"
                    bg="white"
                    fontSize="13px"
                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  />
                  <Button
                    h="36px"
                    variant="outline"
                    borderRadius="full"
                    borderColor="rgba(86, 117, 109, 0.3)"
                    color="#263A33"
                    fontSize="12.5px"
                    fontWeight="600"
                    px={4}
                    _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                    onClick={saveCurrentReportSnapshot}
                    isLoading={savingSnapshot}
                    isDisabled={!reportData?.period}
                  >
                    Save Snapshot (JSON + PDF)
                  </Button>
                </HStack>

                <Wrap spacing={2} pt={1}>
                  {catalogTabs.map((t) => {
                    const isSelected = t.key === activeReportKey;
                    return (
                      <Button
                        key={t.key}
                        size="sm"
                        variant="unstyled"
                        display="inline-flex"
                        alignItems="center"
                        borderRadius="full"
                        px={3.5}
                        py={1}
                        h="32px"
                        fontSize="12px"
                        fontWeight={isSelected ? "600" : "500"}
                        border="1px solid"
                        borderColor={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                        bg={isSelected ? "rgba(86, 117, 109, 0.12)" : "white"}
                        color={isSelected ? "#263A33" : "#5A6E65"}
                        _hover={{
                          bg: "rgba(86, 117, 109, 0.08)",
                          color: "#263A33",
                        }}
                        onClick={() => setActiveReportKey(t.key)}
                      >
                        {t.title}
                      </Button>
                    );
                  })}
                </Wrap>

                {activeMeta?.description ? (
                  <Text fontSize="sm" color="gray.600">
                    {activeMeta.description}
                  </Text>
                ) : null}

                {reportsLoading && (
                  <HStack spacing={3} p={8} justify="center" bg="rgba(250, 248, 245, 0.6)" borderRadius="xl">
                    <Spinner size="sm" color="#56756D" />
                    <Text fontSize="13px" color="#5A6E65">Loading report metrics…</Text>
                  </HStack>
                )}

                {reportError && !reportData?.period && !reportsLoading && (
                  <Box
                    p={6}
                    borderRadius="2xl"
                    bg="rgba(254, 242, 242, 0.6)"
                    border="1px solid rgba(239, 68, 68, 0.25)"
                    textAlign="center"
                  >
                    <VStack spacing={3}>
                      <Circle size="42px" bg="rgba(239, 68, 68, 0.12)" color="#DC2626">
                        <Icon as={FiAlertCircle} boxSize="20px" />
                      </Circle>
                      <Heading
                        fontSize="15px"
                        fontWeight="600"
                        fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        color="#263A33"
                      >
                        Unable to load {activeMeta?.title || "report"}
                      </Heading>
                      <Text fontSize="13px" color="#5A6E65" maxW="480px">
                        {reportError}
                      </Text>
                      <Button
                        size="sm"
                        h="36px"
                        bg="#56756D"
                        color="white"
                        borderRadius="full"
                        fontSize="12.5px"
                        fontWeight="600"
                        px={5}
                        _hover={{ bg: "#263A33" }}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                        onClick={() => fetchAdminReport(activeReportKey)}
                      >
                        Retry Report
                      </Button>
                    </VStack>
                  </Box>
                )}

                {!reportsLoading && reportData?.period && (
                  <Box p={4} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.12)">
                    <Text fontSize="13px" color="#5A6E65">
                      <b style={{ color: "#263A33" }}>{reportData.title || activeReportKey}</b> — window{" "}
                      <b style={{ color: "#263A33" }}>{reportData.period.label}</b> (
                      {new Date(reportData.period.start).toLocaleDateString()} –{" "}
                      {new Date(reportData.period.end).toLocaleDateString()})
                    </Text>
                  </Box>
                )}

                {!reportsLoading && activeReportKey === "executive" && reportData?.kpis && (
                  <VStack align="stretch" spacing={6}>
                    <Text fontSize="sm" color="gray.600">
                      Compared with prior period: <b>{reportData.prior_period_label || "—"}</b>
                    </Text>
                    <Heading fontSize="15px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">Current period</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <MetricCard
                        label="Incoming registrations"
                        value={reportData.kpis.incoming_registrations}
                      />
                      <MetricCard label="New clients" value={reportData.kpis.new_clients} />
                      <MetricCard
                        label="Therapists onboarded"
                        value={reportData.kpis.therapists_onboarded}
                      />
                      <MetricCard
                        label="Therapists verified"
                        value={reportData.kpis.therapists_verified}
                      />
                      <MetricCard
                        label="Sessions completed"
                        value={reportData.kpis.sessions_taken}
                      />
                      <MetricCard
                        label="Session revenue"
                        value={`₹${Number(reportData.kpis.session_revenue || 0).toLocaleString()}`}
                      />
                      <MetricCard
                        label={`Subscriber revenue (${reportData.kpis.subscription_revenue_source})`}
                        value={`₹${Number(reportData.kpis.subscription_revenue || 0).toLocaleString()}`}
                      />
                      <MetricCard
                        label="Total revenue (est.)"
                        value={`₹${Number(reportData.kpis.total_revenue_estimated || 0).toLocaleString()}`}
                      />
                    </SimpleGrid>
                    {reportData.kpis_prior_period && (
                      <>
                        <Heading fontSize="15px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">Prior period</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                          <MetricCard
                            label="Incoming registrations"
                            value={reportData.kpis_prior_period.incoming_registrations}
                          />
                          <MetricCard
                            label="New clients"
                            value={reportData.kpis_prior_period.new_clients}
                          />
                          <MetricCard
                            label="Sessions completed"
                            value={reportData.kpis_prior_period.sessions_taken}
                          />
                          <MetricCard
                            label="Total revenue (est.)"
                            value={`₹${Number(
                              reportData.kpis_prior_period.total_revenue_estimated || 0
                            ).toLocaleString()}`}
                          />
                        </SimpleGrid>
                      </>
                    )}
                    {reportData.kpis_delta && (
                      <>
                        <Heading fontSize="15px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">Change (current − prior)</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                          {Object.entries(reportData.kpis_delta).map(([k, v]) => (
                            <Box
                              key={k}
                              p={4}
                              borderRadius="xl"
                              border="1px solid"
                              borderColor="gray.100"
                              bg="white"
                            >
                              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                                {k.replace(/_/g, " ")}
                              </Text>
                              <Text
                                fontWeight="700"
                                color={
                                  Number(v) > 0 ? "green.600" : Number(v) < 0 ? "red.500" : "gray.700"
                                }
                                mt={2}
                              >
                                {formatDelta(v)}
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </>
                    )}
                  </VStack>
                )}

                {!reportsLoading && activeReportKey === "growth" && reportData?.sections && (
                  <VStack align="stretch" spacing={6}>
                    {Object.entries(reportData.sections).map(([sid, sec]) => (
                      <ReportSectionCard key={sid} title={sec.title} description={sec.description}>
                        {growthSectionBody(sec)}
                      </ReportSectionCard>
                    ))}
                  </VStack>
                )}

                {!reportsLoading && activeReportKey === "revenue" && reportData?.sections && (
                  <VStack align="stretch" spacing={6}>
                    <ReportSectionCard
                      title={reportData.sections.headline?.title}
                      description="List prices apply to active subscriber counts; settlement uses captured charges when available."
                    >
                      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                        <MetricCard
                          label="Session revenue"
                          value={`₹${Number(
                            reportData.sections.headline?.kpis?.session_revenue || 0
                          ).toLocaleString()}`}
                        />
                        <MetricCard
                          label="Subscription revenue"
                          value={`₹${Number(
                            reportData.sections.headline?.kpis?.subscription_revenue || 0
                          ).toLocaleString()}`}
                        />
                        <MetricCard
                          label="Combined (est.)"
                          value={`₹${Number(
                            reportData.sections.headline?.kpis?.combined_estimated || 0
                          ).toLocaleString()}`}
                        />
                        <MetricCard
                          label="Monthly subscribers"
                          value={reportData.sections.headline?.kpis?.active_monthly_subscribers}
                        />
                        <MetricCard
                          label="Annual subscribers"
                          value={reportData.sections.headline?.kpis?.active_annual_subscribers}
                        />
                      </SimpleGrid>
                    </ReportSectionCard>
                    <ReportSectionCard
                      title={reportData.sections.session_payments?.title}
                      description={reportData.sections.session_payments?.description}
                    >
                      <CountGrid data={reportData.sections.session_payments?.status_counts || {}} />
                      <HStack mt={4} spacing={6} flexWrap="wrap">
                        <Text fontSize="sm">
                          Paid: <b>{reportData.sections.session_payments?.paid_count ?? 0}</b>
                        </Text>
                        <Text fontSize="sm">
                          Failed: <b>{reportData.sections.session_payments?.failed_count ?? 0}</b>
                        </Text>
                        <Text fontSize="sm">
                          Avg paid checkout:{" "}
                          <b>
                            ₹
                            {Number(
                              reportData.sections.session_payments?.avg_paid_checkout_inr || 0
                            ).toLocaleString()}
                          </b>
                        </Text>
                      </HStack>
                    </ReportSectionCard>
                    <ReportSectionCard
                      title={reportData.sections.subscription_settlement?.title}
                      description={reportData.sections.subscription_settlement?.description}
                      headerRight={
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            downloadCsv(
                              "subscription_by_therapist.csv",
                              reportData.sections.subscription_settlement?.by_therapist || []
                            )
                          }
                        >
                          Export CSV
                        </Button>
                      }
                    >
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Therapist</Th>
                            <Th isNumeric>Charges</Th>
                            <Th isNumeric>Amount</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(
                            reportData.sections.subscription_settlement?.by_therapist || []
                          ).map((row) => (
                            <Tr key={row.therapist_id}>
                              <Td>{row.therapist_name}</Td>
                              <Td isNumeric>{row.charge_count}</Td>
                              <Td isNumeric>₹{Number(row.amount || 0).toLocaleString()}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </ReportSectionCard>
                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                      <MiniBarChart
                        title="Sessions completed"
                        data={reportData.sections.trends?.sessions_completed || []}
                        valueKey="sessions"
                      />
                      <MiniBarChart
                        title="Session revenue"
                        data={reportData.sections.trends?.session_revenue || []}
                        valueKey="revenue"
                        unit=" ₹"
                      />
                      <MiniBarChart
                        title="Subscription revenue"
                        data={reportData.sections.trends?.subscription_revenue || []}
                        valueKey="revenue"
                        unit=" ₹"
                      />
                    </SimpleGrid>
                  </VStack>
                )}

                {!reportsLoading && activeReportKey === "operations" && reportData?.sections && (
                  <VStack align="stretch" spacing={6}>
                    {Object.entries(reportData.sections).map(([sid, sec]) => (
                      <ReportSectionCard key={sid} title={sec.title} description={sec.description}>
                        {sec.by_status && <CountGrid data={sec.by_status} />}
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mt={sec.by_status ? 4 : 0}>
                          {Object.entries(sec)
                            .filter(
                              ([k, v]) =>
                                !["title", "description", "by_status"].includes(k) &&
                                typeof v === "number"
                            )
                            .map(([k, v]) => (
                              <MetricCard key={k} label={k.replace(/_/g, " ")} value={v} />
                            ))}
                        </SimpleGrid>
                      </ReportSectionCard>
                    ))}
                  </VStack>
                )}

                {!reportsLoading &&
                  activeReportKey === "therapist_practice" &&
                  reportData?.sections && (
                    <VStack align="stretch" spacing={6}>
                      <ReportSectionCard
                        title={reportData.sections.scorecard?.title}
                        description={reportData.sections.scorecard?.description}
                        headerRight={
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              downloadCsv(
                                "therapist_scorecard.csv",
                                reportData.sections.scorecard?.rows || []
                              )
                            }
                          >
                            Export CSV
                          </Button>
                        }
                      >
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Therapist</Th>
                              <Th isNumeric>Sessions</Th>
                              <Th isNumeric>Revenue</Th>
                              <Th isNumeric>New clients</Th>
                              <Th isNumeric>Active</Th>
                              <Th isNumeric>Retention %</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(reportData.sections.scorecard?.rows || []).map((row) => (
                              <Tr key={row.therapist_id}>
                                <Td>{row.therapist_name}</Td>
                                <Td isNumeric>{row.sessions_completed}</Td>
                                <Td isNumeric>
                                  ₹{Number(row.session_revenue_inr || 0).toLocaleString()}
                                </Td>
                                <Td isNumeric>{row.new_clients}</Td>
                                <Td isNumeric>{row.active_clients}</Td>
                                <Td isNumeric>{row.retention_pct ?? "—"}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </ReportSectionCard>
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        <ReportSectionCard
                          title={reportData.sections.session_revenue_detail?.title}
                          headerRight={
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                downloadCsv(
                                  "session_revenue_by_therapist.csv",
                                  reportData.sections.session_revenue_detail?.rows || []
                                )
                              }
                            >
                              Export CSV
                            </Button>
                          }
                        >
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Therapist</Th>
                                <Th isNumeric>Checkouts</Th>
                                <Th isNumeric>Revenue</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {(
                                reportData.sections.session_revenue_detail?.rows || []
                              ).map((row) => (
                                <Tr key={row.therapist_id}>
                                  <Td>{row.therapist_name}</Td>
                                  <Td isNumeric>{row.paid_checkouts}</Td>
                                  <Td isNumeric>
                                    ₹{Number(row.session_revenue_inr || 0).toLocaleString()}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </ReportSectionCard>
                        <ReportSectionCard
                          title={reportData.sections.client_funnel?.title}
                          headerRight={
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                downloadCsv(
                                  "client_funnel.csv",
                                  reportData.sections.client_funnel?.rows || []
                                )
                              }
                            >
                              Export CSV
                            </Button>
                          }
                        >
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Therapist</Th>
                                <Th isNumeric>New</Th>
                                <Th isNumeric>Active</Th>
                                <Th isNumeric>%</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {(reportData.sections.client_funnel?.rows || []).map((row) => (
                                <Tr key={row.therapist_id}>
                                  <Td>{row.therapist_name}</Td>
                                  <Td isNumeric>{row.new_clients}</Td>
                                  <Td isNumeric>{row.active_clients}</Td>
                                  <Td isNumeric>{row.retention_pct ?? "—"}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </ReportSectionCard>
                      </SimpleGrid>
                    </VStack>
                  )}

                {!reportsLoading && activeReportKey === "supervision" && reportData?.sections && (
                  <VStack align="stretch" spacing={6}>
                    <ReportSectionCard
                      title={reportData.sections.supervisor_funnel?.title}
                      description={reportData.sections.supervisor_funnel?.description}
                      headerRight={
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            downloadCsv(
                              "supervision_funnel.csv",
                              reportData.sections.supervisor_funnel?.rows || []
                            )
                          }
                        >
                          Export CSV
                        </Button>
                      }
                    >
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Supervisor</Th>
                            <Th isNumeric>New</Th>
                            <Th isNumeric>Active</Th>
                            <Th isNumeric>Retention %</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(reportData.sections.supervisor_funnel?.rows || []).map((row) => (
                            <Tr key={row.supervisor_id}>
                              <Td>{row.supervisor_name}</Td>
                              <Td isNumeric>{row.new_supervisees}</Td>
                              <Td isNumeric>{row.active_supervisees}</Td>
                              <Td isNumeric>{row.retention_pct ?? "—"}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </ReportSectionCard>
                    <ReportSectionCard
                      title={reportData.sections.documentation?.title}
                      description={reportData.sections.documentation?.description}
                    >
                      <MetricCard
                        label="Notes created"
                        value={reportData.sections.documentation?.notes_created}
                      />
                    </ReportSectionCard>
                  </VStack>
                )}

                {!reportsLoading && activeReportKey === "platform" && reportData?.sections && (
                  <VStack align="stretch" spacing={6}>
                    <ReportSectionCard
                      title={reportData.sections.support_tickets?.title}
                      description={reportData.sections.support_tickets?.description}
                    >
                      <MetricCard
                        label="Opened in period"
                        value={reportData.sections.support_tickets?.opened}
                      />
                      <Heading size="xs" mt={4} mb={2}>
                        By status
                      </Heading>
                      <CountGrid data={reportData.sections.support_tickets?.by_status || {}} />
                      <Heading size="xs" mt={4} mb={2}>
                        By category
                      </Heading>
                      <CountGrid data={reportData.sections.support_tickets?.by_category || {}} />
                    </ReportSectionCard>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <ReportSectionCard title={reportData.sections.contact_form?.title}>
                        <MetricCard
                          label="Messages"
                          value={reportData.sections.contact_form?.messages_in_period}
                        />
                      </ReportSectionCard>
                      <ReportSectionCard title={reportData.sections.quick_booking_leads?.title}>
                        <MetricCard
                          label="Created"
                          value={reportData.sections.quick_booking_leads?.created_in_period}
                        />
                      </ReportSectionCard>
                    </SimpleGrid>
                  </VStack>
                )}

                {!reportsLoading && !reportData && (
                  <Text color="gray.500" fontSize="sm">
                    No data loaded yet for this report.
                  </Text>
                )}
                </>
                )}

                {reportWorkspaceTab === "snapshots" && (
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                      <VStack align="start" spacing={0.5}>
                        <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                          Saved Report Snapshots
                        </Heading>
                        <Text fontSize="13px" color="#5A6E65">
                          Point-in-time archived copies with generated PDFs. Create new ones from <b>Live Reports</b>.
                        </Text>
                      </VStack>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        borderRadius="full"
                        borderColor="rgba(86, 117, 109, 0.25)"
                        color="#263A33"
                        fontSize="12.5px"
                        fontWeight="600"
                        h="34px"
                        px={4}
                        _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                        onClick={fetchReportSnapshots}
                      >
                        Refresh List
                      </Button>
                    </HStack>

                    {reportSnapshots.length === 0 ? (
                      <Box p={8} textAlign="center" borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px dashed rgba(86, 117, 109, 0.2)">
                        <Text fontSize="13px" color="#5A6E65">
                          No archived snapshots generated yet. Run an export in Live Reports to store persistent copies.
                        </Text>
                      </Box>
                    ) : (
                      <Box border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="xl" overflow="hidden">
                        <Table size="sm">
                          <Thead bg="rgba(250, 248, 245, 0.85)">
                            <Tr>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Created</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Report</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Period</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">PDF</Th>
                              <Th borderBottom="1px solid rgba(86, 117, 109, 0.12)" />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportSnapshots.map((s) => (
                              <Tr key={s.id} _hover={{ bg: "rgba(250, 248, 245, 0.6)" }}>
                                <Td fontSize="13px" color="#263A33" borderBottom="1px solid rgba(86, 117, 109, 0.08)">{new Date(s.created_at).toLocaleString()}</Td>
                                <Td fontSize="13px" fontWeight="600" color="#263A33" borderBottom="1px solid rgba(86, 117, 109, 0.08)">{s.report_key}</Td>
                                <Td fontSize="13px" color="#5A6E65" borderBottom="1px solid rgba(86, 117, 109, 0.08)">{s.period_label || "—"}</Td>
                                <Td borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  {s.pdf_url ? (
                                    <Button 
                                      size="xs" 
                                      variant="outline" 
                                      borderRadius="full"
                                      borderColor="rgba(86, 117, 109, 0.25)"
                                      color="#56756D"
                                      fontSize="11.5px"
                                      onClick={() => downloadSnapshotPdfFile(s)}
                                    >
                                      Download PDF
                                    </Button>
                                  ) : (
                                    <Text fontSize="11.5px" color="#718096">
                                      {s.pdf_error || "—"}
                                    </Text>
                                  )}
                                </Td>
                                <Td borderBottom="1px solid rgba(86, 117, 109, 0.08)" textAlign="right">
                                  <Button 
                                    size="xs" 
                                    colorScheme="red" 
                                    variant="ghost" 
                                    borderRadius="full"
                                    onClick={() => deleteSnapshot(s.id)}
                                  >
                                    Delete
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </VStack>
                )}

                {reportWorkspaceTab === "schedules" && (
                  <VStack align="stretch" spacing={6}>
                    <VStack align="start" spacing={1}>
                      <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                        Automated Email Delivery Schedules
                      </Heading>
                      <Text fontSize="13px" color="#5A6E65">
                        Executes via recurring cron (<Text as="span" fontFamily="mono" fontSize="11.5px" bg="rgba(86, 117, 109, 0.1)" px={1.5} py={0.5} borderRadius="md">python manage.py process_admin_report_schedules</Text>). 
                        Sends the previous complete calendar period as an executive summary.
                      </Text>
                    </VStack>

                    <Box borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.14)" bg="rgba(250, 248, 245, 0.6)" p={4}>
                      <Heading size="xs" mb={3} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                        Configure New Email Schedule
                      </Heading>
                      <VStack align="stretch" spacing={3}>
                        <HStack flexWrap="wrap" spacing={3}>
                          <Input
                            h="36px"
                            placeholder="Schedule label (optional)"
                            value={schedName}
                            onChange={(e) => setSchedName(e.target.value)}
                            maxW="220px"
                            borderRadius="xl"
                            borderColor="rgba(86, 117, 109, 0.2)"
                            bg="white"
                            fontSize="13px"
                            _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                          />
                          <Box w="200px">
                            <ModernSelect
                              h="36px"
                              value={schedReportKey}
                              onChange={(val) => setSchedReportKey(val)}
                              options={FALLBACK_ADMIN_REPORT_CATALOG.map((r) => ({
                                value: r.key,
                                label: r.title,
                              }))}
                            />
                          </Box>
                          <Box w="180px">
                            <ModernSelect
                              h="36px"
                              value={schedPreset}
                              onChange={(val) => setSchedPreset(val)}
                              options={[
                                { value: "previous_month", label: "Previous Month" },
                                { value: "previous_quarter", label: "Previous Quarter" },
                                { value: "previous_year", label: "Previous Year" },
                              ]}
                            />
                          </Box>
                        </HStack>
                        <HStack flexWrap="wrap" spacing={3}>
                          <Box w="140px">
                            <ModernSelect
                              h="36px"
                              value={schedFreq}
                              onChange={(val) => setSchedFreq(val)}
                              options={[
                                { value: "monthly", label: "Monthly" },
                                { value: "weekly", label: "Weekly" },
                              ]}
                            />
                          </Box>
                          {schedFreq === "monthly" && (
                            <HStack spacing={2}>
                              <Text fontSize="12.5px" color="#5A6E65">Day of Month:</Text>
                              <Input
                                h="36px"
                                type="number"
                                min={1}
                                max={28}
                                w="70px"
                                value={schedDayOfMonth}
                                onChange={(e) => setSchedDayOfMonth(Number(e.target.value || 1))}
                                borderRadius="xl"
                                borderColor="rgba(86, 117, 109, 0.2)"
                                bg="white"
                                fontSize="13px"
                              />
                            </HStack>
                          )}
                          {schedFreq === "weekly" && (
                            <Box w="150px">
                              <ModernSelect
                                h="36px"
                                value={schedWeekday}
                                onChange={(val) => setSchedWeekday(Number(val))}
                                options={[
                                  { value: 0, label: "Monday" },
                                  { value: 1, label: "Tuesday" },
                                  { value: 2, label: "Wednesday" },
                                  { value: 3, label: "Thursday" },
                                  { value: 4, label: "Friday" },
                                  { value: 5, label: "Saturday" },
                                  { value: 6, label: "Sunday" },
                                ]}
                              />
                            </Box>
                          )}
                        </HStack>
                        <Textarea
                          placeholder="Recipient emails (comma or newline separated)"
                          value={schedRecipients}
                          onChange={(e) => setSchedRecipients(e.target.value)}
                          minH="70px"
                          borderRadius="xl"
                          borderColor="rgba(86, 117, 109, 0.2)"
                          bg="white"
                          fontSize="13px"
                          _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                        />
                        <Button 
                          h="36px" 
                          bg="#56756D" 
                          color="white" 
                          borderRadius="full" 
                          fontSize="12.5px"
                          fontWeight="600"
                          px={5}
                          w="fit-content" 
                          _hover={{ bg: "#263A33" }}
                          boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                          onClick={createEmailSchedule}
                        >
                          Create Schedule
                        </Button>
                      </VStack>
                    </Box>

                    <HStack justify="space-between" align="center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        borderRadius="full"
                        borderColor="rgba(86, 117, 109, 0.25)"
                        color="#263A33"
                        fontSize="12.5px"
                        fontWeight="600"
                        h="34px"
                        px={4}
                        _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                        onClick={fetchReportSchedules}
                      >
                        Refresh Schedules
                      </Button>
                    </HStack>

                    {reportSchedules.length === 0 ? (
                      <Box p={8} textAlign="center" borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px dashed rgba(86, 117, 109, 0.2)">
                        <Text fontSize="13px" color="#5A6E65">
                          No recurring email schedules configured yet.
                        </Text>
                      </Box>
                    ) : (
                      <Box border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="xl" overflow="hidden">
                        <Table size="sm">
                          <Thead bg="rgba(250, 248, 245, 0.85)">
                            <Tr>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Active</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Report</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Preset</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Frequency</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Last Sent</Th>
                              <Th fontSize="10.5px" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color="#718096" borderBottom="1px solid rgba(86, 117, 109, 0.12)">Error</Th>
                              <Th borderBottom="1px solid rgba(86, 117, 109, 0.12)" />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {reportSchedules.map((sch) => (
                              <Tr key={sch.id} _hover={{ bg: "rgba(250, 248, 245, 0.6)" }}>
                                <Td borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  <Switch
                                    size="sm"
                                    colorScheme="teal"
                                    isChecked={sch.is_active}
                                    onChange={(e) => patchScheduleActive(sch, e.target.checked)}
                                  />
                                </Td>
                                <Td fontSize="13px" fontWeight="600" color="#263A33" borderBottom="1px solid rgba(86, 117, 109, 0.08)">{sch.report_key}</Td>
                                <Td fontSize="12.5px" color="#5A6E65" borderBottom="1px solid rgba(86, 117, 109, 0.08)">{sch.period_preset}</Td>
                                <Td fontSize="12.5px" color="#263A33" borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  {sch.frequency}
                                  {sch.frequency === "monthly" && sch.day_of_month != null
                                    ? ` (day ${sch.day_of_month})`
                                    : ""}
                                  {sch.frequency === "weekly" && sch.weekday != null ? ` (wd ${sch.weekday})` : ""}
                                </Td>
                                <Td fontSize="12px" color="#5A6E65" borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  {sch.last_sent_at ? new Date(sch.last_sent_at).toLocaleString() : "—"}
                                </Td>
                                <Td maxW="180px" fontSize="11.5px" color="#DC2626" borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  {sch.last_error || "—"}
                                </Td>
                                <Td borderBottom="1px solid rgba(86, 117, 109, 0.08)">
                                  <HStack spacing={1.5} justify="flex-end">
                                    <Button 
                                      size="xs" 
                                      variant="outline"
                                      borderRadius="full"
                                      borderColor="rgba(86, 117, 109, 0.25)"
                                      color="#56756D"
                                      fontSize="11.5px"
                                      onClick={() => sendScheduleNow(sch.id)}
                                    >
                                      Send Now
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="red"
                                      borderRadius="full"
                                      onClick={() => deleteSchedule(sch.id)}
                                    >
                                      Delete
                                    </Button>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </VStack>
                )}
              </VStack>
            </Box>
          );
        })()}

        {activeTab === "vetting" && (() => {
          const appsInReview = therapistApplications.filter(a => ["review", "awaiting_contract"].includes(getVettingStage(a)));
          const directUnverified = unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_"));
          const ghostProfiles = unverifiedTherapists.filter(t => t.name.toLowerCase().startsWith("user_"));
          const totalPending = appsInReview.length + directUnverified.length;

          return (
            <VStack align="stretch" spacing={5}>
              {/* 🌿 SUBTAB 1: DIRECTORY QUEUE */}
              {vettingSubTab === "queue" && (
                <VStack align="stretch" spacing={5}>
                  {/* DIRECT ACCOUNT REGISTRATIONS AWAITING VERIFICATION (PROMINENT AT TOP) */}
                  {directUnverified.length > 0 && (
                    <Box 
                      bg="white" 
                      p={5} 
                      borderRadius="2xl" 
                      border="1px solid rgba(86, 117, 109, 0.14)" 
                      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >
                      <HStack spacing={2.5} mb={4} justify="space-between" wrap="wrap">
                        <HStack spacing={2.5}>
                          <Circle size="30px" bg="rgba(79, 70, 229, 0.12)" color="#4F46E5">
                            <Icon as={FiUserCheck} boxSize="15px" />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <HStack spacing={2}>
                              <Heading fontSize="15px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                                Direct Account Verifications
                              </Heading>
                              <Badge bg="#EEF2FF" color="#4F46E5" fontSize="10px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                                {directUnverified.length} PENDING
                              </Badge>
                            </HStack>
                            <Text fontSize="12px" color="#5A6E65">
                              Clinicians with registered profiles awaiting administrative directory approval to go live.
                            </Text>
                          </VStack>
                        </HStack>
                      </HStack>

                      <VStack align="stretch" spacing={3}>
                        {directUnverified.map(t => (
                          <Box 
                            key={t.id} 
                            p={4} 
                            border="1px solid rgba(86, 117, 109, 0.14)" 
                            borderRadius="xl" 
                            bg="rgba(250, 248, 245, 0.85)"
                            boxShadow="0 2px 6px -2px rgba(38, 58, 51, 0.03)"
                            transition="all 0.2s ease"
                            _hover={{ borderColor: "#56756D", boxShadow: "0 4px 14px -2px rgba(38, 58, 51, 0.08)" }}
                          >
                            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={3.5}>
                              <HStack 
                                spacing={3.5} 
                                align="flex-start" 
                                cursor="pointer" 
                                onClick={() => setSelectedClinician(t)}
                                flex="1"
                              >
                                <Box position="relative" flexShrink={0}>
                                  <Avatar size="md" name={t.name || t.email} src={t.photo_url} />
                                  <Circle size="11px" bg="#F59E0B" border="2px solid white" position="absolute" bottom="0" right="0" />
                                </Box>
                                <VStack align="flex-start" spacing={1}>
                                  <HStack spacing={2} wrap="wrap">
                                    <Text 
                                      fontWeight="600" 
                                      fontSize="14.5px" 
                                      color="#263A33" 
                                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                                      _hover={{ color: "#56756D", textDecoration: "underline" }}
                                    >
                                      {t.name}
                                    </Text>
                                    <Badge bg="rgba(245, 158, 11, 0.12)" color="#D97706" fontSize="9.5px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                                      PENDING DIRECT VERIFICATION
                                    </Badge>
                                    {t.is_supervisor && (
                                      <Badge bg="rgba(99, 102, 241, 0.12)" color="#4F46E5" fontSize="9.5px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                                        SUPERVISOR
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Text fontSize="12px" color="#5A6E65">
                                    {t.title || t.highest_qualification || "Licensed Clinician"} • {t.email} • {t.phone || "No phone"} • ID: {t.id}
                                  </Text>
                                  <HStack spacing={2} wrap="wrap" pt={0.5}>
                                    <Badge bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px" borderRadius="md" px={2} py={0.5}>
                                      {t.hourly_rate != null ? `₹${t.hourly_rate}/hr` : "Rate not set"}
                                    </Badge>
                                    {t.years_experience != null && t.years_experience !== "" && (
                                      <Badge bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px" borderRadius="md" px={2} py={0.5}>
                                        {t.years_experience}+ yrs exp
                                      </Badge>
                                    )}
                                    {Array.isArray(t.specializations) && t.specializations.slice(0, 3).map((s, idx) => (
                                      <Badge key={idx} bg="white" border="1px solid rgba(86, 117, 109, 0.15)" color="#5A6E65" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                                        {s}
                                      </Badge>
                                    ))}
                                  </HStack>
                                </VStack>
                              </HStack>

                              <HStack spacing={3} flexShrink={0} align="center" alignSelf={{ base: "flex-end", md: "center" }}>
                                <Button 
                                  h="36px"
                                  variant="outline"
                                  borderRadius="full" 
                                  borderColor="rgba(86, 117, 109, 0.28)"
                                  color="#263A33"
                                  fontSize="12.5px" 
                                  fontWeight="600" 
                                  px={4} 
                                  leftIcon={<Icon as={FiEye} boxSize="13px" />}
                                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedClinician(t); }}
                                  whiteSpace="nowrap"
                                >
                                  View Details
                                </Button>
                                <Button 
                                  h="36px"
                                  bg="#56756D" 
                                  color="white" 
                                  borderRadius="full" 
                                  fontSize="12.5px" 
                                  fontWeight="600" 
                                  px={5} 
                                  _hover={{ bg: "#263A33", transform: "translateY(-1px)" }} 
                                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                                  onClick={(e) => { e.stopPropagation(); handleVerifyTherapist(t.id, t.name); }}
                                  whiteSpace="nowrap"
                                >
                                  Verify & Publish Live
                                </Button>
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* CLINICIAN INTAKE APPLICATIONS IN REVIEW */}
                  {therapistApplications.length > 0 && (
                    <Box 
                      bg="white" 
                      p={5} 
                      borderRadius="2xl" 
                      border="1px solid rgba(86, 117, 109, 0.14)" 
                      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >
                      <HStack spacing={2.5} mb={4}>
                        <Circle size="30px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                          <Icon as={FiFileText} boxSize="15px" />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <HStack spacing={2}>
                            <Heading fontSize="15px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                              Clinical Intake Applications
                            </Heading>
                            <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" fontSize="10px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                              {therapistApplications.length} TOTAL
                            </Badge>
                          </HStack>
                          <Text fontSize="12px" color="#5A6E65">
                            Applications submitted via the practitioner portal and career pathways.
                          </Text>
                        </VStack>
                      </HStack>

                      <VStack align="stretch" spacing={4}>
                        {therapistApplications.map(app => {
                          const vettingStage = getVettingStage(app);
                          const matchingProfile = getTherapistByEmail(app.email);

                          const badgeStyles = {
                            review: { bg: "rgba(245, 158, 11, 0.12)", color: "#D97706", label: "PENDING REVIEW" },
                            awaiting_contract: { bg: "rgba(99, 102, 241, 0.12)", color: "#4F46E5", label: "AWAITING CONTRACT" },
                            changes_requested: { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626", label: "CHANGES REQUESTED" },
                            published: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669", label: "PUBLISHED LIVE" },
                            rejected: { bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626", label: "REJECTED" },
                          };
                          const currentBadge = badgeStyles[vettingStage] || badgeStyles.review;

                          return (
                            <Box 
                              key={app.id} 
                              p={5} 
                              border="1px solid" 
                              borderColor="rgba(86, 117, 109, 0.14)" 
                              borderRadius="xl" 
                              bg={vettingStage === "published" ? "rgba(250, 248, 245, 0.5)" : "white"}
                              boxShadow="0 2px 8px -2px rgba(38, 58, 51, 0.03)"
                            >
                              <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} gap={3} mb={4}>
                                <VStack align="flex-start" spacing={1}>
                                  <HStack spacing={2.5}>
                                    <Text fontWeight="600" fontSize="15px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                                      {app.first_name} {app.last_name}
                                    </Text>
                                    <Badge 
                                      bg={currentBadge.bg} 
                                      color={currentBadge.color} 
                                      fontSize="10px" 
                                      fontWeight="700" 
                                      borderRadius="full" 
                                      px={2.5} 
                                      py={0.5}
                                    >
                                      {currentBadge.label}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="12.5px" color="#5A6E65">
                                    {app.email} • {app.phone || "No phone"}
                                  </Text>
                                  {matchingProfile?.profile_status && (
                                    <Text fontSize="11.5px" color="#718096">
                                      Internal stage: <Text as="span" fontWeight="600" color="#263A33">{matchingProfile.profile_status.replace(/_/g, " ")}</Text>
                                    </Text>
                                  )}
                                </VStack>

                                {/* Document Access Buttons */}
                                <HStack spacing={2}>
                                  <Button 
                                    size="xs" 
                                    variant="outline" 
                                    borderRadius="full" 
                                    borderColor="rgba(86, 117, 109, 0.25)" 
                                    color="#263A33" 
                                    fontWeight="600" 
                                    onClick={() => window.open(resolveAssetUrl(app.resume), "_blank")} 
                                    _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                                  >
                                    CV / Resume
                                  </Button>
                                  {app.qualification_doc && (
                                    <Button 
                                      size="xs" 
                                      variant="outline" 
                                      borderRadius="full" 
                                      borderColor="rgba(86, 117, 109, 0.25)" 
                                      color="#263A33" 
                                      fontWeight="600" 
                                      onClick={() => window.open(resolveAssetUrl(app.qualification_doc), "_blank")} 
                                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                                    >
                                      Degrees
                                    </Button>
                                  )}
                                  {app.license_doc && (
                                    <Button 
                                      size="xs" 
                                      variant="outline" 
                                      borderRadius="full" 
                                      borderColor="rgba(86, 117, 109, 0.25)" 
                                      color="#263A33" 
                                      fontWeight="600" 
                                      onClick={() => window.open(resolveAssetUrl(app.license_doc), "_blank")} 
                                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                                    >
                                      License
                                    </Button>
                                  )}
                                </HStack>
                              </Flex>

                              {/* Clinical Metadata Strip */}
                              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={4} p={3.5} bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)" borderRadius="xl">
                                <Box>
                                  <Text fontSize="10px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">CLINICAL EXPERIENCE</Text>
                                  <Text fontSize="13px" fontWeight="600" color="#263A33" mt={0.5}>
                                    {app.years_experience} Years ({app.highest_qualification || "Licensed"})
                                  </Text>
                                </Box>
                                <Box>
                                  <Text fontSize="10px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">LANGUAGES</Text>
                                  <Wrap spacing={1} mt={1}>
                                    {Array.isArray(app.languages) ? app.languages.map((l, idx) => (
                                      <Tag key={idx} size="sm" variant="subtle" bg="rgba(86, 117, 109, 0.1)" color="#263A33" fontSize="11px">
                                        {typeof l === 'object' ? (l.name || JSON.stringify(l)) : String(l)}
                                      </Tag>
                                    )) : <Text fontSize="12.5px" color="#263A33">{String(app.languages || "English")}</Text>}
                                  </Wrap>
                                </Box>
                                <Box>
                                  <Text fontSize="10px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">POPULATIONS</Text>
                                  <Wrap spacing={1} mt={1}>
                                    {Array.isArray(app.populations) ? app.populations.map((p, idx) => (
                                      <Tag key={idx} size="sm" variant="subtle" bg="rgba(86, 117, 109, 0.1)" color="#263A33" fontSize="11px">
                                        {typeof p === 'object' ? (p.name || JSON.stringify(p)) : String(p)}
                                      </Tag>
                                    )) : <Text fontSize="12.5px" color="#263A33">{String(app.populations || "Adults")}</Text>}
                                  </Wrap>
                                </Box>
                              </SimpleGrid>

                              {/* Stance & Background */}
                              <VStack align="stretch" spacing={2.5} mb={4}>
                                <Box>
                                  <Text fontSize="10px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">THERAPEUTIC STANCE</Text>
                                  <Text fontSize="12.5px" color="#263A33" mt={0.5} noOfLines={3}>
                                    {app.therapeutic_stance || "No statement submitted."}
                                  </Text>
                                </Box>
                                {app.relevant_experience && (
                                  <Box>
                                    <Text fontSize="10px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">RELEVANT EXPERIENCE</Text>
                                    <Text fontSize="12.5px" color="#263A33" mt={0.5} noOfLines={2}>
                                      {app.relevant_experience}
                                    </Text>
                                  </Box>
                                )}
                              </VStack>

                              {/* Vetting Action Rows */}
                              {vettingStage === 'review' && (
                                <VStack align="stretch" spacing={3} borderTop="1px solid rgba(86, 117, 109, 0.12)" pt={3.5}>
                                  <FormControl>
                                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Internal Review Notes & Clinician Feedback</FormLabel>
                                    <Textarea 
                                      placeholder="Feedback or instructions for the clinical applicant..." 
                                      size="sm" 
                                      id={'notes-' + app.id}
                                      borderRadius="xl"
                                      borderColor="rgba(86, 117, 109, 0.2)"
                                      bg="white"
                                      fontSize="13px"
                                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                    />
                                  </FormControl>
                                  <HStack justify="flex-end" spacing={3}>
                                    <Button 
                                      variant="outline" 
                                      colorScheme="red" 
                                      size="sm"
                                      borderRadius="full"
                                      fontSize="12.5px"
                                      fontWeight="600"
                                      px={4}
                                      onClick={async () => {
                                        if(!confirm("Send this back for profile changes?")) return;
                                        try { 
                                          const notes = document.getElementById('notes-' + app.id)?.value || "Please update profile details and resubmit.";
                                          const matching = getTherapistByEmail(app.email);
                                          if (matching?.id) {
                                            await apiPost('therapists/' + matching.id + '/request-profile-changes/', { feedback: notes });
                                          } else {
                                            await apiPut('manage-therapist-applications/' + app.id + '/', { status: "rejected" });
                                          }
                                          fetchTherapistApplications();
                                          fetchAllTherapists();
                                          toast({ status: "info", title: "Changes requested" });
                                        } catch (err) { toast({ status: "error", title: "Action failed", description: apiErrorDetail(err) }); }
                                      }}
                                    >
                                      Request Changes
                                    </Button>
                                    <Button 
                                      bg="#56756D" 
                                      color="white" 
                                      size="sm"
                                      borderRadius="full"
                                      fontSize="12.5px"
                                      fontWeight="600"
                                      px={5}
                                      _hover={{ bg: "#263A33" }}
                                      boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                                      onClick={async () => {
                                        const notes = document.getElementById('notes-' + app.id)?.value;
                                        try {
                                          const profile = getTherapistByEmail(app.email);
                                          let response;
                                          if (profile?.id) {
                                            response = await apiPost('therapists/' + profile.id + '/approve-content-send-contract/', { feedback: notes || "" });
                                          } else {
                                            response = await apiPost('manage-therapist-applications/' + app.id + '/approve/', { review_notes: notes, send_contract: true });
                                          }
                                          const emailSent = response?.email_sent;
                                          toast({
                                            status: emailSent === false ? "warning" : "success",
                                            title: emailSent === false ? "Approved, email not sent" : "Content approved",
                                            description: emailSent === false
                                              ? (response?.email_error || "Configure EMAIL_* env vars on Render to send contract emails.")
                                              : "Contract notification sent. Waiting for therapist signature.",
                                          });
                                          fetchTherapistApplications();
                                          fetchAllTherapists();
                                          fetchUnverifiedTherapists();
                                        } catch (err) {
                                          toast({ status: "error", title: "Approval failed", description: apiErrorDetail(err, "Please check required profile fields and try again.") });
                                        }
                                      }}
                                    >
                                      Approve Content & Send Contract
                                    </Button>
                                  </HStack>
                                </VStack>
                              )}

                              {vettingStage === 'awaiting_contract' && (
                                <VStack align="stretch" spacing={3} borderTop="1px solid rgba(86, 117, 109, 0.12)" pt={3.5}>
                                  <Text fontSize="12.5px" color="#5A6E65">
                                    Contract notification sent to <b>{app.email}</b>. Once signed, publish their profile to make them visible on the directory.
                                  </Text>
                                  <HStack justify="flex-end" spacing={2.5}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      borderRadius="full"
                                      borderColor="rgba(86, 117, 109, 0.25)"
                                      color="#263A33"
                                      fontSize="12.5px"
                                      fontWeight="600"
                                      onClick={async () => {
                                        try {
                                          await apiPost('manage-therapist-applications/' + app.id + '/approve/', { review_notes: "Manual re-verify/repair from admin portal." });
                                          toast({ status: "success", title: "Verification repaired", description: "Canonical profile verification sync re-applied." });
                                          fetchTherapistApplications();
                                          fetchAllTherapists();
                                          fetchUnverifiedTherapists();
                                        } catch {
                                          toast({ status: "error", title: "Repair failed", description: "Please try again." });
                                        }
                                      }}
                                    >
                                      Re-verify / Repair
                                    </Button>
                                    <Button
                                      size="sm"
                                      bg="#059669"
                                      color="white"
                                      borderRadius="full"
                                      fontSize="12.5px"
                                      fontWeight="600"
                                      px={4}
                                      _hover={{ bg: "#047857" }}
                                      onClick={async () => {
                                        try {
                                          const profile = getTherapistByEmail(app.email);
                                          if (!profile?.id) {
                                            toast({ status: "warning", title: "Profile not found", description: "Run Re-verify / Repair first." });
                                            return;
                                          }
                                          const response = await apiPost('therapists/' + profile.id + '/verify-contract-approve-profile/', {});
                                          toast({
                                            status: "success",
                                            title: "Contract verified",
                                            description: response?.email_sent === false
                                              ? "Profile is live. Published email could not be sent — check Render email settings."
                                              : "Profile is now published live.",
                                          });
                                          fetchTherapistApplications();
                                          fetchAllTherapists();
                                          fetchUnverifiedTherapists();
                                        } catch (err) {
                                          toast({ status: "error", title: "Publish failed", description: apiErrorDetail(err) });
                                        }
                                      }}
                                    >
                                      Verify Contract & Publish
                                    </Button>
                                  </HStack>
                                </VStack>
                              )}

                              {vettingStage === 'published' && (
                                <HStack borderTop="1px solid rgba(86, 117, 109, 0.1)" pt={3} justify="space-between">
                                  <HStack spacing={2}>
                                    <Icon as={FiCheckCircle} color="#059669" boxSize="15px" />
                                    <Text fontSize="12.5px" color="#059669" fontWeight="600">
                                      Profile is verified and published on the live directory.
                                    </Text>
                                  </HStack>
                                  <Button
                                    as="a"
                                    href={'/therapists/' + (matchingProfile?.slug || matchingProfile?.id || '')}
                                    target="_blank"
                                    size="xs"
                                    variant="outline"
                                    borderRadius="full"
                                    borderColor="rgba(86, 117, 109, 0.25)"
                                    color="#56756D"
                                    fontSize="11.5px"
                                    rightIcon={<Icon as={FiExternalLink} boxSize="11px" />}
                                  >
                                    View Live
                                  </Button>
                                </HStack>
                              )}
                            </Box>
                          );
                        })}
                      </VStack>
                    </Box>
                  )}

                  {/* QUEUE CLEAR EMPTY STATE (ONLY WHEN BOTH APPLICATIONS & DIRECT REGISTRATIONS ARE ZERO) */}
                  {totalPending === 0 && (
                    <Box 
                      bg="white" 
                      p={8} 
                      borderRadius="2xl" 
                      border="1px solid rgba(86, 117, 109, 0.14)" 
                      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >
                      <VStack py={8} spacing={3} textAlign="center">
                        <Circle size="52px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                          <Icon as={FiCheckCircle} boxSize="26px" />
                        </Circle>
                        <Text fontSize="16px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                          Directory Queue Clear
                        </Text>
                        <Text fontSize="13px" color="#5A6E65" maxW="440px">
                          All submitted clinician applications and registered practitioner accounts have been reviewed and verified.
                        </Text>
                        <Button
                          size="sm"
                          mt={2}
                          bg="#56756D"
                          color="white"
                          borderRadius="full"
                          px={5}
                          fontSize="12.5px"
                          fontWeight="600"
                          _hover={{ bg: "#263A33" }}
                          rightIcon={<Icon as={FiArrowRight} boxSize="12px" />}
                          onClick={() => setVettingSubTab("published")}
                        >
                          Browse Published Directory ({publishedTherapists.length})
                        </Button>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              )}

              {/* 🌿 SUBTAB 2: PUBLISHED DIRECTORY VIEW */}
              {vettingSubTab === "published" && (
                <VStack align="stretch" spacing={5}>
                  {/* Search & Filter Bar */}
                  <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap={3}>
                    <InputGroup maxW={{ base: "full", sm: "380px" }}>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="#718096" />
                      </InputLeftElement>
                      <Input 
                        h="38px"
                        borderRadius="xl"
                        borderColor="rgba(86, 117, 109, 0.2)"
                        fontSize="13px"
                        bg="white"
                        placeholder="Search published clinicians by name, email, specialty..."
                        value={publishedSearchQuery}
                        onChange={(e) => setPublishedSearchQuery(e.target.value)}
                        _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      />
                    </InputGroup>
                    <HStack spacing={3} justify={{ base: "space-between", sm: "flex-end" }}>
                      <Text fontSize="12.5px" color="#5A6E65">
                        Showing <b>{filteredPublishedTherapists.length}</b> of <b>{publishedTherapists.length}</b> live clinicians
                      </Text>
                      <IconButton 
                        size="sm" 
                        variant="outline" 
                        borderRadius="full" 
                        borderColor="rgba(86, 117, 109, 0.2)"
                        icon={<Icon as={FiRefreshCw} />} 
                        aria-label="Refresh list"
                        onClick={() => { fetchAllTherapists(); fetchUnverifiedTherapists(); }}
                      />
                    </HStack>
                  </Flex>

                  {filteredPublishedTherapists.length === 0 ? (
                    <Box bg="white" p={8} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)">
                      <VStack py={8} spacing={3} textAlign="center">
                        <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                          <Icon as={FiUsers} boxSize="24px" />
                        </Circle>
                        <Text fontSize="15px" fontWeight="600" color="#263A33" fontFamily="'Outfit', sans-serif">No published clinicians found</Text>
                        <Text fontSize="12.5px" color="#5A6E65">
                          {publishedSearchQuery ? "No clinicians match your search filter." : "No therapists have been published to the directory yet."}
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <VStack align="stretch" spacing={4}>
                      {filteredPublishedTherapists.map(t => {
                        const isDuplicate = (duplicateTherapistNames[(t.name || "").trim().toLowerCase()] || 0) > 1;
                        return (
                          <Box 
                            key={t.id} 
                            p={5} 
                            border="1px solid" 
                            borderColor="rgba(86, 117, 109, 0.14)" 
                            borderRadius="xl" 
                            bg="white"
                            boxShadow="0 2px 8px -2px rgba(38, 58, 51, 0.03)"
                            transition="all 0.2s ease"
                            _hover={{ borderColor: "#56756D", boxShadow: "0 4px 14px -2px rgba(38, 58, 51, 0.08)" }}
                          >
                            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
                              <HStack 
                                spacing={4} 
                                align="flex-start"
                                cursor="pointer"
                                onClick={() => setSelectedClinician(t)}
                                flex="1"
                              >
                                <Box position="relative" flexShrink={0}>
                                  <Avatar size="md" name={t.name || t.email} src={t.photo_url} />
                                  <Circle size="11px" bg="#10B981" border="2px solid white" position="absolute" bottom="0" right="0" />
                                </Box>
                                <VStack align="flex-start" spacing={1}>
                                  <HStack spacing={2} wrap="wrap">
                                    <Text 
                                      fontWeight="600" 
                                      fontSize="15px" 
                                      color="#263A33" 
                                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                                      _hover={{ color: "#56756D", textDecoration: "underline" }}
                                    >
                                      {t.name}
                                    </Text>
                                    <Badge 
                                      bg="rgba(16, 185, 129, 0.12)" 
                                      color="#059669" 
                                      fontSize="10px" 
                                      fontWeight="700" 
                                      borderRadius="full" 
                                      px={2.5} 
                                      py={0.5}
                                    >
                                      PUBLISHED LIVE
                                    </Badge>
                                    {t.is_supervisor && (
                                      <Badge 
                                        bg="rgba(99, 102, 241, 0.12)" 
                                        color="#4F46E5" 
                                        fontSize="10px" 
                                        fontWeight="700" 
                                        borderRadius="full" 
                                        px={2} 
                                        py={0.5}
                                      >
                                        SUPERVISOR
                                      </Badge>
                                    )}
                                    {isDuplicate && (
                                      <Badge 
                                        bg="rgba(245, 158, 11, 0.12)" 
                                        color="#D97706" 
                                        fontSize="10px" 
                                        fontWeight="700" 
                                        borderRadius="full" 
                                        px={2} 
                                        py={0.5}
                                        title="Multiple accounts share this name in the database"
                                      >
                                        ⚠️ DUPLICATE NAME IN DB
                                      </Badge>
                                    )}
                                  </HStack>
                                  <Text fontSize="12.5px" color="#5A6E65">
                                    {t.title || t.highest_qualification || "Licensed Clinician"} • {t.email} • {t.phone || "No phone"} • ID: {t.id}
                                  </Text>
                                  <HStack spacing={2} wrap="wrap" pt={0.5}>
                                    <Badge bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px" borderRadius="md" px={2} py={0.5}>
                                      {t.hourly_rate != null ? `₹${t.hourly_rate}/hr` : "Rate not set"}
                                    </Badge>
                                    {t.years_experience != null && t.years_experience !== "" && (
                                      <Badge bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="10.5px" borderRadius="md" px={2} py={0.5}>
                                        {t.years_experience}+ yrs exp
                                      </Badge>
                                    )}
                                    {Array.isArray(t.specializations) && t.specializations.slice(0, 3).map((s, idx) => (
                                      <Badge key={idx} bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.15)" color="#5A6E65" fontSize="10px" borderRadius="md" px={2} py={0.5}>
                                        {s}
                                      </Badge>
                                    ))}
                                  </HStack>
                                </VStack>
                              </HStack>

                              {/* Action Buttons */}
                              <HStack spacing={3} flexShrink={0} align="center" alignSelf={{ base: "flex-end", md: "center" }}>
                                <Button
                                  h="36px"
                                  variant="outline"
                                  borderRadius="full"
                                  borderColor="rgba(86, 117, 109, 0.28)"
                                  color="#263A33"
                                  fontSize="12.5px"
                                  fontWeight="600"
                                  px={4}
                                  leftIcon={<Icon as={FiEye} boxSize="13px" />}
                                  onClick={(e) => { e.stopPropagation(); setSelectedClinician(t); }}
                                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                                  whiteSpace="nowrap"
                                >
                                  View Details
                                </Button>
                                <Button
                                  as="a"
                                  href={'/therapists/' + (t.slug || t.id)}
                                  target="_blank"
                                  h="36px"
                                  variant="outline"
                                  borderRadius="full"
                                  borderColor="rgba(86, 117, 109, 0.28)"
                                  color="#56756D"
                                  fontSize="12.5px"
                                  fontWeight="600"
                                  px={4}
                                  rightIcon={<Icon as={FiExternalLink} boxSize="12px" />}
                                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                                  onClick={(e) => e.stopPropagation()}
                                  whiteSpace="nowrap"
                                >
                                  View Live
                                </Button>
                                <Button
                                  h="36px"
                                  variant="outline"
                                  borderColor="rgba(239, 68, 68, 0.3)"
                                  color="#DC2626"
                                  borderRadius="full"
                                  fontSize="12.5px"
                                  fontWeight="600"
                                  px={4}
                                  leftIcon={<Icon as={FiEyeOff} boxSize="13px" />}
                                  _hover={{ bg: "#FEF2F2", borderColor: "#DC2626" }}
                                  onClick={() => setUnpublishTarget(t)}
                                  whiteSpace="nowrap"
                                >
                                  Unpublish
                                </Button>
                              </HStack>
                            </Flex>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              )}

              {/* 🌿 SUBTAB 3: ALL PROFILES DIRECTORY VIEW */}
              {vettingSubTab === "all" && (
                <VStack align="stretch" spacing={5}>
                  <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap={3}>
                    <InputGroup maxW={{ base: "full", sm: "380px" }}>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="#718096" />
                      </InputLeftElement>
                      <Input 
                        h="38px"
                        borderRadius="xl"
                        borderColor="rgba(86, 117, 109, 0.2)"
                        fontSize="13px"
                        bg="white"
                        placeholder="Search all clinician accounts..."
                        value={publishedSearchQuery}
                        onChange={(e) => setPublishedSearchQuery(e.target.value)}
                        _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      />
                    </InputGroup>
                    <HStack spacing={3}>
                      <Text fontSize="12.5px" color="#5A6E65">
                        Total clinician profiles: <b>{allTherapists.length}</b>
                      </Text>
                    </HStack>
                  </Flex>

                  <VStack align="stretch" spacing={3}>
                    {allTherapists
                      .filter(t => {
                        const q = publishedSearchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (t.name || "").toLowerCase().includes(q) || (t.email || "").toLowerCase().includes(q);
                      })
                      .map(t => {
                        const isPublished = t.is_verified || t.profile_status === "approved";
                        const isGhost = (t.name || "").toLowerCase().startsWith("user_");
                        return (
                          <HStack 
                            key={t.id} 
                            p={3.5} 
                            border="1px solid rgba(86, 117, 109, 0.12)" 
                            borderRadius="xl" 
                            bg={isPublished ? "white" : "rgba(250, 248, 245, 0.85)"}
                            justify="space-between"
                            align="center"
                            flexWrap="wrap"
                            gap={3}
                          >
                            <HStack 
                              spacing={3} 
                              cursor="pointer" 
                              onClick={() => setSelectedClinician(t)}
                            >
                              <Avatar size="sm" name={t.name || t.email} src={t.photo_url} />
                              <VStack align="flex-start" spacing={0}>
                                <HStack spacing={2}>
                                  <Text 
                                    fontWeight="600" 
                                    fontSize="13px" 
                                    color="#263A33"
                                    _hover={{ color: "#56756D", textDecoration: "underline" }}
                                  >
                                    {t.name}
                                  </Text>
                                  <Badge 
                                    bg={isPublished ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"} 
                                    color={isPublished ? "#059669" : "#D97706"}
                                    fontSize="9.5px"
                                    fontWeight="700"
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {isPublished ? "PUBLISHED" : (t.profile_status || "UNVERIFIED").toUpperCase()}
                                  </Badge>
                                  {isGhost && (
                                    <Badge bg="rgba(239, 68, 68, 0.12)" color="#DC2626" fontSize="9px" borderRadius="full" px={1.5}>
                                      GHOST
                                    </Badge>
                                  )}
                                </HStack>
                                <Text fontSize="11.5px" color="#5A6E65">{t.email} • ID: {t.id}</Text>
                              </VStack>
                            </HStack>

                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                borderRadius="full"
                                borderColor="rgba(86, 117, 109, 0.25)"
                                color="#263A33"
                                fontSize="11.5px"
                                fontWeight="600"
                                leftIcon={<Icon as={FiEye} boxSize="10px" />}
                                onClick={(e) => { e.stopPropagation(); setSelectedClinician(t); }}
                                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                              >
                                Details
                              </Button>
                              {isPublished ? (
                                <>
                                  <Button
                                    as="a"
                                    href={'/therapists/' + (t.slug || t.id)}
                                    target="_blank"
                                    size="xs"
                                    variant="outline"
                                    borderRadius="full"
                                    borderColor="rgba(86, 117, 109, 0.25)"
                                    color="#56756D"
                                    fontSize="11.5px"
                                    rightIcon={<Icon as={FiExternalLink} boxSize="10px" />}
                                  >
                                    View Live
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    colorScheme="red"
                                    borderRadius="full"
                                    fontSize="11.5px"
                                    onClick={() => setUnpublishTarget(t)}
                                  >
                                    Unpublish
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  size="xs" 
                                  bg="#56756D" 
                                  color="white" 
                                  borderRadius="full" 
                                  fontSize="11.5px" 
                                  fontWeight="600" 
                                  px={3} 
                                  _hover={{ bg: "#263A33" }}
                                  onClick={() => handleVerifyTherapist(t.id, t.name)}
                                >
                                  Mark Verified
                                </Button>
                              )}
                            </HStack>
                          </HStack>
                        );
                      })}
                  </VStack>
                </VStack>
              )}
            </VStack>
          );
        })()}

        {activeTab === "team" && (
           <VStack align="stretch" spacing={6}>
              <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <Heading fontSize="16px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em" mb={5}>
                  {editingId ? "Edit Clinical Team Member" : "Add Clinical Team Member"}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Full Name</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.name} 
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Professional Title</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.title} 
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Email Address</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.email} 
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Photo URL</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.photo_url} 
                      onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Specialties (comma separated)</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.specialties} 
                      onChange={(e) => setDraft({ ...draft, specialties: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Directory Sort Order</FormLabel>
                    <Input 
                      h="38px"
                      type="number" 
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={draft.sort_order} 
                      onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} 
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Practitioner Biography</FormLabel>
                  <RichTextEditor value={draft.bio} onChange={(val) => setDraft({ ...draft, bio: val })} />
                </FormControl>
                <HStack mt={6} spacing={3}>
                   <Button 
                     bg="#56756D" 
                     color="white" 
                     borderRadius="full"
                     h="38px"
                     px={5}
                     fontSize="13px"
                     fontWeight="600"
                     fontFamily="'Inter', var(--font-inter), sans-serif"
                     _hover={{ bg: "#263A33" }}
                     boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                     onClick={async () => {
                      try {
                        if (editingId) {
                          await apiPut(`team-members/${editingId}/`, draft);
                          toast({ status: "success", title: "Member updated" });
                        } else {
                          await apiPost("team-members/", draft);
                          toast({ status: "success", title: "Member added" });
                        }
                        setDraft(emptyMember);
                        setEditingId(null);
                        fetchMembers();
                      } catch { toast({ status: "error", title: "Action failed" }); }
                   }}>
                      {editingId ? "Update Member" : "Save Member"}
                   </Button>
                   {editingId && (
                     <Button 
                       variant="outline" 
                       borderRadius="full"
                       borderColor="rgba(86, 117, 109, 0.25)"
                       color="#263A33"
                       h="38px"
                       px={4}
                       fontSize="12.5px"
                       fontWeight="600"
                       fontFamily="'Inter', var(--font-inter), sans-serif"
                       onClick={() => { setEditingId(null); setDraft(emptyMember); }}
                     >
                       Cancel
                     </Button>
                   )}
                </HStack>
              </Box>

              <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                  <VStack align="start" spacing={0.5}>
                    <Heading fontSize="16px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
                      Managed Team Members
                    </Heading>
                    <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', var(--font-inter), sans-serif">
                      Clinicians and team members visible across the public directory
                    </Text>
                  </VStack>
                  <Badge bg="rgba(86, 117, 109, 0.12)" color="#56756D" fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" borderRadius="full" px={2.5} py={0.5} fontFamily="'Inter', var(--font-inter), sans-serif">
                    {members.length} Members
                  </Badge>
                </HStack>

                {members.length === 0 ? (
                  <Box p={8} textAlign="center" borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px dashed rgba(86, 117, 109, 0.2)">
                    <Text fontSize="13px" color="#5A6E65">No team members registered yet.</Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {members.map(m => (
                      <HStack 
                        key={m.id} 
                        p={3.5} 
                        border="1px solid rgba(86, 117, 109, 0.12)" 
                        borderRadius="xl" 
                        bg="rgba(250, 248, 245, 0.85)"
                        justify="space-between"
                        align="center"
                      >
                         <HStack spacing={3.5}>
                            <Image 
                              src={m.photo_url} 
                              w="44px" 
                              h="44px" 
                              borderRadius="full" 
                              objectFit="cover" 
                              fallbackSrc="/logo_tra.png" 
                              border="1px solid rgba(86, 117, 109, 0.15)"
                            />
                            <VStack align="flex-start" spacing={0}>
                               <Text fontWeight="600" fontSize="13.5px" color="#263A33">{m.name}</Text>
                               <Text fontSize="12px" color="#5A6E65">{m.title}</Text>
                            </VStack>
                         </HStack>
                         <HStack spacing={2}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              borderRadius="full"
                              borderColor="rgba(86, 117, 109, 0.25)"
                              color="#263A33"
                              fontSize="12px"
                              fontWeight="600"
                              h="32px"
                              px={3.5}
                              _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                              onClick={() => { setEditingId(m.id); setDraft(m); }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              colorScheme="red" 
                              borderRadius="full"
                              fontSize="12px"
                              h="32px"
                              onClick={async () => {
                               if(!confirm("Delete this member?")) return;
                               try { await apiDelete(`team-members/${m.id}/`); fetchMembers(); toast({ status: "info", title: "Deleted" }); }
                               catch { toast({ status: "error", title: "Failed" }); }
                            }}>
                              Delete
                            </Button>
                         </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
           </VStack>
        )}

        {activeTab === "messages" && (
  <Box 
    bg="white" 
    p={6} 
    borderRadius="2xl" 
    border="1px solid rgba(86, 117, 109, 0.14)" 
    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
  >
    <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
      <VStack align="start" spacing={0.5}>
        <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
          Contact Inquiries
        </Heading>
        <Text fontSize="13px" color="#5A6E65">
          General user messages received through the public contact form
        </Text>
      </VStack>
      <Badge 
        bg="rgba(86, 117, 109, 0.12)" 
        color="#56756D" 
        fontSize="11px" 
        fontWeight="700" 
        borderRadius="full" 
        px={2.5} 
        py={0.5}
      >
        {contactMessages.length} Messages
      </Badge>
    </HStack>

    {contactMessages.length === 0 ? (
      <VStack py={12} spacing={3} textAlign="center">
        <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
          <Icon as={FiMail} boxSize="22px" />
        </Circle>
        <Text fontSize="14px" fontWeight="600" color="#263A33">No contact inquiries yet</Text>
        <Text fontSize="12.5px" color="#5A6E65">New user messages will appear here in chronological order.</Text>
      </VStack>
    ) : (
      <VStack align="stretch" spacing={4}>
        {contactMessages.map(m => (
          <Box 
            key={m.id} 
            p={5} 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.12)" 
            borderRadius="xl"
            bg="white"
            boxShadow="0 2px 6px -2px rgba(38, 58, 51, 0.03)"
          >
            <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={2} mb={3}>
              <HStack spacing={3}>
                <Circle size="34px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" fontWeight="700" fontSize="13px">
                  {(m.full_name || "U").charAt(0).toUpperCase()}
                </Circle>
                <VStack align="flex-start" spacing={0}>
                  <Text fontWeight="600" fontSize="14px" color="#263A33">{m.full_name}</Text>
                  <HStack spacing={2} fontSize="12px" color="#5A6E65">
                    <Text as="a" href={'mailto:' + m.email} color="#56756D" _hover={{ textDecoration: "underline" }}>
                      {m.email}
                    </Text>
                    {m.phone && (
                      <>
                        <Text color="gray.300">•</Text>
                        <Text as="a" href={'tel:' + m.phone} color="#56756D" _hover={{ textDecoration: "underline" }}>
                          {m.phone}
                        </Text>
                      </>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <Badge 
                bg="rgba(86, 117, 109, 0.08)" 
                color="#56756D" 
                fontSize="10px" 
                fontWeight="600" 
                borderRadius="full" 
                px={2.5} 
                py={0.5}
              >
                {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </Flex>
            <Box bg="rgba(250, 248, 245, 0.85)" p={3.5} borderRadius="lg" border="1px solid rgba(86, 117, 109, 0.08)">
              <Text fontSize="13px" color="#263A33" lineHeight="1.5">{m.message}</Text>
            </Box>
          </Box>
        ))}
      </VStack>
    )}
  </Box>
)}

{activeTab === "bookings" && (() => {
  const filteredAppointments = allAppointments.filter((appt) => {
    const q = bookingSearch.trim().toLowerCase();
    const statusMatch =
      bookingStatusFilter === "all" ||
      (appt.status || "").toLowerCase() === bookingStatusFilter.toLowerCase();

    if (!statusMatch) return false;
    if (!q) return true;

    const cName = (appt.client_name || appt.client_display_name || "").toLowerCase();
    const cEmail = (appt.client_email || "").toLowerCase();
    const tName = (appt.therapist_name || "").toLowerCase();
    const idStr = String(appt.id);
    return cName.includes(q) || cEmail.includes(q) || tName.includes(q) || idStr.includes(q);
  });

  const scheduledCount = allAppointments.filter(
    (a) => a.status === "scheduled" || a.status === "rescheduled"
  ).length;
  const completedCount = allAppointments.filter((a) => a.status === "completed").length;
  const cancelledCount = allAppointments.filter((a) => a.status === "cancelled").length;

  return (
    <Box 
      bg="white" 
      p={{ base: 5, md: 6 }} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
    >
      {/* 🌿 Top Controls Bar: Sub-tabs & Refresh */}
      <Flex 
        justify="space-between" 
        align={{ base: "flex-start", sm: "center" }} 
        direction={{ base: "column", sm: "row" }} 
        gap={4} 
        mb={6} 
        pb={5} 
        borderBottom="1px solid rgba(86, 117, 109, 0.12)"
      >
        <VStack align="start" spacing={0.5}>
          <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
            Bookings & Sessions Command Center
          </Heading>
          <Text fontSize="13px" color="#5A6E65">
            Audit clinical tele-therapy appointments and review inbound intake leads
          </Text>
        </VStack>

        <HStack spacing={3} w={{ base: "full", sm: "auto" }} justify={{ base: "space-between", sm: "flex-end" }}>
          {/* Segmented Rail (Rule 7 dimensions) */}
          <HStack 
            bg="rgba(250, 248, 245, 0.95)" 
            p={1} 
            borderRadius="full" 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            spacing={1}
            boxShadow="inset 0 1px 2px rgba(38, 58, 51, 0.03)"
          >
            <Button
              size="sm"
              h="34px"
              borderRadius="full"
              fontSize="12.5px"
              fontWeight="600"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              px={4}
              bg={bookingSubTab === "appointments" ? "#56756D" : "transparent"}
              color={bookingSubTab === "appointments" ? "white" : "#5A6E65"}
              boxShadow={bookingSubTab === "appointments" ? "0 2px 6px rgba(86, 117, 109, 0.22)" : "none"}
              _hover={{ bg: bookingSubTab === "appointments" ? "#3D564F" : "rgba(86, 117, 109, 0.08)" }}
              onClick={() => setBookingSubTab("appointments")}
            >
              Clinical Sessions ({allAppointments.length})
            </Button>
            <Button
              size="sm"
              h="34px"
              borderRadius="full"
              fontSize="12.5px"
              fontWeight="600"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              px={4}
              bg={bookingSubTab === "leads" ? "#56756D" : "transparent"}
              color={bookingSubTab === "leads" ? "white" : "#5A6E65"}
              boxShadow={bookingSubTab === "leads" ? "0 2px 6px rgba(86, 117, 109, 0.22)" : "none"}
              _hover={{ bg: bookingSubTab === "leads" ? "#3D564F" : "rgba(86, 117, 109, 0.08)" }}
              onClick={() => setBookingSubTab("leads")}
            >
              Inbound Leads ({quickBookings.length})
            </Button>
          </HStack>

          <IconButton
            aria-label="Refresh bookings"
            icon={<Icon as={FiRefreshCw} />}
            size="sm"
            h="36px"
            w="36px"
            borderRadius="full"
            variant="outline"
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
            isLoading={appointmentsLoading}
            onClick={() => {
              fetchAllAppointments();
              fetchQuickBookings();
            }}
          />
        </HStack>
      </Flex>

      {/* 🏛️ VIEW 1: CLINICAL APPOINTMENTS */}
      {bookingSubTab === "appointments" && (
        <VStack align="stretch" spacing={6}>
          {/* Metric Strip (Rule 8 & 10) */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box p={4} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.12)">
              <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">TOTAL BOOKINGS</Text>
              <Text fontSize="22px" fontWeight="700" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" mt={1}>
                {allAppointments.length}
              </Text>
            </Box>
            <Box p={4} borderRadius="xl" bg="rgba(236, 253, 245, 0.6)" border="1px solid rgba(16, 185, 129, 0.25)">
              <Text fontSize="10px" fontWeight="700" color="#059669" textTransform="uppercase" letterSpacing="0.08em">SCHEDULED / ACTIVE</Text>
              <Text fontSize="22px" fontWeight="700" color="#065F46" fontFamily="'Outfit', var(--font-outfit), sans-serif" mt={1}>
                {scheduledCount}
              </Text>
            </Box>
            <Box p={4} borderRadius="xl" bg="rgba(86, 117, 109, 0.08)" border="1px solid rgba(86, 117, 109, 0.2)">
              <Text fontSize="10px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em">COMPLETED</Text>
              <Text fontSize="22px" fontWeight="700" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" mt={1}>
                {completedCount}
              </Text>
            </Box>
            <Box p={4} borderRadius="xl" bg="rgba(254, 242, 242, 0.6)" border="1px solid rgba(239, 68, 68, 0.25)">
              <Text fontSize="10px" fontWeight="700" color="#DC2626" textTransform="uppercase" letterSpacing="0.08em">CANCELLED</Text>
              <Text fontSize="22px" fontWeight="700" color="#991B1B" fontFamily="'Outfit', var(--font-outfit), sans-serif" mt={1}>
                {cancelledCount}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Filter & Search Bar */}
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap={3}>
            <InputGroup maxW={{ base: "full", sm: "340px" }}>
              <InputLeftElement pointerEvents="none" h="38px">
                <Icon as={FiSearch} color="#718096" boxSize="14px" />
              </InputLeftElement>
              <Input
                placeholder="Search by client, therapist, or #ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                h="38px"
                borderRadius="xl"
                fontSize="13px"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                bg="white"
              />
            </InputGroup>

            <Box w={{ base: "full", sm: "200px" }}>
              <ModernSelect
                size="sm"
                value={bookingStatusFilter}
                onChange={(val) => setBookingStatusFilter(val)}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "scheduled", label: "Scheduled / Active" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </Box>
          </Flex>

          {/* Table Container (Rule 12 Admin Standards) */}
          <Box overflowX="auto" w="full" minW="0" borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.12)">
            <Table variant="simple" size="sm">
              <Thead bg="rgba(250, 248, 245, 0.75)">
                <Tr borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Date & Time
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Client
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Therapist
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Format
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Status
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5}>
                    Payment
                  </Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" py={3.5} textAlign="right">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAppointments.map((appt) => {
                  const s = (appt.status || "").toLowerCase();
                  const isScheduled = s === "scheduled" || s === "rescheduled";
                  const isCompleted = s === "completed";
                  const isCancelled = s === "cancelled";

                  const statusBadgeBg = isScheduled
                    ? "rgba(16, 185, 129, 0.12)"
                    : isCompleted
                    ? "rgba(86, 117, 109, 0.12)"
                    : "rgba(239, 68, 68, 0.12)";
                  const statusBadgeColor = isScheduled
                    ? "#059669"
                    : isCompleted
                    ? "#263A33"
                    : "#DC2626";

                  const isPaid = appt.payment_status === "paid";

                  return (
                    <Tr 
                      key={appt.id} 
                      borderBottom="1px solid rgba(86, 117, 109, 0.08)"
                      _hover={{ bg: "rgba(250, 248, 245, 0.6)" }}
                      transition="background 0.15s"
                    >
                      <Td py={3.5}>
                        <VStack align="start" spacing={0.5}>
                          <Text fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="13px" color="#263A33" whiteSpace="nowrap">
                            {appt.start_time
                              ? new Date(appt.start_time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
                              : "Unscheduled"}
                          </Text>
                          <HStack spacing={1.5}>
                            <Circle size="6px" bg={isScheduled ? "#10B981" : isCompleted ? "#56756D" : "#EF4444"} />
                            <Text fontSize="11.5px" color="#5A6E65" whiteSpace="nowrap">
                              {appt.start_time
                                ? new Date(appt.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "--"}
                            </Text>
                          </HStack>
                        </VStack>
                      </Td>

                      <Td py={3.5}>
                        <HStack spacing={2.5}>
                          <Avatar size="sm" name={appt.client_name || appt.client_display_name || "Client"} bg="#56756D" color="white" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                              {appt.client_name || appt.client_display_name || "Client"}
                            </Text>
                            {appt.client_email && (
                              <Text fontSize="11px" color="#718096" noOfLines={1}>
                                {appt.client_email}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Td>

                      <Td py={3.5}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                            {appt.therapist_name || "Therapist"}
                          </Text>
                          {appt.therapist_email && (
                            <Text fontSize="11px" color="#718096" noOfLines={1}>
                              {appt.therapist_email}
                            </Text>
                          )}
                        </VStack>
                      </Td>

                      <Td py={3.5}>
                        <Badge 
                          bg="rgba(86, 117, 109, 0.08)" 
                          color="#263A33" 
                          border="1px solid rgba(86, 117, 109, 0.15)"
                          borderRadius="full" 
                          px={2.5} 
                          py={0.5} 
                          fontSize="10px" 
                          fontWeight="700"
                        >
                          {appt.service_type || "Virtual 1-on-1"}
                        </Badge>
                      </Td>

                      <Td py={3.5}>
                        <Badge 
                          bg={statusBadgeBg} 
                          color={statusBadgeColor} 
                          borderRadius="full" 
                          px={2.5} 
                          py={0.5} 
                          fontSize="10px" 
                          fontWeight="700"
                          textTransform="uppercase"
                        >
                          {appt.status_label || appt.status || "Scheduled"}
                        </Badge>
                      </Td>

                      <Td py={3.5}>
                        <Badge 
                          bg={isPaid ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"} 
                          color={isPaid ? "#059669" : "#D97706"} 
                          borderRadius="full" 
                          px={2.5} 
                          py={0.5} 
                          fontSize="10px" 
                          fontWeight="700"
                          textTransform="uppercase"
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </Badge>
                      </Td>

                      <Td py={3.5} textAlign="right">
                        <HStack spacing={2} justify="flex-end">
                          <Button
                            size="sm"
                            h="30px"
                            variant="outline"
                            borderColor="rgba(86, 117, 109, 0.25)"
                            color="#263A33"
                            borderRadius="full"
                            fontSize="11.5px"
                            fontWeight="600"
                            px={3}
                            _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                            onClick={() => {
                              setSelectedBookingDetail(appt);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Details
                          </Button>
                          {!isCancelled && (
                            <Button
                              size="sm"
                              h="30px"
                              bg="#263A33"
                              color="white"
                              borderRadius="full"
                              fontSize="11.5px"
                              fontWeight="600"
                              px={3}
                              leftIcon={<Icon as={FiVideo} color="#A9CBB7" boxSize="11px" />}
                              _hover={{ bg: "#182722" }}
                              onClick={() => window.open(`/conference/MLC_${appt.id}`, "_blank")}
                            >
                              Join Room
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={12} color="#718096" fontSize="13px">
                      No clinical session bookings found matching your filter criteria.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      )}

      {/* 📬 VIEW 2: QUICK INTAKE LEADS */}
      {bookingSubTab === "leads" && (
        <VStack align="stretch" spacing={4}>
          {quickBookings.length === 0 ? (
            <VStack py={12} spacing={3} textAlign="center">
              <Circle size="48px" bg="rgba(214, 158, 46, 0.12)" color="#D69E2E">
                <Icon as={FiInbox} boxSize="22px" />
              </Circle>
              <Text fontSize="14px" fontWeight="600" color="#263A33">No booking leads yet</Text>
              <Text fontSize="12.5px" color="#5A6E65">Quick intake requests from the landing page will stream in here.</Text>
            </VStack>
          ) : (
            quickBookings.map((b) => (
              <Box 
                key={b.id} 
                p={5} 
                border="1px solid" 
                borderColor="rgba(86, 117, 109, 0.12)" 
                borderRadius="xl"
                bg="white"
                boxShadow="0 2px 6px -2px rgba(38, 58, 51, 0.03)"
              >
                <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={2} mb={3}>
                  <HStack spacing={3}>
                    <Circle size="34px" bg="rgba(214, 158, 46, 0.15)" color="#D69E2E" fontWeight="700" fontSize="13px">
                      {(b.full_name || "L").charAt(0).toUpperCase()}
                    </Circle>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="600" fontSize="14px" color="#263A33">{b.full_name}</Text>
                      <HStack spacing={2} fontSize="12px" color="#5A6E65">
                        <Text as="a" href={'mailto:' + b.email} color="#56756D" _hover={{ textDecoration: "underline" }}>
                          {b.email}
                        </Text>
                        {b.phone && (
                          <>
                            <Text color="gray.300">•</Text>
                            <Text as="a" href={'tel:' + b.phone} color="#56756D" _hover={{ textDecoration: "underline" }}>
                              {b.phone}
                            </Text>
                          </>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                  <Badge 
                    bg="rgba(86, 117, 109, 0.12)" 
                    color="#56756D" 
                    fontSize="10.5px" 
                    fontWeight="700" 
                    borderRadius="full" 
                    px={3} 
                    py={0.5}
                  >
                    {b.service_type || "Therapy Intake"}
                  </Badge>
                </Flex>

                <HStack spacing={6} mb={3} p={3} bg="rgba(250, 248, 245, 0.85)" borderRadius="lg" border="1px solid rgba(86, 117, 109, 0.08)">
                  <Box>
                    <Text fontSize="9.5px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">PREFERRED DATE</Text>
                    <Text fontSize="13px" fontWeight="600" color="#263A33">{b.preferred_date || 'Flexible'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="9.5px" color="#718096" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em">PREFERRED TIME</Text>
                    <Text fontSize="13px" fontWeight="600" color="#263A33">{b.preferred_time || 'Anytime'}</Text>
                  </Box>
                </HStack>

                {b.notes && (
                  <Box p={3} borderRadius="lg" bg="white" border="1px dashed rgba(86, 117, 109, 0.2)">
                    <Text fontSize="12.5px" color="#5A6E65">
                      <Text as="span" fontWeight="600" color="#263A33">Notes: </Text>
                      {b.notes}
                    </Text>
                  </Box>
                )}
              </Box>
            ))
          )}
        </VStack>
      )}

      {/* 🔍 APPOINTMENT DETAILS MODAL */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} isCentered size="lg">
        <ModalOverlay bg="rgba(38, 58, 51, 0.4)" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" p={2} border="1px solid rgba(86, 117, 109, 0.14)" bg="white">
          <ModalHeader fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="18px" color="#263A33" pb={1}>
            Session Booking #{selectedBookingDetail?.id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBookingDetail && (
              <VStack align="stretch" spacing={4} pt={2}>
                <SimpleGrid columns={2} spacing={3} p={3.5} bg="rgba(250, 248, 245, 0.85)" borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.1)">
                  <Box>
                    <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase">CLIENT</Text>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33" mt={0.5}>
                      {selectedBookingDetail.client_name || selectedBookingDetail.client_display_name || "Client"}
                    </Text>
                    <Text fontSize="11.5px" color="#5A6E65">{selectedBookingDetail.client_email || "No email"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase">ASSIGNED THERAPIST</Text>
                    <Text fontSize="13.5px" fontWeight="600" color="#263A33" mt={0.5}>
                      {selectedBookingDetail.therapist_name || "Therapist"}
                    </Text>
                    <Text fontSize="11.5px" color="#5A6E65">{selectedBookingDetail.therapist_email || "No email"}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={3} spacing={3}>
                  <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase">SCHEDULED TIME</Text>
                    <Text fontSize="12.5px" fontWeight="600" color="#263A33" mt={0.5}>
                      {selectedBookingDetail.start_time
                        ? new Date(selectedBookingDetail.start_time).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                        : "N/A"}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase">STATUS</Text>
                    <Text fontSize="12.5px" fontWeight="600" color="#263A33" mt={0.5} textTransform="capitalize">
                      {selectedBookingDetail.status_label || selectedBookingDetail.status || "Scheduled"}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase">PAYMENT</Text>
                    <Text fontSize="12.5px" fontWeight="600" color="#263A33" mt={0.5} textTransform="capitalize">
                      {selectedBookingDetail.payment_status || "Pending"}
                    </Text>
                  </Box>
                </SimpleGrid>

                {selectedBookingDetail.meeting_link && (
                  <Box p={3.5} borderRadius="xl" bg="white" border="1px solid rgba(86, 117, 109, 0.16)">
                    <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase">SESSION VIDEO ROOM</Text>
                    <Text fontSize="12px" color="#263A33" fontFamily="monospace" mt={1} wordBreak="break-all">
                      {selectedBookingDetail.meeting_link}
                    </Text>
                  </Box>
                )}

                {selectedBookingDetail.cancellation_reason && (
                  <Box p={3.5} borderRadius="xl" bg="#FEF2F2" border="1px solid rgba(239, 68, 68, 0.3)">
                    <Text fontSize="10.5px" fontWeight="700" color="#DC2626" textTransform="uppercase">CANCELLATION REASON</Text>
                    <Text fontSize="12.5px" color="#991B1B" mt={0.5}>
                      {selectedBookingDetail.cancellation_reason}
                    </Text>
                  </Box>
                )}

                {selectedBookingDetail.notes && (
                  <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                    <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase">CLINICAL NOTES</Text>
                    <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                      {selectedBookingDetail.notes}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter pt={4}>
            <HStack spacing={3}>
              <Button
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                height="36px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              {selectedBookingDetail?.meeting_link && selectedBookingDetail.status !== "cancelled" && (
                <Button
                  bg="#263A33"
                  color="white"
                  borderRadius="full"
                  height="36px"
                  fontSize="12.5px"
                  fontWeight="600"
                  px={4}
                  leftIcon={<Icon as={FiVideo} color="#A9CBB7" boxSize="12px" />}
                  _hover={{ bg: "#182722" }}
                  onClick={() => window.open(selectedBookingDetail.meeting_link, "_blank")}
                >
                  Launch Room
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
})()}

{activeTab === "support_tickets" && (
  <Box 
    bg="white" 
    p={6} 
    borderRadius="2xl" 
    border="1px solid rgba(86, 117, 109, 0.14)" 
    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
  >
    <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
      <VStack align="start" spacing={0.5}>
        <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
          Support Tickets
        </Heading>
        <Text fontSize="13px" color="#5A6E65">
          User & practitioner platform help tickets and escalation resolutions
        </Text>
      </VStack>
      <Badge 
        bg={openTicketsCount > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)"} 
        color={openTicketsCount > 0 ? "#DC2626" : "#059669"} 
        fontSize="11px" 
        fontWeight="700" 
        borderRadius="full" 
        px={2.5} 
        py={0.5}
      >
        {openTicketsCount} Unresolved
      </Badge>
    </HStack>

    {supportTickets.length === 0 ? (
      <VStack py={12} spacing={3} textAlign="center">
        <Circle size="48px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
          <Icon as={FiCheckCircle} boxSize="22px" />
        </Circle>
        <Text fontSize="14px" fontWeight="600" color="#263A33">No tickets submitted</Text>
        <Text fontSize="12.5px" color="#5A6E65">Support tickets from therapists and clients will be listed here.</Text>
      </VStack>
    ) : (
      <VStack align="stretch" spacing={5}>
        {supportTickets.map(ticket => {
          const isResolved = ticket.status === 'resolved';
          return (
            <Box 
              key={ticket.id} 
              p={5} 
              border="1px solid" 
              borderColor={isResolved ? "rgba(16, 185, 129, 0.2)" : "rgba(86, 117, 109, 0.14)"} 
              borderRadius="xl"
              bg={isResolved ? "rgba(236, 253, 245, 0.5)" : "white"}
              boxShadow="0 2px 8px -2px rgba(38, 58, 51, 0.03)"
            >
              <Flex justify="space-between" align="start" mb={3} flexWrap="wrap" gap={2}>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Badge 
                      bg={ticket.user_role === 'therapist' ? "rgba(99, 102, 241, 0.12)" : "rgba(49, 130, 206, 0.12)"} 
                      color={ticket.user_role === 'therapist' ? "#4F46E5" : "#3182CE"}
                      fontSize="10px"
                      fontWeight="700"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                    >
                      {ticket.user_role ? ticket.user_role.toUpperCase() : "CLIENT"}
                    </Badge>
                    <Badge 
                      bg={isResolved ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"} 
                      color={isResolved ? "#059669" : "#D97706"}
                      fontSize="10px"
                      fontWeight="700"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                    >
                      {ticket.status ? ticket.status.toUpperCase() : "OPEN"}
                    </Badge>
                    {ticket.category && (
                      <Tag size="sm" variant="subtle" bg="rgba(86, 117, 109, 0.1)" color="#263A33" fontSize="10.5px">
                        {ticket.category}
                      </Tag>
                    )}
                  </HStack>
                  <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                    {ticket.subject}
                  </Heading>
                  <Text fontSize="12px" color="#5A6E65">
                    From: <Text as="span" fontWeight="600" color="#263A33">{ticket.user_name || "User"}</Text> ({ticket.user_email}) • {new Date(ticket.created_at).toLocaleString()}
                  </Text>
                </VStack>
              </Flex>
              
              <Box bg="rgba(250, 248, 245, 0.85)" p={3.5} borderRadius="lg" border="1px solid rgba(86, 117, 109, 0.08)" mb={3.5}>
                <Text fontSize="13px" color="#263A33" whiteSpace="pre-wrap" lineHeight="1.5">{ticket.description}</Text>
              </Box>

              {!isResolved ? (
                <VStack align="stretch" spacing={3} borderTop="1px solid rgba(86, 117, 109, 0.12)" pt={3.5}>
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#263A33">Admin Resolution Notes</FormLabel>
                    <Textarea 
                      placeholder="Detail how this issue was addressed or resolved..." 
                      size="sm" 
                      id={'resolve-notes-' + ticket.id}
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      bg="white"
                      fontSize="13px"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                    />
                  </FormControl>
                  <HStack justify="flex-end">
                    <Button 
                      size="sm" 
                      bg="#059669" 
                      color="white" 
                      borderRadius="full"
                      fontSize="12.5px"
                      fontWeight="600"
                      px={4}
                      _hover={{ bg: "#047857" }}
                      onClick={() => {
                        const notes = document.getElementById('resolve-notes-' + ticket.id)?.value;
                        resolveTicket(ticket.id, notes);
                      }}
                    >
                      Mark as Resolved
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Box borderTop="1px dashed" borderColor="rgba(16, 185, 129, 0.3)" pt={3}>
                  <Text fontSize="10px" fontWeight="700" color="#059669" textTransform="uppercase" letterSpacing="0.08em">RESOLUTION NOTES</Text>
                  <Text fontSize="12.5px" color="#263A33" mt={0.5}>{ticket.admin_notes || 'Resolved without extra notes.'}</Text>
                  {ticket.resolved_at && (
                    <Text fontSize="11px" color="#718096" mt={1}>Resolved at: {new Date(ticket.resolved_at).toLocaleString()}</Text>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>
    )}
  </Box>
)}
{activeTab === "services_list" && (
           <VStack align="stretch" spacing={6}>
              <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <Heading fontSize="16px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em" mb={5}>
                  {editingServiceId ? "Edit Clinical Service Card" : "Add Clinical Service Card"}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                   <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Service Title</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.title} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Subtitle / Tagline</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.subtitle} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, subtitle: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Illustration / Image URL</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.image_url} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, image_url: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">CTA Button Label</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.cta_label} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, cta_label: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">CTA Target Link</FormLabel>
                    <Input 
                      h="38px"
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.cta_link} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, cta_link: e.target.value })} 
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Sort Order</FormLabel>
                    <Input 
                      h="38px"
                      type="number" 
                      borderRadius="xl"
                      borderColor="rgba(86, 117, 109, 0.2)"
                      fontSize="13px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                      value={serviceDraft.sort_order} 
                      onChange={(e) => setServiceDraft({ ...serviceDraft, sort_order: parseInt(e.target.value) || 0 })} 
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">Service Description</FormLabel>
                  <RichTextEditor value={serviceDraft.description} onChange={(val) => setServiceDraft({ ...serviceDraft, description: val })} />
                </FormControl>
                <HStack mt={6} spacing={3}>
                   <Button 
                     bg="#56756D" 
                     color="white" 
                     borderRadius="full"
                     h="38px"
                     px={5}
                     fontSize="13px"
                     fontWeight="600"
                     fontFamily="'Inter', var(--font-inter), sans-serif"
                     _hover={{ bg: "#263A33" }}
                     boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                     onClick={async () => {
                      try {
                        if (editingServiceId) {
                          await apiPut(`services/${editingServiceId}/`, serviceDraft);
                          toast({ status: "success", title: "Service updated" });
                        } else {
                          await apiPost("services/", serviceDraft);
                          toast({ status: "success", title: "Service added" });
                        }
                        setServiceDraft(emptyService);
                        setEditingServiceId(null);
                        fetchServices();
                      } catch { toast({ status: "error", title: "Action failed" }); }
                   }}>
                      {editingServiceId ? "Update Service" : "Save Service"}
                   </Button>
                   {editingServiceId && (
                     <Button 
                       variant="outline" 
                       borderRadius="full"
                       borderColor="rgba(86, 117, 109, 0.25)"
                       color="#263A33"
                       h="38px"
                       px={4}
                       fontSize="12.5px"
                       fontWeight="600"
                       fontFamily="'Inter', var(--font-inter), sans-serif"
                       onClick={() => { setEditingServiceId(null); setServiceDraft(emptyService); }}
                     >
                       Cancel
                     </Button>
                   )}
                </HStack>
              </Box>

              <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                  <VStack align="start" spacing={0.5}>
                    <Heading fontSize="16px" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
                      Current Clinical Services
                    </Heading>
                    <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', var(--font-inter), sans-serif">
                      Service offerings displayed across the public care navigation
                    </Text>
                  </VStack>
                  <Badge bg="rgba(86, 117, 109, 0.12)" color="#56756D" fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" borderRadius="full" px={2.5} py={0.5} fontFamily="'Inter', var(--font-inter), sans-serif">
                    {services.length} Services
                  </Badge>
                </HStack>

                {services.length === 0 ? (
                  <Box p={8} textAlign="center" borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px dashed rgba(86, 117, 109, 0.2)">
                    <Text fontSize="13px" color="#5A6E65">No clinical services registered yet.</Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {services.map(s => (
                      <HStack 
                        key={s.id} 
                        p={3.5} 
                        border="1px solid rgba(86, 117, 109, 0.12)" 
                        borderRadius="xl" 
                        bg="rgba(250, 248, 245, 0.85)"
                        justify="space-between"
                        align="center"
                      >
                         <VStack align="flex-start" spacing={0.5}>
                            <Text fontWeight="600" fontSize="13.5px" color="#263A33">{s.title}</Text>
                            <Text fontSize="12px" color="#5A6E65">{s.subtitle}</Text>
                         </VStack>
                         <HStack>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              borderRadius="full"
                              borderColor="rgba(86, 117, 109, 0.25)"
                              color="#263A33"
                              fontSize="12px"
                              fontWeight="600"
                              h="32px"
                              px={3.5}
                              _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                              onClick={() => { setEditingServiceId(s.id); setServiceDraft(s); }}
                            >
                              Edit
                            </Button>
                         </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
           </VStack>
        )}

        {/* WEBSITE CONTENT EDITORS */}
        {activeTab === "home" && (
           <HomeEditor 
             homeDraft={homeDraft} 
             setHomeDraft={setHomeDraft} 
             homeId={homeId} 
             apiPut={apiPut} 
             apiPost={apiPost} 
             setHomeId={setHomeId} 
             toast={toast} 
             fetchHomeContent={fetchHomeContent} 
             RichTextEditor={RichTextEditor} 
           />
        )}

        {activeTab === "about" && (
           <AboutEditor 
              aboutDraft={aboutDraft} 
              setAboutDraft={setAboutDraft} 
              aboutId={aboutId} 
              apiPut={apiPut} 
              apiPost={apiPost} 
              toast={toast} 
              fetchAboutContent={fetchAboutContent} 
              RichTextEditor={RichTextEditor} 
           />
        )}

        {activeTab === "contact" && (
           <ContactEditor 
              contactDraft={contactDraft} 
              setContactDraft={setContactDraft} 
              contactId={contactId} 
              apiPut={apiPut} 
              apiPost={apiPost} 
              toast={toast} 
              fetchContactContent={fetchContactContent} 
              RichTextEditor={RichTextEditor} 
           />
        )}

        {activeTab === "other_pages" && (
           <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
              <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={1}>Global Page Static Content</Heading>
              <Text fontSize="13px" color="#5A6E65" mb={6}>Select a core destination page to configure its static copy, hero banners, and metadata:</Text>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                 {["therapists", "services_content", "training", "careers", "therapist_apply"].map(p => (
                   <Button 
                     key={p} 
                     variant="outline" 
                     borderRadius="xl"
                     p={4}
                     h="auto"
                     border="1px solid rgba(86, 117, 109, 0.18)"
                     bg="rgba(250, 248, 245, 0.85)"
                     color="#263A33"
                     fontSize="13px"
                     fontWeight="600"
                     _hover={{ bg: "white", borderColor: "#56756D", transform: "translateY(-1px)", boxShadow: "0 2px 8px rgba(86, 117, 109, 0.1)" }}
                     onClick={() => setActiveTab(p)}
                   >
                      {p.charAt(0).toUpperCase() + p.slice(1).replace("_", " ")}
                   </Button>
                 ))}
              </SimpleGrid>
           </Box>
        )}

        {/* SUB PAGES PLACEHOLDERS */}
        {activeTab === "video_test" && (
           <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
              <VStack align="stretch" spacing={6}>
                 <Box>
                    <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={1}>Video Infrastructure Test Lab</Heading>
                    <Text fontSize="13px" color="#5A6E65">Verify the MLC Live Session environment and test your camera/mic hardware.</Text>
                 </Box>

                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <Box p={5} bg="rgba(236, 253, 245, 0.6)" borderRadius="xl" border="1px solid rgba(16, 185, 129, 0.3)">
                       <VStack align="start" spacing={3}>
                          <HStack>
                             <Circle size="30px" bg="rgba(16, 185, 129, 0.15)" color="#059669">
                               <Icon as={Video} boxSize="15px" />
                             </Circle>
                             <Text fontWeight="700" fontSize="13px" color="#059669">SDK Status: Operational</Text>
                          </HStack>
                          <Text fontSize="12.5px" color="#263A33" lineHeight="1.5">The MLC WebRTC clinical video engine is initialized and ready for encrypted tele-health streams.</Text>
                       </VStack>
                    </Box>

                    <Box p={5} bg="#263A33" borderRadius="xl" color="white">
                       <VStack align="start" spacing={2.5}>
                          <Text fontWeight="700" fontSize="10.5px" color="rgba(255, 255, 255, 0.7)" letterSpacing="0.08em" textTransform="uppercase">READY TO COMMENCE</Text>
                          <Heading size="sm" color="white" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">Launch Test Lounge</Heading>
                          <Text fontSize="12px" color="rgba(255, 255, 255, 0.8)">Opens the isolated clinical lounge used by patients and therapists.</Text>
                          <Button 
                            bg="#56756D" 
                            color="white" 
                            size="sm" 
                            borderRadius="full"
                            fontSize="12px"
                            fontWeight="600"
                            h="34px"
                            px={4}
                            mt={1}
                            onClick={() => window.open("/conference/MLC-Secure-Test-Lounge", "_blank")}
                            _hover={{ bg: '#3D564F' }}
                          >
                            Launch Live Test Room
                          </Button>
                       </VStack>
                    </Box>
                 </SimpleGrid>

                 <Box p={4} border="1px dashed rgba(86, 117, 109, 0.25)" borderRadius="xl" bg="rgba(250, 248, 245, 0.5)">
                    <Text fontSize="10.5px" fontWeight="700" color="#718096" mb={2} textTransform="uppercase" letterSpacing="0.08em">TEST PROTOCOL</Text>
                    <VStack align="start" spacing={1.5}>
                       <Text fontSize="12.5px" color="#5A6E65">&bull; Verify that the MLC-branded control bar appears.</Text>
                       <Text fontSize="12.5px" color="#5A6E65">&bull; Confirm the &ldquo;Secure Clinical Messaging&rdquo; badge is visible.</Text>
                       <Text fontSize="12.5px" color="#5A6E65">&bull; Test &ldquo;End Session&rdquo; redirects back to the dashboard.</Text>
                    </VStack>
                 </Box>
              </VStack>
           </Box>
        )}

        {(activeTab === "training" || activeTab === "careers" || activeTab === "therapists" || activeTab === "services_content" || activeTab === "therapist_apply") && (
           <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
              <HStack mb={5} justify="space-between" flexWrap="wrap" gap={3}>
                <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">{activeTab.toUpperCase()} Page Editor</Heading>
                <Button 
                  size="sm" 
                  variant="outline" 
                  borderRadius="full" 
                  borderColor="rgba(86, 117, 109, 0.25)" 
                  color="#263A33"
                  fontSize="12px"
                  fontWeight="600"
                  onClick={() => setActiveTab("other_pages")}
                >
                  Back to Pages
                </Button>
              </HStack>
              <Text fontSize="13px" color="#5A6E65">Configuring content sections for the {activeTab.replace("_", " ")} page.</Text>
              <Button 
                mt={5} 
                bg="#56756D" 
                color="white" 
                borderRadius="full"
                h="36px"
                px={5}
                fontSize="12.5px"
                fontWeight="600"
                _hover={{ bg: "#263A33" }}
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                onClick={() => toast({ title: "Content saved successfully.", status: "success" })}
              >
                Save {activeTab.replace("_", " ")} Changes
              </Button>
           </Box>
        )}

      {/* 🌿 UNPUBLISH CONFIRMATION MODAL */}
      <Modal 
        isOpen={!!unpublishTarget} 
        onClose={() => !unpublishing && setUnpublishTarget(null)} 
        isCentered
        size="md"
      >
        <ModalOverlay bg="rgba(38, 58, 51, 0.45)" backdropFilter="blur(6px)" />
        <ModalContent 
          borderRadius="2xl" 
          border="1px solid rgba(86, 117, 109, 0.2)" 
          boxShadow="0 20px 40px -8px rgba(38, 58, 51, 0.25)"
          p={1}
          bg="white"
        >
          <ModalHeader 
            fontSize="17px" 
            fontWeight="600" 
            color="#263A33" 
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            pb={2}
          >
            Unpublish Clinician
          </ModalHeader>
          <ModalCloseButton isDisabled={unpublishing} />
          
          <ModalBody py={2}>
            {unpublishTarget && (
              <VStack align="stretch" spacing={3.5}>
                <HStack 
                  p={3.5} 
                  borderRadius="xl" 
                  bg="rgba(250, 248, 245, 0.85)" 
                  border="1px solid rgba(86, 117, 109, 0.12)"
                  spacing={3.5}
                >
                  <Avatar size="md" name={unpublishTarget.name || unpublishTarget.email} src={unpublishTarget.photo_url} />
                  <VStack align="start" spacing={0.5}>
                    <Text fontWeight="600" fontSize="14px" color="#263A33" fontFamily="'Outfit', sans-serif">
                      {unpublishTarget.name}
                    </Text>
                    <Text fontSize="12px" color="#5A6E65">
                      {unpublishTarget.email} • ID: {unpublishTarget.id}
                    </Text>
                    <Text fontSize="11.5px" color="#718096">
                      {unpublishTarget.title || unpublishTarget.highest_qualification || "Licensed Clinician"}
                    </Text>
                  </VStack>
                </HStack>

                <Box p={3.5} borderRadius="xl" bg="#FEF2F2" border="1px solid rgba(239, 68, 68, 0.25)">
                  <HStack align="flex-start" spacing={2.5}>
                    <Icon as={FiAlertCircle} color="#DC2626" boxSize="16px" mt={0.5} flexShrink={0} />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="12.5px" fontWeight="600" color="#991B1B">
                        Directory Visibility Notice
                      </Text>
                      <Text fontSize="12px" color="#B91C1C" lineHeight="1.4">
                        This clinician will be immediately removed from the live public search directory. Clients will no longer be able to discover or book new sessions with them until re-verified.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter pt={4} pb={3}>
            <HStack spacing={2.5}>
              <Button 
                variant="outline" 
                borderRadius="full" 
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#5A6E65"
                size="sm"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                isDisabled={unpublishing}
                onClick={() => setUnpublishTarget(null)}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                borderRadius="full" 
                size="sm"
                fontSize="12.5px"
                fontWeight="600"
                px={5}
                isLoading={unpublishing}
                loadingText="Unpublishing..."
                onClick={handleConfirmUnpublish}
              >
                Confirm Unpublish
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 🌿 CLINICIAN DETAILS POPUP MODAL */}
      <Modal 
        isOpen={!!selectedClinician} 
        onClose={() => setSelectedClinician(null)} 
        isCentered
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="rgba(38, 58, 51, 0.45)" backdropFilter="blur(8px)" />
        <ModalContent 
          borderRadius="2xl" 
          border="1px solid rgba(86, 117, 109, 0.2)" 
          boxShadow="0 24px 48px -12px rgba(38, 58, 51, 0.25)"
          overflow="hidden"
          bg="white"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          {selectedClinician && (() => {
            const isPublished = selectedClinician.is_verified || selectedClinician.profile_status === "approved";
            const specs = Array.isArray(selectedClinician.specializations) 
              ? selectedClinician.specializations 
              : Array.isArray(selectedClinician.specialties) 
              ? selectedClinician.specialties 
              : [];
            const mods = Array.isArray(selectedClinician.modalities) ? selectedClinician.modalities : [];
            const concernsList = Array.isArray(selectedClinician.concerns) ? selectedClinician.concerns : [];
            const langs = Array.isArray(selectedClinician.languages) ? selectedClinician.languages : ["English"];

            return (
              <>
                <ModalHeader 
                  bg="rgba(250, 248, 245, 0.9)" 
                  borderBottom="1px solid rgba(86, 117, 109, 0.12)" 
                  py={4} 
                  px={6}
                >
                  <HStack spacing={4} align="center">
                    <Box position="relative" flexShrink={0}>
                      <Avatar 
                        size="lg" 
                        name={selectedClinician.name || selectedClinician.email} 
                        src={selectedClinician.photo_url || selectedClinician.profile_image_url} 
                        border="2px solid white"
                        boxShadow="0 2px 8px rgba(38, 58, 51, 0.1)"
                      />
                      <Circle 
                        size="13px" 
                        bg={isPublished ? "#10B981" : "#F59E0B"} 
                        border="2px solid white" 
                        position="absolute" 
                        bottom="0" 
                        right="0" 
                      />
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2} wrap="wrap">
                        <Heading 
                          fontSize="18px" 
                          fontWeight="600" 
                          color="#263A33" 
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        >
                          {selectedClinician.name}
                        </Heading>
                        <Badge 
                          bg={isPublished ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"} 
                          color={isPublished ? "#059669" : "#D97706"} 
                          fontSize="10px" 
                          fontWeight="700" 
                          borderRadius="full" 
                          px={2.5} 
                          py={0.5}
                        >
                          {isPublished ? "PUBLISHED LIVE" : "PENDING DIRECT VERIFICATION"}
                        </Badge>
                        {selectedClinician.is_supervisor && (
                          <Badge bg="rgba(99, 102, 241, 0.12)" color="#4F46E5" fontSize="10px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                            SUPERVISOR
                          </Badge>
                        )}
                        {selectedClinician.is_queer_affirmative && (
                          <Badge bg="rgba(16, 185, 129, 0.08)" color="#047857" fontSize="10px" fontWeight="700" borderRadius="full" px={2} py={0.5}>
                            QUEER AFFIRMATIVE 🌈
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="13px" color="#5A6E65">
                        {selectedClinician.title || selectedClinician.highest_qualification || "Licensed Clinician"}
                      </Text>
                    </VStack>
                  </HStack>
                </ModalHeader>
                <ModalCloseButton top={4} right={4} borderRadius="full" />

                <ModalBody py={5} px={6}>
                  <VStack align="stretch" spacing={5}>
                    {/* Key Metrics Grid */}
                    <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
                      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                        <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">HOURLY RATE</Text>
                        <Text fontSize="14px" fontWeight="700" color="#263A33" mt={0.5}>
                          {selectedClinician.hourly_rate != null ? `₹${selectedClinician.hourly_rate}/hr` : "Not specified"}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                        <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">EXPERIENCE</Text>
                        <Text fontSize="14px" fontWeight="700" color="#263A33" mt={0.5}>
                          {selectedClinician.years_experience != null && selectedClinician.years_experience !== "" ? `${selectedClinician.years_experience}+ Years` : "Not specified"}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                        <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">DURATION</Text>
                        <Text fontSize="14px" fontWeight="700" color="#263A33" mt={0.5}>
                          {selectedClinician.session_duration ? `${selectedClinician.session_duration} mins` : "50 mins (standard)"}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                        <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em">LOCATION</Text>
                        <Text fontSize="13px" fontWeight="600" color="#263A33" mt={0.5} noOfLines={1}>
                          {[selectedClinician.city, selectedClinician.state].filter(Boolean).join(", ") || "Pan-India / Remote"}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* Contact & Platform Metadata */}
                    <Box p={4} borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.12)">
                      <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                        Contact & Account Information
                      </Text>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5}>
                        <HStack spacing={2}>
                          <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Email:</Text>
                          <Text fontSize="12.5px" color="#263A33" fontWeight="500">{selectedClinician.email}</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Phone:</Text>
                          <Text fontSize="12.5px" color="#263A33" fontWeight="500">{selectedClinician.phone || "Not specified"}</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Clinician ID:</Text>
                          <Text fontSize="12.5px" color="#263A33" fontWeight="500">#{selectedClinician.id}</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Public Slug:</Text>
                          <Text fontSize="12.5px" color="#263A33" fontWeight="500">{selectedClinician.slug || selectedClinician.id}</Text>
                        </HStack>
                        {selectedClinician.gender && (
                          <HStack spacing={2}>
                            <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Gender:</Text>
                            <Text fontSize="12.5px" color="#263A33" fontWeight="500">{selectedClinician.gender}</Text>
                          </HStack>
                        )}
                        {selectedClinician.affiliations && (
                          <HStack spacing={2}>
                            <Text fontSize="12px" color="#718096" fontWeight="600" w="70px">Affiliation:</Text>
                            <Text fontSize="12.5px" color="#263A33" fontWeight="500">{selectedClinician.affiliations}</Text>
                          </HStack>
                        )}
                      </SimpleGrid>
                    </Box>

                    {/* Clinical Bio / About */}
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={1.5}>
                        CLINICAL BIO & SUMMARY
                      </Text>
                      <Text fontSize="13px" color="#263A33" lineHeight="1.6" bg="rgba(250, 248, 245, 0.5)" p={3.5} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.08)">
                        {selectedClinician.bio || "No clinical bio has been provided by this clinician yet."}
                      </Text>
                    </Box>

                    {/* Specializations & Modalities */}
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                        SPECIALIZATIONS & CLINICAL FOCUS
                      </Text>
                      {specs.length > 0 ? (
                        <Wrap spacing={1.5}>
                          {specs.map((s, idx) => (
                            <Badge key={idx} px={2.5} py={1} borderRadius="md" bg="rgba(86, 117, 109, 0.08)" color="#263A33" fontSize="11px" fontWeight="500">
                              {typeof s === 'object' ? (s.name || JSON.stringify(s)) : String(s)}
                            </Badge>
                          ))}
                        </Wrap>
                      ) : (
                        <Text fontSize="12.5px" color="#718096">No specializations specified.</Text>
                      )}
                    </Box>

                    {mods.length > 0 && (
                      <Box>
                        <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                          THERAPEUTIC MODALITIES
                        </Text>
                        <Wrap spacing={1.5}>
                          {mods.map((m, idx) => (
                            <Badge key={idx} px={2.5} py={1} borderRadius="md" bg="rgba(79, 70, 229, 0.08)" color="#4F46E5" fontSize="11px" fontWeight="500">
                              {typeof m === 'object' ? (m.name || JSON.stringify(m)) : String(m)}
                            </Badge>
                          ))}
                        </Wrap>
                      </Box>
                    )}

                    {concernsList.length > 0 && (
                      <Box>
                        <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                          AREAS & CONCERNS
                        </Text>
                        <Wrap spacing={1.5}>
                          {concernsList.map((c, idx) => (
                            <Badge key={idx} px={2.5} py={1} borderRadius="md" bg="rgba(214, 158, 46, 0.1)" color="#B45309" fontSize="11px" fontWeight="500">
                              {typeof c === 'object' ? (c.name || JSON.stringify(c)) : String(c)}
                            </Badge>
                          ))}
                        </Wrap>
                      </Box>
                    )}

                    {/* Languages */}
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
                        SPOKEN LANGUAGES
                      </Text>
                      <Wrap spacing={1.5}>
                        {langs.map((l, idx) => (
                          <Badge key={idx} px={2.5} py={1} borderRadius="md" bg="white" border="1px solid rgba(86, 117, 109, 0.2)" color="#263A33" fontSize="11px" fontWeight="500">
                            {typeof l === 'object' ? (l.name || JSON.stringify(l)) : String(l)}
                          </Badge>
                        ))}
                      </Wrap>
                    </Box>

                    {/* Proof Documents & External Links */}
                    {(selectedClinician.highest_qualification_proof || selectedClinician.resume_file || selectedClinician.linkedin_url) && (
                      <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.12)">
                        <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={2.5}>
                          Credentials & Documents
                        </Text>
                        <HStack spacing={2.5} wrap="wrap">
                          {selectedClinician.highest_qualification_proof && (
                            <Button 
                              as="a" 
                              href={selectedClinician.highest_qualification_proof} 
                              target="_blank" 
                              size="xs" 
                              variant="outline" 
                              borderRadius="full"
                              borderColor="rgba(86, 117, 109, 0.25)"
                              rightIcon={<Icon as={FiExternalLink} boxSize="10px" />}
                            >
                              Degree / Qualification Proof
                            </Button>
                          )}
                          {selectedClinician.resume_file && (
                            <Button 
                              as="a" 
                              href={selectedClinician.resume_file} 
                              target="_blank" 
                              size="xs" 
                              variant="outline" 
                              borderRadius="full"
                              borderColor="rgba(86, 117, 109, 0.25)"
                              rightIcon={<Icon as={FiExternalLink} boxSize="10px" />}
                            >
                              Resume / CV
                            </Button>
                          )}
                          {selectedClinician.linkedin_url && (
                            <Button 
                              as="a" 
                              href={selectedClinician.linkedin_url} 
                              target="_blank" 
                              size="xs" 
                              variant="outline" 
                              borderRadius="full"
                              borderColor="rgba(86, 117, 109, 0.25)"
                              rightIcon={<Icon as={FiExternalLink} boxSize="10px" />}
                            >
                              LinkedIn Profile
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </ModalBody>

                <ModalFooter 
                  bg="rgba(250, 248, 245, 0.75)" 
                  borderTop="1px solid rgba(86, 117, 109, 0.14)" 
                  py={4} 
                  px={6} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  w="full"
                >
                  {/* Left Side: Primary Action */}
                  <Box>
                    {isPublished ? (
                      <Button
                        as="a"
                        href={'/therapists/' + (selectedClinician.slug || selectedClinician.id)}
                        target="_blank"
                        h="38px"
                        bg="#56756D"
                        color="white"
                        borderRadius="full"
                        fontSize="13px"
                        fontWeight="600"
                        px={5}
                        rightIcon={<Icon as={FiExternalLink} boxSize="12px" />}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                        _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                        whiteSpace="nowrap"
                      >
                        View Live Profile
                      </Button>
                    ) : (
                      <Button
                        h="38px"
                        bg="#56756D"
                        color="white"
                        borderRadius="full"
                        fontSize="13px"
                        fontWeight="600"
                        px={5}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                        _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                        onClick={() => {
                          handleVerifyTherapist(selectedClinician.id, selectedClinician.name);
                          setSelectedClinician(null);
                        }}
                        whiteSpace="nowrap"
                      >
                        Verify & Publish Live
                      </Button>
                    )}
                  </Box>

                  {/* Right Side: Secondary Actions with generous breathing room */}
                  <HStack spacing={3}>
                    {isPublished && (
                      <Button
                        h="38px"
                        variant="outline"
                        borderColor="rgba(239, 68, 68, 0.35)"
                        color="#DC2626"
                        borderRadius="full"
                        fontSize="13px"
                        fontWeight="600"
                        px={4.5}
                        leftIcon={<Icon as={FiEyeOff} boxSize="13px" />}
                        _hover={{ bg: "#FEF2F2", borderColor: "#DC2626" }}
                        whiteSpace="nowrap"
                        onClick={() => {
                          setUnpublishTarget(selectedClinician);
                          setSelectedClinician(null);
                        }}
                      >
                        Unpublish
                      </Button>
                    )}
                    <Button 
                      h="38px"
                      variant="outline" 
                      borderRadius="full" 
                      borderColor="rgba(86, 117, 109, 0.28)"
                      color="#263A33"
                      fontSize="13px"
                      fontWeight="600"
                      px={5}
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                      whiteSpace="nowrap"
                      onClick={() => setSelectedClinician(null)}
                    >
                      Close
                    </Button>
                  </HStack>
                </ModalFooter>
              </>
            );
          })()}
        </ModalContent>
      </Modal>
    </Box>
  );
}
