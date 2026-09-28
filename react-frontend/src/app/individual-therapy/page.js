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
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiHeart, FiCheck, FiArrowRight, FiTarget, FiShield, 
  FiMessageCircle, FiNavigation, FiCalendar, FiSearch, FiCompass
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function IndividualTherapyPage() {
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
                bg="rgba(169,203,183,0.1)" 
                color="#56756D" 
                border="1px solid"
                borderColor="rgba(169,203,183,0.15)"
                px={3.5} 
                py={1} 
                borderRadius="full" 
                fontSize="11px" 
                fontWeight="800" 
                letterSpacing="0.1em"
              >
                CLINICAL CARE
              </Badge>
              
              <Heading 
                as="h1"
                fontSize={{ base: "32px", md: "42px", lg: "50px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                lineHeight="1.18"
                fontWeight="600"
              >
                Individual Therapy
              </Heading>

              <Text 
                fontSize={{ base: "15px", md: "16px" }} 
                color="rgba(46,46,46,0.75)" 
                maxW="480px" 
                lineHeight="1.7"
              >
                A dedicated space that is entirely yours. We provide structured, ethical, and clinically informed therapy for individuals seeking emotional clarity, healing, and sustainable growth.
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
                  Match with a Therapist
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
                  Inquire Now
                </Button>
              </Stack>

              <HStack spacing={6} pt={3} color="rgba(46,46,46,0.6)" fontSize="12px">
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">Ethical Care</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">Virtual & In-Person</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheck} color="#56756D" />
                  <Text fontWeight="600" letterSpacing="0.04em">HIPAA Aligned</Text>
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
                  src="/individual_therapy_hero.png" 
                  alt="A serene, sunlit therapy room with comfortable seating and greenery" 
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
                  <Circle bg="rgba(169,203,183,0.1)" size="36px" flexShrink={0}>
                    <Icon as={FiHeart} color="#56756D" boxSize={4} />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="13px" color="#263A33">Relational Safety</Text>
                    <Text fontSize="11px" color="rgba(46,46,46,0.6)" lineHeight="1.4">Progress at your own pace</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🏺 THE JOURNEY SECTION */}
      <Box pt={{ base: 14, md: 20 }} pb={{ base: 16, md: 24 }} bg="#FAF9F6">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            <VStack align="start" spacing={5}>
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                THE PROCESS
              </Badge>

              <Heading 
                as="h2"
                fontSize={{ base: "26px", md: "34px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                lineHeight="1.25"
                fontWeight="600"
              >
                A Space to Feel, <br />To Heal, To Become
              </Heading>

              <Text fontSize="15px" color="rgba(46,46,46,0.75)" lineHeight="1.75">
                At MLC, therapy is not just about crisis management—it is about emotional clarity and understanding the relational patterns that shape your life. Our clinicians offer an evidence-informed space rooted in safety and compassion across India.
              </Text>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 4, sm: 5 }} w="full" mt={3}>
                {[
                  { num: "01", title: "Discovery", desc: "Matching with the right clinician based on your specific profile" },
                  { num: "02", title: "Engagement", desc: "Building a secure relational alliance for deep therapeutic work" },
                  { num: "03", title: "Clarity", desc: "Unpacking patterns and emotional cycles with clinical structure" },
                  { num: "04", title: "Growth", desc: "Developing sustainable coping strategies for long-term well-being" },
                ].map((step) => (
                  <Box key={step.num} p={{ base: 4.5, md: 5 }} bg="white" borderRadius="18px" border="1px solid" borderColor="gray.100" shadow="xs" _hover={{ borderColor: "rgba(86,117,109,0.15)", shadow: "sm" }} transition="all 0.2s ease">
                    <Text fontWeight="800" fontSize="11px" color="#56756D" letterSpacing="0.08em" mb={1.5}>{step.num}. {step.title.toUpperCase()}</Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.6)" lineHeight="1.55">{step.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>

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
                  src="/human_connection_therapy_1776424085531.png" 
                  borderRadius="2xl" 
                  alt="Two people engaged in a supportive, empathetic therapeutic conversation in a modern office"
                  w="100%"
                  h={{ base: "320px", md: "460px" }}
                  objectFit="cover"
                />
              </Box>

              <Box 
                position="absolute" 
                bottom="12px" 
                right={{ base: "12px", md: "20px" }} 
                bg="white" 
                p={4} 
                borderRadius="18px" 
                boxShadow="0 15px 35px rgba(0, 0, 0, 0.1)" 
                border="1px solid"
                borderColor="gray.100"
                maxW="280px"
                display={{ base: "none", md: "block" }}
              >
                <HStack align="start" spacing={3}>
                  <Circle bg="rgba(169,203,183,0.1)" size="36px" mt={0.5} flexShrink={0}>
                    <Icon as={FiHeart} color="#56756D" boxSize={4} />
                  </Circle>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="700" fontSize="13px" color="#263A33">Relational Alliance</Text>
                    <Text fontSize="12px" color="rgba(46,46,46,0.6)" lineHeight="1.4">"Progress happens when you feel seen, supported, and respected at your own pace."</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🧭 AREAS OF FOCUS */}
      <Box bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)" py={{ base: 12, md: 16 }} color="white">
        <Container maxW="6xl">
          <VStack spacing={10}>
            <VStack spacing={2.5} textAlign="center" maxW="600px">
              <Badge bg="rgba(201, 169, 96, 0.15)" color="#E6CA65" border="1px solid rgba(201, 169, 96, 0.3)" px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700">
                CLINICAL SPECIALIZATIONS
              </Badge>
              <Heading 
                as="h2"
                fontSize={{ base: "24px", md: "32px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
              >
                When to reach out
              </Heading>
              <Text fontSize="15px" color="whiteAlpha.800" lineHeight="1.6">
                You do not need to be in crisis to begin therapy. Clarity and self-understanding are just as meaningful.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {[
                { title: "Anxiety & Overthinking", icon: FiTarget, desc: "Managing persistent worry and developing steady somatic and emotional regulation." },
                { title: "Burnout & Stress", icon: FiShield, desc: "Navigating high-demand environments and reclaiming healthy personal boundaries." },
                { title: "Relationship Patterns", icon: FiMessageCircle, desc: "Understanding how you relate to others and breaking cycles of self-doubt." },
                { title: "Life Transitions", icon: FiNavigation, desc: "Navigating identity shifts, career changes, or major life milestones with clarity." },
                { title: "Grief & Loss", icon: FiHeart, desc: "Processing emotional endings and loss in a safe, deeply contained space." },
                { title: "Self-Awareness", icon: FiSearch, desc: "Developing a grounded understanding of your narrative and internal values." },
              ].map((item, i) => (
                <Box 
                  key={i} 
                  bg="rgba(255, 255, 255, 0.04)" 
                  p={6} 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor="rgba(255, 255, 255, 0.08)"
                  transition="all 0.25s ease"
                  _hover={{ bg: "rgba(255, 255, 255, 0.07)", borderColor: "rgba(201, 169, 96, 0.3)", transform: "translateY(-3px)" }}
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

      {/* 🏛️ OUR APPROACH */}
      <Box py={{ base: 12, md: 16 }} bg="white" borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <VStack spacing={10}>
            <VStack spacing={2.5} textAlign="center" maxW="600px">
              <Text fontWeight="800" color="#56756D" letterSpacing="0.12em" fontSize="11px" textTransform="uppercase">
                THE MLC STANDARD
              </Text>
              <Heading 
                as="h2"
                fontSize={{ base: "24px", md: "32px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33"
                fontWeight="600"
              >
                Clinically Grounded Care
              </Heading>
              <Text color="rgba(46,46,46,0.6)" fontSize="15px">
                Our approach integrates evidence-based frameworks to provide therapy that is both adaptable and structured.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              {[
                { title: "Evidence-Informed", desc: "Integrates Cognitive Behavioral Therapy (CBT), Dialectical Behavioral Therapy (DBT), and mindfulness protocols." },
                { title: "Relational & Somatic", desc: "Focuses on emotional attunement, attachment styles, and how emotional distress is held in the body." },
                { title: "Ethical & Structured", desc: "Protected by clinical confidentiality, supervisory oversight, and verifiable ethical frameworks." },
              ].map((card, i) => (
                <Box key={i} p={6} borderRadius="2xl" bg="#FAF9F6" border="1px solid" borderColor="gray.100">
                  <Heading size="sm" color="#263A33" mb={2.5} fontWeight="700">{card.title}</Heading>
                  <Text color="rgba(46,46,46,0.75)" fontSize="13.5px" lineHeight="1.6">{card.desc}</Text>
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
                Common Questions
              </Heading>
              <Text color="rgba(46,46,46,0.65)" fontSize="13.5px" fontFamily="'Inter', var(--font-inter), sans-serif">
                Everything you need to know before starting your journey
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "How long is each therapy session?", a: "Each individual session lasts approximately 50 minutes. This is your dedicated clinical hour to process at your own pace." },
                { q: "Can I choose my therapist?", a: "Yes. While we recommend a clinician based on your initial screening, you have full autonomy to select from our collective or request a specific specialty." },
                { q: "Is therapy completely confidential?", a: "Ethical confidentiality is a foundational principle. Information is never disclosed except in rare circumstances concerning safety, as outlined in your clinical intake." },
                { q: "Do you offer sessions across India?", a: "Yes. Our virtual infrastructure provides secure, HIPAA-compliant therapy to clients in Mumbai, Delhi, Bangalore, and across India." },
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

            <HStack spacing={2} pt={1}>
              <Text fontSize="13px" color="rgba(46,46,46,0.6)" fontFamily="'Inter', var(--font-inter), sans-serif">Still have questions?</Text>
              <Button as={NextLink} href="/contactus" variant="link" color="#56756D" fontSize="13px" fontWeight="700" rightIcon={<FiArrowRight />}>
                Talk to our care team
              </Button>
            </HStack>
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
                Ready to begin your journey?
              </Heading>
              <Text color="whiteAlpha.750" fontSize="14px">Take the first step toward emotional clarity today.</Text>
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
              Start Matching Now
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
