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
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiGlobe, FiLayers, FiUsers, FiCpu, FiShield, 
  FiArrowRight, FiActivity, FiZap, FiTarget, FiCheckCircle,
  FiBookOpen, FiHeart, FiLink, FiMap
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionFlex = motion(Flex);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function EcosystemClient() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden" w="100%">
      {/* 🌌 HERO SECTION - THE GRAND REVEAL */}
      <Box position="relative" minH={{ base: "auto", lg: "85vh" }} bg="#263A33" display="flex" alignItems="center" pt={{ base: 10, md: 14 }} pb={{ base: 12, md: 16 }} overflow="hidden">
        {/* Background Effects */}
        <Box 
          position="absolute" 
          inset={0} 
          bgImage="url('/therapy_ecosystem_hero.png')" 
          bgSize="cover" 
          bgPosition="center" 
          opacity="0.25"
          filter="grayscale(30%) brightness(0.8)"
        />
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="linear(to-b, rgba(20, 54, 48, 0.7), #263A33)"
        />
        {/* Animated Orbs */}
        <MotionBox
          position="absolute"
          top="10%"
          left="10%"
          w="400px"
          h="400px"
          bg="#C9A960"
          filter="blur(150px)"
          opacity="0.15"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <MotionBox
          position="absolute"
          bottom="10%"
          right="10%"
          w="500px"
          h="500px"
          bg="#A9CBB7"
          filter="blur(150px)"
          opacity="0.1"
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <Container maxW="6xl" position="relative" zIndex={10}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 10, lg: 16 }} align="center" justify="space-between">
            
            {/* Hero Text */}
            <MotionVStack 
              align="start" 
              spacing={5} 
              flex="1"
              maxW={{ base: "100%", lg: "600px" }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <MotionBox variants={fadeInUp}>
                <HStack spacing={3} bg="rgba(255,255,255,0.05)" p={1.5} pr={5} borderRadius="full" border="1px solid" borderColor="whiteAlpha.200">
                  <Badge bg="mlc.gold" color="#263A33" px={3.5} py={1} borderRadius="full" fontSize="xs" fontWeight="900" letterSpacing="1px">
                    THE MLC BLUEPRINT
                  </Badge>
                  <Text color="whiteAlpha.800" fontWeight="600" fontSize="xs" letterSpacing="0.05em">A Unified Infrastructure</Text>
                </HStack>
              </MotionBox>
              
              <MotionBox variants={fadeInUp}>
                <Heading 
                  fontSize={{ base: "32px", md: "44px", lg: "52px" }} 
                  fontFamily="'Playfair Display', var(--font-playfair), serif" 
                  color="white" 
                  lineHeight="1.15"
                  fontWeight="600"
                >
                  Welcome to the <br />
                  <chakra.span color="mlc.gold" position="relative">
                    Ecosystem
                    <Box position="absolute" bottom="8%" left="0" w="100%" h="3px" bg="mlc.gold" opacity="0.3" zIndex="-1" />
                  </chakra.span>
                </Heading>
              </MotionBox>
              
              <MotionBox variants={fadeInUp}>
                <Text 
                  fontSize={{ base: "15px", md: "16.5px" }} 
                  color="whiteAlpha.800" 
                  fontFamily="'Inter', sans-serif"
                  lineHeight="1.75"
                  fontWeight="400"
                  maxW="520px"
                >
                  We are not a disjointed marketplace. We are India's first fully integrated therapeutic infrastructure where clients heal, therapists practice, and supervisors mentor, all in one seamlessly connected environment.
                </Text>
              </MotionBox>
              
              <MotionBox variants={fadeInUp} w="full">
                <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} pt={2} w="full">
                  <Button 
                    as={NextLink} 
                    href="/therapists/discovery" 
                    size="md" 
                    bg="mlc.gold" 
                    color="#263A33" 
                    h="48px" 
                    px={8} 
                    borderRadius="full" 
                    fontWeight="700"
                    fontSize="14px"
                    _hover={{ bg: "white", transform: "translateY(-1px)", shadow: "lg" }}
                    transition="all 0.2s ease"
                    rightIcon={<FiArrowRight />}
                  >
                    Find Your Therapist
                  </Button>
                  <Button 
                    as={NextLink} 
                    href="/signup/therapist" 
                    size="md" 
                    variant="outline" 
                    color="white" 
                    borderColor="whiteAlpha.400"
                    h="48px" 
                    px={8} 
                    borderRadius="full"
                    fontWeight="600"
                    fontSize="14px"
                    _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
                    transition="all 0.2s ease"
                  >
                    Join as a Practitioner
                  </Button>
                </Stack>
              </MotionBox>
            </MotionVStack>

            {/* Hero Visual Map */}
            <MotionBox 
              flex="1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              display={{ base: "none", lg: "flex" }}
              justifyContent="center"
              alignItems="center"
              position="relative"
            >
              <Box position="relative" w="460px" h="460px">
                {/* Central Hub */}
                <Circle position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" size="130px" bg="#56756D" border="2px solid" borderColor="mlc.gold" shadow="2xl" zIndex={5}>
                  <VStack spacing={1}>
                    <Image src="/logo_tra.png" alt="MLC" boxSize="36px" filter="brightness(0) invert(1)" />
                    <Text color="mlc.gold" fontWeight="800" fontSize="10px" letterSpacing="1px">THE CORE</Text>
                  </VStack>
                </Circle>

                {/* Orbiting Nodes */}
                <EcosystemNode icon={FiHeart} label="Clients" angle={0} color="#38B2AC" delay={0} />
                <EcosystemNode icon={FiLayers} label="Therapists" angle={120} color="#63B3ED" delay={0.2} />
                <EcosystemNode icon={FiShield} label="Supervisors" angle={240} color="#C9A960" delay={0.4} />

                {/* Connecting Lines */}
                <svg position="absolute" top="0" left="0" width="460" height="460" style={{ pointerEvents: 'none' }}>
                  <circle cx="230" cy="230" r="160" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                  <circle cx="230" cy="230" r="100" fill="none" stroke="rgba(201,169,96,0.3)" strokeWidth="1" />
                </svg>
              </Box>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* 🔄 THE PROBLEM: MARKETPLACE VS ECOSYSTEM */}
      <Box py={{ base: 12, md: 16 }} bg="white" position="relative">
        <Container maxW="6xl">
          <MotionVStack 
            spacing={10}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <VStack spacing={3} textAlign="center" maxW="3xl" mx="auto">
              <Badge colorScheme="green" px={3.5} py={1} borderRadius="full" fontSize="xs">THE PARADIGM SHIFT</Badge>
              <Heading fontSize={{ base: "26px", md: "34px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600">Why an Ecosystem?</Heading>
              <Text fontSize="15px" color="rgba(46,46,46,0.75)" lineHeight="1.75">
                Most platforms operate as marketplaces: they introduce a client to a therapist and then step away. This leaves clients unsupported between sessions and therapists isolated in their practice. 
                <br/><br/>
                MLC is building a <strong>Connected Ecosystem</strong> that surrounds you with integrated tools, community, and clinical oversight at every touchpoint.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} w="full">
              {/* Marketplace Card */}
              <MotionBox variants={fadeInUp}>
                <VStack align="start" p={{ base: 6, md: 8 }} bg="gray.50" borderRadius="2xl" spacing={5} border="1px solid" borderColor="gray.200" h="full">
                  <HStack w="full" justify="space-between">
                    <Badge colorScheme="red" px={3} py={1} borderRadius="full" fontSize="11px">THE MARKETPLACE MODEL</Badge>
                    <Icon as={FiZap} color="red.400" boxSize={5} opacity={0.5} />
                  </HStack>
                  <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="gray.800">Fragmented Care</Heading>
                  <VStack align="start" spacing={4} w="full" pt={2}>
                    {[
                      { title: "Random Matching", desc: "Algorithms match based on availability, not clinical compatibility." },
                      { title: "No Clinical Oversight", desc: "Therapists practice in isolation without senior mentorship." },
                      { title: "Scattered Resources", desc: "Clients have to find their own journals and assessment tools elsewhere." },
                      { title: "Transactional", desc: "The platform only cares about booking the next appointment." }
                    ].map((item, i) => (
                      <HStack key={i} spacing={3.5} align="start">
                        <Circle size="6px" bg="red.400" mt={2} />
                        <Box>
                          <Text fontWeight="700" fontSize="14px" color="gray.800">{item.title}</Text>
                          <Text fontSize="13px" color="rgba(46,46,46,0.75)" lineHeight="1.5">{item.desc}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </MotionBox>

              {/* Ecosystem Card */}
              <MotionBox variants={fadeInUp}>
                <VStack align="start" p={{ base: 6, md: 8 }} bg="#263A33" color="white" borderRadius="2xl" spacing={5} shadow="xl" position="relative" overflow="hidden" h="full">
                  <Box position="absolute" top="-20%" right="-10%" w="300px" h="300px" bg="mlc.gold" filter="blur(100px)" opacity="0.15" />
                  
                  <HStack w="full" justify="space-between" zIndex={2}>
                    <Badge bg="mlc.gold" color="#263A33" px={3} py={1} borderRadius="full" fontSize="11px">THE MLC ECOSYSTEM</Badge>
                    <Icon as={FiCheckCircle} color="mlc.gold" boxSize={5} />
                  </HStack>
                  <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="white" zIndex={2}>Integrated Infrastructure</Heading>
                  <VStack align="start" spacing={4} w="full" pt={2} zIndex={2}>
                    {[
                      { title: "Curated Clinical Matching", desc: "Evidence-based triage connects clients to the right expertise." },
                      { title: "Supervised Quality Control", desc: "Every junior therapist is backed by a vetted clinical supervisor." },
                      { title: "Centralized Care Tools", desc: "Built-in journaling, PHQ-9 assessments, and feelings wheels." },
                      { title: "Community-Led Growth", desc: "Workshops and peer circles prevent burnout and foster excellence." }
                    ].map((item, i) => (
                      <HStack key={i} spacing={3.5} align="start">
                        <Circle size="6px" bg="mlc.gold" mt={2} />
                        <Box>
                          <Text fontWeight="700" fontSize="14px" color="white">{item.title}</Text>
                          <Text fontSize="13px" color="whiteAlpha.800" lineHeight="1.5">{item.desc}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </MotionBox>
            </SimpleGrid>
          </MotionVStack>
        </Container>
      </Box>

      {/* 🧭 NAVIGATING THE ECOSYSTEM - GRAND TOUR */}
      <Box py={{ base: 12, md: 16 }} bg="#F9FAF9" borderTop="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <VStack spacing={12}>
            <VStack spacing={2.5} textAlign="center" maxW="3xl">
              <Heading fontSize={{ base: "26px", md: "34px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600">Explore the Platform</Heading>
              <Text fontSize="15px" color="rgba(46,46,46,0.75)">
                A guided tour of everything we provide to ensure you never have to navigate mental health alone.
              </Text>
            </VStack>

            <VStack spacing={{ base: 10, lg: 12 }} w="full">
              {/* Feature 1: The Client Journey */}
              <EcosystemFeatureRow 
                direction="row"
                badge="FOR CLIENTS"
                title="A Safe Space to Heal"
                description="We provide a secure, personalized portal where your entire therapeutic journey is mapped out. From finding the perfect therapist to tracking your progress between sessions."
                links={[
                  { label: "Find a Therapist", href: "/therapists/discovery" },
                  { label: "View Our Services", href: "/services" },
                  { label: "Take the PHQ-9 Assessment", href: "/dashboard/client/resources" }
                ]}
                image="/images/client_line.png"
                fallbackIcon={FiHeart}
                color="#6B8B7B"
              />

              <Divider borderColor="gray.200" />

              {/* Feature 2: Interactive Tools */}
              <EcosystemFeatureRow 
                direction="row-reverse"
                badge="CLINICAL TOOLS"
                title="Resources at Your Fingertips"
                description="Therapy doesn't stop when the session ends. Our ecosystem is packed with interactive tools to help you articulate your emotions, track your mood, and reflect deeply."
                links={[
                  { label: "Explore the Feelings Wheel", href: "/feelings-wheel" },
                  { label: "Read Mental Health Guides", href: "/blog" },
                  { label: "Access the Journal (Client Portal)", href: "/login" }
                ]}
                image="/images/tools_line.png"
                fallbackIcon={FiActivity}
                color="mlc.gold"
              />

              <Divider borderColor="gray.200" />

              {/* Feature 3: The Therapist Network */}
              <EcosystemFeatureRow 
                direction="row"
                badge="FOR PRACTITIONERS"
                title="Practice with Excellence"
                description="We empower therapists with a world-class digital clinic. Manage your caseload with intelligent note-taking, access premium resources, and never practice in isolation again."
                links={[
                  { label: "Join the Collective", href: "/signup/therapist" },
                  { label: "Therapist Community", href: "/dashboard/therapist/community" },
                  { label: "Discover MLC Pro", href: "/dashboard/therapist/subscription" }
                ]}
                image="/images/practitioner_line.png"
                fallbackIcon={FiLayers}
                color="blue.500"
              />

              <Divider borderColor="gray.200" />

              {/* Feature 4: Supervision & Standards */}
              <EcosystemFeatureRow 
                direction="row-reverse"
                badge="CLINICAL OVERSIGHT"
                title="Raising the Standard of Care"
                description="Quality control is built into the foundation. We connect junior therapists with vetted, senior clinical supervisors to ensure every client receives ethical, evidence-based care."
                links={[
                  { label: "Find a Supervisor", href: "/therapists/supervisors/directory" },
                  { label: "Learn about Clinical Supervision", href: "/supervision" },
                  { label: "Join Workshops & Circles", href: "/workshops" }
                ]}
                image="/images/supervision_line.png"
                fallbackIcon={FiShield}
                color="purple.500"
              />
            </VStack>

          </VStack>
        </Container>
      </Box>

      {/* 🛡️ THE TECHNOLOGY LAYER */}
      <Box py={{ base: 12, md: 16 }} bg="#263A33" color="white" position="relative" overflow="hidden">
        <Box position="absolute" inset={0} bgImage="radial-gradient(circle at 80% 20%, rgba(201, 169, 96, 0.15), transparent 50%)" />
        <Container maxW="6xl" position="relative" zIndex={2}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 10, lg: 16 }} align="center">
            <MotionBox 
              flex="1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box 
                position="relative" 
                borderRadius="28px" 
                overflow="hidden" 
                bg="linear-gradient(165deg, rgba(16, 38, 33, 0.98) 0%, rgba(9, 23, 20, 0.99) 100%)"
                border="1px solid" 
                borderColor="rgba(201, 169, 96, 0.28)"
                boxShadow="0 30px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
                transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                _hover={{
                  borderColor: "rgba(201, 169, 96, 0.45)",
                  boxShadow: "0 35px 70px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(201, 169, 96, 0.18)",
                  transform: "translateY(-3px)"
                }}
              >
                {/* 🌟 Top Status Bar */}
                <Flex
                  justify="space-between"
                  align="center"
                  px={{ base: 5, md: 7 }}
                  pt={{ base: 5, md: 6 }}
                  pb={2}
                  position="relative"
                  zIndex={3}
                >
                  <HStack
                    spacing={2.5}
                    bg="rgba(201, 169, 96, 0.08)"
                    border="1px solid rgba(201, 169, 96, 0.25)"
                    px={3}
                    py={1}
                    borderRadius="full"
                    backdropFilter="blur(8px)"
                  >
                    <Circle size="6px" bg="#48BB78" boxShadow="0 0 8px #48BB78" />
                    <Text
                      fontSize="10.5px"
                      fontWeight="700"
                      letterSpacing="0.1em"
                      color="#E6CA65"
                      textTransform="uppercase"
                    >
                      Clinical Privacy Protocol
                    </Text>
                  </HStack>

                  <HStack spacing={1.5} color="whiteAlpha.600">
                    <Icon as={FiShield} color="mlc.gold" boxSize={3.5} />
                    <Text fontSize="10.5px" fontWeight="600" letterSpacing="0.05em">
                      256-BIT ENCRYPTION
                    </Text>
                  </HStack>
                </Flex>

                {/* 🛡️ Center Visual with Ambient Glow */}
                <Box
                  position="relative"
                  w="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  py={{ base: 4, md: 5 }}
                  px={{ base: 5, md: 8 }}
                  minH={{ base: "240px", md: "320px" }}
                >
                  <Box
                    position="absolute"
                    w="240px"
                    h="240px"
                    borderRadius="full"
                    bg="radial-gradient(circle, rgba(201, 169, 96, 0.16) 0%, rgba(86, 117, 109, 0.12) 45%, transparent 70%)"
                    filter="blur(32px)"
                    pointerEvents="none"
                  />
                  <Box
                    position="absolute"
                    w="220px"
                    h="220px"
                    borderRadius="full"
                    border="1px dashed rgba(201, 169, 96, 0.15)"
                    pointerEvents="none"
                  />
                  <Box
                    position="absolute"
                    w="280px"
                    h="280px"
                    borderRadius="full"
                    border="1px solid rgba(86, 117, 109, 0.12)"
                    pointerEvents="none"
                  />

                  <MotionBox
                    animate={{ 
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    position="relative"
                    zIndex={2}
                    w="100%"
                    maxW={{ base: "200px", md: "260px" }}
                  >
                    <Image 
                      src="/images/tech_shield_gold.png" 
                      alt="HIPAA Compliant Security Shield"
                      w="100%"
                      h="auto"
                      objectFit="contain"
                      filter="drop-shadow(0 0 16px rgba(201, 169, 96, 0.3))"
                    />
                  </MotionBox>
                </Box>

                {/* 🔒 Integrated HIPAA Compliance Dock */}
                <Box
                  position="relative"
                  zIndex={3}
                  bg="rgba(11, 27, 23, 0.88)"
                  backdropFilter="blur(16px)"
                  borderTop="1px solid"
                  borderColor="rgba(201, 169, 96, 0.22)"
                  p={{ base: 4, md: 5 }}
                >
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    align={{ base: "start", sm: "center" }}
                    justify="space-between"
                    gap={3.5}
                  >
                    <HStack spacing={3.5} align="center">
                      <Box
                        p={2.5}
                        borderRadius="xl"
                        bg="linear-gradient(135deg, rgba(201, 169, 96, 0.2) 0%, rgba(201, 169, 96, 0.08) 100%)"
                        border="1px solid rgba(201, 169, 96, 0.4)"
                        boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
                        color="#E6CA65"
                        flexShrink={0}
                      >
                        <Icon as={FiShield} boxSize={5} />
                      </Box>
                      <VStack align="start" spacing={0.5}>
                        <Heading
                          as="h3"
                          fontSize={{ base: "md", md: "lg" }}
                          fontFamily="'Playfair Display', var(--font-playfair), serif"
                          color="#F7FAFC"
                          fontWeight="600"
                        >
                          HIPAA Compliant Infrastructure
                        </Heading>
                        <Text fontSize="xs" color="whiteAlpha.700" lineHeight="short">
                          Zero-knowledge encryption for notes, records, and client sessions
                        </Text>
                      </VStack>
                    </HStack>

                    <Badge
                      alignSelf={{ base: "flex-start", sm: "center" }}
                      bg="rgba(72, 187, 120, 0.12)"
                      color="#68D391"
                      border="1px solid rgba(72, 187, 120, 0.35)"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                      fontWeight="700"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      flexShrink={0}
                    >
                      <Icon as={FiCheckCircle} boxSize={3} />
                      Verified Shield
                    </Badge>
                  </Flex>
                </Box>
              </Box>
            </MotionBox>

            <VStack flex="1.2" align="start" spacing={6}>
              <VStack align="start" spacing={3}>
                <Badge bg="mlc.gold" color="#263A33" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700">THE ENGINE</Badge>
                <Heading fontSize={{ base: "26px", md: "36px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" lineHeight="1.2" fontWeight="600">Built for Humans, <br />Powered by Tech</Heading>
              </VStack>
              <Text fontSize="15px" color="whiteAlpha.800" lineHeight="1.75">
                We've built a custom clinical engine from the ground up. It’s designed to disappear into the background so you can focus entirely on the healing process.
              </Text>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} w="full">
                <Box bg="whiteAlpha.50" p={5} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Icon as={FiShield} color="mlc.gold" boxSize={5} mb={3} />
                  <Heading size="sm" mb={1.5} color="white" fontWeight="700">100% Private</Heading>
                  <Text fontSize="13px" color="whiteAlpha.600" lineHeight="1.5">Enterprise-grade security and encryption for every message, journal entry, and session note.</Text>
                </Box>
                <Box bg="whiteAlpha.50" p={5} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Icon as={FiCpu} color="mlc.gold" boxSize={5} mb={3} />
                  <Heading size="sm" mb={1.5} color="white" fontWeight="700">Clinical Logic</Heading>
                  <Text fontSize="13px" color="whiteAlpha.600" lineHeight="1.5">Smart algorithms process assessments to highlight risk factors and track clinical progress dynamically.</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* 🚀 GRAND CTA */}
      <Box py={{ base: 12, md: 16 }} bg="white" textAlign="center" borderTop="1px solid" borderColor="gray.100">
        <Container maxW="4xl">
          <MotionVStack 
            spacing={{ base: 6, md: 7 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={3}>
              <Heading fontSize={{ base: "26px", md: "32px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600" lineHeight="1.25">
                Step Into the Ecosystem
              </Heading>
              <Text 
                color="rgba(46,46,46,0.72)" 
                fontSize={{ base: "14.5px", md: "15px" }} 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                maxW="3xl"
                whiteSpace={{ md: "nowrap" }}
              >
                Whether you are seeking support, or providing it, there is a place for you in the MLC community.
              </Text>
            </VStack>
            
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="center" w="full">
              <Button 
                as={NextLink} 
                href="/therapists/discovery" 
                size="md" 
                bg="#56756D" 
                color="white" 
                h="46px" 
                px={8} 
                borderRadius="full" 
                fontWeight="700"
                fontSize="14px"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)", shadow: "md" }}
                transition="all 0.2s"
              >
                Find a Therapist
              </Button>
              <Button 
                as={NextLink} 
                href="/signup/therapist" 
                size="md" 
                bg="white" 
                color="#56756D" 
                border="1.5px solid" 
                borderColor="#56756D" 
                h="46px" 
                px={8} 
                borderRadius="full" 
                fontWeight="700" 
                fontSize="14px"
                _hover={{ bg: "gray.50", transform: "translateY(-1px)", shadow: "sm" }} 
                transition="all 0.2s" 
              >
                Join as a Therapist
              </Button>
            </Stack>
          </MotionVStack>
        </Container>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------
// Helper Components
// ----------------------------------------------------

function EcosystemNode({ icon, label, angle, color, delay }) {
  const radius = 180;
  // Convert angle to radians and calculate position
  const rad = (angle - 90) * (Math.PI / 180); // -90 to start from top
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
      }}
      zIndex={10}
    >
      <MotionBox
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 1, duration: 0.8, type: "spring" }}
      >
        <VStack spacing={3}>
          <Circle size="70px" bg="white" shadow="xl" border="2px solid" borderColor={color}>
            <Icon as={icon} color={color} boxSize={7} />
          </Circle>
          <Box bg="rgba(20, 54, 48, 0.9)" px={3} py={1} borderRadius="md" border="1px solid" borderColor="whiteAlpha.300">
            <Text color="white" fontSize="xs" fontWeight="700" letterSpacing="1px" textTransform="uppercase">{label}</Text>
          </Box>
        </VStack>
      </MotionBox>
    </Box>
  );
}

function EcosystemFeatureRow({ direction, badge, title, description, links, image, fallbackIcon, color }) {
  return (
    <MotionBox
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      w="full"
    >
      <Stack direction={{ base: "column", lg: direction }} spacing={{ base: 12, lg: 20 }} align="center" w="full">
        {/* Content Side */}
        <VStack flex="1" align="start" spacing={5} maxW="lg">
          <Badge 
            bg={`${color}15`} 
            color={color} 
            px={3} 
            py={1} 
            borderRadius="full" 
            fontSize="xs" 
            fontWeight="700"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            letterSpacing="0.05em"
          >
            {badge}
          </Badge>
          <Heading 
            fontSize={{ base: "26px", md: "32px" }} 
            fontFamily="'Playfair Display', var(--font-playfair), serif" 
            color="#263A33" 
            fontWeight="600"
            lineHeight="1.25"
          >
            {title}
          </Heading>
          <Text 
            fontSize={{ base: "14px", md: "15px" }} 
            fontFamily="'Inter', var(--font-inter), sans-serif" 
            color="rgba(46,46,46,0.72)" 
            lineHeight="1.7"
            letterSpacing="-0.01em"
          >
            {description}
          </Text>
          
          <VStack align="start" spacing={3} pt={2} w="full">
            {links.map((link, i) => (
              <NextLink key={i} href={link.href} passHref>
                <HStack 
                  role="group" 
                  cursor="pointer" 
                  py={2.5}
                  px={3.5} 
                  bg="#EDF3F0" 
                  w="full" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="rgba(86, 117, 109, 0.16)"
                  _hover={{ bg: "#E2ECE7", borderColor: color, shadow: "sm", transform: "translateX(3px)" }}
                  transition="all 0.2s ease"
                >
                  <Circle size="30px" bg="white" color={color} shadow="xs" _groupHover={{ bg: color, color: "white" }} transition="all 0.2s">
                    <Icon as={FiLink} boxSize={3} />
                  </Circle>
                  <Text 
                    fontSize={{ base: "13.5px", md: "14px" }}
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    fontWeight="500" 
                    color="#263A33" 
                    _groupHover={{ color: color }} 
                    transition="all 0.2s"
                  >
                    {link.label}
                  </Text>
                  <Box flex="1" />
                  <Icon as={FiArrowRight} boxSize={3.5} color="rgba(38, 58, 51, 0.45)" _groupHover={{ color: color, transform: "translateX(3px)" }} transition="all 0.2s" />
                </HStack>
              </NextLink>
            ))}
          </VStack>
        </VStack>

        {/* Visual Side */}
        <Box flex="1" w="full" display="flex" justifyContent={direction === "row" ? "flex-end" : "flex-start"}>
          <Box 
            w="full" 
            maxW="500px" 
            h={{ base: "300px", lg: "400px" }}
            bg={`${color}05`} 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor={`${color}20`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
            shadow="xl"
          >
            {/* Abstract Decorative Elements inside the box */}
            <Circle position="absolute" top="-10%" right="-10%" size="250px" bg={`${color}10`} filter="blur(40px)" />
            <Circle position="absolute" bottom="-10%" left="-10%" size="200px" bg={`${color}10`} filter="blur(40px)" />
            
            {image ? (
              <Image 
                src={image} 
                alt={title} 
                w="100%" 
                h="100%" 
                objectFit="contain" 
                zIndex={1} 
                p={8}
                mixBlendMode="multiply"
              />
            ) : (
              <Circle size="120px" bg="white" shadow="xl" border="2px solid" borderColor={`${color}30`} zIndex={1}>
                <Icon as={fallbackIcon} boxSize={12} color={color} />
              </Circle>
            )}
          </Box>
        </Box>
      </Stack>
    </MotionBox>
  );
}
