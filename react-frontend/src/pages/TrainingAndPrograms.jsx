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

export default function TrainingAndPrograms() {
  return (
    <Box bg="#F6F6F4" py={20}>
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
            src="/training-programs.jpg"
            alt="Training and Programs"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            fontWeight="600"
          >
            Training & Programs
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            Our professional training programs and structured therapeutic courses are
            designed to empower both therapists and clients. Each offering integrates
            evidence-based practices with real-world applications.
          </Text>
        </VStack>

        {/* PROGRAM SECTIONS */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={16}>
          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              mb={2}
              color="#2E2E2E"
            >
              Therapist 101
            </Heading>
            <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
              A foundational course for early-career therapists covering essential
              counselling skills, self-awareness, and ethics. Learn to build strong
              therapeutic alliances and grow with guidance.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              mb={2}
              color="#2E2E2E"
            >
              Enhance Your Therapy Management Skills
            </Heading>
            <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
              A specialized program focusing on therapist organization — from session
              documentation and scheduling to reflective journaling and maintaining a
              paperless practice. Ideal for professionals managing multiple clients.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              mb={2}
              color="#2E2E2E"
            >
              Anxiety & Stress Management (21–28 Day Program)
            </Heading>
            <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
              A structured, guided course designed to teach you anxiety regulation
              and stress reduction through practical tools, journaling, and
              therapist-led check-ins. Built to encourage consistent, mindful practice.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              mb={2}
              color="#2E2E2E"
            >
              Anger Management Program
            </Heading>
            <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
              A short-term evidence-based program designed to help individuals
              understand triggers, regulate emotional reactions, and channel energy
              constructively for long-term balance.
            </Text>
          </Box>
        </SimpleGrid>

        {/* FAQ SECTION */}
        <Box mt={10}>
          <Heading
            fontFamily="'Playfair Display', serif"
            mb={6}
            textAlign="center"
            color="#2E2E2E"
          >
            Frequently Asked Questions
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
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
            ].map((item, i) => (
              <AccordionItem key={i} border="none">
                <AccordionButton _expanded={{ bg: "#A9CBB7", color: "black" }}>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontFamily="'Lato', sans-serif"
                    fontWeight="medium"
                  >
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Lato', sans-serif">
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <VStack mt={10}>
            <Text fontFamily="'Lato', sans-serif">
              Didn’t find your question? Reach out to us anytime.
            </Text>
            <Button
              bg="#A9CBB7"
              color="black"
              borderRadius="full"
              _hover={{ bg: "#C9A960", color: "white" }}
              as="a"
              href="/contactus"
            >
              Contact Us
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
