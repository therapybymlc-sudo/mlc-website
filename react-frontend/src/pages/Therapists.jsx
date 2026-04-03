import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import {
  FiUsers,
  FiCompass,
  FiBriefcase,
  FiMessageCircle,
  FiAward,
  FiBookOpen,
  FiLayers,
  FiUserCheck,
} from "react-icons/fi";

export default function Therapists() {
  return (
    <Box bg="#F9F9F9">
      <Helmet>
        <title>For Therapists | MLC Therapy</title>
        <meta
          name="description"
          content="MLC Therapy offers supervision, community, and structured professional development for therapists practicing with clarity and ethical grounding."
        />
        <meta property="og:image" content="https://mlchealth.in/hero-bg.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/hero-bg.jpg" />
      </Helmet>

      {/* HERO */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: "2xl", md: "4xl" }}
              color="#2E2E2E"
              fontWeight="600"
            >
              For Therapists
            </Heading>
            <Text
              fontFamily="'Lato', sans-serif"
              color="#2E2E2E"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
              lineHeight="1.6"
            >
              MLC Therapy is building a space for therapists who want to practice
              with clarity, ethical grounding, and professional support.
            </Text>
            <Text
              fontFamily="'Lato', sans-serif"
              color="#2E2E2E"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
              lineHeight="1.6"
            >
              Whether you are an early-career clinician, a therapist building your
              practice, or someone looking for reflective supervision, we are
              creating spaces where therapists can grow thoughtfully.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                bg="#A9CBB7"
                color="#2E2E2E"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#97BFA9" }}
                as="a"
                href="/supervision"
                fontFamily="'Lato', sans-serif"
                fontWeight="600"
              >
                Explore Supervision
              </Button>
              <Button
                bg="transparent"
                border="1px solid #C9A960"
                color="#2E2E2E"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#FBF8F3" }}
                as="a"
                href="/careers"
                fontFamily="'Lato', sans-serif"
                fontWeight="600"
              >
                Join the MLC Community
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* WHY MLC EXISTS */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            Why We Built MLC
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            Many therapists in India enter the field with deep passion for helping
            others but quickly encounter burnout, isolation, and lack of clinical
            support. MLC Therapy was created to address these gaps by building a
            space where therapists can practice ethically, sustainably, and with
            community.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiUsers,
                title: "Supervision & Reflective Practice",
                body: "Regular supervision spaces designed to help therapists deepen their clinical thinking and develop confidence in their work.",
                link: "/supervision",
                cta: "Learn More",
              },
              {
                icon: FiLayers,
                title: "Therapist Community",
                body: "A growing network of therapists who value reflective practice and professional dialogue.",
              },
              {
                icon: FiCompass,
                title: "Sustainable Practice",
                body: "MLC aims to support therapists in building meaningful and sustainable careers in mental health.",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="white"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                {card.link && (
                  <Button
                    mt={4}
                    size="sm"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    borderRadius="12px"
                    _hover={{ bg: "#97BFA9" }}
                    as="a"
                    href={card.link}
                    fontFamily="'Lato', sans-serif"
                    fontWeight="600"
                  >
                    {card.cta}
                  </Button>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* SUPERVISION */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="600"
          >
            MLC Supervision Cohorts
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            Our supervision cohorts provide structured spaces for therapists to
            reflect on their clinical work, explore their therapeutic identity,
            and strengthen their practice.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                icon: FiUsers,
                title: "Group Supervision",
                body: "Small group supervision cohorts designed to encourage reflective dialogue and clinical growth.",
                cta: "Learn About Supervision",
              },
              {
                icon: FiUserCheck,
                title: "Individual Supervision",
                body: "One-on-one supervision sessions for therapists seeking deeper clinical reflection.",
                cta: "Explore Supervision Options",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="#FBF8F3"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                display="flex"
                gap={4}
                alignItems="flex-start"
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mt={1} />
                <Box>
                  <Heading
                    size="md"
                    fontFamily="'Playfair Display', serif"
                    color="#2E2E2E"
                    mb={2}
                  >
                    {card.title}
                  </Heading>
                  <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                    {card.body}
                  </Text>
                  <Button
                    mt={4}
                    size="sm"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    borderRadius="12px"
                    _hover={{ bg: "#97BFA9" }}
                    as="a"
                    href="/supervision"
                    fontFamily="'Lato', sans-serif"
                    fontWeight="600"
                  >
                    {card.cta}
                  </Button>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* TRAINING & DEVELOPMENT */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="600"
          >
            Learning and Development
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                icon: FiBookOpen,
                title: "Internships",
                body: "Structured internship programs for psychology students interested in reflective clinical practice.",
                cta: "View Internship Program",
                link: "/training-programs",
              },
              {
                icon: FiAward,
                title: "Professional Workshops",
                body: "Workshops designed to deepen therapeutic thinking and professional growth.",
                cta: "View Workshops",
                link: "/workshops",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="white"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                <Button
                  mt={4}
                  size="sm"
                  bg="#A9CBB7"
                  color="#2E2E2E"
                  borderRadius="12px"
                  _hover={{ bg: "#97BFA9" }}
                  as="a"
                  href={card.link}
                  fontFamily="'Lato', sans-serif"
                  fontWeight="600"
                >
                  {card.cta}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* WORK WITH MLC */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={8}
            fontWeight="600"
          >
            Work With MLC
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            We are always interested in connecting with therapists who value
            reflective practice and ethical care.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                icon: FiBriefcase,
                title: "Join Our Therapist Network",
                body: "Opportunities to collaborate with MLC as a therapist.",
                cta: "View Opportunities",
                link: "/careers",
              },
              {
                icon: FiMessageCircle,
                title: "Clinical Collaboration",
                body: "MLC aims to build partnerships with therapists and professionals who share our values.",
                cta: "Contact Us",
                link: "/contactus",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="#FBF8F3"
                borderRadius="20px"
                p={7}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="md"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                <Button
                  mt={4}
                  size="sm"
                  bg="#A9CBB7"
                  color="#2E2E2E"
                  borderRadius="12px"
                  _hover={{ bg: "#97BFA9" }}
                  as="a"
                  href={card.link}
                  fontFamily="'Lato', sans-serif"
                  fontWeight="600"
                >
                  {card.cta}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CLINICAL VALUES */}
      <Box bg="#FBF8F3" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="600"
          >
            Our Approach to Practice
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                title: "Ethical Practice",
                body: "Our work is grounded in clear ethical frameworks and professional responsibility.",
              },
              {
                title: "Reflective Therapists",
                body: "We encourage therapists to continually reflect on their work and their growth.",
              },
              {
                title: "Thoughtful Care",
                body: "We believe good therapy requires depth, attention, and care.",
              },
            ].map((bubble) => (
              <Box
                key={bubble.title}
                bg="white"
                borderRadius="18px"
                p={6}
                textAlign="center"
                boxShadow="0px 6px 16px rgba(0,0,0,0.05)"
              >
                <Heading
                  size="md"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {bubble.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {bubble.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#A9CBB7" py={{ base: 16, md: 20 }} px={6} textAlign="center">
        <Container maxW="4xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={4}
            fontWeight="600"
          >
            Interested in being part of MLC?
          </Heading>
          <Button
            bg="white"
            color="#2E2E2E"
            borderRadius="14px"
            px={8}
            py={6}
            _hover={{ bg: "#FBF8F3" }}
            as="a"
            href="/careers"
            fontFamily="'Lato', sans-serif"
            fontWeight="600"
          >
            Connect With Us
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
