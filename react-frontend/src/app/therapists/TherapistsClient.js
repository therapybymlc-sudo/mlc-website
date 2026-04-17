'use client'

import React, { useState } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, Stack, Circle, Flex, Divider, 
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiBriefcase, FiShield, FiHeart, FiActivity, FiVideo, FiClock, FiBookOpen, FiUsers, FiAward, 
  FiAirplay, FiClipboard, FiSmile, FiZap, FiBarChart2, FiGlobe, FiChevronDown, FiWind, FiSun, FiNavigation, FiLink
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
    desc: "Our proprietary, private video tool is designed for therapy, ensuring a stable and secure space for every session."
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
        <Box position="absolute" inset={0} zIndex={0}>
          <Image src="/serene_therapy_office_1776423989664.png" alt="" w="full" h="full" objectFit="cover" opacity="0.8" />
        </Box>
        <Box position="absolute" inset={0} bg="rgba(255, 255, 255, 0.92)" zIndex={1} />

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

            <VStack align="center" spacing={0} position="relative">
               <Box w="300px" mb={-4}>
                 <Image 
                    src="/therapy_cat_final.png" 
                    alt="Therapy Cat" 
                    w="full" 
                    filter="brightness(0) saturate(100%) invert(43%) sepia(16%) saturate(693%) hue-rotate(117deg) brightness(96%) contrast(88%)"
                    opacity="0.9"
                 />
               </Box>
               
               <VStack align="stretch" spacing={2} position="relative" mt={-4}>
                  <Box position="absolute" left="30px" top="0" bottom="0" w="2.5px" bg="#56756D" opacity="0.4" zIndex={0} />
                  
                  {[
                    "Clinical Admin & Suite",
                    "Shared Client Journey",
                    "Well-being & Self-Care",
                    "Community & Growth"
                  ].map((label, i) => (
                    <MotionBox key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i*0.2 }}>
                      <HStack spacing={6} align="center" py={4}>
                        <Box position="relative" w="60px" h="60px">
                          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 C20 20 10 50 40 70 C70 90 90 60 60 40 C30 20 20 80 50 90 C80 100 100 30 70 10 C40 -10 10 30 30 60 C50 90 90 70 80 40 C70 10 20 20 10 50" stroke="#56756D" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                          </svg>
                        </Box>
                        <VStack align="start" spacing={0}>
                           <Text fontSize="xs" fontWeight="900" color="teal.800" letterSpacing="widest">SECTION 0{i+1}</Text>
                           <Text fontSize="md" fontWeight="700" color="teal.900" fontFamily="'Playfair Display', serif">{label}</Text>
                        </VStack>
                      </HStack>
                    </MotionBox>
                  ))}
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

      {/* 📈 COMPREHENSIVE GROWTH & SUPERVISION */}
      <Box py={32} px={6} bg="white">
         <Container maxW="7xl">
            <VStack spacing={20}>
               <VStack spacing={6} textAlign="center" maxW="4xl">
                  <Badge colorScheme="teal" px={4} py={1} borderRadius="full">PROFESSIONAL STEWARDSHIP</Badge>
                  <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize={{ base: "3xl", md: "5xl" }}>Continuing Education & Holistic Growth</Heading>
                  <Text color="gray.600" fontSize="xl" lineHeight="relaxed">
                    At MLC, we believe the therapist’s growth is never "finished." We are building a structured ecosystem where clinical supervision, professional development, and community connection happen in one seamless experience.
                  </Text>
               </VStack>

               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
                  {/* Supervision Cohorts */}
                  <VStack align="start" p={12} bg="teal.50" borderRadius="3rem" spacing={8} border="1px solid" borderColor="teal.100">
                     <Circle size="70px" bg="teal.800" color="white" shadow="xl"><Icon as={FiAward} w={8} h={8} /></Circle>
                     <VStack align="start" spacing={4}>
                        <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">Supervision Cohorts & 1:1 Labs</Heading>
                        <Text color="gray.700" fontSize="lg" lineHeight="1.8">
                          Experience a seamless clinical journey where your <b>supervisor is on the same platform</b>. Conduct your reflective sessions through our secure video tools, tracks goals together, and share clinical resources in one unified space.
                        </Text>
                        <Text color="gray.600">
                          Our cohorts aren't just for case-by-case troubleshooting—they are designed to help you <b>grow as a therapist and an individual</b> in the room with your clients.
                        </Text>
                     </VStack>
                     <Button as={NextLink} href="/supervision" variant="link" color="teal.800" rightIcon={<FiChevronDown />} fontWeight="800">Explore Supervision</Button>
                  </VStack>

                  {/* Therapist Community */}
                  <VStack align="start" p={12} bg="teal.900" color="white" borderRadius="3rem" spacing={8} shadow="2xl" position="relative" overflow="hidden">
                     <Box position="absolute" top="-20%" right="-20%" w="200px" h="200px" bg="teal.800" borderRadius="full" filter="blur(60px)" opacity="0.3" />
                     <Circle size="70px" bg="teal.700" color="teal.300" shadow="xl"><Icon as={FiUsers} w={8} h={8} /></Circle>
                     <VStack align="start" spacing={4}>
                        <Heading size="lg" fontFamily="'Playfair Display', serif">A Global Collective of Peers</Heading>
                        <Text opacity="0.9" fontSize="lg" lineHeight="1.8">
                          Break the isolation of private practice. Connect with a community of therapists who connect, grow, and support one another in ways that were previously impossible.
                        </Text>
                        <Text opacity="0.8">
                          From peer-led learning circles to holistic wellness events, we are creating a world where your practice is held by a healthy, professional community.
                        </Text>
                     </VStack>
                     <Button 
                       as="a" 
                       href="https://forms.office.com/r/MF2yHPLsz3" 
                       target="_blank" 
                       bg="white" 
                       color="teal.900" 
                       borderRadius="full" 
                       px={10} 
                       py={6} 
                       fontWeight="900"
                       _hover={{ bg: "teal.100", transform: "scale(1.02)" }}
                       transition="all 0.2s"
                     >
                       Join the Community
                     </Button>
                  </VStack>
               </SimpleGrid>

               {/* Continuing Education */}
               <Box w="full" p={12} bg="rgba(201, 169, 96, 0.05)" borderRadius="3rem" border="1px dashed" borderColor="#C9A960">
                 <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} alignItems="center">
                    <VStack align="start" gridColumn={{ md: "span 2" }}>
                       <HStack color="#C9A960" spacing={4}>
                         <Icon as={FiBookOpen} w={6} h={6} />
                         <Heading size="md">Lifelong Clinical Learning</Heading>
                       </HStack>
                       <Text color="gray.600" mt={2}>
                         Access curated workshops and structured training programs designed to deepen your therapeutic identity and refine your clinical formulations across various modalities.
                       </Text>
                    </VStack>
                    <Box textAlign={{ md: "right" }}>
                       <LinkButton href="/workshops" variant="outline" borderColor="#C9A960" color="#C9A960" borderRadius="full">View Workshops</LinkButton>
                    </Box>
                 </SimpleGrid>
               </Box>
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
