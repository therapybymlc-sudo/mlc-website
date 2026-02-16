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
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function IndividualTherapy() {
  return (
    <Box bg="#F6F6F4" py={20}>
      <Helmet>
        <title>
          Individual Therapy Online in India | Anxiety, Burnout & Personal Growth
          Support
        </title>
        <meta
          name="description"
          content="Online individual therapy across India including Mumbai, Delhi, Bangalore, Hyderabad and Chennai. Structured, ethical, and compassionate therapy for anxiety, burnout, life transitions, and emotional clarity."
        />
              <meta property="og:image" content="https://mlchealth.in/individual-therapy.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/individual-therapy.jpg" />
      </Helmet>
      <Container maxW="6xl">
        {/* HERO */}
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image src="/individual-therapy.jpg" alt="Individual Therapy" borderRadius="2xl" boxShadow="md" />
          <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E">
            Individual Therapy
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" maxW="3xl">
            A space that is entirely yours, where healing begins with being heard.
          </Text>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" maxW="3xl">
            At MLC Health & Wellness Centre, we offer structured and evidence-informed
            online individual therapy across India. Whether you are in Mumbai, Delhi,
            Bangalore, Hyderabad, Chennai, Pune, Kolkata or anywhere else in India,
            therapy is accessible through secure virtual sessions.
          </Text>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" maxW="3xl">
            Our therapists provide ethical, collaborative, and clinically grounded care
            rooted in compassion, safety, and sustainable growth.
          </Text>
        </VStack>

        {/* CONTENT */}
        <VStack align="start" spacing={6}>
          <Heading size="md" fontFamily="'Playfair Display', serif" color="#2E2E2E">
            What Brings People to Individual Therapy
          </Heading>
          <List fontFamily="'Lato', sans-serif" color="#2E2E2E" spacing={2} pl={4}>
            <ListItem>• Anxiety and overthinking</ListItem>
            <ListItem>• Burnout and workplace stress</ListItem>
            <ListItem>• Life transitions and identity shifts</ListItem>
            <ListItem>• Relationship patterns and emotional regulation</ListItem>
            <ListItem>• Low self-esteem and self-doubt</ListItem>
            <ListItem>• Grief, loss, or unresolved emotional experiences</ListItem>
            <ListItem>• Desire for deeper self-awareness</ListItem>
          </List>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
            You do not need a crisis to begin therapy. Sometimes clarity itself is the goal.
          </Text>

          <Heading size="md" fontFamily="'Playfair Display', serif" color="#2E2E2E">
            What to Expect
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
            Each therapy session lasts approximately 50 minutes. Sessions are tailored to your
            goals, pace, and emotional capacity. We integrate structured approaches such as
            Cognitive Behavioral Therapy, mindfulness-based interventions, humanistic and
            relational therapy, and emotion-focused techniques.
          </Text>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
            Therapy is collaborative. You are not analyzed. You are engaged. We create space for
            both emotional depth and structured progress.
          </Text>

          <Heading size="md" fontFamily="'Playfair Display', serif" color="#2E2E2E">
            Our Therapeutic Approach
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
            At MLC, therapy balances three core elements:
          </Text>
          <List fontFamily="'Lato', sans-serif" color="#2E2E2E" spacing={2} pl={4}>
            <ListItem>• Clarity and Structure — we help you understand patterns, triggers, and emotional cycles with precision.</ListItem>
            <ListItem>• Relational Safety — you set the pace, and we ensure emotional containment and safety.</ListItem>
            <ListItem>• Clinical Standards and Ethics — sessions are confidential, ethically grounded, and guided by professional frameworks.</ListItem>
          </List>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
            Progress happens when you feel seen, supported, and respected.
          </Text>
        </VStack>

        {/* FAQ */}
        <Box mt={16}>
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
                q: "How long is each therapy session?",
                a: "Sessions are typically 50 minutes.",
              },
              {
                q: "Can I choose my therapist?",
                a: "Yes. Based on your screening call, we recommend a therapist suited to your goals. You may request a change if needed.",
              },
              {
                q: "Is everything shared confidential?",
                a: "Yes. Therapy is confidential within legal and ethical boundaries.",
              },
              {
                q: "Do you offer online therapy across India?",
                a: "Yes. We provide secure virtual sessions across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, and Kolkata.",
              },
            ].map((item, i) => (
              <AccordionItem key={i}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontFamily="'Lato', sans-serif">
                      {item.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>{item.a}</AccordionPanel>
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
