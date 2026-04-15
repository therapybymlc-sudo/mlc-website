import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function BookNow() {
  return (
    <Box>
      <Helmet>
        <title>
          Book Online Therapy in India | Free 30 Minute Screening Call | MLC
          Health & Wellness Centre
        </title>
        <meta
          name="description"
          content="Book a free 30 minute screening call with MLC Health & Wellness Centre. We offer structured online therapy across India including Individual Therapy, Couples Therapy, Adolescent Therapy, and professional supervision. Serving Mumbai, Delhi, Bangalore, Hyderabad and more."
        />
              <meta property="og:image" content="https://mlchealth.in/therapy-room.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/therapy-room.jpg" />
      </Helmet>
      {/* HERO SECTION */}
      <Box bg="#F6F6F4" py={20} px={8}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
                mb={4}
                color="#2E2E2E"
              >
                Book a Session
              </Heading>
              <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" lineHeight="1.8">
                Taking the first step toward therapy is an act of courage and care.
                Fill in your details below, and our coordination team will reach out
                to schedule your free 30 minute screening call. We’ll help you find
                the right therapist so your journey begins with comfort, clarity,
                and relational safety.
              </Text>
              <Text
                mt={4}
                fontFamily="'Inter', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
              >
                We offer secure online therapy across India, including Mumbai,
                Delhi, Bangalore, Hyderabad, Chennai, Pune, and other major
                cities.
              </Text>
            </Box>
            <Image
              src="/therapy-room.jpg"
              alt="MLC Therapy Room"
              borderRadius="2xl"
              boxShadow="md"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Box bg="#E8ECE8" py={20} px={8}>
        <Container maxW="6xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={10}
            fontWeight="600"
          >
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            {[
              {
                title: "1. Fill the Form",
                desc: "Share your basic details and preferences so we can understand your needs clearly.",
              },
              {
                title: "2. Free Screening Call",
                desc: "A structured conversation to understand your goals, answer questions, assess risk where necessary, and ensure you are matched appropriately.",
              },
              {
                title: "3. Get Matched",
                desc: "Our coordination team assigns you a therapist suited to your goals, therapeutic needs, and preferences.",
              },
              {
                title: "4. Begin Your Journey",
                desc: "Start therapy in a confidential, safe, and structured environment designed to support long-term growth.",
              },
            ].map((step) => (
              <Box
                key={step.title}
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                transition="0.3s ease"
              >
                <Heading
                  fontFamily="'Playfair Display', serif"
                  fontSize="xl"
                  color="#2E2E2E"
                  mb={3}
                >
                  {step.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {step.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* BOOKING FORM */}
      <Box bg="white" py={24} px={8}>
        <Container maxW="5xl">
          <Heading
            textAlign="center"
            mb={10}
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            color="#2E2E2E"
          >
            Fill Your Details
          </Heading>

          <VStack
            spacing={6}
            bg="#F9F9F9"
            p={10}
            borderRadius="2xl"
            boxShadow="md"
          >
            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Full Name
              </FormLabel>
              <Input placeholder="Enter your name" bg="white" borderRadius="lg" />
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Email Address
              </FormLabel>
              <Input placeholder="Enter your email" bg="white" borderRadius="lg" />
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Phone Number
              </FormLabel>
              <Input placeholder="Enter your number" bg="white" borderRadius="lg" />
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Preferred Date
              </FormLabel>
              <Input type="date" bg="white" borderRadius="lg" />
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Preferred Time
              </FormLabel>
              <Input type="time" bg="white" borderRadius="lg" />
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Type of Service
              </FormLabel>
              <Select placeholder="Select a service" bg="white" borderRadius="lg">
                <option>Individual Therapy</option>
                <option>Couples Therapy</option>
                <option>Adolescent Therapy</option>
                <option>Group & Support Circles</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Additional Notes (optional)
              </FormLabel>
              <Textarea
                placeholder="Share anything you'd like us to know"
                bg="white"
                borderRadius="lg"
              />
            </FormControl>

            <Button
              mt={4}
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={8}
              py={6}
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              Submit
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* REASSURANCE / FAQ */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="6xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={8}
            fontWeight="600"
          >
            Not Sure If You’re Ready Yet?
          </Heading>
          <Text
            maxW="3xl"
            mx="auto"
            mb={12}
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            lineHeight="1.8"
          >
            That’s okay, therapy is a journey, not a race. Whether you’re exploring
            support for the first time or deciding which service is right for you,
            our free screening call is a thoughtful and pressure-free starting
            point.
          </Text>

          <Accordion allowToggle maxW="3xl" mx="auto">
            {[
              {
                q: "Do I need to know what’s wrong before I book?",
                a: "No. Many clients begin therapy with uncertainty. The screening call and first session are spaces to clarify your concerns together.",
              },
              {
                q: "What happens in the screening call?",
                a: "The screening call is a brief structured conversation to understand your needs, explain how therapy works at MLC, and match you with the right therapist.",
              },
              {
                q: "What if I don’t feel comfortable after my first session?",
                a: "Therapeutic fit matters. If needed, we support rematching so you can continue your journey with confidence.",
              },
            ].map((faq, i) => (
              <AccordionItem key={i} border="none" mb={4} bg="white" borderRadius="lg">
                <h2>
                  <AccordionButton
                    fontFamily="'Inter', sans-serif"
                    fontWeight="500"
                    _expanded={{ bg: "#F6F6F4" }}
                  >
                    <Box flex="1" textAlign="left" color="#2E2E2E">
                      {faq.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} fontFamily="'Inter', sans-serif" color="#555">
                  {faq.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#56756D" py={20} textAlign="center" color="white">
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            mb={6}
            letterSpacing="-0.5px"
          >
            Ready for Your Screening Call?
          </Heading>
          <Text
            maxW="3xl"
            mx="auto"
            mb={8}
            fontFamily="'Inter', sans-serif"
            lineHeight="1.8"
          >
            Your story matters, and it deserves to be heard. Take that first gentle
            step. We will walk with you every step of the way.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
