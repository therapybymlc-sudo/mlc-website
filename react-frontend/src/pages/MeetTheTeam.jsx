import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Image,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

const therapists = [
  {
    name: "Dr. Ayesha Khan",
    role: "Counselling Psychologist",
    img: "/team-placeholder1.jpg",
    desc: "Specializes in trauma-informed and humanistic therapy approaches.",
  },
  {
    name: "Rahul Menon",
    role: "Clinical Psychologist",
    img: "/team-placeholder2.jpg",
    desc: "Integrates CBT and mindfulness-based techniques for holistic care.",
  },
  {
    name: "Sarah Thomas",
    role: "Therapist",
    img: "/team-placeholder3.jpg",
    desc: "Focuses on anxiety, grief, and relationship dynamics with warmth and structure.",
  },
];

const supervisors = [
  {
    name: "Dr. Fatima Rizvi",
    role: "Clinical Supervisor",
    img: "/team-placeholder4.jpg",
    desc: "Guides therapist development with ethical and reflective practice models.",
  },
  {
    name: "Prof. Ajay Nair",
    role: "Senior Supervisor & Educator",
    img: "/team-placeholder5.jpg",
    desc: "Supports continuous growth through advanced case conceptualization.",
  },
];

const operations = [
  {
    name: "Nisha Patel",
    role: "Operations & Client Relations Lead",
    img: "/team-placeholder6.jpg",
    desc: "Ensures seamless coordination across clients, therapists, and administration.",
  },
  {
    name: "Zaid Ahmed",
    role: "Digital Media & Branding Coordinator",
    img: "/team-placeholder7.jpg",
    desc: "Manages MLC’s online presence, visual identity, and social media engagement.",
  },
  {
    name: "Aditya Sharma",
    role: "Technical & Backend Developer",
    img: "/team-placeholder8.jpg",
    desc: "Maintains MLC’s digital systems, dashboards, and secure online operations.",
  },
];

export default function MeetTheTeam() {
  const renderSection = (title, members, variant = "default") => (
    <Box
      py={20}
      color={variant === "supervisor" ? "white" : "#2E2E2E"}
    >
      <Heading
        textAlign="center"
        mb={10}
        fontFamily="'Playfair Display', serif"
        fontWeight="600"
        color={variant === "supervisor" ? "whiteAlpha.900" : "#2E2E2E"}
      >
        {title}
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={10}>
        {members.map((member) => (
          <VStack
            key={member.name}
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="md"
            spacing={4}
            _hover={{
              transform: "translateY(-6px)",
              transition: "0.3s ease",
              boxShadow: "xl",
            }}
          >
            <Image
              src={member.img}
              alt={member.name}
              borderRadius="full"
              boxSize="150px"
              objectFit="cover"
              boxShadow="sm"
            />
            <Box textAlign="center">
              <Heading
                fontSize="xl"
                mt={4}
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
                color="#2E2E2E"
              >
                {member.name}
              </Heading>
              <Text
                color="#C9A960"
                fontWeight="500"
                mt={1}
                fontFamily="'Lato', sans-serif"
              >
                {member.role}
              </Text>
              <Text
                fontSize="sm"
                color="#555"
                mt={2}
                fontFamily="'Lato', sans-serif"
                lineHeight="1.6"
              >
                {member.desc}
              </Text>
            </Box>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <Box>
      <Helmet>
        <title>Meet the Team | MLC Health & Wellness Centre</title>
        <meta
          name="description"
          content="Meet the therapists, supervisors, and operations team behind MLC Health & Wellness Centre delivering structured, ethical online therapy across India."
        />
              <meta property="og:image" content="https://mlchealth.in/founder_portrait_new.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/founder_portrait_new.jpg" />
      </Helmet>
      {/* HERO SECTION */}
      <Box bg="#F6F6F4" py={24}>
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center" mb={10}>
            <Heading
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              fontWeight="600"
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              Meet Our Team
            </Heading>
            <Text
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Lato', sans-serif"
              fontSize="lg"
              lineHeight="1.8"
            >
              At MLC Therapy, our strength lies in collaboration, between
              clinicians, supervisors, and the dedicated operations team that
              keeps our ecosystem thriving. Each individual plays a key role in
              ensuring that care remains human, ethical, and sustainable.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* THERAPISTS SECTION */}
      <Box bg="#E8ECE8">
        <Container maxW="7xl">{renderSection("Therapists", therapists)}</Container>
      </Box>

      {/* SUPERVISORS SECTION (FULL WIDTH BACKGROUND) */}
      <Box
        w="100vw"
        bgGradient="linear(to-b, #5B7A72, #4E6E66)"
        py={24}
        position="relative"
        left="50%"
        right="50%"
        ml="-50vw"
        mr="-50vw"
      >
        <Container maxW="7xl">
          {renderSection("Supervisors & Mentors", supervisors, "supervisor")}
        </Container>
      </Box>

      {/* OPERATIONS SECTION */}
      <Box bg="#E8ECE8">
        <Container maxW="7xl">
          {renderSection("Operations & Media Team", operations)}
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
            The Heart Behind MLC Therapy
          </Heading>
          <Text
            maxW="3xl"
            mx="auto"
            mb={8}
            fontFamily="'Lato', sans-serif"
            lineHeight="1.8"
          >
            Every member of MLC shares a common goal, to create a space that
            nurtures both client and clinician. Together, we are redefining what
            compassionate and sustainable therapy can look like.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
