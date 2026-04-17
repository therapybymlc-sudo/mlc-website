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

// --- Custom Components for the artistic flow ---

const TangledBall = () => (
  <Box position="relative" w="60px" h="60px">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 C20 20 10 50 40 70 C70 90 90 60 60 40 C30 20 20 80 50 90 C80 100 100 30 70 10 C40 -10 10 30 30 60 C50 90 90 70 80 40 C70 10 20 20 10 50" 
            stroke="#56756D" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M30 30 C10 50 40 90 70 60 C90 40 60 10 30 20 C10 40 50 80 80 50" 
            stroke="#C9A960" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  </Box>
);

const TherapyCatSVG = () => (
  <Box w="140px" h="140px" mb={4}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
       {/* 🐱 IMPROVED MINIMALIST CAT - MORE RECOGNIZABLE */}
       <path 
         d="M30 80 C30 70 35 55 45 45 C45 45 40 35 40 25 C40 15 45 10 50 10 C55 10 60 15 60 25 C60 35 55 45 55 45 C65 55 70 70 70 80 L70 90 L30 90 Z" 
         stroke="#56756D" strokeWidth="2.5" strokeLinecap="round" strokeJoin="round" 
       />
       {/* Ears */}
       <path d="M43 28 L38 15 L48 20" stroke="#56756D" strokeWidth="2" strokeLinecap="round" />
       {/* Other Ear */}
       <path d="M57 28 L62 15 L52 20" stroke="#56756D" strokeWidth="2" strokeLinecap="round" />
       {/* Tail */}
       <path d="M70 85 C85 85 95 75 90 60 C85 45 75 50 70 65" stroke="#56756D" strokeWidth="2.5" strokeLinecap="round" />
       {/* Eyes */}
       <circle cx="46" cy="35" r="1" fill="#56756D" />
       <circle cx="54" cy="35" r="1" fill="#56756D" />
    </svg>
  </Box>
);

const FlowSection = ({ label, index }) => (
  <HStack spacing={6} align="center" py={4}>
    <TangledBall />
    <VStack align="start" spacing={0}>
       <Text fontSize="xs" fontWeight="900" color="teal.800" letterSpacing="widest">SECTION 0{index}</Text>
       <Text fontSize="md" fontWeight="700" color="teal.900" fontFamily="'Playfair Display', serif">{label}</Text>
    </VStack>
  </HStack>
);

