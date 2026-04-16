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
import LinkButton from "@/components/LinkButton";

export const metadata = {
  title: 'Workshops & Outreach | MLC Health & Wellness Centre',
  description: 'Participate in our mental health workshops, outreach programs, and organizational collaborations. We bring ethical therapy conversations into classrooms, workplaces, and community spaces across India.',
}

export default function WorkshopsPage() {
  return (
    <Box bg="#FFFFFF" py={20}>
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
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            color="#2E2E2E"
            fontWeight="600"
          >
            Workshops, Outreach & Collaborations
          </Heading>
          <Text
            fontFamily="'Inter', var(--font-inter), sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            At MLC, we believe that mental health awareness grows through
            conversation and community. Our workshops and outreach programs bring
            ethical therapy out of the clinic and into everyday spaces — building understanding,
            resilience, and connection.
          </Text>
        </VStack>

        {/* SECTIONS */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} mb={16}>
          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              mb={3}
            >
              Workshops
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
              We conduct engaging, evidence-informed workshops on topics such as
              stress management, emotional regulation, communication, and healthy
              boundaries. Each session blends psychoeducation with reflection and
              practical strategies.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              mb={3}
            >
              Outreach Programs
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
              Our outreach initiatives aim to make mental health accessible in
              schools, universities, and workplaces. We collaborate with community
              partners to deliver culturally sensitive, empowering content for all.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              mb={3}
            >
              Collaborations
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
              We partner with organizations, educational institutions, and NGOs to
              design events, panels, and training sessions that promote well-being and
              professional growth. Reach out to host a collaborative mental health
              event with us.
            </Text>
          </Box>

          <Box>
            <Heading
              size="md"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              mb={3}
            >
              Corporate & Institutional Events
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
              From employee wellness programs to leadership mental health seminars,
              our facilitators bring depth and relatability to every event, focused on sustainable practice.
            </Text>
          </Box>
        </SimpleGrid>

        {/* FAQ */}
        <Box mt={16}>
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            mb={10}
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
                a: "Yes. MLC welcomes virtual and cross-border collaborations aligned with our clinical standards.",
              },
              {
                q: "Are your outreach programs free?",
                a: "Some community programs are offered pro bono or subsidized through institutional partnerships.",
              },
              {
                q: "How can I partner with MLC?",
                a: "Reach out through our Contact page or email therapy@mlchealth.in with your proposal.",
              },
            ].map((item, i) => (
              <AccordionItem key={i} borderBottom="1px solid" borderColor="gray.100">
                <AccordionButton py={4}>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    fontWeight="500"
                  >
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} color="gray.600" fontFamily="'Inter', var(--font-inter), sans-serif">
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <VStack mt={16} spacing={4}>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif">
              Didn’t find your question? Reach out to us anytime.
            </Text>
            <LinkButton
              href="/contactus"
              bg="#A9CBB7"
              color="#2E2E2E"
              borderRadius="full"
              px={10}
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              Contact Us
            </LinkButton>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
