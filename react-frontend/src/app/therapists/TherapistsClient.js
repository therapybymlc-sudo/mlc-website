'use client'

import React, { useState } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, Stack, Circle, Flex, Divider, 
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiBriefcase, FiShield, FiHeart, FiActivity, FiVideo, FiClock, FiBookOpen, FiUsers, FiAward, 
  FiAirplay, FiClipboard, FiSmile, FiZap, FiBarChart2, FiGlobe, FiChevronDown, FiWind, FiSun, FiNavigation
} from "react-icons/fi";
import NextLink from "next/link";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const ECOSYSTEM_FEATURES = [
  {
    title: "One-Stop Admin Solution",
    icon: FiClipboard,
    desc: "From SOAP notes and intelligent scheduling to digital consent forms—everything you need to run your practice ethically and efficiently."
  },
  {
    title: "Integrated Video-Conferencing",
    icon: FiVideo,
    desc: "Our proprietary, secure video tool is designed specifically for therapy, ensuring a stable and private space for every session."
  },
  {
    title: "Clinical Assessments",
    icon: FiBarChart2,
    desc: "Access our library of validated screening tools and assessments to help guide your clinical formulation and track progress over time."
  },
  {
    title: "The Shared Journey",
    icon: FiGlobe,
    desc: "Clients get their own dashboard where they can access shared resources, goals, and reflections, keeping their healing journey transparent and organized."
  }
];

const SELF_CARE_TOOLS = [
  { title: "Mindfulness Practices", icon: FiWind, desc: "Breath-work and presence tools to anchor yourself between sessions." },
  { title: "Guided Meditations", icon: FiSun, desc: "A library of auditory journeys to restore calm and focus." },
  { title: "Body Scans", icon: FiActivity, desc: "Somatic check-ins to release physical tension held from clinical sessions." },
  { title: "Grounding Exercises", icon: FiNavigation, desc: "Tactile and visual techniques for nervous system regulation." },
  { title: "MHP Support Events", icon: FiUsers, desc: "Dedicated virtual and in-person events focused on holding space for you." }
];

const GROWTH_FEATURES = [
  {
    title: "Structured Supervision",
    icon: FiUsers,
    desc: "Access reflective group and individual supervision sessions to help you navigate complex cases and clarify your therapeutic identity."
  },
  {
    title: "Continuing Education",
    icon: FiAward,
    desc: "Stay aligned with best practices through curated workshops, professional sessions, and opportunities for lifelong clinical learning."
  },
  {
    title: "Therapist Community",
    icon: FiHeart,
    desc: "Connect and grow with an incredible collective of peers who support one another in ways that build resilience and prevent isolation."
  }
];

