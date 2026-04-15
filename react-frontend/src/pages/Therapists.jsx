import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import {
  FiUsers,
  FiCompass,
  FiBriefcase,
  FiMessageCircle,
  FiAward,
  FiBookOpen,
  FiLayers,
  FiUserCheck,
} from "react-icons/fi";

const defaultTherapistsContent = {
  hero: {
    title: "For Therapists",
    body_one:
      "<p>MLC Therapy is building a space for therapists who want to practice with clarity, ethical grounding, and professional support.</p>",
    body_two:
      "<p>Whether you are an early-career clinician, a therapist building your practice, or someone looking for reflective supervision, we are creating spaces where therapists can grow thoughtfully.</p>",
    primary_label: "Explore Supervision",
    primary_link: "/supervision",
    secondary_label: "Join the MLC Community",
    secondary_link: "/careers",
  },
  why: {
    title: "Why We Built MLC",
    body:
      "<p>Many therapists in India enter the field with deep passion for helping others but quickly encounter burnout, isolation, and lack of clinical support. MLC Therapy was created to address these gaps by building a space where therapists can practice ethically, sustainably, and with community.</p>",
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
        body:
          "A growing network of therapists who value reflective practice and professional dialogue.",
      },
      {
        icon: "compass",
        title: "Sustainable Practice",
        body:
          "MLC aims to support therapists in building meaningful and sustainable careers in mental health.",
      },
    ],
  },
  apply: {
    title: "Apply to Join the Therapist Workspace",
    body:
      "<p>MLC offers a secure workspace for therapists: client collaboration, shared resources, session tools, and a premium studio designed to support your practice.</p>",
    primary_label: "Apply as a therapist",
    primary_link: "/therapist-apply",
    secondary_label: "Already approved? Sign in",
    secondary_link: "/login/therapist",
  },
  supervision: {
    title: "MLC Supervision Cohorts",
    body:
      "<p>Our supervision cohorts provide structured spaces for therapists to reflect on their clinical work, explore their therapeutic identity, and strengthen their practice.</p>",
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
      "<p>We are always interested in connecting with therapists who value reflective practice and ethical care.</p>",
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
        body: "We encourage therapists to continually reflect on their work and their growth.",
      },
      {
        title: "Thoughtful Care",
        body: "We believe good therapy requires depth, attention, and care.",
      },
    ],
  },
  cta: {
    title: "Interested in being part of MLC?",
    button_label: "Connect With Us",
    button_link: "/careers",
  },
};

const iconMap = {
  users: FiUsers,
  compass: FiCompass,
  briefcase: FiBriefcase,
  message: FiMessageCircle,
  award: FiAward,
  book: FiBookOpen,
  layers: FiLayers,
  usercheck: FiUserCheck,
};

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.35rem" },
};

