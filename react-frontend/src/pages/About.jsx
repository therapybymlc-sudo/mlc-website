import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Button,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <Box bg="#F6F6F4">
      <Helmet>
        <title>MLC Therapy | Our Approach to Structured & Ethical Mental Health Care in India</title>
        <meta
          name="description"
          content="MLC Therapy is a structured, ethically grounded mental health practice offering online therapy across India with clinical clarity and relational depth for clients."
        />
              <meta property="og:image" content="https://mlchealth.in/about_illustration_new.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/about_illustration_new.jpg" />
      </Helmet>
      {/* HERO / INTRO */}
      <Box py={24} px={8} bg="#F6F6F4">
        <Container maxW="6xl">
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={12}
            alignItems="center"
          >
            <Box>
              <Heading
                fontFamily="'Playfair Display', serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
                fontSize={{ base: "2xl", md: "3xl" }}
              >
                Our Approach to Care
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
              >
                At MLC Therapy, we believe that sustainable systems create deeper healing.
                Our philosophy is rooted in three pillars: clinical clarity, relational depth,
                and ethical accountability. When care is structured and therapists are supported,
                clients receive consistent, high-quality therapy they can trust.
              </Text>

              <Button
                mt={8}
                bg="#56756D"
                borderRadius="full"
                color="white"
                _hover={{ bg: "#C9A960", color: "white" }}
                as="a"
                href="/team"
                fontFamily="'Lato', sans-serif"
                fontWeight="500"
                px={8}
                py={5}
                boxShadow="md"
              >
                Meet the Team
              </Button>
            </Box>
            <Image
              src="/approach_new.jpg"
              alt="Therapy room at MLC"
              borderRadius="2xl"
              boxShadow="xl"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* WHY WE STARTED */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="5xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            Why We Started MLC Therapy
          </Heading>
          <Text
            color="#2E2E2E"
            fontFamily="'Lato', sans-serif"
            fontSize="lg"
            lineHeight="1.8"
            maxW="3xl"
            mx="auto"
          >
            MLC Therapy was born from witnessing systemic gaps in mental health care.
            Talented therapists were burning out, and clients were receiving inconsistent
            support. We envisioned a model that protects both clinical integrity and
            therapist sustainability, ensuring that client care never suffers.
          </Text>
        </Container>
      </Box>

      {/* THREE PILLARS */}
      <Box bg="#FFFFFF" py={24} px={8}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            mb={10}
            color="#2E2E2E"
            fontWeight="600"
            textAlign="center"
          >
            Our Three Pillars of Care
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                Clinical Clarity
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Every therapist at MLC works from a defined therapeutic orientation. We do not
                blend methods without intention. Your work is guided by formulation, not
                improvisation.
              </Text>
            </Box>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                Relational Depth
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                We prioritise attuned presence. Therapy is not mechanical. It is relational,
                safe, and human.
              </Text>
            </Box>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                Ethical &amp; Professional Standards
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Supervision, documentation, and structured review processes ensure that your care
                remains aligned with international standards of mental health practice.
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* MESSAGE BEHIND MLC */}
      <Box bg="#FFFFFF" py={24} px={8}>
        <Container maxW="6xl">
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={12}
            alignItems="center"
          >
            <Box>
              <Heading
                fontFamily="'Playfair Display', serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                The Message Behind MLC
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
              >
                “MLC” stands for{" "}
                <strong>Mentis, Lumine et Corpus</strong>, Latin for Mind, Light,
                and Body. This name captures our belief that healing is holistic,
                integrating mental, emotional, and physical well-being. We see
                therapy as a journey that illuminates the mind, nurtures the
                spirit, and honors the body.
                <br />
                <br />
                Every service we offer, from therapy and supervision to
                education, reflects that interconnected philosophy. We stand for
                integrity in care, safety in practice, and growth that holds
                space for both clients and clinicians.
              </Text>
            </Box>
            <Image
              src="/about_illustration_new.jpg"
              alt="Abstract botanical illustration"
              borderRadius="2xl"
              boxShadow="xl"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* FOUNDER MESSAGE */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="6xl">
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={12}
            alignItems="center"
          >
            <Box>
              <Heading
                fontFamily="'Playfair Display', serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                A Message from the Founder
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
              >
                “When I began my master’s, I saw countless passionate, skilled
                therapists leave the field, not because they lacked ability or
                passion, but because they lacked support. MLC Therapy was my
                response to that; a model where therapists feel as held as the
                clients they serve. I’m proud to be building a community where we
                neither compromise on client care nor therapist well-being while
                striving to uphold the highest ethical standards.
                <br />
                <br />
                For clients, it means therapy that’s structured, ethical, and
                deeply human. For therapists, it means community, mentorship, and
                the security they deserve.”
                <br />
                <br />
                <strong>— Asma Imadi, Founder</strong>
              </Text>
            </Box>
            <Image
              src="/founder_portrait_new.jpg"
              alt="Asma Imadi"
              borderRadius="2xl"
              boxShadow="2xl"
              objectFit="cover"
              maxH="420px"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* VISION + MISSION */}
      <Box bg="#FFFFFF" py={24} px={8} textAlign="center">
        <Container maxW="5xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            Our Vision
          </Heading>
          <Text
            color="#2E2E2E"
            fontFamily="'Lato', sans-serif"
            fontSize="lg"
            lineHeight="1.8"
            mb={10}
            maxW="3xl"
            mx="auto"
          >
            To redefine mental health care by building a system that supports
            both the client and the clinician. We aim to bridge the gap between
            passion and sustainability in mental healthcare, creating spaces
            where quality, ethics, and compassion coexist.
          </Text>

          <Heading
            fontFamily="'Playfair Display', serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            Our Mission
          </Heading>
          <Text
            color="#2E2E2E"
            fontFamily="'Lato', sans-serif"
            fontSize="lg"
            lineHeight="1.8"
            maxW="3xl"
            mx="auto"
          >
            To make therapy accessible, ethical, and deeply human, ensuring that
            every therapist feels valued and every client feels seen.
          </Text>
          <Text fontSize="sm" color="#56756D" fontFamily="'Lato', sans-serif" mt={6}>
            We offer online therapy services to individuals, couples, and families across Mumbai,
            Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad and throughout India.
          </Text>
        </Container>
      </Box>

      {/* CTA */}
      <Box bg="#56756D" py={20} textAlign="center">
        <Heading
          color="white"
          fontFamily="'Playfair Display', serif"
          fontWeight="600"
          mb={6}
          letterSpacing="-0.5px"
        >
          Ready to Experience the MLC Approach?
        </Heading>
        <Button
          bg="white"
          color="#2E2E2E"
          borderRadius="full"
          px={8}
          py={6}
          fontFamily="'Lato', sans-serif"
          fontWeight="500"
          _hover={{ bg: "#C9A960", color: "white" }}
          as="a"
          href="/book"
          boxShadow="md"
        >
          Book a Session
        </Button>
      </Box>
    </Box>
  );
}
