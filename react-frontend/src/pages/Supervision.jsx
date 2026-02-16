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
import { Helmet } from "react-helmet-async";

export default function Supervision() {
  return (
    <Box bgGradient="linear(to-b, #F6F6F4, #E8ECE8)" py={20}>
      <Helmet>
        <title>
          Therapist Supervision in India | Reflective Clinical Development Cohorts
          | MLC
        </title>
        <meta
          name="description"
          content="Reflective supervision and therapist development cohorts in India. Online supervision for early-career and mid-level therapists seeking identity clarity, clinical depth, and ethical confidence."
        />
              <meta property="og:image" content="https://mlchealth.in/supervision.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/supervision.jpg" />
      </Helmet>
      <Container maxW="6xl">
        <VStack spacing={8} textAlign="center" mb={16}>
          <Image src="/supervision.jpg" alt="Therapist Supervision" borderRadius="2xl" boxShadow="md" />
          <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E">
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
            <VStack spacing={4}>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                At MLC Health & Wellness Centre, supervision is not case management. It is
                therapist formation.
              </Text>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                We offer structured online supervision across India for therapists who want
                depth, clarity, and professional coherence. Whether you are practicing in
                Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata or anywhere across
                India, our supervision cohorts are conducted virtually through secure platforms.
              </Text>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                This is not a space for quick technique exchange. It is a space to develop the
                therapist you are becoming.
              </Text>
            </VStack>
          </Box>
        </VStack>

        <VStack align="stretch" spacing={8}>
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <Heading size="md" color="#2E2E2E" mb={3}>
              A Therapist Development Model
            </Heading>
            <Text color="#2E2E2E" fontFamily="'Lato', sans-serif">
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
            <Heading size="md" color="#2E2E2E" mb={3}>
              What Makes MLC Supervision Different
            </Heading>
            <Text color="#2E2E2E" fontFamily="'Lato', sans-serif" mb={4}>
              This is not: “Bring a case, get advice, leave.” or “Tell me if I handled that
              right.” or “Which technique should I use next week?”
            </Text>
            <Text color="#2E2E2E" fontFamily="'Lato', sans-serif">
              This is: Who are you as a therapist? What lens are you actually practicing from?
              Are you aligned with your model, or borrowing randomly? What parts of your
              personal history are entering the therapy room? Are you thinking clearly, or
              reacting emotionally? This supervision model builds internal coherence rather
              than dependence.
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
            <Heading size="md" color="#2E2E2E" mb={6}>
              Core Pillars of the Cohort
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {[
                {
                  title: "1. Therapist Identity Development",
                  bullets: [
                    "What kind of therapist you are becoming",
                    "Which theoretical approach genuinely aligns with you",
                    "Where you feel fragmented or inconsistent",
                    "Why sessions sometimes feel clunky or forced",
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
                    "Countertransference",
                    "Emotional reactivity",
                    "Detachment patterns",
                    "Personal triggers in session",
                    "Regulation under emotional intensity",
                  ],
                  note: "This is reflective professional awareness. It is not therapy for the therapist.",
                },
                {
                  title: "4. Ethical & Professional Maturity",
                  bullets: [
                    "Ethical backbone",
                    "Boundary clarity",
                    "Confidence in difficult conversations",
                    "Decision-making in gray areas",
                    "Grounded professionalism",
                  ],
                  note: "Ethics here is developmental, not mechanical.",
                },
                {
                  title: "5. Session Craft & Clinical Performance",
                  bullets: [
                    "Session pacing",
                    "Structure and flow",
                    "Moving from rapport to depth",
                    "Alignment between theory and intervention",
                    "Note clarity and conceptual consistency",
                  ],
                  note: "This reduces professional clunkiness.",
                },
                {
                  title: "6. Knowledge Discipline & Intellectual Depth",
                  bullets: [
                    "Identify theoretical gaps",
                    "Deepen expertise in one model",
                    "Stop chasing every new modality",
                    "Build intellectual maturity",
                  ],
                  note: "This builds seasoned thinking.",
                },
              ].map((pillar) => (
                <Box
                  key={pillar.title}
                  bg="#F9F9F9"
                  borderRadius="xl"
                  p={5}
                  border="1px solid"
                  borderColor="blackAlpha.100"
                  boxShadow="sm"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  transition="all 0.2s ease"
                >
                  <Heading size="sm" color="#2E2E2E" mb={2}>
                    {pillar.title}
                  </Heading>
                  <List fontFamily="'Lato', sans-serif" color="#2E2E2E" pl={4} spacing={2}>
                    {pillar.bullets.map((b) => (
                      <ListItem key={b}>• {b}</ListItem>
                    ))}
                  </List>
                  <Text color="#2E2E2E" fontFamily="'Lato', sans-serif" mt={3}>
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
            <Heading size="md" color="#2E2E2E" mb={4}>
              Structure of Supervision at MLC
            </Heading>
            <VStack align="start" spacing={6}>
              <Box>
                <Heading size="sm" color="#2E2E2E" mb={2}>
                  Individual Supervision
                </Heading>
                <Text color="#2E2E2E" fontFamily="'Lato', sans-serif">
                  One-on-one supervision tailored to your caseload, ethical dilemmas, clinical
                  questions, and professional development goals. Ideal for early-career therapists,
                  mid-level therapists wanting deeper clarity, clinicians navigating complex cases,
                  and practitioners preparing for independent practice. Sessions are structured,
                  reflective, and developmental.
                </Text>
              </Box>
              <Box>
                <Heading size="sm" color="#2E2E2E" mb={2}>
                  Reflective Group Supervision Cohorts
                </Heading>
                <Text color="#2E2E2E" fontFamily="'Lato', sans-serif">
                  Small closed cohorts of 4 to 6 therapists meet monthly. Cohorts include grounded
                  check-in, thematic exploration, case discussion through identity and lens, supervisor
                  synthesis, and integration takeaways. Cohorts require a minimum 4-session commitment
                  to allow depth and continuity. These are closed groups to preserve safety and
                  developmental progression.
                </Text>
              </Box>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="md"
              p={{ base: 6, md: 10 }}
              border="1px solid"
              borderColor="blackAlpha.100"
            >
              <Heading size="md" color="#2E2E2E" mb={3}>
                Who This Is For
              </Heading>
              <List fontFamily="'Lato', sans-serif" color="#2E2E2E" pl={4} spacing={2}>
                <ListItem>• Therapists feeling scattered</ListItem>
                <ListItem>• Practitioners who feel competent but inconsistent</ListItem>
                <ListItem>• Therapists wanting depth beyond surface technique</ListItem>
                <ListItem>• Clinicians seeking stronger conceptualization skills</ListItem>
                <ListItem>• Professionals tired of modality-hopping</ListItem>
                <ListItem>• Therapists wanting stronger ethical grounding</ListItem>
              </List>
            </Box>
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="md"
              p={{ base: 6, md: 10 }}
              border="1px solid"
              borderColor="blackAlpha.100"
            >
              <Heading size="md" color="#2E2E2E" mb={3}>
                Who This Is Not For
              </Heading>
              <List fontFamily="'Lato', sans-serif" color="#2E2E2E" pl={4} spacing={2}>
                <ListItem>• Those seeking quick case answers only</ListItem>
                <ListItem>• Therapists unwilling to engage in self-reflection</ListItem>
                <ListItem>• Compliance-heavy institutional supervision needs</ListItem>
                <ListItem>• Crisis-management environments requiring administrative oversight</ListItem>
              </List>
            </Box>
          </SimpleGrid>

          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="md"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.100"
          >
            <Heading size="md" color="#2E2E2E" mb={3}>
              Outcomes of MLC Supervision
            </Heading>
            <List fontFamily="'Lato', sans-serif" color="#2E2E2E" pl={4} spacing={2}>
              <ListItem>• Greater internal coherence</ListItem>
              <ListItem>• A clearer theoretical anchor</ListItem>
              <ListItem>• Improved case conceptualization</ListItem>
              <ListItem>• Cleaner session flow</ListItem>
              <ListItem>• Increased ethical confidence</ListItem>
              <ListItem>• Reduced emotional exhaustion</ListItem>
              <ListItem>• Stronger professional identity</ListItem>
            </List>
            <Text color="#2E2E2E" fontFamily="'Lato', sans-serif" mt={3}>
              This is therapist maturation. Not technique exchange.
            </Text>
          </Box>
        </VStack>

        {/* FAQ */}
        <Box
          mt={16}
          bg="white"
          borderRadius="2xl"
          boxShadow="md"
          p={{ base: 6, md: 10 }}
          border="1px solid"
          borderColor="blackAlpha.100"
        >
          <Heading fontFamily="'Playfair Display', serif" mb={6} textAlign="center" color="#2E2E2E">
            Frequently Asked Questions
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
              { q: "Who can apply for supervision?", a: "Qualified counselling psychologists, clinical psychologists, psychotherapists, and advanced trainees seeking reflective development." },
              { q: "Is this available across India?", a: "Yes. All supervision is conducted online and accessible across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai and other cities." },
              { q: "How are cohorts formed?", a: "Cohorts are curated based on professional level, developmental stage, and reflective readiness to ensure alignment and psychological safety." },
              { q: "What is the duration and fee structure?", a: "Cohorts require a minimum 4-session commitment. Individual supervision packages are discussed after application review." },
              { q: "Is this clinical supervision suitable for licensure hours?", a: "Depending on your governing body requirements, this may qualify. Applicants are encouraged to verify with their respective boards." },
            ].map((item, i) => (
              <AccordionItem key={i}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">{item.q}</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>{item.a}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <VStack mt={10}>
            <Text>Questions about supervision?</Text>
            <Button bg="#A9CBB7" color="black" borderRadius="full" _hover={{ bg: "#C9A960", color: "white" }} as="a" href="/contactus">Contact Us</Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
