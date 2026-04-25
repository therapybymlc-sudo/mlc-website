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
  Grid,
  GridItem
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiUsers, FiCheck, FiArrowRight, FiBook, FiCoffee, 
  FiSun, FiTarget, FiZap, FiMessageCircle
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function WorkshopsPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden">
      {/* 🌿 HERO SECTION */}
      <Box position="relative" h={{ base: "auto", lg: "90vh" }} bg="white">
        <Flex direction={{ base: "column", lg: "row" }} h="full">
          <MotionVStack 
            flex="1" 
            justify="center" 
            align="start" 
            p={{ base: 8, md: 16, lg: 24 }} 
            spacing={8}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              bg="purple.50" 
              color="purple.800" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              COMMUNITY & LEARNING
            </Badge>
            <Heading 
              fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
              fontFamily="'Forum', serif" 
              color="teal.900" 
              lineHeight="1.1"
            >
              Workshops <br /> & Circles
            </Heading>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="gray.600" 
              maxW="500px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="tall"
            >
              Healing in community. Our workshops and therapeutic circles are designed for collective growth, offering safe spaces to learn, share, and connect with others on similar journeys.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full">
              <Button 
                as={NextLink} 
                href="/contactus" 
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
                Inquire for Next Cohort
              </Button>
              <Button 
                as={NextLink} 
                href="/about" 
                size="xl" 
                variant="outline" 
                borderColor="teal.100" 
                h="64px" 
                px={10} 
                borderRadius="full"
                _hover={{ bg: "teal.50" }}
              >
                Our Standards
              </Button>
            </Stack>
          </MotionVStack>
          
          <Box flex="1.2" position="relative" overflow="hidden">
            <MotionBox
              h="full"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <Image 
                src="/workshops_hero_1777124460180.png" 
                alt="Community workshop circle" 
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

      {/* 🏺 COLLECTIVE HEALING */}
      <Container maxW="7xl" py={{ base: 20, md: 32 }}>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={16} alignItems="center">
          <GridItem colSpan={{ base: 1, lg: 7 }}>
            <VStack align="start" spacing={8}>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">
                Shared Space. <br /> Collective Wisdom.
              </Heading>
              <Text fontSize="lg" color="gray.600" lineHeight="tall">
                Therapeutic circles provide a unique opportunity to realize you are not alone. Through facilitated group work, we explore shared themes of vulnerability, resilience, and connection.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                <Box p={6} borderRadius="3xl" bg="teal.50" border="1px solid" borderColor="teal.100">
                  <Icon as={FiUsers} boxSize={6} color="teal.700" mb={4} />
                  <Text fontWeight="800" fontSize="sm" color="teal.800" mb={2}>Safe Containment</Text>
                  <Text fontSize="sm" color="gray.600">Guided by expert facilitators who ensure every voice is heard and respected.</Text>
                </Box>
                <Box p={6} borderRadius="3xl" bg="purple.50" border="1px solid" borderColor="purple.100">
                  <Icon as={FiTarget} boxSize={6} color="purple.700" mb={4} />
                  <Text fontWeight="800" fontSize="sm" color="purple.800" mb={2}>Structured Learning</Text>
                  <Text fontSize="sm" color="gray.600">Workshops focused on specific skills, from emotional regulation to relational tools.</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </GridItem>
          
          <GridItem colSpan={{ base: 1, lg: 5 }}>
            <Box position="relative">
              <Image 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                borderRadius="3xl" 
                shadow="2xl" 
                alt="Supportive community"
              />
              <Box 
                position="absolute" 
                bottom="-30px" 
                left="-30px" 
                bg="white" 
                p={8} 
                borderRadius="2xl" 
                shadow="xl" 
                maxW="250px"
              >
                <VStack align="start" spacing={2}>
                  <Text fontWeight="900" color="teal.900">"Coming together is the beginning of healing."</Text>
                  <Divider />
                  <Text fontSize="xs" color="gray.500">MLC Collective Standards</Text>
                </VStack>
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* 🧭 TYPES OF OFFERINGS */}
      <Box bg="teal.900" py={32} color="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="whiteAlpha" px={4} py={1} borderRadius="full" fontSize="xs">EXPLORE OFFERINGS</Badge>
              <Heading size="3xl" fontFamily="'Forum', serif">Ways to Engage.</Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} w="full">
              <Box borderLeft="4px solid" borderColor="mlc.gold" pl={8} py={4}>
                <Heading size="xl" fontFamily="'Forum', serif" mb={4}>Therapeutic Circles</Heading>
                <Text color="whiteAlpha.700" mb={6} lineHeight="tall">Closed groups that meet weekly for 6-8 sessions, focusing on deep emotional work in a supportive peer environment.</Text>
                <HStack color="mlc.gold" fontSize="sm" fontWeight="800" spacing={4}>
                  <Text>ANXIETY SUPPORT</Text>
                  <Text>RELATIONAL WELLNESS</Text>
                  <Text>GRIEF CIRCLES</Text>
                </HStack>
              </Box>
              
              <Box borderLeft="4px solid" borderColor="mlc.gold" pl={8} py={4}>
                <Heading size="xl" fontFamily="'Forum', serif" mb={4}>Skill-Building Workshops</Heading>
                <Text color="whiteAlpha.700" mb={6} lineHeight="tall">One-off or short-term intensives focused on practical tools for emotional literacy, stress management, and more.</Text>
                <HStack color="mlc.gold" fontSize="sm" fontWeight="800" spacing={4}>
                  <Text>MINDFULNESS</Text>
                  <Text>BOUNDARIES</Text>
                  <Text>EMOTIONAL TOOLS</Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box bg="gray.50" py={32}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Circle FAQ</Heading>
              <Text color="gray.500">Everything you need to know about group participation.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "What is a 'Closed Circle'?", a: "A closed circle means the group members remain the same for the entire duration of the program. This helps build safety, trust, and deeper connection among participants." },
                { q: "Do I have to share my story?", a: "Sharing is always voluntary. We encourage participation, but we respect every individual's pace and readiness to open up in a group setting." },
                { q: "Who facilitates these sessions?", a: "All our circles and workshops are facilitated by senior clinicians or specialists at MLC who have expertise in group dynamics and the specific theme being explored." },
                { q: "How can I stay updated on next dates?", a: "You can inquire via our contact form or sign up for our community newsletter to be the first to know when new cohorts are opening." },
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
      <Box bg="purple.800" py={24}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={4}>
              <Heading size="2xl" color="white" fontFamily="'Forum', serif">Join the Circle.</Heading>
              <Text color="whiteAlpha.800" fontSize="lg">Connect with a community of growth and collective healing.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/contactus" 
              size="xl" 
              bg="white" 
              color="purple.900" 
              h="64px" 
              px={12} 
              borderRadius="full" 
              fontWeight="800"
              _hover={{ transform: "scale(1.05)", bg: "purple.50" }}
              transition="all 0.3s"
            >
              Inquire for Dates
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
