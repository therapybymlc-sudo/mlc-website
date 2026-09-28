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
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiArrowRight, FiCheck, FiUsers, FiClock, FiCalendar, 
  FiVideo, FiBookOpen, FiUser, FiInfo, FiLayers, 
  FiActivity, FiShield, FiHeart, FiFileText, FiAward,
  FiCompass, FiTarget, FiStar
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

export default function SupervisionPage() {
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBrochureDownload = () => {
    toast({
      title: "Brochure download started.",
      description: "The cohort prospectus will open in a new tab.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    window.open("/supervision_cohort_brochure.pdf", "_blank");
  };

  if (!isMounted) return null;

  return (
    <Box bg="#FCFBFA" overflow="hidden" w="100%" color="gray.800">
      
      {/* 🌌 HERO SECTION */}
      <Box 
        position="relative" 
        bg="#0C2520" 
        pt={{ base: 16, md: 24, lg: 28 }} 
        pb={{ base: 18, md: 26, lg: 32 }} 
        overflow="hidden"
      >
        {/* Background Ambience */}
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="radial(circle at top right, rgba(201, 169, 96, 0.12), transparent 50%), radial(circle at bottom left, rgba(40, 90, 80, 0.25), transparent 60%)" 
          pointerEvents="none"
        />
        <Circle position="absolute" top="-15%" right="-8%" size="650px" bg="rgba(201, 169, 96, 0.08)" filter="blur(140px)" pointerEvents="none" />
        <Circle position="absolute" bottom="-15%" left="-8%" size="500px" bg="rgba(56, 120, 105, 0.2)" filter="blur(120px)" pointerEvents="none" />

        <Container maxW="6xl" position="relative" zIndex={10}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 16 }} align="center">
            
            {/* Left content block */}
            <MotionVStack 
              align="start" 
              spacing={{ base: 6, md: 7 }} 
              flex="1.2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <HStack 
                spacing={3} 
                bg="whiteAlpha.100" 
                py={1.5} 
                px={4} 
                borderRadius="full" 
                border="1px solid" 
                borderColor="whiteAlpha.200"
                backdropFilter="blur(8px)"
              >
                <Badge bg="#C9A960" color="#0C2520" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="0.08em">
                  FOUNDING COHORT
                </Badge>
                <Text color="whiteAlpha.900" fontWeight="600" fontSize="xs" letterSpacing="0.02em">
                  Limited to 6 Therapists Only
                </Text>
              </HStack>

              <Heading 
                fontSize={{ base: "34px", sm: "42px", md: "52px", lg: "58px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="white" 
                lineHeight={{ base: "1.18", md: "1.15" }}
                fontWeight="500"
                letterSpacing="-0.01em"
              >
                Become the Therapist <br />
                <Text as="span" color="#C9A960" fontStyle="italic" fontWeight="400">
                  You Aspire to Be.
                </Text>
              </Heading>

              <Text 
                fontSize={{ base: "16px", md: "18px" }} 
                color="whiteAlpha.800" 
                lineHeight="1.8"
                maxW="2xl"
                fontWeight="400"
              >
                A structured, immersive <strong style={{ color: '#fff', fontWeight: 600 }}>12-week reflective clinical supervision programme</strong> crafted to help early-career psychologists sharpen clinical thinking, deepen therapeutic presence, master ethics, and establish enduring professional identity.
              </Text>

              {/* Key Highlights Grid */}
              <Box 
                w="full" 
                py={{ base: 5, md: 6 }} 
                px={{ base: 4, md: 6 }}
                bg="whiteAlpha.50" 
                borderRadius="2xl" 
                border="1px solid" 
                borderColor="whiteAlpha.150"
                backdropFilter="blur(10px)"
              >
                <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={{ base: 4, md: 5 }}>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} color="#C9A960">
                      <Icon as={FiUsers} boxSize={4} />
                      <Text color="white" fontWeight="700" fontSize="14px">6 Therapists</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="12px">Intimate Cohort</Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} color="#C9A960">
                      <Icon as={FiCalendar} boxSize={4} />
                      <Text color="white" fontWeight="700" fontSize="14px">12 Weeks</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="12px">Curated Arc</Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} color="#C9A960">
                      <Icon as={FiClock} boxSize={4} />
                      <Text color="white" fontWeight="700" fontSize="14px">90 Minutes</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="12px">Weekly Sessions</Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} color="#C9A960">
                      <Icon as={FiVideo} boxSize={4} />
                      <Text color="white" fontWeight="700" fontSize="14px">Live Online</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="12px">Across India</Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} color="#C9A960">
                      <Icon as={FiUser} boxSize={4} />
                      <Text color="white" fontWeight="700" fontSize="14px">Ahmed Asif</Text>
                    </HStack>
                    <Text color="whiteAlpha.600" fontSize="12px">Lead Supervisor</Text>
                  </VStack>
                </SimpleGrid>
              </Box>

              {/* Action Buttons */}
              <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={2} w="full">
                <Button 
                  as="a"
                  href="https://forms.cloud.microsoft/r/KimhSxTk25" 
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg" 
                  bg="#C9A960" 
                  color="#0C2520" 
                  h="52px" 
                  px={8} 
                  borderRadius="full" 
                  fontWeight="700"
                  fontSize="15px"
                  _hover={{ bg: "#DFBF74", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(201, 169, 96, 0.35)", textDecoration: "none" }}
                  transition="all 0.25s"
                >
                  Apply for the Founding Cohort
                </Button>
                <Button 
                  onClick={handleBrochureDownload}
                  size="lg" 
                  variant="outline" 
                  color="white" 
                  borderColor="whiteAlpha.400" 
                  h="52px" 
                  px={8} 
                  borderRadius="full"
                  fontWeight="600"
                  fontSize="15px"
                  leftIcon={<FiFileText />}
                  _hover={{ bg: "whiteAlpha.150", borderColor: "white", transform: "translateY(-2px)" }}
                  transition="all 0.25s"
                >
                  Download Prospectus
                </Button>
              </Stack>
            </MotionVStack>

            {/* Right decorative visual card */}
            <Box flex="0.8" w="full" position="relative" display={{ base: "none", lg: "block" }}>
              <Box 
                position="absolute" 
                inset="-12px" 
                bg="linear-gradient(135deg, rgba(201, 169, 96, 0.2), rgba(255, 255, 255, 0.02))" 
                borderRadius="3xl" 
                transform="rotate(-2deg)" 
                zIndex={0} 
                filter="blur(1px)"
              />
              <Box 
                bg="rgba(16, 43, 38, 0.75)" 
                backdropFilter="blur(24px)" 
                border="1px solid" 
                borderColor="whiteAlpha.200" 
                borderRadius="3xl" 
                p={8} 
                zIndex={1} 
                position="relative"
                boxShadow="0 20px 40px rgba(0,0,0,0.3)"
              >
                <VStack align="stretch" spacing={6}>
                  <Box p={4} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
                    <Image 
                      src="/images/supervision_line.png" 
                      alt="Clinical Supervision Line Art" 
                      w="140px" 
                      mx="auto" 
                      mixBlendMode="screen"
                      opacity={0.9}
                      py={2}
                    />
                  </Box>

                  <Text color="whiteAlpha.900" fontStyle="italic" textAlign="center" fontSize="15px" lineHeight="1.6" px={2}>
                    &ldquo;Supervision that shapes how you think, not just what you do in the room.&rdquo;
                  </Text>
                  
                  <Divider borderColor="whiteAlpha.150" />
                  
                  <HStack justify="space-between" pt={1}>
                    <HStack spacing={2}>
                      <Circle size="8px" bg="#C9A960" />
                      <Text color="#C9A960" fontWeight="800" fontSize="12px" letterSpacing="0.08em">MLC CLINICAL FORMATION</Text>
                    </HStack>
                    <Badge colorScheme="green" bg="#56756D" color="rgba(169,203,183,0.15)" px={3} py={1} borderRadius="full" fontSize="11px">
                      Cohort 2026
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </Box>
            
          </Stack>
        </Container>
      </Box>

      {/* 🏺 WHY THIS PROGRAMME EXISTS */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            
            <Box position="relative">
              <Box 
                position="absolute" 
                top="-16px" 
                left="-16px" 
                w="100%" 
                h="100%" 
                border="2px dashed" 
                borderColor="#C9A960" 
                borderRadius="3xl" 
                opacity={0.35}
                zIndex={0} 
              />
              <Image 
                src="/supervision_clinical_review.png" 
                borderRadius="3xl" 
                shadow="2xl" 
                alt="A therapist reflecting in a clinical setting"
                zIndex={1}
                position="relative"
                maxH={{ base: "360px", md: "460px" }}
                objectFit="cover"
                w="100%"
              />
            </Box>

            <VStack align="start" spacing={6}>
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                THE PHILOSOPHY
              </Badge>
              
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                lineHeight="1.25"
                fontWeight="500"
              >
                Therapy Changes Lives. <br />
                <Text as="span" color="#C9A960" fontStyle="italic" fontWeight="400">
                  Great Therapists Aren't Formed Overnight.
                </Text>
              </Heading>
              
              <Text fontSize={{ base: "15px", md: "16px" }} color="gray.700" lineHeight="1.8">
                University imparts theory. Weekend workshops teach brief techniques. <strong style={{ color: '#0C2520' }}>Clinical supervision is the singular crucible where practitioners learn how to truly think, relate, and hold clinical weight.</strong>
              </Text>
              
              <Text color="rgba(46,46,46,0.75)" lineHeight="1.8" fontSize="15px">
                At MLC, we view supervision not merely as emergency case troubleshooting, but as an intentional developmental process: building reflective capacity, emotional attunement, ethical grounding, and clinical intuition.
              </Text>

              <Text color="rgba(46,46,46,0.75)" lineHeight="1.8" fontSize="15px">
                Whether you are stepping into your initial clients or deepening early private practice, our mission is to anchor your transition into competent, resilient, and confident autonomy.
              </Text>
            </VStack>

          </SimpleGrid>
        </Container>
      </Box>

      {/* 🧭 WHAT MAKES THIS DIFFERENT */}
      <Box py={{ base: 16, md: 24 }} bg="#F8FAF9" borderY="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <VStack spacing={{ base: 12, md: 16 }}>
            <VStack spacing={3} textAlign="center" maxW="3xl">
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                THE DISTINCTION
              </Badge>
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                fontWeight="500"
              >
                Why Supervise with MLC?
              </Heading>
              <Text fontSize={{ base: "15px", md: "16px" }} color="rgba(46,46,46,0.6)">
                A meticulously designed reflective container built for transformative clinical depth.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} w="full">
              {[
                { title: "Therapist Formation", desc: "This programme goes far beyond quick prescriptive answers. It deliberately fosters your voice, stance, and identity as a clinician." },
                { title: "Reflective Practice", desc: "Learn to systematically unpack countertransference, somatic reactions, and implicit dynamics rather than mechanically applying templates." },
                { title: "Small Cohorts", desc: "Strictly limited to six therapists to guarantee genuine psychological safety, active participation, and detailed personalized feedback." },
                { title: "Real Conversations", desc: "Explore actual case material, intricate ethical dilemmas, moments of clinical stuckness, and vulnerability without fear of judgment." },
                { title: "Evidence-Based", desc: "Anchored in contemporary psychotherapy research, developmental supervision frameworks, and evidence-supported modalities." },
                { title: "Safe Container", desc: "Confidential, respectful, and rigorously collaborative. Growth requires genuine inquiry; pretense has no place here." }
              ].map((card, i) => (
                <Box 
                  key={i} 
                  bg="white" 
                  p={{ base: 7, md: 8 }} 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor="gray.150" 
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.03)"
                  _hover={{ boxShadow: "0 12px 30px rgba(0, 0, 0, 0.07)", transform: "translateY(-4px)", borderColor: "rgba(86,117,109,0.15)" }}
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  display="flex"
                  flexDirection="column"
                  h="full"
                >
                  <Circle bg="rgba(169,203,183,0.1)" size="48px" mb={5}>
                    <Icon as={FiCheck} color="#56756D" boxSize={5} />
                  </Circle>
                  <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" mb={3} fontWeight="600">
                    {card.title}
                  </Heading>
                  <Text fontSize="14.5px" color="rgba(46,46,46,0.75)" lineHeight="1.7">
                    {card.desc}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 👥 WHO THIS IS FOR */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
            
            <VStack align="start" spacing={7}>
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                ELIGIBILITY & FIT
              </Badge>
              
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                fontWeight="500"
              >
                Who This Cohort is Designed For
              </Heading>
              
              <List spacing={4} w="full">
                {[
                  "Early-career psychologists establishing their personal clinical style",
                  "Master's graduates making the demanding transition to real-world practice",
                  "Therapists establishing private practice seeking grounded, consistent mentorship",
                  "Mental health practitioners craving structured, regular reflective supervision",
                  "Clinicians seeking greater confidence in comprehensive case conceptualisation",
                  "Professionals looking to deepen relational attunement and long-term therapeutic depth"
                ].map((item, i) => (
                  <ListItem key={i} display="flex" alignItems="start" fontSize="15px" color="gray.700" lineHeight="1.6">
                    <ListIcon as={FiCheck} color="#56756D" boxSize={5} mt={1} mr={3} />
                    <Text>{item}</Text>
                  </ListItem>
                ))}
              </List>

              {/* Enhanced Academic Eligibility Callout */}
              <Box 
                bg="linear-gradient(135deg, rgba(230, 246, 244, 0.7), rgba(240, 252, 250, 0.9))" 
                p={{ base: 6, md: 7 }} 
                borderRadius="2xl" 
                w="full" 
                border="1px solid" 
                borderColor="rgba(86,117,109,0.15)"
                boxShadow="0 4px 15px rgba(20, 80, 70, 0.04)"
              >
                <HStack spacing={3} mb={2}>
                  <Icon as={FiAward} color="#56756D" boxSize={5} />
                  <Text fontWeight="800" fontSize="12px" color="#263A33" letterSpacing="0.08em" textTransform="uppercase">
                    ACADEMIC PREREQUISITES
                  </Text>
                </HStack>
                <Text fontSize="14.5px" color="gray.700" lineHeight="1.7">
                  Applicants must hold a <strong>Master's Degree in Psychology</strong> (or closely related clinical branch) OR be currently enrolled in a Master's degree programme (interns actively seeing clients). No minimum years of post-qualification experience required.
                </Text>
              </Box>
            </VStack>

            <Box position="relative" display={{ base: "none", lg: "block" }} maxW="460px" mx="auto">
              <Box 
                p={8} 
                bg="#F8FAF9" 
                borderRadius="3xl" 
                border="1px solid" 
                borderColor="gray.150"
                boxShadow="0 10px 30px rgba(0,0,0,0.03)"
              >
                <Image 
                  src="/images/practitioner_line.png" 
                  alt="Supportive dialogue illustration" 
                  w="100%"
                  mixBlendMode="multiply"
                />
                <VStack spacing={2} pt={4} textAlign="center">
                  <Text fontWeight="700" color="#263A33" fontSize="sm">A Collaborative Clinical Alliance</Text>
                  <Text fontSize="xs" color="rgba(46,46,46,0.6)">Supervision rooted in collegial respect and mutual inquiry.</Text>
                </VStack>
              </Box>
            </Box>

          </SimpleGrid>
        </Container>
      </Box>

      {/* 🧬 WHAT YOU'LL LEARN */}
      <Box py={{ base: 16, md: 24 }} bg="#FDFBFA">
        <Container maxW="6xl">
          <VStack spacing={{ base: 12, md: 16 }}>
            <VStack spacing={3} textAlign="center" maxW="3xl">
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                CURRICULUM
              </Badge>
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                fontWeight="500"
              >
                Key Developmental Domains
              </Heading>
              <Text fontSize={{ base: "15px", md: "16px" }} color="rgba(46,46,46,0.6)">
                Six deliberate pillars curated to elevate your clinical acumen far past basic techniques.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} w="full">
              {[
                {
                  title: "Clinical Conceptualisation",
                  items: ["Advanced case formulation frameworks", "Identifying pervasive client patterns", "Hypothesis testing in live therapy", "Navigating acute clinical impasse"]
                },
                {
                  title: "Therapist Voice & Stance",
                  items: ["Cultivating authentic presence", "Grounding session confidence", "Finding your theoretical integration", "Embodied calmness in high affect"]
                },
                {
                  title: "Translating Theory to Practice",
                  items: ["Intentional intervention selection", "Understanding mechanics of therapeutic change", "Pacing & resistance management", "Modality cross-pollination"]
                },
                {
                  title: "Ethics, Boundaries & Law",
                  items: ["Complex boundary maintenance", "Clinical risk & escalation protocols", "High-standard clinical documentation", "Confidentiality nuances & disclosure"]
                },
                {
                  title: "The Self of the Therapist",
                  items: ["Working with countertransference", "Recognising unconscious blind spots", "Navigating personal triggers", "Reflective resilience against burnout"]
                },
                {
                  title: "Mastering Session Craft",
                  items: ["Structuring high-impact intake sessions", "Solidifying the therapeutic alliance", "Framing generative, deep inquiries", "Concise, meaningful clinical notes"]
                }
              ].map((module, i) => (
                <Box 
                  key={i} 
                  bg="white" 
                  p={{ base: 6, md: 8 }} 
                  borderRadius="2xl" 
                  boxShadow="0 4px 18px rgba(0, 0, 0, 0.03)" 
                  border="1px solid" 
                  borderColor="gray.150"
                  _hover={{ borderColor: "rgba(86,117,109,0.15)", transform: "translateY(-3px)" }}
                  transition="all 0.25s ease"
                >
                  <HStack spacing={3} mb={4}>
                    <Circle size="32px" bg="#0C2520" color="#C9A960" fontSize="13px" fontWeight="700">
                      0{i + 1}
                    </Circle>
                    <Heading size="sm" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600">
                      {module.title}
                    </Heading>
                  </HStack>
                  <Divider mb={4} borderColor="gray.100" />
                  <List spacing={3}>
                    {module.items.map((item, j) => (
                      <ListItem key={j} display="flex" alignItems="start" fontSize="13.5px" color="rgba(46,46,46,0.75)">
                        <ListIcon as={FiArrowRight} color="#C9A960" mt={1} />
                        <Text>{item}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 📅 PROGRAMME STRUCTURE */}
      <Box py={{ base: 16, md: 24 }} bg="#0C2520" color="white" position="relative" overflow="hidden">
        <Circle position="absolute" top="-10%" left="-10%" size="500px" bg="whiteAlpha.50" filter="blur(100px)" pointerEvents="none" />
        
        <Container maxW="6xl" position="relative" zIndex={2}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 16 }} align="center">
            
            <VStack align="start" spacing={7} flex="1">
              <Badge bg="whiteAlpha.200" color="white" px={4} py={1.5} borderRadius="full" fontSize="xs">
                CADENCE & FORMAT
              </Badge>
              <Heading 
                fontSize={{ base: "28px", md: "40px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                fontWeight="500"
                lineHeight="1.2"
              >
                Cohort Architecture
              </Heading>
              <Text fontSize="16px" color="whiteAlpha.800" lineHeight="1.8">
                Sessions are held live online within a strictly closed cohort. The exact same 6 practitioners journey together across the 12 weeks, ensuring continuous depth, trust, and mutual vulnerability.
              </Text>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.150">
                  <Text fontSize="11px" color="#C9A960" fontWeight="800" letterSpacing="0.08em" mb={1}>DURATION</Text>
                  <Text fontWeight="700" fontSize="18px">12 Weeks</Text>
                  <Text fontSize="12px" color="whiteAlpha.600" mt={1}>Weekly Progression</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.150">
                  <Text fontSize="11px" color="#C9A960" fontWeight="800" letterSpacing="0.08em" mb={1}>CADENCE</Text>
                  <Text fontWeight="700" fontSize="18px">Weekly Live</Text>
                  <Text fontSize="12px" color="whiteAlpha.600" mt={1}>Fixed Scheduled Slot</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.150">
                  <Text fontSize="11px" color="#C9A960" fontWeight="800" letterSpacing="0.08em" mb={1}>DURATION</Text>
                  <Text fontWeight="700" fontSize="18px">90 Minutes</Text>
                  <Text fontSize="12px" color="whiteAlpha.600" mt={1}>Deep Interactive Space</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.150">
                  <Text fontSize="11px" color="#C9A960" fontWeight="800" letterSpacing="0.08em" mb={1}>COHORT SIZE</Text>
                  <Text fontWeight="700" fontSize="18px">Strictly 6</Text>
                  <Text fontSize="12px" color="whiteAlpha.600" mt={1}>Psychological Safety</Text>
                </Box>
              </SimpleGrid>
            </VStack>

            <VStack 
              align="stretch" 
              spacing={5} 
              flex="1.1" 
              bg="rgba(255,255,255,0.04)" 
              backdropFilter="blur(16px)"
              p={{ base: 7, md: 9 }} 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="whiteAlpha.200"
            >
              <Heading size="sm" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#C9A960" fontWeight="600" letterSpacing="0.02em">
                The 90-Minute Reflective Flow
              </Heading>
              <Text fontSize="13px" color="whiteAlpha.700">
                Every supervisor-led encounter adheres to a deliberate arc balancing didactic precision with deep reflective inquiry:
              </Text>
              
              <VStack spacing={3} align="stretch" pt={2}>
                {[
                  { step: "Grounding & Case Selection", desc: "Brief somatic arrival, check-in, and selecting case material for today." },
                  { step: "In-Depth Case Presentation", desc: "Narrating the therapeutic trajectory, client dynamics, and presenter dilemmas." },
                  { step: "Reflective Group Inquiry", desc: "Cohort inquiry without jumping to advice; uncovering unconscious dynamics." },
                  { step: "Theoretical Linkage & Conceptualisation", desc: "Bridging the live material into clinical models, research, and ethics." },
                  { step: "Supervisor Clinical Synthesis", desc: "Ahmed's diagnostic framing, actionable interventions, and strategic perspectives." },
                  { step: "Integration & Personal Reflection", desc: "Extracting individual takeaways for each participant's active practice." }
                ].map((item, i) => (
                  <HStack key={i} align="start" spacing={3.5} p={2.5} borderRadius="xl" _hover={{ bg: "whiteAlpha.50" }} transition="background 0.2s">
                    <Circle size="26px" bg="#C9A960" color="#0C2520" fontSize="12px" fontWeight="800" flexShrink={0} mt={0.5}>
                      {i + 1}
                    </Circle>
                    <Box>
                      <Text fontWeight="700" fontSize="13.5px" color="white">{item.step}</Text>
                      <Text fontSize="12px" color="whiteAlpha.600">{item.desc}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </VStack>

          </Stack>
        </Container>
      </Box>

      {/* 👨‍⚕️ MEET YOUR SUPERVISOR */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 16 }} align="center">
            
            <Box flex="0.9" w="full" maxW="380px">
              <Box position="relative">
                <Box 
                  position="absolute" 
                  inset="-8px" 
                  border="2px solid" 
                  borderColor="#C9A960" 
                  borderRadius="3xl" 
                  transform="rotate(3deg)" 
                  zIndex={0} 
                  opacity={0.6}
                />
                <Image 
                  src="/founder_portrait_new.png" 
                  borderRadius="3xl" 
                  shadow="2xl" 
                  alt="Ahmed Asif - Clinical Supervisor"
                  zIndex={1}
                  position="relative"
                  w="100%"
                />
              </Box>
            </Box>

            <VStack flex="1.1" align="start" spacing={6}>
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                YOUR CLINICAL SUPERVISOR
              </Badge>
              <Box>
                <Heading fontSize={{ base: "30px", md: "40px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="500">
                  Ahmed Asif
                </Heading>
                <Text fontSize="14px" color="#56756D" fontWeight="700" letterSpacing="0.04em" mt={1}>
                  M.Sc. Psychology • Licensed Counselling Psychologist • Clinical Supervisor
                </Text>
              </Box>

              <Text color="gray.700" lineHeight="1.8" fontSize="15px">
                Ahmed Asif is a licensed Counselling Psychologist with extensive clinical practice spanning adolescents, adults, couples, and systemic family dynamics across a wide breadth of severe and neurotic presentations.
              </Text>

              <Text color="rgba(46,46,46,0.75)" lineHeight="1.8" fontSize="14.5px">
                Having conducted thousands of hours of psychotherapeutic care, his integrative orientation weaves Cognitive Behaviour Therapy (CBT), Dialectical Behaviour Therapy (DBT), Acceptance and Commitment Therapy (ACT), and psychodynamic relational frameworks with trauma-informed sensitivity.
              </Text>

              <Text color="rgba(46,46,46,0.75)" lineHeight="1.8" fontSize="14.5px">
                Beyond individual psychotherapy, Ahmed has consistently mentored psychologists and clinical trainees. His supervisory philosophy focuses on grounding professional autonomy, refining diagnostic discernment, and building authentic clinical presence.
              </Text>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} pt={2} w="full">
                {[
                  "International Affiliate, APA",
                  "Registered with Rehabilitation Council / CCI",
                  "5+ Years High-Volume Clinical Practice",
                  "Certified Trauma-Informed Clinician"
                ].map((cred, i) => (
                  <HStack key={i} align="center" spacing={2.5}>
                    <Icon as={FiCheck} color="#C9A960" boxSize={4} />
                    <Text fontSize="13px" fontWeight="600" color="gray.800">{cred}</Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </VStack>

          </Stack>
        </Container>
      </Box>

      {/* 💳 COHORT PRICING */}
      <Box py={{ base: 16, md: 24 }} bg="#F8FAF9" borderY="1px solid" borderColor="gray.150">
        <Container maxW="3xl">
          <VStack spacing={10} align="stretch" textAlign="center">
            
            <VStack spacing={3}>
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                TUITION & INVESTMENT
              </Badge>
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                fontWeight="500"
              >
                Founding Cohort Rate
              </Heading>
              <Text fontSize="15px" color="rgba(46,46,46,0.6)">
                Premium, high-touch clinical supervision at an accessible launch entry point.
              </Text>
            </VStack>

            <Box 
              bg="white" 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="rgba(169,203,183,0.15)" 
              p={{ base: 8, md: 12 }} 
              boxShadow="0 15px 45px rgba(0, 0, 0, 0.05)" 
              position="relative" 
              overflow="hidden"
            >
              <Box position="absolute" top={0} left={0} right={0} h="6px" bg="#C9A960" />
              
              <VStack spacing={6}>
                <Badge bg="rgba(169,203,183,0.1)" color="#56756D" fontSize="12px" px={4} py={1.5} borderRadius="full" fontWeight="700">
                  EXCLUSIVE FOUNDING INVITATION
                </Badge>
                
                <HStack spacing={3} align="baseline" justify="center">
                  <Heading fontSize={{ base: "36px", md: "52px" }} color="#263A33" fontFamily="'Playfair Display', var(--font-playfair), serif" fontWeight="600">
                    ₹12,999
                  </Heading>
                  <Text textDecoration="line-through" color="gray.400" fontSize="lg" fontWeight="500">
                    ₹14,999
                  </Text>
                </HStack>
                
                <Text color="rgba(46,46,46,0.75)" fontSize="14.5px" maxW="lg" lineHeight="1.6">
                  Covers the complete 12-week closed cohort programme, including all 18 live training hours, session recordings, clinical templates, and completion credentials.
                </Text>

                <Box bg="#F0F7F5" p={4} borderRadius="2xl" border="1px solid" borderColor="rgba(169,203,183,0.15)" w="full">
                  <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                    ✦ Founding members receive permanent recognition as MLC Alumni with priority entry to advanced clinical electives.
                  </Text>
                </Box>

                <Divider borderColor="gray.150" />

                <HStack spacing={{ base: 4, sm: 8 }} justify="center" w="full" fontSize="13px" color="rgba(46,46,46,0.75)" fontWeight="600" flexWrap="wrap">
                  <HStack spacing={2}><Icon as={FiCheck} color="#56756D" /><Text>Split-Payment Options Available</Text></HStack>
                  <HStack spacing={2}><Icon as={FiCheck} color="#56756D" /><Text>Zero-Cost EMI on Cards</Text></HStack>
                </HStack>

                <Button 
                  as="a"
                  href="https://forms.cloud.microsoft/r/KimhSxTk25" 
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg" 
                  bg="#C9A960" 
                  color="#0C2520" 
                  h="52px" 
                  w="full"
                  borderRadius="full" 
                  fontWeight="700"
                  fontSize="15px"
                  _hover={{ bg: "#DFBF74", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(201, 169, 96, 0.35)", textDecoration: "none" }}
                  transition="all 0.25s"
                >
                  Submit Cohort Application
                </Button>
              </VStack>
            </Box>

          </VStack>
        </Container>
      </Box>

      {/* 🚀 APPLICATION PROCESS (STEPS) */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <VStack spacing={{ base: 12, md: 16 }}>
            <VStack spacing={3} textAlign="center" maxW="2xl">
              <Badge bg="rgba(169,203,183,0.1)" color="#56756D" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.05em">
                ADMISSIONS
              </Badge>
              <Heading 
                fontSize={{ base: "28px", md: "38px" }} 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                color="#263A33" 
                fontWeight="500"
              >
                The Application Roadmap
              </Heading>
              <Text fontSize="15px" color="rgba(46,46,46,0.6)">
                Four simple steps to secure your presence in the Founding Cohort.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 6, md: 8 }} w="full">
              {[
                { step: "01", title: "Submit Form", desc: "Complete our focused clinical background & expectations application." },
                { step: "02", title: "Review & Match", desc: "The clinical team reviews details to curate a balanced, cohesive peer cohort." },
                { step: "03", title: "Confirmation", desc: "Shortlisted therapists receive official confirmation and enrollment links." },
                { step: "04", title: "Cohort Begins", desc: "Receive orientation materials and commence the 12-week formation arc." }
              ].map((step, i) => (
                <Box 
                  key={i} 
                  p={{ base: 6, md: 7 }} 
                  bg="#F8FAF9" 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor="gray.150"
                  position="relative"
                  _hover={{ borderColor: "#A9CBB7", transform: "translateY(-4px)", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}
                  transition="all 0.3s ease"
                >
                  <Circle size="38px" bg="#0C2520" color="#C9A960" fontWeight="800" fontSize="13px" mb={5}>
                    {step.step}
                  </Circle>
                  <Heading size="sm" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600" mb={2}>
                    {step.title}
                  </Heading>
                  <Text fontSize="13.5px" color="rgba(46,46,46,0.75)" lineHeight="1.6">
                    {step.desc}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* Redesigned Admission Note with Spacing & Sophistication */}
            <Box 
              bg="#FFFBF5" 
              p={{ base: 6, md: 8 }} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="#EAD7B0" 
              maxW="4xl"
              boxShadow="0 4px 20px rgba(201, 169, 96, 0.08)"
            >
              <HStack spacing={4} align="start">
                <Circle size="32px" bg="#F3E5C8" color="#8C6615" flexShrink={0} mt={0.5}>
                  <Icon as={FiInfo} boxSize={4} />
                </Circle>
                <Box>
                  <Text fontWeight="800" fontSize="12px" color="#8C6615" letterSpacing="0.08em" textTransform="uppercase">
                    IMPORTANT ADMISSIONS NOTICE
                  </Text>
                  <Text fontSize="14px" color="gray.700" mt={1.5} lineHeight="1.7">
                    Submitting an application does <strong>not</strong> guarantee admission into the cohort. Because places are strictly capped at 6 to protect the interactive clinical depth of the setting, submissions are vetted sequentially. If a cohort is full, qualified practitioners are offered priority reserved status for the subsequent intake.
                  </Text>
                </Box>
              </HStack>
            </Box>
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
                Frequently Asked Questions
              </Heading>
              <Text color="rgba(46,46,46,0.65)" fontSize="13.5px" fontFamily="'Inter', var(--font-inter), sans-serif">
                Clear answers regarding cohort dynamics, clinical scope, and attendance.
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "Is this cohort equivalent to personal therapy?", a: "No. This is professional clinical supervision and practitioner formation. While countertransference and emotional resonance are gently reflected upon, the spotlight remains firmly on your clinical reasoning, boundary management, and client conceptualisations." },
                { q: "Is admission restricted exclusively to psychologists?", a: "The programme is crafted primarily for counselling psychologists, clinical psychologists, and psychotherapists holding formal postgraduate qualifications in mental health disciplines." },
                { q: "Can master's students and trainees apply?", a: "Yes, provided you are currently enrolled in a recognized Master's programme and actively undertaking clinical internships with live client contact." },
                { q: "Do I already need an active client caseload?", a: "Not necessarily. If you are preparing to see clients soon, the frameworks taught on diagnostic assessment and initial intakes will establish the exact structure you need to begin with confidence." },
                { q: "Are live supervision sessions recorded?", a: "Never. In accordance with strict clinical confidentiality and to foster unconditional vulnerability and candid discussion, no sessions are recorded." },
                { q: "What is the policy regarding missed meetings?", a: "Because cohorts are intentionally closed with only 6 members, consistent attendance is vital for collective psychological safety. Missing more than two sessions is strongly discouraged." },
                { q: "How is this different from routine case consultation?", a: "Routine consultation is typically transactional troubleshooting for one crisis. This cohort is formation: cultivating the mental model, clinical logic, and therapeutic presence that underpins all your future sessions." }
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

      {/* 🚀 FINAL CTA SECTION */}
      <Box bg="#0C2520" py={{ base: 18, md: 24 }} color="white" textAlign="center" position="relative" overflow="hidden">
        <Circle position="absolute" top="-20%" right="-10%" size="500px" bg="whiteAlpha.50" filter="blur(100px)" pointerEvents="none" />
        <Container maxW="3xl" position="relative" zIndex={2}>
          <VStack spacing={7}>
            <Badge bg="whiteAlpha.200" color="#C9A960" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="700" letterSpacing="0.08em">
              LIMITED CAPACITY • 6 SEATS
            </Badge>
            <Heading 
              fontSize={{ base: "30px", md: "46px" }} 
              fontFamily="'Playfair Display', var(--font-playfair), serif" 
              fontWeight="500"
              lineHeight="1.2"
            >
              Ready to Form Your Clinical Voice?
            </Heading>
            <Text fontSize="16px" color="whiteAlpha.800" maxW="xl" mx="auto" lineHeight="1.8">
              Step into an intimate supervisory space designed to provide the clarity, boundaries, and clinical insight your future clients deserve.
            </Text>
            <Button 
              as="a" 
              href="https://forms.cloud.microsoft/r/KimhSxTk25" 
              target="_blank"
              rel="noopener noreferrer"
              size="lg" 
              bg="#C9A960" 
              color="#0C2520" 
              h="54px" 
              px={10} 
              borderRadius="full" 
              fontWeight="700"
              fontSize="16px"
              _hover={{ transform: "translateY(-2px)", bg: "#DFBF74", boxShadow: "0 10px 30px rgba(201, 169, 96, 0.4)", textDecoration: "none" }}
              transition="all 0.25s"
            >
              Apply for the Founding Cohort
            </Button>
          </VStack>
        </Container>
      </Box>

    </Box>
  );
}