export default function TherapistsClient() {
  return (
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌿 VISIONARY HERO WITH BACKGROUND */}
      <Box 
        position="relative" 
        pt={{ base: 32, md: 48 }} 
        pb={{ base: 20, md: 32 }} 
        px={6} 
        minH="80vh"
        display="flex"
        alignItems="center"
        overflow="hidden"
      >
        {/* Background Image */}
        <Box 
          position="absolute"
          inset={0}
          bgImage="url('/serene_therapy_office_1776423989664.png')"
          bgSize="cover"
          bgPosition="center"
          zIndex={-2}
        />
        {/* Translucent Sheen Overlay */}
        <Box 
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.4) 100%)"
          zIndex={-1}
        />

        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={20} alignItems="center">
            <VStack align="start" spacing={8} zIndex={1}>
              <Badge colorScheme="teal" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest">THE THERAPY ECOSYSTEM</Badge>
              <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} fontFamily="'Playfair Display', serif" color="teal.900" lineHeight="1.1" fontWeight="600">
                Holding Space for You.
              </Heading>
              <Text fontSize="xl" color="gray.700" lineHeight="tall" maxW="xl">
                MLC is a structured clinical home designed to support your growth, protect your well-being, and elevate your practice. We hold space for therapists just as deeply as we do for clients.
              </Text>
              <HStack spacing={4}>
                <LinkButton href="/therapist-apply" bg="teal.800" color="white" borderRadius="full" px={10} py={7} _hover={{ bg: "teal.900" }}>
                  Join the Collective
                </LinkButton>
                <LinkButton href="/login/therapist" variant="ghost" color="teal.800">
                  Therapist Sign In
                </LinkButton>
              </HStack>
            </VStack>

            {/* 📊 ECOSYSTEM FLOW CHART */}
            <VStack align="stretch" spacing={4} zIndex={1}>
               <Text fontWeight="800" color="teal.800" fontSize="xs" letterSpacing="2px" textAlign="center" mb={2}>EXPLORE THE ECOSYSTEM</Text>
               <MotionBox whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                 <VStack bg="rgba(255, 255, 255, 0.7)" backdropFilter="blur(10px)" p={8} borderRadius="3rem" border="2px solid white" shadow="xl" spacing={6}>
                    <HStack w="full" bg="white" p={4} borderRadius="2xl" shadow="sm"><Circle size="30px" bg="teal.800" color="white" fontSize="xs" fontWeight="900">1</Circle><Text fontWeight="700" fontSize="sm" color="teal.900">Advanced Admin & Clinical Suite</Text></HStack>
                    <Icon as={FiChevronDown} color="teal.300" boxSize={6} />
                    <HStack w="full" bg="white" p={4} borderRadius="2xl" shadow="sm"><Circle size="30px" bg="teal.800" color="white" fontSize="xs" fontWeight="900">2</Circle><Text fontWeight="700" fontSize="sm" color="teal.900">Shared Client Journey Dashboard</Text></HStack>
                    <Icon as={FiChevronDown} color="teal.300" boxSize={6} />
                    <HStack w="full" bg="white" p={4} borderRadius="2xl" shadow="sm"><Circle size="30px" bg="teal.800" color="white" fontSize="xs" fontWeight="900">3</Circle><Text fontWeight="700" fontSize="sm" color="teal.900">Therapist Well-being & Self-Care</Text></HStack>
                    <Icon as={FiChevronDown} color="teal.300" boxSize={6} />
                    <HStack w="full" bg="white" px={4} py={6} borderRadius="2xl" shadow="inner" bgGradient="linear(to-r, teal.800, teal.900)" color="white"><Text fontWeight="800" fontSize="md" w="full" textAlign="center">Professional Growth & Community</Text></HStack>
                 </VStack>
               </MotionBox>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 💠 THE CLINICAL DASHBOARD SUITE */}
      <Box py={24} px={6}>
        <Container maxW="7xl">
          <VStack spacing={16}>
             <VStack spacing={4} textAlign="center" maxW="3xl">
                <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">Your Complete Clinical Suite</Heading>
                <Text color="gray.600" fontSize="lg">Align with best practices effortlessly with a dashboard that handles the complexity of therapy administration.</Text>
             </VStack>
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} w="full">
                {ECOSYSTEM_FEATURES.map((f, i) => (
                  <HStack key={i} align="start" p={10} bg="white" borderRadius="2rem" shadow="sm" border="1px solid" borderColor="teal.50" spacing={6} transition="all 0.3s" _hover={{ shadow: "xl" }}>
                    <Circle size="60px" bg="teal.50" color="teal.700"><Icon as={f.icon} w={6} h={6} /></Circle>
                    <VStack align="start" spacing={2}>
                      <Heading size="md" color="teal.800">{f.title}</Heading>
                      <Text color="gray.500" fontSize="sm" lineHeight="1.7">{f.desc}</Text>
                    </VStack>
                  </HStack>
                ))}
             </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🧘 WELL-BEING: PRACTICING WHAT YOU PREACH */}
      <Box bg="teal.900" py={32} color="white" position="relative" overflow="hidden">
         <Box position="absolute" top="-10%" left="-10%" w="50%" h="50%" bg="teal.800" borderRadius="full" filter="blur(120px)" opacity="0.4" />
         <Container maxW="7xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={20} alignItems="center">
               <VStack align="start" spacing={10}>
                  <Badge bg="teal.700" color="teal.100" px={4} py={1} borderRadius="full">CLINICIAN CARE</Badge>
                  <Heading fontSize="5xl" fontFamily="'Playfair Display', serif" lineHeight="1.1">
                    Taking Care of You, So Burnout Stays at Bay.
                  </Heading>
                  <Text fontSize="xl" opacity="0.9" lineHeight="1.8">
                    MLC helps you practice what you preach by bringing therapist self-care to your fingertips. Our platform includes tools to monitor your own stress and burnout markers, helping you find balance in real-time.
                  </Text>
                  
                  {/* 🧘 SELF-CARE LIBRARY SUB-SECTION */}
                  <VStack align="start" spacing={6} w="full">
                    <Text fontWeight="800" color="teal.300" textTransform="uppercase" letterSpacing="widest" fontSize="sm">Self-Care Library</Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                       {SELF_CARE_TOOLS.map((tool, idx) => (
                         <HStack key={idx} p={4} bg="rgba(255,255,255,0.05)" borderRadius="xl" border="1px solid rgba(255,255,255,0.1)">
                            <Icon as={tool.icon} color="teal.300" />
                            <Text fontSize="xs" fontWeight="600">{tool.title}</Text>
                         </HStack>
                       ))}
                    </SimpleGrid>
                  </VStack>
               </VStack>
               <Image src="/human_connection_therapy_1776424085531.png" alt="Self Care" borderRadius="3rem" shadow="2xl" />
            </SimpleGrid>
         </Container>
      </Box>

      {/* 🏡 DETAILED SELF-CARE & MHP SUPPORT (NEW) */}
      <Box py={24} px={6} bg="#F5F9F7">
        <Container maxW="7xl">
           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {SELF_CARE_TOOLS.slice(0, 3).map((tool, i) => (
                <VStack key={i} align="start" p={10} bg="white" borderRadius="2rem" shadow="sm">
                   <Circle size="50px" bg="teal.50" color="teal.800" mb={4}><Icon as={tool.icon} /></Circle>
                   <Heading size="md" color="teal.900" mb={2}>{tool.title}</Heading>
                   <Text color="gray.500" fontSize="sm">{tool.desc} Essential for both your clients and your own presence.</Text>
                </VStack>
              ))}
           </SimpleGrid>
           <Box mt={10} p={10} bg="teal.800" borderRadius="2rem" color="white">
              <HStack spacing={6} align="center" direction={{ base: "column", md: "row" }}>
                 <Circle size="80px" bg="teal.700" color="teal.300"><Icon as={FiUsers} w={10} h={10} /></Circle>
                 <VStack align="start" spacing={2}>
                    <Heading size="lg" fontFamily="'Playfair Display', serif">MHP Support Events</Heading>
                    <Text opacity="0.9">Interactive sessions and peer circles focused on holding space for YOU. Because practitioners need community as much as they need tools.</Text>
                 </VStack>
              </HStack>
           </Box>
        </Container>
      </Box>

      {/* 📈 GROWTH & COMMUNITY */}
      <Box py={24} px={6} bg="white">
         <Container maxW="7xl">
            <VStack spacing={16}>
               <VStack spacing={4} textAlign="center" maxW="3xl">
                  <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">Continuing Education & Collective Growth</Heading>
                  <Text color="gray.600" fontSize="lg">Join a community where you connect, grow, and learn from one another in ways that elevate the entire field.</Text>
               </VStack>
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                  {GROWTH_FEATURES.map((f, i) => (
                    <VStack key={i} align="center" textAlign="center" p={10} bg="gray.50" borderRadius="2rem" transition="all 0.3s" _hover={{ bg: "teal.50", transform: "translateY(-5px)" }}>
                       <Circle size="70px" bg="white" color="teal.800" shadow="md" mb={6}><Icon as={f.icon} w={8} h={8} /></Circle>
                       <Heading size="md" color="teal.900" mb={4}>{f.title}</Heading>
                       <Text color="gray.600" fontSize="sm" lineHeight="relaxed">{f.desc}</Text>
                    </VStack>
                  ))}
               </SimpleGrid>
            </VStack>
         </Container>
      </Box>

      {/* 🚀 FINAL CALL TO ACTION */}
      <Box py={32} bg="teal.50" textAlign="center">
         <Container maxW="4xl">
            <VStack spacing={10}>
               <Heading size="2xl" fontFamily="'Playfair Display', serif" color="teal.900">Build Your Practice Within a Healthy Ecosystem.</Heading>
               <Text fontSize="xl" color="gray.600">We are creating a world where mental healthcare is sustainable for everyone. Join the MLC collective today.</Text>
               <LinkButton href="/therapist-apply" size="lg" bg="teal.800" color="white" borderRadius="full" px={16} py={8} height="auto" fontSize="xl" fontWeight="800" _hover={{ bg: "teal.900", transform: "scale(1.05)" }}>
                  Join the Collective
               </LinkButton>
            </VStack>
         </Container>
      </Box>
    </Box>
  );
}
