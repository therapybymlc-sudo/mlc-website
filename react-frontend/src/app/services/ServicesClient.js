'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, Stack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Circle, Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiUser, FiUsers, FiClock, FiShield, FiHeart, FiMapPin, FiVideo, FiArrowRight, FiCheck } from "react-icons/fi";
import NextLink from "next/link";
import { apiGet } from "../../api.js";

const MotionBox = motion(Box);

const CORE_SERVICES = [
  {
    title: "Individual Therapy",
    icon: FiUser,
    desc: "One-on-one sessions focused on your personal growth, navigating patterns, and resolving internal distress in a safe clinical space.",
    path: "/individual-therapy"
  },
  {
    title: "Relational Therapy",
    icon: FiUsers,
    desc: "Helping partners and families rebuild trust and communication through structured, neutral guidance that fosters deeper connection.",
    path: "/couples-therapy"
  },
  {
    title: "Clinical Supervision",
    icon: FiShield,
    desc: "A dedicated space for mental health professionals to navigate complex cases, ethical dilemmas, and professional sustainability.",
    path: "/supervision"
  },
  {
    title: "Corporate Wellness",
    icon: FiClock,
    desc: "Tailored programs for organizations focusing on workplace burnout, emotional regulation, and building resilient team cultures.",
    path: "/corporate"
  }
];

