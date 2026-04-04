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

export default function MindfulnessAndRelaxation() {
  return (
    <Box bg="#F6F6F4" py={20}>
      <Helmet>
        <title>
          Mindfulness & Relaxation Sessions in India | MLC Health & Wellness
          Centre
        </title>
        <meta
          name="description"
          content="Guided mindfulness, relaxation, and anxiety regulation sessions online across India to support calm, focus, and emotional balance."
        />
              <meta property="og:image" content="https://mlchealth.in/mindfulness-session.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/mindfulness-session.jpg" />
      </Helmet>
      <Container maxW="6xl">
        {/* HERO SECTION */}
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/mindfulness-session.jpg"
            alt="Mindfulness & Relaxation"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            fontWeight="600"
          >
            Mindfulness & Relaxation Sessions
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            Our mindfulness and relaxation sessions are designed to help you slow down,
            reconnect with your inner calm, and restore balance — mentally, emotionally, and physically.
            Each session combines evidence-based relaxation techniques with gentle self-awareness practices.
          </Text>
        </VStack>

        {/* OVERVIEW SECTION */}
        <VStack align="start" spacing={8} mb={16}>
          <Heading
            size="md"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
          >
            What We Offer
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <Heading
                size="sm"
                fontFamily="'Playfair Display', serif"
                mb={2}
                color="#2E2E2E"
              >
                Guided Mindfulness
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Learn to bring your awareness to the present moment through gentle, guided sessions.
                We help you notice your thoughts and emotions with compassion, not judgment.
              </Text>
            </Box>

            <Box>
              <Heading
                size="sm"
                fontFamily="'Playfair Display', serif"
                mb={2}
                color="#2E2E2E"
              >
                Guided Meditation
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Experience calming meditations that ground the mind and body.
                Each session promotes stillness, focus, and deep relaxation.
              </Text>
            </Box>

            <Box>
              <Heading
                size="sm"
                fontFamily="'Playfair Display', serif"
                mb={2}
                color="#2E2E2E"
              >
                Grounding & Relaxation Techniques
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Learn simple grounding tools and body-based relaxation techniques that
                can be practiced anytime to calm anxiety and regulate stress.
              </Text>
            </Box>

            <Box>
              <Heading
                size="sm"
                fontFamily="'Playfair Display', serif"
                mb={2}
                color="#2E2E2E"
              >
                Anxiety Regulation Practices
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                For those struggling with anxiety, we integrate mindfulness with
                practical coping tools to help you respond, not react, to daily challenges.
              </Text>
            </Box>
          </SimpleGrid>
        </VStack>

        {/* BENEFITS SECTION */}
        <VStack spacing={4} mb={16} align="start">
          <Heading
            size="md"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
          >
            How These Sessions Help
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" maxW="4xl">
            Participants often report improved sleep, better focus, emotional regulation,
            and a renewed sense of connection with themselves. These sessions can be done individually
            or in small groups and are ideal for anyone seeking a structured yet gentle way to heal.
          </Text>
        </VStack>

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
                q: "Do I need any prior experience with meditation?",
                a: "Not at all. Our sessions are designed for both beginners and experienced practitioners. Each one is guided and paced gently.",
              },
              {
                q: "How long is each session?",
                a: "Sessions typically last 45–60 minutes. We also offer shorter 30-minute guided mindfulness sessions for those seeking regular practice.",
              },
              {
                q: "Can mindfulness help with anxiety and stress?",
                a: "Yes. Mindfulness and relaxation techniques are proven to help manage anxiety, lower stress levels, and improve emotional regulation.",
              },
              {
                q: "Are these sessions one-on-one or group-based?",
                a: "Both options are available. You can choose private sessions or join small group mindfulness circles.",
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

        <Box mt={16} bg="white" p={8} borderRadius="2xl" boxShadow="md">
          <VStack spacing={4} textAlign="center">
            <Heading size="md" fontFamily="'Playfair Display', serif">
              Interested in mindfulness?
            </Heading>
            <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
              Sign up to access guided mindfulness meditations, calming check‑ins,
              and a private dashboard you can return to anytime.
            </Text>
            <Button as="a" href="/signup/client" colorScheme="teal">
              Sign up as a client
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