export default function TherapistsClient() {
  return (
    <Box bg="#FDFBFA" minH="100vh" overflowX="hidden">
      {/* 🌿 VISIONARY HERO WITH ADJUSTED OVERLAY */}
      <Box 
        position="relative" 
        pt={{ base: 32, md: 48 }} 
        pb={{ base: 20, md: 32 }} 
        px={6} 
        minH="95vh"
        display="flex"
        alignItems="center"
      >
        {/* Actual Image Layer */}
        <Box 
          position="absolute"
          inset={0}
          zIndex={0}
        >
          <Image 
            src="/serene_therapy_office_1776423989664.png" 
            alt="" 
            w="full" 
            h="full" 
            objectFit="cover"
            opacity="0.8" // Slightly reduced image opacity
          />
        </Box>
        
        {/* Sheen Overlay Layer - MORE OPAQUE AS REQUESTED */}
        <Box 
          position="absolute"
          inset={0}
          bg="rgba(255, 255, 255, 0.88)" // More white/less transparent sheen
          zIndex={1}
        />

        <Container maxW="7xl" position="relative" zIndex={2}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={20} alignItems="center">
            <VStack align="start" spacing={8}>
              <Badge bg="teal.800" color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest">THE THERAPY ECOSYSTEM</Badge>
              <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} fontFamily="'Playfair Display', serif" color="teal.900" lineHeight="1" fontWeight="600">
                Holding Space <br /> for You.
              </Heading>
              <Text fontSize="xl" color="teal.900" fontWeight="600" lineHeight="tall" maxW="xl">
                A structured clinical home designed to support your growth, protect your well-being, and elevate your practice.
              </Text>
              <HStack spacing={4}>
                <LinkButton href="/therapist-apply" bg="teal.800" color="white" borderRadius="full" px={10} py={7} _hover={{ bg: "teal.900" }}>
                  Join the Collective
                </LinkButton>
                <LinkButton href="/login/therapist" variant="ghost" color="teal.800" fontWeight="900">
                  Therapist Sign In
                </LinkButton>
              </HStack>
            </VStack>

            {/* 📊 ARTISTIC FLOW CHART (Refined SVG Cat) */}
            <VStack align="center" spacing={0} position="relative">
               {/* REFINED SVG CAT - MORE RECOGNIZABLE SITTING POSTURE */}
               <TherapyCatSVG />
               
               {/* THE STRING FLOW */}
               <VStack align="stretch" spacing={2} position="relative" mt={-4}>
                  {/* Vertical String Line */}
                  <Box position="absolute" left="30px" top="0" bottom="0" w="2.5px" bg="#56756D" opacity="0.4" zIndex={0} />
                  
                  <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <FlowSection index={1} label="Clinical Admin & Suite" />
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <FlowSection index={2} label="Shared Client Journey" />
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                    <FlowSection index={3} label="Well-being & Self-Care" />
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                    <FlowSection index={4} label="Community & Growth" />
                  </MotionBox>
               </VStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 💠 THE CLINICAL DASHBOARD SUITE */}
      <Box py={24} px={6} bg="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
             <VStack spacing={4} textAlign="center" maxW="3xl">
                <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">Your Complete Clinical Suite</Heading>
                <Text color="gray.600" fontSize="lg">Align with best practices effortlessly with a dashboard that handles the complexity of therapy administration.</Text>
             </VStack>
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} w="full">
                {ECOSYSTEM_FEATURES.map((f, i) => (
                  <HStack key={i} align="start" p={10} bg="#FDFBFA" borderRadius="2rem" shadow="sm" border="1px solid" borderColor="teal.50" spacing={6} transition="all 0.3s" _hover={{ shadow: "xl" }}>
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
                    <Text fontWeight="800" color="teal.300" textTransform="uppercase" letterSpacing="widest" fontSize="sm">Self-Care & Resource Library</Text>
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

      {/* 🏡 DETAILED SELF-CARE & MHP SUPPORT CIRCLES */}
      <Box py={24} px={6} bg="#F5F9F7" borderBottom="1px solid" borderColor="teal.50">
        <Container maxW="7xl">
           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {[
                { title: "Mindfulness & Meditations", desc: "Breath-work, guided auditory journeys, and presence tools to anchor yourself between sessions.", icon: FiWind },
                { title: "Somatic Check-ins", desc: "Body scans and grounding techniques to release physical tension held from complex clinical hours.", icon: FiActivity },
                { title: "Resource Arsenal", desc: "Build your own toolkit of support frameworks and client-ready exercises, ready at your fingertips.", icon: FiShield }
              ].map((tool, i) => (
                <VStack key={i} align="start" p={10} bg="white" borderRadius="2rem" shadow="sm" transition="all 0.3s" _hover={{ shadow: "xl" }}>
                   <Circle size="50px" bg="teal.50" color="teal.800" mb={4}><Icon as={tool.icon} /></Circle>
                   <Heading size="md" color="teal.900" mb={2}>{tool.title}</Heading>
                   <Text color="gray.500" fontSize="sm" lineHeight="relaxed">{tool.desc}</Text>
                </VStack>
              ))}
           </SimpleGrid>
           <Box mt={10} p={10} bg="teal.800" borderRadius="3rem" color="white" position="relative" overflow="hidden">
              <HStack spacing={10} align="center" direction={{ base: "column", md: "row" }}>
                 <Circle size="100px" bg="teal.700" color="teal.300" shadow="xl"><Icon as={FiUsers} w={12} h={12} /></Circle>
                 <VStack align="start" spacing={4}>
                    <Heading size="lg" fontFamily="'Playfair Display', serif">MHP Support Events & Circles</Heading>
                    <Text fontSize="lg" opacity="0.9" maxW="2xl">
                      Interactive sessions and peer circles focused on <b>holding space for YOU</b>. Practice what you preach with structured self-care sessions, peer learning, and community support built for the modern therapist.
                    </Text>
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
                    <VStack key={i} align="center" textAlign="center" p={10} bg="#FDFBFA" borderRadius="2rem" transition="all 0.3s" _hover={{ bg: "teal.50", transform: "translateY(-5px)" }}>
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
