'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Tag,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiUser, FiUsers, FiShield, FiHeart, FiMapPin, FiVideo, FiArrowRight, FiCheck } from "react-icons/fi";
import NextLink from "next/link";
import { apiGet } from "../../api.js";

const MotionBox = motion(Box);

const CORE_SERVICES = [
  {
    title: "Individual Therapy",
    icon: FiUser,
    desc: "One-on-one sessions focused on personal clarity, navigating emotional distress, and breaking unhelpful cycles.",
    path: "/individual-therapy"
  },
  {
    title: "Couples Therapy",
    icon: FiUsers,
    desc: "Structured, neutral facilitation helping partners de-escalate conflict, rebuild trust, and deepen emotional safety.",
    path: "/couples-therapy"
  },
  {
    title: "Adolescent Therapy",
    icon: FiHeart,
    desc: "Creative, developmentally attuned therapy supporting teenagers through identity discovery and academic pressure.",
    path: "/adolescent-therapy"
  },
  {
    title: "Clinical Supervision",
    icon: FiShield,
    desc: "Reflective consultation for mental health practitioners to navigate complex cases, ethics, and practice growth.",
    path: "/supervision"
  }
];

const PROCESS_STEPS = [
  { title: "Discovery Intake", desc: "Share your clinical context and care preferences through our intake framework." },
  { title: "Clinical Match", desc: "Our team pairs you with a vetted practitioner aligned with your specific focus." },
  { title: "Consultation", desc: "An initial dialogue to align on therapeutic goals and establish relational safety." },
  { title: "Consistent Care", desc: "Commit to a structured, evidence-informed journey with ongoing support." }
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

export default function ServicesClient() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchServices() {
       try {
          const res = await apiGet("services/");
          setServices(res.results || []);
       } catch (err) {
          console.error("Failed to fetch services", err);
       }
    }
    fetchServices();
  }, []);

  return (
    <Box bg="#FDFBFA" overflowX="hidden" color="#263A33">

      {/* ═══════════════ HERO ═══════════════ */}
      <Box
        position="relative"
        py={{ base: 12, md: 16 }}
        overflow="hidden"
        bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)"
        color="white"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="0"
          right="0"
          w="50%"
          h="full"
          bg="radial-gradient(circle at 80% 20%, rgba(201,169,96,0.12), transparent 60%)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-100px"
          left="-60px"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(169,203,183,0.1)"
          pointerEvents="none"
        />

        <Container maxW="6xl" position="relative" zIndex={2}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VStack align="start" spacing={{ base: 3.5, md: 4.5 }}>
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="2.5px"
                  textTransform="uppercase"
                  color="rgba(201,169,96,0.95)"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  Clinical Directory & Services
                </Text>

                <Heading
                  as="h1"
                  fontSize={{ base: "28px", md: "38px" }}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  lineHeight="1.2"
                  fontWeight="600"
                >
                  Therapy Designed for Your Unique Context
                </Heading>

                <Text
                  fontSize={{ base: "14px", md: "15px" }}
                  opacity={0.92}
                  lineHeight="1.75"
                  maxW="xl"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  MLC provides a rigorously vetted collective of mental health practitioners across India. We offer precision-matched care that respects your identity, life stage, and psychological needs.
                </Text>

                <Button
                  as={NextLink}
                  href="/therapists/discovery"
                  bg="white"
                  color="#263A33"
                  borderRadius="full"
                  h="44px"
                  px={7}
                  fontSize="13.5px"
                  fontWeight="600"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  shadow="md"
                  _hover={{ bg: "rgba(255,255,255,0.9)", transform: "translateY(-1px)", shadow: "lg" }}
                  transition="all 0.25s ease"
                  rightIcon={<FiArrowRight />}
                >
                  Find Your Therapist
                </Button>
              </VStack>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 16px 40px rgba(0,0,0,0.22)"
                border="1px solid"
                borderColor="rgba(255,255,255,0.12)"
              >
                <Image
                  src="/human_connection_therapy_1776424085531.png"
                  alt="Clinical Session"
                  borderRadius="2xl"
                  w="100%"
                  h={{ base: "280px", md: "360px" }}
                  objectFit="cover"
                />
              </Box>
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <Box py={{ base: 14, md: 20 }} bg="#FDFBFA" position="relative">
        <Box
          position="absolute"
          top="-80px"
          right="10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201,169,96,0.08) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="6xl">
          <VStack spacing={{ base: 10, md: 14 }}>
            <VStack spacing={2.5} textAlign="center" maxW="560px">
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="2.5px"
                textTransform="uppercase"
                color="#C9A960"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Methodology
              </Text>
              <Heading
                as="h2"
                color="#263A33"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "26px", md: "34px" }}
                fontWeight="600"
              >
                Your Path to Healing
              </Heading>
              <Text
                color="rgba(46,46,46,0.72)"
                fontSize={{ base: "13.5px", md: "14.5px" }}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.65"
              >
                A structured clinical roadmap to finding and maintaining the right care
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 5, md: 6 }} w="full">
              {PROCESS_STEPS.map((step, i) => (
                <MotionBox
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                >
                  <Box
                    p={{ base: 6, md: 7 }}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="0 4px 20px rgba(86,117,109,0.06)"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.08)"
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 10px 30px rgba(86,117,109,0.1)" }}
                    transition="all 0.3s cubic-bezier(0.4,0,0.2,1)"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box
                      w="38px"
                      h="38px"
                      borderRadius="xl"
                      bg="rgba(169,203,183,0.15)"
                      border="1px solid"
                      borderColor="rgba(169,203,183,0.3)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb={4}
                    >
                      <Text fontWeight="800" fontSize="13px" color="#56756D" fontFamily="'Inter', var(--font-inter), sans-serif">
                        {i + 1}
                      </Text>
                    </Box>
                    <Text
                      fontWeight="600"
                      color="#263A33"
                      fontSize="16.5px"
                      mb={2}
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                    >
                      {step.title}
                    </Text>
                    <Text
                      color="rgba(46,46,46,0.68)"
                      fontSize="13.5px"
                      lineHeight="1.65"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                    >
                      {step.desc}
                    </Text>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>


      {/* ═══════════════ CORE SERVICES ═══════════════ */}
      <Box py={{ base: 14, md: 20 }} bg="linear-gradient(180deg, #F4F1EC 0%, #FDFBFA 100%)" position="relative">
        <Box
          position="absolute"
          top="50%"
          left="-80px"
          transform="translateY(-50%)"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.15) 0%, transparent 70%)"
          filter="blur(50px)"
          pointerEvents="none"
        />

        <Container maxW="6xl">
          <VStack spacing={{ base: 10, md: 14 }}>
            <VStack spacing={2.5} textAlign="center" maxW="560px">
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="2.5px"
                textTransform="uppercase"
                color="#56756D"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Care Domains
              </Text>
              <Heading
                as="h2"
                color="#263A33"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "26px", md: "34px" }}
                fontWeight="600"
              >
                Our Specializations
              </Heading>
              <Text
                color="rgba(46,46,46,0.72)"
                fontSize={{ base: "13.5px", md: "14.5px" }}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.65"
              >
                Every modality is grounded in clinically verified frameworks and ethical practice
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 5, md: 6 }} w="full">
              {CORE_SERVICES.map((s, i) => (
                <MotionBox
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                >
                  <Box
                    p={{ base: 6, md: 7 }}
                    bg="rgba(255,255,255,0.75)"
                    backdropFilter="blur(12px)"
                    borderRadius="2xl"
                    boxShadow="0 4px 20px rgba(86,117,109,0.06)"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.08)"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(86,117,109,0.1)", borderColor: "#A9CBB7" }}
                    transition="all 0.3s cubic-bezier(0.4,0,0.2,1)"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="xl"
                      bg="rgba(169,203,183,0.18)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb={4.5}
                    >
                      <Icon as={s.icon} boxSize={5} color="#56756D" />
                    </Box>
                    <Heading
                      fontSize="17px"
                      color="#263A33"
                      mb={2}
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      fontWeight="600"
                    >
                      {s.title}
                    </Heading>
                    <Text
                      color="rgba(46,46,46,0.7)"
                      fontSize="13.5px"
                      lineHeight="1.65"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      flex={1}
                    >
                      {s.desc}
                    </Text>
                    <Button
                      as={NextLink}
                      href={s.path}
                      variant="link"
                      color="#56756D"
                      fontSize="13.5px"
                      fontWeight="600"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      rightIcon={<FiArrowRight />}
                      mt={5}
                      alignSelf="flex-start"
                      _hover={{ color: "#C9A960" }}
                      transition="color 0.2s"
                    >
                      Learn More
                    </Button>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>


      {/* ═══════════════ LOCATIONS ═══════════════ */}
      <Box py={{ base: 14, md: 20 }} bg="#FDFBFA" position="relative">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <VStack align="start" spacing={{ base: 4, md: 5 }}>
                <HStack spacing={2}>
                  <Icon as={FiMapPin} boxSize={3.5} color="#56756D" />
                  <Text
                    fontWeight="700"
                    fontSize="11px"
                    letterSpacing="2.5px"
                    textTransform="uppercase"
                    color="#56756D"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                  >
                    Care Access
                  </Text>
                </HStack>

                <Heading
                  as="h2"
                  fontSize={{ base: "26px", md: "34px" }}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  color="#263A33"
                  fontWeight="600"
                >
                  Online & In-Person Support
                </Heading>

                <Text
                  color="rgba(46,46,46,0.74)"
                  fontSize={{ base: "14px", md: "15px" }}
                  lineHeight="1.8"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  We offer secure, end-to-end encrypted <strong>Online Therapy across India</strong>. For individuals seeking <strong>In-Person Therapy</strong>, we operate in clinical hubs across major metropolitan regions.
                </Text>

                <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3.5} w="full" pt={2}>
                  {["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map(city => (
                    <HStack key={city} spacing={2} py={0.5}>
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="full"
                        bg="rgba(169,203,183,0.2)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon as={FiCheck} color="#56756D" boxSize={2.5} />
                      </Box>
                      <Text
                        fontWeight="500"
                        color="rgba(46,46,46,0.8)"
                        fontSize="13.5px"
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                      >
                        {city}
                      </Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </VStack>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Box position="relative">
                <Box
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="0 12px 36px rgba(86,117,109,0.12)"
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.08)"
                >
                  <Image
                    src="/service1_new.jpg"
                    alt="MLC Therapy Practice Room"
                    w="100%"
                    h={{ base: "260px", md: "330px" }}
                    objectFit="cover"
                  />
                </Box>
                <Tag
                  position="absolute"
                  bottom={3.5}
                  right={3.5}
                  bg="rgba(255,255,255,0.92)"
                  backdropFilter="blur(8px)"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  shadow="sm"
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.1)"
                >
                  <HStack spacing={1.5}>
                    <Icon as={FiVideo} color="#56756D" boxSize={3} />
                    <Text
                      fontWeight="700"
                      fontSize="10.5px"
                      color="#263A33"
                      letterSpacing="0.8px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                    >
                      SECURE VIDEO ENABLED
                    </Text>
                  </HStack>
                </Tag>
              </Box>
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ FAQ ═══════════════ */}
      <Box py={{ base: 14, md: 20 }} bg="linear-gradient(180deg, #F4F1EC 0%, #FDFBFA 100%)" position="relative">
        <Box
          position="absolute"
          top="50%"
          right="5%"
          transform="translateY(-50%)"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.1) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="840px" position="relative" zIndex={1}>
          <VStack spacing={6}>
            <VStack spacing={2} textAlign="center">
              <Text
                fontSize="xs"
                fontWeight="700"
                letterSpacing="2.5px"
                textTransform="uppercase"
                color="#C9A960"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                FAQ
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "22px", md: "28px" }}
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                color="#263A33"
                fontWeight="600"
              >
                Common Questions
              </Heading>
              <Text
                color="rgba(46,46,46,0.65)"
                fontSize="13.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Everything you need to know before starting your journey
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                {
                  q: "How do I choose between Individual, Couples, or Adolescent Therapy?",
                  a: "During your initial discovery intake, we assess your primary goals and life context to recommend the most supportive modality. You also have the flexibility to transition between modalities as your needs evolve."
                },
                {
                  q: "How long is each therapy session?",
                  a: "Each therapy session lasts approximately 50 minutes. This is your dedicated clinical hour to process at your own pace with structured practitioner guidance."
                },
                {
                  q: "Can I choose my therapist and how are they vetted?",
                  a: "Yes. While we recommend a clinician based on your initial screening, you have full autonomy to select from our collective. Every practitioner undergoes rigorous credential verification, clinical interviews, and ongoing supervisory case reviews."
                },
                {
                  q: "Is therapy completely confidential?",
                  a: "Ethical confidentiality is a foundational principle. Information is never disclosed except in rare circumstances concerning safety, as outlined in your clinical intake, and records are secured in HIPAA-compliant infrastructure."
                },
                {
                  q: "Do you offer sessions across India as well as in-person care?",
                  a: "Yes. Our virtual infrastructure provides secure, HIPAA-compliant therapy to clients across all Indian states and globally. For in-person care, we operate in clinical hubs in Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, and Pune."
                }
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.12)"
                  mb={2.5}
                  bg="rgba(255,255,255,0.7)"
                  backdropFilter="blur(8px)"
                  borderRadius="xl"
                  overflow="hidden"
                >
                  <AccordionButton py={3.5} px={5} _hover={{ bg: "rgba(169,203,183,0.05)" }}>
                    <Box
                      flex="1"
                      textAlign="left"
                      fontWeight="600"
                      fontSize="15px"
                      color="#263A33"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                    >
                      {item.q}
                    </Box>
                    <AccordionIcon color="#56756D" />
                  </AccordionButton>
                  <AccordionPanel
                    pt={1}
                    pb={4}
                    px={5}
                    color="rgba(46,46,46,0.7)"
                    fontSize="13.5px"
                    lineHeight="1.65"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                  >
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

            <HStack spacing={2} pt={1}>
              <Text fontSize="13px" color="rgba(46,46,46,0.6)" fontFamily="'Inter', var(--font-inter), sans-serif">
                Still have questions?
              </Text>
              <Button
                as={NextLink}
                href="/contactus"
                variant="link"
                color="#56756D"
                fontSize="13px"
                fontWeight="700"
                rightIcon={<FiArrowRight />}
              >
                Talk to our care team
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>


      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <Box
        py={{ base: 12, md: 16 }}
        textAlign="center"
        color="white"
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)"
      >
        <Box
          position="absolute"
          top="-80px"
          right="-60px"
          w="250px"
          h="250px"
          borderRadius="full"
          bg="rgba(169,203,183,0.1)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-60px"
          left="-40px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(201,169,96,0.1)"
          pointerEvents="none"
        />

        <Container maxW="3xl" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <VStack spacing={4.5}>
              <Heading
                as="h2"
                fontSize={{ base: "24px", md: "32px" }}
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
                lineHeight="1.25"
              >
                Your journey starts with clinical clarity
              </Heading>
              <Text
                fontSize={{ base: "14px", md: "14.5px" }}
                opacity={0.92}
                maxW="lg"
                lineHeight="1.7"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Don&apos;t wait to address the early markers of distress. Our vetted specialists are ready to help you navigate this chapter of life.
              </Text>
              <Button
                as={NextLink}
                href="/therapists/discovery"
                bg="white"
                color="#263A33"
                borderRadius="full"
                h="44px"
                px={8}
                fontWeight="600"
                fontSize="13.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                shadow="md"
                _hover={{ bg: "rgba(255,255,255,0.9)", transform: "translateY(-1px)", shadow: "lg" }}
                transition="all 0.25s ease"
              >
                Find Your Therapist
              </Button>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
}
