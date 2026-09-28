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
      <Box position="relative" h={{ base: "auto", lg: "80vh" }} bg="white">
        <Flex direction={{ base: "column", lg: "row" }} h="full">
          <MotionVStack 
            flex="1" 
            justify="center" 
            align="start" 
            p={{ base: 6, md: 10, lg: 16 }} 
            spacing={6}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              bg="purple.50" 
              color="purple.800" 
              px={3.5} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              COMMUNITY & LEARNING
            </Badge>
            <Heading 
              fontSize={{ base: "32px", md: "44px", lg: "50px" }} 
              fontFamily="'Playfair Display', var(--font-playfair), serif" 
              color="#263A33" 
              lineHeight="1.15"
              fontWeight="600"
            >
              Workshops <br /> & Circles
            </Heading>
            <Text 
              fontSize={{ base: "15px", md: "16px" }} 
              color="rgba(46,46,46,0.75)" 
              maxW="500px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="1.7"
            >
              Healing in community. Our workshops and therapeutic circles are designed for collective growth, offering safe spaces to learn, share, and connect with others on similar journeys.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} w="full">
              <Button 
                as={NextLink} 
                href="/contactus" 
                size="md" 
                bg="#56756D" 
                color="white" 
                h="46px" 
                px={7} 
                borderRadius="full" 
                fontSize="14px"
                fontWeight="600"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                transition="all 0.2s ease"
                rightIcon={<FiArrowRight />}
              >
                Inquire for Next Cohort
              </Button>
              <Button 
                as={NextLink} 
                href="/about" 
                size="md" 
                variant="outline" 
                borderColor="gray.200" 
                color="gray.700"
                h="46px" 
                px={7} 
                borderRadius="full"
                fontSize="14px"
                fontWeight="600"
                _hover={{ bg: "gray.50" }}
                transition="all 0.2s ease"
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
                src="/workshops_hero.png" 
                alt="A group of people sitting in a supportive community circle in a beautifully lit, modern workshop space, representing collective healing" 
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
      <Container maxW="6xl" py={{ base: 12, md: 16 }}>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <GridItem colSpan={{ base: 1, lg: 7 }}>
            <VStack align="start" spacing={6}>
              <Heading size="xl" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33">
                Shared Space. <br /> Collective Wisdom.
              </Heading>
              <Text fontSize="md" color="rgba(46,46,46,0.75)" lineHeight="tall">
                Therapeutic circles provide a unique opportunity to realize you are not alone. Through facilitated group work, we explore shared themes of vulnerability, resilience, and connection.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <Box p={5} borderRadius="2xl" bg="rgba(169,203,183,0.1)" border="1px solid" borderColor="rgba(169,203,183,0.15)">
                  <Icon as={FiUsers} boxSize={5} color="#56756D" mb={3} />
                  <Text fontWeight="700" fontSize="sm" color="#263A33" mb={1.5}>Safe Containment</Text>
                  <Text fontSize="xs" color="rgba(46,46,46,0.75)" lineHeight="1.6">Guided by expert facilitators who ensure every voice is heard and respected.</Text>
                </Box>
                <Box p={5} borderRadius="2xl" bg="#FBF8F3" border="1px solid" borderColor="mlc.gold">
                  <Icon as={FiTarget} boxSize={5} color="#C9A960" mb={3} />
                  <Text fontWeight="700" fontSize="sm" color="#263A33" mb={1.5}>Structured Learning</Text>
                  <Text fontSize="xs" color="rgba(46,46,46,0.75)" lineHeight="1.6">Workshops focused on specific skills, from emotional regulation to relational tools.</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </GridItem>
          
          <GridItem colSpan={{ base: 1, lg: 5 }}>
            <Box position="relative">
              <Image 
                src="/service3_new.jpg" 
                borderRadius="2xl" 
                shadow="xl" 
                alt="Diverse group of individuals engaged in a collaborative community learning workshop" 
                w="100%"
                h={{ base: "280px", md: "340px" }}
                objectFit="cover" 
              />
              <Box 
                position="absolute" 
                bottom="12px" 
                left={{ base: "12px", md: "-12px" }} 
                bg="white" 
                p={5} 
                borderRadius="2xl" 
                shadow="xl" 
                maxW="280px"
              >
                <VStack align="start" spacing={2.5}>
                  <Text fontWeight="700" color="#263A33" fontSize="13.5px" lineHeight="1.6">"Coming together is the beginning of healing."</Text>
                  <Divider />
                  <Text fontSize="11.5px" color="rgba(46,46,46,0.6)">MLC Collective Standards</Text>
                </VStack>
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* 🧭 TYPES OF OFFERINGS */}
      <Box bg="#263A33" py={{ base: 12, md: 16 }} color="white">
        <Container maxW="6xl">
          <VStack spacing={10}>
            <VStack spacing={2.5} textAlign="center">
              <Badge colorScheme="whiteAlpha" px={3.5} py={1} borderRadius="full" fontSize="xs">EXPLORE OFFERINGS</Badge>
              <Heading size="xl" fontFamily="'Playfair Display', var(--font-playfair), serif">Ways to Engage</Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <Box borderLeft="4px solid" borderColor="mlc.gold" pl={6} py={3}>
                <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" mb={3}>Therapeutic Circles</Heading>
                <Text color="whiteAlpha.700" mb={4} fontSize="sm" lineHeight="tall">Closed groups that meet weekly for 6-8 sessions, focusing on deep emotional work in a supportive peer environment.</Text>
                <HStack color="mlc.gold" fontSize="xs" fontWeight="800" spacing={3}>
                  <Text>ANXIETY SUPPORT</Text>
                  <Text>•</Text>
                  <Text>RELATIONAL WELLNESS</Text>
                  <Text>•</Text>
                  <Text>GRIEF CIRCLES</Text>
                </HStack>
              </Box>
              
              <Box borderLeft="4px solid" borderColor="mlc.gold" pl={6} py={3}>
                <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" mb={3}>Skill-Building Workshops</Heading>
                <Text color="whiteAlpha.700" mb={4} fontSize="sm" lineHeight="tall">One-off or short-term intensives focused on practical tools for emotional literacy, stress management, and more.</Text>
                <HStack color="mlc.gold" fontSize="xs" fontWeight="800" spacing={3}>
                  <Text>MINDFULNESS</Text>
                  <Text>•</Text>
                  <Text>BOUNDARIES</Text>
                  <Text>•</Text>
                  <Text>EMOTIONAL TOOLS</Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box py={{ base: 10, md: 14 }} bg="linear-gradient(180deg, #F4F1EC 0%, #FDFBFA 100%)" position="relative">
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
                color="#263A33"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "22px", md: "28px" }}
                fontWeight="600"
              >
                Circle FAQ
              </Heading>
              <Text
                color="rgba(46,46,46,0.65)"
                fontSize="13.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Everything you need to know about group participation
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "What is a 'Closed Circle'?", a: "A closed circle means the group members remain the same for the entire duration of the program. This helps build safety, trust, and deeper connection among participants." },
                { q: "Do I have to share my story?", a: "Sharing is always voluntary. We encourage participation, but we respect every individual's pace and readiness to open up in a group setting." },
                { q: "Who facilitates these sessions?", a: "All our circles and workshops are facilitated by senior clinicians or specialists at MLC who have expertise in group dynamics and the specific theme being explored." },
                { q: "How can I stay updated on next dates?", a: "You can inquire via our contact form or sign up for our community newsletter to be the first to know when new cohorts are opening." },
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
          </VStack>
        </Container>
      </Box>

      {/* 🚀 CTA SECTION */}
      <Box bg="#56756D" py={{ base: 10, md: 12 }}>
        <Container maxW="6xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={8}>
            <VStack align="start" spacing={1.5}>
              <Heading fontSize={{ base: "24px", md: "32px" }} color="white" fontFamily="'Playfair Display', var(--font-playfair), serif" fontWeight="600">Join the Circle</Heading>
              <Text color="whiteAlpha.800" fontSize="15px">Connect with a community of growth and collective healing.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/contactus" 
              size="md" 
              bg="white" 
              color="#263A33" 
              h="46px" 
              px={8} 
              borderRadius="full" 
              fontWeight="700" 
              fontSize="14px"
              _hover={{ transform: "translateY(-1px)", bg: "rgba(169,203,183,0.1)" }} 
              transition="all 0.2s" 
            >
              Inquire for Dates
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
