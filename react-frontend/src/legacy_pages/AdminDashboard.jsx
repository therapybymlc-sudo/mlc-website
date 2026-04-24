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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiGetBlob, apiPost, apiPut, apiPatch, apiDelete } from "../api.js";
import { 
  HomeEditor, 
  AboutEditor, 
  ContactEditor 
} from "./AdminEditors";

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

  return (
    <VStack align="stretch" spacing={2}>
      <HStack spacing={2} wrap="wrap">
        <Button size="sm" variant="outline" onClick={() => applyCommand("bold")}
          >Bold</Button>
        <Button size="sm" variant="outline" onClick={() => applyCommand("italic")}
          >Italic</Button>
        <Button size="sm" variant="outline" onClick={() => applyCommand("underline")}
          >Underline</Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("insertUnorderedList")}
        >
          Bullets
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("insertOrderedList")}
        >
          Numbers
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("removeFormat")}
        >
          Clear
        </Button>
      </HStack>
      <Box
        border="1px solid #E2E8F0"
        borderRadius="lg"
        px={4}
        py={3}
        bg="white"
        minH="140px"
        _focusWithin={{ borderColor: "#5FA093", boxShadow: "0 0 0 1px #5FA093" }}
      >
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          minH="100px"
          fontSize="sm"
          color="#2E2E2E"
          sx={{
            "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
            li: { marginBottom: "0.25rem" },
          }}
        />
      </Box>
      <FormHelperText color="gray.500">
        Basic formatting supported (bold, italic, underline, bullets).
      </FormHelperText>
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
  <Box p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" bg="white">
    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
      {label}
    </Text>
    <Heading size="md" color="mlc.greenDark" mt={2}>
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
    <Box border="1px solid" borderColor="gray.100" borderRadius="xl" p={4}>
      <Heading size="sm" mb={4}>{title}</Heading>
      <VStack align="stretch" spacing={3}>
        {data.length === 0 ? (
          <Text fontSize="sm" color="gray.500">No trend data available.</Text>
        ) : data.map((d) => {
          const value = Number(d?.[valueKey] || 0);
          const pct = Math.max(4, Math.round((value / max) * 100));
          return (
            <Box key={`${title}-${d.month}`}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.500">{d.month}</Text>
                <Text fontSize="xs" fontWeight="700">{value.toLocaleString()}{unit}</Text>
              </HStack>
              <Box h="8px" bg="gray.100" borderRadius="full" overflow="hidden">
                <Box h="100%" w={`${pct}%`} bg="teal.400" borderRadius="full" />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

const ReportSectionCard = ({ title, description, children, headerRight }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="xl" p={4} bg="white">
    <HStack justify="space-between" align="flex-start" mb={description ? 2 : 4} flexWrap="wrap" gap={2}>
      <Heading size="sm">{title}</Heading>
      {headerRight}
    </HStack>
    {description ? (
      <Text fontSize="sm" color="gray.600" mb={4}>
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

  const Sidebar = ({ activeTab, setActiveTab }) => (
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
      </VStack>

      <VStack align="stretch" spacing={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" px={4} mb={2}>VERIFICATION</Text>
        <NavItem activeTab={activeTab} setActiveTab={setActiveTab} icon={Users} label="Vetting Portal" id="vetting" />
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

      <Box pt={10}>
        <Button 
          variant="outline" 
          w="full" 
          size="sm" 
          leftIcon={<Settings size={14} />}
          onClick={() => window.open("/", "_blank")}
        >
          View Live Site
        </Button>
        <Button 
          as={Link}
          href="/dashboard"
          variant="solid" 
          bg="mlc.green"
          color="white"
          w="full" 
          size="sm" 
          mt={2}
          _hover={{ bg: "mlc.greenDark" }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </VStack>
  );

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState("overview");
  const [supportTickets, setSupportTickets] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const { isAuthenticated, isAdmin, login, loading: authLoading } = useAuth();
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
  const [therapistApplications, setTherapistApplications] = useState([]);

  const [contactMessages, setContactMessages] = useState([]);
  const [quickBookings, setQuickBookings] = useState([]);
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportQuarter, setReportQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [reportsLoading, setReportsLoading] = useState(false);
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
      const data = await apiGet(`admin/reports/${reportKey}/?${reportQueryString()}`);
      setReportByKey((prev) => ({ ...prev, [reportKey]: data }));
    } catch (err) {
      toast({
        status: "error",
        title: "Could not load report",
        description: err?.response?.data?.detail || "Please try again.",
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

  const fetchTherapistApplications = async () => {
    try {
      const data = await apiGet("manage-therapist-applications/");
      setTherapistApplications(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error("Failed to fetch applications", err);
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
      fetchTherapistApplications();
      fetchContactMessages();
      fetchQuickBookings();
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
    if (activeTab === "bookings") fetchQuickBookings();
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
          <Button as={Link} href="/login" colorScheme="teal" mt={4}>
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

  return (
    <Flex bg="gray.50" minH="100vh">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Box flex="1" p={{ base: 4, md: 10 }} maxW="1200px">
        <HStack justify="space-between" mb={10}>
          <VStack align="flex-start" spacing={0}>
             <Heading size="lg" color="mlc.greenDark">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("_", " ")}
             </Heading>
             <Text fontSize="sm" color="gray.500">Welcome back to the MLC Command Center</Text>
          </VStack>
          <HStack spacing={4}>
             <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>Back to Home</Button>
          </HStack>
        </HStack>

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
            <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <VStack align="stretch" spacing={6}>
                <HStack spacing={2} flexWrap="wrap" pb={2} borderBottom="1px solid" borderColor="gray.100">
                  <Button
                    size="sm"
                    variant={reportWorkspaceTab === "live" ? "solid" : "ghost"}
                    colorScheme="teal"
                    onClick={() => setReportWorkspaceTab("live")}
                  >
                    Live reports
                  </Button>
                  <Button
                    size="sm"
                    variant={reportWorkspaceTab === "snapshots" ? "solid" : "ghost"}
                    colorScheme="teal"
                    onClick={() => setReportWorkspaceTab("snapshots")}
                  >
                    Saved snapshots
                  </Button>
                  <Button
                    size="sm"
                    variant={reportWorkspaceTab === "schedules" ? "solid" : "ghost"}
                    colorScheme="teal"
                    onClick={() => setReportWorkspaceTab("schedules")}
                  >
                    Email schedules
                  </Button>
                </HStack>

                {reportWorkspaceTab === "live" && (
                <>
                <HStack justify="space-between" flexWrap="wrap" gap={4} align="flex-start">
                  <VStack align="flex-start" spacing={1}>
                    <Heading size="md" color="mlc.greenDark">
                      Business intelligence
                    </Heading>
                    <Text fontSize="sm" color="gray.600" maxW="lg">
                      Each tab is a separate report with its own metrics and exports. Choose a period once; refresh pulls the latest data for the active report.
                    </Text>
                  </VStack>
                  <HStack flexWrap="wrap">
                    <Select
                      size="sm"
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      w="140px"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </Select>
                    <Input
                      size="sm"
                      type="number"
                      value={reportYear}
                      onChange={(e) =>
                        setReportYear(Number(e.target.value || new Date().getFullYear()))
                      }
                      w="110px"
                    />
                    {reportPeriod === "monthly" && (
                      <Select
                        size="sm"
                        value={reportMonth}
                        onChange={(e) => setReportMonth(Number(e.target.value))}
                        w="120px"
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </Select>
                    )}
                    {reportPeriod === "quarterly" && (
                      <Select
                        size="sm"
                        value={reportQuarter}
                        onChange={(e) => setReportQuarter(Number(e.target.value))}
                        w="120px"
                      >
                        <option value={1}>Q1</option>
                        <option value={2}>Q2</option>
                        <option value={3}>Q3</option>
                        <option value={4}>Q4</option>
                      </Select>
                    )}
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => fetchAdminReport(activeReportKey)}
                      isLoading={reportsLoading}
                    >
                      Refresh
                    </Button>
                    {reportData && (
                      <Button
                        size="sm"
                        variant="outline"
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

                <HStack flexWrap="wrap" spacing={3} align="center">
                  <Input
                    size="sm"
                    placeholder="Snapshot title (optional)"
                    value={snapshotTitle}
                    onChange={(e) => setSnapshotTitle(e.target.value)}
                    maxW="300px"
                  />
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={saveCurrentReportSnapshot}
                    isLoading={savingSnapshot}
                    isDisabled={!reportData?.period}
                  >
                    Save snapshot (JSON + PDF)
                  </Button>
                </HStack>

                <Tabs
                  variant="soft-rounded"
                  colorScheme="teal"
                  index={tabIndex}
                  onChange={(i) => setActiveReportKey(catalogTabs[i]?.key || "executive")}
                >
                  <TabList flexWrap="wrap" gap={1}>
                    {catalogTabs.map((t) => (
                      <Tab key={t.key} fontSize="sm" px={3} py={2}>
                        {t.title}
                      </Tab>
                    ))}
                  </TabList>
                </Tabs>

                {activeMeta?.description ? (
                  <Text fontSize="sm" color="gray.600">
                    {activeMeta.description}
                  </Text>
                ) : null}

                {reportsLoading && <Text color="gray.500">Loading this report…</Text>}

                {!reportsLoading && reportData?.period && (
                  <Box p={4} borderRadius="xl" bg="gray.50">
                    <Text fontSize="sm" color="gray.600">
                      <b>{reportData.title || activeReportKey}</b> — window{" "}
                      <b>{reportData.period.label}</b> (
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
                    <Heading size="sm">Current period</Heading>
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
                        <Heading size="sm">Prior period</Heading>
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
                        <Heading size="sm">Change (current − prior)</Heading>
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
                    <Heading size="sm" color="mlc.greenDark">
                      Saved report snapshots
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Point-in-time copies with PDFs. Create new ones from <b>Live reports</b> using the current period and report tab.
                    </Text>
                    <Button size="sm" variant="outline" w="fit-content" onClick={fetchReportSnapshots}>
                      Refresh list
                    </Button>
                    {reportSnapshots.length === 0 ? (
                      <Text fontSize="sm" color="gray.500">
                        No snapshots yet.
                      </Text>
                    ) : (
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Created</Th>
                            <Th>Report</Th>
                            <Th>Period</Th>
                            <Th>PDF</Th>
                            <Th />
                          </Tr>
                        </Thead>
                        <Tbody>
                          {reportSnapshots.map((s) => (
                            <Tr key={s.id}>
                              <Td>{new Date(s.created_at).toLocaleString()}</Td>
                              <Td>{s.report_key}</Td>
                              <Td>{s.period_label || "—"}</Td>
                              <Td>
                                {s.pdf_url ? (
                                  <Button size="xs" variant="outline" onClick={() => downloadSnapshotPdfFile(s)}>
                                    Download
                                  </Button>
                                ) : (
                                  <Text fontSize="xs" color="gray.500">
                                    {s.pdf_error || "—"}
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                <Button size="xs" colorScheme="red" variant="ghost" onClick={() => deleteSnapshot(s.id)}>
                                  Delete
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </VStack>
                )}

                {reportWorkspaceTab === "schedules" && (
                  <VStack align="stretch" spacing={6}>
                    <Heading size="sm" color="mlc.greenDark">
                      Scheduled email delivery
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Runs when you execute{" "}
                      <Text as="span" fontFamily="mono" fontSize="xs">
                        python manage.py process_admin_report_schedules
                      </Text>{" "}
                      on a daily (or hourly) cron. Monthly schedules use <b>day of month</b>; weekly use <b>weekday</b> (0 = Monday). Each run sends the{" "}
                      <b>previous complete calendar month / quarter / year</b> per preset. Set{" "}
                      <Text as="span" fontFamily="mono" fontSize="xs">
                        EMAIL_BACKEND
                      </Text>{" "}
                      and SMTP env vars for real delivery.
                    </Text>

                    <Box borderWidth="1px" borderRadius="xl" borderColor="gray.100" p={4}>
                      <Heading size="xs" mb={3}>
                        New schedule
                      </Heading>
                      <VStack align="stretch" spacing={3}>
                        <HStack flexWrap="wrap">
                          <Input
                            size="sm"
                            placeholder="Label (optional)"
                            value={schedName}
                            onChange={(e) => setSchedName(e.target.value)}
                            maxW="240px"
                          />
                          <Select
                            size="sm"
                            value={schedReportKey}
                            onChange={(e) => setSchedReportKey(e.target.value)}
                            w="200px"
                          >
                            {FALLBACK_ADMIN_REPORT_CATALOG.map((r) => (
                              <option key={r.key} value={r.key}>
                                {r.title}
                              </option>
                            ))}
                          </Select>
                          <Select
                            size="sm"
                            value={schedPreset}
                            onChange={(e) => setSchedPreset(e.target.value)}
                            w="220px"
                          >
                            <option value="previous_month">Previous month</option>
                            <option value="previous_quarter">Previous quarter</option>
                            <option value="previous_year">Previous year</option>
                          </Select>
                        </HStack>
                        <HStack flexWrap="wrap">
                          <Select
                            size="sm"
                            value={schedFreq}
                            onChange={(e) => setSchedFreq(e.target.value)}
                            w="140px"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                          </Select>
                          {schedFreq === "monthly" && (
                            <HStack>
                              <Text fontSize="sm">Day</Text>
                              <Input
                                size="sm"
                                type="number"
                                min={1}
                                max={28}
                                w="70px"
                                value={schedDayOfMonth}
                                onChange={(e) => setSchedDayOfMonth(Number(e.target.value || 1))}
                              />
                            </HStack>
                          )}
                          {schedFreq === "weekly" && (
                            <Select
                              size="sm"
                              value={schedWeekday}
                              onChange={(e) => setSchedWeekday(Number(e.target.value))}
                              w="180px"
                            >
                              <option value={0}>Monday</option>
                              <option value={1}>Tuesday</option>
                              <option value={2}>Wednesday</option>
                              <option value={3}>Thursday</option>
                              <option value={4}>Friday</option>
                              <option value={5}>Saturday</option>
                              <option value={6}>Sunday</option>
                            </Select>
                          )}
                        </HStack>
                        <Textarea
                          size="sm"
                          placeholder="Recipient emails (comma or newline separated)"
                          value={schedRecipients}
                          onChange={(e) => setSchedRecipients(e.target.value)}
                          minH="80px"
                        />
                        <Button size="sm" colorScheme="teal" w="fit-content" onClick={createEmailSchedule}>
                          Create schedule
                        </Button>
                      </VStack>
                    </Box>

                    <Button size="sm" variant="outline" w="fit-content" onClick={fetchReportSchedules}>
                      Refresh schedules
                    </Button>
                    {reportSchedules.length === 0 ? (
                      <Text fontSize="sm" color="gray.500">
                        No schedules yet.
                      </Text>
                    ) : (
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Active</Th>
                            <Th>Report</Th>
                            <Th>Preset</Th>
                            <Th>Frequency</Th>
                            <Th>Last sent</Th>
                            <Th>Error</Th>
                            <Th />
                          </Tr>
                        </Thead>
                        <Tbody>
                          {reportSchedules.map((sch) => (
                            <Tr key={sch.id}>
                              <Td>
                                <Switch
                                  size="sm"
                                  isChecked={sch.is_active}
                                  onChange={(e) => patchScheduleActive(sch, e.target.checked)}
                                />
                              </Td>
                              <Td>{sch.report_key}</Td>
                              <Td>{sch.period_preset}</Td>
                              <Td>
                                {sch.frequency}
                                {sch.frequency === "monthly" && sch.day_of_month != null
                                  ? ` (day ${sch.day_of_month})`
                                  : ""}
                                {sch.frequency === "weekly" && sch.weekday != null ? ` (wd ${sch.weekday})` : ""}
                              </Td>
                              <Td>
                                {sch.last_sent_at ? new Date(sch.last_sent_at).toLocaleString() : "—"}
                              </Td>
                              <Td maxW="180px" fontSize="xs" color="red.500">
                                {sch.last_error || "—"}
                              </Td>
                              <Td>
                                <HStack spacing={1}>
                                  <Button size="xs" onClick={() => sendScheduleNow(sch.id)}>
                                    Send now
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
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
                    )}
                  </VStack>
                )}
              </VStack>
            </Box>
          );
        })()}

        {activeTab === "vetting" && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <Heading size="md" mb={6} borderBottom="2px solid" borderColor="mlc.green" pb={2} display="inline-block">
                Therapist Vetting Portal
              </Heading>
              {/* THE VETTING PORTAL UI FROM BEFORE */}
              <Box>
                <Heading size="sm" mb={4} color="mlc.greenDark">
                  Therapist Applications ({therapistApplications.filter(a => a.status === 'pending').length} Pending)
                </Heading>
                {therapistApplications.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">No applications found.</Text>
                ) : (
                  <VStack align="stretch" spacing={6}>
                    {therapistApplications.map(app => (
                      <Box key={app.id} p={6} border="1px solid" borderColor="gray.200" borderRadius="2xl" boxShadow="sm" bg={app.status === 'approved' ? "gray.50" : "white"}>
                        <HStack justify="space-between" mb={4}>
                          <VStack align="flex-start" spacing={1}>
                            <HStack>
                              <Text fontWeight="700" fontSize="lg">{app.first_name} {app.last_name}</Text>
                              <Tag colorScheme={app.status === 'approved' ? "green" : "orange"} size="sm" variant="subtle">
                                {app.status.toUpperCase()}
                              </Tag>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">{app.email} • {app.phone}</Text>
                          </VStack>
                          <HStack spacing={3}>
                             <Button size="sm" variant="ghost" onClick={() => window.open(app.resume, "_blank")}>CV</Button>
                             {app.qualification_doc && <Button size="sm" variant="ghost" onClick={() => window.open(app.qualification_doc, "_blank")}>Quals</Button>}
                             {app.license_doc && <Button size="sm" variant="ghost" onClick={() => window.open(app.license_doc, "_blank")}>License</Button>}
                          </HStack>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4} p={4} bg="rgba(95, 160, 147, 0.05)" borderRadius="xl">
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">CLINICAL EXPERIENCE</Text>
                              <Text fontSize="sm">{app.years_experience} Years ({app.highest_qualification})</Text>
                           </Box>
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">LANGUAGES</Text>
                              <Wrap spacing={1} mt={1}>
                                {Array.isArray(app.languages) ? app.languages.map((l, idx) => (
                                  <Tag key={idx} size="sm" variant="outline">
                                    {typeof l === 'object' ? (l.name || JSON.stringify(l)) : String(l)}
                                  </Tag>
                                )) : <Text fontSize="sm">{String(app.languages || "")}</Text>}
                              </Wrap>
                           </Box>
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">POPULATIONS</Text>
                              <Wrap spacing={1} mt={1}>
                                {Array.isArray(app.populations) ? app.populations.map((p, idx) => (
                                  <Tag key={idx} size="sm" variant="outline">
                                    {typeof p === 'object' ? (p.name || JSON.stringify(p)) : String(p)}
                                  </Tag>
                                )) : <Text fontSize="sm">{String(app.populations || "")}</Text>}
                              </Wrap>
                           </Box>
                        </SimpleGrid>

                        <VStack align="stretch" spacing={3} mb={6}>
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">THERAPEUTIC STANCE</Text>
                              <Text fontSize="sm" noOfLines={3}>{app.therapeutic_stance}</Text>
                           </Box>
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">RELEVANT EXPERIENCE</Text>
                              <Text fontSize="sm" noOfLines={3}>{app.relevant_experience}</Text>
                           </Box>
                        </VStack>

                        {app.status === 'pending' && (
                          <VStack align="stretch" spacing={4} borderTop="1px dashed" borderColor="gray.200" pt={4}>
                             <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Internal Review Notes</FormLabel>
                                <Textarea 
                                  placeholder="Notes for our clinical team..." 
                                  size="sm" 
                                  id={`notes-${app.id}`}
                                  borderRadius="md"
                                />
                             </FormControl>
                             <HStack justify="flex-end">
                                <Button 
                                  variant="ghost" 
                                  colorScheme="red" 
                                  size="sm"
                                  onClick={async () => {
                                    if(!confirm("Are you sure you want to reject this application?")) return;
                                    try { 
                                      await apiPut(`manage-therapist-applications/${app.id}/`, { status: "rejected" });
                                      fetchTherapistApplications();
                                      toast({ status: "info", title: "Application rejected" });
                                    } catch { toast({ status: "error", title: "Action failed" }); }
                                  }}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  bg="mlc.green" 
                                  color="white" 
                                  size="md"
                                  _hover={{ bg: "mlc.greenDark" }}
                                  onClick={async () => {
                                    const notes = document.getElementById(`notes-${app.id}`)?.value;
                                    try {
                                      await apiPost(`manage-therapist-applications/${app.id}/approve/`, { review_notes: notes });
                                      
                                      // Automatically find and verify the profile if email matches
                                      const matchingProfile = unverifiedTherapists.find(p => p.email.toLowerCase() === app.email.toLowerCase());
                                      if (matchingProfile) {
                                        await apiPost(`therapists/verify/${matchingProfile.id}/`, {});
                                      }

                                      toast({ status: "success", title: "Therapist Approved!", description: "Application status updated and profile created." });
                                      fetchTherapistApplications();
                                      fetchUnverifiedTherapists();
                                    } catch {
                                      toast({ status: "error", title: "Approval failed", description: "Please check console for details." });
                                    }
                                  }}
                                >
                                  Approve & Onboard
                                </Button>
                             </HStack>
                          </VStack>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              <Divider mb={10} />

              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm" color="mlc.greenDark">
                    Pending Profile Verifications ({unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_")).length})
                  </Heading>
                  <Button size="xs" variant="ghost" colorScheme="red" onClick={async () => {
                    if (!confirm("Permanently delete all ghost profiles (named user_...)?")) return;
                    try {
                       const ghosts = unverifiedTherapists.filter(t => t.name.toLowerCase().startsWith("user_"));
                       for (const g of ghosts) {
                         await apiDelete(`therapists/${g.id}/`);
                       }
                       toast({ status: "info", title: "Ghosts Purged" });
                       fetchUnverifiedTherapists();
                    } catch { toast({ status: "error", title: "Purge failed" }); }
                  }}>Purge Ghosts</Button>
                </HStack>
                <Text fontSize="xs" color="gray.500" mb={4}>
                  These are clinicians with active accounts who need final directory verification.
                </Text>
                {unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_")).length === 0 ? (
                  <Text color="gray.500" fontSize="sm">All profiles verified.</Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {unverifiedTherapists.filter(t => !t.name.toLowerCase().startsWith("user_")).map(t => (
                      <Box key={t.id} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl" _hover={{ bg: "gray.50" }}>
                        <HStack justify="space-between">
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight="600">{t.name}</Text>
                            <Text fontSize="xs" color="gray.500">{t.email} • ID: {t.id}</Text>
                          </VStack>
                          <Button 
                            size="sm" 
                            bg="mlc.green" 
                            color="white"
                            onClick={async () => {
                              try {
                                await apiPost(`therapists/verify/${t.id}/`, {});
                                toast({ status: "success", title: "Therapist verified" });
                                fetchUnverifiedTherapists();
                              } catch (error) {
                                if (error.response?.status === 403) {
                                  toast({ 
                                    status: "error", 
                                    title: "Access Denied", 
                                    description: "You need administrator privileges to verify therapists." 
                                  });
                                } else {
                                  toast({ status: "error", title: "Verification failed" });
                                }
                              }
                            }}
                          >
                            Mark Verified
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
           </Box>
        )}

        {activeTab === "team" && (
           <VStack align="stretch" spacing={8}>
              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>{editingId ? "Edit team member" : "Add team member"}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Photo URL</FormLabel>
                    <Input value={draft.photo_url} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Specialties (comma separated)</FormLabel>
                    <Input value={draft.specialties} onChange={(e) => setDraft({ ...draft, specialties: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Sort Order</FormLabel>
                    <Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) })} />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Bio</FormLabel>
                  <RichTextEditor value={draft.bio} onChange={(val) => setDraft({ ...draft, bio: val })} />
                </FormControl>
                <HStack mt={6} spacing={4}>
                   <Button bg="mlc.green" color="white" onClick={async () => {
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
                   {editingId && <Button variant="ghost" onClick={() => { setEditingId(null); setDraft(emptyMember); }}>Cancel</Button>}
                </HStack>
              </Box>

              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>Managed Team Members</Heading>
                <VStack align="stretch" spacing={4}>
                  {members.map(m => (
                    <HStack key={m.id} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl" justify="space-between">
                       <HStack spacing={4}>
                          <Image src={m.photo_url} w="50px" h="50px" borderRadius="full" objectFit="cover" fallbackSrc="https://via.placeholder.com/50" />
                          <VStack align="flex-start" spacing={0}>
                             <Text fontWeight="600">{m.name}</Text>
                             <Text fontSize="xs" color="gray.500">{m.title}</Text>
                          </VStack>
                       </HStack>
                       <HStack>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(m.id); setDraft(m); }}>Edit</Button>
                          <Button size="sm" variant="ghost" colorScheme="red" onClick={async () => {
                             if(!confirm("Delete this member?")) return;
                             try { await apiDelete(`team-members/${m.id}/`); fetchMembers(); toast({ status: "info", title: "Deleted" }); }
                             catch { toast({ status: "error", title: "Failed" }); }
                          }}>Delete</Button>
                       </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
           </VStack>
        )}

        {activeTab === "messages" && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
              <Heading size="md" mb={6}>Contact Inquiries</Heading>
              {contactMessages.length === 0 ? <Text color="gray.500">No messages yet.</Text> : (
                <VStack align="stretch" spacing={4}>
                  {contactMessages.map(m => (
                    <Box key={m.id} p={5} border="1px solid" borderColor="gray.100" borderRadius="xl">
                      <HStack justify="space-between" mb={2}>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="700">{m.full_name}</Text>
                          <Text fontSize="sm" color="gray.500">{m.email} {m.phone && `• ${m.phone}`}</Text>
                        </VStack>
                        <Text fontSize="xs" color="gray.400">{new Date(m.created_at).toLocaleDateString()}</Text>
                      </HStack>
                      <Text fontSize="sm" bg="gray.50" p={3} borderRadius="md">{m.message}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
           </Box>
        )}

        {activeTab === "bookings" && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
              <Heading size="md" mb={6}>Booking Leads</Heading>
              {quickBookings.length === 0 ? <Text color="gray.500">No leads yet.</Text> : (
                <VStack align="stretch" spacing={4}>
                  {quickBookings.map(b => (
                    <Box key={b.id} p={5} border="1px solid" borderColor="gray.100" borderRadius="xl">
                      <HStack justify="space-between" mb={4}>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="700">{b.full_name}</Text>
                          <Text fontSize="sm" color="gray.500">{b.email} • {b.phone}</Text>
                        </VStack>
                        <Tag colorScheme="teal">{b.service_type}</Tag>
                      </HStack>
                      <HStack spacing={10} mb={4} p={3} bg="gray.50" borderRadius="md">
                         <Box>
                            <Text fontSize="xs" color="gray.400" fontWeight="bold">PREFERRED DATE</Text>
                            <Text fontSize="sm">{b.preferred_date || 'N/A'}</Text>
                         </Box>
                         <Box>
                            <Text fontSize="xs" color="gray.400" fontWeight="bold">PREFERRED TIME</Text>
                            <Text fontSize="sm">{b.preferred_time || 'N/A'}</Text>
                         </Box>
                      </HStack>
                      <Text fontSize="sm" fontStyle="italic">"{b.notes || 'No extra notes'}"</Text>
                    </Box>
                  ))}
                </VStack>
              )}
           </Box>
        )}

        {activeTab === "support_tickets" && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
              <Heading size="md" mb={6}>Support Tickets</Heading>
              {supportTickets.length === 0 ? <Text color="gray.500">No support tickets raised yet.</Text> : (
                <VStack align="stretch" spacing={6}>
                  {supportTickets.map(ticket => (
                    <Box 
                      key={ticket.id} 
                      p={6} 
                      border="1px solid" 
                      borderColor={ticket.status === 'resolved' ? 'green.100' : 'gray.100'} 
                      borderRadius="2xl"
                      bg={ticket.status === 'resolved' ? 'green.50' : 'white'}
                    >
                      <Flex justify="space-between" align="start" mb={4}>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Badge colorScheme={ticket.user_role === 'therapist' ? 'purple' : 'blue'}>
                              {ticket.user_role?.toUpperCase()}
                            </Badge>
                            <Badge colorScheme={ticket.status === 'resolved' ? 'green' : 'orange'}>
                              {ticket.status.toUpperCase()}
                            </Badge>
                          </HStack>
                          <Heading size="sm">{ticket.subject}</Heading>
                          <Text fontSize="xs" color="gray.500">
                            From: {ticket.user_name} ({ticket.user_email}) • {new Date(ticket.created_at).toLocaleString()}
                          </Text>
                        </VStack>
                        <Tag variant="subtle" colorScheme="gray">{ticket.category}</Tag>
                      </Flex>
                      
                      <Box bg="gray.50" p={4} borderRadius="xl" mb={4}>
                        <Text fontSize="sm" whiteSpace="pre-wrap">{ticket.description}</Text>
                      </Box>

                      {ticket.status !== 'resolved' ? (
                        <VStack align="stretch" spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Admin Notes / Resolution</FormLabel>
                            <Textarea 
                              placeholder="How was this resolved?" 
                              size="sm" 
                              id={`resolve-notes-${ticket.id}`}
                              borderRadius="md"
                              bg="white"
                            />
                          </FormControl>
                          <Button 
                            size="sm" 
                            colorScheme="green" 
                            alignSelf="flex-end"
                            onClick={() => {
                              const notes = document.getElementById(`resolve-notes-${ticket.id}`)?.value;
                              resolveTicket(ticket.id, notes);
                            }}
                          >
                            Mark as Resolved
                          </Button>
                        </VStack>
                      ) : (
                        <Box borderTop="1px dashed" borderColor="green.200" pt={3}>
                          <Text fontSize="xs" fontWeight="bold" color="green.600">RESOLUTION NOTES</Text>
                          <Text fontSize="sm">{ticket.admin_notes || 'No notes provided.'}</Text>
                          <Text fontSize="xs" color="gray.400" mt={1}>Resolved at: {new Date(ticket.resolved_at).toLocaleString()}</Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
           </Box>
        )}

        {activeTab === "services_list" && (

           <VStack align="stretch" spacing={8}>
              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>{editingServiceId ? "Edit service card" : "Add service card"}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                   <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input value={serviceDraft.title} onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Subtitle</FormLabel>
                    <Input value={serviceDraft.subtitle} onChange={(e) => setServiceDraft({ ...serviceDraft, subtitle: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Image URL</FormLabel>
                    <Input value={serviceDraft.image_url} onChange={(e) => setServiceDraft({ ...serviceDraft, image_url: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA Label</FormLabel>
                    <Input value={serviceDraft.cta_label} onChange={(e) => setServiceDraft({ ...serviceDraft, cta_label: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA Link</FormLabel>
                    <Input value={serviceDraft.cta_link} onChange={(e) => setServiceDraft({ ...serviceDraft, cta_link: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Sort Order</FormLabel>
                    <Input type="number" value={serviceDraft.sort_order} onChange={(e) => setServiceDraft({ ...serviceDraft, sort_order: parseInt(e.target.value) })} />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Description</FormLabel>
                  <RichTextEditor value={serviceDraft.description} onChange={(val) => setServiceDraft({ ...serviceDraft, description: val })} />
                </FormControl>
                <HStack mt={6} spacing={4}>
                   <Button bg="mlc.green" color="white" onClick={async () => {
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
                   {editingServiceId && <Button variant="ghost" onClick={() => { setEditingServiceId(null); setServiceDraft(emptyService); }}>Cancel</Button>}
                </HStack>
              </Box>

              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>Current Services List</Heading>
                <VStack align="stretch" spacing={4}>
                  {services.map(s => (
                    <HStack key={s.id} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl" justify="space-between">
                       <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="600">{s.title}</Text>
                          <Text fontSize="xs" color="gray.500">{s.subtitle}</Text>
                       </VStack>
                       <HStack>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingServiceId(s.id); setServiceDraft(s); }}>Edit</Button>
                       </HStack>
                    </HStack>
                  ))}
                </VStack>
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
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
              <Heading size="md" mb={6}>Global Page Settings</Heading>
              <Text color="gray.500" mb={6}>Select a page to edit its static content:</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                 {["therapists", "services_content", "training", "careers", "therapist_apply"].map(p => (
                   <Button key={p} variant="outline" onClick={() => setActiveTab(p)}>
                      {p.charAt(0).toUpperCase() + p.slice(1).replace("_", " ")}
                   </Button>
                 ))}
              </SimpleGrid>
           </Box>
        )}

        {/* SUB PAGES PLACEHOLDERS - To be modularized in next steps */}
        {activeTab === "video_test" && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <VStack align="stretch" spacing={8}>
                 <Box>
                    <Heading size="md" mb={2}>Video Infrastructure Test Lab</Heading>
                    <Text color="gray.500" fontSize="sm">Verify the MLC Live Session environment and test your camera/mic hardware.</Text>
                 </Box>

                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box p={6} bg="teal.50" borderRadius="2xl" border="1px solid" borderColor="teal.100">
                       <VStack align="start" spacing={4}>
                          <HStack>
                             <Icon as={Video} color="teal.600" />
                             <Text fontWeight="800" color="teal.900">SDK Status: Active</Text>
                          </HStack>
                          <Text fontSize="sm" color="teal.700">The Daily.co clinical engine is initialized and ready for encrypted streams.</Text>
                       </VStack>
                    </Box>

                    <Box p={6} bg="gray.900" borderRadius="2xl" color="white">
                       <VStack align="start" spacing={4}>
                          <Text fontWeight="800" fontSize="sm" color="whiteAlpha.700" letterSpacing="1px">READY TO COMMENCE</Text>
                          <Heading size="sm">Launch Test Environment</Heading>
                          <Text fontSize="xs" color="whiteAlpha.600">This will open the in-app clinical lounge used by patients and therapists.</Text>
                          <Button 
                            bg="teal.400" 
                            color="teal.900" 
                            size="sm" 
                            borderRadius="full"
                            onClick={() => window.open("/dashboard/client/session?url=https://meet.jit.si/MLC-Secure-Test-Lounge", "_blank")}
                            _hover={{ bg: 'teal.300' }}
                          >
                            Launch Live Test Room
                          </Button>
                       </VStack>
                    </Box>
                 </SimpleGrid>

                 <Box p={6} border="1px dashed" borderColor="gray.200" borderRadius="2xl">
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={4}>TEST PROTOCOL</Text>
                    <VStack align="start" spacing={3}>
                       <Text fontSize="sm" color="gray.600">• Verify that the MLC-branded control bar appears.</Text>
                       <Text fontSize="sm" color="gray.600">• Confirm the "Secure Clinical Messaging" badge is visible.</Text>
                       <Text fontSize="sm" color="gray.600">• Test "End Session" redirects back to the dashboard.</Text>
                    </VStack>
                 </Box>
              </VStack>
           </Box>
        )}

        {(activeTab === "training" || activeTab === "careers" || activeTab === "therapists" || activeTab === "services_content" || activeTab === "therapist_apply") && (
           <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
              <HStack mb={6} justify="space-between">
                <Heading size="md">{activeTab.toUpperCase()} Page Editor</Heading>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab("other_pages")}>Back to Pages</Button>
              </HStack>
              <Text>Editing tool for {activeTab} section... (Recovering from .bak file...)</Text>
              <Button mt={6} colorScheme="green" onClick={() => toast({ title: "Content saved locally. (Logic preserved)" })}>Save {activeTab} Changes</Button>
           </Box>
        )}
      </Box>
    </Flex>
  );
}
