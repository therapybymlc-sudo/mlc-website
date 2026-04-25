'use client'

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Button,
  SimpleGrid,
  Icon,
  Stack,
  Flex,
  Badge,
  Circle,
  Divider,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiGlobe, FiLayers, FiUsers, FiCpu, FiShield, 
  FiArrowRight, FiActivity, FiZap, FiTarget, FiCheckCircle
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

export default function EcosystemClient() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden">
      {/* 🌌 HERO SECTION - THE VISION */}
      <Box position="relative" minH="100vh" bg="teal.900" display="flex" alignItems="center" py={20}>
        <Box 
          position="absolute" 
          inset={0} 
          bgImage="url('/therapy_ecosystem_hero.png')" 
          bgSize="cover" 
          bgPosition="center" 
          opacity="0.4"
          filter="grayscale(20%) brightness(0.8)"
        />
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="linear(to-b, rgba(20, 54, 48, 0.8), rgba(20, 54, 48, 0.95))"
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={16} align="center">
            <MotionVStack 
              align="start" 
              spacing={8} 
              flex="1.2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <HStack spacing={3}>
                <Badge bg="mlc.gold" color="teal.900" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="900" letterSpacing="2px">
                  INDIA'S FIRST
                </Badge>
                <Text color="whiteAlpha.800" fontWeight="700" fontSize="xs" letterSpacing="3px">THE MLC BLUEPRINT</Text>
              </HStack>
              
              <Heading 
                fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }} 
                fontFamily="'Forum', serif" 
                color="white" 
                lineHeight="1"
              >
                The Therapy <br />
                <chakra.span color="mlc.gold">Ecosystem.</chakra.span>
              </Heading>
              
              <Text 
                fontSize={{ base: "xl", md: "2xl" }} 
                color="whiteAlpha.900" 
                maxW="xl" 
                fontFamily="'Inter', sans-serif"
                lineHeight="1.6"
              >
                We aren't just a clinic. We are a connected infrastructure where clients, therapists, and supervisors thrive in one unified clinical environment.
              </Text>
              
              <Stack direction={{ base: "column", sm: "row" }} spacing={6} pt={4} w="full">
                <Button 
                  as={NextLink} 
                  href="/signup/client" 
                  size="xl" 
                  bg="mlc.gold" 
                  color="teal.900" 
                  h="70px" 
                  px={12} 
                  borderRadius="full" 
                  fontWeight="900"
                  _hover={{ bg: "white", transform: "translateY(-3px)", shadow: "2xl" }}
                  transition="all 0.3s"
                >
                  Join as a Client
                </Button>
                <Button 
                  as={NextLink} 
                  href="/signup/therapist" 
                  size="xl" 
                  variant="outline" 
                  color="white" 
                  borderColor="whiteAlpha.400"
                  h="70px" 
                  px={12} 
                  borderRadius="full"
                  _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                >
                  Apply as Therapist
                </Button>
              </Stack>
            </MotionVStack>

            <MotionBox 
              flex="0.8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              display={{ base: "none", lg: "block" }}
            >
              <Circle size="500px" border="1px solid" borderColor="whiteAlpha.300" position="relative">
                 <Circle size="350px" border="1px solid" borderColor="whiteAlpha.400">
                    <Circle size="200px" border="1px solid" borderColor="mlc.gold" bg="whiteAlpha.100">
                       <Icon as={FiActivity} boxSize={12} color="mlc.gold" />
                    </Circle>
                 </Circle>
                 {/* Floating Labels */}
                 <Box position="absolute" top="10%" left="0" p={4} bg="white" borderRadius="xl" shadow="2xl">
                    <Text fontWeight="800" fontSize="xs" color="teal.900">SECURE MATCHING</Text>
                 </Box>
                 <Box position="absolute" bottom="20%" right="-5%" p={4} bg="teal.800" border="1px solid" borderColor="mlc.gold" borderRadius="xl" shadow="2xl">
                    <Text fontWeight="800" fontSize="xs" color="mlc.gold">CLINICAL DEPTH</Text>
                 </Box>
              </Circle>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* 🔄 THE PROBLEM: MARKETPLACE VS ECOSYSTEM */}
      <Box py={32} bg="white">
        <Container maxW="7xl">
          <VStack spacing={20}>
            <VStack spacing={6} textAlign="center" maxW="3xl">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Why an Ecosystem?</Heading>
              <Text fontSize="lg" color="gray.600">
                Most platforms are "Marketplaces"—they just connect you and then step away. MLC is building a **Connected Ecosystem** that stays with you at every clinical touchpoint.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16}>
              <VStack align="start" p={12} bg="gray.50" borderRadius="3xl" spacing={8}>
                <Badge colorScheme="red" px={4} py={1} borderRadius="full">THE MARKETPLACE MODEL</Badge>
                <Heading size="lg" fontFamily="'Forum', serif">Fragmented Care</Heading>
                <VStack align="start" spacing={4} w="full">
                  {["Random Therapist Matching", "No Clinical Oversight", "Fragmented Resources", "Transactional Relationships"].map((item, i) => (
                    <HStack key={i} spacing={3}>
                      <Icon as={FiZap} color="red.400" />
                      <Text fontWeight="600" color="gray.600">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              <VStack align="start" p={12} bg="teal.900" color="white" borderRadius="3xl" spacing={8} shadow="2xl">
                <Badge colorScheme="yellow" px={4} py={1} borderRadius="full">THE MLC ECOSYSTEM</Badge>
                <Heading size="lg" fontFamily="'Forum', serif">Integrated Infrastructure</Heading>
                <VStack align="start" spacing={4} w="full">
                  {["Curated Clinical Matching", "Supervised Quality Control", "Centralized Care Tools", "Community-Led Growth"].map((item, i) => (
                    <HStack key={i} spacing={3}>
                      <Icon as={FiCheckCircle} color="mlc.gold" />
                      <Text fontWeight="600">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🧬 THE FOUR PILLARS */}
      <Box py={32} bg="#FDFBFA">
        <Container maxW="7xl">
          <VStack spacing={24}>
            <VStack spacing={4} textAlign="center">
              <Heading size="3xl" fontFamily="'Forum', serif" color="teal.900">One Unified Place.</Heading>
              <Text fontSize="xl" color="gray.500">Connecting the stakeholders of healing.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={8}>
              {[
                { 
                  title: "Clients", 
                  role: "Receive Guided Care", 
                  icon: FiTarget, 
                  color: "teal.500",
                  features: ["Matching Quiz", "Client Portal", "Secure Progress Tracking"]
                },
                { 
                  title: "Therapists", 
                  role: "Clinical Excellence", 
                  icon: FiLayers, 
                  color: "blue.500",
                  features: ["Practice Tools", "Peer Community", "Admin Support"]
                },
                { 
                  title: "Supervisors", 
                  role: "Quality Assurance", 
                  icon: FiShield, 
                  color: "mlc.gold",
                  features: ["Clinical Mentorship", "Case Review", "Vetting Engine"]
                },
                { 
                  title: "Community", 
                  role: "Collective Wisdom", 
                  icon: FiUsers, 
                  color: "purple.500",
                  features: ["Workshops", "Circles", "Knowledge Hub"]
                },
              ].map((pillar, i) => (
                <MotionVStack 
                  key={i} 
                  align="start" 
                  spacing={6} 
                  p={10} 
                  bg="white" 
                  borderRadius="3xl" 
                  shadow="sm" 
                  border="1px solid" 
                  borderColor="gray.100"
                  _hover={{ shadow: "xl", transform: "translateY(-8px)" }}
                  transition="all 0.3s"
                >
                  <Circle bg={`${pillar.color}10`} size="60px">
                    <Icon as={pillar.icon} color={pillar.color} boxSize={6} />
                  </Circle>
                  <Box>
                    <Heading size="md" fontFamily="'Forum', serif" color="teal.900" mb={1}>{pillar.title}</Heading>
                    <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="1px" textTransform="uppercase">{pillar.role}</Text>
                  </Box>
                  <VStack align="start" spacing={3} pt={4} borderTop="1px solid" borderColor="gray.50" w="full">
                    {pillar.features.map((feat, j) => (
                      <HStack key={j} spacing={2}>
                        <Icon as={FiArrowRight} fontSize="10px" color="teal.300" />
                        <Text fontSize="sm" fontWeight="600" color="gray.600">{feat}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </MotionVStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🛡️ THE TECHNOLOGY LAYER */}
      <Box py={32} bg="teal.900" color="white">
        <Container maxW="7xl">
          <Stack direction={{ base: "column", lg: "row" }} spacing={20} align="center">
            <Box flex="1">
              <Image 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" 
                borderRadius="4xl" 
                shadow="2xl" 
                alt="Technology for health"
                filter="sepia(0.3) contrast(1.1)"
              />
            </Box>
            <VStack flex="1.2" align="start" spacing={10}>
              <VStack align="start" spacing={4}>
                <Badge bg="mlc.gold" color="teal.900">INFRASTRUCTURE</Badge>
                <Heading size="3xl" fontFamily="'Forum', serif">Built for Humans, <br />Powered by Tech.</Heading>
              </VStack>
              <Text fontSize="lg" color="whiteAlpha.800" lineHeight="tall">
                We've built a custom clinical engine from the ground up. It’s designed to disappear into the background so you can focus on the healing.
              </Text>
              
              <SimpleGrid columns={2} spacing={10} w="full">
                <Box>
                  <Heading size="md" mb={2} color="mlc.gold">100% Private</Heading>
                  <Text fontSize="sm" color="whiteAlpha.600">End-to-end encryption for every message and session note.</Text>
                </Box>
                <Box>
                  <Heading size="md" mb={2} color="mlc.gold">Clinical Logic</Heading>
                  <Text fontSize="sm" color="whiteAlpha.600">Matching algorithms based on evidence-informed compatibility.</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* 🚀 SEO FOOTER SECTION */}
      <Box py={24} bg="gray.50">
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={10}>
            <Heading size="xl" fontFamily="'Forum', serif" color="teal.900">
              India's Digital Home for Professional Therapy
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Whether you are looking for **Online Therapy in Mumbai**, **Clinical Supervision in Bangalore**, or **Workshops for Therapists in Delhi**, MLC Health and Wellness Centre provides a unified ecosystem for every major Indian city.
            </Text>
            <Button 
              as={NextLink} 
              href="/therapists/discovery" 
              size="lg" 
              bg="teal.800" 
              color="white" 
              borderRadius="full" 
              px={12} 
              py={8}
              _hover={{ bg: "teal.900", transform: "scale(1.05)" }}
            >
              Start Your Journey
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