export default function Therapists() {
  const [content, setContent] = useState(defaultTherapistsContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiGet("therapists-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultTherapistsContent.hero, ...(entry.hero || {}) },
            why: {
              ...defaultTherapistsContent.why,
              ...(entry.why || {}),
              cards: Array.isArray(entry.why?.cards)
                ? entry.why.cards
                : defaultTherapistsContent.why.cards,
            },
            apply: { ...defaultTherapistsContent.apply, ...(entry.apply || {}) },
            supervision: {
              ...defaultTherapistsContent.supervision,
              ...(entry.supervision || {}),
              cards: Array.isArray(entry.supervision?.cards)
                ? entry.supervision.cards
                : defaultTherapistsContent.supervision.cards,
            },
            learning: {
              ...defaultTherapistsContent.learning,
              ...(entry.learning || {}),
              cards: Array.isArray(entry.learning?.cards)
                ? entry.learning.cards
                : defaultTherapistsContent.learning.cards,
            },
            work: {
              ...defaultTherapistsContent.work,
              ...(entry.work || {}),
              cards: Array.isArray(entry.work?.cards)
                ? entry.work.cards
                : defaultTherapistsContent.work.cards,
            },
            values: {
              ...defaultTherapistsContent.values,
              ...(entry.values || {}),
              bubbles: Array.isArray(entry.values?.bubbles)
                ? entry.values.bubbles
                : defaultTherapistsContent.values.bubbles,
            },
            cta: { ...defaultTherapistsContent.cta, ...(entry.cta || {}) },
          });
        }
      } catch {
        setContent(defaultTherapistsContent);
      }
    };
    fetchContent();
  }, []);

  const mappedWhyCards = useMemo(
    () =>
      content.why.cards.map((card) => ({
        ...card,
        icon: iconMap[card.icon] || FiUsers,
      })),
    [content.why.cards]
  );

  const mappedSupervisionCards = useMemo(
    () =>
      content.supervision.cards.map((card) => ({
        ...card,
        icon: iconMap[card.icon] || FiUsers,
      })),
    [content.supervision.cards]
  );

  const mappedLearningCards = useMemo(
    () =>
      content.learning.cards.map((card) => ({
        ...card,
        icon: iconMap[card.icon] || FiBookOpen,
      })),
    [content.learning.cards]
  );

  const mappedWorkCards = useMemo(
    () =>
      content.work.cards.map((card) => ({
        ...card,
        icon: iconMap[card.icon] || FiBriefcase,
      })),
    [content.work.cards]
  );

  return (
    <Box bg="#F9F9F9">
      <Helmet>
        <title>For Therapists | MLC Therapy</title>
        <meta
          name="description"
          content="MLC Therapy offers supervision, community, and structured professional development for therapists practicing with clarity and ethical grounding."
        />
        <meta property="og:image" content="https://mlchealth.in/hero-bg.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/hero-bg.jpg" />
      </Helmet>

      {/* HERO */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h1"
              fontFamily="'Playfair Display', serif"
              fontSize="clamp(2.5rem, 5vw, 4rem)"
              color="#2E2E2E"
              fontWeight="500"
            >
              {content.hero.title}
            </Heading>
            <Box
              fontFamily="'Inter', sans-serif"
              color="#2E2E2E"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
              lineHeight="1.6"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body_one }}
            />
            <Box
              fontFamily="'Inter', sans-serif"
              color="#2E2E2E"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
              lineHeight="1.6"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body_two }}
            />
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                bg="#A9CBB7"
                color="#2E2E2E"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#97BFA9" }}
                as="a"
                href={content.hero.primary_link}
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
              >
                {content.hero.primary_label}
              </Button>
              <Button
                bg="transparent"
                border="1px solid #C9A960"
                color="#2E2E2E"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#FBF8F3" }}
                as="a"
                href={content.hero.secondary_link}
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
              >
                {content.hero.secondary_label}
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* WHY MLC EXISTS */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="500"
          >
            {content.why.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.why.body }}
          />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {mappedWhyCards.map((card) => (
              <Box
                key={`${card.title}-${card.body}`}
                bg="white"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                {card.cta_link && card.cta_label && (
                  <Button
                    mt={4}
                    size="sm"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    borderRadius="12px"
                    _hover={{ bg: "#97BFA9" }}
                    as="a"
                    href={card.cta_link}
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                  >
                    {card.cta_label}
                  </Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* THERAPIST PORTAL CTA */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h2"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              fontWeight="500"
            >
              {content.apply.title}
            </Heading>
            <Box
              fontFamily="'Inter', sans-serif"
              color="#2E2E2E"
              maxW="2xl"
              lineHeight="1.6"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.apply.body }}
            />
            <HStack spacing={4} flexWrap="wrap" justify="center">
              {content.apply.primary_label && (
                <Button
                  as="a"
                  href={content.apply.primary_link}
                  bg="#A9CBB7"
                  color="#2E2E2E"
                >
                  {content.apply.primary_label}
                </Button>
              )}
              {content.apply.secondary_label && (
                <Button
                  as="a"
                  href={content.apply.secondary_link}
                  variant="outline"
                  colorScheme="teal"
                >
                  {content.apply.secondary_label}
                </Button>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* SUPERVISION */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="500"
          >
            {content.supervision.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.supervision.body }}
          />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {mappedSupervisionCards.map((card) => (
              <Box
                key={card.title}
                bg="#FBF8F3"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                display="flex"
                gap={4}
                alignItems="flex-start"
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mt={1} />
                <Box>
                  <Heading
                    size="md"
                    color="#2E2E2E"
                    mb={2}
                  >
                    {card.title}
                  </Heading>
                  <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                    {card.body}
                  </Text>
                  {card.cta_label && card.cta_link && (
                    <Button
                      mt={4}
                      size="sm"
                      bg="#A9CBB7"
                      color="#2E2E2E"
                      borderRadius="12px"
                      _hover={{ bg: "#97BFA9" }}
                      as="a"
                      href={card.cta_link}
                      fontFamily="'Inter', sans-serif"
                      fontWeight="600"
                    >
                      {card.cta_label}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* TRAINING & DEVELOPMENT */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="500"
          >
            {content.learning.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {mappedLearningCards.map((card) => (
              <Box
                key={card.title}
                bg="white"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                {card.cta_label && card.cta_link && (
                  <Button
                    mt={4}
                    size="sm"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    borderRadius="12px"
                    _hover={{ bg: "#97BFA9" }}
                    as="a"
                    href={card.cta_link}
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                  >
                    {card.cta_label}
                  </Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* WORK WITH MLC */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={8}
            fontWeight="500"
          >
            {content.work.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.work.body }}
          />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {mappedWorkCards.map((card) => (
              <Box
                key={card.title}
                bg="#FBF8F3"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                {card.cta_label && card.cta_link && (
                  <Button
                    mt={4}
                    size="sm"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    borderRadius="12px"
                    _hover={{ bg: "#97BFA9" }}
                    as="a"
                    href={card.cta_link}
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                  >
                    {card.cta_label}
                  </Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CLINICAL VALUES */}
      <Box bg="#FBF8F3" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="500"
          >
            {content.values.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {content.values.bubbles.map((bubble) => (
              <Box
                key={bubble.title}
                bg="white"
                borderRadius="18px"
                p={6}
                textAlign="center"
                boxShadow="0px 6px 16px rgba(0,0,0,0.05)"
              >
                <Heading
                  size="md"
                  color="#2E2E2E"
                  mb={2}
                >
                  {bubble.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {bubble.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#A9CBB7" py={{ base: 16, md: 20 }} px={6} textAlign="center">
        <Container maxW="4xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={4}
            fontWeight="500"
          >
            {content.cta.title}
          </Heading>
          <Button
            bg="white"
            color="#2E2E2E"
            borderRadius="14px"
            px={8}
            py={6}
            _hover={{ bg: "#FBF8F3" }}
            as="a"
            href={content.cta.button_link}
            fontFamily="'Inter', sans-serif"
            fontWeight="600"
          >
            {content.cta.button_label}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
