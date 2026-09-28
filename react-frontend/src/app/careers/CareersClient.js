'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Image,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
  Icon,
  Tag,
  TagLabel,
  Link,
  Badge,
  Flex,
  Wrap,
  Circle,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiHeart, FiUsers, FiGlobe, FiAward,
  FiBriefcase, FiBookOpen, FiStar,
  FiArrowRight, FiMapPin, FiClock,
  FiSend, FiMail, FiPhone, FiUser,
  FiFileText, FiMessageSquare,
  FiCheckCircle, FiCheck, FiX,
} from "react-icons/fi";
import { apiGet } from "../../api.js";
import ModernSelect from "../../components/ModernSelect.jsx";

const MotionBox = motion(Box);

const careerRoleOptions = [
  { value: "Licensed Clinical Psychologist", label: "Licensed Clinical Psychologist" },
  { value: "Counseling Psychologist", label: "Counseling Psychologist / Psychotherapist" },
  { value: "Clinical Supervisor", label: "Clinical Supervisor & Mentor" },
  { value: "Child & Adolescent Specialist", label: "Child & Adolescent Specialist" },
  { value: "Clinical Intern / Fellow", label: "Clinical Intern / Fellow" },
  { value: "Other Clinical / Operations Role", label: "Other Clinical / Operations Role" },
];

const defaultCareersContent = {
  hero: {
    title: "Join Our Team of Dedicated Clinicians",
    body:
      "<p>At MLC Health & Wellness Centre, we are building a space that truly values both clients and clinicians. We seek professionals who believe in ethical standards, reflective practice, structured care, and sustainable caseloads. Healing that holds the healer is our foundation.</p>",
    image_url: "/careers1.jpg",
  },
  why: {
    title: "Why Clinicians Choose MLC",
    body:
      "<p>We invest deeply in therapist wellbeing, ethical stewardship, and clinical community. Our systems are built so clinicians can do their most meaningful work without burnout.</p>",
    items: [
      {
        title: "Therapist-First Model",
        body:
          "<p>A structured caseload system that strictly protects clinical boundaries and avoids overextension.</p>",
      },
      {
        title: "Clinical Supervision & Mentorship",
        body:
          "<p>Guided spaces for case reflection, ethical consultation, and structured peer supervision.</p>",
      },
      {
        title: "Flexible Work Options",
        body:
          "<p>Remote telehealth and hybrid opportunities across India that respect your lifestyle and geography.</p>",
      },
      {
        title: "Meaningful Collaboration",
        body:
          "<p>A warm network of practitioners raising the standard of mental healthcare through clarity and relational depth.</p>",
      },
    ],
  },
  openings: {
    title: "Current Openings",
    subtitle:
      "<p>We are growing thoughtfully. Explore our open clinical positions or submit an open application.</p>",
    apply_label: "Apply to this role",
    cards: [
      {
        title: "Clinical Therapist (Online)",
        location: "Remote · India",
        type: "Contract / Flexible",
        summary:
          "<p>Deliver client-centered, evidence-based individual therapy within our structured and supportive telehealth system.</p>",
        details:
          "<p><strong>Responsibilities:</strong></p><ul><li>Conduct 50–60 minute individual psychotherapy sessions</li><li>Maintain timely, confidential clinical documentation</li><li>Engage in monthly group supervision and case reviews</li></ul><p><strong>Requirements:</strong> Master's or M.Phil in Psychology with 1+ years of supervised clinical experience.</p>",
      },
      {
        title: "Clinical Supervisor & Senior Mentor",
        location: "Remote · India",
        type: "Part-Time / Senior",
        summary:
          "<p>Provide reflective clinical supervision, ethical consultation, and professional guidance to associate therapists.</p>",
        details:
          "<p><strong>Responsibilities:</strong></p><ul><li>Lead individual and group supervisory case consultations</li><li>Uphold clinical governance and ethical care standards</li><li>Nurture emerging therapeutic voices and modalities</li></ul><p><strong>Requirements:</strong> 5+ years of active post-qualification practice and prior supervision experience.</p>",
      },
      {
        title: "Child & Adolescent Psychologist",
        location: "Hybrid / Remote",
        type: "Specialized Role",
        summary:
          "<p>Hold developmental and therapeutic space for younger demographics, supporting adolescents and their families.</p>",
        details:
          "<p><strong>Responsibilities:</strong></p><ul><li>Deliver developmentally sensitive counseling and therapy</li><li>Partner with caregivers on relational and behavioral guidance</li><li>Integrate creative and systemic evidence-based approaches</li></ul><p><strong>Requirements:</strong> Specialized coursework or 2+ years clinical focus with children/adolescents.</p>",
      },
      {
        title: "Open Clinical Application",
        location: "Remote / Hybrid",
        type: "General Inquiry",
        summary:
          "<p>Don't see your exact specialization? We always welcome trauma-informed, queer-affirmative clinicians to connect.</p>",
        details:
          "<p><strong>Who We Look For:</strong> Relationally grounded therapists, psychodynamic practitioners, somatic specialists, and clinical interns aligned with our core values.</p>",
      },
    ],
  },
  opportunities: {
    title: "Opportunities at MLC",
    cards: [
      {
        title: "Therapist Positions",
        body:
          "<p>Structured, flexible, and ethically grounded caseloads for practitioners who value balance and clinical autonomy.</p>",
      },
      {
        title: "Supervisor Network",
        body:
          "<p>Mentor emerging therapists through reflective consultation, modality-specific depth, and case stewardship.</p>",
      },
      {
        title: "Clinical Fellowships",
        body:
          "<p>Guided clinical exposure, rigorous peer supervision, and real-world learning in a safe, structured framework.</p>",
      },
    ],
  },
  form: {
    title: "Start Your Application",
    subtitle:
      "<p>Share your credentials and clinical approach. We review every application with personal attention.</p>",
    name_label: "Full name",
    email_label: "Email address",
    phone_label: "Phone number",
    role_label: "Position applying for",
    resume_label: "Link to CV or LinkedIn Profile",
    resume_hint: "Paste your CV or LinkedIn link",
    message_label: "Cover Letter",
    submit_label: "Send Application",
    success_title: "Application Sent!",
    success_body: "Thank you for applying, we'll get back to you soon 🌿",
  },
  footer: {
    title: "A Space That Holds the Healer Too",
    body:
      "<p>MLC Health & Wellness Centre was built on the belief that therapist sustainability and ethical care are inseparable. Join a team redefining what it means to heal together.</p>",
    cta_label: "Email us at therapy@mlchealth.in",
    cta_link: "mailto:therapy@mlchealth.in",
  },
};

