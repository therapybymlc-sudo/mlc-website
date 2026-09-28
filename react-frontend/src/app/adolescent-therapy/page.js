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
  Divider
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiSmile, FiCheck, FiArrowRight, FiEdit3, FiZap, 
  FiSun, FiCoffee, FiShield, FiHeart, FiUsers
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function AdolescentTherapyPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FAF9F6" overflow="hidden">
      {/* 🌿 HERO SECTION */}
      <Box pt={{ base: 6, md: 8 }} pb={{ base: 10, md: 14 }} bg="white" borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            <MotionVStack 
              align="start" 
              spacing={6}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge 
                bg="blue.50" 
                color="blue.800" 
                border="1px solid"
                borderColor="blue.200"
                px={3.5} 
                py={1} 
                borderRadius="full" 
                fontSize="11px" 
                fontWeight="800" 
                letterSpacing="0.1em"
              >
                YOUTH SERVICES
              </Badge>
              
              <Heading 
                as="h1"
                fontSize={{ base: "32px", md: "42px", lg: "50px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                lineHeight="1.18"
                fontWeight="600"
              >
                Adolescent Therapy
              </Heading>

              <Text 
                fontSize={{ base: "15px", md: "16px" }} 
                color="rgba(46,46,46,0.75)" 
                maxW="480px" 
                lineHeight="1.7"
              >
                A space for self-expression, identity, and discovery. We provide creative, safe, and developmentally-informed therapy for teenagers and young adults navigating modern complexities.
              </Text>

              <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} w="full" pt={2}>
                <Button 
                  as={NextLink} 
                  href="/therapists/discovery" 
                  h="46px" 
                  px={7} 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  fontSize="14px"
                  fontWeight="600"
                  boxShadow="0 4px 14px rgba(44, 122, 123, 0.25)"
                  _hover={{ bg: "#263A33", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(44, 122, 123, 0.35)" }}
                  transition="all 0.2s ease"
                  rightIcon={<FiArrowRight />}
                >
                  Find an Adolescent Specialist
                </Button>
                <Button 
                  as={NextLink} 
                  href="/contactus" 
                  h="46px" 
                  px={6} 
                  variant="outline" 
                  borderColor="gray.200" 
                  color="gray.700"
                  borderRadius="full"
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                  transition="all 0.2s ease"
                >
                  Talk to Care Coordinator
                </Button>
              </Stack>

              <HStack spacing={6} pt={3} color="rgba(46,46,46,0.6)" fontSize="12px">
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">Developmentally Attuned</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">Safe & Confidential</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">Virtual & In-Person</Text>
                </HStack>
              </HStack>
            </MotionVStack>
            
            <Box position="relative">
              <Box
                borderRadius="28px"
                overflow="hidden"
                boxShadow="0 20px 45px -12px rgba(38, 58, 51, 0.16)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.16)"
                bg="white"
              >
                <Image 
                  src="/adolescent_therapy_hero.png" 
                  alt="A welcoming and creative therapy room for teenagers, featuring art supplies and comfortable seating" 
                  objectFit="cover" 
                  w="100%"
                  h={{ base: "320px", md: "420px" }}
                />
              </Box>

              <Box 
                position="absolute" 
                bottom="12px" 
                right={{ base: "12px", md: "20px" }} 
                bg="rgba(255, 255, 255, 0.96)" 
                backdropFilter="blur(8px)"
                px={5} 
                py={3.5} 
                borderRadius="2xl" 
                boxShadow="0 15px 35px -5px rgba(0, 0, 0, 0.12)" 
                border="1px solid"
                borderColor="gray.100"
                maxW="260px"
              >
                <HStack spacing={3} align="center">
                  <Circle bg="blue.50" size="36px" flexShrink={0}>
                    <Icon as={FiSmile} color="blue.600" boxSize={4} />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="13px" color="#263A33">Youth Sanctuary</Text>
                    <Text fontSize="11px" color="rgba(46,46,46,0.6)" lineHeight="1.4">Non-judgmental creative space</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🎨 CREATIVE EXPRESSION */}
      <Box pt={{ base: 14, md: 20 }} pb={{ base: 16, md: 24 }} bg="#FAF9F6">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            <Box position="relative">
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 18px 40px -10px rgba(0, 0, 0, 0.12)"
                border="1px solid"
                borderColor="gray.100"
                bg="white"
              >
                <Image 
                  src="/adolescent_creative.jpg" 
                  borderRadius="2xl" 
                  alt="An adolescent engaging in creative self-expression during a therapy session" 
                  w="100%"
                  h={{ base: "320px", md: "420px", lg: "440px" }}
                  objectFit="cover"
                />
              </Box>

              <Box 
                position="absolute" 
                bottom="12px" 
                right={{ base: "12px", md: "20px" }} 
                bg="white" 
                p={3.5} 
                borderRadius="18px" 
                boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)" 
                border="1px solid"
                borderColor="gray.100"
                maxW="220px"
                display={{ base: "none", md: "block" }}
              >
                <HStack spacing={2.5}>
                  <Circle bg="rgba(169,203,183,0.1)" size="34px">
                    <Icon as={FiZap} color="#56756D" boxSize={4} />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="12px" color="#263A33">Creative Modalities</Text>
                    <Text fontSize="11px" color="rgba(46,46,46,0.6)">Art, narrative & talk</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>

            <VStack align="start" spacing={5}>
              <Badge bg="blue.50" color="blue.800" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                OUR APPROACH
              </Badge>

              <Heading 
                as="h2"
                fontSize={{ base: "26px", md: "34px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                lineHeight="1.25"
                fontWeight="600"
              >
                Where Words <br />Aren't Always Needed
              </Heading>

              <Text fontSize="15px" color="rgba(46,46,46,0.75)" lineHeight="1.75">
                Adolescent therapy recognizes that traditional talk therapy can sometimes feel daunting. We integrate art, narrative reflection, and creative expression to help teens articulate their internal experiences with ease.
              </Text>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 4, sm: 5 }} w="full" mt={3}>
                {[
                  { title: "Academic Stress", icon: FiZap, desc: "Managing exam pressure, high expectations, and burnout" },
                  { title: "Identity Discovery", icon: FiSun, desc: "Building self-esteem and navigating values and belonging" },
                  { title: "Social Anxiety", icon: FiUsers, desc: "Navigating friendships, peer dynamics, and isolation" },
                  { title: "Emotional Literacy", icon: FiEdit3, desc: "Learning to name, regulate, and express complex feelings" },
                ].map((item, i) => (
                  <Box key={i} p={{ base: 4.5, md: 5 }} bg="white" borderRadius="18px" border="1px solid" borderColor="gray.100" shadow="xs" _hover={{ borderColor: "rgba(86,117,109,0.15)", shadow: "sm" }} transition="all 0.2s ease">
                    <HStack spacing={2.5} mb={2}>
                      <Icon as={item.icon} color="#56756D" boxSize={4} />
                      <Text fontWeight="700" color="#263A33" fontSize="14px">{item.title}</Text>
                    </HStack>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.6)" lineHeight="1.55">{item.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🛡️ SAFE HARBOR */}
      <Box bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)" py={{ base: 12, md: 16 }} color="white">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            <VStack align="start" spacing={5}>
              <Badge bg="rgba(201, 169, 96, 0.15)" color="#E6CA65" border="1px solid rgba(201, 169, 96, 0.3)" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                THE MLC PROMISE
              </Badge>
              <Heading 
                as="h2"
                fontSize={{ base: "24px", md: "32px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
              >
                A Safe Harbor
              </Heading>
              
              <VStack align="stretch" spacing={5} w="full">
                {[
                  {
                    icon: FiShield,
                    title: "Clear Confidentiality",
                    desc: "We maintain a transparent framework of privacy that respects the teen's autonomy while keeping crucial safety boundaries in place."
                  },
                  {
                    icon: FiHeart,
                    title: "Relational Alliance",
                    desc: "The therapeutic bond is built on authentic listening and non-judgmental validation of the adolescent's lived world."
                  },
                  {
                    icon: FiCoffee,
                    title: "Systemic Family Guidance",
                    desc: "We provide dedicated check-ins for parents to build a supportive home environment without breaching the teen's trust."
                  }
                ].map((item, i) => (
                  <Box key={i} p={6} borderRadius="2xl" bg="rgba(255, 255, 255, 0.05)" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                    <HStack spacing={3} mb={2.5}>
                      <Icon as={item.icon} color="#E6CA65" boxSize={4} />
                      <Heading size="xs" color="white" fontWeight="700" letterSpacing="0.04em">{item.title}</Heading>
                    </HStack>
                    <Text fontSize="14px" color="whiteAlpha.800" lineHeight="1.7">{item.desc}</Text>
                  </Box>
                ))}
              </VStack>
            </VStack>
            
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 20px 45px -10px rgba(0, 0, 0, 0.35)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              <Image 
                src="/adolescent_support.jpg" 
                borderRadius="2xl" 
                alt="A supportive scene representing the therapeutic bond and safety provided to adolescents"
                w="100%"
                h={{ base: "320px", md: "420px" }}
                objectFit="cover"
              />
            </Box>
          </SimpleGrid>
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
                fontSize={{ base: "22px", md: "28px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                fontWeight="600"
              >
                Parent & Teen FAQ
              </Heading>
              <Text color="rgba(46,46,46,0.65)" fontSize="13.5px" fontFamily="'Inter', var(--font-inter), sans-serif">
                Frequently asked questions about adolescent sessions
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "What age group do you work with?", a: "We work with adolescents from ages 13 through young adulthood. For younger children, our care team can connect you with specialized pediatric practitioners." },
                { q: "Will parents know what happens in sessions?", a: "Confidentiality is essential for teen therapeutic progress. We provide parents with thematic progress summaries while keeping specific session conversations private, except in rare safety concerns." },
                { q: "How involved are parents in the care plan?", a: "We encourage a collaborative, systemic approach. While the teen has their dedicated one-on-one space, we often schedule separate parent consultation sessions." },
                { q: "Do you offer virtual sessions for teens?", a: "Yes. Many adolescents appreciate the comfort of engaging in sessions from their private room through our secure, HIPAA-compliant portal." },
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
                    <Box flex="1" textAlign="left" fontWeight="600" fontSize="15px" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                      {item.q}
                    </Box>
                    <AccordionIcon color="#56756D" />
                  </AccordionButton>
                  <AccordionPanel pt={1} pb={4} px={5} color="rgba(46,46,46,0.7)" fontSize="13.5px" lineHeight="1.65" fontFamily="'Inter', var(--font-inter), sans-serif">
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* 🚀 CTA SECTION */}
      <Box bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)" py={{ base: 10, md: 12 }} color="white">
        <Container maxW="6xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={8}>
            <VStack align="start" spacing={1.5}>
              <Heading 
                fontSize={{ base: "22px", md: "28px" }} 
                color="white" 
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
              >
                Support the Next Chapter
              </Heading>
              <Text color="whiteAlpha.750" fontSize="14px">Give your teen the dedicated space they need to thrive.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/therapists/discovery" 
              h="46px" 
              px={8} 
              bg="#C9A960" 
              color="#263A33" 
              borderRadius="full" 
              fontSize="14px"
              fontWeight="700"
              _hover={{ bg: "#E6CA65", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(201, 169, 96, 0.3)" }}
              transition="all 0.2s ease"
            >
              Browse Youth Specialists
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
