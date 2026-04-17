'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, Stack, Circle, Flex, Divider, 
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiBriefcase, FiShield, FiHeart, FiActivity, FiVideo, FiClock, FiBookOpen, FiUsers, FiAward, 
  FiAirplay, FiClipboard, FiSmile, FiZap, FiBarChart2, FiGlobe
} from "react-icons/fi";
import NextLink from "next/link";
import { apiGet } from "../../api.js";
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
  const [content, setContent] = useState({});

  return (
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌿 VISIONARY HERO */}
      <Box pt={32} pb={20} px={6} bgGradient="linear(to-b, #E9F2ED, #FDFBFA)">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16} alignItems="center">
            <VStack align="start" spacing={8}>
              <Badge colorScheme="teal" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest">THERAPIST ECOSYSTEM</Badge>
              <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} fontFamily="'Playfair Display', serif" color="teal.900" lineHeight="1.1" fontWeight="600">
                Holding Space for You, So You Can Hold Space for Others.
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall" maxW="xl">
                MLC is more than a platform—it’s an ecosystem designed to protect clinical integrity and prevent therapist burnout. We provide the tools, the community, and the care you need to practice at your highest potential.
              </Text>
              <HStack spacing={4}>
                <LinkButton href="/therapist-apply" bg="teal.800" color="white" borderRadius="full" px={10} py={7} _hover={{ bg: "teal.900" }}>
                  Apply to the Collective
                </LinkButton>
                <LinkButton href="/login/therapist" variant="ghost" color="teal.800">
                  Therapist Sign In
                </LinkButton>
              </HStack>
            </VStack>
            <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              <Image 
                src="/serene_therapy_office_1776423989664.png" 
                alt="Therapist Workspace" 
                borderRadius="3rem" 
                shadow="2xl" 
                h={{ base: "300px", md: "500px" }}
                w="full"
                objectFit="cover"
              />
            </MotionBox>
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
                  <SimpleGrid columns={2} spacing={8} w="full">
                     <VStack align="start">
                        <Icon as={FiSmile} w={8} h={8} color="teal.300" />
                        <Text fontWeight="800">Burnout Check-ins</Text>
                        <Text fontSize="xs" opacity="0.7">Keep track of your clinical capacity and emotional load.</Text>
                     </VStack>
                     <VStack align="start">
                        <Icon as={FiZap} w={8} h={8} color="teal.300" />
                        <Text fontWeight="800">Sustainable Growth</Text>
                        <Text fontSize="xs" opacity="0.7">Resources and communities dedicated to your own well-being.</Text>
                     </VStack>
                  </SimpleGrid>
               </VStack>
               <Image src="/human_connection_therapy_1776424085531.png" alt="Self Care" borderRadius="3rem" shadow="2xl" />
            </SimpleGrid>
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
