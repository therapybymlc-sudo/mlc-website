'use client'

import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { apiGet } from "../../api";

const defaultAboutContent = {
  hero: {
    title: "Our Approach to Care",
    body:
      "<p>At MLC Therapy, we believe that sustainable systems create deeper healing. Our philosophy is rooted in three pillars: clinical clarity, relational depth, and ethical accountability. When care is structured and therapists are supported, clients receive consistent, high-quality therapy they can trust.</p>",
    cta_label: "Meet the Team",
    cta_link: "/meettheteam",
    image_url: "/approach_new.jpg",
  },
  why: {
    title: "Why We Started MLC Therapy",
    body:
      "<p>MLC Therapy was born from witnessing systemic gaps in mental health care. Talented therapists were burning out, and clients were receiving inconsistent support. We envisioned a model that protects both clinical integrity and therapist sustainability, ensuring that client care never suffers.</p>",
  },
  pillars: [
    {
      title: "Clinical Clarity",
      body:
        "<p>Every therapist at MLC works from a defined therapeutic orientation. We do not blend methods without intention. Your work is guided by formulation, not improvisation.</p>",
    },
    {
      title: "Relational Depth",
      body:
        "<p>We prioritise attuned presence. Therapy is not mechanical. It is relational, safe, and human.</p>",
    },
    {
      title: "Ethical &amp; Professional Standards",
      body:
        "<p>Supervision, documentation, and structured review processes ensure that your care remains aligned with international standards of mental health practice.</p>",
    },
  ],
  message: {
    title: "The Message Behind MLC",
    body:
      "<p><strong>MLC</strong> stands for <strong>Mentis, Lumine et Corpus</strong>, Latin for Mind, Light, and Body. This name captures our belief that healing is holistic, integrating mental, emotional, and physical well-being.</p><p>Every service we offer, from therapy and supervision to education, reflects that interconnected philosophy. We stand for integrity in care, safety in practice, and growth that holds space for both clients and clinicians.</p>",
    image_url: "/about_illustration_new.jpg",
  },
};

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.35rem" },
};

export default function AboutClient() {
  const [content, setContent] = useState(defaultAboutContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiGet("about-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultAboutContent.hero, ...(entry.hero || {}) },
            why: { ...defaultAboutContent.why, ...(entry.why || {}) },
            pillars: Array.isArray(entry.pillars) ? entry.pillars : defaultAboutContent.pillars,
            message: { ...defaultAboutContent.message, ...(entry.message || {}) },
          });
        }
      } catch {
        setContent(defaultAboutContent);
      }
    };
    fetchContent();
  }, []);

  return (
    <Box bg="#F9F9F9">
      {/* HERO / INTRO */}
      <Box py={24} px={8} bg="#F9F9F9">
        <Container maxW="6xl">
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={12}
            alignItems="center"
          >
            <Box>
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
                fontSize={{ base: "2xl", md: "3xl" }}
              >
                {content.hero.title}
              </Heading>
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: content.hero.body }}
              />

              <Button
                as={NextLink}
                href={content.hero.cta_link || "/meettheteam"}
                mt={8}
                bg="#56756D"
                borderRadius="full"
                color="white"
                _hover={{ bg: "#C9A960", color: "white" }}
                fontWeight="500"
                px={8}
                py={5}
                boxShadow="md"
              >
                {content.hero.cta_label || "Meet the Team"}
              </Button>
            </Box>
            <Image
              src={content.hero.image_url || "/approach_new.jpg"}
              alt="Therapy room at MLC"
              borderRadius="2xl"
              boxShadow="xl"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* WHY WE STARTED */}
      <Box bg="#E9F2ED" py={24} px={8}>
        <Container maxW="5xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            {content.why.title}
          </Heading>
          <Box
            color="#2E2E2E"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize="lg"
            lineHeight="1.8"
            maxW="3xl"
            mx="auto"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.why.body }}
          />
        </Container>
      </Box>

      {/* THREE PILLARS */}
      <Box bg="#FFFFFF" py={24} px={8}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            mb={10}
            color="#2E2E2E"
            fontWeight="600"
            textAlign="center"
          >
            Our Three Pillars of Care
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {content.pillars.map((pillar) => (
              <Box key={pillar.title} bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
                <Heading size="md" mb={2} fontFamily="'Playfair Display', var(--font-playfair), serif">
                  {pillar.title}
                </Heading>
                <Box
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  color="#2E2E2E"
                  sx={richTextStyles}
                  dangerouslySetInnerHTML={{ __html: pillar.body }}
                />
              </Box>
            ))}
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
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                {content.message.title}
              </Heading>
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: content.message.body }}
              />
            </Box>
            <Image
              src={content.message.image_url || "/about_illustration_new.jpg"}
              alt="Abstract botanical illustration"
              borderRadius="2xl"
              boxShadow="xl"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* FOUNDER MESSAGE */}
      <Box bg="#E9F2ED" py={24} px={8}>
        <Container maxW="6xl">
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={12}
            alignItems="center"
          >
            <Box>
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                A Message from the Founder
              </Heading>
              <Text
                fontFamily="'Inter', var(--font-inter), sans-serif"
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
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            Our Vision
          </Heading>
          <Text
            color="#2E2E2E"
            fontFamily="'Inter', var(--font-inter), sans-serif"
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
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            mb={6}
            color="#2E2E2E"
            fontWeight="600"
          >
            Our Mission
          </Heading>
          <Text
            color="#2E2E2E"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize="lg"
            lineHeight="1.8"
            maxW="3xl"
            mx="auto"
          >
            To make therapy accessible, ethical, and deeply human, ensuring that
            every therapist feels valued and every client feels seen.
          </Text>
          <Text fontSize="sm" color="#56756D" fontFamily="'Inter', var(--font-inter), sans-serif" mt={6}>
            We offer ethical therapy services to individuals, couples, and families across Mumbai,
            Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad and throughout India.
          </Text>
        </Container>
      </Box>

      {/* CTA */}
      <Box bg="#56756D" py={20} textAlign="center">
        <Heading
          color="white"
          fontFamily="'Playfair Display', var(--font-playfair), serif"
          fontWeight="600"
          mb={6}
          letterSpacing="-0.5px"
        >
          Ready to Experience the MLC Approach?
        </Heading>
        <Button
          as={NextLink}
          href="/book"
          bg="white"
          color="#2E2E2E"
          borderRadius="full"
          px={8}
          py={6}
          fontWeight="500"
          _hover={{ bg: "#C9A960", color: "white" }}
          boxShadow="md"
        >
          Book a Session
        </Button>
      </Box>
    </Box>
  );
}
