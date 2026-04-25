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

export default function RelationalTherapyPage() {
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
              bg="orange.50" 
              color="orange.800" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              RELATIONAL SERVICES
            </Badge>
            <Heading 
              fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
              fontFamily="'Forum', serif" 
              color="teal.900" 
              lineHeight="1.1"
            >
              Relational <br /> Therapy
            </Heading>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="gray.600" 
              maxW="500px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="tall"
            >
              Navigating the complexities of connection. We provide a neutral, safe, and structured environment for couples and partners to explore dynamics, rebuild trust, and deepen intimacy.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full">
              <Button 
                as={NextLink} 
                href="/therapists/discovery" 
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
                Find a Relational Specialist
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
                Inquire for Partners
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
                src="/relational_therapy_hero_1777124311020.png" 
                alt="Partners in deep conversation" 
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

      {/* 🤝 CORE PHILOSOPHY */}
      <Container maxW="7xl" py={{ base: 20, md: 32 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={20} alignItems="center">
          <Box position="relative">
            <Image 
              src="https://images.unsplash.com/photo-1516534775068-ba3e84589b9c?auto=format&fit=crop&q=80&w=800" 
              borderRadius="3xl" 
              shadow="2xl" 
              alt="Emotional connection"
            />
            <Box 
              position="absolute" 
              top="-20px" 
              left="-20px" 
              bg="teal.800" 
              color="white" 
              p={8} 
              borderRadius="2xl" 
              shadow="xl" 
              maxW="250px"
              display={{ base: "none", md: "block" }}
            >
              <VStack align="start" spacing={2}>
                <Text fontSize="4xl" fontWeight="900" color="mlc.gold">92%</Text>
                <Text fontSize="sm" fontWeight="600">Of partners report improved communication after the first phase of therapy.</Text>
              </VStack>
            </Box>
          </Box>

          <VStack align="start" spacing={8}>
            <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">
              Beyond Conflict. <br /> Towards Connection.
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Relational therapy at MLC focuses on the "space between" two people. We don't just look at individual issues; we look at the system you've built together.
            </Text>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Our approach is neutral, non-judgmental, and evidence-informed. We help you move past repetitive arguments and reach the underlying emotional needs that drive them.
            </Text>
            
            <VStack align="stretch" spacing={4} w="full">
              {[
                { title: "De-escalating Conflict", icon: FiShield },
                { title: "Rebuilding Trust & Intimacy", icon: FiLink },
                { title: "Navigating Life Transitions", icon: FiTrendingUp },
                { title: "Parenting & Co-regulation", icon: FiUsers },
              ].map((item, i) => (
                <HStack key={i} spacing={4} p={4} bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.50">
                  <Icon as={item.icon} color="teal.500" boxSize={5} />
                  <Text fontWeight="700" color="teal.900" fontSize="sm">{item.title}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* 💠 THE RELATIONAL FRAMEWORK */}
      <Box bg="teal.900" py={32} color="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="whiteAlpha" px={4} py={1} borderRadius="full" fontSize="xs">OUR METHODOLOGY</Badge>
              <Heading size="3xl" fontFamily="'Forum', serif">The Relational Framework.</Heading>
              <Text maxW="600px" textAlign="center" fontSize="lg" color="whiteAlpha.800">
                We utilize world-class frameworks to help you understand your relational dance.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
              {[
                { 
                  title: "Attachment Styles", 
                  desc: "Understanding how your early experiences shape your current expectations of safety and closeness.",
                  icon: FiAnchor
                },
                { 
                  title: "Communication Cycles", 
                  desc: "Identifying the 'pursue-withdraw' or 'attack-defend' cycles that keep you stuck in the same arguments.",
                  icon: FiMessageSquare
                },
                { 
                  title: "The Emotional Core", 
                  desc: "Moving past the surface-level complaints to the soft, vulnerable emotions that actually drive connection.",
                  icon: FiHeart
                },
              ].map((item, i) => (
                <VStack key={i} align="start" spacing={6} p={10} bg="whiteAlpha.100" borderRadius="4xl" border="1px solid" borderColor="whiteAlpha.200">
                  <Circle bg="mlc.gold" size="50px">
                    <Icon as={item.icon} color="teal.900" boxSize={6} />
                  </Circle>
                  <Heading size="lg" fontFamily="'Forum', serif">{item.title}</Heading>
                  <Text color="whiteAlpha.700" lineHeight="tall">{item.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box bg="gray.50" py={32}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Partner FAQ</Heading>
              <Text color="gray.500">Frequently asked questions about relational sessions.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "Do both partners need to be present?", a: "Yes, for relational therapy, it is standard for both/all partners to be present. The 'client' is the relationship itself." },
                { q: "What if my partner is hesitant?", a: "It's common for one partner to feel more ready than the other. We recommend a brief inquiry call where we can address concerns about 'taking sides' or judgment." },
                { q: "How many sessions will we need?", a: "This varies significantly. Most couples start with 8-12 sessions to stabilize communication before moving into deeper relational work." },
                { q: "Is this only for married couples?", a: "Not at all. We support partners in all stages—dating, cohabitating, pre-marital, polyamorous, or those navigating conscious uncoupling." },
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
      <Box bg="mlc.gold" py={24}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={4}>
              <Heading size="2xl" color="teal.900" fontFamily="'Forum', serif">Reconnect Today.</Heading>
              <Text color="teal.800" fontSize="lg" fontWeight="500">Invest in the relationship that matters most.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/therapists/discovery" 
              size="xl" 
              bg="teal.900" 
              color="white" 
              h="64px" 
              px={12} 
              borderRadius="full" 
              fontWeight="800"
              _hover={{ transform: "scale(1.05)", shadow: "xl" }}
              transition="all 0.3s"
            >
              Match with a Specialist
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
