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
  FiHeart, FiCheck, FiArrowRight, FiUsers, FiLink, 
  FiMessageSquare, FiAnchor, FiShield, FiTrendingUp
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function CouplesTherapyPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FAF9F6" overflow="hidden">
      {/* 🌿 HERO SECTION */}
      <Box pt={{ base: 6, md: 8 }} pb={{ base: 10, md: 14 }} bg="white" borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">
            <MotionVStack 
              align="start" 
              spacing={5}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge 
                bg="orange.50" 
                color="orange.800" 
                border="1px solid"
                borderColor="orange.200"
                px={3.5} 
                py={1} 
                borderRadius="full" 
                fontSize="11px" 
                fontWeight="800" 
                letterSpacing="0.1em"
              >
                RELATIONAL SERVICES
              </Badge>
              
              <Heading 
                as="h1"
                fontSize={{ base: "32px", md: "42px", lg: "50px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                lineHeight="1.18"
                fontWeight="600"
              >
                Couples Therapy
              </Heading>

              <Text 
                fontSize={{ base: "15px", md: "16px" }} 
                color="rgba(46,46,46,0.75)" 
                maxW="480px" 
                lineHeight="1.7"
              >
                Navigating the complexities of connection. We provide a neutral, safe, and structured environment for partners to explore dynamics, rebuild trust, and deepen emotional intimacy.
              </Text>

              <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} w="full" pt={1}>
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
                  Find a Specialist
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
                  Inquire for Partners
                </Button>
              </Stack>

              <HStack spacing={5} pt={2} color="rgba(46,46,46,0.6)" fontSize="12px">
                <HStack spacing={1.5}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.03em">Neutral Facilitation</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.03em">Virtual & In-Person</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.03em">All Relationship Stages</Text>
                </HStack>
              </HStack>
            </MotionVStack>
            
            <Box position="relative">
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 20px 45px -12px rgba(38, 58, 51, 0.16)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.16)"
                bg="white"
              >
                <Image 
                  src="/couples_therapy_hero.png" 
                  alt="Two partners sitting together on a modern sofa, engaged in a constructive and calm dialogue" 
                  objectFit="cover" 
                  w="100%"
                  h={{ base: "300px", md: "380px" }}
                />
              </Box>

              <Box 
                position="absolute" 
                bottom="12px" 
                right={{ base: "12px", md: "16px" }} 
                bg="rgba(255, 255, 255, 0.96)" 
                backdropFilter="blur(8px)"
                px={4} 
                py={2.5} 
                borderRadius="16px" 
                boxShadow="0 15px 35px -5px rgba(0, 0, 0, 0.12)" 
                border="1px solid"
                borderColor="gray.100"
                maxW="250px"
              >
                <HStack spacing={2.5} align="center">
                  <Circle bg="orange.50" size="32px" flexShrink={0}>
                    <Icon as={FiHeart} color="orange.600" boxSize={3.5} />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="12.5px" color="#263A33">Relational Harmony</Text>
                    <Text fontSize="11px" color="rgba(46,46,46,0.6)" lineHeight="1.3">Structured partner communication</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🤝 CORE PHILOSOPHY */}
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
                  src="/couples_therapy_connection.jpg" 
                  borderRadius="2xl" 
                  alt="Two partners gently holding hands in a therapy setting"
                  w="100%"
                  h={{ base: "320px", md: "420px", lg: "440px" }}
                  objectFit="cover"
                />
              </Box>

              <Box 
                position="absolute" 
                bottom="12px" 
                left={{ base: "12px", md: "16px" }} 
                bg="#263A33" 
                color="white" 
                p={4} 
                borderRadius="16px" 
                boxShadow="0 15px 35px rgba(0, 0, 0, 0.2)" 
                maxW="220px"
                display={{ base: "none", md: "block" }}
              >
                <VStack align="start" spacing={0.5}>
                  <Text fontSize="24px" fontWeight="800" color="#C9A960" lineHeight="1">92%</Text>
                  <Text fontSize="11.5px" color="whiteAlpha.800" lineHeight="1.35">
                    Report improved communication after the initial clinical phase
                  </Text>
                </VStack>
              </Box>
            </Box>

            <VStack align="start" spacing={5}>
              <Badge bg="orange.50" color="orange.800" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                CLINICAL FOCUS
              </Badge>

              <Heading 
                as="h2"
                fontSize={{ base: "26px", md: "32px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                lineHeight="1.25"
                fontWeight="600"
              >
                Beyond Conflict, <br />Towards Connection
              </Heading>

              <Text fontSize="14.5px" color="rgba(46,46,46,0.75)" lineHeight="1.7">
                Couples therapy at MLC focuses on the relational system you have built together. We move past surface-level arguments to address the underlying emotional needs that drive repetitive patterns.
              </Text>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 4, sm: 5 }} w="full" mt={3}>
                {[
                  { title: "De-escalating Conflict", icon: FiShield, desc: "Breaking cycles of blame and emotional defensiveness" },
                  { title: "Rebuilding Trust", icon: FiLink, desc: "Restoring intimacy after breaches or emotional withdrawal" },
                  { title: "Life Transitions", icon: FiTrendingUp, desc: "Navigating relocation, career shifts, and financial stress" },
                  { title: "Co-regulation", icon: FiUsers, desc: "Fostering mutual calm and shared parenting alignment" },
                ].map((item, i) => (
                  <Box key={i} p={{ base: 4.5, md: 5 }} bg="white" borderRadius="18px" border="1px solid" borderColor="gray.100" shadow="xs" _hover={{ borderColor: "rgba(86,117,109,0.15)", shadow: "sm" }} transition="all 0.2s ease">
                    <HStack spacing={2.5} mb={2}>
                      <Icon as={item.icon} color="#56756D" boxSize={4} />
                      <Text fontWeight="700" color="#263A33" fontSize="13.5px">{item.title}</Text>
                    </HStack>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.6)" lineHeight="1.55">{item.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 💠 THE RELATIONAL FRAMEWORK */}
      <Box bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)" py={{ base: 12, md: 16 }} color="white">
        <Container maxW="6xl">
          <VStack spacing={8}>
            <VStack spacing={2.5} textAlign="center" maxW="600px">
              <Badge bg="rgba(201, 169, 96, 0.15)" color="#E6CA65" border="1px solid rgba(201, 169, 96, 0.3)" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                OUR METHODOLOGY
              </Badge>
              <Heading 
                as="h2"
                fontSize={{ base: "24px", md: "30px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
              >
                The Relational Framework
              </Heading>
              <Text fontSize="14.5px" color="whiteAlpha.800" lineHeight="1.6">
                We draw upon established clinical frameworks to help you decode your relational patterns.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              {[
                { 
                  title: "Attachment Styles", 
                  desc: "Understanding how formative experiences shape expectations of intimacy, safety, and independence.",
                  icon: FiAnchor
                },
                { 
                  title: "Communication Cycles", 
                  desc: "Identifying the 'pursue-withdraw' or 'attack-defend' reflexes that keep arguments recurring.",
                  icon: FiMessageSquare
                },
                { 
                  title: "The Emotional Core", 
                  desc: "Moving beneath reactive anger to express the vulnerable needs that foster genuine repair.",
                  icon: FiHeart
                },
              ].map((item, i) => (
                <Box 
                  key={i} 
                  bg="rgba(255, 255, 255, 0.04)" 
                  p={6} 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor="rgba(255, 255, 255, 0.08)"
                  transition="all 0.25s ease"
                  _hover={{ bg: "rgba(255, 255, 255, 0.07)", borderColor: "rgba(201, 169, 96, 0.3)", transform: "translateY(-2px)" }}
                >
                  <VStack align="start" spacing={3}>
                    <Circle size="38px" bg="rgba(201, 169, 96, 0.12)" color="#E6CA65">
                      <Icon as={item.icon} boxSize={4} />
                    </Circle>
                    <Heading size="sm" color="white" fontWeight="700">{item.title}</Heading>
                    <Text fontSize="13px" color="whiteAlpha.700" lineHeight="1.6">{item.desc}</Text>
                  </VStack>
                </Box>
              ))}
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
                fontSize={{ base: "22px", md: "28px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                fontWeight="600"
              >
                Partner FAQ
              </Heading>
              <Text color="rgba(46,46,46,0.65)" fontSize="13.5px" fontFamily="'Inter', var(--font-inter), sans-serif">
                Frequently asked questions about couples therapy sessions
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "Do both partners need to be present?", a: "Yes. In couples therapy, the primary client is the relationship itself. Having both partners present ensures balanced facilitation without taking sides." },
                { q: "What if my partner is hesitant?", a: "It is common for one partner to feel more ready. We provide a brief inquiry consultation to discuss expectations and address concerns regarding judgment." },
                { q: "How many sessions are recommended?", a: "Most couples begin with 8 to 12 sessions to de-escalate acute tension and build reliable communication frameworks before continuing into long-term maintenance." },
                { q: "Is this only for married couples?", a: "No. We support partners across all relationship stages: dating, cohabitating, pre-marital, polyamorous, and those navigating conscious transitions." },
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
                Reconnect Today
              </Heading>
              <Text color="whiteAlpha.750" fontSize="14px">Invest in the relationship that matters most.</Text>
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
              Match with a Specialist
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
