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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  SimpleGrid,
  Icon,
  Stack,
  Flex,
  Badge,
  Circle,
  Divider,
  List,
  ListItem
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiAward, FiCheck, FiArrowRight, FiBookOpen, FiActivity, 
  FiShield, FiTarget, FiStar, FiUserCheck
} from "react-icons/fi";
import NextLink from "next/link";
import ActiveSupervisors from "../../components/ActiveSupervisors";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function SupervisionPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden">
      {/* 🌿 HERO SECTION */}
      <Box position="relative" h={{ base: "auto", lg: "90vh" }} bg="white">
        <Flex direction={{ base: "column", lg: "row" }} h="full">
          <MotionVStack 
            flex="1.2" 
            justify="center" 
            align="start" 
            p={{ base: 8, md: 16, lg: 24 }} 
            spacing={8}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              bg="teal.50" 
              color="teal.800" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              PROFESSIONAL DEVELOPMENT
            </Badge>
            <Heading 
              fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
              fontFamily="'Forum', serif" 
              color="teal.900" 
              lineHeight="1.1"
            >
              Clinical <br /> Supervision
            </Heading>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="gray.600" 
              maxW="600px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="tall"
            >
              At MLC, supervision is not case management. It is therapist formation. We offer structured online supervision cohorts for clinicians seeking identity clarity, ethical depth, and professional coherence.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full">
              <Button 
                as={NextLink} 
                href="/therapists/supervisors/directory" 
                size="xl" 
                bg="teal.800" 
                color="white" 
                h="64px" 
                px={10} 
                borderRadius="full" 
                _hover={{ bg: "teal.900", transform: "translateY(-2px)" }}
                transition="all 0.3s"
                rightIcon={<FiArrowRight />}
              >
                Browse Verified Supervisors
              </Button>
              <Button 
                as={NextLink} 
                href="/contactus" 
                size="xl" 
                variant="outline" 
                borderColor="teal.100" 
                h="64px" 
                px={10} 
                borderRadius="full"
                _hover={{ bg: "teal.50" }}
              >
                Inquire for Cohorts
              </Button>
            </Stack>
          </MotionVStack>
          
          <Box flex="1" position="relative" overflow="hidden">
            <MotionBox
              h="full"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <Image 
                src="/supervision_hero.png" 
                alt="Two experienced therapists in a reflective mentorship session, focusing on professional growth and clinical identity" 
                objectFit="cover" 
                h="full" 
                w="full" 
              />
            </MotionBox>
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              w="full" 
              h="full" 
              bgGradient="linear(to-r, white, transparent 30%)" 
              display={{ base: "none", lg: "block" }}
            />
          </Box>
        </Flex>
      </Box>

      {/* 🏺 THERAPIST FORMATION */}
      <Container maxW="7xl" py={{ base: 20, md: 32 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={20} alignItems="center">
          <VStack align="start" spacing={8}>
            <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">
              Depth over Fragmentation. <br /> Clarity over Confusion.
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              MLC supervision cohorts are structured environments designed to help therapists develop a clear clinical lens and a grounded professional identity. This is space to feel less scattered and more aligned in your work.
            </Text>
            
            <SimpleGrid columns={2} spacing={8} w="full" pt={6}>
              {[
                { title: "Clinical Lens", icon: FiTarget, desc: "Conceptualize cases from a clear theoretical framework." },
                { title: "Ethical Maturity", icon: FiShield, desc: "Decision-making clarity in the gray areas of practice." },
                { title: "Therapist Identity", icon: FiUserCheck, desc: "Developing who you are becoming as a professional." },
                { title: "Reflective Space", icon: FiActivity, desc: "Awareness of countertransference and reactivity." },
              ].map((item, i) => (
                <Box key={i}>
                  <HStack mb={2}>
                    <Icon as={item.icon} color="teal.500" />
                    <Text fontWeight="800" fontSize="xs" color="teal.800" letterSpacing="1px">{item.title}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">{item.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>

          <Box position="relative">
            <Image 
              src="https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=800" 
              borderRadius="3xl" 
              shadow="2xl" 
              alt="A therapist reviewing clinical materials, representing the commitment to depth and professional excellence at MLC"
            />
            <Box 
              position="absolute" 
              bottom="-40px" 
              left="-40px" 
              bg="white" 
              p={8} 
              borderRadius="2xl" 
              shadow="xl" 
              maxW="300px"
              display={{ base: "none", md: "block" }}
            >
              <VStack align="start" spacing={4}>
                <Circle bg="teal.50" size="48px">
                  <Icon as={FiStar} color="teal.500" />
                </Circle>
                <Text fontWeight="700" color="teal.900">Reflective Cohorts</Text>
                <Text fontSize="xs" color="gray.500">"This is not a space for quick technique exchange. It is a space to develop the therapist you are becoming."</Text>
              </VStack>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* 🧭 COHORT STRUCTURE */}
      <Box bg="teal.900" py={32} color="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="whiteAlpha" px={4} py={1} borderRadius="full" fontSize="xs">HOW IT WORKS</Badge>
              <Heading size="3xl" fontFamily="'Forum', serif">Supervision Structure.</Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} w="full">
              <MotionBox 
                bg="whiteAlpha.100" 
                p={10} 
                borderRadius="4xl" 
                border="1px solid" 
                borderColor="whiteAlpha.200"
              >
                <VStack align="start" spacing={6}>
                  <Badge bg="mlc.gold" color="teal.900">INDIVIDUAL</Badge>
                  <Heading size="xl" fontFamily="'Forum', serif">Individual Supervision</Heading>
                  <Text color="whiteAlpha.700" lineHeight="tall">One-on-one sessions tailored to your specific caseload, ethical dilemmas, and professional goals. Ideal for early-career therapists.</Text>
                  <List spacing={3} color="whiteAlpha.800" fontSize="sm">
                    <ListItem><Icon as={FiCheck} color="mlc.gold" mr={2} /> Tailored caseload review</ListItem>
                    <ListItem><Icon as={FiCheck} color="mlc.gold" mr={2} /> Boundary & ethics deep-dives</ListItem>
                    <ListItem><Icon as={FiCheck} color="mlc.gold" mr={2} /> Caseload stabilization</ListItem>
                  </List>
                  <Button as={NextLink} href="/therapists/supervisors/directory" variant="outline" colorScheme="whiteAlpha" borderRadius="full">Browse Individual Supervisors</Button>
                </VStack>
              </MotionBox>

              <MotionBox 
                bg="whiteAlpha.100" 
                p={10} 
                borderRadius="4xl" 
                border="1px solid" 
                borderColor="whiteAlpha.200"
              >
                <VStack align="start" spacing={6}>
                  <Badge bg="purple.400" color="white">GROUP COHORT</Badge>
                  <Heading size="xl" fontFamily="'Forum', serif">Reflective Cohorts</Heading>
                  <Text color="whiteAlpha.700" lineHeight="tall">Small, closed cohorts of 4-6 therapists. We focus on thematic exploration, case synthesis, and integration takeaways.</Text>
                  <List spacing={3} color="whiteAlpha.800" fontSize="sm">
                    <ListItem><Icon as={FiCheck} color="purple.300" mr={2} /> Closed group for trust-building</ListItem>
                    <ListItem><Icon as={FiCheck} color="purple.300" mr={2} /> Casework thematic synthesis</ListItem>
                    <ListItem><Icon as={FiCheck} color="purple.300" mr={2} /> 4-Session commitment required</ListItem>
                  </List>
                  <Button as={NextLink} href="/contactus" bg="purple.400" color="white" borderRadius="full" _hover={{ bg: "purple.500" }}>Inquire for Group Cohort</Button>
                </VStack>
              </MotionBox>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🧭 ACTIVE SUPERVISORS */}
      <Box py={32}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Verified Supervisors.</Heading>
              <Text color="gray.500">Every supervisor at MLC undergoes a rigorous auditing process to ensure clinical seniority.</Text>
            </VStack>
            <ActiveSupervisors />
            <Button as={NextLink} href="/therapists/supervisors/directory" variant="link" color="teal.800" fontWeight="800" rightIcon={<FiArrowRight />}>
              View Full Supervisor Directory
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box bg="gray.50" py={32}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Supervision FAQ</Heading>
              <Text color="gray.500">Essential information for clinicians.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "Who can apply for supervision?", a: "Qualified counselling psychologists, clinical psychologists, and advanced trainees seeking clinical and ethical depth." },
                { q: "Is this available across India?", a: "Yes. All supervision is conducted online through secure, encrypted platforms and is accessible to therapists across Mumbai, Delhi, Bangalore, and beyond." },
                { q: "How are cohorts formed?", a: "Cohorts are curated based on professional stage and reflective readiness to ensure safety and clinical alignment within the group." },
                { q: "What is the commitment for a group cohort?", a: "Group cohorts require a minimum 4-session commitment. This ensures enough time for professional trust and deep reflective work to emerge." },
              ].map((item, i) => (
                <AccordionItem key={i} border="none" mb={4} bg="white" borderRadius="2xl" overflow="hidden" shadow="sm">
                  <AccordionButton py={6} _hover={{ bg: "teal.50" }}>
                    <Box flex="1" textAlign="left" fontWeight="700" color="teal.900">
                      {item.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* 🚀 CTA SECTION */}
      <Box bg="teal.800" py={24}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={4}>
              <Heading size="2xl" color="white" fontFamily="'Forum', serif">Refine your lens.</Heading>
              <Text color="whiteAlpha.800" fontSize="lg">Join the next generation of ethically grounded clinicians.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/signup/therapist" 
              size="xl" 
              bg="white" 
              color="teal.900" 
              h="64px" 
              px={12} 
              borderRadius="full" 
              fontWeight="800"
              _hover={{ transform: "scale(1.05)", bg: "teal.50" }}
              transition="all 0.3s"
            >
              Join the Collective
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