const PROCESS_STEPS = [
  { title: "Discovery Quiz", desc: "Share your clinical needs and context through our screened matching system." },
  { title: "Precision Match", desc: "Our system identifies the specialist best suited to your specific profile." },
  { title: "Intake Consultation", desc: "An optional brief consult to ensure alignment and build initial trust." },
  { title: "Begin Therapy", desc: "Commit to a consistent, evidence-based journey toward deeper healing." }
];

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
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌟 HERO */}
      <Box pt={32} pb={20} px={6} bg="teal.900" color="white" position="relative" overflow="hidden">
         <Box position="absolute" top="0" right="0" w="50%" h="full" bgGradient="linear(to-l, teal.800, transparent)" opacity="0.5" />
         <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16} alignItems="center">
               <VStack align="start" spacing={8} zIndex={2}>
                  <Badge bg="teal.700" color="white" px={4} py={1} borderRadius="full" fontSize="xs">PREMIUM CLINICAL CARE</Badge>
                  <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} fontFamily="'Playfair Display', serif" lineHeight="1.1">
                    Therapy Designed for Your Unique Context.
                  </Heading>
                  <Text fontSize="xl" opacity="0.9" lineHeight="tall">
                    MLC provides a strictly vetted collective of therapists across India. We move beyond generic support to offer precision-matched care that respects your identity, life stage, and psychological needs.
                  </Text>
                  <Button as={NextLink} href="/therapists/discovery" bg="white" color="teal.900" borderRadius="full" px={10} py={7} fontSize="lg" fontWeight="800" _hover={{ bg: "teal.50", transform: "translateY(-2px)" }}>
                    Find Your Therapist
                  </Button>
               </VStack>
               <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                 <Image 
                   src="/human_connection_therapy_1776424085531.png" 
                   alt="Clinical Session" 
                   borderRadius="3rem" 
                   shadow="2xl" 
                 />
               </MotionBox>
            </SimpleGrid>
         </Container>
      </Box>

      {/* 🏛️ HOW IT WORKS */}
      <Box py={24} px={6} bg="white">
         <Container maxW="7xl">
            <VStack spacing={16}>
               <VStack spacing={4} textAlign="center">
                  <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">Your Path to Healing</Heading>
                  <Text color="gray.600" fontSize="lg">A structured, clinical approach to getting you the support you need.</Text>
               </VStack>
               <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} w="full">
                  {PROCESS_STEPS.map((step, i) => (
                    <VStack key={i} align="center" textAlign="center" spacing={6} px={4}>
                       <Circle size="60px" bg="teal.50" color="teal.800" fontWeight="900" fontSize="xl" border="2px solid" borderColor="teal.100">{i+1}</Circle>
                       <VStack spacing={2}>
                         <Text fontWeight="800" color="teal.900" fontSize="lg">{step.title}</Text>
                         <Text color="gray.500" fontSize="sm">{step.desc}</Text>
                       </VStack>
                    </VStack>
                  ))}
               </SimpleGrid>
            </VStack>
         </Container>
      </Box>

      {/* 💠 CORE SERVICES */}
      <Box py={24} px={6} bg="gray.50">
         <Container maxW="7xl">
            <VStack spacing={16}>
               <VStack spacing={4} textAlign="center">
                  <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">Our Specializations</Heading>
                  <Text color="gray.600" fontSize="lg">Every service we offer is grounded in clinically verified modalities and ethical practice.</Text>
               </VStack>
               <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
                  {CORE_SERVICES.map((s, i) => (
                    <MotionBox key={i} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                       <VStack align="start" p={8} bg="white" borderRadius="2rem" shadow="md" h="full" border="1px solid" borderColor="teal.50">
                          <Circle size="50px" bg="teal.800" color="white"><Icon as={s.icon} /></Circle>
                          <Heading size="md" pt={4} color="teal.900">{s.title}</Heading>
                          <Text color="gray.600" fontSize="sm" flex={1}>{s.desc}</Text>
                          <Button as={NextLink} href={s.path} variant="link" color="teal.700" rightIcon={<FiArrowRight />} mt={4}>Learn More</Button>
                       </VStack>
                    </MotionBox>
                  ))}
               </SimpleGrid>
            </VStack>
         </Container>
      </Box>

      {/* 📍 LOCATIONS */}
      <Box py={20} px={6} bg="white" borderBottom="1px solid" borderColor="gray.100">
         <Container maxW="5xl">
            <Stack direction={{ base: "column", md: "row" }} spacing={12} align="center">
               <VStack align="start" flex={1} spacing={6}>
                  <HStack color="teal.600"><Icon as={FiMapPin} /><Text fontWeight="800">AVAILABILITY</Text></HStack>
                  <Heading size="lg" fontFamily="'Playfair Display', serif">Online & In-Person Support.</Heading>
                  <Text color="gray.600" lineHeight="1.8">
                     We offer secure, end-to-end encrypted <b>Online Therapy across India</b>. For those seeking <b>In-Person Therapy</b>, we are currently active in major hubs including Mumbai, Delhi, Bangalore, Hyderabad, and Chennai.
                  </Text>
                  <SimpleGrid columns={2} spacing={2} w="full">
                     {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map(city => (
                        <HStack key={city} spacing={2} color="gray.500" fontSize="sm"><Icon as={FiCheck} color="teal.400" /><Text>{city}</Text></HStack>
                     ))}
                  </SimpleGrid>
               </VStack>
               <Box flex={1} position="relative">
                  <Image src="/service1_new.jpg" alt="Space" borderRadius="3rem" shadow="xl" />
                  <Badge position="absolute" bottom={8} right={8} bg="white" p={4} borderRadius="xl" shadow="lg" border="1px solid" borderColor="teal.100">
                     <HStack><Icon as={FiVideo} color="teal.600" /><Text fontWeight="800" fontSize="xs">SECURE VIDEO ENABLED</Text></HStack>
                  </Badge>
               </Box>
            </Stack>
         </Container>
      </Box>

      {/* ❓ FAQ */}
      <Box py={24} px={6} bg="gray.50">
         <Container maxW="3xl">
            <VStack spacing={12}>
               <Heading color="teal.900" fontFamily="'Playfair Display', serif" textAlign="center">Common Questions</Heading>
               <Accordion allowToggle w="full">
                  {[
                     { q: "Is therapy with MLC confidential?", a: "Yes. All our clinical records are stored securely in a HIPAA-compliant environment, and your sessions are protected by strict clinical confidentiality." },
                     { q: "How are therapists vetted?", a: "We don't just 'list' therapists. Every clinician goes through a clinical screening, reference checks, and supervised case reviews before joining the collective." },
                     { q: "Which city is in-person therapy available in?", a: "Currently, our therapists are available for in-person sessions in Mumbai, Delhi, Bangalore, Hyderabad, Chennai, and other major cities. Check the discovery quiz for latest availability." }
                  ].map((faq, i) => (
                    <AccordionItem key={i} border="none" bg="white" mb={4} borderRadius="xl" shadow="sm">
                       <AccordionButton py={6} _expanded={{ color: "teal.600" }}>
                          <Box flex="1" textAlign="left" fontWeight="700">{faq.q}</Box>
                          <AccordionIcon />
                       </AccordionButton>
                       <AccordionPanel pb={6} color="gray.600" lineHeight="relaxed">{faq.a}</AccordionPanel>
                    </AccordionItem>
                  ))}
               </Accordion>
            </VStack>
         </Container>
      </Box>

      {/* 🌟 FINAL CTA */}
      <Box py={24} textAlign="center">
         <Container maxW="3xl">
            <VStack spacing={10}>
               <Heading size="2xl" fontFamily="'Playfair Display', serif" color="teal.900">Your journey starts with clinical clarity.</Heading>
               <Text fontSize="lg" color="gray.600">Don't wait to address the early markers of distress. Our vetted specialists are ready to help you navigate this season of life.</Text>
               <Button as={NextLink} href="/therapists/discovery" size="lg" bg="teal.800" color="white" borderRadius="full" px={16} py={8} height="auto" fontSize="xl" fontWeight="800" _hover={{ bg: "teal.900", transform: "scale(1.05)" }}>
                  Find Your Therapist
               </Button>
            </VStack>
         </Container>
      </Box>
    </Box>
  );
}
