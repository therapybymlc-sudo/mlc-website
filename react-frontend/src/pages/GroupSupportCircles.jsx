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
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function GroupSupportCircles() {
  return (
    <Box bg="#F6F6F4" py={20}>
      <Helmet>
        <title>Online Group Therapy & Support Circles in India</title>
        <meta
          name="description"
          content="Facilitated online support circles across India for shared healing, anxiety support, personal growth, and structured group therapy sessions."
        />
              <meta property="og:image" content="https://mlchealth.in/group-circles.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/group-circles.jpg" />
      </Helmet>
      <Container maxW="6xl">
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/group-circles.jpg"
            alt="Group & Support Circles"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E" fontWeight="600">
            Group & Support Circles
          </Heading>
          <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" maxW="3xl" fontSize="lg" lineHeight="1.8">
            A guided collective space for reflection, empathy, and shared growth. Our online
            support circles allow individuals across India to connect through structured
            therapeutic facilitation.
          </Text>
        </VStack>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Why Join a Circle?
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          Group therapy offers shared understanding, emotional normalization, collective
          reflection, exposure to diverse perspectives, and structured coping techniques.
          Healing often deepens in community.
        </Text>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          What Happens in a Circle?
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          Therapist-led discussions, themed conversations, structured reflection prompts,
          mindfulness exercises, and voluntary sharing. You are never forced to speak.
          Participation is encouraged, not imposed.
        </Text>

        {/* FAQ */}
        <Heading textAlign="center" mb={6} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Frequently Asked Questions
        </Heading>
        <Accordion allowToggle maxW="4xl" mx="auto">
          {[
            { q: "How many people are in a group?", a: "Typically between 6 and 10 participants." },
            { q: "Do I need to share?", a: "No. Sharing is voluntary." },
            { q: "Are circles themed?", a: "Yes. Themes may include anxiety, burnout, grief, or personal growth." },
            { q: "Are sessions available across India?", a: "Yes. All circles are conducted virtually for participants across India." },
          ].map((item, i) => (
            <AccordionItem key={i} border="none">
              <AccordionButton _expanded={{ bg: "#A9CBB7", color: "black" }}>
                <Box flex="1" textAlign="left" fontFamily="'Inter', sans-serif">
                  {item.q}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>{item.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <VStack mt={10}>
          <Text fontFamily="'Inter', sans-serif">Still have questions?</Text>
          <Button as="a" href="/contactus" bg="#A9CBB7" color="black" borderRadius="full" _hover={{ bg: "#C9A960", color: "white" }}>
            Contact Us
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
