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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Badge,
  Stack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiCompass, FiCheckCircle, FiFeather, FiArrowRight, FiCalendar } from "react-icons/fi";
import React, { useEffect, useState, useRef } from "react";
import NextLink from "next/link";
import { apiGet } from "../api.js";
import BlogCarousel from '../components/blog/BlogCarousel';

const MotionBox = motion(Box);

const fallbackHome = {
  hero: {
    title: "MLC Therapy",
    tagline: "A space to feel, to heal, to become.",
    paragraph_one:
      "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through.",
    paragraph_two:
      "At MLC Therapy, you enter a connected therapy ecosystem where matching, sessions, resources, and care continuity live in one secure experience.",
    primary_label: "Find My Therapist",
    primary_link: "/therapists/discovery",
    secondary_label: "I'm a Therapist",
    secondary_link: "/therapists",
    background_image: "/hero-bg.jpg",
    logo_url: "/logo_tra.png",
  },
  portal: {
    title: "Your MLC Therapy Ecosystem",
    body:
      "One ecosystem. Two dedicated workspaces. Clients receive guided, secure care while therapists run their practice with clarity, structure, and support.",
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
  const [isCohortModalOpen, setCohortModalOpen] = useState(false);

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

    // ⏱ Premium announcement popup trigger
    const timer = setTimeout(() => {
      // Only show if user hasn't dismissed it in current session
      const dismissed = sessionStorage.getItem("mlc_supervision_modal_dismissed");
      if (!dismissed) {
        setCohortModalOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {/* HERO SECTION */}
      {/* HERO SECTION */}
      <MotionBox
        position="relative"
        bgImage={`url('${homeContent.hero.background_image || "/hero-bg.jpg"}')`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgColor="#FDFBFA" 
        minH={{ base: "90dvh", md: "110vh" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        overflow="hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        px={6}
      >
        {/* Dynamic Gradient Overlay */}
        <Box 
          position="absolute"
          inset={0}
          bg="linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.85))"
          zIndex={1}
        />

        <Box position="relative" zIndex={2} maxW="4xl" w="full">
          <Image
            src={homeContent.hero.logo_url || "/logo_tra.png"}
            alt="MLC Health and Wellness Centre Official Logo - A symbol of holistic healing and growth"
            boxSize={{ base: "90px", sm: "110px", md: "130px" }}
            mb={8}
            mx="auto"
          />
          <Heading
            as="h1"
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            fontSize={{ base: "2.2rem", md: "4.5rem", lg: "5.5rem" }}
            color="#2E2E2E"
            letterSpacing="-0.01em"
            lineHeight="1.1"
            mb={6}
          >
            Enter the <Text as="span" color="mlc.green">therapy ecosystem</Text> built for your journey
          </Heading>
          
          <Text
            mt={4}
            fontSize={{ base: "xs", md: "sm" }}
            color="#56756D"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontWeight="700"
            letterSpacing="2px"
            textTransform="uppercase"
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
                href="/therapists/directory"
                color="mlc.greenDark"
                fontWeight="700"
                fontSize="xs"
                textDecoration="none"
                borderBottom="2px solid"
                borderColor="mlc.green"
                _hover={{ color: "mlc.gold", borderColor: "mlc.gold" }}
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
                We have designed a connected therapy ecosystem to help you find aligned care quickly and continue that care with confidence.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} w="full">
              {[
                {
                  step: "01",
                  title: "Discovery Quiz",
                  desc: "Take our 10-minute discovery quiz so the ecosystem can understand your goals, preferences, and current challenges.",
                },
                {
                  step: "02",
                  title: "Personalized Match",
                  desc: "Receive curated therapist recommendations based on clinical fit, preferences, and therapeutic compatibility.",
                },
                {
                  step: "03",
                  title: "Book & Begin",
                  desc: "Book your first session and continue with in-platform tools, secure workflows, and continuity across every step of care.",
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
              A Therapy Ecosystem Where Healing Meets Precision
            </Heading>
            <Text
              color="#2E2E2E"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              lineHeight="1.8"
              fontSize="lg"
            >
              At MLC Therapy, we combine empathy, clinical rigor, and thoughtful technology to create a true therapy ecosystem.
              From your first match to ongoing sessions, resources, and progress tracking, every part of your care journey is designed to feel
              safer, more coordinated, and more human.
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
            alt="A beautifully designed, modern therapy room at MLC Centre, featuring warm lighting and a calm atmosphere for client sessions"
            borderRadius="2xl"
            boxShadow="xl"
            w="100%"
            maxW={{ base: "100%", md: "520px" }}
            mx={{ base: "auto", md: "0" }}
          />
        </SimpleGrid>
      </Container>
      
      <BlogCarousel />

      <Modal isOpen={isCohortModalOpen} onClose={() => { sessionStorage.setItem("mlc_supervision_modal_dismissed", "true"); setCohortModalOpen(false); }} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" overflow="hidden" border="1px solid" borderColor="teal.100" p={2}>
          <ModalCloseButton borderRadius="full" m={2} />
          <ModalBody p={8}>
            <VStack align="start" spacing={6}>
              <HStack spacing={2}>
                <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="2xs" fontWeight="800">
                  NEW PROGRAMME
                </Badge>
                <Badge colorScheme="purple" borderRadius="full" px={3} py={1} fontSize="2xs" fontWeight="800">
                  MID-JULY 2026
                </Badge>
              </HStack>
              
              <VStack align="start" spacing={2}>
                <Heading size="lg" fontFamily="'Playfair Display', serif" color="teal.900">
                  MLC Clinical Supervision Cohort
                </Heading>
                <Text color="mlc.gold" fontWeight="700" fontSize="sm" letterSpacing="0.5px">
                  12-Week Reflective Clinical Supervision Programme
                </Text>
              </VStack>

              <Text color="gray.600" fontSize="sm" lineHeight="relaxed">
                An intensive, structured learning journey designed for early-career psychologists to build confidence, sharpen clinical thinking, and discover their authentic clinical voice. Led by Ahmed Asif, M.Sc.
              </Text>

              <HStack spacing={4} w="full" bg="teal.50" p={4} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                <Icon as={FiCalendar} color="teal.600" boxSize={5} />
                <Box>
                  <Text fontWeight="800" fontSize="xs" color="teal.800" letterSpacing="0.5px">FOUNDING COHORT SIZE</Text>
                  <Text fontSize="xs" color="gray.700">Intentionally limited to 6 selected therapists.</Text>
                </Box>
              </HStack>

              <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full" pt={2}>
                <Button
                  as={NextLink}
                  href="/supervision"
                  onClick={() => { sessionStorage.setItem("mlc_supervision_modal_dismissed", "true"); setCohortModalOpen(false); }}
                  flex="1.2"
                  bg="teal.800"
                  color="white"
                  borderRadius="full"
                  h="48px"
                  _hover={{ bg: "teal.900" }}
                  rightIcon={<FiArrowRight />}
                >
                  Learn More & Apply
                </Button>
                <Button
                  onClick={() => { sessionStorage.setItem("mlc_supervision_modal_dismissed", "true"); setCohortModalOpen(false); }}
                  flex="0.8"
                  variant="ghost"
                  borderRadius="full"
                  h="48px"
                  color="gray.500"
                >
                  Maybe Later
                </Button>
              </Stack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
