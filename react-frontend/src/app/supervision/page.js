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
  FiActivity, FiShield, FiHeart, FiFileText, FiAward
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

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
    // Open standard PDF or placeholder
    window.open("/supervision_cohort_brochure.pdf", "_blank");
  };

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden" w="100%">
      
      {/* 🌌 HERO SECTION */}
      <Box position="relative" minH={{ base: "auto", lg: "95vh" }} bg="teal.900" display="flex" alignItems="center" py={{ base: 20, lg: 24 }} overflow="hidden">
        {/* Background Subtle Gradient & Deco */}
        <Box position="absolute" inset={0} bgGradient="linear(to-b, rgba(20, 54, 48, 0.75), teal.900)" />
        <Circle position="absolute" top="-10%" right="-5%" size="600px" bg="rgba(201, 169, 96, 0.1)" filter="blur(120px)" />
        <Circle position="absolute" bottom="-15%" left="-5%" size="400px" bg="rgba(86, 117, 109, 0.25)" filter="blur(100px)" />

        <Container maxW="7xl" position="relative" zIndex={10}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 16 }} align="center">
            
            {/* Left content block */}
            <MotionVStack 
              align="start" 
              spacing={6} 
              flex="1.2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <HStack spacing={3} bg="rgba(255,255,255,0.05)" p={2} pr={5} borderRadius="full" border="1px solid" borderColor="whiteAlpha.200">
                <Badge bg="mlc.gold" color="teal.900" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="900" letterSpacing="1px">
                  FOUNDING COHORT
                </Badge>
                <Text color="whiteAlpha.800" fontWeight="600" fontSize="sm">Limited to 6 Therapists</Text>
              </HStack>

              <Heading 
                fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
                fontFamily="'Forum', serif" 
                color="white" 
                lineHeight="1.1"
              >
                Become the Therapist <br />
                <Text as="span" color="mlc.gold" display="inline-block" position="relative">
                  You Aspire to Be.
                  <Box position="absolute" bottom="8%" left="0" w="100%" h="4px" bg="mlc.gold" opacity="0.4" />
                </Text>
              </Heading>

              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                color="whiteAlpha.900" 
                lineHeight="1.7"
                maxW="2xl"
              >
                A structured <strong>12-week reflective clinical supervision programme</strong> designed to help early-career psychologists strengthen their clinical thinking, deepen therapeutic skills, develop confidence, and build a strong professional identity.
              </Text>

              {/* Key Highlights Grid */}
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={6} w="full" py={6} borderY="1px solid" borderColor="whiteAlpha.100">
                <HStack spacing={3}>
                  <Icon as={FiUsers} color="mlc.gold" boxSize={5} />
                  <Box><Text color="white" fontWeight="700" fontSize="sm">6 Therapists</Text><Text color="whiteAlpha.600" fontSize="xs">Small Interactive Group</Text></Box>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiCalendar} color="mlc.gold" boxSize={5} />
                  <Box><Text color="white" fontWeight="700" fontSize="sm">12 Weeks</Text><Text color="whiteAlpha.600" fontSize="xs">Structured Timeline</Text></Box>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiClock} color="mlc.gold" boxSize={5} />
                  <Box><Text color="white" fontWeight="700" fontSize="sm">90 Minutes</Text><Text color="whiteAlpha.600" fontSize="xs">Weekly Live Sessions</Text></Box>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiVideo} color="mlc.gold" boxSize={5} />
                  <Box><Text color="white" fontWeight="700" fontSize="sm">Online</Text><Text color="whiteAlpha.600" fontSize="xs">Interactive Across India</Text></Box>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiUser} color="mlc.gold" boxSize={5} />
                  <Box><Text color="white" fontWeight="700" fontSize="sm">Ahmed Asif</Text><Text color="whiteAlpha.600" fontSize="xs">Clinical Lead Supervisor</Text></Box>
                </HStack>
              </SimpleGrid>

              <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={4} w="full">
                <Button 
                  as="a"
                  href="https://forms.cloud.microsoft/r/KimhSxTk25" 
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xl" 
                  bg="mlc.gold" 
                  color="teal.900" 
                  h="60px" 
                  px={10} 
                  borderRadius="full" 
                  fontWeight="700"
                  _hover={{ bg: "white", transform: "translateY(-2px)", textDecoration: "none" }}
                  transition="all 0.3s"
                >
                  Apply for the Founding Cohort
                </Button>
                <Button 
                  onClick={handleBrochureDownload}
                  size="xl" 
                  variant="outline" 
                  color="white" 
                  borderColor="whiteAlpha.400"
                  h="60px" 
                  px={10} 
                  borderRadius="full"
                  fontWeight="600"
                  leftIcon={<FiFileText />}
                  _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                >
                  Download Brochure
                </Button>
              </Stack>
            </MotionVStack>

            {/* Right decorative visual card */}
            <Box flex="0.8" w="full" position="relative" display={{ base: "none", lg: "block" }}>
              <Box position="absolute" inset="-20px" bg="rgba(255, 255, 255, 0.03)" borderRadius="3xl" transform="rotate(-2deg)" zIndex={0} />
              <Box 
                bg="whiteAlpha.50" 
                backdropFilter="blur(20px)" 
                border="1px solid" 
                borderColor="whiteAlpha.200" 
                borderRadius="3xl" 
                p={8} 
                zIndex={1} 
                position="relative"
              >
                <VStack align="stretch" spacing={6}>
                  <Image 
                    src="/images/supervision_line.png" 
                    alt="Clinical Supervision Line Art" 
                    w="150px" 
                    mx="auto" 
                    mixBlendMode="screen"
                    opacity={0.8}
                  />
                  <Text color="whiteAlpha.800" fontStyle="italic" textAlign="center" fontSize="md">
                    "Supervision that shapes how you think, not just what you do."
                  </Text>
                  <Divider borderColor="whiteAlpha.200" />
                  <HStack justify="space-between">
                    <Text color="mlc.gold" fontWeight="800" fontSize="xs" letterSpacing="1px">MLC FORMATION SYSTEM</Text>
                    <Badge colorScheme="teal" borderRadius="full">Cohorts 2026</Badge>
                  </HStack>
                </VStack>
              </Box>
            </Box>
            
          </Stack>
        </Container>
      </Box>

      {/* 🏺 WHY THIS PROGRAMME EXISTS */}
      <Box py={{ base: 20, md: 32 }} bg="white">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 20 }} alignItems="center">
            
            <Box position="relative">
              <Box position="absolute" top="-20px" left="-20px" w="100%" h="100%" border="2px solid" borderColor="teal.50" borderRadius="3xl" zIndex={0} />
              <Image 
                src="/supervision_clinical_review.png" 
                borderRadius="3xl" 
                shadow="xl" 
                alt="A therapist reflecting in a clinical setting"
                zIndex={1}
                position="relative"
              />
            </Box>

            <VStack align="start" spacing={6}>
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="xs">THE VISION</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900" lineHeight="1.2">
                Therapy Changes Lives. <br />
                But Great Therapists Aren't Built Overnight.
              </Heading>
              
              <Text fontSize="lg" color="gray.600" lineHeight="tall">
                University teaches theory. Workshops teach techniques. <strong>Clinical supervision is where therapists learn how to truly think.</strong>
              </Text>
              
              <Text color="gray.500" lineHeight="tall">
                At MLC, we believe supervision is not simply discussing difficult cases. It is the intentional process of becoming a more reflective, ethical, confident and clinically attuned therapist.
              </Text>

              <Text color="gray.500" lineHeight="tall">
                This programme has been designed to bridge the gap between academic learning and competent independent practice. Whether you're beginning your career or already seeing clients, our goal is to help you become the kind of therapist clients genuinely benefit from.
              </Text>
            </VStack>

          </SimpleGrid>
        </Container>
      </Box>

      {/* 🧭 WHAT MAKES THIS DIFFERENT */}
      <Box py={{ base: 20, md: 32 }} bg="#F9FAF9" borderY="1px solid" borderColor="gray.100">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">THE DIFFERENCE</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Why Supervise with MLC?</Heading>
              <Text fontSize="lg" color="gray.500">A training environment designed specifically for clinical depth.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {[
                { title: "Therapist Formation", desc: "This programme isn't about getting quick answers. It's about developing your identity and voice as a psychologist." },
                { title: "Reflective Practice", desc: "Learn to think critically about your clinical work, countertransference, and reactions instead of simply applying techniques." },
                { title: "Small Cohorts", desc: "Maximum of six therapists ensures meaningful discussions, psychological safety, and highly personalized feedback." },
                { title: "Real Conversations", desc: "Discuss actual therapy work, ethical dilemmas, difficult moments, and the therapeutic process in confidence." },
                { title: "Evidence-Based", desc: "Grounded in contemporary psychotherapy research, developmental models of supervision, and evidence-based practice." },
                { title: "Safe Environment", desc: "Confidential, supportive, and collaborative. Questions are encouraged, growth is expected, and judgment has no place." }
              ].map((card, i) => (
                <Box 
                  key={i} 
                  bg="white" 
                  p={8} 
                  borderRadius="3xl" 
                  border="1px solid" 
                  borderColor="gray.100"
                  shadow="sm"
                  _hover={{ shadow: "md", transform: "translateY(-4px)" }}
                  transition="all 0.2s"
                >
                  <Circle bg="teal.50" size="48px" mb={6}>
                    <Icon as={FiCheck} color="teal.600" />
                  </Circle>
                  <Heading size="md" fontFamily="'Forum', serif" color="teal.900" mb={3}>{card.title}</Heading>
                  <Text fontSize="sm" color="gray.600" lineHeight="relaxed">{card.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 👥 WHO THIS IS FOR */}
      <Box py={{ base: 20, md: 32 }} bg="white">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 20 }} alignItems="center">
            
            <VStack align="start" spacing={8}>
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">ELIGIBILITY</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Who This Is For</Heading>
              
              <List spacing={4} w="full">
                {[
                  "Early-career psychologists establishing their clinical style",
                  "Fresh Master's graduates transitioning to clinical practice",
                  "Therapists beginning private practice seeking structured support",
                  "Mental health professionals wanting regular reflective supervision",
                  "Clinicians seeking greater confidence in structural case planning",
                  "Professionals looking to deepen their relational and therapeutic approach"
                ].map((item, i) => (
                  <ListItem key={i} display="flex" alignItems="start" fontSize="md" color="gray.600">
                    <ListIcon as={FiCheck} color="teal.600" mt={1} />
                    <Text>{item}</Text>
                  </ListItem>
                ))}
              </List>

              <Box bg="teal.50" p={6} borderRadius="2xl" w="full" border="1px solid" borderColor="teal.100">
                <Text fontWeight="800" fontSize="xs" color="teal.800" mb={2} letterSpacing="1px" textTransform="uppercase">ACADEMIC ELIGIBILITY</Text>
                <Text fontSize="sm" color="gray.700" fontWeight="600">
                  Applicants should hold a Master's Degree in Psychology (or a related field) OR currently be enrolled in a Master's programme (interns only). No minimum years of experience required.
                </Text>
              </Box>
            </VStack>

            <Box position="relative" display={{ base: "none", lg: "block" }} maxW="450px" mx="auto">
              {/* Clean illustration mockup */}
              <Image 
                src="/images/practitioner_line.png" 
                alt="Supportive dialogue illustration" 
                w="100%"
                mixBlendMode="multiply"
              />
            </Box>

          </SimpleGrid>
        </Container>
      </Box>

      {/* 🧬 WHAT YOU'LL LEARN */}
      <Box py={{ base: 20, md: 32 }} bg="#FDFBFA">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">CURRICULUM</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Program Learning Objectives</Heading>
              <Text fontSize="lg" color="gray.500">Core pillars designed to move you beyond basic clinical techniques.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
              {[
                {
                  title: "Clinical Thinking",
                  items: ["Case conceptualisation frameworks", "Advanced pattern recognition", "Structured clinical reasoning", "Complex decision-making skills"]
                },
                {
                  title: "Therapist Identity",
                  items: ["Finding your therapeutic voice", "Developing session confidence", "Discovering your personal style", "Working authentically with clients"]
                },
                {
                  title: "Theory Into Practice",
                  items: ["Integrating psychological models", "Choosing interventions intentionally", "Understanding the mechanics of change", "Navigating clinical resistance"]
                },
                {
                  title: "Ethics & Safety",
                  items: ["Healthy boundary management", "Comprehensive clinical documentation", "Confidentiality and limits", "Risk management & professional judgment"]
                },
                {
                  title: "Self of the Therapist",
                  items: ["Managing countertransference", "Building emotional awareness", "Identifying therapist blind spots", "Reflective practice to prevent burnout"]
                },
                {
                  title: "Session Craft",
                  items: ["Structuring initial & ongoing sessions", "Building a strong therapeutic alliance", "Asking deep, meaningful questions", "Writing clinical notes effectively"]
                }
              ].map((module, i) => (
                <Box key={i} bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <Heading size="md" fontFamily="'Forum', serif" color="teal.900" mb={4}>{module.title}</Heading>
                  <List spacing={3}>
                    {module.items.map((item, j) => (
                      <ListItem key={j} display="flex" alignItems="start" fontSize="sm" color="gray.600">
                        <ListIcon as={FiArrowRight} color="teal.500" mt={1} />
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
      <Box py={{ base: 20, md: 32 }} bg="teal.900" color="white" position="relative" overflow="hidden">
        <Circle position="absolute" top="-10%" left="-10%" size="400px" bg="whiteAlpha.50" filter="blur(80px)" />
        
        <Container maxW="7xl" position="relative" zIndex={2}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={16} align="center">
            
            <VStack align="start" spacing={8} flex="1">
              <Badge colorScheme="whiteAlpha" px={3} py={1} borderRadius="full">FORMAT</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif">How the Cohort is Structured</Heading>
              <Text fontSize="lg" color="whiteAlpha.800" lineHeight="tall">
                We meet online weekly inside a closed cohort. The exact same 6 clinicians continue together for 12 weeks to build a safe container for vulnerable sharing.
              </Text>
              
              <SimpleGrid columns={2} spacing={6} w="full">
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="2xs" color="mlc.gold" fontWeight="700" letterSpacing="1px" mb={1}>DURATION</Text>
                  <Text fontWeight="700" fontSize="lg">12 Weeks</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="2xs" color="mlc.gold" fontWeight="700" letterSpacing="1px" mb={1}>FREQUENCY</Text>
                  <Text fontWeight="700" fontSize="lg">Weekly Sessions</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="2xs" color="mlc.gold" fontWeight="700" letterSpacing="1px" mb={1}>LENGTH</Text>
                  <Text fontWeight="700" fontSize="lg">90 Minutes Each</Text>
                </Box>
                <Box p={5} bg="whiteAlpha.50" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Text fontSize="2xs" color="mlc.gold" fontWeight="700" letterSpacing="1px" mb={1}>COHORT SIZE</Text>
                  <Text fontWeight="700" fontSize="lg">Maximum 6</Text>
                </Box>
              </SimpleGrid>
            </VStack>

            <VStack align="stretch" spacing={6} flex="1.2" bg="whiteAlpha.100" p={8} borderRadius="3xl" border="1px solid" borderColor="whiteAlpha.200">
              <Heading size="md" fontFamily="'Forum', serif" color="mlc.gold">The Reflective Session Flow</Heading>
              <Text fontSize="sm" color="whiteAlpha.700">Each supervisor-facilitated, discussion-based session follows a rigorous structure:</Text>
              
              <List spacing={3} fontSize="sm">
                {[
                  "Grounding & Check-In",
                  "Clinical Case Sharing",
                  "Reflective Group Discussion",
                  "Clinical Conceptualisation & Theory Linkage",
                  "Supervisor Vetted Feedback",
                  "Learning Integration & Closing Reflections"
                ].map((step, i) => (
                  <ListItem key={i} display="flex" alignItems="center">
                    <Circle size="28px" bg="mlc.gold" color="teal.900" mr={3} fontSize="xs" fontWeight="800">
                      {i + 1}
                    </Circle>
                    <Text fontWeight="600">{step}</Text>
                  </ListItem>
                ))}
              </List>
            </VStack>

          </Stack>
        </Container>
      </Box>

      {/* 👨⚕️ MEET YOUR SUPERVISOR */}
      <Box py={{ base: 20, md: 32 }} bg="white">
        <Container maxW="7xl">
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 20 }} align="center">
            
            <Box flex="0.9" w="full" maxW="400px">
              <Box position="relative">
                <Box position="absolute" inset="10px" border="2px solid" borderColor="mlc.gold" borderRadius="3xl" transform="rotate(3deg)" zIndex={0} />
                <Image 
                  src="/founder_portrait_new.png" 
                  borderRadius="3xl" 
                  shadow="xl" 
                  alt="Ahmed Asif - Clinical Supervisor"
                  zIndex={1}
                  position="relative"
                  w="100%"
                />
              </Box>
            </Box>

            <VStack flex="1.1" align="start" spacing={6}>
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">YOUR SUPERVISOR</Badge>
              <Box>
                <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Ahmed Asif</Heading>
                <Text fontSize="sm" color="gray.500" fontWeight="700" letterSpacing="1px" mt={1}>
                  M.Sc. Psychology • Licensed Counselling Psychologist • Clinical Supervisor
                </Text>
              </Box>

              <Text color="gray.600" lineHeight="tall" fontSize="md">
                Ahmed Asif is a licensed Counselling Psychologist with over five years of clinical experience working with adolescents, adults, couples, and families across a wide range of psychological presentations.
              </Text>

              <Text color="gray.500" lineHeight="tall" fontSize="sm">
                Having conducted thousands of hours of psychotherapy, he integrates evidence-based approaches including Cognitive Behaviour Therapy (CBT), Dialectical Behaviour Therapy (DBT), Acceptance and Commitment Therapy (ACT), Solution-Focused Brief Therapy (SFBT), mindfulness-based interventions, and trauma-informed practice.
              </Text>

              <Text color="gray.500" lineHeight="tall" fontSize="sm">
                Alongside his clinical work, Ahmed has extensive experience mentoring and supervising psychologists and postgraduate trainees. His supervision focuses on strengthening clinical reasoning, therapist identity, ethical decision-making, reflective practice, and confidence in therapeutic work.
              </Text>

              <SimpleGrid columns={2} spacing={3} pt={4} w="full">
                <HStack align="start" spacing={2}>
                  <Icon as={FiCheck} color="teal.500" mt={1} />
                  <Text fontSize="xs" fontWeight="700" color="gray.700">Member of APA</Text>
                </HStack>
                <HStack align="start" spacing={2}>
                  <Icon as={FiCheck} color="teal.500" mt={1} />
                  <Text fontSize="xs" fontWeight="700" color="gray.700">Member of CCI</Text>
                </HStack>
                <HStack align="start" spacing={2}>
                  <Icon as={FiCheck} color="teal.500" mt={1} />
                  <Text fontSize="xs" fontWeight="700" color="gray.700">5+ Years Clinical Experience</Text>
                </HStack>
                <HStack align="start" spacing={2}>
                  <Icon as={FiCheck} color="teal.500" mt={1} />
                  <Text fontSize="xs" fontWeight="700" color="gray.700">Trauma-Informed Practice</Text>
                </HStack>
              </SimpleGrid>
            </VStack>

          </Stack>
        </Container>
      </Box>

      {/* 💳 COHORT PRICING */}
      <Box py={{ base: 20, md: 32 }} bg="#F9FAF9" borderY="1px solid" borderColor="gray.100">
        <Container maxW="3xl">
          <VStack spacing={12} align="stretch" textAlign="center">
            
            <VStack spacing={4}>
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">PRICING</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Founding Cohort Investment</Heading>
              <Text fontSize="md" color="gray.500">Premium formation supervision at a founding entry rate.</Text>
            </VStack>

            <Box bg="white" borderRadius="3xl" border="1px solid" borderColor="teal.100" p={{ base: 8, md: 12 }} shadow="xl" position="relative" overflow="hidden">
              <Box position="absolute" top={0} left={0} right={0} h="6px" bg="mlc.gold" />
              
              <VStack spacing={6}>
                <Badge colorScheme="teal" fontSize="sm" px={4} py={1.5} borderRadius="full">FOUNDING RATE</Badge>
                
                <HStack spacing={4} align="baseline" justify="center">
                  <Heading fontSize={{ base: "4xl", md: "6xl" }} color="teal.900" fontFamily="'Forum', serif">₹12,999</Heading>
                  <Text textDecoration="line-through" color="gray.400" fontSize="lg">₹14,999</Text>
                </HStack>
                
                <Text color="gray.600" fontSize="sm" maxW="md">
                  For the complete 12-week closed cohort programme including all live sessions, templates, and certificate.
                </Text>

                <Box bg="teal.50" p={4} borderRadius="xl" border="1px solid" borderColor="teal.100" w="full">
                  <Text fontSize="xs" fontWeight="700" color="teal.800">
                    ✦ Founding members receive lifetime recognition as the first MLC Clinical Supervision Cohort.
                  </Text>
                </Box>

                <Divider borderColor="gray.100" py={2} />

                <HStack spacing={6} justify="center" w="full" fontSize="sm" color="gray.600" fontWeight="600">
                  <HStack spacing={2}><Icon as={FiCheck} color="teal.600" /><Text>Flexible Payments Available</Text></HStack>
                  <HStack spacing={2}><Icon as={FiCheck} color="teal.600" /><Text>No-Cost EMI Options</Text></HStack>
                </HStack>
              </VStack>
            </Box>

          </VStack>
        </Container>
      </Box>

      {/* 🚀 APPLICATION PROCESS */}
      <Box py={{ base: 20, md: 32 }} bg="white">
        <Container maxW="5xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" maxW="2xl">
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">PROCESS</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Application Steps</Heading>
              <Text fontSize="md" color="gray.500">How to secure your place in the Founding Cohort.</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} w="full">
              {[
                { step: "1", title: "Submit Application", desc: "Fill out our quick clinical eligibility application form." },
                { step: "2", title: "Review & Match", desc: "Our team reviews details to match a cohesive cohort." },
                { step: "3", title: "Confirmation", desc: "Selected applicants receive confirmation & payment links." },
                { step: "4", title: "Supervision Begins", desc: "Begin your 12-week formation journey." }
              ].map((step, i) => (
                <VStack key={i} align="start" spacing={4} position="relative" p={6} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                  <Circle size="36px" bg="teal.800" color="white" fontWeight="800" fontSize="sm">{step.step}</Circle>
                  <Heading size="xs" fontFamily="'Forum', serif" color="teal.900" fontWeight="700">{step.title}</Heading>
                  <Text fontSize="xs" color="gray.500" lineHeight="relaxed">{step.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>

            <Box bg="orange.50" p={6} borderRadius="2xl" border="1px solid" borderColor="orange.150" maxW="3xl">
              <HStack spacing={3} align="start">
                <Icon as={FiInfo} color="orange.600" mt={1} />
                <Box>
                  <Text fontWeight="800" fontSize="xs" color="orange.800" letterSpacing="1px">IMPORTANT ADMISSION NOTE</Text>
                  <Text fontSize="xs" color="gray.700" mt={1}>
                    Submitting an application does <strong>not</strong> guarantee admission into the cohort. As places are intentionally limited to maintain a high-quality supervision experience, applications are carefully reviewed. If a place is not available, suitable applicants may be offered priority consideration for future cohorts.
                  </Text>
                </Box>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box bg="#F9FAF9" py={{ base: 20, md: 32 }} borderY="1px solid" borderColor="gray.150">
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="teal" px={3} py={1} borderRadius="full">ANSWERS</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Frequently Asked Questions</Heading>
              <Text color="gray.500">Everything you need to know about the supervision cohort.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "Is this therapy?", a: "No. This is professional clinical supervision and therapist formation. It focuses on your professional development, case formulation skills, and boundary management rather than personal therapy." },
                { q: "Is this only for psychologists?", a: "It is designed primarily for counselling psychologists, clinical psychologists, and therapists with appropriate postgraduate mental health training." },
                { q: "Can students join?", a: "Only students currently enrolled in a Master's programme in Psychology (or a related field) who are actively doing clinical internships may apply." },
                { q: "Do I need clients already?", a: "No. The programme is designed to prepare you for clinical practice. We discuss case conceptualisation frameworks that apply even if you are just starting out." },
                { q: "Will sessions be recorded?", a: "No. To maintain strict clinical confidentiality and encourage open, vulnerable group discussion, sessions are never recorded." },
                { q: "Can I miss sessions?", a: "Attendance is strongly encouraged as the group is a closed cohort. Active discussion and dynamic trust-building are central to the 12-week experience." },
                { q: "Is this case consultation?", a: "Partly. While real cases are conceptualised, the primary emphasis is on therapist identity formation, reflective practice, and building clinical logic rather than simple transactional case troubleshooting." }
              ].map((item, i) => (
                <AccordionItem key={i} border="none" mb={4} bg="white" borderRadius="2xl" overflow="hidden" shadow="sm">
                  <AccordionButton py={6} _hover={{ bg: "teal.50" }}>
                    <Box flex="1" textAlign="left" fontWeight="700" color="teal.900">
                      {item.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall" fontSize="sm">
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* 🚀 FINAL CTA SECTION */}
      <Box bg="teal.800" py={24} color="white" textAlign="center" position="relative" overflow="hidden">
        <Circle position="absolute" top="-10%" right="-10%" size="400px" bg="whiteAlpha.50" filter="blur(80px)" />
        <Container maxW="4xl" position="relative" zIndex={2}>
          <VStack spacing={8}>
            <Heading size="2xl" fontFamily="'Forum', serif">Ready to Grow Beyond Techniques?</Heading>
            <Text fontSize="lg" color="whiteAlpha.800" maxW="2xl" mx="auto">
              Develop the confidence, clarity, and clinical thinking needed to become the therapist your clients deserve.
            </Text>
            <Button 
              as="a" 
              href="https://forms.cloud.microsoft/r/KimhSxTk25" 
              target="_blank"
              rel="noopener noreferrer"
              size="xl" 
              bg="mlc.gold" 
              color="teal.900" 
              h="64px" 
              px={12} 
              borderRadius="full" 
              fontWeight="800"
              _hover={{ transform: "scale(1.05)", bg: "white", textDecoration: "none" }}
              transition="all 0.3s"
            >
              Apply for the Founding Cohort
            </Button>
          </VStack>
        </Container>
      </Box>

    </Box>
  );
}
