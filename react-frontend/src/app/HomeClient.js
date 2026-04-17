'use client'

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  SimpleGrid,
  Container,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiUsers, FiCompass, FiCheckCircle, FiFeather } from "react-icons/fi";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { apiGet } from "../api.js";

const MotionBox = motion(Box);

const fallbackHome = {
  hero: {
    title: "MLC Therapy",
    tagline: "A space to feel, to heal, to become.",
    paragraph_one:
      "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through.",
    paragraph_two:
      "At MLC Therapy, we offer thoughtful online therapy across India in spaces designed to help you feel heard, supported, and respected.",
    primary_label: "Find My Therapist",
    primary_link: "/therapists/discovery",
    secondary_label: "I'm a Therapist",
    secondary_link: "/therapists",
    background_image: "/hero-bg.jpg",
    logo_url: "/logo_tra.png",
  },
  portal: {
    title: "Your MLC Portal",
    body:
      "A gentle, private space for clients — and a structured workspace for therapists. Choose your path below to get started.",
    client_title: "Client Workspace",
    client_body:
      "A dedicated environment for your healing journey. Track your goals, access shared resources, and collaborate securely with your therapist.",
    client_primary_label: "Create Client Account",
    client_primary_link: "/signup/client",
    client_secondary_label: "Find a therapist",
    client_secondary_link: "/therapists/discovery",
    therapist_title: "Therapist Workspace",
    therapist_body:
      "A professional environment for clinical excellence. Manage your practice, collaborate with clients, and focus on the clinical work.",
    therapist_primary_label: "Apply as a therapist",
    therapist_primary_link: "/therapist-apply",
    therapist_secondary_label: "Sign in",
    therapist_secondary_link: "/login/therapist",
  },
  bubbles: [
    {
      icon: "users",
      title: "A Space Where You Can Speak Freely",
      body:
        "Therapy here is a place where you can talk about what’s on your mind without feeling judged.",
    },
    {
      icon: "compass",
      title: "Thoughtful Guidance",
      body:
        "Your therapist works with you to understand what you're experiencing and how to move forward.",
    },
    {
      icon: "check",
      title: "Finding the Right Fit",
      body:
        "Your first few sessions help you decide whether the therapist feels like the right fit for you. You are always free to choose what feels best for you.",
    },
    {
      icon: "feather",
      title: "Move at Your Own Pace",
      body:
        "There is no pressure to rush therapy. The process always respects your comfort and readiness.",
    },
  ],
};

const iconMap = {
  users: FiUsers,
  compass: FiCompass,
  check: FiCheckCircle,
  feather: FiFeather,
};

