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
  List,
  ListItem,
  SimpleGrid,
} from "@chakra-ui/react";
import LinkButton from "../../components/LinkButton";
import ActiveSupervisors from "../../components/ActiveSupervisors";

export const metadata = {
  title: 'Therapist Supervision & Cohorts | MLC Health & Wellness Centre',
  description: 'Reflective clinical supervision and therapist development cohorts in India. Online supervision for clinicians seeking identity clarity, ethical depth, and professional coherence.',
}

export default function SupervisionPage() {
  return (
    <Box bgGradient="linear(to-b, #F6F6F4, #E8ECE8)" py={20}>
      <Container maxW="6xl">
        <VStack spacing={8} textAlign="center" mb={16}>
          <Image src="/supervision.jpg" alt="Therapist Supervision" borderRadius="2xl" boxShadow="md" />
          <Heading fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
            Therapist Supervision & Reflective Cohorts
          </Heading>
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            p={{ base: 6, md: 10 }}
            maxW="4xl"
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <VStack spacing={6}>
              <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E" fontSize="lg">
                At MLC, supervision is not case management. It is therapist formation.
              </Text>
              <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                We offer structured online supervision across India for therapists who want
                depth, clarity, and professional coherence. Whether you are practicing in
                Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata or anywhere across
                India, our supervision cohorts are conducted virtually through secure platforms.
              </Text>
              <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                This is not a space for quick technique exchange. It is a space to develop the
                therapist you are becoming.
              </Text>
            </VStack>
          </Box>
        </VStack>

        <VStack align="stretch" spacing={10}>
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <Heading size="md" color="#2E2E2E" mb={4} fontFamily="'Playfair Display', var(--font-playfair), serif">
              A Therapist Development Model
            </Heading>
            <Text color="#2E2E2E" fontFamily="'Inter', var(--font-inter), sans-serif">
              MLC supervision cohorts are structured environments designed to help therapists
              develop professional identity, clinical lens clarity, ethical grounding, emotional
              regulation in practice, and session coherence and flow. This is supervision for
              therapists who want to feel less scattered and more aligned in their work.
            </Text>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <Heading size="md" color="#2E2E2E" mb={6} fontFamily="'Playfair Display', var(--font-playfair), serif">
              Core Pillars of the Cohort
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {[
                {
                  title: "1. Therapist Identity Development",
                  bullets: [
                    "What kind of therapist you are becoming",
                    "Which theoretical approach genuinely aligns with you",
                    "Where you feel fragmented or inconsistent",
                    "Where imitation replaces embodiment",
                  ],
                  note: "This creates professional stability.",
                },
                {
                  title: "2. Developing a Clear Clinical Lens",
                  bullets: [
                    "Conceptualize cases from a chosen approach",
                    "Identify client patterns through one primary lens",
                    "Understand what your framework prioritizes",
                    "Integrate techniques without losing structure",
                  ],
                  note: "This builds depth over confusion.",
                },
                {
                  title: "3. Self-of-the-Therapist Awareness",
                  bullets: [
                    "Countertransference and reactivity",
                    "Personal triggers in session",
                    "Regulation under emotional intensity",
                  ],
                  note: "Reflective professional awareness, not therapy for the therapist.",
                },
                {
                  title: "4. Ethical & Professional Maturity",
                  bullets: [
                    "Ethical backbone and boundary clarity",
                    "Confidence in difficult conversations",
                    "Decision-making in gray areas",
                  ],
                  note: "Ethics here is developmental, not mechanical.",
                },
              ].map((pillar) => (
                <Box
                  key={pillar.title}
                  bg="#F9F9F9"
                  borderRadius="xl"
                  p={6}
                  border="1px solid"
                  borderColor="blackAlpha.100"
                  transition="all 0.2s ease"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                >
                  <Heading size="sm" color="#2E2E2E" mb={3}>
                    {pillar.title}
                  </Heading>
                  <List fontFamily="'Inter', var(--font-inter), sans-serif" color="gray.700" pl={4} spacing={2} mb={4}>
                    {pillar.bullets.map((b) => (
                      <ListItem key={b}>• {b}</ListItem>
                    ))}
                  </List>
                  <Text color="#56756D" fontFamily="'Inter', var(--font-inter), sans-serif" fontSize="sm" fontWeight="500">
                    {pillar.note}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <Heading size="md" color="#2E2E2E" mb={6} fontFamily="'Playfair Display', var(--font-playfair), serif">
              Structure of Supervision at MLC
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              <VStack align="start" spacing={4}>
                <Heading size="sm" color="#2E2E2E">Individual Supervision</Heading>
                <Text color="gray.700" fontSize="sm">
                  One-on-one sessions tailored to your caseload, ethical dilemmas, and professional goals. Ideal for early-career therapists and clinicians navigating complex cases.
                </Text>
              </VStack>
              <VStack align="start" spacing={4}>
                <Heading size="sm" color="#2E2E2E">Group Supervision Cohorts</Heading>
                <Text color="gray.700" fontSize="sm">
                  Small, closed cohorts of 4-6 therapists. We focus on thematic exploration, case synthesis, and integration takeaways. Requires a 4-session commitment.
                </Text>
              </VStack>
            </SimpleGrid>
          </Box>
        </VStack>

        {/* Active Supervisors Section */}
        <Box mt={20}>
          <ActiveSupervisors />
        </Box>

        {/* FAQ */}
        <Box mt={16} bg="white" borderRadius="2xl" shadow="md" p={10}>
          <Heading fontFamily="'Playfair Display', var(--font-playfair), serif" mb={8} textAlign="center" color="#2E2E2E">
            Frequently Asked Questions
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
              { q: "Who can apply for supervision?", a: "Qualified counselling psychologists, clinical psychologists, and advanced trainees seeking clinical and ethical depth." },
              { q: "Is this available across India?", a: "Yes. All supervision is conducted online and accessible across India including Mumbai, Delhi, Bangalore and other major hubs." },
              { q: "How are cohorts formed?", a: "Cohorts are curated based on professional stage and reflective readiness to ensure safety and clinical alignment." },
              { q: "What is the commitment?", a: "Cohorts require a minimum 4-session commitment to allow for growth and professional trust-building." },
            ].map((item, i) => (
              <AccordionItem key={i} borderBottom="1px solid" borderColor="gray.100">
                 <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="500">{item.q}</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} color="gray.600">{item.a}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <VStack mt={12}>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif">Questions about supervision?</Text>
            <LinkButton href="/contactus" bg="#A9CBB7" color="#2E2E2E" borderRadius="full" px={10} _hover={{ bg: "#C9A960", color: "white" }}>Contact Us</LinkButton>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
