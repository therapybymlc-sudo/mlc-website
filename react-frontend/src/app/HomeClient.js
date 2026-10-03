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
  Badge,
  Stack,
  Center,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiCompass,
  FiCheckCircle,
  FiFeather,
  FiArrowRight,
  FiBriefcase,
  FiAward,
} from "react-icons/fi";
import React, { useEffect, useState, useRef } from "react";
import NextLink from "next/link";
import NextImage from "next/image";
import { apiGet } from "../api.js";
import BlogCarousel from '../components/blog/BlogCarousel';

const MotionBox = motion(Box);

const fallbackHome = {
  hero: {
    title: "MLC Therapy",
    tagline: "A space to feel, to heal, to become",
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
      <MotionBox
        position="relative"
        bgImage={`url('${homeContent.hero.background_image || "/hero-bg.jpg"}')`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgColor="#FDFBFA" 
        minH={{ base: "76vh", md: "82vh" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        overflow="hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        px={{ base: 4, md: 6 }}
        py={{ base: 12, md: 16 }}
      >
        {/* Dynamic Gradient Overlay */}
        <Box 
          position="absolute"
          inset={0}
          bg="linear-gradient(rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0.88))"
          zIndex={1}
        />

        <Box position="relative" zIndex={2} maxW="3xl" w="full" mx="auto">
          <Image
            src={homeContent.hero.logo_url || "/logo_tra.png"}
            alt="MLC Health and Wellness Centre Official Logo - A symbol of holistic healing and growth"
            boxSize={{ base: "72px", sm: "88px", md: "100px" }}
            mb={{ base: 3, md: 4 }}
            mx="auto"
          />
          <Heading
            as="h1"
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            fontSize={{ base: "28px", sm: "36px", md: "44px", lg: "48px" }}
            color="#2E2E2E"
            letterSpacing="-0.015em"
            lineHeight={{ base: "1.2", md: "1.16" }}
            mb={{ base: 3, md: 4 }}
          >
            Enter the <Text as="span" color="mlc.green">therapy ecosystem</Text> built for your journey
          </Heading>
          
          <Text
            mt={1}
            fontSize={{ base: "xs", md: "sm" }}
            color="#56756D"
            fontFamily="body"
            fontWeight="700"
            letterSpacing="2px"
            textTransform="uppercase"
          >
            {homeContent.hero.tagline}
          </Text>

          <Text
            mt={{ base: 3.5, md: 4 }}
            color="rgba(46, 46, 46, 0.85)"
            fontFamily="body"
            fontSize={{ base: "14.5px", md: "16px" }}
            lineHeight="1.7"
            maxW="2xl"
            mx="auto"
          >
            {homeContent.hero.paragraph_one || "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through."}
          </Text>

          <VStack spacing={3} mt={{ base: 5, md: 6 }} align="center">
            <Button
              as={NextLink}
              href="/therapists/discovery"
              h={{ base: "48px", md: "52px" }}
              px={{ base: 8, md: 10 }}
              bg="#56756D"
              color="white"
              borderRadius="full"
              shadow="lg"
              _hover={{ bg: "#C9A960", transform: "translateY(-2px)", shadow: "xl" }}
              fontWeight="600"
              fontSize={{ base: "14.5px", md: "15px" }}
              whiteSpace="nowrap"
            >
              Take the Matching Quiz
            </Button>
            <HStack spacing={2.5}>
              <Text fontSize="xs" color="rgba(46,46,46,0.6)" fontWeight="500">Already know who you're looking for?</Text>
              <ChakraLink
                as={NextLink}
                href="/therapists/directory"
                color="mlc.greenDark"
                fontWeight="700"
                fontSize="xs"
                textDecoration="none"
                borderBottom="1.5px solid"
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
      <Box py={{ base: 12, md: 16 }} bg="white">
        <Container maxW="6xl">
          <VStack spacing={{ base: 8, md: 10 }} align="center">

            <VStack spacing={2.5} textAlign="center">
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "26px", md: "34px" }}
                fontWeight="600"
                color="#263A33"
                lineHeight="1.25"
              >
                How to find your space here
              </Heading>
              <Text fontSize={{ base: "14.5px", md: "15.5px" }} color="rgba(46,46,46,0.75)" maxW="2xl" lineHeight="1.7">
                We have designed a connected therapy ecosystem to help you find aligned care quickly and continue that care with confidence.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, md: 6 }} w="full">
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
                <VStack
                  key={idx}
                  align="flex-start"
                  spacing={3.5}
                  p={{ base: 5, md: 6 }}
                  bg="#FDFBFA"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="gray.100"
                  shadow="sm"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.25s ease"
                  h="full"
                >
                   <Text fontSize={{ base: "32px", md: "38px" }} fontWeight="700" color="mlc.gold" opacity="0.35" fontFamily="'Playfair Display', serif" lineHeight="1">{item.step}</Text>
                   <Heading fontSize="17.5px" fontWeight="600" color="#263A33" fontFamily="'Playfair Display', var(--font-playfair), serif">{item.title}</Heading>
                   <Text color="rgba(46,46,46,0.75)" fontSize="14px" lineHeight="1.65">{item.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>

            <Button
              as={NextLink}
              href="/therapists/discovery"
              variant="outline"
              borderColor="mlc.green"
              color="mlc.greenDark"
              h="46px"
              px={8}
              fontSize="14px"
              fontWeight="600"
              borderRadius="full"
              _hover={{ bg: "mlc.green", color: "white" }}
              transition="all 0.2s ease"
            >
              Start the Discovery Quiz
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* 🌿 FOR CLINICIANS / THERAPISTS SECTION */}
      <Box py={{ base: 12, md: 16 }} bg="#F4F7F5" borderY="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <VStack spacing={{ base: 8, md: 10 }}>
            <VStack spacing={2.5} textAlign="center" maxW="3xl">
              <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="800">
                FOR PRACTITIONERS
              </Badge>
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "26px", md: "34px" }}
                fontWeight="600"
                color="#263A33"
                lineHeight="1.25"
                mt={1}
              >
                Bring Your Entire Practice Into One Unified Workspace
              </Heading>
              <Text fontSize={{ base: "14.5px", md: "15.5px" }} color="rgba(46,46,46,0.75)" lineHeight="1.7">
                MLC is more than a therapist directory. It is a complete digital ecosystem built by therapists, for therapists, designed to streamline client matching, case notes, billing, and peer supervision.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} w="full">
              {[
                {
                  icon: FiBriefcase,
                  title: "Practice Management",
                  desc: "Streamlined client booking, flexible scheduling availability, and secure clinical records tailored for Indian practitioners.",
                },
                {
                  icon: FiUsers,
                  title: "Client Workspace",
                  desc: "Interactive toolsets for goals, progress trackers, and secure document sharing directly with your matched clients.",
                },
                {
                  icon: FiCompass,
                  title: "Reflective Supervision",
                  desc: "Connect with licensed supervisors, participate in small cohorts, and strengthen your clinical reasoning skills.",
                },
                {
                  icon: FiAward,
                  title: "Accredited Workshops",
                  desc: "Continuously refine your expertise through structured peer consults and accredited continuing education sessions.",
                },
              ].map((item, idx) => (
                <VStack
                  key={idx}
                  align="flex-start"
                  spacing={3}
                  p={{ base: 5, md: 5 }}
                  bg="white"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="gray.100"
                  shadow="sm"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.25s ease"
                  h="full"
                >
                  <Center
                    bg="rgba(169, 203, 183, 0.2)"
                    color="#4A6B62"
                    w="42px"
                    h="42px"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.15)"
                    flexShrink={0}
                  >
                    <Icon as={item.icon} boxSize="20px" />
                  </Center>
                  <Heading
                    fontSize={{ base: "16px", md: "15.5px", lg: "16px" }}
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    lineHeight="1.3"
                  >
                    {item.title}
                  </Heading>
                  <Text
                    color="rgba(46,46,46,0.75)"
                    fontSize={{ base: "13px", md: "12.5px", lg: "13px" }}
                    lineHeight="1.6"
                  >
                    {item.desc}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>

            <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} justify="center" w="full">
              <Button
                as={NextLink}
                href="/therapist-apply"
                h="46px"
                px={7}
                fontSize="14px"
                fontWeight="600"
                bg="#56756D"
                color="white"
                borderRadius="full"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Apply as a Therapist
              </Button>
              <Button
                as={NextLink}
                href="/therapists"
                h="46px"
                px={7}
                fontSize="14px"
                fontWeight="600"
                variant="outline"
                colorScheme="green"
                borderColor="rgba(86,117,109,0.3)"
                color="#56756D"
                borderRadius="full"
                _hover={{ bg: "rgba(169,203,183,0.1)", transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Learn More
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* MISSION / ECOSYSTEM SECTION */}
      <Box py={{ base: 12, md: 16 }} bg="white">
        <Container maxW="1140px">
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 8, lg: 12 }}
            alignItems="center"
          >
            <VStack align="start" spacing={5}>
              <Badge
                bg="rgba(169,203,183,0.1)"
                color="#56756D"
                px={3.5}
                py={1}
                borderRadius="full"
                fontSize="11px"
                fontWeight="700"
                letterSpacing="0.06em"
              >
                THE MLC PHILOSOPHY
              </Badge>

              <Heading
                as="h2"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                color="#263A33"
                fontSize={{ base: "26px", md: "34px" }}
                lineHeight="1.24"
                fontWeight="600"
              >
                A Therapy Ecosystem Where Healing Meets Precision
              </Heading>

              <Text
                color="rgba(46,46,46,0.75)"
                fontSize={{ base: "14.5px", md: "15.5px" }}
                lineHeight="1.75"
              >
                At MLC Therapy, we combine empathy, clinical rigor, and thoughtful technology to create a true therapy ecosystem. From your first match to ongoing sessions, resources, and progress tracking, every part of your care journey is designed to feel safer, more coordinated, and more human.
              </Text>

              <HStack spacing={{ base: 3, sm: 5 }} pt={1} wrap="wrap">
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} color="#C9A960" boxSize={4} />
                  <Text fontSize="13px" fontWeight="600" color="#263A33">Clinically Vetted</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} color="#C9A960" boxSize={4} />
                  <Text fontSize="13px" fontWeight="600" color="#263A33">Coordinated Care</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} color="#C9A960" boxSize={4} />
                  <Text fontSize="13px" fontWeight="600" color="#263A33">Continuous Support</Text>
                </HStack>
              </HStack>

              <Button
                as={NextLink}
                href="/about"
                mt={2}
                h="44px"
                px={7}
                borderRadius="full"
                bg="#C9A960"
                color="#263A33"
                fontWeight="700"
                fontSize="13.5px"
                boxShadow="0 4px 14px rgba(201, 169, 96, 0.22)"
                _hover={{
                  bg: "#E6CA65",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 18px rgba(201, 169, 96, 0.35)",
                }}
                transition="all 0.2s ease"
                rightIcon={<FiArrowRight />}
              >
                Learn More
              </Button>
            </VStack>

            <Box position="relative">
              <Box
                position="absolute"
                inset="-6px"
                borderRadius="30px"
                bgGradient="linear(to-br, rgba(201, 169, 96, 0.12), rgba(16, 40, 34, 0.04))"
                filter="blur(14px)"
                zIndex={0}
              />
              
              <Box
                position="relative"
                zIndex={1}
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.100"
                boxShadow="0 18px 40px -12px rgba(16, 40, 34, 0.1)"
                bg="white"
              >
                <Box position="relative" w="100%" h={{ base: "260px", sm: "320px", md: "360px" }}>
                  <NextImage
                    src="/new-therapy-room.jpg"
                    alt="A beautifully designed, modern therapy room at MLC Centre, featuring warm lighting and a calm atmosphere for client sessions"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 600px"
                    loading="lazy"
                  />
                </Box>
              </Box>

              <Box
                position="absolute"
                bottom={{ base: "12px", md: "16px" }}
                left={{ base: "12px", md: "16px" }}
                zIndex={2}
                bg="rgba(255, 255, 255, 0.94)"
                backdropFilter="blur(8px)"
                px={3.5}
                py={2}
                borderRadius="14px"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.8)"
                boxShadow="0 8px 20px rgba(0, 0, 0, 0.08)"
              >
                <HStack spacing={2}>
                  <Box w="7px" h="7px" borderRadius="full" bg="#C9A960" />
                  <Text fontSize="12px" fontWeight="600" color="#263A33">
                    Intentional clinical spaces
                  </Text>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
      
      <BlogCarousel />
    </Box>
  );
}
