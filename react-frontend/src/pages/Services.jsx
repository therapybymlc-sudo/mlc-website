import {
  Box,
  SimpleGrid,
  Text,
  Heading,
  VStack,
  Container,
  Button,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { apiGet } from "../api";

const defaultServicesContent = {
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

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.1rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.25rem" },
};

const fallbackServices = [
  {
    title: "Individual Therapy",
    subtitle: "Personalized care for your unique story.",
    desc: "A safe, confidential space to explore emotions, patterns, and goals through evidence-based and compassionate therapy. Our therapists help you reconnect with your strengths and move forward with clarity.",
    img: "/service1_new.jpg",
    link: "/individual-therapy",
  },
  {
    title: "Couples Therapy",
    subtitle: "For deeper connection and understanding.",
    desc: "Helping couples navigate communication challenges, rebuild trust, and strengthen their emotional bond through guided and structured conversations that foster empathy and growth.",
    img: "/service4_new.jpg",
    link: "/couples-therapy",
  },
  {
    title: "Adolescent Therapy",
    subtitle: "Helping teens find safety in expression and confidence in themselves.",
    desc: "We support teens in understanding emotions, developing coping skills, and improving self-esteem in a nurturing environment that encourages openness and respect.",
    img: "/service5_new.jpg",
    link: "/adolescent-therapy",
  },
  {
    title: "Group & Support Circles",
    subtitle: "For connection, reflection, and shared growth.",
    desc: "A collective approach to healing, where individuals share experiences, reflect, and find solidarity through guided group processes and themed discussions.",
    img: "/service2_new.jpg",
    link: "/group-support-circles",
  },
];

export default function Services() {
  const [services, setServices] = useState(fallbackServices);
  const [content, setContent] = useState(defaultServicesContent);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("services/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      } catch {
        setServices(fallbackServices);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      setContentLoading(true);
      try {
        const res = await apiGet("services-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultServicesContent.hero, ...(entry.hero || {}) },
            portal: { ...defaultServicesContent.portal, ...(entry.portal || {}) },
            services: { ...defaultServicesContent.services, ...(entry.services || {}) },
            programs: {
              ...defaultServicesContent.programs,
              ...(entry.programs || {}),
              cards: Array.isArray(entry.programs?.cards)
                ? entry.programs.cards
                : defaultServicesContent.programs.cards,
            },
            approach: { ...defaultServicesContent.approach, ...(entry.approach || {}) },
            faq: {
              ...defaultServicesContent.faq,
              ...(entry.faq || {}),
              items: Array.isArray(entry.faq?.items)
                ? entry.faq.items
                : defaultServicesContent.faq.items,
            },
            cta: { ...defaultServicesContent.cta, ...(entry.cta || {}) },
          });
        }
      } catch {
        setContent(defaultServicesContent);
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <Box>
      <Helmet>
        <title>
          Online Therapy Services in India | Individual, Couples, Adolescent &
          Supervision | MLC Health & Wellness Centre
        </title>
        <meta
          name="description"
          content="MLC Health & Wellness Centre offers online therapy across India including Individual Therapy, Couples Therapy, Adolescent Therapy, Group Support Circles, Therapist Supervision, Mindfulness Sessions, and structured Anxiety & Stress Management programs. Serving Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata and more."
        />
              <meta property="og:image" content="https://mlchealth.in/service1_new.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/service1_new.jpg" />
      </Helmet>
      {/* HERO / INTRO */}
      <Box bg="#F6F6F4" py={24} px={8}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              fontFamily="'Playfair Display', serif"
              fontWeight="600"
              color="#2E2E2E"
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              {content.hero.title}
            </Heading>
            <Box
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Inter', sans-serif"
              fontSize="lg"
              lineHeight="1.8"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body_one }}
            />
            <Box
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Inter', sans-serif"
              fontSize="lg"
              lineHeight="1.8"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body_two }}
            />
            <Box
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Inter', sans-serif"
              fontSize="md"
              lineHeight="1.8"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.coverage_line }}
            />
            {contentLoading && (
              <Text fontSize="sm" color="#56756D">
                Refreshing content…
              </Text>
            )}
          </VStack>
        </Container>
      </Box>

      {/* PORTAL CTA */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E">
              {content.portal.title}
            </Heading>
            <Box
              fontFamily="'Inter', sans-serif"
              color="#2E2E2E"
              maxW="2xl"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.portal.body }}
            />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
              <Button
                as={Link}
                to={content.portal.client_link}
                bg="#A9CBB7"
                color="#2E2E2E"
              >
                {content.portal.client_label}
              </Button>
              <Button
                as={Link}
                to={content.portal.therapist_link}
                variant="outline"
                colorScheme="teal"
              >
                {content.portal.therapist_label}
              </Button>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* SERVICES GRID */}
      <Box bg="#56756D" py={24} px={8}>
        <Container maxW="7xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="white"
            mb={12}
            textAlign="center"
            fontWeight="600"
          >
            {content.services.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {services.map((service) => (
              <Box
                as={Link}
                to={service.cta_link || service.link || "/services"}
                key={service.id || service.title}
                bg="white"
                borderRadius="2xl"
                boxShadow="lg"
                p={6}
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: "xl",
                }}
              >
                <Image
                  src={service.image_url || service.img}
                  alt={service.title}
                  borderRadius="xl"
                  mb={5}
                  objectFit="cover"
                  h="200px"
                  w="100%"
                />
                <Heading
                  fontSize="xl"
                  mb={2}
                  color="#2E2E2E"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                >
                  {service.title}
                </Heading>
                <Text color="#C9A960" fontWeight="500" mb={2}>
                  {service.subtitle}
                </Text>
                <Text
                  fontSize="sm"
                  color="#555"
                  fontFamily="'Inter', sans-serif"
                  lineHeight="1.7"
                  sx={{
                    "ul, ol": { paddingLeft: "1.1rem", marginTop: "0.5rem" },
                    li: { marginBottom: "0.25rem" },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: service.description || service.desc || "",
                  }}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* SPECIALIZED PROGRAMS */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            fontWeight="600"
            mb={10}
          >
            {content.programs.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {content.programs.cards.map((p) => (
              <Box
                as={Link}
                to={p.link}
                key={p.title}
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="md"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
              >
                <Heading
                  fontSize="lg"
                  mb={3}
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                >
                  {p.title}
                </Heading>
                <Text
                  fontFamily="'Inter', sans-serif"
                  color="#2E2E2E"
                  fontSize="sm"
                  lineHeight="1.7"
                >
                  {p.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* OUR APPROACH */}
      <Box bg="#F6F6F4" py={24} px={8}>
        <Container maxW="6xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={6}
            fontWeight="600"
          >
            {content.approach.title}
          </Heading>
          <Box
            maxW="3xl"
            mx="auto"
            color="#2E2E2E"
            fontFamily="'Inter', sans-serif"
            lineHeight="1.8"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.approach.body }}
          />
        </Container>
      </Box>

      {/* FAQ */}
      <Box bg="#FFFFFF" py={24} px={8}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={8}
            textAlign="center"
            fontWeight="600"
          >
            {content.faq.title}
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {content.faq.items.map((item, i) => (
              <AccordionItem key={i} border="none">
                <AccordionButton _expanded={{ bg: "#A9CBB7", color: "black" }}>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontFamily="'Inter', sans-serif"
                    color="#2E2E2E"
                    fontWeight="medium"
                  >
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Inter', sans-serif">
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Box>

      {/* CTA */}
      <Box bg="#56756D" py={20} textAlign="center" color="white">
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            mb={6}
            letterSpacing="-0.5px"
          >
            {content.cta.title}
          </Heading>
          <Button
            bg="white"
            color="#2E2E2E"
            borderRadius="full"
            px={8}
            py={6}
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            _hover={{ bg: "#C9A960", color: "white" }}
            as="a"
            href={content.cta.button_link}
            boxShadow="md"
          >
            {content.cta.button_label}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
