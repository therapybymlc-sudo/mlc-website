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
      <Box position="relative" minH={{ base: "100vh", lg: "95vh" }} bg="teal.900" display="flex" alignItems="center" py={20} overflow="hidden">
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
          bgGradient="linear(to-b, rgba(20, 54, 48, 0.7), teal.900)"
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
          bg="teal.400"
          filter="blur(150px)"
          opacity="0.1"
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <Container maxW="7xl" position="relative" zIndex={10}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: 12, lg: 16 }} align="center" justify="space-between">
            
            {/* Hero Text */}
            <MotionVStack 
              align="start" 
              spacing={8} 
              flex="1"
              maxW={{ base: "100%", lg: "600px" }}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <MotionBox variants={fadeInUp}>
                <HStack spacing={4} bg="rgba(255,255,255,0.05)" p={2} pr={6} borderRadius="full" border="1px solid" borderColor="whiteAlpha.200">
                  <Badge bg="mlc.gold" color="teal.900" px={4} py={1.5} borderRadius="full" fontSize="xs" fontWeight="900" letterSpacing="1px">
                    THE MLC BLUEPRINT
                  </Badge>
                  <Text color="whiteAlpha.800" fontWeight="600" fontSize="sm" letterSpacing="1px">A Unified Infrastructure</Text>
                </HStack>
              </MotionBox>
              
              <MotionBox variants={fadeInUp}>
                <Heading 
                  fontSize={{ base: "5xl", md: "7xl", xl: "8xl" }} 
                  fontFamily="'Forum', serif" 
                  color="white" 
                  lineHeight="1.05"
                  letterSpacing="-1px"
                >
                  Welcome to the <br />
                  <chakra.span color="mlc.gold" position="relative">
                    Ecosystem.
                    <Box position="absolute" bottom="10%" left="0" w="100%" h="30%" bg="mlc.gold" opacity="0.2" zIndex="-1" />
                  </chakra.span>
                </Heading>
              </MotionBox>
              
              <MotionBox variants={fadeInUp}>
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  color="whiteAlpha.800" 
                  fontFamily="'Inter', sans-serif"
                  lineHeight="1.8"
                  fontWeight="400"
                >
                  We are not a disjointed marketplace. We are India's first fully integrated therapeutic infrastructure where clients heal, therapists practice, and supervisors mentor—all in one seamlessly connected environment.
                </Text>
              </MotionBox>
              
              <MotionBox variants={fadeInUp} w="full">
                <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={6} w="full">
                  <Button 
                    as={NextLink} 
                    href="/therapists/discovery" 
                    size="xl" 
                    bg="mlc.gold" 
                    color="teal.900" 
                    h="60px" 
                    px={10} 
                    borderRadius="full" 
                    fontWeight="700"
                    fontSize="16px"
                    _hover={{ bg: "white", transform: "translateY(-2px)", shadow: "xl" }}
                    transition="all 0.3s"
                  >
                    Find Your Therapist
                  </Button>
                  <Button 
                    as={NextLink} 
                    href="/signup/therapist" 
                    size="xl" 
                    variant="outline" 
                    color="white" 
                    borderColor="whiteAlpha.400"
                    h="60px" 
                    px={10} 
                    borderRadius="full"
                    fontWeight="600"
                    fontSize="16px"
                    _hover={{ bg: "whiteAlpha.100", borderColor: "white" }}
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
              <Box position="relative" w="500px" h="500px">
                {/* Central Hub */}
                <Circle position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" size="140px" bg="teal.800" border="2px solid" borderColor="mlc.gold" shadow="2xl" zIndex={5}>
                  <VStack spacing={1}>
                    <Image src="/logo_tra.png" alt="MLC" boxSize="40px" filter="brightness(0) invert(1)" />
                    <Text color="mlc.gold" fontWeight="800" fontSize="10px" letterSpacing="1px">THE CORE</Text>
                  </VStack>
                </Circle>

                {/* Orbiting Nodes */}
                <EcosystemNode icon={FiHeart} label="Clients" angle={0} color="#38B2AC" delay={0} />
                <EcosystemNode icon={FiLayers} label="Therapists" angle={120} color="#63B3ED" delay={0.2} />
                <EcosystemNode icon={FiShield} label="Supervisors" angle={240} color="#C9A960" delay={0.4} />

                {/* Connecting Lines */}
                <svg position="absolute" top="0" left="0" width="500" height="500" style={{ pointerEvents: 'none' }}>
                  <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />
                  <circle cx="250" cy="250" r="110" fill="none" stroke="rgba(201,169,96,0.3)" strokeWidth="1" />
                </svg>
              </Box>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      {/* 🔄 THE PROBLEM: MARKETPLACE VS ECOSYSTEM */}
      <Box py={{ base: 20, lg: 32 }} bg="white" position="relative">
        <Container maxW="7xl">
          <MotionVStack 
            spacing={20}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
              <Badge colorScheme="teal" px={4} py={1} borderRadius="full">THE PARADIGM SHIFT</Badge>
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Why an Ecosystem?</Heading>
              <Text fontSize="lg" color="gray.600" lineHeight="tall">
                Most platforms operate as "Marketplaces"—they introduce a client to a therapist and then step away. This leaves clients unsupported between sessions and therapists isolated in their practice. 
                <br/><br/>
                MLC is building a <strong>Connected Ecosystem</strong> that surrounds you with integrated tools, community, and clinical oversight at every touchpoint.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} w="full">
              {/* Marketplace Card */}
              <MotionBox variants={fadeInUp}>
                <VStack align="start" p={{ base: 8, md: 12 }} bg="gray.50" borderRadius="3xl" spacing={8} border="1px solid" borderColor="gray.200" h="full">
                  <HStack w="full" justify="space-between">
                    <Badge colorScheme="red" px={4} py={1} borderRadius="full">THE MARKETPLACE MODEL</Badge>
                    <Icon as={FiZap} color="red.400" boxSize={6} opacity={0.5} />
                  </HStack>
                  <Heading size="xl" fontFamily="'Forum', serif" color="gray.800">Fragmented Care</Heading>
                  <VStack align="start" spacing={5} w="full" pt={4}>
                    {[
                      { title: "Random Matching", desc: "Algorithms match based on availability, not clinical compatibility." },
                      { title: "No Clinical Oversight", desc: "Therapists practice in isolation without senior mentorship." },
                      { title: "Scattered Resources", desc: "Clients have to find their own journals and assessment tools elsewhere." },
                      { title: "Transactional", desc: "The platform only cares about booking the next appointment." }
                    ].map((item, i) => (
                      <HStack key={i} spacing={4} align="start">
                        <Circle size="8px" bg="red.400" mt={2} />
                        <Box>
                          <Text fontWeight="700" color="gray.800">{item.title}</Text>
                          <Text fontSize="sm" color="gray.600">{item.desc}</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </MotionBox>

              {/* Ecosystem Card */}
              <MotionBox variants={fadeInUp}>
                <VStack align="start" p={{ base: 8, md: 12 }} bg="teal.900" color="white" borderRadius="3xl" spacing={8} shadow="2xl" position="relative" overflow="hidden" h="full">
                  <Box position="absolute" top="-20%" right="-10%" w="300px" h="300px" bg="mlc.gold" filter="blur(100px)" opacity="0.15" />
                  
                  <HStack w="full" justify="space-between" zIndex={2}>
                    <Badge bg="mlc.gold" color="teal.900" px={4} py={1} borderRadius="full">THE MLC ECOSYSTEM</Badge>
                    <Icon as={FiCheckCircle} color="mlc.gold" boxSize={6} />
                  </HStack>
                  <Heading size="xl" fontFamily="'Forum', serif" zIndex={2}>Integrated Infrastructure</Heading>
                  <VStack align="start" spacing={5} w="full" pt={4} zIndex={2}>
                    {[
                      { title: "Curated Clinical Matching", desc: "Evidence-based triage connects clients to the right expertise." },
                      { title: "Supervised Quality Control", desc: "Every junior therapist is backed by a vetted clinical supervisor." },
                      { title: "Centralized Care Tools", desc: "Built-in journaling, PHQ-9 assessments, and feelings wheels." },
                      { title: "Community-Led Growth", desc: "Workshops and peer circles prevent burnout and foster excellence." }
                    ].map((item, i) => (
                      <HStack key={i} spacing={4} align="start">
                        <Circle size="8px" bg="mlc.gold" mt={2} />
                        <Box>
                          <Text fontWeight="700" color="white">{item.title}</Text>
                          <Text fontSize="sm" color="whiteAlpha.800">{item.desc}</Text>
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
      <Box py={{ base: 20, lg: 32 }} bg="#F9FAF9" borderTop="1px solid" borderColor="gray.100">
        <Container maxW="7xl">
          <VStack spacing={20}>
            <VStack spacing={6} textAlign="center" maxW="3xl">
              <Heading size="3xl" fontFamily="'Forum', serif" color="teal.900">Explore the Platform</Heading>
              <Text fontSize="xl" color="gray.600">
                A guided tour of everything we provide to ensure you never have to navigate mental health alone.
              </Text>
            </VStack>

            <VStack spacing={{ base: 12, lg: 24 }} w="full">
              {/* Feature 1: The Client Journey */}
              <EcosystemFeatureRow 
                direction="row"
                badge="FOR CLIENTS"
                title="A Safe Space to Heal."
                description="We provide a secure, personalized portal where your entire therapeutic journey is mapped out. From finding the perfect therapist to tracking your progress between sessions."
                links={[
                  { label: "Find a Therapist", href: "/therapists/discovery" },
                  { label: "View Our Services", href: "/services" },
                  { label: "Take the PHQ-9 Assessment", href: "/dashboard/client/resources" }
                ]}
                image="/images/client_line.png"
                fallbackIcon={FiHeart}
                color="teal.500"
              />

              <Divider borderColor="gray.200" />

              {/* Feature 2: Interactive Tools */}
              <EcosystemFeatureRow 
                direction="row-reverse"
                badge="CLINICAL TOOLS"
                title="Resources at Your Fingertips."
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
                title="Practice with Excellence."
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
                title="Raising the Standard of Care."
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
      <Box py={{ base: 20, lg: 32 }} bg="teal.900" color="white" position="relative" overflow="hidden">
        <Box position="absolute" inset={0} bgImage="radial-gradient(circle at 80% 20%, rgba(201, 169, 96, 0.15), transparent 50%)" />
        <Container maxW="7xl" position="relative" zIndex={2}>
          <Stack direction={{ base: "column", lg: "row" }} spacing={20} align="center">
            <MotionBox 
              flex="1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box position="relative" borderRadius="3xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="whiteAlpha.200">
                <Box position="absolute" inset={0} bg="teal.900" opacity="0.4" mixBlendMode="multiply" />
                <Image 
                  src="/images/tech_line.png" 
                  alt="Technology for health"
                  w="100%"
                  h={{ base: "300px", md: "500px" }}
                  objectFit="contain"
                  p={10}
                />
                <Box position="absolute" bottom="0" left="0" w="100%" p={8} bgGradient="linear(to-t, teal.900, transparent)">
                  <HStack spacing={4}>
                    <Icon as={FiCpu} color="mlc.gold" boxSize={8} />
                    <Heading size="md" fontFamily="'Forum', serif">HIPAA Compliant Infrastructure</Heading>
                  </HStack>
                </Box>
              </Box>
            </MotionBox>

            <VStack flex="1.2" align="start" spacing={10}>
              <VStack align="start" spacing={4}>
                <Badge bg="mlc.gold" color="teal.900" px={3} py={1} borderRadius="full">THE ENGINE</Badge>
                <Heading size="3xl" fontFamily="'Forum', serif" lineHeight="1.2">Built for Humans, <br />Powered by Tech.</Heading>
              </VStack>
              <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall">
                We've built a custom clinical engine from the ground up. It’s designed to disappear into the background so you can focus entirely on the healing process.
              </Text>
              
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={10} w="full">
                <Box bg="whiteAlpha.50" p={6} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Icon as={FiShield} color="mlc.gold" boxSize={6} mb={4} />
                  <Heading size="md" mb={2} color="white">100% Private</Heading>
                  <Text fontSize="sm" color="whiteAlpha.600">Enterprise-grade security and encryption for every message, journal entry, and session note.</Text>
                </Box>
                <Box bg="whiteAlpha.50" p={6} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Icon as={FiCpu} color="mlc.gold" boxSize={6} mb={4} />
                  <Heading size="md" mb={2} color="white">Clinical Logic</Heading>
                  <Text fontSize="sm" color="whiteAlpha.600">Smart algorithms process assessments to highlight risk factors and track clinical progress dynamically.</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Stack>
        </Container>
      </Box>

      {/* 🚀 GRAND CTA */}
      <Box py={32} bg="white" textAlign="center">
        <Container maxW="4xl">
          <MotionVStack 
            spacing={10}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900" lineHeight="1.3">
              Step Into the Ecosystem.
            </Heading>
            <Text color="gray.600" fontSize="xl" maxW="2xl">
              Whether you are seeking support, or providing it, there is a place for you in the MLC community.
            </Text>
            
            <Stack direction={{ base: "column", sm: "row" }} spacing={6} pt={4} justify="center" w="full">
              <Button 
                as={NextLink} 
                href="/therapists/discovery" 
                size="xl" 
                bg="teal.800" 
                color="white" 
                h="64px" 
                px={12} 
                borderRadius="full" 
                fontWeight="700"
                _hover={{ bg: "teal.900", transform: "translateY(-2px)", shadow: "xl" }}
                transition="all 0.3s"
              >
                Find a Therapist
              </Button>
              <Button 
                as={NextLink} 
                href="/signup/therapist" 
                size="xl" 
                bg="white" 
                color="teal.800" 
                border="2px solid"
                borderColor="teal.800"
                h="64px" 
                px={12} 
                borderRadius="full" 
                fontWeight="700"
                _hover={{ bg: "gray.50", transform: "translateY(-2px)", shadow: "md" }}
                transition="all 0.3s"
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
        <VStack flex="1" align="start" spacing={6} maxW="lg">
          <Badge bg={`${color}15`} color={color} px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="800">
            {badge}
          </Badge>
          <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">{title}</Heading>
          <Text fontSize="lg" color="gray.600" lineHeight="tall">{description}</Text>
          
          <VStack align="start" spacing={4} pt={4} w="full">
            {links.map((link, i) => (
              <NextLink key={i} href={link.href} passHref>
                <HStack 
                  role="group" 
                  cursor="pointer" 
                  p={3} 
                  bg="white" 
                  w="full" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="gray.100"
                  _hover={{ borderColor: color, shadow: "sm" }}
                  transition="all 0.2s"
                >
                  <Circle size="32px" bg={`${color}10`} color={color} _groupHover={{ bg: color, color: "white" }} transition="all 0.2s">
                    <Icon as={FiLink} boxSize={3} />
                  </Circle>
                  <Text fontWeight="600" color="gray.700" _groupHover={{ color: color }} transition="all 0.2s">
                    {link.label}
                  </Text>
                  <Box flex="1" />
                  <Icon as={FiArrowRight} color="gray.300" _groupHover={{ color: color, transform: "translateX(4px)" }} transition="all 0.2s" />
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
            borderRadius="3xl" 
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
