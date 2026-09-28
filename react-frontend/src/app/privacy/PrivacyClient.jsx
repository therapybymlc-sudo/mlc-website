'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  FiShield,
  FiLock,
  FiUserCheck,
  FiEye,
  FiServer,
  FiCpu,
  FiFileText,
  FiCheckCircle,
  FiPrinter,
  FiMail,
  FiArrowRight,
  FiCopy,
  FiCheck
} from 'react-icons/fi';

const SECTIONS = [
  { id: 'clinical-governance', title: '1. Clinical Data Governance', icon: FiShield },
  { id: 'identity-auth', title: '2. Identity & Authentication', icon: FiUserCheck },
  { id: 'telehealth-messaging', title: '3. Messaging & Telehealth', icon: FiCpu },
  { id: 'wellbeing-analytics', title: '4. Wellbeing Analytics & Ethics', icon: FiEye },
  { id: 'infrastructure-security', title: '5. Infrastructure & Encryption', icon: FiServer },
  { id: 'data-rights', title: '6. Data Rights & Portability', icon: FiLock },
  { id: 'governance-contacts', title: '7. Governance & Contacts', icon: FiMail },
];

export default function PrivacyClient() {
  const [activeSection, setActiveSection] = useState('clinical-governance');
  const [copiedEmail, setCopiedEmail] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast({
      title: 'Email Copied',
      description: `${email} copied to your clipboard.`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" color="#263A33">
      {/* ═══════════════ EDITORIAL HERO ═══════════════ */}
      <Box
        position="relative"
        bg="linear-gradient(135deg, #1C2B26 0%, #263A33 55%, #1F302A 100%)"
        color="white"
        pt={{ base: 12, md: 16 }}
        pb={{ base: 14, md: 20 }}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
      >
        {/* Ambient background accents */}
        <Box
          position="absolute"
          top="-20%"
          right="-5%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201, 169, 96, 0.12) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="5%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169, 203, 183, 0.08) 0%, transparent 70%)"
          pointerEvents="none"
        />

        <Container maxW="6xl" position="relative" zIndex={2}>
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            fontSize="12px"
            fontWeight="600"
            color="whiteAlpha.600"
            mb={{ base: 5, md: 6 }}
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href="/" _hover={{ color: '#C9A960' }}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Text color="whiteAlpha.400">Legal</Text>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="#C9A960">Privacy Policy</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Top Badges & Tabs */}
          <HStack
            justify="space-between"
            align={{ base: 'start', sm: 'center' }}
            flexWrap="wrap"
            gap={4}
            mb={6}
          >
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                bg="rgba(201, 169, 96, 0.18)"
                color="#F0D591"
                border="1px solid rgba(201, 169, 96, 0.4)"
                px={3.5}
                py={1}
                borderRadius="full"
                fontSize="11.5px"
                fontWeight="700"
                letterSpacing="0.06em"
                textTransform="uppercase"
              >
                Clinical Privacy v2.4
              </Badge>
              <Text fontSize="12.5px" color="whiteAlpha.700" fontWeight="500">
                Effective: April 24, 2026 • 5 min read
              </Text>
            </HStack>

            {/* Segmented Switcher Pill */}
            <HStack
              bg="rgba(255, 255, 255, 0.06)"
              p={1}
              borderRadius="full"
              border="1px solid rgba(255, 255, 255, 0.12)"
              spacing={1}
            >
              <Button
                as={NextLink}
                href="/privacy"
                size="sm"
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={4}
                height="32px"
                fontSize="12.5px"
                fontWeight="600"
                boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                _hover={{ bg: '#56756D' }}
              >
                Privacy Policy
              </Button>
              <Button
                as={NextLink}
                href="/terms"
                size="sm"
                variant="ghost"
                color="whiteAlpha.750"
                borderRadius="full"
                px={4}
                height="32px"
                fontSize="12.5px"
                fontWeight="500"
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              >
                Terms of Service
              </Button>
            </HStack>
          </HStack>

          {/* Title & Philosophy */}
          <Heading
            as="h1"
            fontSize={{ base: '2.2rem', md: '3.25rem' }}
            fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
            fontWeight="600"
            color="white"
            lineHeight="1.18"
            letterSpacing="-0.02em"
            mb={4}
            maxW="4xl"
          >
            Privacy & Data Sovereignty
          </Heading>

          <Text
            fontSize={{ base: '15px', md: '16.5px' }}
            color="whiteAlpha.800"
            lineHeight="1.8"
            maxW="720px"
            fontFamily="'Inter', var(--font-inter), sans-serif"
          >
            At MLC Health & Wellness Centre, we do not merely protect data—we uphold its clinical sanctity.
            Our privacy infrastructure is engineered on the principles of therapeutic confidentiality,
            zero data monetization, and end-to-end cryptographic isolation.
          </Text>
        </Container>
      </Box>

      {/* ═══════════════ MAIN CONTENT ARCHITECTURE ═══════════════ */}
      <Container maxW="6xl" py={{ base: 10, md: 16 }}>
        <HStack align="start" spacing={{ base: 0, lg: 10 }}>
          {/* ═══════ STICKY DESKTOP SIDEBAR ═══════ */}
          <Box
            display={{ base: 'none', lg: 'block' }}
            w="300px"
            position="sticky"
            top="95px"
            flexShrink={0}
          >
            <VStack align="stretch" spacing={5}>
              {/* Table of Contents Card */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.03)"
              >
                <Text
                  fontSize="11px"
                  fontWeight="800"
                  color="#56756D"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  mb={3}
                >
                  Table of Contents
                </Text>
                <VStack align="stretch" spacing={1.5}>
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <HStack
                        key={sec.id}
                        as="button"
                        onClick={() => scrollToSection(sec.id)}
                        px={3}
                        py={2}
                        borderRadius="xl"
                        textAlign="left"
                        bg={isActive ? '#F2F7F4' : 'transparent'}
                        color={isActive ? '#263A33' : 'rgba(46, 46, 46, 0.7)'}
                        fontWeight={isActive ? '600' : '400'}
                        fontSize="13px"
                        transition="all 0.18s ease"
                        _hover={{
                          bg: '#F8FAF9',
                          color: '#263A33',
                          transform: 'translateX(2px)',
                        }}
                        spacing={2.5}
                      >
                        <Icon
                          as={sec.icon}
                          boxSize={3.5}
                          color={isActive ? '#56756D' : 'gray.400'}
                        />
                        <Text noOfLines={1}>{sec.title}</Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>

              {/* Guarantees Box */}
              <Box
                bg="linear-gradient(135deg, rgba(86, 117, 109, 0.08) 0%, rgba(20, 36, 32, 0.03) 100%)"
                p={5}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.15)"
              >
                <Text
                  fontSize="11px"
                  fontWeight="800"
                  color="#56756D"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  mb={3}
                >
                  Our Core Commitments
                </Text>
                <VStack align="start" spacing={3} fontSize="12.5px" color="rgba(46,46,46,0.85)">
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">Zero Commercial Ads:</Text> Data is never monetized or sold.</Text>
                  </HStack>
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">Number-Free Care:</Text> Contact numbers remain private.</Text>
                  </HStack>
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">Encrypted Telehealth:</Text> Video sessions are unrecorded.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Print Action Button */}
              <Button
                leftIcon={<FiPrinter />}
                onClick={handlePrint}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.2)"
                color="#56756D"
                borderRadius="full"
                height="38px"
                fontSize="13px"
                fontWeight="600"
                w="full"
                _hover={{ bg: '#F2F7F4', borderColor: '#56756D' }}
              >
                Print / Save Document
              </Button>
            </VStack>
          </Box>

          {/* ═══════ EDITORIAL BODY SECTIONS ═══════ */}
          <Box flex="1" maxW={{ base: '100%', lg: '780px' }}>
            <VStack align="stretch" spacing={{ base: 8, md: 10 }}>

              {/* ─── SECTION 1: CLINICAL DATA GOVERNANCE ─── */}
              <Box
                id="clinical-governance"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiShield} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    1. Clinical Data Governance
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={5}>
                  We collect and process health data exclusively for the advancement of clinical outcomes, therapeutic continuity, and patient safety. Clinical data is segregated from general platform traffic through intentional architectural firewalls.
                </Text>

                <VStack align="stretch" spacing={3.5}>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      Psychometric Screenings & Clinical Intakes
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Responses to standardized intake forms and psychometric tools (e.g., DASS-21, PHQ-9, GAD-7) are end-to-end encrypted. They are accessible exclusively by your designated licensed practitioner.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      Clinical Case Notes & Reflective Journals
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Session notes documented by therapists and private client journal entries are stored separately from administrative and billing records. This prevents non-clinical support personnel from accessing intimate case narratives.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      Supervision Records & Consultations
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Professional mentorship consultations within the Supervision Suite are de-identified and strictly quarantined from patient-facing interfaces to preserve institutional integrity.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* ─── SECTION 2: IDENTITY & AUTHENTICATION ─── */}
              <Box
                id="identity-auth"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiUserCheck} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    2. Identity & Authentication Sovereignty
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  To ensure bank-grade credential security, MLC Health utilizes <Text as="span" fontWeight="700" color="#263A33">Clerk</Text> as our primary identity and access management infrastructure.
                </Text>

                <VStack align="start" spacing={3} pl={2} fontSize="14px" color="rgba(46, 46, 46, 0.85)">
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Zero Third-Party Ad Trackers:</Text> Authentication metadata (roles, session tokens, sign-in IP hashes) is never tracked or shared with programmatic marketing brokers.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Multi-Factor Authentication (MFA):</Text> Practicing clinicians and administrative users are required to maintain secondary authentication protocols to prevent credential credential stuffing.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Session Expiration & Auto-Lock:</Text> Active portal sessions automatically time out following periods of inactivity to protect clinical confidentiality against physical device compromise.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── SECTION 3: MESSAGING & TELEHEALTH CONFIDENTIALITY ─── */}
              <Box
                id="telehealth-messaging"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiCpu} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    3. Messaging & Telehealth Confidentiality
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  Our "Number-Free" secure clinical portal is intentionally architected to maintain therapeutic boundaries and absolute communication confidentiality.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={2}>
                  <Box p={4} borderRadius="xl" bg="#F7FAF8" border="1px solid rgba(86, 117, 109, 0.12)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1.5}>
                      🎥 Unrecorded Video
                    </Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">
                      Sessions operate via encrypted WebRTC peer-to-peer pipelines. MLC Health explicitly does not record or store audio/video data.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#F7FAF8" border="1px solid rgba(86, 117, 109, 0.12)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1.5}>
                      💬 Number-Free Chat
                    </Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">
                      Client and practitioner phone numbers and personal emails are never exposed. All dialogue occurs within our sovereign portal.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#F7FAF8" border="1px solid rgba(86, 117, 109, 0.12)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1.5}>
                      🔒 Zero Harvesting
                    </Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">
                      Messages stored in the portal are encrypted at rest and shielded from algorithmic keyword harvesting or automated ad profiling.
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* ─── SECTION 4: WELLBEING ANALYTICS & ETHICS ─── */}
              <Box
                id="wellbeing-analytics"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiEye} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    4. Wellbeing Analytics & Practitioner Ethics
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  To prevent clinical burnout and foster sustainable therapeutic practices, our platform aggregates opt-in "Balance Metrics" for practicing clinicians.
                </Text>

                <VStack align="start" spacing={3} pl={2} fontSize="14px" color="rgba(46, 46, 46, 0.85)">
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Individual Caseload Sovereignty:</Text> Burnout tracking and caseload intensity metrics are private to the individual therapist and utilized solely to recommend clinical rest intervals.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Anonymized Ecosystem Insights:</Text> Aggregate research data may be assessed by our Clinical Advisory Board to improve supervisory frameworks, with all identifying practitioner and patient metadata permanently stripped.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── SECTION 5: INFRASTRUCTURE & ENCRYPTION ─── */}
              <Box
                id="infrastructure-security"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiServer} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    5. Infrastructure & Cryptographic Layers
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  Our platform employs a multi-tiered cryptographic stack engineered to exceed standard healthcare compliance benchmarks:
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3.5} mb={4}>
                  <Box p={4} bg="#FAF8F5" borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.1)">
                    <Text fontSize="11px" fontWeight="800" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={1}>Data at Rest</Text>
                    <Text fontSize="14px" fontWeight="700" color="#263A33" mb={1}>AES-256</Text>
                    <Text fontSize="12px" color="rgba(46,46,46,0.7)">Military-grade encrypted database partitions.</Text>
                  </Box>

                  <Box p={4} bg="#FAF8F5" borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.1)">
                    <Text fontSize="11px" fontWeight="800" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={1}>Data in Transit</Text>
                    <Text fontSize="14px" fontWeight="700" color="#263A33" mb={1}>TLS 1.3 Strict</Text>
                    <Text fontSize="12px" color="rgba(46,46,46,0.7)">End-to-end encrypted packet transmission.</Text>
                  </Box>

                  <Box p={4} bg="#FAF8F5" borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.1)">
                    <Text fontSize="11px" fontWeight="800" color="#56756D" textTransform="uppercase" letterSpacing="0.08em" mb={1}>Database Architecture</Text>
                    <Text fontSize="14px" fontWeight="700" color="#263A33" mb={1}>Firewalled Silos</Text>
                    <Text fontSize="12px" color="rgba(46,46,46,0.7)">Separate stores for identity, billing & care.</Text>
                  </Box>
                </SimpleGrid>

                <Text fontSize="13px" color="rgba(46,46,46,0.75)" lineHeight="1.65">
                  Routine vulnerability assessments and clinical data audits are conducted monthly by our technical steering committee in tandem with licensed clinical ethics officers.
                </Text>
              </Box>

              {/* ─── SECTION 6: DATA RIGHTS & PORTABILITY ─── */}
              <Box
                id="data-rights"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiLock} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    6. Data Rights & Clinical Portability
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  You hold complete sovereignty over your psychological narrative. You are entitled to the following statutory and ethical rights:
                </Text>

                <VStack align="stretch" spacing={3} mb={4}>
                  <HStack align="start" spacing={3} p={3.5} bg="#FAF8F5" borderRadius="xl">
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} />
                    <Text fontSize="13.5px" color="rgba(46,46,46,0.85)">
                      <Text as="span" fontWeight="700" color="#263A33">Right of Access & Summary:</Text> You may request an exported summary of your clinical trajectory, intake diagnostics, and active care plans at any point.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={3} p={3.5} bg="#FAF8F5" borderRadius="xl">
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} />
                    <Text fontSize="13.5px" color="rgba(46,46,46,0.85)">
                      <Text as="span" fontWeight="700" color="#263A33">Account Deletion & Rectification:</Text> Requests to erase your digital profile are processed within 30 days. Note that statutory medical record retention obligations may mandate that certain anonymized diagnostic records remain securely archived as required by Indian health laws.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={3} p={3.5} bg="#FAF8F5" borderRadius="xl">
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} />
                    <Text fontSize="13.5px" color="rgba(46,46,46,0.85)">
                      <Text as="span" fontWeight="700" color="#263A33">Consent Revocation:</Text> You may adjust your consent preferences for non-essential communications and psychometric research tracking at any time via your Client Dashboard settings.
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── SECTION 7: GOVERNANCE & CONTACTS DOCK ─── */}
              <Box
                id="governance-contacts"
                bg="linear-gradient(135deg, #263A33 0%, #1F302A 100%)"
                color="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 30px rgba(0, 0, 0, 0.15)"
              >
                <HStack spacing={3.5} mb={3}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="rgba(201, 169, 96, 0.18)"
                    border="1px solid rgba(201, 169, 96, 0.4)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#F0D591"
                    flexShrink={0}
                  >
                    <Icon as={FiMail} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="white"
                    fontWeight="600"
                  >
                    7. Institutional Governance & Contact Inquiries
                  </Heading>
                </HStack>

                <Text fontSize="14px" color="whiteAlpha.800" lineHeight="1.7" mb={6}>
                  We believe that confidentiality is the non-negotiable catalyst for healing. If you have questions regarding data sovereignty, clinical governance, or regulatory compliance, reach out directly to our designated officers:
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={5}>
                  <Box
                    bg="whiteAlpha.08"
                    p={4}
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <Text fontSize="11px" fontWeight="800" color="#F0D591" textTransform="uppercase" letterSpacing="0.1em" mb={1.5}>
                      Data Protection Officer (DPO)
                    </Text>
                    <HStack spacing={2} align="center">
                      <Text fontSize="14px" fontWeight="600" color="white">
                        privacy@mlchealth.in
                      </Text>
                      <Tooltip label={copiedEmail === 'privacy@mlchealth.in' ? "Copied!" : "Copy address"} hasArrow placement="top">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={copiedEmail === 'privacy@mlchealth.in' ? <FiCheck /> : <FiCopy />}
                          color={copiedEmail === 'privacy@mlchealth.in' ? "#8BE48B" : "whiteAlpha.800"}
                          _hover={{ color: "white", bg: "whiteAlpha.200" }}
                          borderRadius="md"
                          minW="26px"
                          h="26px"
                          fontSize="13px"
                          aria-label="Copy email address"
                          onClick={() => copyEmail('privacy@mlchealth.in')}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>

                  <Box
                    bg="whiteAlpha.08"
                    p={4}
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <Text fontSize="11px" fontWeight="800" color="#F0D591" textTransform="uppercase" letterSpacing="0.1em" mb={1.5}>
                      Clinical Ethics Board
                    </Text>
                    <HStack spacing={2} align="center">
                      <Text fontSize="14px" fontWeight="600" color="white">
                        ethics@mlchealth.in
                      </Text>
                      <Tooltip label={copiedEmail === 'ethics@mlchealth.in' ? "Copied!" : "Copy address"} hasArrow placement="top">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={copiedEmail === 'ethics@mlchealth.in' ? <FiCheck /> : <FiCopy />}
                          color={copiedEmail === 'ethics@mlchealth.in' ? "#8BE48B" : "whiteAlpha.800"}
                          _hover={{ color: "white", bg: "whiteAlpha.200" }}
                          borderRadius="md"
                          minW="26px"
                          h="26px"
                          fontSize="13px"
                          aria-label="Copy email address"
                          onClick={() => copyEmail('ethics@mlchealth.in')}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                </SimpleGrid>

                <Divider borderColor="whiteAlpha.200" mb={4} />

                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <Text fontSize="12px" color="whiteAlpha.600">
                    MLC Health and Wellness Centre • Pan-India Clinical Governance
                  </Text>
                  <Button
                    as={NextLink}
                    href="/terms"
                    size="sm"
                    variant="link"
                    color="#F0D591"
                    rightIcon={<FiArrowRight />}
                    _hover={{ color: 'white', textDecoration: 'none' }}
                    fontSize="13px"
                  >
                    Read Terms of Service
                  </Button>
                </HStack>
              </Box>

            </VStack>
          </Box>
        </HStack>
      </Container>
    </Box>
  );
}
