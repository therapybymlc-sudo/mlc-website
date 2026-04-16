import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

const defaultTrainingContent = {
  hero: {
    title: "Training & Programs",
    body:
      "Our professional training programs and structured therapeutic courses are designed to empower both therapists and clients. Each offering integrates evidence-based practices with real-world applications.",
    image_url: "/training-programs.jpg",
  },
  programs: {
    title: "Programs & Courses",
    cards: [
      {
        title: "Therapist 101",
        body:
          "A foundational course for early-career therapists covering essential counselling skills, self-awareness, and ethics. Learn to build strong therapeutic alliances and grow with guidance.",
      },
      {
        title: "Enhance Your Therapy Management Skills",
        body:
          "A specialized program focusing on therapist organization — from session documentation and scheduling to reflective journaling and maintaining a paperless practice. Ideal for professionals managing multiple clients.",
      },
      {
        title: "Anxiety & Stress Management (21–28 Day Program)",
        body:
          "A structured, guided course designed to teach you anxiety regulation and stress reduction through practical tools, journaling, and therapist-led check-ins. Built to encourage consistent, mindful practice.",
      },
      {
        title: "Anger Management Program",
        body:
          "A short-term evidence-based program designed to help individuals understand triggers, regulate emotional reactions, and channel energy constructively for long-term balance.",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "Do I need prior experience to join?",
        a: "No. Our trainings and programs are designed to accommodate all experience levels — from new therapists to individuals exploring personal growth.",
      },
      {
        q: "Are the programs online or in-person?",
        a: "Most programs are available in both formats to make participation flexible and accessible.",
      },
      {
        q: "Do you provide certification after completion?",
        a: "Yes. Participants who complete structured programs or therapist trainings receive an MLC certificate of completion.",
      },
      {
        q: "Can organizations enroll their staff?",
        a: "Yes. We offer group registrations and corporate training partnerships upon request.",
      },
    ],
  },
  cta: {
    text: "Didn’t find your question? Reach out to us anytime.",
    button_label: "Contact Us",
    button_link: "/contactus",
  },
};

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.35rem" },
};

export default function TrainingAndPrograms() {
  const [content, setContent] = useState(defaultTrainingContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("training-programs-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultTrainingContent.hero, ...(entry.hero || {}) },
            programs: { ...defaultTrainingContent.programs, ...(entry.programs || {}) },
            faq: { ...defaultTrainingContent.faq, ...(entry.faq || {}) },
            cta: { ...defaultTrainingContent.cta, ...(entry.cta || {}) },
          });
        }
      } catch {
        setContent(defaultTrainingContent);
      }
    })();
  }, []);

  return (
    <Box bg="#F9F9F9" py={20}>
      <Helmet>
        <title>
          Therapy Training & Programs in India | MLC Health & Wellness Centre
        </title>
        <meta
          name="description"
          content="Professional training programs, anxiety and stress management courses, and therapist development programs offered online across India."
        />
              <meta property="og:image" content="https://mlchealth.in/training-programs.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/training-programs.jpg" />
      </Helmet>
      <Container maxW="6xl">
        {/* HERO */}
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src={content.hero.image_url || "/training-programs.jpg"}
            alt="Training and Programs"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            fontWeight="600"
          >
            {content.hero.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.hero.body }}
          />
        </VStack>

        {/* PROGRAM SECTIONS */}
        <Heading
          fontFamily="'Playfair Display', serif"
          color="#2E2E2E"
          fontWeight="600"
          mb={6}
          textAlign={{ base: "left", md: "center" }}
        >
          {content.programs.title}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={16}>
          {(content.programs.cards || []).map((card) => (
            <Box key={card.title}>
              <Heading
                size="md"
                fontFamily="'Playfair Display', serif"
                mb={2}
                color="#2E2E2E"
              >
                {card.title}
              </Heading>
              <Box fontFamily="'Inter', sans-serif" color="#2E2E2E" sx={richTextStyles} dangerouslySetInnerHTML={{ __html: card.body }} />
            </Box>
          ))}
        </SimpleGrid>

        {/* FAQ SECTION */}
        <Box mt={10}>
          <Heading
            fontFamily="'Playfair Display', serif"
            mb={6}
            textAlign="center"
            color="#2E2E2E"
          >
            {content.faq.title}
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {(content.faq.items || []).map((item, i) => (
              <AccordionItem key={i} border="none">
                <AccordionButton _expanded={{ bg: "#A9CBB7", color: "black" }}>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="medium"
                  >
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Inter', sans-serif">
                  <Box sx={richTextStyles} dangerouslySetInnerHTML={{ __html: item.a }} />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <VStack mt={10}>
            <Text fontFamily="'Inter', sans-serif">{content.cta.text}</Text>
            <Button
              bg="#A9CBB7"
              color="black"
              borderRadius="full"
              _hover={{ bg: "#C9A960", color: "white" }}
              as="a"
              href={content.cta.button_link}
            >
              {content.cta.button_label}
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