export default function HomeClient() {
  const [homeContent, setHomeContent] = useState(fallbackHome);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("home-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          setHomeContent({
            hero: { ...fallbackHome.hero, ...(data[0].hero || {}) },
            portal: { ...fallbackHome.portal, ...(data[0].portal || {}) },
            bubbles: Array.isArray(data[0].bubbles) ? data[0].bubbles : fallbackHome.bubbles,
          });
        }
      } catch {
        setHomeContent(fallbackHome);
      }
    })();
  }, []);

  return (
    <Box>
      {/* HERO SECTION */}
      {/* HERO SECTION */}
      <MotionBox
        position="relative"
        bgImage={`url('${homeContent.hero.background_image || "/hero-bg.jpg"}')`}
        bgSize="cover"
        bgPosition={{ base: "center center", md: "center 20%" }}
        bgRepeat="no-repeat"
        minH={{ base: "100dvh", md: "100vh" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        overflow="hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          bg: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.85) 100%)",
          zIndex: 1,
        }}
      >
        <Box position="relative" zIndex={2} maxW="4xl" px={8} pb={12}>
          <Image
            src={homeContent.hero.logo_url || "/logo_tra.png"}
            alt="MLC Therapy Logo"
            boxSize={{ base: "90px", sm: "110px", md: "130px" }}
            mb={{ base: 6, md: 8 }}
            mx="auto"
          />
          <Heading
            as="h1"
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            fontSize={{ base: "2.5rem", md: "4.5rem", lg: "5.5rem" }}
            color="#2E2E2E"
            letterSpacing="-0.02em"
            lineHeight={{ base: "1.2", md: "1.1" }}
            mb={6}
          >
            Find the therapist meant for <Text as="span" color="mlc.green" whiteSpace="nowrap">your journey</Text>
          </Heading>
          
          <Text
            mt={4}
            fontSize={{ base: "xs", md: "sm" }}
            color="#56756D"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontWeight="700"
            letterSpacing="0.15em"
            textTransform="uppercase"
            opacity={0.9}
          >
            {homeContent.hero.tagline}
          </Text>

          <Text
            mt={8}
            color="rgba(46, 46, 46, 0.85)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize={{ base: "md", md: "lg" }}
            lineHeight="1.8"
            maxW="2xl"
            mx="auto"
            fontWeight="400"
          >
            {homeContent.hero.paragraph_one || "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through."}
          </Text>

          <VStack spacing={6} mt={12} align="center">
            <Button
              as={NextLink}
              href="/therapists/discovery"
              size="lg"
              bg="#56756D"
              color="white"
              borderRadius="full"
              shadow="2xl"
              _hover={{ bg: "#C9A960", transform: "scale(1.05)", shadow: "dark-lg" }}
              fontWeight="600"
              fontSize="lg"
              px={14}
              py={8}
            >
              Take the Matching Quiz
            </Button>
            <HStack spacing={4}>
              <Text fontSize="xs" color="gray.500" fontWeight="500">Already know who you're looking for?</Text>
              <ChakraLink
                as={NextLink}
                href="/therapists"
                color="mlc.greenDark"
                fontWeight="700"
                fontSize="xs"
                textDecoration="none"
                borderBottom="2px solid"
                borderColor="mlc.green"
                _hover={{ color: "mlc.gold", borderColor: "mlc.gold" }}
                pb="1px"
              >
                Browse all therapists
              </ChakraLink>
            </HStack>
          </VStack>
        </Box>
      </MotionBox>

      {/* HOW TO START SECTION */}
      <Box py={24} bg="white">
        <Container maxW="6xl">
          <VStack spacing={16} align="center">
            <VStack spacing={4} textAlign="center">
              <Heading fontFamily="'Playfair Display', var(--font-playfair), serif" size="xl" color="mlc.black">
                How to find your space here
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                We've simplified the journey to ensure you find a therapist who truly aligns with your needs, values, and life situation.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} w="full">
              {[
                {
                  step: "01",
                  title: "Discovery Quiz",
                  desc: "Take our 10-minute discovery quiz to share your preferences, concerns, and what you’re looking for in a therapeutic relationship.",
                },
                {
                  step: "02",
                  title: "Personalized Match",
                  desc: "Receive a curated selection of therapists who specialize in your areas of concern and meet your specific preferences.",
                },
                {
                  step: "03",
                  title: "Book & Begin",
                  desc: "Review detailed therapist profiles and book your first session directly through our secure platform.",
                },
              ].map((item, idx) => (
                <VStack key={idx} align="flex-start" spacing={6} p={8} bg="#FDFBFA" borderRadius="2xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
                   <Text fontSize="5xl" fontWeight="800" color="mlc.gold" opacity="0.3" fontFamily="'Playfair Display', serif" lineHeight="1">{item.step}</Text>
                   <Heading size="md" color="mlc.greenDark">{item.title}</Heading>
                   <Text color="gray.600" fontSize="md">{item.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>

            <Button
              as={NextLink}
              href="/therapists/discovery"
              variant="outline"
              borderColor="mlc.green"
              color="mlc.greenDark"
              px={10}
              py={7}
              borderRadius="full"
              _hover={{ bg: "mlc.green", color: "white" }}
            >
              Start the Discovery Quiz
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* MISSION SECTION */}
      <Container maxW="6xl" py={24}>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={10}
          alignItems="center"
        >
          <Box>
            <Heading
              as="h2"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              mb={4}
              lineHeight="1.3"
              fontWeight="500"
            >
              Where Healing Meets Compassion
            </Heading>
            <Text
              color="#2E2E2E"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              lineHeight="1.8"
              fontSize="lg"
            >
              At MLC Therapy, we believe therapy works best when it combines
              empathy with thoughtful psychological care. Our goal is simple: to
              create spaces where you feel comfortable exploring what you're
              going through while working toward meaningful personal change.
            </Text>
            <Button
              mt={6}
              borderRadius="full"
              bg="#C9A960"
              color="white"
              _hover={{ bg: "#56756D", color: "white" }}
              as={NextLink}
              href="/about"
              fontWeight="500"
              boxShadow="sm"
              px={8}
            >
              Learn More
            </Button>
          </Box>
          <Image
            src="/new-therapy-room.jpg"
            alt="Therapy Room"
            borderRadius="2xl"
            boxShadow="xl"
            w="100%"
            maxW={{ base: "100%", md: "520px" }}
            mx={{ base: "auto", md: "0" }}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}