const richTextStyles = {
  "p + p": { marginTop: "0.5rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.4rem" },
  li: { marginBottom: "0.25rem" },
};

const whyIcons = [FiHeart, FiBookOpen, FiGlobe, FiUsers];
const opportunityIcons = [FiBriefcase, FiAward, FiStar];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function CareersClient() {
  const form = useRef();
  const toast = useToast();
  const [content, setContent] = useState(defaultCareersContent);
  const [activeOpening, setActiveOpening] = useState(null);
  const [position, setPosition] = useState("");
  const [comfortable, setComfortable] = useState("Yes");
  const applySectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("careers-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultCareersContent.hero, ...(entry.hero || {}) },
            why: { ...defaultCareersContent.why, ...(entry.why || {}) },
            openings: {
              ...defaultCareersContent.openings,
              ...(entry.openings || {}),
              cards: (entry.openings?.cards && entry.openings.cards.length > 0)
                ? entry.openings.cards
                : defaultCareersContent.openings.cards,
            },
            opportunities: {
              ...defaultCareersContent.opportunities,
              ...(entry.opportunities || {}),
            },
            form: { ...defaultCareersContent.form, ...(entry.form || {}) },
            footer: { ...defaultCareersContent.footer, ...(entry.footer || {}) },
          });
        }
      } catch {
        setContent(defaultCareersContent);
      }
    })();
  }, []);

  const sendEmail = async (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    const payload = {
      type: "careers",
      name: formData.get("full_name"),
      email: formData.get("email"),
      role: formData.get("position"),
      phone: formData.get("phone"),
      resumeUrl: formData.get("link"),
      message: `${formData.get("message") || ""}\n\nComfortable via phone: ${formData.get("comfortable") || "Yes"}`,
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: content.form.success_title || "Application Sent!",
        description: content.form.success_body || "Thank you for applying, we'll get back to you soon 🌿",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      form.current.reset();
      setPosition("");
      setComfortable("Yes");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong, please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const scrollToApply = (roleTitle = "") => {
    if (roleTitle) {
      // Find matching value or default
      const matched = careerRoleOptions.find(o => o.value.toLowerCase().includes(roleTitle.toLowerCase()) || roleTitle.toLowerCase().includes(o.value.toLowerCase()));
      setPosition(matched ? matched.value : roleTitle);
    }
    applySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openingsList = content.openings.cards || defaultCareersContent.openings.cards;

  return (
    <Box bg="#FDFBFA" overflowX="hidden" color="#263A33">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <Box
        position="relative"
        py={{ base: 12, md: 16 }}
        display="flex"
        alignItems="center"
        overflow="hidden"
      >
        {/* Background Image */}
        <Image
          src={content.hero.image_url || "/careers1.jpg"}
          alt={content.hero.title || "Calm therapy room"}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center"
          zIndex={0}
        />
        {/* Warm Gradient Veil */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(90deg, rgba(253,251,250,0.96) 0%, rgba(253,251,250,0.92) 50%, rgba(253,251,250,0.65) 100%)"
          zIndex={1}
        />
        {/* Subtle Ambient Glow */}
        <Box
          position="absolute"
          bottom="-80px"
          left="50%"
          transform="translateX(-50%)"
          w="500px"
          h="220px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.2) 0%, transparent 70%)"
          filter="blur(50px)"
          zIndex={1}
        />

        <Container maxW="6xl" position="relative" zIndex={2}>
          <MotionBox
            maxW="580px"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge
              bg="rgba(86,117,109,0.1)"
              color="#56756D"
              border="1px solid rgba(86,117,109,0.2)"
              borderRadius="full"
              px={3.5}
              py={1}
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.06em"
              mb={3.5}
            >
              CAREERS AT MLC HEALTH & WELLNESS
            </Badge>

            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "32px", md: "44px", lg: "48px" }}
              fontWeight="600"
              lineHeight="1.15"
              color="#263A33"
              mb={4}
            >
              {content.hero.title}
            </Heading>

            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="rgba(46,46,46,0.78)"
              lineHeight="1.7"
              fontSize={{ base: "14px", md: "15.5px" }}
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body || "" }}
            />

            <HStack spacing={3} mt={6} flexWrap="wrap">
              <Button
                onClick={() => scrollToApply()}
                bg="#56756D"
                color="white"
                borderRadius="full"
                h="40px"
                px={7}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="600"
                fontSize="13px"
                shadow="sm"
                _hover={{ bg: "#425C55", transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.2s ease"
                rightIcon={<FiArrowRight boxSize="12px" />}
              >
                Apply Now
              </Button>
              <Button
                as="a"
                href="#openings"
                variant="outline"
                borderColor="rgba(86,117,109,0.3)"
                color="#263A33"
                borderRadius="full"
                h="40px"
                px={6}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="600"
                fontSize="13px"
                _hover={{ bg: "rgba(169,203,183,0.12)", borderColor: "#56756D" }}
                transition="all 0.2s ease"
              >
                View Openings
              </Button>
            </HStack>
          </MotionBox>
        </Container>
      </Box>

      {/* ═══════════════ TRUST PILLARS STRIP ═══════════════ */}
      <Box bg="white" borderY="1px solid" borderColor="rgba(86,117,109,0.1)" py={3.5}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} textAlign="center">
            <HStack justify="center" spacing={2} fontSize="12px" color="#263A33" fontWeight="600">
              <Icon as={FiHeart} color="#56756D" boxSize="14px" />
              <Text>Therapist-First Wellbeing</Text>
            </HStack>
            <HStack justify="center" spacing={2} fontSize="12px" color="#263A33" fontWeight="600">
              <Icon as={FiBookOpen} color="#56756D" boxSize="14px" />
              <Text>Supervised Case Reviews</Text>
            </HStack>
            <HStack justify="center" spacing={2} fontSize="12px" color="#263A33" fontWeight="600">
              <Icon as={FiGlobe} color="#56756D" boxSize="14px" />
              <Text>Remote & Hybrid Freedom</Text>
            </HStack>
            <HStack justify="center" spacing={2} fontSize="12px" color="#263A33" fontWeight="600">
              <Icon as={FiUsers} color="#56756D" boxSize="14px" />
              <Text>Collaborative Community</Text>
            </HStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════ WHY WORK WITH US (CULTURE) ═══════════════ */}
      <Box py={{ base: 10, md: 14 }} bg="#FDFBFA" position="relative">
        <Container maxW="6xl">
          <VStack spacing={2} textAlign="center" mb={{ base: 6, md: 8 }}>
            <Badge
              bg="rgba(201,169,96,0.18)"
              color="#8C6E2D"
              border="1px solid rgba(201,169,96,0.35)"
              borderRadius="full"
              px={3}
              py={0.5}
              fontSize="10.5px"
              fontWeight="800"
              letterSpacing="0.05em"
            >
              OUR CULTURE & VALUES
            </Badge>

            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "24px", md: "32px" }}
              fontWeight="600"
              color="#263A33"
            >
              {content.why.title}
            </Heading>

            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="rgba(46,46,46,0.72)"
              lineHeight="1.6"
              fontSize="13.5px"
              maxW="2xl"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.why.body || "" }}
            />
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
            {(content.why.items || []).map((item, index) => {
              const IconComp = whyIcons[index % whyIcons.length];
              return (
                <MotionBox
                  key={`${item.title}-${index}`}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                >
                  <Box
                    bg="white"
                    borderRadius="18px"
                    p={5}
                    boxShadow="0 2px 10px rgba(86,117,109,0.05)"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.12)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(86,117,109,0.1)", borderColor: "#56756D" }}
                    transition="all 0.3s ease"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="12px"
                      bg="rgba(169,203,183,0.18)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb={3.5}
                    >
                      <Icon as={IconComp} boxSize="18px" color="#56756D" />
                    </Box>

                    <Heading
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      fontSize="15px"
                      mb={2}
                      color="#263A33"
                      fontWeight="600"
                    >
                      {item.title}
                    </Heading>

                    <Box
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      color="rgba(46,46,46,0.72)"
                      lineHeight="1.55"
                      fontSize="12.5px"
                      sx={richTextStyles}
                      dangerouslySetInnerHTML={{ __html: item.body || "" }}
                    />
                  </Box>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════ OPPORTUNITIES SECTION ═══════════════ */}
      <Box py={{ base: 10, md: 12 }} bg="linear-gradient(180deg, #F9FBFA 0%, #F4F1EC 100%)" position="relative">
        <Container maxW="6xl">
          <VStack spacing={2} textAlign="center" mb={{ base: 6, md: 8 }}>
            <Badge
              bg="rgba(86,117,109,0.08)"
              color="#56756D"
              borderRadius="full"
              px={3}
              py={0.5}
              fontSize="10.5px"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              GROWTH PATHWAYS
            </Badge>

            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "24px", md: "32px" }}
              fontWeight="600"
              color="#263A33"
            >
              {content.opportunities.title}
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4.5}>
            {(content.opportunities.cards || []).map((card, index) => {
              const IconComp = opportunityIcons[index % opportunityIcons.length];
              return (
                <MotionBox
                  key={`${card.title}-${index}`}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                >
                  <Box
                    bg="white"
                    borderRadius="20px"
                    p={{ base: 5, md: 6 }}
                    textAlign="center"
                    boxShadow="0 2px 12px rgba(86,117,109,0.06)"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.14)"
                    _hover={{ 
                      transform: "translateY(-4px)", 
                      boxShadow: "0 14px 32px -4px rgba(86,117,109,0.12)", 
                      borderColor: "rgba(86,117,109,0.3)" 
                    }}
                    transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Circle
                        size="48px"
                        bg="rgba(86,117,109,0.08)"
                        color="#56756D"
                        mx="auto"
                        mb={3.5}
                        border="1px solid"
                        borderColor="rgba(86,117,109,0.12)"
                        transition="all 0.25s ease"
                      >
                        <Icon as={IconComp} boxSize={5} />
                      </Circle>
                      <Heading
                        fontSize="17px"
                        mb={2}
                        fontFamily="'Playfair Display', var(--font-playfair), serif"
                        color="#263A33"
                        fontWeight="600"
                      >
                        {card.title}
                      </Heading>
                      <Box
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                        color="rgba(46,46,46,0.72)"
                        lineHeight="1.6"
                        fontSize="12.5px"
                        mb={5}
                        sx={richTextStyles}
                        dangerouslySetInnerHTML={{ __html: card.body || "" }}
                      />
                    </Box>

                    <Button
                      role="group"
                      w="full"
                      h="38px"
                      bg="rgba(86,117,109,0.06)"
                      color="#263A33"
                      border="1px solid"
                      borderColor="rgba(86,117,109,0.2)"
                      borderRadius="full"
                      fontSize="12.5px"
                      fontWeight="600"
                      letterSpacing="0.02em"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={2.5}
                      boxShadow="0 1px 2px rgba(86,117,109,0.04)"
                      transition="all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)"
                      _hover={{ 
                        bg: "#56756D", 
                        color: "white", 
                        borderColor: "#56756D", 
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px -2px rgba(86,117,109,0.3)" 
                      }}
                      _active={{
                        transform: "translateY(0px)",
                        boxShadow: "0 2px 6px rgba(86,117,109,0.2)"
                      }}
                      onClick={() => scrollToApply(card.title)}
                    >
                      <Text as="span">Explore This Pathway</Text>
                      <Circle
                        size="22px"
                        bg="white"
                        color="#56756D"
                        boxShadow="0 1px 3px rgba(0,0,0,0.06)"
                        transition="all 0.25s ease"
                        _groupHover={{
                          bg: "rgba(255,255,255,0.22)",
                          color: "white",
                          transform: "translateX(3px)",
                        }}
                      >
                        <Icon as={FiArrowRight} boxSize="11px" />
                      </Circle>
                    </Button>
                  </Box>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════ OPENINGS SECTION ═══════════════ */}
      <Box py={{ base: 10, md: 14 }} bg="#FDFBFA" id="openings" position="relative">
        <Container maxW="6xl">
          <VStack spacing={2} textAlign="center" mb={{ base: 6, md: 8 }}>
            <Badge
              bg="rgba(201,169,96,0.18)"
              color="#8C6E2D"
              border="1px solid rgba(201,169,96,0.35)"
              borderRadius="full"
              px={3}
              py={0.5}
              fontSize="10.5px"
              fontWeight="800"
              letterSpacing="0.05em"
            >
              ACTIVE ROLES
            </Badge>

            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "24px", md: "32px" }}
              fontWeight="600"
              color="#263A33"
            >
              {content.openings.title}
            </Heading>

            <Box
              maxW="2xl"
              color="rgba(46,46,46,0.72)"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              lineHeight="1.6"
              fontSize="13.5px"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.openings.subtitle || "" }}
            />
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: openingsList.length > 2 ? 3 : 2 }} spacing={4.5}>
            {openingsList.map((opening, index) => (
              <MotionBox
                key={`${opening.title}-${index}`}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
              >
                <Box
                  bg="white"
                  borderRadius="18px"
                  p={5}
                  boxShadow="0 2px 10px rgba(86,117,109,0.05)"
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.12)"
                  _hover={{ transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(86,117,109,0.1)", borderColor: "#56756D" }}
                  transition="all 0.3s ease"
                  position="relative"
                  overflow="hidden"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  h="100%"
                >
                  {/* Decorative top bar */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    bg="linear-gradient(90deg, #56756D 0%, #A9CBB7 50%, #C9A960 100%)"
                  />

                  <Box>
                    <Heading
                      fontSize="16.5px"
                      mb={2.5}
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      color="#263A33"
                      fontWeight="600"
                      pt={1}
                    >
                      {opening.title}
                    </Heading>

                    <HStack spacing={2} mb={3} flexWrap="wrap">
                      {opening.location && (
                        <Tag
                          size="sm"
                          bg="rgba(169,203,183,0.15)"
                          color="#56756D"
                          fontFamily="'Inter', var(--font-inter), sans-serif"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                        >
                          <Icon as={FiMapPin} mr={1} boxSize="10px" />
                          <Text fontSize="11px" fontWeight="600">{opening.location}</Text>
                        </Tag>
                      )}
                      {opening.type && (
                        <Tag
                          size="sm"
                          bg="rgba(201,169,96,0.12)"
                          color="#8B7432"
                          fontFamily="'Inter', var(--font-inter), sans-serif"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                        >
                          <Icon as={FiClock} mr={1} boxSize="10px" />
                          <Text fontSize="11px" fontWeight="600">{opening.type}</Text>
                        </Tag>
                      )}
                    </HStack>

                    {opening.summary && (
                      <Box
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                        color="rgba(46,46,46,0.72)"
                        lineHeight="1.55"
                        fontSize="12.5px"
                        mb={4}
                        sx={richTextStyles}
                        dangerouslySetInnerHTML={{ __html: opening.summary }}
                      />
                    )}
                  </Box>

                  <HStack justify="space-between" pt={2.5} borderTop="1px solid" borderColor="rgba(86,117,109,0.08)">
                    <Button
                      variant="link"
                      color="#56756D"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      fontSize="12px"
                      fontWeight="600"
                      rightIcon={<FiArrowRight boxSize="11px" />}
                      _hover={{ color: "#263A33" }}
                      onClick={() => setActiveOpening(opening)}
                    >
                      View Details
                    </Button>

                    <Button
                      size="xs"
                      bg="rgba(86,117,109,0.1)"
                      color="#263A33"
                      borderRadius="full"
                      fontWeight="600"
                      px={3}
                      _hover={{ bg: "#56756D", color: "white" }}
                      onClick={() => scrollToApply(opening.title)}
                    >
                      Apply
                    </Button>
                  </HStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ═══════════════ APPLICATION FORM ═══════════════ */}
      <Box
        py={{ base: 10, md: 14 }}
        bg="linear-gradient(180deg, #F4F1EC 0%, #E9F2ED 50%, #FDFBFA 100%)"
        ref={applySectionRef}
        id="careers-apply"
        position="relative"
      >
        <Container maxW="4xl" position="relative" zIndex={1}>
          <VStack spacing={2} textAlign="center" mb={{ base: 5, md: 6 }}>
            <Badge
              bg="rgba(86,117,109,0.1)"
              color="#56756D"
              borderRadius="full"
              px={3}
              py={0.5}
              fontSize="10.5px"
              fontWeight="700"
              letterSpacing="0.05em"
            >
              START YOUR JOURNEY
            </Badge>

            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "24px", md: "30px" }}
              fontWeight="600"
              color="#263A33"
            >
              {content.form.title}
            </Heading>

            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="rgba(46,46,46,0.72)"
              lineHeight="1.55"
              maxW="2xl"
              fontSize="13px"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.form.subtitle || "" }}
            />
          </VStack>

          <MotionBox
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Box
              as="form"
              ref={form}
              onSubmit={sendEmail}
              bg="rgba(255,255,255,0.96)"
              backdropFilter="blur(16px)"
              p={{ base: 5, md: 7 }}
              borderRadius="22px"
              boxShadow="0 8px 30px -4px rgba(86,117,109,0.12)"
              border="1px solid"
              borderColor="rgba(86,117,109,0.14)"
            >
              <input type="hidden" name="form_type" value="Careers Form" />

              <HStack justify="space-between" borderBottom="1px solid" borderColor="rgba(86, 117, 109, 0.1)" pb={2.5} mb={3.5}>
                <Text fontSize="14px" fontWeight="600" color="#263A33" fontFamily="'Playfair Display', serif">
                  Application Details
                </Text>
                <Text fontSize="11px" color="rgba(46,46,46,0.6)" fontFamily="'Inter', sans-serif">
                  All fields marked with * are required.
                </Text>
              </HStack>

              {/* Row 1: Name & Email */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} mb={3}>
                <StyledField
                  label={`${content.form.name_label} *`}
                  name="full_name"
                  isRequired
                  icon={FiUser}
                  placeholder="e.g. Dr. Maya Sharma"
                />
                <StyledField
                  label={`${content.form.email_label} *`}
                  name="email"
                  type="email"
                  isRequired
                  icon={FiMail}
                  placeholder="maya@example.com"
                />
              </SimpleGrid>

              {/* Row 2: Role & Phone */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} mb={3}>
                <FormControl isRequired>
                  <FormLabel
                    requiredIndicator={null}
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    color="#3D5A52"
                    fontSize="11.5px"
                    fontWeight="600"
                    letterSpacing="0.02em"
                    mb={1}
                  >
                    <HStack spacing={1.5}>
                      <Icon as={FiBriefcase} boxSize="13px" color="#56756D" />
                      <Text>{content.form.role_label} *</Text>
                    </HStack>
                  </FormLabel>
                  <ModernSelect
                    name="position"
                    value={position}
                    onChange={setPosition}
                    placeholder="Select clinical role"
                    h="38px"
                    fontSize="12.5px"
                    borderRadius="12px"
                    options={careerRoleOptions}
                  />
                </FormControl>

                <StyledField
                  label={content.form.phone_label}
                  name="phone"
                  type="tel"
                  icon={FiPhone}
                  placeholder="+91 98765 43210"
                />
              </SimpleGrid>

              {/* Row 3: Resume Link & Phone Permission */}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} mb={3}>
                <StyledField
                  label={content.form.resume_label}
                  name="link"
                  placeholder={content.form.resume_hint}
                  icon={FiFileText}
                />

                <FormControl isRequired>
                  <FormLabel
                    requiredIndicator={null}
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    color="#3D5A52"
                    fontSize="11.5px"
                    fontWeight="600"
                    letterSpacing="0.02em"
                    mb={1}
                  >
                    <HStack spacing={1.5}>
                      <Icon as={FiPhone} boxSize="13px" color="#56756D" />
                      <Text>Comfortable via phone? *</Text>
                    </HStack>
                  </FormLabel>
                  <HStack
                    h="38px"
                    px={3.5}
                    bg="#FDFBFA"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.22)"
                    justify="space-between"
                  >
                    <Text fontSize="12px" color="rgba(46,46,46,0.7)" fontFamily="'Inter', sans-serif">
                      Phone call screening:
                    </Text>
                    <RadioGroup value={comfortable} onChange={setComfortable} name="comfortable">
                      <HStack spacing={4}>
                        <Radio value="Yes" colorScheme="green" size="sm">
                          <Text fontFamily="'Inter', sans-serif" fontSize="12px" color="#263A33">Yes</Text>
                        </Radio>
                        <Radio value="No" colorScheme="green" size="sm">
                          <Text fontFamily="'Inter', sans-serif" fontSize="12px" color="#263A33">No</Text>
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  </HStack>
                </FormControl>
              </SimpleGrid>

              {/* Row 4: Cover Letter */}
              <FormControl mb={3.5}>
                <FormLabel
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  color="#3D5A52"
                  fontSize="11.5px"
                  fontWeight="600"
                  letterSpacing="0.02em"
                  mb={1}
                >
                  <HStack spacing={1.5}>
                    <Icon as={FiMessageSquare} boxSize="13px" color="#56756D" />
                    <Text>{content.form.message_label} (Optional)</Text>
                  </HStack>
                </FormLabel>
                <Textarea
                  name="message"
                  placeholder="Briefly introduce your clinical approach, experience, and what draws you to MLC..."
                  bg="#FDFBFA"
                  borderRadius="12px"
                  borderColor="rgba(86,117,109,0.22)"
                  fontSize="12.5px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  rows={2}
                  minH="54px"
                  _focus={{
                    borderColor: "#56756D",
                    boxShadow: "0 0 0 1px #56756D",
                  }}
                  _hover={{ borderColor: "rgba(86,117,109,0.4)" }}
                  _placeholder={{ color: "gray.400" }}
                  transition="all 0.2s"
                />
              </FormControl>

              {/* Row 5: Submit & Direct Email Alternative */}
              <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3} pt={1}>
                <Button
                  type="submit"
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  h="40px"
                  px={8}
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight="600"
                  fontSize="13px"
                  shadow="sm"
                  _hover={{ bg: "#425C55", shadow: "0 4px 12px rgba(86,117,109,0.25)" }}
                  transition="all 0.2s"
                  rightIcon={<FiSend boxSize="12px" />}
                >
                  {content.form.submit_label}
                </Button>

                <HStack spacing={1.5} fontSize="12px" color="rgba(46,46,46,0.65)" fontFamily="'Inter', sans-serif">
                  <Icon as={FiMail} color="#56756D" boxSize="13px" />
                  <Text>Prefer direct email?</Text>
                  <Link
                    href="mailto:therapy@mlchealth.in"
                    color="#56756D"
                    fontWeight="700"
                    textDecoration="underline"
                    _hover={{ color: "#263A33" }}
                  >
                    therapy@mlchealth.in
                  </Link>
                </HStack>
              </HStack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* ═══════════════ FOOTER BANNER ═══════════════ */}
      <Box py={{ base: 10, md: 12 }} bg="#263A33" color="white" position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="-40px"
          right="-40px"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201,169,96,0.15) 0%, transparent 70%)"
          filter="blur(50px)"
        />

        <Container maxW="5xl" position="relative" zIndex={1}>
          <MotionBox
            textAlign="center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "24px", md: "34px" }}
              fontWeight="600"
              color="#F0D591"
              mb={3}
            >
              {content.footer.title}
            </Heading>

            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="rgba(255,255,255,0.8)"
              lineHeight="1.6"
              fontSize="14px"
              maxW="2xl"
              mx="auto"
              mb={6}
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.footer.body || "" }}
            />

            <Button
              as="a"
              href={content.footer.cta_link || "mailto:therapy@mlchealth.in"}
              bg="rgba(201,169,96,0.2)"
              border="1px solid rgba(201,169,96,0.4)"
              color="#F0D591"
              borderRadius="full"
              h="40px"
              px={7}
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontWeight="600"
              fontSize="13px"
              _hover={{ bg: "rgba(201,169,96,0.3)", transform: "translateY(-1px)" }}
              transition="all 0.2s ease"
              leftIcon={<FiMail boxSize="13px" />}
            >
              {content.footer.cta_label}
            </Button>
          </MotionBox>
        </Container>
      </Box>

      {/* ═══════════════ OPENING DETAIL MODAL ═══════════════ */}
      {activeOpening && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 16, 20, 0.5)"
          backdropFilter="blur(8px)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => setActiveOpening(null)}
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            bg="white"
            borderRadius="22px"
            boxShadow="0 24px 80px rgba(0,0,0,0.18)"
            maxW="600px"
            w="100%"
            p={{ base: 6, md: 8 }}
            onClick={(e) => e.stopPropagation()}
            position="relative"
            overflow="hidden"
          >
            {/* Top accent bar */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="3px"
              bg="linear-gradient(90deg, #56756D 0%, #A9CBB7 50%, #C9A960 100%)"
            />

            <HStack justify="space-between" align="start" mb={2}>
              <Heading
                fontSize="20px"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                color="#263A33"
                fontWeight="600"
                pt={1}
              >
                {activeOpening.title}
              </Heading>

              <Button
                size="xs"
                variant="ghost"
                onClick={() => setActiveOpening(null)}
                borderRadius="full"
                color="gray.400"
                _hover={{ color: "gray.700" }}
              >
                <Icon as={FiX} boxSize="14px" />
              </Button>
            </HStack>

            <HStack spacing={2} mb={4} flexWrap="wrap">
              {activeOpening.location && (
                <Tag size="sm" bg="rgba(169,203,183,0.15)" color="#56756D" borderRadius="full" px={2.5} py={0.5}>
                  <Icon as={FiMapPin} mr={1} boxSize="10px" />
                  <Text fontSize="11px" fontWeight="600">{activeOpening.location}</Text>
                </Tag>
              )}
              {activeOpening.type && (
                <Tag size="sm" bg="rgba(201,169,96,0.12)" color="#8B7432" borderRadius="full" px={2.5} py={0.5}>
                  <Icon as={FiClock} mr={1} boxSize="10px" />
                  <Text fontSize="11px" fontWeight="600">{activeOpening.type}</Text>
                </Tag>
              )}
            </HStack>

            {activeOpening.summary && (
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="rgba(46,46,46,0.8)"
                lineHeight="1.6"
                fontSize="13px"
                mb={3}
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: activeOpening.summary }}
              />
            )}

            {activeOpening.details && (
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="rgba(46,46,46,0.8)"
                lineHeight="1.6"
                fontSize="13px"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: activeOpening.details }}
              />
            )}

            <HStack mt={6} justify="space-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveOpening(null)}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="rgba(46,46,46,0.6)"
                _hover={{ color: "#263A33" }}
              >
                Close
              </Button>
              <Button
                size="sm"
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={5}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="600"
                fontSize="12.5px"
                _hover={{ bg: "#425C55" }}
                transition="all 0.2s ease"
                rightIcon={<FiArrowRight boxSize="11px" />}
                onClick={() => {
                  setActiveOpening(null);
                  scrollToApply(activeOpening.title);
                }}
              >
                {content.openings.apply_label || "Apply to this role"}
              </Button>
            </HStack>
          </MotionBox>
        </Box>
      )}

    </Box>
  );
}

/* ───── Styled Form Field Component ───── */
function StyledField({ label, name, type = "text", isRequired = false, placeholder, icon, mb = 0 }) {
  return (
    <FormControl isRequired={isRequired} mb={mb}>
      <FormLabel
        requiredIndicator={null}
        fontFamily="'Inter', var(--font-inter), sans-serif"
        color="#3D5A52"
        fontSize="11.5px"
        fontWeight="600"
        letterSpacing="0.02em"
        mb={1}
      >
        <HStack spacing={1.5}>
          {icon && <Icon as={icon} boxSize="13px" color="#56756D" />}
          <Text>{label}</Text>
        </HStack>
      </FormLabel>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        bg="#FDFBFA"
        h="38px"
        borderRadius="12px"
        borderColor="rgba(86,117,109,0.22)"
        fontSize="12.5px"
        fontFamily="'Inter', var(--font-inter), sans-serif"
        _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
        _hover={{ borderColor: "rgba(86,117,109,0.4)" }}
        _placeholder={{ color: "gray.400" }}
        transition="all 0.2s"
      />
    </FormControl>
  );
}
