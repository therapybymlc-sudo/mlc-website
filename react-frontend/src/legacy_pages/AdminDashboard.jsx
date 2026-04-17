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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "../api.js";

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

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, login, loading } = useAuth();
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
        const mergedFaq = {
          ...defaultServicesDraft.faq,
          ...(data[0].faq || {}),
        };
        if (!Array.isArray(mergedPrograms.cards)) {
          mergedPrograms.cards = defaultServicesDraft.programs.cards;
        }
        if (!Array.isArray(mergedFaq.items)) {
          mergedFaq.items = defaultServicesDraft.faq.items;
        }
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
      const res = await apiGet("contact-content/");
      const data = res.results ?? res;
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
      const res = await apiGet("training-programs-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setTrainingId(data[0].id);
        const mergedPrograms = { ...defaultTrainingDraft.programs, ...(data[0].programs || {}) };
        const mergedFaq = { ...defaultTrainingDraft.faq, ...(data[0].faq || {}) };
        if (!Array.isArray(mergedPrograms.cards)) mergedPrograms.cards = defaultTrainingDraft.programs.cards;
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
      const res = await apiGet("careers-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setCareersId(data[0].id);
        const mergedWhy = { ...defaultCareersDraft.why, ...(data[0].why || {}) };
        const mergedOpenings = {
          ...defaultCareersDraft.openings,
          ...(data[0].openings || {}),
        };
        const mergedOpportunities = {
          ...defaultCareersDraft.opportunities,
          ...(data[0].opportunities || {}),
        };
        if (!Array.isArray(mergedWhy.items)) mergedWhy.items = defaultCareersDraft.why.items;
        if (!Array.isArray(mergedOpenings.cards)) {
          mergedOpenings.cards = defaultCareersDraft.openings.cards;
        }
        if (!Array.isArray(mergedOpportunities.cards)) {
          mergedOpportunities.cards = defaultCareersDraft.opportunities.cards;
        }
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
      const res = await apiGet("therapist-apply-content/");
      const data = res.results ?? res;
      if (Array.isArray(data) && data.length > 0) {
        setTherapistApplyId(data[0].id);
        setTherapistApplyDraft({
          hero: { ...defaultTherapistApplyDraft.hero, ...(data[0].hero || {}) },
          sections: {
            ...defaultTherapistApplyDraft.sections,
            ...(data[0].sections || {}),
          },
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
    }
  }, [isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <Box py={20} textAlign="center">
        <Text>Loading…</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box py={20} textAlign="center">
        <Heading size="lg" mb={4}>
          Admin login required
        </Heading>
        <Text mb={6}>Sign in with your admin account to edit the website.</Text>
          <Button as={Link} to="/login" colorScheme="teal" mt={4}>
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
    <Box bg="#F9F9F9" py={12}>
      <Container maxW="6xl">
        <Heading mb={8}>
          Admin Dashboard
        </Heading>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={4}>
            {editingId ? "Edit team member" : "Add team member"}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Full name</FormLabel>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Title / Role</FormLabel>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Photo URL</FormLabel>
              <Input
                value={draft.photo_url}
                onChange={(e) => setDraft((p) => ({ ...p, photo_url: e.target.value }))}
              />
              <FormHelperText color="gray.500">
                Use a direct image URL (ends with .jpg/.png). Share the file
                publicly before pasting the link.
              </FormHelperText>
              {draft.photo_url ? (
                <Box mt={3} borderRadius="lg" overflow="hidden" border="1px solid #E2E8F0">
                  <Image
                    src={draft.photo_url}
                    alt="Team member preview"
                    maxH="180px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="https://mlchealth.in/founder_portrait_new.jpg"
                  />
                </Box>
              ) : null}
            </FormControl>
            <FormControl>
              <FormLabel>Specialties (comma‑separated)</FormLabel>
              <Input
                value={draft.specialties}
                onChange={(e) => setDraft((p) => ({ ...p, specialties: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Sort order</FormLabel>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Bio</FormLabel>
              <RichTextEditor
                value={draft.bio}
                onChange={(value) => setDraft((p) => ({ ...p, bio: value }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={draft.is_active}
                onChange={(e) => setDraft((p) => ({ ...p, is_active: e.target.checked }))}
              />
            </FormControl>
          </SimpleGrid>
          <HStack mt={6} spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                if (!draft.name.trim()) {
                  toast({ status: "warning", title: "Name is required" });
                  return;
                }
                try {
                  if (editingId) {
                    await apiPut(`team-members/${editingId}/`, draft);
                  } else {
                    await apiPost("team-members/", draft);
                  }
                  setDraft(emptyMember);
                  setEditingId(null);
                  await fetchMembers();
                  toast({ status: "success", title: "Saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              {editingId ? "Update member" : "Add member"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyMember);
                }}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Team members
          </Heading>
          {members.length === 0 ? (
            <Text color="gray.500">No team members added yet.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {members.map((member) => (
                <Box key={member.id} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="sm">{member.name}</Heading>
                      {member.title && <Text color="gray.600">{member.title}</Text>}
                      {member.email && <Text fontSize="sm">{member.email}</Text>}
                      {member.specialties && (
                        <Text fontSize="sm" color="gray.600">
                          {member.specialties}
                        </Text>
                      )}
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(member.id);
                          setDraft({
                            name: member.name || "",
                            title: member.title || "",
                            email: member.email || "",
                            photo_url: member.photo_url || "",
                            specialties: member.specialties || "",
                            bio: member.bio || "",
                            sort_order: member.sort_order || 0,
                            is_active: member.is_active ?? true,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={async () => {
                          if (!window.confirm("Delete this team member?")) return;
                          try {
                            await apiDelete(`team-members/${member.id}/`);
                            await fetchMembers();
                          } catch {
                            toast({ status: "error", title: "Delete failed" });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={4}>
            {editingServiceId ? "Edit service" : "Add service"}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={serviceDraft.title}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, title: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Input
                value={serviceDraft.subtitle}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, subtitle: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={serviceDraft.image_url}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, image_url: e.target.value }))
                }
              />
              <FormHelperText color="gray.500">
                Use a direct image URL (ends with .jpg/.png).
              </FormHelperText>
              {serviceDraft.image_url ? (
                <Box mt={3} borderRadius="lg" overflow="hidden" border="1px solid #E2E8F0">
                  <Image
                    src={serviceDraft.image_url}
                    alt="Service preview"
                    maxH="180px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="https://mlchealth.in/service1_new.jpg"
                  />
                </Box>
              ) : null}
            </FormControl>
            <FormControl>
              <FormLabel>CTA label</FormLabel>
              <Input
                value={serviceDraft.cta_label}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, cta_label: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>CTA link</FormLabel>
              <Input
                value={serviceDraft.cta_link}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, cta_link: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Sort order</FormLabel>
              <Input
                type="number"
                value={serviceDraft.sort_order}
                onChange={(e) =>
                  setServiceDraft((p) => ({
                    ...p,
                    sort_order: Number(e.target.value) || 0,
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Description</FormLabel>
              <RichTextEditor
                value={serviceDraft.description}
                onChange={(value) =>
                  setServiceDraft((p) => ({ ...p, description: value }))
                }
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={serviceDraft.is_active}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, is_active: e.target.checked }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <HStack mt={6} spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                if (!serviceDraft.title.trim()) {
                  toast({ status: "warning", title: "Title is required" });
                  return;
                }
                try {
                  if (editingServiceId) {
                    await apiPut(`services/${editingServiceId}/`, serviceDraft);
                  } else {
                    await apiPost("services/", serviceDraft);
                  }
                  setServiceDraft(emptyService);
                  setEditingServiceId(null);
                  await fetchServices();
                  toast({ status: "success", title: "Saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              {editingServiceId ? "Update service" : "Add service"}
            </Button>
            {editingServiceId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingServiceId(null);
                  setServiceDraft(emptyService);
                }}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Services
          </Heading>
          {services.length === 0 ? (
            <Text color="gray.500">No services added yet.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {services.map((service) => (
                <Box key={service.id} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="sm">{service.title}</Heading>
                      {service.subtitle && (
                        <Text color="#56756D" fontWeight="semibold" mb={1}>
                          {service.subtitle}
                        </Text>
                      )}
                      {service.cta_link && (
                        <Text fontSize="sm" color="gray.600">
                          {service.cta_label ? `${service.cta_label}: ` : ""}{service.cta_link}
                        </Text>
                      )}
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingServiceId(service.id);
                          setServiceDraft({
                            title: service.title || "",
                            subtitle: service.subtitle || "",
                            description: service.description || "",
                            image_url: service.image_url || "",
                            cta_label: service.cta_label || "",
                            cta_link: service.cta_link || "",
                            sort_order: service.sort_order || 0,
                            is_active: service.is_active ?? true,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={async () => {
                          if (!window.confirm("Delete this service?")) return;
                          try {
                            await apiDelete(`services/${service.id}/`);
                            await fetchServices();
                          } catch {
                            toast({ status: "error", title: "Delete failed" });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Home Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={homeDraft.hero.title}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Tagline</FormLabel>
              <Input
                value={homeDraft.hero.tagline}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, tagline: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Paragraph 1</FormLabel>
              <RichTextEditor
                value={homeDraft.hero.paragraph_one}
                onChange={(value) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, paragraph_one: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Paragraph 2</FormLabel>
              <RichTextEditor
                value={homeDraft.hero.paragraph_two}
                onChange={(value) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, paragraph_two: value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Primary button label</FormLabel>
              <Input
                value={homeDraft.hero.primary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, primary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Primary button link</FormLabel>
              <Input
                value={homeDraft.hero.primary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, primary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Secondary button label</FormLabel>
              <Input
                value={homeDraft.hero.secondary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, secondary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Secondary button link</FormLabel>
              <Input
                value={homeDraft.hero.secondary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, secondary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Background image URL</FormLabel>
              <Input
                value={homeDraft.hero.background_image}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, background_image: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Logo URL</FormLabel>
              <Input
                value={homeDraft.hero.logo_url}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, logo_url: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Portal CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section title</FormLabel>
              <Input
                value={homeDraft.portal.title}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section body</FormLabel>
              <RichTextEditor
                value={homeDraft.portal.body}
                onChange={(value) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client card title</FormLabel>
              <Input
                value={homeDraft.portal.client_title}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist card title</FormLabel>
              <Input
                value={homeDraft.portal.therapist_title}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Client card body</FormLabel>
              <RichTextEditor
                value={homeDraft.portal.client_body}
                onChange={(value) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Therapist card body</FormLabel>
              <RichTextEditor
                value={homeDraft.portal.therapist_body}
                onChange={(value) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client primary label</FormLabel>
              <Input
                value={homeDraft.portal.client_primary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_primary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client primary link</FormLabel>
              <Input
                value={homeDraft.portal.client_primary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_primary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client secondary label</FormLabel>
              <Input
                value={homeDraft.portal.client_secondary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_secondary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client secondary link</FormLabel>
              <Input
                value={homeDraft.portal.client_secondary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_secondary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist primary label</FormLabel>
              <Input
                value={homeDraft.portal.therapist_primary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_primary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist primary link</FormLabel>
              <Input
                value={homeDraft.portal.therapist_primary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_primary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist secondary label</FormLabel>
              <Input
                value={homeDraft.portal.therapist_secondary_label}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_secondary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist secondary link</FormLabel>
              <Input
                value={homeDraft.portal.therapist_secondary_link}
                onChange={(e) =>
                  setHomeDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_secondary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Reassurance Bubbles
          </Heading>
          <VStack align="stretch" spacing={4} mb={6}>
            {homeDraft.bubbles.map((bubble, idx) => (
              <Box key={`${bubble.title}-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={bubble.icon}
                      onChange={(e) => {
                        const next = [...homeDraft.bubbles];
                        next[idx] = { ...next[idx], icon: e.target.value };
                        setHomeDraft((p) => ({ ...p, bubbles: next }));
                      }}
                    >
                      <option value="users">Users</option>
                      <option value="compass">Compass</option>
                      <option value="check">Check</option>
                      <option value="feather">Feather</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={bubble.title}
                      onChange={(e) => {
                        const next = [...homeDraft.bubbles];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setHomeDraft((p) => ({ ...p, bubbles: next }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={bubble.body}
                      onChange={(value) => {
                        const next = [...homeDraft.bubbles];
                        next[idx] = { ...next[idx], body: value };
                        setHomeDraft((p) => ({ ...p, bubbles: next }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={3} justify="flex-end">
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = homeDraft.bubbles.filter((_, i) => i !== idx);
                      setHomeDraft((p) => ({ ...p, bubbles: next }));
                    }}
                  >
                    Remove
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setHomeDraft((p) => ({
                ...p,
                bubbles: [
                  ...p.bubbles,
                  { icon: "users", title: "New bubble", body: "" },
                ],
              }))
            }
          >
            Add bubble
          </Button>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (homeId) {
                    await apiPut(`home-content/${homeId}/`, homeDraft);
                  } else {
                    const res = await apiPost("home-content/", homeDraft);
                    setHomeId(res?.id || null);
                  }
                  toast({ status: "success", title: "Home content saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save home page
            </Button>
          </HStack>
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={4}>
            About Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={aboutDraft.hero.title}
                onChange={(e) =>
                  setAboutDraft((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>CTA label</FormLabel>
              <Input
                value={aboutDraft.hero.cta_label}
                onChange={(e) =>
                  setAboutDraft((p) => ({ ...p, hero: { ...p.hero, cta_label: e.target.value } }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>CTA link</FormLabel>
              <Input
                value={aboutDraft.hero.cta_link}
                onChange={(e) =>
                  setAboutDraft((p) => ({ ...p, hero: { ...p.hero, cta_link: e.target.value } }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={aboutDraft.hero.image_url}
                onChange={(e) =>
                  setAboutDraft((p) => ({ ...p, hero: { ...p.hero, image_url: e.target.value } }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Hero body</FormLabel>
              <RichTextEditor
                value={aboutDraft.hero.body}
                onChange={(value) =>
                  setAboutDraft((p) => ({ ...p, hero: { ...p.hero, body: value } }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Why We Started
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={aboutDraft.why.title}
                onChange={(e) =>
                  setAboutDraft((p) => ({ ...p, why: { ...p.why, title: e.target.value } }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={aboutDraft.why.body}
                onChange={(value) =>
                  setAboutDraft((p) => ({ ...p, why: { ...p.why, body: value } }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Pillars
          </Heading>
          <VStack align="stretch" spacing={4} mb={6}>
            {aboutDraft.pillars.map((pillar, idx) => (
              <Box key={`pillar-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={pillar.title}
                      onChange={(e) => {
                        const next = [...aboutDraft.pillars];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setAboutDraft((p) => ({ ...p, pillars: next }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={pillar.body}
                      onChange={(value) => {
                        const next = [...aboutDraft.pillars];
                        next[idx] = { ...next[idx], body: value };
                        setAboutDraft((p) => ({ ...p, pillars: next }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Message Behind MLC
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={aboutDraft.message.title}
                onChange={(e) =>
                  setAboutDraft((p) => ({
                    ...p,
                    message: { ...p.message, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={aboutDraft.message.image_url}
                onChange={(e) =>
                  setAboutDraft((p) => ({
                    ...p,
                    message: { ...p.message, image_url: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={aboutDraft.message.body}
                onChange={(value) =>
                  setAboutDraft((p) => ({
                    ...p,
                    message: { ...p.message, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (aboutId) {
                    await apiPut(`about-content/${aboutId}/`, aboutDraft);
                  } else {
                    const res = await apiPost("about-content/", aboutDraft);
                    setAboutId(res?.id || null);
                  }
                  toast({ status: "success", title: "About page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save about page
            </Button>
          </HStack>
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            For Therapists Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={therapistsDraft.hero.title}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Primary button label</FormLabel>
              <Input
                value={therapistsDraft.hero.primary_label}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, primary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Primary button link</FormLabel>
              <Input
                value={therapistsDraft.hero.primary_link}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, primary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Secondary button label</FormLabel>
              <Input
                value={therapistsDraft.hero.secondary_label}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, secondary_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Secondary button link</FormLabel>
              <Input
                value={therapistsDraft.hero.secondary_link}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, secondary_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body paragraph one</FormLabel>
              <RichTextEditor
                value={therapistsDraft.hero.body_one}
                onChange={(value) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body_one: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body paragraph two</FormLabel>
              <RichTextEditor
                value={therapistsDraft.hero.body_two}
                onChange={(value) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body_two: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Why We Built MLC
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={therapistsDraft.why.title}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    why: { ...p.why, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={therapistsDraft.why.body}
                onChange={(value) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    why: { ...p.why, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={6}>
            {therapistsDraft.why.cards?.map((card, idx) => (
              <Box key={`why-card-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={card.icon}
                      onChange={(e) => {
                        const next = [...therapistsDraft.why.cards];
                        next[idx] = { ...next[idx], icon: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          why: { ...p.why, cards: next },
                        }));
                      }}
                    >
                      {therapistIconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...therapistsDraft.why.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          why: { ...p.why, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...therapistsDraft.why.cards];
                        next[idx] = { ...next[idx], body: value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          why: { ...p.why, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA label</FormLabel>
                    <Input
                      value={card.cta_label}
                      onChange={(e) => {
                        const next = [...therapistsDraft.why.cards];
                        next[idx] = { ...next[idx], cta_label: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          why: { ...p.why, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA link</FormLabel>
                    <Input
                      value={card.cta_link}
                      onChange={(e) => {
                        const next = [...therapistsDraft.why.cards];
                        next[idx] = { ...next[idx], cta_link: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          why: { ...p.why, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Supervision
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={therapistsDraft.supervision.title}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    supervision: { ...p.supervision, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={therapistsDraft.supervision.body}
                onChange={(value) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    supervision: { ...p.supervision, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={6}>
            {therapistsDraft.supervision.cards?.map((card, idx) => (
              <Box key={`supervision-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={card.icon}
                      onChange={(e) => {
                        const next = [...therapistsDraft.supervision.cards];
                        next[idx] = { ...next[idx], icon: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          supervision: { ...p.supervision, cards: next },
                        }));
                      }}
                    >
                      {therapistIconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...therapistsDraft.supervision.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          supervision: { ...p.supervision, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...therapistsDraft.supervision.cards];
                        next[idx] = { ...next[idx], body: value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          supervision: { ...p.supervision, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA label</FormLabel>
                    <Input
                      value={card.cta_label}
                      onChange={(e) => {
                        const next = [...therapistsDraft.supervision.cards];
                        next[idx] = { ...next[idx], cta_label: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          supervision: { ...p.supervision, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA link</FormLabel>
                    <Input
                      value={card.cta_link}
                      onChange={(e) => {
                        const next = [...therapistsDraft.supervision.cards];
                        next[idx] = { ...next[idx], cta_link: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          supervision: { ...p.supervision, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Learning & Development
          </Heading>
          <FormControl mb={4}>
            <FormLabel>Section title</FormLabel>
            <Input
              value={therapistsDraft.learning.title}
              onChange={(e) =>
                setTherapistsDraft((p) => ({
                  ...p,
                  learning: { ...p.learning, title: e.target.value },
                }))
              }
            />
          </FormControl>
          <VStack align="stretch" spacing={4} mb={6}>
            {therapistsDraft.learning.cards?.map((card, idx) => (
              <Box key={`learning-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={card.icon}
                      onChange={(e) => {
                        const next = [...therapistsDraft.learning.cards];
                        next[idx] = { ...next[idx], icon: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          learning: { ...p.learning, cards: next },
                        }));
                      }}
                    >
                      {therapistIconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...therapistsDraft.learning.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          learning: { ...p.learning, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...therapistsDraft.learning.cards];
                        next[idx] = { ...next[idx], body: value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          learning: { ...p.learning, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA label</FormLabel>
                    <Input
                      value={card.cta_label}
                      onChange={(e) => {
                        const next = [...therapistsDraft.learning.cards];
                        next[idx] = { ...next[idx], cta_label: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          learning: { ...p.learning, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA link</FormLabel>
                    <Input
                      value={card.cta_link}
                      onChange={(e) => {
                        const next = [...therapistsDraft.learning.cards];
                        next[idx] = { ...next[idx], cta_link: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          learning: { ...p.learning, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Work With MLC
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={therapistsDraft.work.title}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    work: { ...p.work, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={therapistsDraft.work.body}
                onChange={(value) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    work: { ...p.work, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={6}>
            {therapistsDraft.work.cards?.map((card, idx) => (
              <Box key={`work-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      value={card.icon}
                      onChange={(e) => {
                        const next = [...therapistsDraft.work.cards];
                        next[idx] = { ...next[idx], icon: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          work: { ...p.work, cards: next },
                        }));
                      }}
                    >
                      {therapistIconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...therapistsDraft.work.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          work: { ...p.work, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...therapistsDraft.work.cards];
                        next[idx] = { ...next[idx], body: value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          work: { ...p.work, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA label</FormLabel>
                    <Input
                      value={card.cta_label}
                      onChange={(e) => {
                        const next = [...therapistsDraft.work.cards];
                        next[idx] = { ...next[idx], cta_label: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          work: { ...p.work, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CTA link</FormLabel>
                    <Input
                      value={card.cta_link}
                      onChange={(e) => {
                        const next = [...therapistsDraft.work.cards];
                        next[idx] = { ...next[idx], cta_link: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          work: { ...p.work, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Values
          </Heading>
          <FormControl mb={4}>
            <FormLabel>Section title</FormLabel>
            <Input
              value={therapistsDraft.values.title}
              onChange={(e) =>
                setTherapistsDraft((p) => ({
                  ...p,
                  values: { ...p.values, title: e.target.value },
                }))
              }
            />
          </FormControl>
          <VStack align="stretch" spacing={4} mb={6}>
            {therapistsDraft.values.bubbles?.map((bubble, idx) => (
              <Box key={`value-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={bubble.title}
                      onChange={(e) => {
                        const next = [...therapistsDraft.values.bubbles];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          values: { ...p.values, bubbles: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={bubble.body}
                      onChange={(value) => {
                        const next = [...therapistsDraft.values.bubbles];
                        next[idx] = { ...next[idx], body: value };
                        setTherapistsDraft((p) => ({
                          ...p,
                          values: { ...p.values, bubbles: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>

          <Heading size="sm" mb={3}>
            Final CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Title</FormLabel>
              <Input
                value={therapistsDraft.cta.title}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button label</FormLabel>
              <Input
                value={therapistsDraft.cta.button_label}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button link</FormLabel>
              <Input
                value={therapistsDraft.cta.button_link}
                onChange={(e) =>
                  setTherapistsDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_link: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (therapistsId) {
                    await apiPut(`therapists-content/${therapistsId}/`, therapistsDraft);
                  } else {
                    const res = await apiPost("therapists-content/", therapistsDraft);
                    setTherapistsId(res?.id || null);
                  }
                  toast({ status: "success", title: "Therapists page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save therapists page
            </Button>
          </HStack>
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Services Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={servicesContentDraft.hero.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body paragraph one</FormLabel>
              <RichTextEditor
                value={servicesContentDraft.hero.body_one}
                onChange={(value) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body_one: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body paragraph two</FormLabel>
              <RichTextEditor
                value={servicesContentDraft.hero.body_two}
                onChange={(value) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body_two: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Coverage line</FormLabel>
              <RichTextEditor
                value={servicesContentDraft.hero.coverage_line}
                onChange={(value) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, coverage_line: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Portal CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={servicesContentDraft.portal.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={servicesContentDraft.portal.body}
                onChange={(value) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client button label</FormLabel>
              <Input
                value={servicesContentDraft.portal.client_label}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Client button link</FormLabel>
              <Input
                value={servicesContentDraft.portal.client_link}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, client_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist button label</FormLabel>
              <Input
                value={servicesContentDraft.portal.therapist_label}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Therapist button link</FormLabel>
              <Input
                value={servicesContentDraft.portal.therapist_link}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    portal: { ...p.portal, therapist_link: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Services Section
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section title</FormLabel>
              <Input
                value={servicesContentDraft.services.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    services: { ...p.services, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Programs
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={servicesContentDraft.programs.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    programs: { ...p.programs, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {servicesContentDraft.programs.cards.map((card, idx) => (
              <Box key={`program-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...servicesContentDraft.programs.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setServicesContentDraft((p) => ({
                          ...p,
                          programs: { ...p.programs, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Link</FormLabel>
                    <Input
                      value={card.link}
                      onChange={(e) => {
                        const next = [...servicesContentDraft.programs.cards];
                        next[idx] = { ...next[idx], link: e.target.value };
                        setServicesContentDraft((p) => ({
                          ...p,
                          programs: { ...p.programs, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...servicesContentDraft.programs.cards];
                        next[idx] = { ...next[idx], body: value };
                        setServicesContentDraft((p) => ({
                          ...p,
                          programs: { ...p.programs, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = servicesContentDraft.programs.cards.filter((_, i) => i !== idx);
                      setServicesContentDraft((p) => ({
                        ...p,
                        programs: { ...p.programs, cards: next },
                      }));
                    }}
                  >
                    Remove program
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setServicesContentDraft((p) => ({
                ...p,
                programs: {
                  ...p.programs,
                  cards: [...p.programs.cards, { title: "New program", body: "", link: "" }],
                },
              }))
            }
          >
            Add program
          </Button>

          <Heading size="sm" mb={3}>
            Therapeutic Approach
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={servicesContentDraft.approach.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    approach: { ...p.approach, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={servicesContentDraft.approach.body}
                onChange={(value) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    approach: { ...p.approach, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            FAQ
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={2}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section title</FormLabel>
              <Input
                value={servicesContentDraft.faq.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    faq: { ...p.faq, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {servicesContentDraft.faq.items.map((item, idx) => (
              <Box key={`faq-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Question</FormLabel>
                    <Input
                      value={item.q}
                      onChange={(e) => {
                        const next = [...servicesContentDraft.faq.items];
                        next[idx] = { ...next[idx], q: e.target.value };
                        setServicesContentDraft((p) => ({
                          ...p,
                          faq: { ...p.faq, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Answer</FormLabel>
                    <RichTextEditor
                      value={item.a}
                      onChange={(value) => {
                        const next = [...servicesContentDraft.faq.items];
                        next[idx] = { ...next[idx], a: value };
                        setServicesContentDraft((p) => ({
                          ...p,
                          faq: { ...p.faq, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = servicesContentDraft.faq.items.filter((_, i) => i !== idx);
                      setServicesContentDraft((p) => ({
                        ...p,
                        faq: { ...p.faq, items: next },
                      }));
                    }}
                  >
                    Remove FAQ
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setServicesContentDraft((p) => ({
                ...p,
                faq: { ...p.faq, items: [...p.faq.items, { q: "New question", a: "" }] },
              }))
            }
          >
            Add FAQ
          </Button>

          <Heading size="sm" mb={3}>
            Final CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Title</FormLabel>
              <Input
                value={servicesContentDraft.cta.title}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button label</FormLabel>
              <Input
                value={servicesContentDraft.cta.button_label}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button link</FormLabel>
              <Input
                value={servicesContentDraft.cta.button_link}
                onChange={(e) =>
                  setServicesContentDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_link: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (servicesContentId) {
                    await apiPut(`services-content/${servicesContentId}/`, servicesContentDraft);
                  } else {
                    const res = await apiPost("services-content/", servicesContentDraft);
                    setServicesContentId(res?.id || null);
                  }
                  toast({ status: "success", title: "Services page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save services page
            </Button>
          </HStack>
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Contact Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={contactDraft.hero.title}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email label</FormLabel>
              <Input
                value={contactDraft.hero.email_label}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, email_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input
                value={contactDraft.hero.email}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, email: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={contactDraft.hero.image_url}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, image_url: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Intro body</FormLabel>
              <RichTextEditor
                value={contactDraft.hero.body}
                onChange={(value) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Location subtext</FormLabel>
              <RichTextEditor
                value={contactDraft.hero.subtext}
                onChange={(value) =>
                  setContactDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, subtext: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Contact Form
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Form title</FormLabel>
              <Input
                value={contactDraft.form.title}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    form: { ...p.form, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button label</FormLabel>
              <Input
                value={contactDraft.form.button_label}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    form: { ...p.form, button_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Message placeholder</FormLabel>
              <Input
                value={contactDraft.form.message_placeholder}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    form: { ...p.form, message_placeholder: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Quote & Hours
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Quote text</FormLabel>
              <Input
                value={contactDraft.quote.text}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    quote: { ...p.quote, text: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Hours title</FormLabel>
              <Input
                value={contactDraft.hours.title}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    hours: { ...p.hours, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={3} mb={6}>
            {(contactDraft.hours.items || []).map((item, idx) => (
              <HStack key={`hours-${idx}`}>
                <Input
                  value={item}
                  onChange={(e) => {
                    const next = [...contactDraft.hours.items];
                    next[idx] = e.target.value;
                    setContactDraft((p) => ({
                      ...p,
                      hours: { ...p.hours, items: next },
                    }));
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    const next = contactDraft.hours.items.filter((_, i) => i !== idx);
                    setContactDraft((p) => ({
                      ...p,
                      hours: { ...p.hours, items: next },
                    }));
                  }}
                >
                  Remove
                </Button>
              </HStack>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setContactDraft((p) => ({
                  ...p,
                  hours: { ...p.hours, items: [...p.hours.items, "New hours line"] },
                }))
              }
            >
              Add hours line
            </Button>
          </VStack>

          <Heading size="sm" mb={3}>
            Closing
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={contactDraft.closing.title}
                onChange={(e) =>
                  setContactDraft((p) => ({
                    ...p,
                    closing: { ...p.closing, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={contactDraft.closing.body}
                onChange={(value) =>
                  setContactDraft((p) => ({
                    ...p,
                    closing: { ...p.closing, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (contactId) {
                    await apiPut(`contact-content/${contactId}/`, contactDraft);
                  } else {
                    const res = await apiPost("contact-content/", contactDraft);
                    setContactId(res?.id || null);
                  }
                  toast({ status: "success", title: "Contact page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save contact page
            </Button>
          </HStack>
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Training & Programs Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={trainingDraft.hero.title}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={trainingDraft.hero.image_url}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, image_url: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Intro body</FormLabel>
              <RichTextEditor
                value={trainingDraft.hero.body}
                onChange={(value) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Programs
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={trainingDraft.programs.title}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    programs: { ...p.programs, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {(trainingDraft.programs.cards || []).map((card, idx) => (
              <Box key={`training-program-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...trainingDraft.programs.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setTrainingDraft((p) => ({
                          ...p,
                          programs: { ...p.programs, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...trainingDraft.programs.cards];
                        next[idx] = { ...next[idx], body: value };
                        setTrainingDraft((p) => ({
                          ...p,
                          programs: { ...p.programs, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = trainingDraft.programs.cards.filter((_, i) => i !== idx);
                      setTrainingDraft((p) => ({
                        ...p,
                        programs: { ...p.programs, cards: next },
                      }));
                    }}
                  >
                    Remove program
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setTrainingDraft((p) => ({
                ...p,
                programs: {
                  ...p.programs,
                  cards: [...p.programs.cards, { title: "New program", body: "" }],
                },
              }))
            }
          >
            Add program
          </Button>

          <Heading size="sm" mb={3}>
            FAQ
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={2}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section title</FormLabel>
              <Input
                value={trainingDraft.faq.title}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    faq: { ...p.faq, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {(trainingDraft.faq.items || []).map((item, idx) => (
              <Box key={`training-faq-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Question</FormLabel>
                    <Input
                      value={item.q}
                      onChange={(e) => {
                        const next = [...trainingDraft.faq.items];
                        next[idx] = { ...next[idx], q: e.target.value };
                        setTrainingDraft((p) => ({
                          ...p,
                          faq: { ...p.faq, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Answer</FormLabel>
                    <RichTextEditor
                      value={item.a}
                      onChange={(value) => {
                        const next = [...trainingDraft.faq.items];
                        next[idx] = { ...next[idx], a: value };
                        setTrainingDraft((p) => ({
                          ...p,
                          faq: { ...p.faq, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = trainingDraft.faq.items.filter((_, i) => i !== idx);
                      setTrainingDraft((p) => ({
                        ...p,
                        faq: { ...p.faq, items: next },
                      }));
                    }}
                  >
                    Remove FAQ
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setTrainingDraft((p) => ({
                ...p,
                faq: {
                  ...p.faq,
                  items: [...p.faq.items, { q: "New question", a: "" }],
                },
              }))
            }
          >
            Add FAQ
          </Button>

          <Heading size="sm" mb={3}>
            CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>CTA text</FormLabel>
              <Input
                value={trainingDraft.cta.text}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, text: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button label</FormLabel>
              <Input
                value={trainingDraft.cta.button_label}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button link</FormLabel>
              <Input
                value={trainingDraft.cta.button_link}
                onChange={(e) =>
                  setTrainingDraft((p) => ({
                    ...p,
                    cta: { ...p.cta, button_link: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (trainingId) {
                    await apiPut(`training-programs-content/${trainingId}/`, trainingDraft);
                  } else {
                    const res = await apiPost("training-programs-content/", trainingDraft);
                    setTrainingId(res?.id || null);
                  }
                  toast({ status: "success", title: "Training page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
           >
             Save training page
           </Button>
         </HStack>
       </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Careers Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={careersDraft.hero.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={careersDraft.hero.image_url}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, image_url: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Hero body</FormLabel>
              <RichTextEditor
                value={careersDraft.hero.body}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Why work with MLC
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={careersDraft.why.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    why: { ...p.why, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section intro</FormLabel>
              <RichTextEditor
                value={careersDraft.why.body}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    why: { ...p.why, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {(careersDraft.why.items || []).map((item, idx) => (
              <Box key={`careers-why-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const next = [...careersDraft.why.items];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setCareersDraft((p) => ({
                          ...p,
                          why: { ...p.why, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={item.body}
                      onChange={(value) => {
                        const next = [...careersDraft.why.items];
                        next[idx] = { ...next[idx], body: value };
                        setCareersDraft((p) => ({
                          ...p,
                          why: { ...p.why, items: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = careersDraft.why.items.filter((_, i) => i !== idx);
                      setCareersDraft((p) => ({
                        ...p,
                        why: { ...p.why, items: next },
                      }));
                    }}
                  >
                    Remove item
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setCareersDraft((p) => ({
                ...p,
                why: { ...p.why, items: [...p.why.items, { title: "New item", body: "" }] },
              }))
            }
          >
            Add why item
          </Button>

          <Heading size="sm" mb={3}>
            Opportunities
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={careersDraft.opportunities.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    opportunities: { ...p.opportunities, title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {(careersDraft.opportunities.cards || []).map((card, idx) => (
              <Box key={`careers-op-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...careersDraft.opportunities.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setCareersDraft((p) => ({
                          ...p,
                          opportunities: { ...p.opportunities, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Body</FormLabel>
                    <RichTextEditor
                      value={card.body}
                      onChange={(value) => {
                        const next = [...careersDraft.opportunities.cards];
                        next[idx] = { ...next[idx], body: value };
                        setCareersDraft((p) => ({
                          ...p,
                          opportunities: { ...p.opportunities, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = careersDraft.opportunities.cards.filter((_, i) => i !== idx);
                      setCareersDraft((p) => ({
                        ...p,
                        opportunities: { ...p.opportunities, cards: next },
                      }));
                    }}
                  >
                    Remove opportunity
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setCareersDraft((p) => ({
                ...p,
                opportunities: {
                  ...p.opportunities,
                  cards: [...p.opportunities.cards, { title: "New role", body: "" }],
                },
              }))
            }
          >
            Add opportunity
          </Button>

          <Heading size="sm" mb={3}>
            Openings / Vacancies
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Section title</FormLabel>
              <Input
                value={careersDraft.openings.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    openings: { ...p.openings, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Apply button label</FormLabel>
              <Input
                value={careersDraft.openings.apply_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    openings: { ...p.openings, apply_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Section subtitle</FormLabel>
              <RichTextEditor
                value={careersDraft.openings.subtitle}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    openings: { ...p.openings, subtitle: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <VStack align="stretch" spacing={4} mb={4}>
            {(careersDraft.openings.cards || []).map((card, idx) => (
              <Box key={`careers-open-${idx}`} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const next = [...careersDraft.openings.cards];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setCareersDraft((p) => ({
                          ...p,
                          openings: { ...p.openings, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={card.location}
                      onChange={(e) => {
                        const next = [...careersDraft.openings.cards];
                        next[idx] = { ...next[idx], location: e.target.value };
                        setCareersDraft((p) => ({
                          ...p,
                          openings: { ...p.openings, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Input
                      value={card.type}
                      onChange={(e) => {
                        const next = [...careersDraft.openings.cards];
                        next[idx] = { ...next[idx], type: e.target.value };
                        setCareersDraft((p) => ({
                          ...p,
                          openings: { ...p.openings, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Summary (shown in pop‑up)</FormLabel>
                    <RichTextEditor
                      value={card.summary}
                      onChange={(value) => {
                        const next = [...careersDraft.openings.cards];
                        next[idx] = { ...next[idx], summary: value };
                        setCareersDraft((p) => ({
                          ...p,
                          openings: { ...p.openings, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                  <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
                    <FormLabel>Full details (shown on expand)</FormLabel>
                    <RichTextEditor
                      value={card.details}
                      onChange={(value) => {
                        const next = [...careersDraft.openings.cards];
                        next[idx] = { ...next[idx], details: value };
                        setCareersDraft((p) => ({
                          ...p,
                          openings: { ...p.openings, cards: next },
                        }));
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      const next = careersDraft.openings.cards.filter((_, i) => i !== idx);
                      setCareersDraft((p) => ({
                        ...p,
                        openings: { ...p.openings, cards: next },
                      }));
                    }}
                  >
                    Remove opening
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            mb={6}
            onClick={() =>
              setCareersDraft((p) => ({
                ...p,
                openings: {
                  ...p.openings,
                  cards: [
                    ...(p.openings.cards || []),
                    {
                      title: "New opening",
                      location: "",
                      type: "",
                      summary: "",
                      details: "",
                    },
                  ],
                },
              }))
            }
          >
            Add opening
          </Button>

          <Heading size="sm" mb={3}>
            Application Form
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Form title</FormLabel>
              <Input
                value={careersDraft.form.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Form subtitle</FormLabel>
              <RichTextEditor
                value={careersDraft.form.subtitle}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, subtitle: value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Name label</FormLabel>
              <Input
                value={careersDraft.form.name_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, name_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email label</FormLabel>
              <Input
                value={careersDraft.form.email_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, email_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone label</FormLabel>
              <Input
                value={careersDraft.form.phone_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, phone_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role label</FormLabel>
              <Input
                value={careersDraft.form.role_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, role_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Resume label</FormLabel>
              <Input
                value={careersDraft.form.resume_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, resume_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Resume hint</FormLabel>
              <Input
                value={careersDraft.form.resume_hint}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, resume_hint: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Message label</FormLabel>
              <Input
                value={careersDraft.form.message_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, message_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Submit button label</FormLabel>
              <Input
                value={careersDraft.form.submit_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, submit_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Success title</FormLabel>
              <Input
                value={careersDraft.form.success_title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, success_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Success message</FormLabel>
              <RichTextEditor
                value={careersDraft.form.success_body}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    form: { ...p.form, success_body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Footer CTA
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={careersDraft.footer.title}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    footer: { ...p.footer, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button label</FormLabel>
              <Input
                value={careersDraft.footer.cta_label}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    footer: { ...p.footer, cta_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Button link</FormLabel>
              <Input
                value={careersDraft.footer.cta_link}
                onChange={(e) =>
                  setCareersDraft((p) => ({
                    ...p,
                    footer: { ...p.footer, cta_link: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={careersDraft.footer.body}
                onChange={(value) =>
                  setCareersDraft((p) => ({
                    ...p,
                    footer: { ...p.footer, body: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (careersId) {
                    await apiPut(`careers-content/${careersId}/`, careersDraft);
                  } else {
                    const res = await apiPost("careers-content/", careersDraft);
                    setCareersId(res?.id || null);
                  }
                  toast({ status: "success", title: "Careers page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save careers page
            </Button>
          </HStack>
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Therapist Apply Page Editor
          </Heading>

          <Heading size="sm" mb={3}>
            Hero
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={therapistApplyDraft.hero.title}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Body</FormLabel>
              <RichTextEditor
                value={therapistApplyDraft.hero.body}
                onChange={(value) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, body: value },
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Note</FormLabel>
              <RichTextEditor
                value={therapistApplyDraft.hero.note}
                onChange={(value) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    hero: { ...p.hero, note: value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Section Titles
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Personal info</FormLabel>
              <Input
                value={therapistApplyDraft.sections.personal_title}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    sections: { ...p.sections, personal_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Licensure & practice</FormLabel>
              <Input
                value={therapistApplyDraft.sections.licensure_title}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    sections: { ...p.sections, licensure_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Experience & languages</FormLabel>
              <Input
                value={therapistApplyDraft.sections.experience_title}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    sections: { ...p.sections, experience_title: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Documents & consent</FormLabel>
              <Input
                value={therapistApplyDraft.sections.documents_title}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    sections: { ...p.sections, documents_title: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <Heading size="sm" mb={3}>
            Form Labels
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel>Resume label</FormLabel>
              <Input
                value={therapistApplyDraft.form.resume_label}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    form: { ...p.form, resume_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Resume hint</FormLabel>
              <Input
                value={therapistApplyDraft.form.resume_hint}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    form: { ...p.form, resume_hint: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Subscribe label</FormLabel>
              <Input
                value={therapistApplyDraft.form.subscribe_label}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    form: { ...p.form, subscribe_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Submit button label</FormLabel>
              <Input
                value={therapistApplyDraft.form.submit_label}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    form: { ...p.form, submit_label: e.target.value },
                  }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Required note</FormLabel>
              <Input
                value={therapistApplyDraft.form.required_note}
                onChange={(e) =>
                  setTherapistApplyDraft((p) => ({
                    ...p,
                    form: { ...p.form, required_note: e.target.value },
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                try {
                  if (therapistApplyId) {
                    await apiPut(`therapist-apply-content/${therapistApplyId}/`, therapistApplyDraft);
                  } else {
                    const res = await apiPost("therapist-apply-content/", therapistApplyDraft);
                    setTherapistApplyId(res?.id || null);
                  }
                  toast({ status: "success", title: "Therapist apply page saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              Save therapist apply page
            </Button>
          </HStack>
        </Box>
        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={6}>
            Therapist Vetting & Verification
          </Heading>

          <VStack align="stretch" spacing={10}>
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
                                {Array.isArray(app.languages) ? app.languages.map(l => <Tag key={l} size="sm" variant="outline">{l}</Tag>) : <Text fontSize="sm">{app.languages}</Text>}
                              </Wrap>
                           </Box>
                           <Box>
                              <Text fontSize="xs" color="gray.500" fontWeight="bold">POPULATIONS</Text>
                              <Wrap spacing={1} mt={1}>
                                {Array.isArray(app.populations) ? app.populations.map(p => <Tag key={p} size="sm" variant="outline">{p}</Tag>) : <Text fontSize="sm">{app.populations}</Text>}
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

             <Divider />

             <Box>
                <Heading size="sm" mb={4} color="mlc.greenDark">
                  Unverified Profiles ({unverifiedTherapists.length})
                </Heading>
                <Text fontSize="xs" color="gray.500" mb={4}>
                  These are therapists who created a profile but haven't been vetted for the public directory.
                </Text>
                {unverifiedTherapists.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">All profiles verified.</Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {unverifiedTherapists.map(t => (
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
                              } catch {
                                toast({ status: "error", title: "Verification failed" });
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
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
