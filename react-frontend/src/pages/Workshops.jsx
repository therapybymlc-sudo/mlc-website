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

export default function Workshops() {
  return (
    <Box bg="#FFFFFF" py={20}>
      <Helmet>
        <title>
          Mental Health Workshops & Outreach in India | MLC Health & Wellness
          Centre
        </title>
        <meta
          name="description"
          content="Workshops, outreach, and collaborations promoting mental health awareness, stress management, and emotional well-being across India."
        />
              <meta property="og:image" content="https://mlchealth.in/workshops.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/workshops.jpg" />
      </Helmet>
      <Container maxW="6xl">
        {/* HERO */}
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/workshops.jpg"
            alt="Workshops and Outreach"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            fontWeight="600"
          >
            Workshops, Outreach & Collaborations
          </Heading>
          <Text
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            At MLC Therapy, we believe that mental health awareness grows through
            conversation and community. Our workshops and outreach programs bring
            therapy out of the clinic and into everyday spaces — building understanding,
            resilience, and connection.
          </Text>
        </VStack>

        {/* SECTIONS */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={16}>
          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={2}
            >
              Workshops
            </Heading>
            <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
              We conduct engaging, evidence-informed workshops on topics such as
              stress management, emotional regulation, communication, and healthy
              boundaries. Each session blends psychoeducation with reflection and
              practical strategies.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={2}
            >
              Outreach Programs
            </Heading>
            <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
              Our outreach initiatives aim to make mental health accessible in
              schools, universities, and workplaces. We collaborate with community
              partners to deliver culturally sensitive, empowering content for all.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={2}
            >
              Collaborations
            </Heading>
            <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
              We partner with organizations, educational institutions, and NGOs to
              design events, panels, and training sessions that promote well-being and
              professional growth. Reach out to host a collaborative mental health
              event with us.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={2}
            >
              Corporate & Institutional Events
            </Heading>
            <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
              From employee wellness programs to leadership mental health seminars,
              our facilitators bring depth and relatability to every event.
            </Text>
          </Box>
        </SimpleGrid>

        {/* FAQ */}
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
                q: "Can organizations request custom workshops?",
                a: "Yes. We tailor workshops to suit your organization’s goals, audience, and time frame.",
              },
              {
                q: "Do you collaborate internationally?",
                a: "Yes. MLC welcomes virtual and cross-border collaborations aligned with our mission.",
              },
              {
                q: "Are your outreach programs free?",
                a: "Some community programs are offered pro bono or subsidized through partnerships.",
              },
              {
                q: "How can I partner with MLC?",
                a: "Reach out through our Contact page or email therapy@mlchealth.in with your proposal.",
              },
            ].map((item, i) => (
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
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <VStack mt={10}>
            <Text fontFamily="'Inter', sans-serif">
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
