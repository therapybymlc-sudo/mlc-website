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
  useColorModeValue
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHeart, FiCheck, FiArrowRight, FiTarget, FiShield, 
  FiMessageCircle, FiNavigation, FiCalendar, FiExternalLink, FiSearch
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function IndividualTherapyPage() {
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
              bg="teal.50" 
              color="teal.800" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              CLINICAL SERVICES
            </Badge>
            <Heading 
              fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
              fontFamily="'Forum', serif" 
              color="teal.900" 
              lineHeight="1.1"
            >
              Individual <br /> Therapy
            </Heading>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="gray.600" 
              maxW="500px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="tall"
            >
              A dedicated space that is entirely yours. We provide structured, ethical, and clinically-informed therapy for individuals seeking clarity, healing, and sustainable growth.
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
                Match with a Therapist
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
                Inquire Now
              </Button>
            </Stack>
            <HStack spacing={6} pt={4}>
              <HStack>
                <Icon as={FiCheck} color="teal.500" />
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px">ETHICAL CARE</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheck} color="teal.500" />
                <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="1px">VIRTUAL & HYBRID</Text>
              </HStack>
            </HStack>
          </MotionVStack>
          
          <Box flex="1.2" position="relative" overflow="hidden">
            <MotionBox
              h="full"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <Image 
                src="/individual_therapy_hero_1777124244418.png" 
                alt="Serene therapy room" 
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

      {/* 🏺 THE JOURNEY SECTION */}
      <Container maxW="7xl" py={{ base: 20, md: 32 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={20} alignItems="center">
          <VStack align="start" spacing={8}>
            <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">
              A Space to Feel, <br /> To Heal, To Become.
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              At MLC Health & Wellness Centre, we believe therapy is not just about managing a crisis—it is about emotional clarity and understanding the relational patterns that shape your life.
            </Text>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Whether you are navigating anxiety, burnout, or life transitions, our clinicians offer an evidence-informed space rooted in safety and compassion. We provide care across India through secure, confidential virtual sessions.
            </Text>
            
            <SimpleGrid columns={2} spacing={8} w="full" pt={6}>
              <Box>
                <Text fontWeight="800" fontSize="sm" color="teal.800" letterSpacing="2px" mb={2}>01. DISCOVERY</Text>
                <Text fontSize="sm" color="gray.500">Matching you with the right clinician based on your unique needs.</Text>
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="sm" color="teal.800" letterSpacing="2px" mb={2}>02. ENGAGEMENT</Text>
                <Text fontSize="sm" color="gray.500">Building a secure relational alliance for deep therapeutic work.</Text>
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="sm" color="teal.800" letterSpacing="2px" mb={2}>03. CLARITY</Text>
                <Text fontSize="sm" color="gray.500">Unpacking patterns and cycles with precision and structure.</Text>
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="sm" color="teal.800" letterSpacing="2px" mb={2}>04. GROWTH</Text>
                <Text fontSize="sm" color="gray.500">Developing sustainable strategies for long-term emotional well-being.</Text>
              </Box>
            </SimpleGrid>
          </VStack>

          <Box position="relative">
            <Image 
              src="https://images.unsplash.com/photo-1544126592-807daa2b565b?auto=format&fit=crop&q=80&w=800" 
              borderRadius="3xl" 
              shadow="2xl" 
              alt="Therapeutic conversation"
            />
            <Box 
              position="absolute" 
              bottom="-40px" 
              right="-40px" 
              bg="white" 
              p={8} 
              borderRadius="2xl" 
              shadow="xl" 
              maxW="300px"
              display={{ base: "none", md: "block" }}
            >
              <VStack align="start" spacing={4}>
                <Circle bg="teal.50" size="48px">
                  <Icon as={FiHeart} color="teal.500" />
                </Circle>
                <Text fontWeight="700" color="teal.900">Relational Safety</Text>
                <Text fontSize="xs" color="gray.500">"Progress happens when you feel seen, supported, and respected at your own pace."</Text>
              </VStack>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* 🧭 AREAS OF FOCUS */}
      <Box bg="teal.900" py={32} color="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="whiteAlpha" px={4} py={1} borderRadius="full" fontSize="xs">WHY INDIVIDUAL THERAPY?</Badge>
              <Heading size="3xl" fontFamily="'Forum', serif">When to reach out.</Heading>
              <Text maxW="600px" textAlign="center" fontSize="lg" color="whiteAlpha.800">
                You do not need to be in a crisis to begin therapy. Sometimes clarity itself is the goal.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {[
                { title: "Anxiety & Overthinking", icon: FiTarget, desc: "Managing the persistent noise of worry and finding emotional regulation." },
                { title: "Burnout & Stress", icon: FiShield, desc: "Navigating workplace demands and reclaiming your personal boundaries." },
                { title: "Relationship Patterns", icon: FiMessageCircle, desc: "Understanding how you relate to others and breaking cycles of self-doubt." },
                { title: "Life Transitions", icon: FiNavigation, desc: "Navigating identity shifts, career changes, or major life milestones." },
                { title: "Grief & Loss", icon: FiHeart, desc: "Processing unresolved emotional experiences in a safe, contained space." },
                { title: "Self-Awareness", icon: FiSearch, desc: "Developing a deeper understanding of your own narrative and internal world." },
              ].map((item, i) => (
                <MotionBox 
                  key={i} 
                  bg="whiteAlpha.100" 
                  p={8} 
                  borderRadius="3xl" 
                  border="1px solid" 
                  borderColor="whiteAlpha.200"
                  whileHover={{ y: -5, bg: "whiteAlpha.200" }}
                  transition={{ duration: 0.3 }}
                >
                  <VStack align="start" spacing={4}>
                    <Icon as={item.icon} boxSize={6} color="mlc.gold" />
                    <Heading size="md" fontFamily="'Forum', serif">{item.title}</Heading>
                    <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall">{item.desc}</Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🏛️ OUR APPROACH */}
      <Container maxW="7xl" py={32}>
        <VStack spacing={20}>
          <HStack w="full" justify="space-between" align="end" wrap="wrap" gap={8}>
            <VStack align="start" spacing={4} maxW="600px">
              <Text fontWeight="800" color="teal.700" letterSpacing="3px" fontSize="xs">THE MLC STANDARD</Text>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Clinically Grounded Care.</Heading>
            </VStack>
            <Text color="gray.500" maxW="400px">Our approach integrates multiple therapeutic modalities to provide care that is both flexible and structured.</Text>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12}>
            <VStack align="start" spacing={6}>
              <Heading size="md" color="teal.800" borderBottom="2px solid" borderColor="teal.100" pb={2} w="full">Evidence-Informed</Heading>
              <Text color="gray.600">We integrate Cognitive Behavioral Therapy (CBT), Dialectical Behavioral Therapy (DBT), and Mindfulness-based interventions.</Text>
            </VStack>
            <VStack align="start" spacing={6}>
              <Heading size="md" color="teal.800" borderBottom="2px solid" borderColor="teal.100" pb={2} w="full">Relational & Somatic</Heading>
              <Text color="gray.600">Focusing on emotional depth, humanistic values, and how emotional experiences are held in the body.</Text>
            </VStack>
            <VStack align="start" spacing={6}>
              <Heading size="md" color="teal.800" borderBottom="2px solid" borderColor="teal.100" pb={2} w="full">Ethical & Structured</Heading>
              <Text color="gray.600">Sessions are confidential, ethically grounded, and guided by professional clinical frameworks.</Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* ❔ FAQ SECTION */}
      <Box bg="gray.50" py={32}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Common Questions</Heading>
              <Text color="gray.500">Everything you need to know before starting your journey.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "How long is each therapy session?", a: "Each individual session lasts approximately 50 minutes. This is your dedicated 'therapeutic hour' to unpack and process at your own pace." },
                { q: "Can I choose my therapist?", a: "Yes. While we recommend a clinician based on your initial screening, you have full autonomy. You can browse our directory or ask for a recommendation based on specific expertise." },
                { q: "Is therapy completely confidential?", a: "Absolutely. Ethical confidentiality is a cornerstone of our practice. Information is only shared in exceptional circumstances related to safety, which will be discussed in your first session." },
                { q: "Do you offer sessions across India?", a: "Yes. Our virtual ecosystem allows us to provide high-quality therapy to clients in Mumbai, Delhi, Bangalore, and all other regions through secure, HIPAA-compliant platforms." },
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

            <VStack spacing={6} pt={10}>
              <Text color="gray.500">Still have questions?</Text>
              <Button as={NextLink} href="/contactus" variant="link" color="teal.800" fontWeight="800" rightIcon={<FiArrowRight />}>
                Talk to our care team
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* 🚀 CTA SECTION */}
      <Box bg="teal.800" py={24}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={4}>
              <Heading size="2xl" color="white" fontFamily="'Forum', serif">Ready to begin your journey?</Heading>
              <Text color="whiteAlpha.800" fontSize="lg">Take the first step towards emotional clarity today.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/therapists/discovery" 
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
              Start Matching Now
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
