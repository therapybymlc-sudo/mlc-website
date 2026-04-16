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

export default function CouplesTherapy() {
  return (
    <Box bg="#F9F9F9" py={20}>
      <Helmet>
        <title>
          Online Couples Therapy in India | Relationship & Marriage Counselling
        </title>
        <meta
          name="description"
          content="Online couples therapy across India for communication challenges, conflict resolution, trust rebuilding and emotional reconnection. Serving Mumbai, Delhi, Bangalore, Hyderabad and more."
        />
              <meta property="og:image" content="https://mlchealth.in/couples-therapy.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/couples-therapy.jpg" />
      </Helmet>
      <Container maxW="6xl">
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/couples-therapy.jpg"
            alt="Couples Therapy"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading fontFamily="'Playfair Display', serif" color="#2E2E2E" fontWeight="600">
            Couples Therapy
          </Heading>
          <Text
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            A safe and structured space for partners to reconnect, rebuild trust, and
            strengthen emotional bonds. We provide online couples therapy across India
            for married and unmarried partners navigating communication breakdowns,
            recurring conflicts, emotional distance, or trust concerns.
          </Text>
        </VStack>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Common Reasons Couples Seek Therapy
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          • Frequent arguments or unresolved conflict • Emotional disconnection • Trust
          breaches • Pre-marital counselling • Intimacy challenges • Life transitions
          such as relocation, career shifts, or parenting
        </Text>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          Couples therapy is not about choosing sides. It is about understanding patterns.
        </Text>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          What to Expect
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          Sessions focus on improving communication clarity, identifying recurring relational
          cycles, learning structured conflict resolution skills, rebuilding emotional safety,
          and strengthening intimacy. Therapists guide conversations with balance, ensuring
          both partners feel heard.
        </Text>

        <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Our Approach to Relationship Therapy
        </Heading>
        <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={10}>
          We combine structured frameworks with emotional depth through emotion-focused
          techniques, communication restructuring, conflict pattern analysis, and mindfulness
          in relationships. Sessions are collaborative, not confrontational.
        </Text>

        {/* FAQ */}
        <Heading textAlign="center" mb={6} fontFamily="'Playfair Display', serif" color="#2E2E2E">
          Frequently Asked Questions
        </Heading>
        <Accordion allowToggle maxW="4xl" mx="auto">
          {[
            { q: "Do we both need to attend?", a: "Yes. Couples therapy works best when both partners participate." },
            { q: "How many sessions are typical?", a: "This varies depending on the complexity of concerns and goals." },
            { q: "Is this only for married couples?", a: "No. We work with married, engaged, and committed partners." },
            { q: "Is online couples therapy effective?", a: "Yes. Structured virtual sessions can be highly effective when both partners engage actively." },
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
          <Text fontFamily="'Inter', sans-serif">Still have questions? Contact us anytime.</Text>
          <Button as="a" href="/contactus" bg="#A9CBB7" color="black" borderRadius="full" _hover={{ bg: "#C9A960", color: "white" }}>
            Contact Us
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
