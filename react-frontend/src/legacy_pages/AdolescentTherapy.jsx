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

export default function AdolescentTherapy() {
  return (
    <Box bg="#FFFFFF" py={20}>
      <Helmet>
        <title>
          Adolescent Therapy Online in India | Teen Anxiety & Academic Stress
          Support
        </title>
        <meta
          name="description"
          content="Online therapy for adolescents across India. Support for teen anxiety, academic stress, emotional regulation, and self-esteem in Mumbai, Delhi, Bangalore, Hyderabad and beyond."
        />
              <meta property="og:image" content="https://mlchealth.in/adolescent-therapy.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/adolescent-therapy.jpg" />
      </Helmet>
      <Container maxW="6xl">
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/adolescent-therapy.jpg"
            alt="Adolescent Therapy"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E" fontWeight="600">
            Adolescent Therapy
          </Heading>
          <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" maxW="3xl" fontSize="lg" lineHeight="1.8">
            A compassionate and structured space for teens to explore emotions, build
            confidence, and develop healthy coping skills. We provide online adolescent
            therapy across India for teenagers navigating anxiety, exam stress, peer
            relationships, family tension, and identity development.
          </Text>
        </VStack>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Common Concerns
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          • Academic pressure and exam anxiety • Social anxiety and peer conflict • Low
          self-esteem • Emotional outbursts or withdrawal • Family communication challenges
          • Identity and self-discovery
        </Text>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          How We Work with Teens
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          Our approach balances empathy with structure. We create trust while empowering
          autonomy. Methods may include CBT for anxiety and thought patterns, art-based
          reflection, skill-building exercises, emotional regulation tools, and mindfulness
          for stress. Parental involvement is discussed collaboratively and ethically.
        </Text>

        {/* FAQ */}
        <Heading textAlign="center" mb={6} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Frequently Asked Questions
        </Heading>
        <Accordion allowToggle maxW="4xl" mx="auto">
          {[
            { q: "Can parents attend sessions?", a: "In some cases yes. Parent involvement is discussed respectfully and based on therapeutic need." },
            { q: "Is this suitable for exam-related stress?", a: "Yes. We provide structured support for academic anxiety and performance stress." },
            { q: "Are sessions confidential?", a: "Yes. Within ethical and safety boundaries appropriate for minors." },
            { q: "Do you provide online therapy for teens across India?", a: "Yes. We serve families across Mumbai, Delhi, Bangalore, Hyderabad, Chennai and other cities." },
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
